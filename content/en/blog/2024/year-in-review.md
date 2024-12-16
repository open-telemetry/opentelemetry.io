---
title: Opentelemetry.io 2024 review
linkTitle: Year in review
date: 2024-12-12 # Date to be set when we actually publish
author: >-
  [Severin Neumann](https://github.com/svrnm) (Cisco),
  [Patrice Chalin](https://github.com/chalin/) (CNCF),
  [Tiffany Hrabusa](https://github.com/tiffany76) (Grafana Labs)
sig: Comms
cSpell:ignore: Chalin Hrabusa opentelemetrybot
---

As 2024 draws to a close, we’d like to reflect on the year and share some
insights and accomplishments from SIG Communications, the team responsible for
managing this website, blog, and documentation.

## Contributions

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

## User analytics

Based on
[data collected with Google Analytics](https://lookerstudio.google.com/s/tSTKxK1ECeU)
the [opentelemetry.io](/) website had over 12 million views across 4 million
sessions this year. The year before it was visited with almost 10 million views
across more than 3 million sessions, which means there have been ~16% more views
year-over-year.

With almost 2.9 million views, the [landing page](/) was the most popular page,
followed by the [Collector page](/docs/collector) with over 400,000 views.

## Localizations

A major accomplishment this year was that [we went multilingual](/blog/2024/docs-localized/). Localization teams have been translating pages from English into several languages, with a total of 122 pages translated so far! The available languages include:

- [Chinese](/zh)  
- [French](/fr)  
- [Japanese](/ja)  
- [Portuguese](/pt)  
- [Spanish](/es)  

We thank everyone who contributed to the translations and are excited to offer these language options, enhancing the OpenTelemetry user experience.

## Information architecture changes

We made big changes in our information architecture this year. We
renamed the documentation section `Instrumentations` to `Language APIs & SDKs`
to make it clearer to end users what to expect in that section. We also moved the `Automatic Instrumentation` content into a section called
`Zero-code instrumentation` to provide a clearer separation between API
and SDK instrumentation and instrumentation tools like a Java agent
that inject OpenTelemetry from the outside.

As a follow up to the instrumentation page changes, the Java SIG updated the overall structure of
their API and SDK documentation to fit better into this new architecture.

For the next year, we plan to rework the way we introduce OpenTelemetry to
beginners. If you are interested in helping, [join us here](https://github.com/open-telemetry/community/pull/2427/).

## Intriguing insights

Here are some of the most interesting statistics about the OpenTelemetry website:

- The most changed content file is `content/en/docs/collector/_index.md`, with 91
  updates since the file was created.
- With 511 commits, 26,765 additions, and 9,734 deletions the
  [opentelemetrybot](https://github.com/opentelemetrybot) is the fourth most
  active contributor.
- The word 'OpenTelemetry' occurs 7313 times in the source files of the English
  website, which makes it the 3rd most frequent word after 'the' and
  'to'. The world 'collector' is used 3186 times, putting it in 11th place!
- The PR with the most comments this year and also for all time is
  [Blog post for OpenTelemetry Generative AI updates](https://github.com/open-telemetry/opentelemetry.io/pull/5575),
  with 150 comments. Close 2nd place goes to
  [[pt] Translate /pt/docs/languages/go/instrumentation](https://github.com/open-telemetry/opentelemetry.io/pull/5380)
  with 146 comments.

## People

Having 1000+ commits per year means that there have been equally as many PRs. For
each PR, we need reviews to ensure that the added content is accurate, fits into our
project, and is well written in plain language. We are lucky to have
many contributors who take on that responsibility: approvers
and maintainers of other SIGs that co-own parts of our website, approvers
for the different localization websites, and approvers and maintainers in SIG
Communications. A big shout out to all of you for making 2024 a successful
year, and we look forward to working together in 2025!

## Join us

If you're an end user, a contributor, or just enthusiastic about OpenTelemetry, we welcome your contributions to the website. You can contribute by raising issues, joining discussions, or making PRs. Join our [channel](https://cloud-native.slack.com/archives/C02UN96HZH6) at the [CNCF Slack](https://slack.cncf.io/) and come to our [SIG meetings](https://docs.google.com/document/d/1wW0jLldwXN8Nptq2xmgETGbGn9eWP8fitvD5njM-xZY), every other Monday at 10:00 a.m. Pacific time. With your help, we can make 2025 another successful year for [opentelemetry.io](https://opentelemetry.io/)!
