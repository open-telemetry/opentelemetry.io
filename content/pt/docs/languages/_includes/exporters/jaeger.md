---
default_lang_commit: 7d0c3f247ee77671d1135b0af535a2aca05fe359
---

## Jaeger

### Configuração do Backend {#jaeger-backend-setup}

O [Jaeger](https://www.jaegertracing.io/) suporta nativamente o OTLP para
receber dados de rastros. O Jaeger pode ser executado através de um contêiner
Docker com uma UI acessível através da porta 16686 e OTLP habilitados nas portas
4317 e 4318:

```shell
docker run --rm \
  -e COLLECTOR_ZIPKIN_HOST_PORT=:9411 \
  -p 16686:16686 \
  -p 4317:4317 \
  -p 4318:4318 \
  -p 9411:9411 \
  jaegertracing/all-in-one:latest
```

### Uso {#jaeger-usage}

Siga as instruções para configurar os [exportadores OTLP](#otlp-dependencies).
