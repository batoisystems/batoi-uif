import { describe, expect, it } from 'vitest';
import { validateForm } from './index.js';

describe('form validation', () => {
  it('validates required/email', () => {
    const form = document.createElement('form');
    const input = document.createElement('input');
    input.name = 'email';
    input.value = 'bad';
    input.dataset.uifRule = 'required|email';
    form.appendChild(input);
    const errors = validateForm(form);
    expect(errors.email.length).toBeGreaterThan(0);
  });
});
