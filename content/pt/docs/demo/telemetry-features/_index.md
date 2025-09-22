---
title: Recursos de Telemetria
linkTitle: Recursos de Telemetria
aliases: [demo_features, features]
---

## OpenTelemetry

- **[Rastreamentos OpenTelemetry](/docs/concepts/signals/traces/)**: todos os serviços são
  instrumentados usando bibliotecas de instrumentação disponíveis do OpenTelemetry.
- **[Métricas OpenTelemetry](/docs/concepts/signals/metrics/)**: serviços selecionados são
  instrumentados usando bibliotecas de instrumentação disponíveis do OpenTelemetry. Mais
  serão adicionados conforme os SDKs relevantes são lançados.
- **[Logs OpenTelemetry](/docs/concepts/signals/logs/)**: serviços selecionados são
  instrumentados usando bibliotecas de instrumentação disponíveis do OpenTelemetry. Mais
  serão adicionados conforme os SDKs relevantes são lançados.
- **[Coletor OpenTelemetry](/docs/collector/)**: todos os serviços são instrumentados
  e enviando os rastreamentos e métricas gerados para o Coletor OpenTelemetry
  via gRPC. Os rastreamentos recebidos são então exportados para os logs e para o Jaeger;
  métricas e exemplares recebidos são exportados para logs e Prometheus.

## Soluções de Observabilidade

- **[Grafana](https://grafana.com/)**: todos os dashboards de métricas são armazenados no
  Grafana.
- **[Jaeger](https://www.jaegertracing.io/)**: todos os rastreamentos gerados estão sendo
  enviados para o Jaeger.
- **[OpenSearch](https://opensearch.org/)**: todos os logs gerados são enviados para o Data
  Prepper. O OpenSearch será usado para centralizar dados de logging dos serviços.
- **[Prometheus](https://prometheus.io/)**: todas as métricas e exemplares gerados
  são coletados pelo Prometheus.

## Ambientes

- **[Docker](https://docs.docker.com)**: esta amostra bifurcada pode ser executada com
  Docker.
- **[Kubernetes](https://kubernetes.io/)**: o aplicativo é projetado para executar no
  Kubernetes (tanto localmente, quanto na nuvem) usando um chart Helm.

## Protocolos

- **[gRPC](https://grpc.io/)**: microsserviços usam um alto volume de chamadas gRPC para
  se comunicar entre si.
- **[HTTP](https://www.rfc-editor.org/rfc/rfc9110.html)**: microsserviços usam
  HTTP onde gRPC não está disponível ou não é bem suportado.

## Outros Componentes

- **[Envoy](https://www.envoyproxy.io/)**: Envoy é usado como um proxy reverso para
  interfaces web voltadas ao usuário como o frontend, gerador de carga e serviço de
  feature flag.
- **[Locust](https://locust.io)**: um job em segundo plano que cria padrões de uso realistas
  no site usando um gerador de carga sintético.
- **[OpenFeature](https://openfeature.dev)**: uma API e SDK de feature flagging
  que permite habilitar e desabilitar recursos na aplicação.
- **[flagd](https://flagd.dev)**: um daemon de feature flagging que é usado para
  gerenciar feature flags na aplicação demo.
