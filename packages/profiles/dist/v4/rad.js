import {
  webComponents
} from "../chunk-KPB2OILD.js";
import {
  startSelected
} from "../chunk-BWRGULYP.js";

// src/v4/rad.ts
import { initScopedForm } from "@batoi/uif-forms";
import { initScopedTable } from "@batoi/uif-table";
import { bindScopedRadActions } from "@batoi/uif-rad-adapter";
function startRAD(root = document) {
  let application;
  return startSelected(
    root,
    [
      ...webComponents,
      {
        name: "form",
        init(el) {
          if (!(el instanceof HTMLFormElement)) throw new Error("UIF form requires a native form");
          return {
            ...initScopedForm(el, { root, afterSwap: (target) => application.rehydrate(target) })
          };
        }
      },
      {
        name: "table",
        init(el) {
          if (!(el instanceof HTMLTableElement))
            throw new Error("UIF table requires a native table");
          return { ...initScopedTable(el, root) };
        }
      }
    ],
    (app) => {
      application = app;
      return bindScopedRadActions(root, { afterSwap: (target) => app.rehydrate(target) });
    }
  );
}
export {
  startRAD
};
