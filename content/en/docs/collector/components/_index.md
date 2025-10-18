---
title: Components
description: OpenTelemetry Collector components - receivers, processors, exporters, connectors, and extensions
weight: 300
---

The OpenTelemetry Collector is made up of components that handle telemetry data. Each component has a specific role in the data pipeline.

## Component Types

- **[Receivers](receiver/)** - Collect telemetry data from various sources and formats
- **[Processors](processor/)** - Transform, filter, and enrich telemetry data
- **[Exporters](exporter/)** - Send telemetry data to observability backends
- **[Connectors](connector/)** - Connect two pipelines, acting as both exporter and receiver
- **[Extensions](extension/)** - Provide additional capabilities like health checks

## Stability Levels

Each component has a stability level that indicates its maturity:

- **stable** - Ready for production use
- **beta** - Mostly stable, but may have minor changes
- **alpha** - Early development, expect breaking changes
- **development** - Experimental, subject to change or removal
- **unmaintained** - No longer actively maintained

For signal-based components (receivers, processors, exporters, connectors), stability is shown per signal type (traces/metrics/logs).
