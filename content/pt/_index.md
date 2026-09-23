---
title: OpenTelemetry
description: O padrão aberto para telemetria
developer_note:
  O shortcode blocks/cover (usado abaixo) vai servir como imagem de background
  para qualquer arquivo de imagem que contenha "background" no nome.
default_lang_commit: 3aa0f7a25cd2f7878cad1665e67937c5e9c70694
params:
  btn-lg: class="btn btn-lg btn-{1}" role="button"
  show_banner: true
---

{{% blocks/cover image_anchor="top" height="max td-below-navbar" %}}

<!-- prettier-ignore -->
![OpenTelemetry](/img/logos/opentelemetry-horizontal-color.svg)
{.otel-logo}

<!-- prettier-ignore -->
{{% param description %}}
{.display-6}

<!-- prettier-ignore -->
<div class="td-cta-buttons my-5">
  <a {{% _param btn-lg primary %}} href="docs/what-is-opentelemetry/">
    Saiba mais
  </a>
  <a {{% _param btn-lg secondary %}} href="docs/demo/">
    Experimente a demonstração
  </a>
</div>

{{% /blocks/cover %}}

{{< homepage/hero-search placeholder="Pesquisar na documentação do OpenTelemetry..." >}}

{{% homepage/intro-section image="/img/homepage/collector-pipeline.svg" imageAlt="Visão geral do OpenTelemetry" %}}

**OpenTelemetry** é um _framework_ de observabilidade de código aberto para
_software_ nativo da nuvem. Ele fornece um conjunto único de APIs, bibliotecas,
agentes e serviços de coleta para capturar rastros distribuídos e métricas da
sua aplicação.

Construído com base em anos de experiência dos projetos OpenTracing e
OpenCensus, o OpenTelemetry combina as melhores ideias e práticas da comunidade.

{{% /homepage/intro-section %}}

{{< homepage/main-features >}}

{{% homepage/main-feature
      title="Instrumentação agnóstica a fornecedor"
      image="/img/homepage/data-sources.svg"
      imagePosition="left" %}}

Instrumente seu código uma única vez utilizando as APIs e SDKs do OpenTelemetry.
Exporte dados de telemetria para qualquer _backend_ de observabilidade — Jaeger,
Prometheus, fornecedores comerciais ou sua própria solução. Troque de _backend_
sem alterar o código da sua aplicação.

{{% /homepage/main-feature %}}

{{% homepage/main-feature
      title="Sinais unificados de observabilidade"
      image="/img/homepage/unified-signals.svg"
      imagePosition="right" %}}

Correlacione rastros, métricas e logs com contexto compartilhado que flui por
todo o caminho da requisição. Obtenha uma visão completa do comportamento da sua
aplicação em todos os componentes e serviços.

{{% /homepage/main-feature %}}

{{% homepage/main-feature
      title="Execute em qualquer lugar"
      image="/img/homepage/global-deployment.svg"
      imagePosition="left" %}}

O OpenTelemetry é 100% código aberto e agnóstico a fornecedor. Implante
localmente, em ambientes híbridos ou em múltiplas nuvens com total flexibilidade
e sem dependência de fornecedor. Mova cargas de trabalho para onde fizer mais
sentido para você.

{{% /homepage/main-feature %}}

{{< /homepage/main-features >}}

{{< homepage/signals-showcase title="Sinais de Observabilidade" >}}
{{< homepage/signal name="Rastros" image="/img/homepage/signal-traces.svg" url="/docs/concepts/signals/traces/" >}}
Rastros distribuídos {{< /homepage/signal >}}
{{< homepage/signal name="Métricas" image="/img/homepage/signal-metrics.svg" url="/docs/concepts/signals/metrics/" >}}
Medições ao longo do tempo {{< /homepage/signal >}}
{{< homepage/signal name="Logs" image="/img/homepage/signal-logs.svg" url="/docs/concepts/signals/logs/" >}}
Registros com marcação temporal {{< /homepage/signal >}}
{{< homepage/signal name="Bagagem" image="/img/homepage/signal-baggage.svg" url="/docs/concepts/signals/baggage/" >}}
Metadados contextuais {{< /homepage/signal >}}
{{< /homepage/signals-showcase >}}

{{< homepage/otel-features title="Funcionalidades do OpenTelemetry" columns="2" >}}

{{< homepage/otel-feature image="/img/homepage/feature-auto-instrumentation.svg" title="Auto-instrumentação" url="/docs/concepts/instrumentation/zero-code/" >}}
Comece em minutos com a instrumentação sem código para _frameworks_ e
bibliotecas populares. Agentes de instrumentação automática capturam rastros,
métricas e logs sem modificar seu código-fonte. {{< /homepage/otel-feature >}}

{{< homepage/otel-feature image="/img/homepage/feature-pipeline.svg" title="Pipeline do Collector" url="/docs/collector/" >}}
Processe, filtre e roteie dados de telemetria com o OpenTelemetry Collector.
Implante como agente ou gateway para receber, processar e exportar telemetria em
escala com mais de 200 componentes. {{< /homepage/otel-feature >}}

{{< homepage/otel-feature image="/img/homepage/feature-observability.svg" title="Propagação de contexto" url="/docs/concepts/context-propagation/" >}}
Correlacione rastros automaticamente através dos limites dos serviços. O
contexto distribuído flui por todo o caminho da requisição, conectando logs,
métricas e rastros em uma visão unificada. {{< /homepage/otel-feature >}}

{{< homepage/otel-feature image="/img/homepage/feature-multi-language.svg" title="Suporte a múltiplas linguagens de programação" url="/docs/languages/" >}}
SDKs nativos para 12+ linguagens de programação, incluindo Java, Kotlin, Python,
Go, JavaScript, .NET, Ruby, PHP, Rust, C++, Swift, e Erlang. Use sua linguagem
de programação preferida com suporte de primeira classe do OpenTelemetry.
{{< /homepage/otel-feature >}}

{{< homepage/otel-feature image="/img/homepage/feature-production-ready.svg" title="Estável e pronto para produção" url="/status/" >}}
As APIs de rastros e métricas são estáveis nas principais linguagens de
programação. Milhares de organizações executam o OpenTelemetry em produção.
Apoiado pela CNCF e pelos principais provedores de computação em nuvem.
{{< /homepage/otel-feature >}}

{{< homepage/otel-feature image="/img/homepage/feature-openness.svg" title="Especificações abertas" url="/docs/specs/status/" >}}
Construído sobre especificações abertas e agnósticas a fornecedor para APIs,
SDKs e o protocolo de comunicação (OTLP). A governança transparente sob a CNCF
garante estabilidade a longo prazo e evolução orientada pela comunidade.
{{< /homepage/otel-feature >}}

{{< /homepage/otel-features >}}

{{< homepage/ecosystem-stats title="O Ecossistema OpenTelemetry" >}}
{{< homepage/stat type="languages" label="Linguagens de programação" url="/docs/languages/" >}}
{{< homepage/stat type="collector" label="Componentes do Collector" url="/docs/collector/" >}}
{{< homepage/stat type="registry" label="Integrações" url="/ecosystem/registry/" >}}
{{< homepage/stat type="vendors" label="Fornecedores" url="/ecosystem/vendors/" >}}
{{< /homepage/ecosystem-stats >}}

{{< homepage/adopters-showcase
    title="Utilizado por líderes da indústria"
    limit="10"
    ctaText="Visualizar todos"
    ctaUrl="/ecosystem/adopters/" >}}

{{% blocks/section color="secondary" type="cncf" %}}

**OpenTelemetry é um projeto [graduado][graduated] da [CNCF][]**.<br> Formado
por meio de uma junção dos projetos OpenTracing e OpenCensus.

[![CNCF logo][]][cncf]

[cncf]: https://cncf.io
[cncf logo]: /img/logos/cncf-white.svg
[graduated]: https://www.cncf.io/projects/

{{% /blocks/section %}}
