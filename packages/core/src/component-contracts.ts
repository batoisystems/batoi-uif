import type { UIFValue } from './attributes.js';
import type { UIFComponentDefinition } from './component-registry.js';

export type UIFComponentContract = Omit<UIFComponentDefinition, 'mount' | 'defaults' | 'optionKeys' | 'limits'> & {
  name: UIFValue;
  version: 3;
  package: string;
  semanticFallback: string;
};

type ContractDetails = Partial<Pick<UIFComponentContract, 'attributes' | 'roles' | 'actions' | 'events' | 'states' | 'errors' | 'accessibility' | 'security'>>;

const commonAttributes = Object.freeze(['data-uif', 'data-uif-options', 'data-uif-state']);
const commonStates = Object.freeze(['idle', 'loading', 'success', 'error', 'disabled']);

function contract(
  name: UIFValue,
  packageName: string,
  semanticFallback: string,
  details: ContractDetails = {},
): Readonly<UIFComponentContract> {
  return Object.freeze({
    name,
    version: 3,
    package: packageName,
    semanticFallback,
    attributes: Object.freeze([...(details.attributes ?? commonAttributes)]),
    roles: Object.freeze([...(details.roles ?? [])]),
    actions: Object.freeze([...(details.actions ?? [])]),
    events: Object.freeze([...(details.events ?? [])]),
    states: Object.freeze([...(details.states ?? commonStates)]),
    errors: Object.freeze([...(details.errors ?? ['UIF_COMPONENT_MOUNT'])]),
    accessibility: Object.freeze([...(details.accessibility ?? ['Preserve useful semantic HTML before enhancement.'])]),
    security: Object.freeze([...(details.security ?? ['Render untrusted values as text.'])]),
  });
}

const disclosure = (name: UIFValue, fallback: string) => contract(name, 'components', fallback, {
  attributes: [...commonAttributes, 'data-uif-action', 'data-uif-target'],
  actions: ['open', 'close', 'toggle'],
  events: [`uif:${name}-open`, `uif:${name}-close`],
  states: ['open', 'closed', 'disabled'],
  accessibility: ['Own keyboard dismissal, focus movement, and focus return.'],
});

export const uifComponentContracts = Object.freeze({
  button: contract('button', 'components', 'Native button or link', { actions: ['activate'], roles: ['button'] }),
  modal: disclosure('modal', 'Visible dialog content'),
  drawer: disclosure('drawer', 'Visible complementary region'),
  offcanvas: disclosure('offcanvas', 'Visible complementary region'),
  dropdown: disclosure('dropdown', 'Native button followed by a menu or link list'),
  tabs: contract('tabs', 'components', 'Headings and sequential content sections', { actions: ['activate'], roles: ['tablist', 'tab', 'tabpanel'], events: ['uif:tabs-change'], states: ['active', 'inactive', 'disabled'], accessibility: ['Support arrow, Home, End, and focusable tab semantics.'] }),
  toast: contract('toast', 'components', 'Inline status message', { actions: ['close'], roles: ['status', 'alert'], events: ['uif:toast'], states: ['open', 'closed'] }),
  accordion: contract('accordion', 'components', 'Headings with visible section content', { actions: ['toggle'], roles: ['button', 'region'], events: ['uif:accordion-toggle'], states: ['expanded', 'collapsed', 'disabled'] }),
  alert: contract('alert', 'components', 'Inline alert content', { actions: ['close'], roles: ['alert'], states: ['open', 'closed'] }),
  badge: contract('badge', 'components', 'Inline status text'),
  breadcrumb: contract('breadcrumb', 'components', 'Navigation list', { roles: ['navigation'] }),
  collapse: disclosure('collapse', 'Visible collapsible content'),
  tooltip: contract('tooltip', 'components', 'Adjacent help text', { attributes: [...commonAttributes, 'data-uif-message'], roles: ['tooltip'], states: ['open', 'closed'], security: ['Tooltip content is text-only by default.'] }),
  popover: disclosure('popover', 'Inline contextual content'),
  progress: contract('progress', 'components', 'Native progress element or textual status', { attributes: [...commonAttributes, 'data-uif-value'], roles: ['progressbar'] }),
  spinner: contract('spinner', 'components', 'Textual loading status', { roles: ['status'], states: ['loading'] }),
  skeleton: contract('skeleton', 'components', 'Existing content or loading status', { roles: ['status'], states: ['loading'] }),
  pagination: contract('pagination', 'components', 'Navigation list', { actions: ['navigate'], roles: ['navigation'], events: ['uif:pagination-change'] }),
  'command-menu': disclosure('command-menu', 'Search input and command list'),
  navbar: contract('navbar', 'components', 'Navigation region', { roles: ['navigation'] }),
  sidebar: contract('sidebar', 'components', 'Complementary navigation region', { roles: ['complementary', 'navigation'] }),
  shell: contract('shell', 'components', 'Header, navigation, main, and complementary landmarks', { actions: ['toggle-sidebar', 'set-density'], roles: ['banner', 'navigation', 'main', 'complementary'] }),
  stepper: contract('stepper', 'components', 'Ordered list of steps', { states: ['active', 'completed', 'error', 'disabled'] }),
  wizard: contract('wizard', 'components', 'Sequential fieldsets', { actions: ['next', 'previous', 'submit'], events: ['uif:wizard-change'], states: ['active', 'completed', 'error'] }),
  'file-upload': contract('file-upload', 'components', 'Native file input', { events: ['uif:file-select'], security: ['Client file metadata is advisory; server validation remains authoritative.'] }),
  combobox: contract('combobox', 'components', 'Labelled native input and option list', { roles: ['combobox', 'listbox', 'option'], events: ['uif:combobox-change'], accessibility: ['Support keyboard option navigation and active-descendant state.'] }),
  carousel: contract('carousel', 'components', 'Sequential figures or articles', { actions: ['previous', 'next', 'select'], roles: ['region'], events: ['uif:carousel-change'], states: ['active', 'inactive'] }),
  lightbox: disclosure('lightbox', 'Linked image gallery'),
  masonry: contract('masonry', 'components', 'Sequential card or figure list'),
  card: contract('card', 'components', 'Article or section'),
  nav: contract('nav', 'components', 'Navigation region', { roles: ['navigation'] }),
  table: contract('table', 'table', 'Semantic table', { attributes: [...commonAttributes, 'data-uif-src', 'data-uif-method', 'data-uif-refresh'], actions: ['load', 'reload', 'select'], events: ['uif:table-load', 'uif:table-error', 'uif:table-select'], states: ['idle', 'loading', 'loaded', 'empty', 'error'], security: ['Remote data is bounded; HTML rows require governed server trust.'] }),
  form: contract('form', 'forms', 'Native form and controls', { attributes: [...commonAttributes, 'data-uif-src', 'data-uif-method', 'data-uif-validate', 'data-uif-rule'], actions: ['submit', 'reset'], events: ['uif:form-submit', 'uif:form-success', 'uif:form-error'], states: ['idle', 'submitting', 'success', 'error'], security: ['Browser validation is advisory; server validation and authorization are authoritative.'] }),
  editor: contract('editor', 'editor', 'Textarea', { attributes: [...commonAttributes, 'data-uif-mode', 'data-uif-toolbar', 'data-uif-preview'], actions: ['edit', 'preview', 'save'], events: ['uif:editor-change', 'uif:editor-diagnostics'], states: ['idle', 'dirty', 'saving', 'saved', 'error'], security: ['Sanitize editing boundaries and validate submitted content on the server.'] }),
  ajax: contract('ajax', 'rad-adapter', 'Link, button, or form with a normal server destination', { attributes: [...commonAttributes, 'data-uif-src', 'data-uif-method', 'data-uif-target', 'data-uif-swap'], actions: ['load'], events: ['uif:rad-before', 'uif:rad-success', 'uif:rad-error'], security: ['Partial HTML is explicit governed server output.'] }),
  route: contract('route', 'router', 'Native link navigation', { attributes: [...commonAttributes, 'data-uif-route', 'data-uif-target'], actions: ['navigate'], events: ['uif:route-before', 'uif:route-success', 'uif:route-error'], security: ['Navigation and partial URLs follow application URL policy.'] }),
  animate: contract('animate', 'effects', 'Static final visual state', { attributes: [...commonAttributes, 'data-uif-animation', 'data-uif-duration', 'data-uif-delay'], events: ['uif:animation-start', 'uif:animation-end'], accessibility: ['Respect reduced-motion preferences.'] }),
  'typed-text': contract('typed-text', 'effects', 'Complete static text', { events: ['uif:typed-text-complete'], accessibility: ['Expose stable text and respect reduced motion.'] }),
  chart: contract('chart', 'charts', 'Accessible data table or textual summary', { attributes: [...commonAttributes, 'data-uif-src'], roles: ['img'], events: ['uif:chart-select', 'uif:chart-error'], security: ['Remote data and drilldown URLs are bounded and policy checked.'] }),
  dashboard: contract('dashboard', 'dashboard', 'Sections containing metrics, tables, and lists', { events: ['uif:dashboard-error'], security: ['Custom HTML widgets are explicitly caller-trusted.'] }),
  'desktop-shell': contract('desktop-shell', 'desktop', 'Application landmarks and navigation', { actions: ['toggle-sidebar', 'set-density'], events: ['uif:desktop-change'], security: ['Persist preferences only; never store credentials.'] }),
  realtime: contract('realtime', 'realtime', 'Existing feed content', { attributes: [...commonAttributes, 'data-uif-src', 'data-uif-mode', 'data-uif-interval'], events: ['uif:realtime-state', 'uif:realtime-message', 'uif:realtime-error'], states: ['connecting', 'connected', 'disconnected', 'failed'], security: ['Messages are bounded and rendered as text by default.'] }),
  push: contract('push', 'push', 'Notification preference control', { actions: ['subscribe', 'unsubscribe'], events: ['uif:push-change', 'uif:push-error'], security: ['Subscription authorization and delivery remain server-side.'] }),
  'mobile-shell': contract('mobile-shell', 'mobile', 'Mobile application landmarks and navigation', { roles: ['navigation', 'main'], states: ['online', 'offline'] }),
  'ai-action': contract('ai-action', 'ai', 'Button or form describing an assistant action', { events: ['uif:ai-action'], security: ['Browser UI never holds provider credentials.'] }),
  'ai-thread': contract('ai-thread', 'ai', 'Ordered message transcript', { attributes: [...commonAttributes, 'data-uif-messages'], roles: ['log'], events: ['uif:agent:feedback', 'uif:agent:retry', 'uif:agent:copy', 'uif:agent:error'], security: ['Agent content uses validated versioned envelopes and text-safe rendering.'] }),
  'ai-composer': contract('ai-composer', 'ai', 'Labelled textarea and submit button', { events: ['uif:agent:submit', 'uif:agent:cancel'], states: ['idle', 'busy', 'disabled'], security: ['Composer emits events and does not invoke a model provider directly.'] }),
  'tool-approval': contract('tool-approval', 'mcp', 'Review summary with explicit decision controls', { actions: ['approve', 'reject'], events: ['uif:tool-approve', 'uif:tool-reject', 'uif:tool-expired'], states: ['waiting-approval', 'decision-pending', 'approved', 'rejected', 'expired'], security: ['Browser confirmation is not authorization or execution.'] }),
  'agent-tool': contract('agent-tool', 'mcp', 'Tool plan, review, progress, result, or receipt summary', { attributes: [...commonAttributes, 'data-uif-envelope'], events: ['uif:agent:error', 'uif:tool-approve', 'uif:tool-reject'], security: ['MCP invocation, permissions, and authoritative audit remain server-side.'] }),
  'install-prompt': contract('install-prompt', 'pwa', 'Normal installation guidance', { actions: ['install'], events: ['uif:pwa-install'], states: ['available', 'unavailable', 'installed'] }),
} satisfies Record<UIFValue, Readonly<UIFComponentContract>>);

export function getUIFComponentContract(name: string): Readonly<UIFComponentContract> | undefined {
  return uifComponentContracts[name as UIFValue];
}
