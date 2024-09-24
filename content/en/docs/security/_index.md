---
title: Security
weight: 970
---

Learn how the OpenTelemetry project discloses vulnerabilities and responds to
incidents. Find out how to ensure your observability data is collected and
transmitted in a secure manner.

## Common Vulnerabilities and Exposures (CVEs)

For CVEs across all repositories, see
[Common Vulnerabilities and Exposures](/docs/security/cve).

## Incident response

Learn how to report a vulnerability or find out how incident responses are
handled in
[Community incident response guidelines](/docs/security/security-response).

## Collector security

When setting up the OpenTelemetry (OTel) Collector, consider implementing
security best practices in both your hosting infrastructure and your OTel
Collector configuration. Running a secure Collector can help you

- Protect telemetry that shouldn't but might contain sensitive information, such
  as personally identifiable information (PII), application-specific data, or
  network traffic patterns.
- Prevent data tampering that makes telemetry unreliable and disrupts incident
  responses.
- Comply with data privacy and security regulations.
- Defend against denial of service (DoS) attacks.

See [Hosting best practices](/docs/security/hosting-best-practices) to learn how
to secure your Collector's infrastructure.

See [Configuration best practices](/docs/security/config-best-practices) to
learn how to securely configure your Collector.

For Collector component developers, see
[Security best practices](https://github.com/open-telemetry/opentelemetry-collector/blob/main/docs/security-best-practices.md).
