// src/index.ts
function renderAIAction(el) {
  const agent = el.dataset.uifAgent || "assistant";
  const tool = el.dataset.uifTool || "action";
  el.innerHTML = `<div class="uif-ai-card"><strong>${agent}</strong><p>${tool}</p><button data-uif-action="open">Start</button></div>`;
}
function renderPromptPanel(el, history = []) {
  el.innerHTML = `
    <form class="uif-ai-prompt" data-uif-role="prompt">
      <textarea name="prompt" data-uif-role="input"></textarea>
      <div class="uif-ai-history">${history.map((item) => `<button type="button">${item}</button>`).join("")}</div>
      <button type="submit">Send</button>
    </form>`;
}
function renderAssistantResponse(el, content) {
  el.innerHTML = `<div class="uif-ai-response" role="status">${content}</div>`;
}
function appendStreamingChunk(el, chunk) {
  el.textContent = `${el.textContent || ""}${chunk}`;
}
function createStreamSurface(el) {
  const controller = new AbortController();
  el.dataset.uifState = "streaming";
  return {
    append(chunk) {
      if (!controller.signal.aborted) appendStreamingChunk(el, chunk);
    },
    cancel() {
      controller.abort();
      el.dataset.uifState = "cancelled";
    }
  };
}
function renderAIResultCard(el, content) {
  el.innerHTML = `
    <div class="uif-ai-result" role="region">
      <div data-uif-role="content">${content}</div>
      <button data-uif-action="accept">Accept</button>
      <button data-uif-action="reject">Reject</button>
      <button data-uif-action="copy">Copy</button>
      <button data-uif-action="insert">Insert</button>
    </div>`;
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
