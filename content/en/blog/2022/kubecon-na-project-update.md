---
title: OpenTelemetry Project and Roadmap Update from Kubecon
linkTitle: Project Update
date: 2022-10-26
author: Morgan McLean
---

2022 has been an incredible year for OpenTelemetry. Metrics became a first-class
signal type, and are being used on production services and infrastructure
alongside OpenTelemetry’s existing distributed tracing support to send critical
performance data to any observability backend for processing. Everywhere we look
we see OpenTelemetry being tested, rolled out, or already in use in
organizations everywhere, from the largest to smallest, from the most cutting
edge to the historically cautious.

Since January, we’ve delivered:

- Metrics: defined in the specification, and delivered in the Java, JS, .NET,
  and Python SDKs and instrumentation, with support all the way through the
  Collector and protocol. More language implementations are on the way.
- More instrumentation for all languages.
- [A great demo application](../announcing-opentelemetry-demo-release), which
  includes services written in every supported language, already instrumented
  with OpenTelemetry. This is a great way to see practical examples of
  OpenTelemetry that you can learn from or experiment with, and the demo can
  also be used to test out different observability analytics systems.
- Tracing stability in C++, Erlang, and a number of other new languages.
- Progress on Ruby, Erlang, Swift, and .NET auto instrumentation.
- Major progress on logs, OpenTelemetry’s third signal type.
- Documentation!
- Various improvements to all components.

The community also continues to grow substantially.
[We now have over 800 monthly-active developers on GitHub, from 150 different organizations](https://opentelemetry.devstats.cncf.io/d/7/companies-contributing-in-repository-groups?orgId=1&from=now-4y&to=now).
More and more of these contributors are end users -
[10 out of our top 25 contributing orgs](https://opentelemetry.devstats.cncf.io/d/5/companies-table?orgId=1) -
which is a very healthy signal for the project. People and companies are getting
so much usefulness out of OpenTelemetry that they’re contributing back and
making it even more useful for everyone.

We’re publishing this post during KubeCon, where many community members and end
users will be gathered discussing OpenTelemetry and how it’s being used, how it
can be improved, and where we should go from here. In May of this year at
KubeCon EU we
[started a process to create a more formal OpenTelemetry roadmap](https://docs.google.com/document/d/1jt47KPwgDG_-4kR4J5GtFSCEhQO3CHgUdAwpCKTQHO8/edit#),
and we’ll be continuing that process in Detroit. I’m writing this post in
advance of the conference, so I won’t be able to post the full outcome, but here
are some of the items that we think are most important:

- Finishing logs: completing the full specification and then implementing this
  spec across each language.
- Making OpenTelemetry easier to use, both technically (new features and
  functionality like an OpenTelemetry control plane), and through documentation,
  collecting user feedback, etc.
- Client instrumentation: extending OpenTelemetry to capture performance data
  from web, mobile, and desktop client applications. This can be used to capture
  data from true user-facing SLOs, show end-to-end latency in traces, etc.
- Profiling, which will tie service performance (captured today through metrics
  and traces) to actual function performance within code.
- Improving the contributor and maintainer experience.

Our focus for the remainder of this year and next year will be on both rounding
out OpenTelemetry’s existing functionality across all languages, scenarios, and
integrations, and on the roadmap items mentioned above. As mentioned above, in
the coming weeks we’ll be publishing a more formal roadmap document that
incorporates these, though it’s important to note that the prioritization and
progress made on each is dependent on the amount of effort and number of
community members that get engaged with each.

Many of these, like logs, client instrumentation, and profiling, are already
in-flight. We’re excited about these new initiatives because they not only
expand the project’s usefulness and bring it closer to its original vision, but
they have brought in a new wave of members to the community who are already
adding their knowledge, experience, and zeal to OpenTelemetry. These are
exciting days for the project, and it’s invigorating for everyone involved to
see it grow and be adopted so rapidly.
