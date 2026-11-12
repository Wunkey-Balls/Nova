"use strict";
// Turns what was typed into a full URL, or a search link if it isn't one.
function search(input, template) {
	try {
		return new URL(input).toString();
	} catch (err) {}

	try {
		const url = new URL(`http://${input}`);
		if (url.hostname.includes(".")) return url.toString();
	} catch (err) {}

	return template.replace("%s", encodeURIComponent(input));
}
