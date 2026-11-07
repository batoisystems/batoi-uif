import { startRAD } from '../../dist/v4/rad.js';
const application = startRAD(document.querySelector('#application'));
window.addEventListener('pagehide', () => application.destroy(), { once: true });
