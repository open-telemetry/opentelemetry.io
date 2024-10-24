---
title: Vendors
description: Vendors who natively support OpenTelemetry
aliases: [/vendors]
---

A non-exhaustive list of organizations offering solutions that consume
OpenTelemetry natively via [OTLP](/docs/specs/otlp/), such as observability
backends and observability pipelines.

Some organizations provide a [distribution](/ecosystem/distributions/) (of
customized OpenTelemetry components), that provides additional capabilities or
for improved ease of use.

Open Source (OSS) refers to a vendor who has an observability product that is
[open source](https://opensource.org/osd). The vendor may still have other
products that are closed source, such as a SaaS offering that hosts an open
source product for their customers.

{{% ecosystem/vendor-table %}}

## Add your organization

To have your organization listed, submit a PR with an entry added to the
[vendors list](https://github.com/open-telemetry/opentelemetry.io/tree/main/data/ecosystem/vendors.yaml).
The entry should include the following:

- Link to the documentation that details how your offering consumes
  OpenTelemetry natively via [OTLP](/docs/specs/otlp/).
- Link to your distribution, if applicable
- Link that proves that your offering is open source, if applicable. An open
  source distribution does not qualify your offering to be marked "open source".
- GitHub handle or email address as a point of contact so that we can reach out
  in case we have questions

Note that this list is for organizations that consume OpenTelemetry and offer
Observability to [end users](https://community.cncf.io/end-user-community/).

If you adopt OpenTelemetry for Observability as an end-user organization, and
you do not provide any kind of services around OpenTelemetry, see
[Adopters](/ecosystem/adopters).

If you provide a library, service, or app that is made observable through
OpenTelemetry, see [Integrations](/ecosystem/integrations).
