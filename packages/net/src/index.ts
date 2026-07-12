import { emit } from '@batoi/uif-core';

export interface RequestOptions extends RequestInit {
  timeout?: number;
  parseAs?: 'auto' | 'json' | 'text' | 'response';
  key?: string;
  dedupe?: boolean;
  retries?: number;
  retryDelay?: number;
  idempotent?: boolean;
  csrfToken?: string;
  csrfHeader?: string;
  onUploadProgress?: (loaded: number, total: number) => void;
}

export interface UIFRequestError extends Error {
  status?: number;
  response?: Response;
  data?: unknown;
}

export type ConnectorType = 'api' | 'json' | 'csv' | 'static' | 'spreadsheet' | 'google-sheet';
export type ConnectorMode = 'readonly' | 'readwrite';

export interface DataConnector<T = unknown> {
  type: ConnectorType;
  name?: string;
  mode?: ConnectorMode;
  src?: string;
  method?: string;
  headers?: HeadersInit;
  data?: T;
  timeout?: number;
  refreshInterval?: number;
  transform?: (value: unknown) => T | Promise<T>;
}

export interface ConnectorBindingOptions extends RequestOptions {
  onError?: (error: unknown) => void;
}

type RequestInterceptor = (url: string, options: RequestOptions) => void | RequestOptions | Promise<void | RequestOptions>;
type ResponseInterceptor = (response: Response) => void | Response | Promise<void | Response>;

const requestInterceptors: RequestInterceptor[] = [];
const responseInterceptors: ResponseInterceptor[] = [];
const controllers = new Map<string, AbortController>();
const pending = new Map<string, Promise<unknown>>();
let connectorSequence = 0;

export function useRequestInterceptor(fn: RequestInterceptor): () => void {
  requestInterceptors.push(fn);
  return () => requestInterceptors.splice(requestInterceptors.indexOf(fn), 1);
}

export function useResponseInterceptor(fn: ResponseInterceptor): () => void {
  responseInterceptors.push(fn);
  return () => responseInterceptors.splice(responseInterceptors.indexOf(fn), 1);
}

async function parseResponse(response: Response, parseAs: RequestOptions['parseAs']): Promise<unknown> {
  if (parseAs === 'response') return response;
  const contentType = response.headers.get('content-type') || '';
  if (parseAs === 'json' || (parseAs !== 'text' && contentType.includes('application/json'))) {
    return response.status === 204 ? null : response.json();
  }
  return response.text();
}

function canRetry(method: string, options: RequestOptions): boolean {
  return options.idempotent === true || ['GET', 'HEAD', 'OPTIONS'].includes(method);
}

function isRetryableError(error: unknown): boolean {
  if (error instanceof DOMException && error.name === 'AbortError') return false;
  const status = (error as UIFRequestError | undefined)?.status;
  return status === undefined || status === 408 || status === 429 || status >= 500;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function requestKey(url: string, options: RequestOptions): string {
  return options.key || `${options.method || 'GET'} ${url}`;
}

export function cancelRequest(key: string): void {
  controllers.get(key)?.abort();
  controllers.delete(key);
  pending.delete(key);
}

function withCsrf(headers: HeadersInit | undefined, options: RequestOptions): HeadersInit | undefined {
  if (!options.csrfToken) return headers;
  return { ...(headers ?? {}), [options.csrfHeader || 'x-csrf-token']: options.csrfToken };
}

export async function request<T = unknown>(url: string, options: RequestOptions = {}): Promise<T> {
  const key = requestKey(url, options);
  if (options.dedupe && pending.has(key)) return pending.get(key) as Promise<T>;
  cancelRequest(key);
  const controller = new AbortController();
  const externalSignal = options.signal;
  const abortFromExternal = () => controller.abort(externalSignal?.reason);
  if (externalSignal?.aborted) abortFromExternal();
  else externalSignal?.addEventListener('abort', abortFromExternal, { once: true });
  controllers.set(key, controller);
  const timeout = options.timeout ? window.setTimeout(() => controller.abort(), options.timeout) : undefined;
  let req: RequestOptions = { ...options, headers: withCsrf(options.headers, options), signal: controller.signal };

  const runner = async (): Promise<T> => {
    for (const interceptor of requestInterceptors) {
      const next = await interceptor(url, req);
      if (next) req = { ...next, signal: controller.signal };
    }

    emit('uif:request', { url, options: req });
    const method = String(req.method ?? 'GET').toUpperCase();
    const attempts = (canRetry(method, req) ? Math.max(0, Math.min(10, Math.floor(req.retries ?? 0))) : 0) + 1;
    let lastError: unknown;
    for (let attempt = 1; attempt <= attempts; attempt += 1) {
      try {
        let response = await fetch(url, req);
        for (const interceptor of responseInterceptors) {
          const next = await interceptor(response);
          if (next) response = next;
        }

        emit('uif:response', { url, response, attempt });
        const data = await parseResponse(response, req.parseAs);
        emit(response.ok ? 'uif:success' : 'uif:error', { url, response, data, attempt });

        if (!response.ok) {
          const error = new Error(`Request failed: ${response.status}`) as UIFRequestError;
          error.status = response.status;
          error.response = response;
          error.data = data;
          throw error;
        }

        return data as T;
      } catch (error) {
        lastError = error;
        if (attempt >= attempts || controller.signal.aborted || !isRetryableError(error)) break;
        await delay(req.retryDelay ?? 250 * attempt);
      }
    }
    emit('uif:error', { url, error: lastError });
    throw lastError;
  };

  const promise = runner().finally(() => {
    if (timeout) window.clearTimeout(timeout);
    if (controllers.get(key) === controller) controllers.delete(key);
    if (pending.get(key) === promise) pending.delete(key);
    externalSignal?.removeEventListener('abort', abortFromExternal);
    emit('uif:complete', { url, key });
  });
  pending.set(key, promise);
  return promise;
}

export function get<T = unknown>(url: string, options: RequestOptions = {}): Promise<T> {
  return request<T>(url, { ...options, method: 'GET' });
}

export function post<T = unknown>(url: string, data?: unknown, options: RequestOptions = {}): Promise<T> {
  const isFormData = data instanceof FormData;
  const headers = isFormData ? options.headers : { 'content-type': 'application/json', ...(options.headers ?? {}) };
  const body = isFormData ? data : JSON.stringify(data ?? {});
  return request<T>(url, { ...options, method: 'POST', body, headers });
}

export function submitForm<T = unknown>(formEl: HTMLFormElement, options: RequestOptions = {}): Promise<T> {
  const url = formEl.dataset.uifSrc || formEl.action || window.location.href;
  const method = (formEl.dataset.uifMethod || formEl.method || 'POST').toUpperCase();
  return request<T>(url, { ...options, method, body: new FormData(formEl) });
}

export function upload<T = unknown>(url: string, formData: FormData, options: RequestOptions = {}): Promise<T> {
  if (options.onUploadProgress) {
    return new Promise<T>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open(options.method ?? 'POST', url);
      xhr.timeout = Math.max(0, options.timeout ?? 0);
      xhr.withCredentials = options.credentials === 'include';
      const headers = withCsrf(options.headers, options);
      new Headers(headers).forEach((value, name) => xhr.setRequestHeader(name, value));
      const abort = () => xhr.abort();
      const cleanup = () => options.signal?.removeEventListener('abort', abort);
      xhr.upload.addEventListener('progress', (event) => options.onUploadProgress?.(event.loaded, event.total));
      xhr.addEventListener('load', () => {
        cleanup();
        let data: unknown;
        try {
          data = JSON.parse(xhr.responseText || 'null');
        } catch {
          data = xhr.responseText;
        }
        if (xhr.status >= 200 && xhr.status < 300) resolve(data as T);
        else {
          const error = new Error(`Upload failed: ${xhr.status}`) as UIFRequestError;
          error.status = xhr.status;
          error.data = data;
          reject(error);
        }
      });
      xhr.addEventListener('error', () => { cleanup(); reject(new Error('Upload failed')); });
      xhr.addEventListener('timeout', () => { cleanup(); reject(new DOMException('Upload timed out', 'TimeoutError')); });
      xhr.addEventListener('abort', () => { cleanup(); reject(new DOMException('Upload aborted', 'AbortError')); });
      if (options.signal?.aborted) {
        reject(new DOMException('Upload aborted', 'AbortError'));
        return;
      }
      options.signal?.addEventListener('abort', abort, { once: true });
      xhr.send(formData);
    });
  }
  return request<T>(url, { ...options, method: options.method ?? 'POST', body: formData });
}

export function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];
    if (char === '"' && quoted && next === '"') {
      cell += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === ',' && !quoted) {
      row.push(cell);
      cell = '';
    } else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && next === '\n') index += 1;
      row.push(cell);
      if (row.some((value) => value !== '')) rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += char;
    }
  }

  row.push(cell);
  if (row.some((value) => value !== '')) rows.push(row);
  return rows;
}

export function csvToObjects(text: string): Array<Record<string, string>> {
  const [head, ...rows] = parseCSV(text);
  if (!head) return [];
  return rows.map((row) =>
    head.reduce<Record<string, string>>((acc, key, index) => {
      acc[key] = row[index] ?? '';
      return acc;
    }, {}),
  );
}

export async function loadConnector<T = unknown>(connector: DataConnector<T>, options: RequestOptions = {}): Promise<T> {
  let value: unknown;
  if (connector.type === 'static') {
    value = connector.data;
  } else {
    if (!connector.src) throw new Error(`Connector source is required for ${connector.type}`);
    const parseAs = connector.type === 'csv' ? 'text' : 'auto';
    value = await request(connector.src, {
      ...options,
      method: connector.method ?? 'GET',
      headers: connector.headers ?? options.headers,
      timeout: connector.timeout ?? options.timeout,
      parseAs,
    });
    if (connector.type === 'csv') value = csvToObjects(String(value));
  }
  return connector.transform ? connector.transform(value) : (value as T);
}

export function bindConnector<T = unknown>(connector: DataConnector<T>, handler: (value: T) => void | Promise<void>, options: ConnectorBindingOptions = {}): () => void {
  let stopped = false;
  let running = false;
  let timer: number | undefined;
  const key = options.key ?? `connector:${++connectorSequence}`;
  const load = async () => {
    if (stopped || running) return;
    running = true;
    try {
      const value = await loadConnector(connector, { ...options, key });
      if (!stopped) await handler(value);
    } catch (error) {
      if (!stopped && !(error instanceof DOMException && error.name === 'AbortError')) {
        options.onError?.(error);
        window.dispatchEvent(new CustomEvent('uif:connector-error', { detail: { connector, error } }));
      }
    } finally {
      running = false;
    }
  };
  void load();
  if (connector.refreshInterval) timer = window.setInterval(() => void load(), Math.max(250, connector.refreshInterval));
  return () => {
    stopped = true;
    if (timer) window.clearInterval(timer);
    cancelRequest(key);
  };
}
