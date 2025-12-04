---
title: KubernetesにOBIをデプロイする
linkTitle: Kubernetes
description: KubernetesにOBIをデプロイする方法を学びます。
weight: 3
default_lang_commit: 19ca575e83b5d058ed02dea12c7c6770b477aa71
drifted_from_default: true
# prettier-ignore
cSpell:ignore: cap_perfmon containerd goblog kubeadm microk8s replicaset statefulset
---

{{% alert type="note" %}}

このドキュメントでは、必要なエンティティをすべて自分で設定して、KubernetesにOBIを手動でデプロイする方法について説明します。

<!-- Helmを使用してKubernetesにOBIをデプロイする](../kubernetes-helm/)ドキュメントを参照することをお勧めします。 -->

{{% /alert %}}

## Kubernetesメタデータデコレーションを構成する {#configuring-kubernetes-metadata-decoration}

OBIは、次のKubernetesラベルでトレースをデコレートできます。

- `k8s.namespace.name`
- `k8s.deployment.name`
- `k8s.statefulset.name`
- `k8s.replicaset.name`
- `k8s.daemonset.name`
- `k8s.node.name`
- `k8s.pod.name`
- `k8s.container.name`
- `k8s.pod.uid`
- `k8s.pod.start_time`
- `k8s.cluster.name`

メタデータデコレーションを有効化するには、次のことが必要です。

- ServiceAccountを作成し、PodとReplicaSetの両方に対してlistとwatchの権限を付与するClusterRoleをバインドします。
  以下の例のファイルをデプロイすることで実行できます。

  ```yaml
  apiVersion: v1
  kind: ServiceAccount
  metadata:
    name: obi
  ---
  apiVersion: rbac.authorization.k8s.io/v1
  kind: ClusterRole
  metadata:
    name: obi
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
    name: obi
  subjects:
    - kind: ServiceAccount
      name: obi
      namespace: default
  roleRef:
    apiGroup: rbac.authorization.k8s.io
    kind: ClusterRole
    name: obi
  ```

  (OBIを別の名前空間にデプロイしている場合は、`namespace: default` の値を変更する必要があります)

- `OTEL_EBPF_KUBE_METADATA_ENABLE=true` 環境変数、または `attributes.kubernetes.enable: true` YAML構成を使用してOBIを構成します。

- (後述のデプロイメント例で示すように) OBIのPodで `serviceAccountName: obi` プロパティを指定することを忘れないでください。

オプションとして、YAML構成ファイルの `discovery -> instrument` セクションで、計装するKubernetesサービスを選択します。
詳細については、[構成ドキュメント](../../configure/options/)の _サービスディスカバリー_ セクション、およびこのページの[外部構成ファイルの提供](#providing-an-external-configuration-file)セクションを参照してください。

## OBIをデプロイする {#deploying-obi}

Kubernetesには、2つの異なる方法でOBIをデプロイできます。

- サイドカーコンテナとして
- DaemonSetとして

### OBIをサイドカーコンテナとしてデプロイする {#deploying-obi-as-a-sidecar-container}

こちらは、すべてのホストにデプロイされていない可能性のある特定のサービスを監視したい場合にOBIをデプロイする方法であり、各サービスインスタンスごとに1つのOBIインスタンスをデプロイする必要があります。

サイドカーコンテナとしてOBIをデプロイするには、次の構成要件があります。

- プロセスの名前異空間はPod内のすべてのコンテナで共有されている必要があります(Podの `shareProcessNamespace: true` 変数)。
- 自動計装コンテナは、特権モード(コンテナ構成の`securityContext.privileged:true` プロパティ)で実行する必要があります。
  - 一部のKubernetesインストールでは次の `securityContext` 構成が許可されますが、一部のコンテナランタイム構成ではコンテナを制限して一部の権限を削除するため、すべてのコンテナランタイム構成で機能するとは限りません。

    ```yaml
    securityContext:
      runAsUser: 0
      capabilities:
        add:
          - SYS_ADMIN
          - SYS_RESOURCE # カーネル 5.11+では不要
    ```

以下の例では、OBIをコンテナ(`otel/ebpf-instrument:latest` で利用可能なイメージ)としてアタッチすることで `goblog` Podを計装します。
自動計装ツールは、同じ名前空間の `otelcol` サービスの背後にあるアクセス可能なOpenTelemetryコレクターにメトリクスとトレースを転送するように構成されています。

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: goblog
  labels:
    app: goblog
spec:
  replicas: 2
  selector:
    matchLabels:
      app: goblog
  template:
    metadata:
      labels:
        app: goblog
    spec:
      # サイドカー計装ツールがサービスプロセスにアクセスできるようにするために必要
      shareProcessNamespace: true
      serviceAccountName: obi # Kubernetesメタデータデコレーションが必要な場合
      containers:
        # 計装されたサービスのコンテナ
        - name: goblog
          image: mariomac/goblog:dev
          imagePullPolicy: IfNotPresent
          command: ['/goblog']
          ports:
            - containerPort: 8443
              name: https
        # OBIのサイドカーコンテナ - eBPF自動計装ツール
        - name: obi
          image: otel/ebpf-instrument:latest
          securityContext: # eBPFプローブのインストールには特権が必要
            privileged: true
          env:
            # goblogアプリケーションコンテナの内部ポート
            - name: OTEL_EBPF_OPEN_PORT
              value: '8443'
            - name: OTEL_EXPORTER_OTLP_ENDPOINT
              value: 'http://otelcol:4318'
              # Kubernetesメタデータデコレーションが必要な場合
            - name: OTEL_EBPF_KUBE_METADATA_ENABLE
              value: 'true'
```

異なる構成オプションの詳細については、このドキュメントの[構成](../../configure/options/)セクションを確認してください。

### OBIをDaemonSetとしてデプロイする {#deploying-obi-as-a-daemonset}

DaemonSetとしてOBIをデプロイすることもできます。
この方法は以下の場合に推奨されます。

- DaemonSetを計装したい
- 単一のOBIインスタンスから複数のプロセス、またはクラスタ内のすべてのプロセスを計装したい

前述の(`goblog` Pod)の例では、公開しているポートがPodに内部的なものであるため、そのポートを使用して計装するプロセスを選択できません。
同時に、サービスの複数のインスタンスは異なるポートを公開しています。
この場合、アプリケーションサービスの実行可能ファイルの名前を使用して計装する必要があります(後の例を参照)。

サイドカーシナリオの特権要件に加えて、同じホスト上で実行されているすべてのプロセスにアクセスできるように、`hostPID: true` オプションを有効化して自動計装のPodテンプレートを構成する必要があります。

```yaml
---
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: obi
  labels:
    app: obi
spec:
  selector:
    matchLabels:
      app: obi
  template:
    metadata:
      labels:
        app: obi
    spec:
      hostPID: true # ホスト上のプロセスにアクセスするために必要
      serviceAccountName: obi # Kubernetesメタデータデコレーションが必要な場合
      containers:
        - name: autoinstrument
          image: otel/ebpf-instrument:latest
          securityContext:
            privileged: true
          env:
            # OTEL_EBPF_OPEN_PORT のかわりに実行可能ファイルの名前で選択
            - name: OTEL_EBPF_AUTO_TARGET_EXE
              value: '*/goblog'
            - name: OTEL_EXPORTER_OTLP_ENDPOINT
              value: 'http://otelcol:4318'
              # Kubernetesメタデータデコレーションが必要な場合
            - name: OTEL_EBPF_KUBE_METADATA_ENABLE
              value: 'true'
```

### OBIを非特権でデプロイする {#deploying-obi-unprivileged}

ここまでのすべての例では、OBIデプロイメントの `securityContext` セクションで `privileged:true` またはLinuxの `SYS_ADMIN` ケーパビリティが使用されていました。
これはあらゆる状況で機能しますが、セキュリティ構成で必要な場合は、権限を制限してKubernetesにOBIをデプロイする方法もあります。
これが可能かどうかは、使用しているKubernetesバージョンと基盤となるコンテナランタイム(例、**Containerd**、**CRI-O**、**Docker**)によります。

次のガイドは、主に `GKE`、`kubeadm`、`k3s`、`microk8s`、および `kind` で `containerd` を実行して行ったテストに基づいています。

OBIを非特権で実行するには、`privileged:true` 設定をLinuxの[ケーパビリティ](https://www.man7.org/linux/man-pages/man7/capabilities.7.html)に置き換える必要があります。
OBIに必要なケーパビリティの包括的なリストは、[セキュリティ、権限、およびケーパビリティ](../../security/)で確認できます。

**Note** BPFプログラムのロードには、OBIがLinuxのパフォーマンスイベントを読み取るか、少なくともLinuxカーネルAPI `perf_event_open()` を実行できる必要があります。

この権限は、`CAP_PERFMON` またはより広範囲に `CAP_SYS_ADMIN` によって付与されます。
`CAP_PERFMON` および `CAP_SYS_ADMIN` はいずれもOBIにパフォーマンスイベントを読み取る権限を付与するため、より少ない権限で済む`CAP_PERFMON` を使用することを推奨します。
ただし、システムレベルでは、パフォーマンスイベントへのアクセスは `kernel.perf_event_paranoid` 設定によって制限され、`sysctl` を使用するか `/proc/sys/kernel/perf_event_paranoid` ファイルを変更することで読み書きできます。
`kernel.perf_event_paranoid` のデフォルト設定は通常 `2` であり、これは[カーネルのドキュメント](https://www.kernel.org/doc/Documentation/sysctl/kernel.txt)の `perf_event_paranoid` セクションで説明されています。
一部のLinuxディストリビューションでは、`kernel.perf_event_paranoid` に対してより高いレベルを定義しています。
たとえばDebianベースのディストリビューションでは、 `kernel.perf_event_paranoid=3` も使用しており、これにより `CAP_SYS_ADMIN` なしでの `perf_event_open()` へのアクセスは拒否されます。
`kernel.perf_event_paranoid` 設定が `2` より高いディストリビューションで実行している場合は、構成を変更して `2` に下げるか、`CAP_PERFMON` のかわりに `CAP_SYS_ADMIN` を使用できます。

OBIの非特権コンテナ構成の例を以下に示します。

```yaml
...
---
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: obi
  namespace: obi-demo
  labels:
    k8s-app: obi
spec:
  selector:
    matchLabels:
      k8s-app: obi
  template:
    metadata:
      labels:
        k8s-app: obi
    spec:
      serviceAccount: obi
      hostPID: true           # <-- 重要。DeamonSetモードではOBIがすべての監視対象プロセスを検出できるようにするために必要
      containers:
      - name: obi
        terminationMessagePolicy: FallbackToLogsOnError
        image: otel/ebpf-instrument:latest
        env:
          - name: OTEL_EBPF_TRACE_PRINTER
            value: "text"
          - name: OTEL_EBPF_KUBE_METADATA_ENABLE
            value: "autodetect"
          - name: KUBE_NAMESPACE
            valueFrom:
              fieldRef:
                fieldPath: metadata.namespace
          ...
        securityContext:
          runAsUser: 0
          readOnlyRootFilesystem: true
          capabilities:
            add:
              - BPF                 # <-- 重要。ほとんどのeBPFプローブが正しく機能するために必要。
              - SYS_PTRACE          # <-- 重要。OBIがコンテナの名前空間にアクセスして実行可能ファイルを検査することを許可。
              - NET_RAW             # <-- 重要。OBIがHTTPリクエストのソケットフィルターを使用することを許可。
              - CHECKPOINT_RESTORE  # <-- 重要。OBIがELFファイルを開くことを許可。
              - DAC_READ_SEARCH     # <-- 重要。OBIがELFファイルを開くことを許可。
              - PERFMON             # <-- 重要。OBIがBPFプログラムをロードすることを許可。
              #- SYS_RESOURCE       # <-- 5.11より前のバージョンのみ。OBIがロックされたメモリの量を増やすことを許可。
              #- SYS_ADMIN          # <-- Goアプリケーションのトレースコンテキスト伝搬、またはDebianディストリビューションで
            drop:
              - ALL
        volumeMounts:
        - name: var-run-obi
          mountPath: /var/run/obi
        - name: cgroup
          mountPath: /sys/fs/cgroup
      tolerations:
      - effect: NoSchedule
        operator: Exists
      - effect: NoExecute
        operator: Exists
      volumes:
      - name: var-run-obi
        emptyDir: {}
      - name: cgroup
        hostPath:
          path: /sys/fs/cgroup
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: some-service
  namespace: obi-demo
  ...
---
```

## 外部構成ファイルの提供 {#providing-an-external-configuration-file}

前述の例では、OBIは環境変数を介して構成されていました。
しかし、(このページの[構成](../../configure/options/)セクションのドキュメントのように)外部のYAMLファイルを介して構成することもできます。

構成をファイルとして提供するには、意図した構成のCOnfigMapをデプロイし、そのConfigMapをOBI Podにマウントし、`OTEL_EBPF_CONFIG_PATH` 環境変数で参照する方法が推奨されています。

OBIのYAMLドキュメントを使用したConfigMapの例です。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: obi-config
data:
  obi-config.yml: |
    trace_printer: text
    otel_traces_export:
      endpoint: http://otelcol:4317
      sampler:
        name: parentbased_traceidratio
        arg: "0.01"
    routes:
      patterns:
        - /factorial/{num}
```

前述のConfigMapをマウントしてアクセスするOBI DaemonSet構成の例です。

```yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
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
      hostPID: true # 重要！
      containers:
        - name: obi
          image: otel/ebpf-instrument:latest
          imagePullPolicy: IfNotPresent
          securityContext:
            privileged: true
            readOnlyRootFilesystem: true
          # 前述のConfigMapをフォルダとしてマウント
          volumeMounts:
            - mountPath: /config
              name: obi-config
            - mountPath: /var/run/obi
              name: var-run-obi
          env:
            # OBIに構成ファイルの場所を伝える
            - name: OTEL_EBPF_CONFIG_PATH
              value: '/config/obi-config.yml'
      volumes:
        - name: obi-config
          configMap:
            name: obi-config
        - name: var-run-obi
          emptyDir: {}
```

## 秘密情報の提供 {#providing-secret-configuration}

前述の例は通常の構成では有効ですが、パスワードやAPIキーなどの秘密情報を渡すためには使用しないでください。

秘密情報を提供するには、Kubernetes Secretをデプロイすることを推奨します。
たとえば、以下のSecretは架空のOpenTelemetryコレクターの認証情報を含んでいます。

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: otelcol-secret
type: Opaque
stringData:
  headers: 'Authorization=Bearer Z2hwX0l4Y29QOWhr....ScQo='
```

これにより、環境変数として秘密情報の値にアクセスできます。
前述のDeamonSetの例を用いて、OBIコンテナに次の `env` セクションを追加することで実現できます。

```yaml
env:
  - name: OTEL_EXPORTER_OTLP_HEADERS
    valueFrom:
      secretKeyRef:
        key: otelcol-secret
        name: headers
```
