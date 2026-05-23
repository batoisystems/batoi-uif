import { autoStart } from '../../index.js';

autoStart();

function toast(message, tone = 'success') {
  document.querySelector('.showcase-toast')?.remove();
  const el = document.createElement('div');
  el.className = `uif-alert uif-badge-${tone} showcase-toast`;
  el.textContent = message;
  document.body.append(el);
  window.setTimeout(() => el.remove(), 2400);
}

document.querySelectorAll('[data-showcase-toast]').forEach((button) => {
  button.addEventListener('click', () => toast(button.dataset.showcaseToast || 'Action completed', button.dataset.showcaseTone || 'success'));
});

document.querySelectorAll('[data-showcase-filter]').forEach((input) => {
  const selector = input.dataset.showcaseFilter;
  input.addEventListener('input', () => {
    const term = input.value.trim().toLowerCase();
    document.querySelectorAll(selector).forEach((item) => {
      item.hidden = term.length > 0 && !item.textContent.toLowerCase().includes(term);
    });
  });
});

document.querySelectorAll('[data-showcase-theme]').forEach((button) => {
  button.addEventListener('click', () => {
    document.documentElement.dataset.theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    toast(`Theme changed to ${document.documentElement.dataset.theme}`, 'info');
  });
});
