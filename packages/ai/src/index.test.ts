import { describe, expect, it } from 'vitest';
import { appendStreamingChunk, createStreamSurface, renderAIAction, renderAssistantResponse, renderPromptPanel } from './index.js';

describe('ai', () => {
  it('renders action, response, and streaming chunks', () => {
    const el = document.createElement('div');
    el.dataset.uifAgent = 'rad-builder';
    el.dataset.uifTool = 'create_app';
    renderAIAction(el);
    expect(el.textContent).toContain('rad-builder');
    renderAssistantResponse(el, 'Done');
    expect(el.textContent).toContain('Done');
    appendStreamingChunk(el, '!');
    expect(el.textContent).toContain('!');
  });

  it('selects prompt history and emits stream cancellation events', () => {
    const el = document.createElement('div');
    const selected: unknown[] = [];
    el.addEventListener('uif:ai-history-select', (event) => selected.push((event as CustomEvent).detail));
    renderPromptPanel(el, ['Draft invoice']);
    (el.querySelector('button') as HTMLButtonElement).click();
    expect((el.querySelector('textarea') as HTMLTextAreaElement).value).toBe('Draft invoice');
    expect(selected).toEqual([{ prompt: 'Draft invoice' }]);

    const streamHost = document.createElement('div');
    const stream = createStreamSurface(streamHost);
    const cancelled: unknown[] = [];
    streamHost.addEventListener('uif:ai-stream-cancel', (event) => cancelled.push((event as CustomEvent).detail));
    stream.append('hello');
    stream.cancel();
    stream.append(' ignored');
    expect(streamHost.dataset.uifState).toBe('cancelled');
    expect(streamHost.textContent).toBe('hello');
    expect(cancelled).toHaveLength(1);
  });
});
