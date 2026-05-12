---
title: HelmでKubernetesにOBIをデプロイする
linkTitle: Helm チャート
description: KubernetesにHelmチャートとしてOBIをデプロイする方法を学ぶ
weight: 2
default_lang_commit: dc2fb5771163265cb804a39b1dacc536b95bdb96
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
