# Contributing

Run these checks before proposing changes:

```sh
npm run lint
npm test
npm run build
npm run verify:release
```

Keep packages dependency-free at runtime except for internal `@batoi/*` workspace packages. Prefer HTML-first `data-uif-*` APIs and plain JS/CSS output.
