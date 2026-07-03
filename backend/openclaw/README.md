# Content X OpenClaw Backend

Content X integrates with the official OpenClaw Gateway from `openclaw/openclaw`.

Upstream:

- `https://github.com/openclaw/openclaw`

## Runtime Contract

Content X V1 treats OpenClaw as a backend-internal capability:

```text
OpenClaw Gateway: http://127.0.0.1:18789
Memory Namespace: content-x-memory
```

MCP remains an internal tool-layer abstraction in Content X. V1 does not expose OpenClaw, MCP, or Memory configuration in the user settings page.

## Install OpenClaw

```bash
npm install -g openclaw@latest
openclaw onboard --install-daemon
openclaw gateway status
```

Foreground/debug mode:

```bash
openclaw gateway --port 18789 --verbose
```

## Check

```bash
npm run backend:openclaw:check
```

Content X sends research tasks to the local OpenClaw Gateway through its OpenAI-compatible chat interface. If the Gateway is unavailable, Content X falls back to the local V1 research adapter so the app remains usable.

## Content X Backend Service

Content X also ships a local backend wrapper at `backend/contentx`.

```bash
export DEEPSEEK_API_KEY=your_deepseek_key
npm run backend:start
```

It exposes:

- `GET http://127.0.0.1:8788/health`
- `POST http://127.0.0.1:8788/deepseek/test`
- `POST http://127.0.0.1:8788/agent/research`

The backend keeps OpenClaw, Memory, and routing internals out of the frontend settings page.
