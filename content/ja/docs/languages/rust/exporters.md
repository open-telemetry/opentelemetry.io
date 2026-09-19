---
title: エクスポーター
weight: 50
default_lang_commit: 2b88c43e50fb99c601ededa24b1f3a461fef9ac0
---

{{% docs/languages/exporters/intro %}}

## OTLP エンドポイント {#otlp-endpoint}

トレースデータを OTLP エンドポイント（[コレクター](/docs/collector) や Jaeger など）に送信するには、[opentelemetry-otlp](https://crates.io/crates/opentelemetry-otlp) のようなエクスポータークレートを使用します。

たとえば、[Getting Started](../getting-started/) のサイコロサーバーに新しい依存関係を追加して更新できます。

```toml
[dependencies]
opentelemetry-otlp = { version = "{{% version-from-registry exporter-rust-otlp %}}", features = ["grpc-tonic"] }
```

次に、`dice_server.rs` の `init_tracer_provider` を更新して、OTLP エンドポイントを指すようにエクスポーターを設定します。

```rust
use std::convert::Infallible;
use std::net::SocketAddr;
use std::sync::OnceLock;

use http_body_util::Full;
use hyper::{Method, Request, Response, body::Bytes, server::conn::http1, service::service_fn};
use hyper_util::rt::TokioIo;
use opentelemetry::global::{self, BoxedTracer};
use opentelemetry::trace::{Span, SpanKind, Status, Tracer};
use opentelemetry_otlp::SpanExporter;
use opentelemetry_sdk::{Resource, propagation::TraceContextPropagator, trace::SdkTracerProvider};
use rand::Rng;
use tokio::net::TcpListener;

// ...

fn init_tracer_provider() -> SdkTracerProvider {
    let exporter = SpanExporter::builder()
        .with_tonic()
        .build()
        .expect("Failed to create span exporter");
    let provider = SdkTracerProvider::builder()
        .with_resource(Resource::builder().with_service_name("dice_server").build())
        .with_batch_exporter(exporter)
        .build();
    global::set_text_map_propagator(TraceContextPropagator::new());
    global::set_tracer_provider(provider.clone());
    provider
}
```

OTLP エクスポーターを素早く試すには、Docker コンテナで Jaeger を実行します。
Jaeger は OTLP をネイティブにサポートしているため、Web UI（`16686`）と OTLP gRPC エンドポイント（`4317`）を公開するだけで済みます。

```shell
docker run -d --rm --name jaeger \
  -p 16686:16686 \
  -p 4317:4317 \
  jaegertracing/jaeger:latest
```

デフォルトでは、OTLP エクスポーターは `http://localhost:4317` にデータを送信します。
これは上記の Jaeger が公開する OTLP gRPC エンドポイントと一致するため、追加のエンドポイント設定は不要です。

[http://localhost:8080/rolldice](http://localhost:8080/rolldice) にリクエストを送り、Jaeger でトレースを確認します。

1. [http://localhost:16686](http://localhost:16686) を開いてリフレッシュします。
2. **Service** ドロップダウンから `dice_server` を選択します。
3. **Find Traces** をクリックします。

トレースをクリックするとトレース詳細ビューが開き、スパンの階層構造とタイミングがガントチャートとして表示されます。

確認が終わったら、Jaeger コンテナを停止します。

```shell
docker stop jaeger
```
