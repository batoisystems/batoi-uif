// src/index.ts
import { appendTextElement } from "@batoi/uif-dom";
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
var aiAction = { name: "ai-action", init: renderAIAction };
export {
  aiAction,
  appendStreamingChunk,
  createStreamSurface,
  renderAIAction,
  renderAIResultCard,
  renderAssistantResponse,
  renderPromptPanel
};
