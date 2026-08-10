import { readFileSync } from 'node:fs';
import { URL } from 'node:url';

function sorted(values) {
  return [...new Set(values ?? [])].sort();
}

export async function collectContractReference(root) {
  const packageManifest = JSON.parse(readFileSync(new URL('package.json', root), 'utf8'));
  const cache = Date.now();
  const uif = await import(new URL(`dist/uif.esm.js?contracts=${cache}`, root).href);
  const profileModule = await import(new URL(`packages/profiles/dist/index.js?contracts=${cache}`, root).href);
  const runtimeDefinitions = new Map(uif.runtimeRegistry.definitions().map((definition) => [definition.name, definition]));
  const components = Object.fromEntries(Object.entries(uif.uifComponentContracts).sort(([a], [b]) => a.localeCompare(b)).map(([name, contract]) => {
    const runtime = runtimeDefinitions.get(name);
    return [name, {
      version: contract.version,
      package: contract.package,
      runtimeRegistered: Boolean(runtime),
      attributes: sorted(contract.attributes),
      roles: sorted(contract.roles),
      actions: sorted(contract.actions),
      events: sorted(contract.events),
      states: sorted(contract.states),
      errors: sorted(contract.errors),
      semanticFallback: contract.semanticFallback,
      accessibility: [...(contract.accessibility ?? [])],
      security: [...(contract.security ?? [])],
    }];
  }));
  return {
    schemaVersion: 1,
    frameworkVersion: packageManifest.version,
    contractVersion: 3,
    profiles: profileModule.uifProfiles,
    registries: {
      attributes: [...uif.uifAttributes],
      components: [...uif.uifValues],
      actions: [...uif.uifActions],
      states: [...uif.uifStates],
      events: [...uif.uifEvents],
    },
    components,
    envelopes: {
      agent: uif.agentEnvelopeContract,
      rad: uif.radEnvelopeContract,
    },
  };
}

function cell(value) {
  return String(value ?? '').replaceAll('|', '\\|').replaceAll('\n', ' ');
}

export function renderContractReference(reference) {
  const lines = [
    '# Generated Batoi UIF Contract Reference',
    '',
    `Framework ${reference.frameworkVersion}; contract version ${reference.contractVersion}. This file is generated from typed source definitions.`,
    '',
    '## Profiles',
    '',
    '| Profile | Entry point | Packages | Purpose |',
    '| --- | --- | --- | --- |',
  ];
  Object.values(reference.profiles).forEach((profile) => {
    lines.push(`| ${cell(profile.name)} | \`${cell(profile.entryPoint)}\` | ${cell(profile.packages.join(', '))} | ${cell(profile.purpose)} |`);
  });
  lines.push('', '## Components', '', '| Component | Package | Runtime | Fallback | Actions | Events | States | Errors |', '| --- | --- | --- | --- | --- | --- | --- | --- |');
  Object.entries(reference.components).forEach(([name, contract]) => {
    lines.push(`| \`${cell(name)}\` | \`@batoi/uif-${cell(contract.package)}\` | ${contract.runtimeRegistered ? 'registry' : 'compatibility adapter'} | ${cell(contract.semanticFallback)} | ${cell(contract.actions.join(', '))} | ${cell(contract.events.join(', '))} | ${cell(contract.states.join(', '))} | ${cell(contract.errors.join(', '))} |`);
  });
  lines.push('', '## Canonical Registries', '');
  Object.entries(reference.registries).forEach(([name, values]) => {
    lines.push(`- ${name}: ${values.map((value) => `\`${value}\``).join(', ')}`);
  });
  lines.push('', '## Envelope Authority', '', '| Envelope | Version | Authority |', '| --- | --- | --- |');
  lines.push(`| Agent Interaction | ${reference.envelopes.agent.version} | ${cell(reference.envelopes.agent.authority)} |`);
  lines.push(`| RAD Partial | ${reference.envelopes.rad.versions.join(', ')} | ${cell(reference.envelopes.rad.authority)} |`, '');
  return `${lines.join('\n')}\n`;
}
