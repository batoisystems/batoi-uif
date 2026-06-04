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
