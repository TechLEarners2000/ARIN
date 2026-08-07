const DEFAULT_TIMEOUT = 15000;

export interface CloudAiModel {
  id: string;
  ownedBy?: string;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionResponse {
  id: string;
  choices: {
    index: number;
    message: { role: string; content: string };
    finish_reason: string;
  }[];
  model: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface ConnectionTestResult {
  success: boolean;
  baseUrl: string;
  message: string;
  models?: CloudAiModel[];
}

function normalizeBaseUrl(raw: string): string {
  let url = raw.trim();
  url = url.replace(/\/+$/, '');
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`;
  }
  // Strip a trailing /v1 or /v1/chat/completions etc. — we append /v1/... ourselves.
  url = url.replace(/\/v1(\/.*)?$/, '');
  return url;
}

async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs: number = DEFAULT_TIMEOUT
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request timed out after ${timeoutMs}ms: ${url}`);
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

function authHeaders(apiKey: string): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
  if (apiKey.trim()) {
    headers.Authorization = `Bearer ${apiKey.trim()}`;
  }
  return headers;
}

/**
 * Fetch the model list from an OpenAI-compatible provider's /v1/models endpoint.
 * Works with OpenAI, OpenRouter, Groq, Together, Fireworks, DeepSeek, Mistral, etc.
 */
export async function fetchModels(rawBaseUrl: string, apiKey: string): Promise<CloudAiModel[]> {
  const baseUrl = normalizeBaseUrl(rawBaseUrl);

  const res = await fetchWithTimeout(
    `${baseUrl}/v1/models`,
    { method: 'GET', headers: authHeaders(apiKey) },
    10000
  );

  if (!res.ok) {
    const errBody = await res.text().catch(() => 'No response body');
    if (res.status === 401 || res.status === 403) {
      throw new Error(`Auth rejected (HTTP ${res.status}). Check the API key. ${errBody}`);
    }
    throw new Error(`Failed to fetch models: HTTP ${res.status}: ${errBody}`);
  }

  const data = await res.json();
  const models: CloudAiModel[] = [];

  if (Array.isArray(data)) {
    for (const m of data) {
      const id = typeof m === 'string' ? m : m.id || m.name;
      if (id) models.push({ id, ownedBy: m?.owned_by });
    }
  } else if (data?.data && Array.isArray(data.data)) {
    for (const m of data.data) {
      if (m.id) models.push({ id: m.id, ownedBy: m.owned_by });
    }
  }

  models.sort((a, b) => a.id.localeCompare(b.id));
  return models;
}

/**
 * Validate provider URL + API key by attempting to list models.
 */
export async function testConnection(
  rawBaseUrl: string,
  apiKey: string
): Promise<ConnectionTestResult> {
  const baseUrl = normalizeBaseUrl(rawBaseUrl);

  if (!rawBaseUrl.trim()) {
    return { success: false, baseUrl, message: 'Provider URL is required.' };
  }

  try {
    const models = await fetchModels(rawBaseUrl, apiKey);
    return {
      success: true,
      baseUrl,
      message: `Connected. ${models.length} model(s) available.`,
      models,
    };
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    return { success: false, baseUrl, message: errMsg };
  }
}

/**
 * Send a chat completion request to an OpenAI-compatible /v1/chat/completions endpoint.
 */
export async function sendChatCompletion(
  rawBaseUrl: string,
  apiKey: string,
  model: string,
  messages: ChatMessage[],
  options: {
    temperature?: number;
    maxTokens?: number;
    timeoutMs?: number;
  } = {}
): Promise<ChatCompletionResponse> {
  const baseUrl = normalizeBaseUrl(rawBaseUrl);
  const timeoutMs = options.timeoutMs ?? 30000;

  const res = await fetchWithTimeout(
    `${baseUrl}/v1/chat/completions`,
    {
      method: 'POST',
      headers: authHeaders(apiKey),
      body: JSON.stringify({
        model,
        messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? 2048,
        stream: false,
      }),
    },
    timeoutMs
  );

  if (!res.ok) {
    const errBody = await res.text().catch(() => 'No response body');
    if (res.status === 401 || res.status === 403) {
      throw new Error(`Auth rejected (HTTP ${res.status}). Check the API key.`);
    }
    throw new Error(`HTTP ${res.status}: ${errBody}`);
  }

  return res.json();
}
