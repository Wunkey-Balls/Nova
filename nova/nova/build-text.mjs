// Run with:  npm run build:text
// Reads content/strings.json (NOT served to visitors), encodes it, and writes public/c.js.
// Edit content/strings.json to change any text or tile, then run the command again.
import { readFileSync, writeFileSync } from "node:fs";

const json = JSON.stringify(JSON.parse(readFileSync("content/strings.json", "utf8")));
const b64 = Buffer.from(json, "utf8").toString("base64");
writeFileSync("public/c.js", `window.__c="${b64}";\n`);
console.log(`Wrote public/c.js (${b64.length} chars)`);
