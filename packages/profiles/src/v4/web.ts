import { startSelected } from '../selected.js';
import { webComponents } from '../web-components.js';

/** Selected progressive web controls, without forms/data/network engines. */
export function startWeb(root: Document | HTMLElement = document) {
  return startSelected(root, webComponents);
}
