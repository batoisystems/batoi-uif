import { initScopedForm } from '@batoi/uif-forms';
import { initTable } from '@batoi/uif-table';
import { bindScopedRadActions } from '@batoi/uif-rad-adapter';
import { startSelected } from '../selected.js';
import { webComponents } from '../web-components.js';

/** Selected CRUD controls and root-scoped governed partial HTML updates. */
export function startRAD(root: Document | HTMLElement = document) {
  let application: ReturnType<typeof startSelected>;
  return startSelected(
    root,
    [
      ...webComponents,
      {
        name: 'form',
        init(el) {
          if (!(el instanceof HTMLFormElement)) throw new Error('UIF form requires a native form');
          return {
            ...initScopedForm(el, { root, afterSwap: (target) => application.rehydrate(target) }),
          };
        },
      },
      {
        name: 'table',
        init(el) {
          if (!(el instanceof HTMLTableElement))
            throw new Error('UIF table requires a native table');
          return { ...initTable(el) };
        },
      },
    ],
    (app) => {
      application = app;
      return bindScopedRadActions(root, { afterSwap: (target) => app.rehydrate(target) });
    },
  );
}
