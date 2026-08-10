import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { URL } from 'node:url';

function sorted(values) {
  return [...new Set(values)].sort();
}

export function extractMatches(text, pattern) {
  return sorted(Array.from(text.matchAll(pattern), (match) => match[1]).filter(Boolean));
}

function sourceFiles(root) {
  const packageRoot = new URL('packages/', root);
  const files = [new URL('index.ts', root)];
  for (const packageName of readdirSync(packageRoot)) {
    const sourceRoot = new URL(`${packageName}/src/`, packageRoot);
    if (!existsSync(sourceRoot)) continue;
    readdirSync(sourceRoot, { recursive: true })
      .filter((name) => typeof name === 'string' && name.endsWith('.ts') && !name.endsWith('.test.ts'))
      .forEach((name) => files.push(new URL(name, sourceRoot)));
  }
  return files;
}

function cssFiles(root) {
  const cssRoot = new URL('packages/css/', root);
  return readdirSync(cssRoot)
    .filter((name) => name.endsWith('.css'))
    .map((name) => new URL(name, cssRoot));
}

function packageEntries(root) {
  const entries = {};
  const packageRoot = new URL('packages/', root);
  for (const name of readdirSync(packageRoot).sort()) {
    const manifest = new URL(`${name}/package.json`, packageRoot);
    if (!existsSync(manifest)) continue;
    const pkg = JSON.parse(readFileSync(manifest, 'utf8'));
    entries[name] = {
      name: pkg.name,
      exports: Object.keys(pkg.exports ?? {}).sort(),
      dependencies: Object.keys(pkg.dependencies ?? {}).sort(),
    };
  }
  return entries;
}

export async function collectContractBaseline(root) {
  const pkg = JSON.parse(readFileSync(new URL('package.json', root), 'utf8'));
  const sourceText = sourceFiles(root).map((file) => readFileSync(file, 'utf8')).join('\n');
  const cssText = cssFiles(root).map((file) => readFileSync(file, 'utf8')).join('\n');
  const distribution = new URL(`dist/uif.esm.js?contracts=${Date.now()}`, root);
  const uif = await import(distribution.href);
  const definitions = uif.runtimeRegistry.definitions();

  return {
    schemaVersion: 1,
    version: pkg.version,
    packages: packageEntries(root),
    declarative: {
      attributes: sorted([
        ...uif.uifAttributes,
        ...extractMatches(sourceText, /\b(data-uif(?:-[a-z0-9-]+)?)\b/g),
      ]),
      components: sorted([
        ...uif.uifValues,
        ...definitions.map((definition) => definition.name),
      ]),
      actions: sorted(uif.uifActions),
      states: sorted(uif.uifStates),
    },
    events: sorted([
      ...(uif.uifEvents ?? []),
      ...extractMatches(sourceText, /['"`](uif:[a-z0-9][a-z0-9:-]*)['"`]/g),
    ]),
    css: {
      tokens: extractMatches(cssText, /(--uif-[a-z0-9-]+)/g),
      classes: extractMatches(cssText, /\.(uif-[a-z0-9_-]+)/g),
    },
    componentDefinitions: Object.fromEntries(
      definitions.map((definition) => [
        definition.name,
        {
          version: definition.version ?? 3,
          roles: sorted(definition.roles ?? []),
          actions: sorted(definition.actions ?? []),
          events: sorted(definition.events ?? []),
          states: sorted(definition.states ?? []),
          optionKeys: sorted(definition.optionKeys ?? []),
        },
      ]),
    ),
    envelopes: {
      rad: {
        versions: [1, 2],
        fields: ['actions', 'errors', 'events', 'focus', 'html', 'message', 'ok', 'redirect', 'swap', 'target', 'version'],
        actions: ['focus', 'redirect', 'toast'],
        swapModes: ['after', 'append', 'before', 'inner', 'outer', 'prepend'],
        limits: { htmlCharacters: 1_000_000, collectionItems: 100, messageCharacters: 10_000 },
      },
    },
    artifacts: Object.keys(JSON.parse(readFileSync(new URL('dist/integrity.json', root), 'utf8')).files ?? {}).sort(),
  };
}

export function removedContractEntries(expected, current) {
  const removed = [];
  const compareList = (path, before, after) => {
    const afterSet = new Set(after ?? []);
    (before ?? []).forEach((entry) => {
      if (!afterSet.has(entry)) removed.push(`${path}:${entry}`);
    });
  };
  compareList('attributes', expected.declarative?.attributes, current.declarative?.attributes);
  compareList('components', expected.declarative?.components, current.declarative?.components);
  compareList('actions', expected.declarative?.actions, current.declarative?.actions);
  compareList('states', expected.declarative?.states, current.declarative?.states);
  compareList('events', expected.events, current.events);
  compareList('css.tokens', expected.css?.tokens, current.css?.tokens);
  compareList('css.classes', expected.css?.classes, current.css?.classes);
  compareList('artifacts', expected.artifacts, current.artifacts);
  Object.entries(expected.packages ?? {}).forEach(([name, pkg]) => {
    if (!current.packages?.[name]) removed.push(`packages:${name}`);
    else compareList(`packages.${name}.exports`, pkg.exports, current.packages[name].exports);
  });
  return removed.sort();
}
