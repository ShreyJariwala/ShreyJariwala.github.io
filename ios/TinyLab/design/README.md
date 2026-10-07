# Tiny Lab design kit

Custom icons and the motion plan, shared by the iOS app and the web demo.
There are no emoji or Unicode symbol glyphs anywhere in the UI. Every pictogram
comes from this set.

## Icons

`build_icons.py` is the single source. Run it after editing an icon:

```
python3 ios/TinyLab/design/build_icons.py
```

It writes:

| Output | Used by |
| --- | --- |
| `icons/<name>.svg` | standalone files (`currentColor`), for docs, Figma, the website |
| `sprite.svg` | `<symbol id="i-<name>">` sprite, pasted inline into `demo/tiny-lab-demo.html` |
| `../TinyLab/Assets.xcassets/Icons/tl-<name>.imageset` | iOS template images: `Image("tl-streak")`, tinted with `.foregroundStyle` |
| `tl-<name>-inline.imageset` | 12pt variants for icons placed inside a line of `Text` |

**Spec:** 24×24 grid, 2px safe margin, 1.75 stroke (2 at 13px, 2.4 inside the
log buttons), round caps and joins. Filled parts use the stroke colour. One
idea per icon, drawn from the app's own world where possible:

| Icon | Meaning | Motif |
| --- | --- | --- |
| `today` | Today tab | a day cell with a tick, the same shape as the log grid |
| `lab` | Lab tab, experiments | the app-icon flask |
| `capability` | Capabilities | a staircase with a flag: levels you climb |
| `streak` | consecutive days | three day cells, the newest one filled |
| `practice` | operationalized pact | a calendar with a tick: it's on the schedule now |
| `in-use` | output put to work | a plug: plugged into a workflow |
| `persist` / `pause` / `pivot` | end-of-pact decisions | loop forward / two bars / a path that branches off |
| `head` / `heart` / `hand` / `life` | Triple Check reasons | profile, heart, open hand, rain cloud |
| `insight` / `artifact` / `data` / `link` | output kinds | bulb, cube, bars, chain |

The web demo also draws a **growth path** diagram (experiments → practices →
capabilities, with live counts) from the same icons. See `growthPath()` in the
demo.

## Sketch and ink

An experiment hasn't proven anything yet, so it is drawn as a **pencil sketch**.
Once a pact is proven (operationalized into a practice), it is redrawn in
**clean ink**. Capabilities are always drawn in ink, as a crest.

| State | Drawing | What the drawing encodes |
| --- | --- | --- |
| Experiment (running, paused, done) | scribble flask on paper | liquid level = hit rate, bubbles = streak (up to 3), steadier line = more of the pact has run |
| Practice (operationalized) | clean ink flask with a tick | liquid level = hit rate |
| Capability | ink crest: four arcs around the staircase mark | arcs drawn = level (Exploring, Practicing, Proficient, Teaching) |

### The bridge: question to capability

Each capability page draws a bridge from the day the question was first asked
(the left bank, a "?" sign) to the capability (the right bank, its crest). It is
drawn to a day scale:

- **Numbered towers** mark the milestones in order: question asked, first
  experiment, first practice, then each level reached. Pins that would collide
  alternate heights.
- **The deck** is sketched (hatching, wobbly rails) while you were exploring.
  It is solid ink from the first proven practice to today, and a dashed
  outline for what isn't built yet. A red tick marks today. At Teaching, the
  deck reaches the far bank.
- **Piers** hang under the deck, one per pact, spanning the days it ran:
  sketched for experiments, ink for practices.

The headline above it is the number you track: days from the question to the
furthest point reached. Samples: `illustrations/bridge-in-progress.svg` and
`illustrations/bridge-complete.svg`.

`art.js` generates all four drawings as plain SVG, with seeded randomness so a pact's
sketch stays the same between visits. The sketch technique is adapted from
[claudedraw](https://github.com/Griffin2/claudedraw) by Griffin2 (MIT): an
Ornstein-Uhlenbeck wobble on outlines, 45° looping scribble fills that bleed past
the edge, and feTurbulence grain. The sketch keeps claudedraw's fixed ink and
palette colours, so it looks the same in both themes. Ink drawings use the app's
colour tokens.

```
node ios/TinyLab/design/build_art.cjs
```

That command writes the samples in `illustrations/` (standalone SVGs with their
own paper and colours) and inlines `art.js` into the web demo.

## Motion

Motion confirms what you did or shows that something changed state. Nothing
plays just for decoration, and nothing makes you wait.

| Moment | What moves | Why |
| --- | --- | --- |
| **Signature: re-inking** | on Operationalize, the sketch blurs off the paper, the ink outline draws on, the liquid pours in and the tick lands last (about 1.6s) | marks the moment an experiment becomes a proven practice |
| Flask meter | the Today header flask fills to today's logged share (0.9s, expo out) | the one authored moment; it ties the app icon to your day |
| Log check / cross | the button fills from the bottom like liquid, then the tick or cross draws on | confirms the tap in place |
| Capability level up | the crest arcs draw on | shows the new level |
| Bridge | the built part of the deck reveals from the question bank to today (1.1s) | traces the path you have covered |
| Streak grows | the newest cell of the streak icon scales in | shows that the log extended the streak |
| PACT check met | the circle settles and the tick draws, only when a criterion flips to met | feedback without replaying on every keystroke |
| Grid day tap | the cell settles from 82% scale | confirms the change on a small target |
| Screen change | forward/back slide, crossfade between tabs (View Transitions) | keeps your place in the hierarchy |
| Sheets | rise in 420ms, leave in 180ms | exits faster than entrances |

Easing: `cubic-bezier(0.16, 1, 0.3, 1)` for arrivals, `cubic-bezier(0.7, 0, 0.84, 0)`
for exits. No bounce or elastic curves.

**Reduced motion:** slides and scales become fades. Colour changes, fills and
stroke draws stay, because they carry state.

On iOS these moments would map to SwiftUI: `.sensoryFeedback` plus an `.easeOut`
fill on the log buttons, and `.contentTransition(.numericText())` for counts.
That port has not been made yet.
