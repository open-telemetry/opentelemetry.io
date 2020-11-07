# <img src="https://opentelemetry.io/img/logos/opentelemetry-logo-nav.png" alt="OpenTelemetry Icon" width="45" height=""> OpenTelemetry.io

This repo houses the source code for the
[OpenTelemetry](https://opentelemetry.io) website and project documentation.

## Adding a project to the OpenTelemetry Registry

Do you maintain or contribute to an integration for OpenTelemetry? We'd love to
feature your project in the registry!

To add your project, please make a pull request. You'll need to create a data
file in `/content/en/registry` for your project in the following format:

```
---
title: My OpenTelemetry Integration // the name of your project
registryType: <exporter/core/instrumentation> // the type of integration; is this an exporter, plugin, API package, or something else?
isThirdParty: <false/true> // this is only true if the project is maintained by the OpenTelemetry project
language: <js/go/dotnet/etc. or collector for collector plugins>
tags:
  - <other useful search terms>
repo: https://github.com/your-organization/your-repo // projects don't have to be hosted on github, but this should link to the git or other source control repository for your project
license: Apache 2.0 // or whatever your OSS license is
description: A friendly description of your integration/plugin
authors: <The author or authors of your integration. An email is a great thing to include!>
otVersion: <The OpenTelemetry version your plugin targets.>
---
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

Maintainers ([@open-telemetry/docs-approvers](https://github.com/orgs/open-telemetry/teams/docs-approvers)

- [Steve Flanders](https://github.com/flands), Splunk
- [Morgan McLean](https://github.com/mtwo), Google
- [Austin Parker](https://github.com/austinlparker), LightStep

Learn more about roles in the [community repository](https://github.com/open-telemetry/community/blob/master/community-membership.md).

Thanks to all the people who already contributed!

<a href="https://github.com/open-telemetry/opentelemetry.io/graphs/contributors">
  <img src="https://contributors-img.web.app/image?repo=open-telemetry/opentelemetry.io" />
</a>
