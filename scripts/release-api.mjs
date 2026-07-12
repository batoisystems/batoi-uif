import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import ts from 'typescript';

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
  return createHash('sha256').update(text.replace(/\s+/g, ' ').trim()).digest('hex');
}

export function declarationAPI(url) {
  return declarationAPIFromText(readFileSync(url, 'utf8'), url.pathname);
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
