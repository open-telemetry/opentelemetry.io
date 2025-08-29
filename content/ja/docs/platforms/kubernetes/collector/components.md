---
title: Kubernetesのための重要なコンポーネント
linkTitle: コンポーネント
default_lang_commit: 9b427bf25703c33a2c6e05c2a7b58e0f768f7bad
# prettier-ignore
cSpell:ignore: alertmanagers filelog horizontalpodautoscalers hostfs hostmetrics k8sattributes kubelet kubeletstats replicasets replicationcontrollers resourcequotas statefulsets varlibdockercontainers varlogpods
---

[OpenTelemetry Collector](/docs/collector/)は、Kubernetesの監視を容易にするために、多くの異なるレシーバーとプロセッサーをサポートしています。
このセクションでは、Kubernetesのデータを収集し、それを拡張するためにもっとも重要なコンポーネントを取り上げます。

このページで取り上げているコンポーネントは以下の通りです。

- [Kubernetes属性プロセッサー](#kubernetes-attributes-processor): 受信するアプリケーションのテレメトリーにKubernetesメタデータを追加します。
- [Kubeletstatsレシーバー](#kubeletstats-receiver): Kubelet上のAPIサーバーからノード、ポッド、コンテナのメトリクスを取得します。
- [ファイルログレシーバー](#filelog-receiver): 標準出力／標準エラーに書き込まれたKubernetesログとアプリケーションログを収集します。
- [Kubernetesクラスターレシーバー](#kubernetes-cluster-receiver): クラスタレベルのメトリクスとエンティティイベントを収集します。
- [Kubernetesオブジェクトレシーバー](#kubernetes-objects-receiver): Kubernetes APIサーバーからイベントなどのオブジェクトを収集します。
- [Prometheusレシーバー](#prometheus-receiver): [Prometheus](https://prometheus.io/)フォーマットのメトリクスを受信します。
- [ホストメトリクスレシーバー](#host-metrics-receiver): Kubernetesノードからホストメトリクスをスクレイピングします。

アプリケーションのトレース、メトリクス、またはログの場合は、[OTLPレシーバー](https://github.com/open-telemetry/opentelemetry-collector/tree/main/receiver/otlpreceiver) をおすすめしますが、データに合ったレシーバーであれば何でも構いません。

## Kubernetes属性プロセッサー (Kubernetes Attributes Processor) {#kubernetes-attributes-processor}

| デプロイメントパターン      | 利用可能 |
| --------------------------- | -------- |
| DaemonSet （エージェント）  | Yes      |
| Deployment （ゲートウェイ） | Yes      |
| サイドカー                  | No       |

Kubernetes属性プロセッサーは、Kubernetesポッドを自動的に検出し、そのメタデータを抽出し、抽出したメタデータをリソース属性としてスパン、メトリクス、ログに追加します。

**Kubernetes属性プロセッサーは、Kubernetesで動作するコレクターにとってもっとも重要なコンポーネントの1つです。アプリケーションデータを受信するコレクターは、これを使用すべきです。**
Kubernetes属性プロセッサーはテレメトリーにKubernetesのコンテキストを追加するため、アプリケーションのトレース、メトリクス、ログのシグナルをポッドのメトリクスやトレースなどのKubernetesテレメトリーと関連付けることができます。

Kubernetes属性プロセッサーは、Kubernetes APIを使用してクラスタ内で実行されているすべてのポッドを検出し、それらのIPアドレス、ポッドのUID、および興味深いメタデータの記録を保持します。
デフォルトでは、プロセッサーを通過するデータは、受信リクエストのIPアドレスを介してポッドに関連付けられますが、異なるルールを設定することもできます。
プロセッサーはKubernetes APIを使用するため、特別なパーミッションが必要です（以下の例を参照）。 [OpenTelemetryコレクターHelmチャート](/docs/platforms/kubernetes/helm/collector/) を使っている場合は、[`kubernetesAttributes` preset](/docs/platforms/kubernetes/helm/collector/#kubernetes-attributes-preset) を使って開始できます。

デフォルトでは以下の属性が追加されます。

- `k8s.namespace.name`
- `k8s.pod.name`
- `k8s.pod.uid`
- `k8s.pod.start_time`
- `k8s.deployment.name`
- `k8s.node.name`

Kubernetes属性プロセッサーは、ポッドと名前空間に追加したKubernetesラベルとKubernetesアノテーションを使用して、トレース、メトリクス、ログのカスタムリソース属性を設定することもできます。

```yaml
k8sattributes:
  auth_type: 'serviceAccount'
  extract:
    metadata: # ポッドから抽出
      - k8s.namespace.name
      - k8s.pod.name
      - k8s.pod.start_time
      - k8s.pod.uid
      - k8s.deployment.name
      - k8s.node.name
    annotations:
      # キー `annotation-one` を持つポッドアノテーションの値を取り出し、キー `a1` を持つリソース属性として挿入します。
      - tag_name: a1
        key: annotation-one
        from: pod
      # キー `annotation-two` を持つ名前空間アノテーションの値を正規表現で抽出し、キー `a2` を持つリソースに挿入します。
      - tag_name: a2
        key: annotation-two
        regex: field=(?P<value>.+)
        from: namespace
    labels:
      # キー `label1` を持つ名前空間ラベルの値を取り出し、キー `l1` を持つリソース属性として挿入します。
      - tag_name: l1
        key: label1
        from: namespace
      # キー `label2` を持つポッドラベルの値を正規表現で抽出し、キー `l2` を持つリソース属性として挿入します。
      - tag_name: l2
        key: label2
        regex: field=(?P<value>.+)
        from: pod
  pod_association: # データをポッドに関連付ける方法（順序が重要）
    - sources: # まず、リソース属性k8s.pod.ipの値を使用してみます。
        - from: resource_attribute
          name: k8s.pod.ip
    - sources: # 次に、リソース属性k8s.pod.uidの値を使用してみます。
        - from: resource_attribute
          name: k8s.pod.uid
    - sources: # どちらもうまくいかない場合は、リクエストのコネクションを使ってポッドのIPを取得します。
        - from: connection
```

コレクターが Kubernetes DaemonSet (エージェント) または Kubernetes Deployment (ゲートウェイ) としてデプロイされる場合の特別な設定オプションもあります。
詳細は[デプロイメントシナリオ](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/k8sattributesprocessor#deployment-scenarios)を参照してください。

Kubernetes属性プロセッサーの設定の詳細については、[Kubernetes Attributes Processor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/k8sattributesprocessor)を参照してください。

プロセッサーはKubernetes APIを使用するため、正しく動作するには適切なパーミッションが必要です。
ほとんどのユースケースでは、コレクターを実行するサービスアカウントにClusterRoleを介して以下の権限を与える必要があります。

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: collector
  namespace: <OTEL_COL_NAMESPACE>
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: otel-collector
rules:
  - apiGroups:
      - ''
    resources:
      - 'pods'
      - 'namespaces'
    verbs:
      - 'get'
      - 'watch'
      - 'list'
  - apiGroups:
      - 'apps'
    resources:
      - 'replicasets'
    verbs:
      - 'get'
      - 'list'
      - 'watch'
  - apiGroups:
      - 'extensions'
    resources:
      - 'replicasets'
    verbs:
      - 'get'
      - 'list'
      - 'watch'
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: otel-collector
subjects:
  - kind: ServiceAccount
    name: collector
    namespace: <OTEL_COL_NAMESPACE>
roleRef:
  kind: ClusterRole
  name: otel-collector
  apiGroup: rbac.authorization.k8s.io
```

## Kubeletstatsレシーバー (Kubeletstats Receiver) {#kubeletstats-receiver}

| デプロイメントパターン      | 利用可能                                                     |
| --------------------------- | ------------------------------------------------------------ |
| DaemonSet （エージェント）  | 推奨                                                         |
| Deployment （ゲートウェイ） | Yes ただし、デプロイされたノードからのみメトリクスを収集する |
| サイドカー                  | No                                                           |

各Kubernetesノードは、APIサーバーを含むkubeletを実行します。
KubeletstatsレシーバーはAPIサーバーを介してそのkubeletに接続し、ノードとノード上で実行されているワークロードに関するメトリクスを収集します。

認証にはさまざまな方法がありますが、通常はサービスアカウントが使用されます。
サービスアカウントは、Kubeletからデータをプルするための適切なパーミッションも必要となります（下記参照）。
[OpenTelemetryコレクターHelmチャート](/docs/platforms/kubernetes/helm/collector/) を使用している場合は、[`kubeletMetrics` preset](/docs/platforms/kubernetes/helm/collector/#kubelet-metrics-preset) を使用して開始できます。

デフォルトでは、メトリクスはポッドとノードに対して収集されますが、コンテナとボリュームのメトリクスも収集するようにレシーバーを設定できます。
レシーバーでは、メトリクスを収集する頻度も設定できます。

```yaml
receivers:
  kubeletstats:
    collection_interval: 10s
    auth_type: 'serviceAccount'
    endpoint: '${env:K8S_NODE_NAME}:10250'
    insecure_skip_verify: true
    metric_groups:
      - node
      - pod
      - container
```

収集されるメトリクスの具体的な詳細については、[デフォルトメトリクス](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/receiver/kubeletstatsreceiver/documentation.md)を参照してください。
具体的な設定の詳細については、[Kubeletstatsレシーバーのドキュメント](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/receiver/kubeletstatsreceiver)を参照してください。

プロセッサーはKubernetes APIを使用するため、正しく動作するには適切なパーミッションが必要です。
ほとんどのユースケースでは、コレクターを実行しているサービスアカウントにClusterRoleを介して以下の権限を与える必要があります。

```yaml
---
apiVersion: v1
kind: ServiceAccount
metadata:
  name: otel-collector
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: otel-collector
rules:
  - apiGroups: ['']
    resources: ['nodes/stats']
    verbs: ['get', 'watch', 'list']
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: otel-collector
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: otel-collector
subjects:
  - kind: ServiceAccount
    name: otel-collector
    namespace: default
```

## ファイルログレシーバー (Filelog Receiver) {#filelog-receiver}

| デプロイメントパターン      | 利用可能                                                               |
| --------------------------- | ---------------------------------------------------------------------- |
| DaemonSet （エージェント）  | 推奨                                                                   |
| Deployment （ゲートウェイ） | Yes ただし、ログを収集するのは、それがデプロイされているノードからのみ |
| サイドカー                  | Yes しかし、これは高度な設定とみなされるでしょう                       |

ファイルログレシーバーは、ファイルからのログをテイルし、解析します。
Kubernetesに特化したレシーバーではないですが、Kubernetesからあらゆるログを収集するための事実上のソリューションであることに変わりありません。

ファイルログレシーバーは、ログを処理するために連結されるオペレーターで構成されます。
各オペレーターは、タイムスタンプやJSONの解析など、単純な責任を実行します。
ファイルログレシーバーの設定は簡単ではありません。
[OpenTelemetryコレクターHelmチャート](/docs/platforms/kubernetes/helm/collector/) を使っている場合は、[`logsCollection` preset](/docs/platforms/kubernetes/helm/collector/#logs-collection-preset) を使って開始できます。

Kubernetesのログは通常、一連の標準フォーマットに適合するため、Kubernetes用の典型的なFilelogレシーバー設定は次のようになります。

```yaml
filelog:
  include:
    - /var/log/pods/*/*/*.log
  exclude:
    # Exclude logs from all containers named otel-collector
    - /var/log/pods/*/otel-collector/*.log
  start_at: end
  include_file_path: true
  include_file_name: false
  operators:
    # parse container logs
    - type: container
      id: container-parser
```

ファイルログレシーバーの設定の詳細については、[ファイルログレシーバーのドキュメント](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/filelogreceiver)を参照してください。

Filelog Receiverの設定に加えて、KubernetesにインストールしたOpenTelemetryコレクターは、収集したいログにアクセスする必要があります。
通常、これはコレクターマニフェストにボリュームとボリュームマウントを追加することを意味します。

```yaml
---
apiVersion: apps/v1
kind: DaemonSet
...
spec:
  ...
  template:
    ...
    spec:
      ...
      containers:
        - name: opentelemetry-collector
          ...
          volumeMounts:
            ...
            # ボリュームをコレクターコンテナにマウントする
            - name: varlogpods
              mountPath: /var/log/pods
              readOnly: true
            - name: varlibdockercontainers
              mountPath: /var/lib/docker/containers
              readOnly: true
            ...
      volumes:
        ...
        # 通常、コレクターはポッドログとコンテナログにアクセスしたいでしょう
        - name: varlogpods
          hostPath:
            path: /var/log/pods
        - name: varlibdockercontainers
          hostPath:
            path: /var/lib/docker/containers
        ...
```

## Kubernetesクラスターレシーバー (Kubernetes Cluster Receiver) {#kubernetes-cluster-receiver}

| デプロイメントパターン      | 利用可能                                                    |
| --------------------------- | ----------------------------------------------------------- |
| DaemonSet （エージェント）  | Yes しかし、データが重複する                                |
| Deployment （ゲートウェイ） | Yes しかし、2つ以上のレプリカを使用すると、データが重複する |
| サイドカー                  | No                                                          |

Kubernetesクラスターレシーバーは、Kubernetes APIサーバーを使用してクラスタ全体に関するメトリクスとエンティティイベントを収集します。
ポッドのフェーズ、ノードの状態、およびその他のクラスタ全体の疑問に答えるためには、このレシーバーを使用します。
レシーバーはクラスタ全体のテレメトリーを収集するので、すべてのデータを収集するためにクラスタ全体で必要なレシーバーのインスタンスは1つだけです。

認証にはさまざまな方法がありますが、通常はサービスアカウントが使われます。
サービスアカウントには、Kubernetes API サーバーからデータを引き出すための適切なパーミッションも必要です（下記参照）。
[OpenTelemetryコレクターHelmチャート](/docs/platforms/kubernetes/helm/collector/) を使っている場合は、[`clusterMetrics` preset](/docs/platforms/kubernetes/helm/collector/#cluster-metrics-preset) を使って開始できます。

ノードの状態については、デフォルトでは `Ready` のみを収集しますが、それ以上を収集するように設定することもできます。
また、`cpu` や `memory` などの割り当て可能なリソースを報告するように設定することも可能です。

```yaml
k8s_cluster:
  auth_type: serviceAccount
  node_conditions_to_report:
    - Ready
    - MemoryPressure
  allocatable_types_to_report:
    - cpu
    - memory
```

収集されるメトリクスの詳細については、[デフォルトメトリクス](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/receiver/k8sclusterreceiver/documentation.md) を参照してください。
設定の詳細については、[Kubernetesクラスターレシーバーのドキュメント](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/k8sclusterreceiver)を参照してください。

プロセッサーはKubernetes APIを使用するため、正しく動作するには適切なパーミッションが必要です。
ほとんどのユースケースでは、コレクターを実行しているサービスアカウントにClusterRoleを介して以下の権限を与える必要があります。

```yaml
---
apiVersion: v1
kind: ServiceAccount
metadata:
  name: otel-collector-opentelemetry-collector
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: otel-collector-opentelemetry-collector
rules:
  - apiGroups:
      - ''
    resources:
      - events
      - namespaces
      - namespaces/status
      - nodes
      - nodes/spec
      - pods
      - pods/status
      - replicationcontrollers
      - replicationcontrollers/status
      - resourcequotas
      - services
    verbs:
      - get
      - list
      - watch
  - apiGroups:
      - apps
    resources:
      - daemonsets
      - deployments
      - replicasets
      - statefulsets
    verbs:
      - get
      - list
      - watch
  - apiGroups:
      - extensions
    resources:
      - daemonsets
      - deployments
      - replicasets
    verbs:
      - get
      - list
      - watch
  - apiGroups:
      - batch
    resources:
      - jobs
      - cronjobs
    verbs:
      - get
      - list
      - watch
  - apiGroups:
      - autoscaling
    resources:
      - horizontalpodautoscalers
    verbs:
      - get
      - list
      - watch
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: otel-collector-opentelemetry-collector
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: otel-collector-opentelemetry-collector
subjects:
  - kind: ServiceAccount
    name: otel-collector-opentelemetry-collector
    namespace: default
```

## Kubernetesオブジェクトレシーバー (Kubernetes Objects Receiver) {#kubernetes-objects-receiver}

| デプロイメントパターン      | 利用可能                                                    |
| --------------------------- | ----------------------------------------------------------- |
| DaemonSet （エージェント）  | Yes しかし、データが重複する                                |
| Deployment （ゲートウェイ） | Yes しかし、2つ以上のレプリカを使用すると、データが重複する |
| サイドカー                  | No                                                          |

Kubernetesオブジェクトレシーバーは、Kubernetes APIサーバからオブジェクトをプルまたはウォッチして収集します。
このレシーバーのもっとも一般的な使用例はKubernetesイベントの監視ですが、あらゆるタイプのKubernetesオブジェクトを収集するために使用できます。
レシーバーはクラスタ全体のテレメトリーを収集するため、すべてのデータを収集するためにはクラスタ全体で1つのインスタンスしか必要ありません。

現在、認証に使用できるのはサービスアカウントのみです。
サービスアカウントはまた、Kubernetes API サーバーからデータを取り込むために適切なパーミッションが必要です（下記参照）。
[OpenTelemetryコレクターHelmチャート](/docs/platforms/kubernetes/helm/collector/) を使用していて、イベントを取り込みたい場合は、[`kubernetesEvents` preset](/docs/platforms/kubernetes/helm/collector/#cluster-metrics-preset) を使用して開始できます。

プル用に設定されたオブジェクトについては、レシーバーはKubernetes APIを使用して、クラスタ内のすべてのオブジェクトを定期的にリストします。
各オブジェクトは独自のログに変換されます。
監視用に設定されたオブジェクトの場合、レシーバーはKubernetes APIでストリームを作成し、オブジェクトが変更されると更新を受け取ります。

クラスタで実行可能なオブジェクトを確認するには `kubectl api-resources` を実行します。

<!-- cspell:disable -->

```console
kubectl api-resources
NAME                              SHORTNAMES   APIVERSION                             NAMESPACED   KIND
bindings                                       v1                                     true         Binding
componentstatuses                 cs           v1                                     false        ComponentStatus
configmaps                        cm           v1                                     true         ConfigMap
endpoints                         ep           v1                                     true         Endpoints
events                            ev           v1                                     true         Event
limitranges                       limits       v1                                     true         LimitRange
namespaces                        ns           v1                                     false        Namespace
nodes                             no           v1                                     false        Node
persistentvolumeclaims            pvc          v1                                     true         PersistentVolumeClaim
persistentvolumes                 pv           v1                                     false        PersistentVolume
pods                              po           v1                                     true         Pod
podtemplates                                   v1                                     true         PodTemplate
replicationcontrollers            rc           v1                                     true         ReplicationController
resourcequotas                    quota        v1                                     true         ResourceQuota
secrets                                        v1                                     true         Secret
serviceaccounts                   sa           v1                                     true         ServiceAccount
services                          svc          v1                                     true         Service
mutatingwebhookconfigurations                  admissionregistration.k8s.io/v1        false        MutatingWebhookConfiguration
validatingwebhookconfigurations                admissionregistration.k8s.io/v1        false        ValidatingWebhookConfiguration
customresourcedefinitions         crd,crds     apiextensions.k8s.io/v1                false        CustomResourceDefinition
apiservices                                    apiregistration.k8s.io/v1              false        APIService
controllerrevisions                            apps/v1                                true         ControllerRevision
daemonsets                        ds           apps/v1                                true         DaemonSet
deployments                       deploy       apps/v1                                true         Deployment
replicasets                       rs           apps/v1                                true         ReplicaSet
statefulsets                      sts          apps/v1                                true         StatefulSet
tokenreviews                                   authentication.k8s.io/v1               false        TokenReview
localsubjectaccessreviews                      authorization.k8s.io/v1                true         LocalSubjectAccessReview
selfsubjectaccessreviews                       authorization.k8s.io/v1                false        SelfSubjectAccessReview
selfsubjectrulesreviews                        authorization.k8s.io/v1                false        SelfSubjectRulesReview
subjectaccessreviews                           authorization.k8s.io/v1                false        SubjectAccessReview
horizontalpodautoscalers          hpa          autoscaling/v2                         true         HorizontalPodAutoscaler
cronjobs                          cj           batch/v1                               true         CronJob
jobs                                           batch/v1                               true         Job
certificatesigningrequests        csr          certificates.k8s.io/v1                 false        CertificateSigningRequest
leases                                         coordination.k8s.io/v1                 true         Lease
endpointslices                                 discovery.k8s.io/v1                    true         EndpointSlice
events                            ev           events.k8s.io/v1                       true         Event
flowschemas                                    flowcontrol.apiserver.k8s.io/v1beta2   false        FlowSchema
prioritylevelconfigurations                    flowcontrol.apiserver.k8s.io/v1beta2   false        PriorityLevelConfiguration
ingressclasses                                 networking.k8s.io/v1                   false        IngressClass
ingresses                         ing          networking.k8s.io/v1                   true         Ingress
networkpolicies                   netpol       networking.k8s.io/v1                   true         NetworkPolicy
runtimeclasses                                 node.k8s.io/v1                         false        RuntimeClass
poddisruptionbudgets              pdb          policy/v1                              true         PodDisruptionBudget
clusterrolebindings                            rbac.authorization.k8s.io/v1           false        ClusterRoleBinding
clusterroles                                   rbac.authorization.k8s.io/v1           false        ClusterRole
rolebindings                                   rbac.authorization.k8s.io/v1           true         RoleBinding
roles                                          rbac.authorization.k8s.io/v1           true         Role
priorityclasses                   pc           scheduling.k8s.io/v1                   false        PriorityClass
csidrivers                                     storage.k8s.io/v1                      false        CSIDriver
csinodes                                       storage.k8s.io/v1                      false        CSINode
csistoragecapacities                           storage.k8s.io/v1                      true         CSIStorageCapacity
storageclasses                    sc           storage.k8s.io/v1                      false        StorageClass
volumeattachments                              storage.k8s.io/v1                      false        VolumeAttachment
```

<!-- cspell:enable -->

具体的な設定の詳細については、[Kubernetesオブジェクトレシーバーのドキュメント](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/k8sobjectsreceiver)を参照してください。

プロセッサーはKubernetes APIを使用するため、正しく動作するには適切なパーミッションが必要です。
サービスアカウントが唯一の認証オプションなので、サービスアカウントに適切なアクセス権を与える必要があります。
収集したいオブジェクトについては、その名前がクラスターロールに追加されていることを確認する必要があります。
たとえば、ポッドを収集したい場合、クラスターロールは次のようになります。

```yaml
---
apiVersion: v1
kind: ServiceAccount
metadata:
  name: otel-collector-opentelemetry-collector
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: otel-collector-opentelemetry-collector
rules:
  - apiGroups:
      - ''
    resources:
      - pods
    verbs:
      - get
      - list
      - watch
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: otel-collector-opentelemetry-collector
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: otel-collector-opentelemetry-collector
subjects:
  - kind: ServiceAccount
    name: otel-collector-opentelemetry-collector
    namespace: default
```

## Prometheusレシーバー {#prometheus-receiver}

| デプロイメントパターン      | 利用可能 |
| --------------------------- | -------- |
| DaemonSet （エージェント）  | Yes      |
| Deployment （ゲートウェイ） | Yes      |
| サイドカー                  | No       |

Prometheusは、KubernetesとKubernetes上で動作するサービスの両方に共通のメトリクスフォーマットです。
Prometheusレシーバーは、これらのメトリクスを収集するためにすぐに利用できる最小限の置き換えです。
Prometheus [`scrape_config` オプション](https://prometheus.io/docs/prometheus/1.8/configuration/configuration/#scrape_config) のフルセットをサポートしています。

レシーバーがサポートしていない Prometheus の高度な機能がいくつかあります。
設定 YAML/コードに以下のいずれかが含まれている場合、レシーバーはエラーを返します。

- `alert_config.alertmanagers`
- `alert_config.relabel_configs`
- `remote_read`
- `remote_write`
- `rule_files`

具体的な設定の詳細については、[Prometheusレシーバーのドキュメント](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/prometheusreceiver)を参照してください。

Prometheusのレシーバーは[ステートフル](https://github.com/open-telemetry/opentelemetry-collector/blob/main/docs/standard-warnings.md#statefulness)であり、使用する際に考慮すべき重要な点があります。

- コレクターの複数のレプリカを実行すると、コレクターはスクレイピングプロセスを自動スケールできません。
- コレクターの複数のレプリカを同じ設定で実行すると、ターゲットを複数回スクレイピングします。
- 手動でスクレイピングプロセスをシャーディングしたい場合、ユーザーは各レプリカを異なるスクレイピング構成で構成する必要があります。

Prometheus レシーバーの設定を簡単にするために、OpenTelemetryオペレーターには [ターゲットアロケーター](/docs/platforms/kubernetes/operator/target-allocator) というオプションのコンポーネントがあります。
このコンポーネントを使用して、どの Prometheus エンドポイントをスクレイピングすべきかをコレクターに指示できます。

レシーバーの設計については、[設計](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/receiver/prometheusreceiver/DESIGN.md)を参照のこと。

## ホストメトリクスレシーバー (Host Metrics Receiver) {#host-metrics-receiver}

| デプロイメントパターン      | 利用可能                                                     |
| --------------------------- | ------------------------------------------------------------ |
| DaemonSet （エージェント）  | 推奨                                                         |
| Deployment （ゲートウェイ） | Yes ただし、デプロイされたノードからのみメトリクスを収集する |
| サイドカー                  | No                                                           |

ホストメトリクスレシーバーは、さまざまなスクレイパーを使用してホストからメトリクスを収集します。
[Kubeletstatsレシーバー](#kubeletstats-receiver)と重複する部分があるので、両方を使うことにした場合は、これらの重複するメトリクスを無効にしたほうがいいかもしれません。

Kubernetes では、レシーバーが正しく動作するためには `hostfs` ボリュームにアクセスする必要があります。
[OpenTelemetryコレクターHelmチャート](/docs/platforms/kubernetes/helm/collector/) を使っている場合は、[`hostMetrics` preset](/docs/platforms/kubernetes/helm/collector/#host-metrics-preset) を使って開始できます。

使用可能なスクレーパーは以下の通りです。

| スクレーパー | サポートされているOS  | 説明                                                             |
| ------------ | --------------------- | ---------------------------------------------------------------- |
| cpu          | All except macOS[^1]  | CPU使用率のメトリクス                                            |
| disk         | All except macOS[^1]  | ディスクI/Oのメトリクス                                          |
| load         | All                   | CPU負荷のメトリクス                                              |
| filesystem   | All                   | ファイルシステム使用量のメトリクス                               |
| memory       | All                   | メモリ使用量のメトリクス                                         |
| network      | All                   | ネットワークインターフェースI/OのメトリクスとTCP接続のメトリクス |
| paging       | All                   | ページ空間／スワップ空間の使用量とI/Oのメトリクス                |
| processes    | Linux, macOS          | プロセス数のメトリクス                                           |
| process      | Linux, macOS, Windows | プロセス毎のCPU、Memory、ディスクI/Oのメトリクス                 |

[^1]: Collector SIGがリリースしたイメージのデフォルトであるcgoなしでコンパイルした場合、macOSではサポートされません。

どのメトリクスが収集されるか、および具体的な構成の詳細については、[ホストメトリクスレシーバーのドキュメント](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/hostmetricsreceiver)を参照してください。

コンポーネントを自分で構成する必要がある場合、コンテナではなくノードのメトリクスを収集したい場合は、必ず `hostfs` ボリュームをマウントしてください。

```yaml
---
apiVersion: apps/v1
kind: DaemonSet
...
spec:
  ...
  template:
    ...
    spec:
      ...
      containers:
        - name: opentelemetry-collector
          ...
          volumeMounts:
            ...
            - name: hostfs
              mountPath: /hostfs
              readOnly: true
              mountPropagation: HostToContainer
      volumes:
        ...
        - name: hostfs
          hostPath:
            path: /
      ...
```

そして `volumeMount` を使用するようにホストメトリクスレシーバーを設定します。

```yaml
receivers:
  hostmetrics:
    root_path: /hostfs
    collection_interval: 10s
    scrapers:
      cpu:
      load:
      memory:
      disk:
      filesystem:
      network:
```

レシーバーをコンテナ内で使用する方法の詳細については、[コンテナ内からホストメトリクスを収集する（Linuxのみ）](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/hostmetricsreceiver#collecting-host-metrics-from-inside-a-container-linux-only)を参照してください。
