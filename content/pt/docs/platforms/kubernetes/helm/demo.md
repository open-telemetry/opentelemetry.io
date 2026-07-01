---
title: OpenTelemetry Demo Chart
linkTitle: Demo Chart
default_lang_commit: fe623719bc24346e9dcd77e9769026cf1c720cc5
---

O [OpenTelemetry Demo](/docs/demo/) é um sistema distribuído baseado em
microsserviços criado para ilustrar a implementação do OpenTelemetry em um
ambiente próximo ao real. Como parte desse esforço, a comunidade OpenTelemetry
criou o
[OpenTelemetry Demo Helm Chart](https://github.com/open-telemetry/opentelemetry-helm-charts/tree/main/charts/opentelemetry-demo)
para que possa ser facilmente instalado no Kubernetes.

## Configuração

O `values.yaml` padrão do chart do Demo está pronto para ser instalado. Todos os
componentes tiveram seus limites de memória ajustados para otimizar o
desempenho, o que pode causar problemas se seu cluster não for grande o
suficiente. A instalação completa é limitada a ~4 Gigabytes de memória, mas pode
usar menos.

Todas as opções de configuração (com comentários) disponíveis no chart podem ser
visualizadas no seu
[arquivo `values.yaml`](https://github.com/open-telemetry/opentelemetry-helm-charts/blob/main/charts/opentelemetry-demo/values.yaml),
e descrições detalhadas podem ser encontradas no
[README do chart](https://github.com/open-telemetry/opentelemetry-helm-charts/tree/main/charts/opentelemetry-demo#chart-parameters).

## Instalação

Adicione o repositório Helm do OpenTelemetry:

```shell
helm repo add open-telemetry https://open-telemetry.github.io/opentelemetry-helm-charts
```

Para instalar o chart com o nome de release `my-otel-demo`, execute o seguinte
comando:

```sh
helm install my-otel-demo open-telemetry/opentelemetry-demo
```

Após a instalação, todos os serviços ficam disponíveis via Frontend proxy
(<http://localhost:8080>) executando estes comandos:

```sh
kubectl port-forward svc/my-otel-demo-frontendproxy 8080:8080
```

Após expor o proxy, você também pode acessar os seguintes caminhos:

| Componente        | Caminho                           |
| ----------------- | --------------------------------- |
| Web store         | <http://localhost:8080>           |
| Grafana           | <http://localhost:8080/grafana>   |
| Feature Flags UI  | <http://localhost:8080/feature>   |
| Load Generator UI | <http://localhost:8080/loadgen>   |
| Jaeger UI         | <http://localhost:8080/jaeger/ui> |

Para que os spans da Web store sejam coletados, você deve expor o receptor
OTLP/HTTP do OpenTelemetry Collector:

```sh
kubectl port-forward svc/my-otel-demo-otelcol 4318:4318
```

Para mais detalhes sobre o uso do demo no Kubernetes, consulte
[Implantação no Kubernetes](/docs/demo/kubernetes-deployment/).
