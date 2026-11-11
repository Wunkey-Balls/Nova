"use strict";

/* ------------------------------------------------------------------ */
/* helpers                                                             */
/* ------------------------------------------------------------------ */
const $ = (sel) => document.querySelector(sel);
const IN_FRAME = window.self !== window.top; // true when running inside the about:blank launcher

const store = {
	get(key, fallback) {
		try {
			const v = localStorage.getItem("nova:" + key);
			return v === null ? fallback : JSON.parse(v);
		} catch {
			return fallback;
		}
	},
	set(key, value) {
		try {
			localStorage.setItem("nova:" + key, JSON.stringify(value));
		} catch {}
	},
};

const ENGINES = {
	Google: "https://www.google.com/search?q=%s",
	DuckDuckGo: "https://duckduckgo.com/?q=%s",
	Bing: "https://www.bing.com/search?q=%s",
	Brave: "https://search.brave.com/search?q=%s",
};

let toastTimer;
function toast(msg) {
	const el = $("#toast");
	el.textContent = msg;
	el.classList.add("show");
	clearTimeout(toastTimer);
	toastTimer = setTimeout(() => el.classList.remove("show"), 3200);
}

/* ------------------------------------------------------------------ */
/* proxy setup (Ultraviolet + bare-mux + epoxy over wisp)              */
/* ------------------------------------------------------------------ */
const connection = new BareMux.BareMuxConnection("/baremux/worker.js");
let proxyReady = false;

async function ensureProxy() {
	await registerSW(); // from register-sw.js
	if (proxyReady) return;
	const wispUrl =
		(location.protocol === "https:" ? "wss" : "ws") + "://" + location.host + "/wisp/";
	if ((await connection.getTransport()) !== "/epoxy/index.mjs") {
		await connection.setTransport("/epoxy/index.mjs", [{ wisp: wispUrl }]);
	}
	proxyReady = true;
}

/* ------------------------------------------------------------------ */
/* browser overlay                                                     */
/* ------------------------------------------------------------------ */
const frame = $("#uv-frame");
const browserEl = $("#browser");
const addressEl = $("#b-address");
const statusBar = $("#b-status");

function setLoading(on) {
	statusBar.classList.toggle("loading", on);
	if (!on) {
		statusBar.style.transition = "none";
		statusBar.style.transform = "scaleX(0)";
		void statusBar.offsetWidth;
		statusBar.style.transition = "";
		statusBar.style.transform = "";
	}
}

function currentEngine() {
	return ENGINES[store.get("engine", "Google")] || ENGINES.Google;
}

async function openSite(input) {
	input = (input || "").trim();
	if (!input) return;
	const url = search(input, currentEngine()); // from search.js

	browserEl.classList.remove("hidden");
	addressEl.value = url;
	setLoading(true);

	try {
		await ensureProxy();
	} catch (err) {
		closeSite();
		const msg = "Couldn't start the proxy: " + err.message;
		$("#home-error").textContent = msg;
		toast(msg);
		console.error(err);
		return;
	}
	frame.src = __uv$config.prefix + __uv$config.encodeUrl(url);
}

function closeSite() {
	browserEl.classList.add("hidden");
	frame.src = "about:blank";
	setLoading(false);
}

function decodeFrameUrl() {
	try {
		const href = frame.contentWindow.location.href;
		const i = href.indexOf(__uv$config.prefix);
		if (i === -1) return null;
		return __uv$config.decodeUrl(href.slice(i + __uv$config.prefix.length));
	} catch {
		return null;
	}
}

frame.addEventListener("load", () => {
	if (frame.getAttribute("src") === "about:blank") return;
	setLoading(false);
	const real = decodeFrameUrl();
	if (real && document.activeElement !== addressEl) addressEl.value = real;
});

$("#b-back").onclick = () => { try { frame.contentWindow.history.back(); } catch {} };
$("#b-forward").onclick = () => { try { frame.contentWindow.history.forward(); } catch {} };
$("#b-reload").onclick = () => { try { setLoading(true); frame.contentWindow.location.reload(); } catch {} };
$("#b-close").onclick = closeSite;
$("#b-form").addEventListener("submit", (e) => {
	e.preventDefault();
	openSite(addressEl.value);
});

function toggleFullscreen() {
	if (document.fullscreenElement) document.exitFullscreen();
	else document.documentElement.requestFullscreen?.().catch(() => toast("Fullscreen was blocked by the browser."));
}
$("#b-fs").onclick = toggleFullscreen;
$("#btn-fs-top").onclick = toggleFullscreen;

/* ------------------------------------------------------------------ */
/* views / tabs                                                        */
/* ------------------------------------------------------------------ */
function showView(name) {
	document.querySelectorAll(".view").forEach((v) => v.classList.toggle("hidden", v.id !== "view-" + name));
	document.querySelectorAll(".tab").forEach((t) => t.classList.toggle("active", t.dataset.view === name));
}
document.querySelectorAll(".tab").forEach((t) => (t.onclick = () => showView(t.dataset.view)));

/* ------------------------------------------------------------------ */
/* tile grids                                                          */
/* ------------------------------------------------------------------ */
function makeTile(item, { removable = false, onRemove } = {}) {
	const tile = document.createElement("button");
	tile.className = "tile";
	tile.type = "button";

	const emoji = document.createElement("span");
	emoji.className = "emoji";
	emoji.textContent = item.emoji || "🌐";
	const name = document.createElement("span");
	name.className = "name";
	name.textContent = item.name;
	tile.append(emoji, name);

	tile.onclick = () => openSite(item.url);

	if (removable) {
		const x = document.createElement("span");
		x.className = "remove";
		x.textContent = "×";
		x.title = "Remove";
		x.onclick = (e) => {
			e.stopPropagation();
			onRemove?.();
		};
		tile.append(x);
	}
	return tile;
}

function renderGrid(el, items, opts) {
	el.replaceChildren(...items.map((it, i) => makeTile(it, opts ? { ...opts, onRemove: () => opts.onRemove(i) } : {})));
}

function renderQuick() {
	const custom = store.get("shortcuts", []);
	const all = [...QUICK, ...custom];
	const grid = $("#grid-quick");
	grid.replaceChildren(
		...all.map((it, i) => {
			const isCustom = i >= QUICK.length;
			return makeTile(it, {
				removable: isCustom,
				onRemove: () => {
					const list = store.get("shortcuts", []);
					list.splice(i - QUICK.length, 1);
					store.set("shortcuts", list);
					renderQuick();
				},
			});
		})
	);
}

$("#btn-add-shortcut").onclick = () => {
	const name = prompt("Shortcut name:");
	if (!name) return;
	const url = prompt("Site address (e.g. example.com):");
	if (!url) return;
	const list = store.get("shortcuts", []);
	list.push({ name: name.trim(), url: search(url.trim(), currentEngine()), emoji: "⭐" });
	store.set("shortcuts", list);
	renderQuick();
};

function renderGames() {
	const q = $("#games-filter").value.trim().toLowerCase();
	renderGrid($("#grid-games"), GAMES.filter((g) => g.name.toLowerCase().includes(q)));
}
$("#games-filter").addEventListener("input", renderGames);

$("#search-form").addEventListener("submit", (e) => {
	e.preventDefault();
	$("#home-error").textContent = "";
	openSite($("#search-input").value);
});

/* ------------------------------------------------------------------ */
/* about:blank launcher                                                */
/* ------------------------------------------------------------------ */
function launchBlank() {
	const win = window.open("about:blank", "_blank"); // must happen directly inside the click
	if (!win) {
		toast("Popup blocked. Allow popups for this site, then click again.");
		return;
	}
	const doc = win.document;
	doc.title = store.get("title", "") || "Home";
	doc.body.style.cssText = "margin:0;background:#0b0a14;overflow:hidden";

	const f = doc.createElement("iframe");
	f.src = location.href.split("#")[0];
	f.setAttribute("allow", "fullscreen; autoplay; clipboard-read; clipboard-write; microphone; camera");
	f.setAttribute("allowfullscreen", "");
	f.style.cssText = "position:fixed;inset:0;width:100%;height:100%;border:0";
	doc.body.appendChild(f);

	if (store.get("redirect", false)) {
		const to = store.get("redirectUrl", "") || "https://www.google.com";
		location.replace(/^https?:\/\//i.test(to) ? to : "https://" + to);
	}
}
$("#btn-launch").onclick = launchBlank;

// When we're already inside the about:blank wrapper, the launcher isn't needed.
if (IN_FRAME) {
	$("#btn-launch").classList.add("hidden");
	$("#btn-fs-top").classList.remove("hidden");
}

/* ------------------------------------------------------------------ */
/* settings                                                            */
/* ------------------------------------------------------------------ */
const engineSel = $("#set-engine");
Object.keys(ENGINES).forEach((name) => engineSel.add(new Option(name, name)));
engineSel.value = store.get("engine", "Google");
engineSel.onchange = () => store.set("engine", engineSel.value);

const titleInput = $("#set-title");
titleInput.value = store.get("title", "");
function applyTitle() {
	document.title = store.get("title", "") || "Nova";
}
titleInput.oninput = () => {
	store.set("title", titleInput.value.trim());
	applyTitle();
};
applyTitle();

const redirectBox = $("#set-redirect");
const redirectUrl = $("#set-redirect-url");
redirectBox.checked = store.get("redirect", false);
redirectUrl.value = store.get("redirectUrl", "");
redirectBox.onchange = () => store.set("redirect", redirectBox.checked);
redirectUrl.oninput = () => store.set("redirectUrl", redirectUrl.value.trim());

// panic key
const panicKeyInput = $("#set-panic-key");
const panicUrl = $("#set-panic-url");
panicKeyInput.value = store.get("panicKey", "");
panicUrl.value = store.get("panicUrl", "");
panicUrl.oninput = () => store.set("panicUrl", panicUrl.value.trim());

let capturing = false;
$("#btn-set-panic").onclick = () => {
	capturing = true;
	panicKeyInput.value = "Press a key…";
};
$("#btn-clear-panic").onclick = () => {
	store.set("panicKey", "");
	panicKeyInput.value = "";
	capturing = false;
};

document.addEventListener("keydown", (e) => {
	if (capturing) {
		e.preventDefault();
		if (e.key === "Escape") {
			panicKeyInput.value = store.get("panicKey", "");
		} else {
			store.set("panicKey", e.key);
			panicKeyInput.value = e.key;
		}
		capturing = false;
		return;
	}
	const key = store.get("panicKey", "");
	if (key && e.key === key && !/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName || "")) {
		const to = store.get("panicUrl", "") || "https://www.google.com";
		const target = /^https?:\/\//i.test(to) ? to : "https://" + to;
		try {
			window.top.location.replace(target);
		} catch {
			location.replace(target);
		}
	}
});

$("#btn-reset").onclick = async () => {
	if (!confirm("Reset the proxy and clear all saved settings for this site?")) return;
	try {
		const regs = await navigator.serviceWorker.getRegistrations();
		await Promise.all(regs.map((r) => r.unregister()));
	} catch {}
	try { localStorage.clear(); } catch {}
	location.reload();
};

/* ------------------------------------------------------------------ */
/* init                                                                */
/* ------------------------------------------------------------------ */
renderQuick();
renderGames();
renderGrid($("#grid-apps"), APPS);
