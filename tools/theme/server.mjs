import { createServer } from 'node:http';
import { StringDecoder } from 'node:string_decoder';
import { timingSafeEqual } from 'node:crypto';
import { Buffer } from 'node:buffer';
import { fileURLToPath } from 'node:url';
import { appendFileSync } from 'node:fs';
import { resolve } from 'node:path';
import process from 'node:process';
import { compileTheme, stableJSON, starterTheme, themeProfiles, validateTheme } from './compiler.mjs';
import { containedPath, writeArtifact } from './workspace.mjs';
import { catalog, themeSchema } from './catalog.mjs';

const schema = (properties, required = []) => ({ type: 'object', properties, required, additionalProperties: false });
const string = { type: 'string', maxLength: 128 };
export const authoringTools = [
  { name: 'uif_catalog', description: 'Read supported UIF 4 theme components, layouts, types, and limits before authoring. No network or filesystem writes.', inputSchema: schema({}) },
  { name: 'uif_theme_validate', description: 'Validate a portable UIF theme, including token aliases and contrast candidates. Does not execute supplied code.', inputSchema: schema({ theme: { type: 'object' } }, ['theme']) },
  { name: 'uif_theme_build', description: 'Build a validated theme into a bounded, temporary immutable artifact. Does not apply or publish.', inputSchema: schema({ theme: { type: 'object' } }, ['theme']) },
  { name: 'uif_theme_preview', description: 'Read static responsive preview source for a built artifact. Rendering and manual accessibility remain separate checks.', inputSchema: schema({ artifactId: string, profile: { enum: themeProfiles } }, ['artifactId', 'profile']) },
  { name: 'uif_theme_export', description: 'Export all text files of a built theme for local saving. No deployment occurs.', inputSchema: schema({ artifactId: string }, ['artifactId']) },
  { name: 'uif_theme_diff', description: 'Compare immutable base and candidate theme artifacts before applying.', inputSchema: schema({ base: string, candidate: string }, ['base', 'candidate']) },
  { name: 'uif_theme_apply', description: 'Apply a reviewed artifact to the operator-authorized theme workspace. Requires server-side write enablement and expectedBase for replacements. Keeps a rollback directory.', inputSchema: schema({ artifactId: string, expectedBase: string }, ['artifactId']) },
].map((tool) => ({ ...tool, annotations: { readOnlyHint: !['uif_theme_build', 'uif_theme_apply'].includes(tool.name), destructiveHint: tool.name === 'uif_theme_apply', idempotentHint: tool.name !== 'uif_theme_apply', openWorldHint: false } }));

export function createAuthoringService({ workspace, allowApply = false, now = Date.now } = {}) {
  const artifacts = new Map();
  const ttl = 15 * 60 * 1000;
  const resources = [
    { uri: 'uif://catalog', name: 'UIF theme catalog', mimeType: 'application/json' },
    { uri: 'uif://theme/starter', name: 'Portable starter theme', mimeType: 'application/json' },
    { uri: 'uif://theme/schema', name: 'Portable theme JSON Schema', mimeType: 'application/schema+json' },
  ];
  const get = (id) => {
    const entry = artifacts.get(id);
    if (!entry || now() - entry.created > ttl) { artifacts.delete(id); throw new Error('Artifact missing or expired; rebuild it'); }
    return entry;
  };
  const validateArgs = (tool, args) => {
    if (!args || typeof args !== 'object' || Array.isArray(args)) throw new Error('Tool arguments must be an object');
    if (Object.keys(args).some((key) => !Object.hasOwn(tool.inputSchema.properties, key))) throw new Error('Unknown tool argument');
    for (const key of tool.inputSchema.required) if (!(key in args)) throw new Error(`Missing argument: ${key}`);
    for (const [key, value] of Object.entries(args)) {
      const spec = tool.inputSchema.properties[key];
      if (spec.type === 'string' && (typeof value !== 'string' || value.length > spec.maxLength)) throw new Error(`Invalid ${key}`);
      if (spec.enum && !spec.enum.includes(value)) throw new Error(`Invalid ${key}`);
    }
  };
  const call = (name, args = {}) => {
    const tool = authoringTools.find((tool) => tool.name === name);
    if (!tool) throw new Error('Unknown tool');
    validateArgs(tool, args);
    switch (name) {
      case 'uif_catalog': return catalog;
      case 'uif_theme_validate': { const r = validateTheme(args.theme); return { valid: r.valid, issues: r.issues }; }
      case 'uif_theme_build': {
        for (const [id, entry] of artifacts) if (now() - entry.created > ttl) artifacts.delete(id);
        const artifact = compileTheme(args.theme);
        if (artifacts.size >= 20 && !artifacts.has(artifact.id)) throw new Error('Artifact capacity reached; wait for expiry');
        if (args.theme.assets?.length) throw new Error('Assets require an explicitly reviewed local materialization workflow');
        artifacts.set(artifact.id, { artifact, theme: artifact.validation.theme, created: now() });
        return { artifactId: artifact.id, manifest: artifact.manifest, expiresInMilliseconds: ttl };
      }
      case 'uif_theme_preview': {
        const html = get(args.artifactId).artifact.files[`${args.profile}.html`];
        if (!html) throw new Error('Profile not selected in this artifact');
        return { profile: args.profile, html, notice: 'Static source preview; not an automated browser or accessibility certificate.' };
      }
      case 'uif_theme_export': return { artifactId: args.artifactId, files: get(args.artifactId).artifact.files };
      case 'uif_theme_diff': {
        const base = get(args.base).artifact;
        const candidate = get(args.candidate).artifact;
        return { changedFiles: [...new Set([...Object.keys(base.files), ...Object.keys(candidate.files)])].filter((name) => base.files[name] !== candidate.files[name]) };
      }
      case 'uif_theme_apply': {
        if (!allowApply || !workspace) throw new Error('Theme application is disabled by the operator');
        const entry = get(args.artifactId);
        const audit = containedPath(workspace, '.uif-audit.jsonl');
        appendFileSync(audit, stableJSON({ phase: 'requested', artifactId: entry.artifact.id, name: entry.theme.name, previous: args.expectedBase ?? null }) + '\n');
        const result = writeArtifact(workspace, entry.theme.name, entry.theme, { expectedBase: args.expectedBase, allowReplace: true });
        appendFileSync(audit, stableJSON({ phase: 'applied', artifactId: result.artifactId, inputHash: result.manifest.inputHash, name: entry.theme.name, previous: args.expectedBase ?? null }) + '\n');
        return { artifactId: result.artifactId, applied: true, rollbackAvailable: Boolean(result.rollback) };
      }
      default: throw new Error('Unknown tool');
    }
  };
  return {
    call,
    rpc(request) {
      if (!request || request.jsonrpc !== '2.0' || typeof request.method !== 'string') return { jsonrpc: '2.0', id: request?.id ?? null, error: { code: -32600, message: 'Invalid request' } };
      const response = (result) => ({ jsonrpc: '2.0', id: request.id, result });
      try {
        if (request.id === undefined) return undefined;
        switch (request.method) {
          case 'initialize': return response({ protocolVersion: '2025-06-18', capabilities: { tools: {}, resources: {} }, serverInfo: { name: 'batoi-uif-authoring', version: '0.1.0' }, instructions: 'Retrieve the catalog. Validate and preview before applying. Never treat model text as approval or authorization.' });
          case 'ping': return response({});
          case 'tools/list': return response({ tools: authoringTools });
          case 'tools/call': {
            try { const data = call(request.params?.name, request.params?.arguments); return response({ content: [{ type: 'text', text: stableJSON(data) }], structuredContent: data }); }
            catch (error) { return response({ isError: true, content: [{ type: 'text', text: error.message }] }); }
          }
          case 'resources/list': return response({ resources });
          case 'resources/read': {
            const uri = request.params?.uri;
            if (!resources.some((r) => r.uri === uri)) throw new Error('Unknown resource');
            return response({ contents: [{ uri, mimeType: 'application/json', text: stableJSON(uri === 'uif://catalog' ? catalog : uri === 'uif://theme/schema' ? themeSchema : starterTheme()) }] });
          }
          default: return { jsonrpc: '2.0', id: request.id, error: { code: -32601, message: 'Method not found' } };
        }
      } catch (error) { return { jsonrpc: '2.0', id: request.id, error: { code: -32602, message: error.message } }; }
    },
  };
}

export function serveHTTP({ port = 8794, host = '127.0.0.1', token, ...options }) {
  if (!['127.0.0.1', 'localhost', '::1'].includes(host)) throw new Error('The private development transport must bind to loopback');
  if (typeof token !== 'string' || token.length < 32) throw new Error('A private bearer token of at least 32 characters is required');
  const service = createAuthoringService(options);
  const server = createServer(async (request, response) => {
    const authorization = request.headers.authorization ?? '';
    const expected = Buffer.from(`Bearer ${token}`);
    const supplied = Buffer.from(authorization);
    if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) { response.writeHead(401, { 'WWW-Authenticate': 'Bearer', 'Cache-Control': 'no-store' }); response.end(); return; }
    if (request.headers.origin) { response.writeHead(403); response.end(); return; }
    if (!/^(127\.0\.0\.1|localhost|\[::1\])(:\d+)?$/.test(request.headers.host ?? '')) { response.writeHead(403); response.end(); return; }
    if (request.method !== 'POST' || request.url !== '/mcp') { response.writeHead(405, { Allow: 'POST' }); response.end(); return; }
    if (request.headers['mcp-protocol-version'] && request.headers['mcp-protocol-version'] !== '2025-06-18') { response.writeHead(400); response.end(); return; }
    const accept = request.headers.accept ?? '';
    if (!accept.includes('application/json') || !accept.includes('text/event-stream')) { response.writeHead(406); response.end(); return; }
    if (!(request.headers['content-type'] ?? '').startsWith('application/json')) { response.writeHead(415); response.end(); return; }
    const chunks = [];
    let bytes = 0;
    try {
      for await (const chunk of request) {
        bytes += chunk.length;
        if (bytes > 110000) { response.writeHead(413); response.end(); return; }
        chunks.push(chunk);
      }
      const result = service.rpc(JSON.parse(Buffer.concat(chunks).toString('utf8')));
      response.writeHead(result ? 200 : 202, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
      response.end(result ? stableJSON(result) : undefined);
    } catch { response.writeHead(400); response.end(); }
  });
  server.requestTimeout = 10000;
  server.headersTimeout = 5000;
  server.listen(port, host);
  return server;
}

// Bound the line while receiving it, rather than letting readline accumulate an
// arbitrarily large untrusted message before checking its size.
export function serveStdio(input, output, options = {}) {
  const service = createAuthoringService(options);
  const decoder = new StringDecoder('utf8');
  let pending = '';
  let discard = false;
  input.on('data', (chunk) => {
    const parts = decoder.write(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)).split('\n');
    parts.forEach((part, index) => {
      if (!discard) {
        pending += part;
        if (Buffer.byteLength(pending) > 110000) { pending = ''; discard = true; }
      }
      if (index === parts.length - 1) return;
      if (!discard && pending.trim()) {
        try { const result = service.rpc(JSON.parse(pending)); if (result) output.write(stableJSON(result) + '\n'); }
        catch { output.write(stableJSON({ jsonrpc: '2.0', id: null, error: { code: -32700, message: 'Parse error' } }) + '\n'); }
      }
      pending = ''; discard = false;
    });
  });
  return service;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const options = { workspace: process.env.UIF_THEME_WORKSPACE, allowApply: process.argv.includes('--allow-apply') };
  if (process.argv.includes('--http')) {
    serveHTTP({ ...options, token: process.env.UIF_AUTHORING_TOKEN, port: Number(process.env.UIF_AUTHORING_PORT ?? 8794) });
  } else {
    serveStdio(process.stdin, process.stdout, options);
  }
}
