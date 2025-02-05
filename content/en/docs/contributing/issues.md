---
title: Issues
description:
  How to fix an existing issue, or report a bug, security risk, or potential
  improvement.
weight: 10
_issues: https://github.com/open-telemetry/opentelemetry.io/issues
_issue: https://github.com/open-telemetry/opentelemetry.io/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc+label%3A
cSpell:ignore: prepopulated
---

## Fixing an existing issue

One of the best ways to help make OTel docs better is to fix an existing issue.

1. Browse through the list of [issues]({{% param _issues %}}).
2. Select an issue that you would like to work on, ideally one that you can fix
   in a short amount of time.

   <!-- prettier-ignore -->
   <a name="first-issue"></a>
   {{% alert title="First time contributing? " %}}

   Select an issue with the following labels:

   - [Good first issue]
   - [Help wanted]

   <!-- prettier-ignore -->
   > **NOTE**: we **_do not_ assign issues** to those who
   > have not already made contributions to the [OpenTelemetry
   > organization][org], unless part of a mentorship or onboarding
   > process.
   {.mt-3}

   <!-- prettier-ignore -->
   [good first issue]: {{% param _issue %}}%22good+first+issue%22
   [help wanted]: {{% param _issue %}}%3A%22help+wanted%22
   [org]: https://github.com/open-telemetry

   {{% /alert %}}

3. Read through the issue comments, if any.
4. Ask maintainers if this issue is still relevant, and ask any questions you
   need for clarification by posting comments over the issue.
5. Share your intention to work on the issue by adding add a comment to this
   effect.
6. Work on fixing the issue. Let maintainers know if you run into any problems.
7. When ready, [submit your work through a pull request](../pull-requests) (PR).

## Reporting an issue

If you notice an error or want to suggest improvements to existing content, open
an issue.

1. Click the **Create documentation issue** link on any document. This redirects
   you to a GitHub issue page prepopulated with some headers.
2. Describe the issue or suggestion for improvement. Provide as many details as
   you can.
3. Click **Create**.

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
