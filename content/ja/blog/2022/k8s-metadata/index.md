---
title: K8s メタデータを活用したトラブルシューティングの改善
linkTitle: Kubernetes メタデータ
date: 2022-06-29
author: '[Ruben Vargas](https://github.com/rubenvp8510)'
default_lang_commit: d2d54d913be1d9d448f7a33cdf1623a39415a20f
# prettier-ignore
cSpell:ignore: k8sattributes k8sattributesprocessor k8sprocessor KUBE replicaset replicasetname resourcedetection
---

> [!NOTE]
>
> Kubernetes メタデータでテレメトリーを強化する方法に関する最新情報は、ドキュメントに掲載されています。
> 詳しくは [Getting Started with Kubernetes](/docs/platforms/kubernetes/getting-started/) を参照してください。

Kubernetes リソースのメタデータを OpenTelemetry トレースに付与すると、どのリソース（Pod など）に障害やパフォーマンスの問題が発生しているかを特定するのに役立ちます。
また、他のシグナルとの相関にも有用です。
たとえば、同じ Pod によって生成されたログとスパンを関連付けることができます。

この記事では、さまざまなシナリオで [k8sattributesprocessor][] を使用するように OpenTelemetry Collector を設定する方法を説明します。

OpenTelemetry Collector パイプラインの詳細はこの記事では扱いません。
詳細については [Collector のドキュメント](/docs/collector/)を参照してください。

## K8s 属性の付与方法 {#how-k8s-attributes-are-attached}

大まかに言うと、K8s 属性は[リソース](/docs/concepts/glossary/#resource)としてトレースに付与されます。
これには 2 つの理由があります。

1. K8s 属性はリソースの定義に合致しています。
   リソースとは、テレメトリーが記録される対象のエンティティです。
2. このメタデータを集約することで、生成されるすべてのスパンに関連する情報を一元管理できます。

それでは、実際の設定方法を見ていきましょう。

## k8sattributes プロセッサーの使用 {#using-k8sattributes-processor}

これは Pod のメタデータを自動的に検出し、その Pod が生成するスパンに関連付けられたリソースにメタデータを付与する OpenTelemetry プロセッサーです。
Pod が `Deployment` または `ReplicaSet` に属している場合は、その属性も検出します。

リソースに付与できる属性の例は次のとおりです。

- ノード名 `k8s.node.name`
- Pod 名 `k8s.pod.name`
- Pod UID `k8s.pod.uid`
- ネームスペース `k8s.namespace.name`
- Deployment 名 `k8s.deployment.name`（Pod が Deployment によって作成された場合）

これらの属性は OpenTelemetry のセマンティック規約に準拠しています。
詳細については [Kubernetes resource semantic conventions][] を参照してください。

このプロセッサーは内部で Pod のリストと関連する属性（通常は Pod の IP アドレス）を保持し、その属性を使ってどの Pod が特定のスパンを生成したかを判別します。

![k8sattributes プロセッサーのデータフロー](k8sprocessor.png)

上の図では、データの流れを確認できます。
Pod のテーブルは Kubernetes API を使って取得され、Pod の IP は Pod と Collector 間の接続コンテキストから抽出されます。

`k8sattributesprocessor` は Collector の設定方法に応じて異なるモードで動作します。
Collector を DaemonSet としてデプロイする一般的なシナリオを見ていきましょう。

### DaemonSet モード {#daemonset-mode}

DaemonSet モード（k8sattributes のドキュメントではエージェントモードとも呼ばれます）で Collector を設定する方法を見ていきましょう。

Collector を DaemonSet モードでデプロイすると、ノードごとに 1 つの Collector Pod が配置されます。
Pod 情報を取得するための権限を Collector のサービスアカウントに設定する必要があります。
そのために、必要な権限を持つ `ClusterRole` を作成します。

`k8sattributesprocessor` を動作させるために必要な最小限の権限は次のとおりです。

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: otel-collector
rules:
  - apiGroups: ['']
    resources: ['pods', 'namespaces']
    verbs: ['get', 'watch', 'list']
```

次に、Collector を DaemonSet モードでデプロイします。
Collector がデプロイされているノードに属する Pod のみを取得するフィルターを設定することを推奨します。
大規模なクラスターでは、大量の Pod リストを保持したくないためです。

以下は、このブログでプロセッサーの動作を示すために使用するマニフェストです。

```yaml
apiVersion: opentelemetry.io/v1alpha1
kind: OpenTelemetryCollector
metadata:
  name: otel-collector-daemonset
spec:
  mode: daemonset
  image: ghcr.io/open-telemetry/opentelemetry-collector-releases/opentelemetry-collector-contrib:0.47.0
  serviceAccount: attributes-account
  env:
    - name: KUBE_NODE_NAME
      valueFrom:
        fieldRef:
          apiVersion: v1
          fieldPath: spec.nodeName
  config: |
    receivers:
      jaeger:
          protocols:
              grpc:
              thrift_binary:
              thrift_compact:
              thrift_http:
      otlp:
          protocols:
              grpc:
              http:

    processors:
         k8sattributes:
             filter:
                 node_from_env_var: KUBE_NODE_NAME
    exporters:
      jaeger:
        endpoint: jaeger-all-in-one-collector:14250
        tls:
          insecure: true

    service:
      pipelines:
        traces:
          receivers: [otlp, jaeger]
          processors: [k8sattributes]
          exporters: [jaeger]
```

注目すべき点は、contrib の Collector イメージを使用していることです。
`k8sattributesprocessor` は OpenTelemetry Collector のコアには含まれていませんが、contrib ディストリビューションに含まれています。
その他に注目すべき点は、上記で説明したフィルターと、Pod リストを取得するための権限を含む事前に作成された特定のサービスアカウントの使用です。

次に、マニフェストと [vert.x example app][] をデプロイしてトレースを生成します。

![スパン属性を表示する Jaeger UI](jaeger-k8sattributes.png)

ご覧のとおり、トレースの各スパンに対応する Pod の属性が付与されています。

ネームスペースを `k8sattributesprocessor` のフィルターに追加すると、上記の設定を特定のネームスペースに制限できます。

```yaml
processors:
  k8sattributes:
    filter:
      namespace: my_namespace
```

この方法では、`ClusterRole` のかわりに `Role` を作成でき、Collector のサービスアカウントのスコープを単一のネームスペースに縮小できます。

## Resource detector プロセッサーの使用 {#using-resource-detector-processor}

[最近の変更][pr#832]により、[OpenTelemetry operator][] は Collector コンテナに K8s Pod の属性を含む `OTEL_RESOURCE_ATTRIBUTES` 環境変数を設定するようになりました。
これにより、環境変数の値をスパンに付与する Resource detector プロセッサーを使用できます。
これは Collector がサイドカーモードでデプロイされている場合にのみ動作します。

たとえば、次のマニフェストをデプロイした場合を考えます。

```yaml
apiVersion: opentelemetry.io/v1alpha1
kind: OpenTelemetryCollector
metadata:
  name: sidecar-for-my-app
spec:
  mode: sidecar
  image: ghcr.io/open-telemetry/opentelemetry-collector-releases/opentelemetry-collector-contrib:0.47.0
  config: |
    receivers:
      jaeger:
        protocols:
          grpc:
          thrift_binary:
          thrift_compact:
          thrift_http:
      otlp:
        protocols:
          grpc:
          http:

    processors:
      resourcedetection:
        detectors: [env]
        timeout: 2s
        override: false

    exporters:
      jaeger:
        endpoint: jaeger-all-in-one-collector:14250
        tls:
          insecure: true

    service:
      pipelines:
        traces:
          receivers: [otlp, jaeger]
          processors: [resourcedetection]
          exporters: [jaeger]
```

その後 [vert.x example app][] をデプロイすると、サイドカーコンテナの `OTEL_RESOURCE_ATTRIBUTES` 環境変数にいくつかの値が注入されていることを確認できます。
一部の値は Kubernetes の Downward API を使用して属性の値を取得しています。

以下は環境変数の値の例です。

```yaml
- name: OTEL_RESOURCE_ATTRIBUTES
  value: k8s.deployment.name=dep-vert-x,k8s.deployment.uid=ef3fe26b-a690-4746-9119-d2dbd94b469f,k8s.namespace.name=default,k8s.node.name=$(OTEL_RESOURCE_ATTRIBUTES_NODE_NAME),k8s.pod.name=(OTEL_RESOURCE_ATTRIBUTES_POD_NAME),k8s.pod.uid=$(OTEL_RESOURCE_ATTRIBUTES_POD_UID),k8s.replicasetname=dep-vert-x-59b6f76585,k8s.replicaset.uid=5127bc38-e298-40e1-95df-f4a777e3176c
```

## さらに詳しく {#learn-more}

この記事では、Kubernetes リソースのメタデータをリソース属性として OpenTelemetry トレースに付与するための OpenTelemetry Collector の設定方法を説明しました。
ここで取り上げたシナリオは基本的なものですが、トレースにこの種のメタデータを追加する方法を示しており、より高度なシナリオにこの手法を取り入れることができます。
さまざまなシナリオやプロセッサーの設定オプションについて詳しく知りたい場合は、[K8sattributes processor documentation][k8sattributesprocessor] を参照してください。
サイドカーモードや、エージェントとしての Collector が別の Collector に報告するシナリオなどの情報が記載されています。

## 参考文献 {#references}

- [K8sattributes processor documentation][k8sattributesprocessor]
- [K8sattributes processor RBAC](https://pkg.go.dev/github.com/open-telemetry/opentelemetry-collector-contrib/processor/k8sattributesprocessor#hdr-RBAC)
- [OpenTelemetry Kubernetes attributes](/docs/specs/semconv/resource/k8s)
- [Resource detector processor](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/549e115b28292c164eb671618c0ec8b728b69d2a/processor/resourcedetectionprocessor/README.md?from_branch=main)

[pr#832]: https://github.com/open-telemetry/opentelemetry-operator/pull/832
[opentelemetry operator]: https://github.com/open-telemetry/opentelemetry-operator
[k8sattributesprocessor]: https://pkg.go.dev/github.com/open-telemetry/opentelemetry-collector-contrib/processor/k8sattributesprocessor
[kubernetes resource semantic conventions]: /docs/specs/semconv/resource/k8s
[vert.x example app]: https://github.com/jaegertracing/vertx-create-span
