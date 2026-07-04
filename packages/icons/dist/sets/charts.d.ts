declare const chartIcons: {
    readonly 'area-chart': {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"m7 15 4-5 3 3 5-7v12H7z\"></path>";
    };
    readonly 'bar-chart': {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"M7 16V9\"></path><path d=\"M12 16V5\"></path><path d=\"M17 16v-4\"></path>";
    };
    readonly chart: {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"m7 14 3-3 3 2 5-6\"></path>";
    };
    readonly dashboard: {
        readonly body: "<path d=\"M4 13a8 8 0 1 1 16 0\"></path><path d=\"M12 13l4-4\"></path><path d=\"M5 19h14\"></path>";
    };
    readonly 'donut-chart': {
        readonly body: "<path d=\"M12 3a9 9 0 1 1-8.5 6\"></path><path d=\"M12 3v6\"></path><circle cx=\"12\" cy=\"12\" r=\"3\"></circle>";
    };
    readonly 'gauge-chart': {
        readonly body: "<path d=\"M4 15a8 8 0 1 1 16 0\"></path><path d=\"M12 15l5-5\"></path><path d=\"M7 19h10\"></path>";
    };
    readonly histogram: {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"M7 17v-5\"></path><path d=\"M11 17V7\"></path><path d=\"M15 17v-8\"></path><path d=\"M19 17v-3\"></path>";
    };
    readonly 'line-chart': {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"m7 15 4-4 3 3 5-7\"></path>";
    };
    readonly 'pie-chart': {
        readonly body: "<path d=\"M21 12A9 9 0 1 1 12 3v9h9z\"></path><path d=\"M12 3a9 9 0 0 1 9 9h-9V3z\"></path>";
    };
    readonly 'radar-chart': {
        readonly body: "<path d=\"m12 3 8 5v8l-8 5-8-5V8l8-5z\"></path><path d=\"m12 7 4 3v4l-4 3-4-3v-4l4-3z\"></path><path d=\"M12 3v18\"></path><path d=\"M4 8l16 8\"></path><path d=\"M20 8 4 16\"></path>";
    };
    readonly 'scatter-chart': {
        readonly body: "<path d=\"M3 3v18h18\"></path><circle cx=\"8\" cy=\"15\" r=\"1.5\"></circle><circle cx=\"12\" cy=\"10\" r=\"1.5\"></circle><circle cx=\"17\" cy=\"7\" r=\"1.5\"></circle><circle cx=\"16\" cy=\"16\" r=\"1.5\"></circle>";
    };
    readonly sparkline: {
        readonly body: "<path d=\"m3 16 4-4 3 2 4-6 3 4 4-5\"></path>";
    };
    readonly 'chart-candlestick': {
        readonly body: "<path d=\"M4 3v18h17\"></path><path d=\"M8 7v8\"></path><rect x=\"6\" y=\"9\" width=\"4\" height=\"4\"></rect><path d=\"M14 5v11\"></path><rect x=\"12\" y=\"7\" width=\"4\" height=\"6\"></rect><path d=\"M20 10v8\"></path><rect x=\"18\" y=\"12\" width=\"4\" height=\"4\"></rect>";
    };
    readonly 'chart-column': {
        readonly body: "<path d=\"M3 3v18h18\"></path><rect x=\"6\" y=\"11\" width=\"3\" height=\"6\"></rect><rect x=\"11\" y=\"7\" width=\"3\" height=\"10\"></rect><rect x=\"16\" y=\"13\" width=\"3\" height=\"4\"></rect>";
    };
    readonly 'chart-no-axes': {
        readonly body: "<path d=\"m4 16 4-5 3 3 4-7 5 4\"></path><circle cx=\"8\" cy=\"11\" r=\"1\"></circle><circle cx=\"15\" cy=\"7\" r=\"1\"></circle><circle cx=\"20\" cy=\"11\" r=\"1\"></circle>";
    };
    readonly 'chart-stacked': {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"M7 17V8\"></path><path d=\"M12 17V5\"></path><path d=\"M17 17v-6\"></path><path d=\"M7 12h10\"></path>";
    };
    readonly 'axis-x': {
        readonly body: "<path d=\"M3 18h18\"></path><path d=\"m18 15 3 3-3 3\"></path><path d=\"M7 6v12\"></path><path d=\"M12 10v8\"></path><path d=\"M17 13v5\"></path>";
    };
    readonly 'axis-y': {
        readonly body: "<path d=\"M6 21V3\"></path><path d=\"m3 6 3-3 3 3\"></path><path d=\"M6 18h12\"></path><path d=\"M6 13h8\"></path><path d=\"M6 8h5\"></path>";
    };
    readonly 'bubble-chart': {
        readonly body: "<path d=\"M3 3v18h18\"></path><circle cx=\"8\" cy=\"15\" r=\"2\"></circle><circle cx=\"14\" cy=\"10\" r=\"3\"></circle><circle cx=\"18\" cy=\"17\" r=\"1.5\"></circle>";
    };
    readonly 'chart-combo': {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"m7 15 4-4 3 3 5-7\"></path><path d=\"M7 17v-4\"></path><path d=\"M12 17v-7\"></path><path d=\"M17 17v-5\"></path>";
    };
    readonly 'chart-network': {
        readonly body: "<circle cx=\"6\" cy=\"8\" r=\"3\"></circle><circle cx=\"18\" cy=\"8\" r=\"3\"></circle><circle cx=\"12\" cy=\"18\" r=\"3\"></circle><path d=\"M9 8h6\"></path><path d=\"m8 10 3 5\"></path><path d=\"m16 10-3 5\"></path>";
    };
    readonly 'chart-spline': {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"M6 16c3-8 6 4 9-4 1-3 3-5 5-5\"></path>";
    };
    readonly 'chart-step': {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"M6 16h4v-5h4V7h5\"></path>";
    };
    readonly 'conversion-funnel': {
        readonly body: "<path d=\"M4 5h16l-6 7v5l-4 2v-7L4 5z\"></path><path d=\"M8 9h8\"></path>";
    };
    readonly dial: {
        readonly body: "<path d=\"M4 15a8 8 0 1 1 16 0\"></path><path d=\"M12 15l3-5\"></path><path d=\"M7 19h10\"></path><path d=\"M7 15h.01\"></path><path d=\"M17 15h.01\"></path>";
    };
    readonly forecast: {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"m6 16 4-4 3 3 5-8\"></path><path d=\"M18 7h3v3\"></path><path d=\"M7 8h.01\"></path><path d=\"M11 6h.01\"></path><path d=\"M15 5h.01\"></path>";
    };
    readonly 'funnel-chart': {
        readonly body: "<path d=\"M4 5h16l-6 7v5l-4 2v-7L4 5z\"></path><path d=\"M7 9h10\"></path><path d=\"M9 13h6\"></path>";
    };
    readonly heatmap: {
        readonly body: "<rect x=\"3\" y=\"3\" width=\"5\" height=\"5\"></rect><rect x=\"10\" y=\"3\" width=\"5\" height=\"5\"></rect><rect x=\"17\" y=\"3\" width=\"4\" height=\"5\"></rect><rect x=\"3\" y=\"10\" width=\"5\" height=\"5\"></rect><rect x=\"10\" y=\"10\" width=\"5\" height=\"5\"></rect><rect x=\"17\" y=\"10\" width=\"4\" height=\"5\"></rect><rect x=\"3\" y=\"17\" width=\"5\" height=\"4\"></rect><rect x=\"10\" y=\"17\" width=\"5\" height=\"4\"></rect><rect x=\"17\" y=\"17\" width=\"4\" height=\"4\"></rect>";
    };
    readonly 'horizontal-bar-chart': {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"M7 8h10\"></path><path d=\"M7 12h14\"></path><path d=\"M7 16h7\"></path>";
    };
    readonly kpi: {
        readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"M7 14h3\"></path><path d=\"M12 14h5\"></path><path d=\"m7 10 3 2 3-4 4 3\"></path>";
    };
    readonly meter: {
        readonly body: "<path d=\"M4 15a8 8 0 1 1 16 0\"></path><path d=\"M12 15l5-5\"></path><path d=\"M8 19h8\"></path><path d=\"M6 15h.01\"></path><path d=\"M18 15h.01\"></path>";
    };
    readonly 'progress-ring': {
        readonly body: "<path d=\"M12 3a9 9 0 1 1-8.5 6\"></path><path d=\"M12 3v4\"></path><circle cx=\"12\" cy=\"12\" r=\"4\"></circle>";
    };
    readonly regression: {
        readonly body: "<path d=\"M3 3v18h18\"></path><circle cx=\"7\" cy=\"15\" r=\"1.5\"></circle><circle cx=\"11\" cy=\"12\" r=\"1.5\"></circle><circle cx=\"16\" cy=\"8\" r=\"1.5\"></circle><path d=\"M6 17 19 6\"></path>";
    };
    readonly scorecard: {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"M7 9h5\"></path><path d=\"M7 13h10\"></path><path d=\"M7 17h7\"></path><circle cx=\"17\" cy=\"9\" r=\"1\"></circle>";
    };
    readonly 'stacked-area-chart': {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"m6 17 4-6 4 3 4-7v10H6z\"></path><path d=\"m6 17 4-3 4 1 4-4\"></path>";
    };
    readonly 'table-chart': {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"M3 10h18\"></path><path d=\"M9 4v16\"></path><path d=\"M15 4v16\"></path><path d=\"m6 17 3-3 3 2 5-5\"></path>";
    };
    readonly treemap: {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"M12 4v16\"></path><path d=\"M3 12h9\"></path><path d=\"M12 9h9\"></path><path d=\"M16 9v11\"></path>";
    };
    readonly 'trend-down': {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"m6 8 5 5 4-4 4 4\"></path><path d=\"M19 9v4h-4\"></path>";
    };
    readonly 'trend-up': {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"m6 16 5-5 4 4 4-8\"></path><path d=\"M15 7h4v4\"></path>";
    };
    readonly 'ab-test': {
        readonly body: "<path d=\"M4 19 8 5h2l4 14\"></path><path d=\"M6 14h6\"></path><path d=\"M15 5h3a3 3 0 0 1 0 6h-3V5z\"></path><path d=\"M15 11h4a4 4 0 0 1 0 8h-4v-8z\"></path>";
    };
    readonly cohort: {
        readonly body: "<path d=\"M3 3v18h18\"></path><circle cx=\"8\" cy=\"9\" r=\"2\"></circle><circle cx=\"14\" cy=\"8\" r=\"2\"></circle><circle cx=\"17\" cy=\"15\" r=\"2\"></circle><path d=\"M8 11v6\"></path><path d=\"M14 10v7\"></path><path d=\"M17 17v1\"></path>";
    };
    readonly experiment: {
        readonly body: "<path d=\"M9 2h6\"></path><path d=\"M10 2v6l-5.5 9.5A3 3 0 0 0 7.1 22h9.8a3 3 0 0 0 2.6-4.5L14 8V2\"></path><path d=\"M8 16h8\"></path><path d=\"M10 12h4\"></path>";
    };
    readonly 'goal-chart': {
        readonly body: "<path d=\"M3 3v18h18\"></path><circle cx=\"15\" cy=\"9\" r=\"5\"></circle><circle cx=\"15\" cy=\"9\" r=\"2\"></circle><path d=\"m7 17 4-4 2 2 6-6\"></path>";
    };
    readonly 'growth-loop': {
        readonly body: "<path d=\"M17 3h4v4\"></path><path d=\"M21 3 14 10\"></path><path d=\"M7 21H3v-4\"></path><path d=\"M3 21l7-7\"></path><path d=\"M4 9a8 8 0 0 1 13-4\"></path><path d=\"M20 15a8 8 0 0 1-13 4\"></path>";
    };
    readonly retention: {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"M7 16c2-7 5-7 7 0 1.5 4 3.5 2 5-3\"></path><path d=\"M7 8h.01\"></path><path d=\"M12 8h.01\"></path><path d=\"M17 8h.01\"></path>";
    };
    readonly segment: {
        readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"M12 3v9h9\"></path><path d=\"M12 12 6 18\"></path>";
    };
    readonly 'target-metric': {
        readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><circle cx=\"12\" cy=\"12\" r=\"5\"></circle><circle cx=\"12\" cy=\"12\" r=\"1\"></circle><path d=\"M17 7h4v4\"></path><path d=\"m21 7-5 5\"></path>";
    };
    readonly activation: {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"M7 17V9\"></path><path d=\"M12 17v-5\"></path><path d=\"M17 17V6\"></path><path d=\"m14 9 3-3 3 3\"></path>";
    };
    readonly benchmark: {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"M6 16h12\"></path><path d=\"M6 12h8\"></path><path d=\"M6 8h4\"></path><path d=\"M18 5v14\"></path>";
    };
    readonly churn: {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"m6 8 5 5 4-4 4 6\"></path><path d=\"M19 11v4h-4\"></path>";
    };
    readonly 'expansion-revenue': {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"M7 17V9\"></path><path d=\"M12 17V7\"></path><path d=\"M17 17V5\"></path><path d=\"m15 7 2-2 2 2\"></path>";
    };
    readonly 'forecast-band': {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"m6 17 4-6 4 3 4-7\"></path><path d=\"m6 13 4-4 4 2 4-5\"></path><path d=\"m6 20 4-5 4 4 4-8\"></path>";
    };
    readonly ltv: {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"m6 16 4-4 3 3 5-8\"></path><path d=\"M6 8h3\"></path><path d=\"M6 11h5\"></path><path d=\"M17 7h4v4\"></path>";
    };
    readonly mrr: {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"M6 17V9l3 4 3-4v8\"></path><path d=\"M15 17V9h3a2 2 0 0 1 0 4h-3\"></path><path d=\"m18 13 3 4\"></path>";
    };
    readonly nps: {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"M7 15a5 5 0 0 1 10 0\"></path><path d=\"M7 9h.01\"></path><path d=\"M17 9h.01\"></path><path d=\"M10 18h4\"></path>";
    };
    readonly 'revenue-chart': {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"m6 16 4-4 3 3 5-8\"></path><path d=\"M12 7v10\"></path><path d=\"M15 9.5A3 3 0 0 0 12 8c-1.7 0-3 1-3 2.3 0 3.2 6 1.4 6 4.6 0 1.2-1.3 2.1-3 2.1a4 4 0 0 1-3.5-1.8\"></path>";
    };
    readonly roi: {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"m7 16 4-4 3 3 4-7\"></path><path d=\"m16 8 2-2 2 2\"></path><path d=\"M8 8h.01\"></path><path d=\"M12 8h.01\"></path>";
    };
    readonly 'session-chart': {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"M7 17V9\"></path><path d=\"M12 17v-4\"></path><path d=\"M17 17V6\"></path><circle cx=\"17\" cy=\"6\" r=\"2\"></circle>";
    };
    readonly 'win-rate': {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"m7 15 3 3 7-10\"></path><path d=\"M7 8h4\"></path><path d=\"M7 12h3\"></path><path d=\"M17 8h4v4\"></path>";
    };
    readonly 'adoption-chart': {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"M7 17V9\"></path><path d=\"M12 17v-6\"></path><path d=\"M17 17V7\"></path><path d=\"m14 10 3-3 3 3\"></path>";
    };
    readonly 'capacity-chart': {
        readonly body: "<path d=\"M3 3v18h18\"></path><rect x=\"6\" y=\"8\" width=\"3\" height=\"9\"></rect><rect x=\"11\" y=\"6\" width=\"3\" height=\"11\"></rect><rect x=\"16\" y=\"11\" width=\"3\" height=\"6\"></rect><path d=\"M6 5h13\"></path>";
    };
    readonly 'cohort-grid': {
        readonly body: "<path d=\"M3 3v18h18\"></path><rect x=\"6\" y=\"6\" width=\"3\" height=\"3\"></rect><rect x=\"11\" y=\"6\" width=\"3\" height=\"3\"></rect><rect x=\"16\" y=\"6\" width=\"3\" height=\"3\"></rect><rect x=\"6\" y=\"11\" width=\"3\" height=\"3\"></rect><rect x=\"11\" y=\"11\" width=\"3\" height=\"3\"></rect><rect x=\"16\" y=\"16\" width=\"3\" height=\"3\"></rect>";
    };
    readonly 'contribution-chart': {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"M7 17V8\"></path><path d=\"M12 17v-5\"></path><path d=\"M17 17v-8\"></path><path d=\"M7 8h10\"></path><path d=\"M12 12h5\"></path>";
    };
    readonly 'dependency-chart': {
        readonly body: "<circle cx=\"6\" cy=\"8\" r=\"3\"></circle><circle cx=\"18\" cy=\"8\" r=\"3\"></circle><circle cx=\"12\" cy=\"18\" r=\"3\"></circle><path d=\"M9 8h6\"></path><path d=\"m8 10 3 5\"></path><path d=\"m16 10-3 5\"></path><path d=\"M3 21h18\"></path>";
    };
    readonly 'error-rate': {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"m6 16 4-5 3 4 5-8\"></path><path d=\"M16 14l4 4\"></path><path d=\"m20 14-4 4\"></path>";
    };
    readonly latency: {
        readonly body: "<path d=\"M4 15a8 8 0 1 1 16 0\"></path><path d=\"M12 15l5-5\"></path><path d=\"M7 19h10\"></path><path d=\"M12 3v3\"></path><path d=\"M4 15h3\"></path><path d=\"M17 15h3\"></path>";
    };
    readonly percentile: {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"m6 17 4-7 4 3 4-8\"></path><path d=\"M6 12h12\"></path><path d=\"M6 8h8\"></path>";
    };
    readonly saturation: {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"M7 17V8\"></path><path d=\"M12 17V5\"></path><path d=\"M17 17v-3\"></path><path d=\"M5 7h14\"></path><path d=\"M5 13h14\"></path>";
    };
    readonly 'throughput-chart': {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"M6 16h4v-4h4V8h5\"></path><path d=\"m16 5 3 3-3 3\"></path>";
    };
    readonly 'vertical-bar-chart': {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"M8 17V9\"></path><path d=\"M12 17V6\"></path><path d=\"M16 17v-5\"></path>";
    };
    readonly 'waterfall-chart': {
        readonly body: "<path d=\"M3 3v18h18\"></path><rect x=\"6\" y=\"12\" width=\"3\" height=\"5\"></rect><rect x=\"11\" y=\"8\" width=\"3\" height=\"4\"></rect><rect x=\"16\" y=\"10\" width=\"3\" height=\"7\"></rect><path d=\"M9 12h2\"></path><path d=\"M14 10h2\"></path>";
    };
    readonly 'anomaly-chart': {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"m6 16 4-4 3 3 5-8\"></path><circle cx=\"18\" cy=\"7\" r=\"2\"></circle><path d=\"M18 4v1\"></path><path d=\"M18 9v1\"></path>";
    };
    readonly 'baseline-chart': {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"M6 12h13\"></path><path d=\"m6 16 4-5 4 3 5-7\"></path>";
    };
    readonly 'box-plot': {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"M8 7v10\"></path><rect x=\"6\" y=\"10\" width=\"4\" height=\"4\"></rect><path d=\"M16 5v14\"></path><rect x=\"14\" y=\"8\" width=\"4\" height=\"7\"></rect>";
    };
    readonly 'burndown-chart': {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"m6 7 4 4 3 2 5 4\"></path><path d=\"M6 17h12\"></path>";
    };
    readonly 'burnup-chart': {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"m6 17 4-4 3-2 5-4\"></path><path d=\"M6 7h12\"></path>";
    };
    readonly 'control-chart': {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"M6 8h13\"></path><path d=\"M6 16h13\"></path><path d=\"m6 12 4-2 4 4 5-2\"></path>";
    };
    readonly 'distribution-chart': {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"M6 17c2-8 4-8 6 0 2-8 4-8 6 0\"></path><path d=\"M6 17h12\"></path>";
    };
    readonly 'gantt-chart': {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"M7 7h7\"></path><path d=\"M10 12h8\"></path><path d=\"M6 17h10\"></path><path d=\"M7 5v14\"></path>";
    };
    readonly 'health-score': {
        readonly body: "<path d=\"M4 15a8 8 0 1 1 16 0\"></path><path d=\"M12 15l4-5\"></path><path d=\"M7 19h10\"></path><path d=\"M8 9h2l2 5 2-8 2 3h2\"></path>";
    };
    readonly 'leaderboard-chart': {
        readonly body: "<path d=\"M3 3v18h18\"></path><rect x=\"6\" y=\"11\" width=\"3\" height=\"6\"></rect><rect x=\"11\" y=\"7\" width=\"3\" height=\"10\"></rect><rect x=\"16\" y=\"13\" width=\"3\" height=\"4\"></rect><path d=\"M12 4h1\"></path>";
    };
    readonly 'map-chart': {
        readonly body: "<path d=\"M9 18 3 21V6l6-3 6 3 6-3v15l-6 3-6-3z\"></path><path d=\"M9 3v15\"></path><path d=\"M15 6v15\"></path><circle cx=\"12\" cy=\"12\" r=\"2\"></circle>";
    };
    readonly 'matrix-chart': {
        readonly body: "<path d=\"M3 3v18h18\"></path><rect x=\"6\" y=\"6\" width=\"5\" height=\"5\"></rect><rect x=\"13\" y=\"6\" width=\"5\" height=\"5\"></rect><rect x=\"6\" y=\"13\" width=\"5\" height=\"5\"></rect><rect x=\"13\" y=\"13\" width=\"5\" height=\"5\"></rect>";
    };
    readonly 'pareto-chart': {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"M7 17V9\"></path><path d=\"M12 17v-5\"></path><path d=\"M17 17v-8\"></path><path d=\"m6 8 4 3 4-1 5-5\"></path>";
    };
    readonly 'sankey-chart': {
        readonly body: "<path d=\"M4 7h5\"></path><path d=\"M4 17h5\"></path><path d=\"M15 12h5\"></path><path d=\"M9 7c4 0 2 5 6 5\"></path><path d=\"M9 17c4 0 2-5 6-5\"></path><rect x=\"3\" y=\"5\" width=\"2\" height=\"4\"></rect><rect x=\"19\" y=\"10\" width=\"2\" height=\"4\"></rect>";
    };
    readonly 'bullet-chart': {
        readonly body: "<path d=\"M3 3v18h18\"></path><rect x=\"6\" y=\"9\" width=\"12\" height=\"6\"></rect><path d=\"M6 12h9\"></path><path d=\"M16 7v10\"></path>";
    };
    readonly 'funnel-stage': {
        readonly body: "<path d=\"M4 5h16l-6 7v5l-4 2v-7L4 5z\"></path><path d=\"M7 9h10\"></path><path d=\"M9 13h6\"></path><circle cx=\"18\" cy=\"18\" r=\"2\"></circle>";
    };
    readonly 'metric-card': {
        readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"M7 10h5\"></path><path d=\"M7 14h10\"></path><path d=\"m14 10 2-2 3 3\"></path><path d=\"M16 8v6\"></path>";
    };
    readonly 'pivot-chart': {
        readonly body: "<path d=\"M3 3v18h18\"></path><rect x=\"6\" y=\"6\" width=\"5\" height=\"5\"></rect><rect x=\"13\" y=\"6\" width=\"5\" height=\"5\"></rect><rect x=\"6\" y=\"13\" width=\"5\" height=\"5\"></rect><path d=\"M13 15h5\"></path><path d=\"m16 12 2 3-2 3\"></path>";
    };
    readonly 'variance-chart': {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"M7 17V8\"></path><path d=\"M12 17V5\"></path><path d=\"M17 17v-6\"></path><path d=\"M6 12h13\"></path><path d=\"m17 8 2 2 2-2\"></path>";
    };
};

export { chartIcons };
