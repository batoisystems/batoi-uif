import { startMobile } from '../../dist/v4/mobile.js';
const application = startMobile(document.querySelector('#application'));
window.addEventListener('pagehide', () => application.destroy(), { once: true });
