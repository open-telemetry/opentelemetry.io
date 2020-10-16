---
Title: "Project Status"
---

OpenTelemetry implementations are currently in **beta** status. This page tracks the overall release milestones as we move towards full releases for each language SIG. You can find more details about the milestones at [this link](https://github.com/open-telemetry/opentelemetry-specification/milestones).

## Summary
Our current goal is to provide a generally available, production quality release by the second half of 2020. Currently, we are in the **beta** stage. What follows is a brief explanation of what we expect to be available, when.

### 0.2
This release included a functional tracing implementation. While the API may change, you should be able to use these releases to begin exploring and understanding the API and the SDK, and the changes that have been made from OpenTracing/OpenCensus. This release also included support for distributed context using the W3C TraceContext specification.

### 0.3 (first beta release)
v0.3 is expected to contain a functional metrics implementation. Again, you may see changes to the API and the SDK after this point, but it's anticipated that these releases will allow you to explore and understand the changes that have been made from OpenCensus. In addition, this release is anticipated to include improvements to OpenTelemetry Context, various semantic conventions around trace and metric metadata, and a finalized OpenTelemetry protocol.

We are planning to take a wave of OpenTelemetry components to beta on or after March 16th 2020. These components include the **Java**, **JavaScript**, **Python**, **Go**, and **.Net** APIs and SDKs, along with the OpenTelemetry Collector, though more will be added if they’re able to meet their milestones in time.

We’ve set the following requirements for components to reach beta:

* All spec version <= 0.3 features must be implemented. For APIs and SDKs this includes all 0.3 features for traces, metrics, context propagation, and resource metadata. For the Collector this includes the OpenTelemetry proto format
* Smaller changes are already scheduled for the v0.4 and v0.5 versions of the spec, but they may be implemented during the beta. Presumably, beta feedback will create further changes
* All APIs will attempt to be final, with the goal of not introducing any breaking changes between beta and GA RC. If breaking changes must be introduced between beta and GA RC, they will be small
* Components must support the OpenTelemetry-native exporter. Components should support exporters for Jaeger, Prometheus, and Zipkin, though some of these might be added soon after the component enters beta. The Collector must also include receivers for these formats
* APIs must include at least one HTTP and gRPC integration, though these are packaged separately. APIs should include at least one SQL integration, and can include a web framework integration (this is a stretch goal)

### <1.0 (additional beta releases)
These releases are expected to contain further improvements to the tracing and metrics API and SDK in response to feedback gathered during the prior alpha and beta releases. Additionally, we expect that the OpenTelemetry protocol will be fully implemented and languages will include an exporter to the OpenTelemetry Collector. At the end of these beta releases, we anticipate all APIs will be unlikely to change.

### RC and GA
We anticipate that once the beta phase is complete, we'll enter into a period of final stabilization work around the API, SDK, and other components. This includes benchmarking, profiling, interoperability testing suites, and other work to ensure that the final release is performant and of a high quality. This work is anticipated to complete by the second half of 2020.

## Want to Contribute?

For detailed information on contributing, [Austin Parker](https://twitter.com/austinlparker) wrote a great article called, [How to Start Contributing to OpenTelemetry](https://medium.com/opentelemetry/how-to-start-contributing-to-opentelemetry-b23991ad91f4).

Want to get started right away? Check out the [OpenTelemetry GitHub repos](https://github.com/open-telemetry), find an issue, and hack away!

You can always join the [community on GitHub](https://github.com/open-telemetry/community) and the [conversation on Gitter](https://gitter.im/open-telemetry/community). Use OpenTelemetry's [public calendar](https://calendar.google.com/calendar?cid=Z29vZ2xlLmNvbV9iNzllM2U5MGo3YmJzYTJuMnA1YW41bGY2MEBncm91cC5jYWxlbmRhci5nb29nbGUuY29t
) to keep track of SIG meetings.

## Current SIG Release
{{< release_notes >}}
