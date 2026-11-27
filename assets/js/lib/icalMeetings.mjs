/**
 * Parse an iCalendar (RFC 5545) feed and expand its events into the
 * occurrences that fall in a time range.
 *
 * Covers what meeting calendars use: TZID-qualified, UTC and all-day start
 * times; DTEND or DURATION; RRULE with FREQ DAILY, WEEKLY, MONTHLY or YEARLY,
 * INTERVAL, UNTIL, COUNT, BYDAY (with ordinals for MONTHLY), BYMONTHDAY and
 * BYMONTH; RDATE, EXDATE, RECURRENCE-ID overrides and STATUS:CANCELLED.
 *
 * TZID values are read as IANA time zone names and converted with `Intl`, so
 * the feed's VTIMEZONE blocks are not needed. A series whose rule uses a part
 * outside that list keeps its first occurrence only.
 */

const DAY_MS = 86400000;
const WEEKDAYS = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
const SUPPORTED_RULE_PARTS = new Set([
  'FREQ',
  'INTERVAL',
  'UNTIL',
  'COUNT',
  'BYDAY',
  'BYMONTHDAY',
  'BYMONTH',
  'WKST',
]);
// Bounds the periods (days, weeks, months or years) a rule is walked through,
// which ends a rule that matches nothing, such as BYMONTHDAY=31;BYMONTH=2.
const MAX_ITERATIONS = 50000;

// ── Content lines ────────────────────────────────────────────────────────────

function unfold(text) {
  return text.replace(/\r\n?/g, '\n').replace(/\n[ \t]/g, '');
}

function unescapeText(value) {
  return value.replace(/\\([\\;,nN])/g, (_, c) =>
    c === 'n' || c === 'N' ? '\n' : c,
  );
}

/** Split a content line into name, params and value. */
export function parseLine(line) {
  let i = 0;
  let inQuotes = false;
  for (; i < line.length; i++) {
    const c = line[i];
    if (c === '"') inQuotes = !inQuotes;
    else if (c === ':' && !inQuotes) break;
  }
  const head = line.slice(0, i);
  const value = line.slice(i + 1);
  const [name, ...rawParams] = head.split(';');
  const params = {};
  for (const p of rawParams) {
    const eq = p.indexOf('=');
    if (eq < 0) continue;
    params[p.slice(0, eq).toUpperCase()] = p
      .slice(eq + 1)
      .replace(/^"|"$/g, '');
  }
  return { name: name.toUpperCase(), params, value };
}

/**
 * Parse the VEVENT components of a feed. Each event maps a property name to
 * the list of `{ params, value }` it carries.
 */
export function parseEvents(text) {
  const events = [];
  let current = null;
  let depth = 0; // nesting below the VEVENT, such as a VALARM
  for (const line of unfold(text).split('\n')) {
    if (!line) continue;
    const { name, params, value } = parseLine(line);
    if (name === 'BEGIN') {
      if (current) depth++;
      else if (value.toUpperCase() === 'VEVENT') current = {};
    } else if (name === 'END' && current) {
      if (depth > 0) depth--;
      else {
        events.push(current);
        current = null;
      }
    } else if (current && depth === 0) {
      (current[name] ??= []).push({ params, value });
    }
  }
  return events;
}

// ── Time zones ───────────────────────────────────────────────────────────────

const formatters = new Map();

function partsFormatter(timeZone) {
  let f = formatters.get(timeZone);
  if (!f) {
    f = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hourCycle: 'h23',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
    });
    formatters.set(timeZone, f);
  }
  return f;
}

/** Whether `Intl` knows the time zone. */
export function isValidTimeZone(timeZone) {
  try {
    partsFormatter(timeZone);
    return true;
  } catch {
    return false;
  }
}

function offsetAt(utcMs, timeZone) {
  const p = {};
  for (const { type, value } of partsFormatter(timeZone).formatToParts(utcMs)) {
    p[type] = Number(value);
  }
  const asUtc = Date.UTC(
    p.year,
    p.month - 1,
    p.day,
    p.hour,
    p.minute,
    p.second,
  );
  return asUtc - Math.floor(utcMs / 1000) * 1000;
}

/**
 * The instant of a wall-clock time in a time zone. A time skipped by a
 * daylight-saving change resolves to the instant after the gap.
 */
export function zonedTimeToUtc(wall, timeZone) {
  const guess = Date.UTC(
    wall.year,
    wall.month - 1,
    wall.day,
    wall.hour,
    wall.minute,
    wall.second,
  );
  if (!timeZone || timeZone === 'UTC') return guess;
  const first = guess - offsetAt(guess, timeZone);
  const second = guess - offsetAt(first, timeZone);
  return Math.max(first, second);
}

// ── Date values ──────────────────────────────────────────────────────────────

/**
 * Parse a DATE or DATE-TIME value. Returns the wall-clock fields, the time
 * zone they are in (`'UTC'` for a trailing `Z`), and whether it is a date.
 */
export function parseDateValue(value, tzid) {
  const m = /^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})(Z)?)?$/.exec(
    value.trim(),
  );
  if (!m) return null;
  const isDate = m[4] === undefined;
  const wall = {
    year: Number(m[1]),
    month: Number(m[2]),
    day: Number(m[3]),
    hour: isDate ? 0 : Number(m[4]),
    minute: isDate ? 0 : Number(m[5]),
    second: isDate ? 0 : Number(m[6]),
  };
  const timeZone = m[7] ? 'UTC' : tzid || null;
  return { wall, timeZone, isDate };
}

function instantOf(parsed, fallbackZone) {
  return zonedTimeToUtc(parsed.wall, parsed.timeZone ?? fallbackZone);
}

/** Parse an RFC 5545 DURATION such as `PT1H30M` into milliseconds. */
export function parseDuration(value) {
  const m =
    /^([+-])?P(?:(\d+)W)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/.exec(
      value.trim(),
    );
  if (!m) return null;
  const [, sign, w, d, h, min, s] = m;
  const ms =
    (Number(w || 0) * 7 + Number(d || 0)) * DAY_MS +
    (Number(h || 0) * 3600 + Number(min || 0) * 60 + Number(s || 0)) * 1000;
  return sign === '-' ? -ms : ms;
}

// ── Recurrence rules ─────────────────────────────────────────────────────────

/** Parse an RRULE value into its parts. */
export function parseRule(value) {
  const rule = { interval: 1, unsupported: [] };
  for (const part of value.split(';')) {
    const [key, val] = part.split('=');
    const k = key.toUpperCase();
    if (!SUPPORTED_RULE_PARTS.has(k)) {
      rule.unsupported.push(k);
      continue;
    }
    switch (k) {
      case 'FREQ':
        rule.freq = val.toUpperCase();
        break;
      case 'INTERVAL':
        rule.interval = Math.max(1, Number(val) || 1);
        break;
      case 'UNTIL':
        rule.until = val;
        break;
      case 'COUNT':
        rule.count = Number(val);
        break;
      case 'BYDAY':
        rule.byDay = val.split(',').map((d) => {
          const dm = /^([+-]?\d+)?(SU|MO|TU|WE|TH|FR|SA)$/i.exec(d.trim());
          if (!dm) return null;
          return {
            nth: dm[1] ? Number(dm[1]) : 0,
            weekday: WEEKDAYS.indexOf(dm[2].toUpperCase()),
          };
        });
        if (rule.byDay.includes(null)) rule.unsupported.push('BYDAY');
        break;
      case 'BYMONTHDAY':
        rule.byMonthDay = val.split(',').map(Number);
        break;
      case 'BYMONTH':
        rule.byMonth = val.split(',').map(Number);
        break;
      case 'WKST':
        rule.wkst = WEEKDAYS.indexOf(val.toUpperCase());
        break;
    }
  }
  if (!['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'].includes(rule.freq)) {
    rule.unsupported.push(`FREQ=${rule.freq}`);
  }
  return rule;
}

// Calendar dates are carried as UTC-midnight millisecond values, so date
// arithmetic never meets a daylight-saving change.
const dayValue = (y, m, d) => Date.UTC(y, m - 1, d);
const weekdayOf = (dv) => new Date(dv).getUTCDay();
const daysInMonth = (y, m) => new Date(Date.UTC(y, m, 0)).getUTCDate();

function monthDays(year, month, rule, start) {
  const last = daysInMonth(year, month);
  const days = new Set();
  if (rule.byMonthDay) {
    for (const md of rule.byMonthDay) {
      const d = md < 0 ? last + md + 1 : md;
      if (d >= 1 && d <= last) days.add(d);
    }
  }
  if (rule.byDay) {
    for (const { nth, weekday } of rule.byDay) {
      const matches = [];
      for (let d = 1; d <= last; d++) {
        if (weekdayOf(dayValue(year, month, d)) === weekday) matches.push(d);
      }
      if (nth === 0) matches.forEach((d) => days.add(d));
      else {
        const d = nth > 0 ? matches[nth - 1] : matches[matches.length + nth];
        if (d) days.add(d);
      }
    }
  }
  if (!rule.byMonthDay && !rule.byDay && start.day <= last) days.add(start.day);
  return [...days].sort((a, b) => a - b).map((d) => dayValue(year, month, d));
}

/**
 * The calendar days a rule produces, in order, from the start's period on.
 * Yields UTC-midnight day values; the caller applies the start's time of day.
 */
function* ruleDays(rule, start) {
  const startDay = dayValue(start.year, start.month, start.day);
  const inMonth = (dv) =>
    !rule.byMonth || rule.byMonth.includes(new Date(dv).getUTCMonth() + 1);
  const dayMatches = (dv) =>
    !rule.byDay || rule.byDay.some((b) => b.weekday === weekdayOf(dv));

  if (rule.freq === 'DAILY') {
    for (let i = 0; i < MAX_ITERATIONS; i++) {
      const dv = startDay + i * rule.interval * DAY_MS;
      if (inMonth(dv) && dayMatches(dv)) yield dv;
    }
  } else if (rule.freq === 'WEEKLY') {
    const wkst = rule.wkst >= 0 ? rule.wkst : 1;
    const weekStart =
      startDay - ((weekdayOf(startDay) - wkst + 7) % 7) * DAY_MS;
    const weekdays = rule.byDay
      ? rule.byDay.map((b) => b.weekday)
      : [weekdayOf(startDay)];
    const offsets = [...new Set(weekdays.map((w) => (w - wkst + 7) % 7))].sort(
      (a, b) => a - b,
    );
    for (let i = 0; i < MAX_ITERATIONS; i++) {
      const ws = weekStart + i * rule.interval * 7 * DAY_MS;
      for (const o of offsets) {
        const dv = ws + o * DAY_MS;
        if (inMonth(dv)) yield dv;
      }
    }
  } else if (rule.freq === 'MONTHLY') {
    for (let i = 0; i < MAX_ITERATIONS; i++) {
      const index = start.month - 1 + i * rule.interval;
      const year = start.year + Math.floor(index / 12);
      const month = (index % 12) + 1;
      if (rule.byMonth && !rule.byMonth.includes(month)) continue;
      yield* monthDays(year, month, rule, start);
    }
  } else if (rule.freq === 'YEARLY') {
    const months = rule.byMonth ?? [start.month];
    for (let i = 0; i < MAX_ITERATIONS; i++) {
      const year = start.year + i * rule.interval;
      for (const month of [...months].sort((a, b) => a - b)) {
        if (rule.byDay || rule.byMonthDay) {
          yield* monthDays(year, month, rule, start);
        } else if (start.day <= daysInMonth(year, month)) {
          yield dayValue(year, month, start.day);
        }
      }
    }
  }
}

/**
 * Start instants of a recurring series, in order, from `rangeStart` (less a
 * day, for an occurrence still in progress) up to `rangeEnd` (exclusive).
 * Honors UNTIL and COUNT; EXDATE is applied by the caller.
 */
export function expandRule(
  rule,
  start,
  timeZone,
  { rangeStart = -Infinity, rangeEnd },
) {
  const startMs = zonedTimeToUtc(start, timeZone);
  const startDay = dayValue(start.year, start.month, start.day);
  let untilMs = Infinity;
  if (rule.until) {
    const u = parseDateValue(rule.until);
    if (u) {
      untilMs = u.isDate
        ? zonedTimeToUtc(
            { ...u.wall, hour: 23, minute: 59, second: 59 },
            timeZone,
          )
        : instantOf(u, timeZone);
    }
  }
  // Days this far before the range can't overlap it, so they skip the time
  // zone conversion; COUNT still has to see every day.
  const skipBefore = rule.count ? -Infinity : rangeStart - 2 * DAY_MS;
  const out = [];
  let count = 0;
  for (const dv of ruleDays(rule, start)) {
    if (dv < startDay || dv < skipBefore) continue;
    const d = new Date(dv);
    const ms = zonedTimeToUtc(
      {
        year: d.getUTCFullYear(),
        month: d.getUTCMonth() + 1,
        day: d.getUTCDate(),
        hour: start.hour,
        minute: start.minute,
        second: start.second,
      },
      timeZone,
    );
    if (ms < startMs) continue;
    if (ms > untilMs || ms >= rangeEnd) break;
    if (rule.count && ++count > rule.count) break;
    out.push(ms);
  }
  // RFC 5545: DTSTART is the first instance even if the rule doesn't match it.
  if (startMs >= skipBefore && startMs < rangeEnd && out[0] !== startMs) {
    out.unshift(startMs);
  }
  return out;
}

// ── Events to occurrences ────────────────────────────────────────────────────

const first = (event, name) => event[name]?.[0];
const isCancelled = (event) =>
  first(event, 'STATUS')?.value.toUpperCase() === 'CANCELLED';

/**
 * A property's date value, with its time zone resolved: a TZID `Intl` doesn't
 * know falls back to UTC, and a floating time takes `fallbackZone`.
 */
function dateProp(prop, fallbackZone) {
  const parsed = prop && parseDateValue(prop.value, prop.params.TZID);
  if (!parsed) return null;
  if (parsed.timeZone && !isValidTimeZone(parsed.timeZone)) {
    parsed.unknownZone = parsed.timeZone;
    parsed.timeZone = 'UTC';
  }
  if (!parsed.timeZone && !parsed.isDate) parsed.timeZone = fallbackZone;
  return parsed;
}

function dateList(event, name, fallbackZone) {
  const out = [];
  for (const { params, value } of event[name] ?? []) {
    for (const v of value.split(',')) {
      const parsed = dateProp({ params, value: v }, fallbackZone);
      if (parsed) out.push(instantOf(parsed, fallbackZone));
    }
  }
  return out;
}

function durationOf(event, startMs, timeZone) {
  const end = dateProp(first(event, 'DTEND'), timeZone);
  if (end) return instantOf(end, timeZone) - startMs;
  const duration = first(event, 'DURATION');
  return duration ? parseDuration(duration.value) : null;
}

function joinUrl(event) {
  for (const name of ['URL', 'LOCATION', 'DESCRIPTION']) {
    const value = first(event, name)?.value;
    const url = value && /https?:\/\/[^\s"<>\\]+/.exec(unescapeText(value));
    if (url) return url[0];
  }
  return null;
}

/**
 * Expand the events of a feed into the occurrences that overlap
 * [rangeStart, rangeEnd), sorted by start. Each occurrence carries `uid`,
 * `title`, `start` and `end` (epoch milliseconds), `allDay`, `timeZone` (the
 * event's own; null for an all-day event) and `url` (the first link in URL,
 * LOCATION or DESCRIPTION).
 */
export function expandEvents(events, { rangeStart, rangeEnd, onWarning }) {
  const warn = onWarning ?? (() => {});
  const masters = [];
  const overridesByUid = new Map();
  for (const event of events) {
    if (!first(event, 'RECURRENCE-ID')) masters.push(event);
    else {
      const uid = first(event, 'UID')?.value ?? '';
      if (!overridesByUid.has(uid)) overridesByUid.set(uid, []);
      overridesByUid.get(uid).push(event);
    }
  }

  const occurrences = [];
  const add = (event, start, duration, series) => {
    const end = start + duration;
    if (end <= rangeStart || start >= rangeEnd) return;
    const summary = first(event, 'SUMMARY')?.value;
    occurrences.push({
      ...series,
      title: summary ? unescapeText(summary) : series.title,
      start,
      end,
      url: joinUrl(event) ?? series.url,
    });
  };

  for (const event of masters) {
    const uid = first(event, 'UID')?.value ?? '';
    const title = unescapeText(first(event, 'SUMMARY')?.value ?? '');
    if (isCancelled(event)) continue;
    const start = dateProp(first(event, 'DTSTART'), 'UTC');
    if (!start) {
      warn(`Skipping "${title}": missing or malformed DTSTART`);
      continue;
    }
    if (start.unknownZone) {
      warn(`"${title}": unknown time zone ${start.unknownZone}, using UTC`);
    }
    const timeZone = start.isDate ? null : start.timeZone;
    const startMs = instantOf(start, timeZone);
    const duration =
      durationOf(event, startMs, timeZone) ?? (start.isDate ? DAY_MS : 0);
    const series = {
      uid,
      title,
      allDay: start.isDate,
      timeZone,
      url: joinUrl(event),
    };

    let starts = [startMs];
    const rrule = first(event, 'RRULE');
    if (rrule) {
      const rule = parseRule(rrule.value);
      if (rule.unsupported.length) {
        warn(
          `"${title}": unsupported RRULE parts ${rule.unsupported.join(', ')}`,
        );
      } else {
        starts = expandRule(rule, start.wall, timeZone, {
          rangeStart,
          rangeEnd,
        });
      }
    }
    starts.push(...dateList(event, 'RDATE', timeZone));
    const excluded = new Set(dateList(event, 'EXDATE', timeZone));

    // An override replaces the occurrence its RECURRENCE-ID names, with its
    // own start, duration and details, or removes it when cancelled.
    for (const override of overridesByUid.get(uid) ?? []) {
      const rid = dateProp(first(override, 'RECURRENCE-ID'), timeZone);
      if (rid) excluded.add(instantOf(rid, timeZone));
      if (isCancelled(override)) continue;
      const os = dateProp(first(override, 'DTSTART'), timeZone);
      if (!os) continue;
      const osMs = instantOf(os, timeZone);
      add(
        override,
        osMs,
        durationOf(override, osMs, timeZone) ?? duration,
        series,
      );
    }
    for (const s of new Set(starts)) {
      if (!excluded.has(s)) add(event, s, duration, series);
    }
  }

  return occurrences.sort(
    (a, b) => a.start - b.start || a.title.localeCompare(b.title),
  );
}

// ── Presentation helpers ─────────────────────────────────────────────────────

/**
 * A meeting series' tag: the title without an `OpenTelemetry` prefix or
 * parenthesized qualifiers, as a lowercase slug. Regional variants of a
 * series, such as `Collector SIG (APAC/PT)`, share the tag of the series.
 */
export function tagOf(title) {
  return title
    .replace(/^\s*OpenTelemetry\s+/i, '')
    .replace(/\([^)]*\)/g, ' ')
    .toLowerCase()
    .replace(/\+\+/g, 'pp')
    .replace(/(^|\s)\.net\b/g, '$1dotnet')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Whether a title matches any of the comma-separated, case-insensitive
 * substrings in `patterns`.
 */
export function isExcluded(title, patterns) {
  const t = title.toLowerCase();
  return patterns
    .split(',')
    .map((p) => p.trim().toLowerCase())
    .some((p) => p && t.includes(p));
}
