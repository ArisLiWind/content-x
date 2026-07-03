import { appendLog, applyStatePatch, WORKFLOW_STATUS } from "./state.js";
import { isResearchEnough } from "./nodes.js";
import { createContentAgentRuntime } from "./runtime.js";

export class WorkflowHarness {
  constructor(context, onStateChange) {
    this.context = createContentAgentRuntime(context);
    this.onStateChange = onStateChange;
  }

  async run(initialState) {
    const plan = this.context.planner.createPlan(initialState);
    let state = applyStatePatch(initialState, {
      status: WORKFLOW_STATUS.RUNNING,
      plan,
      harness: this.context.definition,
      graph: {
        name: this.context.graph.name,
        entryPoint: this.context.graph.entryPoint,
        finishPoints: this.context.graph.finishPoints
      }
    });

    this.context.memory.rememberTask(state, "agent_lifecycle.started");
    state = appendLog(state, "Content Agent Created", { level: "success" });
    state = appendLog(state, "Native Agent Harness Running");
    state = appendLog(state, `Plan created with ${plan.stages.length} stages`);
    this.context.checkpointer.save(state.taskId, state, { phase: "agent_lifecycle.started" });
    this.emit(state);

    state = await this.runNode(state, "collectAttentionSignals", "Collecting Attention Signals");
    state = await this.runResearchLoop(state);
    state = await this.runNode(state, "analyzeTrend", "Analyzing Trend");
    state = await this.runNode(state, "scoreAttention", "Scoring Attention");
    state = await this.runNode(state, "generateOutline", "Generating Outline");
    state = await this.runNode(state, "generateDraft", "Writing Draft");
    state = await this.runReviewLoop(state);

    state = applyStatePatch(state, {
      status: WORKFLOW_STATUS.WAITING_APPROVAL,
      currentNode: null
    });
    this.context.memory.recordApproval(state, {
      type: "publish_draft",
      status: "waiting",
      reason: "Human approval is required before publishing."
    });
    this.context.memory.rememberTask(state, "human_approval.requested");
    state = appendLog(state, "Document Ready", { level: "success" });
    this.emit(state);
    return state;
  }

  async runPublishLoop(initialState) {
    let state = applyStatePatch(initialState, {
      status: WORKFLOW_STATUS.PUBLISHING
    });

    while (state.loops.publishRetry < 2) {
      state = applyStatePatch(state, {
        loops: {
          ...state.loops,
          publishRetry: state.loops.publishRetry + 1
        }
      });
      state = appendLog(state, `Publish Loop ${state.loops.publishRetry}/2`);
      state = await this.runNode(state, "preparePublishing", "Preparing Publishing");

      if (state.publishStatus.status === "success") {
        state = await this.runNode(state, "saveHistory", "Saving History");
        state = applyStatePatch(state, {
          status: WORKFLOW_STATUS.DONE
        });
        this.context.memory.rememberTask(state, "publisher.draft_ready");
        state = appendLog(state, "Publish Draft Ready", { level: "success" });
        this.emit(state);
        return state;
      }
    }

    state = applyStatePatch(state, {
      status: WORKFLOW_STATUS.FAILED,
      publishStatus: {
        ...state.publishStatus,
        status: "manual_required"
      }
    });
    state = appendLog(state, "Publish requires manual handling", { level: "warn" });
    this.emit(state);
    return state;
  }

  async applyNaturalLanguageRevision(initialState, instruction) {
    let state = appendLog(initialState, `User requested revision: ${instruction}`);
    const revised = `${state.draft.markdown}

## 根据自然语言反馈修改

修改要求：${instruction}

已按要求重新整理表达，后续真实 Agent 可在这里调用模型完成更精细的语义改写。`;

    state = applyStatePatch(state, {
      status: WORKFLOW_STATUS.WAITING_APPROVAL,
      draft: {
        ...state.draft,
        markdown: revised,
        currentVersion: state.draft.currentVersion + 1,
        editHistory: [
          ...state.draft.editHistory,
          {
            type: "user_revision",
            instruction,
            createdAt: new Date().toISOString()
          }
        ]
      }
    });
    state = appendLog(state, "Revision Applied", { level: "success" });
    this.context.document.saveDraftSet(state, state.draft);
    this.context.memory.rememberTask(state, "document.revised");
    this.emit(state);
    return state;
  }

  async runResearchLoop(initialState) {
    let state = initialState;

    while (state.loops.researchRound < 3) {
      state = appendLog(state, `Research Loop ${state.loops.researchRound + 1}/3`);
      this.emit(state);
      state = await this.runNode(state, "researchSources", "Reading Sources");
      state = await this.runNode(state, "extractFacts", "Extracting Facts");

      if (isResearchEnough(state)) {
        state = appendLog(state, "Research sufficient", { level: "success" });
        this.emit(state);
        return state;
      }
    }

    state = appendLog(state, "Research loop reached max rounds", { level: "warn" });
    this.emit(state);
    return state;
  }

  async runReviewLoop(initialState) {
    let state = initialState;

    while (state.loops.reviewRound < 2) {
      state = appendLog(state, `Review Loop ${state.loops.reviewRound + 1}/2`);
      this.emit(state);
      state = await this.runNode(state, "reviewDraft", "Reviewing Draft");

      if (state.reviewResult.passed) {
        state = appendLog(state, "Review passed", { level: "success" });
        this.emit(state);
        return state;
      }

      state = await this.runNode(state, "reviseDraft", "Revising Draft");
    }

    state = appendLog(state, "Review loop reached max rounds", { level: "warn" });
    this.emit(state);
    return state;
  }

  async runNode(state, nodeName, message) {
    let nextState = await this.context.loop.runNode(state, nodeName, message, this.context, (currentState) => this.emit(currentState));
    if (nodeName === "generateDraft" || nodeName === "reviseDraft") {
      this.context.document.saveDraftSet(nextState, nextState.draft);
      nextState = appendLog(nextState, "Filesystem snapshot saved", {
        level: "success",
        node: nodeName
      });
      this.context.checkpointer.save(nextState.taskId, nextState, { phase: "filesystem_snapshot", node: nodeName });
      this.emit(nextState);
    }
    this.context.memory.rememberTask(nextState, `node.${nodeName}.completed`);
    return nextState;
  }

  emit(state) {
    this.onStateChange(structuredClone(state));
  }
}
