---
title: Security
cascade:
  collector_vers: 0.128.0
weight: 970
---

In this section, learn how the OpenTelemetry project discloses vulnerabilities
and responds to incidents and discover what you can do to securely collect and
transmit your observability data.

## Common Vulnerabilities and Exposures (CVEs)

For CVEs across all repositories, see
[Common Vulnerabilities and Exposures](cve/).

## Incident response

Learn how to report a vulnerability or find out how incident responses are
handled in [Community incident response guidelines](security-response/).

## Collector security

When setting up the OpenTelemetry Collector, consider implementing security best
practices in both your hosting infrastructure and your Collector configuration.
Running a secure Collector can help you

- Protect telemetry that shouldn't but might contain sensitive information, such
  as personally identifiable information (PII), application-specific data, or
  network traffic patterns.
- Prevent data tampering that makes telemetry unreliable and disrupts incident
  responses.
- Comply with data privacy and security regulations.
- Defend against denial of service (DoS) attacks.

See [Hosting best practices](hosting-best-practices/) to learn how to secure
your Collector's infrastructure.

See [Configuration best practices](config-best-practices/) to learn how to
securely configure your Collector.

For Collector component developers, see
[Security best practices](https://github.com/open-telemetry/opentelemetry-collector/blob/main/docs/security-best-practices.md).
