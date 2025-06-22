---
default_lang_commit: 6f3712c5cda4ea79f75fb410521880396ca30c91
---

## Jaeger {#jaeger}

### バックエンドのセットアップ {#jaeger-backend-setup}

[Jaeger](https://www.jaegertracing.io/)は、トレースデータを受信するためにOTLPをネイティブでサポートしています。UIがポート16686でアクセス可能で、OTLPがポート4317と4318で有効になったDockerコンテナでJaegerを実行できます。

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

[OTLPエクスポーター](#otlp-dependencies)をセットアップするための手順に従ってください。
