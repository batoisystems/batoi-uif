// src/index.ts
import { emit } from "@batoi/uif-core";
var requestInterceptors = [];
var responseInterceptors = [];
var controllers = /* @__PURE__ */ new Map();
var pending = /* @__PURE__ */ new Map();
function useRequestInterceptor(fn) {
  requestInterceptors.push(fn);
  return () => requestInterceptors.splice(requestInterceptors.indexOf(fn), 1);
}
function useResponseInterceptor(fn) {
  responseInterceptors.push(fn);
  return () => responseInterceptors.splice(responseInterceptors.indexOf(fn), 1);
}
async function parseResponse(response, parseAs) {
  if (parseAs === "response") return response;
  const contentType = response.headers.get("content-type") || "";
  if (parseAs === "json" || parseAs !== "text" && contentType.includes("application/json")) {
    return response.status === 204 ? null : response.json();
  }
  return response.text();
}
function delay(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}
function requestKey(url, options) {
  return options.key || `${options.method || "GET"} ${url}`;
}
function cancelRequest(key) {
  controllers.get(key)?.abort();
  controllers.delete(key);
  pending.delete(key);
}
function withCsrf(headers, options) {
  if (!options.csrfToken) return headers;
  return { ...headers ?? {}, [options.csrfHeader || "x-csrf-token"]: options.csrfToken };
}
async function request(url, options = {}) {
  const key = requestKey(url, options);
  if (options.dedupe && pending.has(key)) return pending.get(key);
  cancelRequest(key);
  const controller = new AbortController();
  controllers.set(key, controller);
  const timeout = options.timeout ? window.setTimeout(() => controller.abort(), options.timeout) : void 0;
  let req = { ...options, headers: withCsrf(options.headers, options), signal: controller.signal };
  const runner = async () => {
    for (const interceptor of requestInterceptors) {
      const next = await interceptor(url, req);
      if (next) req = next;
    }
    emit("uif:request", { url, options: req });
    const attempts = Math.max(0, req.retries ?? 0) + 1;
    let lastError;
    for (let attempt = 1; attempt <= attempts; attempt += 1) {
      try {
        let response = await fetch(url, req);
        for (const interceptor of responseInterceptors) {
          const next = await interceptor(response);
          if (next) response = next;
        }
        emit("uif:response", { url, response, attempt });
        const data = await parseResponse(response, req.parseAs);
        emit(response.ok ? "uif:success" : "uif:error", { url, response, data, attempt });
        if (!response.ok) {
          const error = new Error(`Request failed: ${response.status}`);
          error.status = response.status;
          error.response = response;
          error.data = data;
          throw error;
        }
        return data;
      } catch (error) {
        lastError = error;
        if (attempt >= attempts || controller.signal.aborted) break;
        await delay(req.retryDelay ?? 250 * attempt);
      }
    }
    emit("uif:error", { url, error: lastError });
    throw lastError;
  };
  const promise = runner().finally(() => {
    if (timeout) window.clearTimeout(timeout);
    controllers.delete(key);
    pending.delete(key);
    emit("uif:complete", { url, key });
  });
  pending.set(key, promise);
  return promise;
}
function get(url, options = {}) {
  return request(url, { ...options, method: "GET" });
}
function post(url, data, options = {}) {
  const isFormData = data instanceof FormData;
  const headers = isFormData ? options.headers : { "content-type": "application/json", ...options.headers ?? {} };
  const body = isFormData ? data : JSON.stringify(data ?? {});
  return request(url, { ...options, method: "POST", body, headers });
}
function submitForm(formEl, options = {}) {
  const url = formEl.dataset.uifSrc || formEl.action || window.location.href;
  const method = (formEl.dataset.uifMethod || formEl.method || "POST").toUpperCase();
  return request(url, { ...options, method, body: new FormData(formEl) });
}
function upload(url, formData, options = {}) {
  if (options.onUploadProgress) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open(options.method ?? "POST", url);
      const headers = withCsrf(options.headers, options);
      if (headers && !(headers instanceof Headers) && !Array.isArray(headers)) {
        Object.entries(headers).forEach(([name, value]) => xhr.setRequestHeader(name, String(value)));
      }
      xhr.upload.addEventListener("progress", (event) => options.onUploadProgress?.(event.loaded, event.total));
      xhr.addEventListener("load", () => {
        try {
          resolve(JSON.parse(xhr.responseText || "null"));
        } catch {
          resolve(xhr.responseText);
        }
      });
      xhr.addEventListener("error", () => reject(new Error("Upload failed")));
      xhr.send(formData);
    });
  }
  return request(url, { ...options, method: options.method ?? "POST", body: formData });
}
export {
  cancelRequest,
  get,
  post,
  request,
  submitForm,
  upload,
  useRequestInterceptor,
  useResponseInterceptor
};
