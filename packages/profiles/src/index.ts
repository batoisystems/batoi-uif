export type UIFProfileName = 'all' | 'rad' | 'dashboard' | 'mobile' | 'desktop' | 'agent';
export type UIFCapabilityGroupName = 'dom' | 'interaction' | 'shells' | 'offline';

export interface UIFProfileDefinition {
  name: UIFProfileName;
  version: 3;
  entryPoint: string;
  packages: readonly string[];
  purpose: string;
}

export interface UIFCapabilityGroupDefinition {
  name: UIFCapabilityGroupName;
  version: 3;
  packages: readonly string[];
  preferredEntryPoints: readonly string[];
  compatibility: string;
}

function profile(
  name: UIFProfileName,
  packages: readonly string[],
  purpose: string,
): Readonly<UIFProfileDefinition> {
  return Object.freeze({ name, version: 3, entryPoint: `@batoi/uif-profiles/${name}`, packages: Object.freeze([...packages]), purpose });
}

export const uifProfiles = Object.freeze({
  all: profile('all', ['core', 'dom', 'query', 'net', 'state', 'actions', 'effects', 'overlays', 'components', 'forms', 'editor', 'table', 'router', 'rad-adapter', 'charts', 'dashboard', 'desktop', 'realtime', 'pwa', 'push', 'mobile', 'ai', 'mcp', 'icons', 'extension-kit'], 'Complete namespace-based framework surface for tooling and broad applications.'),
  rad: profile('rad', ['core', 'dom', 'net', 'state', 'actions', 'components', 'forms', 'editor', 'table', 'router', 'rad-adapter', 'icons'], 'Server-rendered Batoi RAD applications and partial updates.'),
  dashboard: profile('dashboard', ['core', 'dom', 'net', 'state', 'components', 'table', 'charts', 'dashboard', 'realtime', 'icons'], 'Data-rich dashboards and realtime operational views.'),
  mobile: profile('mobile', ['core', 'dom', 'net', 'state', 'components', 'mobile', 'pwa', 'push', 'realtime', 'icons'], 'Mobile shells, progressive web apps, offline status, and notifications.'),
  desktop: profile('desktop', ['core', 'dom', 'net', 'state', 'components', 'desktop', 'pwa', 'realtime', 'icons'], 'Desktop-style workspaces and resilient application shells.'),
  agent: profile('agent', ['core', 'dom', 'net', 'components', 'ai', 'mcp', 'icons'], 'Provider-neutral assistant and governed tool-review interfaces.'),
} satisfies Record<UIFProfileName, Readonly<UIFProfileDefinition>>);

function capabilityGroup(
  name: UIFCapabilityGroupName,
  packages: readonly string[],
  preferredEntryPoints: readonly string[],
  compatibility: string,
): Readonly<UIFCapabilityGroupDefinition> {
  return Object.freeze({
    name,
    version: 3,
    packages: Object.freeze([...packages]),
    preferredEntryPoints: Object.freeze([...preferredEntryPoints]),
    compatibility,
  });
}

export const uifCapabilityGroups = Object.freeze({
  dom: capabilityGroup('dom', ['dom', 'query'], ['@batoi/uif-dom'], 'Query remains a compatibility facade and does not define a second safety model.'),
  interaction: capabilityGroup('interaction', ['actions', 'effects', 'overlays', 'components'], ['@batoi/uif-components', '@batoi/uif-profiles/all'], 'Direct package imports remain supported for small graphs.'),
  shells: capabilityGroup('shells', ['components', 'dashboard', 'mobile', 'desktop'], ['@batoi/uif-profiles/dashboard', '@batoi/uif-profiles/mobile', '@batoi/uif-profiles/desktop'], 'Composition packages share component lifecycle and shell primitives.'),
  offline: capabilityGroup('offline', ['pwa', 'push', 'realtime', 'state'], ['@batoi/uif-profiles/mobile', '@batoi/uif-profiles/desktop'], 'PWA and push remain separate permission boundaries behind one application capability model.'),
} satisfies Record<UIFCapabilityGroupName, Readonly<UIFCapabilityGroupDefinition>>);

export function getUIFProfile(name: UIFProfileName): Readonly<UIFProfileDefinition> {
  return uifProfiles[name];
}

export function getUIFCapabilityGroup(name: UIFCapabilityGroupName): Readonly<UIFCapabilityGroupDefinition> {
  return uifCapabilityGroups[name];
}
