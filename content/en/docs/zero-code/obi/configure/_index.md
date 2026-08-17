---
title: Configure OBI
linkTitle: Configure
description: Learn how to configure OBI.
weight: 4
---

You can configure OBI by setting [export modes](export-modes/), global
properties, and component options.

For information on the metrics OBI exports, refer to the
[exported metrics](../metrics/) documentation.

Refer to the [routes decorator](routes-decorator/) documentation to configure
the low cardinality routes decorator. It's very important for optimal results.

## Configuration versions

OBI v0.11.0 and later support both the existing Config v1 format and the
declarative Config v2 format for standalone OBI and the OBI Collector receiver.
Config v1 remains supported.

Before migrating a production deployment, review the
[Config v1 to v2 migration guide](https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation/blob/v0.11.0/devdocs/config/version-2.0/migration.md).
Use `obi config validate <path>` to validate a standalone configuration and
`obi config migrate <path>` to convert a standalone Config v1 file. For an OBI
Collector receiver configuration body, use receiver mode for both commands:

```sh
obi config migrate --mode=receiver ./obi-receiver-v1.yaml > ./obi-receiver-v2.yaml
obi config validate --mode=receiver ./obi-receiver-v2.yaml
```

The migrator does not consume environment-variable overlays and rejects settings
it cannot preserve. In receiver mode, move standalone-only exporter, enrichment,
correlation, daemon, and internal telemetry settings to the appropriate
Collector pipelines, processors, and service telemetry settings.

See the
[Config v2 reference](https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation/blob/v0.11.0/devdocs/config/version-2.0/config-v2.md)
for the document structure and supported fields.
