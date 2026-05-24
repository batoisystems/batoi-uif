interface TableOptions {
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
interface RemoteTableResponse {
    rows?: Array<Record<string, unknown>>;
    html?: string;
    total?: number;
    page?: number;
}
declare function sortTable(table: HTMLTableElement, column: number, direction?: 'asc' | 'desc'): void;
declare function filterTable(table: HTMLTableElement, query: string): void;
declare function selectedRows(table: HTMLTableElement): HTMLTableRowElement[];
declare function setTableState(table: HTMLTableElement, state: 'idle' | 'loading' | 'loaded' | 'error' | 'empty'): void;
declare function applyResponsiveColumns(table: HTMLTableElement): void;
declare function loadRemoteTable(table: HTMLTableElement, options?: TableOptions): Promise<RemoteTableResponse | null>;
declare function exportTable(table: HTMLTableElement, options?: TableOptions): unknown;
declare function filterElements(targetSelector: string, query: string, mode?: 'contains' | 'startsWith' | 'token'): void;
declare function initDeclarativeFilters(root?: Document | HTMLElement): void;
declare function initTable(table: HTMLTableElement, options?: TableOptions): void;
declare const dataTable: {
    name: string;
    init: (el: HTMLElement) => void;
};

export { type RemoteTableResponse, type TableOptions, applyResponsiveColumns, dataTable, exportTable, filterElements, filterTable, initDeclarativeFilters, initTable, loadRemoteTable, selectedRows, setTableState, sortTable };
