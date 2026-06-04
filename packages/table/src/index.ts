import { setTrustedHTML } from '@batoi/uif-dom';

export interface TableOptions {
  filterInput?: HTMLInputElement | null;
  page?: number;
  pageSize?: number;
  src?: string;
  columns?: string[];
  sort?: string;
  direction?: SortDirection;
  exportData?: (rows: HTMLTableRowElement[]) => unknown;
  onPage?: (page: number, table: HTMLTableElement) => void | Promise<void>;
  onBulkAction?: (action: string, rows: HTMLTableRowElement[]) => void;
  onRowAction?: (action: string, row: HTMLTableRowElement) => void;
}

export interface RemoteTableResponse {
  rows?: Array<Record<string, unknown>>;
  html?: string;
  columns?: Array<{ key: string; label?: string; type?: TableColumnType; sortable?: boolean; filterable?: boolean; priority?: number }>;
  total?: number;
  page?: number;
  pageSize?: number;
  totalPages?: number;
  sort?: string;
  direction?: SortDirection;
  summary?: Record<string, unknown>;
  selectedIds?: string[];
  emptyText?: string;
}

type SortDirection = 'asc' | 'desc';
type TableMode = 'local' | 'remote' | 'hybrid';
type TableColumnType = 'text' | 'number' | 'date' | 'currency' | 'status' | 'custom';
type FilterOperator = 'contains' | 'startsWith' | 'equals' | 'not' | 'min' | 'max' | 'between' | 'in' | 'token';
type TableState = 'idle' | 'loading' | 'loaded' | 'error' | 'empty';

interface TableFilter {
  name: string;
  value: string;
  column?: string;
  op: FilterOperator;
}

const initializedTables = new WeakSet<HTMLTableElement>();
const initializedFilters = new WeakSet<HTMLInputElement | HTMLSelectElement>();
const tableAbortControllers = new WeakMap<HTMLTableElement, AbortController>();

function cssEscape(value: string): string {
  return typeof CSS !== 'undefined' && typeof CSS.escape === 'function' ? CSS.escape(value) : value.replace(/["\\#.;,[\]=:]/g, '\\$&');
}

function rows(table: HTMLTableElement): HTMLTableRowElement[] {
  return Array.from(table.tBodies[0]?.rows ?? []);
}

function tableSelector(table: HTMLTableElement): string {
  return table.id ? `#${cssEscape(table.id)}` : '';
}

function getTableMode(table: HTMLTableElement): TableMode {
  const mode = table.dataset.uifMode as TableMode | undefined;
  if (mode === 'local' || mode === 'remote' || mode === 'hybrid') return mode;
  return table.dataset.uifSrc ? 'remote' : 'local';
}

function getColumns(table: HTMLTableElement, options: TableOptions = {}): string[] {
  const configured = options.columns ?? table.dataset.uifColumns?.split(',').map((item) => item.trim()).filter(Boolean);
  if (configured?.length) return configured;
  return Array.from(table.tHead?.rows[0]?.cells ?? []).map((cell, index) => cell.dataset.uifSort || cell.dataset.uifColumn || cell.dataset.uifLabel || cell.textContent?.trim() || String(index));
}

function columnIndex(table: HTMLTableElement, column: number | string): number {
  if (typeof column === 'number') return column;
  const headers = Array.from(table.tHead?.rows[0]?.cells ?? []);
  const normalized = column.trim();
  const found = headers.findIndex((header) => header.dataset.uifSort === normalized || header.dataset.uifColumn === normalized || header.dataset.uifLabel === normalized || header.textContent?.trim() === normalized);
  const columns = table.dataset.uifColumns?.split(',').map((item) => item.trim());
  const configured = columns?.findIndex((item) => item === normalized) ?? -1;
  return found >= 0 ? found : configured;
}

function headerAt(table: HTMLTableElement, column: number): HTMLTableCellElement | undefined {
  return table.tHead?.rows[0]?.cells[column] as HTMLTableCellElement | undefined;
}

function cellValue(row: HTMLTableRowElement, column: number): string {
  return row.cells[column]?.dataset.uifValue ?? row.cells[column]?.textContent?.trim() ?? '';
}

function numericValue(value: string): number {
  const parsed = Number(value.replace(/[^0-9.-]+/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
}

function dateValue(value: string): number {
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function compareValues(a: string, b: string, type: TableColumnType = 'text'): number {
  if (type === 'number' || type === 'currency') return numericValue(a) - numericValue(b);
  if (type === 'date') return dateValue(a) - dateValue(b);
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
}

function updateSortHeaders(table: HTMLTableElement, activeIndex: number, direction: SortDirection): void {
  Array.from(table.tHead?.rows[0]?.cells ?? []).forEach((header, index) => {
    const sortable = header.matches('[data-uif-sort]');
    if (!sortable) return;
    const active = index === activeIndex;
    header.setAttribute('aria-sort', active ? (direction === 'asc' ? 'ascending' : 'descending') : 'none');
    header.dataset.uifSortActive = String(active);
    if (active) header.dataset.uifSortDirection = direction;
    else delete header.dataset.uifSortDirection;
  });
}

function activeSort(table: HTMLTableElement): { column: number; key: string; direction: SortDirection } | null {
  const headers = Array.from(table.tHead?.rows[0]?.cells ?? []) as HTMLTableCellElement[];
  const activeHeader = headers.find((header) => header.dataset.uifSortActive === 'true');
  const sort = table.dataset.uifSort || activeHeader?.dataset.uifSort;
  if (!sort) return null;
  const index = columnIndex(table, sort);
  if (index < 0) return null;
  return { column: index, key: sort, direction: (table.dataset.uifDirection as SortDirection) || (activeHeader?.dataset.uifSortDirection as SortDirection) || 'asc' };
}

export function sortTable(table: HTMLTableElement, column: number | string, direction: SortDirection = 'asc'): void {
  const body = table.tBodies[0];
  if (!body) return;
  const index = columnIndex(table, column);
  if (index < 0) return;
  const type = (headerAt(table, index)?.dataset.uifType as TableColumnType | undefined) || 'text';
  rows(table)
    .sort((a, b) => {
      const compared = compareValues(cellValue(a, index), cellValue(b, index), type);
      return direction === 'asc' ? compared : -compared;
    })
    .forEach((row) => body.append(row));
  const key = typeof column === 'string' ? column : headerAt(table, index)?.dataset.uifSort || String(index);
  table.dataset.uifSort = key;
  table.dataset.uifDirection = direction;
  updateSortHeaders(table, index, direction);
  table.dispatchEvent(new CustomEvent('uif:table-sort', { detail: { table, column: key, index, direction }, bubbles: true }));
}

function matchesFilter(value: string, query: string, op: FilterOperator): boolean {
  const text = value.trim().toLowerCase();
  const normalized = query.trim().toLowerCase();
  if (normalized === '') return true;
  if (op === 'startsWith') return text.startsWith(normalized);
  if (op === 'equals') return text === normalized;
  if (op === 'not') return text !== normalized;
  if (op === 'token') return text.split(/\s+/).includes(normalized);
  if (op === 'min') return numericValue(text) >= numericValue(normalized);
  if (op === 'max') return numericValue(text) <= numericValue(normalized);
  if (op === 'between') {
    const [min, max] = normalized.split(',').map((item) => numericValue(item));
    const valueNumber = numericValue(text);
    return valueNumber >= min && valueNumber <= max;
  }
  if (op === 'in') return normalized.split(',').map((item) => item.trim()).includes(text);
  return text.includes(normalized);
}

export function filterTable(table: HTMLTableElement, query: string, column?: number | string, op: FilterOperator = 'contains'): void {
  const normalized = query.trim().toLowerCase();
  const index = column === undefined ? -1 : columnIndex(table, column);
  rows(table).forEach((row) => {
    const text = index >= 0 ? cellValue(row, index) : row.textContent ?? '';
    row.hidden = normalized !== '' && !matchesFilter(text, normalized, op);
  });
  table.dispatchEvent(new CustomEvent('uif:table-filter', { detail: { table, query, column, op }, bubbles: true }));
}

export function selectedRows(table: HTMLTableElement): HTMLTableRowElement[] {
  return rows(table).filter((row) => row.querySelector<HTMLInputElement>('[data-uif-role="row-select"]')?.checked);
}

function selectedRowIds(table: HTMLTableElement): string[] {
  return selectedRows(table)
    .map((row) => row.querySelector<HTMLInputElement>('[data-uif-role="row-select"]')?.value || row.dataset.uifRowId || '')
    .filter(Boolean);
}

export function setTableState(table: HTMLTableElement, state: TableState): void {
  table.dataset.uifState = state;
  table.setAttribute('aria-busy', state === 'loading' ? 'true' : 'false');
  table.dispatchEvent(new CustomEvent('uif:table-state', { detail: { table, state }, bubbles: true }));
  const body = table.tBodies[0];
  if (!body || !['empty', 'loading', 'error'].includes(state)) return;
  const columns = Math.max(1, table.tHead?.rows[0]?.cells.length ?? 1);
  const row = document.createElement('tr');
  row.dataset.uifState = state;
  const cell = document.createElement('td');
  cell.colSpan = columns;
  cell.className = 'uif-table-state';
  cell.textContent = table.dataset[`uif${state.charAt(0).toUpperCase()}${state.slice(1)}Text`] || state;
  row.append(cell);
  body.replaceChildren(row);
}

export function applyResponsiveColumns(table: HTMLTableElement): void {
  const headers = Array.from(table.tHead?.rows[0]?.cells ?? []) as HTMLTableCellElement[];
  headers.forEach((header, index) => {
    const label = header.dataset.uifLabel || header.textContent?.trim() || '';
    const hide = header.dataset.uifHide;
    const priority = header.dataset.uifPriority;
    if (hide) header.classList.add(`uif-hide-${hide}`);
    if (priority) header.classList.add(`uif-priority-${priority}`);
    rows(table).forEach((row) => {
      const cell = row.cells[index] as HTMLTableCellElement | undefined;
      if (!cell) return;
      if (label && !cell.dataset.uifLabel) cell.dataset.uifLabel = label;
      if (hide) cell.classList.add(`uif-hide-${hide}`);
      if (priority) cell.classList.add(`uif-priority-${priority}`);
    });
  });
  table.querySelectorAll<HTMLTableCellElement>('[data-uif-hide]').forEach((cell) => {
    if (cell.dataset.uifHide) cell.classList.add(`uif-hide-${cell.dataset.uifHide}`);
  });
}

function renderRemoteRows(table: HTMLTableElement, data: RemoteTableResponse, columns: string[]): void {
  const body = table.tBodies[0] || table.createTBody();
  if (data.html) {
    setTrustedHTML(body, data.html, { trusted: true, context: 'remote table rows' });
    applyResponsiveColumns(table);
    return;
  }
  const sourceRows = data.rows ?? [];
  if (!sourceRows.length) {
    if (data.emptyText) table.dataset.uifEmptyText = data.emptyText;
    setTableState(table, 'empty');
    return;
  }
  body.replaceChildren(
    ...sourceRows.map((row) => {
      const tr = document.createElement('tr');
      const key = table.dataset.uifKey;
      if (key && row[key] !== undefined) tr.dataset.uifRowId = String(row[key]);
      columns.forEach((column) => {
        const td = document.createElement('td');
        td.textContent = String(row[column] ?? '');
        tr.append(td);
      });
      return tr;
    }),
  );
  applyResponsiveColumns(table);
}

function controlsForTable(table: HTMLTableElement, selector: string): Array<HTMLInputElement | HTMLSelectElement> {
  if (!selector) return [];
  return Array.from(document.querySelectorAll<HTMLInputElement | HTMLSelectElement>(`[${selector}="#${cssEscape(table.id)}"]`));
}

function tableFilters(table: HTMLTableElement): TableFilter[] {
  const controls = [...controlsForTable(table, 'data-uif-table-filter')];
  const grouped = document.querySelector<HTMLElement>(`[data-uif-table-controls="#${cssEscape(table.id)}"]`);
  if (grouped) controls.push(...Array.from(grouped.querySelectorAll<HTMLInputElement | HTMLSelectElement>('[name]')));
  const seen = new Set<HTMLInputElement | HTMLSelectElement>();
  return controls
    .filter((control) => {
      if (seen.has(control)) return false;
      seen.add(control);
      return control.value.trim() !== '';
    })
    .map((control) => ({
      name: control.name || control.dataset.uifFilterColumn || 'q',
      value: control.value,
      column: control.dataset.uifFilterColumn,
      op: (control.dataset.uifFilterOp as FilterOperator | undefined) || 'contains',
    }));
}

function appendTableQuery(url: URL, table: HTMLTableElement, options: TableOptions): void {
  const sort = options.sort || table.dataset.uifSort;
  const direction = options.direction || (table.dataset.uifDirection as SortDirection | undefined);
  url.searchParams.set('page', String(options.page ?? table.dataset.uifPage ?? 1));
  url.searchParams.set('pageSize', String(options.pageSize ?? table.dataset.uifPageSize ?? 25));
  if (sort) url.searchParams.set('sort', sort);
  if (direction) url.searchParams.set('direction', direction);
  tableFilters(table).forEach((filter) => {
    if (filter.column) {
      url.searchParams.set(`filters[${filter.column}]`, filter.value);
      url.searchParams.set(`filters[${filter.column}][op]`, filter.op);
    } else {
      url.searchParams.set(filter.name, filter.value);
    }
  });
}

export async function loadRemoteTable(table: HTMLTableElement, options: TableOptions = {}): Promise<RemoteTableResponse | null> {
  const src = options.src || table.dataset.uifSrc;
  if (!src) return null;
  const url = new URL(src, window.location.href);
  appendTableQuery(url, table, options);
  tableAbortControllers.get(table)?.abort();
  const controller = new AbortController();
  tableAbortControllers.set(table, controller);
  table.dispatchEvent(new CustomEvent('uif:table-before-load', { detail: { table, url }, bubbles: true }));
  setTableState(table, 'loading');
  try {
    const response = await fetch(url, { signal: controller.signal });
    const data = (await response.json()) as RemoteTableResponse;
    const columns = options.columns ?? data.columns?.map((column) => column.key) ?? getColumns(table);
    renderRemoteRows(table, data, columns);
    table.dataset.uifPage = String(data.page ?? options.page ?? table.dataset.uifPage ?? 1);
    table.dataset.uifPageSize = String(data.pageSize ?? options.pageSize ?? table.dataset.uifPageSize ?? 25);
    table.dataset.uifTotal = String(data.total ?? data.rows?.length ?? rows(table).length);
    if (data.totalPages) table.dataset.uifTotalPages = String(data.totalPages);
    if (data.sort) table.dataset.uifSort = data.sort;
    if (data.direction) table.dataset.uifDirection = data.direction;
    const sort = activeSort(table);
    if (sort) updateSortHeaders(table, sort.column, sort.direction);
    updatePaginationControls(table);
    updateSelectionState(table);
    if (data.rows?.length || data.html) setTableState(table, 'loaded');
    table.dispatchEvent(new CustomEvent('uif:table-loaded', { detail: { table, data }, bubbles: true }));
    return data;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') return null;
    setTableState(table, 'error');
    table.dispatchEvent(new CustomEvent('uif:table-error', { detail: { table, error }, bubbles: true }));
    throw error;
  } finally {
    if (tableAbortControllers.get(table) === controller) tableAbortControllers.delete(table);
  }
}

export async function goToPage(table: HTMLTableElement, page: number, options: TableOptions = {}): Promise<RemoteTableResponse | null> {
  const nextPage = Math.max(1, page);
  table.dataset.uifPage = String(nextPage);
  table.dispatchEvent(new CustomEvent('uif:table-page', { detail: { table, page: nextPage }, bubbles: true }));
  await options.onPage?.(nextPage, table);
  updatePaginationControls(table);
  return loadRemoteTable(table, { ...options, page: nextPage });
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
    if (initializedFilters.has(filterInput)) return;
    initializedFilters.add(filterInput);
    const target = filterInput.dataset.uifFilterTarget;
    if (!target) return;
    const mode = (filterInput.dataset.uifFilterMode as 'contains' | 'startsWith' | 'token') || 'contains';
    filterInput.addEventListener('input', () => filterElements(target, filterInput.value, mode));
    filterInput.addEventListener('change', () => filterElements(target, filterInput.value, mode));
  });
}

function updateSelectionState(table: HTMLTableElement): void {
  const selected = selectedRows(table);
  const ids = selectedRowIds(table);
  table.dataset.uifSelected = String(selected.length);
  if (ids.length && ids.join(',').length < 2048) table.dataset.uifSelectedIds = ids.join(',');
  else delete table.dataset.uifSelectedIds;
  const selectors = rows(table).map((row) => row.querySelector<HTMLInputElement>('[data-uif-role="row-select"]')).filter(Boolean) as HTMLInputElement[];
  table.querySelectorAll<HTMLInputElement>('[data-uif-role="select-all"]').forEach((checkbox) => {
    checkbox.checked = selectors.length > 0 && selectors.every((rowSelect) => rowSelect.checked);
    checkbox.indeterminate = selectors.some((rowSelect) => rowSelect.checked) && !checkbox.checked;
  });
  const targetSelector = table.dataset.uifSelectionTarget;
  if (targetSelector) {
    const target = document.querySelector<HTMLElement>(targetSelector);
    if (target) target.textContent = String(selected.length);
  }
  table.dispatchEvent(new CustomEvent('uif:table-selection', { detail: { table, rows: selected, ids, totalSelected: selected.length }, bubbles: true }));
}

function pageFromControl(control: HTMLElement, table: HTMLTableElement): number {
  const current = Number(table.dataset.uifPage || 1);
  const totalPages = Number(table.dataset.uifTotalPages || 0);
  const raw = control.dataset.uifTablePage || control.dataset.uifPage || '';
  if (raw === 'next') return totalPages ? Math.min(totalPages, current + 1) : current + 1;
  if (raw === 'prev' || raw === 'previous') return Math.max(1, current - 1);
  if (raw === 'first') return 1;
  if (raw === 'last') return Math.max(1, totalPages || current);
  return Math.max(1, Number(raw || current));
}

function updatePaginationControls(table: HTMLTableElement): void {
  if (!table.id) return;
  const current = Number(table.dataset.uifPage || 1);
  const totalPages = Number(table.dataset.uifTotalPages || 0);
  document.querySelectorAll<HTMLElement>(`[data-uif-table-page][data-uif-target="#${cssEscape(table.id)}"]`).forEach((control) => {
    const page = control.dataset.uifTablePage || '';
    const disabled = (page === 'first' || page === 'prev' || page === 'previous') && current <= 1 ? true : (page === 'next' || page === 'last') && totalPages > 0 && current >= totalPages;
    if ('disabled' in control) (control as HTMLButtonElement).disabled = disabled;
    control.setAttribute('aria-disabled', String(disabled));
  });
  document.querySelectorAll<HTMLElement>(`[data-uif-table-page-label="#${cssEscape(table.id)}"]`).forEach((label) => {
    label.textContent = totalPages ? `Page ${current} of ${totalPages}` : `Page ${current}`;
  });
}

function applyLocalFilters(table: HTMLTableElement): void {
  const filters = tableFilters(table);
  rows(table).forEach((row) => {
    row.hidden = filters.some((filter) => {
      const index = filter.column ? columnIndex(table, filter.column) : -1;
      const value = index >= 0 ? cellValue(row, index) : row.textContent ?? '';
      return !matchesFilter(value, filter.value, filter.op);
    });
  });
  table.dispatchEvent(new CustomEvent('uif:table-filter', { detail: { table, filters }, bubbles: true }));
}

function refreshForControlChange(table: HTMLTableElement, options: TableOptions = {}): void {
  table.dataset.uifPage = '1';
  const mode = getTableMode(table);
  if (mode === 'remote') void loadRemoteTable(table, options);
  else applyLocalFilters(table);
  updatePaginationControls(table);
}

function resetTable(table: HTMLTableElement, options: TableOptions = {}): void {
  if (!table.id) return;
  [...controlsForTable(table, 'data-uif-table-filter'), ...controlsForTable(table, 'data-uif-table-page-size')].forEach((control) => {
    control.value = control instanceof HTMLSelectElement ? control.querySelector('option')?.value ?? '' : '';
  });
  const grouped = document.querySelector<HTMLFormElement>(`[data-uif-table-controls="#${cssEscape(table.id)}"]`);
  grouped?.reset();
  table.dataset.uifPage = '1';
  delete table.dataset.uifSort;
  delete table.dataset.uifDirection;
  rows(table).forEach((row) => {
    row.hidden = false;
    row.querySelector<HTMLInputElement>('[data-uif-role="row-select"]')?.removeAttribute('checked');
  });
  table.querySelectorAll<HTMLInputElement>('[data-uif-role="row-select"],[data-uif-role="select-all"]').forEach((checkbox) => {
    checkbox.checked = false;
    checkbox.indeterminate = false;
  });
  updateSortHeaders(table, -1, 'asc');
  updateSelectionState(table);
  table.dispatchEvent(new CustomEvent('uif:table-reset', { detail: { table }, bubbles: true }));
  if (getTableMode(table) === 'remote') void loadRemoteTable(table, options);
}

export function initTable(table: HTMLTableElement, options: TableOptions = {}): void {
  if (initializedTables.has(table)) return;
  initializedTables.add(table);
  table.dataset.uifState = table.dataset.uifState || 'idle';
  applyResponsiveColumns(table);
  table.querySelectorAll<HTMLTableCellElement>('th[data-uif-sort]').forEach((header, index) => {
    header.tabIndex = 0;
    header.setAttribute('role', 'button');
    header.setAttribute('aria-sort', 'none');
    const sort = () => {
      const current = activeSort(table);
      const nextDirection: SortDirection = current?.column === index && current.direction === 'asc' ? 'desc' : 'asc';
      const key = header.dataset.uifSort || String(index);
      table.dataset.uifPage = '1';
      if (getTableMode(table) === 'remote') {
        table.dataset.uifSort = key;
        table.dataset.uifDirection = nextDirection;
        updateSortHeaders(table, index, nextDirection);
        table.dispatchEvent(new CustomEvent('uif:table-sort', { detail: { table, column: key, index, direction: nextDirection }, bubbles: true }));
        void loadRemoteTable(table, options);
      } else {
        sortTable(table, key || index, nextDirection);
      }
    };
    header.addEventListener('click', sort);
    header.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        sort();
      }
    });
  });
  const sort = activeSort(table);
  if (sort) updateSortHeaders(table, sort.column, sort.direction);
  const filters = [
    ...(options.filterInput ? [options.filterInput] : []),
    ...controlsForTable(table, 'data-uif-table-filter'),
  ];
  filters.forEach((filterInput) => {
    const handler = () => {
      if (filterInput.dataset.uifFilterColumn) refreshForControlChange(table, options);
      else if (getTableMode(table) === 'remote') refreshForControlChange(table, options);
      else filterTable(table, filterInput.value, undefined, (filterInput.dataset.uifFilterOp as FilterOperator | undefined) || 'contains');
    };
    filterInput.addEventListener('input', handler);
    filterInput.addEventListener('change', handler);
  });
  controlsForTable(table, 'data-uif-table-page-size').forEach((control) => {
    control.addEventListener('change', () => {
      table.dataset.uifPageSize = control.value || '25';
      table.dataset.uifPage = '1';
      table.dispatchEvent(new CustomEvent('uif:table-page-size', { detail: { table, pageSize: Number(table.dataset.uifPageSize) }, bubbles: true }));
      if (getTableMode(table) === 'remote') void loadRemoteTable(table, options);
      updatePaginationControls(table);
    });
  });
  document.querySelectorAll<HTMLElement>(`[data-uif-table-reset="#${cssEscape(table.id)}"]`).forEach((resetEl) => {
    resetEl.addEventListener('click', () => resetTable(table, options));
  });
  table.addEventListener('keydown', (event) => {
    const cell = event.target instanceof HTMLElement ? event.target.closest<HTMLTableCellElement>('td,th') : null;
    if (!cell || event.target instanceof HTMLInputElement || event.target instanceof HTMLButtonElement || event.target instanceof HTMLSelectElement || !['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight'].includes(event.key)) return;
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
  document.querySelectorAll<HTMLElement>(`[data-uif-table-action][data-uif-target="#${cssEscape(table.id)}"]`).forEach((actionEl) => {
    actionEl.addEventListener('click', () => {
      const action = actionEl.dataset.uifTableAction || actionEl.dataset.uifAction || '';
      const selected = selectedRows(table);
      options.onBulkAction?.(action, selected);
      table.dispatchEvent(new CustomEvent('uif:table-bulk-action', { detail: { table, action, rows: selected, ids: selectedRowIds(table) }, bubbles: true }));
    });
  });
  document.querySelectorAll<HTMLElement>(`[data-uif-table-page][data-uif-target="#${cssEscape(table.id)}"]`).forEach((pageEl) => {
    pageEl.addEventListener('click', () => {
      void goToPage(table, pageFromControl(pageEl, table), options);
    });
  });
  table.addEventListener('change', (event) => {
    const checkbox = event.target instanceof HTMLInputElement ? event.target : null;
    if (!checkbox) return;
    if (checkbox.matches('[data-uif-role="select-all"]')) {
      rows(table).forEach((row) => {
        const rowSelect = row.querySelector<HTMLInputElement>('[data-uif-role="row-select"]');
        if (rowSelect) rowSelect.checked = checkbox.checked;
      });
    }
    if (checkbox.matches('[data-uif-role="select-all"],[data-uif-role="row-select"]')) updateSelectionState(table);
  });
  table.addEventListener('click', (event) => {
    const actionEl = event.target instanceof HTMLElement ? event.target.closest<HTMLElement>('[data-uif-row-action]') : null;
    const row = actionEl?.closest<HTMLTableRowElement>('tr');
    if (actionEl && row) {
      const action = actionEl.dataset.uifRowAction || '';
      options.onRowAction?.(action, row);
      const id = row.dataset.uifRowId || row.querySelector<HTMLInputElement>('[data-uif-role="row-select"]')?.value || '';
      table.dispatchEvent(new CustomEvent('uif:table-row-action', { detail: { table, action, row, id }, bubbles: true }));
    }
  });
  updateSelectionState(table);
  updatePaginationControls(table);
  if (options.src || table.dataset.uifSrc) void loadRemoteTable(table, options);
}

export const dataTable = { name: 'table', init: (el: HTMLElement) => initTable(el as HTMLTableElement) };
