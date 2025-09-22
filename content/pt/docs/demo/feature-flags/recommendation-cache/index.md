---
title: Usando Métricas e Rastros para diagnosticar um vazamento de memória
linkTitle: Diagnosticando vazamentos de memória
aliases:
  - ../scenarios/recommendation-cache/
  - ../scenarios/recommendation_cache
---

A telemetria de aplicações, como a fornecida pelo OpenTelemetry, é muito útil
para diagnosticar problemas em um sistema distribuído. Neste cenário, vamos
percorrer um fluxo que demonstra como sair de métricas e rastros de alto nível
para determinar a causa de um vazamento de memória.

## Preparação

Para executar este cenário, você precisará implantar a aplicação demo e habilitar
a feature flag `recommendationServiceCacheFailure`. Deixe a aplicação rodar por
cerca de 10 minutos após habilitar a flag para permitir a coleta de dados.

## Diagnóstico

O primeiro passo no diagnóstico é determinar que um problema existe. Muitas
vezes, o primeiro ponto de parada será um dashboard de métricas, como o
fornecido pelo Grafana.

Uma [pasta de dashboards do demo](http://localhost:8080/grafana/dashboards)
deve existir após iniciar o demo com dois dashboards; um para monitorar o seu
OpenTelemetry Collector e outro com várias consultas e gráficos para analisar
latência e taxa de requisições de cada serviço.

![Grafana dashboard](grafana-dashboard.png)

Esse dashboard contém diversos gráficos, mas alguns devem chamar a atenção:

- Recommendation Service (CPU% e Memória)
- Latência do Serviço (a partir de SpanMetrics)
- Taxa de Erros

Os gráficos do Recommendation Service são gerados a partir de Métricas do
OpenTelemetry exportadas para o Prometheus, enquanto a Latência do Serviço e a
Taxa de Erros são geradas pelo processador Span Metrics do OpenTelemetry Collector.

Pelo dashboard, vemos comportamento anômalo no serviço de recomendações — picos
de utilização de CPU, além de cauda longa de latência em p95, 99 e 99.9. Também
vemos picos intermitentes de uso de memória nesse serviço.

Sabemos que também emitimos dados de rastros da nossa aplicação, então vamos
pensar em outra forma de determinar que um problema existe.

![Jaeger](jaeger.png)

O Jaeger permite buscar rastros e exibir a latência ponta a ponta de uma
requisição, com visibilidade para cada parte individual da requisição.
Suponha que notamos aumento na cauda de latência das requisições do frontend.
O Jaeger permite então filtrar para incluir apenas rastros que contemplem
requisições ao serviço de recomendações.

Ordenando por latência, encontramos rapidamente rastros que demoraram mais.
Ao clicar em um rastro no painel direito, vemos a visualização em cascata.

![Jaeger waterfall](jaeger-waterfall.png)

Percebemos que o serviço de recomendações está levando muito tempo para concluir
o trabalho, e ao ver os detalhes obtivemos melhor ideia do que está ocorrendo.

## Confirmando o diagnóstico

Na visualização em cascata, vemos que o atributo `app.cache_hit` está como
falso e que `app.products.count` está extremamente alto.

Voltando à busca, selecione `recommendation` no dropdown Service e pesquise por
`app.cache_hit=true` em Tags. Note que requisições tendem a ser mais rápidas
quando ocorre cache hit. Agora pesquise por `app.cache_hit=false` e compare a
latência. Você deve notar mudanças na visualização no topo da lista de rastros.

Como este é um cenário preparado, sabemos onde encontrar o bug subjacente no
código. Em um caso real, seria necessário buscar mais a fundo no código ou nas
interações entre serviços para descobrir a causa.
