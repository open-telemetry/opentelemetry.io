---
title: HelmでKubernetesにOBIをデプロイする
linkTitle: Helm チャート
description: KubernetesにHelmチャートとしてOBIをデプロイする方法を学ぶ
weight: 2
default_lang_commit: c88a006471f039334aed7990736e089a62b33f94
---

> [!NOTE]
>
> Helm の各種設定オプションの詳細については、
> [OBI Helm チャートドキュメント](https://github.com/open-telemetry/opentelemetry-helm-charts/tree/main/charts/opentelemetry-ebpf-instrumentation)
> を参照するか、
> [Artifact Hub](https://artifacthub.io/packages/helm/opentelemetry-helm/opentelemetry-ebpf-instrumentation)
> でチャートを参照してください。
> 詳細な設定パラメーターについては、
> [values.yaml](https://github.com/open-telemetry/opentelemetry-helm-charts/blob/main/charts/opentelemetry-ebpf-instrumentation/values.yaml)
> ファイルを参照してください。

目次

<!-- TOC -->

- [Helm から OBI をデプロイする](#deploying-obi-from-helm)
- [OBI の設定](#configuring-obi)
- [OBI メタデータの設定](#configuring-obi-metadata)
- [k8s-cache による Kubernetes メタデータの集約](#centralizing-kubernetes-metadata-with-k8s-cache)
- [Helm 設定へのシークレットの提供](#providing-secrets-to-the-helm-configuration)
<!-- TOC -->

## Helm から OBI をデプロイする {#deploying-obi-from-helm}

まず、OpenTelemetry Helm リポジトリを Helm に追加する必要があります。

```sh
helm repo add open-telemetry https://open-telemetry.github.io/opentelemetry-helm-charts
```

次のコマンドは、`obi` 名前空間にデフォルト設定の OBI DaemonSet をデプロイします。

```sh
helm install obi -n obi --create-namespace open-telemetry/opentelemetry-ebpf-instrumentation
```

OBI のデフォルト設定は次のようになっています。

- Pod HTTP ポート `9090` の `/metrics` パスで Prometheus メトリクスとしてメトリクスをエクスポートします。
- クラスター内のすべてのアプリケーションを計装しようとします。
- デフォルトではアプリケーションレベルのメトリクスのみを提供し、[ネットワークレベルのメトリクス](../../network/)は除外します。
- `k8s.namespace.name` や `k8s.pod.name` などの Kubernetes メタデータラベルでメトリクスを装飾するよう OBI を設定します。

## OBI の設定 {#configuring-obi}

OBI のデフォルト設定をオーバーライドしたい場合があります。
たとえば、Prometheus のかわりに OpenTelemetry としてメトリクスやスパンをエクスポートしたり、計装するサービス数を制限したりする場合です。

デフォルトの [OBI 設定オプション](../../configure/) を独自の値でオーバーライドできます。

たとえば、カスタム設定を含む `helm-obi.yml` ファイルを作成します。

```yaml
config:
  data:
    # 実際の OBI 設定ファイルの内容
    discovery:
      instrument:
        - k8s_namespace: demo
        - k8s_namespace: blog
    routes:
      unmatched: heuristic
```

`config.data` セクションには OBI 設定ファイルが含まれており、[OBI 設定オプションのドキュメント](../../configure/options/)に記載されています。

次に、`-f` フラグを使用してオーバーライドされた設定を `helm` コマンドに渡します。
たとえば、このようなコマンドを実行します。

```sh
helm install obi open-telemetry/opentelemetry-ebpf-instrumentation -f helm-obi.yml
```

または、OBI チャートが以前にデプロイされていた場合は次のようにします。

```sh
helm upgrade obi open-telemetry/opentelemetry-ebpf-instrumentation -f helm-obi.yml
```

## OBI メタデータの設定 {#configuring-obi-metadata}

OBI が Prometheus エクスポーターを使用してデータをエクスポートしている場合、Prometheus スクレイパーが OBI を検出できるように OBI Pod アノテーションをオーバーライドする必要がある場合があります。
次のセクションをサンプルの `helm-obi.yml` ファイルに追加できます。

```yaml
podAnnotations:
  prometheus.io/scrape: 'true'
  prometheus.io/path: '/metrics'
  prometheus.io/port: '9090'
```

同様に、Helm チャートでは、サービスアカウント、クラスターロール、セキュリティコンテキストなど、OBI のデプロイに関わる複数のリソースの名前、ラベル、アノテーションをオーバーライドできます。
[OBI Helm チャートドキュメント](https://github.com/open-telemetry/opentelemetry-helm-charts/tree/main/charts/opentelemetry-ebpf-instrumentation)には、各種設定オプションが記載されています。

## k8s-cache による Kubernetes メタデータの集約 {#centralizing-kubernetes-metadata-with-k8s-cache}

デフォルトでは、各 OBI Pod はローカルノードだけでなくクラスター全体の Pod、Node、Service メタデータを監視するため、Kubernetes API サーバーへの独自の接続を開きます。
これはリクエストの送信元だけでなく、送信先の情報も充実させるためです（たとえば、送信 HTTP リクエストに対するサービス名を取得して [peer](/docs/specs/semconv/registry/attributes/service/#service-attributes-for-peer-services) 属性を追加したり、[サービスグラフ](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/connector/servicegraphconnector)メトリクスの送信先を取得したりします）。
大規模クラスターでは、各 OBI Pod からクラスター全体の Kubernetes メタデータをクエリすると、API サーバーに過負荷がかかり、クラスター全体に影響を与える可能性があります。

これを回避するため、OBI Helm チャートは `k8s-cache` と呼ばれる小規模なコンパニオンサービスをデプロイできます。
キャッシュはすべての OBI Pod に代わって Kubernetes API を一度だけ監視し、gRPC 経由でメタデータをストリーミングします。
これにより、OBI の Pod ごとの informer トラフィックが API サーバーに送信されなくなり、API の負荷が大幅に軽減されます。

有効にするには、`helm-obi.yml` で `k8sCache.replicas` をゼロ以外の値に設定します。

```yaml
k8sCache:
  replicas: 1
```

通常、レプリカは 1 つで十分です。
高可用性や非常に大規模なクラスターの場合は、レプリカ数を増やしてください。
OBI Pod はキャッシュ `Service` を通じてレプリカ間でロードバランスし、障害時には正常なレプリカに再接続します。

`k8sCache.replicas` が `0`（デフォルト）の場合、キャッシュはデプロイされず、各 OBI Pod は独自のローカル informer を使用します。

## Helm 設定へのシークレットの提供 {#providing-secrets-to-the-helm-configuration}

OpenTelemetry エンドポイント経由でメトリクスとトレースをオブザーバビリティバックエンドに直接送信する場合、`OTEL_EXPORTER_OTLP_HEADERS` 環境変数を通じてクレデンシャルを提供する必要がある場合があります。

推奨される方法は、このような値を Kubernetes Secret に保存し、Helm 設定からそれを参照する環境変数を指定することです。

たとえば、次の Secret をデプロイします。

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: obi-secret
type: Opaque
stringData:
  otlp-headers: 'Authorization=Basic ....'
```

次に、`envValueFrom` セクションを使用して、`helm-config.yml` ファイルからそれを参照します。

```yaml
env:
  OTEL_EXPORTER_OTLP_ENDPOINT: '<...your OTLP endpoint URL...>'
envValueFrom:
  OTEL_EXPORTER_OTLP_HEADERS:
    secretKeyRef:
      key: otlp-headers
      name: obi-secret
```
