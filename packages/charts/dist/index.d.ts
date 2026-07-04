interface FlintChartEncoding {
    field?: string;
    type?: string;
    aggregate?: string;
    title?: string;
    [key: string]: unknown;
}
interface FlintChartSpec {
    chartType?: string;
    encodings?: Record<string, FlintChartEncoding | string | undefined>;
    baseSize?: Partial<Pick<ChartOptions, 'width' | 'height'>>;
    canvasSize?: Partial<Pick<ChartOptions, 'width' | 'height'>>;
    title?: string;
    description?: string;
    [key: string]: unknown;
}
interface FlintChartInput {
    data?: Array<Record<string, unknown>> | {
        values?: Array<Record<string, unknown>>;
        rows?: Array<Record<string, unknown>>;
    };
    semantic_types?: Record<string, string>;
    chart_spec?: FlintChartSpec;
    [key: string]: unknown;
}
interface FlintChartAdapterResult {
    data: ChartDatum[];
    options: ChartOptions;
    warnings: string[];
}
declare function adaptFlintChart(input: FlintChartInput, overrides?: ChartOptions): FlintChartAdapterResult;

type ChartType = 'line' | 'area' | 'bar' | 'horizontal-bar' | 'stacked-bar' | 'grouped-bar' | 'pie' | 'donut' | 'doughnut' | 'radar' | 'sparkline' | 'metric' | 'progress' | 'ring' | 'gauge' | 'timeline' | 'heatmap' | 'status-heatmap' | 'bullet' | 'histogram' | 'box-plot' | 'scatter' | 'regression' | 'control-chart' | 'distribution' | 'pareto' | 'funnel' | 'waterfall' | 'bubble' | 'treemap' | 'calendar-heatmap' | 'candlestick' | 'ohlc' | 'rose' | 'polar-area';
interface ChartDatum {
    label?: string;
    value?: number;
    values?: Record<string, number>;
    target?: number;
    min?: number;
    max?: number;
    group?: string;
    color?: string;
    size?: number;
    [key: string]: unknown;
}
interface ChartMargin {
    top: number;
    right: number;
    bottom: number;
    left: number;
}
interface ChartOptions {
    type?: ChartType;
    width?: number;
    height?: number;
    margin?: Partial<ChartMargin>;
    x?: string;
    y?: string;
    series?: string[];
    label?: string;
    description?: string;
    legend?: boolean | 'top' | 'right' | 'bottom';
    labels?: boolean;
    axes?: boolean;
    grid?: boolean;
    tooltip?: boolean;
    table?: boolean | 'sr-only';
    focusable?: boolean;
    palette?: string[] | ChartPaletteName;
    formatValue?: (value: number) => string;
    invalidValue?: 'zero' | 'skip' | 'error';
    min?: number;
    max?: number;
    stacked?: boolean;
    responsive?: boolean;
    exportable?: boolean;
    drilldown?: boolean | DrilldownOptions;
    sparklineType?: 'line' | 'bar';
    id?: string;
    aspectRatio?: number;
    bins?: number;
    regression?: boolean;
    thresholds?: Array<{
        value: number;
        label?: string;
        color?: string;
    }>;
    ranges?: Array<{
        min?: number;
        max: number;
        label?: string;
        color?: string;
    }>;
    target?: number;
}
type ChartPaletteName = 'default' | 'professional' | 'categorical' | 'status' | 'sequential' | 'diverging';
interface DrilldownOptions {
    action?: 'event' | 'target' | 'url' | 'route';
    target?: string;
    url?: string;
    param?: string;
}
interface ChartController {
    refresh(): Promise<void>;
    destroy(): void;
}
interface ChartSelectionDetail {
    label: string;
    value?: number;
    index?: number;
    series?: string;
    type: ChartType;
    datum?: ChartDatum;
    params: Record<string, string>;
}
interface ChartExportOptions {
    filename?: string;
    background?: string;
    scale?: number;
    width?: number;
    height?: number;
}
interface TableAdapterOptions {
    labelColumn?: number | string;
    valueColumn?: number | string;
    seriesColumns?: Array<number | string>;
}
interface RecordAdapterOptions {
    label?: string;
    value?: string;
    x?: string;
    y?: string;
    series?: string[];
}
interface SummaryStats {
    count: number;
    min: number;
    max: number;
    sum: number;
    mean: number;
    median: number;
    variance: number;
    stddev: number;
    q1: number;
    q3: number;
    iqr: number;
}
interface HistogramOptions {
    bins?: number;
    min?: number;
    max?: number;
}
interface HistogramBin {
    x0: number;
    x1: number;
    count: number;
}
interface RegressionPoint {
    x: number;
    y: number;
}
interface RegressionResult {
    slope: number;
    intercept: number;
    r: number;
    r2: number;
    predict: (x: number) => number;
}
declare function quantile(values: number[], q: number): number;
declare function summaryStats(values: number[]): SummaryStats;
declare function movingAverage(values: number[], windowSize: number): number[];
declare function cumulativeSum(values: number[]): number[];
declare function percentChange(values: number[]): number[];
declare function zScores(values: number[]): number[];
declare function histogramBins(values: number[], options?: HistogramOptions): HistogramBin[];
declare function correlation(pointsOrX: RegressionPoint[] | number[], yValues?: number[]): number;
declare function linearRegression(points: RegressionPoint[]): RegressionResult;
declare function renderFlintChart(input: FlintChartInput, overrides?: ChartOptions): string;
declare function renderChart(data: Array<ChartDatum | number>, options?: ChartOptions): string;
declare function parseChartData(el: HTMLElement): ChartDatum[];
declare function adaptTable(table: HTMLTableElement, options?: TableAdapterOptions): ChartDatum[];
declare function adaptRecords(records: Array<Record<string, unknown>>, mapping?: RecordAdapterOptions): ChartDatum[];
declare function initChart(el: HTMLElement): ChartController;
declare function refreshChart(el: HTMLElement): Promise<void>;
declare function destroyChart(el: HTMLElement): void;
declare function exportChartSvg(target: SVGSVGElement | HTMLElement): string;
declare function downloadChartSvg(target: SVGSVGElement | HTMLElement, filename?: string): void;
declare function exportChartPng(target: SVGSVGElement | HTMLElement, options?: ChartExportOptions): Promise<Blob>;
declare function downloadChartPng(target: SVGSVGElement | HTMLElement, filename?: string, options?: ChartExportOptions): Promise<void>;
declare function bindChartExports(root?: Document | HTMLElement): () => void;
declare function exportChartData(data: ChartDatum[], format?: 'json' | 'csv' | 'tsv'): string;
declare const chart: {
    name: string;
    init: (el: HTMLElement) => void;
    destroy: typeof destroyChart;
};

export { type ChartController, type ChartDatum, type ChartExportOptions, type ChartMargin, type ChartOptions, type ChartPaletteName, type ChartSelectionDetail, type ChartType, type DrilldownOptions, type FlintChartAdapterResult, type FlintChartEncoding, type FlintChartInput, type FlintChartSpec, type HistogramBin, type HistogramOptions, type RecordAdapterOptions, type RegressionPoint, type RegressionResult, type SummaryStats, type TableAdapterOptions, adaptFlintChart, adaptRecords, adaptTable, bindChartExports, chart, correlation, cumulativeSum, destroyChart, downloadChartPng, downloadChartSvg, exportChartData, exportChartPng, exportChartSvg, histogramBins, initChart, linearRegression, movingAverage, parseChartData, percentChange, quantile, refreshChart, renderChart, renderFlintChart, summaryStats, zScores };
