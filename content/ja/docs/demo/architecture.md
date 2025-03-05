---
title: デモのアーキテクチャ
linkTitle: アーキテクチャ
aliases: [current_architecture]
body_class: otel-mermaid-max-width
default_lang_commit: fd7da211d5bc37ca93112a494aaf6a94445e2e28
drifted_from_default: true
---

**OpenTelemetryデモ** は、異なるプログラミング言語で書かれた複数のマイクロサービスから構成されており、gRPCとHTTPを使って相互に通信を行います。
さらに、負荷生成ツールが含まれており、[Locust](https://locust.io/)というツールを使用して、ユーザートラフィックを模擬的に生成します。

```mermaid
graph TD
subgraph サービス図
accountingservice(会計サービス):::dotnet
adservice(広告サービス):::java
cache[(キャッシュ<br/>&#40Valkey&#41)]
cartservice(カートサービス):::dotnet
checkoutservice(決済サービス):::golang
currencyservice(通貨サービス):::cpp
emailservice(メールサービス):::ruby
flagd(Flagd):::golang
flagdui(Flagd-ui):::typescript
frauddetectionservice(不正検知サービス):::kotlin
frontend(フロントエンド):::typescript
frontendproxy(フロントエンドプロキシ <br/>&#40Envoy&#41):::cpp
imageprovider(画像プロバイダー <br/>&#40nginx&#41):::cpp
loadgenerator([負荷生成ツール]):::python
paymentservice(支払いサービス):::javascript
productcatalogservice(商品カタログサービス):::golang
quoteservice(見積サービス):::php
recommendationservice(レコメンデーションサービス):::python
shippingservice(配送サービス):::rust
queue[(キュー<br/>&#40Kafka&#41)]:::java
react-native-app(React Native<br>アプリケーション):::typescript

adservice ---->|gRPC| flagd

checkoutservice -->|gRPC| cartservice
checkoutservice --->|TCP| queue
cartservice --> cache
cartservice -->|gRPC| flagd

checkoutservice -->|gRPC| shippingservice
checkoutservice -->|gRPC| paymentservice
checkoutservice --->|HTTP| emailservice
checkoutservice -->|gRPC| currencyservice
checkoutservice -->|gRPC| productcatalogservice

frauddetectionservice -->|gRPC| flagd

frontend -->|gRPC| adservice
frontend -->|gRPC| cartservice
frontend -->|gRPC| checkoutservice
frontend ---->|gRPC| currencyservice
frontend ---->|gRPC| recommendationservice
frontend -->|gRPC| productcatalogservice

frontendproxy -->|gRPC| flagd
frontendproxy -->|HTTP| frontend
frontendproxy -->|HTTP| flagdui
frontendproxy -->|HTTP| imageprovider

Internet -->|HTTP| frontendproxy

loadgenerator -->|HTTP| frontendproxy

paymentservice -->|gRPC| flagd

queue -->|TCP| accountingservice
queue -->|TCP| frauddetectionservice

recommendationservice -->|gRPC| productcatalogservice
recommendationservice -->|gRPC| flagd

shippingservice -->|HTTP| quoteservice

react-native-app -->|HTTP| frontendproxy
end

classDef dotnet fill:#178600,color:white;
classDef cpp fill:#f34b7d,color:white;
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
graph TD
subgraph サービスの凡例
  dotnetsvc(.NET):::dotnet
  cppsvc(C++):::cpp
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

デモアプリケーションの[メトリック](/docs/demo/telemetry-features/metric-coverage/) と [トレース](/docs/demo/telemetry-features/trace-coverage/) の計装の現状については、リンクをご確認ください。

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
           oc-prom[/"OTLP HTTPエクスポーター"/]
           oc-otlp[/"OTLPエクスポーター"/]

           oc-grpc --> oc-proc
           oc-http --> oc-proc

           oc-proc --> oc-prom
           oc-proc --> oc-otlp
       end

       oc-prom -->|"localhost:9090/api/v1/otlp"| pr-sc
       oc-otlp -->|gRPC| ja-col

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

       subgraph gr[Grafana]
           style gr fill:#f8b91e,color:black;
           gr-srv["Grafanaサーバー"]
           gr-http[/"Grafana HTTP<br/>リッスン先：<br/>localhost:3000"/]

           gr-srv --> gr-http
       end

       pr-http --> |"localhost:9090/api"| gr-srv
       ja-http --> |"localhost:16686/api"| gr-srv

       ja-b{{"ブラウザ<br/>Jaeger UI"}}
       ja-http ---->|"localhost:16686/search"| ja-b

       gr-b{{"ブラウザ<br/>Grafana UI"}}
       gr-http -->|"localhost:3000/dashboard"| gr-b
   end
end
```

Protocol Bufferの定義は /pb/ ディレクトリにあります。
