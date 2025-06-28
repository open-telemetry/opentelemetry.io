---
title: Observability by Design: Unlocking Consistency with OpenTelemetry Weaver
linkTitle: OTEL Weaver
date: 2025-06-27
author: >-
  [Laurent Quérel](https://github.com/lquerel) (F5), [Josh Suereth](https://github.com/jsuereth) (Google), [Jeremy Blythe](https://github.com/jerbly) 
sig: "Semantic Conventions: Tooling"
cSpell:ignore: Quérel
---

> Stop treating observability as an afterthought. Start building it in by design, with clear conventions, type safety, and automation.

## Have you ever experienced…?

- A deployment that breaks existing alerts or dashboards because a metric name changed?
- Writing overly complex queries because teams use different metric names for the same thing?
- Losing hours debugging production issues due to missing or unclear instrumentation?
- Teams struggling to interpret undocumented or inconsistent metrics?

If any of this sounds familiar, you're not alone. These are the symptoms of treating telemetry as an afterthought, instead of an intentional part of your software design.

## Semantic Conventions: The Foundation for Consistent Observability

**Semantic conventions** are a set of rules and standard names for telemetry data. Think of them as the "grammar" for metrics, traces, and logs, so everyone and everything (including your tools) knows what you mean by 'http.method', 'db.system', or 'http.request.duration'.

The [OpenTelemetry Semantic Convention Registry](https://opentelemetry.io/docs/specs/semconv/) is a massive, open catalog with 900+ attributes and signals in over 70 domains-maintained by nine special interest groups. This open catalog ensures:

- **Consistency**: One name, one meaning everywhere.
- **Interoperability**: Tools, teams, and vendors can understand each other.
- **Automation**: Machine-readable standards enable code and docs generation, compliance checks, and more.

But maintaining and evolving such a registry across teams and tools isn't easy. That's where [OTEL Weaver](https://github.com/open-telemetry/weaver) comes in.

## Observability by Design: A Modern Engineering Approach

Observability by Design means integrating observability into your software development life cycle (SDLC) from the start:

1. **Set Clear Goals**: Define observability objectives up front. What signals do you need?
2. **Automate**: Use tools to generate code, docs, tests, and schemas from conventions.
3. **Validate**: Catch observability issues early, in CI/CD, not in production.
4. **Iterate**: Refine your telemetry based on real-world feedback and evolving needs.

**Treat telemetry like a public API**. If you wouldn't break your app's API between releases, don't break your telemetry either.

## OTEL Weaver: Empowering Semantic Conventions and Observability by Design

**OTEL Weaver** is the open-source CLI and automation platform that helps you manage, validate, and evolve semantic conventions and observability workflows.

What can Weaver do for you?

- **Define and Version Your Registry**: Create your own semantic conventions or build on top of OTEL's. Version and share your schemas with your team or community.
- **Policy-Based Validation**: Enforce best practices-naming, stability, immutability, and more. Detect breaking changes and maintain registry quality (you can even define your own policies!).
- **Live Instrumentation Checks**: Check that your application's actual telemetry matches your defined schema. Never miss critical signals in production again.
- **Code and Docs Generation**: Automatically generate type-safe SDKs (Go, Rust, etc.), Markdown docs, and more-so everyone implements things right, every time.
- **Diff and Evolution**: Safely evolve your telemetry schema with automatic diffs and upgrade/downgrade support.

Weaver currently supports a basic form of multi-registry, allowing a custom registry to import and override another registry (for example, extending the official OTEL semantic conventions). At present, only two levels are supported: your custom registry and a single dependency. This covers many common cases, but we know there’s much more potential for flexibility and collaboration.

We are actively developing advanced multi-registry support. This will enable:

- Multiple dependencies (with conflict resolution, provenance, and composability)
- Deeper hierarchies and transitive dependencies
- More powerful mechanisms for mixing, matching, and publishing registries, so vendors, OSS authors, and enterprises can independently define and share their conventions, all interoperable and versioned within the broader OpenTelemetry ecosystem.

Stay tuned, the next generation of semantic convention management is coming, and Weaver will make it seamless for the whole community. 

## Weaver in Action: Key Commands

Getting started with Weaver is easy: it's available as a pre-built binary CLI and a Docker image, ready to drop into any CI/CD pipeline or local workflow. 

**1. Define Your Registry**

A custom registry_manifest.yaml:
```yaml
name: todo-app
description: OTEL signals for my native ToDo app
semconv_version: 0.1.0
dependencies:
  - name: otel
    registry_path: https://github.com/open-telemetry/semantic-conventions/archive/refs/tags/v1.34.0.zip[model]
```

Import and extend existing conventions:
```yaml
imports:
  metrics:
    - db.client.*    # import all db.client metrics
  entities:
    - host
    - host.cpu
  events:
    - app.*
    - exception

groups:
  - id: metric.todo.completion_time
    type: metric
    brief: Measures the time between the creation and completion of a ToDo item.
    metric_name: todo.completion_time
    instrument: histogram
    unit: s
    attributes:
      - id: todo.priority
        type: string
        brief: The priority of the ToDo item.
      - id: todo.category
        type: string
        brief: The category of the ToDo item.
      - ref: user.id
        requirement_level: required
      - ref: os.name
        requirement_level: required
      - ref: os.version
        requirement_level: required
  - id: event.todo.deleted
    type: event
    brief: Emitted whenever a ToDo item is deleted by the user.
    attributes:
      - id: delete.reason
        type: string
        brief: The reason for deletion.
      - id: todo.priority
        type: string
        brief: The priority of the deleted ToDo item.
      - ref: user.id
        requirement_level: required
      - ref: os.name
        requirement_level: required
      - ref: os.version
        requirement_level: required
```

**2. Generate Docs and SDKs**

```bash
# Generate Markdown documentation
weaver registry generate -r <registry> -t <tmpl-dir> markdown

# Generate type-safe Go client
weaver registry generate -r <registry> -t <tmpl-dir> go

# Generate type-safe Rust client
weaver registry generate -r <registry> -t <tmpl-dir> rust
```

**3. Validate Your Schema**

```bash
# Check for errors, missing attributes, or violations
weaver registry check -r <registry-dir-or-url>

# Run live checks against app telemetry
weaver registry live-check --registry <path-to-your-registry>
```

**4. Track Changes Safely**

```bash
# Diff registries to ensure safe upgrades/downgrades
weaver registry diff -r <registry> --baseline-registry <registry> --diff-format markdown
```

## What's Next for Weaver?

We're working hard to make Weaver easier to use andeven more powerful and flexible:

- Multi-Registry Support: Compose, layer, and manage dependencies between multiple semantic convention registries.
- Schema v2: Aligning with new OTEL schema standards for greater flexibility and ecosystem support.
- Type-Safe SDK Generation: Auto-generate strongly typed client libraries, reducing errors and speeding up development.
- Better Docs, Easier Onboarding: Improved templates, guides, and user experience for teams big and small.

## Get Involved!

- **Try Weaver**: [OpenTelemetry Weaver GitHub](https://github.com/open-telemetry/weaver)
- **Learn More**: [OTEL Semantic Conventions](https://opentelemetry.io/docs/specs/semconv/)
- **Join the Conversation**: CNCF Slack:
  - [#otel-semantic-conventions](https://cloud-native.slack.com/archives/C041APFBYQP)
  - [#otel-weaver](https://cloud-native.slack.com/archives/C0697EXNTL3)
- **Contribute**: Your feedback and contributions help shape the future of observability!

Weaver is built to be highly extensible and configurable. You can create custom registries, write policies with Rego, and design templates with Jinja2, all using Weaver's built-in engines.
If you want to get started or have questions, join us in #otel-weaver on Slack. We're happy to help and always interested in your ideas!


> Observability is not just a tool, it's a practice. Build it by design, with clear, consistent, and automated workflows powered by OpenTelemetry Weaver.
