# Content X

Content X is an AI Content Agent powered by a native Agent Harness.

It is built for content creators who want an AI workspace that can research, plan, draft, revise, preview, approve, and prepare content for publishing. Content X is not a Workflow Builder and not a ChatBot. It is a content-creation Agent Harness: the product owns the lifecycle, planning, tool routing, memory, files, document state, approval gates, and publishing handoff.

## Download

Download the latest desktop app from GitHub Releases:

[Download Content X v0.1.0](https://github.com/ArisLiWind/content-x/releases/tag/v0.1.0)

Available builds:

- macOS Apple Silicon: `Content.X-0.1.0-arm64.dmg`
- macOS Apple Silicon zip: `Content.X-0.1.0-arm64-mac.zip`
- Windows ARM64 installer: `Content.X.Setup.0.1.0.exe`
- Windows ARM64 portable app: `Content.X.0.1.0.exe`

The current desktop builds are unsigned local-preview builds. On macOS, you may need to allow the app in System Settings after opening it the first time.

## What It Does

- Creates article and video-script drafts from a natural-language goal
- Runs a visible agent lifecycle instead of hiding work behind a single chat answer
- Uses planning, research loops, review loops, human approval, and publishing handoff
- Shows a Codex-style three-column workspace: tasks, interaction, file preview
- Supports local account state and backend API configuration
- Exports video scripts and prepares article publishing drafts
- Keeps state, memory, virtual files, and checkpoints inside the Agent Harness

## Product Positioning

Content X is designed around this architecture:

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

The backend design is inspired by graph-based agent runtimes such as LangGraph, especially shared state, node execution loops, retry policy, channels, and checkpointing. Content X implements its own lightweight JavaScript primitives instead of copying LangGraph internals.

## Documentation

- [Backend API and Agent Scheduling](docs/backend-api-agent-scheduling.md)

## Current Scope

- Three-column minimal dark workspace
- Task sidebar with history and status
- Search across local content tasks
- Agent execution panel with lifecycle, loop, and node logs
- LangGraph-inspired `StateGraph`, `AgentLoopRunner`, `ChannelSet`, and `MemoryCheckpointer`
- MCP-ready local tool router
- Local memory and virtual filesystem
- Markdown document preview
- Article publish handoff and video-script export
- Account menu with login, profile, settings, invite, quota, and logout states
- Backend API settings for API base URL, API key, model, MCP endpoint, and memory namespace
- Electron desktop packaging for macOS and Windows

## Run Locally

Install dependencies:

```bash
npm install
```

Start the web preview:

```bash
npm run dev
```

Open:

```text
http://127.0.0.1:3032
```

Run the desktop shell:

```bash
npm run desktop
```

## Build Desktop Packages

Build macOS packages:

```bash
npm run dist:mac
```

Build Windows packages:

```bash
npm run dist:win
```

Generated installers are written to `release/`.

## Validate

```bash
npm run check
```

## Repository

GitHub: [ArisLiWind/content-x](https://github.com/ArisLiWind/content-x)
