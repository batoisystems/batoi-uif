import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { URL } from 'node:url';
import { createHash } from 'node:crypto';
import ts from 'typescript';

/** Freeze every declared JS/types subpath, not only package index facades. */
export function collectPublicEntryAPIs(root) {
  const entries = {};
  for (const folder of readdirSync(new URL('packages/', root)).sort()) {
    const directory = new URL(`packages/${folder}/`, root);
    const manifest = JSON.parse(readFileSync(new URL('package.json', directory), 'utf8'));
    for (const [subpath, target] of Object.entries(manifest.exports ?? {}).sort(([a], [b]) => a.localeCompare(b))) {
      if (typeof target !== 'object' || !target.types) continue;
      if (target.types.includes('*')) {
        const [prefix, suffix, extra] = target.types.replace(/^\.\//, '').split('*');
        if (extra !== undefined || !subpath.includes('*')) throw new Error(`Unsupported types export pattern: ${manifest.name}${subpath}`);
        const matches = readdirSync(directory, { recursive: true }).filter((file) => file.startsWith(prefix) && file.endsWith(suffix) && file.length > prefix.length + suffix.length).sort();
        if (!matches.length) throw new Error(`Empty types export pattern: ${manifest.name}${subpath}`);
        for (const file of matches) {
          const name = subpath.replace('*', file.slice(prefix.length, file.length - suffix.length));
          entries[`${manifest.name}${name.slice(1)}`] = declarationAPI(new URL(file, directory));
        }
      } else entries[`${manifest.name}${subpath === '.' ? '' : subpath.slice(1)}`] = declarationAPI(new URL(target.types, directory));
    }
  }
  const browser = new URL('dist/index.d.ts', root);
  if (existsSync(browser)) entries['batoi-uif/browser'] = declarationAPI(browser);
  return entries;
}

function isExported(node) {
  return node.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword) ?? false;
}

function addBindingName(names, name) {
  if (ts.isIdentifier(name)) names.add(name.text);
  else if (ts.isObjectBindingPattern(name) || ts.isArrayBindingPattern(name)) {
    name.elements.forEach((element) => {
      if (ts.isBindingElement(element)) addBindingName(names, element.name);
    });
  }
}

export function declarationExports(url) {
  return declarationAPI(url).exports;
}

function declarationNames(node) {
  const names = new Set();
  if (ts.isVariableStatement(node)) node.declarationList.declarations.forEach((declaration) => addBindingName(names, declaration.name));
  else if ('name' in node && node.name && ts.isIdentifier(node.name)) names.add(node.name.text);
  return names;
}

function signature(text) {
  const source = ts.createSourceFile('signature.d.ts', text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const result = ts.transform(source, [(context) => {
    const visit = (node) => {
      if (ts.isUnionTypeNode(node)) return ts.factory.updateUnionTypeNode(node, [...node.types].sort((a, b) => a.getText(source) < b.getText(source) ? -1 : a.getText(source) > b.getText(source) ? 1 : 0).map((type) => ts.visitNode(type, visit)));
      return ts.visitEachChild(node, visit, context);
    };
    return (node) => ts.visitNode(node, visit);
  }]);
  const normalized = ts.createPrinter({ removeComments: true }).printFile(result.transformed[0]);
  result.dispose();
  return createHash('sha256').update(normalized.replace(/\s+/g, ' ').trim()).digest('hex');
}

export function declarationAPI(url, readDeclaration = (file) => readFileSync(file, 'utf8')) {
  // A split declaration entry must compare the underlying public declaration,
  // not the bundler's randomly assigned re-export alias or chunk filename.
  const cache = new Map();
  const collect = (file) => {
    if (cache.has(file.href)) return cache.get(file.href);
    const exports = new Map();
    cache.set(file.href, exports);
    const text = readDeclaration(file);
    if (text === null) return exports;
    const source = ts.createSourceFile(file.pathname, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
    const local = new Map();
    const imported = new Map();
    const relativeModule = (name) => {
      if (!name.startsWith('.')) return null;
      const target = new URL(name.replace(/\.js$/, '.d.ts'), file);
      return collect(target);
    };
    for (const node of source.statements) {
      declarationNames(node).forEach((name) => local.set(name, node.getText(source)));
      if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
        const bindings = node.importClause?.namedBindings;
        if (bindings && ts.isNamedImports(bindings)) bindings.elements.forEach((entry) => imported.set(entry.name.text, { module: node.moduleSpecifier.text, name: entry.propertyName?.text ?? entry.name.text }));
      }
    }
    const resolve = (name) => {
      if (local.has(name)) return local.get(name);
      const entry = imported.get(name);
      return entry ? relativeModule(entry.module)?.get(entry.name) : undefined;
    };
    for (const node of source.statements) {
      if (ts.isExportDeclaration(node)) {
        const linked = node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier) ? relativeModule(node.moduleSpecifier.text) : null;
        if (node.exportClause && ts.isNamedExports(node.exportClause)) node.exportClause.elements.forEach((entry) => {
          const name = entry.propertyName?.text ?? entry.name.text;
          exports.set(entry.name.text, linked?.get(name) ?? resolve(name) ?? entry.getText(source));
        });
        else if (!node.exportClause && linked) linked.forEach((value, name) => exports.set(name, value));
        else if (node.exportClause && ts.isNamespaceExport(node.exportClause)) exports.set(node.exportClause.name.text, node.exportClause.name.text);
      } else if (isExported(node)) declarationNames(node).forEach((name) => exports.set(name, node.getText(source)));
    }
    return exports;
  };
  const declarations = collect(url);
  const exports = [...declarations.keys()].sort();
  return { exports, signatures: Object.fromEntries(exports.map((name) => [name, signature(declarations.get(name))])) };
}

export function declarationAPIFromText(text, fileName = 'index.d.ts') {
  const source = ts.createSourceFile(fileName, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const names = new Set();
  const declarations = new Map();
  for (const node of source.statements) {
    for (const name of declarationNames(node)) declarations.set(name, node.getText(source));
    if (ts.isExportDeclaration(node)) {
      if (node.exportClause && ts.isNamedExports(node.exportClause)) node.exportClause.elements.forEach((entry) => {
        names.add(entry.name.text);
        const local = entry.propertyName?.text ?? entry.name.text;
        declarations.set(entry.name.text, declarations.get(local) ?? entry.getText(source));
      });
      else if (node.exportClause && ts.isNamespaceExport(node.exportClause)) names.add(node.exportClause.name.text);
      continue;
    }
    if (ts.isExportAssignment(node)) {
      names.add('default');
      continue;
    }
    if (!isExported(node)) continue;
    declarationNames(node).forEach((name) => names.add(name));
    if (node.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.DefaultKeyword)) names.add('default');
  }
  const exports = [...names].sort();
  return { exports, signatures: Object.fromEntries(exports.map((name) => [name, signature(declarations.get(name) ?? name)])) };
}
