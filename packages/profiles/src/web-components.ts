import { initShell } from '@batoi/uif-components/shell';
import { initDrawer } from '@batoi/uif-components/drawer';
import { initCombobox } from '@batoi/uif-components/combobox';
import type { SelectedComponent } from '@batoi/uif-components/application';

export const webComponents: readonly SelectedComponent[] = [
  { name: 'shell', init: initShell },
  { name: 'drawer', init: initDrawer },
  { name: 'combobox', init: initCombobox },
];
