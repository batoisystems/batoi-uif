export interface TableOptions {
  filterInput?: HTMLInputElement | null;
  page?: number;
  pageSize?: number;
  src?: string;
  columns?: string[];
  exportData?: (rows: HTMLTableRowElement[]) => unknown;
  onPage?: (page: number, table: HTMLTableElement) => void | Promise<void>;
  onBulkAction?: (action: string, rows: HTMLTableRowElement[]) => void;
  onRowAction?: (action: string, row: HTMLTableRowElement) => void;
}

export interface RemoteTableResponse {
  rows?: Array<Record<string, unknown>>;
  html?: string;
  total?: number;
  page?: number;
}

function rows(table: HTMLTableElement): HTMLTableRowElement[] {
  return Array.from(table.tBodies[0]?.rows ?? []);
}

export function sortTable(table: HTMLTableElement, column: number, direction: 'asc' | 'desc' = 'asc'): void {
  const body = table.tBodies[0];
  if (!body) return;
  rows(table)
    .sort((a, b) => {
      const av = a.cells[column]?.textContent?.trim() ?? '';
      const bv = b.cells[column]?.textContent?.trim() ?? '';
      return direction === 'asc' ? av.localeCompare(bv, undefined, { numeric: true }) : bv.localeCompare(av, undefined, { numeric: true });
    })
    .forEach((row) => body.append(row));
}

export function filterTable(table: HTMLTableElement, query: string): void {
  const normalized = query.trim().toLowerCase();
  rows(table).forEach((row) => {
    row.hidden = normalized !== '' && !row.textContent?.toLowerCase().includes(normalized);
  });
}

export function selectedRows(table: HTMLTableElement): HTMLTableRowElement[] {
  return rows(table).filter((row) => row.querySelector<HTMLInputElement>('[data-uif-role="row-select"]')?.checked);
}

export function setTableState(table: HTMLTableElement, state: 'idle' | 'loading' | 'loaded' | 'error' | 'empty'): void {
  table.dataset.uifState = state;
  const body = table.tBodies[0];
  if (!body || !['empty', 'loading', 'error'].includes(state)) return;
  const columns = Math.max(1, table.tHead?.rows[0]?.cells.length ?? 1);
  body.innerHTML = `<tr data-uif-state="${state}"><td colspan="${columns}" class="uif-table-state">${state}</td></tr>`;
}

export function applyResponsiveColumns(table: HTMLTableElement): void {
  table.querySelectorAll<HTMLTableCellElement>('[data-uif-hide]').forEach((cell) => {
    cell.classList.add(`uif-hide-${cell.dataset.uifHide}`);
  });
}

function renderRemoteRows(table: HTMLTableElement, data: RemoteTableResponse, columns: string[]): void {
  const body = table.tBodies[0] || table.createTBody();
  if (data.html) {
    body.innerHTML = data.html;
    return;
  }
  const sourceRows = data.rows ?? [];
  if (!sourceRows.length) {
    setTableState(table, 'empty');
    return;
  }
  body.innerHTML = sourceRows
    .map((row) => `<tr>${columns.map((column) => `<td>${String(row[column] ?? '')}</td>`).join('')}</tr>`)
    .join('');
}

export async function loadRemoteTable(table: HTMLTableElement, options: TableOptions = {}): Promise<RemoteTableResponse | null> {
  const src = options.src || table.dataset.uifSrc;
  if (!src) return null;
  const url = new URL(src, window.location.href);
  url.searchParams.set('page', String(options.page ?? table.dataset.uifPage ?? 1));
  url.searchParams.set('pageSize', String(options.pageSize ?? table.dataset.uifPageSize ?? 25));
  setTableState(table, 'loading');
  try {
    const response = await fetch(url);
    const data = (await response.json()) as RemoteTableResponse;
    const columns = options.columns ?? (table.dataset.uifColumns?.split(',').map((item) => item.trim()).filter(Boolean) || []);
    renderRemoteRows(table, data, columns);
    table.dataset.uifPage = String(data.page ?? options.page ?? table.dataset.uifPage ?? 1);
    table.dataset.uifTotal = String(data.total ?? data.rows?.length ?? rows(table).length);
    if (data.rows?.length || data.html) setTableState(table, 'loaded');
    return data;
  } catch (error) {
    setTableState(table, 'error');
    throw error;
  }
}

export function exportTable(table: HTMLTableElement, options: TableOptions = {}): unknown {
  const selected = selectedRows(table);
  const sourceRows = selected.length ? selected : rows(table);
  if (options.exportData) return options.exportData(sourceRows);
  return sourceRows.map((row) => Array.from(row.cells).map((cell) => cell.textContent?.trim() ?? ''));
}

export function filterElements(targetSelector: string, query: string, mode: 'contains' | 'startsWith' | 'token' = 'contains'): void {
  const normalized = query.trim().toLowerCase();
  document.querySelectorAll<HTMLElement>(targetSelector).forEach((item) => {
    const text = item.textContent?.trim().toLowerCase() ?? '';
    const matched =
      normalized === '' ||
      (mode === 'startsWith' ? text.startsWith(normalized) : mode === 'token' ? text.split(/\s+/).includes(normalized) : text.includes(normalized));
    item.hidden = !matched;
  });
}

export function initDeclarativeFilters(root: Document | HTMLElement = document): void {
  root.querySelectorAll<HTMLInputElement | HTMLSelectElement>('[data-uif-filter-target]').forEach((filterInput) => {
    const target = filterInput.dataset.uifFilterTarget;
    if (!target) return;
    const mode = (filterInput.dataset.uifFilterMode as 'contains' | 'startsWith' | 'token') || 'contains';
    filterInput.addEventListener('input', () => filterElements(target, filterInput.value, mode));
    filterInput.addEventListener('change', () => filterElements(target, filterInput.value, mode));
  });
}

export function initTable(table: HTMLTableElement, options: TableOptions = {}): void {
  table.dataset.uifState = table.dataset.uifState || 'idle';
  applyResponsiveColumns(table);
  table.querySelectorAll<HTMLTableCellElement>('th[data-uif-sort]').forEach((header, index) => {
    header.tabIndex = 0;
    header.setAttribute('role', 'button');
    const sort = () => {
      const direction = header.dataset.uifSort === 'desc' ? 'desc' : 'asc';
      sortTable(table, index, direction);
      header.dataset.uifSort = direction === 'asc' ? 'desc' : 'asc';
    };
    header.addEventListener('click', sort);
    header.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        sort();
      }
    });
  });
  const filters = [
    ...(options.filterInput ? [options.filterInput] : []),
    ...Array.from(document.querySelectorAll<HTMLInputElement>(`[data-uif-table-filter="#${CSS.escape(table.id)}"]`)),
  ];
  filters.forEach((filterInput) => filterInput.addEventListener('input', () => filterTable(table, filterInput.value)));
  table.addEventListener('keydown', (event) => {
    const cell = event.target instanceof HTMLElement ? event.target.closest<HTMLTableCellElement>('td,th') : null;
    if (!cell || !['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    const rowIndex = cell.parentElement instanceof HTMLTableRowElement ? cell.parentElement.rowIndex : 0;
    const cellIndex = cell.cellIndex;
    const nextRow = table.rows[rowIndex + (event.key === 'ArrowDown' ? 1 : event.key === 'ArrowUp' ? -1 : 0)];
    const nextCell = nextRow?.cells[cellIndex + (event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0)] as HTMLElement | undefined;
    if (nextCell) {
      event.preventDefault();
      nextCell.tabIndex = 0;
      nextCell.focus();
    }
  });
  document.querySelectorAll<HTMLElement>(`[data-uif-table-action][data-uif-target="#${CSS.escape(table.id)}"]`).forEach((actionEl) => {
    actionEl.addEventListener('click', () => {
      const action = actionEl.dataset.uifTableAction || actionEl.dataset.uifAction || '';
      options.onBulkAction?.(action, selectedRows(table));
    });
  });
  table.addEventListener('click', (event) => {
    const actionEl = event.target instanceof HTMLElement ? event.target.closest<HTMLElement>('[data-uif-row-action]') : null;
    const row = actionEl?.closest<HTMLTableRowElement>('tr');
    if (actionEl && row) options.onRowAction?.(actionEl.dataset.uifRowAction || '', row);
  });
  if (options.src || table.dataset.uifSrc) void loadRemoteTable(table, options);
}

export const dataTable = { name: 'table', init: (el: HTMLElement) => initTable(el as HTMLTableElement) };
