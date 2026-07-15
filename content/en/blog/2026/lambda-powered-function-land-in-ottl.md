---
title: Lambda-powered functions land in OTTL
linkTitle: Lambda-powered functions land in OTTL
date: 2026-07-12
author: '[Edmo Vamerlatti Costa](https://github.com/edmocosta) (Elastic)'
issue: 10848
sig: Collector SIG
cSpell:ignore: OTTL Vamerlatti
---

As telemetry pipelines become more sophisticated, so do the transformations they
need to perform: sanitizing sensitive data, normalizing inconsistent schemas,
and enforcing attribute contracts. While OTTL provides a rich set of
transformation functions, expressing collection operations has required
dedicated functions with hardcoded behavior for each new use case.

OpenTelemetry Collector Contrib `v0.157.0` changes that by introducing lambda
expressions to OTTL. Lambdas let users pass inline logic directly to generic
higher-order functions, making complex collection transformations both reusable
and concise. The release includes eight new functions that leverage this
capability: `Filter`, `MapEach`, `MapKeys`, `Any`, `All`, `Find`, `Reduce`, and
`When`.

A lambda expression is a small anonymous function defined inline, directly where
it is used. It takes a list of parameters and a body, which can be any valid
OTTL expression:

<!-- prettier-ignore-start -->
```yaml
(key, value) => HasPrefix(key, "http.")
(key, value) => value * 2
```
<!-- prettier-ignore-end -->

The following examples show what these functions make possible.

## Filtering and transforming collections

Before these functions, operating on every element in a slice or map meant
relying on dedicated functions with hardcoded behavior. Now:

<!-- prettier-ignore-start -->
```yaml
# Keep only attributes whose key starts with "http."
set(span.attributes, Filter(span.attributes, (k, _) => HasPrefix(k, "http.")))

# Stringify all attribute values
set(span.attributes, MapEach(span.attributes, (_, v) => String(v)))

# Normalize all attribute key names to snake_case
set(span.attributes, MapKeys(span.attributes, (k, _) => ToSnakeCase(k)))

# Add a prefix to all resource attribute keys
set(resource.attributes, MapKeys(resource.attributes, (k, _) => Format("app.%s", [k])))
```
<!-- prettier-ignore-end -->

## Asking questions about a collection

`Any` and `All` let you use the contents of a slice or map as a condition, which
opens up filter rules and `where` clauses that were not possible before:

<!-- prettier-ignore-start -->
```yaml
# Drop spans originating from internal networks
filter:
  trace_conditions:
    - Any(span.attributes["http.request.header.x-forwarded-for"],
      (_, v) => IsInCIDR(v, ["10.0.0.0/8", "172.16.0.0/12", "192.168.0.0/16"]))

# Only process spans where all db.* values are non-empty
transform:
  trace_statements:
    - set(span.attributes["db.complete"], true)
      where All(span.attributes, (k, v) => not HasPrefix(k, "db.") or not IsEmpty(v))
```
<!-- prettier-ignore-end -->

## Extracting a single value

`Find` returns the first element that matches a predicate. An optional second
lambda transforms the result before it is returned:

<!-- prettier-ignore-start -->
```yaml
# Find the value of the first x- header
set(span.attributes["custom_header"], Find(span.attributes, (k, _) => HasPrefix(k, "x-")))

# Find the key of the first attribute whose value is "error", ignoring the value
set(log.attributes["error_key"], Find(log.attributes, (_, v) => v == "error", (k, _) => k))
```
<!-- prettier-ignore-end -->

## Aggregating a collection

`Reduce` folds a slice or map into a single value:

<!-- prettier-ignore-start -->
```yaml
# Total bytes across a list of response sizes
- set(span.attributes["total_bytes"],
  Reduce(span.attributes["response.sizes"], 0, (acc, _,  v) => acc + v))

# Concatenate all error messages into one string
- set(log.attributes["errors"],
  Reduce(log.attributes["error.messages"], "", (acc, _, v) => Format("%s; %s", acc, v)))
```
<!-- prettier-ignore-end -->

## Inline conditionals

`When` is not collection-based, but follows the same spirit.

```yaml
# Replace two `set` statements with one
- set(span.attributes["speed_class"], When(() => (span.end_time_unix_nano -
  span.start_time_unix_nano) > 1000000000, "slow", "fast"))
```

## Combining functions

Because these functions are composable, you can pass the output of one directly
as the input of another. Here, `Filter` narrows a map down to attributes that
look like PII, and `MapEach` hashes their values before merging them back:

<!-- prettier-ignore-start -->
```yaml
transform:
  trace_statements:
    - merge_maps(span.attributes,
      MapEach(
       Filter(span.attributes, (k, v) => IsMatch(k, "(?i)(email|phone|ssn|credit_card)")),
       (_, v) => Format("%s (redacted)", [SHA1(String(v))])
      ), "upsert")
```
<!-- prettier-ignore-end -->

Combined, these functions cover a wide range of transformations.

## Trying it out

All eight functions are **experimental** and available in OpenTelemetry Collector
Contrib `v0.157.0` behind a feature gate:

```yaml
--feature-gates=ottlfuncs.enableLambdaFunctions
```

As we wrap up, we encourage users to explore this new functionality and take
advantage of its benefits in their telemetry pipelines!

If you have any questions or suggestions, we’d love to hear from you! Join the
conversation in the `#otel-collector` channel on the
[CNCF Slack workspace](https://slack.cncf.io/).
