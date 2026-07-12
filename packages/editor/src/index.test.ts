import { describe, expect, it, vi } from 'vitest';
import { htmlSanitizationFixtures, markdownRenderingFixtures } from './fixtures/editor.fixtures.js';
import { cleanEditorHtml, createEditor, escapeHtml, htmlToMarkdown, markdownDiagnostics, markdownToHtml, parseMarkdown, registerEditorHook, renderMarkdown, runEditorCommand, setEditorPreviewLayout, validateEditor } from './index.js';

function currentSelectionCellText(): string | null {
  const selection = document.getSelection();
  const node = selection?.rangeCount ? selection.getRangeAt(0).commonAncestorContainer : null;
  const element = node instanceof Element ? node : node?.parentElement;
  return element?.closest('td,th')?.textContent ?? null;
}

describe('@batoi/uif-editor', () => {
  it.each(htmlSanitizationFixtures)('sanitizes fixture: $name', ({ input, expected }) => {
    expect(cleanEditorHtml(input)).toBe(expected);
  });

  it.each(markdownRenderingFixtures)('renders fixture: $name', ({ input, contains, excludes }) => {
    const html = markdownToHtml(input);
    contains.forEach((value) => expect(html).toContain(value));
    excludes.forEach((value) => expect(html).not.toContain(value));
  });

  it('escapes HTML and renders a Markdown subset', () => {
    expect(escapeHtml('<script>x</script>')).toBe('&lt;script&gt;x&lt;/script&gt;');
    const html = markdownToHtml('# Title\n\n**Bold** and *em*\n\n- One\n- Two\n\n[site](https://example.com)');
    expect(html).toContain('<h1>Title</h1>');
    expect(html).toContain('<strong>Bold</strong>');
    expect(html).toContain('<ul><li>One</li><li>Two</li></ul>');
    expect(html).toContain('<a href="https://example.com">site</a>');
  });

  it('renders practical Markdown extensions', () => {
    const html = markdownToHtml('~~Old~~\n\n- [x] Done\n\n| A | B |\n| --- | --- |\n| 1 | 2 |');
    expect(html).toContain('<del>Old</del>');
    expect(html).toContain('uif-task-list');
    expect(html).toContain('<table>');
  });

  it('renders nested and mixed Markdown lists without flattening indentation', () => {
    const html = markdownToHtml('- One\n  - Two\n    3. Three\n- Four');
    expect(html).toBe('<ul><li>One<ul><li>Two<ol start="3"><li>Three</li></ol></li></ul></li><li>Four</li></ul>');
  });

  it('renders fenced-code languages, escapes, nested inline formatting, and table alignment', () => {
    const html = markdownToHtml('```ts\nconst value = "<safe>";\n```\n\n\\*literal\\* and **bold *inside***\n\n| Left | Center | Right |\n| :--- | :---: | ---: |\n| A | B | C |');
    expect(html).toContain('<code class="language-ts">const value = &quot;&lt;safe&gt;&quot;;</code>');
    expect(html).toContain('*literal* and <strong>bold <em>inside</em></strong>');
    expect(html).toContain('<th class="uif-text-center">Center</th>');
    expect(html).toContain('<td class="uif-text-right">C</td>');
  });

  it('reports Markdown diagnostics and enforces parser limits', () => {
    expect(markdownDiagnostics('```js\nconst open = true;')).toContainEqual(expect.objectContaining({ code: 'markdown-unclosed-fence', severity: 'error' }));
    expect(markdownDiagnostics('<script>alert(1)</script>')).toContainEqual(expect.objectContaining({ code: 'markdown-raw-html-escaped' }));
    expect(markdownToHtml('<script>alert(1)</script>')).toBe('<p>&lt;script&gt;alert(1)&lt;/script&gt;</p>');
    const limited = parseMarkdown('123456', { maxInputLength: 4 });
    expect(limited.truncated).toBe(true);
    expect(limited.diagnostics).toContainEqual(expect.objectContaining({ code: 'markdown-input-limit' }));
    const nestedQuote = parseMarkdown(`${'> '.repeat(20)}Deep`, { maxNesting: 4 });
    expect(nestedQuote.diagnostics).toContainEqual(expect.objectContaining({ code: 'markdown-nesting-limit' }));
  });

  it('renders optional Markdown source-line markers', () => {
    const html = renderMarkdown(parseMarkdown('# Heading\n\nBody'), { sourceMap: true });
    expect(html).toContain('<h1 data-uif-md-line="1" data-uif-md-line-end="1">Heading</h1>');
    expect(html).toContain('<p data-uif-md-line="3" data-uif-md-line-end="3">Body</p>');
    expect(markdownToHtml('# Heading')).not.toContain('data-uif-md-line');
  });

  it('cleans dangerous HTML convenience cases', () => {
    expect(cleanEditorHtml('<p onclick="x()">Hi<script>x</script><a href="javascript:x">bad</a></p>')).toBe('<p>Hi<a>bad</a></p>');
  });

  it('uses an allowlist for editor HTML and URL-bearing attributes', () => {
    const html = cleanEditorHtml('<form action="/steal"><input name="token"></form><svg><a xlink:href="javascript:alert(1)">bad</a></svg><p style="color:red">Safe <img src="data:image/svg+xml,bad" srcset="/a 1x" onerror="alert(1)"></p>');
    expect(html).toBe('<p>Safe <img></p>');
  });

  it('sanitizes programmatic rich HTML values before synchronizing the form field', () => {
    document.body.innerHTML = '<textarea data-uif="editor" data-uif-mode="html"><p>Draft</p></textarea>';
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    const editor = createEditor(textarea);
    editor.setValue('<p onclick="bad()">Saved <a href="javascript:bad()">link</a></p><iframe src="/bad"></iframe>');
    expect(editor.getValue()).toBe('<p>Saved <a>link</a></p>');
    expect(textarea.value).toBe('<p>Saved <a>link</a></p>');
  });

  it('treats sanitized initial rich HTML as the clean baseline', () => {
    document.body.innerHTML = '<textarea data-uif="editor" data-uif-mode="html"><p onclick="bad()">Draft</p></textarea>';
    const editor = createEditor(document.querySelector('textarea') as HTMLTextAreaElement);
    expect(editor.getValue()).toBe('<p>Draft</p>');
    expect(editor.dirty).toBe(false);
    expect(editor.element.dataset.uifAutosaveState).toBeUndefined();
  });

  it('converts simple HTML to Markdown text', () => {
    expect(htmlToMarkdown('<h2>Intro</h2><p><strong>Bold</strong></p>')).toContain('## Intro');
  });

  it('creates an editor and syncs original field value', () => {
    document.body.innerHTML = '<textarea data-uif="editor" data-uif-mode="markdown"># Draft</textarea>';
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    const editor = createEditor(textarea);
    editor.setValue('Updated');
    expect(textarea.value).toBe('Updated');
    expect(editor.preview?.innerHTML).toContain('Updated');
  });

  it('renders icon-only toolbar buttons with accessible titles', () => {
    document.body.innerHTML = '<textarea data-uif="editor" data-uif-mode="markdown" data-uif-toolbar="bold italic preview">Draft</textarea>';
    const editor = createEditor(document.querySelector('textarea') as HTMLTextAreaElement);
    const buttons = [...editor.element.querySelectorAll<HTMLButtonElement>('.uif-editor-button')];
    expect(buttons).toHaveLength(3);
    expect(buttons[0].title).toBe('Bold');
    expect(buttons[0].getAttribute('aria-label')).toBe('Bold');
    expect(buttons[0].querySelector('svg')).not.toBeNull();
    expect(buttons[0].textContent?.trim()).toBe('Bold');
    const toolbar = editor.element.querySelector('[role="toolbar"]') as HTMLElement;
    expect(toolbar.getAttribute('aria-label')).toBe('Editor formatting');
    expect(toolbar.getAttribute('aria-controls')).toBe(editor.surface.id);
  });

  it('announces active rich formatting changes', () => {
    document.body.innerHTML = '<textarea data-uif="editor" data-uif-mode="html" data-uif-preview="none" data-uif-toolbar="bold"><p>Draft</p></textarea>';
    const editor = createEditor(document.querySelector('textarea') as HTMLTextAreaElement);
    const text = editor.surface.querySelector('p')?.firstChild as Text;
    const range = document.createRange();
    range.selectNodeContents(text);
    document.getSelection()?.removeAllRanges();
    document.getSelection()?.addRange(range);

    editor.element.querySelector<HTMLButtonElement>('[data-uif-editor-command="bold"]')?.click();

    expect(editor.element.querySelector('[aria-live="polite"]')?.textContent).toBe('Bold on');
  });

  it('uses roving focus for toolbar keyboard navigation', () => {
    document.body.innerHTML = '<textarea data-uif="editor" data-uif-mode="markdown" data-uif-toolbar="bold italic preview">Draft</textarea>';
    const editor = createEditor(document.querySelector('textarea') as HTMLTextAreaElement);
    const buttons = [...editor.element.querySelectorAll<HTMLButtonElement>('.uif-editor-button')];
    expect(buttons.map((button) => button.tabIndex)).toEqual([0, -1, -1]);
    buttons[0].focus();
    buttons[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true }));
    expect(document.activeElement).toBe(buttons[1]);
    expect(buttons.map((button) => button.tabIndex)).toEqual([-1, 0, -1]);
    buttons[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true, cancelable: true }));
    expect(document.activeElement).toBe(buttons[2]);
  });

  it('exposes Markdown diagnostics through editor state', () => {
    document.body.innerHTML = '<textarea data-uif="editor" data-uif-mode="markdown" data-uif-editor-status="true">```js\nopen</textarea>';
    const editor = createEditor(document.querySelector('textarea') as HTMLTextAreaElement);
    expect(editor.diagnostics).toContainEqual(expect.objectContaining({ code: 'markdown-unclosed-fence' }));
    expect(editor.element.dataset.uifEditorDiagnostics).toBe('1');
    expect(editor.status?.textContent).toContain('1 issue');
  });

  it('reports source line and column while the source surface is visible', () => {
    document.body.innerHTML = '<textarea data-uif="editor" data-uif-mode="markdown" data-uif-editor-layout="source" data-uif-editor-status="true">First\nSecond</textarea>';
    const editor = createEditor(document.querySelector('textarea') as HTMLTextAreaElement);
    const source = editor.surface as HTMLTextAreaElement;
    source.setSelectionRange(8, 8);
    source.dispatchEvent(new Event('select', { bubbles: true }));
    expect(editor.status?.textContent).toContain('Line 2, column 3');

    document.body.innerHTML = '<textarea data-uif="editor" data-uif-mode="html" data-uif-editor-status="true" data-uif-toolbar="source"><p>First</p>\n<p>Second</p></textarea>';
    const rich = createEditor(document.querySelector('textarea') as HTMLTextAreaElement);
    expect(rich.status?.textContent).not.toContain('Line ');
    rich.element.querySelector<HTMLButtonElement>('[data-uif-editor-command="source"]')?.click();
    const htmlSource = rich.surface as HTMLTextAreaElement;
    htmlSource.setSelectionRange(htmlSource.value.indexOf('Second') + 2, htmlSource.value.indexOf('Second') + 2);
    htmlSource.dispatchEvent(new Event('select', { bubbles: true }));
    expect(rich.status?.textContent).toContain('Line 2, column 6');
  });

  it('defaults HTML editor to rich mode and toggles source mode explicitly', () => {
    document.body.innerHTML = '<textarea data-uif="editor" data-uif-mode="html" data-uif-preview="none" data-uif-toolbar="source"><h2>Draft</h2></textarea>';
    const editor = createEditor(document.querySelector('textarea') as HTMLTextAreaElement);
    const button = editor.element.querySelector<HTMLButtonElement>('[data-uif-editor-command="source"]') as HTMLButtonElement;
    const icon = button.querySelector('svg') as SVGElement;
    expect(editor.sourceMode).toBe(false);
    expect(editor.surface instanceof HTMLTextAreaElement).toBe(false);
    icon.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(editor.sourceMode).toBe(true);
    expect(editor.surface instanceof HTMLTextAreaElement).toBe(true);
    expect(button.getAttribute('aria-pressed')).toBe('true');
    button.click();
    expect(editor.sourceMode).toBe(false);
    expect(editor.surface instanceof HTMLTextAreaElement).toBe(false);
    expect(button.getAttribute('aria-pressed')).toBe('false');
  });

  it('preserves rich text selection when toolbar buttons are clicked', () => {
    document.body.innerHTML = '<textarea data-uif="editor" data-uif-mode="html" data-uif-preview="none" data-uif-toolbar="bold"><p>Alpha Beta</p></textarea>';
    const editor = createEditor(document.querySelector('textarea') as HTMLTextAreaElement);
    const text = editor.surface.querySelector('p')?.firstChild as Text;
    const range = document.createRange();
    range.setStart(text, 6);
    range.setEnd(text, 10);
    document.getSelection()?.removeAllRanges();
    document.getSelection()?.addRange(range);
    editor.surface.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    document.getSelection()?.removeAllRanges();

    const button = editor.element.querySelector<HTMLButtonElement>('[data-uif-editor-command="bold"]') as HTMLButtonElement;
    const mouseDown = new MouseEvent('mousedown', { bubbles: true, cancelable: true });
    button.dispatchEvent(mouseDown);
    button.click();

    expect(mouseDown.defaultPrevented).toBe(true);
    expect(editor.getValue()).toContain('Alpha <strong>Beta</strong>');
  });

  it('toggles existing rich inline formatting off for selected text', () => {
    document.body.innerHTML = '<textarea data-uif="editor" data-uif-mode="html" data-uif-preview="none"><p><strong>Bold</strong> <em>Italic</em> <u>Underline</u> <s>Strike</s></p></textarea>';
    const editor = createEditor(document.querySelector('textarea') as HTMLTextAreaElement);
    const selectContents = (selector: string) => {
      const element = editor.surface.querySelector(selector) as HTMLElement;
      const range = document.createRange();
      range.selectNodeContents(element);
      document.getSelection()?.removeAllRanges();
      document.getSelection()?.addRange(range);
    };

    selectContents('strong');
    runEditorCommand(editor, 'bold');
    expect(editor.getValue()).toContain('<p>Bold <em>Italic</em> <u>Underline</u> <s>Strike</s></p>');

    selectContents('em');
    runEditorCommand(editor, 'italic');
    expect(editor.getValue()).toContain('Bold Italic <u>Underline</u> <s>Strike</s>');

    selectContents('u');
    runEditorCommand(editor, 'underline');
    expect(editor.getValue()).toContain('Bold Italic Underline <s>Strike</s>');

    selectContents('s');
    runEditorCommand(editor, 'strike');
    expect(editor.getValue()).toContain('<p>Bold Italic Underline Strike</p>');
  });

  it('removes rich inline formatting inside a mixed selection', () => {
    document.body.innerHTML = '<textarea data-uif="editor" data-uif-mode="html" data-uif-preview="none"><p>Alpha <strong>Beta</strong> Gamma</p></textarea>';
    const editor = createEditor(document.querySelector('textarea') as HTMLTextAreaElement);
    const paragraph = editor.surface.querySelector('p') as HTMLParagraphElement;
    const range = document.createRange();
    range.selectNodeContents(paragraph);
    document.getSelection()?.removeAllRanges();
    document.getSelection()?.addRange(range);

    runEditorCommand(editor, 'bold');

    expect(editor.getValue()).toBe('<p>Alpha Beta Gamma</p>');
  });

  it('runs HTML source mode toolbar commands against the source textarea', () => {
    document.body.innerHTML = '<textarea data-uif="editor" data-uif-mode="html" data-uif-preview="none" data-uif-toolbar="source bold"><p>Draft</p></textarea>';
    const editor = createEditor(document.querySelector('textarea') as HTMLTextAreaElement);
    const sourceButton = editor.element.querySelector<HTMLButtonElement>('[data-uif-editor-command="source"]') as HTMLButtonElement;
    sourceButton.click();
    const source = editor.surface as HTMLTextAreaElement;
    source.setSelectionRange(3, 8);

    runEditorCommand(editor, 'bold');

    expect(editor.getValue()).toContain('<strong>Draft</strong>');
    expect(source.value).toContain('<strong>Draft</strong>');
  });

  it('keeps HTML source edits and programmatic values in sync when toggling back to rich mode', () => {
    document.body.innerHTML = '<textarea data-uif="editor" data-uif-mode="html" data-uif-preview="none" data-uif-toolbar="source"><p>Draft</p></textarea>';
    const editor = createEditor(document.querySelector('textarea') as HTMLTextAreaElement);
    const sourceButton = editor.element.querySelector<HTMLButtonElement>('[data-uif-editor-command="source"]') as HTMLButtonElement;
    sourceButton.click();
    const source = editor.surface as HTMLTextAreaElement;

    source.value = '<h2>Edited</h2><p>Body</p>';
    source.dispatchEvent(new Event('input', { bubbles: true }));
    expect(editor.getValue()).toBe('<h2>Edited</h2><p>Body</p>');

    editor.setValue('<p>External update</p>');
    expect((editor.surface as HTMLTextAreaElement).value).toBe('<p>External update</p>');

    sourceButton.click();
    expect(editor.surface instanceof HTMLTextAreaElement).toBe(false);
    expect(editor.surface.innerHTML).toBe('<p>External update</p>');
  });

  it('preserves rich selection and scroll across source edits and repeated toggles', () => {
    document.body.innerHTML = '<textarea data-uif="editor" data-uif-mode="html" data-uif-preview="none" data-uif-toolbar="source"><p>Alpha <strong>Beta</strong> Gamma</p></textarea>';
    const editor = createEditor(document.querySelector('textarea') as HTMLTextAreaElement);
    const sourceButton = editor.element.querySelector<HTMLButtonElement>('[data-uif-editor-command="source"]') as HTMLButtonElement;
    const text = editor.surface.querySelector('strong')?.firstChild as Text;
    const range = document.createRange();
    range.selectNodeContents(text);
    document.getSelection()?.removeAllRanges();
    document.getSelection()?.addRange(range);
    editor.surface.scrollTop = 72;
    editor.surface.scrollLeft = 9;

    sourceButton.click();
    const source = editor.surface as HTMLTextAreaElement;
    expect(source.value.slice(source.selectionStart, source.selectionEnd)).toBe('Beta');
    source.value = '<p>Alpha <em>Beta</em> Gamma</p>';
    source.dispatchEvent(new Event('input', { bubbles: true }));
    sourceButton.click();

    expect(document.getSelection()?.toString()).toBe('Beta');
    expect(editor.surface.scrollTop).toBe(72);
    expect(editor.surface.scrollLeft).toBe(9);

    sourceButton.click();
    sourceButton.click();
    expect(editor.getValue()).toBe('<p>Alpha <em>Beta</em> Gamma</p>');
    expect(document.getSelection()?.toString()).toBe('Beta');
  });

  it('reports source normalization instead of silently changing HTML', () => {
    document.body.innerHTML = '<textarea data-uif="editor" data-uif-mode="html" data-uif-preview="none" data-uif-toolbar="source"><p>Draft</p></textarea>';
    const editor = createEditor(document.querySelector('textarea') as HTMLTextAreaElement);
    const sourceButton = editor.element.querySelector<HTMLButtonElement>('[data-uif-editor-command="source"]') as HTMLButtonElement;
    let detail: { normalized: string; source: string } | undefined;
    editor.element.addEventListener('uif:editor-normalize', (event) => { detail = (event as CustomEvent).detail; });

    sourceButton.click();
    const source = editor.surface as HTMLTextAreaElement;
    source.value = '<p onclick="bad()">Draft</p><script>alert(1)</script>';
    source.dispatchEvent(new Event('input', { bubbles: true }));
    expect(editor.diagnostics).toContainEqual(expect.objectContaining({ code: 'html-source-normalized', line: 1, severity: 'warning' }));
    expect(editor.element.dataset.uifEditorDiagnostics).toBe('1');
    sourceButton.click();

    expect(detail?.source).toContain('onclick');
    expect(detail?.normalized).toBe('<p>Draft</p>');
    expect(editor.getValue()).toBe('<p>Draft</p>');
    expect(editor.diagnostics).toEqual([]);
  });

  it('runs paste hooks and keyboard shortcuts against the active HTML source surface', async () => {
    document.body.innerHTML = '<textarea data-uif="editor" data-uif-mode="html" data-uif-preview="none" data-uif-toolbar="source"><p>Draft</p></textarea>';
    const afterPasteValues: string[] = [];
    const unregister = registerEditorHook('afterPaste', ({ value }) => afterPasteValues.push(value));
    const editor = createEditor(document.querySelector('textarea') as HTMLTextAreaElement);
    editor.element.querySelector<HTMLButtonElement>('[data-uif-editor-command="source"]')?.click();
    const source = editor.surface as HTMLTextAreaElement;

    source.value = '<p>Paste</p>';
    source.dispatchEvent(new Event('paste', { bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 1));
    expect(afterPasteValues).toContain('<p>Paste</p>');

    source.setSelectionRange(3, 8);
    source.dispatchEvent(new KeyboardEvent('keydown', { key: 'b', ctrlKey: true, bubbles: true, cancelable: true }));
    expect(editor.getValue()).toContain('<strong>Paste</strong>');
    unregister();
  });

  it('inserts robust HTML toolbar content without native insertion commands', () => {
    document.body.innerHTML = '<textarea data-uif="editor" data-uif-mode="html" data-uif-preview="none" data-uif-toolbar="link image table task"><p>Draft</p></textarea>';
    const editor = createEditor(document.querySelector('textarea') as HTMLTextAreaElement);
    const range = document.createRange();
    range.selectNodeContents(editor.surface);
    range.collapse(false);
    document.getSelection()?.removeAllRanges();
    document.getSelection()?.addRange(range);

    runEditorCommand(editor, 'link', 'https://example.com');
    runEditorCommand(editor, 'image', '/logo.png');
    runEditorCommand(editor, 'table');
    runEditorCommand(editor, 'task');

    expect(editor.getValue()).toContain('<a href="https://example.com">Link text</a>');
    expect(editor.getValue()).toContain('<img src="/logo.png" alt="Image">');
    expect(editor.getValue()).toContain('<table>');
    expect(editor.getValue()).toContain('type="checkbox"');
  });

  it('opens WYSIWYG link, image, and table dialogs from toolbar clicks', () => {
    document.body.innerHTML = '<textarea data-uif="editor" data-uif-mode="html" data-uif-preview="none" data-uif-toolbar="link image table"><p>Draft</p></textarea>';
    const editor = createEditor(document.querySelector('textarea') as HTMLTextAreaElement);
    const clickCommand = (command: string) => {
      editor.element.querySelector<HTMLButtonElement>(`[data-uif-editor-command="${command}"]`)?.click();
      return document.querySelector<HTMLFormElement>('.uif-editor-dialog') as HTMLFormElement;
    };

    let dialog = clickCommand('link');
    (dialog.elements.namedItem('text') as HTMLInputElement).value = 'Docs';
    (dialog.elements.namedItem('href') as HTMLInputElement).value = 'https://example.com/docs';
    dialog.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    expect(editor.getValue()).toContain('<a href="https://example.com/docs">Docs</a>');

    dialog = clickCommand('image');
    (dialog.elements.namedItem('src') as HTMLInputElement).value = '/image.png';
    (dialog.elements.namedItem('alt') as HTMLInputElement).value = 'Screenshot';
    (dialog.elements.namedItem('caption') as HTMLInputElement).value = 'Dashboard';
    dialog.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    expect(editor.getValue()).toContain('<figure><img src="/image.png" alt="Screenshot"><figcaption>Dashboard</figcaption></figure>');

    dialog = clickCommand('table');
    (dialog.elements.namedItem('rows') as HTMLInputElement).value = '1';
    (dialog.elements.namedItem('columns') as HTMLInputElement).value = '3';
    dialog.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    expect(editor.getValue()).toContain('<th>Column C</th>');
  });

  it('uses a language-aware code block dialog in Markdown mode', () => {
    document.body.innerHTML = '<textarea data-uif="editor" data-uif-mode="markdown" data-uif-toolbar="code-block">const value = 1;</textarea>';
    const editor = createEditor(document.querySelector('textarea') as HTMLTextAreaElement);
    const source = editor.surface as HTMLTextAreaElement;
    source.setSelectionRange(0, source.value.length);
    editor.element.querySelector<HTMLButtonElement>('[data-uif-editor-command="code-block"]')?.click();
    const dialog = document.querySelector<HTMLFormElement>('.uif-editor-dialog') as HTMLFormElement;
    expect((dialog.elements.namedItem('code') as HTMLInputElement).value).toBe('const value = 1;');
    (dialog.elements.namedItem('language') as HTMLInputElement).value = 'ts';
    dialog.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    expect(editor.getValue()).toBe('\n```ts\nconst value = 1;\n```\n');
    expect(editor.preview?.innerHTML).toContain('<code class="language-ts">const value = 1;</code>');
  });

  it('uses selected Markdown text as link text and image alt text', () => {
    document.body.innerHTML = '<textarea data-uif="editor" data-uif-mode="markdown" data-uif-editor-layout="source" data-uif-toolbar="link image">Architecture diagram</textarea>';
    const editor = createEditor(document.querySelector('textarea') as HTMLTextAreaElement);
    const source = editor.surface as HTMLTextAreaElement;
    source.setSelectionRange(0, 12);

    editor.element.querySelector<HTMLButtonElement>('[data-uif-editor-command="link"]')?.click();
    let dialog = document.querySelector<HTMLFormElement>('.uif-editor-dialog') as HTMLFormElement;
    expect((dialog.elements.namedItem('text') as HTMLInputElement).value).toBe('Architecture');
    dialog.querySelector<HTMLButtonElement>('[data-uif-editor-dialog-cancel]')?.click();

    source.setSelectionRange(13, source.value.length);
    editor.element.querySelector<HTMLButtonElement>('[data-uif-editor-command="image"]')?.click();
    dialog = document.querySelector<HTMLFormElement>('.uif-editor-dialog') as HTMLFormElement;
    expect((dialog.elements.namedItem('alt') as HTMLInputElement).value).toBe('diagram');
  });

  it('uses placeholders instead of sample values for new link and image dialogs', () => {
    document.body.innerHTML = '<textarea data-uif="editor" data-uif-mode="html" data-uif-preview="none" data-uif-toolbar="link image"><p>Draft</p></textarea>';
    const editor = createEditor(document.querySelector('textarea') as HTMLTextAreaElement);

    editor.element.querySelector<HTMLButtonElement>('[data-uif-editor-command="link"]')?.click();
    let dialog = document.querySelector<HTMLFormElement>('.uif-editor-dialog') as HTMLFormElement;
    const text = dialog.elements.namedItem('text') as HTMLInputElement;
    const href = dialog.elements.namedItem('href') as HTMLInputElement;
    expect(text.value).toBe('');
    expect(text.placeholder).toBe('Link text');
    expect(href.value).toBe('');
    expect(href.placeholder).toBe('https://example.com');
    dialog.remove();

    editor.element.querySelector<HTMLButtonElement>('[data-uif-editor-command="image"]')?.click();
    dialog = document.querySelector<HTMLFormElement>('.uif-editor-dialog') as HTMLFormElement;
    const src = dialog.elements.namedItem('src') as HTMLInputElement;
    const alt = dialog.elements.namedItem('alt') as HTMLInputElement;
    expect(src.value).toBe('');
    expect(src.placeholder).toBe('/image.png');
    expect(alt.value).toBe('');
    expect(alt.placeholder).toBe('Image description');
  });

  it('prefills link and image dialogs when editing existing rich content', () => {
    document.body.innerHTML = '<textarea data-uif="editor" data-uif-mode="html" data-uif-preview="none" data-uif-toolbar="link image"><p><a href="/docs" title="Docs">Docs</a></p><figure><img src="/shot.png" alt="Screenshot"><figcaption>Dashboard</figcaption></figure></textarea>';
    const editor = createEditor(document.querySelector('textarea') as HTMLTextAreaElement);
    const link = editor.surface.querySelector('a') as HTMLAnchorElement;
    const linkRange = document.createRange();
    linkRange.selectNodeContents(link);
    document.getSelection()?.removeAllRanges();
    document.getSelection()?.addRange(linkRange);
    editor.surface.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));

    editor.element.querySelector<HTMLButtonElement>('[data-uif-editor-command="link"]')?.click();
    let dialog = document.querySelector<HTMLFormElement>('.uif-editor-dialog') as HTMLFormElement;
    expect((dialog.elements.namedItem('text') as HTMLInputElement).value).toBe('Docs');
    expect((dialog.elements.namedItem('href') as HTMLInputElement).value).toBe('/docs');
    expect((dialog.elements.namedItem('title') as HTMLInputElement).value).toBe('Docs');
    dialog.remove();

    const image = editor.surface.querySelector('img') as HTMLImageElement;
    const imageRange = document.createRange();
    imageRange.selectNode(image);
    document.getSelection()?.removeAllRanges();
    document.getSelection()?.addRange(imageRange);
    editor.surface.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));

    editor.element.querySelector<HTMLButtonElement>('[data-uif-editor-command="image"]')?.click();
    dialog = document.querySelector<HTMLFormElement>('.uif-editor-dialog') as HTMLFormElement;
    expect((dialog.elements.namedItem('src') as HTMLInputElement).value).toBe('/shot.png');
    expect((dialog.elements.namedItem('alt') as HTMLInputElement).value).toBe('Screenshot');
    expect((dialog.elements.namedItem('caption') as HTMLInputElement).value).toBe('Dashboard');
  });

  it('closes WYSIWYG dialogs with Escape, cancel, and outside pointer while restoring focus', () => {
    document.body.innerHTML = '<button id="outside">Outside</button><textarea data-uif="editor" data-uif-mode="html" data-uif-preview="none" data-uif-toolbar="link"><p>Draft</p></textarea>';
    const editor = createEditor(document.querySelector('textarea') as HTMLTextAreaElement);
    const button = editor.element.querySelector<HTMLButtonElement>('[data-uif-editor-command="link"]') as HTMLButtonElement;
    button.getBoundingClientRect = () =>
      ({
        x: 20,
        y: 20,
        top: 20,
        right: 80,
        bottom: 52,
        left: 20,
        width: 60,
        height: 32,
        toJSON: () => ({}),
      }) as DOMRect;

    button.click();
    let dialog = document.querySelector<HTMLFormElement>('.uif-editor-dialog') as HTMLFormElement;
    expect(dialog.getAttribute('role')).toBe('dialog');
    expect(dialog.dataset.uifEditorDialogPlacement).toBe('popover');
    expect(document.activeElement).toBe(dialog.querySelector('input'));
    dialog.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true, cancelable: true }));
    expect(document.activeElement).toBe(dialog.querySelector<HTMLButtonElement>('button[type="submit"]'));
    dialog.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }));
    expect(document.activeElement).toBe(dialog.querySelector('input'));
    dialog.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    expect(document.querySelector('.uif-editor-dialog')).toBeNull();
    expect(document.activeElement).toBe(button);

    button.click();
    dialog = document.querySelector<HTMLFormElement>('.uif-editor-dialog') as HTMLFormElement;
    dialog.querySelector<HTMLButtonElement>('[data-uif-editor-dialog-cancel]')?.click();
    expect(document.querySelector('.uif-editor-dialog')).toBeNull();
    expect(document.activeElement).toBe(button);

    button.click();
    expect(document.querySelector('.uif-editor-dialog')).not.toBeNull();
    document.querySelector('#outside')?.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
    expect(document.querySelector('.uif-editor-dialog')).toBeNull();
  });

  it('removes active dialogs, overlays, and surface listeners on destroy', () => {
    document.body.innerHTML = '<textarea data-uif="editor" data-uif-mode="markdown" data-uif-editor-layout="modal" data-uif-toolbar="preview">Draft</textarea>';
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    const editor = createEditor(textarea);
    const surface = editor.surface as HTMLTextAreaElement;
    editor.element.querySelector<HTMLButtonElement>('[data-uif-editor-command="preview"]')?.click();
    expect(document.querySelector('.uif-editor-preview-modal')).not.toBeNull();

    editor.destroy();
    expect(document.querySelector('.uif-editor-preview-modal')).toBeNull();
    expect(document.querySelector('.uif-editor-preview-backdrop')).toBeNull();
    surface.value = 'Changed after destroy';
    surface.dispatchEvent(new Event('input', { bubbles: true }));
    expect(textarea.value).toBe('Draft');

    document.body.innerHTML = '<textarea data-uif="editor" data-uif-mode="html" data-uif-toolbar="link"><p>Draft</p></textarea>';
    const rich = createEditor(document.querySelector('textarea') as HTMLTextAreaElement);
    rich.element.querySelector<HTMLButtonElement>('[data-uif-editor-command="link"]')?.click();
    expect(document.querySelector('.uif-editor-dialog')).not.toBeNull();
    rich.destroy();
    expect(document.querySelector('.uif-editor-dialog')).toBeNull();
  });

  it('activates toolbar commands with Enter and Space keys', () => {
    document.body.innerHTML = '<textarea data-uif="editor" data-uif-mode="html" data-uif-preview="none" data-uif-toolbar="link"></textarea>';
    const editor = createEditor(document.querySelector('textarea') as HTMLTextAreaElement);
    const button = editor.element.querySelector<HTMLButtonElement>('[data-uif-editor-command="link"]') as HTMLButtonElement;

    button.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
    expect(document.querySelector('.uif-editor-dialog')).not.toBeNull();
    document.querySelector('.uif-editor-dialog')?.remove();
    button.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true }));
    expect(document.querySelector('.uif-editor-dialog')).not.toBeNull();
  });

  it('adds and deletes table columns with editor table commands', () => {
    document.body.innerHTML = '<textarea data-uif="editor" data-uif-mode="html" data-uif-preview="none"><table><tbody><tr><td>A</td><td>B</td></tr></tbody></table></textarea>';
    const editor = createEditor(document.querySelector('textarea') as HTMLTextAreaElement);
    const cell = editor.surface.querySelector('td') as HTMLTableCellElement;
    const range = document.createRange();
    range.selectNodeContents(cell);
    document.getSelection()?.removeAllRanges();
    document.getSelection()?.addRange(range);

    runEditorCommand(editor, 'table-col-after');
    expect(editor.getValue()).toContain('<td></td><td>B</td>');
    runEditorCommand(editor, 'table-col-delete');
    expect(editor.getValue()).toContain('<td>A</td><td>B</td>');
  });

  it('edits and removes existing rich links', () => {
    document.body.innerHTML = '<textarea data-uif="editor" data-uif-mode="html" data-uif-preview="none"><p><a href="/old">Old</a></p></textarea>';
    const editor = createEditor(document.querySelector('textarea') as HTMLTextAreaElement);
    const link = editor.surface.querySelector('a') as HTMLAnchorElement;
    const range = document.createRange();
    range.selectNodeContents(link);
    document.getSelection()?.removeAllRanges();
    document.getSelection()?.addRange(range);

    runEditorCommand(editor, 'link-edit', { text: 'New', href: 'https://example.com/new', title: 'New link', target: '_blank' });
    expect(editor.getValue()).toContain('<a href="https://example.com/new" title="New link" target="_blank" rel="noopener noreferrer">New</a>');
    runEditorCommand(editor, 'link-remove');
    expect(editor.getValue()).toContain('<p>New</p>');
    expect(editor.getValue()).not.toContain('<a ');
  });

  it('edits and removes existing rich images', () => {
    document.body.innerHTML = '<textarea data-uif="editor" data-uif-mode="html" data-uif-preview="none"><figure><img src="/old.png" alt="Old"><figcaption>Old caption</figcaption></figure></textarea>';
    const editor = createEditor(document.querySelector('textarea') as HTMLTextAreaElement);
    const image = editor.surface.querySelector('img') as HTMLImageElement;
    const range = document.createRange();
    range.selectNode(image);
    document.getSelection()?.removeAllRanges();
    document.getSelection()?.addRange(range);

    runEditorCommand(editor, 'image-edit', { src: '/new.png', alt: 'New', caption: 'New caption' });
    expect(editor.getValue()).toContain('<figure><img src="/new.png" alt="New"><figcaption>New caption</figcaption></figure>');
    runEditorCommand(editor, 'image-remove');
    expect(editor.getValue()).not.toContain('<img');
    expect(editor.getValue()).not.toContain('<figure');
  });

  it('adds table rows and columns before the selected cell', () => {
    document.body.innerHTML = '<textarea data-uif="editor" data-uif-mode="html" data-uif-preview="none"><table><tbody><tr><td>A</td><td>B</td></tr></tbody></table></textarea>';
    const editor = createEditor(document.querySelector('textarea') as HTMLTextAreaElement);
    const second = editor.surface.querySelectorAll('td')[1] as HTMLTableCellElement;
    const range = document.createRange();
    range.selectNodeContents(second);
    document.getSelection()?.removeAllRanges();
    document.getSelection()?.addRange(range);

    runEditorCommand(editor, 'table-col-before');
    expect(editor.getValue()).toContain('<td>A</td><td></td><td>B</td>');
    runEditorCommand(editor, 'table-row-before');
    expect(editor.getValue()).toContain('<tr><td></td><td></td><td></td></tr><tr><td>A</td><td></td><td>B</td></tr>');
  });

  it('undoes and redoes editor-managed HTML toolbar commands', () => {
    document.body.innerHTML = '<textarea data-uif="editor" data-uif-mode="html" data-uif-preview="none" data-uif-toolbar="table undo redo"><p>Draft</p></textarea>';
    const editor = createEditor(document.querySelector('textarea') as HTMLTextAreaElement);

    runEditorCommand(editor, 'table');
    expect(editor.getValue()).toContain('<table>');
    runEditorCommand(editor, 'undo');
    expect(editor.getValue()).not.toContain('<table>');
    expect(editor.getValue()).toContain('<p>Draft</p>');
    runEditorCommand(editor, 'redo');
    expect(editor.getValue()).toContain('<table>');
  });

  it('restores textarea selection with editor-managed undo', () => {
    document.body.innerHTML = '<textarea data-uif="editor" data-uif-mode="markdown">Draft</textarea>';
    const editor = createEditor(document.querySelector('textarea') as HTMLTextAreaElement);
    const surface = editor.surface as HTMLTextAreaElement;
    surface.setSelectionRange(0, 5);
    runEditorCommand(editor, 'bold');
    expect(editor.getValue()).toBe('**Draft**');
    runEditorCommand(editor, 'undo');
    expect(editor.getValue()).toBe('Draft');
    expect([surface.selectionStart, surface.selectionEnd]).toEqual([0, 5]);
  });

  it('groups consecutive typing into one editor-managed undo transaction', () => {
    document.body.innerHTML = '<textarea data-uif="editor" data-uif-mode="markdown">Draft</textarea>';
    const editor = createEditor(document.querySelector('textarea') as HTMLTextAreaElement);
    const surface = editor.surface as HTMLTextAreaElement;
    for (const value of ['Draft1', 'Draft12']) {
      surface.dispatchEvent(new InputEvent('beforeinput', { bubbles: true, inputType: 'insertText' }));
      surface.value = value;
      surface.setSelectionRange(value.length, value.length);
      surface.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText' }));
    }

    runEditorCommand(editor, 'undo');
    expect(editor.getValue()).toBe('Draft');
    runEditorCommand(editor, 'redo');
    expect(editor.getValue()).toBe('Draft12');
  });

  it('keeps grouped source typing separate from a programmatic value transaction', () => {
    document.body.innerHTML = '<textarea data-uif="editor" data-uif-mode="markdown">Draft</textarea>';
    const editor = createEditor(document.querySelector('textarea') as HTMLTextAreaElement);
    const surface = editor.surface as HTMLTextAreaElement;
    for (const value of ['Draft1', 'Draft12']) {
      surface.dispatchEvent(new InputEvent('beforeinput', { bubbles: true, inputType: 'insertText' }));
      surface.value = value;
      surface.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText' }));
    }
    editor.setValue('Programmatic');

    runEditorCommand(editor, 'undo');
    expect(editor.getValue()).toBe('Draft12');
    runEditorCommand(editor, 'undo');
    expect(editor.getValue()).toBe('Draft');
  });

  it('keeps insertion and deletion history as separate transactions', () => {
    document.body.innerHTML = '<textarea data-uif="editor" data-uif-mode="markdown">Draft</textarea>';
    const editor = createEditor(document.querySelector('textarea') as HTMLTextAreaElement);
    const surface = editor.surface as HTMLTextAreaElement;
    surface.dispatchEvent(new InputEvent('beforeinput', { bubbles: true, inputType: 'insertText' }));
    surface.value = 'Draft1';
    surface.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText' }));
    surface.dispatchEvent(new InputEvent('beforeinput', { bubbles: true, inputType: 'deleteContentBackward' }));
    surface.value = 'Draft';
    surface.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'deleteContentBackward' }));

    runEditorCommand(editor, 'undo');
    expect(editor.getValue()).toBe('Draft1');
    runEditorCommand(editor, 'undo');
    expect(editor.getValue()).toBe('Draft');
  });

  it('synchronizes native form resets and establishes a fresh history baseline', async () => {
    document.body.innerHTML = '<form><textarea data-uif="editor" data-uif-mode="markdown" data-uif-editor-layout="source" data-uif-editor-status="true">Initial</textarea></form>';
    const form = document.querySelector('form') as HTMLFormElement;
    const editor = createEditor(document.querySelector('textarea') as HTMLTextAreaElement);
    let resetValue = '';
    editor.element.addEventListener('uif:editor-reset', (event) => { resetValue = (event as CustomEvent).detail.value; });
    editor.setValue('Edited');
    expect(editor.dirty).toBe(true);

    form.reset();
    await new Promise((resolve) => setTimeout(resolve));

    expect(editor.getValue()).toBe('Initial');
    expect((editor.surface as HTMLTextAreaElement).value).toBe('Initial');
    expect(editor.dirty).toBe(false);
    expect(resetValue).toBe('Initial');
    runEditorCommand(editor, 'undo');
    expect(editor.getValue()).toBe('Initial');
  });

  it('cancels pending form reset synchronization when destroyed', async () => {
    document.body.innerHTML = '<form><textarea data-uif="editor" data-uif-mode="html"><p>Initial</p></textarea></form>';
    const form = document.querySelector('form') as HTMLFormElement;
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    const editor = createEditor(textarea);
    editor.setValue('<p>Edited</p>');

    form.reset();
    editor.destroy();
    await new Promise((resolve) => setTimeout(resolve));

    expect(textarea.hidden).toBe(false);
    expect(document.querySelector('.uif-editor')).toBeNull();
  });

  it('transforms rich blocks without discarding inline markup', () => {
    document.body.innerHTML = '<textarea data-uif="editor" data-uif-mode="html"><p>Alpha <strong>Beta</strong></p></textarea>';
    const editor = createEditor(document.querySelector('textarea') as HTMLTextAreaElement);
    const range = document.createRange();
    range.selectNodeContents(editor.surface.querySelector('p') as HTMLParagraphElement);
    document.getSelection()?.removeAllRanges();
    document.getSelection()?.addRange(range);
    runEditorCommand(editor, 'h2');
    expect(editor.getValue()).toBe('<h2>Alpha <strong>Beta</strong></h2>');
  });

  it('transforms the innermost selected rich block', () => {
    document.body.innerHTML = '<textarea data-uif="editor" data-uif-mode="html"><div><p>Nested</p></div></textarea>';
    const editor = createEditor(document.querySelector('textarea') as HTMLTextAreaElement);
    const range = document.createRange();
    range.selectNodeContents(editor.surface.querySelector('p') as HTMLParagraphElement);
    document.getSelection()?.removeAllRanges();
    document.getSelection()?.addRange(range);
    runEditorCommand(editor, 'h3');
    expect(editor.getValue()).toBe('<div><h3>Nested</h3></div>');
  });

  it('supports heading levels four through six in rich and Markdown modes', () => {
    document.body.innerHTML = '<textarea data-uif="editor" data-uif-mode="html"><p>Heading</p></textarea>';
    const rich = createEditor(document.querySelector('textarea') as HTMLTextAreaElement);
    const range = document.createRange();
    range.selectNodeContents(rich.surface.querySelector('p') as HTMLParagraphElement);
    document.getSelection()?.removeAllRanges();
    document.getSelection()?.addRange(range);
    runEditorCommand(rich, 'h6');
    expect(rich.getValue()).toBe('<h6>Heading</h6>');
    document.body.innerHTML = '<textarea data-uif="editor" data-uif-mode="markdown">Heading</textarea>';
    const markdown = createEditor(document.querySelector('textarea') as HTMLTextAreaElement);
    runEditorCommand(markdown, 'h4');
    expect(markdown.getValue()).toBe('#### Heading');
  });

  it('indents and outdents rich and Markdown list items', () => {
    document.body.innerHTML = '<textarea data-uif="editor" data-uif-mode="html"><ul><li>One</li><li>Two</li></ul></textarea>';
    const rich = createEditor(document.querySelector('textarea') as HTMLTextAreaElement);
    const range = document.createRange();
    range.selectNodeContents(rich.surface.querySelectorAll('li')[1] as HTMLLIElement);
    document.getSelection()?.removeAllRanges();
    document.getSelection()?.addRange(range);
    runEditorCommand(rich, 'indent');
    expect(rich.getValue()).toContain('<li>One<ul><li>Two</li></ul></li>');
    runEditorCommand(rich, 'outdent');
    expect(rich.getValue()).toBe('<ul><li>One</li><li>Two</li></ul>');
    document.body.innerHTML = '<textarea data-uif="editor" data-uif-mode="markdown">- One\n- Two</textarea>';
    const markdown = createEditor(document.querySelector('textarea') as HTMLTextAreaElement);
    const source = markdown.surface as HTMLTextAreaElement;
    source.setSelectionRange(source.value.indexOf('- Two'), source.value.length);
    runEditorCommand(markdown, 'indent');
    expect(markdown.getValue()).toBe('- One\n  - Two');
    runEditorCommand(markdown, 'outdent');
    expect(markdown.getValue()).toBe('- One\n- Two');
  });

  it('sanitizes rich clipboard HTML before insertion', () => {
    document.body.innerHTML = '<textarea data-uif="editor" data-uif-mode="html"><p>Draft</p></textarea>';
    const editor = createEditor(document.querySelector('textarea') as HTMLTextAreaElement);
    const range = document.createRange();
    range.selectNodeContents(editor.surface);
    range.collapse(false);
    document.getSelection()?.removeAllRanges();
    document.getSelection()?.addRange(range);
    const paste = new Event('paste', { bubbles: true, cancelable: true });
    Object.defineProperty(paste, 'clipboardData', { value: { getData: (type: string) => (type === 'text/html' ? '<p onclick="bad()">Pasted <a href="javascript:bad()">link</a></p><script>bad()</script>' : '') } });
    editor.surface.dispatchEvent(paste);
    expect(paste.defaultPrevented).toBe(true);
    expect(editor.getValue()).toContain('<p>Pasted <a>link</a></p>');
    expect(editor.getValue()).not.toContain('script');
    expect(editor.getValue()).not.toContain('onclick');
  });

  it('groups composition input and synchronizes after composition ends', () => {
    document.body.innerHTML = '<textarea data-uif="editor" data-uif-mode="markdown">Draft</textarea>';
    const editor = createEditor(document.querySelector('textarea') as HTMLTextAreaElement);
    const surface = editor.surface as HTMLTextAreaElement;
    surface.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true }));
    surface.value = 'Drafted';
    surface.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertCompositionText' }));
    expect(editor.getValue()).toBe('Draft');
    surface.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true }));
    expect(editor.getValue()).toBe('Drafted');
    runEditorCommand(editor, 'undo');
    expect(editor.getValue()).toBe('Draft');
  });

  it('uploads dropped image files through the governed editor hook', async () => {
    document.body.innerHTML = '<textarea data-uif="editor" data-uif-mode="html"><p>Draft</p></textarea>';
    const editor = createEditor(document.querySelector('textarea') as HTMLTextAreaElement);
    const unregister = registerEditorHook('uploadImage', ({ file }) => file ? '/uploads/screenshot.png' : undefined);
    const file = new File(['image'], 'screenshot.png', { type: 'image/png' });
    const drop = new Event('drop', { bubbles: true, cancelable: true });
    Object.defineProperty(drop, 'dataTransfer', { value: { files: [file], getData: () => '' } });

    editor.surface.dispatchEvent(drop);
    await new Promise((resolve) => setTimeout(resolve, 1));

    expect(drop.defaultPrevented).toBe(true);
    expect(editor.getValue()).toContain('<img src="/uploads/screenshot.png" alt="screenshot.png">');
    expect(editor.element.dataset.uifUploadState).toBe('uploaded');
    unregister();
  });

  it('rejects oversized dropped images before invoking upload hooks', async () => {
    document.body.innerHTML = '<textarea data-uif="editor" data-uif-mode="html"><p>Draft</p></textarea>';
    const editor = createEditor(document.querySelector('textarea') as HTMLTextAreaElement, { uploadMaxBytes: 3 });
    const upload = vi.fn(() => '/uploads/large.png');
    const unregister = registerEditorHook('uploadImage', upload);
    const file = new File(['large'], 'large.png', { type: 'image/png' });
    const drop = new Event('drop', { bubbles: true, cancelable: true });
    Object.defineProperty(drop, 'dataTransfer', { value: { files: [file], getData: () => '' } });
    const error = new Promise<CustomEvent>((resolve) => editor.element.addEventListener('uif:editor-upload-error', (event) => resolve(event as CustomEvent), { once: true }));

    editor.surface.dispatchEvent(drop);

    expect((await error).detail.error.message).toContain('3 byte upload limit');
    expect(upload).not.toHaveBeenCalled();
    expect(editor.element.dataset.uifUploadState).toBe('error');
    unregister();
  });

  it('serializes task checkbox checked state back to the form field', () => {
    document.body.innerHTML = '<textarea data-uif="editor" data-uif-mode="html" data-uif-preview="none" data-uif-toolbar="task"><p>Draft</p></textarea>';
    const editor = createEditor(document.querySelector('textarea') as HTMLTextAreaElement);
    runEditorCommand(editor, 'task');
    const checkbox = editor.surface.querySelector<HTMLInputElement>('input[type="checkbox"]') as HTMLInputElement;

    checkbox.checked = true;
    checkbox.dispatchEvent(new Event('change', { bubbles: true }));

    expect(editor.getValue()).toContain('checked');
  });

  it('adds rich task items with Enter and removes empty task items with Backspace', () => {
    document.body.innerHTML = '<textarea data-uif="editor" data-uif-mode="html" data-uif-preview="none"><ul class="uif-task-list"><li><label><input type="checkbox"> First</label></li></ul></textarea>';
    const editor = createEditor(document.querySelector('textarea') as HTMLTextAreaElement);
    const item = editor.surface.querySelector('li') as HTMLLIElement;
    const range = document.createRange();
    range.selectNodeContents(item);
    document.getSelection()?.removeAllRanges();
    document.getSelection()?.addRange(range);

    editor.surface.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(editor.getValue()).toContain('<li><label><input type="checkbox"> </label></li>');

    const empty = editor.surface.querySelectorAll('li')[1] as HTMLLIElement;
    const emptyRange = document.createRange();
    emptyRange.selectNodeContents(empty);
    document.getSelection()?.removeAllRanges();
    document.getSelection()?.addRange(emptyRange);
    editor.surface.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true }));
    expect(editor.getValue()).not.toContain('<li><label><input type="checkbox"> </label></li>');
  });

  it('splits ordinary rich list items at the caret and exits an empty item', () => {
    document.body.innerHTML = '<textarea data-uif="editor" data-uif-mode="html" data-uif-preview="none"><ul><li>Alpha beta</li></ul></textarea>';
    const editor = createEditor(document.querySelector('textarea') as HTMLTextAreaElement);
    const text = editor.surface.querySelector('li')?.firstChild as Text;
    const range = document.createRange();
    range.setStart(text, 6);
    range.collapse(true);
    document.getSelection()?.removeAllRanges();
    document.getSelection()?.addRange(range);

    const split = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true });
    editor.surface.dispatchEvent(split);
    expect(split.defaultPrevented).toBe(true);
    expect(editor.getValue()).toBe('<ul><li>Alpha </li><li>beta</li></ul>');

    const second = editor.surface.querySelectorAll('li')[1] as HTMLLIElement;
    second.textContent = '';
    const emptyRange = document.createRange();
    emptyRange.selectNodeContents(second);
    emptyRange.collapse(true);
    document.getSelection()?.removeAllRanges();
    document.getSelection()?.addRange(emptyRange);
    editor.surface.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
    expect(editor.getValue()).toBe('<ul><li>Alpha </li></ul><p><br></p>');
  });

  it('preserves following items when exiting a middle rich list item', () => {
    document.body.innerHTML = '<textarea data-uif="editor" data-uif-mode="html" data-uif-preview="none"><ol><li>Before</li><li><br></li><li>After</li></ol></textarea>';
    const editor = createEditor(document.querySelector('textarea') as HTMLTextAreaElement);
    const empty = editor.surface.querySelectorAll('li')[1] as HTMLLIElement;
    const range = document.createRange();
    range.selectNodeContents(empty);
    range.collapse(true);
    document.getSelection()?.removeAllRanges();
    document.getSelection()?.addRange(range);

    editor.surface.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
    expect(editor.getValue()).toBe('<ol><li>Before</li></ol><p><br></p><ol><li>After</li></ol>');
  });

  it('moves through rich table cells with Tab and appends a row at the final cell', () => {
    document.body.innerHTML = '<textarea data-uif="editor" data-uif-mode="html" data-uif-preview="none"><table><tbody><tr><td>A</td><td>B</td></tr></tbody></table></textarea>';
    const editor = createEditor(document.querySelector('textarea') as HTMLTextAreaElement);
    const cells = editor.surface.querySelectorAll<HTMLTableCellElement>('td');
    const range = document.createRange();
    range.selectNodeContents(cells[0]);
    range.collapse(true);
    document.getSelection()?.removeAllRanges();
    document.getSelection()?.addRange(range);

    editor.surface.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }));
    expect(currentSelectionCellText()).toBe('B');
    editor.surface.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }));
    expect(editor.surface.querySelectorAll('tr')).toHaveLength(2);
    expect(editor.surface.querySelectorAll('tr')[1].children).toHaveLength(2);
    expect(currentSelectionCellText()).toBe('');
  });

  it('pastes bounded rectangular text into rich tables without interpreting markup', () => {
    document.body.innerHTML = '<textarea data-uif="editor" data-uif-mode="html" data-uif-preview="none"><table><tbody><tr><td>A</td><td>B</td></tr></tbody></table></textarea>';
    const editor = createEditor(document.querySelector('textarea') as HTMLTextAreaElement);
    const start = editor.surface.querySelectorAll('td')[1] as HTMLTableCellElement;
    const range = document.createRange();
    range.selectNodeContents(start);
    range.collapse(true);
    document.getSelection()?.removeAllRanges();
    document.getSelection()?.addRange(range);
    const paste = new Event('paste', { bubbles: true, cancelable: true });
    Object.defineProperty(paste, 'clipboardData', {
      value: { getData: (type: string) => type === 'text/plain' ? 'X\t<script>bad()</script>\nY\tZ' : '' },
    });

    editor.surface.dispatchEvent(paste);

    expect(paste.defaultPrevented).toBe(true);
    expect(editor.surface.querySelectorAll('tr')).toHaveLength(2);
    expect([...editor.surface.querySelectorAll('tr')].map((row) => row.children.length)).toEqual([3, 3]);
    expect(editor.getValue()).toContain('<td>&lt;script&gt;bad()&lt;/script&gt;</td>');
    expect(editor.getValue()).not.toContain('<script>');
    expect(currentSelectionCellText()).toBe('Z');
  });

  it('limits rectangular table paste to twenty rows and columns', () => {
    document.body.innerHTML = '<textarea data-uif="editor" data-uif-mode="html" data-uif-preview="none"><table><tbody><tr><td>Start</td></tr></tbody></table></textarea>';
    const editor = createEditor(document.querySelector('textarea') as HTMLTextAreaElement);
    const start = editor.surface.querySelector('td') as HTMLTableCellElement;
    const range = document.createRange();
    range.selectNodeContents(start);
    range.collapse(true);
    document.getSelection()?.removeAllRanges();
    document.getSelection()?.addRange(range);
    const oversized = Array.from({ length: 25 }, () => Array.from({ length: 25 }, () => 'Cell').join('\t')).join('\n');
    const paste = new Event('paste', { bubbles: true, cancelable: true });
    Object.defineProperty(paste, 'clipboardData', { value: { getData: (type: string) => type === 'text/plain' ? oversized : '' } });

    editor.surface.dispatchEvent(paste);

    expect(editor.surface.querySelectorAll('tr')).toHaveLength(20);
    expect(editor.surface.querySelector('tr')?.children).toHaveLength(20);
  });

  it('adds, edits, removes, and undoes rich table captions safely', () => {
    document.body.innerHTML = '<textarea data-uif="editor" data-uif-mode="html" data-uif-preview="none"><table><tbody><tr><td>A</td></tr></tbody></table></textarea>';
    const editor = createEditor(document.querySelector('textarea') as HTMLTextAreaElement);
    const cell = editor.surface.querySelector('td') as HTMLTableCellElement;
    const range = document.createRange();
    range.selectNodeContents(cell);
    document.getSelection()?.removeAllRanges();
    document.getSelection()?.addRange(range);

    runEditorCommand(editor, 'table-caption', { caption: '<b>Quarterly results</b>' });
    expect(editor.getValue()).toContain('<caption>&lt;b&gt;Quarterly results&lt;/b&gt;</caption>');
    expect(editor.getValue()).not.toContain('<caption><b>');
    runEditorCommand(editor, 'undo');
    expect(editor.getValue()).not.toContain('<caption>');
    runEditorCommand(editor, 'redo');
    expect(editor.getValue()).toContain('<caption>&lt;b&gt;Quarterly results&lt;/b&gt;</caption>');

    const restoredCell = editor.surface.querySelector('td') as HTMLTableCellElement;
    const restoredRange = document.createRange();
    restoredRange.selectNodeContents(restoredCell);
    document.getSelection()?.removeAllRanges();
    document.getSelection()?.addRange(restoredRange);
    runEditorCommand(editor, 'table-caption', { caption: '' });
    expect(editor.getValue()).not.toContain('<caption>');
  });

  it('opens the contextual rich table caption dialog with the current value', () => {
    document.body.innerHTML = '<textarea data-uif="editor" data-uif-mode="html" data-uif-preview="none"><table><caption>Existing caption</caption><tbody><tr><td>A</td></tr></tbody></table></textarea>';
    const editor = createEditor(document.querySelector('textarea') as HTMLTextAreaElement);
    const cell = editor.surface.querySelector('td') as HTMLTableCellElement;
    const range = document.createRange();
    range.selectNodeContents(cell);
    document.getSelection()?.removeAllRanges();
    document.getSelection()?.addRange(range);
    cell.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    const button = editor.element.querySelector<HTMLButtonElement>('[data-uif-editor-command="table-caption"]') as HTMLButtonElement;

    button.click();
    const dialog = document.querySelector<HTMLFormElement>('.uif-editor-dialog') as HTMLFormElement;
    const caption = dialog.elements.namedItem('caption') as HTMLInputElement;
    expect(caption.value).toBe('Existing caption');
    caption.value = 'Updated caption';
    dialog.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    expect(editor.getValue()).toContain('<caption>Updated caption</caption>');
  });

  it('splits rich blocks semantically and inserts explicit soft breaks', () => {
    document.body.innerHTML = '<textarea data-uif="editor" data-uif-mode="html" data-uif-preview="none"><h2>Alpha beta</h2></textarea>';
    const editor = createEditor(document.querySelector('textarea') as HTMLTextAreaElement);
    const text = editor.surface.querySelector('h2')?.firstChild as Text;
    const range = document.createRange();
    range.setStart(text, 6);
    range.collapse(true);
    document.getSelection()?.removeAllRanges();
    document.getSelection()?.addRange(range);

    editor.surface.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
    expect(editor.getValue()).toBe('<h2>Alpha </h2><h2>beta</h2>');
    editor.surface.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', shiftKey: true, bubbles: true, cancelable: true }));
    expect(editor.getValue()).toBe('<h2>Alpha </h2><h2><br>beta</h2>');
  });

  it('removes empty rich blocks predictably with Backspace and Delete', () => {
    document.body.innerHTML = '<textarea data-uif="editor" data-uif-mode="html" data-uif-preview="none"><p>Before</p><p><br></p><p>After</p></textarea>';
    const editor = createEditor(document.querySelector('textarea') as HTMLTextAreaElement);
    let empty = editor.surface.querySelectorAll('p')[1] as HTMLParagraphElement;
    let range = document.createRange();
    range.selectNodeContents(empty);
    range.collapse(true);
    document.getSelection()?.removeAllRanges();
    document.getSelection()?.addRange(range);
    editor.surface.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true, cancelable: true }));
    expect(editor.getValue()).toBe('<p>Before</p><p>After</p>');
    expect(document.getSelection()?.anchorNode?.textContent).toContain('Before');

    editor.setValue('<p>Before</p><p><br></p><p>After</p>');
    empty = editor.surface.querySelectorAll('p')[1] as HTMLParagraphElement;
    range = document.createRange();
    range.selectNodeContents(empty);
    range.collapse(true);
    document.getSelection()?.removeAllRanges();
    document.getSelection()?.addRange(range);
    editor.surface.dispatchEvent(new KeyboardEvent('keydown', { key: 'Delete', bubbles: true, cancelable: true }));
    expect(editor.getValue()).toBe('<p>Before</p><p>After</p>');
    expect(document.getSelection()?.anchorNode?.textContent).toContain('After');
  });

  it('uses the Source button to toggle Markdown source and rendered output', () => {
    document.body.innerHTML = '<textarea data-uif="editor" data-uif-mode="markdown" data-uif-preview="manual" data-uif-toolbar="source"># Draft</textarea>';
    const editor = createEditor(document.querySelector('textarea') as HTMLTextAreaElement);
    const button = editor.element.querySelector<HTMLButtonElement>('[data-uif-editor-command="source"]') as HTMLButtonElement;
    expect(editor.sourceMode).toBe(false);
    expect(editor.surface.hidden).toBe(true);
    expect(editor.preview?.hidden).toBe(false);
    expect(editor.preview?.querySelector('h1')?.textContent).toBe('Draft');
    expect(button.getAttribute('aria-pressed')).toBe('false');

    button.click();
    expect(editor.sourceMode).toBe(true);
    expect(editor.surface.hidden).toBe(false);
    expect(editor.preview?.hidden).toBe(true);
    expect(button.getAttribute('aria-pressed')).toBe('true');

    const surface = editor.surface as HTMLTextAreaElement;
    surface.value = '# Edited';
    surface.dispatchEvent(new Event('input', { bubbles: true }));
    button.click();
    expect(editor.sourceMode).toBe(false);
    expect(editor.surface.hidden).toBe(true);
    expect(editor.preview?.hidden).toBe(false);
    expect(editor.preview?.querySelector('h1')?.textContent).toBe('Edited');
  });

  it('synchronizes split Markdown source and preview scrolling by source block', async () => {
    document.body.innerHTML = '<textarea data-uif="editor" data-uif-mode="markdown" data-uif-editor-layout="split"># One\n\nText\n\n# Two</textarea>';
    const editor = createEditor(document.querySelector('textarea') as HTMLTextAreaElement);
    const source = editor.surface as HTMLTextAreaElement;
    const preview = editor.preview as HTMLElement;
    const markers = [...preview.querySelectorAll<HTMLElement>('[data-uif-md-line]')];
    expect(markers).toHaveLength(3);
    Object.defineProperties(source, { scrollHeight: { value: 1000 }, clientHeight: { value: 100 } });
    Object.defineProperties(preview, { scrollHeight: { value: 500 }, clientHeight: { value: 100 } });
    markers.forEach((marker, index) => Object.defineProperty(marker, 'offsetTop', { value: index * 100 }));

    source.scrollTop = 450;
    source.dispatchEvent(new Event('scroll'));
    expect(preview.scrollTop).toBe(100);
    await new Promise((resolve) => window.requestAnimationFrame(resolve));

    preview.scrollTop = 200;
    preview.dispatchEvent(new Event('scroll'));
    expect(source.scrollTop).toBe(900);
  });

  it('can still start Markdown editors explicitly in source layout', () => {
    document.body.innerHTML = '<textarea data-uif="editor" data-uif-mode="markdown" data-uif-preview="manual" data-uif-editor-layout="source" data-uif-toolbar="source"># Draft</textarea>';
    const editor = createEditor(document.querySelector('textarea') as HTMLTextAreaElement);
    expect(editor.sourceMode).toBe(true);
    expect(editor.surface.hidden).toBe(false);
    expect(editor.preview?.hidden).toBe(true);
    expect(editor.element.querySelector<HTMLButtonElement>('[data-uif-editor-command="source"]')?.getAttribute('aria-pressed')).toBe('true');
  });

  it('uses Preview to return a single-box Markdown editor to rendered mode', () => {
    document.body.innerHTML = '<textarea data-uif="editor" data-uif-mode="markdown" data-uif-preview="manual" data-uif-toolbar="preview source"># Draft</textarea>';
    const editor = createEditor(document.querySelector('textarea') as HTMLTextAreaElement);
    const previewButton = editor.element.querySelector<HTMLButtonElement>('[data-uif-editor-command="preview"]') as HTMLButtonElement;
    const sourceButton = editor.element.querySelector<HTMLButtonElement>('[data-uif-editor-command="source"]') as HTMLButtonElement;

    sourceButton.click();
    expect(editor.sourceMode).toBe(true);
    previewButton.click();

    expect(editor.sourceMode).toBe(false);
    expect(editor.surface.hidden).toBe(true);
    expect(editor.preview?.hidden).toBe(false);
    expect(editor.preview?.querySelector('h1')?.textContent).toBe('Draft');
    expect(sourceButton.getAttribute('aria-pressed')).toBe('false');
  });

  it('switches Markdown toolbar edits into source mode from rendered mode', () => {
    document.body.innerHTML = '<textarea data-uif="editor" data-uif-mode="markdown" data-uif-preview="manual" data-uif-toolbar="bold source">Draft</textarea>';
    const editor = createEditor(document.querySelector('textarea') as HTMLTextAreaElement);

    runEditorCommand(editor, 'bold');

    expect(editor.sourceMode).toBe(true);
    expect(editor.surface.hidden).toBe(false);
    expect(editor.preview?.hidden).toBe(true);
    expect(editor.getValue()).toContain('**bold text**');
  });

  it('supports Markdown preview layout changes', () => {
    document.body.innerHTML = '<textarea data-uif="editor" data-uif-mode="markdown" data-uif-preview="manual" data-uif-editor-layout="split"># Draft</textarea>';
    const editor = createEditor(document.querySelector('textarea') as HTMLTextAreaElement);
    expect(editor.preview?.hidden).toBe(false);
    expect(editor.surface.hidden).toBe(false);
    expect(editor.element.dataset.uifEditorLayout).toBe('split');

    setEditorPreviewLayout(editor, 'preview');
    expect(editor.surface.hidden).toBe(true);
    expect(editor.preview?.hidden).toBe(false);
    setEditorPreviewLayout(editor, 'modal');
    expect(editor.surface.hidden).toBe(false);
    expect(editor.preview?.hidden).toBe(true);
  });

  it('opens modal and drawer preview overlays with keyboard dismissal', () => {
    document.body.innerHTML = '<textarea data-uif="editor" data-uif-mode="markdown" data-uif-preview="manual" data-uif-editor-layout="modal" data-uif-toolbar="preview"># Draft</textarea>';
    const editor = createEditor(document.querySelector('textarea') as HTMLTextAreaElement);
    const button = editor.element.querySelector<HTMLButtonElement>('[data-uif-editor-command="preview"]') as HTMLButtonElement;

    button.click();
    expect(document.querySelector('.uif-editor-preview-modal')?.textContent).toContain('Draft');
    expect(document.activeElement?.classList.contains('uif-editor-preview-close')).toBe(true);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(document.querySelector('.uif-editor-preview-modal')).toBeNull();

    setEditorPreviewLayout(editor, 'drawer');
    button.click();
    expect(document.querySelector('.uif-editor-preview-drawer')?.textContent).toContain('Draft');
  });

  it('runs Markdown commands against selected text and updates status', () => {
    document.body.innerHTML = '<textarea data-uif="editor" data-uif-mode="markdown" data-uif-editor-status="true">Draft</textarea>';
    const editor = createEditor(document.querySelector('textarea') as HTMLTextAreaElement);
    const surface = editor.surface as HTMLTextAreaElement;
    surface.setSelectionRange(0, 5);
    runEditorCommand(editor, 'bold');
    expect(editor.getValue()).toContain('**Draft**');
    expect(editor.status?.textContent).toContain('Unsaved changes');
  });

  it('turns selected Markdown lines into unordered, ordered, and task lists', () => {
    document.body.innerHTML = '<textarea data-uif="editor" data-uif-mode="markdown">Alpha\nBeta</textarea>';
    const editor = createEditor(document.querySelector('textarea') as HTMLTextAreaElement);
    const surface = editor.surface as HTMLTextAreaElement;
    surface.setSelectionRange(0, surface.value.length);

    runEditorCommand(editor, 'ul');
    expect(editor.getValue()).toBe('- Alpha\n- Beta');

    surface.setSelectionRange(0, surface.value.length);
    runEditorCommand(editor, 'ol');
    expect(editor.getValue()).toBe('1. Alpha\n2. Beta');

    surface.setSelectionRange(0, surface.value.length);
    runEditorCommand(editor, 'task');
    expect(editor.getValue()).toBe('- [ ] Alpha\n- [ ] Beta');
  });

  it('toggles Markdown list commands off when the selected lines already match', () => {
    document.body.innerHTML = '<textarea data-uif="editor" data-uif-mode="markdown">- Alpha\n- Beta</textarea>';
    const editor = createEditor(document.querySelector('textarea') as HTMLTextAreaElement);
    const surface = editor.surface as HTMLTextAreaElement;
    surface.setSelectionRange(0, surface.value.length);

    runEditorCommand(editor, 'ul');

    expect(editor.getValue()).toBe('Alpha\nBeta');
  });

  it('applies Markdown heading and paragraph commands to selected lines', () => {
    document.body.innerHTML = '<textarea data-uif="editor" data-uif-mode="markdown">Alpha\nBeta</textarea>';
    const editor = createEditor(document.querySelector('textarea') as HTMLTextAreaElement);
    const surface = editor.surface as HTMLTextAreaElement;
    surface.setSelectionRange(0, surface.value.length);

    runEditorCommand(editor, 'h1');
    expect(editor.getValue()).toBe('# Alpha\n# Beta');

    surface.setSelectionRange(0, surface.value.length);
    runEditorCommand(editor, 'h3');
    expect(editor.getValue()).toBe('### Alpha\n### Beta');

    surface.setSelectionRange(0, surface.value.length);
    runEditorCommand(editor, 'paragraph');
    expect(editor.getValue()).toBe('Alpha\nBeta');
  });

  it('applies Markdown quote, inline code, and clear formatting commands', () => {
    document.body.innerHTML = '<textarea data-uif="editor" data-uif-mode="markdown">**Alpha** and [Beta](/docs)</textarea>';
    const editor = createEditor(document.querySelector('textarea') as HTMLTextAreaElement);
    const surface = editor.surface as HTMLTextAreaElement;

    surface.setSelectionRange(0, 9);
    runEditorCommand(editor, 'code-inline');
    expect(editor.getValue()).toBe('`**Alpha**` and [Beta](/docs)');

    surface.setSelectionRange(0, surface.value.length);
    runEditorCommand(editor, 'quote');
    expect(editor.getValue()).toBe('> `**Alpha**` and [Beta](/docs)');

    surface.setSelectionRange(0, surface.value.length);
    runEditorCommand(editor, 'clear');
    expect(editor.getValue()).toBe('Alpha and Beta');
  });

  it('creates one rich list item for each selected text line', () => {
    document.body.innerHTML = '<textarea data-uif="editor" data-uif-mode="html" data-uif-preview="none"><p>Alpha<br>Beta</p></textarea>';
    const editor = createEditor(document.querySelector('textarea') as HTMLTextAreaElement);
    const paragraph = editor.surface.querySelector('p') as HTMLParagraphElement;
    const range = document.createRange();
    range.selectNodeContents(paragraph);
    document.getSelection()?.removeAllRanges();
    document.getSelection()?.addRange(range);

    runEditorCommand(editor, 'ol');

    expect(editor.getValue()).toContain('<ol><li>Alpha</li><li>Beta</li></ol>');
  });

  it('toggles and switches existing rich lists without nesting a new list', () => {
    document.body.innerHTML = '<textarea data-uif="editor" data-uif-mode="html" data-uif-preview="none"><ul><li>Alpha</li><li>Beta</li></ul></textarea>';
    const editor = createEditor(document.querySelector('textarea') as HTMLTextAreaElement);
    const item = editor.surface.querySelector('li') as HTMLLIElement;
    const range = document.createRange();
    range.selectNodeContents(item);
    document.getSelection()?.removeAllRanges();
    document.getSelection()?.addRange(range);

    runEditorCommand(editor, 'ol');
    expect(editor.getValue()).toContain('<ol><li>Alpha</li><li>Beta</li></ol>');
    expect(editor.getValue()).not.toContain('<ul><li><ol>');

    runEditorCommand(editor, 'ol');
    expect(editor.getValue()).toContain('<p>Alpha</p><p>Beta</p>');
  });

  it('uses structured Markdown link, image, and table command values', () => {
    document.body.innerHTML = '<textarea data-uif="editor" data-uif-mode="markdown"></textarea>';
    const editor = createEditor(document.querySelector('textarea') as HTMLTextAreaElement);

    runEditorCommand(editor, 'link', { text: 'Docs', href: 'https://example.com/docs' });
    runEditorCommand(editor, 'image', { alt: 'Screenshot', src: '/image.png', caption: 'Dashboard' });
    runEditorCommand(editor, 'table', { rows: 1, columns: 3 });

    expect(editor.getValue()).toContain('[Docs](https://example.com/docs)');
    expect(editor.getValue()).toContain('![Screenshot](/image.png)');
    expect(editor.getValue()).toContain('| Column A | Column B | Column C |');
  });

  it('edits Markdown table rows and columns around the source selection', () => {
    document.body.innerHTML = '<textarea data-uif="editor" data-uif-mode="markdown">| Name | Role |\n| :--- | ---: |\n| Ada | Admin |\n| Lin | Editor |</textarea>';
    const editor = createEditor(document.querySelector('textarea') as HTMLTextAreaElement);
    const surface = editor.surface as HTMLTextAreaElement;
    const admin = surface.value.indexOf('Admin');
    surface.setSelectionRange(admin, admin);

    runEditorCommand(editor, 'table-row-after');
    expect(editor.getValue()).toContain('| Ada | Admin |\n|  |  |\n| Lin | Editor |');
    expect(surface.selectionStart).toBe(surface.selectionEnd);

    runEditorCommand(editor, 'table-col-before');
    expect(editor.getValue()).toContain('| Name | Column | Role |');
    expect(editor.getValue()).toContain('| :--- | --- | ---: |');

    runEditorCommand(editor, 'table-col-delete');
    expect(editor.getValue()).toContain('| Name | Role |');
    expect(editor.getValue()).toContain('| :--- | ---: |');
  });

  it('does not delete Markdown table headers, separators, or the last column', () => {
    document.body.innerHTML = '<textarea data-uif="editor" data-uif-mode="markdown">| Only |\n| --- |\n| Value |</textarea>';
    const editor = createEditor(document.querySelector('textarea') as HTMLTextAreaElement);
    const surface = editor.surface as HTMLTextAreaElement;
    surface.setSelectionRange(2, 2);

    runEditorCommand(editor, 'table-row-delete');
    runEditorCommand(editor, 'table-col-delete');

    expect(editor.getValue()).toBe('| Only |\n| --- |\n| Value |');
  });

  it('continues and removes Markdown task lines from the keyboard', () => {
    document.body.innerHTML = '<textarea data-uif="editor" data-uif-mode="markdown" data-uif-editor-status="true">- [x] Done</textarea>';
    const editor = createEditor(document.querySelector('textarea') as HTMLTextAreaElement);
    const surface = editor.surface as HTMLTextAreaElement;
    surface.setSelectionRange(surface.value.length, surface.value.length);

    surface.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(editor.getValue()).toBe('- [x] Done\n- [ ] ');
    surface.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(editor.getValue()).toBe('- [x] Done');
  });

  it('continues unordered, ordered, and nested Markdown list markers', () => {
    document.body.innerHTML = '<textarea data-uif="editor" data-uif-mode="markdown">- Parent\n  * Child\n9. Ninth</textarea>';
    const editor = createEditor(document.querySelector('textarea') as HTMLTextAreaElement);
    const surface = editor.surface as HTMLTextAreaElement;

    const childEnd = surface.value.indexOf('Child') + 'Child'.length;
    surface.setSelectionRange(childEnd, childEnd);
    surface.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(editor.getValue()).toContain('  * Child\n  * ');

    surface.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(editor.getValue()).not.toContain('\n  * \n');

    surface.setSelectionRange(surface.value.length, surface.value.length);
    surface.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(editor.getValue()).toContain('9. Ninth\n10. ');
  });

  it('validates required fields and runs autosave hooks', async () => {
    document.body.innerHTML = '<textarea data-uif="editor" data-uif-mode="markdown" data-uif-required="true" data-uif-autosave="true" data-uif-autosave-delay="1"></textarea>';
    const autosaves: string[] = [];
    const unregister = registerEditorHook('autosave', ({ value }) => autosaves.push(value));
    const editor = createEditor(document.querySelector('textarea') as HTMLTextAreaElement);
    expect(validateEditor(editor)).toContain('This field is required.');
    editor.setValue('Saved draft');
    await new Promise((resolve) => setTimeout(resolve, 5));
    expect(autosaves).toContain('Saved draft');
    unregister();
  });

  it('ignores stale autosave hook completions after a newer edit', async () => {
    document.body.innerHTML = '<textarea data-uif="editor" data-uif-mode="markdown"></textarea>';
    const pending: Array<() => void> = [];
    const unregister = registerEditorHook('autosave', () => new Promise<void>((resolve) => pending.push(resolve)));
    const editor = createEditor(document.querySelector('textarea') as HTMLTextAreaElement, { autosave: true, autosaveDelay: 1 });
    const saved = vi.fn();
    editor.element.addEventListener('uif:editor-autosave', saved);

    editor.setValue('First');
    await new Promise((resolve) => setTimeout(resolve, 5));
    expect(pending).toHaveLength(1);
    editor.setValue('Second');
    pending.shift()?.();
    await new Promise((resolve) => setTimeout(resolve, 5));
    expect(saved).not.toHaveBeenCalled();
    expect(editor.dirty).toBe(true);
    expect(pending).toHaveLength(1);

    pending.shift()?.();
    await new Promise((resolve) => setTimeout(resolve, 1));
    expect(saved).toHaveBeenCalledOnce();
    expect((saved.mock.calls[0][0] as CustomEvent).detail.value).toBe('Second');
    expect(editor.dirty).toBe(false);
    unregister();
  });

  it('sends governed autosaves with CSRF configuration and explicit errors', async () => {
    document.body.innerHTML = '<textarea data-uif="editor" data-uif-mode="markdown"></textarea>';
    const originalFetch = globalThis.fetch;
    const fetch = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal('fetch', fetch);
    const editor = createEditor(document.querySelector('textarea') as HTMLTextAreaElement, {
      autosave: true,
      autosaveDelay: 1,
      autosaveUrl: '/draft',
      autosaveRetries: 0,
      csrfToken: 'token',
      csrfHeader: 'x-test-csrf',
    });

    editor.setValue('Saved');
    await new Promise<CustomEvent>((resolve) => editor.element.addEventListener('uif:editor-autosave', (event) => resolve(event as CustomEvent), { once: true }));

    expect(fetch).toHaveBeenCalledOnce();
    expect(fetch.mock.calls[0][1]).toMatchObject({ headers: { 'content-type': 'application/json', 'x-test-csrf': 'token' } });
    vi.stubGlobal('fetch', originalFetch);
  });

  it('keeps dirty state and emits a dedicated autosave error event on failure', async () => {
    document.body.innerHTML = '<textarea data-uif="editor" data-uif-mode="markdown"></textarea>';
    const originalFetch = globalThis.fetch;
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    const editor = createEditor(document.querySelector('textarea') as HTMLTextAreaElement, {
      autosave: true,
      autosaveDelay: 1,
      autosaveUrl: '/draft',
      autosaveRetries: 0,
    });
    const failed = new Promise<CustomEvent>((resolve) => editor.element.addEventListener('uif:editor-autosave-error', (event) => resolve(event as CustomEvent), { once: true }));

    editor.setValue('Unsaved');
    expect((await failed).detail.error.message).toBe('offline');
    expect(editor.element.dataset.uifAutosaveState).toBe('error');
    expect(editor.dirty).toBe(true);
    vi.stubGlobal('fetch', originalFetch);
  });
});
