---
title: OTLPエクスポーター設定
linkTitle: OTLPエクスポーター
weight: 20
aliases: [otlp-exporter-configuration]
default_lang_commit: 8587d0c0ff3bc57f99b0ecd461f03dd1f73c07ec
drifted_from_default: true
---

## エンドポイントの設定 {#endpoint-configuration}

以下の環境変数により、トレース、メトリクス、およびログのためのOTLP/gRPCまたはOTLP/HTTPエンドポイントを構成できます。

### `OTEL_EXPORTER_OTLP_ENDPOINT`

任意のシグナルタイプ用の基本エンドポイントURLで、オプションでポート番号を指定します。
同じエンドポイントに複数のシグナルを送信し、1つの環境変数でエンドポイントを制御したい場合に便利です。

**デフォルト値:**

- gRPC: `"http://localhost:4317"`
- HTTP: `"http://localhost:4318"`

**例:**

- gRPC: `export OTEL_EXPORTER_OTLP_ENDPOINT="https://my-api-endpoint:443"`
- HTTP: `export OTEL_EXPORTER_OTLP_ENDPOINT="http://my-api-endpoint/"`

OTLP/HTTPの場合、この環境変数が設定されると、SDKのエクスポーターはシグナル固有のURLを構築します。
つまり、トレース、メトリクス、ログを送信する場合、上記の例から以下のURLが構築されます。

- トレース: `"http://my-api-endpoint/v1/traces"`
- メトリクス: `"http://my-api-endpoint/v1/metrics"`
- ログ: `"http://my-api-endpoint/v1/logs"`

### `OTEL_EXPORTER_OTLP_TRACES_ENDPOINT`

トレースデータ専用のエンドポイントURL。
オプションでポート番号を指定できます。
OTLP/HTTP を使用している場合は、通常 `v1/traces` で終わります。

**デフォルト値:**

- gRPC: `"http://localhost:4317"`
- HTTP: `"http://localhost:4318/v1/traces"`

**例:**

- gRPC:
  `export OTEL_EXPORTER_OTLP_TRACES_ENDPOINT="https://my-api-endpoint:443"`
- HTTP:
  `export OTEL_EXPORTER_OTLP_TRACES_ENDPOINT="http://my-api-endpoint/v1/traces"`

### `OTEL_EXPORTER_OTLP_METRICS_ENDPOINT`

オプションでポート番号を指定することができます。
OTLP/HTTP を使用する場合は、通常 `v1/metrics` で終わります。

**デフォルト値:**

- gRPC: `"http://localhost:4317"`
- HTTP: `"http://localhost:4318/v1/metrics"`

**例:**

- gRPC:
  `export OTEL_EXPORTER_OTLP_METRICS_ENDPOINT="https://my-api-endpoint:443"`
- HTTP:
  `export OTEL_EXPORTER_OTLP_METRICS_ENDPOINT="http://my-api-endpoint/v1/metrics"`

### `OTEL_EXPORTER_OTLP_LOGS_ENDPOINT`

ログデータ専用のエンドポイントURL。
オプションでポート番号を指定できます。
OTLP/HTTP を使う場合は、通常 `v1/logs` で終わります。

**デフォルト値:**

- gRPC: `"http://localhost:4317"`
- HTTP: `"http://localhost:4318/v1/logs"`

**例:**

- gRPC: `export OTEL_EXPORTER_OTLP_LOGS_ENDPOINT="https://my-api-endpoint:443"`
- HTTP:
  `export OTEL_EXPORTER_OTLP_LOGS_ENDPOINT="http://my-api-endpoint/v1/logs"`

## ヘッダーの設定 {#header-configuration}

以下の環境変数を使用すると、gRPC または HTTP リクエストの発信時に追加するヘッダーを、キーと値のペアのリストとして設定できます。

### `OTEL_EXPORTER_OTLP_HEADERS`

すべての送信データ（トレース、メトリクス、ログ）に適用するヘッダーのリスト。

**デフォルト値:** なし

**例:**
`export OTEL_EXPORTER_OTLP_HEADERS="api-key=key,other-config-value=value"`

### `OTEL_EXPORTER_OTLP_TRACES_HEADERS`

すべての送信トレースに適用するヘッダーのリスト。

**デフォルト値:** なし

**例:**
`export OTEL_EXPORTER_OTLP_TRACES_HEADERS="api-key=key,other-config-value=value"`

### `OTEL_EXPORTER_OTLP_METRICS_HEADERS`

すべての送信メトリクスに適用するヘッダーのリスト。

**デフォルト値:** なし

**例:**
`export OTEL_EXPORTER_OTLP_METRICS_HEADERS="api-key=key,other-config-value=value"`

### `OTEL_EXPORTER_OTLP_LOGS_HEADERS`

すべての送信ログに適用するヘッダーのリスト。

**デフォルト値:** なし

**例:**
`export OTEL_EXPORTER_OTLP_LOGS_HEADERS="api-key=key,other-config-value=value"`

## タイムアウトの設定 {#timeout-configuration}

以下の環境変数は、OTLPエクスポーターがデータの次のバッチを送信する前に待つ最大時間（ミリ秒単位）を設定します。

### `OTEL_EXPORTER_OTLP_TIMEOUT`

すべての送信データ（トレース、メトリクス、ログ）のタイムアウト値をミリ秒単位で指定します。

**デフォルト値:** `10000` (10秒)

**例:** `export OTEL_EXPORTER_OTLP_TIMEOUT=500`

### `OTEL_EXPORTER_OTLP_TRACES_TIMEOUT`

すべての送信トレースのタイムアウト値（ミリ秒）。

**デフォルト値:** 10000 (10秒)

**例:** `export OTEL_EXPORTER_OTLP_TRACES_TIMEOUT=500`

### `OTEL_EXPORTER_OTLP_METRICS_TIMEOUT`

すべての送信メトリクスのタイムアウト値をミリ秒単位で指定します。

**デフォルト値:** 10000 (10秒)

**例:** `export OTEL_EXPORTER_OTLP_METRICS_TIMEOUT=500`

### `OTEL_EXPORTER_OTLP_LOGS_TIMEOUT`

すべての送信ログのタイムアウト値（ミリ秒）。

**デフォルト値:** 10000 (10s)

**例:** `export OTEL_EXPORTER_OTLP_LOGS_TIMEOUT=500`

## プロトコルの設定 {#protocol-configuration}

以下の環境変数は、OTLPエクスポーターが使用するOTLPトランスポートプロトコルを設定します。

### `OTEL_EXPORTER_OTLP_PROTOCOL`

すべてのテレメトリーデータに使用するOTLPトランスポートプロトコルを指定します。

**デフォルト値:** SDK依存ですが、通常は `http/protobuf` か `grpc` のいずれかです。

**例:** `export OTEL_EXPORTER_OTLP_PROTOCOL=grpc`

指定できる値は以下です。

- OTLP/gRPCを使う場合は `grpc`
- OTLP/HTTP + protobuf を使う場合は `http/protobuf`
- OTLP/HTTP + JSON を使う場合は `http/json`

### `OTEL_EXPORTER_OTLP_TRACES_PROTOCOL`

トレースデータに使用するOTLPトランスポートプロトコルを指定します。

**デフォルト値:** SDK依存ですが、通常は `http/protobuf` か `grpc` のいずれかです。

**例:** `export OTEL_EXPORTER_OTLP_TRACES_PROTOCOL=grpc`

指定できる値は以下です。

- OTLP/gRPCを使う場合は `grpc`
- OTLP/HTTP + protobuf を使う場合は `http/protobuf`
- OTLP/HTTP + JSON を使う場合は `http/json`

### `OTEL_EXPORTER_OTLP_METRICS_PROTOCOL`

メトリクスデータに使用するOTLPトランスポートプロトコルを指定します。

**デフォルト値:** SDK依存ですが、通常は `http/protobuf` か `grpc` のいずれかです。

**例:** `export OTEL_EXPORTER_OTLP_METRICS_PROTOCOL=grpc`

指定できる値は以下です。

- OTLP/gRPCを使う場合は `grpc`
- OTLP/HTTP + protobuf を使う場合は `http/protobuf`
- OTLP/HTTP + JSON を使う場合は `http/json`

### `OTEL_EXPORTER_OTLP_LOGS_PROTOCOL`

ログデータに使用するOTLPトランスポートプロトコルを指定します。

**デフォルト値:** SDK依存ですが、通常は `http/protobuf` か `grpc` のいずれかです。

**例:** `export OTEL_EXPORTER_OTLP_LOGS_PROTOCOL=grpc`

指定できる値は以下です。

- OTLP/gRPCを使う場合は `grpc`
- OTLP/HTTP + protobuf を使う場合は `http/protobuf`
- OTLP/HTTP + JSON を使う場合は `http/json`
