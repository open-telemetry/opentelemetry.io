---
title: OpenTelemetry
description: >-
  Telemetria de alta qualidade, abrangente e portátil para permitir uma
  observabilidade eficaz
developer_note:
  O shortcode blocks/cover (usado abaixo) vai servir como imagem de background
  para qualquer arquivo de imagem que contenha "background" no nome.
show_banner: true
default_lang_commit: c0a5eea5d720b0e075efa87f99dcf58c89106268
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

- [Saiba mais](docs/what-is-opentelemetry/)
- [Experimente a demonstração](docs/demo/)

</div>

<div class="h3 mt-4">
<a class="text-secondary" href="/docs/getting-started/">Comece</a> baseado na sua área
</div>
<div class="l-get-started-buttons">

- [Dev](docs/getting-started/dev/)
- [Ops](docs/getting-started/ops/)

</div>
{{< /blocks/cover >}}

{{% blocks/lead color="white" %}}

O OpenTelemetry é uma coleção de APIs, SDKs e ferramentas. Use-o para
instrumentar, gerar, coletar e exportar dados de telemetria (métricas, logs e
rastros) para ajudar você a analisar o desempenho e o comportamento do seu
software.

> O OpenTelemetry está [disponível](/status/) em
> [diversas linguagens](docs/languages/) e está pronto para uso em produção.

{{% /blocks/lead %}}

{{% blocks/section color="dark" type="row" %}}

{{% blocks/feature icon="fas fa-chart-line" title="Rastros, Métricas, Logs" url="docs/concepts/observability-primer/" %}}

Crie e colete dados de telemetria a partir de seus serviços e softwares, e
depois encaminhe-os para uma variedade de ferramentas de análise.

{{% /blocks/feature %}}

{{% blocks/feature icon="fas fa-magic" title="Instrumentação de Fácil Integração"%}}

O OpenTelemetry é [integrável] com diversos frameworks e bibliotecas populares,
e suporta [instrumentação] _manual e sem código_.

[instrumentação]: /docs/concepts/instrumentation/
[integrável]: /ecosystem/integrations/

{{% /blocks/feature %}}

{{% blocks/feature icon="fab fa-github" title="Open Source, Agnóstico a Fornecedor" %}}

100% Gratuito e Open Source, o OpenTelemetry é [adotado] e apoiado por [líderes
da indústria] no ecossistema da observabilidade.

[adotado]: /ecosystem/adopters/
[líderes da indústria]: /ecosystem/vendors/

{{% /blocks/feature %}}

{{% /blocks/section %}}

{{% blocks/section color="secondary" type="cncf" %}}

**O OpenTelemetry é um projeto em [incubação][] da [CNCF][]**.<br> Formado por
meio de uma junção dos projetos OpenTracing e OpenCensus.

[![CNCF logo][]][cncf]

[cncf]: https://cncf.io
[cncf logo]: /img/logos/cncf-white.svg
[incubação]: https://www.cncf.io/projects/

{{% /blocks/section %}}
