---
title: Benchmarks
description: >-
  Vazão das operações de rastreamento, métricas, logs e bagagem no SDK Python
weight: 190
default_lang_commit: f4f71705128ce00c0b22af5cd40f52462d11b449
params:
  otel-benchmarks:
    data_url: https://open-telemetry.github.io/opentelemetry-python/benchmarks/data.js
---

O SDK Python do OpenTelemetry executa testes de _benchmark_ a cada _commit_ no
repositório [opentelemetry-python][]. Esses testes não substituem os testes de
desempenho _end-to-end_.

Esta página apresenta gráficos com os [dados][data] dos _benchmarks_. Para o
painel completo, consulte [Python Benchmarks][].

> [!TIP]
>
> Em um dos gráficos abaixo, passe o cursor sobre um ponto para ver o valor e o
> _commit_; clique nele para obter um link para o _commit_.

{{< benchmarks data_url="param:otel-benchmarks.data_url" >}}

<!-- prettier-ignore-start -->
[data]: <{{% _param otel-benchmarks.data_url %}}>
[opentelemetry-python]: https://github.com/open-telemetry/opentelemetry-python/
[Python Benchmarks]: https://open-telemetry.github.io/opentelemetry-python/benchmarks/
<!-- prettier-ignore-end -->
