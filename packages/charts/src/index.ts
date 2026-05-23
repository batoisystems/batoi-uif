import { request } from '@batoi/uif-net';

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
  | 'bullet';

export interface ChartDatum {
  label?: string;
  value?: number;
  values?: Record<string, number>;
  target?: number;
  min?: number;
  max?: number;
  group?: string;
  color?: string;
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
  focusable?: boolean;
  palette?: string[];
  formatValue?: (value: number) => string;
  min?: number;
  max?: number;
  stacked?: boolean;
  responsive?: boolean;
  exportable?: boolean;
  sparklineType?: 'line' | 'bar';
}

export interface ChartController {
  refresh(): Promise<void>;
  destroy(): void;
}

export interface TableAdapterOptions {
  labelColumn?: number;
  valueColumn?: number;
  seriesColumns?: number[];
}

const controllers = new WeakMap<HTMLElement, ChartController>();
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

function esc(value: unknown): string {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function uid(options: ChartOptions, type: ChartType): string {
  const seed = `${options.label || type}-${options.width || 0}-${options.height || 0}`.toLowerCase();
  const clean = seed.replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  return `uif-chart-${clean || type}`;
}

function margins(options: ChartOptions): ChartMargin {
  return { top: 16, right: 18, bottom: options.axes === false ? 18 : 34, left: options.axes === false ? 18 : 42, ...options.margin };
}

function valueOf(datum: ChartDatum, options: ChartOptions): number {
  const raw = options.y && datum[options.y] != null ? datum[options.y] : datum.value;
  return Number(raw) || 0;
}

function labelOf(datum: ChartDatum, options: ChartOptions): string {
  const raw = options.x && datum[options.x] != null ? datum[options.x] : datum.label;
  return String(raw ?? '');
}

function normalizeData(data: ChartDatum[], options: ChartOptions): ChartDatum[] {
  return data.map((item) => ({ ...item, label: labelOf(item, options), value: valueOf(item, options) }));
}

function inferSeries(data: ChartDatum[], options: ChartOptions): string[] {
  if (options.series?.length) return options.series;
  const keys = new Set<string>();
  data.forEach((datum) => Object.keys(datum.values ?? {}).forEach((key) => keys.add(key)));
  return [...keys];
}

function fmt(value: number, options: ChartOptions): string {
  return options.formatValue ? options.formatValue(value) : String(Number.isInteger(value) ? value : Number(value.toFixed(2)));
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

function arcPath(cx: number, cy: number, outer: number, start: number, end: number, inner = 0): string {
  const large = end - start > Math.PI ? 1 : 0;
  const [sx, sy] = polar(cx, cy, outer, start);
  const [ex, ey] = polar(cx, cy, outer, end);
  if (inner <= 0) return `M ${cx} ${cy} L ${sx} ${sy} A ${outer} ${outer} 0 ${large} 1 ${ex} ${ey} Z`;
  const [isx, isy] = polar(cx, cy, inner, end);
  const [iex, iey] = polar(cx, cy, inner, start);
  return `M ${sx} ${sy} A ${outer} ${outer} 0 ${large} 1 ${ex} ${ey} L ${isx} ${isy} A ${inner} ${inner} 0 ${large} 0 ${iex} ${iey} Z`;
}

function markAttrs(label: string, options: ChartOptions): string {
  const focus = options.focusable ? ' tabindex="0"' : '';
  const aria = options.focusable ? ` aria-label="${esc(label)}"` : '';
  return `class="uif-chart-mark"${focus}${aria}`;
}

function axisAndGrid(width: number, height: number, plot: ChartMargin, domain: [number, number], options: ChartOptions): string {
  if (options.axes === false && options.grid === false) return '';
  const y = scaleLinear(domain, [height - plot.bottom, plot.top]);
  const ticks = Array.from({ length: 5 }, (_, i) => domain[0] + ((domain[1] - domain[0]) / 4) * i);
  return ticks
    .map((tick) => {
      const yy = y(tick);
      const grid = options.grid === false ? '' : `<line class="uif-chart-grid" x1="${plot.left}" y1="${yy}" x2="${width - plot.right}" y2="${yy}"></line>`;
      const label = options.axes === false ? '' : `<text class="uif-chart-axis-label" x="${plot.left - 8}" y="${yy + 4}" text-anchor="end">${esc(fmt(tick, options))}</text>`;
      return `${grid}${label}`;
    })
    .join('');
}

function svgWrap(type: ChartType, width: number, height: number, content: string, data: ChartDatum[], options: ChartOptions): string {
  const id = uid(options, type);
  const title = options.label || `${type} chart`;
  const desc = options.description || data.map((d) => `${d.label ?? 'item'} ${fmt(valueOf(d, options), options)}`).join(', ');
  return `<svg class="uif-chart-svg uif-chart-${type}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="${id}-title ${id}-desc"><title id="${id}-title">${esc(title)}</title><desc id="${id}-desc">${esc(desc)}</desc>${content}</svg>`;
}

function legend(items: string[], options: ChartOptions): string {
  if (!options.legend || !items.length) return '';
  const palette = options.palette ?? defaultPalette;
  return `<div class="uif-chart-legend" data-uif-placement="${options.legend === true ? 'bottom' : options.legend}">${items
    .map((item, i) => `<span><i style="background:${palette[i % palette.length]}"></i>${esc(item)}</span>`)
    .join('')}</div>`;
}

function renderLineLike(data: ChartDatum[], options: ChartOptions, area = false, sparkline = false): string {
  const width = options.width ?? (sparkline ? 160 : 360);
  const height = options.height ?? (sparkline ? 64 : 200);
  const plot = sparkline ? { top: 6, right: 6, bottom: 6, left: 6 } : margins(options);
  const normalized = normalizeData(data, options);
  const series = inferSeries(normalized, options);
  const palette = options.palette ?? defaultPalette;
  const values = series.length ? normalized.flatMap((d) => series.map((key) => Number(d.values?.[key] ?? 0))) : normalized.map((d) => d.value ?? 0);
  const y = scaleLinear(extent(values, options), [height - plot.bottom, plot.top]);
  const xStep = normalized.length > 1 ? (width - plot.left - plot.right) / (normalized.length - 1) : 0;
  const renderSeries = (name: string | null, index: number) => {
    const points = normalized.map((d, i) => [plot.left + i * xStep, y(name ? Number(d.values?.[name] ?? 0) : d.value ?? 0)] as [number, number]);
    const line = `<polyline class="uif-chart-series uif-chart-line" data-uif-series="${esc(name ?? 'value')}" points="${pointString(points)}" fill="none" style="stroke:${palette[index % palette.length]}"></polyline>`;
    const fill = area ? `<polygon class="uif-chart-area" points="${plot.left},${height - plot.bottom} ${pointString(points)} ${width - plot.right},${height - plot.bottom}" style="fill:${palette[index % palette.length]}"></polygon>` : '';
    const marks =
      sparkline || options.labels === false
        ? ''
        : points
            .map(([cx, cy], i) => {
              const value = name ? Number(normalized[i].values?.[name] ?? 0) : normalized[i].value ?? 0;
              const label = `${name ? `${name} ` : ''}${normalized[i].label ?? ''}: ${fmt(value, options)}`;
              return `<circle ${markAttrs(label, options)} cx="${round(cx)}" cy="${round(cy)}" r="3"><title>${esc(label)}</title></circle>`;
            })
            .join('');
    return `${fill}${line}${marks}`;
  };
  const body = `${sparkline ? '' : axisAndGrid(width, height, plot, extent(values, options), options)}${
    series.length ? series.map(renderSeries).join('') : renderSeries(null, 0)
  }`;
  return `${svgWrap(sparkline ? 'sparkline' : area ? 'area' : 'line', width, height, body, normalized, options)}${legend(series, options)}`;
}

function renderBars(data: ChartDatum[], options: ChartOptions, mode: 'bar' | 'horizontal-bar' | 'grouped-bar' | 'stacked-bar'): string {
  const width = options.width ?? 360;
  const height = options.height ?? 220;
  const plot = margins(options);
  const normalized = normalizeData(data, options);
  const series = inferSeries(normalized, options);
  const palette = options.palette ?? defaultPalette;
  const values =
    series.length && mode === 'stacked-bar'
      ? normalized.map((d) => series.reduce((sum, key) => sum + Math.max(0, Number(d.values?.[key] ?? 0)), 0))
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
        let offset = 0;
        return series
          .map((key, s) => {
            const value = Math.max(0, Number(d.values?.[key] ?? 0));
            const y0 = yScale(offset);
            offset += value;
            const y1 = yScale(offset);
            const x = plot.left + i * band + band * 0.18;
            const w = band * 0.64;
            const h = Math.abs(y1 - y0);
            const label = `${d.label ?? ''} ${key}: ${fmt(value, options)}`;
            return `<rect ${markAttrs(label, options)} data-uif-series="${esc(key)}" x="${round(x)}" y="${round(Math.min(y0, y1))}" width="${round(w)}" height="${round(h)}" rx="3" style="fill:${palette[s % palette.length]}"><title>${esc(label)}</title></rect>`;
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
            return `<rect ${markAttrs(label, options)} data-uif-series="${esc(key)}" x="${round(x)}" y="${round(Math.min(y, zeroY))}" width="${round(inner * 0.86)}" height="${round(Math.abs(zeroY - y))}" rx="3" style="fill:${palette[s % palette.length]}"><title>${esc(label)}</title></rect>`;
          })
          .join('');
      }
      const value = d.value ?? 0;
      const label = `${d.label ?? ''}: ${fmt(value, options)}`;
      if (!vertical) {
        const x = xScale(value);
        const y = plot.top + i * band + band * 0.18;
        return `<rect ${markAttrs(label, options)} x="${round(Math.min(x, zeroX))}" y="${round(y)}" width="${round(Math.abs(x - zeroX))}" height="${round(band * 0.64)}" rx="3"><title>${esc(label)}</title></rect>`;
      }
      const y = yScale(value);
      const x = plot.left + i * band + band * 0.18;
      return `<rect ${markAttrs(label, options)} x="${round(x)}" y="${round(Math.min(y, zeroY))}" width="${round(band * 0.64)}" height="${round(Math.abs(zeroY - y))}" rx="3"><title>${esc(label)}</title></rect>`;
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
  const grid = vertical ? axisAndGrid(width, height, plot, domain, options) : '';
  return `${svgWrap(mode, width, height, `${grid}${bars}${labels}`, normalized, options)}${legend(series, options)}`;
}

function renderPie(data: ChartDatum[], options: ChartOptions, donut = false): string {
  const width = options.width ?? 180;
  const height = options.height ?? 180;
  const normalized = normalizeData(data, options).filter((d) => (d.value ?? 0) > 0);
  const palette = options.palette ?? defaultPalette;
  const total = normalized.reduce((sum, d) => sum + (d.value ?? 0), 0);
  const radius = Math.min(width, height) / 2 - 10;
  const inner = donut ? radius * 0.55 : 0;
  let angle = -Math.PI / 2;
  const paths = normalized
    .map((d, i) => {
      const next = angle + ((d.value ?? 0) / total) * Math.PI * 2;
      const label = `${d.label ?? ''}: ${fmt(d.value ?? 0, options)}`;
      const path = `<path ${markAttrs(label, options)} d="${arcPath(width / 2, height / 2, radius, angle, next, inner)}" style="fill:${d.color || palette[i % palette.length]}"><title>${esc(label)}</title></path>`;
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
  const values = series.length ? normalized.flatMap((d) => series.map((key) => Number(d.values?.[key] ?? 0))) : normalized.map((d) => d.value ?? 0);
  const max = options.max ?? Math.max(1, ...values);
  const min = options.min ?? 0;
  const palette = options.palette ?? defaultPalette;
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
      const pts = normalized.map((_, i) => polar(cx, cy, radius * factor, -Math.PI / 2 + (i / normalized.length) * Math.PI * 2));
      return `<polygon class="uif-chart-grid-polygon" points="${pointString(pts)}"></polygon>`;
    })
    .join('');
  const renderSeries = (name: string | null, index: number) => {
    const pts = normalized.map((d, i) => {
      const value = name ? Number(d.values?.[name] ?? 0) : d.value ?? 0;
      const r = ((value - min) / (max - min || 1)) * radius;
      return polar(cx, cy, r, -Math.PI / 2 + (i / normalized.length) * Math.PI * 2);
    });
    return `<polygon class="uif-chart-radar-area" data-uif-series="${esc(name ?? 'value')}" points="${pointString(pts)}" style="stroke:${palette[index % palette.length]};fill:${palette[index % palette.length]}"></polygon>`;
  };
  return `${svgWrap('radar', width, height, `${rings}${axes}${series.length ? series.map(renderSeries).join('') : renderSeries(null, 0)}`, normalized, options)}${legend(series, options)}`;
}

function renderSparkline(data: ChartDatum[], options: ChartOptions): string {
  if (options.sparklineType === 'bar') return renderBars(data, { ...options, width: options.width ?? 160, height: options.height ?? 56, axes: false, grid: false }, 'bar');
  return renderLineLike(data, { ...options, axes: false, grid: false, labels: false }, false, true);
}

function renderMetric(data: ChartDatum[], options: ChartOptions): string {
  const first = normalizeData(data, options)[0];
  return `<div class="uif-chart-metric" role="img" aria-label="${esc(options.label || first?.label || 'Metric')}: ${esc(fmt(first?.value ?? 0, options))}"><strong>${esc(fmt(first?.value ?? 0, options))}</strong><span>${esc(first?.label ?? options.label ?? 'Metric')}</span></div>`;
}

function renderRing(data: ChartDatum[], options: ChartOptions, type: 'progress' | 'ring' | 'gauge'): string {
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
    return svgWrap('gauge', width, height, `<path class="uif-chart-ring-bg" d="${bg}"></path><path class="uif-chart-value" d="${fg}"></path><text x="${width / 2}" y="${height - 18}" text-anchor="middle">${esc(fmt(value, options))}</text>`, [datum], options);
  }
  const dash = round(pct * 283);
  return svgWrap(type, width, height, `<circle class="uif-chart-ring-bg" cx="${width / 2}" cy="${height / 2}" r="45"></circle><circle class="uif-chart-value" cx="${width / 2}" cy="${height / 2}" r="45" stroke-dasharray="${dash} 283"></circle><text x="${width / 2}" y="${height / 2 + 4}" text-anchor="middle">${esc(fmt(value, options))}</text>`, [datum], options);
}

function renderBullet(data: ChartDatum[], options: ChartOptions): string {
  const width = options.width ?? 320;
  const height = options.height ?? 72;
  const datum = normalizeData(data, options)[0];
  const max = options.max ?? datum?.max ?? 100;
  const x = scaleLinear([0, max], [24, width - 18]);
  const value = datum?.value ?? 0;
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
      return `<rect ${markAttrs(label, options)} x="${round(x)}" y="${round(y)}" width="${round(cell - 3)}" height="${round(cell - 3)}" rx="3" style="opacity:${round(opacity)}"><title>${esc(label)}</title></rect>`;
    })
    .join('');
  return svgWrap('heatmap', width, height, cells, normalized, options);
}

export function renderChart(data: ChartDatum[], options: ChartOptions = {}): string {
  const type = options.type ?? 'bar';
  const normalized = normalizeData(data, options);
  if (!normalized.length) return `<div class="uif-chart-state" data-uif-state="empty">${esc(options.description || 'No data')}</div>`;
  if (type === 'metric') return renderMetric(normalized, options);
  if (type === 'line') return renderLineLike(normalized, options);
  if (type === 'area') return renderLineLike(normalized, options, true);
  if (type === 'horizontal-bar') return renderBars(normalized, options, 'horizontal-bar');
  if (type === 'grouped-bar') return renderBars(normalized, options, 'grouped-bar');
  if (type === 'stacked-bar') return renderBars(normalized, options, 'stacked-bar');
  if (type === 'pie') return renderPie(normalized, options);
  if (type === 'donut' || type === 'doughnut') return renderPie(normalized, options, true);
  if (type === 'radar') return renderRadar(normalized, options);
  if (type === 'sparkline') return renderSparkline(normalized, options);
  if (type === 'progress' || type === 'ring' || type === 'gauge') return renderRing(normalized, options, type);
  if (type === 'bullet') return renderBullet(normalized, options);
  if (type === 'heatmap' || type === 'status-heatmap') return renderHeatmap(normalized, options);
  if (type === 'timeline') return renderBars(normalized, { ...options, axes: false }, 'bar');
  return renderBars(normalized, options, 'bar');
}

export function parseChartData(el: HTMLElement): ChartDatum[] {
  const raw = el.dataset.uifData;
  if (!raw) return [];
  const parsed = JSON.parse(raw) as unknown;
  return Array.isArray(parsed) ? (parsed as ChartDatum[]) : [];
}

export function adaptTable(table: HTMLTableElement, options: TableAdapterOptions = {}): ChartDatum[] {
  const labelColumn = options.labelColumn ?? 0;
  const valueColumn = options.valueColumn ?? 1;
  const seriesColumns = options.seriesColumns ?? [];
  return Array.from(table.tBodies[0]?.rows ?? []).map((row) => {
    const label = row.cells[labelColumn]?.textContent?.trim() ?? '';
    if (seriesColumns.length) {
      const values = Object.fromEntries(
        seriesColumns.map((column) => [table.tHead?.rows[0]?.cells[column]?.textContent?.trim() || `Series ${column}`, Number(row.cells[column]?.textContent?.replace(/[^0-9.-]/g, '') || 0)]),
      );
      return { label, values };
    }
    return { label, value: Number(row.cells[valueColumn]?.textContent?.replace(/[^0-9.-]/g, '') || 0) };
  });
}

async function loadChartData(el: HTMLElement): Promise<ChartDatum[]> {
  if (el.dataset.uifTable) {
    const table = document.querySelector<HTMLTableElement>(el.dataset.uifTable);
    if (table) return adaptTable(table);
  }
  return el.dataset.uifSrc ? request<ChartDatum[]>(el.dataset.uifSrc, { method: 'GET' }) : Promise.resolve(parseChartData(el));
}

function optionsFromElement(el: HTMLElement): ChartOptions {
  const parsed = JSON.parse(el.dataset.uifOptions || '{}') as ChartOptions;
  return {
    ...parsed,
    type: (el.dataset.uifChart as ChartType) || parsed.type || 'bar',
    x: el.dataset.uifX || parsed.x,
    y: el.dataset.uifY || parsed.y,
    label: el.dataset.uifLabel || parsed.label,
    series: el.dataset.uifSeries ? el.dataset.uifSeries.split(',').map((item) => item.trim()).filter(Boolean) : parsed.series,
  };
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
      data = await loadChartData(el);
      options = optionsFromElement(el);
      el.innerHTML = renderChart(data, options);
      el.dataset.uifState = data.length ? 'refreshed' : 'empty';
      el.dispatchEvent(new CustomEvent('uif:chart-refresh', { detail: { data, options }, bubbles: true }));
    } catch (error) {
      el.dataset.uifState = 'error';
      el.innerHTML = `<div class="uif-chart-state" data-uif-state="error">${esc(el.dataset.uifError || 'Unable to load chart')}</div>`;
      el.dispatchEvent(new CustomEvent('uif:chart-error', { detail: { error }, bubbles: true }));
      throw error;
    }
  };

  const resize = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => {
    if (resizeTimer) window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      el.innerHTML = renderChart(data, options);
    }, 80);
  }) : null;
  resize?.observe(el);
  if (el.dataset.uifRefresh === 'interval' || el.dataset.uifInterval) timer = window.setInterval(() => void refresh(), Number(el.dataset.uifInterval || 30000));

  const controller = {
    refresh,
    destroy() {
      resize?.disconnect();
      if (timer) window.clearInterval(timer);
      if (resizeTimer) window.clearTimeout(resizeTimer);
      controllers.delete(el);
    },
  };
  controllers.set(el, controller);
  void refresh();
  return controller;
}

export function refreshChart(el: HTMLElement): Promise<void> {
  return controllers.get(el)?.refresh() ?? Promise.resolve();
}

export function destroyChart(el: HTMLElement): void {
  controllers.get(el)?.destroy();
}

export function exportChartData(data: ChartDatum[], format: 'json' | 'csv' = 'json'): string {
  if (format === 'csv') {
    return ['label,value', ...data.map((d) => `${JSON.stringify(d.label ?? '')},${d.value ?? ''}`)].join('\n');
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
