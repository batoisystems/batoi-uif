import { mountIcons } from '../../dist/uif.esm.js';

const examplesMarker = '/examples/';
const examplesIndex = window.location.pathname.indexOf(examplesMarker);
const examplesBasePath =
  examplesIndex >= 0
    ? window.location.pathname.slice(0, examplesIndex + examplesMarker.length)
    : '/examples/';
const examplesRoot = new URL(examplesBasePath, window.location.origin);
const destinations = [
  ['All examples', './', 'home'],
  ['Showcase', 'professional-showcase/', 'dashboard'],
  ['Components', 'component-gallery/', 'grid'],
  ['Rich editor', 'rich-editor/', 'edit'],
  ['Markdown', 'markdown-editor/', 'document'],
];
const themeKey = 'batoi-uif-example-theme';

function applyTheme(theme) {
  const resolved = theme === 'dark' ? 'dark' : 'light';
  document.documentElement.dataset.theme = resolved;
  document.querySelectorAll('.example-uif-logo').forEach((image) => {
    image.src = new URL(
      resolved === 'dark'
        ? '../docs/assets/logo/uif-mono-dark.svg'
        : '../docs/assets/logo/uif-color.svg',
      examplesRoot,
    ).href;
  });
  const toggle = document.querySelector('[data-example-theme-toggle]');
  if (toggle) {
    toggle.dataset.theme = resolved;
    toggle.setAttribute('aria-pressed', String(resolved === 'dark'));
    toggle.setAttribute('aria-label', `Use ${resolved === 'dark' ? 'light' : 'dark'} theme`);
    const label = toggle.querySelector('[data-theme-label]');
    if (label) label.textContent = resolved === 'dark' ? 'Light' : 'Dark';
  }
}

function currentExample() {
  const relative = window.location.pathname.split('/examples/')[1] ?? '';
  return relative.replace(/index\.html$/, '').replace(/\/$/, '');
}

function normalizeBrand() {
  const brand = document.querySelector(
    '.example-brand, .app-brand, .examples-brand, .artifact-brand',
  );
  if (!brand) return;
  const mark = brand.querySelector(
    '.example-brand-mark, .app-brand-mark, .examples-brand-mark, [data-uif-icon="batoi"]',
  );
  if (!mark) return;
  const image = document.createElement('img');
  image.className = 'example-uif-logo';
  image.src = new URL('../docs/assets/logo/uif-color.svg', examplesRoot).href;
  image.alt = 'Batoi UIF';
  mark.replaceWith(image);
}

function normalizeNavigation() {
  const nav = document.querySelector(
    '.example-topbar .example-actions, .app-topbar .app-actions, .examples-topbar .examples-actions, .artifact-topbar .artifact-actions',
  );
  if (!nav) return;
  const artifactNavigation = nav.classList.contains('artifact-actions');
  const pillClass = artifactNavigation
    ? 'artifact-btn'
    : nav.classList.contains('app-actions')
      ? 'app-pill'
      : nav.classList.contains('examples-actions')
        ? 'examples-pill'
        : 'example-pill';
  const current = currentExample();
  if (artifactNavigation) nav.querySelectorAll(':scope > a').forEach((link) => link.remove());
  else nav.replaceChildren();
  nav.setAttribute('aria-label', 'Example navigation');
  for (const [label, path, icon] of destinations) {
    const target = path.replace(/\/$/, '').replace(/^\.\/$/, '');
    const link = document.createElement('a');
    link.className = pillClass;
    link.href = new URL(path, examplesRoot).href;
    if (current === target || (!current && !target)) {
      link.classList.add('is-primary');
      link.setAttribute('aria-current', 'page');
    }
    const mark = document.createElement('span');
    mark.dataset.uifIcon = icon;
    mark.setAttribute('aria-hidden', 'true');
    link.append(mark, document.createTextNode(label));
    if (artifactNavigation) nav.insertBefore(link, nav.querySelector(':scope > button'));
    else nav.append(link);
  }
  mountIcons(nav);

  const search = document.createElement('form');
  search.className = 'example-search';
  search.setAttribute('role', 'search');
  search.innerHTML = `<label class="uif-sr-only" for="example-search-input">Search examples and components</label>
    <input id="example-search-input" type="search" placeholder="Search examples and components" autocomplete="off" aria-controls="example-search-results" aria-expanded="false">
    <div id="example-search-results" class="example-search-results" role="listbox" hidden></div>`;
  nav.append(search);

  const theme = document.createElement('button');
  theme.className = pillClass;
  theme.type = 'button';
  theme.dataset.exampleThemeToggle = '';
  theme.innerHTML =
    '<span data-uif-icon="spark" aria-hidden="true"></span><span data-theme-label>Dark</span>';
  nav.append(theme);
  mountIcons(theme);
  theme.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    window.localStorage.setItem(themeKey, next);
    applyTheme(next);
  });

  initializeSearch(search);
}

async function buildSearchCatalog() {
  const parser = new window.DOMParser();
  const [examplesResponse, componentsResponse] = await Promise.all([
    fetch(new URL('./index.html', examplesRoot)),
    fetch(new URL('component-gallery/index.html', examplesRoot)),
  ]);
  if (!examplesResponse.ok || !componentsResponse.ok) throw new Error('Search catalog unavailable');
  const examplesDocument = parser.parseFromString(await examplesResponse.text(), 'text/html');
  const componentsDocument = parser.parseFromString(await componentsResponse.text(), 'text/html');
  const examples = [...examplesDocument.querySelectorAll('a.examples-card[href]')].map((card) => ({
    label: card.querySelector('h3')?.textContent?.trim() || card.textContent.trim(),
    description: card.querySelector('p')?.textContent?.trim() || 'Example',
    url: new URL(card.getAttribute('href'), examplesRoot).href,
    type: 'Example',
  }));
  const components = [...componentsDocument.querySelectorAll('.component-card')]
    .map((card) => {
      const label = card.querySelector('h2')?.textContent?.trim();
      const id = card.id || componentId(label);
      return {
        label,
        description:
          card.querySelector('.component-card-head p')?.textContent?.trim() || 'Component',
        url: new URL(`component-gallery/#${id}`, examplesRoot).href,
        type: 'Component',
      };
    })
    .filter((item) => item.label);
  const unique = new Map(
    [...examples, ...components].map((item) => [`${item.type}:${item.label}`, item]),
  );
  return [...unique.values()];
}

function componentId(label = '') {
  return `component-${label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')}`;
}

function normalizeComponentAnchors() {
  document.querySelectorAll('.component-card:not([id])').forEach((card) => {
    const label = card.querySelector('h2')?.textContent?.trim();
    if (label) card.id = componentId(label);
  });
}

function initializeSearch(form) {
  const input = form.querySelector('input');
  const results = form.querySelector('[role="listbox"]');
  let catalogPromise;

  const hide = () => {
    results.hidden = true;
    input.setAttribute('aria-expanded', 'false');
  };
  const render = async () => {
    const query = input.value.trim().toLowerCase();
    if (!query) return hide();
    catalogPromise ??= buildSearchCatalog();
    try {
      const catalog = await catalogPromise;
      const matches = catalog
        .filter((item) =>
          `${item.label} ${item.description} ${item.type}`.toLowerCase().includes(query),
        )
        .slice(0, 8);
      results.replaceChildren(
        ...matches.map((item) => {
          const link = document.createElement('a');
          link.href = item.url;
          link.setAttribute('role', 'option');
          const label = document.createElement('strong');
          label.textContent = item.label;
          const meta = document.createElement('span');
          meta.textContent = item.type;
          link.append(label, meta);
          return link;
        }),
      );
      if (!matches.length) {
        const empty = document.createElement('span');
        empty.className = 'example-search-empty';
        empty.textContent = 'No matching example or component';
        results.append(empty);
      }
      results.hidden = false;
      input.setAttribute('aria-expanded', 'true');
    } catch {
      results.replaceChildren();
      const empty = document.createElement('span');
      empty.className = 'example-search-empty';
      empty.textContent = 'Search is temporarily unavailable';
      results.append(empty);
      results.hidden = false;
    }
  };
  input.addEventListener('input', render);
  input.addEventListener('focus', render);
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    await render();
    results.querySelector('a')?.click();
  });
  document.addEventListener('click', (event) => {
    if (!form.contains(event.target)) hide();
  });
}

function installNavigationStyles() {
  const style = document.createElement('style');
  style.textContent = `.example-search{position:relative;min-width:min(19rem,100%)}.example-search input{width:100%;min-height:2.25rem;padding:.4rem .75rem;border:1px solid var(--uif-border,#dfe3e8);border-radius:.5rem;background:var(--uif-surface-elevated,#fff);color:var(--uif-text,#344054);font:inherit}.example-search input:focus{border-color:var(--uif-color-primary,#0b72bd);outline:3px solid color-mix(in srgb,var(--uif-color-primary,#0b72bd),transparent 84%)}.example-search-results{position:absolute;top:calc(100% + .4rem);right:0;z-index:100;width:min(26rem,90vw);max-height:22rem;overflow:auto;padding:.35rem;border:1px solid var(--uif-border,#dfe3e8);border-radius:.6rem;background:var(--uif-surface-elevated,#fff);box-shadow:0 16px 38px rgba(16,24,40,.16)}.example-search-results a{display:flex;justify-content:space-between;gap:1rem;padding:.55rem .65rem;border-radius:.4rem;color:var(--uif-text,#344054);text-decoration:none}.example-search-results a:hover,.example-search-results a:focus{background:var(--uif-surface-muted,#eef6fd)}.example-search-results a span,.example-search-empty{color:var(--uif-text-muted,#667085);font-size:.75rem}.example-search-empty{display:block;padding:.65rem}@media(max-width:64rem){.example-search{order:20;width:100%}}`;
  document.head.append(style);
}

installNavigationStyles();
normalizeComponentAnchors();
normalizeBrand();
normalizeNavigation();
applyTheme(
  window.localStorage.getItem(themeKey) || document.documentElement.dataset.theme || 'light',
);
