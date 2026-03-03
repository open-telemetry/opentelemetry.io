---
title: Registro
description: >-
  Encuentra bibliotecas, complementos, integraciones y otras herramientas útiles
  para usar y ampliar OpenTelemetry.
type: default
layout: registry
body_class: registry td-content
weight: 20
default_lang_commit: 1a6db8fe3a989fa20267368336aceb5665b4394b
---

{{% blocks/lead color="dark" %}}

<!-- markdownlint-disable single-h1 -->

<h1>{{% param title %}}</h1>

{{% param description %}}

{{% /blocks/lead %}}

{{% blocks/section color="white pb-0" type="container-lg" %}}

> [!NOTA]
>
> El Registro de OpenTelemetry te permite buscar bibliotecas de instrumentación,
> componentes de recopilación, utilidades y otros proyectos útiles en el
> ecosistema de OpenTelemetry. Si eres un mantenedor de proyectos, puedes
> [agregar tu proyecto al Registro de OpenTelemetry](adding/).

{{% /blocks/lead %}}

{{< blocks/section color="white pt-0" type="container-lg" >}}

{{< ecosystem/registry/search-form >}}

{{< /blocks/section >}}
