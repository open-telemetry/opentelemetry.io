---
title: Filter metrics and traces by attribute values
linkTitle: Filter data
description: Configure OBI to filter metrics and traces by attribute values.
weight: 40
---

You might want to restrict the reported metrics and traces to very concrete
event types based on the values of the attributes (for example, filter network
metrics to report only TCP traffic).

The `filter` YAML section allows filtering both application and network metrics
by attribute values. It has the following structure:

```yaml
filter:
  application:
    # map of attribute matches to restrict application metrics
  network:
    # map of attribute matches to restrict network metrics
```

For a list of metrics under the application and network family, as well as their
attributes, check the [OBI exported metrics](../../metrics/) document.

Each `application` and `network` filter section is a map where each key is an
attribute name (either in Prometheus or OpenTelemetry format), with either a
string or numeric matcher (see below). For string matching you can use the
`match` or the `not_match` property. Both properties accept a
[glob-like](https://github.com/gobwas/glob) string (it can be a full value or
include wildcards). If you set the `match` property, OBI only reports the
metrics and traces matching the provided value for that given attribute. The
`not_match` property is the negation of `match`.

The following example reports network metrics for connections targeting the
destination port 53, excluding the UDP protocol:

```yaml
filter:
  network:
    transport:
      not_match: UDP
    dst_port:
      match: '53'
```

## Numeric filters

OBI also allows since version 0.6 to use numeric filters e.g. the following to
include all spans with a server port >= 8000:

```yaml
filter:
  application:
    server.port:
      greater_equals: 8000
```

The following matchers are available:

- greater_than
- greater_equals
- equals
- not_equals
- less_equals
- less_than

Numeric filters and string matchers can be combined:

```yaml
filter:
  network:
    transport:
      not_match: UDP
    dst_port:
      less_than: 1024
```
