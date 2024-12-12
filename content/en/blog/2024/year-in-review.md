---
title: '2024: The Year in Review for opentelemetry.io'
linkTitle: 'Year in Review'
date: 2024-12-12 # Put the current date, we will keep the date updated until your PR is merged
author:
  >- # If you have only one author, then add the single name on this line in quotes.
  [Severin Neumann](https://github.com/svrnm) (Cisco),
sig: SIG Comms
---

As 2024 comes to a close, we'd like to take the time to take a look back at it,
and share some insights and accomplishments of SIG Communcation, which is
responsible for running this website, blog and documentation.

## Contributions

In
[December 2022](https://github.com/open-telemetry/opentelemetry.io/releases/tag/2022.12)
we started publishing monthly releases of our website on GitHub, to have a
regular summary of contributions. Based on this data we can do a long time
comparison on contributions, and if we look at the time between
[December, 2022 and November, 2023](https://github.com/open-telemetry/opentelemetry.io/compare/2022.12...2023.11)
and compare it with
[December, 2023 to November, 2024](https://github.com/open-telemetry/opentelemetry.io/compare/2023.12...2024.11),
we see an upwards trend in commits from 1,011 to 1,340, and contributors from 92
to 106. The only metric which has gone down is the number of files changed,
which was 1,864 previously and went down to 1,624.

Overall there have been 768 contributors and 3,982 commits across 3,824 merged
pull requests since the repository was created in April, 2019.

We thank every contributor for helping to build and improve the OpenTelemetry
website!

## User analytics

Based on
[data collected with Google Analytics](https://lookerstudio.google.com/s/tSTKxK1ECeU)
the [opentelemetry.io](/) website had over 12 million views across 4 million
sessions this year. The year before it was visited with almost 10 million viewes
across over 3 million sessions, which means there have been ~16% more views
year-over-year.

With almost 2,9 million views the [landing page](/) is the most popular page,
followed by the [Collector page](/docs/collector) with over 400,000 views.

## Localizations

A major accomplishment this year was, that
[we went multilingual](/blog/2024/docs-localized/). Localization teams are
translating pages from English to [Chinese](/zh), [French](/fr),
[Japanese](/ja), [Portuguese](/pt) and [Spanish](/es), with a total sum of 122
pages translated so far!

We thank everyone who has contributed translations, and we are excited to be
able to provide these language options that improve the OpenTelemetry user
experience.

## Information architecture changes

Another big change this year was a change in our information architecture: we
renamed the documentation section `Instrumentations` to `Languages APIs & SDKs`
to make it clearer to end-users what to expect in that section. We also moved
out the pages around `Automatic Instrumentation` into a section called
`Zero-code instrumentation`, to provide a clearer separation of using the APIs
and SDKs for instrumentation, and using instrumentation tools like a Java agent,
that add OpenTelemetry from the outside.

As a follow up to that change, the Java SIG updated the overall structure of
their API and SDK documentation, to fit better into this new architecture.

For the next year, we plan to rework the way how we introduce OpenTelemetry to
new starters, if you are interested in helping, you can
[join us here](https://github.com/open-telemetry/community/pull/2427/).

## Curious facts

There are many statistics we can create about our project, but only some of them
are worth sharing, because they are curious:

- The most changed content file is `content/en/docs/collector/_index.md` with 91
  updates since the file was created.
- With 511 commits, 26,765 additions and 9,734 deletions the
  [opentelemetrybot](https://github.com/opentelemetrybot) is our top-4
  contributor.
- The word OpenTelemetry occurs 7313 times in the source files of the English
  website. With that it is the 3rd most frequent word right after 'the' and
  'to'. The world 'collector' is used 3186 times and at the 11th place!
- The PR with the most comments this year and also for all time is
  [Blog post for OpenTelemetry Generative AI updates](https://github.com/open-telemetry/opentelemetry.io/pull/5575),
  with 150 comments. Close 2nd place goes to
  [[pt] Translate /pt/docs/languages/go/instrumentation](https://github.com/open-telemetry/opentelemetry.io/pull/5380)
  with 146 comments.
-

## People

Having 1000+ commits per year, means that there have been equally many PRs. For
each PR we need reviews, that ensure, that the added content fits into our
project, is correct and written in good and plain language. We are lucky to have
many contributors, who are taking on that responsibility: there are approvers
and maintainers of SIGs, that co-own parts of our website, there are approvers
for the different localizations, and there are approvers and maintainers in SIG
Communications. A big shout out to all of them for making 2024 a successful
year, and we are looking forward to work with you all in 2025!

## Call to action

If you are an OpenTelemetry end-user or contributor, or if you are just
enthusiastic about our project, we would be excited to welcome you as a
contributor to the website! You can help by raising issues and providing PRs! To
get started, come by in our channel at the CNCF slack or join one of our SIG
meetings, every other Monday at 10 PST.
