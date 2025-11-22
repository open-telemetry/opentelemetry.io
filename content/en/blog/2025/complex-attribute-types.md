---
title: Announcing Support for Complex Attribute Types in OTel
linkTitle: Announcing Support for Complex Attribute Types in OTel
date: 2025-11-05
author: >-
  [Liudmila Molkova](https://github.com/lmolkova) (Grafana Labs), [Robert
  Pajak](https://github.com/pellared) (Splunk), [Trask
  Stalnaker](https://github.com/trask) (Microsoft), [Austin
  Parker](https://github.com/austinlparker) (honeycomb.io)
sig: Specification, Logs
issue: https://github.com/open-telemetry/opentelemetry-specification/pull/4485
cSpell:ignore: Liudmila Molkova Pajak
---

It’s common to use simple key-value properties as attributes in telemetry. Most
telemetry backends are optimized for this pattern, making it efficient to store,
index, and query data.

OpenTelemetry is designed with this in mind. Semantic conventions and
instrumentations aim to provide useful attributes that can be easily filtered
and aggregated.

But what happens when the data itself is complex? OpenTelemetry also strives to
capture observability for real-world systems, libraries, and applications whose
observable properties are sometimes complex.

Recently OpenTelemetry has announced upcoming support for capturing complex data
across all OTel signals starting with OTLP
[1.9.0](https://github.com/open-telemetry/opentelemetry-proto/releases/tag/v1.9.0),
and in future OpenTelemetry API and SDK versions across the ecosystem.

In this post, we’ll cover when and how to use complex data, when to avoid it,
and how backends can start supporting it.

## Upcoming support for complex attribute types in OpenTelemetry

OpenTelemetry APIs and SDKs are adding support for the following attribute types
on all signals:

- Maps (with string keys and values of any supported type)
- Heterogeneous arrays (containing elements of any supported type)
- Byte arrays
- Empty values

Until recently, these types were supported only on logs - attributes on other
signals were limited to primitives and arrays of primitives.

Following
[OTEP 4485: Extending attributes to support complex values](https://github.com/open-telemetry/opentelemetry-specification/blob/v1.49.0/oteps/4485-extending-attributes-to-support-complex-values.md)
and its implementation in OTLP and the specification, this support is being
extended to all OTel signals.

The new attribute types, especially maps and heterogeneous arrays, should be
used with care. Many observability backends are not optimized to query, index,
or aggregate complex attributes. Semantic conventions will assume complex
attributes are not indexed and will avoid using them on metrics or in other
scenarios where efficient querying is important.

When possible, stick to primitive values.

## Why are we doing this?

As we work on semantic conventions and instrumentations, we increasingly
encounter cases where flat attributes cannot reasonably capture the complexity
of real-world scenarios.

Examples include:

- **[LLM operations](/docs/specs/semconv/gen-ai/non-normative/examples-llm-calls)**
  — input parameters like tool definitions and input/output messages are
  inherently structured
- **GraphQL** — responses may include
  [lists of structured errors](https://graphql.org/learn/response/#errors)
- **[Database operations](/docs/specs/semconv/database/database-spans)** — batch
  operations have properties that flat attributes cannot adequately capture

Before extending support for complex attributes to all signals, we explored
several alternatives:

### Limiting support to logs (and spans)

Having different attribute collection types for different signals affects API
ergonomics, making it less convenient and efficient to work with attributes.

### Flattening

Flattening works well for maps of primitives but breaks down for arrays. For
example, structured data like:

```json
{
  "data": [
    {
      "foo": "bar",
      "baz": 42
    }
  ]
}
```

is reported as either:

```text
data.0.foo = "bar"
data.0.baz = 42
```

or:

```text
data.foo = ["bar"]
data.baz = [ 42 ]
```

Both approaches are limited and lead to a poor user experience.

### String serialization

Another option is requiring users or instrumentations to serialize complex data
into strings. While workable, this risks inconsistencies and errors. It also
limits post-processing and leads to poor truncation strategies. Ultimately, it
should be the backend’s decision whether to preserve the structure or serialize
the data. Handling serialization at the backend side provides greater
consistency and convenience for end users.

## How should backends support complex attributes?

We encourage backends to build user experiences that leverage structured
attribute values, allowing users to query data based on nested properties.

In the meantime, we recommend that backends serialize complex attributes to JSON
(or another suitable format) at ingestion time.

The OTel Specification, Semantic Conventions, and API documentation will clearly
communicate to instrumentation authors that complex attribute support may be
limited and will continue to recommend flat attributes whenever possible.

## When should you use complex attributes?

When you can reasonably express data using flat attributes, use flat attributes.

Use complex attributes only when the data is too complex to express with flat
attributes — for example, when recording lists of complex objects.

For semantic conventions and instrumentation libraries, we don't recommend
changing anything existing in response to this announcement. This should only
affect new features which require the use of complex attributes.

## Comments?

We’ve opened a
[GitHub issue to discuss this post](https://github.com/open-telemetry/community/issues/3119),
and we’d love your feedback.
