import { CONTENT_X_BACKEND } from "./config.mjs";

export async function checkOpenClawGateway({ timeoutMs = 3500 } = {}) {
  const gatewayUrl = normalizeUrl(CONTENT_X_BACKEND.openclaw.gatewayUrl);
  const gateway = await fetchWithTimeout(gatewayUrl, { method: "GET" }, timeoutMs);
  const chat = await fetchWithTimeout(
    `${gatewayUrl}/v1/chat/completions`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: CONTENT_X_BACKEND.openclaw.model,
        messages: [{ role: "user", content: "Content X health check. Reply OK." }],
        stream: false
      })
    },
    timeoutMs
  );

  return {
    gatewayUrl,
    gateway,
    chat,
    ok: gateway.ok && chat.ok
  };
}

export async function askOpenClaw(message, { timeoutMs = 30000 } = {}) {
  const gatewayUrl = normalizeUrl(CONTENT_X_BACKEND.openclaw.gatewayUrl);
  const response = await fetchWithTimeout(
    `${gatewayUrl}/v1/chat/completions`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: CONTENT_X_BACKEND.openclaw.model,
        messages: [
          {
            role: "system",
            content: "You are Content X's OpenClaw-powered backend research agent."
          },
          {
            role: "user",
            content: message
          }
        ],
        stream: false
      })
    },
    timeoutMs
  );

  if (!response.ok) return response;
  return {
    ...response,
    text: response.data?.choices?.[0]?.message?.content || response.data?.response || ""
  };
}

async function fetchWithTimeout(url, options, timeoutMs) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    const text = await response.text();
    let data = null;

    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }

    return {
      ok: response.status < 500,
      status: response.status,
      data
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      error: error.name === "AbortError" ? "Request timed out." : error.message
    };
  } finally {
    clearTimeout(timeout);
  }
}

function normalizeUrl(value) {
  return String(value || "").replace(/\/+$/, "") || "http://127.0.0.1:18789";
}
