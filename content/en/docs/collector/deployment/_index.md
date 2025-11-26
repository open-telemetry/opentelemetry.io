---
title: Deploy the Collector
linkTitle: Deploy
description: Patterns you can apply to deploy the OpenTelemetry Collector
weight: 3
---

The OpenTelemetry Collector consists of a single binary that you can deploy in
different ways for different use cases. This section describes common deployment
patterns, their use cases, and pros and cons. It also provides best practices
for configuring the Collector in cross-environment and multi-backend scenarios.
For deployment-related security considerations, see the [Collector hosting best
practices][security].

## Additional resources

- KubeCon NA 2021 talk on [OpenTelemetry Collector Deployment
  Patterns][y-patterns]
  - [Deployment patterns][gh-patterns] accompanying the talk

[security]: /docs/security/hosting-best-practices/
[gh-patterns]:
  https://github.com/jpkrohling/opentelemetry-collector-deployment-patterns/
[y-patterns]: https://www.youtube.com/watch?v=WhRrwSHDBFs
