---
title: How to Name Your Span Attributes
linkTitle: How to Name Your Span Attributes
date: 2025-08-27
author: >-
  [Juraci Paixão Kröhling](https://github.com/jpkrohling) (OllyGarden)
canonical_url: https://blog.olly.garden/how-to-name-your-span-attributes
cSpell:ignore: interoperability jpkrohling OllyGarden shopify
---

Welcome to the second installment in our series on OpenTelemetry naming best
practices. In our [previous post](/blog/2025/how-to-name-your-spans/), we
explored how to name spans using the `{verb} {object}` pattern. Today, we're
diving into span attributes—the rich contextual data that transforms your traces
from simple operation logs into powerful debugging and analysis tools.

This guide targets developers who are:

- **Instrumenting their own applications** with custom spans and attributes
- **Enriching telemetry** beyond what auto-instrumentation provides
- **Creating libraries** that others will instrument

The attribute naming decisions you make directly impact the usability and
maintainability of your observability data. Let's get them right.

## Start with semantic conventions

Here's the most important rule that will save you time and improve
interoperability: **if an OpenTelemetry
[semantic convention exists](/docs/specs/semconv/registry/attributes/) and the
semantics match your use case, use it**.

This isn't just about convenience—it's about building telemetry that integrates
seamlessly with the broader OpenTelemetry ecosystem. When you use standardized
attribute names, your data automatically works with existing dashboards,
alerting rules, and analysis tools.

### When semantics match, use the convention

| Your need                | Use this semantic convention | Why                                             |
| :----------------------- | :--------------------------- | :---------------------------------------------- |
| HTTP request method      | `http.request.method`        | Standardized across all HTTP instrumentation    |
| Database collection name | `db.collection.name`         | Works with database monitoring tools            |
| Service identification   | `service.name`               | Core resource attribute for service correlation |
| Network peer address     | `network.peer.address`       | Standard for network-level debugging            |
| Error classification     | `error.type`                 | Enables consistent error analysis               |

The key principle is **semantic match over naming preference**. Even if you
prefer `database_table` over `db.collection.name`, use the semantic convention
when it accurately describes your data.

### When semantics don't match, don't force it

Resist the temptation to misuse semantic conventions:

| Don't do this                                    | Why it's wrong                                        |
| :----------------------------------------------- | :---------------------------------------------------- |
| Using `db.collection.name` for a file name       | Files and database collections are different concepts |
| Using `http.request.method` for business actions | "approve_payment" isn't an HTTP method                |
| Using `user.id` for a transaction ID             | Users and transactions are different entities         |

Misusing semantic conventions is worse than creating custom attributes—it
creates confusion and breaks tooling that expects the standard semantics.

## The golden rule: Domain first, never company first

When you need custom attributes beyond the semantic conventions, the most
critical principle is: **start with the domain or technology, never your company
or application name**.

This principle seems obvious but is consistently violated across the industry.
Here's why it matters and how to get it right.

### Why company-first naming fails

| Bad attribute name          | Problems                                             |
| :-------------------------- | :--------------------------------------------------- |
| `og.user.id`                | Company prefix pollutes global namespace             |
| `myapp.request.size`        | Application-specific, not reusable                   |
| `acme.inventory.count`      | Makes correlation with standard attributes difficult |
| `shopify_store.product.sku` | Unnecessarily ties concept to one vendor             |

These approaches create attributes that are:

- Difficult to correlate across teams and organizations
- Impossible to reuse in different contexts
- Vendor-locked and inflexible
- Inconsistent with OpenTelemetry's interoperability goals

### Domain-first success stories

| Good attribute name  | Why it works                       |
| :------------------- | :--------------------------------- |
| `user.id`            | Universal concept, vendor-neutral  |
| `request.size`       | Reusable across applications       |
| `inventory.count`    | Clear, domain-specific concept     |
| `product.sku`        | Standard e-commerce terminology    |
| `workflow.step.name` | Generic process management concept |

This approach creates attributes that are universally understandable, reusable
by others facing similar problems, and future-proof.

## Understanding the structure: Dots and underscores

OpenTelemetry attribute names follow a specific structural pattern that balances
readability with consistency. Understanding this pattern helps you create
attributes that feel natural alongside standard semantic conventions.

### Use dots for hierarchical separation

Dots (`.`) separate hierarchical components, following the pattern:
`{domain}.{component}.{property}`

Examples from semantic conventions:

- `http.request.method` - HTTP domain, request component, method property
- `db.collection.name` - Database domain, collection component, name property
- `service.instance.id` - Service domain, instance component, ID property

### Use underscores for multi-word components

When a single component contains multiple words, use underscores (`_`):

- `http.response.status_code` - "status_code" is one logical component
- `system.memory.usage_percent` - "usage_percent" is one measurement concept

### Create deeper hierarchies when needed

You can nest further when it adds clarity:

- `http.request.body.size`
- `k8s.pod.label.{key}`
- `messaging.kafka.message.key`

Each level should represent a meaningful conceptual boundary.

## Reserved namespaces: What you must never use

Certain namespaces are strictly reserved, and violating these rules can break
your telemetry data.

### The `otel.*` namespace is off-limits

The `otel.*` prefix is exclusively reserved for the OpenTelemetry specification
itself. It's used to express OpenTelemetry concepts in telemetry formats that
don't natively support them.

Reserved `otel.*` attributes include:

- `otel.scope.name` - Instrumentation scope name
- `otel.status_code` - Span status code
- `otel.span.sampling_result` - Sampling decision

**Never create attributes starting with `otel.`** Any additions to this
namespace must be approved as part of the OpenTelemetry specification.

### Other reserved attributes

The specification also reserves these specific attribute names:

- `error.type`
- `exception.message`, `exception.stacktrace`, `exception.type`
- `server.address`, `server.port`
- `service.name`
- `telemetry.sdk.language`, `telemetry.sdk.name`, `telemetry.sdk.version`
- `url.scheme`

## Semantic convention patterns

The best way to develop good attribute naming intuition is studying
OpenTelemetry's semantic conventions. These represent thousands of hours of
design work by observability experts.

### Domain organization patterns

Notice how semantic conventions organize around clear domains:

#### Infrastructure domains

- `service.*` - Service identity and metadata
- `host.*` - Host/machine information
- `container.*` - Container runtime information
- `process.*` - Operating system processes

#### Communication domains

- `http.*` - HTTP protocol specifics
- `network.*` - Network layer information
- `rpc.*` - Remote procedure call attributes
- `messaging.*` - Message queue systems

#### Data domains

- `db.*` - Database operations
- `url.*` - URL components

### Universal property patterns

Across all domains, consistent patterns emerge for common properties:

#### Identity properties

- `.name` - Human-readable identifiers (`service.name`, `container.name`)
- `.id` - System identifiers (`container.id`, `process.pid`)
- `.version` - Version information (`service.version`)
- `.type` - Classification (`messaging.operation.type`, `error.type`)

#### Network properties

- `.address` - Network addresses (`server.address`, `client.address`)
- `.port` - Port numbers (`server.port`, `client.port`)

#### Measurement properties

- `.size` - Byte measurements (`http.request.body.size`)
- `.count` - Quantities (`messaging.batch.message_count`)
- `.duration` - Time measurements (`http.server.request.duration`)

When creating custom domains, follow these same patterns. For inventory
management, consider:

- `inventory.item.name`
- `inventory.item.id`
- `inventory.location.address`
- `inventory.batch.count`

## Creating custom domains safely

Sometimes your business logic requires attributes outside existing semantic
conventions. This is normal—OpenTelemetry can't cover every possible business
domain.

### Guidelines for safe custom domains

1. **Choose descriptive, generic names** that others could reuse.
2. **Avoid company-specific terminology** in the domain name.
3. **Follow hierarchical patterns** established by semantic conventions.
4. **Consider if your domain could become a future semantic convention**.

### Examples of well-designed custom attributes

| Domain    | Good attributes                          | Why they work                     |
| :-------- | :--------------------------------------- | :-------------------------------- |
| Business  | `payment.method`, `order.status`         | Clear, reusable business concepts |
| Logistics | `inventory.location`, `shipment.carrier` | Domain-specific but transferable  |
| Process   | `workflow.step.name`, `approval.status`  | Generic process management        |
| Content   | `document.format`, `media.codec`         | Universal content concepts        |

## The rare exception: When prefixes make sense

In rare cases, you might need company or application prefixes. This typically
happens when your custom attribute might conflict with attributes from other
sources in a distributed system.

**Consider prefixes when:**

- Your attribute might conflict with vendor attributes in a distributed system.
- You're instrumenting proprietary technology that's truly company-specific.
- You're capturing internal implementation details that shouldn't be
  generalized.

For most business logic attributes, stick with domain-first naming.

## Your action plan

Naming span attributes well creates telemetry data that's maintainable,
interoperable, and valuable across your organization. Here's your roadmap:

1. **Always check semantic conventions first** - Use them when semantics match.
2. **Lead with domain, never company** - Create vendor-neutral attributes.
3. **Respect reserved namespaces** - Especially avoid `otel.*`.
4. **Follow hierarchical patterns** - Use dots and underscores consistently.
5. **Build for reusability** - Think beyond your current needs.

By following these principles, you're not just solving today's instrumentation
challenges—you're contributing to a more coherent, interoperable observability
ecosystem that benefits everyone.

In our next post in this series, we'll shift our focus from spans to
metrics—exploring how to name the quantitative measurements that tell us how our
systems are performing, and why the same principles of separation and
domain-first thinking apply to the numbers that matter most.
