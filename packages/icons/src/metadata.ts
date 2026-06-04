import { icons, type IconName } from './icons.js';
import { iconSets, type IconCategory } from './sets/index.js';
import type { IconMetadata, IconSearchOptions } from './types.js';

const categoryTags: Record<IconCategory, string[]> = {
  'admin-security': ['admin', 'security', 'access', 'identity', 'compliance'],
  brand: ['brand', 'logo'],
  charts: ['analytics', 'data', 'dashboard', 'metrics', 'visualization'],
  commerce: ['commerce', 'billing', 'payment', 'retail'],
  communication: ['communication', 'collaboration', 'notification'],
  content: ['content', 'document', 'editor', 'media'],
  'core-ui': ['ui', 'control', 'navigation'],
  devices: ['device', 'hardware', 'network'],
  domain: ['domain', 'industry'],
  workflow: ['workflow', 'operation', 'automation', 'task'],
};

const curatedAliases: Partial<Record<IconName, string[]>> = {
  alert: ['danger', 'risk'],
  approval: ['approve', 'verified'],
  archive: ['box'],
  'area-chart': ['area graph'],
  'bar-chart': ['bar graph'],
  batoi: ['batoi logo'],
  cart: ['shopping cart'],
  cash: ['money'],
  chart: ['trend', 'analytics'],
  check: ['done', 'confirm'],
  close: ['x', 'dismiss'],
  dashboard: ['gauge', 'overview'],
  document: ['page'],
  download: ['export'],
  edit: ['pencil'],
  error: ['failure', 'invalid'],
  'external-link': ['open'],
  file: ['document'],
  filter: ['funnel'],
  help: ['question'],
  home: ['house'],
  info: ['information'],
  list: ['bullets'],
  location: ['pin', 'marker'],
  mail: ['email'],
  menu: ['hamburger'],
  package: ['box', 'parcel'],
  refresh: ['reload'],
  search: ['find'],
  settings: ['cog', 'gear'],
  success: ['valid', 'complete'],
  sync: ['refresh'],
  trash: ['delete', 'remove'],
  uif: ['batoi uif logo'],
  user: ['person', 'account'],
  users: ['team', 'people'],
  warning: ['alert'],
};

function categoryFor(name: string): IconCategory {
  for (const [category, registry] of Object.entries(iconSets) as Array<[IconCategory, typeof iconSets[IconCategory]]>) {
    if (name in registry) return category;
  }

  return 'core-ui';
}

function unique(values: string[]): string[] {
  return [...new Set(values.filter(Boolean).map((value) => value.trim().toLowerCase()))];
}

function generatedTags(name: string, category: IconCategory): string[] {
  return unique([...name.split('-'), category, ...categoryTags[category]]);
}

export const iconMetadata = Object.keys(icons).reduce(
  (metadata, name) => {
    const iconName = name as IconName;
    const category = categoryFor(iconName);
    metadata[iconName] = {
      aliases: unique(curatedAliases[iconName] ?? []),
      category,
      name: iconName,
      status: 'stable',
      tags: generatedTags(iconName, category),
    };
    return metadata;
  },
  {} as Record<IconName, IconMetadata>,
);

export function getIconMetadata(name: IconName | string): IconMetadata | undefined {
  return iconMetadata[name as IconName];
}

export function iconsByCategory(category: IconCategory | string): IconName[] {
  const registry = iconSets[category as IconCategory];
  return registry ? (Object.keys(registry) as IconName[]) : [];
}

export function searchIcons(query = '', options: IconSearchOptions = {}): IconName[] {
  const terms = query
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

  return (Object.keys(iconMetadata) as IconName[])
    .filter((name) => {
      const metadata = iconMetadata[name];
      if (!options.includeDeprecated && metadata.status === 'deprecated') return false;
      if (options.category && metadata.category !== options.category) return false;
      if (!terms.length) return true;

      const haystack = unique([metadata.name, metadata.category, ...metadata.aliases, ...metadata.tags]).join(' ');
      return terms.every((term) => haystack.includes(term));
    })
    .sort((a, b) => a.localeCompare(b));
}
