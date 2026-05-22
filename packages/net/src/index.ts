import { emit } from '@batoi/uif-core';

export interface RequestOptions extends RequestInit {
  timeout?: number;
  parseAs?: 'auto' | 'json' | 'text' | 'response';
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

export async function request<T = unknown>(url: string, options: RequestOptions = {}): Promise<T> {
  const controller = new AbortController();
  const timeout = options.timeout ? window.setTimeout(() => controller.abort(), options.timeout) : undefined;
  let req: RequestOptions = { ...options, signal: controller.signal };

  for (const interceptor of requestInterceptors) {
    const next = await interceptor(url, req);
    if (next) req = next;
  }

  emit('uif:request', { url, options: req });
  try {
    let response = await fetch(url, req);
    for (const interceptor of responseInterceptors) {
      const next = await interceptor(response);
      if (next) response = next;
    }

    emit('uif:response', { url, response });
    const data = await parseResponse(response, req.parseAs);
    emit(response.ok ? 'uif:success' : 'uif:error', { url, response, data });

    if (!response.ok) {
      const error = new Error(`Request failed: ${response.status}`) as UIFRequestError;
      error.status = response.status;
      error.response = response;
      error.data = data;
      throw error;
    }

    return data as T;
  } catch (error) {
    emit('uif:error', { url, error });
    throw error;
  } finally {
    if (timeout) window.clearTimeout(timeout);
    emit('uif:complete', { url });
  }
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
  return request<T>(url, { ...options, method: options.method ?? 'POST', body: formData });
}
