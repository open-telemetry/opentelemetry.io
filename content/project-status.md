---
Title: "Project Status"
---

OpenTelemetry implementations are currently in **pre-release** status. This page tracks the overall release milestones as we move towards full releases for each language SIG. You can find more details about the milestones at [this link](https://github.com/open-telemetry/opentelemetry-specification/blob/master/milestones.md)

# Summary
Our current goal is to provide a generally available, production quality release by the second half of 2020. Currently, we are in the _alpha_ stage. What follows is a brief explanation of what we expect to be available, when.

## 0.2
This release is expected to include a functional tracing implementation. While the API may change, you should be able to use these releases to begin exploring and understanding the API and the SDK, and the changes that have been made from OpenTracing/OpenCensus. This release also includes support for distributed context using the W3C TraceContext specification.

## 0.3
This release is expected to contain a functional metrics implementation. Again, you may see changes to the API and the SDK after this point, but it's anticipated that these releases will allow you to explore and understand the changes that have been made from OpenCensus. In addition, this release is anticpated to include improvements to OpenTelemetry Context (such as handling baggage), various semantic conventions around trace and metric metadata, and a finalized OpenTelemetry protocol.

## 0.4
This release is expected to contain further improvements to the tracing and metrics API and SDK in response to feedback gathered during the prior alpha releases. Additionally, we expect that the OpenTelemetry protocol will be fully implemented and languages will include an exporter to the OpenTelemetry Collector. At this phase, we anticipate all APIs will be unlikely to change.

## Beta, RC, and Release
We anticipate that once the alpha phase is complete, we'll enter into a period of final stabilization work around the API, SDK, and other components. This includes benchmarking, profiling, interoperability testing suites, and other work to ensure that the final release is performant and of a high quality. This work is anticipated to complete by the second half of 2020.

# Current SIG Progress
{{< progress_chart >}}
<sub>Click a progress bar in the above chart to go to that SIGs repository.</sub>

# Current SIG Release
{{< release_notes >}}
