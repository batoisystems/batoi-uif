import { appendTextElement } from '@batoi/uif-dom';

export function renderAIAction(el: HTMLElement): void {
  const agent = el.dataset.uifAgent || 'assistant';
  const tool = el.dataset.uifTool || 'action';
  const card = document.createElement('div');
  card.className = 'uif-ai-card';
  appendTextElement(card, 'strong', agent);
  appendTextElement(card, 'p', tool);
  const button = document.createElement('button');
  button.type = 'button';
  button.dataset.uifAction = 'open';
  button.textContent = 'Start';
  card.append(button);
  el.replaceChildren(card);
}

export function renderPromptPanel(el: HTMLElement, history: string[] = []): void {
  const form = document.createElement('form');
  form.className = 'uif-ai-prompt';
  form.dataset.uifRole = 'prompt';
  const textarea = document.createElement('textarea');
  textarea.name = 'prompt';
  textarea.dataset.uifRole = 'input';
  const historyEl = document.createElement('div');
  historyEl.className = 'uif-ai-history';
  history.forEach((item) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = item;
    button.addEventListener('click', () => {
      textarea.value = item;
      el.dispatchEvent(new CustomEvent('uif:ai-history-select', { detail: { prompt: item }, bubbles: true }));
    });
    historyEl.append(button);
  });
  const submit = document.createElement('button');
  submit.type = 'submit';
  submit.textContent = 'Send';
  form.append(textarea, historyEl, submit);
  el.replaceChildren(form);
}

export function renderAssistantResponse(el: HTMLElement, content: string): void {
  const response = document.createElement('div');
  response.className = 'uif-ai-response';
  response.textContent = content;
  response.setAttribute('role', 'status');
  el.replaceChildren(response);
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
      el.dispatchEvent(new CustomEvent('uif:ai-stream-cancel', { detail: { el }, bubbles: true }));
    },
  };
}

export function renderAIResultCard(el: HTMLElement, content: string): void {
  const card = document.createElement('div');
  card.className = 'uif-ai-result';
  card.setAttribute('role', 'region');
  const contentEl = appendTextElement(card, 'div', content);
  contentEl.dataset.uifRole = 'content';
  ['accept', 'reject', 'copy', 'insert'].forEach((action) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.uifAction = action;
    button.textContent = action.charAt(0).toUpperCase() + action.slice(1);
    card.append(button);
  });
  el.replaceChildren(card);
}

export const aiAction = { name: 'ai-action', init: renderAIAction };
