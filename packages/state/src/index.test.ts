import { describe, expect, it, vi } from 'vitest';
import { createStore } from './index.js';

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
});
