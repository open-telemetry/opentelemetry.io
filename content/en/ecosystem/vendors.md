---
title: Vendors
description: Vendors who natively support OpenTelemetry
aliases: [/vendors]
# Note: the keywords after 'cSpell:ignore' must be on the same line, no wrapping, hence the Prettier ignore directive
---

A non-exhaustive list of organizations, offering solutions that consume
OpenTelemetry natively via via [OTLP](/docs/specs/otlp/), such as observability
backends and observability pipelines.

These solutions may be open source, commercial, or both. Some organizations
provide a [distribution](/docs/concepts/distributions/) (of customized
OpenTelemetry components), that provides additional capabilities or for improved
ease of use.

{{% ecosystem/vendor-table %}}

To have your organization listed, submit a PR with an entry added to the
[vendors list](https://github.com/open-telemetry/opentelemetry.io/tree/main/data/ecosystem/vendors.yaml).
The entry must include the following[^grace-period-2024-01-01]:

- Link to the documentation that details how your offering consumes
  OpenTelemetry natively via [OTLP](http://localhost:1313/docs/specs/otlp/).
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

[^grace-period-2024-01-01]:
    Organizations listed before July 2023 are exempt from these requirements
    until January 1, 2024, after which they will be removed unless updated.
