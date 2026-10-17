---
default_lang_commit: 6894a64b96cdd29faea3b89ea3821fe77a5c299a
---

## Jaeger

### Налаштування бекенду {#jaeger-backend-setup}

[Jaeger](https://www.jaegertracing.io/) нативно підтримує OTLP для отримання даних трасування. Ви можете запустити Jaeger у docker контейнері з доступом до UI на порту 16686 та увімкненим OTLP на портах 4317 та 4318:

```shell
docker run --rm \
  -p 16686:16686 \
  -p 4317:4317 \
  -p 4318:4318 \
  -p 9411:9411 \
  jaegertracing/jaeger:latest
```

### Використання {#jaeger-usage}

Тепер дотримуйтесь інструкцій для налаштування [OTLP експортерів](#otlp-dependencies).
