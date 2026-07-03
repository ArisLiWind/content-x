const gatewayUrl = normalizeUrl(process.env.OPENCLAW_URL || "http://127.0.0.1:18789");

const results = [];
results.push(await checkGateway(gatewayUrl));
results.push(await checkChatCompletions(gatewayUrl));

for (const result of results) {
  const icon = result.ok ? "OK" : "FAIL";
  console.log(`${icon} ${result.name}: ${result.message}`);
}

if (results.some((result) => !result.ok)) process.exit(1);

async function checkGateway(url) {
  try {
    const response = await fetch(url, { method: "GET" });
    return {
      name: "OpenClaw Gateway",
      ok: response.status < 500,
      message: `${url} responded with ${response.status}`
    };
  } catch (error) {
    return {
      name: "OpenClaw Gateway",
      ok: false,
      message: `${url} is not reachable (${error.message})`
    };
  }
}

async function checkChatCompletions(url) {
  try {
    const response = await fetch(`${url}/v1/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "openclaw",
        messages: [{ role: "user", content: "Content X health check. Reply OK." }],
        stream: false
      })
    });

    return {
      name: "OpenClaw Chat",
      ok: response.status < 500,
      message: `${url}/v1/chat/completions responded with ${response.status}`
    };
  } catch (error) {
    return {
      name: "OpenClaw Chat",
      ok: false,
      message: `${url}/v1/chat/completions is not reachable (${error.message})`
    };
  }
}

function normalizeUrl(value) {
  return String(value || "").replace(/\/+$/, "");
}
