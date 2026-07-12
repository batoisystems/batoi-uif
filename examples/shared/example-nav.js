import { mountIcons } from '../../dist/uif.esm.js';

const examplesMarker = '/examples/';
const examplesIndex = window.location.pathname.indexOf(examplesMarker);
const examplesBasePath = examplesIndex >= 0 ? window.location.pathname.slice(0, examplesIndex + examplesMarker.length) : '/examples/';
const examplesRoot = new URL(examplesBasePath, window.location.origin);
const destinations = [
  ['All examples', './', 'home'],
  ['Showcase', 'professional-showcase/', 'dashboard'],
  ['Components', 'component-gallery/', 'grid'],
  ['Rich editor', 'rich-editor/', 'edit'],
  ['Markdown', 'markdown-editor/', 'document'],
];

function currentExample() {
  const relative = window.location.pathname.split('/examples/')[1] ?? '';
  return relative.replace(/index\.html$/, '').replace(/\/$/, '');
}

function normalizeBrand() {
  const brand = document.querySelector('.example-brand, .app-brand, .examples-brand, .artifact-brand');
  if (!brand) return;
  const mark = brand.querySelector('.example-brand-mark, .app-brand-mark, .examples-brand-mark, [data-uif-icon="batoi"]');
  if (!mark) return;
  const image = document.createElement('img');
  image.className = 'example-uif-logo';
  image.src = new URL('../docs/assets/logo/uif-color.svg', examplesRoot).href;
  image.alt = 'Batoi UIF';
  mark.replaceWith(image);
}

function normalizeNavigation() {
  const nav = document.querySelector('.example-topbar .example-actions, .app-topbar .app-actions, .examples-topbar .examples-actions, .artifact-topbar .artifact-actions');
  if (!nav) return;
  const artifactNavigation = nav.classList.contains('artifact-actions');
  const pillClass = artifactNavigation ? 'artifact-btn' : nav.classList.contains('app-actions') ? 'app-pill' : nav.classList.contains('examples-actions') ? 'examples-pill' : 'example-pill';
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
}

normalizeBrand();
normalizeNavigation();
