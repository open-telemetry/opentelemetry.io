// The right-hand legend's shape: a width cap, long labels wrapped at their
// ` - ` separator, and the chart height that fits the legend's lines in one
// column. Design:
// https://opentelemetry.io/site/implementation/plugins-and-scripts/#benchmarks

// Widest the legend may grow; the plot keeps the rest.
const MAX_WIDTH = 260;

// Labels past this length wrap at their separator: the cap above would clip
// them (`Trace10kSPSJaegerGRPC - Dropped Span Count`).
const WRAP_LENGTH = 28;
const legendLines = (label) =>
  label.length > WRAP_LENGTH ? label.split(' - ') : [label];

const LINE_HEIGHT = 24;
const AXES_HEIGHT = 60;
const MAX_ASPECT_RATIO = 2;

// The chart's aspect ratio at the given width, never shallower than the stock
// 2:1 shape: the stock shape squeezes a long legend into the plot on narrow
// screens.
export function aspectRatioFor(labels, width) {
  const lines = labels.reduce((n, label) => n + legendLines(label).length, 0);
  return Math.min(
    MAX_ASPECT_RATIO,
    width / (lines * LINE_HEIGHT + AXES_HEIGHT),
  );
}

// Chart.js `plugins.legend` options.
export const legendOptions = {
  display: true,
  position: 'right',
  maxWidth: MAX_WIDTH,
  labels: {
    generateLabels: (chart) =>
      Chart.defaults.plugins.legend.labels.generateLabels(chart).map((item) => {
        const lines = legendLines(item.text);
        return lines.length > 1 ? { ...item, text: lines } : item;
      }),
  },
};
