"use strict";

/* ---------- text + data (decoded at runtime) ---------- */
const C = JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(window.__c), (ch) => ch.charCodeAt(0))));
const T = C.ui;

document.querySelectorAll("[data-t]").forEach((el) => (el.textContent = T[el.dataset.t] ?? ""));
document.querySelectorAll("[data-p]").forEach((el) => (el.placeholder = T[el.dataset.p] ?? ""));
document.querySelectorAll("[data-tt]").forEach((el) => (el.title = T[el.dataset.tt] ?? ""));

/* ---------- helpers ---------- */
const $ = (sel) => document.querySelector(sel);
const IN_FRAME = window.self !== window.top;

const store = {
	get(key, fallback) {
		try {
			const v = localStorage.getItem("n:" + key);
			return v === null ? fallback : JSON.parse(v);
		} catch {
			return fallback;
		}
	},
	set(key, value) {
		try {
			localStorage.setItem("n:" + key, JSON.stringify(value));
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

/* ---------- connection setup ---------- */
const link = new self["Bare" + "Mux"]["Bare" + "Mux" + "Connection"]("/b/worker.js");
let ready = false;

async function ensureReady() {
	await registerSW();
	if (ready) return;
	const wsUrl = (location.protocol === "https:" ? "wss" : "ws") + "://" + location.host + "/w/";
	if ((await link.getTransport()) !== "/e/index.mjs") {
		await link.setTransport("/e/index.mjs", [{ ["wi" + "sp"]: wsUrl }]);
	}
	ready = true;
}

/* ---------- startup check (shown only if something fails) ---------- */
async function diagnose() {
	const lines = ["Checked files:"];
	for (const f of ["sw.js", "uv.bundle.js", "uv.config.js", "uv.sw.js"]) {
		try {
			const r = await fetch("/x/" + f, { cache: "no-store" });
			const t = await r.text();
			const kind = (r.headers.get("content-type") || "?").split(";")[0];
			lines.push(`/x/${f}  ->  ${r.status}  ${kind}  ${t.length} bytes`);
		} catch (e) {
			lines.push(`/x/${f}  ->  ${e.message}`);
		}
	}
	lines.push("Browser: " + navigator.userAgent);
	lines.push("Secure page: " + window.isSecureContext + "  |  In a frame: " + IN_FRAME);
	return lines.join("\n");
}

/* ---------- site viewer ---------- */
const frame = $("#site-frame");
const viewer = $("#browser");
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
	const url = search(input, currentEngine());

	viewer.classList.remove("hidden");
	addressEl.value = url;
	setLoading(true);

	try {
		await ensureReady();
	} catch (err) {
		closeSite();
		const msg = T.err_start + err.message + "\n\n" + (await diagnose());
		$("#home-error").textContent = msg;
		toast(T.err_start + err.message);
		console.error(err);
		return;
	}
	frame.src = __uv$config.prefix + __uv$config.encodeUrl(url);
}

function closeSite() {
	viewer.classList.add("hidden");
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
	else document.documentElement.requestFullscreen?.().catch(() => toast(T.err_fs));
}
$("#b-fs").onclick = toggleFullscreen;
$("#btn-fs-top").onclick = toggleFullscreen;

/* ---------- views ---------- */
function showView(name) {
	document.querySelectorAll(".view").forEach((v) => v.classList.toggle("hidden", v.id !== "view-" + name));
	document.querySelectorAll(".tab").forEach((t) => t.classList.toggle("active", t.dataset.view === name));
}
document.querySelectorAll(".tab").forEach((t) => (t.onclick = () => showView(t.dataset.view)));

/* ---------- tiles ---------- */
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
		x.title = T.remove;
		x.onclick = (e) => {
			e.stopPropagation();
			onRemove?.();
		};
		tile.append(x);
	}
	return tile;
}

function renderQuick() {
	const custom = store.get("shortcuts", []);
	const all = [...C.quick, ...custom];
	$("#grid-quick").replaceChildren(
		...all.map((it, i) => {
			const isCustom = i >= C.quick.length;
			return makeTile(it, {
				removable: isCustom,
				onRemove: () => {
					const list = store.get("shortcuts", []);
					list.splice(i - C.quick.length, 1);
					store.set("shortcuts", list);
					renderQuick();
				},
			});
		})
	);
}

$("#btn-add-shortcut").onclick = () => {
	const name = prompt(T.ask_name);
	if (!name) return;
	const url = prompt(T.ask_url);
	if (!url) return;
	const list = store.get("shortcuts", []);
	list.push({ name: name.trim(), url: search(url.trim(), currentEngine()), emoji: "⭐" });
	store.set("shortcuts", list);
	renderQuick();
};

function renderPlay() {
	const q = $("#play-find").value.trim().toLowerCase();
	$("#grid-play").replaceChildren(...C.play.flatMap((g) => (g.name.toLowerCase().includes(q) ? [makeTile(g)] : [])));
}
$("#play-find").addEventListener("input", renderPlay);

$("#search-form").addEventListener("submit", (e) => {
	e.preventDefault();
	$("#home-error").textContent = "";
	openSite($("#search-input").value);
});

/* ---------- about:blank launcher ---------- */
// Returns true if the new tab opened.
function launchBlank() {
	const win = window.open("about:blank", "_blank");
	if (!win) return false;

	const doc = win.document;
	doc.title = store.get("title", "") || "Home";
	doc.body.style.cssText = "margin:0;background:#0b0a14;overflow:hidden";

	const f = doc.createElement("iframe");
	f.src = location.href.split("#")[0];
	f.setAttribute("allow", "fullscreen; autoplay; clipboard-read; clipboard-write; microphone; camera");
	f.setAttribute("allowfullscreen", "");
	f.style.cssText = "position:fixed;inset:0;width:100%;height:100%;border:0";
	doc.body.appendChild(f);

	if (store.get("redirect", true)) {
		const to = store.get("redirectUrl", "") || "https://www.google.com";
		location.replace(/^https?:\/\//i.test(to) ? to : "https://" + to);
	}
	return true;
}

$("#btn-launch").onclick = () => {
	if (!launchBlank()) toast(T.err_popup);
};

// Open right away. If the browser blocks it, wait for the first tap / key press.
function autoLaunch() {
	if (IN_FRAME || !store.get("auto", true)) return;
	if (launchBlank()) return;

	const cover = $("#cover");
	cover.classList.remove("hidden");
	const events = ["pointerdown", "keydown", "touchend"];
	const go = () => {
		if (!launchBlank()) return;
		events.forEach((ev) => removeEventListener(ev, go, true));
		cover.classList.add("hidden");
	};
	events.forEach((ev) => addEventListener(ev, go, true));
}

if (IN_FRAME) {
	$("#btn-launch").classList.add("hidden");
	$("#btn-fs-top").classList.remove("hidden");
}

/* ---------- options ---------- */
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

const autoBox = $("#set-auto");
autoBox.checked = store.get("auto", true);
autoBox.onchange = () => store.set("auto", autoBox.checked);

const redirectBox = $("#set-redirect");
const redirectUrl = $("#set-redirect-url");
redirectBox.checked = store.get("redirect", true);
redirectUrl.value = store.get("redirectUrl", "");
redirectBox.onchange = () => store.set("redirect", redirectBox.checked);
redirectUrl.oninput = () => store.set("redirectUrl", redirectUrl.value.trim());

const panicKeyInput = $("#set-panic-key");
const panicUrl = $("#set-panic-url");
panicKeyInput.value = store.get("panicKey", "");
panicUrl.value = store.get("panicUrl", "");
panicUrl.oninput = () => store.set("panicUrl", panicUrl.value.trim());

let capturing = false;
$("#btn-set-panic").onclick = () => {
	capturing = true;
	panicKeyInput.value = T.pressKey;
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
	if (!confirm(T.ask_reset)) return;
	try {
		const regs = await navigator.serviceWorker.getRegistrations();
		await Promise.all(regs.map((r) => r.unregister()));
	} catch {}
	try { localStorage.clear(); } catch {}
	location.reload();
};

/* ---------- start ---------- */
renderQuick();
renderPlay();
renderGrid();
function renderGrid() {
	$("#grid-apps").replaceChildren(...C.apps.map((a) => makeTile(a)));
}
autoLaunch();
