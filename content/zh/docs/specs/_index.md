---
title: 规范
linkTitle: 规范
aliases: [参考, 规范]
weight: 960
# 在添加到本规范页面之前沿用临时重定向规则
redirects:
  # OTel 规范
  - from: otel/logs/semantic_conventions/events
    to: semconv/general/events/
  - from: otel/trace/semantic_conventions/http
    to: semconv/http/http-spans/
  # 暂时实现对其余路径的兜底重定向，后续我们将添加像上面那样的具体重定向规则
  - from: otel/logs/semantic_conventions/*
    to: semconv/general/logs/
  - from: otel/metrics/semantic_conventions/*
    to: semconv/general/metrics/
  - from: otel/resource/semantic_conventions/*
    to: semconv/resource/
  - from: otel/trace/semantic_conventions/*
    to: semconv/general/trace/
  # 语义约定
  - from: semconv/resource/deployment_environment
    to: semconv/resource/deployment-environment
default_lang_commit: 880560388fab20d661f7c093df08ae36ea453203
drifted_from_default: true
---
