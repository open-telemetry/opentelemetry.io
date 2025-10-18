---
title: デモのアーキテクチャ
linkTitle: アーキテクチャ
aliases: [current_architecture]
body_class: otel-mermaid-max-width
default_lang_commit: 68e94a4555606e74c27182b79789d46faf84ec25
---

**OpenTelemetryデモ** は、異なるプログラミング言語で書かれた複数のマイクロサービスから構成されており、gRPCとHTTPを使って相互に通信を行います。
さらに、負荷生成ツールが含まれており、[Locust](https://locust.io/)というツールを使用して、ユーザートラフィックを模擬的に生成します。

```mermaid
graph TD
subgraph サービス図
accounting(会計):::dotnet
ad(広告):::java
cache[(キャッシュ<br/>&#40Valkey&#41)]
cart(カート):::dotnet
checkout(決済):::golang
currency(通貨):::cpp
email(メール):::ruby
flagd(Flagd):::golang
flagd-ui(Flagd-ui):::elixir
fraud-detection(不正検知):::kotlin
frontend(フロントエンド):::typescript
frontend-proxy(フロントエンドプロキシ <br/>&#40Envoy&#41):::cpp
image-provider(画像プロバイダー <br/>&#40nginx&#41):::cpp
load-generator([負荷生成ツール]):::python
payment(支払い):::javascript
product-catalog(商品カタログ):::golang
quoteservice(見積サービス):::php
recommendation(レコメンデーション):::python
shipping(配送):::rust
queue[(キュー<br/>&#40Kafka&#41)]:::java
react-native-app(React Native<br>アプリケーション):::typescript
postgresql[(データベース<br/>&#40PostgreSQL&#41)]

accounting ---> postgresql

ad ---->|gRPC| flagd

checkout -->|gRPC| currency
checkout -->|gRPC| cart
checkout -->|TCP| queue

cart --> cache
cart -->|gRPC| flagd

checkout -->|gRPC| payment
checkout --->|HTTP| email
checkout -->|gRPC| product-catalog
checkout -->|HTTP| shipping

fraud-detection -->|gRPC| flagd

frontend -->|gRPC| ad
frontend -->|gRPC| currency
frontend -->|gRPC| cart
frontend -->|gRPC| checkout
frontend -->|HTTP| shipping
frontend ---->|gRPC| recommendation
frontend -->|gRPC| product-catalog

frontend-proxy -->|gRPC| flagd
frontend-proxy -->|HTTP| frontend
frontend-proxy -->|HTTP| flagd-ui
frontend-proxy -->|HTTP| image-provider

payment -->|gRPC| flagd

queue -->|TCP| accounting
queue -->|TCP| fraud-detection

recommendation -->|gRPC| flagd
recommendation -->|gRPC| product-catalog

shipping -->|HTTP| quote

Internet -->|HTTP| frontend-proxy
load-generator -->|HTTP| frontend-proxy
react-native-app -->|HTTP| frontend-proxy
end

classDef dotnet fill:#178600,color:white;
classDef cpp fill:#f34b7d,color:white;
classDef elixir fill:#b294bb,color:black;
classDef golang fill:#00add8,color:black;
classDef java fill:#b07219,color:white;
classDef javascript fill:#f1e05a,color:black;
classDef kotlin fill:#560ba1,color:white;
classDef php fill:#4f5d95,color:white;
classDef python fill:#3572A5,color:white;
classDef ruby fill:#701516,color:white;
classDef rust fill:#dea584,color:black;
classDef typescript fill:#e98516,color:black;
```

```mermaid
graph LR
subgraph サービスの凡例
  dotnetsvc(.NET):::dotnet
  cppsvc(C++):::cpp
  elixirsvc(Elixir):::elixir
  golangsvc(Go):::golang
  javasvc(Java):::java
  javascriptsvc(JavaScript):::javascript
  kotlinsvc(Kotlin):::kotlin
  phpsvc(PHP):::php
  pythonsvc(Python):::python
  rubysvc(Ruby):::ruby
  rustsvc(Rust):::rust
  typescriptsvc(TypeScript):::typescript
end

classDef dotnet fill:#178600,color:white;
classDef cpp fill:#f34b7d,color:white;
classDef elixir fill:#b294bb,color:black;
classDef golang fill:#00add8,color:black;
classDef java fill:#b07219,color:white;
classDef javascript fill:#f1e05a,color:black;
classDef kotlin fill:#560ba1,color:white;
classDef php fill:#4f5d95,color:white;
classDef python fill:#3572A5,color:white;
classDef ruby fill:#701516,color:white;
classDef rust fill:#dea584,color:black;
classDef typescript fill:#e98516,color:black;
```

デモアプリケーションの[ログ](/docs/demo/telemetry-features/log-coverage/)、[メトリクス](/docs/demo/telemetry-features/metric-coverage/) と[トレース](/docs/demo/telemetry-features/trace-coverage/) の計装の現状については、これらのリンクをご確認ください。

コレクターの設定は [otelcol-config.yml](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/otel-collector/otelcol-config.yml) で行われており、代替のエクスポーターをここで設定することができます。

```mermaid
graph TB
subgraph tdf[テレメトリーデータフロー]
   subgraph subgraph_padding [ ]
       style subgraph_padding fill:none,stroke:none;
       %% タイトルの重複を防ぐためのパディング
       subgraph od[OpenTelemetryデモ]
       ms(マイクロサービス)
       end

       ms -.->|"OTLP<br/>gRPC"| oc-grpc
       ms -.->|"OTLP<br/>HTTP POST"| oc-http

       subgraph oc[OTelコレクター]
           style oc fill:#97aef3,color:black;
           oc-grpc[/"OTLPレシーバー<br/>リッスン先：<br/>grpc://localhost:4317"/]
           oc-http[/"OTLPレシーバー<br/>リッスン先：<br/>localhost:4318<br/>"/]
           oc-proc(プロセッサー)
           oc-spanmetrics[/"Span Metricsコネクター"/]
           oc-prom[/"OTLP HTTPエクスポーター"/]
           oc-otlp[/"OTLPエクスポーター"/]
           oc-opensearch[/"OpenSearchエクスポーター"/]

           oc-grpc --> oc-proc
           oc-http --> oc-proc

           oc-proc --> oc-prom
           oc-proc --> oc-otlp
           oc-proc --> oc-opensearch
           oc-proc --> oc-spanmetrics
           oc-spanmetrics --> oc-prom
       end

       oc-prom -->|"localhost:9090/api/v1/otlp"| pr-sc
       oc-otlp -->|gRPC| ja-col
       oc-opensearch -->|HTTP| os-http

       subgraph pr[Prometheus]
           style pr fill:#e75128,color:black;
           pr-sc[/"Prometheus OTLP書き込みレシーバー"/]
           pr-tsdb[(Prometheus TSDB)]
           pr-http[/"Prometheus HTTP<br/>リッスン先：<br/>localhost:9090"/]

           pr-sc --> pr-tsdb
           pr-tsdb --> pr-http
       end

       pr-b{{"ブラウザ<br/>Prometheus UI"}}
       pr-http ---->|"localhost:9090/graph"| pr-b

       subgraph ja[Jaeger]
           style ja fill:#60d0e4,color:black;
           ja-col[/"Jaegerコレクター<br/>リッスン先：<br/>grpc://jaeger:4317"/]
           ja-db[(Jaeger DB)]
           ja-http[/"Jaeger HTTP<br/>リッスン先：<br/>localhost:16686"/]

           ja-col --> ja-db
           ja-db --> ja-http
       end

       subgraph os[OpenSearch]
           style os fill:#005eb8,color:black;
           os-http[/"OpenSearch<br/>リッスン先：<br/>localhost:9200"/]
           os-db[(OpenSearchインデックス)]

           os-http ---> os-db
       end

       subgraph gr[Grafana]
           style gr fill:#f8b91e,color:black;
           gr-srv["Grafanaサーバー"]
           gr-http[/"Grafana HTTP<br/>リッスン先：<br/>localhost:3000"/]

           gr-srv --> gr-http
       end

       pr-http --> |"localhost:9090/api"| gr-srv
       ja-http --> |"localhost:16686/api"| gr-srv
       os-http --> |"localhost:9200/api"| gr-srv

       ja-b{{"ブラウザ<br/>Jaeger UI"}}
       ja-http ---->|"localhost:16686/search"| ja-b

       gr-b{{"ブラウザ<br/>Grafana UI"}}
       gr-http -->|"localhost:3000/dashboard"| gr-b
   end
end
```

Protocol Bufferの定義は /pb/ ディレクトリにあります。
