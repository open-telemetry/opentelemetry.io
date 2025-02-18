---
title: Registry
description: >-
  Encontre bibliotecas, plugins, integrações e outras ferramentas úteis para
  usar e expandir o OpenTelemetry.
redirects: [{ from: /ecosystem/registry*, to: '/ecosystem/registry?' }]
aliases: [/registry/*]
type: default
layout: registry
outputs: [html, json]
body_class: registry td-content
weight: 20
default_lang_commit: e6aa6923419a45ee9c36208eb74da760e7e9abaa
---

{{% blocks/lead color="dark" %}}

<!-- markdownlint-disable single-h1 -->

# {{% param title %}}

{{% param description %}}

{{% /blocks/lead %}}

{{< blocks/section color="white" type="container-lg" >}}

{{< ecosystem/registry/search-form >}}

{{< /blocks/section >}}
