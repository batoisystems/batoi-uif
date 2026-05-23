import { request } from '@batoi/uif-net';

export type ChartType =
  | 'line'
  | 'bar'
  | 'area'
  | 'pie'
  | 'donut'
  | 'sparkline'
  | 'ring'
  | 'progress'
  | 'metric'
  | 'timeline'
  | 'status-heatmap'
  | 'gauge';

export interface ChartDatum {
  label?: string;
  value: number;
  [key: string]: unknown;
}

export interface ChartOptions {
  type?: ChartType;
  width?: number;
  height?: number;
  x?: string;
  y?: string;
  label?: string;
  legend?: boolean;
  exportable?: boolean;
}

interface ChartController {
  refresh(): Promise<void>;
  destroy(): void;
}

const controllers = new WeakMap<HTMLElement, ChartController>();

function parseData(raw: string | null): ChartDatum[] {
  if (!raw) return [];
  const parsed = JSON.parse(raw) as ChartDatum[];
  return Array.isArray(parsed) ? parsed : [];
}

function normalizeData(data: ChartDatum[], options: ChartOptions): ChartDatum[] {
  const y = options.y;
  return data.map((item) => ({ ...item, value: Number(y && item[y] != null ? item[y] : item.value) || 0 }));
}

function summary(data: ChartDatum[], options: ChartOptions): string {
  const label = options.label || `${options.type ?? 'bar'} chart`;
  const values = data.map((d) => `${d.label ?? 'item'} ${d.value}`).join(', ');
  return `${label}: ${values}`;
}

function svg(width: number, height: number, content: string, data: ChartDatum[], options: ChartOptions): string {
  const id = `uif-chart-${Math.random().toString(36).slice(2)}`;
  return `<svg class="uif-chart-svg" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="${id}"><title id="${id}">${summary(
    data,
    options,
  )}</title>${content}</svg>`;
}

function renderBars(data: ChartDatum[], width: number, height: number): string {
  const max = Math.max(1, ...data.map((d) => d.value));
  const gap = 6;
  const barWidth = Math.max(1, (width - gap * (data.length + 1)) / Math.max(1, data.length));
  return data
    .map((d, i) => {
      const h = (d.value / max) * (height - 24);
      const x = gap + i * (barWidth + gap);
      const y = height - h - 16;
      return `<rect x="${x}" y="${y}" width="${barWidth}" height="${h}" rx="3"><title>${d.label ?? ''}: ${d.value}</title></rect>`;
    })
    .join('');
}

function renderLine(data: ChartDatum[], width: number, height: number, fill = false): string {
  const max = Math.max(1, ...data.map((d) => d.value));
  const step = data.length > 1 ? width / (data.length - 1) : width;
  const points = data.map((d, i) => `${i * step},${height - 16 - (d.value / max) * (height - 32)}`).join(' ');
  const area = fill ? `<polygon points="0,${height - 16} ${points} ${width},${height - 16}"></polygon>` : '';
  return `${area}<polyline points="${points}" fill="none"></polyline>`;
}

function renderMetric(data: ChartDatum[]): string {
  const value = data[0]?.value ?? 0;
  return `<div class="uif-chart-metric"><strong>${value}</strong><span>${data[0]?.label ?? 'Metric'}</span></div>`;
}

export function renderChart(data: ChartDatum[], options: ChartOptions = {}): string {
  const type = options.type ?? 'bar';
  const width = options.width ?? 320;
  const height = options.height ?? 180;
  const normalized = normalizeData(data, options);
  if (!normalized.length) return '<div class="uif-chart-state" data-uif-state="empty">No data</div>';
  if (type === 'metric') return renderMetric(normalized);
  const legend = options.legend ? `<div class="uif-chart-legend">${normalized.map((d) => `<span>${d.label ?? ''}</span>`).join('')}</div>` : '';
  if (type === 'line' || type === 'sparkline') return `${svg(width, height, renderLine(normalized, width, height), normalized, options)}${legend}`;
  if (type === 'area') return `${svg(width, height, renderLine(normalized, width, height, true), normalized, options)}${legend}`;
  if (['pie', 'donut', 'ring', 'progress', 'gauge'].includes(type)) {
    const value = normalized[0]?.value ?? 0;
    const max = Math.max(100, value);
    const dash = Math.round((value / max) * 283);
    return svg(
      120,
      120,
      `<circle cx="60" cy="60" r="45"></circle><circle class="uif-chart-value" cx="60" cy="60" r="45" stroke-dasharray="${dash} 283"></circle><text x="60" y="64" text-anchor="middle">${value}</text>`,
      normalized,
      options,
    );
  }
  if (type === 'timeline' || type === 'status-heatmap') return `${svg(width, height, renderBars(normalized, width, height), normalized, options)}${legend}`;
  return `${svg(width, height, renderBars(normalized, width, height), normalized, options)}${legend}`;
}

async function loadChartData(el: HTMLElement): Promise<ChartDatum[]> {
  return el.dataset.uifSrc
    ? request<ChartDatum[]>(el.dataset.uifSrc, { method: 'GET' })
    : Promise.resolve(parseData(el.dataset.uifData || null));
}

export function initChart(el: HTMLElement): ChartController {
  controllers.get(el)?.destroy();
  const options = JSON.parse(el.dataset.uifOptions || '{}') as ChartOptions;
  options.type = (el.dataset.uifChart as ChartType) || options.type || 'bar';
  let data: ChartDatum[] = [];
  let timer: number | undefined;

  const refresh = async () => {
    el.dataset.uifState = 'loading';
    try {
      data = await loadChartData(el);
      el.innerHTML = renderChart(data, options);
      el.dataset.uifState = data.length ? 'loaded' : 'empty';
    } catch (error) {
      el.dataset.uifState = 'error';
      el.innerHTML = '<div class="uif-chart-state" data-uif-state="error">Unable to load chart</div>';
      throw error;
    }
  };

  const resize = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => (el.innerHTML = renderChart(data, options))) : null;
  resize?.observe(el);
  if (el.dataset.uifRefresh === 'interval' || el.dataset.uifInterval) {
    timer = window.setInterval(() => void refresh(), Number(el.dataset.uifInterval || 30000));
  }

  const controller = {
    refresh,
    destroy() {
      resize?.disconnect();
      if (timer) window.clearInterval(timer);
      controllers.delete(el);
    },
  };
  controllers.set(el, controller);
  void refresh();
  return controller;
}

export function exportChartData(data: ChartDatum[]): string {
  return JSON.stringify(data);
}

export const chart = {
  name: 'chart',
  init: (el: HTMLElement) => {
    initChart(el);
  },
  destroy: (el: HTMLElement) => controllers.get(el)?.destroy(),
};
