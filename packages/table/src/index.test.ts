import { describe, expect, it } from 'vitest';
import { filterTable, selectedRows, sortTable } from './index.js';

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
});
