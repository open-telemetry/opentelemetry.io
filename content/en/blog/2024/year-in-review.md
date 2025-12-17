---
title: OpenTelemetry.io 2024 review
linkTitle: Year in review
date: 2024-12-17
author: >-
  [Severin Neumann](https://github.com/svrnm) (Cisco), [Patrice
  Chalin](https://github.com/chalin/) (CNCF), [Tiffany
  Hrabusa](https://github.com/tiffany76) (Grafana Labs)
sig: Comms
crosspost_url: https://www.cncf.io/blog/2024/12/20/opentelemetry-io-2024-review/
cSpell:ignore: Chalin Hrabusa opentelemetrybot
---

As 2024 draws to a close, we reflect on the year and share some insights and
accomplishments from [SIG Communications][Comms meetings], the team responsible
for managing this website, blog, and documentation.

## Key achievements of 2024

Several key accomplishments stand out in our efforts to make OpenTelemetry
documentation more accessible, user-friendly, and impactful for our global
community.

### Multilingual documentation <i class="fa-solid fa-language"></i> {#multilingual-documentation}

A major accomplishment this year was achieving multilingual support with the
launch of our [localized documentation](/blog/2024/docs-localized/). Thanks to
the efforts of localization teams, over 120 pages were translated from English
into other languages. The available translations include:

- [Chinese](/zh/)
- [French](/fr/)
- [Japanese](/ja/)
- [Portuguese](/pt/)
- [Spanish](/es/)

A big thank you to everyone who contributed to this initiative. These
translations make OpenTelemetry more accessible, enhancing the user experience
for our global audience.

### Information Architecture (IA) improvements <i class="fa-solid fa-sitemap"></i> {#ia-improvements}

To **improve readership experience** and make OpenTelemetry **documentation more
intuitive and accessible**, we undertook important updates to our Information
Architecture (IA) this year. These changes were driven by the need to better
organize content, clarify the purpose of key sections, and provide a more
structured and user-friendly experience for end-users and developers.

Key IA updates include:

- Renaming the `Instrumentation` section to
  [Language APIs & SDKs](/docs/languages/) to better reflect its purpose and set
  clearer expectations for users.
- Moving `Automatic Instrumentation` into the new
  [Zero-code Instrumentation](/docs/zero-code/) section to more clearly
  distinguish between instrumentation APIs & SDKs and tools like the Java agent,
  used to inject telemetry.
- Following these updates, the Java SIG [proposed] and [reorganized their
  documentation][java-reorg], introducing substantial improvements to the
  structure and clarity of the content. The bulk of this effort is reflected in
  these PRs:
  - [Refactor Java SDK and configuration #4966][#4966]
  - [Refactor Java instrumentation #5276][#5276]
  - [Move performance to Java agent, merge Javadoc into API page #5590][#5590]

  <!-- prettier-ignore -->
  Kudos to [Jack Berg] and the [Java SIG] for their exemplary leadership in
  improving language-SIG documentation!
  {.mt-3}

Next year, we aim to redesign how OpenTelemetry is introduced to beginners,
ensuring a smoother and more accessible learning experience. If you're
passionate about making OpenTelemetry easier to understand and use, we’d love
your contributions &mdash; [join us][#2427] in this collaborative effort.

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

## Year in numbers <i class="fa-solid fa-chart-pie"></i> {#year-in-numbers}

### Contributions

In [December 2022], we started [monthly releases] of the website so that we
could regularly summarize activities and highlight significant contributions.
These releases allow us to track progress over time and perform long-term
comparisons.

For instance, comparing the periods [December 2022 to November 2023] and
[December 2023 to November 2024], we observed an upward trend in contributions:

- **Commits** increased 33% from 1,011 to 1,340
- **Contributors** grew 15% from 92 to 106
- The only metric that declined was the **number of files changed**, which
  decreased from 1,864 to 1,624 (13%)

Since the repository’s inception in April 2019, the community has seen
remarkable growth, with:

- 3,824 merged pull requests (3,982 commits) by
- 768 contributors

Thank you to every contributor for helping to build and improve the
OpenTelemetry website. Your efforts make a difference!

[December 2022]:
  https://github.com/open-telemetry/opentelemetry.io/releases/tag/2022.12
[December 2022 to November 2023]:
  https://github.com/open-telemetry/opentelemetry.io/compare/2022.12...2023.11
[December 2023 to November 2024]:
  https://github.com/open-telemetry/opentelemetry.io/compare/2023.12...2024.11
[monthly releases]: https://github.com/open-telemetry/opentelemetry.io/releases

### Which pages were the most popular?

According to our publicly available [analytics] data, [opentelemetry.io](/) was
viewed **12 million** times across 4 million sessions this year. This marks a
**16% increase** over last year's nearly 10 million views and over 3 million
sessions.

The most popular pages and sections of the documentation were:

| Page/Section             | Views | % [^1] |
| ------------------------ | ----: | -----: |
| [What is OpenTelemetry?] |  290K |   2.4% |
| [Collector]              |  1.3M |  10.5% |
| [Concepts]               |  1.2M |   9.8% |
| [Demo]                   |  829K |   6.7% |
| [Ecosystem]              |  500K |   4.0% |

[analytics]: https://lookerstudio.google.com/s/tSTKxK1ECeU
[Collector]: /docs/collector
[Concepts]: /docs/what-is-opentelemetry/
[Demo]: /docs/demo/
[Ecosystem]: /ecosystem/
[What is OpenTelemetry?]: /docs/what-is-opentelemetry/

[^1]: Percentage of the site-total 12M views.

### Fun trivia <i class="fa-solid fa-lightbulb"></i> {#trivia}

Did you know that:

- "OpenTelemetry" occurs 7.3K times in the English website pages, making it the
  3rd most frequent word after "the" and "to." The word "collector" is used 3.2K
  times, putting it in 11th place!
- The [Collector landing page] has been the most updated file since its
  creation, with 91 changes.
- With 511 commits (27K additions, and 10K deletions) the [opentelemetrybot] is
  the fourth most active contributor. Go bots!
- The record for the PR with the most comments this year—and of all time is held
  by:
  - [Generative AI updates blog post (#5575)][#5575], with 150 comments!

  <!-- prettier-ignore -->
  A close second goes to:
  {.mt-3}
  - [Portuguese translation of Go instrumentation][#5380], with 146 comments

[#5380]: https://github.com/open-telemetry/opentelemetry.io/pull/5380
[#5575]: https://github.com/open-telemetry/opentelemetry.io/pull/5575
[Collector landing page]: /docs/collector/
[opentelemetrybot]: https://github.com/opentelemetrybot

## Amazing Community <i class="fa-regular fa-heart"></i> {#amazing-community}

With [1.3K PRs], we collectively contributed an equally impressive number of
reviews to ensure that content is accurate, valuable, aligned with our
documentation goals, and easy to read and understand.

In addition to PRs, contributors created nearly [500 issues] and engaged in many
[discussions], reporting bugs, suggesting improvements, and driving
collaboration. Each of these efforts reflects our community's dedication to
maintaining the quality of OpenTelemetry docs.

We are fortunate to have many contributors who take on responsibilities,
including:

- **Approvers and maintainers** from other SIGs who co-own parts of the docs
- **Localization teams** who oversee translations into various languages
- **The OpenTelemetry community**, whose contributions make all the difference
  &mdash; every drive-by edit and typo fix counts!
- **SIG Communications team members**, for their contributions and for
  orchestrating it all!

Thank you to everyone who contributed their time and expertise to OpenTelemetry
docs this year!

[500 issues]:
  https://github.com/open-telemetry/opentelemetry.io/issues?q=is%3Aissue+created%3A2024-01-01..2024-12-31
[1.3K PRs]:
  https://github.com/open-telemetry/opentelemetry.io/pulls?q=is%3Apr+is%3Amerged+merged%3A2024-01-01..2024-12-31

## Join us in 2025

A big shout-out to everyone for making 2024 a successful year! We look forward
to continuing our collaboration in 2025.

Whether you're an end user, a contributor, or simply enthusiastic about
OpenTelemetry, we welcome your participation. You can [get involved] by raising
[issues], participating in [discussions], or [submitting PRs].

You can also join us:

- On the [CNCF Slack](https://slack.cncf.io/) at any one of the many
  `#otel`-prefixed channels.
- In [Comms meetings], held every other Monday at 10:00 AM Pacific time.

Together, we can make 2025 another amazing year for [opentelemetry.io](/)!

_A version of this article also [appears on the CNCF blog][]._

[appears on the CNCF blog]: <{{% param crosspost_url %}}>
[Comms meetings]:
  https://docs.google.com/document/d/1wW0jLldwXN8Nptq2xmgETGbGn9eWP8fitvD5njM-xZY
[discussions]: https://github.com/open-telemetry/opentelemetry.io/discussions
[get involved]: /docs/contributing/
[issues]: https://github.com/open-telemetry/opentelemetry.io/issues
[submitting PRs]: /docs/contributing/pull-requests/
