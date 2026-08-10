import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { URL } from 'node:url';

function readJson(url) {
  return JSON.parse(readFileSync(url, 'utf8'));
}

function digest(url) {
  return createHash('sha256').update(readFileSync(url)).digest('hex');
}

export function collectReleaseMetadata(root) {
  const rootPackage = readJson(new URL('package.json', root));
  const packageNames = readdirSync(new URL('packages/', root)).sort();
  const manifests = packageNames.map((directory) => readJson(new URL(`packages/${directory}/package.json`, root)));
  const components = manifests.map((pkg) => ({
    type: 'library',
    'bom-ref': `pkg:npm/${encodeURIComponent(pkg.name)}@${pkg.version}`,
    name: pkg.name,
    version: pkg.version,
    licenses: [{ license: { id: pkg.license } }],
    properties: [{ name: 'batoi:runtimeDependencies', value: String(Object.keys(pkg.dependencies ?? {}).length) }],
  }));
  const dependencies = manifests.map((pkg) => ({
    ref: `pkg:npm/${encodeURIComponent(pkg.name)}@${pkg.version}`,
    dependsOn: Object.keys(pkg.dependencies ?? {}).sort().map((name) => {
      const dependency = manifests.find((candidate) => candidate.name === name);
      return `pkg:npm/${encodeURIComponent(name)}@${dependency?.version ?? pkg.version}`;
    }),
  }));
  const sbom = {
    bomFormat: 'CycloneDX',
    specVersion: '1.6',
    serialNumber: `urn:uuid:${createHash('sha256').update(`batoi-uif@${rootPackage.version}`).digest('hex').slice(0, 8)}-0000-4000-8000-${createHash('sha256').update(rootPackage.version).digest('hex').slice(0, 12)}`,
    version: 1,
    metadata: { component: { type: 'framework', name: rootPackage.name, version: rootPackage.version } },
    components,
    dependencies,
  };

  const artifactNames = ['index.d.ts', 'index.js', 'index.global.js', 'uif.css', 'uif.esm.js', 'uif.iife.js'];
  const subjects = artifactNames.map((name) => ({ name: `dist/${name}`, digest: { sha256: digest(new URL(`dist/${name}`, root)) } }));
  const provenance = {
    _type: 'https://in-toto.io/Statement/v1',
    subject: subjects,
    predicateType: 'https://slsa.dev/provenance/v1',
    predicate: {
      buildDefinition: {
        buildType: 'https://batoi.com/uif/npm-workspace-build/v1',
        externalParameters: { version: rootPackage.version, command: 'npm run build:dist' },
        internalParameters: { runtimeDependencies: 'workspace-only', sourceMaps: false },
        resolvedDependencies: [],
      },
      runDetails: {
        builder: { id: 'https://github.com/batoi/batoi-uif/.github/workflows/ci.yml' },
        metadata: { invocationId: `batoi-uif-${rootPackage.version}`, startedOn: null, finishedOn: null },
      },
    },
  };
  return { sbom, provenance };
}
