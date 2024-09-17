---
title: Security in OpenTelemetry
description: Security in OpenTelemetry
weight: 10
---

When setting up the OpenTelemetry (OTel) Collector, consider implementing
security best practices in both your hosting infrastructure and your OTel
Collector configuration. Running a secure Collector can help you

- Protect telemetry that might contain sensitive information, such as personally
  identifiable information (PII), application-specific data, or network traffic
  patterns.
- Prevent data tampering that makes telemetry unreliable and disrupts incident
  responses.
- Comply with data privacy and security regulations.
- Defend against denial of service (DoS) attacks.

See [Hosting best pracices](/security/otel-collector-hosting-best-practices) to
learn how to secure your Collector's infrastructure.

See
[Configuration best practices](/security/otel-collector-configuration-best-practices)
to learn how to securely configure your Collector.

For Collector component developers, see
[Security best practices](https://github.com/open-telemetry/opentelemetry-collector/blob/main/docs/security-best-practices.md).
