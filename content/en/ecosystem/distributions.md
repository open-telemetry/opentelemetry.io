---
title: Third-party distributions
linkTitle: Distributions
description:
  List of open source OpenTelemetry distributions maintained by third parties.
---

OpenTelemetry [distributions] are a way of customizing OpenTelemetry
[components] so that they're easier to deploy and use with specific
observability backends.

Any third-party can customize OpenTelemetry components with backend, [vendor],
or end-user specific changes. You can use OpenTelemetry components without a
distribution, but a distribution might make things easier in some cases, like
when a vendor has specific requirements.

The following list contains a sample of non-collector OpenTelemetry
distributions and the component they customize. For
[OpenTelemetry Collector](/docs/collector/) distributions, see
[Collector distributions](/docs/collector/distributions/).

{{% ecosystem/distributions-table filter="non-collector" %}}

## Adding your distribution {#how-to-add}

To have your distribution listed, [submit a PR] with an entry added to the
[distributions list]. The entry should include the following:

- Link to the main page of your distribution
- Link to the documentation that explains how to use the distribution
- List the components your distribution contains
- GitHub handle or email address as a point of contact so that we can reach out
  in case we have questions

{{% alert title="Notes" color="info" %}}

- If you provide external integration of OpenTelemetry for any kind of library,
  service, or app, then consider
  [adding it to the registry](/ecosystem/registry/adding).
- If you adopt OpenTelemetry for observability as an end user and do not provide
  any kind of services around OpenTelemetry, see
  [Adopters](/ecosystem/adopters).
- If you provide a solution that consumes OpenTelemetry to offer observability
  to end users, see [Vendors](/ecosystem/vendors).

{{% /alert %}}

[submit a PR]: /docs/contributing/pull-requests/

{{% include keep-up-to-date.md distribution %}}

[components]: /docs/concepts/components/
[distributions]: /docs/concepts/distributions/
[distributions list]:
  https://github.com/open-telemetry/opentelemetry.io/tree/main/data/ecosystem/distributions.yaml
[vendor]: ../vendors/
