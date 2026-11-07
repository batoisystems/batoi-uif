import { startSelected } from './selected.js';

export { createUIF } from '@batoi/uif-components/application';

export function startEssential(root: Document | HTMLElement = document) {
  return startSelected(root);
}
