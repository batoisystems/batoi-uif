import { describe, expect, it } from 'vitest';
import { appendStreamingChunk, renderAIAction, renderAssistantResponse } from './index.js';

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
});
