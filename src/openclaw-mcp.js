export class OpenClawMcpClient {
  constructor({ endpoint = "http://127.0.0.1:8790/mcp", timeoutMs = 2500 } = {}) {
    this.endpoint = endpoint;
    this.timeoutMs = timeoutMs;
  }

  get enabled() {
    return Boolean(this.endpoint);
  }

  async callTool(name, args = {}) {
    if (!this.enabled) {
      return { ok: false, error: "MCP endpoint is not configured." };
    }

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
      let response;

      try {
        response = await fetch(this.endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json, text/event-stream"
          },
          signal: controller.signal,
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: crypto.randomUUID(),
            method: "tools/call",
            params: {
              name,
              arguments: args
            }
          })
        });
      } finally {
        clearTimeout(timeout);
      }

      if (!response.ok) {
        return { ok: false, error: `MCP call failed: ${response.status}` };
      }

      const payload = await readMcpPayload(response);
      return { ok: true, data: payload.result || payload };
    } catch (error) {
      return { ok: false, error: error.name === "AbortError" ? "MCP call timed out." : error.message };
    }
  }
}

export function extractOpenClawText(data) {
  const content = data?.content || data?.data?.content || [];
  if (Array.isArray(content)) {
    return content
      .map((item) => item.text || item.content || "")
      .filter(Boolean)
      .join("\n")
      .trim();
  }
  return String(data?.text || data?.message || data?.result || "").trim();
}

async function readMcpPayload(response) {
  const text = await response.text();
  if (text.trim().startsWith("event:") || text.includes("\ndata:")) {
    const dataLine = text
      .split("\n")
      .find((line) => line.startsWith("data:"));
    return JSON.parse(dataLine?.slice(5).trim() || "{}");
  }
  return JSON.parse(text || "{}");
}
