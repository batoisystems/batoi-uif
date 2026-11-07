const source = document.querySelector('#source');
const status = document.querySelector('#status');
const report = document.querySelector('#report');
const frame = document.querySelector('#preview');
const choices = Object.fromEntries(['profile', 'mode', 'direction', 'density', 'width'].map((id) => [id, document.getElementById(id)]));
let artifact;
let revision = 0;
const applyMode = () => {
  const root = frame.contentDocument?.documentElement;
  const mode = Object.hasOwn(artifact?.manifest.contrastPairs ?? {}, choices.mode.value) ? choices.mode.value : 'light';
  if (mode !== choices.mode.value) status.textContent = 'Selected mode is absent; displaying light mode. Add and validate that mode before export.';
  root?.setAttribute('data-theme', mode);
  root?.setAttribute('dir', choices.direction.value);
  root?.setAttribute('data-uif-density', choices.density.value);
};
const show = () => {
  document.querySelector('#viewport').dataset.width = choices.width.value;
  if (!artifact) return;
  if (!artifact.manifest.files[`${choices.profile.value}.html`]) { status.textContent = 'Profile is not selected in this theme.'; return; }
  const path = `/artifacts/${artifact.artifactId}/${choices.profile.value}.html`;
  if (frame.getAttribute('src') !== path) frame.src = path;
  else applyMode();
};
frame.addEventListener('load', applyMode);
Object.values(choices).forEach((select) => select.addEventListener('change', show));
async function build() {
  const current = ++revision;
  status.textContent = 'Validating…';
  try {
    const response = await fetch('/build', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: source.value });
    const result = await response.json();
    if (current !== revision) return false;
    report.textContent = JSON.stringify(result, null, 2);
    if (!response.ok) { status.textContent = 'Validation failed. The previous preview is unchanged.'; return false; }
    artifact = result;
    status.textContent = 'Valid theme. Inspect every selected profile and mode; rendered/manual accessibility checks are still required.';
    show();
    return true;
  } catch { if (current === revision) status.textContent = 'Unable to build. Check the local studio server.'; return false; }
}
document.querySelector('#build').addEventListener('click', build);
document.querySelector('#file').addEventListener('change', async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  if (file.size > 100000) { status.textContent = 'File exceeds 100,000 bytes.'; return; }
  source.value = await file.text();
  await build();
});
document.querySelector('#download').addEventListener('click', async () => {
  try {
    if (!await build()) return;
    const response = await fetch(`/artifacts/${artifact.artifactId}/uif.theme.json`);
    if (!response.ok) throw new Error('Export unavailable');
    const url = URL.createObjectURL(new window.Blob([await response.text()], { type: 'application/json' }));
    const link = document.createElement('a'); link.href = url; link.download = 'uif.theme.json'; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  } catch { status.textContent = 'Export failed. Revalidate the manifest and check the local server.'; }
});
try { source.value = JSON.stringify(await (await fetch('/starter.json')).json(), null, 2); await build(); }
catch { status.textContent = 'Unable to load starter.'; }
