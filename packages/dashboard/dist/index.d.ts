import { ChartDatum, ChartOptions } from '@batoi/uif-charts';

type DashboardWidgetType = 'metric' | 'chart' | 'table' | 'list' | 'custom';
type DashboardFilterOperator = 'equals' | 'contains' | 'between' | 'gte' | 'lte';
interface DashboardWidget {
    id: string;
    title: string;
    type: DashboardWidgetType;
    description?: string;
    value?: string | number;
    change?: string;
    data?: Array<Record<string, unknown>> | ChartDatum[];
    chart?: ChartOptions;
    columns?: string[];
    span?: 1 | 2 | 3 | 4 | 'full';
    html?: string;
}
interface DashboardFilter {
    field: string;
    operator?: DashboardFilterOperator;
    value: unknown;
}
interface DashboardConfig {
    id?: string;
    title: string;
    description?: string;
    density?: 'compact' | 'default' | 'roomy';
    columns?: 1 | 2 | 3 | 4;
    filters?: DashboardFilter[];
    widgets: DashboardWidget[];
}
interface DashboardRenderOptions {
    className?: string;
    emptyText?: string;
}
interface DashboardController {
    refresh(config?: DashboardConfig): void;
    destroy(): void;
}
declare function createDashboardConfig(config: DashboardConfig): DashboardConfig;
declare function applyDashboardFilters<T extends Record<string, unknown>>(rows: T[], filters?: DashboardFilter[]): T[];
declare function summarizeDashboard(rows: Array<Record<string, unknown>>, field: string): {
    count: number;
    sum: number;
    average: number;
    min: number;
    max: number;
};
declare function renderDashboardWidget(widget: DashboardWidget, options?: DashboardRenderOptions): string;
declare function renderDashboard(input: DashboardConfig, options?: DashboardRenderOptions): string;
declare function initDashboard(el: HTMLElement): DashboardController | null;

export { type DashboardConfig, type DashboardController, type DashboardFilter, type DashboardFilterOperator, type DashboardRenderOptions, type DashboardWidget, type DashboardWidgetType, applyDashboardFilters, createDashboardConfig, initDashboard, renderDashboard, renderDashboardWidget, summarizeDashboard };
