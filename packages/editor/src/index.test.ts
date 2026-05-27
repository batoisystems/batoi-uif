import { describe, expect, it } from 'vitest';
import { cleanEditorHtml, createEditor, escapeHtml, htmlToMarkdown, markdownToHtml, registerEditorHook, runEditorCommand, validateEditor } from './index.js';

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
    expect(editor.sourceMode).toBe(false);
    expect(editor.surface instanceof HTMLTextAreaElement).toBe(false);
    button.click();
    expect(editor.sourceMode).toBe(true);
    expect(editor.surface instanceof HTMLTextAreaElement).toBe(true);
    expect(button.getAttribute('aria-pressed')).toBe('true');
    button.click();
    expect(editor.sourceMode).toBe(false);
    expect(editor.surface instanceof HTMLTextAreaElement).toBe(false);
    expect(button.getAttribute('aria-pressed')).toBe('false');
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

  it('runs Markdown commands against selected text and updates status', () => {
    document.body.innerHTML = '<textarea data-uif="editor" data-uif-mode="markdown" data-uif-editor-status="true">Draft</textarea>';
    const editor = createEditor(document.querySelector('textarea') as HTMLTextAreaElement);
    const surface = editor.surface as HTMLTextAreaElement;
    surface.setSelectionRange(0, 5);
    runEditorCommand(editor, 'bold');
    expect(editor.getValue()).toContain('**Draft**');
    expect(editor.status?.textContent).toContain('Unsaved changes');
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
