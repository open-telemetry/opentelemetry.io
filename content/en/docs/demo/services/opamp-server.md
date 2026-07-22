---
title: OpAMP Server
linkTitle: OpAMP Server
aliases: [opampserver]
cSpell:ignore: opampextension opampserver
---

This service runs the Go reference [OpAMP](/docs/specs/opamp/) server from
[`open-telemetry/opamp-go`](https://github.com/open-telemetry/opamp-go). The
OpenTelemetry Collector connects to it through the Collector `opampextension`
and reports its health, version, attributes, and effective configuration,
demonstrating how OpAMP can act as a Collector control plane.

[OpAMP server source](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/opamp-server/)

The server also exposes a minimal HTML UI — routed through the frontend proxy at
<http://localhost:8080/opamp/> — that lists the connected agents (Collectors)
and their reported status. The reference UI is patched during the Docker build
so its links work under the demo's `/opamp/` proxy prefix.
