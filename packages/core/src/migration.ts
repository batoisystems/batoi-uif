export interface UIFMigrationRule {
  id: string;
  introduced: string;
  strictIn: 3;
  surface: string;
  legacy: string;
  replacement: string;
  diagnostic: string;
}

export const uifMigrationRules = Object.freeze([
  {
    id: 'options-json', introduced: '2.4.0', strictIn: 3, surface: 'data-uif-options',
    legacy: 'Semicolon-delimited key:value options', replacement: 'A bounded JSON object using the component option schema', diagnostic: 'legacy-options',
  },
  {
    id: 'typed-text-json', introduced: '2.6.0', strictIn: 3, surface: 'data-uif-strings',
    legacy: 'Pipe-delimited phrase lists', replacement: 'A bounded JSON string array', diagnostic: 'legacy-typed-text-strings',
  },
  {
    id: 'cross-origin-capability', introduced: '2.6.0', strictIn: 3, surface: 'Remote URL options',
    legacy: 'Markup-only cross-origin allow flags', replacement: 'An application-registered exact origin/path capability plus explicit element intent', diagnostic: 'cross-origin-capability-required',
  },
  {
    id: 'partitioned-storage', introduced: '2.6.0', strictIn: 3, surface: 'Persisted browser convenience data',
    legacy: 'Unpartitioned global keys', replacement: 'configureStoragePartition() before persistence and owner-scoped cleanup at sign-out', diagnostic: 'storage-partition-recommended',
  },
  {
    id: 'agent-envelope-version', introduced: '2.4.0', strictIn: 3, surface: 'AI and MCP decisions',
    legacy: 'Unknown, incomplete, or unversioned decision envelopes', replacement: 'A governed Agent Interaction Envelope with supported version, request ID, expiry, and audit reference', diagnostic: 'agent-envelope-unavailable',
  },
] as const satisfies readonly UIFMigrationRule[]);
