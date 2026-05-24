import { describe, expect, it, vi } from 'vitest';
import { createArtifactStore, createMicroAppStore, createStore } from './index.js';

describe('state', () => {
  it('gets, sets, subscribes, and binds values', () => {
    const store = createStore({ customer: { email: 'a@example.com' } });
    const fn = vi.fn();
    store.subscribe('customer.email', fn);
    store.set('customer.email', 'b@example.com');
    expect(store.get('customer.email')).toBe('b@example.com');
    expect(fn).toHaveBeenCalledWith('b@example.com');

    document.body.innerHTML = '<input data-uif-model="customer.email"><span data-uif-bind="customer.email"></span>';
    store.bind(document);
    expect(document.querySelector('span')?.textContent).toBe('b@example.com');
  });

  it('supports micro app persistence, export, import, reset, undo, and redo', () => {
    window.localStorage.clear();
    const store = createMicroAppStore(
      {
        title: 'Demo',
        tasks: [{ label: 'Draft', done: false }],
      },
      { persist: 'local', key: 'uif-test-artifact' },
    );

    store.set('title', 'Updated');
    expect(store.get('title')).toBe('Updated');
    expect(window.localStorage.getItem('uif-test-artifact')).toContain('Updated');
    expect(store.canUndo()).toBe(true);
    expect(store.undo()).toBe(true);
    expect(store.get('title')).toBe('Demo');
    expect(store.redo()).toBe(true);
    expect(store.get('title')).toBe('Updated');

    store.push('tasks', { label: 'Ship', done: false });
    expect((store.get('tasks') as unknown[])).toHaveLength(2);

    const exported = store.exportJSON();
    expect(exported).toContain('Ship');
    store.importJSON('{"title":"Imported","tasks":[]}');
    expect(store.get('title')).toBe('Imported');
    store.reset();
    expect(store.get('title')).toBe('Demo');
    expect(() => store.importJSON('[]')).toThrow('Micro App state must be a JSON object');
    expect(createArtifactStore({ ok: true }).get('ok')).toBe(true);
  });
});
