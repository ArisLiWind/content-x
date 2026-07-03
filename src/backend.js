const ACCOUNT_KEY = "content-x-account-session";
const BACKEND_KEY = "content-x-backend-config";

export const DEFAULT_ACCOUNT_SESSION = {
  loggedIn: true,
  email: "azalearedn@gmail.com",
  name: "创作者",
  plan: "Content X Pro"
};

export const DEFAULT_BACKEND_CONFIG = {
  provider: "local",
  apiBaseUrl: "https://api.deepseek.com",
  apiKey: "",
  model: "deepseek-chat",
  openclawGatewayUrl: "http://127.0.0.1:18789",
  openclawApiKey: "",
  mcpEndpoint: "",
  memoryNamespace: "content-x-memory"
};

export function loadAccountSession() {
  return readJson(ACCOUNT_KEY, DEFAULT_ACCOUNT_SESSION);
}

export function saveAccountSession(session) {
  const nextSession = {
    ...DEFAULT_ACCOUNT_SESSION,
    ...session,
    email: String(session.email || DEFAULT_ACCOUNT_SESSION.email).trim()
  };
  localStorage.setItem(ACCOUNT_KEY, JSON.stringify(nextSession));
  return nextSession;
}

export function clearAccountSession() {
  const session = {
    ...DEFAULT_ACCOUNT_SESSION,
    loggedIn: false,
    email: ""
  };
  localStorage.setItem(ACCOUNT_KEY, JSON.stringify(session));
  return session;
}

export function loadBackendConfig() {
  return readJson(BACKEND_KEY, DEFAULT_BACKEND_CONFIG);
}

export function saveBackendConfig(config) {
  const nextConfig = {
    ...DEFAULT_BACKEND_CONFIG,
    ...config,
    provider: String(config.provider || DEFAULT_BACKEND_CONFIG.provider).trim(),
    apiBaseUrl: String(config.apiBaseUrl || DEFAULT_BACKEND_CONFIG.apiBaseUrl).trim(),
    apiKey: String(config.apiKey || "").trim(),
    model: String(config.model || DEFAULT_BACKEND_CONFIG.model).trim(),
    openclawGatewayUrl: String(config.openclawGatewayUrl || "").trim(),
    openclawApiKey: String(config.openclawApiKey || "").trim(),
    mcpEndpoint: String(config.mcpEndpoint || "").trim(),
    memoryNamespace: String(config.memoryNamespace || DEFAULT_BACKEND_CONFIG.memoryNamespace).trim()
  };
  localStorage.setItem(BACKEND_KEY, JSON.stringify(nextConfig));
  return nextConfig;
}

function readJson(key, fallback) {
  try {
    return {
      ...fallback,
      ...JSON.parse(localStorage.getItem(key) || "{}")
    };
  } catch {
    return fallback;
  }
}
