import { describe, expect, it } from 'vitest';
import { adaptTable, exportChartData, renderChart } from './index.js';

describe('charts', () => {
  it('renders svg bar charts without external libraries', () => {
    const html = renderChart([{ label: 'Jan', value: 10 }], { type: 'bar' });
    expect(html).toContain('<svg');
    expect(html).toContain('<rect');
  });

  it('renders line and area charts', () => {
    expect(renderChart([{ label: 'Jan', value: 10 }], { type: 'line' })).toContain('uif-chart-line');
    expect(renderChart([{ label: 'Jan', value: 10 }], { type: 'area' })).toContain('uif-chart-area');
  });

  it('renders grouped and stacked bar charts from series data', () => {
    const data = [
      { label: 'Jan', values: { New: 10, Renewal: 8 } },
      { label: 'Feb', values: { New: 12, Renewal: 9 } },
    ];
    expect(renderChart(data, { type: 'grouped-bar', legend: true })).toContain('data-uif-series');
    expect(renderChart(data, { type: 'stacked-bar', legend: true })).toContain('Renewal');
  });

  it('renders real pie, donut, and doughnut arc segments', () => {
    const data = [
      { label: 'A', value: 30 },
      { label: 'B', value: 70 },
    ];
    expect(renderChart(data, { type: 'pie' }).match(/<path/g)).toHaveLength(2);
    expect(renderChart(data, { type: 'donut' })).toContain('A 80');
    expect(renderChart(data, { type: 'doughnut' })).toContain('uif-chart-donut');
  });

  it('renders radar charts with polygons and axis labels', () => {
    const html = renderChart(
      [
        { label: 'Security', value: 80 },
        { label: 'Performance', value: 60 },
        { label: 'Reliability', value: 90 },
      ],
      { type: 'radar' },
    );
    expect(html).toContain('uif-chart-radar-area');
    expect(html).toContain('Security');
  });

  it('renders compact app chart types', () => {
    expect(renderChart([{ label: 'Score', value: 75 }], { type: 'sparkline' })).toContain('uif-chart-sparkline');
    expect(renderChart([{ label: 'Score', value: 75 }], { type: 'gauge' })).toContain('uif-chart-gauge');
    expect(renderChart([{ label: 'Revenue', value: 70, target: 85, max: 100 }], { type: 'bullet' })).toContain('uif-chart-target');
    expect(renderChart([{ label: 'Day 1', value: 2 }], { type: 'heatmap' })).toContain('uif-chart-heatmap');
  });

  it('adds accessible title and description ids', () => {
    const html = renderChart([{ label: 'Jan', value: 10 }], { type: 'bar', label: 'Bookings', description: 'Monthly bookings' });
    expect(html).toContain('role="img"');
    expect(html).toContain('Bookings');
    expect(html).toContain('Monthly bookings');
  });

  it('adapts table data and exports csv', () => {
    document.body.innerHTML = `
      <table>
        <thead><tr><th>Month</th><th>Value</th><th>Target</th></tr></thead>
        <tbody><tr><td>Jan</td><td>12</td><td>15</td></tr></tbody>
      </table>`;
    const table = document.querySelector('table') as HTMLTableElement;
    expect(adaptTable(table)).toEqual([{ label: 'Jan', value: 12 }]);
    expect(adaptTable(table, { seriesColumns: [1, 2] })[0].values).toEqual({ Value: 12, Target: 15 });
    expect(exportChartData([{ label: 'Jan', value: 12 }], 'csv')).toContain('label,value');
  });
});
