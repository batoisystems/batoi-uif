// Authoring/build-time metadata only. Never imported by a browser controller.
// Options here are data attributes; the v4 controls accept no opaque JSON options.
const control = (name, initializer, details) => ({
  name,
  version: 4,
  module: `@batoi/uif-components/${name}`,
  initializer,
  style: 'essential',
  options: { type: 'object', additionalProperties: false, properties: {} },
  ...details,
});
export const components = Object.freeze([
  control('modal', 'initModal', {
    actions: ['open', 'close', 'toggle'],
    attributes: {
      'data-uif-mode': ['dismissible', 'locked'],
      'data-uif-backdrop': ['true', 'static'],
      'data-uif-keyboard': ['true', 'false'],
    },
    roles: ['dialog'],
    states: ['open', 'closed'],
    events: ['uif:open', 'uif:close', 'uif:overlay-open', 'uif:overlay-close'],
    keyboard: 'Tab wraps in the top dialog; Escape dismisses only the top dismissible overlay.',
    fallback: 'Dialog content requires an ordinary page/link alternative when initially hidden.',
    example:
      '<button type="button" data-uif-action="open" data-uif-target="#sample-modal">Open dialog</button><div id="sample-modal" class="uif-modal" data-uif="modal" aria-labelledby="sample-modal-title" hidden><div data-uif-role="dialog" aria-labelledby="sample-modal-title"><h3 id="sample-modal-title">Review changes</h3><button type="button" data-uif-action="close">Close dialog</button></div></div>',
  }),
  control('dropdown', 'initDropdown', {
    actions: ['open', 'close', 'toggle'],
    attributes: {},
    roles: ['menu', 'menuitem'],
    states: ['open', 'closed'],
    events: [],
    keyboard:
      'Arrow keys, Home, End, typeahead; Escape returns focus; Tab closes without trapping.',
    fallback: 'Keep important navigation as visible native links without JavaScript.',
    example:
      '<div class="uif-dropdown" data-uif="dropdown"><button type="button" data-uif-role="trigger">Actions</button><div data-uif-role="panel"><button type="button" data-uif-role="item">Edit record</button><button type="button" data-uif-role="item" disabled>Delete unavailable</button></div></div>',
  }),
  control('tabs', 'initTabs', {
    actions: [],
    attributes: {
      'data-uif-activation': ['automatic', 'manual'],
      'data-uif-orientation': ['horizontal', 'vertical'],
    },
    roles: ['tablist', 'tab', 'tabpanel'],
    states: ['active', 'inactive'],
    events: [],
    keyboard:
      'Arrow keys respect orientation and RTL; Home/End; manual Enter/Space. Disabled tabs are skipped.',
    fallback: 'Sequential content sections remain visible before enhancement.',
    example:
      '<div data-uif="tabs"><div data-uif-role="tablist" aria-label="Record details"><button type="button" data-uif-role="tab">Overview</button><button type="button" data-uif-role="tab">History</button></div><section data-uif-role="tabpanel">Overview content</section><section data-uif-role="tabpanel">History content</section></div>',
  }),
  control('accordion', 'initAccordion', {
    actions: ['toggle'],
    attributes: { 'data-uif-state': ['expanded', 'collapsed'] },
    roles: ['button'],
    states: ['expanded', 'collapsed'],
    events: [],
    keyboard: 'Native button click, Enter, Space.',
    fallback: 'Section content is visible before enhancement.',
    example:
      '<section data-uif="accordion"><h3><button type="button" data-uif-role="trigger">More details</button></h3><div data-uif-role="panel">Disclosure content</div></section>',
  }),
  control('collapse', 'initCollapse', {
    actions: ['toggle'],
    attributes: { 'data-uif-state': ['expanded', 'collapsed'] },
    roles: [],
    states: ['expanded', 'collapsed'],
    events: [],
    keyboard: 'Use a native button trigger. Applications own trigger labels and expanded state.',
    fallback: 'Content remains visible before enhancement.',
    example:
      '<button type="button" data-uif-action="toggle" data-uif-target="#sample-collapse">Toggle details</button><section id="sample-collapse" data-uif="collapse">Collapsible details</section>',
  }),
  control('toast', 'initToast', {
    actions: ['close'],
    attributes: {
      'data-uif-type': ['info', 'success', 'warning', 'danger'],
      'data-uif-duration': 'milliseconds; 0 uses the default duration',
      'data-uif-dismissible': ['true', 'false'],
    },
    roles: ['status', 'alert'],
    states: ['open', 'closed'],
    events: [],
    keyboard: 'Native dismiss button. Duration pauses while focused or hovered.',
    fallback: 'Inline status text.',
    example:
      '<div data-uif="toast" class="uif-toast" data-uif-duration="600000">Saved successfully<button type="button" data-uif-action="close" aria-label="Dismiss notification">Close</button></div>',
  }),
]);
export const profiles = Object.freeze(['web', 'mobile', 'desktop']);
export const layouts = Object.freeze({
  web: ['sidebar', 'content'],
  mobile: ['bottom-nav', 'stack'],
  desktop: ['workspace', 'sidebar'],
});
export const tokenTypes = Object.freeze([
  'color',
  'dimension',
  'duration',
  'number',
  'fontWeight',
  'fontFamily',
  'cubicBezier',
]);
export const limits = Object.freeze({
  bytes: 100000,
  tokens: 512,
  nesting: 16,
  artifactCount: 20,
  artifactTTL: 900000,
});
export const catalog = Object.freeze({
  schemaVersion: 1,
  contractVersion: 4,
  framework: '^4.0.0',
  components,
  profiles,
  layouts,
  tokenTypes,
  limits,
  authority:
    'Browser packages are UI-only. Authoring application requires operator-enabled backend authority; model output never grants permission.',
});

const tokenTree = {
  type: 'object',
  maxProperties: 512,
  propertyNames: { pattern: '^(\\$description|[a-z][a-z0-9-]{0,63})$' },
  additionalProperties: {
    anyOf: [{ type: 'string' }, { $ref: '#/$defs/token' }, { $ref: '#/$defs/tree' }],
  },
};
export const themeSchema = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  title: 'UIF portable theme, supported DTCG subset',
  type: 'object',
  additionalProperties: false,
  required: [
    'schemaVersion',
    'name',
    'framework',
    'profiles',
    'components',
    'tokens',
    'modes',
    'layouts',
  ],
  properties: {
    schemaVersion: { const: 1 },
    name: { type: 'string', pattern: '^[a-z][a-z0-9-]{0,63}$' },
    framework: { const: '^4.0.0' },
    profiles: {
      type: 'array',
      minItems: 1,
      maxItems: 3,
      uniqueItems: true,
      items: { enum: profiles },
    },
    components: {
      type: 'array',
      maxItems: components.length,
      uniqueItems: true,
      items: { enum: components.map((c) => c.name) },
    },
    tokens: { $ref: '#/$defs/tree' },
    modes: {
      type: 'object',
      required: ['light'],
      additionalProperties: false,
      properties: Object.fromEntries(
        ['light', 'dark', 'high-contrast'].map((m) => [m, { $ref: '#/$defs/tree' }]),
      ),
    },
    layouts: {
      type: 'object',
      additionalProperties: false,
      properties: Object.fromEntries(
        Object.entries(layouts).map(([p, choices]) => [p, { enum: choices }]),
      ),
    },
    // Asset materialization is not enabled in the first authoring implementation.
    assets: { type: 'array', maxItems: 0 },
  },
  $defs: {
    tree: tokenTree,
    token: {
      type: 'object',
      required: ['$value'],
      additionalProperties: false,
      properties: { $type: { enum: tokenTypes }, $value: {}, $description: { type: 'string' } },
    },
  },
  description:
    'Run the UIF validator as well: alias/type/contrast/resource and cross-field constraints are not all expressible here. Active code, arbitrary CSS, remote assets and public server deployment are outside this format.',
};
