---
title: Announcing the Elastic Common Schema (ECS) and OpenTelemetry Semantic Convention Convergence
linkTitle: ECS and OTel SemConv Convergence
date: 2023-04-07
spelling:
  cSpell:ignore Reiley Yang
  cSpell:ignore ECS
author: '[Reiley Yang](https://github.com/reyang)'
---

Today, we're very excited to make a joint announcement with
[Elastic](https://www.elastic.co/) about the future of
[ECS](https://www.elastic.co/guide/en/ecs/master/ecs-reference.html) (Elastic
Common Schema) and the OpenTelemetry Semantic Conventions.

The goal is to achieve convergence of ECS and OTel Semantic Conventions into a
single open schema that is maintained by OpenTelemetry, so that OpenTelemetry
Semantic Conventions truly is a successor of the Elastic Common Schema.
OpenTelemetry shares the same interest of improving the convergence of
observability and security in this space. We believe this schema merge brings
huge value to the open-source community because:

* ECS has years of proven success in the logs, metrics, traces and security
  events schema, providing great coverage of the common problem domains.
* ECS provides schema for security domain fields, which is an important aspect
  of telemetry.
* Converging two separate standards into one single standard will help to boost
  the ecosystem (e.g. instrumentation libraries, tools and consumption
  experiences), which benefits both the telemetry producers and consumers.
* This joint effort would benefit from domain experts across logging, -
  distributed tracing, metrics and security. As a result, we expect to have more
  consistent signals across different pillars of observability and security.

Both Elastic and the OpenTelemetry community understand that converging two
widely used standards into one singular common schema, and having a smooth
transition is critical for users. A dedicated OpenTelemetry Semantic Convention
working group will be created with domain experts from both Elastic and
OpenTelemetry joining. We're also welcoming domain experts who are passionate
about data schemas and semantic conventions to join us. If you're interested in
contributing, join our [OTel Semantic Conventions working
group](https://github.com/open-telemetry/community#specification-sigs), and join
the discussion on our [Slack
channel](https://cloud-native.slack.com/archives/C041APFBYQP).

## References

* [Announcement from
  Elastic](https://elastic.co/blog/ecs-elastic-common-schema-otel-opentelemetry-announcement)
* [OpenTelemetry Semantic
  Conventions](https://opentelemetry.io/docs/concepts/semantic-conventions/)
* [OTEP 199: Merge Elastic Common Schema with OpenTelemetry Semantic
  Conventions](https://github.com/open-telemetry/oteps/blob/d02a3e2e75dc934fb38c5db88eb41fbe85730af4/text/0199-support-elastic-common-schema-in-opentelemetry.md)
