# Agent instructions

## Workflow diagrams

This repo replaces manually drawing process/workflow/integration diagrams in
Visio with diagrams-as-code. When asked to diagram a process, map a
workflow, show how systems connect, or "draw this out":

- Write a Mermaid diagram directly into a new file under `diagrams/`
  (fenced ```mermaid block inside a `.md` file) — don't just describe the
  diagram in prose.
- Pick the diagram type by what's being shown: `flowchart` for a
  process/workflow with decisions, `sequenceDiagram` for systems calling
  each other over time, `stateDiagram-v2` for a lifecycle/status machine,
  `erDiagram` for a data model. Use one `subgraph` per system/actor for
  multi-system flows (the swimlane equivalent).
- Full conventions (shapes, color classes, file naming, export commands,
  fallback tools) live in
  [`.claude/skills/workflow-diagram-builder/SKILL.md`](./.claude/skills/workflow-diagram-builder/SKILL.md) —
  read that file before building a diagram.
- Copy-paste starting points: [`diagrams/approval-workflow-example.md`](./diagrams/approval-workflow-example.md)
  and [`diagrams/system-integration-example.md`](./diagrams/system-integration-example.md).

This is a Vite + React portfolio site (`npm run dev`, `npm run build`,
`npm run lint`). The `diagrams/` folder and the skill above are
project-agnostic — the same conventions apply if this pattern gets copied
into another repo.
