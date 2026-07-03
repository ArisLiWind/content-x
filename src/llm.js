export class ModelClient {
  constructor(config = {}) {
    this.config = config;
  }

  get configured() {
    return Boolean(this.config.apiKey && this.config.provider !== "local");
  }

  get providerLabel() {
    const labels = {
      deepseek: "DeepSeek",
      openai: "OpenAI Compatible",
      openclaw: "OpenClaw",
      local: "Local Mock"
    };
    return labels[this.config.provider] || this.config.provider || "Local Mock";
  }

  async chat({ system, messages, temperature = 0.7 }) {
    if (!this.configured) {
      return {
        ok: false,
        provider: this.providerLabel,
        error: "Model API is not configured."
      };
    }

    const url = `${normalizeBaseUrl(this.config.apiBaseUrl)}/chat/completions`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: this.config.model,
        temperature,
        messages: [
          ...(system ? [{ role: "system", content: system }] : []),
          ...messages
        ]
      })
    });

    if (!response.ok) {
      return {
        ok: false,
        provider: this.providerLabel,
        error: `Model API failed: ${response.status}`
      };
    }

    const data = await response.json();
    return {
      ok: true,
      provider: this.providerLabel,
      text: data.choices?.[0]?.message?.content || ""
    };
  }
}

function normalizeBaseUrl(value) {
  return String(value || "").replace(/\/+$/, "") || "https://api.deepseek.com";
}
