import { extractOpenClawText } from "./openclaw-mcp.js";

export class McpGateway {
  constructor(toolRouter, backendConfig = {}, openclawMcp = null) {
    this.toolRouter = toolRouter;
    this.backendConfig = backendConfig;
    this.openclawMcp = openclawMcp;
    this.calls = [];
  }

  async call(toolName, input, context = {}) {
    const startedAt = performance.now();
    const remoteResult = await this.callOpenClaw(toolName, input, context);
    const result = remoteResult.ok
      ? {
          ...remoteResult,
          durationMs: Math.round(performance.now() - startedAt)
        }
      : await this.toolRouter.call(toolName, input);

    this.calls.unshift({
      toolName,
      input,
      context,
      backend: {
        apiBaseUrl: this.backendConfig.apiBaseUrl || "",
        mcpEndpoint: this.backendConfig.mcpEndpoint || "",
        openclawGatewayUrl: this.backendConfig.openclawGatewayUrl || "",
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

  async callOpenClaw(toolName, input, context) {
    if (!this.openclawMcp?.enabled || toolName !== "research.search") {
      return { ok: false, error: "OpenClaw MCP is not available for this tool." };
    }

    const prompt = [
      "You are the Content X research tool.",
      "Use browser/search capabilities when available.",
      "Return concise, source-aware research notes suitable for drafting a Chinese article.",
      `Task stage: ${context.stage || "research"}`,
      `Query: ${input.query || ""}`
    ].join("\n");

    const response = await this.openclawMcp.callTool("openclaw_chat", { message: prompt });
    if (!response.ok) return response;

    const summary = extractOpenClawText(response.data);
    if (!summary) {
      return { ok: false, error: "OpenClaw MCP returned an empty response." };
    }

    return {
      ok: true,
      provider: "openclaw-mcp",
      data: {
        query: input.query,
        sources: [
          {
            id: `openclaw-${input.round || 1}-${Date.now()}`,
            title: `OpenClaw research: ${input.query}`,
            url: "openclaw://mcp/openclaw_chat",
            platform: "openclaw",
            author: "OpenClaw MCP",
            publishedAt: new Date().toISOString(),
            summary: summary.slice(0, 900),
            credibilityScore: 0.86
          }
        ]
      }
    };
  }

  auditTrail() {
    return this.calls;
  }
}
