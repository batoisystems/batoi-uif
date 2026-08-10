// src/index.ts
import {
  validateAgentEnvelope
} from "@batoi/uif-core";
import { appendTextElement, isSafeURL } from "@batoi/uif-dom";
import { cancelRequest, request } from "@batoi/uif-net";
function boundedAIText(el, value, options = {}) {
  const limit = Math.max(1, Math.floor(options.maxCharacters ?? 1e5));
  if (value.length <= limit) return value;
  el.dataset.uifTruncated = "true";
  el.dispatchEvent(new CustomEvent("uif:ai-error", { bubbles: true, detail: { code: "ai-content-limit", limit } }));
  return value.slice(0, limit);
}
function renderAIAction(el) {
  const agent = el.dataset.uifAgent || "assistant";
  const tool = el.dataset.uifTool || "action";
  const card = document.createElement("div");
  card.className = "uif-ai-card";
  appendTextElement(card, "strong", agent);
  appendTextElement(card, "p", tool);
  const button = document.createElement("button");
  button.type = "button";
  button.dataset.uifAction = "open";
  button.textContent = "Start";
  card.append(button);
  el.replaceChildren(card);
}
function renderPromptPanel(el, history = [], options = {}) {
  const form = document.createElement("form");
  form.className = "uif-ai-prompt";
  form.dataset.uifRole = "prompt";
  const textarea = document.createElement("textarea");
  textarea.name = "prompt";
  textarea.dataset.uifRole = "input";
  const historyEl = document.createElement("div");
  historyEl.className = "uif-ai-history";
  history.slice(0, 50).forEach((item) => {
    const button = document.createElement("button");
    button.type = "button";
    const prompt = boundedAIText(el, item, options);
    button.textContent = prompt;
    button.addEventListener("click", () => {
      textarea.value = prompt;
      el.dispatchEvent(new CustomEvent("uif:ai-history-select", { detail: { prompt }, bubbles: true }));
    });
    historyEl.append(button);
  });
  const submit = document.createElement("button");
  submit.type = "submit";
  submit.textContent = "Send";
  form.append(textarea, historyEl, submit);
  el.replaceChildren(form);
}
function renderAssistantResponse(el, content, options = {}) {
  const response = document.createElement("div");
  response.className = "uif-ai-response";
  response.textContent = boundedAIText(el, content, options);
  response.setAttribute("role", "status");
  el.replaceChildren(response);
}
function appendStreamingChunk(el, chunk, options = {}) {
  el.textContent = boundedAIText(el, `${el.textContent || ""}${chunk}`, options);
}
function createStreamSurface(el, options = {}) {
  const controller = new AbortController();
  el.dataset.uifState = "streaming";
  return {
    append(chunk) {
      if (!controller.signal.aborted) {
        appendStreamingChunk(el, chunk, options);
        if (el.dataset.uifTruncated === "true") {
          controller.abort();
          el.dataset.uifState = "limited";
        }
      }
    },
    cancel() {
      controller.abort();
      el.dataset.uifState = "cancelled";
      el.dispatchEvent(new CustomEvent("uif:ai-stream-cancel", { detail: { el }, bubbles: true }));
    }
  };
}
function renderAIResultCard(el, content, options = {}) {
  const card = document.createElement("div");
  card.className = "uif-ai-result";
  card.setAttribute("role", "region");
  const contentEl = appendTextElement(card, "div", boundedAIText(el, content, options));
  contentEl.dataset.uifRole = "content";
  ["accept", "reject", "copy", "insert"].forEach((action) => {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.uifAction = action;
    button.textContent = action.charAt(0).toUpperCase() + action.slice(1);
    card.append(button);
  });
  el.replaceChildren(card);
}
function serializeAgentData(value, maxCharacters) {
  try {
    const serialized = JSON.stringify(value, null, 2) ?? "null";
    return serialized.length <= maxCharacters ? serialized : `${serialized.slice(0, maxCharacters)}
[truncated]`;
  } catch {
    return "[Unserializable data]";
  }
}
function renderAgentPart(parent, part, options) {
  if (part.type === "text") {
    appendTextElement(parent, "p", part.text, "uif-agent-text");
    return;
  }
  if (part.type === "source") {
    const item = document.createElement("li");
    item.className = "uif-agent-source";
    if (part.url && isSafeURL(part.url, { context: "link" })) {
      const link = document.createElement("a");
      link.href = part.url;
      link.textContent = part.label;
      link.rel = "noopener noreferrer";
      item.append(link);
    } else appendTextElement(item, "span", part.label);
    if (part.unavailable) appendTextElement(item, "span", "Unavailable", "uif-agent-source-state");
    parent.append(item);
    return;
  }
  if (part.type === "artifact") {
    const artifact = document.createElement("section");
    artifact.className = "uif-agent-artifact";
    artifact.dataset.uifArtifactId = part.id;
    appendTextElement(artifact, "strong", part.label);
    if (part.mediaType) appendTextElement(artifact, "span", part.mediaType);
    if (part.url && isSafeURL(part.url, { context: "link" })) {
      const link = document.createElement("a");
      link.href = part.url;
      link.textContent = "Open artifact";
      link.rel = "noopener noreferrer";
      artifact.append(link);
    }
    parent.append(artifact);
    return;
  }
  const data = appendTextElement(
    parent,
    "pre",
    serializeAgentData(part.value, Math.max(1, options.maxCharacters ?? 1e5)),
    "uif-agent-data"
  );
  if (part.label) data.setAttribute("aria-label", part.label);
}
function renderAgentMessage(parent, envelope, options = {}) {
  const article = document.createElement("article");
  article.className = "uif-agent-message";
  article.dataset.uifEnvelopeId = envelope.id;
  article.dataset.uifKind = envelope.kind;
  article.dataset.uifState = envelope.status;
  const header = document.createElement("header");
  appendTextElement(header, "strong", envelope.actor?.label ?? envelope.actor?.role ?? "System");
  appendTextElement(header, "span", envelope.status, "uif-agent-status");
  article.append(header);
  const sources = document.createElement("ol");
  sources.className = "uif-agent-sources";
  sources.setAttribute("aria-label", "Sources");
  envelope.content.forEach((part) => {
    renderAgentPart(part.type === "source" ? sources : article, part, options);
  });
  if (sources.childElementCount) article.append(sources);
  if (envelope.usage) {
    const usage = document.createElement("dl");
    usage.className = "uif-agent-usage";
    const entries = [
      ["Model", envelope.usage.model],
      ["Route", envelope.usage.route],
      ["Input tokens", envelope.usage.inputTokens],
      ["Output tokens", envelope.usage.outputTokens],
      ["Latency", envelope.usage.latencyMilliseconds === void 0 ? void 0 : `${envelope.usage.latencyMilliseconds} ms`],
      ["Retention", envelope.usage.retention]
    ];
    entries.forEach(([label, value]) => {
      if (value === void 0) return;
      appendTextElement(usage, "dt", label);
      appendTextElement(usage, "dd", value);
    });
    article.append(usage);
  }
  if (envelope.error) {
    const error = appendTextElement(article, "p", envelope.error.message, "uif-agent-error");
    error.setAttribute("role", "alert");
    error.dataset.uifErrorCode = envelope.error.code;
  }
  if (options.showActions !== false && (envelope.actor?.role === "assistant" || envelope.kind === "error")) {
    const actions = document.createElement("footer");
    actions.className = "uif-agent-message-actions";
    const actionDefinitions = envelope.kind === "error" ? [["retry", "Retry"]] : [["feedback-up", "Helpful"], ["feedback-down", "Not helpful"], ["copy", "Copy"]];
    actionDefinitions.forEach(([action, label]) => {
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.uifAction = action;
      button.textContent = label;
      actions.append(button);
    });
    actions.addEventListener("click", (event) => {
      const target = event.target instanceof HTMLElement ? event.target.closest("button[data-uif-action]") : null;
      const action = target?.dataset.uifAction;
      if (!action) return;
      const eventName = action.startsWith("feedback-") ? "uif:agent:feedback" : `uif:agent:${action}`;
      article.dispatchEvent(new CustomEvent(eventName, {
        bubbles: true,
        detail: {
          envelopeId: envelope.id,
          value: action.startsWith("feedback-") ? action.slice("feedback-".length) : void 0
        }
      }));
    });
    article.append(actions);
  }
  parent.append(article);
  return article;
}
function renderAssistantThread(el, input, options = {}) {
  const limit = Math.max(1, Math.floor(options.maxItems ?? 100));
  const thread = document.createElement("section");
  thread.className = "uif-agent-thread";
  thread.setAttribute("role", "log");
  thread.setAttribute("aria-live", "polite");
  input.slice(0, limit).forEach((item, index) => {
    const result = validateAgentEnvelope(item, options);
    if (!result.valid) {
      el.dispatchEvent(new CustomEvent("uif:agent:error", {
        bubbles: true,
        detail: { code: "AGENT_ENVELOPE_INVALID", index, issues: result.issues }
      }));
      const notice = document.createElement("article");
      notice.className = "uif-agent-message uif-agent-compatibility-notice";
      notice.dataset.uifState = "incompatible";
      notice.setAttribute("role", "status");
      appendTextElement(notice, "strong", "Unsupported agent response");
      appendTextElement(notice, "p", "This response cannot be displayed safely. Update the application or gateway to a compatible envelope version.");
      thread.append(notice);
      return;
    }
    renderAgentMessage(thread, result.envelope, options);
  });
  if (input.length > limit) {
    el.dispatchEvent(new CustomEvent("uif:agent:error", {
      bubbles: true,
      detail: { code: "AGENT_THREAD_LIMIT", limit }
    }));
  }
  el.replaceChildren(thread);
}
function renderAgentComposer(el, options = {}) {
  const controller = new AbortController();
  const form = document.createElement("form");
  form.className = "uif-agent-composer";
  const label = document.createElement("label");
  label.textContent = options.label ?? "Message";
  const input = document.createElement("textarea");
  input.name = "prompt";
  input.placeholder = options.placeholder ?? "Ask the assistant";
  input.maxLength = Math.max(1, Math.floor(options.maxCharacters ?? 1e5));
  label.append(input);
  const templates = document.createElement("div");
  templates.className = "uif-agent-templates";
  (options.templates ?? []).slice(0, Math.max(1, options.maxItems ?? 20)).forEach((template) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = template;
    button.addEventListener("click", () => {
      input.value = template.slice(0, input.maxLength);
      input.focus();
    }, { signal: controller.signal });
    templates.append(button);
  });
  const submit = document.createElement("button");
  submit.type = "submit";
  submit.textContent = options.submitLabel ?? "Send";
  const stop = document.createElement("button");
  stop.type = "button";
  stop.textContent = options.stopLabel ?? "Stop";
  stop.hidden = true;
  form.append(label, templates, submit, stop);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const prompt = input.value.trim();
    if (!prompt) return;
    el.dispatchEvent(new CustomEvent("uif:agent:submit", { bubbles: true, detail: { prompt } }));
  }, { signal: controller.signal });
  stop.addEventListener("click", () => {
    el.dispatchEvent(new CustomEvent("uif:agent:cancel", { bubbles: true }));
  }, { signal: controller.signal });
  el.replaceChildren(form);
  return {
    setBusy(busy) {
      input.readOnly = busy;
      submit.disabled = busy;
      stop.hidden = !busy;
      form.setAttribute("aria-busy", String(busy));
    },
    destroy() {
      controller.abort();
    }
  };
}
function createAgentStreamSurface(el, options = {}) {
  let lastSequence = -1;
  let characters = 0;
  let destroyed = false;
  const maxCharacters = Math.max(1, Math.floor(options.maxCharacters ?? 1e5));
  el.dataset.uifState = "streaming";
  const append = (input) => {
    if (destroyed) return false;
    const result = validateAgentEnvelope(input, options);
    if (!result.valid || result.envelope.kind !== "stream-delta") {
      el.dispatchEvent(new CustomEvent("uif:agent:error", { bubbles: true, detail: { code: "AGENT_STREAM_INVALID", issues: result.issues } }));
      return false;
    }
    const sequence = result.envelope.sequence;
    if (sequence === void 0 || sequence <= lastSequence) {
      el.dispatchEvent(new CustomEvent("uif:agent:error", { bubbles: true, detail: { code: "AGENT_STREAM_SEQUENCE", sequence, lastSequence } }));
      return false;
    }
    const delta = result.envelope.content.filter((part) => part.type === "text").map((part) => part.text).join("");
    const available = maxCharacters - characters;
    if (available <= 0) return false;
    el.append(document.createTextNode(delta.slice(0, available)));
    characters += Math.min(delta.length, available);
    lastSequence = sequence;
    if (delta.length > available) {
      el.dataset.uifState = "limited";
      el.dispatchEvent(new CustomEvent("uif:agent:error", { bubbles: true, detail: { code: "AGENT_STREAM_LIMIT", limit: maxCharacters } }));
      return false;
    }
    return true;
  };
  return {
    append,
    complete(input) {
      if (input !== void 0) {
        const result = validateAgentEnvelope(input, options);
        if (!result.valid || result.envelope.kind !== "stream-complete") {
          el.dispatchEvent(new CustomEvent("uif:agent:error", { bubbles: true, detail: { code: "AGENT_STREAM_COMPLETION_INVALID", issues: result.issues } }));
          return;
        }
      }
      el.dataset.uifState = "completed";
    },
    cancel() {
      el.dataset.uifState = "cancelled";
      el.dispatchEvent(new CustomEvent("uif:agent:cancel", { bubbles: true }));
    },
    destroy() {
      destroyed = true;
    }
  };
}
function createGovernedAgentTransport(options) {
  if (!isSafeURL(options.src, {
    context: "network",
    allowHash: false,
    sameOrigin: !options.allowCrossOrigin
  })) {
    throw new Error("Batoi UIF blocked an unsafe governed agent gateway URL");
  }
  const key = options.key ?? `agent:${crypto.randomUUID()}`;
  const validateResponse = (input) => {
    const result = validateAgentEnvelope(input);
    if (!result.valid) {
      throw new Error(`Invalid governed agent response: ${result.issues.map((issue) => `${issue.path}: ${issue.message}`).join("; ")}`);
    }
    return result.envelope;
  };
  const baseRequest = {
    key,
    timeout: options.timeout ?? 3e4,
    credentials: options.credentials ?? "same-origin",
    csrfToken: options.csrfToken,
    csrfHeader: options.csrfHeader,
    parseAs: "json",
    retries: 0
  };
  return {
    async send(input) {
      const response = await request(options.src, {
        ...baseRequest,
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(input)
      });
      return validateResponse(response);
    },
    async poll(requestId) {
      if (!/^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,199}$/.test(requestId)) {
        throw new Error("Invalid governed agent request identifier");
      }
      const url = new URL(options.src, window.location.href);
      url.searchParams.set("requestId", requestId);
      const response = await request(url.href, { ...baseRequest, method: "GET" });
      return validateResponse(response);
    },
    cancel() {
      cancelRequest(key);
    }
  };
}
function initAssistantThread(el) {
  const raw = el.dataset.uifMessages;
  if (!raw) return;
  try {
    const input = JSON.parse(raw);
    renderAssistantThread(el, Array.isArray(input) ? input : []);
  } catch (error) {
    el.dispatchEvent(new CustomEvent("uif:agent:error", { bubbles: true, detail: { code: "AGENT_THREAD_JSON", error } }));
  }
}
var aiAction = { name: "ai-action", init: renderAIAction };
var aiThread = { name: "ai-thread", init: initAssistantThread };
var aiComposer = { name: "ai-composer", init: renderAgentComposer };
export {
  aiAction,
  aiComposer,
  aiThread,
  appendStreamingChunk,
  createAgentStreamSurface,
  createGovernedAgentTransport,
  createStreamSurface,
  initAssistantThread,
  renderAIAction,
  renderAIResultCard,
  renderAgentComposer,
  renderAgentMessage,
  renderAssistantResponse,
  renderAssistantThread,
  renderPromptPanel
};
