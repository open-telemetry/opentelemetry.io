---
title: Site Observability
custodian:
  - '[Patrice Chalin](https://github.com/chalin)'
  - '[Vitor Vasconcellos](https://github.com/vitorvasc)'
cSpell:ignore: secretless Vasconcellos
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
- The infrastructure is the OpenTelemetry Cloudflare account
  ([community#3368][]); the Collector runs on Cloudflare Containers.
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
| 1     | Public Collector deployed with abuse protections, validated manually                      |
| 2     | Prometheus, Jaeger, and OpenSearch deployed with public read-only query access            |
| 3     | Source rollout: browser instrumentation on both sites, Edge Functions OTLP, and log drain |

## Open Questions

- **Configuration and IaC home**: where the Collector configuration and stack
  IaC live is a community decision scheduled for phase 1. A dedicated repository
  is the custodians' preference, with `open-telemetry/admin` as the alternative.
- **Data retention**: retention periods per backend are deferred until the phase
  2 persistence spike establishes each backend's storage constraints.

## Timeline

Access to the infrastructure was granted in July 2026 ([community#3368][]).
Milestones are listed in dependency order and carry no dates: the project is
volunteer-driven and depends on external decisions.

### Phase 1: Public Collector

1. Inventory the access granted to the Cloudflare account: roles, enabled
   products, and platform limits.
2. Decide with the community where the Collector configuration and stack IaC
   live (see [Open Questions](#open-questions)).
3. Deploy the Collector to Cloudflare Containers, with abuse protections and
   privacy scrubbing in place from the first deployment, and validate the OTLP
   endpoint manually.

### Phase 2: Backends

1. Persistence spike: container disk on the platform is ephemeral, so evaluate
   and decide a persistence strategy per backend. The outcome also settles data
   retention.
2. Deploy Prometheus, Jaeger, and OpenSearch with public read-only query access.

### Phase 3: Telemetry sources

Each source is an independent milestone, in rollout order:

1. Browser instrumentation on both sites
2. Server-side spans and metrics from Netlify Edge Functions
3. Netlify log drain

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
