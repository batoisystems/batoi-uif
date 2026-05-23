import { emit } from '@batoi/uif-core';

export interface RequestOptions extends RequestInit {
  timeout?: number;
  parseAs?: 'auto' | 'json' | 'text' | 'response';
  key?: string;
  dedupe?: boolean;
  retries?: number;
  retryDelay?: number;
  csrfToken?: string;
  csrfHeader?: string;
  onUploadProgress?: (loaded: number, total: number) => void;
}

export interface UIFRequestError extends Error {
  status?: number;
  response?: Response;
  data?: unknown;
}

type RequestInterceptor = (url: string, options: RequestOptions) => void | RequestOptions | Promise<void | RequestOptions>;
type ResponseInterceptor = (response: Response) => void | Response | Promise<void | Response>;

const requestInterceptors: RequestInterceptor[] = [];
const responseInterceptors: ResponseInterceptor[] = [];
const controllers = new Map<string, AbortController>();
const pending = new Map<string, Promise<unknown>>();

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
  controllers.set(key, controller);
  const timeout = options.timeout ? window.setTimeout(() => controller.abort(), options.timeout) : undefined;
  let req: RequestOptions = { ...options, headers: withCsrf(options.headers, options), signal: controller.signal };

  const runner = async (): Promise<T> => {
    for (const interceptor of requestInterceptors) {
      const next = await interceptor(url, req);
      if (next) req = next;
    }

    emit('uif:request', { url, options: req });
    const attempts = Math.max(0, req.retries ?? 0) + 1;
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
        if (attempt >= attempts || controller.signal.aborted) break;
        await delay(req.retryDelay ?? 250 * attempt);
      }
    }
    emit('uif:error', { url, error: lastError });
    throw lastError;
  };

  const promise = runner().finally(() => {
    if (timeout) window.clearTimeout(timeout);
    controllers.delete(key);
    pending.delete(key);
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
      const headers = withCsrf(options.headers, options);
      if (headers && !(headers instanceof Headers) && !Array.isArray(headers)) {
        Object.entries(headers).forEach(([name, value]) => xhr.setRequestHeader(name, String(value)));
      }
      xhr.upload.addEventListener('progress', (event) => options.onUploadProgress?.(event.loaded, event.total));
      xhr.addEventListener('load', () => {
        try {
          resolve(JSON.parse(xhr.responseText || 'null') as T);
        } catch {
          resolve(xhr.responseText as T);
        }
      });
      xhr.addEventListener('error', () => reject(new Error('Upload failed')));
      xhr.send(formData);
    });
  }
  return request<T>(url, { ...options, method: options.method ?? 'POST', body: formData });
}
