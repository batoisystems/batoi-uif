# Localization and RTL

Batoi UIF uses browser-native `Intl` APIs and CSS logical properties. Applications own translated content; UIF provides bounded formatting and message hooks without shipping locale data or a translation runtime.

```ts
import {
  applyLocale,
  configureLocale,
  formatUIFCurrency,
  translateUIFMessage,
} from '@batoi/uif-core';

configureLocale({
  locales: ['ar-EG', 'en'],
  timeZone: 'Africa/Cairo',
  currency: 'EGP',
  messages: { total: 'الإجمالي: {value}' },
});

applyLocale(document.documentElement);
const amount = formatUIFCurrency(1250);
const label = translateUIFMessage('total', 'Total: {value}', { value: amount });
```

`applyLocale()` sets the canonical primary language and derived `ltr` or `rtl` direction on the target. `formatUIFNumber()`, `formatUIFCurrency()`, and `formatUIFDate()` use the active locale configuration. Message interpolation returns plain strings; callers must continue to render untrusted values as text.

Compatibility utilities `uif-text-left` and `uif-text-right` remain physical. New layouts should use `uif-text-start`, `uif-text-end`, logical spacing utilities, and component primitives that mirror under `dir="rtl"`.
