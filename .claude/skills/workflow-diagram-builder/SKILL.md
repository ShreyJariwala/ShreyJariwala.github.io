---
name: workflow-diagram-builder
description: Build workflow, process, approval-chain, and system-integration diagrams as code (Mermaid, with D2/Graphviz as fallbacks) — an AI-native replacement for hand-drawing them in Visio. Use whenever the user asks to diagram a process, map a workflow, draw a flowchart, show how systems/steps connect, visualize an approval chain or data flow, or says things like "diagram this", "draw this out", "map this integration", or "replace this Visio diagram".
---

# Workflow diagram builder

The point of this skill: diagrams are **code**, not drag-and-drop shapes. When
the user describes a process, don't describe it back in prose — write the
diagram file directly, commit it, and let it render. No Visio, no manual
box-dragging, no "let me draw this up and send it over."

## Where diagrams live

- One diagram per file, under `diagrams/`.
- Default format: a `.md` file with a fenced ```mermaid block, e.g.
  `diagrams/ukg-netsuite-gl-flow.md`. GitHub, VS Code, and Claude/Codex
  artifacts all render Mermaid fences natively — no extra tooling needed to
  view it.
- If a file needs to feed a CLI tool (batch SVG export, etc.), use a raw
  `.mmd` file with the same slug instead of/alongside the `.md`.
- Slug filenames by subject, not by date: `<system-or-process>-<kind>.md`
  (e.g. `expense-approval-flow.md`, `bullhorn-netsuite-sync-sequence.md`).

## Picking the diagram type

| What the user is describing | Mermaid diagram type | Direction |
|---|---|---|
| A process / workflow with steps and decisions | `flowchart` | `TD` (top-down) usually; `LR` for a long linear pipeline |
| Systems calling each other over time (API calls, integration handoffs) | `sequenceDiagram` | n/a (always top-to-bottom by time) |
| An entity's lifecycle / status transitions | `stateDiagram-v2` | n/a |
| A data model / record relationships | `erDiagram` | n/a |
| Multiple systems/teams each owning a lane of steps | `flowchart` with one `subgraph` per system/actor | `TD` |
| High-level architecture / how systems connect | `flowchart` with `subgraph` per system, dashed edges for async | `LR` |

Default to `flowchart TD` for anything ambiguous — it's the closest analog
to what a Visio process diagram looked like, and the easiest for a
non-technical reviewer to read.

## Conventions (keep every diagram consistent)

- **Shapes carry meaning, always the same way:**
  - `([Start/End])` — rounded, terminal nodes
  - `[Step]` — a plain rectangle, an action/task
  - `{Decision?}` — a diamond, exactly one question, edges labeled with the
    answer (`-->|Yes|`, `-->|No|`)
  - `[(Datastore)]` — a cylinder, a database/record/file
  - `[[System boundary]]` — subroutine shape, an external system call
- **Status color classes** — define once per file, reuse everywhere:
  ```
  classDef ok fill:#1a7f4b,color:#fff,stroke:none
  classDef warn fill:#b9770e,color:#fff,stroke:none
  classDef err fill:#b3261e,color:#fff,stroke:none
  classDef neutral fill:#5b6472,color:#fff,stroke:none
  ```
  Apply with `class NodeId ok`. Green = succeeded/live, amber = in
  progress/manual step, red = failure/blocked, gray = neutral/informational.
- **Swimlanes** for multi-system flows: one `subgraph "System Name"` per
  actor/system, steps nested inside it, edges crossing subgraphs show the
  actual handoff points — this is the direct replacement for Visio's
  swimlane containers.
- **One diagram = one idea.** If a flow needs both "the happy path" and "all
  the error branches" and it's getting dense, split into two files
  (`-happy-path` / `-error-handling`) rather than cramming both into one
  unreadable graph.

## Workflow when asked to diagram something

1. Identify: the actors/systems involved, the ordered steps, every decision
   point, and where it starts/ends. If the user's description is missing
   one of these, make the most reasonable call rather than stopping to ask —
   this mirrors what Visio would have forced them to decide anyway.
2. Pick the diagram type from the table above.
3. Write the file under `diagrams/` using the shape/color/swimlane
   conventions above.
4. Show the user the rendered result (in this chat, Mermaid fences render
   inline; in VS Code, `Cmd/Ctrl+Shift+V` on the `.md` file renders it, or
   install "Markdown Preview Mermaid Support").
5. Iterate by editing the same file on follow-up prompts ("add a rejection
   branch", "split out the retry path") — never redraw from scratch.

## Exporting for people who still expect a Visio-style file

Most reviewers just need to see the diagram, which the `.md` file already
does on GitHub. When someone needs a flat image or PDF instead:

```bash
npx -y @mermaid-js/mermaid-cli -i diagrams/<slug>.md -o diagrams/<slug>.svg
npx -y @mermaid-js/mermaid-cli -i diagrams/<slug>.md -o diagrams/<slug>.png
```

No permanent install required — `npx` fetches it on demand. If a true
`.vsdx` is ever unavoidable (a client's process insists on Visio), export to
SVG first and open/import that in Visio — still faster than drawing from
scratch.

## When Mermaid isn't enough

Mermaid covers process flows, sequences, states, ER, and simple
architecture. Reach for something else only when:
- **Very large architecture diagrams** with dozens of nodes and precise
  layout control → use [D2](https://d2lang.com) (`.d2` file, `d2 file.d2
  file.svg` to render).
- **Precise graph layout algorithms** (e.g. large dependency graphs) →
  Graphviz DOT (`.dot` file, `dot -Tsvg file.dot -o file.svg`).

Both are still text-in-git-out-a-rendered-image — the same workflow, just a
different syntax for cases Mermaid's layout engine handles poorly.

See `diagrams/README.md` and the example files in `diagrams/` for
ready-to-copy starting points.
