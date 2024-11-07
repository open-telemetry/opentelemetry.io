---
title: Documentação
linkTitle: Docs
menu: { main: { weight: 10 } }
htmltest:
  IgnoreDirs:
    # TODO drop next lines after https://github.com/open-telemetry/opentelemetry.io/issues/5555 is fixed for these pages:
    - ^pt/docs/concepts/components/
    - ^pt/docs/concepts/glossary/
    - ^pt/docs/concepts/signals/baggage/
    - ^pt/docs/languages/erlang/instrumentation/
    - ^pt/docs/languages/erlang/sampling/
    - ^pt/docs/languages/js/instrumentation/
    - ^pt/docs/languages/js/sampling/
    - ^pt/docs/languages/net/instrumentation/
    - ^pt/docs/languages/net/libraries/
    - ^pt/docs/languages/net/shim/
    - ^pt/docs/languages/php/instrumentation/
    - ^pt/docs/languages/python/instrumentation/
    - ^pt/docs/languages/ruby/instrumentation/
    - ^pt/docs/languages/ruby/sampling/
    - ^pt/docs/zero-code/php/
default_lang_commit: 2d88c10e1a14220a88a6e4859acb4047f49b6519
---

O OpenTelemetry, também conhecido como OTel, é uma estrutura de
[Observabilidade](concepts/observability-primer/#what-is-observability) de
código aberto, agnóstico a fornecedor, para gerar, coletar e exportar dados de
telemetria como [rastros](concepts/signals/traces/),
[métricas](concepts/signals/metrics/) e [logs](concepts/signals/logs/).

Como padrão do setor, OpenTelemetry é
[suportado por mais de 40 fornecedores de observabilidade](/ecosystem/vendors/),
integrado em diversas
[bibliotecas, serviços e aplicativos](/ecosystem/integrations/) e é utilizado
por [diversas organizações](/ecosystem/adopters/).

![Arquitetura de Referência do OpenTelemetry](/img/otel-diagram.svg)
