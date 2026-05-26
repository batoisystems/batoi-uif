// src/index.ts
import { emit } from "@batoi/uif-core";
var editors = /* @__PURE__ */ new WeakMap();
var defaultToolbar = ["bold", "italic", "heading", "quote", "code", "ul", "ol", "link", "preview"];
function escapeHtml(value) {
  return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}
function escapeAttr(value) {
  return escapeHtml(value).replaceAll("`", "&#96;");
}
function linesToList(lines, ordered) {
  const tag = ordered ? "ol" : "ul";
  const items = lines.map((line) => line.replace(ordered ? /^\s*\d+\.\s+/ : /^\s*[-*+]\s+/, "")).map((line) => `<li>${inlineMarkdown(line)}</li>`).join("");
  return `<${tag}>${items}</${tag}>`;
}
function inlineMarkdown(value) {
  let output = escapeHtml(value);
  output = output.replace(/`([^`]+)`/g, "<code>$1</code>");
  output = output.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  output = output.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  output = output.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+|mailto:[^)\s]+|\/[^)\s]*)\)/g, (_match, label, url) => {
    return `<a href="${escapeAttr(url)}">${escapeHtml(label)}</a>`;
  });
  return output;
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
    if (/^\s*[-*+]\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*[-*+]\s+/.test(lines[i] ?? "")) {
        items.push(lines[i] ?? "");
        i += 1;
      }
      blocks.push(linesToList(items, false));
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
  doc.querySelectorAll("code").forEach((el) => el.replaceWith(`\`${el.textContent ?? ""}\``));
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
      if ((attr.name === "href" || attr.name === "src") && /^\s*javascript:/i.test(attr.value)) el.removeAttribute(attr.name);
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
  return {
    mode: options.mode ?? el.dataset.uifMode ?? "html",
    toolbar: options.toolbar ?? el.dataset.uifToolbar?.split(/\s+/).filter(Boolean) ?? defaultToolbar,
    preview: options.preview ?? el.dataset.uifPreview ?? "manual",
    height: options.height ?? el.dataset.uifEditorHeight ?? "14rem"
  };
}
function applyMarkdownCommand(value, command) {
  if (command === "bold") return `${value}**bold text**`;
  if (command === "italic") return `${value}*italic text*`;
  if (command === "heading") return `${value}
## Heading`;
  if (command === "quote") return `${value}
> Quote`;
  if (command === "code") return `${value}
\`\`\`
code
\`\`\``;
  if (command === "ul") return `${value}
- Item`;
  if (command === "ol") return `${value}
1. Item`;
  if (command === "link") return `${value}[link](https://example.com)`;
  if (command === "clear") return "";
  return value;
}
function formatEditor(editor, command, value) {
  if (editor.mode === "html") {
    editor.surface.focus();
    if (command === "heading") document.execCommand("formatBlock", false, value || "h2");
    else if (command === "quote") document.execCommand("formatBlock", false, "blockquote");
    else if (command === "code") document.execCommand("formatBlock", false, "pre");
    else if (command === "ul") document.execCommand("insertUnorderedList");
    else if (command === "ol") document.execCommand("insertOrderedList");
    else if (command === "link") document.execCommand("createLink", false, value || "#");
    else if (command === "clear") document.execCommand("removeFormat");
    else document.execCommand(command);
    editor.setValue(cleanEditorHtml(editor.surface.innerHTML));
    return;
  }
  editor.setValue(applyMarkdownCommand(editor.getValue(), command));
}
function syncPreview(instance) {
  if (!instance.preview) return;
  instance.preview.innerHTML = instance.mode === "markdown" ? markdownToHtml(instance.getValue()) : cleanEditorHtml(instance.getValue());
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
  const surface = config.mode === "markdown" || config.mode === "plain" ? document.createElement("textarea") : document.createElement("div");
  surface.className = config.mode === "markdown" || config.mode === "plain" ? "uif-editor-source" : "uif-editor-surface";
  surface.style.minHeight = config.height;
  if (surface instanceof HTMLTextAreaElement) {
    surface.value = input.value;
    surface.spellcheck = true;
  } else {
    surface.contentEditable = "true";
    surface.innerHTML = config.mode === "html" ? cleanEditorHtml(input.value) : escapeHtml(input.value);
  }
  const preview = document.createElement("div");
  preview.className = "uif-editor-preview";
  preview.hidden = config.preview === "none";
  config.toolbar.forEach((command) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "uif-editor-button";
    button.dataset.uifEditorCommand = command;
    button.setAttribute("aria-label", command);
    button.textContent = command;
    toolbar.append(button);
  });
  input.hidden = true;
  input.setAttribute("data-uif-editor-input", "true");
  input.insertAdjacentElement("afterend", wrapper);
  wrapper.append(toolbar, surface, preview);
  const instance = {
    element: wrapper,
    mode: config.mode,
    input,
    surface,
    preview,
    getValue() {
      return input.value;
    },
    setValue(next) {
      input.value = next;
      if (surface instanceof HTMLTextAreaElement && surface.value !== next) surface.value = next;
      if (!(surface instanceof HTMLTextAreaElement) && surface.innerHTML !== next) surface.innerHTML = config.mode === "html" ? cleanEditorHtml(next) : escapeHtml(next);
      syncPreview(instance);
      emit("uif:editor-change", { value: next, editor: instance }, wrapper);
    },
    focus() {
      surface.focus();
    },
    destroy() {
      wrapper.remove();
      input.hidden = false;
      editors.delete(el);
      emit("uif:editor-destroy", { editor: instance }, input);
    }
  };
  const syncFromSurface = () => {
    const value = surface instanceof HTMLTextAreaElement ? surface.value : cleanEditorHtml(surface.innerHTML);
    instance.setValue(value);
  };
  surface.addEventListener("input", syncFromSurface);
  toolbar.addEventListener("click", (event) => {
    const button = event.target instanceof HTMLElement ? event.target.closest("[data-uif-editor-command]") : null;
    const command = button?.dataset.uifEditorCommand;
    if (!command) return;
    if (command === "preview") {
      preview.hidden = !preview.hidden;
      syncPreview(instance);
      return;
    }
    formatEditor(instance, command);
  });
  surface.addEventListener("paste", () => window.setTimeout(syncFromSurface));
  editors.set(el, instance);
  instance.setValue(input.value);
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
  setEditorValue
};
