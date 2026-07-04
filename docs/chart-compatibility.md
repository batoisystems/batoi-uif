# Chart Compatibility

Batoi UIF charts are dependency-free SVG renderers for server-rendered and RAD-friendly application screens. The chart package supports a practical business dashboard subset and accepts a Flint-compatible input shape at the specification boundary.

UIF is **Flint-compatible, not Flint-complete**. Flint chart specs that map to native UIF chart types render in the browser with UIF's SVG engine. Unsupported Flint chart types emit warnings and render a simple bar fallback only so pages remain resilient.

## Native UIF Chart Types

| UIF chart type       | Data contract                                 | Interaction/export             | Accessibility notes                             |
| -------------------- | --------------------------------------------- | ------------------------------ | ----------------------------------------------- |
| `line`               | `label`, `value` or `values` series           | focus/select/drill-down/export | SVG title/desc, optional table fallback         |
| `area`               | `label`, `value` or `values` series           | focus/select/drill-down/export | SVG title/desc, optional table fallback         |
| `bar`                | `label`, `value`                              | focus/select/drill-down/export | SVG title/desc, optional table fallback         |
| `horizontal-bar`     | `label`, `value`                              | focus/select/drill-down/export | SVG title/desc, optional table fallback         |
| `grouped-bar`        | `label`, `values`                             | focus/select/drill-down/export | SVG title/desc, legend, optional table fallback |
| `stacked-bar`        | `label`, `values`                             | focus/select/drill-down/export | SVG title/desc, legend, optional table fallback |
| `pie`                | `label`, `value`                              | focus/select/drill-down/export | SVG title/desc, legend, optional table fallback |
| `donut` / `doughnut` | `label`, `value`                              | focus/select/drill-down/export | SVG title/desc, legend, optional table fallback |
| `radar`              | `label`, `value` or `values` series           | export                         | SVG title/desc, optional table fallback         |
| `sparkline`          | `label`, `value`                              | export                         | Compact SVG summary                             |
| `metric`             | first datum `label`, `value`                  | export                         | Text-first KPI output                           |
| `progress`           | first datum `label`, `value`, `max`           | export                         | SVG title/desc                                  |
| `ring`               | first datum `label`, `value`, `max`           | export                         | SVG title/desc                                  |
| `gauge`              | first datum `label`, `value`, `max`           | export                         | SVG title/desc                                  |
| `timeline`           | `label`, `value`                              | focus/select/export            | Rendered with bar geometry                      |
| `heatmap`            | `label`, `value`                              | focus/select/export            | SVG title/desc, optional table fallback         |
| `status-heatmap`     | `label`, `value`                              | focus/select/export            | SVG title/desc, optional table fallback         |
| `bullet`             | first datum `label`, `value`, `target`, `max` | export                         | SVG title/desc                                  |
| `histogram`          | numeric values or `value`                     | focus/select/export            | SVG title/desc, optional table fallback         |
| `box-plot`           | numeric values or `value`                     | focus/select/export            | SVG title/desc                                  |
| `scatter`            | `label`, `x`, `y`                             | focus/select/export            | SVG title/desc, optional table fallback         |
| `regression`         | `label`, `x`, `y`                             | focus/select/export            | SVG title/desc with trend summary               |
| `control-chart`      | `label`, `value`                              | focus/select/export            | SVG title/desc with control references          |
| `distribution`       | numeric values or `value`                     | export                         | SVG title/desc                                  |
| `pareto`             | `label`, `value`                              | export                         | Composite bar and cumulative line output        |
| `funnel`             | `label`, `value`                              | focus/select/drill-down/export | SVG title/desc, optional table fallback         |
| `waterfall`          | `label`, `value`, optional `role`             | focus/select/drill-down/export | SVG title/desc, optional table fallback         |
| `bubble`             | `label`, `x`, `y`, `size`                     | focus/select/drill-down/export | SVG title/desc, optional table fallback         |
| `treemap`            | `label`, `value`, optional `group`            | focus/select/drill-down/export | SVG title/desc, optional table fallback         |
| `calendar-heatmap`   | `date`, `value`                               | focus/select/drill-down/export | SVG title/desc, optional table fallback         |
| `candlestick`        | `label`, `open`, `high`, `low`, `close`       | focus/select/drill-down/export | SVG title/desc                                  |
| `ohlc`               | `label`, `open`, `high`, `low`, `close`       | focus/select/drill-down/export | SVG title/desc                                  |
| `rose`               | `label`, `value`                              | focus/select/drill-down/export | SVG title/desc, optional table fallback         |
| `polar-area`         | `label`, `value`                              | focus/select/drill-down/export | SVG title/desc, optional table fallback         |

## Flint Name Mapping

| Flint chart name or alias                     | UIF chart type     | Status                                        |
| --------------------------------------------- | ------------------ | --------------------------------------------- |
| `Area`, `Area Chart`                          | `area`             | Supported                                     |
| `Bar`, `Bar Chart`, `Column`, `Column Chart`  | `bar`              | Supported                                     |
| `Donut`, `Donut Chart`                        | `donut`            | Supported                                     |
| `Doughnut`, `Doughnut Chart`                  | `doughnut`         | Supported                                     |
| `Gauge`, `Gauge Chart`                        | `gauge`            | Supported                                     |
| `Grouped`, `Grouped Bar`, `Grouped Bar Chart` | `grouped-bar`      | Supported                                     |
| `Heatmap`, `Heat Map`                         | `heatmap`          | Supported                                     |
| `Histogram`                                   | `histogram`        | Supported                                     |
| `Line`, `Line Chart`                          | `line`             | Supported                                     |
| `Pie`, `Pie Chart`                            | `pie`              | Supported                                     |
| `Radar`, `Radar Chart`                        | `radar`            | Supported                                     |
| `Scatter`, `Scatter Plot`, `Scatter Chart`    | `scatter`          | Supported                                     |
| `Stacked`, `Stacked Bar`, `Stacked Bar Chart` | `stacked-bar`      | Supported                                     |
| `Funnel Chart`                                | `funnel`           | Supported                                     |
| `Waterfall Chart`                             | `waterfall`        | Supported                                     |
| `Bubble Chart`                                | `bubble`           | Supported                                     |
| `Treemap`, `Tree Map`                         | `treemap`          | Supported                                     |
| `Calendar Heatmap`, `Calendar Heat Map`       | `calendar-heatmap` | Supported                                     |
| `Candlestick Chart`                           | `candlestick`      | Supported                                     |
| `OHLC Chart`                                  | `ohlc`             | Supported                                     |
| `Rose Chart`                                  | `rose`             | Supported                                     |
| `Polar Area Chart`                            | `polar-area`       | Supported                                     |
| `Sankey`, `Alluvial`                          | none               | Deferred: optional advanced/server-side track |
| `Sunburst`                                    | none               | Deferred: optional hierarchy track            |
| `Network`                                     | none               | Out of chart core; separate graph capability  |
| `Gantt`                                       | none               | Out of chart core; future planning component  |

## Unsupported Flint Types

Unsupported Flint chart names do not fail the page. The adapter:

- returns a warning in `FlintChartAdapterResult.warnings`
- sets `data-uif-chart-warnings` during declarative hydration
- renders a `bar` fallback when possible

This keeps server-rendered dashboards resilient while still making capability gaps explicit for developers.

Advanced flow, hierarchy, network, and planning visuals are intentionally outside chart core for now:

- `Sankey` and `Alluvial` need deterministic layout, node ordering, collision avoidance, and link routing. They may belong in an optional advanced chart package or server-rendered SVG flow.
- `Sunburst` is deferred until hierarchy-chart demand exceeds what `treemap` covers.
- `Network` belongs to a separate graph/layout capability, not the chart package.
- `Gantt` belongs to a future planning/timeline component with scheduling, dependencies, scrolling, and editing behavior.

## QA Checklist

Use this checklist before accepting a new chart type or chart-family change:

- Verify the gallery card at desktop width.
- Verify the gallery card at a mobile width.
- Verify dark theme rendering if the host theme enables it.
- Verify high-contrast readability for marks, labels, legends, and grid lines.
- Verify keyboard focus when `focusable` or drill-down behavior is enabled.
- Verify SVG export.
- Verify PNG export.
- Verify the table fallback when `table` output is enabled.
- Verify Flint mapping status is documented as supported, deferred, or unsupported.

## Release Checklist

Every chart addition should ship with:

- native renderer coverage in `packages/charts/src/index.test.ts`
- declarative gallery example in `examples/chart-gallery/index.html`
- README chart-family mention
- Flint compatibility matrix update
- generated package and root `dist` output
- focused package build and chart tests
- root distribution build when browser-facing output changes

## Example

```html
<div
  data-uif="chart"
  data-uif-chart-format="flint"
  data-uif-data='[{"quarter":"Q1","revenue":120},{"quarter":"Q2","revenue":180}]'
  data-uif-chart-spec='{"chartType":"Line Chart","encodings":{"x":{"field":"quarter"},"y":{"field":"revenue"}}}'
></div>
```
