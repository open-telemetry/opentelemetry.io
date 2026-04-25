---
title: Homepage announcements
description:
  Front matter fields and rendering behavior for homepage announcement pages.
weight: 60
---

Use `content/<lang>/announcements/*.md` for homepage announcements.

This page is the source of truth for announcement page field meanings and how
the site renders announcements.

Shared announcement params are set in `content/en/announcements/_index.md` via
`cascade`, which is shared across all locales. Non-`en` locales must not
duplicate the cascaded parameters.

## Front matter fields

- `title`: announcement title used in the announcement text.
- `linkTitle`: optional short title used in the announcement index page.
- `date`: the date that the announcement should start showing.
- `expiryDate`: date after which the announcement should no longer be shown.
  - Set this to the event end date, e.g., `2026-06-06`.
  - Suffix this line with `# keep` to prevent the announcement from being
    deleted.
- `weight`: required. Set this to the event end date as a `yyyymmdd` integer,
  e.g., `20260606`. Announcements are listed in ascending `weight` order, so the
  soonest-ending event appears first.
- `params`:
  - `eventUrl`: the base event URL used by page links. For Linux Foundation
    events, this is often of the form
    `https://events.linuxfoundation.org/event-name/`.
  - `utmParam`: UTM parameters appended to event URLs. Set in the section index
    page (`content/en/announcements/_index.md`) so you do not need to define
    this unless you want to override it.
  - `blogPostURL`: optional site blog post URL for announcement CTA link.

## Banner text

Keep the banner text short and concise. A common body template is:

```markdown
[**{{%/* param title */%}}**][LF], **<span class="text-nowrap">March
23–26,</span> Amsterdam**. <span class="d-none d-md-inline"><br></span> Come
[collaborate, learn, and share][blog]<span class="d-none d-sm-inline"> with the
Cloud Native community</span>

[blog]: <{{%/* param blogPostURL */%}}>
[LF]: <{{%/* param eventUrl */%}}register/?{{%/* _param utmParam */%}}>
```

Design notes:

- We use classes like `d-none` and `d-*-inline` to control visibility of banner
  text based on screen size. This allows for more compact banner text on smaller
  screens.
- We use `_param` to access `utmParam` because it assumes the value is safe, in
  contrast to `param` that escapes the query parameters `&` to `&amp;`, which we
  don't want.

## Rendering behavior

- Homepage banner template: `layouts/_partials/banner.html`
- Community event list shortcode: `layouts/_shortcodes/community-events.md`.

In both cases, `.RegularPages` is used to render the announcements:

- Hugo automatically excludes expired pages based on `expiryDate`.
- Pages are listed in Hugo's [default page order][], which sorts by `weight`
  ascending first. Since `weight` is set to a `yyyymmdd` end-date integer (see
  above), the announcement ending soonest appears at the top.

[default page order]:
  https://gohugo.io/methods/page/regularpages/#default-sort-order
