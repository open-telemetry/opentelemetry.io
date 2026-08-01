---
title: Instalar o Collector com Docker
linkTitle: Docker
weight: 100
default_lang_commit: db3275691334b83b3fb6dd95a5dddb3b08b4a1c3
---

Os comandos a seguir baixam uma imagem Docker e executam o Collector em um
contêiner. Substitua `{{% param vers %}}` pela versão do Collector que você
deseja executar.

{{< tabpane text=true >}} {{% tab DockerHub %}}

```sh
docker pull otel/opentelemetry-collector:{{% param vers %}}
docker run otel/opentelemetry-collector:{{% param vers %}}
```

{{% /tab %}} {{% tab ghcr.io %}}

```sh
docker pull ghcr.io/open-telemetry/opentelemetry-collector-releases/opentelemetry-collector:{{% param vers %}}
docker run ghcr.io/open-telemetry/opentelemetry-collector-releases/opentelemetry-collector:{{% param vers %}}
```

{{% /tab %}} {{< /tabpane >}}

Para carregar um arquivo de configuração personalizado a partir do seu diretório
de trabalho, monte o arquivo como um volume:

{{< tabpane text=true >}} {{% tab DockerHub %}}

```sh
docker run -v $(pwd)/config.yaml:/etc/otelcol/config.yaml otel/opentelemetry-collector:{{% param vers %}}
```

{{% /tab %}} {{% tab ghcr.io %}}

```sh
docker run -v $(pwd)/config.yaml:/etc/otelcol/config.yaml ghcr.io/open-telemetry/opentelemetry-collector-releases/opentelemetry-collector:{{% param vers %}}
```

{{% /tab %}} {{< /tabpane >}}

## Docker Compose {#docker-compose}

Também é possível adicionar o OpenTelemetry Collector ao arquivo
`docker-compose.yaml` existente:

```yaml
otel-collector:
  image: otel/opentelemetry-collector
  volumes:
    - ./otel-collector-config.yaml:/etc/otelcol/config.yaml
  ports:
    - 1888:1888 # pprof extension
    - 8888:8888 # Prometheus metrics exposed by the Collector
    - 8889:8889 # Prometheus exporter metrics
    - 13133:13133 # health_check extension
    - 4317:4317 # OTLP gRPC receiver
    - 4318:4318 # OTLP http receiver
    - 55679:55679 # zpages extension
```

O arquivo `otel-collector-config.yaml` é necessário para o Collector iniciar.
Para mais informações, consulte a
[configuração do Collector](/docs/collector/configuration/).

Abaixo está uma configuração mínima do Collector que registra toda a telemetria
recebida.

```yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
      http:
        endpoint: 0.0.0.0:4318

exporters:
  debug:
    verbosity: detailed

service:
  pipelines:
    traces:
      receivers: [otlp]
      exporters: [debug]
    metrics:
      receivers: [otlp]
      exporters: [debug]
    logs:
      receivers: [otlp]
      exporters: [debug]
```
