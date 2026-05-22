export function renderAIAction(el: HTMLElement): void {
  const agent = el.dataset.uifAgent || 'assistant';
  const tool = el.dataset.uifTool || 'action';
  el.innerHTML = `<div class="uif-ai-card"><strong>${agent}</strong><p>${tool}</p><button data-uif-action="open">Start</button></div>`;
}

export function renderAssistantResponse(el: HTMLElement, content: string): void {
  el.innerHTML = `<div class="uif-ai-response" role="status">${content}</div>`;
}

export function appendStreamingChunk(el: HTMLElement, chunk: string): void {
  el.textContent = `${el.textContent || ''}${chunk}`;
}

export const aiAction = { name: 'ai-action', init: renderAIAction };
