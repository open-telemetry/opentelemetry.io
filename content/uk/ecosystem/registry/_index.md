---
title: Реєстр
description: >-
  Знайдіть бібліотеки, втулки, інтеграції та інші корисні інструменти для використання та розширення OpenTelemetry.
type: default
layout: registry
body_class: registry td-content
weight: 20

# =============================================================================
# IMPORTANT:
# IMPORTANT: Non-English locales: DO NOT include the front matter entries below
# IMPORTANT:
# =============================================================================

aliases: [/registry/*]
outputs: [html, json]

# The redirects and aliases implement catch-all rules for old registry entries;
# we don't publish individual entry pages anymore.
#
# We can't use the catch-all `/ecosystem/registry/*`, because that creates a
# self-loop with `/ecosystem/registry/index.html`. So we use the following
# redirect rule to avoid the loop, as suggested by Netlify support
# (email support ID 159489):
redirects: [{ from: /ecosystem/registry*, to: '/ecosystem/registry?' }]
default_lang_commit: 6f3712c5cda4ea79f75fb410521880396ca30c91
---

{{% blocks/lead color="dark" %}}

<!-- markdownlint-disable single-h1 -->

<h1>{{% param title %}}</h1>

{{% param description %}}

{{% /blocks/lead %}}

{{< blocks/section color="white" type="container-lg" >}}

{{% alert %}}

Реєстр OpenTelemetry дозволяє шукати бібліотеки інструментів, компоненти колектора, утиліти та інші корисні проєкти в екосистемі OpenTelemetry. Якщо ви є підтримувачем проєкту, ви можете [додати свій проєкт до Реєстру OpenTelemetry](adding/).

{{% /alert %}}

{{< ecosystem/registry/search-form >}}

{{< /blocks/section >}}
