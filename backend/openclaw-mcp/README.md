# Content X OpenClaw MCP Backend

This folder wires Content X to `freema/openclaw-mcp`, the MCP bridge for OpenClaw.

Upstream:

- Original: `https://github.com/freema/openclaw-mcp`
- Fork: `https://github.com/ArisLiWind/openclaw-mcp`

## Runtime Contract

Content X V1 keeps these values as backend-internal configuration:

```text
OpenClaw Gateway: http://127.0.0.1:18789
MCP Endpoint: http://127.0.0.1:8790/mcp
Memory Namespace: content-x-memory
```

They are not exposed in the frontend settings page.

## Start

OpenClaw Gateway must already be running on `http://127.0.0.1:18789`.

```bash
npm run backend:openclaw:mcp
```

Then check:

```bash
npm run backend:openclaw:check
```

## What It Provides

`openclaw-mcp` exposes OpenClaw through MCP tools such as:

- `openclaw_chat`
- `openclaw_status`
- `openclaw_instances`
- `openclaw_chat_async`
- `openclaw_task_status`
- `openclaw_task_list`
- `openclaw_task_cancel`

Content X uses this as the backend tool bridge for browser/search/GitHub/filesystem workflows. If the MCP backend is not running, Content X falls back to the local mock tool router.
