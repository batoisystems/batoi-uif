// src/index.ts
import { emit } from "@batoi/uif-core";
var editors = /* @__PURE__ */ new WeakMap();
var editorListeners = /* @__PURE__ */ new WeakMap();
var editorInitialValue = /* @__PURE__ */ new WeakMap();
var editorHistory = /* @__PURE__ */ new WeakMap();
var editorActiveTableCell = /* @__PURE__ */ new WeakMap();
var commandHandlers = /* @__PURE__ */ new Map();
var hookHandlers = /* @__PURE__ */ new Map();
var editorAutosaveTimers = /* @__PURE__ */ new WeakMap();
var defaultToolbar = ["undo", "redo", "bold", "italic", "heading", "quote", "code", "ul", "ol", "link", "preview", "source"];
var commandLabels = {
  bold: "Bold",
  italic: "Italic",
  underline: "Underline",
  strike: "Strikethrough",
  heading: "Heading",
  paragraph: "Paragraph",
  quote: "Quote",
  code: "Code",
  hr: "Horizontal rule",
  ul: "Bulleted list",
  ol: "Numbered list",
  task: "Task list",
  link: "Link",
  "link-edit": "Edit link",
  "link-remove": "Remove link",
  image: "Image",
  "image-edit": "Edit image",
  "image-remove": "Remove image",
  table: "Table",
  "table-row-before": "Add row before",
  "table-row-after": "Add row",
  "table-row-delete": "Delete row",
  "table-col-before": "Add column before",
  "table-col-after": "Add column",
  "table-col-delete": "Delete column",
  "table-delete": "Delete table",
  "table-header-toggle": "Toggle header",
  undo: "Undo",
  redo: "Redo",
  preview: "Preview",
  source: "Source",
  fullscreen: "Fullscreen",
  clear: "Clear formatting"
};
var commandIcons = {
  bold: '<path d="M7 5h6a4 4 0 0 1 0 8H7z"></path><path d="M7 13h7a4 4 0 0 1 0 8H7z"></path>',
  italic: '<path d="M10 5h8"></path><path d="M6 19h8"></path><path d="m14 5-4 14"></path>',
  underline: '<path d="M7 5v6a5 5 0 0 0 10 0V5"></path><path d="M5 21h14"></path>',
  strike: '<path d="M5 12h14"></path><path d="M16 6.5A4.5 4.5 0 0 0 12 5c-2.5 0-4 1.2-4 3"></path><path d="M8 17c.8 1.3 2.2 2 4 2 2.5 0 4-1.2 4-3"></path>',
  heading: '<path d="M6 5v14"></path><path d="M18 5v14"></path><path d="M6 12h12"></path>',
  paragraph: '<path d="M13 20V5"></path><path d="M17 20V5"></path><path d="M17 5H9a4 4 0 0 0 0 8h4"></path>',
  quote: '<path d="M9 7H5v6h4v4l3-4V7z"></path><path d="M19 7h-4v6h4v4l3-4V7z"></path>',
  code: '<path d="m8 9-4 3 4 3"></path><path d="m16 9 4 3-4 3"></path><path d="m14 5-4 14"></path>',
  hr: '<path d="M5 12h14"></path>',
  ul: '<path d="M8 6h13"></path><path d="M8 12h13"></path><path d="M8 18h13"></path><path d="M3 6h.01"></path><path d="M3 12h.01"></path><path d="M3 18h.01"></path>',
  ol: '<path d="M10 6h11"></path><path d="M10 12h11"></path><path d="M10 18h11"></path><path d="M4 6h1v4"></path><path d="M4 10h2"></path><path d="M4 14h2l-2 4h2"></path>',
  task: '<path d="m4 7 2 2 4-4"></path><path d="M12 8h8"></path><path d="m4 17 2 2 4-4"></path><path d="M12 18h8"></path>',
  link: '<path d="M10 13a5 5 0 0 0 7.1 0l2-2a5 5 0 0 0-7.1-7.1l-1.2 1.2"></path><path d="M14 11a5 5 0 0 0-7.1 0l-2 2A5 5 0 0 0 12 20.1l1.2-1.2"></path>',
  image: '<rect x="3" y="5" width="18" height="14" rx="2"></rect><circle cx="8" cy="10" r="2"></circle><path d="m21 15-4-4-5 5-2-2-4 5"></path>',
  table: '<rect x="3" y="4" width="18" height="16" rx="2"></rect><path d="M3 10h18"></path><path d="M9 4v16"></path><path d="M15 4v16"></path>',
  undo: '<path d="M3 7v6h6"></path><path d="M3 13a8 8 0 1 1 2.3 5.7"></path>',
  redo: '<path d="M21 7v6h-6"></path><path d="M21 13a8 8 0 1 0-2.3 5.7"></path>',
  preview: '<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z"></path><circle cx="12" cy="12" r="3"></circle>',
  source: '<path d="m16 18 6-6-6-6"></path><path d="m8 6-6 6 6 6"></path>',
  fullscreen: '<path d="M8 3H3v5"></path><path d="M16 3h5v5"></path><path d="M21 16v5h-5"></path><path d="M8 21H3v-5"></path>',
  clear: '<path d="m16 3 5 5-9 9H7l-4-4 13-10z"></path><path d="M14 21H3"></path>'
};
function registerEditorCommand(name, handler) {
  commandHandlers.set(name, handler);
}
function unregisterEditorCommand(name) {
  commandHandlers.delete(name);
}
function registerEditorHook(name, handler) {
  const handlers = hookHandlers.get(name) ?? /* @__PURE__ */ new Set();
  handlers.add(handler);
  hookHandlers.set(name, handlers);
  return () => handlers.delete(handler);
}
async function runEditorHooks(name, context) {
  const handlers = hookHandlers.get(name);
  if (!handlers?.size) return [];
  const results = [];
  for (const handler of handlers) results.push(await handler(context));
  return results;
}
function escapeHtml(value) {
  return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}
function escapeAttr(value) {
  return escapeHtml(value).replaceAll("`", "&#96;");
}
function editorCommandLabel(command) {
  return commandLabels[command] ?? command.replaceAll("-", " ");
}
function editorCommandIcon(command) {
  const body = commandIcons[command] ?? '<circle cx="12" cy="12" r="8"></circle>';
  return `<svg class="uif-icon uif-editor-button-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
}
function isSafeUrl(value) {
  return /^(https?:\/\/|mailto:|\/|#)/i.test(value.trim());
}
function safeUrl(value, fallback) {
  const candidate = String(value ?? "").trim();
  return isSafeUrl(candidate) ? candidate : fallback;
}
function linesToList(lines, ordered) {
  const tag = ordered ? "ol" : "ul";
  const items = lines.map((line) => line.replace(ordered ? /^\s*\d+\.\s+/ : /^\s*[-*+]\s+/, "")).map((line) => `<li>${inlineMarkdown(line)}</li>`).join("");
  return `<${tag}>${items}</${tag}>`;
}
function inlineMarkdown(value) {
  let output = escapeHtml(value);
  output = output.replace(/`([^`]+)`/g, "<code>$1</code>");
  output = output.replace(/~~([^~]+)~~/g, "<del>$1</del>");
  output = output.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  output = output.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  output = output.replace(/!\[([^\]]*)\]\((https?:\/\/[^)\s]+|\/[^)\s]*)\)/g, (_match, alt, url) => {
    return `<img src="${escapeAttr(url)}" alt="${escapeAttr(alt)}">`;
  });
  output = output.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+|mailto:[^)\s]+|\/[^)\s]*)\)/g, (_match, label, url) => {
    return `<a href="${escapeAttr(url)}">${escapeHtml(label)}</a>`;
  });
  output = output.replace(/(?<!href=")\bhttps?:\/\/[^\s<]+/g, (url) => `<a href="${escapeAttr(url)}">${escapeHtml(url)}</a>`);
  return output;
}
function tableToHtml(lines) {
  const cells = (line) => line.trim().replace(/^\||\|$/g, "").split("|").map((cell) => cell.trim());
  const [headerLine, , ...bodyLines] = lines;
  const header = cells(headerLine ?? "");
  const body = bodyLines.map(cells);
  return `<table><thead><tr>${header.map((cell) => `<th>${inlineMarkdown(cell)}</th>`).join("")}</tr></thead><tbody>${body.map((row) => `<tr>${row.map((cell) => `<td>${inlineMarkdown(cell)}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
}
function markdownToHtml(markdown) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const blocks = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i] ?? "";
    if (!line.trim()) {
      i += 1;
      continue;
    }
    if (line.startsWith("```")) {
      const code = [];
      i += 1;
      while (i < lines.length && !lines[i]?.startsWith("```")) {
        code.push(lines[i] ?? "");
        i += 1;
      }
      blocks.push(`<pre><code>${escapeHtml(code.join("\n"))}</code></pre>`);
      i += 1;
      continue;
    }
    const heading = /^(#{1,6})\s+(.+)$/.exec(line);
    if (heading) {
      const level = heading[1].length;
      blocks.push(`<h${level}>${inlineMarkdown(heading[2])}</h${level}>`);
      i += 1;
      continue;
    }
    if (/^\s*[-*+]\s+\[[ xX]\]\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*[-*+]\s+\[[ xX]\]\s+/.test(lines[i] ?? "")) {
        const checked = /\[[xX]\]/.test(lines[i] ?? "");
        items.push((lines[i] ?? "").replace(/^\s*[-*+]\s+\[[ xX]\]\s+/, `${checked ? "[x] " : "[ ] "}`));
        i += 1;
      }
      blocks.push(
        `<ul class="uif-task-list">${items.map((item) => `<li><input type="checkbox" disabled${item.startsWith("[x]") ? " checked" : ""}> ${inlineMarkdown(item.slice(4))}</li>`).join("")}</ul>`
      );
      continue;
    }
    if (/^\s*[-*+]\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*[-*+]\s+/.test(lines[i] ?? "")) {
        items.push(lines[i] ?? "");
        i += 1;
      }
      blocks.push(linesToList(items, false));
      continue;
    }
    if (/^\|.+\|$/.test(line) && /^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?$/.test(lines[i + 1] ?? "")) {
      const tableLines = [line, lines[i + 1] ?? ""];
      i += 2;
      while (i < lines.length && /^\|.+\|$/.test(lines[i] ?? "")) {
        tableLines.push(lines[i] ?? "");
        i += 1;
      }
      blocks.push(tableToHtml(tableLines));
      continue;
    }
    if (/^\s*\d+\.\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i] ?? "")) {
        items.push(lines[i] ?? "");
        i += 1;
      }
      blocks.push(linesToList(items, true));
      continue;
    }
    if (/^\s*>\s?/.test(line)) {
      const quotes = [];
      while (i < lines.length && /^\s*>\s?/.test(lines[i] ?? "")) {
        quotes.push((lines[i] ?? "").replace(/^\s*>\s?/, ""));
        i += 1;
      }
      blocks.push(`<blockquote>${quotes.map(inlineMarkdown).join("<br>")}</blockquote>`);
      continue;
    }
    if (/^\s*---+\s*$/.test(line)) {
      blocks.push("<hr>");
      i += 1;
      continue;
    }
    const para = [];
    while (i < lines.length && lines[i]?.trim() && !/^(#{1,6})\s+/.test(lines[i] ?? "") && !/^\s*[-*+]\s+/.test(lines[i] ?? "") && !/^\s*\d+\.\s+/.test(lines[i] ?? "") && !/^\s*>\s?/.test(lines[i] ?? "") && !lines[i]?.startsWith("```")) {
      para.push(lines[i] ?? "");
      i += 1;
    }
    blocks.push(`<p>${para.map(inlineMarkdown).join("<br>")}</p>`);
  }
  return blocks.join("\n");
}
function htmlToMarkdown(html) {
  const doc = new DOMParser().parseFromString(html, "text/html");
  doc.querySelectorAll("strong,b").forEach((el) => el.replaceWith(`**${el.textContent ?? ""}**`));
  doc.querySelectorAll("em,i").forEach((el) => el.replaceWith(`*${el.textContent ?? ""}*`));
  doc.querySelectorAll("del,s").forEach((el) => el.replaceWith(`~~${el.textContent ?? ""}~~`));
  doc.querySelectorAll("code").forEach((el) => el.replaceWith(`\`${el.textContent ?? ""}\``));
  doc.querySelectorAll("img").forEach((el) => el.replaceWith(`![${el.getAttribute("alt") ?? ""}](${el.getAttribute("src") ?? ""})`));
  doc.querySelectorAll("a").forEach((el) => el.replaceWith(`[${el.textContent ?? ""}](${el.getAttribute("href") ?? "#"})`));
  doc.querySelectorAll("h1,h2,h3,h4,h5,h6").forEach((el) => {
    const level = Number(el.tagName.slice(1));
    el.replaceWith(`${"#".repeat(level)} ${el.textContent ?? ""}

`);
  });
  doc.querySelectorAll("li").forEach((el) => el.replaceWith(`- ${el.textContent ?? ""}
`));
  doc.querySelectorAll("p,blockquote,pre").forEach((el) => el.replaceWith(`${el.textContent ?? ""}

`));
  return (doc.body.textContent ?? "").replace(/\n{3,}/g, "\n\n").trim();
}
function cleanEditorHtml(html) {
  const doc = new DOMParser().parseFromString(html, "text/html");
  doc.querySelectorAll("script,style,iframe,object,embed,link,meta").forEach((el) => el.remove());
  doc.querySelectorAll("*").forEach((el) => {
    [...el.attributes].forEach((attr) => {
      if (attr.name.startsWith("on")) el.removeAttribute(attr.name);
      if ((attr.name === "href" || attr.name === "src") && !isSafeUrl(attr.value)) el.removeAttribute(attr.name);
      if (attr.name === "style") el.removeAttribute(attr.name);
    });
  });
  return doc.body.innerHTML;
}
function asInput(el) {
  if (el instanceof HTMLTextAreaElement || el instanceof HTMLInputElement) return el;
  const input = el.querySelector('textarea,input[type="hidden"],input[type="text"]');
  if (!input) throw new Error("Editor requires a textarea or input.");
  return input;
}
function parseOptions(el, options = {}) {
  const configuredMaxLength = Number(el.dataset.uifMaxlength || "");
  const inputMaxLength = el instanceof HTMLTextAreaElement || el instanceof HTMLInputElement ? el.maxLength > 0 ? el.maxLength : 0 : 0;
  return {
    mode: options.mode ?? el.dataset.uifMode ?? "html",
    toolbar: options.toolbar ?? el.dataset.uifToolbar?.split(/\s+/).filter(Boolean) ?? defaultToolbar,
    preview: options.preview ?? el.dataset.uifPreview ?? "manual",
    height: options.height ?? el.dataset.uifEditorHeight ?? "14rem",
    layout: options.layout ?? el.dataset.uifEditorLayout ?? "source",
    status: options.status ?? el.dataset.uifEditorStatus !== "false",
    placeholder: options.placeholder ?? el.dataset.uifPlaceholder ?? "",
    autosave: options.autosave ?? el.dataset.uifAutosave === "true",
    autosaveDelay: options.autosaveDelay ?? (Number(el.dataset.uifAutosaveDelay || "") || 1200),
    autosaveUrl: options.autosaveUrl ?? el.dataset.uifAutosaveUrl ?? "",
    required: options.required ?? (el.dataset.uifRequired === "true" || el instanceof HTMLTextAreaElement && el.required),
    maxLength: options.maxLength ?? (configuredMaxLength || inputMaxLength)
  };
}
function wrapSelection(surface, before, after = before, fallback = "text") {
  const start = surface.selectionStart;
  const end = surface.selectionEnd;
  const selected = surface.value.slice(start, end) || fallback;
  const next = `${surface.value.slice(0, start)}${before}${selected}${after}${surface.value.slice(end)}`;
  surface.value = next;
  const cursorStart = start + before.length;
  surface.setSelectionRange(cursorStart, cursorStart + selected.length);
  return next;
}
function insertAtSelection(surface, value) {
  const start = surface.selectionStart;
  const end = surface.selectionEnd;
  const next = `${surface.value.slice(0, start)}${value}${surface.value.slice(end)}`;
  surface.value = next;
  surface.setSelectionRange(start + value.length, start + value.length);
  return next;
}
function selectedTextareaLineRange(surface) {
  const value = surface.value;
  const selectionStart = surface.selectionStart;
  let selectionEnd = surface.selectionEnd;
  if (selectionEnd > selectionStart && value[selectionEnd - 1] === "\n") selectionEnd -= 1;
  const start = value.lastIndexOf("\n", Math.max(0, selectionStart - 1)) + 1;
  const nextBreak = value.indexOf("\n", selectionEnd);
  const end = nextBreak === -1 ? value.length : nextBreak;
  return { start, end, lines: value.slice(start, end).split("\n") };
}
function markdownListMatch(line, kind) {
  if (kind === "task") return /^(\s*)[-*+]\s+\[[ xX]\]\s*(.*)$/.exec(line);
  if (kind === "ol") return /^(\s*)\d+\.\s+(.*)$/.exec(line);
  return /^(\s*)[-*+]\s+(?!\[[ xX]\]\s*)(.*)$/.exec(line);
}
function stripMarkdownListMarker(line) {
  const match = /^(\s*)(?:[-*+]\s+(?:\[[ xX]\]\s*)?|\d+\.\s+)(.*)$/.exec(line);
  return match ? { indent: match[1], text: match[2] } : { indent: line.match(/^\s*/)?.[0] ?? "", text: line.trimStart() };
}
function applyMarkdownListCommand(surface, kind) {
  const { start, end, lines } = selectedTextareaLineRange(surface);
  const targets = lines.length ? lines : [""];
  const nonEmpty = targets.filter((line) => line.trim());
  const sameList = nonEmpty.length > 0 && nonEmpty.every((line) => markdownListMatch(line, kind));
  let orderedIndex = 1;
  const replacement = targets.map((line) => {
    if (!line.trim()) return sameList ? "" : kind === "ol" ? `${orderedIndex++}. Item` : kind === "task" ? "- [ ] Task" : "- Item";
    const { indent, text } = stripMarkdownListMarker(line);
    if (sameList) return `${indent}${text}`;
    if (kind === "ol") return `${indent}${orderedIndex++}. ${text || "Item"}`;
    if (kind === "task") return `${indent}- [ ] ${text || "Task"}`;
    return `${indent}- ${text || "Item"}`;
  }).join("\n");
  surface.value = `${surface.value.slice(0, start)}${replacement}${surface.value.slice(end)}`;
  surface.setSelectionRange(start, start + replacement.length);
  return surface.value;
}
function currentTextareaLine(surface) {
  const before = surface.value.slice(0, surface.selectionStart);
  const after = surface.value.slice(surface.selectionStart);
  const start = before.lastIndexOf("\n") + 1;
  const nextBreak = after.indexOf("\n");
  const end = nextBreak === -1 ? surface.value.length : surface.selectionStart + nextBreak;
  return { start, end, line: surface.value.slice(start, end) };
}
function handleMarkdownTaskKey(surface, event) {
  const { start, end, line } = currentTextareaLine(surface);
  const task = /^(\s*[-*+]\s+\[[ xX]\]\s*)(.*)$/.exec(line);
  if (!task) return false;
  if (event.key === "Enter") {
    event.preventDefault();
    if (!task[2].trim()) {
      const removeStart = start > 0 && surface.value[start - 1] === "\n" ? start - 1 : start;
      surface.value = `${surface.value.slice(0, removeStart)}${surface.value.slice(end + (surface.value[end] === "\n" ? 1 : 0))}`;
      surface.setSelectionRange(removeStart, removeStart);
      return true;
    }
    const insert = `
${task[1].replace(/\[[xX]\]/, "[ ]")}`;
    insertAtSelection(surface, insert);
    return true;
  }
  if (event.key === "Backspace" && !task[2].trim() && surface.selectionStart === end && surface.selectionEnd === end) {
    event.preventDefault();
    surface.value = `${surface.value.slice(0, start)}${surface.value.slice(end)}`;
    surface.setSelectionRange(start, start);
    return true;
  }
  return false;
}
function richSurface(editor) {
  return editor.surface instanceof HTMLTextAreaElement ? null : editor.surface;
}
function richRange(editor) {
  const surface = richSurface(editor);
  if (!surface) return null;
  const selection = document.getSelection();
  if (selection?.rangeCount) {
    const range2 = selection.getRangeAt(0);
    if (surface.contains(range2.commonAncestorContainer)) return range2;
  }
  const range = document.createRange();
  range.selectNodeContents(surface);
  range.collapse(false);
  return range;
}
function setRichCaretAfter(node) {
  const range = document.createRange();
  range.setStartAfter(node);
  range.collapse(true);
  const selection = document.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);
}
function insertRichHtml(editor, html) {
  const range = richRange(editor);
  if (!range) return;
  const template = document.createElement("template");
  template.innerHTML = cleanEditorHtml(html);
  const fragment = template.content;
  const last = fragment.lastChild;
  range.deleteContents();
  range.insertNode(fragment);
  if (last) setRichCaretAfter(last);
}
function wrapRichSelection(editor, tagName, fallback, attrs = {}) {
  const range = richRange(editor);
  if (!range) return;
  const node = document.createElement(tagName);
  Object.entries(attrs).forEach(([name, attrValue]) => node.setAttribute(name, attrValue));
  if (range.collapsed) {
    node.textContent = fallback;
  } else {
    node.append(range.extractContents());
  }
  range.deleteContents();
  range.insertNode(node);
  setRichCaretAfter(node);
}
function selectedRichText(editor, fallback) {
  const range = richRange(editor);
  return range && !range.collapsed ? range.toString() : fallback;
}
function selectedRichLines(editor, fallback) {
  const range = richRange(editor);
  if (!range || range.collapsed) return [fallback];
  const textParts = [];
  const appendBreak = () => {
    if (textParts.at(-1) !== "\n") textParts.push("\n");
  };
  const visit = (node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      textParts.push(node.textContent ?? "");
      return;
    }
    if (node instanceof HTMLBRElement) {
      appendBreak();
      return;
    }
    node.childNodes.forEach(visit);
    if (node instanceof HTMLElement && /^(P|DIV|LI|H[1-6]|BLOCKQUOTE|PRE)$/i.test(node.tagName)) appendBreak();
  };
  range.cloneContents().childNodes.forEach(visit);
  const lines = textParts.join("").split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  return lines.length ? lines : [fallback];
}
function currentRichElement(editor, selector) {
  const surface = richSurface(editor);
  if (!surface) return null;
  const selection = document.getSelection();
  const node = selection?.rangeCount ? selection.getRangeAt(0).commonAncestorContainer : null;
  const range = selection?.rangeCount ? selection.getRangeAt(0) : null;
  const selectedNode = range?.startContainer.childNodes.item(range.startOffset);
  if (selectedNode instanceof Element) {
    const selected = selectedNode.matches(selector) ? selectedNode : selectedNode.querySelector(selector);
    if (selected instanceof Element && surface.contains(selected)) return selected;
  }
  const element = node instanceof Element ? node : node?.parentElement;
  const closest = element?.closest(selector);
  return closest && surface.contains(closest) ? closest : null;
}
function currentLink(editor) {
  return currentRichElement(editor, "a[href]");
}
function currentImage(editor) {
  const image = currentRichElement(editor, "img");
  if (image) return image;
  return currentRichElement(editor, "figure")?.querySelector("img") ?? null;
}
function currentTaskItem(editor) {
  return currentRichElement(editor, ".uif-task-list li");
}
function currentRichList(editor) {
  const list = currentRichElement(editor, "ul,ol");
  return list?.classList.contains("uif-task-list") ? null : list;
}
function replaceRichList(list, tagName) {
  const next = document.createElement(tagName);
  [...list.children].forEach((child) => {
    if (child instanceof HTMLLIElement) next.append(child.cloneNode(true));
  });
  list.replaceWith(next);
  setCaretInside(next);
  return next;
}
function unwrapRichList(list) {
  const fragment = document.createDocumentFragment();
  [...list.children].forEach((child) => {
    if (!(child instanceof HTMLLIElement)) return;
    const paragraph = document.createElement("p");
    paragraph.innerHTML = child.innerHTML;
    fragment.append(paragraph);
  });
  const last = fragment.lastChild;
  list.replaceWith(fragment);
  if (last instanceof HTMLElement) setCaretInside(last);
}
function setCaretInside(element) {
  const range = document.createRange();
  range.selectNodeContents(element);
  range.collapse(false);
  const selection = document.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);
}
function handleRichTaskKey(editor, event) {
  const item = currentTaskItem(editor);
  if (!item) return false;
  const label = item.querySelector("label") ?? item;
  const text = (label.textContent ?? "").trim();
  if (event.key === "Enter") {
    event.preventDefault();
    if (!text) {
      item.remove();
      return true;
    }
    const next = document.createElement("li");
    next.innerHTML = '<label><input type="checkbox"> </label>';
    item.after(next);
    setCaretInside(next.querySelector("label") ?? next);
    return true;
  }
  if (event.key === "Backspace" && !text) {
    event.preventDefault();
    item.remove();
    return true;
  }
  return false;
}
function applyLinkAttributes(linkEl, link) {
  linkEl.href = link.href;
  linkEl.setAttribute("href", link.href);
  if (link.text) linkEl.textContent = link.text;
  if (link.title) linkEl.title = link.title;
  else linkEl.removeAttribute("title");
  if (link.target === "_blank") {
    linkEl.target = "_blank";
    linkEl.rel = "noopener noreferrer";
  } else {
    linkEl.removeAttribute("target");
    linkEl.removeAttribute("rel");
  }
}
function applyImageAttributes(imageEl, image) {
  imageEl.src = image.src;
  imageEl.setAttribute("src", image.src);
  imageEl.alt = image.alt;
}
function linkValue(value, fallbackText = "Link text") {
  if (typeof value === "object" && value) {
    const data = value;
    return {
      text: String(data.text || fallbackText),
      href: safeUrl(data.href, "#"),
      title: String(data.title || ""),
      target: data.target === "_blank" ? "_blank" : "_self"
    };
  }
  return { text: fallbackText, href: safeUrl(value, "#"), title: "", target: "_self" };
}
function imageValue(value) {
  if (typeof value === "object" && value) {
    const data = value;
    return {
      src: safeUrl(data.src, "/favicon.ico"),
      alt: String(data.alt || "Image"),
      caption: String(data.caption || "")
    };
  }
  return { src: safeUrl(value, "/favicon.ico"), alt: "Image", caption: "" };
}
function tableValue(value) {
  if (typeof value === "object" && value) {
    const data = value;
    return {
      rows: Math.max(1, Math.min(12, Number(data.rows) || 2)),
      columns: Math.max(1, Math.min(8, Number(data.columns) || 2)),
      header: data.header !== false
    };
  }
  return { rows: 2, columns: 2, header: true };
}
function tableHtml(value) {
  const config = tableValue(value);
  const headers = Array.from({ length: config.columns }, (_item, index) => `<th>Column ${String.fromCharCode(65 + index)}</th>`).join("");
  const bodyRows = Array.from({ length: config.rows }, () => {
    const cells = Array.from({ length: config.columns }, (_item, index) => `<td>Value ${String.fromCharCode(65 + index)}</td>`).join("");
    return `<tr>${cells}</tr>`;
  }).join("");
  return `<table>${config.header ? `<thead><tr>${headers}</tr></thead>` : ""}<tbody>${bodyRows}</tbody></table>`;
}
function currentTableCell() {
  const selection = document.getSelection();
  const node = selection?.rangeCount ? selection.getRangeAt(0).commonAncestorContainer : null;
  const element = node instanceof Element ? node : node?.parentElement;
  return element?.closest("td,th") ?? null;
}
function currentTable() {
  return currentTableCell()?.closest("table") ?? null;
}
function applyTableCommand(editor, command) {
  const table = currentTable();
  const cell = currentTableCell() ?? editorActiveTableCell.get(editor) ?? null;
  const activeTable = table ?? cell?.closest("table") ?? null;
  if (!activeTable || !cell) return false;
  const row = cell.parentElement;
  const cellIndex = cell.cellIndex;
  if (command === "table-row-before") {
    const previous = row.cloneNode(true);
    previous.querySelectorAll("th,td").forEach((item) => item.textContent = "");
    row.before(previous);
    previous.querySelector("td,th")?.focus();
    return true;
  }
  if (command === "table-row-after") {
    const next = row.cloneNode(true);
    next.querySelectorAll("th,td").forEach((item) => item.textContent = "");
    row.after(next);
    next.querySelector("td,th")?.focus();
    return true;
  }
  if (command === "table-row-delete") {
    row.remove();
    if (!activeTable.querySelector("tr")) activeTable.remove();
    return true;
  }
  if (command === "table-col-before") {
    let insertedCurrent = null;
    activeTable.querySelectorAll("tr").forEach((tableRow) => {
      const ref = tableRow.children.item(cellIndex);
      const tag = ref?.tagName === "TH" ? "th" : "td";
      const next = document.createElement(tag);
      next.textContent = "";
      ref?.before(next);
      if (tableRow === row) insertedCurrent = next;
    });
    if (insertedCurrent) {
      const range = document.createRange();
      range.selectNodeContents(insertedCurrent);
      range.collapse(true);
      document.getSelection()?.removeAllRanges();
      document.getSelection()?.addRange(range);
    }
    return true;
  }
  if (command === "table-col-after") {
    let insertedCurrent = null;
    activeTable.querySelectorAll("tr").forEach((tableRow) => {
      const ref = tableRow.children.item(cellIndex);
      const tag = ref?.tagName === "TH" ? "th" : "td";
      const next = document.createElement(tag);
      next.textContent = "";
      ref?.after(next);
      if (tableRow === row) insertedCurrent = next;
    });
    if (insertedCurrent) {
      const range = document.createRange();
      range.selectNodeContents(insertedCurrent);
      range.collapse(true);
      document.getSelection()?.removeAllRanges();
      document.getSelection()?.addRange(range);
    }
    return true;
  }
  if (command === "table-col-delete") {
    activeTable.querySelectorAll("tr").forEach((tableRow) => tableRow.children.item(cellIndex)?.remove());
    if (!activeTable.querySelector("td,th")) activeTable.remove();
    return true;
  }
  if (command === "table-delete") {
    activeTable.remove();
    return true;
  }
  if (command === "table-header-toggle") {
    const head = activeTable.tHead;
    if (head) {
      const first = head.rows.item(0);
      if (first) activeTable.tBodies.item(0)?.prepend(first);
      head.remove();
    } else {
      const first = activeTable.tBodies.item(0)?.rows.item(0);
      if (first) {
        const thead = activeTable.createTHead();
        thead.append(first);
        first.querySelectorAll("td").forEach((td) => {
          const th = document.createElement("th");
          th.innerHTML = td.innerHTML;
          td.replaceWith(th);
        });
      }
    }
    return true;
  }
  return false;
}
function applyRichHtmlCommand(editor, command, value) {
  if (command === "bold") wrapRichSelection(editor, "strong", "bold text");
  else if (command === "italic") wrapRichSelection(editor, "em", "italic text");
  else if (command === "underline") wrapRichSelection(editor, "u", "underlined text");
  else if (command === "strike") wrapRichSelection(editor, "s", "deleted text");
  else if (command === "heading") insertRichHtml(editor, `<h2>${escapeHtml(selectedRichText(editor, "Heading"))}</h2>`);
  else if (command === "paragraph") insertRichHtml(editor, `<p>${escapeHtml(selectedRichText(editor, "Paragraph text"))}</p>`);
  else if (command === "quote") insertRichHtml(editor, `<blockquote>${escapeHtml(selectedRichText(editor, "Quote"))}</blockquote>`);
  else if (command === "code") insertRichHtml(editor, `<pre><code>${escapeHtml(selectedRichText(editor, "code"))}</code></pre>`);
  else if (command === "ul" || command === "ol") {
    const tag = command;
    const existingList = currentRichList(editor);
    if (existingList?.tagName.toLowerCase() === tag) {
      unwrapRichList(existingList);
      return;
    }
    if (existingList) {
      replaceRichList(existingList, tag);
      return;
    }
    const items = selectedRichLines(editor, "Item").map((line) => `<li>${escapeHtml(line)}</li>`).join("");
    insertRichHtml(editor, `<${tag}>${items}</${tag}>`);
  } else if (command === "task") insertRichHtml(editor, '<ul class="uif-task-list"><li><label><input type="checkbox"> Task</label></li></ul>');
  else if (command === "hr") insertRichHtml(editor, "<hr>");
  else if (command === "link" || command === "link-edit") {
    const link = linkValue(value, selectedRichText(editor, "Link text"));
    const existing = currentLink(editor);
    if (existing) {
      applyLinkAttributes(existing, link);
      return;
    }
    const attrs = { href: link.href };
    if (link.title) attrs.title = link.title;
    if (link.target === "_blank") {
      attrs.target = "_blank";
      attrs.rel = "noopener noreferrer";
    }
    wrapRichSelection(editor, "a", link.text, attrs);
  } else if (command === "link-remove") {
    const existing = currentLink(editor);
    if (!existing) return;
    existing.replaceWith(document.createTextNode(existing.textContent ?? ""));
  } else if (command === "image" || command === "image-edit") {
    const image = imageValue(value);
    const existing = currentImage(editor);
    if (existing) {
      applyImageAttributes(existing, image);
      const figure = existing.closest("figure");
      if (figure) {
        let caption = figure.querySelector("figcaption");
        if (image.caption) {
          if (!caption) {
            caption = document.createElement("figcaption");
            figure.append(caption);
          }
          caption.textContent = image.caption;
        } else {
          caption?.remove();
        }
      }
      return;
    }
    const img = `<img src="${escapeAttr(image.src)}" alt="${escapeAttr(image.alt)}">`;
    insertRichHtml(editor, image.caption ? `<figure>${img}<figcaption>${escapeHtml(image.caption)}</figcaption></figure>` : img);
  } else if (command === "image-remove") {
    const existing = currentImage(editor);
    if (!existing) return;
    const figure = existing.closest("figure");
    if (figure) figure.remove();
    else existing.remove();
  } else if (command === "table") insertRichHtml(editor, tableHtml(value));
  else if (command.startsWith("table-")) applyTableCommand(editor, command);
  else if (command === "clear") {
    const surface = richSurface(editor);
    if (surface) surface.textContent = surface.textContent ?? "";
  } else if (command !== "preview" && command !== "source" && command !== "fullscreen") {
    document.execCommand(command);
  }
}
function applyHtmlSourceCommand(editor, command, value) {
  const surface = editor.surface instanceof HTMLTextAreaElement ? editor.surface : null;
  if (!surface) return editor.getValue();
  if (command === "bold") return wrapSelection(surface, "<strong>", "</strong>", "bold text");
  if (command === "italic") return wrapSelection(surface, "<em>", "</em>", "italic text");
  if (command === "underline") return wrapSelection(surface, "<u>", "</u>", "underlined text");
  if (command === "strike") return wrapSelection(surface, "<s>", "</s>", "deleted text");
  if (command === "heading") return wrapSelection(surface, `<${value || "h2"}>`, `</${value || "h2"}>`, "Heading");
  if (command === "paragraph") return wrapSelection(surface, "<p>", "</p>", "Paragraph text");
  if (command === "quote") return wrapSelection(surface, "<blockquote>", "</blockquote>", "Quote");
  if (command === "code") return wrapSelection(surface, "<pre><code>", "</code></pre>", "code");
  if (command === "hr") return insertAtSelection(surface, "\n<hr>\n");
  if (command === "ul") return insertAtSelection(surface, "\n<ul><li>Item</li></ul>\n");
  if (command === "ol") return insertAtSelection(surface, "\n<ol><li>Item</li></ol>\n");
  if (command === "task") return insertAtSelection(surface, '\n<ul class="uif-task-list"><li><input type="checkbox" disabled> Task</li></ul>\n');
  if (command === "link" || command === "link-edit") {
    const link = linkValue(value, "link");
    const target = link.target === "_blank" ? ' target="_blank" rel="noopener noreferrer"' : "";
    const title = link.title ? ` title="${escapeAttr(link.title)}"` : "";
    return wrapSelection(surface, `<a href="${escapeAttr(link.href)}"${title}${target}>`, "</a>", link.text);
  }
  if (command === "image" || command === "image-edit") {
    const image = imageValue(value);
    const img = `<img src="${escapeAttr(image.src)}" alt="${escapeAttr(image.alt)}">`;
    return insertAtSelection(surface, image.caption ? `<figure>${img}<figcaption>${escapeHtml(image.caption)}</figcaption></figure>` : img);
  }
  if (command === "table") return insertAtSelection(surface, `
${tableHtml(value)}
`);
  if (command === "clear") return cleanEditorHtml(surface.value);
  return surface.value;
}
function markdownTable(value) {
  const config = tableValue(value);
  const header = `| ${Array.from({ length: config.columns }, (_item, index) => `Column ${String.fromCharCode(65 + index)}`).join(" | ")} |`;
  const rule = `| ${Array.from({ length: config.columns }, () => "---").join(" | ")} |`;
  const rows = Array.from({ length: config.rows }, () => `| ${Array.from({ length: config.columns }, (_item, index) => `Value ${String.fromCharCode(65 + index)}`).join(" | ")} |`);
  return `
${[header, rule, ...rows].join("\n")}
`;
}
function applyMarkdownCommand(editor, command, value) {
  const surface = editor.surface instanceof HTMLTextAreaElement ? editor.surface : null;
  if (!surface) return editor.getValue();
  if (command === "bold") return wrapSelection(surface, "**", "**", "bold text");
  if (command === "italic") return wrapSelection(surface, "*", "*", "italic text");
  if (command === "strike") return wrapSelection(surface, "~~", "~~", "deleted text");
  if (command === "heading") return insertAtSelection(surface, "\n## Heading\n");
  if (command === "paragraph") return insertAtSelection(surface, "\nParagraph text\n");
  if (command === "quote") return insertAtSelection(surface, "\n> Quote\n");
  if (command === "code") return insertAtSelection(surface, "\n```\ncode\n```\n");
  if (command === "hr") return insertAtSelection(surface, "\n---\n");
  if (command === "ul") return applyMarkdownListCommand(surface, "ul");
  if (command === "ol") return applyMarkdownListCommand(surface, "ol");
  if (command === "task") return applyMarkdownListCommand(surface, "task");
  if (command === "link" || command === "link-edit") {
    const link = linkValue(value, "link");
    if (surface.selectionStart === surface.selectionEnd) return insertAtSelection(surface, `[${link.text}](${link.href})`);
    return wrapSelection(surface, "[", `](${link.href})`, link.text);
  }
  if (command === "image" || command === "image-edit") {
    const image = imageValue(value);
    return insertAtSelection(surface, `
![${image.alt}](${image.src})${image.caption ? `

${image.caption}` : ""}
`);
  }
  if (command === "table") return insertAtSelection(surface, markdownTable(value));
  if (command === "clear") return "";
  return surface.value;
}
function countWords(value) {
  return value.trim().split(/\s+/).filter(Boolean).length;
}
function updateStatus(instance) {
  if (!instance.status) return;
  const value = instance.getValue();
  const words = countWords(value);
  const chars = value.length;
  const state = instance.dirty ? "Unsaved changes" : "Clean";
  instance.status.textContent = `${words} words \xB7 ${chars} characters \xB7 ${state}`;
}
function syncRichControlAttributes(root) {
  root.querySelectorAll('input[type="checkbox"],input[type="radio"]').forEach((input) => {
    if (input.checked) input.setAttribute("checked", "");
    else input.removeAttribute("checked");
  });
  root.querySelectorAll("option").forEach((option) => {
    if (option.selected) option.setAttribute("selected", "");
    else option.removeAttribute("selected");
  });
}
function validateEditor(editor) {
  const value = editor.getValue();
  const errors = [];
  const required = editor.input.dataset.uifRequired === "true" || editor.input.required;
  const maxLength = Number(editor.input.dataset.uifMaxlength || "") || (editor.input.maxLength > 0 ? editor.input.maxLength : 0);
  if (required && !value.trim()) errors.push("This field is required.");
  if (maxLength && value.length > maxLength) errors.push(`Maximum length is ${maxLength} characters.`);
  editor.element.dataset.uifValidation = errors.length ? "invalid" : "valid";
  editor.input.setAttribute("aria-invalid", errors.length ? "true" : "false");
  emit("uif:editor-validate", { editor, errors }, editor.element);
  void runEditorHooks("validate", { editor, value });
  return errors;
}
async function autosaveEditor(editor, url) {
  const value = editor.getValue();
  editor.element.dataset.uifAutosaveState = "saving";
  await runEditorHooks("autosave", { editor, value });
  if (url) {
    await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: editor.input.name, value })
    });
  }
  editor.element.dataset.uifAutosaveState = "saved";
  editor.dirty = false;
  editorInitialValue.set(editor, value);
  updateStatus(editor);
  emit("uif:editor-autosave", { editor, value }, editor.element);
}
function scheduleAutosave(editor, delay, url) {
  const existing = editorAutosaveTimers.get(editor);
  if (existing) window.clearTimeout(existing);
  editorAutosaveTimers.set(
    editor,
    window.setTimeout(() => {
      void autosaveEditor(editor, url).catch((error) => {
        editor.element.dataset.uifAutosaveState = "error";
        emit("uif:editor-error", { editor, error }, editor.element);
      });
    }, delay)
  );
}
function pushHistory(instance, next) {
  const history = editorHistory.get(instance);
  if (!history || history.last === next) return;
  history.undo.push(history.last);
  if (history.undo.length > 60) history.undo.shift();
  history.redo = [];
  history.last = next;
}
function restoreHistory(instance, direction) {
  const history = editorHistory.get(instance);
  if (!history) return;
  const from = direction === "undo" ? history.undo : history.redo;
  const to = direction === "undo" ? history.redo : history.undo;
  const value = from.pop();
  if (value === void 0) return;
  to.push(instance.getValue());
  history.last = value;
  instance.setValue(value);
}
function queryEditorCommand(editor, command) {
  if (command === "preview") return !editor.preview?.hidden;
  if (command === "source") return editor.sourceMode;
  if (editor.mode !== "html") return false;
  try {
    return document.queryCommandState(command);
  } catch {
    return false;
  }
}
function runEditorCommand(editor, command, value) {
  const custom = commandHandlers.get(command);
  if (custom) {
    void runEditorHooks("beforeCommand", { editor, value: editor.getValue(), command });
    custom({ editor, command, value });
    void runEditorHooks("afterCommand", { editor, value: editor.getValue(), command });
    return;
  }
  void runEditorHooks("beforeCommand", { editor, value: editor.getValue(), command });
  if (editor.mode === "html") {
    if (editor.surface instanceof HTMLTextAreaElement) {
      if (command === "undo") restoreHistory(editor, "undo");
      else if (command === "redo") restoreHistory(editor, "redo");
      else editor.setValue(applyHtmlSourceCommand(editor, command, value));
      void runEditorHooks("afterCommand", { editor, value: editor.getValue(), command });
      return;
    }
    editor.surface.focus();
    if (command === "undo") restoreHistory(editor, "undo");
    else if (command === "redo") restoreHistory(editor, "redo");
    else {
      if (command === "image") void runEditorHooks("uploadImage", { editor, value: imageValue(value).src });
      applyRichHtmlCommand(editor, command, value);
    }
    syncRichControlAttributes(editor.surface);
    editor.setValue(cleanEditorHtml(editor.surface.innerHTML));
    void runEditorHooks("afterCommand", { editor, value: editor.getValue(), command });
    return;
  }
  if (command === "undo") restoreHistory(editor, "undo");
  else if (command === "redo") restoreHistory(editor, "redo");
  else editor.setValue(applyMarkdownCommand(editor, command, value));
  void runEditorHooks("afterCommand", { editor, value: editor.getValue(), command });
}
function formatEditor(editor, command, value) {
  runEditorCommand(editor, command, value);
}
function syncPreview(instance) {
  if (!instance.preview) return;
  instance.preview.innerHTML = instance.mode === "markdown" ? markdownToHtml(instance.getValue()) : cleanEditorHtml(instance.getValue());
}
function openPreviewOverlay(editor, layout) {
  if (!editor.preview) return;
  syncPreview(editor);
  const backdrop = document.createElement("div");
  backdrop.className = "uif-editor-preview-backdrop";
  const panel = document.createElement("div");
  panel.className = layout === "drawer" ? "uif-editor-preview-drawer" : "uif-editor-preview-modal";
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-modal", "true");
  panel.innerHTML = `<div class="uif-editor-preview-head"><strong>Preview</strong><button type="button" class="uif-editor-preview-close" aria-label="Close preview">&times;</button></div><div class="uif-editor-preview-content">${editor.preview.innerHTML}</div>`;
  const close = () => {
    panel.remove();
    backdrop.remove();
    editor.surface.focus();
  };
  backdrop.addEventListener("click", close);
  const closeButton = panel.querySelector("button");
  closeButton?.addEventListener("click", close);
  closeButton?.addEventListener("keydown", (event) => {
    if (!(event instanceof KeyboardEvent) || event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    close();
  });
  document.addEventListener("keydown", function onKeydown(event) {
    if (event.key !== "Escape") return;
    document.removeEventListener("keydown", onKeydown);
    close();
  });
  document.body.append(backdrop, panel);
  panel.querySelector("button")?.focus();
}
function setEditorPreviewLayout(editor, layout) {
  editor.element.dataset.uifEditorLayout = layout;
  const body = editor.element.querySelector(".uif-editor-body");
  body?.classList.toggle("uif-editor-body-split", layout === "split");
  body?.classList.toggle("uif-editor-body-tabs", layout === "tabs");
  if (editor.mode === "markdown" && editor.preview) {
    syncPreview(editor);
    editor.surface.hidden = layout === "preview";
    editor.preview.hidden = layout === "source" || layout === "modal" || layout === "drawer";
    if (layout === "split") {
      editor.surface.hidden = false;
      editor.preview.hidden = false;
    }
    if (layout === "tabs") {
      editor.surface.hidden = !editor.sourceMode;
      editor.preview.hidden = editor.sourceMode;
    }
    editor.sourceMode = !editor.surface.hidden;
  }
  emit("uif:editor-layout-change", { editor, layout }, editor.element);
}
function formField(name, label, value = "", type = "text", placeholder = "") {
  return `<label class="uif-editor-dialog-field"><span>${escapeHtml(label)}</span><input class="uif-input" type="${type}" name="${escapeAttr(name)}" value="${escapeAttr(value)}"${placeholder ? ` placeholder="${escapeAttr(placeholder)}"` : ""}></label>`;
}
function currentLinkValue(editor) {
  const link = currentLink(editor);
  const selectedText = link ? "" : selectedRichText(editor, "");
  return {
    text: link?.textContent || selectedText,
    href: link?.getAttribute("href") || "",
    title: link?.getAttribute("title") || "",
    target: link?.getAttribute("target") === "_blank" ? "_blank" : "_self"
  };
}
function currentImageValue(editor) {
  const image = currentImage(editor);
  const figure = image?.closest("figure");
  return {
    src: image?.getAttribute("src") || "",
    alt: image?.getAttribute("alt") || "",
    caption: figure?.querySelector("figcaption")?.textContent || ""
  };
}
function positionEditorCommandDialog(dialog, anchor) {
  const margin = 8;
  const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
  dialog.style.removeProperty("right");
  dialog.style.removeProperty("bottom");
  if (viewportWidth <= 640) {
    dialog.dataset.uifEditorDialogPlacement = "sheet";
    dialog.style.left = `${margin}px`;
    dialog.style.right = `${margin}px`;
    dialog.style.top = "auto";
    dialog.style.bottom = `${margin}px`;
    return;
  }
  dialog.dataset.uifEditorDialogPlacement = "popover";
  const anchorRect = anchor?.getBoundingClientRect() || editorToolbarAnchorRect(dialog);
  const width = dialog.offsetWidth || 360;
  const height = dialog.offsetHeight || 240;
  const left = Math.min(Math.max(anchorRect.left, margin), Math.max(margin, viewportWidth - width - margin));
  const preferredTop = anchorRect.bottom + margin;
  const top = preferredTop + height > viewportHeight - margin ? Math.max(margin, anchorRect.top - height - margin) : preferredTop;
  dialog.style.left = `${left}px`;
  dialog.style.top = `${top}px`;
}
function editorToolbarAnchorRect(dialog) {
  const fallback = dialog.getBoundingClientRect();
  return new DOMRect(fallback.left, fallback.top, fallback.width, fallback.height);
}
function openEditorCommandDialog(editor, command, apply, anchor) {
  document.querySelectorAll(".uif-editor-dialog").forEach((existing) => existing.remove());
  const dialog = document.createElement("form");
  dialog.className = "uif-editor-dialog";
  dialog.setAttribute("role", "dialog");
  dialog.setAttribute("aria-label", editorCommandLabel(command));
  if (command === "link") {
    const link = editor.mode === "html" ? currentLinkValue(editor) : { text: "", href: "", title: "", target: "_self" };
    dialog.innerHTML = `<div class="uif-editor-dialog-grid">${formField("text", "Text", link.text, "text", "Link text")}${formField("href", "URL", link.href, "text", "https://example.com")}${formField("title", "Title", link.title, "text", "Optional title")}<label class="uif-editor-dialog-check"><input type="checkbox" name="blank"${link.target === "_blank" ? " checked" : ""}> Open in new tab</label></div>`;
  } else if (command === "image") {
    const image = editor.mode === "html" ? currentImageValue(editor) : { src: "", alt: "", caption: "" };
    dialog.innerHTML = `<div class="uif-editor-dialog-grid">${formField("src", "Image URL", image.src, "text", "/image.png")}${formField("alt", "Alt text", image.alt, "text", "Image description")}${formField("caption", "Caption", image.caption, "text", "Optional caption")}</div>`;
  } else if (command === "table") {
    dialog.innerHTML = `<div class="uif-editor-dialog-grid">${formField("rows", "Rows", "2", "number")}${formField("columns", "Columns", "2", "number")}<label class="uif-editor-dialog-check"><input type="checkbox" name="header" checked> Header row</label></div>`;
  }
  dialog.insertAdjacentHTML("beforeend", '<div class="uif-editor-dialog-actions"><button type="button" class="uif-btn uif-btn-secondary" data-uif-editor-dialog-cancel>Cancel</button><button type="submit" class="uif-btn">Apply</button></div>');
  const closeDialog = (restoreFocus = true) => {
    dialog.remove();
    document.removeEventListener("pointerdown", handleOutsidePointer, true);
    window.removeEventListener("resize", handleViewportChange);
    window.removeEventListener("scroll", handleViewportChange, true);
    if (restoreFocus) editor.focus();
  };
  const handleOutsidePointer = (event) => {
    const target = event.target instanceof Node ? event.target : null;
    if (!target || dialog.contains(target) || anchor?.contains(target)) return;
    closeDialog(false);
  };
  const handleViewportChange = () => positionEditorCommandDialog(dialog, anchor);
  dialog.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(dialog);
    if (command === "link") apply({ text: data.get("text"), href: data.get("href"), title: data.get("title"), target: data.get("blank") ? "_blank" : "_self" });
    if (command === "image") apply({ src: data.get("src"), alt: data.get("alt"), caption: data.get("caption") });
    if (command === "table") apply({ rows: data.get("rows"), columns: data.get("columns"), header: Boolean(data.get("header")) });
    closeDialog(false);
  });
  dialog.querySelector("[data-uif-editor-dialog-cancel]")?.addEventListener("click", () => {
    closeDialog();
  });
  dialog.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    event.preventDefault();
    closeDialog();
  });
  document.body.append(dialog);
  positionEditorCommandDialog(dialog, anchor);
  document.addEventListener("pointerdown", handleOutsidePointer, true);
  window.addEventListener("resize", handleViewportChange);
  window.addEventListener("scroll", handleViewportChange, true);
  dialog.querySelector("input")?.focus();
}
function createEditor(el, options = {}) {
  if (editors.has(el)) return editors.get(el);
  const input = asInput(el);
  const config = parseOptions(el, options);
  const wrapper = document.createElement("div");
  wrapper.className = "uif-editor";
  wrapper.dataset.uifMode = config.mode;
  const toolbar = document.createElement("div");
  toolbar.className = "uif-editor-toolbar";
  toolbar.setAttribute("role", "toolbar");
  const body = document.createElement("div");
  body.className = "uif-editor-body";
  const surface = config.mode === "markdown" || config.mode === "plain" ? document.createElement("textarea") : document.createElement("div");
  surface.className = config.mode === "markdown" || config.mode === "plain" ? "uif-editor-source" : "uif-editor-surface";
  surface.style.minHeight = config.height;
  if (config.placeholder) surface.setAttribute("aria-placeholder", config.placeholder);
  if (surface instanceof HTMLTextAreaElement) {
    surface.value = input.value;
    surface.spellcheck = true;
    surface.placeholder = config.placeholder;
  } else {
    surface.contentEditable = "true";
    surface.innerHTML = config.mode === "html" ? cleanEditorHtml(input.value) : escapeHtml(input.value);
  }
  const preview = document.createElement("div");
  preview.className = "uif-editor-preview";
  preview.hidden = config.preview === "none";
  const status = document.createElement("div");
  status.className = "uif-editor-status";
  status.setAttribute("role", "status");
  config.toolbar.forEach((command) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "uif-editor-button";
    button.dataset.uifEditorCommand = command;
    const label = editorCommandLabel(command);
    button.setAttribute("aria-label", label);
    button.title = label;
    button.innerHTML = `${editorCommandIcon(command)}<span class="uif-sr-only">${escapeHtml(label)}</span>`;
    if (command === "source") button.setAttribute("aria-pressed", String(config.mode !== "html"));
    if (command === "preview") button.setAttribute("aria-pressed", String(!preview.hidden));
    toolbar.append(button);
  });
  input.hidden = true;
  input.setAttribute("data-uif-editor-input", "true");
  input.insertAdjacentElement("afterend", wrapper);
  body.append(surface, preview);
  wrapper.append(toolbar, body);
  const tableTools = document.createElement("div");
  tableTools.className = "uif-editor-table-tools";
  tableTools.hidden = true;
  tableTools.innerHTML = [
    ["table-row-before", "Row before"],
    ["table-row-after", "Row"],
    ["table-col-before", "Column before"],
    ["table-col-after", "Column"],
    ["table-row-delete", "Delete row"],
    ["table-col-delete", "Delete column"],
    ["table-header-toggle", "Header"],
    ["table-delete", "Delete table"]
  ].map(([command, label]) => `<button type="button" class="uif-editor-tool-chip" data-uif-editor-command="${command}">${label}</button>`).join("");
  if (config.mode === "html") wrapper.append(tableTools);
  if (config.status) wrapper.append(status);
  const instance = {
    element: wrapper,
    mode: config.mode,
    input,
    surface,
    preview,
    status: config.status ? status : void 0,
    dirty: false,
    sourceMode: config.mode !== "html",
    getValue() {
      return input.value;
    },
    setValue(next) {
      const previous = input.value;
      if (previous !== next) pushHistory(instance, next);
      input.value = next;
      if (surface instanceof HTMLTextAreaElement && surface.value !== next) surface.value = next;
      if (!(surface instanceof HTMLTextAreaElement) && surface.innerHTML !== next) surface.innerHTML = config.mode === "html" ? cleanEditorHtml(next) : escapeHtml(next);
      instance.dirty = next !== editorInitialValue.get(instance);
      syncPreview(instance);
      updateStatus(instance);
      emit("uif:editor-change", { value: next, editor: instance }, wrapper);
      validateEditor(instance);
      if (config.autosave && instance.dirty) scheduleAutosave(instance, config.autosaveDelay, config.autosaveUrl || void 0);
    },
    focus() {
      surface.focus();
    },
    destroy() {
      wrapper.remove();
      input.hidden = false;
      editors.delete(el);
      editorListeners.get(instance)?.forEach((cleanup) => cleanup());
      const autosaveTimer = editorAutosaveTimers.get(instance);
      if (autosaveTimer) window.clearTimeout(autosaveTimer);
      editorListeners.delete(instance);
      emit("uif:editor-destroy", { editor: instance }, input);
    }
  };
  editorInitialValue.set(instance, input.value);
  editorHistory.set(instance, { undo: [], redo: [], last: input.value });
  editorListeners.set(instance, []);
  let savedRange = null;
  const saveRichSelection = () => {
    if (surface instanceof HTMLTextAreaElement || instance.surface !== surface) return;
    const selection = document.getSelection();
    if (!selection?.rangeCount) return;
    const range = selection.getRangeAt(0);
    if (!surface.contains(range.commonAncestorContainer)) return;
    savedRange = range.cloneRange();
  };
  const restoreRichSelection = () => {
    if (!savedRange || surface instanceof HTMLTextAreaElement || instance.surface !== surface) return;
    const selection = document.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(savedRange);
  };
  const syncFromSurface = () => {
    if (!(surface instanceof HTMLTextAreaElement)) syncRichControlAttributes(surface);
    const value = surface instanceof HTMLTextAreaElement ? surface.value : cleanEditorHtml(surface.innerHTML);
    void runEditorHooks("beforeInput", { editor: instance, value });
    instance.setValue(value);
    void runEditorHooks("afterInput", { editor: instance, value });
  };
  const updateActiveTableCell = (target) => {
    const cell = target instanceof Element ? target.closest("td,th") : null;
    if (cell && surface.contains(cell)) editorActiveTableCell.set(instance, cell);
  };
  const updateTableTools = (target) => {
    if (config.mode !== "html") return;
    updateActiveTableCell(target ?? null);
    const cell = currentTableCell() ?? editorActiveTableCell.get(instance) ?? null;
    tableTools.hidden = !cell?.closest("table");
  };
  surface.addEventListener("input", syncFromSurface);
  surface.addEventListener("change", syncFromSurface);
  surface.addEventListener("keyup", (event) => {
    saveRichSelection();
    updateTableTools(event.target);
  });
  surface.addEventListener("mouseup", (event) => {
    saveRichSelection();
    updateTableTools(event.target);
  });
  surface.addEventListener("focus", () => emit("uif:editor-focus", { editor: instance }, wrapper));
  surface.addEventListener("blur", () => emit("uif:editor-blur", { editor: instance }, wrapper));
  toolbar.addEventListener("mousedown", (event) => {
    if (event.target instanceof Element && event.target.closest("[data-uif-editor-command]")) event.preventDefault();
  });
  toolbar.addEventListener("keydown", (event) => {
    if (!(event instanceof KeyboardEvent)) return;
    if (event.key !== "Enter" && event.key !== " ") return;
    const button = event.target instanceof Element ? event.target.closest("[data-uif-editor-command]") : null;
    if (!button) return;
    event.preventDefault();
    button.click();
  });
  toolbar.addEventListener("click", (event) => {
    const button = event.target instanceof Element ? event.target.closest("[data-uif-editor-command]") : null;
    const command = button?.dataset.uifEditorCommand;
    if (!button || !command) return;
    if (command === "preview") {
      const layout = instance.element.dataset.uifEditorLayout ?? config.layout;
      if (config.mode === "markdown" && (layout === "modal" || layout === "drawer")) {
        openPreviewOverlay(instance, layout);
        return;
      }
      void runEditorHooks("beforePreview", { editor: instance, value: instance.getValue(), command });
      preview.hidden = !preview.hidden;
      button.setAttribute("aria-pressed", String(!preview.hidden));
      syncPreview(instance);
      emit("uif:editor-preview", { editor: instance, visible: !preview.hidden }, wrapper);
      void runEditorHooks("afterPreview", { editor: instance, value: instance.getValue(), command });
      return;
    }
    if (command === "source" && config.mode === "html") {
      instance.sourceMode = !instance.sourceMode;
      button.setAttribute("aria-pressed", String(instance.sourceMode));
      if (instance.sourceMode) {
        const source = document.createElement("textarea");
        source.className = "uif-editor-source";
        source.style.minHeight = config.height;
        source.value = instance.getValue();
        body.replaceChild(source, surface);
        instance.surface = source;
        source.addEventListener("input", () => instance.setValue(source.value));
        source.focus();
      } else {
        body.replaceChild(surface, instance.surface);
        instance.surface = surface;
        surface.innerHTML = cleanEditorHtml(instance.getValue());
        surface.focus();
      }
      emit("uif:editor-mode-change", { editor: instance, source: instance.sourceMode }, wrapper);
      return;
    }
    if (command === "source" && config.mode === "markdown") {
      instance.sourceMode = !instance.sourceMode;
      button.setAttribute("aria-pressed", String(instance.sourceMode));
      surface.hidden = !instance.sourceMode;
      preview.hidden = instance.sourceMode;
      if (instance.sourceMode) {
        surface.focus();
      } else {
        syncPreview(instance);
        preview.tabIndex = 0;
        preview.focus();
      }
      emit("uif:editor-mode-change", { editor: instance, source: instance.sourceMode }, wrapper);
      return;
    }
    emit("uif:editor-command", { editor: instance, command }, wrapper);
    restoreRichSelection();
    if ((command === "link" || command === "image" || command === "table") && !(event instanceof CustomEvent)) {
      openEditorCommandDialog(instance, command, (value) => {
        restoreRichSelection();
        formatEditor(instance, command, value);
        saveRichSelection();
        updateTableTools();
      }, button);
      return;
    }
    formatEditor(instance, command);
    saveRichSelection();
    updateTableTools();
  });
  tableTools.addEventListener("click", (event) => {
    const button = event.target instanceof Element ? event.target.closest("[data-uif-editor-command]") : null;
    const command = button?.dataset.uifEditorCommand;
    if (!command) return;
    restoreRichSelection();
    formatEditor(instance, command);
    saveRichSelection();
    updateTableTools();
  });
  tableTools.addEventListener("mousedown", (event) => {
    if (event.target instanceof Element && event.target.closest("[data-uif-editor-command]")) event.preventDefault();
  });
  surface.addEventListener("keydown", (event) => {
    if (!(event instanceof KeyboardEvent)) return;
    if (surface instanceof HTMLTextAreaElement && handleMarkdownTaskKey(surface, event)) {
      syncFromSurface();
      return;
    }
    if (!(surface instanceof HTMLTextAreaElement) && handleRichTaskKey(instance, event)) {
      syncFromSurface();
      return;
    }
    const key = event.key.toLowerCase();
    if (!(event.metaKey || event.ctrlKey)) return;
    if (key === "b") {
      event.preventDefault();
      formatEditor(instance, "bold");
    }
    if (key === "i") {
      event.preventDefault();
      formatEditor(instance, "italic");
    }
    if (key === "k") {
      event.preventDefault();
      formatEditor(instance, "link");
    }
    if (key === "z" && event.shiftKey) {
      event.preventDefault();
      formatEditor(instance, "redo");
    } else if (key === "z") {
      event.preventDefault();
      formatEditor(instance, "undo");
    }
  });
  surface.addEventListener("paste", () => {
    void runEditorHooks("beforePaste", { editor: instance, value: instance.getValue() });
    window.setTimeout(() => {
      syncFromSurface();
      void runEditorHooks("afterPaste", { editor: instance, value: instance.getValue() });
    });
  });
  editors.set(el, instance);
  instance.setValue(input.value);
  setEditorPreviewLayout(instance, config.layout);
  emit("uif:editor-init", { editor: instance }, wrapper);
  return instance;
}
function initEditor(el, options) {
  return createEditor(el, options);
}
function getEditorValue(editor) {
  return editor.getValue();
}
function setEditorValue(editor, value) {
  editor.setValue(value);
}
export {
  cleanEditorHtml,
  createEditor,
  escapeHtml,
  formatEditor,
  getEditorValue,
  htmlToMarkdown,
  initEditor,
  markdownToHtml,
  queryEditorCommand,
  registerEditorCommand,
  registerEditorHook,
  runEditorCommand,
  setEditorPreviewLayout,
  setEditorValue,
  unregisterEditorCommand,
  validateEditor
};
