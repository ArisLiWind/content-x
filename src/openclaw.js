export class OpenClawGateway {
  constructor(config = {}) {
    this.config = config;
  }

  get enabled() {
    return Boolean(this.config.openclawGatewayUrl);
  }

  async callTool(toolName, input = {}) {
    if (!this.enabled) {
      return {
        ok: false,
        error: "OpenClaw Gateway is not configured."
      };
    }

    const response = await fetch(`${normalizeGatewayUrl(this.config.openclawGatewayUrl)}/tools/call`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(this.config.openclawApiKey ? { Authorization: `Bearer ${this.config.openclawApiKey}` } : {})
      },
      body: JSON.stringify({
        tool: toolName,
        input
      })
    });

    if (!response.ok) {
      return {
        ok: false,
        error: `OpenClaw tool call failed: ${response.status}`
      };
    }

    return {
      ok: true,
      data: await response.json()
    };
  }
}

function normalizeGatewayUrl(value) {
  return String(value || "").replace(/\/+$/, "") || "http://127.0.0.1:18789";
}
