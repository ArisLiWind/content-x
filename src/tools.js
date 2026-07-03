export class ToolRouter {
  constructor() {
    this.registry = new Map();
  }

  register(tool) {
    this.registry.set(tool.name, tool);
  }

  async call(toolName, input) {
    const startedAt = performance.now();
    const tool = this.registry.get(toolName);

    if (!tool) {
      return {
        ok: false,
        error: `Tool not registered: ${toolName}`,
        provider: "unknown",
        durationMs: Math.round(performance.now() - startedAt)
      };
    }

    try {
      const data = await tool.handler(input);
      return {
        ok: true,
        data,
        provider: tool.provider,
        durationMs: Math.round(performance.now() - startedAt)
      };
    } catch (error) {
      return {
        ok: false,
        error: error.message,
        provider: tool.provider,
        durationMs: Math.round(performance.now() - startedAt)
      };
    }
  }
}

export function createDefaultToolRouter() {
  const router = new ToolRouter();

  router.register({
    name: "attention.collect",
    provider: "local",
    capability: "attention",
    description: "Collect mocked social attention signals for the current topic.",
    handler: async ({ topic }) => ({
      signals: [
        {
          platform: "Hacker News",
          keyword: "agentic coding",
          metric: "discussion_velocity",
          value: 88,
          reason: "开发者正在密集讨论 Agent 工作流从 demo 走向生产的问题。"
        },
        {
          platform: "X",
          keyword: "AI agents",
          metric: "share_of_voice",
          value: 82,
          reason: "AI Agent、browser use、tool calling 仍是技术圈高频话题。"
        },
        {
          platform: "微信公众号",
          keyword: "AI 应用落地",
          metric: "reader_intent",
          value: 79,
          reason: "中文读者更关心 AI 如何进入产品和工作流。"
        }
      ],
      topic
    })
  });

  router.register({
    name: "research.search",
    provider: "mcp-ready-local",
    capability: "search",
    description: "MCP-ready search adapter. V1 returns curated mock sources.",
    handler: async ({ query, round }) => ({
      sources: [
        {
          id: `source-${round}-1`,
          title: "AI Agent 产品化趋势观察",
          url: "https://example.com/agent-productization",
          platform: "web",
          author: "Content X Research",
          publishedAt: new Date().toISOString(),
          summary: "Agent 产品正在从聊天框转向任务工作台和可审计工作流。",
          credibilityScore: 0.82
        },
        {
          id: `source-${round}-2`,
          title: "多工具调用与 MCP 生态",
          url: "https://example.com/mcp-tools",
          platform: "web",
          author: "Content X Research",
          publishedAt: new Date().toISOString(),
          summary: "MCP 让 Agent 能用统一协议连接搜索、文件、浏览器、发布等外部系统。",
          credibilityScore: 0.78
        }
      ],
      query
    })
  });

  router.register({
    name: "document.toHtml",
    provider: "local",
    capability: "export",
    description: "Convert Markdown into lightweight HTML.",
    handler: async ({ markdown, renderMarkdown }) => ({
      html: renderMarkdown(markdown)
    })
  });

  return router;
}
