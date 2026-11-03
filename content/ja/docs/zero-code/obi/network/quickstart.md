---
title: OBI ネットワークメトリクスのクイックスタート
linkTitle: クイックスタート
description: OpenTelemetry eBPF 計装からネットワークメトリクスを生成するためのクイックスタートガイド
weight: 1
default_lang_commit: 9d1c87cdbe98ce2dde3e417bd2f6d965d0f08ae3
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
export OTEL_EBPF_METRICS_FEATURES=network
```

Kubernetes メタデータはオプションですが、ネットワークメトリクスにワークロードラベルを付与できます。
有効化するには次のように設定します。

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
kind: Namespace
metadata:
  name: obi
---
apiVersion: v1
kind: ServiceAccount
metadata:
  namespace: obi
  name: obi
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: obi-network
rules:
  - apiGroups: ['apps']
    resources: ['replicasets']
    verbs: ['list', 'watch']
  - apiGroups: ['']
    resources: ['pods', 'services', 'nodes']
    verbs: ['list', 'watch']
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: obi-network
subjects:
  - kind: ServiceAccount
    name: obi
    namespace: obi
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: obi-network
---
apiVersion: v1
kind: ConfigMap
metadata:
  namespace: obi
  name: obi-config
data:
  obi-config.yml: |
    metrics:
      features: [network]
    network:
      print_flows: true
    attributes:
      kubernetes:
        enable: 'true'
    prometheus_export:
      port: 9090
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
        - name: obi
          image: otel/ebpf-instrument:v0.15.2
          securityContext:
            privileged: true
          volumeMounts:
            - mountPath: /config
              name: obi-config
          env:
            - name: OTEL_EBPF_CONFIG_PATH
              value: '/config/obi-config.yml'
      volumes:
        - name: obi-config
          configMap:
            name: obi-config
```

マニフェストを `obi-network.yml` として保存し、適用します。

```sh
kubectl apply -f obi-network.yml
```

この設定の要点は次のとおりです。

- v0.15.2 リリースイメージを使用し、ノードごとに1つの OBI Pod を配置します。
- ワークロードラベル用に Kubernetes メタデータへの読み取りアクセスを許可します。
- `hostNetwork: true` を使用してホストネットワークインターフェイスを監視します。
- Prometheus メトリクスをポート9090で公開し、以下の検証ステップ用にフローを出力します。
  検証後にログ出力が不要な場合は `network.print_flows` を無効化してください。

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

- `direction`
- `k8s.src.owner.name`
- `k8s.src.owner.type`
- `k8s.src.namespace`
- `k8s.dst.owner.name`
- `k8s.dst.owner.type`
- `k8s.dst.namespace`
- `k8s.cluster.name`

Kubernetes 属性には Kubernetes メタデータが必要です。
OBI は、カーディナリティ爆発を引き起こさないように、利用可能な属性のサブセットのみを含めます。

たとえば、デフォルトの `direction`、名前空間、クラスターラベルを除外し、オーナー名とタイプのみを報告するには次のように設定します。

```yaml
attributes:
  select:
    obi_network_flow_bytes:
      include:
        - k8s.src.owner.name
        - k8s.src.owner.type
        - k8s.dst.owner.name
        - k8s.dst.owner.type
```

これに対応する Prometheus メトリクスは次のようになります。

```text
obi_network_flow_bytes_total:
  k8s_src_owner_name="frontend"
  k8s_src_owner_type="deployment"
  k8s_dst_owner_name="backend"
  k8s_dst_owner_type="deployment"
```

上記の例では、`obi.network.flow.bytes` の値を送信元と送信先の Kubernetes オーナー名およびタイプで集計します。

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
obi_network_flow_bytes_total:
  src_cidr="cluster-internal"
  dst_cidr="private"
```
