import type { ChartDatum, ChartOptions, ChartType } from './index.js';

export interface FlintChartEncoding {
  field?: string;
  type?: string;
  aggregate?: string;
  title?: string;
  [key: string]: unknown;
}

export interface FlintChartSpec {
  chartType?: string;
  encodings?: Record<string, FlintChartEncoding | string | undefined>;
  baseSize?: Partial<Pick<ChartOptions, 'width' | 'height'>>;
  canvasSize?: Partial<Pick<ChartOptions, 'width' | 'height'>>;
  title?: string;
  description?: string;
  [key: string]: unknown;
}

export interface FlintChartInput {
  data?:
    | Array<Record<string, unknown>>
    | { values?: Array<Record<string, unknown>>; rows?: Array<Record<string, unknown>> };
  semantic_types?: Record<string, string>;
  chart_spec?: FlintChartSpec;
  [key: string]: unknown;
}

export interface FlintChartAdapterResult {
  data: ChartDatum[];
  options: ChartOptions;
  warnings: string[];
}

function asRows(input: FlintChartInput): Array<Record<string, unknown>> {
  if (Array.isArray(input.data)) return input.data;
  if (input.data && typeof input.data === 'object') {
    if (Array.isArray(input.data.values)) return input.data.values;
    if (Array.isArray(input.data.rows)) return input.data.rows;
  }
  if (Array.isArray(input.values)) return input.values as Array<Record<string, unknown>>;
  if (Array.isArray(input.rows)) return input.rows as Array<Record<string, unknown>>;
  return [];
}

function encodingField(
  encodings: FlintChartSpec['encodings'] = {},
  names: string[],
): string | undefined {
  for (const name of names) {
    const encoding = encodings[name];
    if (typeof encoding === 'string') return encoding;
    if (encoding?.field) return encoding.field;
  }
  return undefined;
}

function firstNumericField(
  rows: Array<Record<string, unknown>>,
  skip: Array<string | undefined> = [],
): string | undefined {
  const skipped = new Set(skip.filter(Boolean));
  const keys = Object.keys(rows[0] ?? {});
  return keys.find(
    (key) => !skipped.has(key) && rows.some((row) => Number.isFinite(Number(row[key]))),
  );
}

function normalizeFlintChartType(type: unknown): string {
  return String(type ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

const flintChartTypeMap: Record<string, ChartType> = {
  area: 'area',
  'area-chart': 'area',
  bar: 'bar',
  'bar-chart': 'bar',
  column: 'bar',
  'column-chart': 'bar',
  donut: 'donut',
  'donut-chart': 'donut',
  doughnut: 'doughnut',
  'doughnut-chart': 'doughnut',
  candlestick: 'candlestick',
  'candlestick-chart': 'candlestick',
  gauge: 'gauge',
  'gauge-chart': 'gauge',
  grouped: 'grouped-bar',
  'grouped-bar': 'grouped-bar',
  'grouped-bar-chart': 'grouped-bar',
  heatmap: 'heatmap',
  'heat-map': 'heatmap',
  histogram: 'histogram',
  funnel: 'funnel',
  'funnel-chart': 'funnel',
  treemap: 'treemap',
  'tree-map': 'treemap',
  'tree-map-chart': 'treemap',
  line: 'line',
  'line-chart': 'line',
  pie: 'pie',
  'pie-chart': 'pie',
  ohlc: 'ohlc',
  'ohlc-chart': 'ohlc',
  radar: 'radar',
  'radar-chart': 'radar',
  rose: 'rose',
  'rose-chart': 'rose',
  'polar-area': 'polar-area',
  'polar-area-chart': 'polar-area',
  scatter: 'scatter',
  'scatter-plot': 'scatter',
  'scatter-chart': 'scatter',
  bubble: 'bubble',
  'bubble-chart': 'bubble',
  'calendar-heatmap': 'calendar-heatmap',
  'calendar-heat-map': 'calendar-heatmap',
  stacked: 'stacked-bar',
  'stacked-bar': 'stacked-bar',
  'stacked-bar-chart': 'stacked-bar',
  waterfall: 'waterfall',
  'waterfall-chart': 'waterfall',
};

function flintChartType(type: unknown): ChartType | undefined {
  return flintChartTypeMap[normalizeFlintChartType(type)];
}

function groupSeriesRows(
  rows: Array<Record<string, unknown>>,
  labelField: string,
  valueField: string,
  seriesField: string,
): ChartDatum[] {
  const grouped = new Map<string, ChartDatum>();
  rows.forEach((row, index) => {
    const label = String(row[labelField] ?? index + 1);
    const series = String(row[seriesField] ?? 'Value');
    const current = grouped.get(label) ?? { label, values: {} };
    current.values = { ...(current.values ?? {}), [series]: Number(row[valueField]) || 0 };
    grouped.set(label, current);
  });
  return [...grouped.values()];
}

export function adaptFlintChart(
  input: FlintChartInput,
  overrides: ChartOptions = {},
): FlintChartAdapterResult {
  const rows = asRows(input);
  const spec = input.chart_spec ?? {};
  const encodings = spec.encodings ?? {};
  const mappedType = flintChartType(spec.chartType);
  const type = overrides.type ?? mappedType ?? 'bar';
  const xField = encodingField(encodings, ['x', 'xAxis', 'category', 'label']);
  const yField = encodingField(encodings, ['y', 'yAxis', 'value', 'theta']);
  const sizeField = encodingField(encodings, ['size', 'z', 'radius']);
  const colorField = encodingField(encodings, ['color', 'series', 'group']);
  const fallbackLabel = xField ?? colorField ?? Object.keys(rows[0] ?? {})[0];
  const fallbackValue = yField ?? firstNumericField(rows, [fallbackLabel, colorField]);
  const warnings: string[] = [];
  const size = spec.canvasSize ?? spec.baseSize ?? {};
  const options: ChartOptions = {
    ...overrides,
    type,
    label: overrides.label ?? spec.title,
    description: overrides.description ?? spec.description,
    width: overrides.width ?? size.width,
    height: overrides.height ?? size.height,
  };

  if (spec.chartType && !mappedType && !overrides.type) {
    warnings.push(
      `Unsupported Flint chart type "${String(spec.chartType)}"; rendered as bar fallback.`,
    );
  }
  if (!rows.length) return { data: [], options, warnings };
  if (!fallbackValue && !['scatter', 'bubble', 'heatmap'].includes(type))
    warnings.push('No numeric Flint value encoding was found; values defaulted to 0.');

  if (
    colorField &&
    fallbackLabel &&
    fallbackValue &&
    ['grouped-bar', 'stacked-bar', 'line', 'area'].includes(type)
  ) {
    return {
      data: groupSeriesRows(rows, fallbackLabel, fallbackValue, colorField),
      options: { ...options, legend: options.legend ?? true },
      warnings,
    };
  }

  const data = rows.map((row, index) => {
    const label = String(row[fallbackLabel ?? ''] ?? row[colorField ?? ''] ?? index + 1);
    const value = fallbackValue ? Number(row[fallbackValue]) || 0 : 0;
    if (type === 'scatter' || type === 'bubble') {
      return {
        ...row,
        label,
        x: Number(row[xField ?? '']) || index + 1,
        y: Number(row[yField ?? fallbackValue ?? '']) || 0,
        value: Number(row[yField ?? fallbackValue ?? '']) || 0,
        size: sizeField ? Number(row[sizeField]) || 0 : undefined,
        group: colorField ? String(row[colorField] ?? '') : undefined,
      };
    }
    if (type === 'heatmap' && xField && yField && colorField) {
      return {
        ...row,
        label: `${row[xField] ?? ''} ${row[yField] ?? ''}`.trim() || label,
        value: Number(row[colorField]) || 0,
      };
    }
    return { ...row, label, value, group: colorField ? String(row[colorField] ?? '') : undefined };
  });

  return { data, options, warnings };
}
