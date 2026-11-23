---
title: Specifications
linkTitle: Specs
aliases: [reference, specification]
weight: 960
# Temporary redirect rules until they are added to the spec pages
redirects:
  # OTel spec
  - from: otel/logs/semantic_conventions/events
    to: semconv/core/general/events/
  - from: otel/trace/semantic_conventions/http
    to: semconv/core/http/http-spans/
  # Temporarily implement a catch-all for the rest. Later we'll add specific redirects like the one above.
  - from: otel/logs/semantic_conventions/*
    to: semconv/core/general/logs/
  - from: otel/metrics/semantic_conventions/*
    to: semconv/core/general/metrics/
  - from: otel/resource/semantic_conventions/*
    to: semconv/core/resource/
  - from: otel/trace/semantic_conventions/*
    to: semconv/core/general/trace/
# Temporary until we move in into spec pages
cascade:
  - sidebar_root_for: self
    target:
      path: /docs/specs/{otel,semconv}
---
