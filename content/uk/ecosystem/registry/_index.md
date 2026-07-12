---
title: Реєстр
description: >-
  Знайдіть бібліотеки, втулки, інтеграції та інші корисні інструменти для використання та розширення OpenTelemetry.
type: default
layout: registry
body_class: registry td-content
weight: 20
outputs: [HTML, markdown, JSON]
default_lang_commit: b7589cf40b05480bc7a2022cf2dd36cc299904fa
---

{{% blocks/lead color="dark" %}}

<!-- markdownlint-disable single-h1 -->

<h1>{{% param title %}}</h1>

{{% param description %}}

{{% /blocks/lead %}}

{{% blocks/section color="white pb-0" type="container-lg" %}}

> [!NOTE]
>
> Реєстр OpenTelemetry дозволяє шукати бібліотеки інструментів, компоненти колектора, утиліти та інші корисні проєкти в екосистемі OpenTelemetry. Якщо ви є підтримувачем проєкту, ви можете [додати свій проєкт до Реєстру OpenTelemetry](adding/).

{{% /blocks/lead %}}

{{< blocks/section color="white pt-0" type="container-lg" >}}

{{< ecosystem/registry/search-form >}}

{{< /blocks/section >}}
