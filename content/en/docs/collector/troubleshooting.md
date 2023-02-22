---
title: Troubleshooting
weight: 32
---

The OpenTelemetry Collector supports a variety of metrics, logs, and extensions
for troubleshooting collector health and performance.

Detailed recommendations, including common problems, are detailed in the
OpenTelemetry Collector GitHub repo's
[troubleshooting document](https://github.com/open-telemetry/opentelemetry-collector/blob/main/docs/troubleshooting.md).

## Sending test data

For certain types of issues, particularly verifing configuration and debugging
network issues, it can be helpful to send a small amount of data to a collector
configured to output to local logs. This is detailed in
["Local exporters" in the collector configuration documentation](https://github.com/open-telemetry/opentelemetry-collector/blob/main/docs/troubleshooting.md#local-exporters).

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
