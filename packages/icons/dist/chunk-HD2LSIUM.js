// src/sets/charts.ts
var chartIcons = {
  "area-chart": { body: '<path d="M3 3v18h18"></path><path d="m7 15 4-5 3 3 5-7v12H7z"></path>' },
  "bar-chart": { body: '<path d="M3 3v18h18"></path><path d="M7 16V9"></path><path d="M12 16V5"></path><path d="M17 16v-4"></path>' },
  chart: { body: '<path d="M3 3v18h18"></path><path d="m7 14 3-3 3 2 5-6"></path>' },
  dashboard: { body: '<path d="M4 13a8 8 0 1 1 16 0"></path><path d="M12 13l4-4"></path><path d="M5 19h14"></path>' },
  "donut-chart": { body: '<path d="M12 3a9 9 0 1 1-8.5 6"></path><path d="M12 3v6"></path><circle cx="12" cy="12" r="3"></circle>' },
  "gauge-chart": { body: '<path d="M4 15a8 8 0 1 1 16 0"></path><path d="M12 15l5-5"></path><path d="M7 19h10"></path>' },
  histogram: { body: '<path d="M3 3v18h18"></path><path d="M7 17v-5"></path><path d="M11 17V7"></path><path d="M15 17v-8"></path><path d="M19 17v-3"></path>' },
  "line-chart": { body: '<path d="M3 3v18h18"></path><path d="m7 15 4-4 3 3 5-7"></path>' },
  "pie-chart": { body: '<path d="M21 12A9 9 0 1 1 12 3v9h9z"></path><path d="M12 3a9 9 0 0 1 9 9h-9V3z"></path>' },
  "radar-chart": { body: '<path d="m12 3 8 5v8l-8 5-8-5V8l8-5z"></path><path d="m12 7 4 3v4l-4 3-4-3v-4l4-3z"></path><path d="M12 3v18"></path><path d="M4 8l16 8"></path><path d="M20 8 4 16"></path>' },
  "scatter-chart": { body: '<path d="M3 3v18h18"></path><circle cx="8" cy="15" r="1.5"></circle><circle cx="12" cy="10" r="1.5"></circle><circle cx="17" cy="7" r="1.5"></circle><circle cx="16" cy="16" r="1.5"></circle>' },
  sparkline: { body: '<path d="m3 16 4-4 3 2 4-6 3 4 4-5"></path>' },
  "chart-candlestick": { body: '<path d="M4 3v18h17"></path><path d="M8 7v8"></path><rect x="6" y="9" width="4" height="4"></rect><path d="M14 5v11"></path><rect x="12" y="7" width="4" height="6"></rect><path d="M20 10v8"></path><rect x="18" y="12" width="4" height="4"></rect>' },
  "chart-column": { body: '<path d="M3 3v18h18"></path><rect x="6" y="11" width="3" height="6"></rect><rect x="11" y="7" width="3" height="10"></rect><rect x="16" y="13" width="3" height="4"></rect>' },
  "chart-no-axes": { body: '<path d="m4 16 4-5 3 3 4-7 5 4"></path><circle cx="8" cy="11" r="1"></circle><circle cx="15" cy="7" r="1"></circle><circle cx="20" cy="11" r="1"></circle>' },
  "chart-stacked": { body: '<path d="M3 3v18h18"></path><path d="M7 17V8"></path><path d="M12 17V5"></path><path d="M17 17v-6"></path><path d="M7 12h10"></path>' }
};

export {
  chartIcons
};
