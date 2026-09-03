---
title: Help us stabilize environment variable context propagation
linkTitle: Review environment variable carriers
date: 2026-09-03
author: '[Robert Pająk](https://github.com/pellared) (Splunk)'
draft: true
issue: 11567
sig: CI/CD Observability
---

A trace does not always cross a network boundary. A workflow runner starts a
shell, the shell launches a build tool, and the build tool starts test
processes. Batch and data-processing systems create similar chains of child
processes. Without a shared way to carry context across these boundaries, spans
from each process can end up in separate traces.

The OpenTelemetry specification now has a release candidate for using
[environment variables as context propagation carriers][env-carrier-spec]. It
standardizes how OpenTelemetry context and baggage can move between processes
when protocol headers or message metadata are not available.

Before we mark this specification Stable, we want feedback from SDK
implementers, tool authors, platform engineers, and users operating real CI/CD,
batch, and command-line workloads.

## What is an environment variable carrier?

A carrier is the medium through which a propagator reads and writes context.
HTTP headers are a familiar carrier, but a string-to-string environment can also
be one. The release candidate applies the existing `TextMapPropagator` model to
environment variables.

For example, when using the W3C Trace Context and W3C Baggage propagators, the
propagation fields are represented by environment variables such as:

```text
TRACEPARENT=00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01
TRACESTATE=vendorname=opaquevalue
BAGGAGE=build.id=42,repository.name=example
```

The environment carrier does not parse these values. It treats them as opaque
strings. The configured propagator remains responsible for selecting field
names, validating values, and applying propagation-format-specific behavior.
This keeps the carrier usable with W3C formats as well as formats such as B3.

Environment variable names have more restrictions than HTTP header names, so the
specification defines a normalization algorithm. It converts ASCII letters to
uppercase, replaces unsupported characters with underscores, and ensures that a
name does not start with a digit. For example:

```text
x-b3-traceid -> X_B3_TRACEID
```

The rules also define which names `Get`, `Set`, and `Keys` operate on, including
behavior on case-insensitive platforms such as Windows.

## How context moves between processes

The intended lifecycle follows the way process environments already work:

1. A child process receives environment variables when it starts.
2. Instrumentation extracts context from that environment during initialization.
3. The application creates spans using the extracted context.
4. Before starting another child, the application copies the environment and
   injects its current context into that copy.
5. The application starts the child with the modified environment, and the cycle
   repeats.

Applications should use a separate environment copy for each child. This is
especially important when several processes run concurrently and belong to
different spans. Treating propagation variables as startup input also avoids
relying on mutations to the parent process's global environment.

An SDK can expose this capability through an environment-specific carrier,
getter and setter, or another language-appropriate API. The specification does
not make the SDK responsible for starting processes. Application code or
instrumentation still passes the prepared environment to the relevant process
API.

## Where environment carriers help

Language SDKs can use this mechanism whenever an instrumented application starts
another process. It is also useful for tools that add telemetry without
requiring every command to implement process management itself.

For example, [otel-cli][] can run a command inside a span and propagate trace
context to that command through environment variables:

```console
otel-cli exec --service build --name compile -- make all
```

If `make` or a process that it launches uses a compatible OpenTelemetry SDK,
that process can extract the propagated context and create child spans in the
same trace.

CI/CD instrumentation can apply the same pattern. An integration for GitHub
Actions could create spans for a workflow, job, or step and inject the relevant
context into the environment of each executed command. Instrumented build and
test tools could then attach their spans to the CI/CD trace instead of starting
unrelated traces.

[Argo Workflows][] is another useful example. Argo models workflow steps as
containers running on Kubernetes. A workflow integration could inject the
current context into each container's environment, where an SDK or a tool such
as `otel-cli` could extract it. Because separate Kubernetes Pods do not inherit
one another's process environments, the workflow integration would need to
perform that injection explicitly. Inside a container, the same carrier can
continue the context through any child processes it starts.

The mechanism also applies to batch schedulers, ETL systems, test runners, and
other environments where work is connected through process creation rather than
a request protocol.

## Operational and security considerations

Environment variables are accessible to all code running in a process. On some
systems they may also be visible to other processes or users with sufficient
permissions. Do not use context propagation environment variables for secrets or
other sensitive information. In particular, review baggage before passing it to
an untrusted child and remove entries that should not cross that trust boundary.

The receiving process must also treat propagated context as untrusted input. The
relevant propagator validates its values; the environment carrier must not
duplicate or replace that validation.

Environment carriers are not:

- A replacement for propagation through HTTP, RPC, or messaging systems.
- The same as the `OTEL_*` environment variables used to configure an SDK.
- A mechanism that creates spans by itself.
- A requirement for an SDK to start child processes.
- Automatic propagation between containers or Kubernetes Pods.

## Why we are asking now

The document is currently marked Release Candidate. Implementations are
available in several OpenTelemetry languages, and current coverage is recorded
in the [specification compliance matrix][]. Broader implementation work is
tracked in [SDK implementation tracker issue 4771][sdk-tracker].

We now want to determine whether the requirements are sufficiently clear,
portable, secure, and implementable to mark the document Stable. In particular,
we would value feedback on these questions:

- Do the normalization rules work for your operating systems and runtimes?
- Can your SDK expose extraction and injection in a language-appropriate way?
- Is the process-startup and child-environment guidance clear enough?
- Does the model work for CI/CD systems such as GitHub Actions and Argo
  Workflows, as well as batch and command-line tooling?
- Are any concurrency, security, or trust-boundary concerns missing?
- Does any normative requirement lead different implementations to incompatible
  behavior?

## Review the specification and report issues

Please read the [environment variable carrier specification][env-carrier-spec]
and evaluate it against an implementation or a concrete use case. When you find
a problem, report it where it can be acted on:

- For unclear or incorrect requirements, portability problems, missing use
  cases, or specification-level security concerns, [open an issue in the
  OpenTelemetry Specification repository][new-spec-issue]. Link the new issue
  from [stabilization issue #5040][stabilization-issue].
- For behavior specific to one language SDK, open an issue in that SDK's
  repository and cross-reference [the implementation tracker][sdk-tracker].
- For behavior specific to a tool or workflow platform, open an issue in that
  project's repository. If it also reveals a gap in the specification, create a
  specification issue and connect the two.

A useful report includes the process or workflow being instrumented, operating
system and runtime, configured propagator, environment variable names, expected
and actual behavior, and a minimal example when possible. Please also call out
whether the problem involves concurrent children, name normalization, or a
security boundary.

If your review finds no blocker, react to the stabilization issue with a
thumbs-up. Add a comment when you can share concrete implementation or
production experience; comments containing only "+1" do not help us evaluate the
specification.

Your feedback now will help ensure that Stable means this mechanism works
consistently across SDKs, tools, and workflow platforms.

[Argo Workflows]: https://github.com/argoproj/argo-workflows
[env-carrier-spec]:
  https://github.com/open-telemetry/opentelemetry-specification/blob/eec6fadba46a5002f55ff88ce4405d58a1aa4aec/specification/context/env-carriers.md
[new-spec-issue]:
  https://github.com/open-telemetry/opentelemetry-specification/issues/new/choose
[otel-cli]: https://github.com/tobert/otel-cli
[sdk-tracker]:
  https://github.com/open-telemetry/opentelemetry-specification/issues/4771
[specification compliance matrix]:
  https://github.com/open-telemetry/opentelemetry-specification/blob/eec6fadba46a5002f55ff88ce4405d58a1aa4aec/spec-compliance-matrix.md
[stabilization-issue]:
  https://github.com/open-telemetry/opentelemetry-specification/issues/5040
