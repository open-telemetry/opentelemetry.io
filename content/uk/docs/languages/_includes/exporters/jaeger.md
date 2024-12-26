---
default_lang_commit: 10b2aa9fc1a8f434b6212dc453f01dd520b2f9e3
---

## Jaeger

### Налаштування бекенду {#jaeger-backend-setup}

[Jaeger](https://www.jaegertracing.io/) нативно підтримує OTLP для отримання даних трасування. Ви можете запустити Jaeger у docker контейнері з доступом до UI на порту 16686 та увімкненим OTLP на портах 4317 та 4318:

```shell
docker run --rm \
  -e COLLECTOR_ZIPKIN_HOST_PORT=:9411 \
  -p 16686:16686 \
  -p 4317:4317 \
  -p 4318:4318 \
  -p 9411:9411 \
  jaegertracing/all-in-one:latest
```

### Використання {#jaeger-usage}

Тепер дотримуйтесь інструкцій для налаштування [OTLP експортерів](#otlp-dependencies).
