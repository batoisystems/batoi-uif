import type { ComponentInstance } from '../controller.js';
export function initFileUpload(el: HTMLElement): ComponentInstance {
  const input = el.querySelector<HTMLInputElement>('input[type="file"]');
  const label = el.querySelector<HTMLElement>('[data-uif-role="file-list"]');
  const update = () => {
    if (!label || !input) return;
    label.textContent = Array.from(input.files || [])
      .map((file) => file.name)
      .join(', ');
  };
  input?.addEventListener('change', update);
  return { destroy: () => input?.removeEventListener('change', update) };
}
