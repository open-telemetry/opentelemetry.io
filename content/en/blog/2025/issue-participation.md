---
title: 'More Signal, Less Noise: How GitHub Issue Reactions Help Prioritize'
linkTitle: GitHub Issue Reactions
date: 2025-08-19
author: >-
  [Dan Gomez Blanco](https://github.com/danielgblanco) (New Relic)
sig: End-User SIG
---

Did you know that OpenTelemetry has had more than 23,000 contributors—that's
individuals who shared issues, commits, pull requests, or comments on
GitHub—since the project started? We always encourage everyone to get involved,
whether that’s by joining one of our (many!)
[CNCF Slack](https://slack.cncf.io/) channels, or dropping into any
[public meeting](https://github.com/open-telemetry/community/?tab=readme-ov-file#calendar)
to listen in and share different perspectives. This openness is one of our
greatest strengths, but it also means we get a firehose of feedback via many
different routes: GitHub, Slack, StackOverflow, meetings, and even posts on
social media.

As someone who is active in the project and works with end-users daily, I see
both sides of the contribution coin. Users file GitHub issues hoping to get a
bug fixed or a feature built, and maintainers sift through a mountain of
notifications trying to figure out where to best spend their limited time. To
give you an idea of the scale, in 2024 alone, the number of GitHub issues closed
across the project was over 7,000!

With such an active project, one of the biggest challenges has always been
understanding what's the most important thing to focus on, as seen by
OpenTelemetry users and contributors. And, when we consider GitHub issues, a
stream of "+1" or "me too!" comments does not make this any easier. While the
sentiment is valuable, the method creates a lot of noise and makes it more
difficult for maintainers to gauge how many people are _really_ affected by an
issue.

We want to make this easier for everyone. That’s why, as part of the End-User
SIG, we’ve been working on a small but important change to how we use GitHub:
**promoting the use of 👍
[issue reactions](https://github.blog/news-insights/product-news/add-reactions-to-pull-requests-issues-and-comments/)
as the primary way to express interest.**

## A Better Signal to Help Prioritize

The goal here is simple: provide a clear, low-effort, data-driven way for the
community to signal what matters most. For maintainers, this system cuts through
the notification noise. They can
[sort issues by reaction count](https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/filtering-and-searching-issues-and-pull-requests#sorting-issues-and-pull-requests)
to get a quick, at-a-glance view of what the community is clamoring for. This
helps SIGs and maintainers make more informed decisions when prioritizing their
backlogs.

For you, the end-user, it means your feedback is more visible. Instead of your
"+1" comment getting lost in a long thread, your 👍 becomes a quantifiable piece
of data that helps give the issue more weight.

To make this change stick, we’ve rolled out a few things. We’ve published
[recommendations](https://github.com/open-telemetry/community/blob/main/guides/maintainer/popular-issues.md)
for OpenTelemetry maintainers on how to manage and interpret these reactions,
and our website now has a section explaining
[what this means for end-users](/community/end-user/issue-participation/).
You'll also see a friendly reminder in a new footnote on
[issue templates](https://github.com/open-telemetry/community/blob/main/guides/maintainer/popular-issues.md#recommended-footnote-on-issue-templates)
across all OTel repositories. If you're opening a new issue, please leave that
footer in place so that others have first-hand access to this advice.

## Your Quick Guide to Making an Impact

So what does this mean for you in practice? It's easy.

The next time you’re browsing issues, don’t just read and leave. When you find
an issue that describes a problem you're also facing or a feature you'd like to
see implemented, **just give the issue description a 👍 reaction**. That’s it.
Like and subscribe. That’s the signal.

Of course, if you have a new, unique use case, a technical detail that hasn't
been mentioned, or other information that would help a maintainer solve the
problem, then please do leave a comment. That kind of context is incredibly
valuable! Just remember that a high reaction count is a strong signal, but it
doesn’t automatically guarantee an issue becomes the top priority.

Open source is a team sport, and this is a perfect example of how small actions
can collectively have a huge impact.

Thanks for helping us make OpenTelemetry better, together.
