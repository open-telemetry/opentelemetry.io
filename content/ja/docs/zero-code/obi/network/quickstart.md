---
title: OBI ネットワークメトリクスのクイックスタート
linkTitle: クイックスタート
description: OpenTelemetry eBPF 計装からネットワークメトリクスを生成するためのクイックスタートガイド
weight: 1
default_lang_commit: fc509b751d6882b99824ea78a1dd8e638dd9055a
---

OBI は、あらゆる環境（物理ホスト、仮想ホスト、コンテナ）でネットワークメトリクスを生成できます。
OBI は送信元および送信先の Kubernetes エンティティのメタデータで各メトリクスを装飾できるため、Kubernetes 環境の使用が推奨されます。

このクイックスタートガイドの手順は、`kubectl` コマンドラインユーティリティを使用して直接 Kubernetes にデプロイすることに焦点を当てています。
このチュートリアルでは、OBI を Kubernetes にゼロからデプロイする方法を説明します。
Helm を使用する場合は、[Helm を使用した Kubernetes への OBI のデプロイ](../../setup/kubernetes-helm/) ドキュメントを参照してください。

## ネットワークメトリクスを有効化して OBI をデプロイする {#deploy-obi-with-network-metrics}

ネットワークメトリクスを有効化するには、OBI の設定で次のオプションを指定します。

環境変数:

```bash
export OTEL_EBPF_NETWORK_METRICS=true
```

ネットワークメトリクスでは、メトリクスを Kubernetes メタデータで装飾する必要があります。
この機能を有効化するには、OBI の設定で次のオプションを指定します。

環境変数:

```bash
export OTEL_EBPF_KUBE_METADATA_ENABLE=true
```

その他の設定オプションについては、[OBI 設定オプション](../../configure/options/) を参照してください。

OBI の設定の詳細については、[OBI 設定ドキュメント](../../configure/options/) を参照してください。

## シンプルなセットアップ {#simple-setup}

### OBI をデプロイする {#deploy-obi}

次の YAML 設定は、ネットワークメトリクス用のシンプルな OBI デプロイメントを提供します。

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  namespace: obi
  name: obi
---
apiVersion: v1
kind: ConfigMap
metadata:
  namespace: obi
  name: obi-config
data:
  obi-config.yml: |
    network:
      enable: true
    attributes:
      kubernetes:
        enable: true
---
apiVersion: apps/v1
kind: DaemonSet
metadata:
  namespace: obi
  name: obi
spec:
  selector:
    matchLabels:
      instrumentation: obi
  template:
    metadata:
      labels:
        instrumentation: obi
    spec:
      serviceAccountName: obi
      hostNetwork: true
      dnsPolicy: ClusterFirstWithHostNet
      containers:
        - name: obi-config
          configMap:
            name: obi-config
        - name: obi
          image: otel/ebpf-instrument:main
          securityContext:
            privileged: true
          volumeMounts:
            - mountPath: /config
              name: obi-config
          env:
            - name: OTEL_EBPF_CONFIG_PATH
              value: '/config/obi-config.yml'
```

この設定に関するいくつかの観察点:

- コンテナイメージは、開発中の最新版 `otel/ebpf-instrument:main` イメージを使用しています。
- OBI はノードごとに 1 つの OBI インスタンスしか必要としないため、DaemonSet として実行する必要があります。
- ホスト上のネットワークパケットをリッスンするには、OBI には `hostNetwork: true` 権限が必要です。

### ネットワークメトリクスの生成を検証する {#verify-network-metrics-generation}

すべてが期待どおりに動作していれば、OBI インスタンスはネットワークフローをキャプチャして処理しているはずです。
これをテストするには、OBI DaemonSet のログを確認して、いくつかのデバッグ情報が出力されているかを確認します。

```bash
kubectl logs daemonset/obi -n obi | head
```

出力は次のような形になります。

```text
network_flow: obi.ip=172.18.0.2 iface= direction=255 src.address=10.244.0.4 dst.address=10.96.0.1
```

### OpenTelemetry エンドポイントにメトリクスをエクスポートする {#export-metrics-to-opentelemetry-endpoint}

ネットワークメトリクスが収集されていることを確認したら、OpenTelemetry 形式でメトリクスを Collector エンドポイントにエクスポートするように OBI を設定します。

OpenTelemetry エクスポーターを設定するには、[データエクスポートドキュメント](/docs/zero-code/obi/configure/export-data#opentelemetry-metrics-exporter-component) を参照してください。

### 許可された属性 {#allowed-attributes}

デフォルトでは、OBI は `obi.network.flow.bytes` メトリクスに次の [属性](./) を含めます。

- `k8s.src.owner.name`
- `k8s.src.namespace`
- `k8s.dst.owner.name`
- `k8s.dst.namespace`
- `k8s.cluster.name`

OBI は、カーディナリティ爆発を引き起こさないように、利用可能な属性のサブセットのみを含めます。

たとえば次のとおりです。

```yaml
network:
  allowed_attributes:
    - k8s.src.owner.name
    - k8s.src.owner.type
    - k8s.dst.owner.name
    - k8s.dst.owner.type
```

これに対応する Prometheus メトリクスは次のようになります。

```text
obi.network.flow.bytes:
  k8s_src_owner_name="frontend"
  k8s_src_owner_type="deployment"
  k8s_dst_owner_name="backend"
  k8s_dst_owner_type="deployment"
```

上記の例では、`obi.network.flow.bytes` の値を個別の Pod 名ではなく、送信元と送信先の Kubernetes オーナー名およびタイプで集計します。

## CIDR の設定 {#cidr-configuration}

CIDR レンジによってメトリクスを分類するように OBI を設定することもできます。
これは、クラウドプロバイダーの IP レンジや内部/外部トラフィックなど、特定のネットワークレンジへのトラフィックを追跡する場合に有用です。

`network` 配下の `cidrs` YAML サブセクション（または環境変数 `OTEL_EBPF_NETWORK_CIDRS`）は、CIDR レンジとそれに対応する名前のリストを受け付けます。

たとえば、定義済みのネットワークごとにメトリクスを追跡するには次のように設定します。

```yaml
network:
  cidrs:
    - cidr: 10.0.0.0/8
      name: 'cluster-internal'
    - cidr: 192.168.0.0/16
      name: 'private'
    - cidr: 172.16.0.0/12
      name: 'container-internal'
```

これに対応する Prometheus メトリクスは次のようになります。

```text
obi_network_flow_bytes:
  src_cidr="cluster-internal"
  dst_cidr="private"
```
