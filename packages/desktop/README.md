# @batoi/uif-desktop

Dependency-free desktop deployment helpers for Batoi UIF.

This package is browser-native. It does not bundle Tauri, Electron, Node.js APIs, Rust bridges, or third-party UI libraries. Desktop runtimes should wrap the generated UIF app at the application layer.

## Packaging Guidance

Tauri is the recommended desktop wrapper for production apps because it uses the platform WebView and keeps packaged applications small. Keep Tauri configuration outside framework packages.

Recommended app-level checklist:

- Use a strict Content Security Policy.
- Enable only the Tauri permissions required by the app.
- Store tokens in a secure runtime store, not `localStorage`.
- Open external links in the system browser.
- Sign production builds and updates.
- Keep AI, MCP, database, filesystem, deployment, email, and payment operations server-mediated.

