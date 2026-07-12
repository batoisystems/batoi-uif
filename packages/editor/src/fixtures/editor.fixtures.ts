export const htmlSanitizationFixtures = [
  {
    name: 'event handlers and scripts',
    input: '<p onclick="alert(1)">Safe</p><script>alert(1)</script>',
    expected: '<p>Safe</p>',
  },
  {
    name: 'unsafe link protocol',
    input: '<p><a href="javascript:alert(1)">Link</a></p>',
    expected: '<p><a>Link</a></p>',
  },
  {
    name: 'new-window relationship',
    input: '<p><a href="/docs" target="_blank">Docs</a></p>',
    expected: '<p><a href="/docs" target="_blank" rel="noopener noreferrer">Docs</a></p>',
  },
  {
    name: 'task checkbox and rejected text input',
    input: '<ul class="uif-task-list"><li><input type="checkbox" checked> Done<input type="text" value="bad"></li></ul>',
    expected: '<ul class="uif-task-list"><li><input type="checkbox" checked=""> Done</li></ul>',
  },
] as const;

export const markdownRenderingFixtures = [
  {
    name: 'nested emphasis and link',
    input: '**Read [the *guide*](/docs)**',
    contains: ['<strong>', '<a href="/docs">', '<em>guide</em>'],
    excludes: ['javascript:'],
  },
  {
    name: 'mixed nested lists',
    input: '- Parent\n  1. First\n  2. Second\n- Sibling',
    contains: ['<ul>', '<ol>', '<li>First</li>', '<li>Sibling</li>'],
    excludes: ['undefined'],
  },
  {
    name: 'aligned pipe table',
    input: '| Name | Value |\n| :--- | ---: |\n| A | 1 |',
    contains: ['<table>', 'class="uif-text-left"', 'class="uif-text-right"', '>A</td>'],
    excludes: ['markdown-table-width'],
  },
  {
    name: 'raw HTML remains escaped',
    input: '<img src=x onerror=alert(1)>',
    contains: ['&lt;img src=x onerror=alert(1)&gt;'],
    excludes: ['<img'],
  },
] as const;
