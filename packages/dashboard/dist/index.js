// src/index.ts
import { renderChart } from "@batoi/uif-charts";
function esc(value) {
  return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}
function asRecord(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
function normalizeWidget(widget, index) {
  return {
    ...widget,
    id: widget.id || `widget-${index + 1}`,
    title: widget.title || `Widget ${index + 1}`,
    type: widget.type || "metric",
    span: widget.span ?? 1
  };
}
function createDashboardConfig(config) {
  return {
    ...config,
    title: config.title || "Dashboard",
    density: config.density ?? "default",
    columns: config.columns ?? 3,
    filters: config.filters ?? [],
    widgets: (config.widgets ?? []).map(normalizeWidget)
  };
}
function applyDashboardFilters(rows, filters = []) {
  return rows.filter(
    (row) => filters.every((filter) => {
      const value = row[filter.field];
      const operator = filter.operator ?? "equals";
      if (operator === "contains") return String(value ?? "").toLowerCase().includes(String(filter.value ?? "").toLowerCase());
      if (operator === "gte") return Number(value) >= Number(filter.value);
      if (operator === "lte") return Number(value) <= Number(filter.value);
      if (operator === "between" && Array.isArray(filter.value)) return Number(value) >= Number(filter.value[0]) && Number(value) <= Number(filter.value[1]);
      return value === filter.value;
    })
  );
}
function summarizeDashboard(rows, field) {
  const values = rows.map((row) => Number(row[field])).filter(Number.isFinite);
  const sum = values.reduce((total, value) => total + value, 0);
  return {
    count: values.length,
    sum,
    average: values.length ? sum / values.length : 0,
    min: values.length ? Math.min(...values) : 0,
    max: values.length ? Math.max(...values) : 0
  };
}
function renderRows(rows, columns) {
  const visibleColumns = columns?.length ? columns : Object.keys(rows[0] ?? {});
  if (!rows.length) return '<p class="uif-text-muted">No records</p>';
  return `<div class="uif-table-wrap"><table class="uif-table"><thead><tr>${visibleColumns.map((column) => `<th>${esc(column)}</th>`).join("")}</tr></thead><tbody>${rows.map((row) => `<tr>${visibleColumns.map((column) => `<td>${esc(row[column])}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
}
function chartData(data) {
  return (data ?? []).map((item) => {
    const row = asRecord(item);
    return {
      ...row,
      label: String(row.label ?? row.name ?? ""),
      value: Number(row.value ?? 0)
    };
  });
}
function renderDashboardWidget(widget, options = {}) {
  const span = widget.span === "full" ? "full" : String(widget.span ?? 1);
  const body = widget.type === "chart" ? renderChart(chartData(widget.data), { type: "bar", palette: "professional", table: "sr-only", ...widget.chart ?? {} }) : widget.type === "table" ? renderRows((widget.data ?? []).map(asRecord), widget.columns) : widget.type === "list" ? `<ul class="uif-list">${(widget.data ?? []).map((item) => `<li>${esc(asRecord(item).label ?? item)}</li>`).join("")}</ul>` : widget.type === "custom" ? widget.html ?? "" : `<strong class="uif-dashboard-metric">${esc(widget.value ?? 0)}</strong>${widget.change ? `<span class="uif-badge uif-badge-success">${esc(widget.change)}</span>` : ""}`;
  return `<article class="uif-card uif-dashboard-widget" data-uif-dashboard-span="${esc(span)}"><div class="uif-card-head"><div><h3>${esc(widget.title)}</h3>${widget.description ? `<p>${esc(widget.description)}</p>` : ""}</div></div><div class="uif-card-body">${body || `<p class="uif-text-muted">${esc(options.emptyText ?? "No data")}</p>`}</div></article>`;
}
function renderDashboard(input, options = {}) {
  const config = createDashboardConfig(input);
  const className = ["uif-dashboard", options.className].filter(Boolean).join(" ");
  return `<section class="${esc(className)}" data-uif-dashboard-columns="${config.columns}" data-uif-dashboard-density="${esc(config.density)}"><header class="uif-dashboard-head"><div><h2>${esc(config.title)}</h2>${config.description ? `<p>${esc(config.description)}</p>` : ""}</div></header><div class="uif-dashboard-grid">${config.widgets.map((widget) => renderDashboardWidget(widget, options)).join("")}</div></section>`;
}
function initDashboard(el) {
  const raw = el.dataset.uifDashboard || el.dataset.uifOptions;
  if (!raw) return;
  const config = createDashboardConfig(JSON.parse(raw));
  el.innerHTML = renderDashboard(config);
}
export {
  applyDashboardFilters,
  createDashboardConfig,
  initDashboard,
  renderDashboard,
  renderDashboardWidget,
  summarizeDashboard
};
