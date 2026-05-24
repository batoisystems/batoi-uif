import { describe, expect, it, vi } from 'vitest';
import { filterElements, filterTable, initDeclarativeFilters, loadRemoteTable, selectedRows, sortTable } from './index.js';

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
});
