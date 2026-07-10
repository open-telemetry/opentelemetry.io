---
title: Site Observability
custodian:
  - '[Patrice Chalin](https://github.com/chalin)'
  - '[Vitor Vasconcellos](https://github.com/vitorvasc)'
cSpell:ignore: Vasconcellos secretless
---

## Description

This project sets up a public OpenTelemetry Collector that receives telemetry
from the project's own websites — [opentelemetry.io][] and
[explorer.opentelemetry.io][] — and exports it to backends, allowing public
access to the data.

The project implements the Collector-based approach proposed in
[opentelemetry.io#9559][], with initial access to the infrastructure provider
tracked in [community#3368][].

## Current Challenges

- The websites have no OpenTelemetry-native observability pipeline: the project
  does not use its own tooling to observe its own sites.
- Client-side signals outside the scope of GA4 (such as page load traces, web
  vitals, and frontend errors) are not collected today.
- A previously available public Collector was decommissioned, so there is no
  live, community-visible Collector deployment to point to.

## Goals, Objectives, and Requirements

### Telemetry sources

Three sources feed the Collector, rolled out in phases:

1. **Browser instrumentation**: OTel JS SDK, producing traces (document load,
   interactions), web vitals, and frontend errors.
2. **Netlify Edge Functions**: server-side spans and metrics emitted over OTLP.
3. **Netlify log drain**: site request logs delivered to the Collector.

### Signals and backends

| Signal  | Backend        |
| ------- | -------------- |
| Traces  | [Jaeger][]     |
| Metrics | [Prometheus][] |
| Logs    | [OpenSearch][] |

### Architecture

- A single co-located stack: the Collector and the three backends are deployed
  together on the same infrastructure.
- Only the Collector is exposed for writes; backends are never directly
  reachable for ingestion.
- The current infrastructure candidate is the OpenTelemetry Cloudflare account
  ([community#3368][]).
- The design must remain portable across providers. Container-based deployment
  using IaC allows easy maintenance and deployment on other providers, if
  needed.

### Abuse protection

A browser-facing OTLP endpoint is necessarily public and secretless, so
protection is layered:

- Rate limiting at the provider edge
- CORS restricted to the two site domains, with Origin validation
- Payload size limits, memory limiting, and sampling in the Collector

Residual noise is accepted: ingested data is treated as untrusted by nature.

### Public read-only access

Query UIs for all three backends are open to anyone in read-only mode.
Transparency is a feature: the community can inspect the same data maintainers
use.

### Privacy

Because reads are public, everything in the pipeline is world-visible. The
Collector centrally scrubs sensitive fields before export: IP addresses, raw
user agents, full referrer URLs, and query strings. The pipeline serves
event-count and performance analytics, not people analytics.

### Relationship to existing analytics

This project is independent from the site's current GA4 and [Netlify
Observability][] setup and takes no position on it.

## Deliverables

| Phase | Deliverable                                                                               |
| ----- | ----------------------------------------------------------------------------------------- |
| 1     | Public Collector deployed with abuse protections and a minimal validation source          |
| 2     | Prometheus, Jaeger, and OpenSearch deployed with public read-only query access            |
| 3     | Source rollout: browser instrumentation on both sites, Edge Functions OTLP, and log drain |

## Open Questions

- **Configuration and IaC home**: where the Collector configuration and stack
  IaC live, for example, `open-telemetry/admin` or a dedicated repository
- **Data retention**: retention periods per backend are deferred until the
  infrastructure and its storage constraints are known.

## Timeline

This proposal intentionally does not include a detailed timeline: phase 1 is
blocked on infrastructure access ([community#3368][]). Once access is granted,
milestones will be defined for the phases above.

## Discussion

- GitHub Issue: [Address site observability and data access
  (#9559)][opentelemetry.io#9559]
- CNCF Slack: [#otel-comms][]

## Labels

- `CI/infra`
- `analytics+observability`

## Linked Issues and PRs

- [opentelemetry.io#9559][] — Address site observability and data access
- [community#3368][] — Infrastructure to host an OTel Collector for
  opentelemetry.io

[opentelemetry.io]: https://opentelemetry.io
[explorer.opentelemetry.io]: https://explorer.opentelemetry.io
[Jaeger]: https://www.jaegertracing.io/
[Prometheus]: https://prometheus.io/
[OpenSearch]: https://opensearch.org/
[opentelemetry.io#9559]:
  https://github.com/open-telemetry/opentelemetry.io/issues/9559
[community#3368]: https://github.com/open-telemetry/community/issues/3368
[Netlify Observability]:
  https://docs.netlify.com/manage/monitoring/observability/overview
[#otel-comms]: https://cloud-native.slack.com/archives/C02UN96HZH6
