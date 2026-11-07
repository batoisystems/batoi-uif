// src/web-components.ts
import { initShell } from "@batoi/uif-components/shell";
import { initDrawer } from "@batoi/uif-components/drawer";
import { initCombobox } from "@batoi/uif-components/combobox";
var webComponents = [
  { name: "shell", init: initShell },
  { name: "drawer", init: initDrawer },
  { name: "combobox", init: initCombobox }
];

export {
  webComponents
};
