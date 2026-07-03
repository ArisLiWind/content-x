export class McpGateway {
  constructor(toolRouter, backendConfig = {}) {
    this.toolRouter = toolRouter;
    this.backendConfig = backendConfig;
    this.calls = [];
  }

  async call(toolName, input, context = {}) {
    const result = await this.toolRouter.call(toolName, input);
    this.calls.unshift({
      toolName,
      input,
      context,
      backend: {
        apiBaseUrl: this.backendConfig.apiBaseUrl || "",
        mcpEndpoint: this.backendConfig.mcpEndpoint || "",
        model: this.backendConfig.model || "",
        hasApiKey: Boolean(this.backendConfig.apiKey)
      },
      ok: result.ok,
      provider: result.provider,
      durationMs: result.durationMs,
      at: new Date().toISOString()
    });
    this.calls = this.calls.slice(0, 80);
    return result;
  }

  auditTrail() {
    return this.calls;
  }
}
