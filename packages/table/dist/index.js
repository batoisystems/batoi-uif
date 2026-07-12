// src/index.ts
import { isSafeURL, setTrustedHTML } from "@batoi/uif-dom";
import { cancelRequest, request } from "@batoi/uif-net";
var tableControllers = /* @__PURE__ */ new WeakMap();
var initializedFilters = /* @__PURE__ */ new WeakSet();
var tableRequestKeys = /* @__PURE__ */ new WeakMap();
var tableRequestSequence = 0;
var DEFAULT_MAX_ROWS = 1e3;
var DEFAULT_MAX_COLUMNS = 100;
var DEFAULT_MAX_CELL_LENGTH = 1e4;
var DEFAULT_MAX_HTML_LENGTH = 1e6;
function cssEscape(value) {
  return typeof CSS !== "undefined" && typeof CSS.escape === "function" ? CSS.escape(value) : value.replace(/["\\#.;,[\]=:]/g, "\\$&");
}
function rows(table) {
  return Array.from(table.tBodies[0]?.rows ?? []);
}
function getTableMode(table) {
  const mode = table.dataset.uifMode;
  if (mode === "local" || mode === "remote" || mode === "hybrid") return mode;
  return table.dataset.uifSrc ? "remote" : "local";
}
function getColumns(table, options = {}) {
  const configured = options.columns ?? table.dataset.uifColumns?.split(",").map((item) => item.trim()).filter(Boolean);
  if (configured?.length) return configured;
  return Array.from(table.tHead?.rows[0]?.cells ?? []).map((cell, index) => cell.dataset.uifSort || cell.dataset.uifColumn || cell.dataset.uifLabel || cell.textContent?.trim() || String(index));
}
function columnIndex(table, column) {
  if (typeof column === "number") return column;
  const headers = Array.from(table.tHead?.rows[0]?.cells ?? []);
  const normalized = column.trim();
  const found = headers.findIndex((header) => header.dataset.uifSort === normalized || header.dataset.uifColumn === normalized || header.dataset.uifLabel === normalized || header.textContent?.trim() === normalized);
  const columns = table.dataset.uifColumns?.split(",").map((item) => item.trim());
  const configured = columns?.findIndex((item) => item === normalized) ?? -1;
  return found >= 0 ? found : configured;
}
function headerAt(table, column) {
  return table.tHead?.rows[0]?.cells[column];
}
function cellValue(row, column) {
  return row.cells[column]?.dataset.uifValue ?? row.cells[column]?.textContent?.trim() ?? "";
}
function numericValue(value) {
  const parsed = Number(value.replace(/[^0-9.-]+/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}
function dateValue(value) {
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}
function compareValues(a, b, type = "text") {
  if (type === "number" || type === "currency") return numericValue(a) - numericValue(b);
  if (type === "date") return dateValue(a) - dateValue(b);
  return a.localeCompare(b, void 0, { numeric: true, sensitivity: "base" });
}
function updateSortHeaders(table, activeIndex, direction) {
  Array.from(table.tHead?.rows[0]?.cells ?? []).forEach((header, index) => {
    const sortable = header.matches("[data-uif-sort]");
    if (!sortable) return;
    const active = index === activeIndex;
    header.setAttribute("aria-sort", active ? direction === "asc" ? "ascending" : "descending" : "none");
    header.dataset.uifSortActive = String(active);
    if (active) header.dataset.uifSortDirection = direction;
    else delete header.dataset.uifSortDirection;
  });
}
function activeSort(table) {
  const headers = Array.from(table.tHead?.rows[0]?.cells ?? []);
  const activeHeader = headers.find((header) => header.dataset.uifSortActive === "true");
  const sort = table.dataset.uifSort || activeHeader?.dataset.uifSort;
  if (!sort) return null;
  const index = columnIndex(table, sort);
  if (index < 0) return null;
  return { column: index, key: sort, direction: table.dataset.uifDirection || activeHeader?.dataset.uifSortDirection || "asc" };
}
function sortTable(table, column, direction = "asc") {
  const body = table.tBodies[0];
  if (!body) return;
  const index = columnIndex(table, column);
  if (index < 0) return;
  const type = headerAt(table, index)?.dataset.uifType || "text";
  rows(table).sort((a, b) => {
    const compared = compareValues(cellValue(a, index), cellValue(b, index), type);
    return direction === "asc" ? compared : -compared;
  }).forEach((row) => body.append(row));
  const key = typeof column === "string" ? column : headerAt(table, index)?.dataset.uifSort || String(index);
  table.dataset.uifSort = key;
  table.dataset.uifDirection = direction;
  updateSortHeaders(table, index, direction);
  table.dispatchEvent(new CustomEvent("uif:table-sort", { detail: { table, column: key, index, direction }, bubbles: true }));
}
function matchesFilter(value, query, op) {
  const text = value.trim().toLowerCase();
  const normalized = query.trim().toLowerCase();
  if (normalized === "") return true;
  if (op === "startsWith") return text.startsWith(normalized);
  if (op === "equals") return text === normalized;
  if (op === "not") return text !== normalized;
  if (op === "token") return text.split(/\s+/).includes(normalized);
  if (op === "min") return numericValue(text) >= numericValue(normalized);
  if (op === "max") return numericValue(text) <= numericValue(normalized);
  if (op === "between") {
    const [min, max] = normalized.split(",").map((item) => numericValue(item));
    const valueNumber = numericValue(text);
    return valueNumber >= min && valueNumber <= max;
  }
  if (op === "in") return normalized.split(",").map((item) => item.trim()).includes(text);
  return text.includes(normalized);
}
function filterTable(table, query, column, op = "contains") {
  const normalized = query.trim().toLowerCase();
  const index = column === void 0 ? -1 : columnIndex(table, column);
  rows(table).forEach((row) => {
    const text = index >= 0 ? cellValue(row, index) : row.textContent ?? "";
    row.hidden = normalized !== "" && !matchesFilter(text, normalized, op);
  });
  table.dispatchEvent(new CustomEvent("uif:table-filter", { detail: { table, query, column, op }, bubbles: true }));
}
function selectedRows(table) {
  return rows(table).filter((row) => row.querySelector('[data-uif-role="row-select"]')?.checked);
}
function selectedRowIds(table) {
  return selectedRows(table).map((row) => row.querySelector('[data-uif-role="row-select"]')?.value || row.dataset.uifRowId || "").filter(Boolean);
}
function setTableState(table, state) {
  table.dataset.uifState = state;
  table.setAttribute("aria-busy", state === "loading" ? "true" : "false");
  table.dispatchEvent(new CustomEvent("uif:table-state", { detail: { table, state }, bubbles: true }));
  const body = table.tBodies[0];
  if (!body || !["empty", "loading", "error"].includes(state)) return;
  const columns = Math.max(1, table.tHead?.rows[0]?.cells.length ?? 1);
  const row = document.createElement("tr");
  row.dataset.uifState = state;
  const cell = document.createElement("td");
  cell.colSpan = columns;
  cell.className = "uif-table-state";
  cell.textContent = table.dataset[`uif${state.charAt(0).toUpperCase()}${state.slice(1)}Text`] || state;
  row.append(cell);
  body.replaceChildren(row);
}
function applyResponsiveColumns(table) {
  const headers = Array.from(table.tHead?.rows[0]?.cells ?? []);
  headers.forEach((header, index) => {
    const label = header.dataset.uifLabel || header.textContent?.trim() || "";
    const hide = header.dataset.uifHide;
    const priority = header.dataset.uifPriority;
    if (hide) header.classList.add(`uif-hide-${hide}`);
    if (priority) header.classList.add(`uif-priority-${priority}`);
    rows(table).forEach((row) => {
      const cell = row.cells[index];
      if (!cell) return;
      if (label && !cell.dataset.uifLabel) cell.dataset.uifLabel = label;
      if (hide) cell.classList.add(`uif-hide-${hide}`);
      if (priority) cell.classList.add(`uif-priority-${priority}`);
    });
  });
  table.querySelectorAll("[data-uif-hide]").forEach((cell) => {
    if (cell.dataset.uifHide) cell.classList.add(`uif-hide-${cell.dataset.uifHide}`);
  });
}
function tableLimit(value, fallback) {
  return Number.isFinite(value) ? Math.max(1, Math.floor(value)) : fallback;
}
function normalizeRemoteResponse(data, options) {
  if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error("Invalid remote table response");
  const source = data;
  const maxRows = tableLimit(options.maxRows, DEFAULT_MAX_ROWS);
  const maxHTMLLength = tableLimit(options.maxHTMLLength, DEFAULT_MAX_HTML_LENGTH);
  if (source.rows && (!Array.isArray(source.rows) || source.rows.length > maxRows || source.rows.some((row) => !row || typeof row !== "object" || Array.isArray(row)))) throw new Error("UIF_TABLE_LIMIT");
  if (source.columns && (!Array.isArray(source.columns) || source.columns.length > DEFAULT_MAX_COLUMNS)) throw new Error("UIF_TABLE_LIMIT");
  if (source.html && String(source.html).length > maxHTMLLength) throw new Error("UIF_TABLE_LIMIT");
  if (source.html !== void 0) source.html = String(source.html);
  if (source.columns) source.columns = source.columns.filter((column) => column && typeof column.key === "string");
  return source;
}
function renderRemoteRows(table, data, columns, maxCellLength) {
  const body = table.tBodies[0] || table.createTBody();
  if (data.html) {
    setTrustedHTML(body, data.html, { trusted: true, context: "remote table rows" });
    applyResponsiveColumns(table);
    return;
  }
  const sourceRows = data.rows ?? [];
  if (!sourceRows.length) {
    if (data.emptyText) table.dataset.uifEmptyText = data.emptyText;
    setTableState(table, "empty");
    return;
  }
  body.replaceChildren(
    ...sourceRows.map((row) => {
      const tr = document.createElement("tr");
      const key = table.dataset.uifKey;
      if (key && row[key] !== void 0) tr.dataset.uifRowId = String(row[key]);
      columns.forEach((column) => {
        const td = document.createElement("td");
        td.textContent = String(row[column] ?? "").slice(0, maxCellLength);
        tr.append(td);
      });
      return tr;
    })
  );
  applyResponsiveColumns(table);
}
function controlsForTable(table, selector) {
  if (!selector) return [];
  return Array.from(document.querySelectorAll(`[${selector}="#${cssEscape(table.id)}"]`));
}
function tableFilters(table) {
  const controls = [...controlsForTable(table, "data-uif-table-filter")];
  const grouped = document.querySelector(`[data-uif-table-controls="#${cssEscape(table.id)}"]`);
  if (grouped) controls.push(...Array.from(grouped.querySelectorAll("[name]")));
  const seen = /* @__PURE__ */ new Set();
  return controls.filter((control) => {
    if (seen.has(control)) return false;
    seen.add(control);
    return control.value.trim() !== "";
  }).map((control) => ({
    name: control.name || control.dataset.uifFilterColumn || "q",
    value: control.value,
    column: control.dataset.uifFilterColumn,
    op: control.dataset.uifFilterOp || "contains"
  }));
}
function appendTableQuery(url, table, options) {
  const sort = options.sort || table.dataset.uifSort;
  const direction = options.direction || table.dataset.uifDirection;
  url.searchParams.set("page", String(options.page ?? table.dataset.uifPage ?? 1));
  url.searchParams.set("pageSize", String(options.pageSize ?? table.dataset.uifPageSize ?? 25));
  if (sort) url.searchParams.set("sort", sort);
  if (direction) url.searchParams.set("direction", direction);
  tableFilters(table).forEach((filter) => {
    if (filter.column) {
      url.searchParams.set(`filters[${filter.column}]`, filter.value);
      url.searchParams.set(`filters[${filter.column}][op]`, filter.op);
    } else {
      url.searchParams.set(filter.name, filter.value);
    }
  });
}
async function loadRemoteTable(table, options = {}) {
  const src = options.src || table.dataset.uifSrc;
  if (!src) return null;
  if (!isSafeURL(src, { context: "network", allowHash: false, sameOrigin: !(options.allowCrossOrigin ?? table.dataset.uifAllowCrossOrigin === "true") })) {
    const error = new Error("Batoi UIF blocked an unsafe table data URL");
    setTableState(table, "error");
    table.dispatchEvent(new CustomEvent("uif:table-error", { detail: { table, error }, bubbles: true }));
    throw error;
  }
  const url = new URL(src, window.location.href);
  appendTableQuery(url, table, options);
  const key = tableRequestKeys.get(table) ?? `table:${++tableRequestSequence}`;
  tableRequestKeys.set(table, key);
  cancelRequest(key);
  table.dispatchEvent(new CustomEvent("uif:table-before-load", { detail: { table, url }, bubbles: true }));
  setTableState(table, "loading");
  try {
    const response = await request(url.href, { key, method: "GET", parseAs: "json", credentials: "same-origin", timeout: 15e3 });
    const data = normalizeRemoteResponse(response, options);
    const columns = options.columns ?? data.columns?.map((column) => column.key) ?? getColumns(table);
    renderRemoteRows(table, data, columns, tableLimit(options.maxCellLength, DEFAULT_MAX_CELL_LENGTH));
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
    if (data.rows?.length || data.html) setTableState(table, "loaded");
    table.dispatchEvent(new CustomEvent("uif:table-loaded", { detail: { table, data }, bubbles: true }));
    return data;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") return null;
    setTableState(table, "error");
    table.dispatchEvent(new CustomEvent("uif:table-error", { detail: { table, error }, bubbles: true }));
    throw error;
  }
}
async function goToPage(table, page, options = {}) {
  const nextPage = Math.max(1, page);
  table.dataset.uifPage = String(nextPage);
  table.dispatchEvent(new CustomEvent("uif:table-page", { detail: { table, page: nextPage }, bubbles: true }));
  await options.onPage?.(nextPage, table);
  updatePaginationControls(table);
  return loadRemoteTable(table, { ...options, page: nextPage });
}
function exportTable(table, options = {}) {
  const selected = selectedRows(table);
  const sourceRows = selected.length ? selected : rows(table);
  if (options.exportData) return options.exportData(sourceRows);
  return sourceRows.map((row) => Array.from(row.cells).map((cell) => cell.textContent?.trim() ?? ""));
}
function filterElements(targetSelector, query, mode = "contains") {
  const normalized = query.trim().toLowerCase();
  let targets;
  try {
    targets = document.querySelectorAll(targetSelector);
  } catch {
    return;
  }
  targets.forEach((item) => {
    const text = item.textContent?.trim().toLowerCase() ?? "";
    const matched = normalized === "" || (mode === "startsWith" ? text.startsWith(normalized) : mode === "token" ? text.split(/\s+/).includes(normalized) : text.includes(normalized));
    item.hidden = !matched;
  });
}
function initDeclarativeFilters(root = document) {
  root.querySelectorAll("[data-uif-filter-target]").forEach((filterInput) => {
    if (initializedFilters.has(filterInput)) return;
    initializedFilters.add(filterInput);
    const target = filterInput.dataset.uifFilterTarget;
    if (!target) return;
    const mode = filterInput.dataset.uifFilterMode || "contains";
    filterInput.addEventListener("input", () => filterElements(target, filterInput.value, mode));
    filterInput.addEventListener("change", () => filterElements(target, filterInput.value, mode));
  });
}
function updateSelectionState(table) {
  const selected = selectedRows(table);
  const ids = selectedRowIds(table);
  table.dataset.uifSelected = String(selected.length);
  if (ids.length && ids.join(",").length < 2048) table.dataset.uifSelectedIds = ids.join(",");
  else delete table.dataset.uifSelectedIds;
  const selectors = rows(table).map((row) => row.querySelector('[data-uif-role="row-select"]')).filter(Boolean);
  table.querySelectorAll('[data-uif-role="select-all"]').forEach((checkbox) => {
    checkbox.checked = selectors.length > 0 && selectors.every((rowSelect) => rowSelect.checked);
    checkbox.indeterminate = selectors.some((rowSelect) => rowSelect.checked) && !checkbox.checked;
  });
  const targetSelector = table.dataset.uifSelectionTarget;
  if (targetSelector) {
    const target = document.querySelector(targetSelector);
    if (target) target.textContent = String(selected.length);
  }
  table.dispatchEvent(new CustomEvent("uif:table-selection", { detail: { table, rows: selected, ids, totalSelected: selected.length }, bubbles: true }));
}
function pageFromControl(control, table) {
  const current = Number(table.dataset.uifPage || 1);
  const totalPages = Number(table.dataset.uifTotalPages || 0);
  const raw = control.dataset.uifTablePage || control.dataset.uifPage || "";
  if (raw === "next") return totalPages ? Math.min(totalPages, current + 1) : current + 1;
  if (raw === "prev" || raw === "previous") return Math.max(1, current - 1);
  if (raw === "first") return 1;
  if (raw === "last") return Math.max(1, totalPages || current);
  return Math.max(1, Number(raw || current));
}
function updatePaginationControls(table) {
  if (!table.id) return;
  const current = Number(table.dataset.uifPage || 1);
  const totalPages = Number(table.dataset.uifTotalPages || 0);
  document.querySelectorAll(`[data-uif-table-page][data-uif-target="#${cssEscape(table.id)}"]`).forEach((control) => {
    const page = control.dataset.uifTablePage || "";
    const disabled = (page === "first" || page === "prev" || page === "previous") && current <= 1 ? true : (page === "next" || page === "last") && totalPages > 0 && current >= totalPages;
    if ("disabled" in control) control.disabled = disabled;
    control.setAttribute("aria-disabled", String(disabled));
  });
  document.querySelectorAll(`[data-uif-table-page-label="#${cssEscape(table.id)}"]`).forEach((label) => {
    label.textContent = totalPages ? `Page ${current} of ${totalPages}` : `Page ${current}`;
  });
}
function applyLocalFilters(table) {
  const filters = tableFilters(table);
  rows(table).forEach((row) => {
    row.hidden = filters.some((filter) => {
      const index = filter.column ? columnIndex(table, filter.column) : -1;
      const value = index >= 0 ? cellValue(row, index) : row.textContent ?? "";
      return !matchesFilter(value, filter.value, filter.op);
    });
  });
  table.dispatchEvent(new CustomEvent("uif:table-filter", { detail: { table, filters }, bubbles: true }));
}
function refreshForControlChange(table, options = {}) {
  table.dataset.uifPage = "1";
  const mode = getTableMode(table);
  if (mode === "remote") void loadRemoteTable(table, options);
  else applyLocalFilters(table);
  updatePaginationControls(table);
}
function resetTable(table, options = {}) {
  if (!table.id) return;
  [...controlsForTable(table, "data-uif-table-filter"), ...controlsForTable(table, "data-uif-table-page-size")].forEach((control) => {
    control.value = control instanceof HTMLSelectElement ? control.querySelector("option")?.value ?? "" : "";
  });
  const grouped = document.querySelector(`[data-uif-table-controls="#${cssEscape(table.id)}"]`);
  grouped?.reset();
  table.dataset.uifPage = "1";
  delete table.dataset.uifSort;
  delete table.dataset.uifDirection;
  rows(table).forEach((row) => {
    row.hidden = false;
    row.querySelector('[data-uif-role="row-select"]')?.removeAttribute("checked");
  });
  table.querySelectorAll('[data-uif-role="row-select"],[data-uif-role="select-all"]').forEach((checkbox) => {
    checkbox.checked = false;
    checkbox.indeterminate = false;
  });
  updateSortHeaders(table, -1, "asc");
  updateSelectionState(table);
  table.dispatchEvent(new CustomEvent("uif:table-reset", { detail: { table }, bubbles: true }));
  if (getTableMode(table) === "remote") void loadRemoteTable(table, options);
}
function initTable(table, options = {}) {
  const existing = tableControllers.get(table);
  if (existing) return existing;
  const listenerController = new AbortController();
  const listenerOptions = { signal: listenerController.signal };
  table.dataset.uifState = table.dataset.uifState || "idle";
  applyResponsiveColumns(table);
  table.querySelectorAll("th[data-uif-sort]").forEach((header, index) => {
    header.tabIndex = 0;
    header.setAttribute("role", "button");
    header.setAttribute("aria-sort", "none");
    const sort2 = () => {
      const current = activeSort(table);
      const nextDirection = current?.column === index && current.direction === "asc" ? "desc" : "asc";
      const key = header.dataset.uifSort || String(index);
      table.dataset.uifPage = "1";
      if (getTableMode(table) === "remote") {
        table.dataset.uifSort = key;
        table.dataset.uifDirection = nextDirection;
        updateSortHeaders(table, index, nextDirection);
        table.dispatchEvent(new CustomEvent("uif:table-sort", { detail: { table, column: key, index, direction: nextDirection }, bubbles: true }));
        void loadRemoteTable(table, options);
      } else {
        sortTable(table, key || index, nextDirection);
      }
    };
    header.addEventListener("click", sort2, listenerOptions);
    header.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        sort2();
      }
    }, listenerOptions);
  });
  const sort = activeSort(table);
  if (sort) updateSortHeaders(table, sort.column, sort.direction);
  const filters = [
    ...options.filterInput ? [options.filterInput] : [],
    ...controlsForTable(table, "data-uif-table-filter")
  ];
  filters.forEach((filterInput) => {
    const handler = () => {
      if (filterInput.dataset.uifFilterColumn) refreshForControlChange(table, options);
      else if (getTableMode(table) === "remote") refreshForControlChange(table, options);
      else filterTable(table, filterInput.value, void 0, filterInput.dataset.uifFilterOp || "contains");
    };
    filterInput.addEventListener("input", handler, listenerOptions);
    filterInput.addEventListener("change", handler, listenerOptions);
  });
  controlsForTable(table, "data-uif-table-page-size").forEach((control) => {
    control.addEventListener("change", () => {
      table.dataset.uifPageSize = control.value || "25";
      table.dataset.uifPage = "1";
      table.dispatchEvent(new CustomEvent("uif:table-page-size", { detail: { table, pageSize: Number(table.dataset.uifPageSize) }, bubbles: true }));
      if (getTableMode(table) === "remote") void loadRemoteTable(table, options);
      updatePaginationControls(table);
    }, listenerOptions);
  });
  document.querySelectorAll(`[data-uif-table-reset="#${cssEscape(table.id)}"]`).forEach((resetEl) => {
    resetEl.addEventListener("click", () => resetTable(table, options), listenerOptions);
  }, listenerOptions);
  table.addEventListener("keydown", (event) => {
    const cell = event.target instanceof HTMLElement ? event.target.closest("td,th") : null;
    if (!cell || event.target instanceof HTMLInputElement || event.target instanceof HTMLButtonElement || event.target instanceof HTMLSelectElement || !["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight"].includes(event.key)) return;
    const rowIndex = cell.parentElement instanceof HTMLTableRowElement ? cell.parentElement.rowIndex : 0;
    const cellIndex = cell.cellIndex;
    const nextRow = table.rows[rowIndex + (event.key === "ArrowDown" ? 1 : event.key === "ArrowUp" ? -1 : 0)];
    const nextCell = nextRow?.cells[cellIndex + (event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0)];
    if (nextCell) {
      event.preventDefault();
      nextCell.tabIndex = 0;
      nextCell.focus();
    }
  });
  document.querySelectorAll(`[data-uif-table-action][data-uif-target="#${cssEscape(table.id)}"]`).forEach((actionEl) => {
    actionEl.addEventListener("click", () => {
      const action = actionEl.dataset.uifTableAction || actionEl.dataset.uifAction || "";
      const selected = selectedRows(table);
      options.onBulkAction?.(action, selected);
      table.dispatchEvent(new CustomEvent("uif:table-bulk-action", { detail: { table, action, rows: selected, ids: selectedRowIds(table) }, bubbles: true }));
    }, listenerOptions);
  });
  document.querySelectorAll(`[data-uif-table-page][data-uif-target="#${cssEscape(table.id)}"]`).forEach((pageEl) => {
    pageEl.addEventListener("click", () => {
      void goToPage(table, pageFromControl(pageEl, table), options);
    }, listenerOptions);
  }, listenerOptions);
  table.addEventListener("change", (event) => {
    const checkbox = event.target instanceof HTMLInputElement ? event.target : null;
    if (!checkbox) return;
    if (checkbox.matches('[data-uif-role="select-all"]')) {
      rows(table).forEach((row) => {
        const rowSelect = row.querySelector('[data-uif-role="row-select"]');
        if (rowSelect) rowSelect.checked = checkbox.checked;
      });
    }
    if (checkbox.matches('[data-uif-role="select-all"],[data-uif-role="row-select"]')) updateSelectionState(table);
  }, listenerOptions);
  table.addEventListener("click", (event) => {
    const actionEl = event.target instanceof HTMLElement ? event.target.closest("[data-uif-row-action]") : null;
    const row = actionEl?.closest("tr");
    if (actionEl && row) {
      const action = actionEl.dataset.uifRowAction || "";
      options.onRowAction?.(action, row);
      const id = row.dataset.uifRowId || row.querySelector('[data-uif-role="row-select"]')?.value || "";
      table.dispatchEvent(new CustomEvent("uif:table-row-action", { detail: { table, action, row, id }, bubbles: true }));
    }
  });
  updateSelectionState(table);
  updatePaginationControls(table);
  if (options.src || table.dataset.uifSrc) void loadRemoteTable(table, options);
  const controller = {
    refresh() {
      applyResponsiveColumns(table);
      updateSelectionState(table);
      updatePaginationControls(table);
      if (options.src || table.dataset.uifSrc) void loadRemoteTable(table, options);
    },
    destroy() {
      listenerController.abort();
      const key = tableRequestKeys.get(table);
      if (key) cancelRequest(key);
      tableRequestKeys.delete(table);
      if (tableControllers.get(table) === controller) tableControllers.delete(table);
    }
  };
  tableControllers.set(table, controller);
  return controller;
}
var dataTable = { name: "table", init: (el) => initTable(el) };
export {
  applyResponsiveColumns,
  dataTable,
  exportTable,
  filterElements,
  filterTable,
  goToPage,
  initDeclarativeFilters,
  initTable,
  loadRemoteTable,
  selectedRows,
  setTableState,
  sortTable
};
