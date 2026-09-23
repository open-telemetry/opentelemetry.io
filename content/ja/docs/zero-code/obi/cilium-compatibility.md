---
title: OBI と Cilium の互換性
linkTitle: Cilium 互換性
description: OBI を Cilium と並行して実行する際の互換性に関する注意事項
weight: 23
default_lang_commit: fc509b751d6882b99824ea78a1dd8e638dd9055a
---

Cilium は、Kubernetes クラスター向けのネットワーキングとセキュリティを提供するために eBPF を使用する、オープンソースのセキュリティ・ネットワーキング・オブザーバビリティのプラットフォームです。
場合によっては、Cilium と OBI がそれぞれ使用する eBPF プログラムが競合し、問題を引き起こすことがあります。

OBI と Cilium は、eBPF のトラフィック制御クラシファイアプログラム `BPF_PROG_TYPE_SCHED_CLS` を使用します。
これらのプログラムは、カーネルネットワーキングスタックの ingress と egress のデータパスにアタッチされます。
これらは合わさってプログラムのチェーンを形成し、パケットがネットワークスタックを通過する際に、検査したり、場合によっては変更したりすることができます。

OBI のプログラムはパケットのフローを妨げることはありませんが、Cilium はその動作の一環としてパケットフローを変更します。
Cilium が OBI より先にパケットを処理する場合、OBI のパケット処理能力に影響を与える可能性があります。

## アタッチの優先順位 {#attachment-priority}

OBI は、トラフィック制御 (TC) プログラムをアタッチするために、Traffic Control eXpress (TCX) API または Linux カーネルの Netlink インターフェイスを使用します。

TCX は、プログラムを先頭、中間、末尾にアタッチできる新しい API です。
OBI と Cilium は、カーネルが TCX をサポートするかを自動検出し、デフォルトでそれを使用します。

OBI と Cilium が TCX を使用する場合、互いに干渉しません。
OBI は eBPF プログラムをリストの先頭にアタッチし、Cilium は末尾にアタッチします。
TCX は可能な場合に推奨される動作モードです。

## Netlink へのフォールバック {#fallback-to-netlink}

TCX が利用できない場合、OBI と Cilium はどちらも Netlink インターフェイスを使用して eBPF プログラムをインストールします。
OBI が Cilium が優先度 1 でプログラムを実行していることを検出すると、OBI はエラーを表示して終了します。
このエラーは、Cilium が 1 より大きい優先度を使用するように設定することで解決できます。

OBI は、Netlink アタッチメントを使用するように設定されているのに Cilium が TCX を使用していることを検出した場合も、実行を拒否します。

### Cilium の優先度設定 {#ciliums-priority-configuration}

Cilium の優先度は、`bpf.tc.priority` Helm 値または `tc-filter-priority` CLI オプションを使用して設定できます。

```yaml
bpf:
  tc:
    priority: 2
```

これにより、OBI のプログラムは常に Cilium のプログラムより先に実行されます。

## OBI のアタッチメントモードの設定 {#obi-attachment-mode-configuration}

`OTEL_EBPF_BPF_TC_BACKEND` 設定オプションを使用して OBI の TC アタッチメントモードを設定するには、[設定ドキュメント](../configure/options/) を参照してください。

次のことができます。

- 値を `tcx` に設定すると、TCX API を使用します
- 値を `netlink` に設定すると、Netlink インターフェイスを使用します
- 値を `auto` に設定すると、利用可能な最適なオプションを自動検出します

## OBI と Cilium のデモ {#obi-and-cilium-demo}

次の例では、OBI と Cilium が Kubernetes 環境でトレースコンテキストを伝搬するためにどのように連携するかを示します。

### 前提条件 {#prerequisites}

- Cilium がインストールされた Kubernetes クラスター
- クラスターにアクセスするように設定された kubectl
- Helm 3.0 以降

### テストサービスのデプロイ {#deploy-test-services}

次の定義を使用して、同じサービス群をデプロイします。
これらは互いに通信する小さなトイサービスで、OBI がトレースコンテキスト伝搬とともに動作するのを確認できます。

```yaml
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nodejs-service
spec:
  replicas: 1
  selector:
    matchLabels:
      app: nodejs-service
  template:
    metadata:
      labels:
        app: nodejs-service
    spec:
      containers:
        - name: nodejs-service
          image: ghcr.io/open-telemetry/obi-testimg:node-0.1.0
          ports:
            - containerPort: 3030
          env:
            - name: NODEJS_SERVICE_PORT
              value: '3030'
            - name: NODEJS_SERVICE_HOST
              value: '0.0.0.0'
---
apiVersion: v1
kind: Service
metadata:
  name: nodejs-service
spec:
  selector:
    app: nodejs-service
  ports:
    - port: 3030
      targetPort: 3030
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: go-service
spec:
  replicas: 1
  selector:
    matchLabels:
      app: go-service
  template:
    metadata:
      labels:
        app: go-service
    spec:
      containers:
        - name: go-service
          image: ghcr.io/open-telemetry/obi-testimg:go-0.1.0
          ports:
            - containerPort: 8080
          env:
            - name: GO_SERVICE_PORT
              value: '8080'
            - name: GO_SERVICE_HOST
              value: '0.0.0.0'
---
apiVersion: v1
kind: Service
metadata:
  name: go-service
spec:
  selector:
    app: go-service
  ports:
    - port: 8080
      targetPort: 8080
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: python-service
spec:
  replicas: 1
  selector:
    matchLabels:
      app: python-service
  template:
    metadata:
      labels:
        app: python-service
    spec:
      containers:
        - name: python-service
          image: ghcr.io/open-telemetry/obi-testimg:python-0.1.0
          ports:
            - containerPort: 8380
          env:
            - name: PYTHON_SERVICE_PORT
              value: '8380'
            - name: PYTHON_SERVICE_HOST
              value: '0.0.0.0'
---
apiVersion: v1
kind: Service
metadata:
  name: python-service
spec:
  selector:
    app: python-service
  ports:
    - port: 8380
      targetPort: 8380
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ruby-service
spec:
  replicas: 1
  selector:
    matchLabels:
      app: ruby-service
  template:
    metadata:
      labels:
        app: ruby-service
    spec:
      containers:
        - name: ruby-service
          image: ghcr.io/open-telemetry/obi-testimg:rails-0.1.0
          ports:
            - containerPort: 3040
          env:
            - name: RAILS_SERVICE_PORT
              value: '3040'
            - name: RAILS_SERVICE_HOST
              value: '0.0.0.0'
---
apiVersion: v1
kind: Service
metadata:
  name: ruby-service
spec:
  selector:
    app: ruby-service
  ports:
    - port: 3040
      targetPort: 3040
```

### OBI のデプロイ {#deploy-obi}

OBI 用の名前空間を作成します。

```bash
kubectl create namespace obi
```

権限を適用します。

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  namespace: obi
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
    namespace: obi
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: obi
```

OBI をデプロイします。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  namespace: obi
  name: obi-config
data:
  obi-config.yml: |
    attributes:
      kubernetes:
        enable: true
    routes:
      unmatched: heuristic
    # ドキュメントサーバーのみを計装する
    discovery:
      instrument:
        - k8s_deployment_name: "nodejs-service"
        - k8s_deployment_name: "go-service"
        - k8s_deployment_name: "python-service"
        - k8s_deployment_name: "ruby-service"
    trace_printer: text
    ebpf:
      context_propagation: all
      traffic_control_backend: tcx
      disable_blackbox_cp: true
      track_request_headers: true
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
      hostPID: true
      hostNetwork: true
      dnsPolicy: ClusterFirstWithHostNet
      containers:
        - name: obi
          image: otel/ebpf-instrument:main
          securityContext:
            privileged: true
            readOnlyRootFilesystem: true
          volumeMounts:
            - mountPath: /config
              name: obi-config
            - mountPath: /var/run/obi
              name: var-run-obi
          env:
            - name: OTEL_EBPF_CONFIG_PATH
              value: '/config/obi-config.yml'
      volumes:
        - name: obi-config
          configMap:
            name: obi-config
        - name: var-run-obi
          emptyDir: {}
```

ホストにポートをフォワードしてリクエストをトリガーします。

```shell
kubectl port-forward services/nodejs-service 3030:3030 &
curl http://localhost:3030/traceme
```

最後に、OBI Pod のログを確認します。

```shell
for i in `kubectl get pods -n obi -o name | cut -d '/' -f2`; do kubectl logs -n obi $i | grep "GET " | sort; done
```

次のような、OBI がトレースコンテキスト伝搬とともに検出したリクエストを示す出力が表示されるはずです。

```text
2025-01-17 21:42:18.11794218 (5.045099ms[5.045099ms]) HTTPClient 200 GET /tracemetoo [10.244.1.92 as go-service.default:37450]->[10.96.214.17 as python-service.default:8080] size:0B svc=[default/go-service go] traceparent=[00-14f07e11b5e57f14fd2da0541f0ddc2f-319fb03373427a41[cfa6d5d448e40b00]-01]
2025-01-17 21:42:18.11794218 (5.284521ms[5.164701ms]) HTTP 200 GET /gotracemetoo [10.244.2.144 as nodejs-service.default:57814]->[10.244.1.92 as go-service.default:8080] size:0B svc=[default/go-service go] traceparent=[00-14f07e11b5e57f14fd2da0541f0ddc2f-cfa6d5d448e40b00[cce1e6b5e932b89a]-01]
2025-01-17 21:42:18.11794218 (1.934744ms[1.934744ms]) HTTP 403 GET /users [10.244.2.32 as ruby-service.default:46876]->[10.244.2.176 as ruby-service.default:3000] size:222B svc=[default/ruby-service ruby] traceparent=[00-14f07e11b5e57f14fd2da0541f0ddc2f-57d77d99e9665c54[3d97d26b0051112b]-01]
2025-01-17 21:42:18.11794218 (2.116628ms[2.116628ms]) HTTPClient 403 GET /users [10.244.2.32 as ruby-service.default:46876]->[10.96.69.89 as ruby-service.default:3000] size:256B svc=[default/ruby-service ruby] traceparent=[00-14f07e11b5e57f14fd2da0541f0ddc2f-ff48ab147cc92f93[2770ac4619aa0042]-01]
2025-01-17 21:42:18.11794218 (4.281525ms[4.281525ms]) HTTP 200 GET /tracemetoo [10.244.1.92 as go-service.default:37450]->[10.244.2.32 as ruby-service.default:8080] size:178B svc=[default/ruby-service ruby] traceparent=[00-14f07e11b5e57f14fd2da0541f0ddc2f-2770ac4619aa0042[319fb03373427a41]-01]
2025-01-17 21:42:18.11794218 (5.391191ms[5.391191ms]) HTTPClient 200 GET /gotracemetoo [10.244.2.144 as nodejs-service.default:57814]->[10.96.134.167 as go-service.default:8080] size:256B svc=[default/nodejs-service nodejs] traceparent=[00-14f07e11b5e57f14fd2da0541f0ddc2f-202ee68205e4ef3b[9408610968fa20f8]-01]
2025-01-17 21:42:18.11794218 (6.939027ms[6.939027ms]) HTTP 200 GET /traceme [127.0.0.1 as 127.0.0.1:44720]->[127.0.0.1 as 127.0.0.1.default:3000] size:86B svc=[default/nodejs-service nodejs] traceparent=[00-14f07e11b5e57f14fd2da0541f0ddc2f-9408610968fa20f8[0000000000000000]-01]
```
