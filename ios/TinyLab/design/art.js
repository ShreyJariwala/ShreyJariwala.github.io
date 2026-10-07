/* Tiny Lab art: experiments are drawn as scribble sketches; proven practices and
   capabilities are drawn in clean ink.

   Sketch technique adapted from claudedraw by Griffin2 (MIT licence),
   https://github.com/Griffin2/claudedraw : an Ornstein-Uhlenbeck random walk wobbles
   every outline, fills are 45-degree looping scribble strokes that bleed past the
   edge, and an feTurbulence filter adds grain. All output is plain SVG markup.

   The sketch carries data:
     level      0..1  how full the flask is (the pact's hit rate)
     steadiness 0..1  how steady the hand is (how much of the pact has run)
     bubbles    0..3  current streak, capped

   Pure functions, no DOM. Used inline by demo/tiny-lab-demo.html and by build_art.js. */
(function (root) {
  "use strict";

  // ---- seeded randomness (stable drawing per pact) ----
  function hash(str) {
    let h = 1779033703 ^ str.length;
    for (let i = 0; i < str.length; i++) { h = Math.imul(h ^ str.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); }
    return h >>> 0;
  }
  function rng(seed) {
    let a = hash(String(seed));
    return () => {
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const gauss = r => { let u = 0; while (!u) u = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * r()); };
  const n4 = v => (Math.round(v * 10000) / 10000).toString();
  const toD = (pts, close) => "M" + pts.map(p => n4(p[0]) + " " + n4(p[1])).join("L") + (close ? "Z" : "");

  // ---- 45-degree scan frame ----
  const C45 = Math.SQRT1_2, S45 = Math.SQRT1_2;
  const toScan = (x, y) => [x * C45 + y * S45, -x * S45 + y * C45];
  const toOrig = (u, v) => [u * C45 - v * S45, u * S45 + v * C45];

  // ---- geometry: the flask from the app icon, in a 0..1 frame ----
  const FLASK = [
    ["L", [0.40, 0.13], [0.60, 0.13]],
    ["L", [0.60, 0.13], [0.60, 0.40]],
    ["L", [0.60, 0.40], [0.83, 0.78]],
    ["Q", [0.83, 0.78], [0.87, 0.86], [0.76, 0.86]],
    ["L", [0.76, 0.86], [0.24, 0.86]],
    ["Q", [0.24, 0.86], [0.13, 0.86], [0.17, 0.78]],
    ["L", [0.17, 0.78], [0.40, 0.40]],
    ["L", [0.40, 0.40], [0.40, 0.13]]
  ];
  const FLASK_D = "M.4 .13H.6V.4L.83 .78Q.87 .86 .76 .86H.24Q.13 .86 .17 .78L.4 .4Z";
  const LIQUID_TOP = 0.44, LIQUID_BOTTOM = 0.86;
  const liquidY = level => LIQUID_BOTTOM - Math.max(0.06, Math.min(1, level)) * (LIQUID_BOTTOM - LIQUID_TOP);

  function sample(segs, spacing) {
    const pts = [];
    for (const s of segs) {
      if (s[0] === "L") {
        const [a, b] = [s[1], s[2]], k = Math.max(2, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / spacing));
        for (let i = 0; i < k; i++) pts.push([a[0] + (b[0] - a[0]) * i / k, a[1] + (b[1] - a[1]) * i / k]);
      } else {
        const [a, c, b] = [s[1], s[2], s[3]];
        for (let i = 0; i < 8; i++) {
          const t = i / 8, m = 1 - t;
          pts.push([m * m * a[0] + 2 * m * t * c[0] + t * t * b[0], m * m * a[1] + 2 * m * t * c[1] + t * t * b[1]]);
        }
      }
    }
    return pts;
  }

  // Ornstein-Uhlenbeck wobble along each point's normal, then a 3-point smooth.
  function wobble(pts, strength, r, closed) {
    const n = pts.length, decay = 0.88, scale = strength * Math.sqrt(1 - decay * decay);
    let ou = 0;
    const w = pts.map((p, i) => {
      const a = pts[closed ? (i - 1 + n) % n : Math.max(0, i - 1)], b = pts[closed ? (i + 1) % n : Math.min(n - 1, i + 1)];
      const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy) || 1;
      ou = ou * decay + gauss(r) * scale;
      return [p[0] - (dy / len) * ou, p[1] + (dx / len) * ou];
    });
    return w.map((_, i) => {
      let x = 0, y = 0, c = 0;
      for (let j = i - 1; j <= i + 1; j++) {
        const k = closed ? (j + n) % n : j;
        if (k >= 0 && k < n) { x += w[k][0]; y += w[k][1]; c++; }
      }
      return [x / c, y / c];
    });
  }

  // Keep the part of a polygon below a horizontal line (Sutherland-Hodgman, one edge).
  function clipBelow(poly, y0) {
    const out = [];
    for (let i = 0; i < poly.length; i++) {
      const a = poly[i], b = poly[(i + 1) % poly.length], ain = a[1] >= y0, bin = b[1] >= y0;
      if (ain) out.push(a);
      if (ain !== bin) { const t = (y0 - a[1]) / (b[1] - a[1]); out.push([a[0] + t * (b[0] - a[0]), y0]); }
    }
    return out;
  }

  // 45-degree scan segments through a polygon, with row jitter and edge bleed.
  function scan(poly, step, bleed, r) {
    const rot = poly.map(p => toScan(p[0], p[1]));
    let vmin = Infinity, vmax = -Infinity;
    for (const p of rot) { vmin = Math.min(vmin, p[1]); vmax = Math.max(vmax, p[1]); }
    const rows = [];
    for (let v = vmin - bleed + step / 2; v < vmax + bleed; v += step * (1 + (r() * 2 - 1) * 0.18)) {
      const us = [];
      for (let i = 0; i < rot.length; i++) {
        const a = rot[i], b = rot[(i + 1) % rot.length];
        if ((a[1] <= v && v < b[1]) || (b[1] <= v && v < a[1])) us.push(a[0] + ((v - a[1]) / (b[1] - a[1])) * (b[0] - a[0]));
      }
      us.sort((x, y) => x - y);
      for (let j = 0; j + 1 < us.length; j += 2) rows.push([toOrig(us[j] - bleed, v), toOrig(us[j + 1] + bleed, v)]);
    }
    return rows;
  }

  // One looping scribble stroke between two points (forward + perpendicular oscillation).
  function scribble(a, b, amp, wave, segs, r) {
    const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy) || 1;
    const fx = dx / len, fy = dy / len, px = -fy, py = fx;
    const loopAmp = Math.min(amp, len * 0.4), loops = 2.5 * (0.6 + r() * 0.8), phase = r() * Math.PI * 2;
    const pts = [];
    for (let i = 0; i < segs; i++) {
      const t = i / (segs - 1), ang = 2 * Math.PI * loops * t + phase;
      const fo = loopAmp * Math.cos(ang), po = wave * Math.sin(ang);
      pts.push([a[0] + t * dx + fo * fx + po * px, a[1] + t * dy + fo * fy + po * py]);
    }
    return toD(pts);
  }

  // claudedraw palette entries used here (fixed, so a sketch looks the same in both themes).
  const INK = [13, 13, 13], TEAL = [50, 160, 160], GREEN = [60, 175, 65];
  const jitter = (c, r) => { const k = 1 + (r() * 2 - 1) * 0.06; return `rgb(${c.map(v => Math.max(0, Math.min(255, Math.round(v * k)))).join(",")})`; };
  const rgb = c => `rgb(${c.join(",")})`;

  const SIZES = {
    lg: { step: 0.05, w: 0.05, amp: 0.05, wave: 0.028, segs: 64, wob: 0.011, line: 0.03, grain: 70 },
    sm: { step: 0.085, w: 0.085, amp: 0.06, wave: 0.035, segs: 28, wob: 0.014, line: 0.055, grain: 26 }
  };

  const grainFilter = (id, freq) =>
    `<filter id="${id}" x="0" y="0" width="1" height="1" filterUnits="objectBoundingBox"><feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="2" stitchTiles="stitch" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0.33 0.33 0.33 0 0"/></filter>`;

  /** Scribble sketch of an experiment. `standalone` adds a paper background and its own grain filter. */
  function sketch({ seed = "tiny-lab", level = 0.5, steadiness = 0.5, bubbles = 0, size = "lg", standalone = false } = {}) {
    const S = SIZES[size] || SIZES.lg, r = rng(seed + ":" + size);
    const outline = sample(FLASK, 0.03);
    const y0 = liquidY(level);
    const liquid = clipBelow(outline, y0);
    const fills = scan(liquid, S.step, 0.006, r)
      .map(([a, b], i) => `<path d="${scribble(a, b, S.amp, S.wave, S.segs, r)}" stroke="${jitter(i % 3 ? TEAL : GREEN, r)}"/>`).join("");
    // Shaky early on, steadier as the pact runs its course.
    const hand = S.wob * (0.45 + 0.85 * (1 - Math.max(0, Math.min(1, steadiness))));
    const glass = toD(wobble(outline, hand, r, true), true);
    // Meniscus across the liquid's top edge, from glass wall to glass wall.
    const xs = liquid.filter(p => Math.abs(p[1] - y0) < 1e-6).map(p => p[0]).sort((a, b) => a - b);
    const meniscus = xs.length >= 2
      ? toD(wobble(sample([["L", [xs[0] + 0.02, y0], [xs[xs.length - 1] - 0.02, y0]]], 0.02), hand * 0.8, r, false))
      : "";
    const rim = toD(wobble(sample([["L", [0.35, 0.13], [0.65, 0.13]]], 0.02), hand, r, false));
    let bub = "";
    for (let i = 0; i < Math.min(3, bubbles) && size === "lg"; i++) {
      const cx = 0.38 + i * 0.12 + (r() - 0.5) * 0.04, cy = Math.min(0.8, y0 + 0.1 + r() * (0.78 - y0 - 0.1)), rad = 0.022 + r() * 0.012;
      const ring = []; for (let k = 0; k < 16; k++) ring.push([cx + rad * Math.cos(k / 16 * Math.PI * 2), cy + rad * Math.sin(k / 16 * Math.PI * 2)]);
      bub += `<path d="${toD(wobble(ring, rad * 0.25, r, true), true)}" stroke="${rgb(INK)}" stroke-width="${S.line * 0.55}"/>`;
    }
    const gid = standalone ? "g" + hash(seed + size).toString(36) : `tl-grain-${size}`;
    return `<svg class="art-svg sketch-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1" aria-hidden="true">` +
      (standalone ? `<defs>${grainFilter(gid, S.grain)}</defs><rect width="1" height="1" fill="rgb(245,235,200)"/>` : "") +
      `<g fill="none" stroke-linecap="round" stroke-linejoin="round">` +
      `<g stroke-width="${S.w}" opacity=".88">${fills}</g>` +
      (meniscus ? `<path d="${meniscus}" stroke="${rgb(INK)}" stroke-width="${S.line * 0.6}"/>` : "") + bub +
      `<path d="${glass}" stroke="${rgb(INK)}" stroke-width="${S.line}"/>` +
      `<path d="${rim}" stroke="${rgb(INK)}" stroke-width="${S.line}"/></g>` +
      `<rect width="1" height="1" filter="url(#${gid})" opacity=".55" style="mix-blend-mode:overlay" pointer-events="none"/></svg>`;
  }

  const INK_STYLE = `<style>.ink-line{fill:none;stroke:rgb(15,104,116);stroke-linecap:round;stroke-linejoin:round}.ink-liquid{fill:rgb(52,150,96)}.ink-meniscus{fill:none;stroke:rgb(255,255,255);stroke-opacity:.6;stroke-linecap:round}.ink-tick{fill:none;stroke:rgb(255,255,255);stroke-linecap:round;stroke-linejoin:round}.crest-track{fill:none;stroke:rgb(214,226,226);stroke-linecap:round}.crest-on{fill:none;stroke:rgb(15,104,116);stroke-linecap:round}</style>`;

  /** Clean ink drawing of a proven practice. Strokes carry pathLength=1 so they can draw on. */
  function ink({ seed = "tiny-lab", level = 0.8, size = "lg", standalone = false } = {}) {
    const id = "ink" + hash(seed + size).toString(36), y0 = liquidY(level), sw = size === "sm" ? 0.06 : 0.034;
    return `<svg class="art-svg ink-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1" aria-hidden="true">` +
      (standalone ? INK_STYLE + `<rect width="1" height="1" fill="rgb(230,242,242)"/>` : "") +
      `<defs><clipPath id="${id}"><path d="${FLASK_D}"/></clipPath></defs>` +
      `<g clip-path="url(#${id})"><rect class="ink-liquid" x="0" y="${n4(y0)}" width="1" height="${n4(1 - y0)}"/>` +
      `<path class="ink-meniscus" d="M0 ${n4(y0 + 0.035)}H1" stroke-width="${sw * 0.5}"/></g>` +
      `<path class="ink-line draw" pathLength="1" d="${FLASK_D}" stroke-width="${sw}"/>` +
      `<path class="ink-line draw" pathLength="1" d="M.35 .13H.65" stroke-width="${sw}"/>` +
      (size === "lg" ? `<path class="ink-tick draw" pathLength="1" d="M.41 .7l.07 .07 .14-.15" stroke-width="${sw * 1.1}"/>` : "") +
      `</svg>`;
  }

  /** Capability crest: four level arcs around the staircase-and-flag mark. `level` is 0..3. */
  function crest({ level = 0, size = "lg", standalone = false } = {}) {
    const sw = size === "sm" ? 0.075 : 0.055, R = 0.4, gap = 12;
    const pt = deg => { const a = (deg - 90) * Math.PI / 180; return `${n4(0.5 + R * Math.cos(a))} ${n4(0.5 + R * Math.sin(a))}`; };
    const arcs = [0, 1, 2, 3].map(i => {
      const a0 = i * 90 + gap / 2, a1 = (i + 1) * 90 - gap / 2;
      return `<path class="${i <= level ? "crest-on draw" : "crest-track"}" pathLength="1" d="M${pt(a0)}A${R} ${R} 0 0 1 ${pt(a1)}" stroke-width="${sw}"/>`;
    }).join("");
    return `<svg class="art-svg crest-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1" aria-hidden="true">` +
      (standalone ? INK_STYLE + `<rect width="1" height="1" fill="rgb(255,255,255)"/>` : "") + arcs +
      `<path class="ink-line draw" pathLength="1" d="M.31 .67H.41V.57H.51V.47H.61V.38H.67" stroke-width="${sw * 0.7}"/>` +
      `<path class="ink-line draw" pathLength="1" d="M.61 .38V.27L.7 .305 .61 .34" stroke-width="${sw * 0.7}"/></svg>`;
  }

  const BRIDGE_STYLE = `<style>.br-bank{fill:rgb(226,234,233)}.br-water{fill:none;stroke:rgb(196,222,224);stroke-width:2;stroke-linecap:round}.br-hatch path{fill:none;stroke:rgb(50,160,160);stroke-width:2.6;stroke-linecap:round;opacity:.75}.br-sketch{fill:none;stroke:rgb(13,13,13);stroke-width:1.6;stroke-linecap:round}.br-sketch.thick{stroke-width:2.6}.br-ink-deck{fill:rgb(15,104,116)}.br-ink-line{fill:none;stroke:rgb(15,104,116);stroke-width:2.6;stroke-linecap:round}.br-todo{fill:none;stroke:rgb(120,140,142);stroke-width:1.4;stroke-dasharray:3 4}.br-pin{fill:rgb(255,255,255);stroke:rgb(13,13,13);stroke-width:1.4}.br-pin.ink{stroke:rgb(15,104,116);fill:rgb(15,104,116)}.br-num{font:600 9px ui-monospace,monospace;fill:rgb(13,13,13)}.br-pin.ink+.br-num{fill:rgb(255,255,255)}.br-today{stroke:rgb(208,73,63);stroke-width:1.6;stroke-linecap:round}.br-axis{font:500 9px ui-monospace,monospace;fill:rgb(80,100,104)}.br-sign{fill:rgb(255,255,255);stroke:rgb(13,13,13);stroke-width:1.4}.br-sign-q{font:700 13px sans-serif;fill:rgb(13,13,13)}.crest-track{fill:none;stroke:rgb(214,226,226);stroke-linecap:round}.crest-on{fill:none;stroke:rgb(15,104,116);stroke-linecap:round}.ink-line{fill:none;stroke:rgb(15,104,116);stroke-linecap:round;stroke-linejoin:round}</style>`;

  /** The bridge from a question to a capability, drawn to a day scale.
      Exploring stretch = sketch, proven stretch = ink, the rest = dashed outline.
      days: { today, proven|null, end|null (capability reached Teaching) }
      milestones: [{ day, n }]   spans: [{ from, to, proven }] (one per pact, max 4 drawn) */
  function bridge({ seed = "bridge", today = 0, proven = null, end = null, level = 0, milestones = [], spans = [], standalone = false } = {}) {
    const W = 360, H = 150, x0 = 40, x1 = 320, deckY = 66, r = rng(seed);
    const complete = end != null;
    const total = complete ? Math.max(end, 1) : Math.max(today * 1.35 + 3, 6);
    const X = d => x0 + Math.max(0, Math.min(1, d / total)) * (x1 - x0);
    const xt = X(today), xp = proven == null ? xt : X(Math.min(proven, today));
    const wl = (a, b, s) => toD(wobble(sample([["L", a, b]], 4), s, r, false));
    let g = "";
    g += `<path class="br-water" d="M0 132Q22.5 127 45 132T90 132T135 132T180 132T225 132T270 132T315 132T360 132"/>`;
    g += `<path class="br-bank" d="M0 ${deckY + 4}H${x0 + 2}Q${x0 + 6} ${deckY + 6} ${x0 - 2} ${deckY + 36}Q${x0 - 10} ${deckY + 60} ${x0 - 18} 136H0Z"/>`;
    g += `<path class="br-bank" d="M${W} ${deckY + 4}H${x1 - 2}Q${x1 - 6} ${deckY + 6} ${x1 + 2} ${deckY + 36}Q${x1 + 10} ${deckY + 60} ${x1 + 18} 136H${W}Z"/>`;
    // Left bank: the question sign. Right bank: the capability crest.
    g += `<path class="br-sketch" d="${wl([18, deckY + 4], [18, 44], 0.6)}"/><circle class="br-sign" cx="18" cy="34" r="11"/><text class="br-sign-q" x="18" y="38.5" text-anchor="middle">?</text>`;
    g += crest({ level, size: "sm" }).replace("<svg ", `<svg x="${x1 + 4}" y="${deckY - 40}" width="34" height="34" `);
    let built = "";
    if (xp > x0 + 0.5) {
      const poly = [[x0, deckY - 4], [xp, deckY - 4], [xp, deckY + 4], [x0, deckY + 4]];
      built += `<g class="br-hatch">${scan(poly, 4.5, 1, r).map(([a, b]) => `<path d="${scribble(a, b, 3, 1.4, 22, r)}"/>`).join("")}</g>`;
      built += `<path class="br-sketch" d="${wl([x0, deckY - 4], [xp, deckY - 4], 1)}"/><path class="br-sketch" d="${wl([x0, deckY + 4], [xp, deckY + 4], 1)}"/>`;
    }
    if (proven != null && xt > xp + 0.5) built += `<rect class="br-ink-deck" x="${n4(xp)}" y="${deckY - 4}" width="${n4(xt - xp)}" height="8" rx="2"/>`;
    // Piers: one per pact, hanging under the deck for the days it ran.
    spans.slice(0, 4).forEach((s, i) => {
      const y = deckY + 20 + i * 10, a = X(s.from), b = Math.max(a + 3, X(Math.min(s.to, today)));
      built += s.proven
        ? `<path class="br-ink-line" d="M${n4(a)} ${deckY + 4}V${y}M${n4(a)} ${y}H${n4(b)}"/>`
        : `<path class="br-sketch" d="${wl([a, deckY + 4], [a, y], 0.5)}"/><path class="br-sketch thick" d="${wl([a, y], [b, y], 0.8)}"/>`;
    });
    // Towers at milestones; neighbours closer than 20px alternate height so the pins don't collide.
    let lastX = -99, alt = false;
    milestones.forEach(m => {
      const x = X(m.day), isInk = proven != null && m.day >= proven;
      alt = x - lastX < 20 ? !alt : false; lastX = x;
      const top = alt ? 40 : 22, cy = top - 8;
      built += isInk ? `<path class="br-ink-line" d="M${n4(x)} ${deckY - 4}V${top}"/>` : `<path class="br-sketch" d="${wl([x, deckY - 4], [x, top], 0.7)}"/>`;
      built += `<circle class="br-pin ${isInk ? "ink" : ""}" cx="${n4(x)}" cy="${cy}" r="8"/><text class="br-num" x="${n4(x)}" y="${cy + 3.2}" text-anchor="middle">${m.n}</text>`;
    });
    g += `<g class="br-built">${built}</g>`;
    if (!complete && x1 > xt + 1) g += `<rect class="br-todo" x="${n4(xt)}" y="${deckY - 4}" width="${n4(x1 - xt)}" height="8" rx="2"/>`;
    if (!complete) g += `<path class="br-today" d="M${n4(xt)} ${deckY - 13}V${deckY + 13}"/>`;
    const tAnchor = xt > x1 - 30 ? "end" : xt < x0 + 30 ? "start" : "middle";
    g += `<text class="br-axis" x="${x0}" y="146">day 0</text>`;
    g += complete ? `<text class="br-axis" x="${x1}" y="146" text-anchor="end">day ${end}</text>` : `<text class="br-axis" x="${n4(xt)}" y="146" text-anchor="${tAnchor}">today · day ${today}</text>`;
    return `<svg class="art-svg bridge-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" aria-hidden="true">` +
      (standalone ? BRIDGE_STYLE + `<rect width="${W}" height="${H}" fill="rgb(255,255,255)"/>` : "") + g + `</svg>`;
  }

  root.TinyLabArt = { sketch, ink, crest, bridge, grainFilter };
})(typeof window !== "undefined" ? window : globalThis);
