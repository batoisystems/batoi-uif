import { describe, expect, it } from 'vitest';
import { cleanEditorHtml, createEditor, escapeHtml, htmlToMarkdown, markdownToHtml } from './index.js';

describe('@batoi/uif-editor', () => {
  it('escapes HTML and renders a Markdown subset', () => {
    expect(escapeHtml('<script>x</script>')).toBe('&lt;script&gt;x&lt;/script&gt;');
    const html = markdownToHtml('# Title\n\n**Bold** and *em*\n\n- One\n- Two\n\n[site](https://example.com)');
    expect(html).toContain('<h1>Title</h1>');
    expect(html).toContain('<strong>Bold</strong>');
    expect(html).toContain('<ul><li>One</li><li>Two</li></ul>');
    expect(html).toContain('<a href="https://example.com">site</a>');
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
});
