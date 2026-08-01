---
title: 不正検知サービス
linkTitle: 不正検知
aliases: [frauddetectionservice]
default_lang_commit: 147b494062edd35ab8900709a9f78e7fd086c3d3
---

このサービスは受信した注文を分析し、悪意のある顧客を検出します。
これはモックのみであり、受信した注文が出力されます。

[不正検知サービスのソースコード](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/fraud-detection/)

## 自動計装 {#auto-instrumentation}

このサービスは、Kafka などのライブラリを自動的に計装し、OpenTelemetry SDK を設定するために、OpenTelemetry Java エージェントに依存しています。
エージェントは `-javaagent` コマンドライン引数を使用してプロセスに渡されます。
コマンドライン引数は `Dockerfile` の `JAVA_TOOL_OPTIONS` を通じて追加され、自動生成された Gradle スタートアップスクリプトで利用されます。

```dockerfile
ENV JAVA_TOOL_OPTIONS=-javaagent:/app/opentelemetry-javaagent.jar
```
