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

OBI v0.11.0 and later support two OBI configuration formats: Config v1 and
Config v2. Both work with standalone OBI and the OBI Collector receiver. Config
v2 uses the OpenTelemetry declarative configuration structure for common
settings and places OBI-specific settings under `extensions.obi`. Config v1
remains supported.

- To write a new Config v2 file, start with the
  [Config v2 reference](config-v2/).
- To convert an existing Config v1 file, follow the
  [Config v1 to v2 migration guide](migrate-to-config-v2/).

Unless otherwise noted, the other pages in this section describe Config v1. Each
page links to the corresponding Config v2 guidance.
