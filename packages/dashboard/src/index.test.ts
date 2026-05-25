import { describe, expect, it } from 'vitest';
import { applyDashboardFilters, createDashboardConfig, renderDashboard, summarizeDashboard } from './index.js';

describe('dashboard helpers', () => {
  it('normalizes config defaults', () => {
    const config = createDashboardConfig({ title: 'Ops', widgets: [{ id: '', title: '', type: 'metric', value: 12 }] });

    expect(config.columns).toBe(3);
    expect(config.widgets[0]).toMatchObject({ id: 'widget-1', title: 'Widget 1', span: 1 });
  });

  it('filters rows and summarizes fields', () => {
    const rows = [
      { team: 'Sales', value: 10 },
      { team: 'Support', value: 20 },
    ];

    expect(applyDashboardFilters(rows, [{ field: 'team', operator: 'contains', value: 'sale' }])).toEqual([{ team: 'Sales', value: 10 }]);
    expect(summarizeDashboard(rows, 'value')).toMatchObject({ count: 2, sum: 30, average: 15 });
  });

  it('renders dashboard widgets', () => {
    const html = renderDashboard({ title: 'Revenue', widgets: [{ id: 'metric', title: 'ARR', type: 'metric', value: '$2.4M' }] });

    expect(html).toContain('uif-dashboard');
    expect(html).toContain('$2.4M');
  });
});
