import { emit } from '@batoi/uif-core';

const requestInterceptors = [];
const responseInterceptors = [];

export const useRequestInterceptor = (fn) => requestInterceptors.push(fn);
export const useResponseInterceptor = (fn) => responseInterceptors.push(fn);

export async function request(url, options = {}) {
  const controller = new AbortController();
  const timeout = options.timeout ? setTimeout(() => controller.abort(), options.timeout) : null;
  const req = { ...options, signal: controller.signal };
  requestInterceptors.forEach((fn) => fn(url, req));
  emit('uif:request', { url, options: req });
  try {
    const response = await fetch(url, req);
    responseInterceptors.forEach((fn) => fn(response));
    emit('uif:response', { url, response });
    const contentType = response.headers.get('content-type') || '';
    const data = contentType.includes('application/json') ? await response.json() : await response.text();
    emit(response.ok ? 'uif:success' : 'uif:error', { url, response, data });
    if (!response.ok) throw new Error(`Request failed: ${response.status}`);
    return data;
  } finally {
    if (timeout) clearTimeout(timeout);
    emit('uif:complete', { url });
  }
}

export const get = (url, options = {}) => request(url, { ...options, method: 'GET' });
export const post = (url, data, options = {}) => {
  const body = data instanceof FormData ? data : JSON.stringify(data);
  const headers = data instanceof FormData ? options.headers : { 'content-type': 'application/json', ...(options.headers ?? {}) };
  return request(url, { ...options, method: 'POST', body, headers });
};
export const submitForm = (formEl, options = {}) => request(formEl.action, { ...options, method: (formEl.method || 'POST').toUpperCase(), body: new FormData(formEl) });
export const upload = (url, formData, options = {}) => request(url, { ...options, method: 'POST', body: formData });
