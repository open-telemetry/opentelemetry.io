---
title: OpenTelemetry eBPF Instrumentation reaches v1.0.0
linkTitle: OBI v1.0.0
date: 2026-10-30
publishDate: 2026-10-30
author: >-
  [Tyler Yahn](https://github.com/MrAlias) (Splunk)
draft: true
issue: 12395
sig: SIG eBPF Instrumentation
# cSpell:ignore Aerospike Avni Beyla GenAI Giuseppe Grcevski
# cSpell:ignore Haibin Macias marctc Mattia Meleleo Nimrod Ognibene
# cSpell:ignore Ollama Qwen reranking Roquetto Yahn
---

We're excited to announce v1.0.0 of OpenTelemetry eBPF Instrumentation—OBI!

[OBI](/docs/zero-code/obi/) brings OpenTelemetry observability to running Linux
applications without requiring changes to their source code. It uses eBPF,
together with runtime-specific instrumentation, to capture application metrics
and traces across services, languages, and frameworks. You can start with
request rates, errors, latency, and service dependencies, then build deeper
visibility as your needs grow.

This release fulfills the
[flagship goal we set for 2026](/blog/2026/obi-goals/): establishing a stable
foundation for OBI. It represents a year of expanding instrumentation coverage,
improving correctness, strengthening release tooling, and building the
compatibility and telemetry migration practices that users need to operate OBI
over time.

For users, the most important change is predictability: knowing what to expect
from an upgrade and how to move forward when something changes.

OBI 1.0 establishes [documented compatibility commitments][versioning] for
configuration and deployment, including Config v2, its generated schema,
documented deployment interfaces, and supported environments.

For telemetry, the commitment is a reliable migration path as OBI and
OpenTelemetry evolve. OBI emits a mixture of telemetry that follows stable
semantic conventions and telemetry whose conventions are still developing. The
latter can change as those conventions mature. We will also correct bugs in
telemetry that follows stable conventions when its actual behavior does not
conform to them.

To make that evolution manageable, OBI describes its telemetry in a
[Weaver-compatible schema registry][registry].
[OpenTelemetry Weaver](https://github.com/open-telemetry/weaver) helps us
define, validate, and review that telemetry against the conventions it should
follow. Published [telemetry schemas](/docs/specs/otel/schemas/) describe
transformations between versions where those changes can be represented, while
release notes and migration guidance explain changes that need additional
action.

For teams maintaining dashboards, alerts, and processing pipelines, this
provides a way to plan upgrades and adapt deliberately. The promise is a
supported path forward as telemetry evolves, with the definitions, tooling, and
guidance needed to understand and manage that change.

That foundation comes with substantial progress across the project.

- **Broader visibility into application dependencies.** Across the releases
  leading to 1.0, OBI added instrumentation for systems including MQTT, NATS,
  AMQP 1.0, MSSQL, Couchbase, Memcached, and Aerospike. For teams operating
  mixed technology stacks, that means more opportunities to understand database
  and messaging activity through one instrumentation approach. The [support
  matrix][support] documents coverage, trace propagation capabilities, and
  limitations for each protocol.

- **Better traces and more useful service detail.** [Improvements to HTTP/2 and
  gRPC propagation][v0-14] strengthened handling of existing connections,
  multiplexed traffic, and individual stream contexts. Framework route discovery
  expanded to Django, FastAPI, Flask, Rails, .NET, and several PHP frameworks.
  Route templates help teams distinguish slow endpoints without turning every
  unique URL into a separate metric series.

- **A path from automatic instrumentation to application-specific insight.** OBI
  can capture application-authored spans through [supported OpenTelemetry Go
  Trace API and Auto SDK configurations][v0-11]. Node.js also gained [opt-in
  manual span capture][v0-12-1] for applications without a registered SDK. These
  capabilities let developers add detail about business operations while using
  OBI for the surrounding automatic instrumentation, subject to the documented
  runtime requirements.

- **More context for investigating incidents.**
  [Trace-log correlation](/docs/zero-code/obi/trace-log-correlation/) can enrich
  supported application logs with trace context, helping teams move from a
  request's path to the logs associated with it. Mattia Meleleo's
  [walkthrough of zero-code trace-log correlation](/blog/2026/obi-trace-log-correlation/)
  shows it working across two services and explains how to enable it. OBI also
  added [runtime metrics across Go, Java, .NET, Node.js, and Python][runtime],
  alongside network measurements such as TCP retransmissions and failed
  connections. Runtime metrics remain experimental, with availability depending
  on the runtime and enabled features.

- **Instrumentation for AI applications.** OBI's coverage expanded to model
  providers, embeddings, reranking, vector retrieval, and MCP interactions. The
  work includes [tool-call and retrieval instrumentation][v0-10], along with
  [OpenAI-compatible gateways and native Ollama support][v0-11]. These
  capabilities help teams investigate AI dependencies alongside the rest of
  their application. Detailed extraction requires explicit payload-capture and
  feature configuration; it is not enabled automatically for every deployment.

Much of the work behind 1.0 is less visible than a new protocol, but essential
to operating instrumentation. Contributors [hardened parsers and corrected
lifecycle and export behavior][v0-12-1], [addressed buffer-safety and
connection-disruption bugs][v0-13], and improved trace-parent relationships.
Release tooling added [signed artifacts, checksums, and software bills of
materials][rc2], while validation expanded across kernels and architectures.
These investments help users evaluate and operate the software they deploy.

For existing users, Config v2 is the configuration contract for 1.0. Available
since v0.11.0, it includes a generated schema and the `obi config validate` and
`obi config migrate` commands. Config v1 remains supported for backward
compatibility, but is frozen and receives no fixes or new features. Follow the
[configuration migration guide][migration], review configuration supplied
through environment variables, and compare telemetry in a canary deployment
before rolling out broadly. Users embedding OBI in a Collector should also
review the [receiver's separate v0 release line][receiver-versioning] when
selecting versions.

If you're new to OBI,
[start with a representative service](/docs/zero-code/obi/setup/) on a supported
Linux host or Kubernetes cluster. Export to your OpenTelemetry Collector or
compatible backend, inspect the resulting metrics and traces, and expand from
there. Language agents and manual instrumentation remain valuable when you need
application-specific context beyond what OBI can observe automatically.

OBI began with the donation of Grafana Beyla and reached its
[first alpha release through collaboration across organizations and the wider OpenTelemetry community](/blog/2025/obi-announcing-first-release/).
That collaboration has carried the project to 1.0.

We want to give special thanks to contributors whose sustained work helped make
this milestone possible:

- [Nikola Grcevski](https://github.com/grcevski) and
  [Mario Macias](https://github.com/mariomac), for developing OBI's
  instrumentation foundation and extending its runtime support, service
  discovery, framework integration, and configuration.
- [Nimrod Avni](https://github.com/NimrodAvni78), for configuration schema
  generation, Collector integration, protocol coverage, and the telemetry
  registry and Weaver validation work.
- [Mattia Meleleo](https://github.com/mmat11), for trace-log correlation,
  trace-context handling, Go instrumentation improvements, and release
  preparation.
- [Rafael Roquetto](https://github.com/rafaelroquetto), for eBPF infrastructure,
  buffer handling, parser hardening, and performance improvements.
- [Giuseppe Ognibene](https://github.com/pinoOgni), for network observability,
  BPF verifier testing, runtime metrics, and instrumentation and exporter
  correctness.
- [Stephen Lang](https://github.com/skl), for strengthening CI, integration
  tests, and ARM coverage, alongside application instrumentation improvements.
- [@marctc](https://github.com/marctc), for expanding protocol instrumentation,
  Python asynchronous tracing, and Python and .NET runtime metrics.
- [@NameHaibinZhang](https://github.com/NameHaibinZhang), for expanding GenAI
  instrumentation, including embeddings, reranking, Qwen, and MCP.

Thank you, too, to every community member who contributed code, reviewed
changes, improved documentation, reported a bug, or shared experience running
OBI. Reproductions, deployment feedback, and questions about unexpected behavior
have all helped us build a better project. This release belongs to everyone who
helped get it here.

With 1.0 released, we're turning that momentum toward planning OBI's work for
2027—and we want you to help shape it.

If there's an issue you've been following, a protocol or runtime you want
supported, or a feature that would make OBI more useful in your environment,
tell us. Add your use case to an
[existing issue](https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation/issues),
[open a feature request](https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation/issues/new/choose),
or bring your ideas to a
[SIG eBPF Instrumentation meeting](https://github.com/open-telemetry/community#sig-ebpf-instrumentation).
Tell us what you're trying to accomplish, what gets in your way today, and what
a successful solution would enable.

[Try OBI 1.0](/docs/zero-code/obi/setup/), share your experience, and help us
choose what to build next.

[versioning]:
  https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation/blob/v1.0.0-rc.2/VERSIONING.md
[registry]:
  https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation/tree/v1.0.0-rc.2/schemas/obi
[support]:
  https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation/blob/v1.0.0-rc.2/SUPPORT_MATRIX.md
[runtime]:
  https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation/blob/v1.0.0-rc.2/SUPPORT_MATRIX.md#runtime-metrics
[v0-10]:
  https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation/releases/tag/v0.10.0
[v0-11]:
  https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation/releases/tag/v0.11.0
[v0-12-1]:
  https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation/releases/tag/v0.12.1
[v0-13]:
  https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation/releases/tag/v0.13.0
[v0-14]:
  https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation/releases/tag/v0.14.0
[rc2]:
  https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation/releases/tag/v1.0.0-rc.2
[migration]:
  https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation/blob/v1.0.0-rc.2/devdocs/config/version-2.0/migration.md
[receiver-versioning]:
  https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation/blob/v1.0.0-rc.2/VERSIONING.md#release-scope
