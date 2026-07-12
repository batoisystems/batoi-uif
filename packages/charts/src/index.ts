import { request } from '@batoi/uif-net';
import { isSafeURL, safeQuerySelector, setTrustedHTML } from '@batoi/uif-dom';
import {
  adaptFlintChart,
  type FlintChartAdapterResult,
  type FlintChartInput,
  type FlintChartSpec,
} from './flint.js';

export { adaptFlintChart } from './flint.js';
export type {
  FlintChartAdapterResult,
  FlintChartEncoding,
  FlintChartInput,
  FlintChartSpec,
} from './flint.js';

export type ChartType =
  | 'line'
  | 'area'
  | 'bar'
  | 'horizontal-bar'
  | 'stacked-bar'
  | 'grouped-bar'
  | 'pie'
  | 'donut'
  | 'doughnut'
  | 'radar'
  | 'sparkline'
  | 'metric'
  | 'progress'
  | 'ring'
  | 'gauge'
  | 'timeline'
  | 'heatmap'
  | 'status-heatmap'
  | 'bullet'
  | 'histogram'
  | 'box-plot'
  | 'scatter'
  | 'regression'
  | 'control-chart'
  | 'distribution'
  | 'pareto'
  | 'funnel'
  | 'waterfall'
  | 'bubble'
  | 'treemap'
  | 'calendar-heatmap'
  | 'candlestick'
  | 'ohlc'
  | 'rose'
  | 'polar-area';

export interface ChartDatum {
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

export interface ChartMargin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface ChartOptions {
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
  thresholds?: Array<{ value: number; label?: string; color?: string }>;
  ranges?: Array<{ min?: number; max: number; label?: string; color?: string }>;
  target?: number;
}

export type ChartPaletteName =
  | 'default'
  | 'professional'
  | 'categorical'
  | 'status'
  | 'sequential'
  | 'diverging';

export interface DrilldownOptions {
  action?: 'event' | 'target' | 'url' | 'route';
  target?: string;
  url?: string;
  param?: string;
  allowCrossOrigin?: boolean;
}

export interface ChartController {
  refresh(): Promise<void>;
  destroy(): void;
}

export interface ChartSelectionDetail {
  label: string;
  value?: number;
  index?: number;
  series?: string;
  type: ChartType;
  datum?: ChartDatum;
  params: Record<string, string>;
}

export interface ChartExportOptions {
  filename?: string;
  background?: string;
  scale?: number;
  width?: number;
  height?: number;
}

export interface TableAdapterOptions {
  labelColumn?: number | string;
  valueColumn?: number | string;
  seriesColumns?: Array<number | string>;
}

export interface RecordAdapterOptions {
  label?: string;
  value?: string;
  x?: string;
  y?: string;
  series?: string[];
}

export interface SummaryStats {
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

export interface HistogramOptions {
  bins?: number;
  min?: number;
  max?: number;
}

export interface HistogramBin {
  x0: number;
  x1: number;
  count: number;
}

export interface RegressionPoint {
  x: number;
  y: number;
}

export interface RegressionResult {
  slope: number;
  intercept: number;
  r: number;
  r2: number;
  predict: (x: number) => number;
}

const controllers = new WeakMap<HTMLElement, ChartController>();
const exportBindings = new WeakMap<Document | HTMLElement, () => void>();
const defaultPalette = [
  'var(--uif-chart-1,var(--uif-color-primary))',
  'var(--uif-chart-2,var(--uif-color-success))',
  'var(--uif-chart-3,var(--uif-color-warning))',
  'var(--uif-chart-4,var(--uif-color-danger))',
  'var(--uif-chart-5,var(--uif-color-info))',
  'var(--uif-chart-6,#7c3aed)',
  'var(--uif-chart-7,#0f766e)',
  'var(--uif-chart-8,#9333ea)',
];

const namedPalettes: Record<ChartPaletteName, string[]> = {
  default: defaultPalette,
  professional: ['#0b72bd', '#00a88f', '#e4a700', '#df3158', '#7c3aed', '#0f766e'],
  categorical: ['#0b72bd', '#00a88f', '#e4a700', '#df3158', '#7c3aed', '#d9468f', '#475467'],
  status: ['#00a88f', '#0b72bd', '#e4a700', '#df3158'],
  sequential: ['#d9ecff', '#9dccf4', '#5ba6df', '#1f7dc1', '#0b4f86'],
  diverging: ['#df3158', '#f59e0b', '#e5e7eb', '#00a88f', '#0b72bd'],
};

let chartIdCounter = 0;

function esc(value: unknown): string {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function uid(options: ChartOptions, type: ChartType): string {
  const seed =
    `${options.id || options.label || type}-${options.width || 0}-${options.height || 0}`.toLowerCase();
  const clean = seed.replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  return `uif-chart-${clean || type}`;
}

function paletteFor(options: ChartOptions): string[] {
  if (Array.isArray(options.palette)) return options.palette;
  return namedPalettes[options.palette ?? 'default'] ?? defaultPalette;
}

function cleanValues(values: number[]): number[] {
  return values.map(Number).filter(Number.isFinite);
}

export function quantile(values: number[], q: number): number {
  const sorted = cleanValues(values).sort((a, b) => a - b);
  if (!sorted.length) return 0;
  const pos = (sorted.length - 1) * Math.max(0, Math.min(1, q));
  const base = Math.floor(pos);
  const rest = pos - base;
  return sorted[base] + ((sorted[base + 1] ?? sorted[base]) - sorted[base]) * rest;
}

export function summaryStats(values: number[]): SummaryStats {
  const nums = cleanValues(values);
  const count = nums.length;
  const sum = nums.reduce((total, value) => total + value, 0);
  const mean = count ? sum / count : 0;
  const variance = count
    ? nums.reduce((total, value) => total + (value - mean) ** 2, 0) / count
    : 0;
  const q1 = quantile(nums, 0.25);
  const q3 = quantile(nums, 0.75);
  return {
    count,
    min: count ? Math.min(...nums) : 0,
    max: count ? Math.max(...nums) : 0,
    sum,
    mean,
    median: quantile(nums, 0.5),
    variance,
    stddev: Math.sqrt(variance),
    q1,
    q3,
    iqr: q3 - q1,
  };
}

export function movingAverage(values: number[], windowSize: number): number[] {
  const nums = cleanValues(values);
  const size = Math.max(1, Math.floor(windowSize));
  return nums.map((_, index) => {
    const slice = nums.slice(Math.max(0, index - size + 1), index + 1);
    return slice.reduce((sum, value) => sum + value, 0) / slice.length;
  });
}

export function cumulativeSum(values: number[]): number[] {
  let total = 0;
  return cleanValues(values).map((value) => {
    total += value;
    return total;
  });
}

export function percentChange(values: number[]): number[] {
  const nums = cleanValues(values);
  return nums.map((value, index) => {
    const previous = nums[index - 1];
    return index === 0 || !previous ? 0 : ((value - previous) / Math.abs(previous)) * 100;
  });
}

export function zScores(values: number[]): number[] {
  const stats = summaryStats(values);
  return cleanValues(values).map((value) =>
    stats.stddev ? (value - stats.mean) / stats.stddev : 0,
  );
}

export function histogramBins(values: number[], options: HistogramOptions = {}): HistogramBin[] {
  const nums = cleanValues(values);
  if (!nums.length) return [];
  const min = options.min ?? Math.min(...nums);
  const max = options.max ?? Math.max(...nums);
  const binCount = Math.max(1, Math.floor(options.bins ?? Math.ceil(Math.sqrt(nums.length))));
  const span = max - min || 1;
  const bins = Array.from({ length: binCount }, (_, index) => ({
    x0: min + (span / binCount) * index,
    x1: min + (span / binCount) * (index + 1),
    count: 0,
  }));
  nums.forEach((value) => {
    const index = value === max ? binCount - 1 : Math.floor(((value - min) / span) * binCount);
    bins[Math.max(0, Math.min(binCount - 1, index))].count += 1;
  });
  return bins;
}

export function correlation(pointsOrX: RegressionPoint[] | number[], yValues?: number[]): number {
  const points = Array.isArray(yValues)
    ? (pointsOrX as number[]).map((x, index) => ({ x, y: yValues[index] }))
    : (pointsOrX as RegressionPoint[]);
  const clean = points.filter((point) => Number.isFinite(point.x) && Number.isFinite(point.y));
  if (clean.length < 2) return 0;
  const xMean = clean.reduce((sum, point) => sum + point.x, 0) / clean.length;
  const yMean = clean.reduce((sum, point) => sum + point.y, 0) / clean.length;
  const numerator = clean.reduce((sum, point) => sum + (point.x - xMean) * (point.y - yMean), 0);
  const xDen = Math.sqrt(clean.reduce((sum, point) => sum + (point.x - xMean) ** 2, 0));
  const yDen = Math.sqrt(clean.reduce((sum, point) => sum + (point.y - yMean) ** 2, 0));
  return xDen && yDen ? numerator / (xDen * yDen) : 0;
}

export function linearRegression(points: RegressionPoint[]): RegressionResult {
  const clean = points.filter((point) => Number.isFinite(point.x) && Number.isFinite(point.y));
  if (clean.length < 2)
    return {
      slope: 0,
      intercept: clean[0]?.y ?? 0,
      r: 0,
      r2: 0,
      predict: (x) => clean[0]?.y ?? x * 0,
    };
  const xMean = clean.reduce((sum, point) => sum + point.x, 0) / clean.length;
  const yMean = clean.reduce((sum, point) => sum + point.y, 0) / clean.length;
  const numerator = clean.reduce((sum, point) => sum + (point.x - xMean) * (point.y - yMean), 0);
  const denominator = clean.reduce((sum, point) => sum + (point.x - xMean) ** 2, 0);
  const slope = denominator ? numerator / denominator : 0;
  const intercept = yMean - slope * xMean;
  const r = correlation(clean);
  return { slope, intercept, r, r2: r * r, predict: (x) => slope * x + intercept };
}

function margins(options: ChartOptions): ChartMargin {
  return {
    top: 16,
    right: 18,
    bottom: options.axes === false ? 18 : 34,
    left: options.axes === false ? 18 : 42,
    ...options.margin,
  };
}

function coerceNumber(raw: unknown, options: ChartOptions): number | undefined {
  const value = Number(raw);
  if (Number.isFinite(value)) return value;
  if (options.invalidValue === 'error') throw new Error(`Invalid chart value: ${String(raw)}`);
  return options.invalidValue === 'skip' ? undefined : 0;
}

function valueOf(datum: ChartDatum, options: ChartOptions): number | undefined {
  const raw = options.y && datum[options.y] != null ? datum[options.y] : datum.value;
  return coerceNumber(raw, options);
}

function labelOf(datum: ChartDatum, options: ChartOptions): string {
  const raw = options.x && datum[options.x] != null ? datum[options.x] : datum.label;
  return String(raw ?? '');
}

function normalizeData(data: ChartDatum[], options: ChartOptions): ChartDatum[] {
  return data
    .map((item) => ({ ...item, label: labelOf(item, options), value: valueOf(item, options) }))
    .filter((item) => item.value != null || options.invalidValue !== 'skip');
}

function coerceData(data: Array<ChartDatum | number>): ChartDatum[] {
  return data.map((item, index) =>
    typeof item === 'number' ? { label: String(index + 1), value: item } : item,
  );
}

export function renderFlintChart(input: FlintChartInput, overrides: ChartOptions = {}): string {
  const adapted = adaptFlintChart(input, overrides);
  return renderChart(adapted.data, adapted.options);
}

function inferSeries(data: ChartDatum[], options: ChartOptions): string[] {
  if (options.series?.length) return options.series;
  const keys = new Set<string>();
  data.forEach((datum) => Object.keys(datum.values ?? {}).forEach((key) => keys.add(key)));
  return [...keys];
}

function fmt(value: number, options: ChartOptions): string {
  return options.formatValue
    ? options.formatValue(value)
    : String(Number.isInteger(value) ? value : Number(value.toFixed(2)));
}

function extent(values: number[], options: ChartOptions): [number, number] {
  const min = options.min ?? Math.min(0, ...values);
  const max = options.max ?? Math.max(1, ...values);
  return min === max ? [Math.min(0, min), max + 1] : [min, max];
}

function scaleLinear(domain: [number, number], range: [number, number]): (value: number) => number {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  const span = d1 - d0 || 1;
  return (value) => r0 + ((value - d0) / span) * (r1 - r0);
}

function pointString(points: Array<[number, number]>): string {
  return points.map(([x, y]) => `${round(x)},${round(y)}`).join(' ');
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

function polar(cx: number, cy: number, radius: number, angle: number): [number, number] {
  return [cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)];
}

function arcPath(
  cx: number,
  cy: number,
  outer: number,
  start: number,
  end: number,
  inner = 0,
): string {
  const large = end - start > Math.PI ? 1 : 0;
  const [sx, sy] = polar(cx, cy, outer, start);
  const [ex, ey] = polar(cx, cy, outer, end);
  if (inner <= 0)
    return `M ${cx} ${cy} L ${sx} ${sy} A ${outer} ${outer} 0 ${large} 1 ${ex} ${ey} Z`;
  const [isx, isy] = polar(cx, cy, inner, end);
  const [iex, iey] = polar(cx, cy, inner, start);
  return `M ${sx} ${sy} A ${outer} ${outer} 0 ${large} 1 ${ex} ${ey} L ${isx} ${isy} A ${inner} ${inner} 0 ${large} 0 ${iex} ${iey} Z`;
}

function fullDonutPath(cx: number, cy: number, outer: number, inner: number): string {
  return `M ${cx - outer} ${cy} A ${outer} ${outer} 0 1 0 ${cx + outer} ${cy} A ${outer} ${outer} 0 1 0 ${cx - outer} ${cy} M ${cx - inner} ${cy} A ${inner} ${inner} 0 1 1 ${cx + inner} ${cy} A ${inner} ${inner} 0 1 1 ${cx - inner} ${cy} Z`;
}

function markAttrs(
  label: string,
  options: ChartOptions,
  meta: { index?: number; value?: number; series?: string } = {},
): string {
  const interactive = options.focusable || Boolean(options.drilldown);
  const focus = interactive ? ' tabindex="0" role="button"' : '';
  const aria = interactive ? ` aria-label="${esc(label)}"` : '';
  const index = meta.index == null ? '' : ` data-uif-chart-index="${meta.index}"`;
  const value = meta.value == null ? '' : ` data-uif-chart-value="${esc(meta.value)}"`;
  const series = meta.series == null ? '' : ` data-uif-series="${esc(meta.series)}"`;
  return `class="uif-chart-mark"${focus}${aria} data-uif-chart-label="${esc(label)}"${index}${value}${series}`;
}

function axisAndGrid(
  width: number,
  height: number,
  plot: ChartMargin,
  domain: [number, number],
  options: ChartOptions,
): string {
  if (options.axes === false && options.grid === false) return '';
  const y = scaleLinear(domain, [height - plot.bottom, plot.top]);
  const ticks = Array.from({ length: 5 }, (_, i) => domain[0] + ((domain[1] - domain[0]) / 4) * i);
  return ticks
    .map((tick) => {
      const yy = y(tick);
      const grid =
        options.grid === false
          ? ''
          : `<line class="uif-chart-grid" x1="${plot.left}" y1="${yy}" x2="${width - plot.right}" y2="${yy}"></line>`;
      const label =
        options.axes === false
          ? ''
          : `<text class="uif-chart-axis-label" x="${plot.left - 8}" y="${yy + 4}" text-anchor="end">${esc(fmt(tick, options))}</text>`;
      return `${grid}${label}`;
    })
    .join('');
}

function verticalValueGrid(
  width: number,
  height: number,
  plot: ChartMargin,
  domain: [number, number],
  options: ChartOptions,
): string {
  if (options.axes === false && options.grid === false) return '';
  const x = scaleLinear(domain, [plot.left, width - plot.right]);
  const ticks = Array.from({ length: 5 }, (_, i) => domain[0] + ((domain[1] - domain[0]) / 4) * i);
  return ticks
    .map((tick) => {
      const xx = x(tick);
      const grid =
        options.grid === false
          ? ''
          : `<line class="uif-chart-grid" x1="${xx}" y1="${plot.top}" x2="${xx}" y2="${height - plot.bottom}"></line>`;
      const label =
        options.axes === false
          ? ''
          : `<text class="uif-chart-axis-label" x="${xx}" y="${height - 8}" text-anchor="middle">${esc(fmt(tick, options))}</text>`;
      return `${grid}${label}`;
    })
    .join('');
}

function svgWrap(
  type: ChartType,
  width: number,
  height: number,
  content: string,
  data: ChartDatum[],
  options: ChartOptions,
): string {
  const id = uid(options, type);
  const title = options.label || `${type} chart`;
  const desc =
    options.description ||
    data.map((d) => `${d.label ?? 'item'} ${fmt(valueOf(d, options) ?? 0, options)}`).join(', ');
  const table = options.table ? chartDataTable(data, options, id) : '';
  return `<svg class="uif-chart-svg uif-chart-${type}" viewBox="0 0 ${width} ${height}" role="img" aria-roledescription="chart" aria-labelledby="${id}-title ${id}-desc"><title id="${id}-title">${esc(title)}</title><desc id="${id}-desc">${esc(desc)}</desc>${content}</svg>${table}`;
}

function chartDataTable(data: ChartDatum[], options: ChartOptions, id: string): string {
  const series = inferSeries(data, options);
  const headers = ['Label', ...(series.length ? series : ['Value'])];
  const rows = data
    .map((datum) => {
      const cells = series.length
        ? series.map((key) => fmt(Number(datum.values?.[key] ?? 0), options))
        : [fmt(datum.value ?? 0, options)];
      return `<tr><th scope="row">${esc(datum.label ?? '')}</th>${cells.map((cell) => `<td>${esc(cell)}</td>`).join('')}</tr>`;
    })
    .join('');
  const hidden = options.table === 'sr-only' ? ' uif-sr-only' : '';
  return `<table id="${id}-table" class="uif-chart-data-table${hidden}"><caption>${esc(options.label || 'Chart data')}</caption><thead><tr>${headers.map((header) => `<th scope="col">${esc(header)}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table>`;
}

function legend(items: string[], options: ChartOptions): string {
  if (!options.legend || !items.length) return '';
  const palette = paletteFor(options);
  return `<div class="uif-chart-legend" data-uif-placement="${options.legend === true ? 'bottom' : options.legend}">${items
    .map(
      (item, i) =>
        `<span><i style="background:${palette[i % palette.length]}"></i>${esc(item)}</span>`,
    )
    .join('')}</div>`;
}

function renderLineLike(
  data: ChartDatum[],
  options: ChartOptions,
  area = false,
  sparkline = false,
): string {
  const width = options.width ?? (sparkline ? 160 : 360);
  const height = options.height ?? (sparkline ? 64 : 200);
  const plot = sparkline ? { top: 6, right: 6, bottom: 6, left: 6 } : margins(options);
  const normalized = normalizeData(data, options);
  const series = inferSeries(normalized, options);
  const palette = paletteFor(options);
  const values = series.length
    ? normalized.flatMap((d) => series.map((key) => Number(d.values?.[key] ?? 0)))
    : normalized.map((d) => d.value ?? 0);
  const y = scaleLinear(extent(values, options), [height - plot.bottom, plot.top]);
  const xStep =
    normalized.length > 1 ? (width - plot.left - plot.right) / (normalized.length - 1) : 0;
  const renderSeries = (name: string | null, index: number) => {
    const points = normalized.map(
      (d, i) =>
        [plot.left + i * xStep, y(name ? Number(d.values?.[name] ?? 0) : (d.value ?? 0))] as [
          number,
          number,
        ],
    );
    const line = `<polyline class="uif-chart-series uif-chart-line" data-uif-series="${esc(name ?? 'value')}" points="${pointString(points)}" fill="none" style="stroke:${palette[index % palette.length]}"></polyline>`;
    const fill = area
      ? `<polygon class="uif-chart-area" points="${plot.left},${height - plot.bottom} ${pointString(points)} ${width - plot.right},${height - plot.bottom}" style="fill:${palette[index % palette.length]}"></polygon>`
      : '';
    const marks =
      sparkline || options.labels === false
        ? ''
        : points
            .map(([cx, cy], i) => {
              const value = name
                ? Number(normalized[i].values?.[name] ?? 0)
                : (normalized[i].value ?? 0);
              const label = `${name ? `${name} ` : ''}${normalized[i].label ?? ''}: ${fmt(value, options)}`;
              return `<circle ${markAttrs(label, options, { index: i, value, series: name ?? undefined })} cx="${round(cx)}" cy="${round(cy)}" r="3"><title>${esc(label)}</title></circle>`;
            })
            .join('');
    return `${fill}${line}${marks}`;
  };
  const body = `${sparkline ? '' : axisAndGrid(width, height, plot, extent(values, options), options)}${
    series.length ? series.map(renderSeries).join('') : renderSeries(null, 0)
  }`;
  return `${svgWrap(sparkline ? 'sparkline' : area ? 'area' : 'line', width, height, body, normalized, options)}${legend(series, options)}`;
}

function renderBars(
  data: ChartDatum[],
  options: ChartOptions,
  mode: 'bar' | 'horizontal-bar' | 'grouped-bar' | 'stacked-bar',
): string {
  const width = options.width ?? 360;
  const height = options.height ?? 220;
  const plot = margins(options);
  const normalized = normalizeData(data, options);
  const series = inferSeries(normalized, options);
  const palette = paletteFor(options);
  const values =
    series.length && mode === 'stacked-bar'
      ? normalized.flatMap((d) => {
          let positive = 0;
          let negative = 0;
          series.forEach((key) => {
            const value = Number(d.values?.[key] ?? 0);
            if (value >= 0) positive += value;
            else negative += value;
          });
          return [negative, positive];
        })
      : series.length
        ? normalized.flatMap((d) => series.map((key) => Number(d.values?.[key] ?? 0)))
        : normalized.map((d) => d.value ?? 0);
  const domain = extent(values, options);
  const vertical = mode !== 'horizontal-bar';
  const major = vertical ? width - plot.left - plot.right : height - plot.top - plot.bottom;
  const band = major / Math.max(1, normalized.length);
  const zeroY = scaleLinear(domain, [height - plot.bottom, plot.top])(0);
  const zeroX = scaleLinear(domain, [plot.left, width - plot.right])(0);
  const yScale = scaleLinear(domain, [height - plot.bottom, plot.top]);
  const xScale = scaleLinear(domain, [plot.left, width - plot.right]);
  const bars = normalized
    .map((d, i) => {
      if (series.length && mode === 'stacked-bar') {
        let positiveOffset = 0;
        let negativeOffset = 0;
        return series
          .map((key, s) => {
            const value = Number(d.values?.[key] ?? 0);
            const start = value >= 0 ? positiveOffset : negativeOffset;
            const end = start + value;
            if (value >= 0) positiveOffset = end;
            else negativeOffset = end;
            const y0 = yScale(start);
            const y1 = yScale(end);
            const x = plot.left + i * band + band * 0.18;
            const w = band * 0.64;
            const h = Math.abs(y1 - y0);
            const label = `${d.label ?? ''} ${key}: ${fmt(value, options)}`;
            return `<rect ${markAttrs(label, options, { index: i, value, series: key })} x="${round(x)}" y="${round(Math.min(y0, y1))}" width="${round(w)}" height="${round(h)}" rx="3" style="fill:${palette[s % palette.length]}"><title>${esc(label)}</title></rect>`;
          })
          .join('');
      }
      if (series.length && mode === 'grouped-bar') {
        const inner = (band * 0.72) / series.length;
        return series
          .map((key, s) => {
            const value = Number(d.values?.[key] ?? 0);
            const y = yScale(value);
            const x = plot.left + i * band + band * 0.14 + s * inner;
            const label = `${d.label ?? ''} ${key}: ${fmt(value, options)}`;
            return `<rect ${markAttrs(label, options, { index: i, value, series: key })} x="${round(x)}" y="${round(Math.min(y, zeroY))}" width="${round(inner * 0.86)}" height="${round(Math.abs(zeroY - y))}" rx="3" style="fill:${palette[s % palette.length]}"><title>${esc(label)}</title></rect>`;
          })
          .join('');
      }
      const value = d.value ?? 0;
      const label = `${d.label ?? ''}: ${fmt(value, options)}`;
      if (!vertical) {
        const x = xScale(value);
        const y = plot.top + i * band + band * 0.18;
        return `<rect ${markAttrs(label, options, { index: i, value })} x="${round(Math.min(x, zeroX))}" y="${round(y)}" width="${round(Math.abs(x - zeroX))}" height="${round(band * 0.64)}" rx="3"><title>${esc(label)}</title></rect>`;
      }
      const y = yScale(value);
      const x = plot.left + i * band + band * 0.18;
      return `<rect ${markAttrs(label, options, { index: i, value })} x="${round(x)}" y="${round(Math.min(y, zeroY))}" width="${round(band * 0.64)}" height="${round(Math.abs(zeroY - y))}" rx="3"><title>${esc(label)}</title></rect>`;
    })
    .join('');
  const labels =
    options.axes === false
      ? ''
      : normalized
          .map((d, i) =>
            vertical
              ? `<text class="uif-chart-axis-label" x="${round(plot.left + i * band + band / 2)}" y="${height - 8}" text-anchor="middle">${esc(d.label)}</text>`
              : `<text class="uif-chart-axis-label" x="${plot.left - 8}" y="${round(plot.top + i * band + band / 2 + 4)}" text-anchor="end">${esc(d.label)}</text>`,
          )
          .join('');
  const grid = vertical
    ? axisAndGrid(width, height, plot, domain, options)
    : verticalValueGrid(width, height, plot, domain, options);
  return `${svgWrap(mode, width, height, `${grid}${bars}${labels}`, normalized, options)}${legend(series, options)}`;
}

function renderPie(data: ChartDatum[], options: ChartOptions, donut = false): string {
  const width = options.width ?? 180;
  const height = options.height ?? 180;
  const normalized = normalizeData(data, options).filter((d) => (d.value ?? 0) > 0);
  const palette = paletteFor(options);
  const total = normalized.reduce((sum, d) => sum + (d.value ?? 0), 0);
  if (!total)
    return `<div class="uif-chart-state" data-uif-state="empty">${esc(options.description || 'No positive values to chart')}</div>`;
  const radius = Math.min(width, height) / 2 - 10;
  const inner = donut ? radius * 0.55 : 0;
  let angle = -Math.PI / 2;
  const paths = normalized
    .map((d, i) => {
      const next = angle + ((d.value ?? 0) / total) * Math.PI * 2;
      const label = `${d.label ?? ''}: ${fmt(d.value ?? 0, options)}`;
      const fill = d.color || palette[i % palette.length];
      const path =
        normalized.length === 1 && !donut
          ? `<circle ${markAttrs(label, options, { index: i, value: d.value ?? 0 })} cx="${width / 2}" cy="${height / 2}" r="${radius}" style="fill:${fill}"><title>${esc(label)}</title></circle>`
          : `<path ${markAttrs(label, options, { index: i, value: d.value ?? 0 })} d="${normalized.length === 1 && donut ? fullDonutPath(width / 2, height / 2, radius, inner) : arcPath(width / 2, height / 2, radius, angle, next, inner)}" ${normalized.length === 1 && donut ? 'fill-rule="evenodd" ' : ''}style="fill:${fill}"><title>${esc(label)}</title></path>`;
      angle = next;
      return path;
    })
    .join('');
  return `${svgWrap(donut ? 'donut' : 'pie', width, height, paths, normalized, options)}${legend(
    normalized.map((d) => d.label ?? ''),
    options,
  )}`;
}

function renderRadar(data: ChartDatum[], options: ChartOptions): string {
  const width = options.width ?? 260;
  const height = options.height ?? 260;
  const normalized = normalizeData(data, options);
  const series = inferSeries(normalized, options);
  const values = series.length
    ? normalized.flatMap((d) => series.map((key) => Number(d.values?.[key] ?? 0)))
    : normalized.map((d) => d.value ?? 0);
  const max = options.max ?? Math.max(1, ...values);
  const min = options.min ?? 0;
  const palette = paletteFor(options);
  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width, height) / 2 - 34;
  const axes = normalized
    .map((d, i) => {
      const angle = -Math.PI / 2 + (i / normalized.length) * Math.PI * 2;
      const [x, y] = polar(cx, cy, radius, angle);
      const [lx, ly] = polar(cx, cy, radius + 16, angle);
      return `<line class="uif-chart-grid" x1="${cx}" y1="${cy}" x2="${round(x)}" y2="${round(y)}"></line><text class="uif-chart-axis-label" x="${round(lx)}" y="${round(ly)}" text-anchor="middle">${esc(d.label)}</text>`;
    })
    .join('');
  const rings = [0.25, 0.5, 0.75, 1]
    .map((factor) => {
      const pts = normalized.map((_, i) =>
        polar(cx, cy, radius * factor, -Math.PI / 2 + (i / normalized.length) * Math.PI * 2),
      );
      return `<polygon class="uif-chart-grid-polygon" points="${pointString(pts)}"></polygon>`;
    })
    .join('');
  const renderSeries = (name: string | null, index: number) => {
    const pts = normalized.map((d, i) => {
      const value = name ? Number(d.values?.[name] ?? 0) : (d.value ?? 0);
      const r = ((value - min) / (max - min || 1)) * radius;
      return polar(cx, cy, r, -Math.PI / 2 + (i / normalized.length) * Math.PI * 2);
    });
    return `<polygon class="uif-chart-radar-area" data-uif-series="${esc(name ?? 'value')}" points="${pointString(pts)}" style="stroke:${palette[index % palette.length]};fill:${palette[index % palette.length]}"></polygon>`;
  };
  return `${svgWrap('radar', width, height, `${rings}${axes}${series.length ? series.map(renderSeries).join('') : renderSeries(null, 0)}`, normalized, options)}${legend(series, options)}`;
}

function renderPolarArea(
  data: ChartDatum[],
  options: ChartOptions,
  type: 'rose' | 'polar-area',
): string {
  const width = options.width ?? 240;
  const height = options.height ?? 240;
  const normalized = normalizeData(data, options).filter((datum) => (datum.value ?? 0) >= 0);
  if (!normalized.length)
    return `<div class="uif-chart-state" data-uif-state="empty">${esc(options.description || 'No polar data')}</div>`;
  const palette = paletteFor(options);
  const cx = width / 2;
  const cy = height / 2;
  const maxRadius = Math.min(width, height) / 2 - 22;
  const max = Math.max(1, ...normalized.map((datum) => datum.value ?? 0));
  const step = (Math.PI * 2) / normalized.length;
  const rings = [0.25, 0.5, 0.75, 1]
    .map(
      (factor) =>
        `<circle class="uif-chart-grid" cx="${cx}" cy="${cy}" r="${round(maxRadius * factor)}"></circle>`,
    )
    .join('');
  const paths = normalized
    .map((datum, index) => {
      const value = datum.value ?? 0;
      const radius = Math.sqrt(value / max) * maxRadius;
      const start = -Math.PI / 2 + index * step + step * 0.04;
      const end = start + step * 0.92;
      const label = `${datum.label ?? `Segment ${index + 1}`}: ${fmt(value, options)}`;
      return `<path ${markAttrs(label, options, { index, value })} d="${arcPath(cx, cy, radius, start, end)}" style="fill:${datum.color || palette[index % palette.length]};opacity:0.82"><title>${esc(label)}</title></path>`;
    })
    .join('');
  const labels =
    options.labels === false
      ? ''
      : normalized
          .map((datum, index) => {
            const angle = -Math.PI / 2 + index * step + step / 2;
            const [x, y] = polar(cx, cy, maxRadius + 14, angle);
            return `<text class="uif-chart-axis-label" x="${round(x)}" y="${round(y)}" text-anchor="middle">${esc(datum.label ?? '')}</text>`;
          })
          .join('');
  return `${svgWrap(type, width, height, `${rings}${paths}${labels}`, normalized, {
    ...options,
    axes: false,
    description:
      options.description ||
      `${type === 'rose' ? 'Rose' : 'Polar area'} chart with radius-encoded values`,
  })}${legend(options.legend ? normalized.map((datum) => datum.label ?? '') : [], options)}`;
}

function renderSparkline(data: ChartDatum[], options: ChartOptions): string {
  if (options.sparklineType === 'bar')
    return renderBars(
      data,
      {
        ...options,
        width: options.width ?? 160,
        height: options.height ?? 56,
        axes: false,
        grid: false,
      },
      'bar',
    );
  return renderLineLike(data, { ...options, axes: false, grid: false, labels: false }, false, true);
}

function renderMetric(data: ChartDatum[], options: ChartOptions): string {
  const first = normalizeData(data, options)[0];
  return `<div class="uif-chart-metric" role="img" aria-label="${esc(options.label || first?.label || 'Metric')}: ${esc(fmt(first?.value ?? 0, options))}"><strong>${esc(fmt(first?.value ?? 0, options))}</strong><span>${esc(first?.label ?? options.label ?? 'Metric')}</span></div>`;
}

function renderRing(
  data: ChartDatum[],
  options: ChartOptions,
  type: 'progress' | 'ring' | 'gauge',
): string {
  const width = options.width ?? 140;
  const height = options.height ?? (type === 'gauge' ? 90 : 140);
  const datum = normalizeData(data, options)[0];
  const value = datum?.value ?? 0;
  const max = options.max ?? datum?.max ?? 100;
  const pct = Math.max(0, Math.min(1, value / (max || 1)));
  if (type === 'gauge') {
    const start = Math.PI;
    const end = Math.PI + pct * Math.PI;
    const bg = arcPath(width / 2, height - 8, 58, Math.PI, Math.PI * 2, 46);
    const fg = arcPath(width / 2, height - 8, 58, start, end, 46);
    return svgWrap(
      'gauge',
      width,
      height,
      `<path class="uif-chart-ring-bg" d="${bg}"></path><path class="uif-chart-value" d="${fg}"></path><text x="${width / 2}" y="${height - 18}" text-anchor="middle">${esc(fmt(value, options))}</text>`,
      [datum],
      options,
    );
  }
  const dash = round(pct * 283);
  return svgWrap(
    type,
    width,
    height,
    `<circle class="uif-chart-ring-bg" cx="${width / 2}" cy="${height / 2}" r="45"></circle><circle class="uif-chart-value" cx="${width / 2}" cy="${height / 2}" r="45" stroke-dasharray="${dash} 283"></circle><text x="${width / 2}" y="${height / 2 + 4}" text-anchor="middle">${esc(fmt(value, options))}</text>`,
    [datum],
    options,
  );
}

function renderBullet(data: ChartDatum[], options: ChartOptions): string {
  const width = options.width ?? 320;
  const height = options.height ?? 72;
  const datum = normalizeData(data, options)[0];
  const max = options.max ?? datum?.max ?? 100;
  const x = scaleLinear([0, max], [24, width - 18]);
  const value = Math.max(0, Math.min(max || 0, datum?.value ?? 0));
  const target = datum?.target ?? max;
  const content = `<rect class="uif-chart-range" x="24" y="24" width="${width - 42}" height="18"></rect><rect class="uif-chart-value-bar" x="24" y="24" width="${round(x(value) - 24)}" height="18"></rect><line class="uif-chart-target" x1="${round(x(target))}" y1="18" x2="${round(x(target))}" y2="48"></line><text class="uif-chart-axis-label" x="24" y="62">${esc(datum?.label ?? '')}</text>`;
  return svgWrap('bullet', width, height, content, [datum], options);
}

function renderHeatmap(data: ChartDatum[], options: ChartOptions): string {
  const width = options.width ?? 320;
  const height = options.height ?? 160;
  const normalized = normalizeData(data, options);
  const cols = Math.ceil(Math.sqrt(normalized.length || 1));
  const cell = Math.min((width - 20) / cols, (height - 20) / Math.ceil(normalized.length / cols));
  const max = Math.max(1, ...normalized.map((d) => d.value ?? 0));
  const cells = normalized
    .map((d, i) => {
      const opacity = 0.2 + ((d.value ?? 0) / max) * 0.8;
      const x = 10 + (i % cols) * cell;
      const y = 10 + Math.floor(i / cols) * cell;
      const label = `${d.label ?? ''}: ${fmt(d.value ?? 0, options)}`;
      return `<rect ${markAttrs(label, options, { index: i, value: d.value ?? 0 })} x="${round(x)}" y="${round(y)}" width="${round(cell - 3)}" height="${round(cell - 3)}" rx="3" style="opacity:${round(opacity)}"><title>${esc(label)}</title></rect>`;
    })
    .join('');
  return svgWrap('heatmap', width, height, cells, normalized, options);
}

function parseIsoDate(value: unknown): number | null {
  const match = String(value ?? '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const time = Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return Number.isFinite(time) ? time : null;
}

function utcDay(time: number): number {
  return Math.floor(time / 86400000);
}

function renderCalendarHeatmap(data: ChartDatum[], options: ChartOptions): string {
  const width = options.width ?? 420;
  const height = options.height ?? 150;
  const rows = data
    .map((datum, index) => {
      const time = parseIsoDate(datum.date ?? datum.label);
      return time == null
        ? null
        : { datum, index, time, day: utcDay(time), value: valueOf(datum, options) ?? 0 };
    })
    .filter(
      (
        item,
      ): item is { datum: ChartDatum; index: number; time: number; day: number; value: number } =>
        Boolean(item),
    );
  if (!rows.length)
    return `<div class="uif-chart-state" data-uif-state="empty">${esc(options.description || 'No calendar data')}</div>`;
  const minDay = Math.min(...rows.map((row) => row.day));
  const maxDay = Math.max(...rows.map((row) => row.day));
  const startDate = new Date(minDay * 86400000);
  const startOffset = startDate.getUTCDay();
  const startDay = minDay - startOffset;
  const weeks = Math.ceil((maxDay - startDay + 1) / 7);
  const cell = Math.min((width - 20) / Math.max(1, weeks), (height - 20) / 7);
  const max = Math.max(1, ...rows.map((row) => row.value));
  const byDay = new Map(rows.map((row) => [row.day, row]));
  const cells = Array.from({ length: weeks * 7 }, (_, offset) => {
    const day = startDay + offset;
    const row = byDay.get(day);
    const x = 10 + Math.floor(offset / 7) * cell;
    const y = 10 + (offset % 7) * cell;
    const value = row?.value ?? 0;
    const opacity = row ? 0.18 + (value / max) * 0.82 : 0.08;
    const date = new Date(day * 86400000).toISOString().slice(0, 10);
    const label = `${date}: ${fmt(value, options)}`;
    return `<rect ${markAttrs(label, options, { index: row?.index, value })} x="${round(x)}" y="${round(y)}" width="${round(cell - 2)}" height="${round(cell - 2)}" rx="2" style="opacity:${round(opacity)}"><title>${esc(label)}</title></rect>`;
  }).join('');
  return svgWrap(
    'calendar-heatmap',
    width,
    height,
    cells,
    rows.map((row) => row.datum),
    {
      ...options,
      description: options.description || 'Calendar heatmap showing activity by day',
    },
  );
}

interface TreemapRect {
  datum: ChartDatum;
  index: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

function layoutTreemap(
  items: Array<{ datum: ChartDatum; index: number; value: number }>,
  x: number,
  y: number,
  width: number,
  height: number,
  depth = 0,
): TreemapRect[] {
  if (!items.length || width <= 0 || height <= 0) return [];
  if (items.length === 1)
    return [{ datum: items[0].datum, index: items[0].index, x, y, width, height }];
  const total = items.reduce((sum, item) => sum + item.value, 0) || 1;
  let running = 0;
  let splitIndex = 0;
  for (; splitIndex < items.length - 1; splitIndex += 1) {
    if (running + items[splitIndex].value >= total / 2) break;
    running += items[splitIndex].value;
  }
  const leftItems = items.slice(0, splitIndex + 1);
  const rightItems = items.slice(splitIndex + 1);
  const leftTotal = leftItems.reduce((sum, item) => sum + item.value, 0);
  if (!rightItems.length) return layoutTreemap(leftItems, x, y, width, height, depth + 1);
  if (depth % 2 === 0) {
    const leftWidth = width * (leftTotal / total);
    return [
      ...layoutTreemap(leftItems, x, y, leftWidth, height, depth + 1),
      ...layoutTreemap(rightItems, x + leftWidth, y, width - leftWidth, height, depth + 1),
    ];
  }
  const topHeight = height * (leftTotal / total);
  return [
    ...layoutTreemap(leftItems, x, y, width, topHeight, depth + 1),
    ...layoutTreemap(rightItems, x, y + topHeight, width, height - topHeight, depth + 1),
  ];
}

function renderTreemap(data: ChartDatum[], options: ChartOptions): string {
  const width = options.width ?? 360;
  const height = options.height ?? 220;
  const normalized = normalizeData(data, options)
    .map((datum, index) => ({ datum, index, value: Math.max(0, datum.value ?? 0) }))
    .filter((item) => item.value > 0);
  if (!normalized.length)
    return `<div class="uif-chart-state" data-uif-state="empty">${esc(options.description || 'No treemap data')}</div>`;
  const palette = paletteFor({ ...options, palette: options.palette ?? 'categorical' });
  const groups = [
    ...new Set(normalized.map((item) => String(item.datum.group ?? '')).filter(Boolean)),
  ];
  const rects = layoutTreemap(
    normalized.sort((a, b) => b.value - a.value),
    8,
    8,
    width - 16,
    height - 16,
  );
  const marks = rects
    .map((rect) => {
      const group = rect.datum.group ? String(rect.datum.group) : undefined;
      const colorIndex = group ? Math.max(0, groups.indexOf(group)) : rect.index;
      const label = `${rect.datum.label ?? `Item ${rect.index + 1}`}: ${fmt(rect.datum.value ?? 0, options)}`;
      const showLabel = rect.width > 52 && rect.height > 28;
      return `<g><rect ${markAttrs(label, options, { index: rect.index, value: rect.datum.value ?? 0, series: group })} x="${round(rect.x)}" y="${round(rect.y)}" width="${round(Math.max(0, rect.width - 2))}" height="${round(Math.max(0, rect.height - 2))}" rx="3" style="fill:${rect.datum.color || palette[colorIndex % palette.length]}"><title>${esc(label)}</title></rect>${showLabel ? `<text class="uif-chart-axis-label" x="${round(rect.x + 6)}" y="${round(rect.y + 16)}">${esc(rect.datum.label ?? '')}</text>` : ''}</g>`;
    })
    .join('');
  return `${svgWrap(
    'treemap',
    width,
    height,
    marks,
    rects.map((rect) => rect.datum),
    {
      ...options,
      axes: false,
      description: options.description || 'Treemap showing relative part-to-whole size',
    },
  )}${legend(groups, options)}`;
}

function renderHistogram(data: ChartDatum[], options: ChartOptions, distribution = false): string {
  const width = options.width ?? 360;
  const height = options.height ?? 220;
  const plot = margins(options);
  const normalized = normalizeData(data, options);
  const bins = histogramBins(
    normalized.map((d) => d.value ?? 0),
    { bins: options.bins, min: options.min, max: options.max },
  );
  if (!bins.length)
    return `<div class="uif-chart-state" data-uif-state="empty">${esc(options.description || 'No data')}</div>`;
  const x = scaleLinear([bins[0].x0, bins[bins.length - 1].x1], [plot.left, width - plot.right]);
  const y = scaleLinear(
    [0, Math.max(1, ...bins.map((bin) => bin.count))],
    [height - plot.bottom, plot.top],
  );
  if (distribution) {
    const points = bins.map((bin) => [x((bin.x0 + bin.x1) / 2), y(bin.count)] as [number, number]);
    const body = `${axisAndGrid(width, height, plot, [0, Math.max(1, ...bins.map((bin) => bin.count))], options)}<polyline class="uif-chart-series uif-chart-line" points="${pointString(points)}" fill="none"></polyline>`;
    return svgWrap('distribution', width, height, body, normalized, {
      ...options,
      description: options.description || 'Binned distribution line',
    });
  }
  const bars = bins
    .map((bin, binIndex) => {
      const x0 = x(bin.x0);
      const x1 = x(bin.x1);
      const yy = y(bin.count);
      const label = `${fmt(bin.x0, options)}-${fmt(bin.x1, options)}: ${bin.count}`;
      return `<rect ${markAttrs(label, options, { index: binIndex, value: bin.count })} x="${round(x0 + 1)}" y="${round(yy)}" width="${round(Math.max(1, x1 - x0 - 2))}" height="${round(height - plot.bottom - yy)}" rx="2"><title>${esc(label)}</title></rect>`;
    })
    .join('');
  return svgWrap(
    'histogram',
    width,
    height,
    `${axisAndGrid(width, height, plot, [0, Math.max(1, ...bins.map((bin) => bin.count))], options)}${bars}`,
    normalized,
    options,
  );
}

function renderBoxPlot(data: ChartDatum[], options: ChartOptions): string {
  const width = options.width ?? 320;
  const height = options.height ?? 160;
  const plot = margins({
    ...options,
    margin: { top: 18, right: 20, bottom: 28, left: 34, ...options.margin },
  });
  const normalized = normalizeData(data, options);
  const stats = summaryStats(normalized.map((d) => d.value ?? 0));
  if (!stats.count)
    return `<div class="uif-chart-state" data-uif-state="empty">${esc(options.description || 'No data')}</div>`;
  const domain = extent([stats.min, stats.max], options);
  const x = scaleLinear(domain, [plot.left, width - plot.right]);
  const cy = (height - plot.bottom + plot.top) / 2;
  const boxTop = cy - 22;
  const boxHeight = 44;
  const content = `${verticalValueGrid(width, height, plot, domain, options)}<line class="uif-chart-grid" x1="${round(x(stats.min))}" y1="${cy}" x2="${round(x(stats.max))}" y2="${cy}"></line><rect ${markAttrs(`Q1 ${fmt(stats.q1, options)} to Q3 ${fmt(stats.q3, options)}`, options, { value: stats.median }).replace('class="uif-chart-mark"', 'class="uif-chart-mark uif-chart-box"')} x="${round(x(stats.q1))}" y="${boxTop}" width="${round(Math.max(1, x(stats.q3) - x(stats.q1)))}" height="${boxHeight}" rx="3"><title>Q1 ${esc(fmt(stats.q1, options))}, median ${esc(fmt(stats.median, options))}, Q3 ${esc(fmt(stats.q3, options))}</title></rect><line class="uif-chart-target" x1="${round(x(stats.median))}" y1="${boxTop - 4}" x2="${round(x(stats.median))}" y2="${boxTop + boxHeight + 4}"></line><line class="uif-chart-target" x1="${round(x(stats.min))}" y1="${cy - 14}" x2="${round(x(stats.min))}" y2="${cy + 14}"></line><line class="uif-chart-target" x1="${round(x(stats.max))}" y1="${cy - 14}" x2="${round(x(stats.max))}" y2="${cy + 14}"></line>`;
  return svgWrap('box-plot', width, height, content, normalized, {
    ...options,
    description:
      options.description || `Median ${fmt(stats.median, options)}, IQR ${fmt(stats.iqr, options)}`,
  });
}

function pointsFromData(data: ChartDatum[], options: ChartOptions): RegressionPoint[] {
  return normalizeData(data, options).map((d, index) => ({
    x: Number(options.x && d[options.x] != null ? d[options.x] : (d.x ?? index + 1)),
    y: Number(options.y && d[options.y] != null ? d[options.y] : (d.y ?? d.value ?? 0)),
  }));
}

function renderScatter(data: ChartDatum[], options: ChartOptions, forceRegression = false): string {
  const width = options.width ?? 360;
  const height = options.height ?? 220;
  const plot = margins(options);
  const normalized = normalizeData(data, options);
  const points = pointsFromData(data, options).filter(
    (point) => Number.isFinite(point.x) && Number.isFinite(point.y),
  );
  if (!points.length)
    return `<div class="uif-chart-state" data-uif-state="empty">${esc(options.description || 'No plottable points')}</div>`;
  const xDomain = extent(
    points.map((point) => point.x),
    { min: options.min },
  );
  const yDomain = extent(
    points.map((point) => point.y),
    { max: options.max },
  );
  const x = scaleLinear(xDomain, [plot.left, width - plot.right]);
  const y = scaleLinear(yDomain, [height - plot.bottom, plot.top]);
  const marks = points
    .map((point, index) => {
      const label = `${normalized[index]?.label || `Point ${index + 1}`}: ${fmt(point.x, options)}, ${fmt(point.y, options)}`;
      return `<circle ${markAttrs(label, options, { index, value: point.y })} cx="${round(x(point.x))}" cy="${round(y(point.y))}" r="4"><title>${esc(label)}</title></circle>`;
    })
    .join('');
  const reg = options.regression || forceRegression ? linearRegression(points) : null;
  const line = reg
    ? `<line class="uif-chart-regression" x1="${round(x(xDomain[0]))}" y1="${round(y(reg.predict(xDomain[0])))}" x2="${round(x(xDomain[1]))}" y2="${round(y(reg.predict(xDomain[1])))}"><title>y = ${esc(fmt(reg.slope, options))}x + ${esc(fmt(reg.intercept, options))}, R2 ${esc(fmt(reg.r2, options))}</title></line>`
    : '';
  return svgWrap(
    forceRegression ? 'regression' : 'scatter',
    width,
    height,
    `${axisAndGrid(width, height, plot, yDomain, options)}${verticalValueGrid(width, height, plot, xDomain, options)}${marks}${line}`,
    normalized,
    options,
  );
}

function renderBubble(data: ChartDatum[], options: ChartOptions): string {
  const width = options.width ?? 360;
  const height = options.height ?? 220;
  const plot = margins(options);
  const normalized = normalizeData(data, options);
  const points = pointsFromData(data, options).filter(
    (point) => Number.isFinite(point.x) && Number.isFinite(point.y),
  );
  if (!points.length)
    return `<div class="uif-chart-state" data-uif-state="empty">${esc(options.description || 'No plottable bubbles')}</div>`;
  const sizes = normalized.map((datum) =>
    Number(datum.size ?? datum.z ?? datum.radius ?? datum.value ?? 1),
  );
  const sizeDomain = extent(sizes, { min: 0 });
  const radius = scaleLinear(sizeDomain, [4, 18]);
  const xDomain = extent(
    points.map((point) => point.x),
    { min: options.min },
  );
  const yDomain = extent(
    points.map((point) => point.y),
    { max: options.max },
  );
  const x = scaleLinear(xDomain, [plot.left, width - plot.right]);
  const y = scaleLinear(yDomain, [height - plot.bottom, plot.top]);
  const palette = paletteFor(options);
  const groups = [...new Set(normalized.map((datum) => String(datum.group ?? '')).filter(Boolean))];
  const marks = points
    .map((point, index) => {
      const datum = normalized[index];
      const size = Number(datum?.size ?? datum?.z ?? datum?.radius ?? datum?.value ?? 1);
      const group = datum?.group ? String(datum.group) : undefined;
      const colorIndex = group ? Math.max(0, groups.indexOf(group)) : index;
      const label = `${datum?.label || `Bubble ${index + 1}`}: ${fmt(point.x, options)}, ${fmt(point.y, options)}, size ${fmt(size, options)}`;
      return `<circle ${markAttrs(label, options, { index, value: point.y, series: group })} cx="${round(x(point.x))}" cy="${round(y(point.y))}" r="${round(radius(size))}" style="fill:${palette[colorIndex % palette.length]};opacity:0.72"><title>${esc(label)}</title></circle>`;
    })
    .join('');
  return `${svgWrap(
    'bubble',
    width,
    height,
    `${axisAndGrid(width, height, plot, yDomain, options)}${verticalValueGrid(width, height, plot, xDomain, options)}${marks}`,
    normalized,
    options,
  )}${legend(groups, options)}`;
}

interface OhlcDatum {
  datum: ChartDatum;
  index: number;
  label: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

function ohlcData(data: ChartDatum[]): OhlcDatum[] {
  return data
    .map((datum, index) => {
      const open = Number(datum.open);
      const high = Number(datum.high);
      const low = Number(datum.low);
      const close = Number(datum.close);
      if (![open, high, low, close].every(Number.isFinite)) return null;
      return {
        datum,
        index,
        label: String(datum.label ?? datum.date ?? index + 1),
        open,
        high: Math.max(high, open, close, low),
        low: Math.min(low, open, close, high),
        close,
      };
    })
    .filter((item): item is OhlcDatum => Boolean(item));
}

function renderOhlcLike(
  data: ChartDatum[],
  options: ChartOptions,
  type: 'candlestick' | 'ohlc',
): string {
  const width = options.width ?? 420;
  const height = options.height ?? 220;
  const plot = margins(options);
  const rows = ohlcData(data);
  if (!rows.length)
    return `<div class="uif-chart-state" data-uif-state="empty">${esc(options.description || 'No OHLC data')}</div>`;
  const domain = extent(
    rows.flatMap((row) => [row.low, row.high]),
    options,
  );
  const y = scaleLinear(domain, [height - plot.bottom, plot.top]);
  const band = (width - plot.left - plot.right) / Math.max(1, rows.length);
  const marks = rows
    .map((row) => {
      const cx = plot.left + row.index * band + band / 2;
      const bodyWidth = Math.max(4, band * 0.52);
      const up = row.close >= row.open;
      const color = up
        ? 'var(--uif-chart-2,var(--uif-color-success))'
        : 'var(--uif-chart-4,var(--uif-color-danger))';
      const highY = y(row.high);
      const lowY = y(row.low);
      const openY = y(row.open);
      const closeY = y(row.close);
      const label = `${row.label}: O ${fmt(row.open, options)}, H ${fmt(row.high, options)}, L ${fmt(row.low, options)}, C ${fmt(row.close, options)}`;
      const wick = `<line class="uif-chart-reference" x1="${round(cx)}" y1="${round(highY)}" x2="${round(cx)}" y2="${round(lowY)}"></line>`;
      if (type === 'ohlc') {
        return `<g ${markAttrs(label, options, { index: row.index, value: row.close }).replace('class="uif-chart-mark"', 'class="uif-chart-mark uif-chart-ohlc"')}><title>${esc(label)}</title>${wick}<line class="uif-chart-series" x1="${round(cx - bodyWidth / 2)}" y1="${round(openY)}" x2="${round(cx)}" y2="${round(openY)}" style="stroke:${color}"></line><line class="uif-chart-series" x1="${round(cx)}" y1="${round(closeY)}" x2="${round(cx + bodyWidth / 2)}" y2="${round(closeY)}" style="stroke:${color}"></line></g>`;
      }
      const yTop = Math.min(openY, closeY);
      const bodyHeight = Math.max(1, Math.abs(closeY - openY));
      return `<g>${wick}<rect ${markAttrs(label, options, { index: row.index, value: row.close })} x="${round(cx - bodyWidth / 2)}" y="${round(yTop)}" width="${round(bodyWidth)}" height="${round(bodyHeight)}" rx="2" style="fill:${color};opacity:${up ? '0.72' : '0.9'}"><title>${esc(label)}</title></rect></g>`;
    })
    .join('');
  const labels =
    options.axes === false
      ? ''
      : rows
          .map(
            (row) =>
              `<text class="uif-chart-axis-label" x="${round(plot.left + row.index * band + band / 2)}" y="${height - 8}" text-anchor="middle">${esc(row.label)}</text>`,
          )
          .join('');
  return svgWrap(
    type,
    width,
    height,
    `${axisAndGrid(width, height, plot, domain, options)}${marks}${labels}`,
    rows.map((row) => row.datum),
    {
      ...options,
      description:
        options.description || `${type.toUpperCase()} chart with open, high, low, and close values`,
    },
  );
}

function renderFunnel(data: ChartDatum[], options: ChartOptions): string {
  const width = options.width ?? 340;
  const height = options.height ?? 240;
  const normalized = normalizeData(data, options).filter((datum) => (datum.value ?? 0) >= 0);
  if (!normalized.length)
    return `<div class="uif-chart-state" data-uif-state="empty">${esc(options.description || 'No funnel data')}</div>`;
  const palette = paletteFor(options);
  const max = Math.max(1, ...normalized.map((datum) => datum.value ?? 0));
  const gap = 3;
  const top = 12;
  const segmentHeight = (height - top * 2 - gap * (normalized.length - 1)) / normalized.length;
  const minWidth = width * 0.16;
  const segmentWidth = (value: number) => Math.max(minWidth, (value / max) * (width - 24));
  const segments = normalized
    .map((datum, index) => {
      const current = segmentWidth(datum.value ?? 0);
      const next = segmentWidth(normalized[index + 1]?.value ?? datum.value ?? 0);
      const y = top + index * (segmentHeight + gap);
      const x0 = (width - current) / 2;
      const x1 = x0 + current;
      const nx0 = (width - next) / 2;
      const nx1 = nx0 + next;
      const points = `${round(x0)},${round(y)} ${round(x1)},${round(y)} ${round(nx1)},${round(y + segmentHeight)} ${round(nx0)},${round(y + segmentHeight)}`;
      const label = `${datum.label ?? `Stage ${index + 1}`}: ${fmt(datum.value ?? 0, options)}`;
      const textY = y + segmentHeight / 2 + 4;
      return `<polygon ${markAttrs(label, options, { index, value: datum.value ?? 0 })} points="${points}" style="fill:${datum.color || palette[index % palette.length]}"><title>${esc(label)}</title></polygon><text class="uif-chart-axis-label" x="${width / 2}" y="${round(textY)}" text-anchor="middle">${esc(datum.label ?? '')} ${esc(fmt(datum.value ?? 0, options))}</text>`;
    })
    .join('');
  return svgWrap('funnel', width, height, segments, normalized, {
    ...options,
    axes: false,
    description: options.description || 'Funnel chart showing stage volume from top to bottom',
  });
}

function waterfallRole(datum: ChartDatum): string {
  return String(datum.role ?? datum.kind ?? '').toLowerCase();
}

function renderWaterfall(data: ChartDatum[], options: ChartOptions): string {
  const width = options.width ?? 420;
  const height = options.height ?? 240;
  const plot = margins(options);
  const normalized = normalizeData(data, options);
  if (!normalized.length)
    return `<div class="uif-chart-state" data-uif-state="empty">${esc(options.description || 'No waterfall data')}</div>`;
  let running = 0;
  const steps = normalized.map((datum, index) => {
    const value = datum.value ?? 0;
    const role = waterfallRole(datum);
    const absolute = role === 'start' || role === 'end' || role === 'total';
    const start = absolute ? 0 : running;
    const end = absolute ? value : running + value;
    running = end;
    return { datum, index, role, start, end, delta: absolute ? value : value };
  });
  const values = steps.flatMap((step) => [step.start, step.end]);
  const domain = extent(values, options);
  const y = scaleLinear(domain, [height - plot.bottom, plot.top]);
  const band = (width - plot.left - plot.right) / Math.max(1, steps.length);
  const zeroY = y(0);
  const bars = steps
    .map((step) => {
      const x = plot.left + step.index * band + band * 0.18;
      const y0 = y(step.start);
      const y1 = y(step.end);
      const value = step.end - step.start;
      const h = Math.abs(y1 - y0);
      const positive = step.end >= step.start;
      const total = step.role === 'start' || step.role === 'end' || step.role === 'total';
      const color = total
        ? 'var(--uif-chart-2,var(--uif-color-info))'
        : positive
          ? 'var(--uif-chart-1,var(--uif-color-success))'
          : 'var(--uif-chart-4,var(--uif-color-danger))';
      const label = `${step.datum.label ?? `Step ${step.index + 1}`}: ${fmt(step.delta, options)}`;
      return `<rect ${markAttrs(label, options, { index: step.index, value: step.delta })} x="${round(x)}" y="${round(Math.min(y0, y1))}" width="${round(band * 0.64)}" height="${round(h)}" rx="3" style="fill:${step.datum.color || color}"><title>${esc(label)}</title></rect>`;
    })
    .join('');
  const connectors = steps
    .slice(0, -1)
    .map((step) => {
      const x1 = plot.left + step.index * band + band * 0.82;
      const x2 = plot.left + (step.index + 1) * band + band * 0.18;
      const yy = round(y(step.end));
      return `<line class="uif-chart-reference" x1="${round(x1)}" y1="${yy}" x2="${round(x2)}" y2="${yy}"></line>`;
    })
    .join('');
  const labels =
    options.axes === false
      ? ''
      : steps
          .map(
            (step) =>
              `<text class="uif-chart-axis-label" x="${round(plot.left + step.index * band + band / 2)}" y="${height - 8}" text-anchor="middle">${esc(step.datum.label ?? '')}</text>`,
          )
          .join('');
  const zeroLine = `<line class="uif-chart-reference" x1="${plot.left}" y1="${round(zeroY)}" x2="${width - plot.right}" y2="${round(zeroY)}"></line>`;
  return svgWrap(
    'waterfall',
    width,
    height,
    `${axisAndGrid(width, height, plot, domain, options)}${zeroLine}${connectors}${bars}${labels}`,
    normalized,
    {
      ...options,
      description: options.description || 'Waterfall chart showing cumulative changes',
    },
  );
}

function renderControlChart(data: ChartDatum[], options: ChartOptions): string {
  const normalized = normalizeData(data, options);
  const stats = summaryStats(normalized.map((d) => d.value ?? 0));
  if (!stats.count)
    return `<div class="uif-chart-state" data-uif-state="empty">${esc(options.description || 'No data')}</div>`;
  const width = options.width ?? 360;
  const height = options.height ?? 200;
  const plot = margins(options);
  const sigma = stats.stddev || 1;
  const min = Math.min(stats.min, stats.mean - sigma * 3);
  const max = Math.max(stats.max, stats.mean + sigma * 3);
  const domain = extent([min, max], options);
  const referenceLines = [stats.mean, stats.mean + sigma * 3, stats.mean - sigma * 3];
  const y = scaleLinear(domain, [height - plot.bottom, plot.top]);
  const xStep =
    normalized.length > 1 ? (width - plot.left - plot.right) / (normalized.length - 1) : 0;
  const points = normalized.map(
    (d, i) => [plot.left + i * xStep, y(d.value ?? 0)] as [number, number],
  );
  const line = `<polyline class="uif-chart-series uif-chart-line" data-uif-series="value" points="${pointString(points)}" fill="none"></polyline>`;
  const marks = points
    .map(([cx, cy], i) => {
      const value = normalized[i].value ?? 0;
      const label = `${normalized[i].label ?? ''}: ${fmt(value, options)}`;
      return `<circle ${markAttrs(label, options, { index: i, value })} cx="${round(cx)}" cy="${round(cy)}" r="3"><title>${esc(label)}</title></circle>`;
    })
    .join('');
  const refs = referenceLines
    .map((value, index) => {
      const yy = round(y(value));
      return `<line class="uif-chart-reference ${index === 0 ? 'uif-chart-mean' : ''}" x1="${plot.left}" y1="${yy}" x2="${width - plot.right}" y2="${yy}"><title>${index === 0 ? 'Mean' : 'Control limit'} ${esc(fmt(value, options))}</title></line>`;
    })
    .join('');
  const body = `${axisAndGrid(width, height, plot, domain, options)}${refs}${line}${marks}`;
  return svgWrap('control-chart', width, height, body, normalized, {
    ...options,
    description: options.description || 'Control chart with mean and three sigma limits',
  });
}

function renderPareto(data: ChartDatum[], options: ChartOptions): string {
  const sorted = normalizeData(data, options).sort((a, b) => (b.value ?? 0) - (a.value ?? 0));
  const total = sorted.reduce((sum, item) => sum + Math.max(0, item.value ?? 0), 0) || 1;
  let running = 0;
  const cumulative = sorted.map((item) => {
    running += Math.max(0, item.value ?? 0);
    return { ...item, values: { Count: item.value ?? 0, Cumulative: (running / total) * 100 } };
  });
  return `${renderBars(cumulative, { ...options, type: 'bar', series: [], y: undefined }, 'bar')}${renderLineLike(
    cumulative.map((item) => ({ label: item.label, value: Number(item.values?.Cumulative ?? 0) })),
    { ...options, label: options.label || 'Cumulative percent', min: 0, max: 100 },
  )}`;
}

export function renderChart(data: Array<ChartDatum | number>, options: ChartOptions = {}): string {
  const type = options.type ?? 'bar';
  const normalized = normalizeData(coerceData(data), options);
  if (!normalized.length)
    return `<div class="uif-chart-state" data-uif-state="empty">${esc(options.description || 'No data')}</div>`;
  if (type === 'metric') return renderMetric(normalized, options);
  if (type === 'line') return renderLineLike(normalized, options);
  if (type === 'area') return renderLineLike(normalized, options, true);
  if (type === 'horizontal-bar') return renderBars(normalized, options, 'horizontal-bar');
  if (type === 'grouped-bar') return renderBars(normalized, options, 'grouped-bar');
  if (type === 'stacked-bar') return renderBars(normalized, options, 'stacked-bar');
  if (type === 'pie') return renderPie(normalized, options);
  if (type === 'donut' || type === 'doughnut') return renderPie(normalized, options, true);
  if (type === 'radar') return renderRadar(normalized, options);
  if (type === 'rose' || type === 'polar-area') return renderPolarArea(normalized, options, type);
  if (type === 'sparkline') return renderSparkline(normalized, options);
  if (type === 'progress' || type === 'ring' || type === 'gauge')
    return renderRing(normalized, options, type);
  if (type === 'bullet') return renderBullet(normalized, options);
  if (type === 'heatmap' || type === 'status-heatmap') return renderHeatmap(normalized, options);
  if (type === 'calendar-heatmap') return renderCalendarHeatmap(normalized, options);
  if (type === 'treemap') return renderTreemap(normalized, options);
  if (type === 'timeline') return renderBars(normalized, { ...options, axes: false }, 'bar');
  if (type === 'histogram') return renderHistogram(normalized, options);
  if (type === 'box-plot') return renderBoxPlot(normalized, options);
  if (type === 'scatter') return renderScatter(normalized, options);
  if (type === 'regression') return renderScatter(normalized, options, true);
  if (type === 'control-chart') return renderControlChart(normalized, options);
  if (type === 'distribution') return renderHistogram(normalized, options, true);
  if (type === 'pareto') return renderPareto(normalized, options);
  if (type === 'funnel') return renderFunnel(normalized, options);
  if (type === 'waterfall') return renderWaterfall(normalized, options);
  if (type === 'bubble') return renderBubble(normalized, options);
  if (type === 'candlestick' || type === 'ohlc')
    return renderOhlcLike(coerceData(data), options, type);
  return renderBars(normalized, options, 'bar');
}

export function parseChartData(el: HTMLElement): ChartDatum[] {
  if (el.dataset.uifChartFormat === 'flint') return adaptFlintChart(flintInputFromElement(el)).data;
  const raw = el.dataset.uifData;
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed)) return coerceData(parsed as Array<ChartDatum | number>);
    if (
      parsed &&
      typeof parsed === 'object' &&
      Array.isArray((parsed as { data?: unknown[] }).data)
    )
      return coerceData((parsed as { data: Array<ChartDatum | number> }).data);
    if (
      parsed &&
      typeof parsed === 'object' &&
      Array.isArray((parsed as { rows?: unknown[] }).rows)
    )
      return coerceData((parsed as { rows: Array<ChartDatum | number> }).rows);
    return [];
  } catch {
    return [];
  }
}

function parseJsonValue(raw: string | undefined): unknown {
  if (!raw) return undefined;
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return undefined;
  }
}

function flintInputFromElement(el: HTMLElement, loaded?: unknown): FlintChartInput {
  const rawData = loaded ?? parseJsonValue(el.dataset.uifData);
  const dataIsInput =
    rawData && typeof rawData === 'object' && !Array.isArray(rawData) && 'chart_spec' in rawData;
  if (dataIsInput) return rawData as FlintChartInput;
  return {
    data: Array.isArray(rawData)
      ? (rawData as Array<Record<string, unknown>>)
      : rawData && typeof rawData === 'object'
        ? (rawData as FlintChartInput['data'])
        : [],
    semantic_types: parseJsonValue(el.dataset.uifSemantics) as Record<string, string> | undefined,
    chart_spec: parseJsonValue(el.dataset.uifChartSpec) as FlintChartSpec | undefined,
  };
}

export function adaptTable(
  table: HTMLTableElement,
  options: TableAdapterOptions = {},
): ChartDatum[] {
  const headers = Array.from(table.tHead?.rows[0]?.cells ?? []).map(
    (cell) => cell.textContent?.trim() ?? '',
  );
  const columnIndex = (column: number | string | undefined, fallback: number) =>
    typeof column === 'number'
      ? column
      : typeof column === 'string'
        ? Math.max(0, headers.indexOf(column))
        : fallback;
  const labelColumn = columnIndex(options.labelColumn, 0);
  const valueColumn = columnIndex(options.valueColumn, 1);
  const seriesColumns = options.seriesColumns ?? [];
  return Array.from(table.tBodies[0]?.rows ?? []).map((row) => {
    const label = row.cells[labelColumn]?.textContent?.trim() ?? '';
    if (seriesColumns.length) {
      const values = Object.fromEntries(
        seriesColumns.map((column) => {
          const index = columnIndex(column, 1);
          return [
            headers[index] || `Series ${index}`,
            Number(row.cells[index]?.textContent?.replace(/[^0-9.-]/g, '') || 0),
          ];
        }),
      );
      return { label, values };
    }
    return {
      label,
      value: Number(row.cells[valueColumn]?.textContent?.replace(/[^0-9.-]/g, '') || 0),
    };
  });
}

export function adaptRecords(
  records: Array<Record<string, unknown>>,
  mapping: RecordAdapterOptions = {},
): ChartDatum[] {
  const labelKey = mapping.label ?? mapping.x ?? 'label';
  const valueKey = mapping.value ?? mapping.y ?? 'value';
  return records.map((record, index) => {
    const values = mapping.series?.length
      ? Object.fromEntries(mapping.series.map((key) => [key, Number(record[key]) || 0]))
      : undefined;
    return {
      ...record,
      label: String(record[labelKey] ?? index + 1),
      value: values ? undefined : Number(record[valueKey]) || 0,
      values,
    };
  });
}

async function loadChartData(el: HTMLElement): Promise<ChartDatum[]> {
  if (el.dataset.uifTable) {
    const table = document.querySelector<HTMLTableElement>(el.dataset.uifTable);
    if (table) return adaptTable(table);
  }
  if (el.dataset.uifSrc) {
    if (!isSafeURL(el.dataset.uifSrc, { context: 'network', allowHash: false, sameOrigin: el.dataset.uifAllowCrossOrigin !== 'true' })) throw new Error('Batoi UIF blocked an unsafe chart data URL');
    const response = await request<ChartDatum[] | { data?: ChartDatum[]; rows?: ChartDatum[] }>(
      el.dataset.uifSrc,
      { method: 'GET' },
    );
    if (Array.isArray(response)) return response;
    return response.data ?? response.rows ?? [];
  }
  return Promise.resolve(parseChartData(el));
}

async function loadFlintChart(el: HTMLElement): Promise<FlintChartAdapterResult> {
  if (el.dataset.uifSrc) {
    if (!isSafeURL(el.dataset.uifSrc, { context: 'network', allowHash: false, sameOrigin: el.dataset.uifAllowCrossOrigin !== 'true' })) throw new Error('Batoi UIF blocked an unsafe chart data URL');
    const response = await request<unknown>(el.dataset.uifSrc, { method: 'GET' });
    return adaptFlintChart(flintInputFromElement(el, response), optionsFromElement(el, false));
  }
  return adaptFlintChart(flintInputFromElement(el), optionsFromElement(el, false));
}

function optionsFromElement(el: HTMLElement, defaultType = true): ChartOptions {
  let parsed: ChartOptions = {};
  try {
    parsed = JSON.parse(el.dataset.uifOptions || '{}') as ChartOptions;
  } catch {
    parsed = {};
  }
  return {
    ...parsed,
    type: (el.dataset.uifChart as ChartType) || parsed.type || (defaultType ? 'bar' : undefined),
    x: el.dataset.uifX || parsed.x,
    y: el.dataset.uifY || parsed.y,
    label: el.dataset.uifLabel || parsed.label,
    id:
      el.dataset.uifId ||
      parsed.id ||
      (el.dataset.uifChartInstanceId ||= `instance-${++chartIdCounter}`),
    palette: (el.dataset.uifPalette as ChartPaletteName | undefined) || parsed.palette,
    table:
      el.dataset.uifChartTable === 'sr-only'
        ? 'sr-only'
        : el.dataset.uifChartTable != null
          ? el.dataset.uifChartTable !== 'false'
          : parsed.table,
    drilldown:
      parsed.drilldown ||
      Boolean(
        el.dataset.uifDrilldown || el.dataset.uifDrilldownTarget || el.dataset.uifDrilldownUrl,
      ),
    series: el.dataset.uifSeries
      ? el.dataset.uifSeries
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean)
      : parsed.series,
  };
}

function responsiveOptions(el: HTMLElement, options: ChartOptions): ChartOptions {
  if (options.responsive === false || options.width) return options;
  const width = Math.round(el.getBoundingClientRect().width || el.clientWidth || 0);
  if (!width) return options;
  return {
    ...options,
    width,
    height: options.height ?? Math.round(width / (options.aspectRatio || 1.8)),
  };
}

function chartDrilldownOptions(el: HTMLElement, options: ChartOptions): DrilldownOptions | null {
  if (
    !options.drilldown &&
    !el.dataset.uifDrilldown &&
    !el.dataset.uifDrilldownTarget &&
    !el.dataset.uifDrilldownUrl
  )
    return null;
  const configured = typeof options.drilldown === 'object' ? options.drilldown : {};
  return {
    ...configured,
    action:
      (el.dataset.uifDrilldown as DrilldownOptions['action']) ||
      configured.action ||
      (el.dataset.uifDrilldownTarget ? 'target' : el.dataset.uifDrilldownUrl ? 'url' : 'event'),
    target: el.dataset.uifDrilldownTarget || configured.target,
    url: el.dataset.uifDrilldownUrl || configured.url,
    param: el.dataset.uifDrilldownParam || configured.param || 'label',
    allowCrossOrigin: el.dataset.uifAllowCrossOrigin === 'true' || configured.allowCrossOrigin,
  };
}

function buildSelectionDetail(
  target: SVGElement,
  data: ChartDatum[],
  options: ChartOptions,
): ChartSelectionDetail {
  const indexRaw = target.getAttribute('data-uif-chart-index');
  const index = indexRaw == null ? undefined : Number(indexRaw);
  const datum =
    index != null && Number.isInteger(index)
      ? data[index]
      : data.find(
          (item) =>
            String(item.label ?? '') &&
            target.getAttribute('data-uif-chart-label')?.startsWith(String(item.label)),
        );
  const valueRaw = target.getAttribute('data-uif-chart-value');
  const value = valueRaw == null ? (datum ? valueOf(datum, options) : undefined) : Number(valueRaw);
  const label =
    target.getAttribute('data-uif-chart-label') ||
    target.getAttribute('aria-label') ||
    String(datum?.label ?? '');
  const series = target.getAttribute('data-uif-series') || undefined;
  const params: Record<string, string> = {
    label,
    type: options.type ?? 'bar',
  };
  if (index != null && Number.isFinite(index)) params.index = String(index);
  if (value != null && Number.isFinite(value)) params.value = String(value);
  if (series) params.series = series;
  if (datum?.label != null) params.datumLabel = String(datum.label);
  return {
    label,
    value: Number.isFinite(value) ? value : undefined,
    index,
    series,
    type: options.type ?? 'bar',
    datum,
    params,
  };
}

function resolveDrilldownUrl(url: string, detail: ChartSelectionDetail, param: string): string {
  const resolved = url.replace(/\{([a-zA-Z0-9_.-]+)\}/g, (_, key: string) =>
    encodeURIComponent(detail.params[key] ?? String(detail.datum?.[key] ?? '')),
  );
  const parsed = new URL(resolved, window.location.href);
  if (!url.includes('{')) parsed.searchParams.set(param, detail.params[param] ?? detail.label);
  return parsed.toString();
}

async function runDrilldown(
  el: HTMLElement,
  detail: ChartSelectionDetail,
  options: DrilldownOptions,
): Promise<void> {
  el.dispatchEvent(
    new CustomEvent('uif:chart-drilldown', {
      detail: { ...detail, drilldown: options },
      bubbles: true,
    }),
  );
  if (options.action === 'event') return;
  if (options.action === 'route' || (options.action === 'url' && !options.target)) {
    if (options.url) {
      const url = resolveDrilldownUrl(options.url, detail, options.param || 'label');
      if (!isSafeURL(url, { context: 'navigation', sameOrigin: !options.allowCrossOrigin })) {
        el.dispatchEvent(new CustomEvent('uif:chart-drilldown-error', { detail: { error: new Error('Batoi UIF blocked an unsafe chart drilldown URL'), selection: detail, drilldown: options }, bubbles: true }));
        return;
      }
      window.location.assign(url);
    }
    return;
  }
  if (!options.target || !options.url) return;
  const target = safeQuerySelector<HTMLElement>(options.target);
  if (!target) return;
  target.dataset.uifState = 'loading';
  try {
    const url = resolveDrilldownUrl(options.url, detail, options.param || 'label');
    if (!isSafeURL(url, { context: 'network', allowHash: false, sameOrigin: !options.allowCrossOrigin })) throw new Error('Batoi UIF blocked an unsafe chart drilldown URL');
    const html = await request<string>(
      url,
      { method: 'GET', parseAs: 'text' },
    );
    setTrustedHTML(target, html, { trusted: true, context: 'chart drilldown' });
    target.dataset.uifState = 'loaded';
  } catch (error) {
    target.dataset.uifState = 'error';
    el.dispatchEvent(
      new CustomEvent('uif:chart-drilldown-error', {
        detail: { error, selection: detail, drilldown: options },
        bubbles: true,
      }),
    );
  }
}

export function initChart(el: HTMLElement): ChartController {
  controllers.get(el)?.destroy();
  let options = optionsFromElement(el);
  let data: ChartDatum[] = [];
  let timer: number | undefined;
  let resizeTimer: number | undefined;

  const refresh = async () => {
    el.dataset.uifState = 'loading';
    try {
      if (el.dataset.uifChartFormat === 'flint') {
        const adapted = await loadFlintChart(el);
        data = adapted.data;
        options = adapted.options;
        if (adapted.warnings.length) el.dataset.uifChartWarnings = adapted.warnings.join(' | ');
        else delete el.dataset.uifChartWarnings;
      } else {
        data = await loadChartData(el);
        options = optionsFromElement(el);
      }
      setTrustedHTML(el, renderChart(data, responsiveOptions(el, options)), { trusted: true, context: 'chart render' });
      el.dataset.uifState = data.length ? 'refreshed' : 'empty';
      el.dispatchEvent(
        new CustomEvent('uif:chart-refresh', { detail: { data, options }, bubbles: true }),
      );
    } catch (error) {
      el.dataset.uifState = 'error';
      setTrustedHTML(el, `<div class="uif-chart-state" data-uif-state="error">${esc(el.dataset.uifError || 'Unable to load chart')}</div>`, { trusted: true, context: 'chart error' });
      el.dispatchEvent(new CustomEvent('uif:chart-error', { detail: { error }, bubbles: true }));
      throw error;
    }
  };

  const resize =
    typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(() => {
          if (resizeTimer) window.clearTimeout(resizeTimer);
          resizeTimer = window.setTimeout(() => {
            setTrustedHTML(el, renderChart(data, responsiveOptions(el, options)), { trusted: true, context: 'chart resize' });
          }, 80);
        })
      : null;
  resize?.observe(el);
  if (el.dataset.uifRefresh === 'interval' || el.dataset.uifInterval)
    timer = window.setInterval(() => void refresh(), Number(el.dataset.uifInterval || 30000));

  const select = (event: Event) => {
    const target =
      event.target instanceof Element ? event.target.closest<SVGElement>('.uif-chart-mark') : null;
    if (!target) return;
    if (event instanceof KeyboardEvent && !['Enter', ' '].includes(event.key)) return;
    if (event instanceof KeyboardEvent) event.preventDefault();
    const detail = buildSelectionDetail(target, data, options);
    el.dispatchEvent(
      new CustomEvent('uif:chart-select', {
        detail,
        bubbles: true,
      }),
    );
    const drilldown = chartDrilldownOptions(el, options);
    if (drilldown) void runDrilldown(el, detail, drilldown);
  };

  const announceMark = (event: Event) => {
    const target =
      event.target instanceof Element ? event.target.closest<SVGElement>('.uif-chart-mark') : null;
    if (!target) return;
    const name = event.type === 'focusin' ? 'uif:chart-focus' : 'uif:chart-hover';
    el.dispatchEvent(
      new CustomEvent(name, { detail: buildSelectionDetail(target, data, options), bubbles: true }),
    );
  };

  el.addEventListener('click', select);
  el.addEventListener('keydown', select);
  el.addEventListener('focusin', announceMark);
  el.addEventListener('mouseover', announceMark);

  const controller = {
    refresh,
    destroy() {
      resize?.disconnect();
      if (timer) window.clearInterval(timer);
      if (resizeTimer) window.clearTimeout(resizeTimer);
      el.removeEventListener('click', select);
      el.removeEventListener('keydown', select);
      el.removeEventListener('focusin', announceMark);
      el.removeEventListener('mouseover', announceMark);
      controllers.delete(el);
    },
  };
  controllers.set(el, controller);
  void refresh().catch(() => undefined);
  return controller;
}

export function refreshChart(el: HTMLElement): Promise<void> {
  return controllers.get(el)?.refresh() ?? Promise.resolve();
}

export function destroyChart(el: HTMLElement): void {
  controllers.get(el)?.destroy();
}

function csvCell(value: unknown): string {
  return JSON.stringify(value ?? '');
}

function chartSvgFrom(target: SVGSVGElement | HTMLElement): SVGSVGElement | null {
  return target instanceof SVGSVGElement ? target : target.querySelector<SVGSVGElement>('svg');
}

function svgSize(svg: SVGSVGElement): { width: number; height: number } {
  const viewBox = svg.getAttribute('viewBox')?.split(/\s+/).map(Number) ?? [];
  const rect = svg.getBoundingClientRect();
  return {
    width: Number(svg.getAttribute('width')) || viewBox[2] || rect.width || 360,
    height: Number(svg.getAttribute('height')) || viewBox[3] || rect.height || 220,
  };
}

function inlineSvgStyles(svg: SVGSVGElement): SVGSVGElement {
  const clone = svg.cloneNode(true) as SVGSVGElement;
  const sourceElements = [svg, ...Array.from(svg.querySelectorAll<SVGElement>('*'))];
  const cloneElements = [clone, ...Array.from(clone.querySelectorAll<SVGElement>('*'))];
  sourceElements.forEach((source, index) => {
    const target = cloneElements[index];
    if (!target || typeof window === 'undefined' || !window.getComputedStyle) return;
    const style = window.getComputedStyle(source);
    const properties = [
      'fill',
      'stroke',
      'stroke-width',
      'stroke-dasharray',
      'opacity',
      'font-family',
      'font-size',
      'font-weight',
      'text-anchor',
    ];
    const inline = properties
      .map((property) => `${property}:${style.getPropertyValue(property)}`)
      .join(';');
    target.setAttribute('style', `${target.getAttribute('style') || ''};${inline}`);
  });
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  if (!clone.getAttribute('width')) {
    const { width } = svgSize(svg);
    clone.setAttribute('width', String(Math.round(width)));
  }
  if (!clone.getAttribute('height')) {
    const { height } = svgSize(svg);
    clone.setAttribute('height', String(Math.round(height)));
  }
  return clone;
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function exportChartSvg(target: SVGSVGElement | HTMLElement): string {
  const svg = chartSvgFrom(target);
  if (!svg) return '';
  const serialized = new XMLSerializer().serializeToString(inlineSvgStyles(svg));
  return serialized.startsWith('<?xml')
    ? serialized
    : `<?xml version="1.0" encoding="UTF-8"?>\n${serialized}`;
}

export function downloadChartSvg(
  target: SVGSVGElement | HTMLElement,
  filename = 'chart.svg',
): void {
  const svg = exportChartSvg(target);
  if (!svg) return;
  downloadBlob(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }), filename);
}

export async function exportChartPng(
  target: SVGSVGElement | HTMLElement,
  options: ChartExportOptions = {},
): Promise<Blob> {
  const svg = chartSvgFrom(target);
  if (!svg) throw new Error('No chart SVG found');
  const source = exportChartSvg(svg);
  const size = svgSize(svg);
  const width = options.width ?? size.width;
  const height = options.height ?? size.height;
  const scale = options.scale ?? 2;
  const image = new Image();
  const svgUrl = URL.createObjectURL(new Blob([source], { type: 'image/svg+xml;charset=utf-8' }));
  try {
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error('Unable to render chart SVG'));
      image.src = svgUrl;
    });
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(width * scale));
    canvas.height = Math.max(1, Math.round(height * scale));
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas is not available');
    if (options.background) {
      context.fillStyle = options.background;
      context.fillRect(0, 0, canvas.width, canvas.height);
    }
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('Unable to export chart PNG'))),
        'image/png',
      );
    });
  } finally {
    URL.revokeObjectURL(svgUrl);
  }
}

export async function downloadChartPng(
  target: SVGSVGElement | HTMLElement,
  filename = 'chart.png',
  options: ChartExportOptions = {},
): Promise<void> {
  downloadBlob(await exportChartPng(target, options), filename);
}

export function bindChartExports(root: Document | HTMLElement = document): () => void {
  exportBindings.get(root)?.();
  const onClick = (event: Event) => {
    const button =
      event.target instanceof Element
        ? event.target.closest<HTMLElement>('[data-uif-chart-export]')
        : null;
    if (!button) return;
    const format = button.dataset.uifChartExport || 'svg';
    const targetSelector = button.dataset.uifChartTarget || button.getAttribute('aria-controls');
    const target = targetSelector
      ? root.querySelector<HTMLElement>(targetSelector)
      : button
          .closest<HTMLElement>('[data-uif-chart-host], .uif-card, article')
          ?.querySelector<HTMLElement>('[data-uif="chart"]');
    if (!target) return;
    const filename = button.dataset.uifFilename || `chart.${format}`;
    if (format === 'svg')
      downloadChartSvg(target, filename.endsWith('.svg') ? filename : `${filename}.svg`);
    if (format === 'png')
      void downloadChartPng(target, filename.endsWith('.png') ? filename : `${filename}.png`, {
        background: button.dataset.uifBackground || undefined,
      });
    if (format === 'csv') {
      const data = parseChartData(target);
      downloadBlob(
        new Blob([exportChartData(data, 'csv')], { type: 'text/csv;charset=utf-8' }),
        filename.endsWith('.csv') ? filename : `${filename}.csv`,
      );
    }
    button.dispatchEvent(
      new CustomEvent('uif:chart-export', { detail: { format, target }, bubbles: true }),
    );
  };
  root.addEventListener('click', onClick);
  const dispose = () => {
    root.removeEventListener('click', onClick);
    exportBindings.delete(root);
  };
  exportBindings.set(root, dispose);
  return dispose;
}

export function exportChartData(
  data: ChartDatum[],
  format: 'json' | 'csv' | 'tsv' = 'json',
): string {
  if (format === 'csv' || format === 'tsv') {
    const delimiter = format === 'tsv' ? '\t' : ',';
    const series = [...new Set(data.flatMap((d) => Object.keys(d.values ?? {})))];
    const extra = [
      ...new Set(
        data.flatMap((d) =>
          Object.keys(d).filter(
            (key) => !['label', 'value', 'values'].includes(key) && typeof d[key] !== 'object',
          ),
        ),
      ),
    ];
    const headers = ['label', 'value', ...series, ...extra];
    const rows = data.map((d) =>
      headers
        .map((key) => {
          const value = key in (d.values ?? {}) ? d.values?.[key] : d[key];
          return format === 'tsv' ? String(value ?? '').replace(/\t/g, ' ') : csvCell(value);
        })
        .join(delimiter),
    );
    return [headers.join(delimiter), ...rows].join('\n');
  }
  return JSON.stringify(data);
}

export const chart = {
  name: 'chart',
  init: (el: HTMLElement) => {
    initChart(el);
  },
  destroy: destroyChart,
};
