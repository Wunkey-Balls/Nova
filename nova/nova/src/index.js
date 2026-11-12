import { createServer } from "node:http";
import express from "express";
import wisp from "wisp-server-node";

import { uvPath } from "@titaniumnetwork-dev/ultraviolet";
import { epoxyPath } from "@mercuryworkshop/epoxy-transport";
import { baremuxPath } from "@mercuryworkshop/bare-mux/node";

const app = express();

// Our own files first, vendor files after (short neutral paths).
app.use(express.static("./public"));
app.use("/x/", express.static(uvPath));
app.use("/e/", express.static(epoxyPath));
app.use("/b/", express.static(baremuxPath));

app.use((req, res) => {
	res.status(404);
	res.sendFile("404.html", { root: "./public" });
});

const server = createServer();

server.on("request", (req, res) => {
	res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
	res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
	app(req, res);
});

server.on("upgrade", (req, socket, head) => {
	if (req.url.endsWith("/w/")) {
		wisp.routeRequest(req, socket, head);
		return;
	}
	socket.end();
});

let port = parseInt(process.env.PORT || "");
if (isNaN(port)) port = 8080;

server.on("listening", () => {
	console.log(`Listening on http://localhost:${server.address().port}`);
});

function shutdown() {
	server.close();
	process.exit(0);
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

server.listen({ port });
