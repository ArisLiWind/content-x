const ACCOUNT_KEY = "content-x-account-session";
const BACKEND_KEY = "content-x-backend-config";

export const DEFAULT_ACCOUNT_SESSION = {
  loggedIn: true,
  email: "azalearedn@gmail.com",
  name: "创作者",
  plan: "Content X Pro"
};

export const DEFAULT_BACKEND_CONFIG = {
  provider: "deepseek",
  apiBaseUrl: "https://api.deepseek.com",
  apiKey: "",
  model: "deepseek-chat",
  openclawGatewayUrl: "http://127.0.0.1:18789",
  openclawApiKey: "",
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
  return normalizeBackendConfig(readJson(BACKEND_KEY, DEFAULT_BACKEND_CONFIG));
}

export function saveBackendConfig(config) {
  const nextConfig = normalizeBackendConfig(config);
  localStorage.setItem(BACKEND_KEY, JSON.stringify(nextConfig));
  return nextConfig;
}

function normalizeBackendConfig(config = {}) {
  return {
    ...DEFAULT_BACKEND_CONFIG,
    apiKey: String(config.apiKey || "").trim()
  };
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
