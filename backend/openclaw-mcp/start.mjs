import { spawn } from "node:child_process";

const env = {
  ...process.env,
  OPENCLAW_URL: process.env.OPENCLAW_URL || "http://127.0.0.1:18789",
  OPENCLAW_GATEWAY_TOKEN: process.env.OPENCLAW_GATEWAY_TOKEN || "",
  OPENCLAW_MODEL: process.env.OPENCLAW_MODEL || "openclaw",
  OPENCLAW_TIMEOUT_MS: process.env.OPENCLAW_TIMEOUT_MS || "300000",
  AUTH_ENABLED: process.env.AUTH_ENABLED || "false",
  HOST: process.env.HOST || "127.0.0.1",
  PORT: process.env.PORT || "8790",
  CORS_ORIGINS: process.env.CORS_ORIGINS || "http://127.0.0.1:3046,http://127.0.0.1:3032"
};

const args = [
  "--yes",
  "openclaw-mcp",
  "--transport",
  "sse",
  "--host",
  env.HOST,
  "--port",
  env.PORT
];

const child = spawn("npx", args, {
  env,
  stdio: "inherit"
});

child.on("exit", (code) => {
  process.exit(code ?? 0);
});
