import { WorkflowHarness } from "./harness.js";
import { createTaskState, WORKFLOW_STATUS } from "./state.js";
import { createDefaultToolRouter } from "./tools.js";
import { createPublisherRegistry } from "./publishers.js";
import { exportBlob, renderMarkdown } from "./markdown.js";

const app = document.querySelector("#app");
const tools = createDefaultToolRouter();
const publishers = createPublisherRegistry();

const store = {
  tasks: loadTasks(),
  activeTaskId: null,
  isRunning: false,
  selectedVariant: "wechat"
};

if (store.tasks.length) {
  store.activeTaskId = store.tasks[0].taskId;
}

render();

function render() {
  const activeTask = getActiveTask();
  app.innerHTML = `
    <main class="workspace">
      ${renderSidebar(activeTask)}
      ${renderAgentPanel(activeTask)}
      ${renderDocumentPanel(activeTask)}
    </main>
  `;

  bindEvents();
}

function renderSidebar(activeTask) {
  return `
    <aside class="sidebar">
      <div class="brand">
        <div class="brand-mark">CX</div>
        <div>
          <h1>Content X</h1>
          <p>AI Content Agent</p>
        </div>
      </div>
      <button class="new-task" data-action="new-task">+ New Task</button>
      <div class="task-list">
        ${store.tasks
          .map(
            (task) => `
              <button class="task-item ${activeTask?.taskId === task.taskId ? "active" : ""}" data-task-id="${task.taskId}">
                <span class="task-title">${escapeHtml(task.topic.normalized || "Untitled Task")}</span>
                <span class="task-meta">
                  <span class="status-dot ${task.status}"></span>
                  ${formatStatus(task.status)}
                </span>
              </button>
            `
          )
          .join("")}
      </div>
    </aside>
  `;
}

function renderAgentPanel(task) {
  const defaultPrompt = "分析今天最重要的 AI 技术进展，并生成一篇公众号文章和小红书版本。";

  return `
    <section class="agent-panel">
      <div class="panel-header">
        <div>
          <span class="eyebrow">Core Agent</span>
          <h2>Execution</h2>
        </div>
        <span class="run-state">${task ? formatStatus(task.status) : "Idle"}</span>
      </div>

      <form class="goal-form" data-action="run-task">
        <textarea name="goal" rows="4" placeholder="输入内容目标">${task?.userInput || defaultPrompt}</textarea>
        <button ${store.isRunning ? "disabled" : ""} type="submit">Run Workflow</button>
      </form>

      <div class="runtime-grid">
        <div>
          <span>Current Node</span>
          <strong>${task?.currentNode || "None"}</strong>
        </div>
        <div>
          <span>Research</span>
          <strong>${task?.loops.researchRound || 0}/3</strong>
        </div>
        <div>
          <span>Review</span>
          <strong>${task?.loops.reviewRound || 0}/2</strong>
        </div>
        <div>
          <span>Publish</span>
          <strong>${task?.loops.publishRetry || 0}/2</strong>
        </div>
      </div>

      <div class="log-stream">
        ${(task?.logs || [])
          .map(
            (log) => `
              <div class="log-line ${log.level}">
                <span>${formatTime(log.timestamp)}</span>
                <p>${escapeHtml(log.message)}</p>
              </div>
            `
          )
          .join("") || `<div class="empty">等待任务启动</div>`}
      </div>

      <form class="revision-form" data-action="revise">
        <input name="instruction" placeholder="用自然语言修改文档，例如：更适合小红书、加一个强观点标题" ${!task?.draft.markdown ? "disabled" : ""} />
        <button ${!task?.draft.markdown || store.isRunning ? "disabled" : ""} type="submit">Revise</button>
      </form>
    </section>
  `;
}

function renderDocumentPanel(task) {
  const variants = task?.draft.variants || [];
  const activeVariant = variants.find((variant) => variant.platform === store.selectedVariant) || variants[0];
  const markdown = activeVariant?.markdown || task?.draft.markdown || "";
  const html = markdown ? renderMarkdown(markdown) : "";

  return `
    <section class="document-panel">
      <div class="panel-header">
        <div>
          <span class="eyebrow">Document</span>
          <h2>Preview</h2>
        </div>
        <div class="doc-actions">
          <button data-action="copy" ${!markdown ? "disabled" : ""}>Copy</button>
          <button data-action="export-md" ${!markdown ? "disabled" : ""}>MD</button>
          <button data-action="export-html" ${!markdown ? "disabled" : ""}>HTML</button>
          <button class="primary" data-action="publish" ${!task || store.isRunning || !markdown ? "disabled" : ""}>Publish Draft</button>
        </div>
      </div>

      <div class="variant-tabs">
        ${variants
          .map(
            (variant) => `
              <button class="${activeVariant?.platform === variant.platform ? "active" : ""}" data-variant="${variant.platform}">
                ${platformLabel(variant.platform)}
              </button>
            `
          )
          .join("")}
      </div>

      <div class="doc-shell">
        <textarea class="markdown-editor" data-action="edit-doc" placeholder="Document will appear here...">${escapeHtml(markdown)}</textarea>
        <article class="markdown-preview">
          ${html || `<div class="empty">运行工作流后，这里会显示可编辑文档预览</div>`}
        </article>
      </div>

      <div class="publish-result">
        ${(task?.publishStatus.outputs || [])
          .map(
            (output) => `
              <div>
                <strong>${platformLabel(output.platform)}</strong>
                <span>${output.status}</span>
                ${output.fileName ? `<code>${escapeHtml(output.fileName)}</code>` : ""}
              </div>
            `
          )
          .join("")}
      </div>
    </section>
  `;
}

function bindEvents() {
  document.querySelector("[data-action='new-task']")?.addEventListener("click", () => {
    store.activeTaskId = null;
    store.selectedVariant = "wechat";
    render();
  });

  document.querySelectorAll("[data-task-id]").forEach((button) => {
    button.addEventListener("click", () => {
      store.activeTaskId = button.dataset.taskId;
      store.selectedVariant = "wechat";
      render();
    });
  });

  document.querySelector("[data-action='run-task']")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (store.isRunning) return;
    const goal = new FormData(event.currentTarget).get("goal").toString().trim();
    if (!goal) return;

    const task = createTaskState(goal);
    store.activeTaskId = task.taskId;
    upsertTask(task);
    store.isRunning = true;
    render();

    const harness = new WorkflowHarness(
      {
        tools,
        publishers,
        renderMarkdown
      },
      (nextState) => {
        upsertTask(nextState);
        render();
      }
    );

    try {
      await harness.run(task);
    } finally {
      store.isRunning = false;
      persistTasks();
      render();
    }
  });

  document.querySelector("[data-action='revise']")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const task = getActiveTask();
    if (!task || store.isRunning) return;
    const instruction = new FormData(event.currentTarget).get("instruction").toString().trim();
    if (!instruction) return;

    store.isRunning = true;
    const harness = new WorkflowHarness(
      {
        tools,
        publishers,
        renderMarkdown
      },
      (nextState) => {
        upsertTask(nextState);
        render();
      }
    );

    try {
      await harness.applyNaturalLanguageRevision(task, instruction);
    } finally {
      store.isRunning = false;
      persistTasks();
      render();
    }
  });

  document.querySelector("[data-action='publish']")?.addEventListener("click", async () => {
    const task = getActiveTask();
    if (!task || store.isRunning) return;
    store.isRunning = true;
    render();

    const harness = new WorkflowHarness(
      {
        tools,
        publishers,
        renderMarkdown
      },
      (nextState) => {
        upsertTask(nextState);
        render();
      }
    );

    try {
      await harness.runPublishLoop(task);
    } finally {
      store.isRunning = false;
      persistTasks();
      render();
    }
  });

  document.querySelector("[data-action='copy']")?.addEventListener("click", async () => {
    const markdown = getCurrentMarkdown();
    if (markdown) await navigator.clipboard.writeText(markdown);
  });

  document.querySelector("[data-action='export-md']")?.addEventListener("click", () => {
    const task = getActiveTask();
    const markdown = getCurrentMarkdown();
    if (task && markdown) exportBlob(`${safeFileName(task.outline.title || "content-x-draft")}.md`, markdown, "text/markdown");
  });

  document.querySelector("[data-action='export-html']")?.addEventListener("click", () => {
    const task = getActiveTask();
    const markdown = getCurrentMarkdown();
    if (task && markdown) {
      const html = `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(task.outline.title)}</title></head><body>${renderMarkdown(markdown)}</body></html>`;
      exportBlob(`${safeFileName(task.outline.title || "content-x-draft")}.html`, html, "text/html");
    }
  });

  document.querySelectorAll("[data-variant]").forEach((button) => {
    button.addEventListener("click", () => {
      store.selectedVariant = button.dataset.variant;
      render();
    });
  });

  document.querySelector("[data-action='edit-doc']")?.addEventListener("input", (event) => {
    const task = getActiveTask();
    if (!task) return;
    const markdown = event.target.value;
    const variants = task.draft.variants.map((variant) =>
      variant.platform === store.selectedVariant ? { ...variant, markdown } : variant
    );
    upsertTask({
      ...task,
      draft: {
        ...task.draft,
        markdown: store.selectedVariant === "wechat" ? markdown : task.draft.markdown,
        variants
      },
      status: WORKFLOW_STATUS.WAITING_APPROVAL,
      updatedAt: new Date().toISOString()
    });
    persistTasks();
    document.querySelector(".markdown-preview").innerHTML = renderMarkdown(markdown);
  });
}

function getCurrentMarkdown() {
  const task = getActiveTask();
  if (!task) return "";
  const variant = task.draft.variants.find((item) => item.platform === store.selectedVariant);
  return variant?.markdown || task.draft.markdown;
}

function getActiveTask() {
  return store.tasks.find((task) => task.taskId === store.activeTaskId) || null;
}

function upsertTask(task) {
  const index = store.tasks.findIndex((item) => item.taskId === task.taskId);
  if (index >= 0) {
    store.tasks[index] = task;
  } else {
    store.tasks.unshift(task);
  }
  persistTasks();
}

function loadTasks() {
  try {
    return JSON.parse(localStorage.getItem("content-x-tasks") || "[]");
  } catch {
    return [];
  }
}

function persistTasks() {
  localStorage.setItem("content-x-tasks", JSON.stringify(store.tasks.slice(0, 20)));
}

function formatStatus(status) {
  const labels = {
    idle: "Idle",
    running: "Running",
    waiting_approval: "Waiting Approval",
    ready: "Ready",
    publishing: "Publishing",
    done: "Done",
    failed: "Failed"
  };
  return labels[status] || status;
}

function platformLabel(platform) {
  const labels = {
    wechat: "公众号",
    xiaohongshu: "小红书",
    markdown: "Markdown",
    html: "HTML",
    x: "X",
    linkedin: "LinkedIn"
  };
  return labels[platform] || platform;
}

function formatTime(value) {
  return new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  }).format(new Date(value));
}

function safeFileName(value) {
  return value.replace(/[^\w\u4e00-\u9fa5-]+/g, "-").replace(/^-+|-+$/g, "") || "content-x-draft";
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
