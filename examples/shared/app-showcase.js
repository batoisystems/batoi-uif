import { autoStart, mountIcons } from '../../dist/uif.esm.js';

const page = document.querySelector('.app-example-page');
const snippet = document.querySelector('[data-example-code]');

function setOption(name, value) {
  if (!page || !value) return;
  page.dataset[name] = value;
}

function copySnippet(button) {
  if (!snippet) return;
  navigator.clipboard?.writeText(snippet.value.trim());
  const label = button.textContent;
  button.textContent = 'Copied';
  window.setTimeout(() => {
    button.textContent = label;
    mountIcons(button);
  }, 1200);
}

document.addEventListener('change', (event) => {
  const select = event.target.closest('[data-example-tweak]');
  if (!select) return;
  setOption(select.dataset.exampleTweak, select.value);
});

document.addEventListener('click', (event) => {
  const button = event.target.closest('[data-example-copy]');
  if (!button) return;
  copySnippet(button);
});

autoStart();
mountIcons(document);
