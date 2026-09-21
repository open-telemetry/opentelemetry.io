## Jaeger

### Backend Setup {#jaeger-backend-setup}

[Jaeger](https://www.jaegertracing.io/) natively supports OTLP to receive trace
data. You can run Jaeger in a docker container with the UI accessible on port
16686 and OTLP enabled on ports 4317 and 4318:

```shell
docker run --rm \
  -p 16686:16686 \
  -p 4317:4317 \
  -p 4318:4318 \
  -p 9411:9411 \
  jaegertracing/jaeger:latest
```

### Usage {#jaeger-usage}

Now following the instruction to setup the [OTLP exporters](#otlp-dependencies).
