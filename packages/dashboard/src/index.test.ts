import { afterEach, describe, expect, it, vi } from 'vitest';
import { configureTrustedTypes } from '@batoi/uif-dom';
import { applyDashboardFilters, createDashboardConfig, initDashboard, renderDashboard, summarizeDashboard } from './index.js';

afterEach(() => configureTrustedTypes(null));

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

  it('routes declarative rendering through the configured HTML policy', () => {
    const createHTML = vi.fn((value: string) => value);
    configureTrustedTypes({ createHTML });
    const element = document.createElement('div');
    element.dataset.uifDashboard = JSON.stringify({ title: 'Ops', widgets: [] });

    const controller = initDashboard(element);

    expect(createHTML).toHaveBeenCalledOnce();
    expect(element.querySelector('.uif-dashboard')).not.toBeNull();
    controller?.refresh({ title: 'Updated', widgets: [] });
    expect(element.textContent).toContain('Updated');
    controller?.destroy();
    expect(element.childNodes).toHaveLength(0);
  });

  it('replaces prior dashboard controllers without retaining stale rendered DOM', () => {
    const element = document.createElement('div');
    element.innerHTML = '<p>Fallback</p>';
    element.dataset.uifDashboard = JSON.stringify({ title: 'First', widgets: [] });
    initDashboard(element);
    element.dataset.uifDashboard = JSON.stringify({ title: 'Second', widgets: [] });

    const controller = initDashboard(element);

    expect(element.textContent).toContain('Second');
    expect(element.querySelectorAll('.uif-dashboard')).toHaveLength(1);
    controller?.destroy();
    expect(element.textContent).toBe('Fallback');
  });

  it('leaves server content intact and reports malformed dashboard options', () => {
    const element = document.createElement('div');
    element.innerHTML = '<p>Server fallback</p>';
    element.dataset.uifDashboard = '{bad';
    const errors: string[] = [];
    element.addEventListener('uif:dashboard-error', (event) => errors.push((event as CustomEvent).detail.code));

    const controller = initDashboard(element);

    expect(element.textContent).toContain('Server fallback');
    expect(errors).toEqual(['dashboard-invalid-options']);
    controller?.destroy();
  });
});
