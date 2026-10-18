// The popover a chart point opens: one at a time, anchored at the point, with
// Bootstrap's Popover (Docsy's main bundle). The chart's canvas tooltip is off
// while it's open. Design:
// https://opentelemetry.io/site/implementation/plugins-and-scripts/#benchmarks

let open = null;

export function closePopover() {
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
export function openPopover(chart, wrapper, point, content) {
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
