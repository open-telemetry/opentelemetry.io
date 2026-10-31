// This module opens a popover from a chart point, one at a time, anchored at
// the point, with Bootstrap's Popover (Docsy's main bundle); the chart's canvas
// tooltip is off while it's open. One export:
//
// - `pointPopover(wrapper, scroller, contentOf)`: the Chart.js options that
//   wire a chart's points to the popover, `contentOf` building its body.
//
// Design:
// https://opentelemetry.io/site/implementation/plugins-and-scripts/#benchmarks

let open = null;
let ringColor;

// The chart options that wire its points to the popover: the clickable cue
// (cursor and hover ring), the click, and the dismissals the chart's own
// movement needs, since the popover hangs off a point's position. `contentOf`
// gets the clicked data point, its dataset and the chart, and returns the
// popover's body, a DOM node.
export function pointPopover(wrapper, scroller, contentOf) {
  ringColor ??= getComputedStyle(document.documentElement)
    .getPropertyValue('--bs-body-color')
    .trim();
  scroller.addEventListener('scroll', closePopover);
  return {
    onHover: (event, elements) => {
      event.native.target.style.cursor = elements.length ? 'pointer' : '';
    },
    elements: {
      point: {
        hoverRadius: 6,
        hoverBorderWidth: 2,
        hoverBorderColor: ringColor,
      },
    },
    onClick: (event, elements, chart) => {
      if (!elements.length) return;
      const { datasetIndex, index } = elements[0];
      const dataset = chart.data.datasets[datasetIndex];
      openPopover(
        chart,
        wrapper,
        chart.getDatasetMeta(datasetIndex).data[index],
        contentOf(dataset.data[index], dataset, chart),
      );
    },
    onResize: closePopover,
  };
}

function closePopover() {
  if (!open) return;
  const { popover, anchor, chart } = open;
  open = null;
  popover.dispose();
  anchor.remove();
  // Cleared again on close: re-enabling replays the chart's last pointer
  // event, which on touch is still the tap that opened the popover.
  chart.tooltip.setActiveElements([], { x: 0, y: 0 });
  chart.options.plugins.tooltip.enabled = true;
  chart.update('none');
}

// `content` is a DOM node the caller built; `point` is the chart element.
function openPopover(chart, wrapper, point, content) {
  closePopover();
  if (!window.bootstrap?.Popover) return;

  const anchor = document.createElement('span');
  anchor.className = 'otel-point-anchor';
  anchor.style.left = `${point.x}px`;
  anchor.style.top = `${point.y}px`;
  wrapper.appendChild(anchor);

  const popover = new bootstrap.Popover(anchor, {
    html: true,
    trigger: 'manual',
    placement: 'top',
    content,
  });
  popover.show();
  open = { popover, anchor, chart };
  // The canvas tooltip would sit under the popover (a tap leaves it up): its
  // fade-in is stopped and its state cleared before it's disabled, or the
  // stale one paints back when re-enabled.
  chart.stop();
  chart.tooltip.setActiveElements([], { x: 0, y: 0 });
  chart.options.plugins.tooltip.enabled = false;
  chart.update('none');
}

document.addEventListener(
  'click',
  (event) => {
    if (!open) return;
    const tip = document.getElementById(
      open.anchor.getAttribute('aria-describedby') ?? '',
    );
    if (!tip?.contains(event.target)) closePopover();
  },
  true,
);
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closePopover();
});
