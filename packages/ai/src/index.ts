export function renderAIAction(el: HTMLElement): void {
  const agent = el.dataset.uifAgent || 'assistant';
  const tool = el.dataset.uifTool || 'action';
  el.innerHTML = `<div class="uif-ai-card"><strong>${agent}</strong><p>${tool}</p><button data-uif-action="open">Start</button></div>`;
}

export function renderPromptPanel(el: HTMLElement, history: string[] = []): void {
  el.innerHTML = `
    <form class="uif-ai-prompt" data-uif-role="prompt">
      <textarea name="prompt" data-uif-role="input"></textarea>
      <div class="uif-ai-history">${history.map((item) => `<button type="button">${item}</button>`).join('')}</div>
      <button type="submit">Send</button>
    </form>`;
}

export function renderAssistantResponse(el: HTMLElement, content: string): void {
  el.innerHTML = `<div class="uif-ai-response" role="status">${content}</div>`;
}

export function appendStreamingChunk(el: HTMLElement, chunk: string): void {
  el.textContent = `${el.textContent || ''}${chunk}`;
}

export function createStreamSurface(el: HTMLElement): { append(chunk: string): void; cancel(): void } {
  const controller = new AbortController();
  el.dataset.uifState = 'streaming';
  return {
    append(chunk: string) {
      if (!controller.signal.aborted) appendStreamingChunk(el, chunk);
    },
    cancel() {
      controller.abort();
      el.dataset.uifState = 'cancelled';
    },
  };
}

export function renderAIResultCard(el: HTMLElement, content: string): void {
  el.innerHTML = `
    <div class="uif-ai-result" role="region">
      <div data-uif-role="content">${content}</div>
      <button data-uif-action="accept">Accept</button>
      <button data-uif-action="reject">Reject</button>
      <button data-uif-action="copy">Copy</button>
      <button data-uif-action="insert">Insert</button>
    </div>`;
}

export const aiAction = { name: 'ai-action', init: renderAIAction };
