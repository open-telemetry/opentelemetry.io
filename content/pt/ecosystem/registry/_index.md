---
title: Registro
description: >-
  Encontre bibliotecas, plugins, integrações e outras ferramentas úteis para
  usar e expandir o OpenTelemetry.
type: default
layout: registry
body_class: registry td-content
weight: 20
default_lang_commit: c392c714849921cd56aca8ca99ab11e0e4cb16f4
---

{{% blocks/lead color="dark" %}}

<!-- markdownlint-disable single-h1 -->

<h1>{{% param title %}}</h1>

{{% param description %}}

{{% /blocks/lead %}}

{{< blocks/section color="white" type="container-lg" >}}

{{% alert %}}

O Registro do OpenTelemetry permite a busca por bibliotecas de instrumentação,
componentes do Collector, utilitários e outros projetos úteis dentro do
ecossistema. Caso você seja mantenedor de um projeto, é possível
[adicionar seu projeto ao Registro do OpenTelemetry](adding/).

{{% /alert %}}

{{< ecosystem/registry/search-form >}}

{{< /blocks/section >}}
