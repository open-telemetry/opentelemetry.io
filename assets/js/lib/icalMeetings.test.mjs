/**
 * Unit tests for the iCalendar meetings parser
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  expandEvents,
  expandRule,
  isExcluded,
  parseDateValue,
  parseDuration,
  parseEvents,
  parseLine,
  parseRule,
  tagOf,
  zonedTimeToUtc,
} from './icalMeetings.mjs';

const DAY = 86400000;
const iso = (ms) => new Date(ms).toISOString();

/** A feed with the given VEVENT bodies, with CRLF line endings. */
const feed = (...events) =>
  [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    ...events.flatMap((e) => [
      'BEGIN:VEVENT',
      ...e.trim().split('\n'),
      'END:VEVENT',
    ]),
    'END:VCALENDAR',
  ].join('\r\n');

const expand = (text, from, to, onWarning) =>
  expandEvents(parseEvents(text), {
    rangeStart: Date.parse(from),
    rangeEnd: Date.parse(to),
    onWarning,
  });

describe('parseLine', () => {
  test('splits name, params and value', () => {
    assert.deepEqual(
      parseLine('DTSTART;TZID=America/Toronto:20260720T120000'),
      {
        name: 'DTSTART',
        params: { TZID: 'America/Toronto' },
        value: '20260720T120000',
      },
    );
  });

  test('keeps colons inside quoted params and the value', () => {
    const { params, value } = parseLine(
      'ORGANIZER;CN="Ops: Team":mailto:ops@example.com',
    );
    assert.equal(params.CN, 'Ops: Team');
    assert.equal(value, 'mailto:ops@example.com');
  });
});

describe('parseEvents', () => {
  test('unfolds lines and skips nested components', () => {
    const [event] = parseEvents(
      feed(`
UID:1
SUMMARY:Java
  SIG
DTSTART:20260101T100000Z
BEGIN:VALARM
DESCRIPTION:Meeting reminder
END:VALARM`),
    );
    assert.equal(event.SUMMARY[0].value, 'Java SIG');
    assert.equal(event.DESCRIPTION, undefined);
  });
});

describe('parseDateValue', () => {
  test('reads a TZID-qualified time', () => {
    const { wall, timeZone, isDate } = parseDateValue(
      '20260722T050000',
      'America/Los_Angeles',
    );
    assert.deepEqual(wall, {
      year: 2026,
      month: 7,
      day: 22,
      hour: 5,
      minute: 0,
      second: 0,
    });
    assert.equal(timeZone, 'America/Los_Angeles');
    assert.equal(isDate, false);
  });

  test('lets a trailing Z win over TZID', () => {
    assert.equal(parseDateValue('20260723T080000Z', 'UTC').timeZone, 'UTC');
    assert.equal(
      parseDateValue('20260723T080000Z', 'Europe/Berlin').timeZone,
      'UTC',
    );
  });

  test('reads a date', () => {
    assert.equal(parseDateValue('20261224').isDate, true);
  });

  test('rejects malformed values', () => {
    assert.equal(parseDateValue('2026-07-22'), null);
  });
});

describe('parseDuration', () => {
  test('reads weeks, days and times', () => {
    assert.equal(parseDuration('PT1H30M'), 90 * 60000);
    assert.equal(parseDuration('P1W2D'), 9 * DAY);
    assert.equal(parseDuration('-PT15M'), -15 * 60000);
  });
});

describe('zonedTimeToUtc', () => {
  const wall = (month, day, hour) => ({
    year: 2026,
    month,
    day,
    hour,
    minute: 0,
    second: 0,
  });

  test('applies standard and daylight offsets', () => {
    assert.equal(
      iso(zonedTimeToUtc(wall(1, 15, 9), 'America/Los_Angeles')),
      '2026-01-15T17:00:00.000Z',
    );
    assert.equal(
      iso(zonedTimeToUtc(wall(7, 15, 9), 'America/Los_Angeles')),
      '2026-07-15T16:00:00.000Z',
    );
    assert.equal(
      iso(zonedTimeToUtc(wall(7, 15, 9), 'Asia/Shanghai')),
      '2026-07-15T01:00:00.000Z',
    );
  });

  test('moves a time in the spring-forward gap past it', () => {
    // 2026-03-08 02:30 doesn't exist in Los Angeles.
    assert.equal(
      iso(
        zonedTimeToUtc({ ...wall(3, 8, 2), minute: 30 }, 'America/Los_Angeles'),
      ),
      '2026-03-08T10:30:00.000Z',
    );
  });
});

describe('parseRule', () => {
  test('reads BYDAY ordinals', () => {
    assert.deepEqual(parseRule('FREQ=MONTHLY;BYDAY=-1WE').byDay, [
      { nth: -1, weekday: 3 },
    ]);
    assert.deepEqual(parseRule('FREQ=MONTHLY;BYDAY=+2WE').byDay, [
      { nth: 2, weekday: 3 },
    ]);
  });

  test('lists unsupported parts', () => {
    assert.deepEqual(parseRule('FREQ=WEEKLY;BYSETPOS=1').unsupported, [
      'BYSETPOS',
    ]);
    assert.deepEqual(parseRule('FREQ=HOURLY').unsupported, ['FREQ=HOURLY']);
  });
});

describe('expandRule', () => {
  const start = {
    year: 2026,
    month: 7,
    day: 22,
    hour: 5,
    minute: 0,
    second: 0,
  };
  const run = (
    rule,
    until = '2026-10-01T00:00:00Z',
    zone = 'America/Los_Angeles',
    s = start,
  ) =>
    expandRule(parseRule(rule), s, zone, { rangeEnd: Date.parse(until) }).map(
      iso,
    );

  test('expands a biweekly series', () => {
    assert.deepEqual(
      run('FREQ=WEEKLY;INTERVAL=2;BYDAY=WE', '2026-08-20T00:00:00Z'),
      [
        '2026-07-22T12:00:00.000Z',
        '2026-08-05T12:00:00.000Z',
        '2026-08-19T12:00:00.000Z',
      ],
    );
  });

  test('keeps the wall-clock time across a DST change', () => {
    const s = { ...start, month: 10, day: 28 };
    assert.deepEqual(
      run(
        'FREQ=WEEKLY;BYDAY=WE',
        '2026-11-12T00:00:00Z',
        'America/Los_Angeles',
        s,
      ),
      [
        '2026-10-28T12:00:00.000Z',
        '2026-11-04T13:00:00.000Z',
        '2026-11-11T13:00:00.000Z',
      ],
    );
  });

  test('expands several weekdays per week', () => {
    const s = { ...start, month: 9, day: 9, hour: 12 };
    assert.deepEqual(
      run(
        'FREQ=WEEKLY;WKST=SU;BYDAY=MO,WE,FR',
        '2026-09-15T00:00:00Z',
        'America/Los_Angeles',
        s,
      ),
      [
        '2026-09-09T19:00:00.000Z',
        '2026-09-11T19:00:00.000Z',
        '2026-09-14T19:00:00.000Z',
      ],
    );
  });

  test('stops at UNTIL and COUNT', () => {
    assert.equal(run('FREQ=WEEKLY;UNTIL=20260805T120000Z;BYDAY=WE').length, 3);
    assert.equal(run('FREQ=WEEKLY;COUNT=2;BYDAY=WE').length, 2);
  });

  test('expands the last and second weekday of a month', () => {
    const s = { ...start, month: 8, day: 26, hour: 11 };
    assert.deepEqual(
      run(
        'FREQ=MONTHLY;BYDAY=-1WE',
        '2026-11-01T00:00:00Z',
        'America/Toronto',
        s,
      ),
      [
        '2026-08-26T15:00:00.000Z',
        '2026-09-30T15:00:00.000Z',
        '2026-10-28T15:00:00.000Z',
      ],
    );
    const s2 = { ...start, month: 10, day: 14, hour: 8 };
    assert.deepEqual(
      run(
        'FREQ=MONTHLY;BYDAY=+2WE',
        '2027-01-01T00:00:00Z',
        'America/Los_Angeles',
        s2,
      ),
      [
        '2026-10-14T15:00:00.000Z',
        '2026-11-11T16:00:00.000Z',
        '2026-12-09T16:00:00.000Z',
      ],
    );
  });

  test('skips months without the start day', () => {
    const s = { ...start, month: 1, day: 31, hour: 10 };
    assert.deepEqual(run('FREQ=MONTHLY', '2026-05-01T00:00:00Z', 'UTC', s), [
      '2026-01-31T10:00:00.000Z',
      '2026-03-31T10:00:00.000Z',
    ]);
  });

  test('ends a rule that matches nothing', () => {
    const s = { ...start, month: 1, day: 1 };
    assert.deepEqual(
      run(
        'FREQ=YEARLY;BYMONTH=2;BYMONTHDAY=31',
        '2030-01-01T00:00:00Z',
        'UTC',
        s,
      ),
      ['2026-01-01T05:00:00.000Z'],
    );
  });
});

describe('expandEvents', () => {
  const weekly = `
UID:42
SUMMARY:Java SIG
DTSTART;TZID=America/Los_Angeles:20260730T090000
DTEND;TZID=America/Los_Angeles:20260730T100000
RRULE:FREQ=WEEKLY;INTERVAL=1;WKST=SU;BYDAY=TH
LOCATION:https://zoom-lfx.platform.linuxfoundation.org/meeting/1?password=x`;

  test('returns occurrences in range with duration, zone and link', () => {
    const occ = expand(
      feed(weekly),
      '2026-10-20T00:00:00Z',
      '2026-11-03T00:00:00Z',
    );
    assert.deepEqual(
      occ.map((o) => [iso(o.start), iso(o.end)]),
      [
        ['2026-10-22T16:00:00.000Z', '2026-10-22T17:00:00.000Z'],
        ['2026-10-29T16:00:00.000Z', '2026-10-29T17:00:00.000Z'],
      ],
    );
    assert.equal(occ[0].title, 'Java SIG');
    assert.equal(occ[0].timeZone, 'America/Los_Angeles');
    assert.equal(
      occ[0].url,
      'https://zoom-lfx.platform.linuxfoundation.org/meeting/1?password=x',
    );
  });

  test('includes an occurrence in progress at the range start', () => {
    const occ = expand(
      feed(weekly),
      '2026-10-22T16:30:00Z',
      '2026-10-23T00:00:00Z',
    );
    assert.equal(occ.length, 1);
  });

  test('applies EXDATE', () => {
    const text = feed(
      `${weekly}\nEXDATE;TZID=America/Los_Angeles:20261022T090000`,
    );
    const occ = expand(text, '2026-10-20T00:00:00Z', '2026-11-03T00:00:00Z');
    assert.deepEqual(
      occ.map((o) => iso(o.start)),
      ['2026-10-29T16:00:00.000Z'],
    );
  });

  test('applies moved and cancelled overrides', () => {
    const moved = `
UID:42
RECURRENCE-ID;TZID=America/Los_Angeles:20261022T090000
SUMMARY:Java SIG (moved)
DTSTART;TZID=America/Los_Angeles:20261023T110000
DTEND;TZID=America/Los_Angeles:20261023T113000`;
    const cancelled = `
UID:42
RECURRENCE-ID;TZID=America/Los_Angeles:20261029T090000
STATUS:CANCELLED
DTSTART;TZID=America/Los_Angeles:20261029T090000`;
    const occ = expand(
      feed(weekly, moved, cancelled),
      '2026-10-20T00:00:00Z',
      '2026-11-03T00:00:00Z',
    );
    assert.deepEqual(
      occ.map((o) => [o.title, iso(o.start), iso(o.end)]),
      [
        [
          'Java SIG (moved)',
          '2026-10-23T18:00:00.000Z',
          '2026-10-23T18:30:00.000Z',
        ],
      ],
    );
  });

  test('skips a cancelled series', () => {
    const occ = expand(
      feed(`${weekly}\nSTATUS:CANCELLED`),
      '2026-10-20T00:00:00Z',
      '2026-11-03T00:00:00Z',
    );
    assert.equal(occ.length, 0);
  });

  test('keeps only the first occurrence of an unsupported rule, with a warning', () => {
    const warnings = [];
    const text = feed(`
UID:7
SUMMARY:Odd
DTSTART:20261021T100000Z
RRULE:FREQ=WEEKLY;BYSETPOS=1`);
    const occ = expand(
      text,
      '2026-10-20T00:00:00Z',
      '2026-11-30T00:00:00Z',
      (w) => warnings.push(w),
    );
    assert.equal(occ.length, 1);
    assert.match(warnings[0], /BYSETPOS/);
  });

  test('falls back to UTC for an unknown time zone, with a warning', () => {
    const warnings = [];
    const text = feed(`
UID:8
SUMMARY:Somewhere
DTSTART;TZID=Not/AZone:20261021T100000
DURATION:PT1H`);
    const [o] = expand(
      text,
      '2026-10-20T00:00:00Z',
      '2026-11-30T00:00:00Z',
      (w) => warnings.push(w),
    );
    assert.equal(iso(o.start), '2026-10-21T10:00:00.000Z');
    assert.equal(o.end - o.start, 3600000);
    assert.match(warnings[0], /Not\/AZone/);
  });

  test('unescapes the title', () => {
    const text = feed(`
UID:9
SUMMARY:Logs\\, metrics\\; traces
DTSTART:20261021T100000Z`);
    assert.equal(
      expand(text, '2026-10-20T00:00:00Z', '2026-11-30T00:00:00Z')[0].title,
      'Logs, metrics; traces',
    );
  });
});

describe('tagOf', () => {
  test('makes a slug without prefix and qualifiers', () => {
    assert.equal(tagOf('OpenTelemetry PHP SIG'), 'php-sig');
    assert.equal(tagOf('Collector SIG (APAC/PT)'), 'collector-sig');
    assert.equal(tagOf('GO SIG'), tagOf('Go SIG'));
    assert.equal(tagOf('C/C++ SIG'), 'c-cpp-sig');
    assert.equal(tagOf('.NET SDK SIG'), 'dotnet-sdk-sig');
    assert.equal(
      tagOf('OpenTelemetry .Net Auto Instrumentation SIG'),
      'dotnet-auto-instrumentation-sig',
    );
  });
});

describe('isExcluded', () => {
  test('matches comma-separated substrings, ignoring case', () => {
    assert.equal(
      isExcluded('OpenTelemetry GC (internal)', '(internal), private'),
      true,
    );
    assert.equal(isExcluded('Java SIG', '(internal), private'), false);
    assert.equal(isExcluded('Java SIG', ''), false);
  });
});
