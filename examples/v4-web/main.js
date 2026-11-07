import { startWeb } from '../../dist/v4/web.js';
const application = startWeb(document.querySelector('#application'));
window.addEventListener('pagehide', () => application.destroy(), { once: true });
