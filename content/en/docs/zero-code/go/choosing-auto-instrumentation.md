---
title: Choosing Your Zero Code Auto Instrumentation for Go
linkTitle: Choosing Auto Instrumentation
description:
  'A guide to choosing between OpenTelemetry eBPF Instrumentation (OBI) and Go
  Compile-Time Instrumentation (otelc) for Go applications.'
weight: 15
---

For Go applications, OpenTelemetry provides two distinct "zero-code" approaches
to instrument applications without modifying source code: **runtime attachment**
and **build-time weaving**.

This guide compares
[OpenTelemetry eBPF Instrumentation (OBI)](/docs/zero-code/obi/) and
[OpenTelemetry Go Compile-Time Instrumentation](/docs/zero-code/go/compile-time/)
(`otelc`) to help you choose the right tool for your environment.

This is a decision guide, not a ranking. Both projects are official
OpenTelemetry components. In many setups, they solve different problems or even
work well together.

## The Two Mental Models

When evaluating zero-code instrumentation, it helps to understand the
fundamental architectural difference between the two approaches:

- **Attach at Runtime (eBPF):** The instrumentation runs alongside your
  application as a separate process (often on the host node). It observes the
  application from the outside—specifically at the application, kernel, and
  networking layers. While it may inject outgoing headers into the application's
  memory space for trace context propagation, it does not require changes to the
  application's build process.

- **Weave at Build Time (Compile-Time):** The instrumentation is injected into
  the application's source or Abstract Syntax Tree (AST) during the compilation
  process. The resulting binary contains the telemetry logic natively, meaning
  no external runtime agent is required.

## OBI

[OpenTelemetry eBPF Instrumentation (OBI)](/docs/zero-code/obi/) uses eBPF
(extended Berkeley Packet Filter) to automatically inspect application
executables and the OS networking layer.

- **How it hooks in:** Deploys eBPF probes in the Linux kernel and the
  application to capture trace spans and metrics as system calls and network
  packets occur.
- **Language coverage:** Broad and essentially polyglot. Supports Java, .NET,
  Go, Python, Ruby, Node.js, C, C++, and Rust, among others.
- **Operational requirements:** Requires a Linux environment (kernel 5.8+ or
  specific backports), BTF support, and elevated privileges (root or specific
  Linux capabilities).
- **Telemetry produced:** Excels at capturing traces (incoming and outgoing
  spans for HTTP/S, gRPC, database queries), RED (Rate, Errors, Duration)
  metrics, network flows, and log enrichment. It captures what enters and leaves
  the process, but does not generate internal spans specific to the
  application's frameworks or libraries.

## otelc

[OpenTelemetry Go Compile-Time Instrumentation](/docs/zero-code/go/compile-time/)
(`otelc`)

- **How it hooks in:** Uses the Go toolchain's `-toolexec` mechanism to
  intercept the compilation of packages, matches functions against
  instrumentation rules, and injects OpenTelemetry hooks directly into the
  compiled binary.
- **Language coverage:** Go only.
- **Operational requirements:** Requires access to the Go build pipeline.
  Because the instrumentation is baked into the binary, it runs anywhere the Go
  binary runs and requires no special OS privileges or kernel features at
  runtime.
- **Telemetry produced:** Provides deep in-process spans with high fidelity. It
  can trace internal function calls, capture application-specific context, and
  instrument third-party Go dependencies.

## Trade-offs

| Feature                     | OBI (eBPF)                                                                                                                      | otelc (Compile-Time)                                                                                 |
| :-------------------------- | :------------------------------------------------------------------------------------------------------------------------------ | :--------------------------------------------------------------------------------------------------- |
| **Deployment Model**        | Deployed separately (e.g., Kubernetes DaemonSet, sidecar, or host agent). Zero changes to application build pipeline.           | Baked into the application binary during `go build`. Requires wrapping your build command.           |
| **Operational Overhead**    | Requires specific Linux kernel versions, BTF, and elevated privileges (root/capabilities).                                      | No special runtime privileges, kernel features, or OS requirements needed.                           |
| **Signal Fidelity & Depth** | Excellent for network boundaries and protocol interactions. Cannot easily see internal function calls or custom business logic. | Deep in-process visibility. Can instrument internal functions, custom logic, and code paths.         |
| **Language Scope**          | Polyglot (Go, Java, .NET, Python, Rust, etc.). Ideal for mixed-language fleets.                                                 | Go only.                                                                                             |
| **Third-party Libraries**   | Sees the network calls and database queries made by dependencies.                                                               | Can instrument the internal code execution of Go module dependencies.                                |
| **Lifecycle Management**    | Can be attached, detached, upgraded, or downgraded dynamically without application restarts.                                    | Requires an application rebuild, redeploy, and restart to change versions or remove instrumentation. |

## When to use Which

### Choose OBI if:

- **You have a mixed-language fleet:** You want a single, unified
  auto-instrumentation tool that works across Go, Java, Python, .NET, and more.
- **You lack build pipeline access:** You do not own the build process, use
  pre-compiled vendor binaries, or cannot access the source code.
- **You care about boundary observability:** Your primary goal is tracking
  service-to-service communications, RED metrics, and database calls across your
  infrastructure.
- **You are running on Linux:** You operate in a Linux environment (inside or
  outside of Kubernetes) and can deploy an agent with the necessary privileges
  to observe your processes. OBI provides selectors for instrumenting by
  executable name, open port(s), and process PID, making it flexible for various
  deployment scenarios.

### Choose otelc if:

- **You own the Go build pipeline:** You have full control over how your Go
  services are compiled and deployed.
- **You need maximum span fidelity:** You require deep, in-process tracing of
  business logic and internal application states.
- **You want to trace third-party internals:** You need visibility into the
  execution of the third-party Go modules that you import but don't own.
- **Your runtime is restricted:** You operate in environments that restrict root
  privileges, eBPF capabilities, or specific kernel versions (e.g., certain
  serverless or highly locked-down container environments).

### Using Them Together

Because these tools operate at different layers of the stack, they are
complementary and can be used together in the same environment:

- Use **otelc** to generate deep, high-fidelity traces for your Go business
  logic, internal library calls, and custom spans.
- Use **OBI** to provide infrastructure-level network observability,
  kernel-level TCP metrics, and coverage for any non-Go components or sidecars
  running in your environment.

## Getting Involved

Both projects are actively developed within the OpenTelemetry Community.

- **OBI:** Follow development, report issues, or contribute to the
  [OpenTelemetry eBPF Instrumentation repository](https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation).
- **otelc:** Get involved with the
  [OpenTelemetry Go Compile-Time Instrumentation repository](https://github.com/open-telemetry/opentelemetry-go-compile-instrumentation).
