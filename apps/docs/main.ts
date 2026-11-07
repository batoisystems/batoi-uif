import { startEssential } from '../../dist/v4/essential.js';

const app = startEssential(document);
window.addEventListener('pagehide', () => app.destroy(), { once: true });
const search = document.querySelector<HTMLInputElement>('#docs-search');
const status = document.querySelector<HTMLElement>('#docs-search-status');
const sections = Array.from(document.querySelectorAll<HTMLElement>('main > section'));
const filter = () => {
  const query = search?.value.trim().toLowerCase() ?? '';
  let count = 0;
  for (const section of sections) {
    section.hidden = Boolean(query && !section.textContent?.toLowerCase().includes(query));
    if (!section.hidden) count++;
  }
  if (status) status.textContent = `${count} documentation sections${query ? ' match' : ''}.`;
};
search?.addEventListener('input', filter);
document.addEventListener('click', (event) => {
  const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[href^="#"]') : null;
  if (link && search) { search.value = ''; filter(); }
});
