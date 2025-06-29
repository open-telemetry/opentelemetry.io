---
title: Observability by Design: Unlocking Consistency with OpenTelemetry Weaver
linkTitle: OTEL Weaver
date: 2025-06-27
author: [OTEL Weaver Maintainers](https://github.com/orgs/open-telemetry/teams/weaver-maintainers) 
sig: "Semantic Conventions: Tooling"
---

{{% alert title="TL;DR" %}}
Stop treating observability as an afterthought. Start building it in by design, with clear conventions, type safety, and automation.
{{% /alert %}}

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
- **Automation**: Machine-readable standards enable code and docs generation, static and live compliance checks, and more.

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
- **Policy-Based Validation**: Enforce best practices-naming, stability, immutability, and more. Detect breaking changes and maintain registry quality. You can even define your own policies!.
- **Live Instrumentation Checks**: Check that your application's telemetry matches your defined schema and measure instrumentation coverage, similar to code coverage, to ensure your unit and integration tests are actually exercising all your instrumented code. Never miss critical signals in production again.
- **Code and Docs Generation**: Generate Markdown documentation and constants in many programming languages out of the box. We're also working on more advanced solutions to automatically generate type-safe SDKs (Go, Rust, ...) for even easier and safer integration.
- **Diff and Evolution**: Safely evolve your telemetry schema with automatic diffs and upgrade/downgrade support.

Weaver currently supports a basic form of multi-registry, allowing a custom registry to import and override another registry (for example, extending the official OTEL semantic conventions). At present, only two levels are supported: your custom registry and a single dependency. This covers many common cases, but we know there's much more potential for flexibility and collaboration.

We are actively developing advanced multi-registry support. This will enable:

- Multiple dependencies (with conflict resolution, provenance, and composability)
- Deeper hierarchies and transitive dependencies
- More powerful mechanisms for mixing, matching, and publishing registries, so vendors, OSS authors, and enterprises can independently define and share their conventions, all interoperable and versioned within the broader OpenTelemetry ecosystem.

Stay tuned, the next generation of semantic convention management is coming, and Weaver will make it seamless for the whole community. 

## Weaver in Action: Key Commands

Getting started with Weaver is easy: it's available as a pre-built binary CLI and a Docker image, ready to drop into any CI/CD pipeline or local workflow. [ToDo add links]

### How the OTEL Semantic Conventions Community Uses Weaver

The OTEL semantic conventions community relies on Weaver as its primary tool for building, validating, and evolving the official registry. Some key tasks include:

**Checking the Official OTEL Registry:**<br/>
Weaver ensures every change to the registry is consistent, validated, and follows the core policies.

```bash
weaver registry check -r registry-path
```

**Generating Markdown Documentation:**<br/>
Weaver automatically produces the human-readable docs you see at opentelemetry.io.

```bash
weaver registry update-markdown -r registry-path --target=markdown
```

**Generating Constants for Client SDKs:**<br/>
Every supported OpenTelemetry SDK benefits from auto-generated constants in their native language, ensuring no typos or inconsistencies.

```bash
weaver registry generate -r registry-path -t templates-root-dir go
weaver registry generate -r registry-path -t templates-root-dir java
# ...and more
```


**Tracking Changes and Schema Evolution:**<br/>
Weaver tracks diffs between registry versions to highlight breaking changes or improvements.

```bash
weaver registry diff -r current-version-registry-path --baseline-registry previous-version-registry-path
```

**Live Instrumentation Checks and Coverage:**<br/>
Users and maintainers can leverage Weaver to live-check that their application correctly emits telemetry conforming to the official semantic conventions. 

```bash
weaver registry live-check --registry registry-path
```

### Custom Registries: Defining and Checking Your Own Telemetry Schema

While Weaver powers the core OTEL registry, you can also use it to define and manage your own application's telemetry schema. This lets you:

- Reuse and extend the official conventions, while adding custom signals, attributes, and events tailored to your domain.
- Statistically and live-check that your app's telemetry is up-to-date and complete.
- Generate docs, constants, and even type-safe client SDKs (Go, Rust, ...).

> Note:
> We are actively working on making custom registries even easier to use, with better onboarding, simpler configs, and more integrated code generation and documentation support. Some complexities remain, but the community is already using these features and contributing new ideas, so now’s a great time to try it for your app!

Here’s a quick example using a custom registry for a “ToDo” app. First, create a `registry_manifest.yaml` file to specify your registry:

```yaml
name: todo_app
description: OTEL signals for my native ToDo app
semconv_version: 0.1.0
dependencies:
  - name: otel
    registry_path: https://github.com/open-telemetry/semantic-conventions/archive/refs/tags/v1.34.0.zip[model]
```

Import and extend existing conventions, and define your own signals and attributes:

```yaml
imports:             # import signals from the dependency registry, i.e. OTEL semantic conventions
  metrics:
    - db.client.*    # import all metrics with names starting with `db.client.` 
  events:
    - app.*          
    - exception      # import the event named `exception`
  entities:
    - host
    - host.cpu

groups:
  - id: metric.todo.completion_time
    type: metric
    brief: Measures the time between the creation and completion of a ToDo item.
    metric_name: todo.completion_time
    instrument: histogram
    unit: s
    attributes:
      - id: todo.priority              # define your own attribute
        type: string
        brief: The priority of the ToDo item.
      - id: todo.category
        type: string
        brief: The category of the ToDo item.
      - ref: user.id                   # reference an existing attribute from the imported registry
        requirement_level: required    # refine the requirement level  
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

**Key commands already supported for custom registries:**

**Static Validation:**

```bash
weaver registry check -r ./todo-app-registry
```

**Live Instrumentation Checks (with coverage):**

```bash
weaver registry live-check --registry ./todo-app-registry
```

[More ...]

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
