import { describe, expect, it, vi } from 'vitest';
import { createAdvancedStore, createArtifactStore, createMicroAppStore, createStore } from './index.js';

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

  it('uses versioned bounded persistence while accepting legacy version-one objects', () => {
    window.localStorage.clear();
    window.localStorage.setItem('legacy-state', '{"title":"Legacy"}');
    const legacy = createAdvancedStore({ title: 'Initial' }, { persist: 'local', key: 'legacy-state' });
    expect(legacy.get('title')).toBe('Legacy');
    legacy.set('title', 'Versioned');
    expect(window.localStorage.getItem('legacy-state')).toContain('"__uifStateVersion":1');

    const errors: Error[] = [];
    const mismatch = createAdvancedStore(
      { title: 'Fallback' },
      { persist: 'local', key: 'legacy-state', persistVersion: 2, onPersistError: (error) => errors.push(error) },
    );
    expect(mismatch.get('title')).toBe('Fallback');
    expect(errors[0]?.message).toContain('version 1 does not match 2');
  });

  it('reports malformed, oversized, and failed persistence without aborting state updates', () => {
    window.localStorage.clear();
    window.localStorage.setItem('bad-state', '{bad');
    const errors: Error[] = [];
    const store = createAdvancedStore(
      { title: 'Fallback' },
      { persist: 'local', key: 'bad-state', maxPersistBytes: 80, onPersistError: (error) => errors.push(error) },
    );
    expect(store.get('title')).toBe('Fallback');
    expect(errors[0]?.message).toContain('State persistence read failed');

    store.set('title', 'A value that makes the versioned persistence envelope exceed the configured byte boundary');
    expect(store.get('title')).toContain('configured byte boundary');
    expect(errors.at(-1)?.message).toContain('80 byte limit');

    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new DOMException('Quota exceeded', 'QuotaExceededError'); });
    store.set('title', 'In memory');
    expect(store.get('title')).toBe('In memory');
    expect(errors.at(-1)?.message).toContain('Quota exceeded');
    setItem.mockRestore();
  });
});
