import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { Buffer } from 'node:buffer';
import { resolve } from 'node:path';
import { fileURLToPath, URL } from 'node:url';
import process from 'node:process';
import { createAuthoringService } from './server.mjs';
import { starterTheme } from './compiler.mjs';

/** Private development preview only; never applies files or invokes tools/models. */
export function serveStudio({ port = 8795 } = {}) {
  const service = createAuthoringService();
  const staticFiles = { '/': ['studio.html', 'text/html'], '/studio.js': ['studio.js', 'text/javascript'], '/studio.css': ['studio.css', 'text/css'] };
  const server = createServer(async (request, response) => {
    const host = request.headers.host ?? '';
    if (!/^(127\.0\.0\.1|localhost)(:\d+)?$/.test(host)) { response.writeHead(403); response.end(); return; }
    const origin = `http://${host}`;
    if (request.headers.origin && request.headers.origin !== origin) { response.writeHead(403); response.end(); return; }
    response.setHeader('Cache-Control', 'no-store');
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('Content-Security-Policy', "default-src 'none'; script-src 'self'; style-src 'self'; connect-src 'self'; frame-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'");
    const send = (status, data, type = 'application/json') => { response.writeHead(status, { 'Content-Type': type }); response.end(type === 'application/json' ? JSON.stringify(data) : data); };
    try {
      if (request.method === 'GET' && Object.hasOwn(staticFiles, request.url)) {
        const [name, type] = staticFiles[request.url];
        send(200, readFileSync(new URL(name, import.meta.url)), type); return;
      }
      if (request.method === 'GET' && request.url === '/starter.json') { send(200, starterTheme()); return; }
      if (request.method === 'POST' && request.url === '/build') {
        // Browser JSON POST requires same-origin access. Null/missing Origin is
        // not accepted here; non-browser clients should use the CLI/MCP instead.
        if (request.headers.origin !== origin) { send(403, { error: 'Same-origin browser request required' }); return; }
        if (!(request.headers['content-type'] ?? '').startsWith('application/json')) { send(415, { error: 'Expected JSON' }); return; }
        let size = 0;
        const chunks = [];
        for await (const chunk of request) { size += chunk.length; if (size > 100000) { send(413, { error: 'Input exceeds 100,000 bytes' }); return; } chunks.push(chunk); }
        const theme = JSON.parse(Buffer.concat(chunks).toString('utf8'));
        const validation = service.call('uif_theme_validate', { theme });
        if (!validation.valid) { send(422, validation); return; }
        send(200, service.call('uif_theme_build', { theme })); return;
      }
      const artifact = request.url?.match(/^\/artifacts\/([a-f0-9]{64})\/([a-z.-]+)$/);
      if (request.method === 'GET' && artifact) {
        const files = service.call('uif_theme_export', { artifactId: artifact[1] }).files;
        if (!Object.hasOwn(files, artifact[2])) { send(404, { error: 'Unknown artifact file' }); return; }
        const html = artifact[2].endsWith('.html');
        if (html) response.setHeader('Content-Security-Policy', "sandbox allow-same-origin; default-src 'none'; style-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'self'");
        send(200, files[artifact[2]], html ? 'text/html' : artifact[2].endsWith('.css') ? 'text/css' : 'text/plain'); return;
      }
      send(404, { error: 'Not found' });
    } catch (error) { send(400, { error: error.message }); }
  });
  server.requestTimeout = 10000;
  server.headersTimeout = 5000;
  server.listen(port, '127.0.0.1');
  return server;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const server = serveStudio({ port: Number(process.env.UIF_STUDIO_PORT ?? 8795) });
  server.on('listening', () => process.stdout.write(`UIF theme studio: http://127.0.0.1:${server.address().port}\nDevelopment preview only; no application or publication authority.\n`));
}
