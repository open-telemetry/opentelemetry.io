---
title: Vendors
description: Vendors who natively support OpenTelemetry
aliases: [/vendors]
# Note: the keywords after 'cSpell:ignore' must be on the same line, no wrapping, hence the Prettier ignore directive
# prettier-ignore
---

A non-exhaustive list of organizations that provide solutions which consume
OpenTelemetry natively via [OTLP](/docs/specs/otlp/) e.g. observability backends
or observability pipelines.

Those offerings may be open source, commercial or both. Some organizations
provide a [distribution](/docs/concepts/distributions/) (a customized version of
OpenTelemetry components), that provide additional capabilities or ease of use.

{{% ecosystem/vendor-table %}}

To have your organization included,
[add an entry to the list](https://github.com/open-telemetry/opentelemetry.io/tree/main/data/ecosystem/vendors.yaml)
and submit a PR.

You will need to include[^existing-entries]:

- a link to the documentation on how your offering consumes OpenTelemetry
  natively via [OTLP](http://localhost:1313/docs/specs/otlp/).
- if applicable, a link to your distribution.
- if applicable, a link that proves that your offering is open source. An open
  source distribution does not qualify your offering to be marked "open source".
- a point of contact (GitHub handle or email address), we can reach out for
  future inquiries.

Note, that this list is for organizations that consume OpenTelemetry to offer
Observability to end users.

If you adopt OpenTelemetry for Observability as an end user and do not provide
any kind of services around OpenTelemetry, see [Adopters](/ecosystem/adopters). <br /> If
you provide a library, service or app made observable through OpenTelemetry, see
[Integrators](/ecosystem/integrations).

[^existing-entries]:
    Organizations that have been part of this list before July 2023 are exempted
    from these requirements until January, 1th 2024.
