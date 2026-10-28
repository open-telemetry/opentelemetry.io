---
title: Registro
description: >-
  Encontre bibliotecas, plugins, integrações e outras ferramentas úteis para
  usar e expandir o OpenTelemetry.
type: default
layout: registry
body_class: registry td-content
weight: 20
default_lang_commit: e4a94862ebc3eb2c87fdbdd5baf72545a449db98
---

{{% blocks/lead color="dark" %}}

<!-- markdownlint-disable single-h1 -->

<h1>{{% param title %}}</h1>

{{% param description %}}

{{% /blocks/lead %}}

{{% blocks/section color="white pb-0" type="container-lg" %}}

{{% include freeze-notice.md %}}

> [!NOTE]
>
> O Registro do OpenTelemetry permite a busca por bibliotecas de instrumentação,
> componentes do Collector, utilitários e outros projetos úteis dentro do
> ecossistema OpenTelemetry. <!-- Caso você seja mantenedor de um projeto, é -->
> <!-- possível [adicionar seu projeto ao Registro do OpenTelemetry](adding/). -->

{{% /blocks/lead %}}

{{< blocks/section color="white pt-0" type="container-lg" >}}

{{< ecosystem/registry/search-form >}}

{{< /blocks/section >}}
