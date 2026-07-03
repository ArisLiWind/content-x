const gatewayUrl = process.env.OPENCLAW_URL || "http://127.0.0.1:18789";
const mcpEndpoint = process.env.CONTENT_X_MCP_ENDPOINT || "http://127.0.0.1:8790/mcp";

const results = [];

results.push(await checkUrl("OpenClaw Gateway", gatewayUrl));
results.push(await checkMcpEndpoint(mcpEndpoint));

for (const result of results) {
  const icon = result.ok ? "OK" : "FAIL";
  console.log(`${icon} ${result.name}: ${result.message}`);
}

if (results.some((result) => !result.ok)) process.exit(1);

async function checkUrl(name, url) {
  try {
    const response = await fetch(url, { method: "GET" });
    return {
      name,
      ok: response.status < 500,
      message: `${url} responded with ${response.status}`
    };
  } catch (error) {
    return {
      name,
      ok: false,
      message: `${url} is not reachable (${error.message})`
    };
  }
}

async function checkMcpEndpoint(url) {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "content-x-health",
        method: "tools/list",
        params: {}
      })
    });
    return {
      name: "OpenClaw MCP",
      ok: response.status < 500,
      message: `${url} responded with ${response.status}`
    };
  } catch (error) {
    return {
      name: "OpenClaw MCP",
      ok: false,
      message: `${url} is not reachable (${error.message})`
    };
  }
}
