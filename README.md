# Content X

Content X is an AI Content Agent powered by a native Agent Harness for social attention discovery, content research, intelligent writing, document editing, human approval, and publishing draft preparation.

Content X is not a Workflow Builder and not a ChatBot. It is a content-creation Agent Harness: the product owns the lifecycle, planning, tool routing, memory, files, document state, approval gates, and publishing handoff.

## Architecture

```text
Content Agent
  -> Harness
  -> Planning
  -> StateGraph
  -> Agent Loop
  -> Tool Router
  -> MCP
  -> Channels
  -> Memory
  -> Filesystem
  -> Document
  -> Checkpoint
  -> Publisher
```

## V1 Scope

- Three-column Codex-style workspace
- Task sidebar with history and status
- Agent execution panel with Harness / Loop / Node logs
- State-first agent harness runtime
- Independent Node modules
- Research loop, review loop, and publish retry loop
- LangGraph-inspired StateGraph, Agent Loop, ChannelSet, and Checkpointer primitives
- MCP-ready Tool Router abstraction
- Local MCP Gateway audit trail
- Local Memory and virtual Filesystem
- Plugin-based Publisher layer
- Editable Markdown document preview
- Publish draft handoff from the file preview panel
- Account menu with profile, settings, invite, quota, and logout entries
- Natural-language revision requests

## Run

```bash
npm run dev
```

Open:

```text
http://127.0.0.1:3032
```

## Desktop App

Content X includes an Electron shell for local desktop distribution.

```bash
npm install
npm run desktop
```

Build downloadable desktop packages:

```bash
npm run dist:mac
npm run dist:win
```

Generated installers are written to `release/`.

## Check

```bash
npm run check
```
