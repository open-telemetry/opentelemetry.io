---
title: 'Prometheus and OpenTelemetry interoperability in 2026: Survey results'
linkTitle: Prometheus and OTel Survey
date: 2026-08-28
author: >-
  [Dhruv Ahuja](https://github.com/dhruv-ahuja), [Andrej
  Kiripolsky](https://github.com/andrejkiri) (Grafana Labs), [Ana
  Muenz](https://github.com/TODO), [Arthur Sens](https://github.com/ArthurSens)
  (Grafana Labs)
draft: true # TODO: remove this line once the post is ready to be published
issue: https://github.com/open-telemetry/sig-end-user/issues/280
sig: End-User SIG
# prettier-ignore
cSpell:ignore: Ahuja Dhruv Kiripolsky Muenz
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
4. Prometheus relabeling rules (54%) and the open-source OTel Collector (53%)
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
  open-source Prometheus-compatible backend such as Thanos, Cortex, or Grafana
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
