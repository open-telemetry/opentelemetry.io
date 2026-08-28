---
title: 'Prometheus and OpenTelemetry interoperability in 2026: Survey results'
linkTitle: Prometheus and OTel Survey
date: 2026-08-28
author: >-
  [Dhruv Ahuja](https://github.com/dhruv-ahuja) (SigNoz), [Andrej
  Kiripolsky](https://github.com/andrejkiri) (Grafana Labs), [Ana
  Muenz](https://github.com/vampirarte), [Arthur
  Sens](https://github.com/ArthurSens) (Grafana Labs)
draft: true # TODO: remove this line once the post is ready to be published
issue: https://github.com/open-telemetry/sig-end-user/issues/280
sig: End-User SIG
# prettier-ignore
cSpell:ignore: Ahuja Dhruv György Heorku Kiripolsky Krajcsovits Krajo Muenz textfile
---

We ran a survey asking users of OpenTelemetry and Prometheus how they collect,
process, and store metrics. The goal was to understand, with real usage data
rather than assumptions, how far the ecosystem has moved and whether the
interoperability still causes friction.

## Key takeaways

1. Interoperability has measurably improved since our
   [2024 survey](/blog/2024/prometheus-compatibility-survey/): the average
   ease-of-use rating rose from 3.1 to 3.6, the equivalent of half the
   respondents moving up a whole category, and the share of respondents finding
   the two hard to use together fell from 29% to 10%.
2. In infrastructure instrumentation, Prometheus exporters remain the most-used
   method (72%) with OTel receivers close behind (57%), and nearly half of
   respondents run both at once rather than migrating from one to the other.
3. In application instrumentation, OTel SDKs are the most-used method at 65%
   with Prometheus SDKs at 52%, and 41% use only the OTel style of application
   instrumentation.
4. Prometheus relabeling rules (54%) and the open source OTel Collector (53%)
   are the two most common processing steps, and 65% of respondents run a
   "vanilla stack" of one or both with no vendor transformation or custom
   Collector build anywhere in the pipeline.

## Demographics

From 186 people who responded, 81 passed our screening for active
OpenTelemetry-for-metrics users on a Prometheus-adjacent backend. We also
filtered out observability vendor employees to focus on end users. The analyzed
sample:

- All respondents in this analysis are active OpenTelemetry users.
- All respondents use some flavor of Prometheus – Prometheus itself (46%), an
  open source Prometheus-compatible backend such as Thanos, Cortex, or Grafana
  Mimir (42%), or a PromQL-compatible vendor product (12%).
- Respondents' observability maturity is high. 48% describe their organization
  as having "a well-established observability practice" (Expert), 41% are
  "setting up an observability practice" (Intermediate). Only 11% consider
  themselves beginners in observability.
- Organizations skew large. 42% have 1,000+ employees, 31% are 100–999, 15% are
  50–99, and 12% are under 50.

## Ease of use change over time

_How easy or difficult is it to use OpenTelemetry and Prometheus together?_

This year, we asked the same question as in the similar 2024 survey to see
whether end users saw progress in interoperability.

<!-- TODO: add the ease-of-use comparison chart here, e.g.
![Distribution of ease-of-use ratings in 2024 and 2026](ease-of-use.png) -->

The average rating rose by 0.5 point, from 3.1 to 3.6 — the equivalent of half
the respondents moving up a whole category. The clearest movement is at the
difficult end of the scale: the share of respondents who found the two hard to
use together dropped to roughly a third of its 2024 level. Also, nobody this
year picked "Very difficult".

Two years of work on interoperability are paying off. At the same time, since
the single largest group of responses sits at "Neither easy nor difficult",
there is still a lot of work to be done in this area.

_*Note*: The 2024 survey didn't ask respondents whether they worked for an
observability vendor, so this is not an exact apples-to-apples population match.
However, putting vendor employees back into the 2026 sample (N=108) would barely
change the result for the ease of use rating (0%, 10%, 40%, 33%, 17% → 0%, 10%,
41%, 33%, 16%). To keep this year’s results consistent, we decided to stick with
filtering vendor employees out._

## Infrastructure metrics

_How do you instrument infrastructure metrics collection?_

Prometheus exporters are the most common single instrumentation method for
infrastructure metrics but OTel receivers are close behind. Built-in /metrics
endpoint, built-in OTLP push, and OpenTelemetry eBPF instrumentation (OBI)
follow.

When looking at how these methods combine, the picture is clearly hybrid, not
either/or. Nearly half of respondents are mixing Prometheus and OTel
instrumentation styles at once for infrastructure metrics, rather than doing a
full migration. Only Prometheus style is twice as popular as only OTel style.

_*Note*: Instrumentation style describes whether a respondent uses methods
native to one project only, or a mix of both. OTel-style includes using OTel
receivers, Built-in OTLP push, or OpenTelemetry eBPF Instrumentation (OBI).
Prometheus-style includes Prometheus exporters or Built-in /metrics endpoint (no
exporter). The 4 "Other" responses are write-ins: Zabbix, Heorku Telemetry
(likely "Heroku Telemetry"), textfile collector, Telegraf. All 4 respondents
also selected a real Prometheus/OTel method alongside their write-in — but in
the style table below, a write-in places a respondent in "Other" regardless of
what else they selected._

<!-- TODO: link the ongoing discussion in the sentence below (URL missing) -->

_*Work in progress*: The Prometheus and OTel communities are working on making
Prometheus exporters run as an OTel Collector distribution. The conversations
are still ongoing. The discussion is open in this issue._

## Application metrics

_How do you instrument application metrics collection?_

Preferences swap for application instrumentation. OTel SDKs come out on top with
Prometheus SDKs following behind them. OBI holds roughly the same share as in
infrastructure instrumentation.

Instrumentation styles shift as well. Most participants use only OTel style
instrumentation. That is twice as common as only Prometheus style. Fewer than a
third mix styles.

<!-- prettier-ignore-start -->
<!-- Keeps the respondent's original "OTEl" spelling in the quote below. -->

_*Note*: In application instrumentation, OTel-style includes using OTel SDKs or
OpenTelemetry eBPF Instrumentation (OBI). Prometheus-style includes Prometheus
SDKs. Again, there are 4 write-ins that we categorized as “Other”: already built
exporters, Micrometer, textfile collector, jvm-exporter. 3 of the 4 also
selected a real Prometheus/OTel method. One respondent's original write-ins,
"Self instrumentation" and "manual instrumentation for OTEl," were recoded to
plain OTel SDKs._

<!-- prettier-ignore-end -->

## Transformation

_What do you use to process or transform metrics before sending them to
storage?_

Prometheus relabeling rules and the open source OTel Collector are the two most
common processing steps with neither of them leading clearly.

Most respondents run a vanilla stack: only Prometheus relabeling rules and/or
the plain OTel Collector, with no vendor distribution and no custom-built
Collector in the pipeline. The three vanilla patterns come out close to even.

## What practitioners want improved

_What would you like us to improve to make OpenTelemetry and Prometheus work
better together?_

We received 19 open-ended responses with suggestions on what to improve. Three
themes emerged from this data — unifying Prometheus and OTel's data models
(attributes/labels), better handling of resource attributes and metadata, and
naming and formatting friction — alongside a few individual asks. Prometheus
maintainers György "Krajo" Krajcsovits and Arthur Sens went through the
responses and addressed each point below:

- Unifying Prometheus and OTel's data models (attributes/labels)
  - This is a valid ask that we recognize. We will raise it for a discussion at
    the Prometheus Dev summit in October.
- Resource attributes and metadata
  - This should be addressed by the
    [native metadata design doc](https://docs.google.com/document/d/1yYnyD7oJDvJhzFaigdniq6y302Mvp9gDcJUeAj3pJ0s/edit?tab=t.0#heading=h.5prvoamow70t).
    One thing that we have to wait for is finishing the OTel Entities spec.
- Naming and formatting friction
  - Several relevant things already exist — the
    [OpenMetrics 2.0 exposition format](https://prometheus.io/docs/specs/om/open_metrics_spec_2_0/)
    lets OTel-style names be used directly in code, PromQL already supports
    UTF-8 metric names, and Prometheus's OTLP receiver has
    [configurable translation strategies](https://prometheus.io/docs/prometheus/latest/configuration/configuration/#configuration-file).
    The pieces exist; they're just not the default yet. We have to work on this.
- Using Prometheus native recording rules in the Collector
  - There's an open
    [Prometheus proposal](https://github.com/prometheus/proposals/pull/67) and
    [proof-of-concept PR](https://github.com/prometheus/prometheus/pull/10529)
    for scrape-time recording rules, which wouldn't need a full TSDB the way
    recording rules do today. Since the OpenTelemetry Collector's Prometheus
    Receiver uses Prometheus code as a Go Library, this proposal would also
    benefit the Collector.
- Enable MCP or agentic AI workflows
  - Prometheus just onboarded the
    [Prometheus MCP](https://github.com/prometheus/prometheus-mcp) project
    repository to its GitHub org. This should enable MCP workflows for
    Prometheus. The Prometheus community would love to see people start using it
    and get feedback. Also, the
    [native metadata design doc](https://docs.google.com/document/d/1yYnyD7oJDvJhzFaigdniq6y302Mvp9gDcJUeAj3pJ0s/edit?tab=t.0#heading=h.5prvoamow70t)
    explains how we plan to make agentic AI workflows even better in Prometheus.

## Interesting observations

_Mid-size organizations may be furthest into OTel-native tooling_

In our data, 100–999-employee organizations come out highest on OTel SDK
adoption for application metrics and on OTel receiver adoption for
infrastructure metrics. eBPF-based instrumentation (OBI) doesn't follow the same
pattern — there it's the 1,000+ organizations that stand apart from every
smaller band.

| Metric                                                    | 1–49 (N=10) | 50–99 (N=12) | 100–999 (N=25) | 1,000+ (N=34) |
| --------------------------------------------------------- | ----------- | ------------ | -------------- | ------------- |
| OTel SDK adoption (application metrics)                   | 40%         | 58%          | 84%            | 62%           |
| OTel receiver adoption (infrastructure metrics)           | 20%         | 58%          | 76%            | 53%           |
| eBPF-based instrumentation / OBI (infrastructure metrics) | 20%         | 17%          | 20%            | 3%            |

Our hypothesis is that mid-size organizations — big enough to have a dedicated
platform effort, small enough to move without a multi-year migration plan —
might be pushing furthest into newer OTel-native tooling.

_*Note*: This is an interesting observation and a hypothesis, not a confirmed
finding: with 10–34 respondents per band, none of these gaps is big enough for a
survey this size to confirm._

_Team type tracks backend choice_

Platform Engineering and SRE teams lean heavily toward OSS Prometheus-compatible
backends (Thanos, Cortex, Mimir), while Dev teams lean the other way, toward
plain Prometheus.

The dividing line looks like operational ownership rather than preference. Teams
running metrics for a whole organization eventually outgrow a single Prometheus;
teams instrumenting their own service generally don't.

| Team type            | OSS Prometheus-compatible (N=30) | Prometheus (N=35) | PromQL-compatible vendor (N=8) |
| -------------------- | -------------------------------- | ----------------- | ------------------------------ |
| Dev                  | 24%                              | 71%               | 6%                             |
| DevOps               | 23%                              | 62%               | 15%                            |
| Observability        | 29%                              | 41%               | 29%                            |
| Platform Engineering | 69%                              | 31%               | 0%                             |
| SRE                  | 69%                              | 31%               | 0%                             |

_*Note*: Sysadmin (N=6) and Operations (N=2) respondents are excluded from this
table — both groups are too small to interpret — leaving N=73 of the 81
respondents._
