# Content X

Content X is a Codex-style AI agent workspace for social attention discovery, content research, intelligent writing, document editing, and publishing draft preparation.

The V1 prototype is intentionally dependency-light: it runs as a local static app and demonstrates the full workflow architecture before external MCP tools and real social publishing APIs are connected.

## Architecture

```text
Core Agent
  -> Workflow Harness
  -> State-driven Nodes
  -> Loop Controllers
  -> Tool Router
  -> Publisher Plugins
  -> Document Preview
```

## V1 Scope

- Three-column Codex-style workspace
- Task sidebar with history and status
- Agent execution panel with Harness / Loop / Node logs
- State-first workflow runtime
- Independent Node modules
- Research loop, review loop, and publish retry loop
- MCP-ready Tool Router abstraction
- Plugin-based Publisher layer
- Editable Markdown document preview
- Copy, export Markdown, export HTML, publish draft
- Natural-language revision requests

## Run

```bash
npm run dev
```

Open:

```text
http://127.0.0.1:3032
```

## Check

```bash
npm run check
```
