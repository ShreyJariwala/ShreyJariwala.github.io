# Diagrams

Workflow, process, and integration diagrams for this project — written as
code instead of drawn in Visio. See
[`.claude/skills/workflow-diagram-builder/SKILL.md`](../.claude/skills/workflow-diagram-builder/SKILL.md)
for the conventions and the full "how to build one" instructions given to
Claude Code / Codex.

Each file is a self-contained Markdown doc with a fenced Mermaid diagram, so
it renders directly on GitHub and in VS Code — no separate viewer needed.

## Starting points in this folder

- [`approval-workflow-example.md`](./approval-workflow-example.md) — a
  generic multi-step approval flow with a rejection branch. Copy this for
  any "request → review → decision" process.
- [`system-integration-example.md`](./system-integration-example.md) — a
  swimlaned system-to-system integration flow. Copy this for anything that
  crosses two or more systems (the kind of diagram Visio used to hold).

To add a new diagram, just describe the process in a prompt — the agent
will pick the right diagram type and write the file here directly.
