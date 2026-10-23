// Community meetings: upcoming occurrences from an iCalendar feed, grouped by
// month and day in the viewer's time zone, with one tag per meeting series to
// filter by. See layouts/_shortcodes/community/meetings.html.

import {
  expandEvents,
  isExcluded,
  parseEvents,
  tagOf,
} from './lib/icalMeetings.mjs';

const CONTAINER_SEL = '.otel-meetings';
const TAG_PARAM = 'meeting';
const WEEK_MS = 7 * 86400000;

function readI18n(container) {
  const d = container.dataset;
  return {
    loading: d.i18nLoading,
    error: d.i18nError,
    timeZone: d.i18nTimeZone,
    eventTime: d.i18nEventTime,
    filterLabel: d.i18nFilterLabel,
    all: d.i18nAll,
    live: d.i18nLive,
    none: d.i18nNone,
    showMore: d.i18nShowMore,
  };
}

function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === undefined || v === null || v === false) continue;
    if (k === 'class') node.className = v;
    else node.setAttribute(k, v === true ? '' : v);
  }
  node.append(...children.filter((c) => c !== null && c !== undefined));
  return node;
}

// ── Formatting ───────────────────────────────────────────────────────────────

function makeFormatters(locale) {
  const make = (options) => new Intl.DateTimeFormat(locale, options);
  // No zone name: the status line names the viewer's zone once.
  const time = make({ hour: 'numeric', minute: '2-digit' });
  const eventFormatters = new Map();
  return {
    viewerZone: make().resolvedOptions().timeZone,
    month: make({ month: 'long', year: 'numeric' }),
    day: make({ weekday: 'long', month: 'long', day: 'numeric' }),
    allDay: make({
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC',
    }),
    timeRange(start, end) {
      return time.formatRange
        ? time.formatRange(start, end)
        : `${time.format(start)} – ${time.format(end)}`;
    },
    // The start in the meeting's own time zone, for the tooltip.
    inEventZone(start, timeZone) {
      let f = eventFormatters.get(timeZone);
      if (!f) {
        f = make({
          timeZone,
          weekday: 'short',
          hour: 'numeric',
          minute: '2-digit',
          timeZoneName: 'short',
        });
        eventFormatters.set(timeZone, f);
      }
      return `${f.format(start)} (${timeZone})`;
    },
  };
}

// Local calendar keys, for grouping in the viewer's time zone.
const monthKey = (d) => `${d.getFullYear()}-${d.getMonth()}`;
const dayKey = (d) => `${monthKey(d)}-${d.getDate()}`;

// ── Rendering ────────────────────────────────────────────────────────────────

function renderTags(tags, selected, i18n, onSelect) {
  const group = el('div', {
    class: 'otel-meetings__tags',
    role: 'group',
    'aria-label': i18n.filterLabel,
  });
  const button = (label, tag) => {
    const b = el(
      'button',
      {
        type: 'button',
        class: 'otel-meetings__tag',
        'aria-pressed': String(tag === selected),
      },
      label,
    );
    b.addEventListener('click', () => onSelect(tag));
    return b;
  };
  group.append(button(i18n.all, null));
  for (const tag of tags) group.append(button(`#${tag}`, tag));
  return group;
}

function renderEvent(o, now, fmt, i18n, onSelect) {
  const live = o.start <= now && now < o.end;
  const title = o.url ? el('a', { href: o.url }, o.title) : o.title;
  const when = o.allDay
    ? fmt.allDay.format(o.start)
    : fmt.timeRange(o.start, o.end);
  const time = el(
    'time',
    {
      datetime: new Date(o.start).toISOString(),
      title:
        o.timeZone && o.timeZone !== fmt.viewerZone
          ? i18n.eventTime.replace(
              '{time}',
              fmt.inEventZone(o.start, o.timeZone),
            )
          : null,
    },
    when,
  );
  const tag = el(
    'button',
    { type: 'button', class: 'otel-meetings__tag' },
    `#${o.tag}`,
  );
  tag.addEventListener('click', () => onSelect(o.tag));
  return el(
    'li',
    {
      class: `otel-meetings__event${live ? ' otel-meetings__event--live' : ''}`,
    },
    el(
      'h3',
      {},
      title,
      live ? el('span', { class: 'otel-meetings__live' }, i18n.live) : null,
    ),
    el('p', { class: 'otel-meetings__when' }, time),
    tag,
  );
}

function renderList(occurrences, now, fmt, i18n, onSelect) {
  if (!occurrences.length) {
    return el('p', { class: 'otel-meetings__none' }, i18n.none);
  }
  const list = el('ul', { class: 'otel-meetings__list' });
  let monthItems;
  let dayItems;
  let lastMonth;
  let lastDay;
  for (const o of occurrences) {
    // An all-day date is a calendar date, not a moment, so it isn't shifted.
    const d = new Date(o.start);
    const local = o.allDay
      ? new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
      : d;
    if (monthKey(local) !== lastMonth) {
      lastMonth = monthKey(local);
      lastDay = undefined;
      monthItems = el('ul');
      list.append(
        el(
          'li',
          {},
          el('h2', { class: 'otel-meetings__month' }, fmt.month.format(local)),
          monthItems,
        ),
      );
    }
    if (dayKey(local) !== lastDay) {
      lastDay = dayKey(local);
      dayItems = el('ul');
      monthItems.append(
        el(
          'li',
          { class: 'otel-meetings__day' },
          el('p', { class: 'otel-meetings__day-name' }, fmt.day.format(local)),
          dayItems,
        ),
      );
    }
    dayItems.append(renderEvent(o, now, fmt, i18n, onSelect));
  }
  return list;
}

// ── State and wiring ─────────────────────────────────────────────────────────

function readSelectedTag(tags) {
  const tag = new URLSearchParams(location.search).get(TAG_PARAM);
  return tags.includes(tag) ? tag : null;
}

function writeSelectedTag(tag) {
  const url = new URL(location.href);
  if (tag) url.searchParams.set(TAG_PARAM, tag);
  else url.searchParams.delete(TAG_PARAM);
  history.replaceState(history.state, '', url);
}

async function init(container) {
  const i18n = readI18n(container);
  const { icsUrl, exclude = '' } = container.dataset;
  const weeks = Number(container.dataset.weeks) || 4;
  const maxWeeks = Math.max(weeks, Number(container.dataset.maxWeeks) || 26);
  const status = container.querySelector('.otel-meetings__status');
  const body = container.querySelector('.otel-meetings__body');
  status.textContent = i18n.loading;

  let events;
  try {
    const response = await fetch(icsUrl);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    events = parseEvents(await response.text());
  } catch (err) {
    console.error(`[otel-meetings] ${icsUrl}:`, err);
    status.textContent = i18n.error;
    return;
  }

  const now = Date.now();
  const occurrences = expandEvents(events, {
    rangeStart: now,
    rangeEnd: now + maxWeeks * WEEK_MS,
    onWarning: (w) => console.warn(`[otel-meetings] ${w}`),
  })
    .filter((o) => !isExcluded(o.title, exclude))
    .map((o) => ({ ...o, tag: tagOf(o.title) }));
  const tags = [...new Set(occurrences.map((o) => o.tag))].sort();

  const fmt = makeFormatters(document.documentElement.lang || undefined);
  let selected = readSelectedTag(tags);
  let shownWeeks = weeks;

  const render = () => {
    const cutoff = now + shownWeeks * WEEK_MS;
    const shown = occurrences.filter(
      (o) => o.start < cutoff && (!selected || o.tag === selected),
    );
    const more = el(
      'button',
      { type: 'button', class: 'btn btn-outline-primary otel-meetings__more' },
      i18n.showMore,
    );
    more.addEventListener('click', () => {
      shownWeeks = Math.min(shownWeeks + weeks, maxWeeks);
      render();
      // Rendering replaces the button, so keep keyboard focus on its successor.
      body
        .querySelector('.otel-meetings__more')
        ?.focus({ preventScroll: true });
    });
    body.replaceChildren(
      renderTags(tags, selected, i18n, onSelect),
      renderList(shown, now, fmt, i18n, onSelect),
      shownWeeks < maxWeeks ? more : '',
    );
  };
  const onSelect = (tag) => {
    selected = tag === selected ? null : tag;
    writeSelectedTag(selected);
    render();
    const tagGroup = body.querySelector('.otel-meetings__tags');
    tagGroup.scrollIntoView({ block: 'nearest' });
    tagGroup
      .querySelector('[aria-pressed="true"]')
      .focus({ preventScroll: true });
  };

  status.textContent = i18n.timeZone.replace('{timeZone}', fmt.viewerZone);
  render();
}

document.querySelectorAll(CONTAINER_SEL).forEach(init);
