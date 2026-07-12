import { describe, expect, it, vi } from 'vitest';
import { filterElements, filterTable, goToPage, initDeclarativeFilters, initTable, loadRemoteTable, selectedRows, setTableState, sortTable } from './index.js';

describe('table', () => {
  it('sorts, filters, and returns selected rows', () => {
    document.body.innerHTML = `
      <table><tbody>
        <tr><td><input data-uif-role="row-select" type="checkbox" checked></td><td>Beta</td></tr>
        <tr><td><input data-uif-role="row-select" type="checkbox"></td><td>Alpha</td></tr>
      </tbody></table>`;
    const table = document.querySelector('table') as HTMLTableElement;
    sortTable(table, 1);
    expect(table.tBodies[0].rows[0].cells[1].textContent).toBe('Alpha');
    filterTable(table, 'Beta');
    expect(table.tBodies[0].rows[0].hidden).toBe(true);
    expect(selectedRows(table)).toHaveLength(1);
  });

  it('sorts by named numeric and date columns and updates aria sort state', () => {
    document.body.innerHTML = `
      <table id="deals">
        <thead><tr><th data-uif-sort="name">Name</th><th data-uif-sort="value" data-uif-type="currency">Value</th><th data-uif-sort="close" data-uif-type="date">Close</th></tr></thead>
        <tbody>
          <tr><td>Beta</td><td>$9</td><td>2026-02-01</td></tr>
          <tr><td>Alpha</td><td>$120</td><td>2026-01-01</td></tr>
        </tbody>
      </table>`;
    const table = document.querySelector('table') as HTMLTableElement;
    sortTable(table, 'value', 'desc');
    expect(table.tBodies[0].rows[0].cells[0].textContent).toBe('Alpha');
    expect(table.querySelector('[data-uif-sort="value"]')?.getAttribute('aria-sort')).toBe('descending');
    sortTable(table, 'close', 'asc');
    expect(table.tBodies[0].rows[0].cells[0].textContent).toBe('Alpha');
    expect(table.dataset.uifSort).toBe('close');
  });

  it('filters arbitrary declarative targets', () => {
    document.body.innerHTML = `
      <input data-uif-filter-target="[data-row]" value="">
      <article data-row>Alpha account</article>
      <article data-row>Beta account</article>`;
    const input = document.querySelector('input') as HTMLInputElement;
    initDeclarativeFilters(document);
    input.value = 'alpha';
    input.dispatchEvent(new Event('input'));
    expect((document.querySelectorAll('[data-row]')[0] as HTMLElement).hidden).toBe(false);
    expect((document.querySelectorAll('[data-row]')[1] as HTMLElement).hidden).toBe(true);
    filterElements('[data-row]', '');
    expect((document.querySelectorAll('[data-row]')[1] as HTMLElement).hidden).toBe(false);
  });

  it('renders remote row values as text', async () => {
    document.body.innerHTML = '<table><thead><tr><th>Name</th></tr></thead><tbody></tbody></table>';
    const table = document.querySelector('table') as HTMLTableElement;
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({ rows: [{ name: '<img src=x onerror=alert(1)>' }], page: 1 })));
    await loadRemoteTable(table, { src: '/rows', columns: ['name'] });
    expect(table.querySelector('img')).toBeNull();
    expect(table.textContent).toContain('<img src=x onerror=alert(1)>');
    vi.unstubAllGlobals();
  });

  it('bounds remote rows and cell text before rendering', async () => {
    document.body.innerHTML = '<table><thead><tr><th>Name</th></tr></thead><tbody><tr><td>Fallback</td></tr></tbody></table>';
    const table = document.querySelector('table') as HTMLTableElement;
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({ rows: [{ name: 'x'.repeat(20) }] })));
    await loadRemoteTable(table, { src: '/rows', columns: ['name'], maxCellLength: 10 });
    expect(table.tBodies[0].rows[0].cells[0].textContent).toBe('x'.repeat(10));

    vi.stubGlobal('fetch', vi.fn(async () => Response.json({ rows: [{ name: 'one' }, { name: 'two' }] })));
    await expect(loadRemoteTable(table, { src: '/rows', columns: ['name'], maxRows: 1 })).rejects.toThrow('UIF_TABLE_LIMIT');
    expect(table.dataset.uifState).toBe('error');
  });

  it('rejects malformed and oversized trusted HTML table responses', async () => {
    const table = document.createElement('table');
    vi.stubGlobal('fetch', vi.fn(async () => Response.json(['invalid'])));
    await expect(loadRemoteTable(table, { src: '/rows' })).rejects.toThrow('Invalid remote table response');

    vi.stubGlobal('fetch', vi.fn(async () => Response.json({ html: '<tr><td>Too long</td></tr>' })));
    await expect(loadRemoteTable(table, { src: '/rows', maxHTMLLength: 10 })).rejects.toThrow('UIF_TABLE_LIMIT');
  });

  it('ignores malformed declarative filter selectors', () => {
    document.body.innerHTML = '<p data-row>Visible</p>';
    expect(() => filterElements('[', 'visible')).not.toThrow();
    expect((document.querySelector('[data-row]') as HTMLElement).hidden).toBe(false);
  });

  it('loads pages through pagination hooks and updates metadata', async () => {
    document.body.innerHTML = '<table id="accounts" data-uif-src="/rows" data-uif-columns="name" data-uif-page-size="2"><thead><tr><th>Name</th></tr></thead><tbody></tbody></table>';
    const table = document.querySelector('table') as HTMLTableElement;
    const onPage = vi.fn();
    vi.stubGlobal('fetch', vi.fn(async (url: string | URL) => Response.json({ rows: [{ name: String(new URL(String(url)).searchParams.get('page')) }], page: 2, pageSize: 2, total: 10, totalPages: 5 })));
    await goToPage(table, 2, { onPage, columns: ['name'] });
    expect(onPage).toHaveBeenCalledWith(2, table);
    expect(table.dataset.uifPage).toBe('2');
    expect(table.dataset.uifTotalPages).toBe('5');
    expect(table.textContent).toContain('2');
    vi.unstubAllGlobals();
  });

  it('sends sort, page size, and column filters to remote table endpoints', async () => {
    document.body.innerHTML = `
      <input data-uif-table-filter="#accounts" data-uif-filter-column="status" data-uif-filter-op="equals" name="status" value="active">
      <select data-uif-table-page-size="#accounts"><option value="2" selected>2</option></select>
      <table id="accounts" data-uif-src="/rows" data-uif-columns="name,status" data-uif-page-size="2" data-uif-sort="name" data-uif-direction="desc">
        <thead><tr><th data-uif-sort="name">Name</th><th data-uif-sort="status">Status</th></tr></thead><tbody></tbody>
      </table>`;
    const table = document.querySelector('table') as HTMLTableElement;
    const fetchMock = vi.fn(async (url: string | URL) => Response.json({ rows: [{ name: 'Ada', status: 'active' }], page: 1, pageSize: 2 }));
    vi.stubGlobal('fetch', fetchMock);
    await loadRemoteTable(table);
    const url = new URL(String(fetchMock.mock.calls[0][0]));
    expect(url.searchParams.get('sort')).toBe('name');
    expect(url.searchParams.get('direction')).toBe('desc');
    expect(url.searchParams.get('pageSize')).toBe('2');
    expect(url.searchParams.get('filters[status]')).toBe('active');
    expect(url.searchParams.get('filters[status][op]')).toBe('equals');
    vi.unstubAllGlobals();
  });

  it('dispatches row and bulk action events and updates selection state', () => {
    document.body.innerHTML = `
      <button data-uif-table-action="archive" data-uif-target="#accounts">Archive</button>
      <span id="selected"></span>
      <table id="accounts" data-uif-selection-target="#selected">
        <thead><tr><th><input type="checkbox" data-uif-role="select-all"></th><th>Name</th><th>Actions</th></tr></thead>
        <tbody>
          <tr><td><input type="checkbox" data-uif-role="row-select"></td><td>Ada</td><td><button data-uif-row-action="edit">Edit</button></td></tr>
          <tr><td><input type="checkbox" data-uif-role="row-select"></td><td>Grace</td><td></td></tr>
        </tbody>
      </table>`;
    const table = document.querySelector('table') as HTMLTableElement;
    const bulk = vi.fn();
    const row = vi.fn();
    table.addEventListener('uif:table-bulk-action', bulk);
    table.addEventListener('uif:table-row-action', row);
    initTable(table);
    (table.querySelector('[data-uif-role="select-all"]') as HTMLInputElement).checked = true;
    table.querySelector('[data-uif-role="select-all"]')?.dispatchEvent(new Event('change', { bubbles: true }));
    expect(table.dataset.uifSelected).toBe('2');
    expect(document.querySelector('#selected')?.textContent).toBe('2');
    document.querySelector<HTMLButtonElement>('[data-uif-table-action]')?.click();
    table.querySelector<HTMLButtonElement>('[data-uif-row-action]')?.click();
    expect(bulk).toHaveBeenCalledWith(expect.objectContaining({ detail: expect.objectContaining({ action: 'archive', rows: expect.arrayContaining([expect.any(HTMLTableRowElement)]) }) }));
    expect(row).toHaveBeenCalledWith(expect.objectContaining({ detail: expect.objectContaining({ action: 'edit', row: expect.any(HTMLTableRowElement) }) }));
  });

  it('tracks selected ids and indeterminate select all state', () => {
    document.body.innerHTML = `
      <span id="selected"></span>
      <table id="accounts" data-uif-selection-target="#selected">
        <thead><tr><th><input type="checkbox" data-uif-role="select-all"></th><th>Name</th></tr></thead>
        <tbody>
          <tr data-uif-row-id="ada"><td><input type="checkbox" data-uif-role="row-select" value="ada"></td><td>Ada</td></tr>
          <tr data-uif-row-id="grace"><td><input type="checkbox" data-uif-role="row-select" value="grace"></td><td>Grace</td></tr>
        </tbody>
      </table>`;
    const table = document.querySelector('table') as HTMLTableElement;
    initTable(table);
    const first = table.querySelector<HTMLInputElement>('[data-uif-role="row-select"]') as HTMLInputElement;
    const all = table.querySelector<HTMLInputElement>('[data-uif-role="select-all"]') as HTMLInputElement;
    first.checked = true;
    first.dispatchEvent(new Event('change', { bubbles: true }));
    expect(table.dataset.uifSelected).toBe('1');
    expect(table.dataset.uifSelectedIds).toBe('ada');
    expect(all.indeterminate).toBe(true);
  });

  it('filters local tables by column controls and resets table state', () => {
    document.body.innerHTML = `
      <input data-uif-table-filter="#accounts" data-uif-filter-column="status" data-uif-filter-op="equals" value="">
      <button data-uif-table-reset="#accounts">Reset</button>
      <table id="accounts">
        <thead><tr><th data-uif-sort="name">Name</th><th data-uif-sort="status">Status</th></tr></thead>
        <tbody>
          <tr><td>Ada</td><td>Active</td></tr>
          <tr><td>Grace</td><td>Paused</td></tr>
        </tbody>
      </table>`;
    const table = document.querySelector('table') as HTMLTableElement;
    const input = document.querySelector('input') as HTMLInputElement;
    initTable(table);
    input.value = 'active';
    input.dispatchEvent(new Event('input'));
    expect(table.tBodies[0].rows[0].hidden).toBe(false);
    expect(table.tBodies[0].rows[1].hidden).toBe(true);
    sortTable(table, 'name', 'desc');
    document.querySelector<HTMLButtonElement>('[data-uif-table-reset]')?.click();
    expect(table.tBodies[0].rows[0].hidden).toBe(false);
    expect(table.tBodies[0].rows[1].hidden).toBe(false);
    expect(table.dataset.uifSort).toBeUndefined();
  });

  it('annotates responsive cell labels from headers', () => {
    document.body.innerHTML = `
      <table><thead><tr><th data-uif-label="Account" data-uif-hide="sm">Name</th></tr></thead><tbody><tr><td>Ada</td></tr></tbody></table>`;
    const table = document.querySelector('table') as HTMLTableElement;
    initTable(table);
    expect(table.tBodies[0].rows[0].cells[0].dataset.uifLabel).toBe('Account');
    expect(table.tBodies[0].rows[0].cells[0].classList.contains('uif-hide-sm')).toBe(true);
  });

  it('renders configured visible state labels', () => {
    document.body.innerHTML = '<table data-uif-empty-text="No accounts found"><thead><tr><th>Name</th></tr></thead><tbody><tr><td>Ada</td></tr></tbody></table>';
    const table = document.querySelector('table') as HTMLTableElement;
    setTableState(table, 'empty');
    expect(table.querySelector('.uif-table-state')?.textContent).toBe('No accounts found');
  });

  it('owns external controls through a refreshable and destroyable controller', () => {
    document.body.innerHTML = `
      <input data-uif-table-filter="#accounts">
      <table id="accounts"><thead><tr><th>Name</th></tr></thead><tbody><tr><td>Ada</td></tr><tr><td>Grace</td></tr></tbody></table>`;
    const table = document.querySelector('table') as HTMLTableElement;
    const input = document.querySelector('input') as HTMLInputElement;
    const controller = initTable(table);
    expect(initTable(table)).toBe(controller);

    controller.destroy();
    input.value = 'Ada';
    input.dispatchEvent(new Event('input'));
    expect(table.tBodies[0].rows[1].hidden).toBe(false);

    const next = initTable(table);
    expect(next).not.toBe(controller);
    input.dispatchEvent(new Event('input'));
    expect(table.tBodies[0].rows[1].hidden).toBe(true);
    next.refresh();
    next.destroy();
  });

  it('blocks cross-origin remote table sources by default', async () => {
    const table = document.createElement('table');
    table.dataset.uifSrc = 'https://evil.example/rows';
    const fetch = vi.fn();
    vi.stubGlobal('fetch', fetch);

    await expect(loadRemoteTable(table)).rejects.toThrow(/unsafe table data URL/);

    expect(fetch).not.toHaveBeenCalled();
    expect(table.dataset.uifState).toBe('error');
  });
});
