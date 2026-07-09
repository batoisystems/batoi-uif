import { describe, expect, it } from 'vitest';
import { cleanEditorHtml, createEditor, escapeHtml, htmlToMarkdown, markdownToHtml, registerEditorHook, runEditorCommand, setEditorPreviewLayout, validateEditor } from './index.js';

describe('@batoi/uif-editor', () => {
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

  it('cleans dangerous HTML convenience cases', () => {
    expect(cleanEditorHtml('<p onclick="x()">Hi<script>x</script><a href="javascript:x">bad</a></p>')).toBe('<p>Hi<a>bad</a></p>');
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
    dialog.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    expect(document.querySelector('.uif-editor-dialog')).toBeNull();
    expect(document.activeElement?.closest('.uif-editor-dialog')).toBeNull();

    button.click();
    dialog = document.querySelector<HTMLFormElement>('.uif-editor-dialog') as HTMLFormElement;
    dialog.querySelector<HTMLButtonElement>('[data-uif-editor-dialog-cancel]')?.click();
    expect(document.querySelector('.uif-editor-dialog')).toBeNull();
    expect(document.activeElement?.closest('.uif-editor-dialog')).toBeNull();

    button.click();
    expect(document.querySelector('.uif-editor-dialog')).not.toBeNull();
    document.querySelector('#outside')?.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
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

  it('uses the Source button to toggle Markdown source and rendered output', () => {
    document.body.innerHTML = '<textarea data-uif="editor" data-uif-mode="markdown" data-uif-preview="manual" data-uif-toolbar="source"># Draft</textarea>';
    const editor = createEditor(document.querySelector('textarea') as HTMLTextAreaElement);
    const button = editor.element.querySelector<HTMLButtonElement>('[data-uif-editor-command="source"]') as HTMLButtonElement;
    expect(editor.sourceMode).toBe(true);
    expect(editor.surface.hidden).toBe(false);
    expect(editor.preview?.hidden).toBe(true);
    expect(button.getAttribute('aria-pressed')).toBe('true');
    button.click();
    expect(editor.sourceMode).toBe(false);
    expect(editor.surface.hidden).toBe(true);
    expect(editor.preview?.hidden).toBe(false);
    expect(editor.preview?.innerHTML).toContain('<h1>Draft</h1>');
    expect(button.getAttribute('aria-pressed')).toBe('false');
    button.click();
    expect(editor.sourceMode).toBe(true);
    expect(editor.surface.hidden).toBe(false);
    expect(editor.preview?.hidden).toBe(true);
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
});
