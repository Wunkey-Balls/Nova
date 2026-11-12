"use strict";
const SW_PATH = "/x/sw.js";
const SW_OK_HOSTS = ["localhost", "127.0.0.1"];

async function registerSW() {
	if (!navigator.serviceWorker) {
		if (location.protocol !== "https:" && !SW_OK_HOSTS.includes(location.hostname))
			throw new Error("This needs https.");
		throw new Error("This browser doesn't support service workers.");
	}
	await navigator.serviceWorker.register(SW_PATH);
}
