export const CONTENT_X_BACKEND = {
  host: process.env.CONTENT_X_BACKEND_HOST || "127.0.0.1",
  port: Number(process.env.CONTENT_X_BACKEND_PORT || 8788),
  deepseek: {
    apiBaseUrl: "https://api.deepseek.com",
    model: "deepseek-chat",
    apiKey: process.env.DEEPSEEK_API_KEY || process.env.CONTENT_X_DEEPSEEK_API_KEY || ""
  },
  openclaw: {
    mode: process.env.OPENCLAW_REMOTE_URL ? "remote" : "embedded",
    remoteUrl: process.env.OPENCLAW_REMOTE_URL || "",
    model: "openclaw",
    mcpEndpoint: "/mcp"
  },
  memory: {
    namespace: "content-x-memory"
  }
};

export function publicBackendConfig() {
  return {
    apiBaseUrl: CONTENT_X_BACKEND.deepseek.apiBaseUrl,
    model: CONTENT_X_BACKEND.deepseek.model,
    openclawMode: CONTENT_X_BACKEND.openclaw.mode,
    openclawRemoteConfigured: Boolean(CONTENT_X_BACKEND.openclaw.remoteUrl),
    mcpEndpoint: CONTENT_X_BACKEND.openclaw.mcpEndpoint,
    memoryNamespace: CONTENT_X_BACKEND.memory.namespace,
    hasDeepSeekApiKey: Boolean(CONTENT_X_BACKEND.deepseek.apiKey)
  };
}

export function assertDeepSeekApiKey() {
  if (!CONTENT_X_BACKEND.deepseek.apiKey) {
    return {
      ok: false,
      error: "DeepSeek API Key is missing. Set DEEPSEEK_API_KEY before starting the backend, or paste the key in Content X settings."
    };
  }
  return { ok: true };
}
