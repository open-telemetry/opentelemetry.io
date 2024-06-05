---
title: Projeto OpenTelemetry
description: >-
 Telemetria de qualidade, ubíqua e portátil para permitir uma observabilidade eficaz
developer_note:
  The blocks/cover shortcode (used below) will use as a background image any
  image file containing "background" in its name.
---

<div class="d-none"><a rel="me" href="https://fosstodon.org/@opentelemetry"></a></div>

{{< blocks/cover image_anchor="top" height="max" color="primary" >}}

<!-- prettier-ignore -->
![OpenTelemetry](/img/logos/opentelemetry-horizontal-color.svg)
{.otel-logo}

<!-- prettier-ignore -->
{{% param description %}}
{.display-6}

<div class="l-primary-buttons mt-5">

- [Saiba mais sobre](/docs/what-is-opentelemetry/)
- [Experimente a demonstração](/docs/demo/)
- [Explore as integrações](/ecosystem/integrations)

</div>

<div class="h3 mt-4">
<a class="text-secondary" href="/docs/getting-started/">Comece</a> baseado na sua função
</div>
<div class="l-get-started-buttons">

- [Dev](/docs/getting-started/dev/)
- [Ops](/docs/getting-started/ops/)

</div>
{{< /blocks/cover >}}

{{% blocks/lead color="white" %}}

O OpenTelemetry é uma coleção de APIs, SDKs e ferramentas. Use-o para instrumentar,
gerar, coletar e exportar dados de telemetria (métricas, logs e rastros) para ajudar
você a analisar o desempenho e o comportamento do seu software.

> O OpenTelemetry está **disponível** em 
[diversas linguagens](/docs/languages/) e é adequado para uso. 

{{% /blocks/lead %}}

{{% blocks/section color="dark" type="row" %}}

{{% blocks/feature icon="fas fa-chart-line" title="Rastros, Métricas, Logs"%}}

Crie e colete dados de telemetria a partir de seus serviços e software e depois encaminhe
eles para uma variedade de ferramentas de análise. {{% /blocks/feature %}}

{{% blocks/feature icon="fas fa-magic" title="Drop-In Instrumentation"%}}

O OpenTelemetry é integrável com frameworks e bibliotecas populares como
[Spring](https://spring.io),
[ASP.NET Core](https://docs.microsoft.com/aspnet/core),
[Express](https://expressjs.com), [Quarkus](https://quarkus.io), e muito mais!
A instalação e integração pode ser feito com simplesmente algumas linhas de código.

{{% /blocks/feature %}}

{{% blocks/feature icon="fab fa-github" title="Open Source, Agnóstico a Fornecedor" %}}

100% Gratuito e Open Source, o OpenTelemtry é adotado e apoiado por
[líderes da indústrica](/ecosystem/vendors/) no ecossistema da observabilidade.

{{% /blocks/feature %}}

{{% /blocks/section %}}

{{% blocks/section color="secondary" type="cncf" %}}

**OpenTelemetry is a [CNCF][] [incubating][] project**.<br> Formed through a
merger of the OpenTracing and OpenCensus projects.

[![CNCF logo][]][cncf]

[cncf]: https://cncf.io
[cncf logo]: /img/logos/cncf-white.svg
[incubating]: https://www.cncf.io/projects/

{{% /blocks/section %}}
