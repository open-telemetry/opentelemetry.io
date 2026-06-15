---
title: Довідник типів конфігурацій
linkTitle: Типи конфігурацій
description: >-
  Довідник із можливістю пошуку для всіх типів, визначених у декларативній схемі конфігурації OpenTelemetry, включаючи їхні властивості та обмеження.
weight: 10
# This file lives in the opentelemetry.io repo but is mounted into the
# docs/specs/otel/ hierarchy, which cascades github_repo/github_subdir from
# the opentelemetry-specification submodule. Override those params so the
# Docsy "View page source" link points to the correct repo.
github_repo: https://github.com/open-telemetry/opentelemetry.io
github_subdir: ''
path_base_for_github_subdir: ''
default_lang_commit: 311e7819e9eacf9d8b6d250bbdee98c018ea232e
---

Схема [декларативної конфігурації](/docs/specs/otel/configuration/data-model/) OpenTelemetry визначає типи конфігурацій, які описують структуру компонентів SDK, які можна налаштовувати за допомогою конфігураційного файлу. Типи з префіксом `Experimental` можуть зазнавати змін без попередження.

Для повної моделі даних та схеми дивіться [Модель даних](/docs/specs/otel/configuration/data-model/). Для конкретного використання SDK дивіться [Конфігурація SDK](/docs/specs/otel/configuration/sdk/).

{{< config-types-accordion >}}
