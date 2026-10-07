// Renders the sample illustrations and inlines art.js into the web demo.
// Run: node ios/TinyLab/design/build_art.cjs
const fs = require("fs");
const path = require("path");
new Function(fs.readFileSync(path.join(__dirname, "art.js"), "utf8"))();
const { sketch, ink, crest } = globalThis.TinyLabArt;

const out = path.join(__dirname, "illustrations");
fs.mkdirSync(out, { recursive: true });
const samples = {
  "experiment-day-2.svg": sketch({ seed: "sample", level: 0.25, steadiness: 0.1, bubbles: 1, standalone: true }),
  "experiment-day-12.svg": sketch({ seed: "sample", level: 0.75, steadiness: 0.85, bubbles: 3, standalone: true }),
  "practice-ink.svg": ink({ seed: "sample", level: 0.8, standalone: true }),
  "capability-exploring.svg": crest({ level: 0, standalone: true }),
  "capability-practicing.svg": crest({ level: 1, standalone: true }),
  "capability-proficient.svg": crest({ level: 2, standalone: true }),
  "capability-teaching.svg": crest({ level: 3, standalone: true })
};
for (const [name, svg] of Object.entries(samples)) fs.writeFileSync(path.join(out, name), svg.replace("<svg ", '<svg width="512" height="512" ') + "\n");

const demo = path.join(__dirname, "..", "demo", "tiny-lab-demo.html");
let html = fs.readFileSync(demo, "utf8");
const start = "<script id=\"tl-art\">", end = "</script><!-- /tl-art -->";
const block = start + "\n" + fs.readFileSync(path.join(__dirname, "art.js"), "utf8") + end;
html = html.includes(start) ? html.slice(0, html.indexOf(start)) + block + html.slice(html.indexOf(end) + end.length) : html.replace("<script>", block + "\n<script>");
fs.writeFileSync(demo, html);
console.log(Object.keys(samples).length, "illustrations; art.js inlined into demo");
