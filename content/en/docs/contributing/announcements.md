---
title: Announcements
description: Create announcements or banners for special events.
weight: 50
---

An announcement is a _regular Hugo page_ contained under the `announcements`
section of a locale. This means that we leverage Hugo's builtin handling of page
dates (future or expired), internationalization, and more, to automatically show
or hide banners depending on the build date, determine banner ordering, handle
fall back to English banners, etc.

> Announcements are currently used as banners only. We _might_ eventually
> support slightly more general announcements as well.

## Creating an announcement

To add a new announcement, create an announcement Markdown file under the
`announcements` folder of your localization using the following command:

```sh
hugo new --kind announcement content/YOUR-LOCALE/announcements/announcement-file-name.md
```

Adjust according to your desired locale and file name. Add the announcement text
as the body of the page.

> For banners, the announcement body should be a short phrase.

{{% alert title="For localizations" %}}

If you are creating a **locale specific announcement override**, make sure that
you use the **same filename** as the English language announcement.

{{% /alert %}}

## Announcement list

Any given announcement will appear in a site build when the build date falls
between the `date` and `expiryDate` fields of the announcement. When those
fields are missing they are assumed to be "now" and "forever", respectively.

Announcements will appear in the standard page order as determined using Hugo's
[Regular pages](https://gohugo.io/methods/site/regularpages/) function. That is,
the "lightest" announcements (by `weight`) will appear first; when weights are
the same or unspecified, the most recent announcements (by `date`) will appear
first, etc.

So, if you want to force an announcement to the top, use a negative `weight` in
the front matter.

If you find a bug or a problem with the content of this repository, or you would
like to request an enhancement, [create an issue][new-issue].

If you discover a security issue, read the
[Security Policy](https://github.com/open-telemetry/opentelemetry.io/security/policy)
before opening an issue.

Before reporting a new issue, make sure that the issue was not already reported
or fixed by searching through our
[issues list](https://github.com/open-telemetry/opentelemetry.io/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc).

When creating a new issue, include a short, meaningful title and a clear
description. Add as much relevant information as you can, and, if possible, a
test case.

[new-issue]:
  https://github.com/open-telemetry/opentelemetry.io/issues/new/choose
