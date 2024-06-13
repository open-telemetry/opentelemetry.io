---
title: Issues and announcements
description: How to report a bug, a security issue, or a potential improvement.
weight: 50
---

If you notice an error or want to suggest improvements to existing content, open
an issue.

1. Click the **Create documentation issue** link on any document. This redirects
   you to a GitHub issue page prepopulated with some headers.
2. Describe the issue or suggestion for improvement. Provide as many details as
   you can.
3. Click **Submit new issue**.

After submitting, check in on your issue occasionally or turn on GitHub
notifications. It might take a few days until maintainers and approvers respond.
Reviewers and other community members might ask questions before they can take
action on your issue.

## Suggesting new content or features

If you have an idea for new content or a feature, but you aren't sure where it
should go, you can still file an issue. You can also report bugs and security
vulnerabilities.

1. Go to
   [GitHub](https://github.com/open-telemetry/opentelemetry.io/issues/new/) and
   select **New issue** inside the **Issues** tab.

1. Select the type of issue that best applies to your request or doubt.

1. Fill out the template.

1. Submit the issue.

### How to file great issues

Keep the following in mind when filing an issue:

- Provide a clear issue description. Describe what specifically is missing, out
  of date, wrong, or needs improvement.
- Explain the specific impact the issue has on users.
- Limit the scope of a given issue to a reasonable unit of work. For problems
  with a large scope, break them down into smaller issues. For example, "Fix the
  security docs" is too broad, but "Add details to the 'Restricting network
  access' topic" is specific enough to be actionable.
- Search the existing issues to see if there's anything related or similar to
  the new issue.
- If the new issue relates to another issue or pull request, refer to it either
  by its full URL or by the issue or pull request number prefixed with a `#`
  character. For example, `Introduced by #987654`.
- Follow the
  [Code of Conduct](https://github.com/open-telemetry/community/blob/main/code-of-conduct.md).
  Respect your fellow contributors. For example, "The docs are terrible" is not
  helpful or polite feedback.

## Announcement management

An announcement is a _regular Hugo page_ contained under the `announcements`
section of a locale. This means that we leverage Hugo's builtin handling of page
dates (future or expired), internationalization, and more, to automatically show
or hide banners depending on the build date, determine banner ordering, handle
fall back to English banners, etc.

> Announcements are currently used as banners only. We _might_ eventually
> support slightly more general announcements as well.

### Creating an announcement

To add a new announcement, create an announcement markdown file under the
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

### Announcement list

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
