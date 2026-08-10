import { describe, expect, it, vi } from 'vitest';
import {
  appendStreamingChunk,
  createAgentStreamSurface,
  createGovernedAgentTransport,
  createStreamSurface,
  renderAIAction,
  renderAgentComposer,
  renderAssistantResponse,
  renderAssistantThread,
  renderPromptPanel,
} from './index.js';

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

  it('bounds assistant responses, history, and streaming content', () => {
    const response = document.createElement('div');
    const errors: string[] = [];
    response.addEventListener('uif:ai-error', (event) => errors.push((event as CustomEvent).detail.code));
    renderAssistantResponse(response, '123456', { maxCharacters: 4 });
    expect(response.textContent).toBe('1234');
    expect(response.dataset.uifTruncated).toBe('true');

    const streamHost = document.createElement('div');
    const stream = createStreamSurface(streamHost, { maxCharacters: 5 });
    stream.append('123');
    stream.append('456');
    stream.append('ignored');
    expect(streamHost.textContent).toBe('12345');
    expect(streamHost.dataset.uifState).toBe('limited');
    expect(errors).toEqual(['ai-content-limit']);
  });

  it('renders validated agent messages, sources, artifacts, and usage as safe content', () => {
    const el = document.createElement('div');
    const feedback: unknown[] = [];
    el.addEventListener('uif:agent:feedback', (event) => feedback.push((event as CustomEvent).detail));
    renderAssistantThread(el, [
      {
        version: 3,
        kind: 'message',
        id: 'message-1',
        status: 'completed',
        actor: { role: 'assistant', label: 'Assistant' },
        content: [
          { type: 'text', text: '<strong>Safe text</strong>' },
          { type: 'source', id: 'source-1', label: 'Documentation', url: '/docs' },
          { type: 'artifact', id: 'artifact-1', label: 'Report', mediaType: 'text/plain' },
        ],
        usage: { model: 'governed-route', outputTokens: 20 },
      },
    ]);
    expect(el.querySelector('.uif-agent-message')?.textContent).toContain('<strong>Safe text</strong>');
    expect(el.querySelector('.uif-agent-message strong strong')).toBeNull();
    expect(el.querySelector('.uif-agent-source a')?.getAttribute('href')).toBe('/docs');
    expect(el.textContent).toContain('governed-route');
    expect(el.textContent).toContain('Report');
    (el.querySelector('[data-uif-action="feedback-up"]') as HTMLButtonElement).click();
    expect(feedback).toEqual([{ envelopeId: 'message-1', value: 'up' }]);
  });

  it('fails closed with a safe compatibility notice for unsupported envelopes', () => {
    const el = document.createElement('div');
    renderAssistantThread(el, [{ version: 99, kind: 'message', id: 'future', status: 'completed', content: [] }]);
    expect(el.querySelector('[data-uif-state="incompatible"]')?.textContent).toContain('cannot be displayed safely');
    expect(el.textContent).not.toContain('future');
  });

  it('emits composer submission and cancellation without dispatching a provider request', () => {
    const el = document.createElement('div');
    const events: string[] = [];
    el.addEventListener('uif:agent:submit', (event) => events.push((event as CustomEvent).detail.prompt));
    el.addEventListener('uif:agent:cancel', () => events.push('cancelled'));
    const controller = renderAgentComposer(el, { templates: ['Summarize'] });
    (el.querySelector('.uif-agent-templates button') as HTMLButtonElement).click();
    el.querySelector('form')?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    controller.setBusy(true);
    (Array.from(el.querySelectorAll('button')).at(-1) as HTMLButtonElement).click();
    expect(events).toEqual(['Summarize', 'cancelled']);
    expect(el.querySelector('form')?.getAttribute('aria-busy')).toBe('true');
    controller.destroy();
  });

  it('validates stream sequence and enforces the character limit', () => {
    const el = document.createElement('div');
    const errors: string[] = [];
    el.addEventListener('uif:agent:error', (event) => errors.push((event as CustomEvent).detail.code));
    const stream = createAgentStreamSurface(el, { maxCharacters: 5 });
    const delta = (sequence: number, text: string) => ({
      version: 3,
      kind: 'stream-delta',
      id: `delta-${sequence}`,
      sequence,
      status: 'streaming',
      content: [{ type: 'text', text }],
    });
    expect(stream.append(delta(1, 'abc'))).toBe(true);
    expect(stream.append(delta(1, 'x'))).toBe(false);
    expect(stream.append(delta(2, 'def'))).toBe(false);
    expect(el.textContent).toBe('abcde');
    expect(el.dataset.uifState).toBe('limited');
    expect(errors).toEqual(['AGENT_STREAM_SEQUENCE', 'AGENT_STREAM_LIMIT']);
  });

  it('uses a governed same-origin gateway and validates its response envelope', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({
        version: 3,
        kind: 'message',
        id: 'message-1',
        status: 'completed',
        content: [{ type: 'text', text: 'Done' }],
      }), { status: 200, headers: { 'content-type': 'application/json' } }),
    );
    vi.stubGlobal('fetch', fetchMock);
    const transport = createGovernedAgentTransport({ src: '/agent/gateway', csrfToken: 'token' });
    const response = await transport.send({ prompt: 'Summarize' });
    expect(response.id).toBe('message-1');
    expect(fetchMock).toHaveBeenCalledWith('/agent/gateway', expect.objectContaining({
      method: 'POST',
      credentials: 'same-origin',
      headers: expect.objectContaining({ 'content-type': 'application/json', 'x-csrf-token': 'token' }),
    }));
    transport.cancel();
    vi.unstubAllGlobals();
  });
});
