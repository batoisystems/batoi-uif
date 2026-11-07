import { startDesktop } from '../../dist/v4/desktop.js';
const application = startDesktop(document.querySelector('#application'));
window.addEventListener('pagehide', () => application.destroy(), { once: true });
