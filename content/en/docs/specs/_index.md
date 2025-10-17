---
title: Specifications
linkTitle: Specs
aliases: [reference, specification]
weight: 960
# Temporary redirect rules until they are added to the spec pages
redirects:
  # OTel spec
  - from: otel/logs/semantic_conventions/events
    to: semconv/general/events/
  - from: otel/trace/semantic_conventions/http
    to: semconv/http/http-spans/
  # Temporarily implement a catch-all for the rest. Later we'll add specific redirects like the one above.
  - from: otel/logs/semantic_conventions/*
    to: semconv/general/logs/
  - from: otel/metrics/semantic_conventions/*
    to: semconv/general/metrics/
  - from: otel/resource/semantic_conventions/*
    to: semconv/resource/
  - from: otel/trace/semantic_conventions/*
    to: semconv/general/trace/
  # Semconv
  - from: semconv/resource/deployment_environment
    to: semconv/resource/deployment-environment
# Temporary until we move in into spec pages
cascade:
  - sidebar_root_for: self
    target:
      path: /docs/specs/{otel,semconv}
---
