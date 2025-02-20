---
title: Registro
description: >-
  Encontre bibliotecas, plugins, integrações e outras ferramentas úteis para
  usar e expandir o OpenTelemetry.
type: default
layout: registry
body_class: registry td-content
weight: 20
default_lang_commit: fd873ed11bfa9920c2e8b0726784f482368e85c2
---

{{% blocks/lead color="dark" %}}

<!-- markdownlint-disable single-h1 -->

<h1>{{% param title %}}</h1>

{{% param description %}}

{{% /blocks/lead %}}

{{< blocks/section color="white" type="container-lg" >}}

{{% alert color="info" %}}

O Registro do OpenTelemetry permite a busca por bibliotecas de instrumentação,
componentes do Collector, utilitários e outros projetos úteis dentro do
ecossistema. Caso você seja mantenedor de um projeto, é possível
[adicionar seu projeto ao Registro do OpenTelemetry](adding/).

{{% /alert %}}

{{< ecosystem/registry/search-form >}}

{{< /blocks/section >}}
