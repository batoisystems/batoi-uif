import { configureTrustedTypes, setSafeHTML } from '../../packages/dom/dist/index.js';

window.__uifSecurityViolations = [];
document.addEventListener('securitypolicyviolation', (event) => {
  window.__uifSecurityViolations.push(event.violatedDirective);
});

if (window.trustedTypes) {
  configureTrustedTypes(window.trustedTypes.createPolicy('batoi-uif-fixture', {
    createHTML: (value) => value,
  }));
}

const output = document.querySelector('#safe-output');
setSafeHTML(output, '<strong onclick="alert(1)">Safe</strong><script>window.__unsafe = true</script>');
output.dataset.ready = 'true';
output.dataset.trustedTypes = window.trustedTypes ? 'enforced' : 'unsupported';
