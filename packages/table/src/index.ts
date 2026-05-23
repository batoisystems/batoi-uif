export interface TableOptions {
  filterInput?: HTMLInputElement | null;
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

export function initTable(table: HTMLTableElement, options: TableOptions = {}): void {
  table.dataset.uifState = table.dataset.uifState || 'idle';
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
}

export const dataTable = { name: 'table', init: (el: HTMLElement) => initTable(el as HTMLTableElement) };
