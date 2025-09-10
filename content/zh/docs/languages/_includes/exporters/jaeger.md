---
default_lang_commit: 2f850a610b5f7da5730265b32c25c9226dc09e5f
---

## Jaeger

### 后端设置 {#jaeger-backend-setup}

[Jaeger](https://www.jaegertracing.io/) 原生支持 OTLP，用于接收链路数据。
你可以通过运行一个 Docker 容器来启动 Jaeger，其 UI 默认在端口 16686 上可访问，并在端口 4317 和 4318 上启用 OTLP：

```shell
docker run --rm \
  -e COLLECTOR_ZIPKIN_HOST_PORT=:9411 \
  -p 16686:16686 \
  -p 4317:4317 \
  -p 4318:4318 \
  -p 9411:9411 \
  jaegertracing/all-in-one:latest
```

### 使用方法 {#jaeger-usage}

现在，按照说明设置 [OTLP 导出器](#otlp-dependencies)。
