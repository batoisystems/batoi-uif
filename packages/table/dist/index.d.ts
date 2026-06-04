interface TableOptions {
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
interface RemoteTableResponse {
    rows?: Array<Record<string, unknown>>;
    html?: string;
    columns?: Array<{
        key: string;
        label?: string;
        type?: TableColumnType;
        sortable?: boolean;
        filterable?: boolean;
        priority?: number;
    }>;
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
type TableColumnType = 'text' | 'number' | 'date' | 'currency' | 'status' | 'custom';
type FilterOperator = 'contains' | 'startsWith' | 'equals' | 'not' | 'min' | 'max' | 'between' | 'in' | 'token';
type TableState = 'idle' | 'loading' | 'loaded' | 'error' | 'empty';
declare function sortTable(table: HTMLTableElement, column: number | string, direction?: SortDirection): void;
declare function filterTable(table: HTMLTableElement, query: string, column?: number | string, op?: FilterOperator): void;
declare function selectedRows(table: HTMLTableElement): HTMLTableRowElement[];
declare function setTableState(table: HTMLTableElement, state: TableState): void;
declare function applyResponsiveColumns(table: HTMLTableElement): void;
declare function loadRemoteTable(table: HTMLTableElement, options?: TableOptions): Promise<RemoteTableResponse | null>;
declare function goToPage(table: HTMLTableElement, page: number, options?: TableOptions): Promise<RemoteTableResponse | null>;
declare function exportTable(table: HTMLTableElement, options?: TableOptions): unknown;
declare function filterElements(targetSelector: string, query: string, mode?: 'contains' | 'startsWith' | 'token'): void;
declare function initDeclarativeFilters(root?: Document | HTMLElement): void;
declare function initTable(table: HTMLTableElement, options?: TableOptions): void;
declare const dataTable: {
    name: string;
    init: (el: HTMLElement) => void;
};

export { type RemoteTableResponse, type TableOptions, applyResponsiveColumns, dataTable, exportTable, filterElements, filterTable, goToPage, initDeclarativeFilters, initTable, loadRemoteTable, selectedRows, setTableState, sortTable };
