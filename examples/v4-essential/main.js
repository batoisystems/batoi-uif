import { startEssential } from '../../dist/v4/essential.js';
const application = startEssential(document.querySelector('#application'));
window.addEventListener('pagehide', () => application.destroy(), { once: true });
