---
default_lang_commit: 6ce0f45ce4b7bbb4e85bef99709711edccec8a21
---

## Jaeger

### Configuração do Backend {#jaeger-backend-setup}

O [Jaeger](https://www.jaegertracing.io/) suporta nativamente o OTLP para
receber dados de rastros. O Jaeger pode ser executado através de um contêiner
Docker com uma UI acessível através da porta 16686 e OTLP habilitados nas portas
4317 e 4318:

```shell
docker run --rm \
  -p 16686:16686 \
  -p 4317:4317 \
  -p 4318:4318 \
  -p 9411:9411 \
  jaegertracing/jaeger:latest
```

### Uso {#jaeger-usage}

Siga as instruções para configurar os [exportadores OTLP](#otlp-dependencies).
