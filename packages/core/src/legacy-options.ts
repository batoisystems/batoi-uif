import { isSafeObjectKey, parseUIFConfiguration } from './contracts.js';
import { getCompatibilityMode } from './compatibility.js';
import { emit, type UIFOptions } from './runtime.js';

function coerceValue(value: string): unknown {
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (value === 'null') return null;
  if (value !== '' && !Number.isNaN(Number(value))) return Number(value);
  return value;
}

/** The facade alone preserves v2/diagnostic semicolon compatibility. */
export function parseOptions(el: HTMLElement): UIFOptions {
  const raw = el.getAttribute('data-uif-options');
  if (!raw) return {};
  const parsed = parseUIFConfiguration(raw);
  if (!parsed.issues.some((issue) => issue.code === 'invalid-json')) {
    if (!parsed.valid)
      emit('uif:runtime:diagnostic', { component: el.dataset.uif, issues: parsed.issues }, el);
    return parsed.value;
  }
  const compatibilityMode = getCompatibilityMode();
  emit(
    'uif:runtime:diagnostic',
    {
      component: el.dataset.uif,
      issues: [
        {
          path: 'data-uif-options',
          code: compatibilityMode === 'v3' ? 'legacy-options-rejected' : 'legacy-options',
          message:
            compatibilityMode === 'v3'
              ? 'Legacy semicolon options are rejected in v3 mode; use a JSON object.'
              : 'Legacy semicolon options are deprecated; migrate to a JSON object before v3.',
        },
      ],
    },
    el,
  );
  if (compatibilityMode === 'v3') return {};
  return raw.split(';').reduce<UIFOptions>((acc, pair) => {
    const [key, ...rest] = pair.split(':');
    const name = key?.trim();
    if (!name || !isSafeObjectKey(name)) {
      if (name)
        emit(
          'uif:runtime:diagnostic',
          {
            component: el.dataset.uif,
            issues: [{ path: name, code: 'unsafe-key', message: `Unsafe option key: ${name}` }],
          },
          el,
        );
      return acc;
    }
    const value = rest.join(':').trim();
    acc[name] = value === '' ? true : coerceValue(value);
    return acc;
  }, {});
}
