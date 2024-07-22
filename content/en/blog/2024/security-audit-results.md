---
title: OpenTelemetry Security Audit Published
linkTitle: Security Audit Results
date: 2024-07-22
author: '[Austin Parker](https://github.com/austinlparker)'
issue:
sig: GC
---

Thousands of organizations and millions of users around the world rely on
[OpenTelemetry](/) as part of their observability toolkit. To this end, it is
our responsibility as a project to ensure our code is safe, secure, and
performant. In conjunction with [OSTIF](https://ostif.org/) and
[7ASecurity](https://7asecurity.com/), and the support of the
[Cloud Native Computing Foundation](https://www.cncf.io/), we recently engaged
upon a security audit of the OpenTelemetry Collector and four SDKs – Go, Java,
C#, and Python.

We are pleased to announce the publication of this audit, as well as its
results. One CVE was identified and remediated prior to the publication of this
audit (see [CVE-2024-36129](https://nvd.nist.gov/vuln/detail/CVE-2024-36129) for
information) in the OpenTelemetry Collector, and five hardening recommendations
were made. Overall, the results of the audit are very positive, with the
auditors noting the high quality of source code and the security best practices
that the project is following.

The conclusion of this audit marks an important milestone on our journey towards
the next stage of maturity in the CNCF, graduation. We’ll have more to share on
that in the coming months. The OpenTelemetry Governance Committee and Security
SIG would also like to personally commend the contributors and maintainers of
OpenTelemetry for their high-quality work over the years.

Finally, we would like to thank the following individuals and groups:

- SIG Security
- SIG Collector
- 7ASecurity
- OSTIF

You can read more about the audit on the
[OSTIF](https://www.ostif.org/otel-audit-complete/) and 7A Security blogs, or
read the
[full report](https://7asecurity.com/reports/pentest-report-opentelemetry.pdf).
