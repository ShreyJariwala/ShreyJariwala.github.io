// Renders the sample illustrations and inlines art.js into the web demo.
// Run: node ios/TinyLab/design/build_art.cjs
const fs = require("fs");
const path = require("path");
new Function(fs.readFileSync(path.join(__dirname, "art.js"), "utf8"))();
const { sketch, ink, crest, bridge } = globalThis.TinyLabArt;

const out = path.join(__dirname, "illustrations");
fs.mkdirSync(out, { recursive: true });
const samples = {
  "experiment-day-2.svg": sketch({ seed: "sample", level: 0.25, steadiness: 0.1, bubbles: 1, standalone: true }),
  "experiment-day-12.svg": sketch({ seed: "sample", level: 0.75, steadiness: 0.85, bubbles: 3, standalone: true }),
  "practice-ink.svg": ink({ seed: "sample", level: 0.8, standalone: true }),
  "capability-exploring.svg": crest({ level: 0, standalone: true }),
  "capability-practicing.svg": crest({ level: 1, standalone: true }),
  "capability-proficient.svg": crest({ level: 2, standalone: true }),
  "capability-teaching.svg": crest({ level: 3, standalone: true }),
  "bridge-in-progress.svg": bridge({ seed: "sample", today: 30, proven: 21, level: 1, standalone: true,
    milestones: [{ day: 0, n: 1 }, { day: 5, n: 2 }, { day: 21, n: 3 }, { day: 25, n: 4 }],
    spans: [{ from: 5, to: 12, proven: false }, { from: 9, to: 30, proven: true }, { from: 22, to: 30, proven: false }] }),
  "bridge-complete.svg": bridge({ seed: "sample", today: 64, proven: 18, end: 64, level: 3, standalone: true,
    milestones: [{ day: 0, n: 1 }, { day: 4, n: 2 }, { day: 18, n: 3 }, { day: 26, n: 4 }, { day: 41, n: 5 }, { day: 64, n: 6 }],
    spans: [{ from: 4, to: 12, proven: false }, { from: 10, to: 64, proven: true }, { from: 30, to: 60, proven: true }] })
};
for (const [name, svg] of Object.entries(samples)) fs.writeFileSync(path.join(out, name), svg.replace("<svg ", name.startsWith("bridge") ? '<svg width="720" height="300" ' : '<svg width="512" height="512" ') + "\n");

const demo = path.join(__dirname, "..", "demo", "tiny-lab-demo.html");
let html = fs.readFileSync(demo, "utf8");
const start = "<script id=\"tl-art\">", end = "</script><!-- /tl-art -->";
const block = start + "\n" + fs.readFileSync(path.join(__dirname, "art.js"), "utf8") + end;
html = html.includes(start) ? html.slice(0, html.indexOf(start)) + block + html.slice(html.indexOf(end) + end.length) : html.replace("<script>", block + "\n<script>");
fs.writeFileSync(demo, html);
console.log(Object.keys(samples).length, "illustrations; art.js inlined into demo");
