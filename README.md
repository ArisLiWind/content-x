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
- Supports DeepSeek and OpenAI-compatible model configuration
- Provides an OpenClaw Gateway adapter for browser/search/MCP-backed tools
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

## Configure DeepSeek

Open `个人帐户 -> 设置` in the app and paste only your DeepSeek API Key.

```text
API Key: your DeepSeek API key
```

The V1 frontend intentionally hides internal settings from ordinary users. Content X uses these fixed internal values:

```text
API Base URL: https://api.deepseek.com
Model: deepseek-chat
OpenClaw Gateway: http://127.0.0.1:18789
MCP Endpoint: http://127.0.0.1:8790/mcp
Memory Namespace: content-x-memory
```

Do not commit API keys to this repository. Keys are stored only in the local app settings.

## OpenClaw Backend Direction

Content X is designed to use OpenClaw as the local backend gateway for high-quality external information access:

- Browser control through CDP / Playwright
- Web search MCP
- Browser MCP
- GitHub MCP
- Filesystem MCP
- Workspace skills with `SKILL.md` and `handler.ts`

Recommended OpenClaw setup:

```bash
npm install -g openclaw@latest
openclaw onboard --install-daemon
openclaw gateway status
```

Content X V1 keeps the OpenClaw Gateway and MCP endpoint as fixed internal backend configuration, not user-facing settings.

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
- User-facing settings only expose DeepSeek API Key; backend endpoints and namespaces are fixed internally
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
