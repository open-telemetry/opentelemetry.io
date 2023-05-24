---
title: Troubleshooting
description: Recommendations for troubleshooting the collector
weight: 25
---

This page describes some options when troubleshooting the health or performance
of the OpenTelemetry Collector. The Collector provides a variety of metrics,
logs, and extensions for debugging issues.

## Sending test data

For certain types of issues, particularly verifying configuration and debugging
network issues, it can be helpful to send a small amount of data to a collector
configured to output to local logs. For details, see
[Local exporters](https://github.com/open-telemetry/opentelemetry-collector/blob/main/docs/troubleshooting.md#local-exporters).

## Checklist for debugging complex pipelines

It can be difficult to isolate problems when telemetry flows through multiple
collectors and networks. For each "hop" of telemetry data through a collector or
other component in your telemetry pipeline, it’s important to verify the
following:

- Are there error messages in the logs of the collector?
- How is the telemetry being ingested into this component?
- How is the telemetry being modified (i.e. sampling, redacting) by this
  component?
- How is the telemetry being exported from this component?
- What format is the telemetry in?
- How is the next hop configured?
- Are there any network policies that prevent data from getting in or out?

### More

For detailed recommendations, including common problems, see
[Troubleshooting](https://github.com/open-telemetry/opentelemetry-collector/blob/main/docs/troubleshooting.md)
from the Collector repo.
