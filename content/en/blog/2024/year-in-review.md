---
title: Opentelemetry.io 2024 review
linkTitle: Year in review
date: 2024-12-12 # Date to be set when we actually publish
author: >-
  [Severin Neumann](https://github.com/svrnm) (Cisco), [Patrice
  Chalin](https://github.com/chalin/) (CNCF), [Tiffany
  Hrabusa](https://github.com/tiffany76) (Grafana Labs)
sig: Comms
cSpell:ignore: Chalin Hrabusa opentelemetrybot
---

As 2024 draws to a close, we’d like to reflect on the year and share some
insights and accomplishments from SIG Communications, the team responsible for
managing this website, blog, and documentation.

## Highlights

### Localizations

A major accomplishment this year was achieving multilingual support with the
launch of our [localized documentation](/blog/2024/docs-localized/). Thanks to
the efforts of localization teams, over 120 pages were translated from English
into other languages. The available translations include:

- [Chinese](/zh)
- [French](/fr)
- [Japanese](/ja)
- [Portuguese](/pt)
- [Spanish](/es)

A big thank you to everyone who contributed to this initiative. These
translations make OpenTelemetry more accessible, enhancing the user experience
for a global audience.

### Information Architecture (IA) updates

This year, we implemented major changes to our Information Architecture (IA),
including:

- Renaming the `Instrumentation` docs section to `Language APIs & SDKs` to
  better reflect its purpose.
- Moving `Automatic Instrumentation` into the new `Zero-code Instrumentation`
  section to more clearly distinguish between instrumentation API & SDK and
  tools like the Java agent that injects OpenTelemetry externally.
- More significantly, following the above, the Java SIG [proposed] and
  [reorganized their documentation][java-reorg], most notably
  through PRs listed below.

  Kudos to [Jack Berg] and the [Java SIG] for this
  exemplar leadership in improving the language-SIG documentation!
  - [Refactor Java SDK and configuration #4966][#4966]
  - [Refactor Java instrumentation #5276][#5276]
  - [Move performance to Java agent, merge Javadoc into API page #5590][#5590]

For the next year, we plan to rework how we introduce OpenTelemetry to
beginners. We'd be glad for you to [join us][#2427] in this collective effort.

[#2427]: https://github.com/open-telemetry/community/pull/2427
[#4966]: https://github.com/open-telemetry/opentelemetry.io/pull/4966
[#5276]: https://github.com/open-telemetry/opentelemetry.io/pull/5276
[#5590]: https://github.com/open-telemetry/opentelemetry.io/pull/5590
[Jack Berg]: https://github.com/jack-berg
[Java SIG]:
  https://docs.google.com/document/d/1D7ZD93LxSWexHeztHohRp5yeoTzsi9Dj1HRm7Tad-hM
[proposed]: https://github.com/open-telemetry/opentelemetry.io/discussions/4853
[java-reorg]:
  https://github.com/open-telemetry/opentelemetry.io/pulls?q=is%3Apr+java+is%3Aclosed+label%3Asig%3Ajava+merged%3A2024-01-01..2024-12-31+author%3Ajack-berg

## Stats

### Contributions

In
[December 2022](https://github.com/open-telemetry/opentelemetry.io/releases/tag/2022.12),
we began publishing monthly releases of our website on GitHub to provide regular
summaries of contributions. Using this data, we can perform long-term
comparisons of contributions. For example, when comparing the period from
[December 2022 to November 2023](https://github.com/open-telemetry/opentelemetry.io/compare/2022.12...2023.11)
with
[December 2023 to November 2024](https://github.com/open-telemetry/opentelemetry.io/compare/2023.12...2024.11),
we see an upward trend: commits increased from 1,011 to 1,340, and contributors
grew from 92 to 106. The only metric that decreased was the number of files
changed, which dropped from 1,864 to 1,624.

Since the repository's creation in April 2019, there have been 768 contributors
and 3,982 commits across 3,824 merged pull requests.

We extend our heartfelt thanks to every contributor for helping build and
improve the OpenTelemetry website!

### User analytics

Based on
[data collected with Google Analytics](https://lookerstudio.google.com/s/tSTKxK1ECeU)
the [opentelemetry.io](/) website had over 12 million views across 4 million
sessions this year. The year before it was visited with almost 10 million views
across more than 3 million sessions, which means there have been ~16% more views
year-over-year.

With almost 2.9 million views, the [landing page](/) was the most popular page,
followed by the [Collector page](/docs/collector) with over 400,000 views.

### Intriguing insights

Here are some of the most interesting statistics about the OpenTelemetry
website:

- The most changed content file is `content/en/docs/collector/_index.md`, with
  91 updates since the file was created.
- With 511 commits, 26,765 additions, and 9,734 deletions the
  [opentelemetrybot](https://github.com/opentelemetrybot) is the fourth most
  active contributor.
- The word 'OpenTelemetry' occurs 7313 times in the source files of the English
  website, which makes it the 3rd most frequent word after 'the' and 'to'. The
  world 'collector' is used 3186 times, putting it in 11th place!
- The PR with the most comments this year and also for all time is
  [Blog post for OpenTelemetry Generative AI updates](https://github.com/open-telemetry/opentelemetry.io/pull/5575),
  with 150 comments. Close 2nd place goes to
  [[pt] Translate /pt/docs/languages/go/instrumentation](https://github.com/open-telemetry/opentelemetry.io/pull/5380)
  with 146 comments.

## Community

### People

Having 1000+ commits per year means that there have been equally as many PRs.
For each PR, we need reviews to ensure that the added content is accurate, fits
into our project, and is well written in plain language. We are lucky to have
many contributors who take on that responsibility: approvers and maintainers of
other SIGs that co-own parts of our website, approvers for the different
localization websites, and approvers and maintainers in SIG Communications. A
big shout out to all of you for making 2024 a successful year, and we look
forward to working together in 2025!

## Join us

If you're an end user, a contributor, or just enthusiastic about OpenTelemetry,
we welcome your contributions to the website. You can contribute by raising
issues, joining discussions, or making PRs. Join our
[channel](https://cloud-native.slack.com/archives/C02UN96HZH6) at the
[CNCF Slack](https://slack.cncf.io/) and come to our
[SIG meetings](https://docs.google.com/document/d/1wW0jLldwXN8Nptq2xmgETGbGn9eWP8fitvD5njM-xZY),
every other Monday at 10:00 a.m. Pacific time. With your help, we can make 2025
another successful year for [opentelemetry.io](https://opentelemetry.io/)!
