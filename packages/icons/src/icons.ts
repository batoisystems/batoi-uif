import type { IconRegistry } from './types.js';
import { brandIcons } from './sets/brand.js';
import { coreUiIcons } from './sets/core-ui.js';
import { chartIcons } from './sets/charts.js';
import { commerceIcons } from './sets/commerce.js';
import { communicationIcons } from './sets/communication.js';
import { contentIcons } from './sets/content.js';
import { deviceIcons } from './sets/devices.js';
import { adminSecurityIcons } from './sets/admin-security.js';
import { workflowIcons } from './sets/workflow.js';
import { domainIcons } from './sets/domain.js';

export const icons = {
  ...brandIcons,
  ...coreUiIcons,
  ...chartIcons,
  ...commerceIcons,
  ...communicationIcons,
  ...contentIcons,
  ...deviceIcons,
  ...adminSecurityIcons,
  ...workflowIcons,
  ...domainIcons,
} as const satisfies IconRegistry;

export type IconName = keyof typeof icons;
