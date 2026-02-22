---
title: Встановлення Колектора за допомогою Docker
linkTitle: Docker
weight: 100
default_lang_commit: 5489ba34bff91356aa2c501cd55f07eeb30cc355
---

Наступні команди витягують образ Docker і запускають Collector у контейнері. Замініть `{{% param vers %}}` на версію Collector, яку ви хочете запустити.

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

Щоб завантажити файл власних налаштувань із робочої теки, підключіть цей файл як том:

{{< tabpane text=true >}} {{% tab DockerHub %}}

```sh
docker run -v $(pwd)/config.yaml:/etc/otelcol/config.yaml otel/opentelemetry-collector:{{% param vers %}}
```

{{% /tab %}} {{% tab ghcr.io %}}

```sh
docker run -v $(pwd)/config.yaml:/etc/otelcol/config.yaml ghcr.io/open-telemetry/opentelemetry-collector-releases/opentelemetry-collector:{{% param vers %}}
```

{{% /tab %}} {{< /tabpane >}}

## Docker Compose

Ви можете також додати OpenTelemetry Collector до наявного файлу `docker-compose.yaml`, як показано в наступному прикладі:

```yaml
otel-collector:
  image: otel/opentelemetry-collector
  volumes:
    - ./otel-collector-config.yaml:/etc/otelcol/config.yaml
  ports:
    - 1888:1888 # розширення pprof
    - 8888:8888 # метрики Prometheus, експоновані колектором
    - 8889:8889 # метрики експортера Prometheus
    - 13133:13133 # розширення health_check
    - 4317:4317 # Приймач OTLP gRPC
    - 4318:4318 # Приймач OTLP http
    - 55679:55679 # Розширення zpages
```
