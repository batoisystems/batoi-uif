import { describe, expect, it } from 'vitest';
import {
  adaptRecords,
  adaptTable,
  correlation,
  histogramBins,
  initChart,
  linearRegression,
  movingAverage,
  parseChartData,
  quantile,
  renderChart,
  summaryStats,
  zScores,
  exportChartData,
} from './index.js';

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

  it('renders statistical charts without runtime dependencies', () => {
    expect(renderChart([12, 18, 19, 22, 22, 25, 31], { type: 'histogram', bins: 3 })).toContain('uif-chart-histogram');
    expect(renderChart([12, 18, 19, 22, 22, 25, 31], { type: 'box-plot' })).toContain('uif-chart-box');
    expect(renderChart([{ label: 'A', x: 1, y: 2 }], { type: 'scatter' })).toContain('uif-chart-scatter');
    expect(
      renderChart(
        [
          { label: 'A', x: 1, y: 2 },
          { label: 'B', x: 2, y: 4 },
        ],
        { type: 'regression' },
      ),
    ).toContain('uif-chart-regression');
    expect(renderChart([{ label: 'A', value: 3 }], { type: 'control-chart' })).toContain('uif-chart-reference');
    expect(renderChart([{ label: 'A', value: 3 }], { type: 'distribution' })).toContain('Binned distribution');
    expect(renderChart([{ label: 'A', value: 3 }], { type: 'pareto' })).toContain('Cumulative percent');
  });

  it('exports deterministic statistical helpers', () => {
    expect(summaryStats([1, 2, 3, 4]).mean).toBe(2.5);
    expect(quantile([1, 2, 3, 4], 0.5)).toBe(2.5);
    expect(movingAverage([2, 4, 6], 2)).toEqual([2, 3, 5]);
    expect(zScores([5, 5])).toEqual([0, 0]);
    expect(histogramBins([1, 2, 3, 4], { bins: 2 }).map((bin) => bin.count)).toEqual([2, 2]);
    expect(correlation([1, 2, 3], [2, 4, 6])).toBeCloseTo(1);
    expect(linearRegression([{ x: 1, y: 2 }, { x: 2, y: 4 }]).slope).toBeCloseTo(2);
  });

  it('handles mixed-sign stacked bars and all-zero pies', () => {
    const stacked = renderChart([{ label: 'Jan', values: { Gain: 10, Loss: -4 } }], { type: 'stacked-bar', series: ['Gain', 'Loss'] });
    expect(stacked).toContain('Loss: -4');
    expect(renderChart([{ label: 'Zero', value: 0 }], { type: 'pie' })).toContain('No positive values');
    expect(renderChart([{ label: 'Only', value: 10 }], { type: 'donut' })).toContain('fill-rule="evenodd"');
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
    expect(adaptTable(table, { labelColumn: 'Month', valueColumn: 'Target' })).toEqual([{ label: 'Jan', value: 15 }]);
    expect(adaptTable(table, { seriesColumns: [1, 2] })[0].values).toEqual({ Value: 12, Target: 15 });
    expect(adaptRecords([{ month: 'Jan', revenue: '12' }], { label: 'month', value: 'revenue' })).toEqual([{ month: 'Jan', revenue: '12', label: 'Jan', value: 12, values: undefined }]);
    expect(exportChartData([{ label: 'Jan', value: 12 }], 'csv')).toContain('label,value');
  });

  it('parses data safely and emits chart select events', async () => {
    const el = document.createElement('div');
    el.dataset.uifData = '{bad json';
    expect(parseChartData(el)).toEqual([]);

    el.dataset.uifData = '[{"label":"Jan","value":12}]';
    el.dataset.uifChart = 'bar';
    el.dataset.uifOptions = '{"focusable":true}';
    document.body.append(el);
    const event = new Promise<CustomEvent>((resolve) => el.addEventListener('uif:chart-select', (item) => resolve(item as CustomEvent), { once: true }));
    const controller = initChart(el);
    await controller.refresh();
    el.querySelector('.uif-chart-mark')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect((await event).detail.label).toContain('Jan');
    controller.destroy();
    el.remove();
  });
});
