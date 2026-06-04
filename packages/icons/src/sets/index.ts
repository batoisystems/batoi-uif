export { brandIcons } from './brand.js';
export { coreUiIcons } from './core-ui.js';
export { chartIcons } from './charts.js';
export { commerceIcons } from './commerce.js';
export { communicationIcons } from './communication.js';
export { contentIcons } from './content.js';
export { deviceIcons } from './devices.js';
export { adminSecurityIcons } from './admin-security.js';
export { workflowIcons } from './workflow.js';
export { domainIcons } from './domain.js';

import { brandIcons } from './brand.js';
import { coreUiIcons } from './core-ui.js';
import { chartIcons } from './charts.js';
import { commerceIcons } from './commerce.js';
import { communicationIcons } from './communication.js';
import { contentIcons } from './content.js';
import { deviceIcons } from './devices.js';
import { adminSecurityIcons } from './admin-security.js';
import { workflowIcons } from './workflow.js';
import { domainIcons } from './domain.js';

export const iconSets = {
  'brand': brandIcons,
  'core-ui': coreUiIcons,
  'charts': chartIcons,
  'commerce': commerceIcons,
  'communication': communicationIcons,
  'content': contentIcons,
  'devices': deviceIcons,
  'admin-security': adminSecurityIcons,
  'workflow': workflowIcons,
  'domain': domainIcons,
} as const;

export type IconCategory = keyof typeof iconSets;
