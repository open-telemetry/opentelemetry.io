---
title: 'エッジにおけるオブザーバビリティ: Envoy と Istio の新しい OTel 機能'
linkTitle: Envoy と Istio の新しい OTel 機能
date: 2024-06-07
author: '[Joao Grassi](https://github.com/joaopgrassi) (Dynatrace)'
issue: 4534
sig: OpenTelemetry Specification
default_lang_commit: 4905ca24ed604c3ebda7440ac335ca15dbe2f535
cSpell:ignore: bookinfo Grassi istioctl Joao productpage
---

クラウドネイティブで分散されたアプリケーションのダイナミックな世界では、マイクロサービスを効果的に管理することが極めて重要です。
[Kubernetes](https://kubernetes.io/) はコンテナオーケストレーションの事実上の標準となり、コンテナ化されたアプリケーションのシームレスなデプロイ、スケーリング、管理を可能にしています。

しかし、このようなシステムの分散的な性質は、クラスター内通信のネットワーキングという形で複雑さのレイヤーを追加します。
Envoy と Istio という2つの著名なプロジェクトが、このような複雑な環境を円滑に管理・運用するための基盤として登場しました。

これらの技術を組み合わせることで、組織はスケーラブルでレジリエントかつ安全な分散システムを構築できます。

[Istio](https://istio.io/) はサービスメッシュであり、マイクロサービス間の通信をオーケストレーションし、トラフィック管理、セキュリティ、そしてもちろんオブザーバビリティなどの機能を提供します。
Istio はデータプレーンとして Envoy プロキシを使用しています。
[Envoy](https://www.envoyproxy.io/) は高性能プロキシであり、単一のアプリケーション/サービス向けだけでなく、サービスメッシュのための通信バスおよび「ユニバーサルデータプレーン」としても設計されています。

[Envoy](https://www.cncf.io/projects/envoy/) と [Istio](https://www.cncf.io/projects/istio/) はオープンソースプロジェクトであり、[Cloud Native Computing Foundation](https://www.cncf.io/) の一部です。

## Envoy と Istio におけるオブザーバビリティ {#observability-in-envoy-and-istio}

Istio サービスメッシュによってデプロイされた Envoy プロキシは、受信および送信リクエストが適切にトレースされることを保証するための最適な候補です。
このアプローチにより、サービスメッシュ全体の分散トレースが提供され、アプリケーション自体が計装されていない場合でも、サービス間の通信の概要を把握できます。

> Note: 最低限、アプリケーションは `traceparent` ヘッダーを伝搬するよう設定されている必要があります。

Envoy はリクエストのトレーシングのために、いくつかの [HTTP トレーサー](https://www.envoyproxy.io/docs/envoy/v1.29.4/api-v3/config/trace/trace)を提供しており、[OpenTelemetry トレーサー](https://www.envoyproxy.io/docs/envoy/v1.29.4/api-v3/config/trace/v3/opentelemetry.proto)もその1つです。
[トレーサー](/docs/concepts/signals/traces/#tracer)は、Envoy 内で直接設定する（スタンドアロンコンポーネントとして使用する場合）か、Istio を使用してすべての Envoy インスタンスに対して設定できます。

以下は、Istio と Envoy が連携してリクエストをトレースする方法の例です。

![Istio と Envoy による分散トレース](envoy-tracing.png)

## Envoy と Istio の新しい OTel トレーシング機能 {#new-otel-tracing-features-in-envoy-and-istio}

Envoy はすでに gRPC を使用した OpenTelemetry トレースのエクスポートをサポートしていましたが、HTTP を使用したエクスポートのサポートが不足していました。
OpenTelemetry は両方のプロトコルをファーストクラスでサポートしています。
さらに、リソース属性の提供や設定可能なサンプリング決定など、その他の領域も OpenTelemetry 仕様の安定部分に対して遅れをとっていました。

Envoy [1.29](https://www.envoyproxy.io/docs/envoy/latest/version_history/v1.29/v1.29) と Istio [1.22](https://istio.io/latest/news/releases/1.22.x/announcing-1.22/change-notes) 以降、ユーザーは以下に説明する新機能を利用できるようになりました。

### OTLP HTTP エクスポーター {#otlp-http-exporter}

Envoy の [OpenTelemetry トレーサー](https://www.envoyproxy.io/docs/envoy/v1.29.4/api-v3/config/trace/v3/opentelemetry.proto)は、HTTP を使用して OTLP トレースをエクスポートするよう設定できるようになりました。
これにより、Envoy プロキシから直接 OTLP/HTTP を使用してオブザーバビリティシンクにテレメトリーを送信できます。

### リソースディテクター {#resource-detectors}

Envoy には[環境リソースディテクター](https://www.envoyproxy.io/docs/envoy/v1.29.4/api-v3/extensions/tracers/opentelemetry/resource_detectors/v3/environment_resource_detector.proto)が同梱されるようになりました。
このリソースディテクターは [OTel 仕様](/docs/specs/otel/resource/sdk/#specifying-resource-information-via-an-environment-variable)に準拠しており、ユーザーは Envoy プロキシが生成するスパンをさらに充実させることができます。

[リソースディテクター機能](https://github.com/envoyproxy/envoy/pull/29547)は環境ディテクターを追加しただけでなく、Envoy の組み込みエクステンション機能を使用して他のリソースディテクターも容易に追加できるようにしました。

### カスタムサンプラー {#custom-samplers}

Envoy に追加されたもう1つのエキサイティングな機能は、カスタムサンプラーの実装と設定が可能になったことです。
Envoy は [OTel サンプラーインターフェース](/docs/specs/otel/trace/sdk/#sampler)に準拠しており、誰でも独自のサンプラーを簡単にコントリビュートできます。

Envoy には [Always On サンプラー](https://www.envoyproxy.io/docs/envoy/v1.29.4/api-v3/extensions/tracers/opentelemetry/samplers/v3/always_on_sampler.proto)が同梱されており、すべてのスパンをそのまま転送します。
この基本実装は、よりスマートなサンプラーのリファレンス実装として使用できます。

## デモ {#demo}

新しい機能を実際に試してみましょう！
ここでは、[Istio Bookinfo アプリケーション](https://istio.io/latest/docs/examples/bookinfo/)を使用して、以下の方法を説明します。

- Kubernetes にデプロイし、Istio をサービスメッシュとして使用する
- HTTP を使用して [Jaeger](https://www.jaegertracing.io/) にトレースをエクスポートする

### Jaeger のインストール {#install-jaeger}

まず、[Jaeger operator](https://www.jaegertracing.io/docs/1.57/operator/) をインストールします。

```shell
kubectl create namespace observability
kubectl create -f https://github.com/jaegertracing/jaeger-operator/releases/download/v1.57.0/jaeger-operator.yaml -n observability
```

次に Jaeger `all-in-one` をデプロイします。

```shell
kubectl apply -f - <<EOF
apiVersion: jaegertracing.io/v1
kind: Jaeger
metadata:
  name: simplest
EOF
```

### Istio のインストールと設定 {#install-and-configure-istio}

次に、[`istioctl`](https://istio.io/latest/docs/setup/install/istioctl/) を使用して Istio をインストールします。

```shell
cat <<EOF | istioctl install -y -f -
apiVersion: install.istio.io/v1alpha1
kind: IstioOperator
spec:
  meshConfig:
    enableTracing: true
    extensionProviders:
    - name: otel-tracing
      opentelemetry:
        port: 4318
        service: simplest-collector.default.svc.cluster.local
        http:
          path: "/v1/traces"
          timeout: 5s
        resource_detectors:
          environment: {}
EOF
```

これにより Istio がインストールされ、OpenTelemetry トレーシングプロバイダーが OTLP/HTTP 上の `http` エクスポーターを使用し、Jaeger collector をエンドポイントとして設定されます。
この設定では、`resource_detectors` で環境リソースディテクターも有効になります。

次に、Istio の [Telemetry API](https://istio.io/latest/docs/tasks/observability/telemetry/) を使用してトレーサーを有効にする必要があります。

```shell
kubectl apply -f - <<EOF
apiVersion: telemetry.istio.io/v1alpha1
kind: Telemetry
metadata:
  name: otel-demo
spec:
  tracing:
  - providers:
    - name: otel-tracing
    randomSamplingPercentage: 100
EOF
```

最後に、Envoy プロキシの `OTEL_RESOURCE_ATTRIBUTES` 環境変数を設定します。

```shell
cat <<EOF | kubectl apply -f -
apiVersion: networking.istio.io/v1beta1
kind: ProxyConfig
metadata:
  name: my-proxyconfig
  namespace: istio-system
spec:
  concurrency: 0
  environmentVariables:
    OTEL_RESOURCE_ATTRIBUTES: "host.name=abc-123"
EOF
```

### アプリケーションのデプロイ {#deploy-the-application}

最後のステップは、bookinfo アプリケーション（[bookinfo.yaml](https://raw.githubusercontent.com/istio/istio/release-1.22/samples/bookinfo/platform/kube/bookinfo.yaml)）をデプロイすることです。

```shell
kubectl label namespace default istio-injection=enabled
kubectl apply -f bookinfo.yaml
```

### 動作確認 {#test-it-out}

セットアップをテストするには、サービスの1つにリクエストを送信します。
たとえば、以下のようにします。

```shell
kubectl exec "$(kubectl get pod -l app=ratings -o jsonpath='{.items[0].metadata.name}')" -c ratings -- curl -sS productpage:9080/productpage | grep -o "<title>.*</title>"
```

その後、Jaeger UI で確認できます。
トレースが表示されているはずです！

![Jaeger での分散トレース表示](jaeger.png)

Envoy が生成したスパンから、以下の内容を確認できます（順番に）。

1. `ratings` サービスから `productpage` サービスへの送信（egress）呼び出し。
2. `productpage` サービスへの受信（ingress）呼び出し。
3. `OTEL_RESOURCE_ATTRIBUTES` を使用して適用した `host-name` リソース属性。
   この属性は環境リソースディテクターによって検出され、Envoy が作成したすべてのスパンに追加されました。

すべてのサービスには Istio によって Envoy サイドカーが注入されているため、その他すべてのダウンストリーム呼び出しも確認できます。
Envoy で OTel トレーサーを有効にするだけで、サービス間の呼び出しの完全なオブザーバビリティが得られます！

## 次のステップとまとめ {#next-steps-and-closing}

この投稿で説明した新機能により、ユーザーはトレースのエクスポートにおいてより高い柔軟性を得られます。
リソース属性によるデータの充実が可能になり、将来追加されるよりインテリジェントなサンプリング技術の基盤が確立されました。

これらの新機能は、クラウドプロバイダーやオブザーバビリティベンダーを含む、オブザーバビリティ領域の他の関係者にとっても興味深いユースケースを生み出します。
リソースディテクターとサンプラー API が Envoy で利用可能になったことで、誰でもカスタムサンプラーやディテクターのサポートを構築し、Envoy が生成するテレメトリーデータの有用性を向上させることができます。

Envoy と OpenTelemetry のもう1つのエキサイティングな次のステップは、安定版となった [Envoy における HTTP セマンティック規約](https://github.com/envoyproxy/envoy/issues/30821)の採用です。
これにより、Envoy は安定版の HTTP セマンティック規約に従ってスパンを生成しているすべての OTel SDK と整合します。

Envoy と Istio のコミュニティと協力して、これらのプロジェクトにより多くの OTel 機能を導入することは素晴らしい経験でした。
OpenTelemetry の採用への意欲と、Istio や Envoy のような関連する CNCF プロジェクトとの強力なコラボレーションは、オブザーバビリティの事実上の標準としての OpenTelemetry の地位を固めるのに役立っています。
