---
title: Logs
description: >-
  A log is a timestamped text record, either structured (recommended) or
  unstructured, with metadata.
weight: 3
---

A **log** is a timestamped text record, either structured (recommended) or
unstructured, with metadata. While logs are an independent data source, they may
also be attached to spans. In OpenTelemetry, any data that is not part of a
distributed trace or a metric is a log. For example, _events_ are a specific
type of log. Logs are often used to determine the root cause of an issue and
typically contain information about who changed what as well as the result of
the change.

> For more information, see the [logs specification][].

[logs specification]: /docs/reference/specification/overview/#log-signal
