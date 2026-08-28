---
title: OpenTelemetry and Prometheus Interoperability
linkTitle: OTel and Prometheus
date: 2026-08-28
author: >-
  [Andrej Kiripolsky](https://github.com/andrejkiri) (Grafana Labs)
draft: true # TODO: remove this line once the post is ready to be published
issue: TODO # TODO: file an issue for this post and put its ID here (required)
sig: TODO # TODO: name the sponsoring SIG, e.g. Prometheus Interoperability (required)
# prettier-ignore
cSpell:ignore: Kiripolsky
---

<!--
TEMPLATE — structure only, no data yet.

Conventions to keep while filling this in:
  - Top-level headings start at level 2 (`##`), never `#`.
  - Wrap prose at 80 characters, or run `npm run format` before committing.
  - Images live in this directory; reference them relatively, with real alt
    text: ![Description of the chart](imagename.png)
  - Internal links are site-relative: [Prometheus receiver](/docs/collector/)
  - Link to a GitHub file with a `gh-url-hash` so the link stays stable.
  - Add any new proper nouns to the `cSpell:ignore` list above.
-->

## Introduction

<!--
Set up the problem in 2–3 paragraphs:
  - Why users run OpenTelemetry and Prometheus side by side.
  - What "interoperability" means concretely here (data model, wire protocol,
    naming, tooling) and which of those this post covers.
  - What the reader will be able to do or decide by the end.
-->

## Background

<!--
The shared context a reader needs before the specifics:
  - The two data models at a glance: OTLP metrics vs. Prometheus exposition.
  - Where they already align, and where they historically diverged.
  - Prior art to link rather than restate: the compatibility spec, earlier
    posts, relevant SIG or working-group output.
-->

## The interoperability story today

<!--
The current state of the art. Suggested sub-sections — delete what doesn't
apply once the specifics land:
-->

### Ingesting Prometheus data into OpenTelemetry

<!-- Prometheus receiver, target allocator, scrape config translation. -->

### Exporting OpenTelemetry data to Prometheus

<!-- Prometheus exporter, remote write, OTLP ingestion on the Prometheus side. -->

### Naming, units, and metadata

<!-- Metric name normalization, unit suffixes, resource attributes vs. labels. -->

## What this means in practice

<!--
Where the specific data goes. Placeholders for what will be dropped in later:
  - Concrete configuration examples (fenced, with a language tag).
  - Measurements, benchmarks, or survey results — with methodology stated.
  - Screenshots or charts, with alt text.
-->

## Known gaps and caveats

<!--
State honestly what does not round-trip cleanly, what is still experimental,
and which versions the claims above were verified against. Readers trust a post
more when the limits are explicit.
-->

## What's next

<!--
Where the work is heading, and how a reader can follow or contribute:
  - Open issues or specification work worth watching.
  - The SIG or working group meeting, with a link.
-->

## Get involved

<!--
Standard closing call to action: point at the sponsoring SIG's meeting, Slack
channel, and the OpenTelemetry community repository.
-->
