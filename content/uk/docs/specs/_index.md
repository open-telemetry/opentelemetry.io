---
title: Специфікації
linkTitle: Специфікації
aliases: [reference, specification]
weight: 960
# Тимчасові правила перенаправлення, поки вони не будуть додані до сторінок специфікацій
redirects:
  # OTel spec
  - from: otel/logs/semantic_conventions/events
    to: semconv/general/events/
  - from: otel/trace/semantic_conventions/http
    to: semconv/http/http-spans/
  # Тимчасово реалізуємо універсальне перенаправлення для решти. Пізніше ми додамо конкретні перенаправлення, як наведено вище.
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
default_lang_commit: edc67aafea1ead97b94ed4054d2c3248a34b0389
---
