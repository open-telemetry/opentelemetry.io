---
title: Integrations
description:
  Libraries, services, and apps with first-party support for OpenTelemetry.
aliases: [/integrations]
---

The mission of OpenTelemetry is
[to enable effective observability by making high-quality, portable telemetry ubiquitous](/community/mission/).
In other words, observability should be built in into the software you develop.

The following list contains a sample of libraries, services, and apps that have
either integrated OpenTelemetry APIs and SDKs directly for native telemetry or
provide a first-party plugin that fits into their own extensibility ecosystem.

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
service, or app, then
[consider adding it to the registry](/ecosystem/registry/adding).

If you adopt OpenTelemetry for Observability as an end user and do not provide
any kind of services around OpenTelemetry, see [Adopters](/ecosystem/adopters).

If you provide a solution that consumes OpenTelemetry to offer observability to
end users, see [Vendors](/ecosystem/vendors).

{{% /alert %}}
