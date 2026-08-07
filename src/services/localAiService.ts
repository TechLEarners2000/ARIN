const DEFAULT_TIMEOUT = 15000;

export interface LocalAiModel {
  id: string;
  name?: string;
  details?: Record<string, unknown>;
}

export interface ServerInfo {
  server?: string;
  version?: string;
  availableModels?: string[];
  endpoints?: string[];
  probeErrors?: Record<string, string>;
  hasAnyResponse?: boolean;
  raw?: Record<string, unknown>;
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
  serverInfo?: ServerInfo;
  models?: LocalAiModel[];
}

function normalizeHost(raw: string): string {
  let host = raw.trim();
  host = host.replace(/\/+$/, '');
  if (host.startsWith('//')) {
    host = `http:${host}`;
  } else if (!host.startsWith('http://') && !host.startsWith('https://')) {
    host = `http://${host}`;
  }
  return host;
}

async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs: number = DEFAULT_TIMEOUT
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    return response;
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request timed out after ${timeoutMs}ms: ${url}`);
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

function addModel(info: ServerInfo, id: string): void {
  if (!id) return;
  const current = info.availableModels ?? [];
  if (!current.includes(id)) {
    info.availableModels = [...current, id];
  }
}

function addEndpoint(info: ServerInfo, endpoint: string): void {
  const current = info.endpoints ?? [];
  if (!current.includes(endpoint)) {
    info.endpoints = [...current, endpoint];
  }
}

function recordProbeError(info: ServerInfo, endpoint: string, error: unknown): void {
  const msg = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
  info.probeErrors = { ...(info.probeErrors ?? {}), [endpoint]: msg };
}

function recordResponse(info: ServerInfo): void {
  info.hasAnyResponse = true;
}

/**
 * Attempt to discover server capabilities by probing multiple known endpoints
 * sequentially. Each probe is non-fatal and skipped on failure.
 */
export async function probeServerEndpoints(baseUrl: string): Promise<ServerInfo> {
  const info: ServerInfo = { raw: {} };

  // Probe 1: / (root) - Ollama returns "Ollama is running"
  try {
    const rootRes = await fetchWithTimeout(`${baseUrl}/`, {}, 5000);
    recordResponse(info);
    if (rootRes.ok) {
      addEndpoint(info, '/');
      const text = await rootRes.text().catch(() => '');
      if (text && /ollama/i.test(text)) {
        info.server = info.server || 'Ollama';
        info.raw = { ...info.raw, root: text };
      }
    }
  } catch (e) {
    recordProbeError(info, '/', e);
  }

  // Probe 2: /api/version - Ollama version
  try {
    const versionRes = await fetchWithTimeout(`${baseUrl}/api/version`, {}, 5000);
    recordResponse(info);
    if (versionRes.ok) {
      addEndpoint(info, '/api/version');
      const versionData = await versionRes.json().catch(() => null);
      if (versionData) {
        info.raw = { ...info.raw, apiVersion: versionData };
        if (versionData.version) {
          info.version = String(versionData.version);
        }
      }
    }
  } catch (e) {
    recordProbeError(info, '/api/version', e);
  }

  // Probe 3: /api/tags - Ollama native model list
  try {
    const tagsRes = await fetchWithTimeout(`${baseUrl}/api/tags`, {}, 5000);
    recordResponse(info);
    if (tagsRes.ok) {
      addEndpoint(info, '/api/tags');
      const tagsData = await tagsRes.json().catch(() => null);
      if (tagsData?.models && Array.isArray(tagsData.models)) {
        for (const m of tagsData.models) {
          addModel(info, m.name || m.model);
        }
      }
    }
  } catch (e) {
    recordProbeError(info, '/api/tags', e);
  }

  // Probe 4: /health
  try {
    const healthRes = await fetchWithTimeout(`${baseUrl}/health`, {}, 5000);
    recordResponse(info);
    if (healthRes.ok) {
      addEndpoint(info, '/health');
      const healthData = await healthRes.json().catch(() => null);
      if (healthData) {
        info.raw = { ...info.raw, health: healthData };
        if (healthData.server) {
          info.server = info.server || String(healthData.server);
        }
        if (healthData.version) {
          info.version = info.version || String(healthData.version);
        }
      }
    }
  } catch (e) {
    recordProbeError(info, '/health', e);
  }

  // Probe 5: /v1/models (OpenAI-compatible)
  try {
    const modelsRes = await fetchWithTimeout(`${baseUrl}/v1/models`, {}, 5000);
    recordResponse(info);
    if (modelsRes.ok) {
      addEndpoint(info, '/v1/models');
      const modelsData = await modelsRes.json().catch(() => null);
      if (modelsData) {
        info.raw = { ...info.raw, models: modelsData };

        if (Array.isArray(modelsData)) {
          for (const m of modelsData) {
            const id = typeof m === 'string' ? m : m.id || m.name;
            if (id) {
              addModel(info, id);
            }
          }
        } else if (modelsData?.data && Array.isArray(modelsData.data)) {
          for (const m of modelsData.data) {
            if (m.id) {
              addModel(info, m.id);
            }
          }
        }
      }
    }
  } catch (e) {
    recordProbeError(info, '/v1/models', e);
  }

  // Probe 6: /v1/model/info
  try {
    const modelInfoRes = await fetchWithTimeout(`${baseUrl}/v1/model/info`, {}, 5000);
    recordResponse(info);
    if (modelInfoRes.ok) {
      addEndpoint(info, '/v1/model/info');
      const modelInfoData = await modelInfoRes.json().catch(() => null);
      if (modelInfoData) {
        info.raw = { ...info.raw, modelInfo: modelInfoData };
        addModel(info, modelInfoData.model);
      }
    }
  } catch (e) {
    recordProbeError(info, '/v1/model/info', e);
  }

  // Probe 7: /props (llama.cpp style)
  try {
    const propsRes = await fetchWithTimeout(`${baseUrl}/props`, {}, 5000);
    recordResponse(info);
    if (propsRes.ok) {
      addEndpoint(info, '/props');
      const propsData = await propsRes.json().catch(() => null);
      if (propsData) {
        info.raw = { ...info.raw, props: propsData };
        addModel(info, propsData.default_model);
        if (propsData.model) {
          info.server = info.server || String(propsData.model);
        }
      }
    }
  } catch (e) {
    recordProbeError(info, '/props', e);
  }

  // Probe 8: /v1/config
  try {
    const configRes = await fetchWithTimeout(`${baseUrl}/v1/config`, {}, 5000);
    recordResponse(info);
    if (configRes.ok) {
      addEndpoint(info, '/v1/config');
      const configData = await configRes.json().catch(() => null);
      if (configData) {
        info.raw = { ...info.raw, config: configData };
        addModel(info, configData.model);
        if (configData.server) {
          info.server = info.server || String(configData.server);
        }
        if (configData.version) {
          info.version = info.version || String(configData.version);
        }
      }
    }
  } catch (e) {
    recordProbeError(info, '/v1/config', e);
  }

  return info;
}

/**
 * Full connection test: normalize host → probe endpoints sequentially →
 * validate at least one endpoint responded.
 */
export async function testConnection(rawHost: string): Promise<ConnectionTestResult> {
  const baseUrl = normalizeHost(rawHost);

  try {
    const serverInfo = await probeServerEndpoints(baseUrl);

    const hasResponse = (serverInfo.endpoints?.length ?? 0) > 0;
    const hasModels = (serverInfo.availableModels?.length ?? 0) > 0;

    if (hasResponse) {
      const parts: string[] = ['Connection successful.'];
      if (serverInfo.server) {
        parts.push(`Server: ${serverInfo.server}`);
      }
      if (serverInfo.version) {
        parts.push(`v${serverInfo.version}`);
      }
      if (hasModels) {
        parts.push(`${serverInfo.availableModels!.length} model(s) available.`);
      }
      parts.push(`Endpoints: ${serverInfo.endpoints!.join(', ')}`);

      const models: LocalAiModel[] = (serverInfo.availableModels ?? []).map((id) => ({ id }));

      return {
        success: true,
        baseUrl,
        message: parts.join(' '),
        serverInfo,
        models,
      };
    }

    // No endpoints responded — distinguish unreachable vs no-API
    const errors = serverInfo.probeErrors ?? {};
    const errorEntries = Object.entries(errors);
    const probePaths = ['/', '/api/version', '/api/tags', '/health', '/v1/models', '/v1/model/info', '/props', '/v1/config'];

    if (errorEntries.length === 0 || !serverInfo.hasAnyResponse) {
      // All probes threw network errors (unreachable / timeout / cleartext)
      const sampleError = errorEntries.length > 0 ? errorEntries[0][1] : 'Unknown network error';
      return {
        success: false,
        baseUrl,
        message: `Host unreachable or connection refused on ${baseUrl}. ${sampleError}. Verify device and server are on the same network, the server is bound to 0.0.0.0 (not 127.0.0.1), and the port is correct.`,
        serverInfo,
      };
    }

    // Got HTTP responses but no known API matched
    const errorSummary = errorEntries.map(([path, err]) => `${path} → ${err}`).join(', ');
    return {
      success: false,
      baseUrl,
      message: `Server responded but no compatible AI API found. Checked: ${probePaths.join(', ')}. Errors: ${errorSummary || 'all endpoints returned non-matching responses.'}`,
      serverInfo,
    };
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      baseUrl,
      message: `Connection failed: ${errMsg}`,
    };
  }
}

/**
 * Fetch only the model list from the server (OpenAI-compatible + Ollama native).
 */
export async function fetchModels(rawHost: string): Promise<LocalAiModel[]> {
  const baseUrl = normalizeHost(rawHost);
  const models: LocalAiModel[] = [];

  // Try OpenAI-compatible /v1/models first
  try {
    const modelsRes = await fetchWithTimeout(`${baseUrl}/v1/models`, {}, 10000);
    if (modelsRes.ok) {
      const data = await modelsRes.json();
      if (Array.isArray(data)) {
        for (const m of data) {
          models.push({ id: typeof m === 'string' ? m : m.id || m.name || 'unknown' });
        }
      } else if (data?.data && Array.isArray(data.data)) {
        for (const m of data.data) {
          models.push({ id: m.id || 'unknown' });
        }
      }
      return models;
    }
  } catch {
    // fall through to Ollama native
  }

  // Fallback: Ollama native /api/tags
  const tagsRes = await fetchWithTimeout(`${baseUrl}/api/tags`, {}, 10000);
  if (!tagsRes.ok) {
    throw new Error(`Failed to fetch models: HTTP ${tagsRes.status}`);
  }
  const tagsData = await tagsRes.json();
  if (tagsData?.models && Array.isArray(tagsData.models)) {
    for (const m of tagsData.models) {
      models.push({ id: m.name || m.model || 'unknown' });
    }
  }
  return models;
}

/**
 * Send a chat completion request. Tries OpenAI-compatible /v1/chat/completions,
 * falls back to Ollama native /api/chat on 404/405.
 */
export async function sendChatCompletion(
  rawHost: string,
  model: string,
  messages: ChatMessage[],
  options: {
    temperature?: number;
    maxTokens?: number;
    timeoutMs?: number;
  } = {}
): Promise<ChatCompletionResponse> {
  const baseUrl = normalizeHost(rawHost);
  const timeoutMs = options.timeoutMs ?? 30000;

  // Attempt 1: OpenAI-compatible
  try {
    const res = await fetchWithTimeout(
      `${baseUrl}/v1/chat/completions`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
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

    if (res.ok) {
      return res.json();
    }
    if (res.status !== 404 && res.status !== 405) {
      const errBody = await res.text().catch(() => 'No response body');
      throw new Error(`HTTP ${res.status}: ${errBody}`);
    }
  } catch (error: unknown) {
    if (error instanceof Error && /HTTP \d+/.test(error.message)) {
      // Non-fallback status errors should surface to the user
      if (!/HTTP (404|405)/.test(error.message)) {
        throw error;
      }
    } else if (!(error instanceof Error) || error.name === 'AbortError') {
      throw error;
    }
  }

  // Attempt 2: Ollama native /api/chat
  const nativeRes = await fetchWithTimeout(
    `${baseUrl}/api/chat`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        stream: false,
        options: {
          temperature: options.temperature ?? 0.7,
          num_predict: options.maxTokens ?? 2048,
        },
      }),
    },
    timeoutMs
  );

  if (!nativeRes.ok) {
    const errBody = await nativeRes.text().catch(() => 'No response body');
    throw new Error(`Ollama /api/chat HTTP ${nativeRes.status}: ${errBody}`);
  }

  const nativeData = await nativeRes.json();

  const response: ChatCompletionResponse = {
    id: nativeData.id || `ollama-${Date.now()}`,
    choices: [
      {
        index: 0,
        message: {
          role: nativeData.message?.role || 'assistant',
          content: nativeData.message?.content || '',
        },
        finish_reason: nativeData.done ? 'stop' : 'length',
      },
    ],
    model: nativeData.model || model,
  };

  return response;
}
