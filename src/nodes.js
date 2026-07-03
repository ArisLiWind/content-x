export const nodes = {
  async collectAttentionSignals(state, context) {
    const result = await context.tools.call("attention.collect", {
      topic: state.topic.normalized
    });

    const signals = result.ok ? result.data.signals : [];
    return {
      attentionScore: {
        ...state.attentionScore,
        signals,
        reasons: signals.map((signal) => signal.reason)
      }
    };
  },

  async researchSources(state, context) {
    const round = state.loops.researchRound + 1;
    const result = await context.tools.call("research.search", {
      query: state.topic.normalized,
      round
    });

    const nextSources = result.ok ? result.data.sources : [];
    return {
      sources: dedupeById([...state.sources, ...nextSources]),
      loops: {
        ...state.loops,
        researchRound: round
      }
    };
  },

  async extractFacts(state) {
    const facts = state.sources.map((source, index) => ({
      id: `fact-${index + 1}`,
      claim: source.summary,
      sourceIds: [source.id],
      confidence: source.credibilityScore || 0.7
    }));

    return {
      facts
    };
  },

  async analyzeTrend(state) {
    return {
      trendAnalysis: {
        summary: "AI 技术进展的注意力正在从单点模型能力，转向 Agent 如何进入真实工作流、如何调用工具、如何被用户审计和确认。",
        opportunities: [
          "把复杂 AI 能力包装成任务工作台，而不是只停留在聊天框。",
          "用 MCP 和插件化工具层降低外部系统接入成本。",
          "让内容创作过程透明化，增强用户对事实和结论的信任。"
        ],
        risks: [
          "资料不足时容易把趋势写成确定性结论。",
          "平台风格差异会导致同一草稿不适合直接多端发布。"
        ],
        angles: [
          "AI Agent 从生成内容走向完成任务",
          "MCP 让 AI 应用进入可组合时代",
          "未来内容团队会像管理流水线一样管理创作"
        ]
      }
    };
  },

  async scoreAttention(state) {
    const signalAverage = average(state.attentionScore.signals.map((signal) => signal.value || 70));
    const factBoost = Math.min(state.facts.length * 3, 12);
    const score = Math.min(100, Math.round(signalAverage + factBoost));

    return {
      attentionScore: {
        ...state.attentionScore,
        score,
        reasons: [
          ...state.attentionScore.reasons,
          `综合社媒讨论速度、读者意图和资料密度，当前选题注意力评分为 ${score}。`
        ]
      }
    };
  },

  async generateOutline(state) {
    return {
      outline: {
        title: "今天最值得关注的 AI 技术进展：Agent 正在变成真正的工作台",
        sections: [
          { heading: "开场：AI 进展的关键词变了", points: ["从模型参数转向工作流能力", "从一次生成转向多轮执行"] },
          { heading: "趋势一：Agent 产品化", points: ["任务状态可见", "执行过程可审计", "用户确认成为关键节点"] },
          { heading: "趋势二：MCP 和工具生态", points: ["连接搜索、浏览器、文档和发布平台", "工具不写死在业务流程里"] },
          { heading: "趋势三：内容团队的机会", points: ["选题发现自动化", "研究和写作流水线化", "多平台草稿生成"] },
          { heading: "结尾：判断 AI 应用的新标准", points: ["不是能不能生成，而是能不能完成一个闭环"] }
        ]
      }
    };
  },

  async generateDraft(state) {
    const markdown = buildDraft(state);
    return {
      draft: {
        ...state.draft,
        markdown,
        currentVersion: state.draft.currentVersion + 1,
        variants: [
          {
            platform: "wechat",
            title: state.outline.title,
            markdown,
            metadata: { tone: "深度分析", audience: "科技与产品读者" }
          },
          {
            platform: "xiaohongshu",
            title: "AI 技术今天真正变重要的地方",
            markdown: buildXiaohongshuDraft(state),
            metadata: { tone: "轻量、观点鲜明", audience: "AI 工具和职场效率读者" }
          }
        ]
      }
    };
  },

  async reviewDraft(state) {
    const reviewRound = state.loops.reviewRound + 1;
    const hasEnoughFacts = state.facts.length >= 4;
    const hasPlatformVariants = state.draft.variants.length >= 2;
    const markdownLength = state.draft.markdown.length;
    const score = Math.min(96, 72 + state.facts.length * 3 + (hasPlatformVariants ? 8 : 0) + (markdownLength > 900 ? 5 : 0));
    const passed = score >= 88 || reviewRound >= 2;

    return {
      reviewResult: {
        passed,
        score,
        issues: passed
          ? []
          : [
              {
                type: hasEnoughFacts ? "style" : "fact",
                severity: "medium",
                message: hasEnoughFacts ? "需要让标题和结尾更有传播性。" : "事实密度还不够，需要补充更多来源。"
              }
            ],
        suggestions: passed
          ? ["文档已达到 V1 预览标准，可进入人工确认。"]
          : ["强化开头冲突", "补充来源可信度", "增加小红书版本的清单感"]
      },
      loops: {
        ...state.loops,
        reviewRound
      }
    };
  },

  async reviseDraft(state) {
    const revised = `${state.draft.markdown}

## 自我审核后的增强

- 更明确地把今天的重点归纳为：Agent 工作台、MCP 工具层、人工确认发布。
- 对不确定信息保留边界：当前 V1 先使用可验证来源和人工确认，不把社媒热度直接等同于事实。
- 为多平台发布保留不同表达：公众号负责深度，小红书负责观点和清单。`;

    return {
      draft: {
        ...state.draft,
        markdown: revised,
        currentVersion: state.draft.currentVersion + 1,
        editHistory: [
          ...state.draft.editHistory,
          {
            type: "agent_revision",
            instruction: "Review loop quality revision",
            createdAt: new Date().toISOString()
          }
        ]
      }
    };
  },

  async preparePublishing(state, context) {
    const html = context.renderMarkdown(state.draft.markdown);
    const outputs = [];

    for (const platform of ["markdown", "html", ...state.topic.platforms]) {
      const target = platform === "wechat" || platform === "xiaohongshu" ? platform : platform;
      const content = {
        markdown: state.draft.markdown,
        html
      };
      const result = await context.publishers.publish(target, content, {
        title: state.outline.title,
        taskId: state.taskId
      });
      outputs.push(result);
    }

    return {
      publishStatus: {
        status: "success",
        platform: "multi",
        attempts: state.publishStatus.attempts + 1,
        lastError: "",
        outputs
      }
    };
  },

  async saveHistory(state) {
    return {
      status: "done",
      currentNode: null
    };
  }
};

export function isResearchEnough(state) {
  const confidence = average(state.facts.map((fact) => fact.confidence));
  return state.sources.length >= 4 && state.facts.length >= 4 && confidence >= 0.75;
}

function buildDraft(state) {
  const sourceLines = state.sources
    .slice(0, 4)
    .map((source) => `- ${source.title}：${source.summary}`)
    .join("\n");

  return `# ${state.outline.title}

今天 AI 技术进展里最值得关注的，不只是某个模型又提升了多少分，而是 AI Agent 正在从“能回答问题”走向“能完成任务”。

## 为什么这个变化重要

过去的 AI 产品大多围绕聊天框展开。用户提出问题，模型给出答案。但真正的工作并不是一次回答，而是一串连续动作：发现问题、搜索资料、提取事实、判断趋势、生成草稿、审核修改、等待确认，再进入发布。

这也是 Agent 产品化的关键变化：AI 不再只是内容生成器，而是一个可以被调度、被观察、被修正的工作流执行者。

## 今天的三个信号

${state.attentionScore.reasons.map((reason) => `- ${reason}`).join("\n")}

## 资料和事实基础

${sourceLines}

## 趋势判断

${state.trendAnalysis.summary}

可以看到，新的机会不在于把所有事情都交给 AI 自动完成，而在于让 AI 承担高频、繁琐、需要跨工具协作的中间过程，同时把关键判断和发布确认留给人。

## 对内容团队的启发

- 选题发现会从“凭感觉刷热点”变成“持续收集注意力信号”。
- 内容研究会从“复制资料”变成“围绕可信来源提取事实”。
- 草稿生产会从“一篇文章”变成“面向不同平台的内容包”。
- 发布前审核会成为 Agent 工作流的默认环节。

## 结论

判断一个 AI 应用是否真正有价值，标准不再只是“它能不能生成一段文字”，而是“它能不能围绕一个目标完成闭环”。这也是 Content X 要解决的问题：把内容从选题、研究、创作、修改到发布草稿，变成一个可见、可控、可扩展的 Agent 工作台。`;
}

function buildXiaohongshuDraft(state) {
  return `# AI 技术今天真正变重要的地方

不是又多了一个聊天机器人，而是 AI Agent 开始像“工作台”一样帮你完成完整任务。

## 3 个重点

1. AI 不只生成文字，而是可以跑流程。
2. MCP 这类工具协议，让 AI 更容易连接搜索、文档、浏览器、发布平台。
3. 真正靠谱的 AI 产品，一定要保留人工确认和可编辑文档。

## 对内容创作者意味着什么

- 选题可以自动发现
- 资料可以自动整理
- 草稿可以多平台生成
- 修改可以直接用自然语言完成

我的判断：未来内容工具不会只是“写一篇文章”，而是帮你管理一整条内容生产线。

注意力评分：${state.attentionScore.score}/100`;
}

function dedupeById(items) {
  return [...new Map(items.map((item) => [item.id, item])).values()];
}

function average(values) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}
