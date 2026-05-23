# Release Checklist

- [ ] Confirm runtime dependency policy with `npm run verify:release`.
- [ ] Run `npm run lint`.
- [ ] Run `npm test`.
- [ ] Run `npm run build`.
- [ ] Smoke test `dist/uif.esm.js`, `dist/uif.iife.js`, and `dist/uif.css`.
- [ ] Review accessibility behavior for changed components.
- [ ] Review docs and examples.
- [ ] Update `CHANGELOG.md`.
- [ ] Confirm package metadata and license.
