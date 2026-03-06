---
title: Profiles
weight: 5
description: A recording of resource usage at the code level.
---

**Status**: [Development](/docs/specs/otel/document-status/)

> [!NOTE]
>
> The profiles signal is still experimental and under active development.
> Breaking changes may be introduced in future versions.

A **profile** is a **collection** of samples and associated metadata that shows
where applications consume resources during execution. A sample records values
encountered in some program context (typically a stack trace), optionally
augmented with auxiliary information like the trace ID corresponding to a
higher-level request.

The moment of capturing a sample is known as a **sample event** and consists not
only of the observation data point, but also the time at which it was captured.

For example, an On-CPU profile contains samples (aggregated stack traces) for
code that was running on the CPU when samples were captured, together with the
timestamps and number of times each stack trace was observed.

## Profiles overview

Profiles are emerging as the fourth essential signal of observability, alongside
logs, metrics, and traces. They offer unparalleled insights into system and
application behavior, often uncovering performance bottlenecks overlooked by
other signals.

Profiles provide granular, time-based views of resource consumption and code
execution, encompassing:

- **Application-level profiling**: Reveals how software functions consume CPU,
  memory, and other resources, highlighting slow or inefficient code.

- **System-level profiling**: Offers a holistic view of the infrastructure,
  pinpointing issues in operating system calls, kernel operations, and I/O.

This performance picture can lead to:

- **Faster Root Cause Analysis**: Quickly identifies the exact cause of
  performance degradation.
- **Proactive Optimization**: Identifies potential issues before user impact.
- **Improved Resource Utilization**: Optimizes infrastructure for cost savings
  and efficiency.
- **Enhanced Developer Productivity**: Helps developers validate code
  performance and prevent regressions.

## How profiles complement other signals

Each OpenTelemetry signal answers a different question:

| Signal       | Question                                                       |
| ------------ | -------------------------------------------------------------- |
| **Logs**     | What discrete events occurred? (insights into system behavior) |
| **Metrics**  | What is happening at the system level? (e.g. CPU usage is 90%) |
| **Traces**   | How does a request travel through a distributed system?        |
| **Profiles** | Which code is responsible for consuming resources?             |

OpenTelemetry profiles support bi-directional links with other signals. These
correlations work across two dimensions:

- **Request context correlation**: Linking profiling data to a specific trace or
  span so you can see what code was running during a particular request.

- **Resource context correlation**: Linking profiling data to the same
  [resource](/docs/concepts/resources/) that emitted the associated metrics,
  logs or traces (e.g. the same service instance).

Profiles become especially powerful when correlated with other signals:

- **Logs to profiles**: From an out of memory log entry find the code paths
  responsible for the memory pressure.
- **Metrics to profiles**: From a spike in CPU or memory usage jump directly to
  the functions consuming those resources.
- **Traces to profiles**: From a slow span in a trace see the corresponding
  profile to identify the code responsible for the latency.

## Profile types

Profiling can capture many different kinds of resource usage. Some common
profile types include:

- **On-CPU**: Which functions are consuming processor time?
- **Off-CPU**: Where are threads blocked or waiting (e.g. locks, I/O) instead of
  running?
- **Heap (memory)**: Which functions have allocated memory that is still in use?
- **Allocations (memory)**: Which code paths are responsible for the most memory
  allocations (regardless of whether that memory has been freed)?

The OpenTelemetry profiles signal is flexible enough to accommodate all of
these. However, the specific profile types available depend on the language
runtime and profiler being used.

## How profiling works

There are multiple approaches to collecting profiles and we designed
OpenTelemetry profiles to support all of them:

- **Sampling-based profiling**: A profiler periodically interrupts the program
  for example using timer-based interrupts, and records the current stack trace. This
  is the most common approach for CPU profiling. On Linux, profilers can use
  eBPF to capture stack traces from the kernel without modifying userspace
  applications at all. This approach enables zero-instrumentation, whole-system
  profiling (including code produced by compiled languages without runtime
  support) and is designed for continuous, low-overhead production use.
- **Instrumentation-based profiling**: Runtime hooks or bytecode instrumentation
  report events like memory allocations, lock acquisitions or garbage
  collections along with their associated stack traces.

Regardless of the collection method, the resulting data is serialized into
OpenTelemetry's common profile data model and exported via OTLP.

## Collecting profiles

OpenTelemetry provides an
[eBPF-based profiling agent](https://github.com/open-telemetry/opentelemetry-ebpf-profiler)
for Linux, capable of profiling most languages with zero code changes.

Additional language-specific profiling integrations that tap into built-in
runtime profiling frameworks, such as JFR for Java or pprof for Go, will also become
available as the signal matures.

Profiles can be exported via OTLP to the OpenTelemetry Collector or directly to
any compatible backend.

## Specification

To learn more about profiles in OpenTelemetry, see the
[profiles specification](/docs/specs/otel/profiles/).
