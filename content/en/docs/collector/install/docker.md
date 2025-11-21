---
title: Install the Collector with Docker
redirect_from:
  - /docs/collector/installation/#docker
  - /docs/collector/installation/#docker-compose
---

## Docker

To deploy the latest Collector container image with default configuration:

```bash
docker run \
  --rm -it \
  -p 4317:4317 \
  -p 4318:4318 \
  -v "$(pwd)/config.yaml":/etc/otelcol/config.yaml \
  otel/opentelemetry-collector:latest
```

Replace `$(pwd)/config.yaml` with your own config.

## Docker Compose

Example docker-compose.yaml:

```yaml
version: '3'
services:
  otel-collector:
    image: otel/opentelemetry-collector:latest
    command: ["--config=/etc/otelcol/config.yaml"]
    volumes:
      - ./config.yaml:/etc/otelcol/config.yaml
    ports:
      - "4317:4317"
      - "4318:4318"
```

Start:

```bash
docker compose up
```