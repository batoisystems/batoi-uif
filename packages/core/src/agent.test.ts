import { describe, expect, it } from 'vitest';
import { parseAgentEnvelope, validateAgentEnvelope } from './agent.js';

describe('agent interaction envelope', () => {
  it('normalizes a provider-neutral message envelope', () => {
    const envelope = parseAgentEnvelope({
      version: 3,
      kind: 'message',
      id: 'message-1',
      threadId: 'thread-1',
      status: 'completed',
      actor: { role: 'assistant', label: 'Assistant' },
      content: [
        { type: 'text', text: 'Ready.' },
        { type: 'source', id: 'source-1', label: 'Policy', url: '/policy' },
      ],
      usage: { model: 'governed-route', outputTokens: 12 },
    });
    expect(envelope.content).toHaveLength(2);
    expect(envelope.actor?.role).toBe('assistant');
    expect(envelope.usage?.outputTokens).toBe(12);
  });

  it('fails closed for unknown versions, kinds, states, and actor roles', () => {
    const result = validateAgentEnvelope({
      version: 99,
      kind: 'execute-directly',
      id: 'message-1',
      status: 'authorized',
      actor: { role: 'administrator' },
      content: [],
    });
    expect(result.valid).toBe(false);
    expect(result.envelope.kind).toBe('error');
    expect(result.envelope.status).toBe('failed');
    expect(result.issues.map((issue) => issue.path)).toEqual(
      expect.arrayContaining(['version', 'kind', 'status', 'actor.role']),
    );
  });

  it('bounds text and rejects unsafe structured payloads', () => {
    const result = validateAgentEnvelope(
      {
        version: 3,
        kind: 'tool-result',
        id: 'result-1',
        status: 'completed',
        content: [
          { type: 'text', text: 'A'.repeat(20) },
          JSON.parse('{"type":"data","value":{"__proto__":{"polluted":true}}}'),
        ],
      },
      { maxCharacters: 10 },
    );
    expect(result.valid).toBe(false);
    expect(result.envelope.content).toEqual([{ type: 'text', text: 'A'.repeat(10) }]);
    expect(result.issues.map((issue) => issue.code)).toEqual(
      expect.arrayContaining(['truncated', 'unsafe']),
    );
  });
});
