import { configureTrustedTypes, isSafeURL, setSafeHTML } from '../../packages/dom/dist/index.js';

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

const policyResults = [
  isSafeURL('/\\other.example/private', { context: 'network', sameOrigin: true }),
  isSafeURL('\\\\other.example/private', { context: 'navigation', sameOrigin: true }),
  isSafeURL('/relative', { context: 'network', allowRelative: false }),
  isSafeURL('#fragment', { context: 'network', allowHash: false }),
];
const base = document.createElement('base');
base.href = 'https://other.example/';
document.head.prepend(base);
try {
  policyResults.push(isSafeURL('relative', { context: 'network', sameOrigin: true }));
  policyResults.push(isSafeURL('relative', { context: 'network', requireCapability: true }));
} finally { base.remove(); }
output.dataset.urlPolicy = JSON.stringify(policyResults);
