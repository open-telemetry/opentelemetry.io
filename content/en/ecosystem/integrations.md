---
title: Integrations
description:
  Libraries, services and apps with first-party support of OpenTelemetry.
aliases: [/integrations]
---

OpenTelemetry's mission is
[to enable effective observability by making high-quality, portable telemetry ubiquitous](/community/mission/).
This means, that we not only want you to get observability for the applications
you develop, but that observability should be built in to all the software you
use!

On this page we showcase a non-exhaustive list of libraries, services and apps,
that provide you with easy-to-use observability powered by OpenTelemetry. Those
libraries, services and apps have either integrated OpenTelemetry APIs & SDKs
directly for **native** out of the box telemetry or they provide a first-party
plugin that nicely fits into their own extensibility ecosystem.

{{% ecosystem/integrations-table %}}

To have your library, service, or app listed, submit a PR with an entry added to
the
[integrations list](https://github.com/open-telemetry/opentelemetry.io/tree/main/data/ecosystem/integrations.yaml).
The entry must include the following:

- Link to the main page of your library, service, or app
- Link to the documentation that explains how enable observability using
  OpenTelemetry

{{% alert title="Note" color="info" %}}

If you provide external integration of OpenTelemetry for any kind of library,
service, or app, then [add it to the registry](/ecosystem/registry/adding).

If you adopt OpenTelemetry for Observability as an end user and do not provide
any kind of services around OpenTelemetry, see [Adopters](/ecosystem/adopters).

If you provide a solution that consumes OpenTelemetry to offer Observability to
end users, see [Vendors](/ecosystem/vendors).

{{% /alert %}}
