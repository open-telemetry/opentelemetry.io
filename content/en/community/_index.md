---
title: Community
menu:
  main:
    weight: 40
---
{{% blocks/section type="section" color="white" %}}

# Special Interest Groups
We organize the community into Special Interest Groups (SIGs) in order to improve our workflow and more easily manage a community project.  

[Cross-language Specification](https://github.com/open-telemetry/community#cross-language-specification)

[Agent/Collector](https://github.com/open-telemetry/community#agentcollector)

[.NET SDK](https://github.com/open-telemetry/community#net-sdk)

[C/C++ SDK](https://github.com/open-telemetry/community#cc-sdk)

[GoLang SDK](https://github.com/open-telemetry/community#golang-sdk)

[Java SDK](https://github.com/open-telemetry/community#java-sdk)

[Java Auto-Instrumentation](https://github.com/open-telemetry/community#java-auto-instrumentation)

[JavaScript SDK](https://github.com/open-telemetry/community#javascript-sdk)

[Python SDK](https://github.com/open-telemetry/community#python-sdk)

[Ruby SDK](https://github.com/open-telemetry/community#ruby-sig)

[Erlang/Elixir SDK](https://github.com/open-telemetry/community#erlangelixir-sdk)

# Community
Interested in getting involved but not sure where to start? Check out our [community repo](https://github.com/open-telemetry/community) to find out more.

# OpenTelemetry.io
If you want to help us out with our website check us out [here](https://github.com/open-telemetry/opentelemetry.io).

# Community Meetings
We host monthly community video conferences, alternating between times that work for Europe and Asia. These meetings are open to all contributors!

Meeting invites can be accessed from our public Calendar ([web](https://calendar.google.com/calendar/embed?src=google.com_b79e3e90j7bbsa2n2p5an5lf60%40group.calendar.google.com), [gCal](https://calendar.google.com/calendar?cid=Z29vZ2xlLmNvbV9iNzllM2U5MGo3YmJzYTJuMnA1YW41bGY2MEBncm91cC5jYWxlbmRhci5nb29nbGUuY29t), [iCal](https://calendar.google.com/calendar/ical/google.com_b79e3e90j7bbsa2n2p5an5lf60%40group.calendar.google.com/public/basic.ics)), and we keep public notes in the agenda document available [here](https://docs.google.com/document/d/1uvua6R-VnOpMmAjM3b7j3jQDFz6KHDzbEX4ZaZ9BFso/edit).

# Code of Conduct
OpenTelemetry follows the [CNCF Code of Conduct](https://github.com/cncf/foundation/blob/master/code-of-conduct.md).

# Registry
Do you maintain or contribute to an integration for OpenTelemetry? We'd love to feature your project in the [registry](/registry)!

To add your project, please make a pull request to the [opentelemetry.io repository on GitHub](https://github.com/open-telemetry/opentelemetry.io). You'll need to create a data file in `/content/registry` for your project in the following format:

```
---
title: My OpenTelemetry Integration // the name of your project
registryType: <exporter/api/collector/plugin> // the type of integration; is this an exporter, plugin, API package, or something else?
isThirdParty: <false/true> // this is only true if the project is maintained by the OpenTelemetry project
language: <collector/cpp/dotnet/erlang/go/java/js/php/python/etc> // language of your integration
tags:
  - <language>
  - <other useful search terms>
repo: https://github.com/your-organization/your-repo // projects don't have to be hosted on github, but this should link to the git or other source control repository for your project
license: Apache 2.0 // or whatever your OSS license is
description: A friendly description of your integration/plugin
authors: <The author or authors of your integration. An email is a great thing to include!>
otVersion: <The OpenTelemetry version your plugin targets.>
---
```

Once you've created this data file, make a pull request and we'll add your project to the registry!

# Vendor Support

Please see the [vendors](/vendors) page for information on companies that distribute or natively support OpenTelemetry.

{{% /blocks/section %}}
