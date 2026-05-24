// src/index.ts
import { request } from "@batoi/uif-net";
var controllers = /* @__PURE__ */ new WeakMap();
var defaultPalette = [
  "var(--uif-chart-1,var(--uif-color-primary))",
  "var(--uif-chart-2,var(--uif-color-success))",
  "var(--uif-chart-3,var(--uif-color-warning))",
  "var(--uif-chart-4,var(--uif-color-danger))",
  "var(--uif-chart-5,var(--uif-color-info))",
  "var(--uif-chart-6,#7c3aed)",
  "var(--uif-chart-7,#0f766e)",
  "var(--uif-chart-8,#9333ea)"
];
var chartIdCounter = 0;
function esc(value) {
  return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}
function uid(options, type) {
  const seed = `${options.id || options.label || type}-${options.width || 0}-${options.height || 0}`.toLowerCase();
  const clean = seed.replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return `uif-chart-${clean || type}`;
}
function cleanValues(values) {
  return values.map(Number).filter(Number.isFinite);
}
function quantile(values, q) {
  const sorted = cleanValues(values).sort((a, b) => a - b);
  if (!sorted.length) return 0;
  const pos = (sorted.length - 1) * Math.max(0, Math.min(1, q));
  const base = Math.floor(pos);
  const rest = pos - base;
  return sorted[base] + ((sorted[base + 1] ?? sorted[base]) - sorted[base]) * rest;
}
function summaryStats(values) {
  const nums = cleanValues(values);
  const count = nums.length;
  const sum = nums.reduce((total, value) => total + value, 0);
  const mean = count ? sum / count : 0;
  const variance = count ? nums.reduce((total, value) => total + (value - mean) ** 2, 0) / count : 0;
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
    iqr: q3 - q1
  };
}
function movingAverage(values, windowSize) {
  const nums = cleanValues(values);
  const size = Math.max(1, Math.floor(windowSize));
  return nums.map((_, index) => {
    const slice = nums.slice(Math.max(0, index - size + 1), index + 1);
    return slice.reduce((sum, value) => sum + value, 0) / slice.length;
  });
}
function cumulativeSum(values) {
  let total = 0;
  return cleanValues(values).map((value) => {
    total += value;
    return total;
  });
}
function percentChange(values) {
  const nums = cleanValues(values);
  return nums.map((value, index) => {
    const previous = nums[index - 1];
    return index === 0 || !previous ? 0 : (value - previous) / Math.abs(previous) * 100;
  });
}
function zScores(values) {
  const stats = summaryStats(values);
  return cleanValues(values).map((value) => stats.stddev ? (value - stats.mean) / stats.stddev : 0);
}
function histogramBins(values, options = {}) {
  const nums = cleanValues(values);
  if (!nums.length) return [];
  const min = options.min ?? Math.min(...nums);
  const max = options.max ?? Math.max(...nums);
  const binCount = Math.max(1, Math.floor(options.bins ?? Math.ceil(Math.sqrt(nums.length))));
  const span = max - min || 1;
  const bins = Array.from({ length: binCount }, (_, index) => ({
    x0: min + span / binCount * index,
    x1: min + span / binCount * (index + 1),
    count: 0
  }));
  nums.forEach((value) => {
    const index = value === max ? binCount - 1 : Math.floor((value - min) / span * binCount);
    bins[Math.max(0, Math.min(binCount - 1, index))].count += 1;
  });
  return bins;
}
function correlation(pointsOrX, yValues) {
  const points = Array.isArray(yValues) ? pointsOrX.map((x, index) => ({ x, y: yValues[index] })) : pointsOrX;
  const clean = points.filter((point) => Number.isFinite(point.x) && Number.isFinite(point.y));
  if (clean.length < 2) return 0;
  const xMean = clean.reduce((sum, point) => sum + point.x, 0) / clean.length;
  const yMean = clean.reduce((sum, point) => sum + point.y, 0) / clean.length;
  const numerator = clean.reduce((sum, point) => sum + (point.x - xMean) * (point.y - yMean), 0);
  const xDen = Math.sqrt(clean.reduce((sum, point) => sum + (point.x - xMean) ** 2, 0));
  const yDen = Math.sqrt(clean.reduce((sum, point) => sum + (point.y - yMean) ** 2, 0));
  return xDen && yDen ? numerator / (xDen * yDen) : 0;
}
function linearRegression(points) {
  const clean = points.filter((point) => Number.isFinite(point.x) && Number.isFinite(point.y));
  if (clean.length < 2) return { slope: 0, intercept: clean[0]?.y ?? 0, r: 0, r2: 0, predict: (x) => clean[0]?.y ?? x * 0 };
  const xMean = clean.reduce((sum, point) => sum + point.x, 0) / clean.length;
  const yMean = clean.reduce((sum, point) => sum + point.y, 0) / clean.length;
  const numerator = clean.reduce((sum, point) => sum + (point.x - xMean) * (point.y - yMean), 0);
  const denominator = clean.reduce((sum, point) => sum + (point.x - xMean) ** 2, 0);
  const slope = denominator ? numerator / denominator : 0;
  const intercept = yMean - slope * xMean;
  const r = correlation(clean);
  return { slope, intercept, r, r2: r * r, predict: (x) => slope * x + intercept };
}
function margins(options) {
  return { top: 16, right: 18, bottom: options.axes === false ? 18 : 34, left: options.axes === false ? 18 : 42, ...options.margin };
}
function valueOf(datum, options) {
  const raw = options.y && datum[options.y] != null ? datum[options.y] : datum.value;
  return Number(raw) || 0;
}
function labelOf(datum, options) {
  const raw = options.x && datum[options.x] != null ? datum[options.x] : datum.label;
  return String(raw ?? "");
}
function normalizeData(data, options) {
  return data.map((item) => ({ ...item, label: labelOf(item, options), value: valueOf(item, options) }));
}
function coerceData(data) {
  return data.map((item, index) => typeof item === "number" ? { label: String(index + 1), value: item } : item);
}
function inferSeries(data, options) {
  if (options.series?.length) return options.series;
  const keys = /* @__PURE__ */ new Set();
  data.forEach((datum) => Object.keys(datum.values ?? {}).forEach((key) => keys.add(key)));
  return [...keys];
}
function fmt(value, options) {
  return options.formatValue ? options.formatValue(value) : String(Number.isInteger(value) ? value : Number(value.toFixed(2)));
}
function extent(values, options) {
  const min = options.min ?? Math.min(0, ...values);
  const max = options.max ?? Math.max(1, ...values);
  return min === max ? [Math.min(0, min), max + 1] : [min, max];
}
function scaleLinear(domain, range) {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  const span = d1 - d0 || 1;
  return (value) => r0 + (value - d0) / span * (r1 - r0);
}
function pointString(points) {
  return points.map(([x, y]) => `${round(x)},${round(y)}`).join(" ");
}
function round(value) {
  return Math.round(value * 100) / 100;
}
function polar(cx, cy, radius, angle) {
  return [cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)];
}
function arcPath(cx, cy, outer, start, end, inner = 0) {
  const large = end - start > Math.PI ? 1 : 0;
  const [sx, sy] = polar(cx, cy, outer, start);
  const [ex, ey] = polar(cx, cy, outer, end);
  if (inner <= 0) return `M ${cx} ${cy} L ${sx} ${sy} A ${outer} ${outer} 0 ${large} 1 ${ex} ${ey} Z`;
  const [isx, isy] = polar(cx, cy, inner, end);
  const [iex, iey] = polar(cx, cy, inner, start);
  return `M ${sx} ${sy} A ${outer} ${outer} 0 ${large} 1 ${ex} ${ey} L ${isx} ${isy} A ${inner} ${inner} 0 ${large} 0 ${iex} ${iey} Z`;
}
function fullDonutPath(cx, cy, outer, inner) {
  return `M ${cx - outer} ${cy} A ${outer} ${outer} 0 1 0 ${cx + outer} ${cy} A ${outer} ${outer} 0 1 0 ${cx - outer} ${cy} M ${cx - inner} ${cy} A ${inner} ${inner} 0 1 1 ${cx + inner} ${cy} A ${inner} ${inner} 0 1 1 ${cx - inner} ${cy} Z`;
}
function markAttrs(label, options) {
  const focus = options.focusable ? ' tabindex="0"' : "";
  const aria = options.focusable ? ` aria-label="${esc(label)}"` : "";
  return `class="uif-chart-mark"${focus}${aria} data-uif-chart-label="${esc(label)}"`;
}
function axisAndGrid(width, height, plot, domain, options) {
  if (options.axes === false && options.grid === false) return "";
  const y = scaleLinear(domain, [height - plot.bottom, plot.top]);
  const ticks = Array.from({ length: 5 }, (_, i) => domain[0] + (domain[1] - domain[0]) / 4 * i);
  return ticks.map((tick) => {
    const yy = y(tick);
    const grid = options.grid === false ? "" : `<line class="uif-chart-grid" x1="${plot.left}" y1="${yy}" x2="${width - plot.right}" y2="${yy}"></line>`;
    const label = options.axes === false ? "" : `<text class="uif-chart-axis-label" x="${plot.left - 8}" y="${yy + 4}" text-anchor="end">${esc(fmt(tick, options))}</text>`;
    return `${grid}${label}`;
  }).join("");
}
function verticalValueGrid(width, height, plot, domain, options) {
  if (options.axes === false && options.grid === false) return "";
  const x = scaleLinear(domain, [plot.left, width - plot.right]);
  const ticks = Array.from({ length: 5 }, (_, i) => domain[0] + (domain[1] - domain[0]) / 4 * i);
  return ticks.map((tick) => {
    const xx = x(tick);
    const grid = options.grid === false ? "" : `<line class="uif-chart-grid" x1="${xx}" y1="${plot.top}" x2="${xx}" y2="${height - plot.bottom}"></line>`;
    const label = options.axes === false ? "" : `<text class="uif-chart-axis-label" x="${xx}" y="${height - 8}" text-anchor="middle">${esc(fmt(tick, options))}</text>`;
    return `${grid}${label}`;
  }).join("");
}
function svgWrap(type, width, height, content, data, options) {
  const id = uid(options, type);
  const title = options.label || `${type} chart`;
  const desc = options.description || data.map((d) => `${d.label ?? "item"} ${fmt(valueOf(d, options), options)}`).join(", ");
  return `<svg class="uif-chart-svg uif-chart-${type}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="${id}-title ${id}-desc"><title id="${id}-title">${esc(title)}</title><desc id="${id}-desc">${esc(desc)}</desc>${content}</svg>`;
}
function legend(items, options) {
  if (!options.legend || !items.length) return "";
  const palette = options.palette ?? defaultPalette;
  return `<div class="uif-chart-legend" data-uif-placement="${options.legend === true ? "bottom" : options.legend}">${items.map((item, i) => `<span><i style="background:${palette[i % palette.length]}"></i>${esc(item)}</span>`).join("")}</div>`;
}
function renderLineLike(data, options, area = false, sparkline = false) {
  const width = options.width ?? (sparkline ? 160 : 360);
  const height = options.height ?? (sparkline ? 64 : 200);
  const plot = sparkline ? { top: 6, right: 6, bottom: 6, left: 6 } : margins(options);
  const normalized = normalizeData(data, options);
  const series = inferSeries(normalized, options);
  const palette = options.palette ?? defaultPalette;
  const values = series.length ? normalized.flatMap((d) => series.map((key) => Number(d.values?.[key] ?? 0))) : normalized.map((d) => d.value ?? 0);
  const y = scaleLinear(extent(values, options), [height - plot.bottom, plot.top]);
  const xStep = normalized.length > 1 ? (width - plot.left - plot.right) / (normalized.length - 1) : 0;
  const renderSeries = (name, index) => {
    const points = normalized.map((d, i) => [plot.left + i * xStep, y(name ? Number(d.values?.[name] ?? 0) : d.value ?? 0)]);
    const line = `<polyline class="uif-chart-series uif-chart-line" data-uif-series="${esc(name ?? "value")}" points="${pointString(points)}" fill="none" style="stroke:${palette[index % palette.length]}"></polyline>`;
    const fill = area ? `<polygon class="uif-chart-area" points="${plot.left},${height - plot.bottom} ${pointString(points)} ${width - plot.right},${height - plot.bottom}" style="fill:${palette[index % palette.length]}"></polygon>` : "";
    const marks = sparkline || options.labels === false ? "" : points.map(([cx, cy], i) => {
      const value = name ? Number(normalized[i].values?.[name] ?? 0) : normalized[i].value ?? 0;
      const label = `${name ? `${name} ` : ""}${normalized[i].label ?? ""}: ${fmt(value, options)}`;
      return `<circle ${markAttrs(label, options)} cx="${round(cx)}" cy="${round(cy)}" r="3"><title>${esc(label)}</title></circle>`;
    }).join("");
    return `${fill}${line}${marks}`;
  };
  const body = `${sparkline ? "" : axisAndGrid(width, height, plot, extent(values, options), options)}${series.length ? series.map(renderSeries).join("") : renderSeries(null, 0)}`;
  return `${svgWrap(sparkline ? "sparkline" : area ? "area" : "line", width, height, body, normalized, options)}${legend(series, options)}`;
}
function renderBars(data, options, mode) {
  const width = options.width ?? 360;
  const height = options.height ?? 220;
  const plot = margins(options);
  const normalized = normalizeData(data, options);
  const series = inferSeries(normalized, options);
  const palette = options.palette ?? defaultPalette;
  const values = series.length && mode === "stacked-bar" ? normalized.flatMap((d) => {
    let positive = 0;
    let negative = 0;
    series.forEach((key) => {
      const value = Number(d.values?.[key] ?? 0);
      if (value >= 0) positive += value;
      else negative += value;
    });
    return [negative, positive];
  }) : series.length ? normalized.flatMap((d) => series.map((key) => Number(d.values?.[key] ?? 0))) : normalized.map((d) => d.value ?? 0);
  const domain = extent(values, options);
  const vertical = mode !== "horizontal-bar";
  const major = vertical ? width - plot.left - plot.right : height - plot.top - plot.bottom;
  const band = major / Math.max(1, normalized.length);
  const zeroY = scaleLinear(domain, [height - plot.bottom, plot.top])(0);
  const zeroX = scaleLinear(domain, [plot.left, width - plot.right])(0);
  const yScale = scaleLinear(domain, [height - plot.bottom, plot.top]);
  const xScale = scaleLinear(domain, [plot.left, width - plot.right]);
  const bars = normalized.map((d, i) => {
    if (series.length && mode === "stacked-bar") {
      let positiveOffset = 0;
      let negativeOffset = 0;
      return series.map((key, s) => {
        const value2 = Number(d.values?.[key] ?? 0);
        const start = value2 >= 0 ? positiveOffset : negativeOffset;
        const end = start + value2;
        if (value2 >= 0) positiveOffset = end;
        else negativeOffset = end;
        const y0 = yScale(start);
        const y1 = yScale(end);
        const x2 = plot.left + i * band + band * 0.18;
        const w = band * 0.64;
        const h = Math.abs(y1 - y0);
        const label2 = `${d.label ?? ""} ${key}: ${fmt(value2, options)}`;
        return `<rect ${markAttrs(label2, options)} data-uif-series="${esc(key)}" x="${round(x2)}" y="${round(Math.min(y0, y1))}" width="${round(w)}" height="${round(h)}" rx="3" style="fill:${palette[s % palette.length]}"><title>${esc(label2)}</title></rect>`;
      }).join("");
    }
    if (series.length && mode === "grouped-bar") {
      const inner = band * 0.72 / series.length;
      return series.map((key, s) => {
        const value2 = Number(d.values?.[key] ?? 0);
        const y2 = yScale(value2);
        const x2 = plot.left + i * band + band * 0.14 + s * inner;
        const label2 = `${d.label ?? ""} ${key}: ${fmt(value2, options)}`;
        return `<rect ${markAttrs(label2, options)} data-uif-series="${esc(key)}" x="${round(x2)}" y="${round(Math.min(y2, zeroY))}" width="${round(inner * 0.86)}" height="${round(Math.abs(zeroY - y2))}" rx="3" style="fill:${palette[s % palette.length]}"><title>${esc(label2)}</title></rect>`;
      }).join("");
    }
    const value = d.value ?? 0;
    const label = `${d.label ?? ""}: ${fmt(value, options)}`;
    if (!vertical) {
      const x2 = xScale(value);
      const y2 = plot.top + i * band + band * 0.18;
      return `<rect ${markAttrs(label, options)} x="${round(Math.min(x2, zeroX))}" y="${round(y2)}" width="${round(Math.abs(x2 - zeroX))}" height="${round(band * 0.64)}" rx="3"><title>${esc(label)}</title></rect>`;
    }
    const y = yScale(value);
    const x = plot.left + i * band + band * 0.18;
    return `<rect ${markAttrs(label, options)} x="${round(x)}" y="${round(Math.min(y, zeroY))}" width="${round(band * 0.64)}" height="${round(Math.abs(zeroY - y))}" rx="3"><title>${esc(label)}</title></rect>`;
  }).join("");
  const labels = options.axes === false ? "" : normalized.map(
    (d, i) => vertical ? `<text class="uif-chart-axis-label" x="${round(plot.left + i * band + band / 2)}" y="${height - 8}" text-anchor="middle">${esc(d.label)}</text>` : `<text class="uif-chart-axis-label" x="${plot.left - 8}" y="${round(plot.top + i * band + band / 2 + 4)}" text-anchor="end">${esc(d.label)}</text>`
  ).join("");
  const grid = vertical ? axisAndGrid(width, height, plot, domain, options) : verticalValueGrid(width, height, plot, domain, options);
  return `${svgWrap(mode, width, height, `${grid}${bars}${labels}`, normalized, options)}${legend(series, options)}`;
}
function renderPie(data, options, donut = false) {
  const width = options.width ?? 180;
  const height = options.height ?? 180;
  const normalized = normalizeData(data, options).filter((d) => (d.value ?? 0) > 0);
  const palette = options.palette ?? defaultPalette;
  const total = normalized.reduce((sum, d) => sum + (d.value ?? 0), 0);
  if (!total) return `<div class="uif-chart-state" data-uif-state="empty">${esc(options.description || "No positive values to chart")}</div>`;
  const radius = Math.min(width, height) / 2 - 10;
  const inner = donut ? radius * 0.55 : 0;
  let angle = -Math.PI / 2;
  const paths = normalized.map((d, i) => {
    const next = angle + (d.value ?? 0) / total * Math.PI * 2;
    const label = `${d.label ?? ""}: ${fmt(d.value ?? 0, options)}`;
    const fill = d.color || palette[i % palette.length];
    const path = normalized.length === 1 && !donut ? `<circle ${markAttrs(label, options)} cx="${width / 2}" cy="${height / 2}" r="${radius}" style="fill:${fill}"><title>${esc(label)}</title></circle>` : `<path ${markAttrs(label, options)} d="${normalized.length === 1 && donut ? fullDonutPath(width / 2, height / 2, radius, inner) : arcPath(width / 2, height / 2, radius, angle, next, inner)}" ${normalized.length === 1 && donut ? 'fill-rule="evenodd" ' : ""}style="fill:${fill}"><title>${esc(label)}</title></path>`;
    angle = next;
    return path;
  }).join("");
  return `${svgWrap(donut ? "donut" : "pie", width, height, paths, normalized, options)}${legend(
    normalized.map((d) => d.label ?? ""),
    options
  )}`;
}
function renderRadar(data, options) {
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
  const axes = normalized.map((d, i) => {
    const angle = -Math.PI / 2 + i / normalized.length * Math.PI * 2;
    const [x, y] = polar(cx, cy, radius, angle);
    const [lx, ly] = polar(cx, cy, radius + 16, angle);
    return `<line class="uif-chart-grid" x1="${cx}" y1="${cy}" x2="${round(x)}" y2="${round(y)}"></line><text class="uif-chart-axis-label" x="${round(lx)}" y="${round(ly)}" text-anchor="middle">${esc(d.label)}</text>`;
  }).join("");
  const rings = [0.25, 0.5, 0.75, 1].map((factor) => {
    const pts = normalized.map((_, i) => polar(cx, cy, radius * factor, -Math.PI / 2 + i / normalized.length * Math.PI * 2));
    return `<polygon class="uif-chart-grid-polygon" points="${pointString(pts)}"></polygon>`;
  }).join("");
  const renderSeries = (name, index) => {
    const pts = normalized.map((d, i) => {
      const value = name ? Number(d.values?.[name] ?? 0) : d.value ?? 0;
      const r = (value - min) / (max - min || 1) * radius;
      return polar(cx, cy, r, -Math.PI / 2 + i / normalized.length * Math.PI * 2);
    });
    return `<polygon class="uif-chart-radar-area" data-uif-series="${esc(name ?? "value")}" points="${pointString(pts)}" style="stroke:${palette[index % palette.length]};fill:${palette[index % palette.length]}"></polygon>`;
  };
  return `${svgWrap("radar", width, height, `${rings}${axes}${series.length ? series.map(renderSeries).join("") : renderSeries(null, 0)}`, normalized, options)}${legend(series, options)}`;
}
function renderSparkline(data, options) {
  if (options.sparklineType === "bar") return renderBars(data, { ...options, width: options.width ?? 160, height: options.height ?? 56, axes: false, grid: false }, "bar");
  return renderLineLike(data, { ...options, axes: false, grid: false, labels: false }, false, true);
}
function renderMetric(data, options) {
  const first = normalizeData(data, options)[0];
  return `<div class="uif-chart-metric" role="img" aria-label="${esc(options.label || first?.label || "Metric")}: ${esc(fmt(first?.value ?? 0, options))}"><strong>${esc(fmt(first?.value ?? 0, options))}</strong><span>${esc(first?.label ?? options.label ?? "Metric")}</span></div>`;
}
function renderRing(data, options, type) {
  const width = options.width ?? 140;
  const height = options.height ?? (type === "gauge" ? 90 : 140);
  const datum = normalizeData(data, options)[0];
  const value = datum?.value ?? 0;
  const max = options.max ?? datum?.max ?? 100;
  const pct = Math.max(0, Math.min(1, value / (max || 1)));
  if (type === "gauge") {
    const start = Math.PI;
    const end = Math.PI + pct * Math.PI;
    const bg = arcPath(width / 2, height - 8, 58, Math.PI, Math.PI * 2, 46);
    const fg = arcPath(width / 2, height - 8, 58, start, end, 46);
    return svgWrap("gauge", width, height, `<path class="uif-chart-ring-bg" d="${bg}"></path><path class="uif-chart-value" d="${fg}"></path><text x="${width / 2}" y="${height - 18}" text-anchor="middle">${esc(fmt(value, options))}</text>`, [datum], options);
  }
  const dash = round(pct * 283);
  return svgWrap(type, width, height, `<circle class="uif-chart-ring-bg" cx="${width / 2}" cy="${height / 2}" r="45"></circle><circle class="uif-chart-value" cx="${width / 2}" cy="${height / 2}" r="45" stroke-dasharray="${dash} 283"></circle><text x="${width / 2}" y="${height / 2 + 4}" text-anchor="middle">${esc(fmt(value, options))}</text>`, [datum], options);
}
function renderBullet(data, options) {
  const width = options.width ?? 320;
  const height = options.height ?? 72;
  const datum = normalizeData(data, options)[0];
  const max = options.max ?? datum?.max ?? 100;
  const x = scaleLinear([0, max], [24, width - 18]);
  const value = datum?.value ?? 0;
  const target = datum?.target ?? max;
  const content = `<rect class="uif-chart-range" x="24" y="24" width="${width - 42}" height="18"></rect><rect class="uif-chart-value-bar" x="24" y="24" width="${round(x(value) - 24)}" height="18"></rect><line class="uif-chart-target" x1="${round(x(target))}" y1="18" x2="${round(x(target))}" y2="48"></line><text class="uif-chart-axis-label" x="24" y="62">${esc(datum?.label ?? "")}</text>`;
  return svgWrap("bullet", width, height, content, [datum], options);
}
function renderHeatmap(data, options) {
  const width = options.width ?? 320;
  const height = options.height ?? 160;
  const normalized = normalizeData(data, options);
  const cols = Math.ceil(Math.sqrt(normalized.length || 1));
  const cell = Math.min((width - 20) / cols, (height - 20) / Math.ceil(normalized.length / cols));
  const max = Math.max(1, ...normalized.map((d) => d.value ?? 0));
  const cells = normalized.map((d, i) => {
    const opacity = 0.2 + (d.value ?? 0) / max * 0.8;
    const x = 10 + i % cols * cell;
    const y = 10 + Math.floor(i / cols) * cell;
    const label = `${d.label ?? ""}: ${fmt(d.value ?? 0, options)}`;
    return `<rect ${markAttrs(label, options)} x="${round(x)}" y="${round(y)}" width="${round(cell - 3)}" height="${round(cell - 3)}" rx="3" style="opacity:${round(opacity)}"><title>${esc(label)}</title></rect>`;
  }).join("");
  return svgWrap("heatmap", width, height, cells, normalized, options);
}
function renderHistogram(data, options, distribution = false) {
  const width = options.width ?? 360;
  const height = options.height ?? 220;
  const plot = margins(options);
  const normalized = normalizeData(data, options);
  const bins = histogramBins(normalized.map((d) => d.value ?? 0), { bins: options.bins, min: options.min, max: options.max });
  if (!bins.length) return `<div class="uif-chart-state" data-uif-state="empty">${esc(options.description || "No data")}</div>`;
  const x = scaleLinear([bins[0].x0, bins[bins.length - 1].x1], [plot.left, width - plot.right]);
  const y = scaleLinear([0, Math.max(1, ...bins.map((bin) => bin.count))], [height - plot.bottom, plot.top]);
  if (distribution) {
    const points = bins.map((bin) => [x((bin.x0 + bin.x1) / 2), y(bin.count)]);
    const body = `${axisAndGrid(width, height, plot, [0, Math.max(1, ...bins.map((bin) => bin.count))], options)}<polyline class="uif-chart-series uif-chart-line" points="${pointString(points)}" fill="none"></polyline>`;
    return svgWrap("distribution", width, height, body, normalized, { ...options, description: options.description || "Binned distribution line" });
  }
  const bars = bins.map((bin) => {
    const x0 = x(bin.x0);
    const x1 = x(bin.x1);
    const yy = y(bin.count);
    const label = `${fmt(bin.x0, options)}-${fmt(bin.x1, options)}: ${bin.count}`;
    return `<rect ${markAttrs(label, options)} x="${round(x0 + 1)}" y="${round(yy)}" width="${round(Math.max(1, x1 - x0 - 2))}" height="${round(height - plot.bottom - yy)}" rx="2"><title>${esc(label)}</title></rect>`;
  }).join("");
  return svgWrap("histogram", width, height, `${axisAndGrid(width, height, plot, [0, Math.max(1, ...bins.map((bin) => bin.count))], options)}${bars}`, normalized, options);
}
function renderBoxPlot(data, options) {
  const width = options.width ?? 320;
  const height = options.height ?? 160;
  const plot = margins({ ...options, margin: { top: 18, right: 20, bottom: 28, left: 34, ...options.margin } });
  const normalized = normalizeData(data, options);
  const stats = summaryStats(normalized.map((d) => d.value ?? 0));
  if (!stats.count) return `<div class="uif-chart-state" data-uif-state="empty">${esc(options.description || "No data")}</div>`;
  const domain = extent([stats.min, stats.max], options);
  const x = scaleLinear(domain, [plot.left, width - plot.right]);
  const cy = (height - plot.bottom + plot.top) / 2;
  const boxTop = cy - 22;
  const boxHeight = 44;
  const content = `${verticalValueGrid(width, height, plot, domain, options)}<line class="uif-chart-grid" x1="${round(x(stats.min))}" y1="${cy}" x2="${round(x(stats.max))}" y2="${cy}"></line><rect ${markAttrs(`Q1 ${fmt(stats.q1, options)} to Q3 ${fmt(stats.q3, options)}`, options).replace('class="uif-chart-mark"', 'class="uif-chart-mark uif-chart-box"')} x="${round(x(stats.q1))}" y="${boxTop}" width="${round(Math.max(1, x(stats.q3) - x(stats.q1)))}" height="${boxHeight}" rx="3"><title>Q1 ${esc(fmt(stats.q1, options))}, median ${esc(fmt(stats.median, options))}, Q3 ${esc(fmt(stats.q3, options))}</title></rect><line class="uif-chart-target" x1="${round(x(stats.median))}" y1="${boxTop - 4}" x2="${round(x(stats.median))}" y2="${boxTop + boxHeight + 4}"></line><line class="uif-chart-target" x1="${round(x(stats.min))}" y1="${cy - 14}" x2="${round(x(stats.min))}" y2="${cy + 14}"></line><line class="uif-chart-target" x1="${round(x(stats.max))}" y1="${cy - 14}" x2="${round(x(stats.max))}" y2="${cy + 14}"></line>`;
  return svgWrap("box-plot", width, height, content, normalized, { ...options, description: options.description || `Median ${fmt(stats.median, options)}, IQR ${fmt(stats.iqr, options)}` });
}
function pointsFromData(data, options) {
  return normalizeData(data, options).map((d, index) => ({
    x: Number(options.x && d[options.x] != null ? d[options.x] : d.x ?? index + 1),
    y: Number(options.y && d[options.y] != null ? d[options.y] : d.y ?? d.value ?? 0)
  }));
}
function renderScatter(data, options, forceRegression = false) {
  const width = options.width ?? 360;
  const height = options.height ?? 220;
  const plot = margins(options);
  const normalized = normalizeData(data, options);
  const points = pointsFromData(data, options).filter((point) => Number.isFinite(point.x) && Number.isFinite(point.y));
  if (!points.length) return `<div class="uif-chart-state" data-uif-state="empty">${esc(options.description || "No plottable points")}</div>`;
  const xDomain = extent(points.map((point) => point.x), { min: options.min });
  const yDomain = extent(points.map((point) => point.y), { max: options.max });
  const x = scaleLinear(xDomain, [plot.left, width - plot.right]);
  const y = scaleLinear(yDomain, [height - plot.bottom, plot.top]);
  const marks = points.map((point, index) => {
    const label = `${normalized[index]?.label || `Point ${index + 1}`}: ${fmt(point.x, options)}, ${fmt(point.y, options)}`;
    return `<circle ${markAttrs(label, options)} cx="${round(x(point.x))}" cy="${round(y(point.y))}" r="4"><title>${esc(label)}</title></circle>`;
  }).join("");
  const reg = options.regression || forceRegression ? linearRegression(points) : null;
  const line = reg ? `<line class="uif-chart-regression" x1="${round(x(xDomain[0]))}" y1="${round(y(reg.predict(xDomain[0])))}" x2="${round(x(xDomain[1]))}" y2="${round(y(reg.predict(xDomain[1])))}"><title>y = ${esc(fmt(reg.slope, options))}x + ${esc(fmt(reg.intercept, options))}, R2 ${esc(fmt(reg.r2, options))}</title></line>` : "";
  return svgWrap(forceRegression ? "regression" : "scatter", width, height, `${axisAndGrid(width, height, plot, yDomain, options)}${verticalValueGrid(width, height, plot, xDomain, options)}${marks}${line}`, normalized, options);
}
function renderControlChart(data, options) {
  const normalized = normalizeData(data, options);
  const stats = summaryStats(normalized.map((d) => d.value ?? 0));
  const sigma = stats.stddev || 1;
  const min = Math.min(stats.min, stats.mean - sigma * 3);
  const max = Math.max(stats.max, stats.mean + sigma * 3);
  const referenceLines = [stats.mean, stats.mean + sigma * 3, stats.mean - sigma * 3];
  const html = renderLineLike(normalized, { ...options, min, max, description: options.description || "Control chart with mean and three sigma limits" });
  return html.replace(
    "</svg>",
    `${referenceLines.map((value, index) => `<line class="uif-chart-reference ${index === 0 ? "uif-chart-mean" : ""}" x1="42" y1="${round(scaleLinear([min, max], [(options.height ?? 200) - margins(options).bottom, margins(options).top])(value))}" x2="${(options.width ?? 360) - margins(options).right}" y2="${round(scaleLinear([min, max], [(options.height ?? 200) - margins(options).bottom, margins(options).top])(value))}"><title>${index === 0 ? "Mean" : "Control limit"} ${esc(fmt(value, options))}</title></line>`).join("")}</svg>`
  );
}
function renderPareto(data, options) {
  const sorted = normalizeData(data, options).sort((a, b) => (b.value ?? 0) - (a.value ?? 0));
  const total = sorted.reduce((sum, item) => sum + Math.max(0, item.value ?? 0), 0) || 1;
  let running = 0;
  const cumulative = sorted.map((item) => {
    running += Math.max(0, item.value ?? 0);
    return { ...item, values: { Count: item.value ?? 0, Cumulative: running / total * 100 } };
  });
  return `${renderBars(cumulative, { ...options, type: "bar", series: [], y: void 0 }, "bar")}${renderLineLike(
    cumulative.map((item) => ({ label: item.label, value: Number(item.values?.Cumulative ?? 0) })),
    { ...options, label: options.label || "Cumulative percent", min: 0, max: 100 }
  )}`;
}
function renderChart(data, options = {}) {
  const type = options.type ?? "bar";
  const normalized = normalizeData(coerceData(data), options);
  if (!normalized.length) return `<div class="uif-chart-state" data-uif-state="empty">${esc(options.description || "No data")}</div>`;
  if (type === "metric") return renderMetric(normalized, options);
  if (type === "line") return renderLineLike(normalized, options);
  if (type === "area") return renderLineLike(normalized, options, true);
  if (type === "horizontal-bar") return renderBars(normalized, options, "horizontal-bar");
  if (type === "grouped-bar") return renderBars(normalized, options, "grouped-bar");
  if (type === "stacked-bar") return renderBars(normalized, options, "stacked-bar");
  if (type === "pie") return renderPie(normalized, options);
  if (type === "donut" || type === "doughnut") return renderPie(normalized, options, true);
  if (type === "radar") return renderRadar(normalized, options);
  if (type === "sparkline") return renderSparkline(normalized, options);
  if (type === "progress" || type === "ring" || type === "gauge") return renderRing(normalized, options, type);
  if (type === "bullet") return renderBullet(normalized, options);
  if (type === "heatmap" || type === "status-heatmap") return renderHeatmap(normalized, options);
  if (type === "timeline") return renderBars(normalized, { ...options, axes: false }, "bar");
  if (type === "histogram") return renderHistogram(normalized, options);
  if (type === "box-plot") return renderBoxPlot(normalized, options);
  if (type === "scatter") return renderScatter(normalized, options);
  if (type === "regression") return renderScatter(normalized, options, true);
  if (type === "control-chart") return renderControlChart(normalized, options);
  if (type === "distribution") return renderHistogram(normalized, options, true);
  if (type === "pareto") return renderPareto(normalized, options);
  return renderBars(normalized, options, "bar");
}
function parseChartData(el) {
  const raw = el.dataset.uifData;
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return coerceData(parsed);
    if (parsed && typeof parsed === "object" && Array.isArray(parsed.data)) return coerceData(parsed.data);
    if (parsed && typeof parsed === "object" && Array.isArray(parsed.rows)) return coerceData(parsed.rows);
    return [];
  } catch {
    return [];
  }
}
function adaptTable(table, options = {}) {
  const headers = Array.from(table.tHead?.rows[0]?.cells ?? []).map((cell) => cell.textContent?.trim() ?? "");
  const columnIndex = (column, fallback) => typeof column === "number" ? column : typeof column === "string" ? Math.max(0, headers.indexOf(column)) : fallback;
  const labelColumn = columnIndex(options.labelColumn, 0);
  const valueColumn = columnIndex(options.valueColumn, 1);
  const seriesColumns = options.seriesColumns ?? [];
  return Array.from(table.tBodies[0]?.rows ?? []).map((row) => {
    const label = row.cells[labelColumn]?.textContent?.trim() ?? "";
    if (seriesColumns.length) {
      const values = Object.fromEntries(
        seriesColumns.map((column) => {
          const index = columnIndex(column, 1);
          return [headers[index] || `Series ${index}`, Number(row.cells[index]?.textContent?.replace(/[^0-9.-]/g, "") || 0)];
        })
      );
      return { label, values };
    }
    return { label, value: Number(row.cells[valueColumn]?.textContent?.replace(/[^0-9.-]/g, "") || 0) };
  });
}
function adaptRecords(records, mapping = {}) {
  const labelKey = mapping.label ?? mapping.x ?? "label";
  const valueKey = mapping.value ?? mapping.y ?? "value";
  return records.map((record, index) => {
    const values = mapping.series?.length ? Object.fromEntries(mapping.series.map((key) => [key, Number(record[key]) || 0])) : void 0;
    return {
      ...record,
      label: String(record[labelKey] ?? index + 1),
      value: values ? void 0 : Number(record[valueKey]) || 0,
      values
    };
  });
}
async function loadChartData(el) {
  if (el.dataset.uifTable) {
    const table = document.querySelector(el.dataset.uifTable);
    if (table) return adaptTable(table);
  }
  if (el.dataset.uifSrc) {
    const response = await request(el.dataset.uifSrc, { method: "GET" });
    if (Array.isArray(response)) return response;
    return response.data ?? response.rows ?? [];
  }
  return Promise.resolve(parseChartData(el));
}
function optionsFromElement(el) {
  let parsed = {};
  try {
    parsed = JSON.parse(el.dataset.uifOptions || "{}");
  } catch {
    parsed = {};
  }
  return {
    ...parsed,
    type: el.dataset.uifChart || parsed.type || "bar",
    x: el.dataset.uifX || parsed.x,
    y: el.dataset.uifY || parsed.y,
    label: el.dataset.uifLabel || parsed.label,
    id: el.dataset.uifId || parsed.id || `instance-${++chartIdCounter}`,
    series: el.dataset.uifSeries ? el.dataset.uifSeries.split(",").map((item) => item.trim()).filter(Boolean) : parsed.series
  };
}
function responsiveOptions(el, options) {
  if (options.responsive === false || options.width) return options;
  const width = Math.round(el.getBoundingClientRect().width || el.clientWidth || 0);
  if (!width) return options;
  return { ...options, width, height: options.height ?? Math.round(width / (options.aspectRatio || 1.8)) };
}
function initChart(el) {
  controllers.get(el)?.destroy();
  let options = optionsFromElement(el);
  let data = [];
  let timer;
  let resizeTimer;
  const refresh = async () => {
    el.dataset.uifState = "loading";
    try {
      data = await loadChartData(el);
      options = optionsFromElement(el);
      el.innerHTML = renderChart(data, responsiveOptions(el, options));
      el.dataset.uifState = data.length ? "refreshed" : "empty";
      el.dispatchEvent(new CustomEvent("uif:chart-refresh", { detail: { data, options }, bubbles: true }));
    } catch (error) {
      el.dataset.uifState = "error";
      el.innerHTML = `<div class="uif-chart-state" data-uif-state="error">${esc(el.dataset.uifError || "Unable to load chart")}</div>`;
      el.dispatchEvent(new CustomEvent("uif:chart-error", { detail: { error }, bubbles: true }));
      throw error;
    }
  };
  const resize = typeof ResizeObserver !== "undefined" ? new ResizeObserver(() => {
    if (resizeTimer) window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      el.innerHTML = renderChart(data, responsiveOptions(el, options));
    }, 80);
  }) : null;
  resize?.observe(el);
  if (el.dataset.uifRefresh === "interval" || el.dataset.uifInterval) timer = window.setInterval(() => void refresh(), Number(el.dataset.uifInterval || 3e4));
  const select = (event) => {
    const target = event.target instanceof Element ? event.target.closest(".uif-chart-mark") : null;
    if (!target) return;
    if (event instanceof KeyboardEvent && !["Enter", " "].includes(event.key)) return;
    el.dispatchEvent(
      new CustomEvent("uif:chart-select", {
        detail: {
          label: target.getAttribute("data-uif-chart-label") || target.getAttribute("aria-label") || "",
          series: target.getAttribute("data-uif-series") || void 0,
          type: options.type ?? "bar"
        },
        bubbles: true
      })
    );
  };
  el.addEventListener("click", select);
  el.addEventListener("keydown", select);
  const controller = {
    refresh,
    destroy() {
      resize?.disconnect();
      if (timer) window.clearInterval(timer);
      if (resizeTimer) window.clearTimeout(resizeTimer);
      el.removeEventListener("click", select);
      el.removeEventListener("keydown", select);
      controllers.delete(el);
    }
  };
  controllers.set(el, controller);
  void refresh();
  return controller;
}
function refreshChart(el) {
  return controllers.get(el)?.refresh() ?? Promise.resolve();
}
function destroyChart(el) {
  controllers.get(el)?.destroy();
}
function exportChartData(data, format = "json") {
  if (format === "csv") {
    return ["label,value", ...data.map((d) => `${JSON.stringify(d.label ?? "")},${d.value ?? ""}`)].join("\n");
  }
  return JSON.stringify(data);
}
var chart = {
  name: "chart",
  init: (el) => {
    initChart(el);
  },
  destroy: destroyChart
};
export {
  adaptRecords,
  adaptTable,
  chart,
  correlation,
  cumulativeSum,
  destroyChart,
  exportChartData,
  histogramBins,
  initChart,
  linearRegression,
  movingAverage,
  parseChartData,
  percentChange,
  quantile,
  refreshChart,
  renderChart,
  summaryStats,
  zScores
};
