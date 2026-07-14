---
title: OBI サービスディスカバリーの設定
linkTitle: サービスディスカバリー
description: OBI のサービスディスカバリーコンポーネントが計装対象のプロセスを検索する方法を設定します。
weight: 20
default_lang_commit: e17943afc3a71a67fcdd3a69dcd428c3e45b306d
# prettier-ignore
cSpell:ignore: filestorecsi kube-node-lease kube-system rdns replicaset statefulset testserver volumepopulator
---

`OTEL_EBPF_AUTO_TARGET_EXE`、`OTEL_EBPF_OPEN_PORT`、`OTEL_EBPF_AUTO_TARGET_LANGUAGE`、`OTEL_EBPF_TARGET_PID` の各環境変数を使うと、単一のサービスまたは関連する一連のサービスを計装するように OBI を簡単に設定できます。

シナリオによっては、OBI は多数のサービスを計装します。
たとえば、ノード内のすべてのサービスを計装する [Kubernetes DaemonSet](../../setup/kubernetes/) として動作する場合などです。
`discovery` YAML セクションを使うと、OBI が計装できるサービスに対して、より細かい選択条件を指定できます。

| YAML<br>環境変数                                                                                                 | 説明                                                                                                                                                                                                                                                                                                                                               | 型                   | デフォルト                                                                                               |
| ---------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- | -------------------------------------------------------------------------------------------------------- |
| `instrument`                                                                                                     | サービスごとに異なる選択条件を指定し、報告される名前や名前空間を上書きします。詳細は [ディスカバリーサービス](#discovery-services) セクションを参照してください。                                                                                                                                                                                  | オブジェクトのリスト | 未設定                                                                                                   |
| `exclude_instrument`                                                                                             | 計装対象からサービスを除外するための選択条件を指定します。オブザーバビリティ環境で一般的に見られるサービスの計装を避けるのに便利です。詳細は [計装からのサービスの除外](#exclude-services-from-instrumentation) セクションを参照してください。                                                                                                     | オブジェクトのリスト | 未設定                                                                                                   |
| `default_exclude_instrument`                                                                                     | OBI 自身、OpenTelemetry Collector、および特定の Kubernetes システム名前空間で実行されるサービスの計装を無効にします。空に設定すると、OBI が自身、Collector、およびこれらの名前空間のサービスを計装できるようになります。詳細は [計装からのデフォルトのサービス除外](#default-exclude-services-from-instrumentation) セクションを参照してください。 | オブジェクトのリスト | パス: `{*/obi,obi,*otelcol,*otelcol-contrib,*otelcol-contrib[!/]*}` と特定の Kubernetes システム名前空間 |
| `skip_go_specific_tracers`<br>`OTEL_EBPF_SKIP_GO_SPECIFIC_TRACERS`                                               | **eBPF** トレーサーが計装対象の実行可能ファイルを検査する際に、Go 固有の検出を無効にします。トレーサーは汎用的な計装の使用にフォールバックしますが、これは一般的に効率が劣ります。詳細は [Go 固有トレーサーのスキップ](#skip-go-specific-tracers) セクションを参照してください。                                                                   | boolean              | false                                                                                                    |
| `exclude_otel_instrumented_services`<br>`OTEL_EBPF_EXCLUDE_OTEL_INSTRUMENTED_SERVICES`                           | すでに OpenTelemetry で計装されているサービスに対する OBI の計装を無効にします。詳細は [OTel で計装済みのサービスの除外](#exclude-otel-instrumented-services) セクションを参照してください。                                                                                                                                                       | boolean              | true                                                                                                     |
| `exclude_otel_instrumented_services_span_metrics`<br>`OTEL_EBPF_EXCLUDE_OTEL_INSTRUMENTED_SERVICES_SPAN_METRICS` | すでに OpenTelemetry で計装されているサービスについて、OBI のスパンメトリクス／サービスグラフメトリクスの生成を無効にします。詳細は [OTel で計装済みのサービスの除外](#exclude-otel-instrumented-services) セクションを参照してください。                                                                                                          | boolean              | false                                                                                                    |

## ディスカバリーサービス {#discovery-services}

サービスタイプごとに、サービス名、名前空間、その他の設定を上書きできます。

| YAML                   | 説明                                                                                                                                                                             | 型                        | デフォルト |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- | ---------- |
| `open_ports`           | オープンしている（リッスンしている）ポートによって計装するプロセスを選択します。[オープンポート](#open-ports) を参照してください。                                               | string                    | 未設定     |
| `exe_path`             | 実行可能ファイルの名前パスによって計装するプロセスを選択します。[実行可能ファイルのパス](#executable-path) を参照してください。                                                  | string（glob）            | 未設定     |
| `languages`            | 検出されたプログラミング言語によってプロセスを選択します。[言語](#languages) を参照してください。                                                                                | string（glob）            | 未設定     |
| `cmd_args`             | コマンドライン引数によってプロセスを選択します。[コマンドライン引数](#command-line-arguments) を参照してください。                                                               | string（glob）            | 未設定     |
| `target_pids`          | PID によってプロセスを選択します。[ターゲット PID](#target-pids) を参照してください。                                                                                            | integer のリスト          | 未設定     |
| `containers_only`      | OCI コンテナ内で実行されている、計装対象のプロセスを選択します。[コンテナのみ](#containers-only) を参照してください。                                                            | boolean                   | false      |
| `container_name`       | OCI コンテナ名によってサービスをフィルタリングします。[コンテナ名](#container-name) を参照してください。                                                                         | string（glob）            | 未設定     |
| `k8s_namespace`        | Kubernetes 名前空間によってサービスをフィルタリングします。[K8s 名前空間](#k8s-namespace) を参照してください。                                                                   | string（glob）            | 未設定     |
| `k8s_pod_name`         | Kubernetes Pod によってサービスをフィルタリングします。[K8s Pod 名](#k8s-pod-name) を参照してください。                                                                          | string（glob）            | 未設定     |
| `k8s_deployment_name`  | Kubernetes Deployment によってサービスをフィルタリングします。[K8s Deployment 名](#k8s-deployment-name) を参照してください。                                                     | string（glob）            | 未設定     |
| `k8s_replicaset_name`  | Kubernetes ReplicaSet によってサービスをフィルタリングします。[K8s ReplicaSet 名](#k8s-replicaset-name) を参照してください。                                                     | string（glob）            | 未設定     |
| `k8s_statefulset_name` | Kubernetes StatefulSet によってサービスをフィルタリングします。[K8s StatefulSet 名](#k8s-statefulset-name) を参照してください。                                                  | string（glob）            | 未設定     |
| `k8s_daemonset_name`   | Kubernetes DaemonSet によってサービスをフィルタリングします。[K8s DaemonSet 名](#k8s-daemonset-name) を参照してください。                                                        | string（glob）            | 未設定     |
| `k8s_owner_name`       | Kubernetes Pod のオーナー（Deployment、ReplicaSet、DaemonSet、または StatefulSet）によってサービスをフィルタリングします。[K8s オーナー名](#k8s-owner-name) を参照してください。 | string（glob）            | 未設定     |
| `k8s_pod_labels`       | Kubernetes Pod のラベルによってサービスをフィルタリングします。[K8s Pod ラベル](#k8s-pod-labels) を参照してください。                                                            | map[string]string（glob） | 未設定     |
| `k8s_pod_annotations`  | Kubernetes Pod のアノテーションによってサービスをフィルタリングします。[K8s Pod アノテーション](#k8s-pod-annotations) を参照してください。                                       | map[string]string（glob） | 未設定     |

### オープンポート {#open-ports}

オープンしている（リッスンしている）ポートによって計装するプロセスを選択します。
このプロパティは、ポートのカンマ区切りリスト（例: `80`）やポート範囲（例: `8000-8999`）を受け付けます。
実行可能ファイルがリスト内のいずれか 1 つのポートにのみ一致する場合でも、OBI はそれを一致とみなします。

たとえば、次のプロパティを指定するとします。

```yaml
discovery:
  instrument:
    - open_ports: 80,443,8000-8999
```

OBI は、ポート 80、443、または 8000 から 8999 までのいずれかのポートを開くすべての実行可能ファイルを選択します。

同じ `instrument` エントリで他のセレクターを指定した場合、プロセスはすべてのセレクタープロパティに一致する必要があります。

実行可能ファイルが複数のポートを開く場合、そのうち 1 つのポートを指定するだけで、OBI はすべてのアプリケーションポートの HTTP/S および gRPC リクエストをすべて計装します。
現在、特定のポートを通じて公開されるメソッドのみに計装を限定することはできません。

### 実行可能ファイルのパス {#executable-path}

実行可能ファイルの名前パスによって計装するプロセスを選択します。
このプロパティは、ファイルシステム上で実行可能ファイルが存在するディレクトリを含む、完全な実行可能コマンドラインに対してマッチングする glob を受け付けます。

OBI は、このプロパティに一致する実行可能ファイルパスを持つすべてのプロセスの計装を試みます。
たとえば、`exe_path: *` を設定すると、OBI はホスト上のすべての実行可能ファイルの計装を試みます。

同じ `instrument` エントリで他のセレクターを指定した場合、プロセスはすべてのセレクタープロパティに一致する必要があります。

### 言語 {#languages}

検出されたプログラミング言語によってプロセスを選択します。
このプロパティは、正規化された言語名（例: `go`、`java`、`python`、`nodejs`）に対する glob マッチャーを受け付けます。

たとえば次のとおりです。

```yaml
discovery:
  instrument:
    - languages: go
```

これは他のセレクター（例: `exe_path` や `open_ports`）と組み合わせることができ、設定したすべてのセレクターが一致する必要があります。

### コマンドライン引数 {#command-line-arguments}

コマンドライン引数によってプロセスを選択します。
このプロパティは、プロセスの完全なコマンドライン引数に対してマッチングされる glob を受け付けます。

たとえば次のとおりです。

```yaml
discovery:
  instrument:
    - cmd_args: '*--profile=prod*'
```

このセレクターは、同じ `instrument` エントリ内の他のセレクターと組み合わせることができます。

### ターゲット PID {#target-pids}

PID によってプロセスを選択します。
計装すべきプロセス ID がすでにわかっている場合は、このセレクターを使用してください。

たとえば次のとおりです。

```yaml
discovery:
  instrument:
    - target_pids: [1234, 5678]
```

ルートレベルの `target_pids` を使用するか、`OTEL_EBPF_TARGET_PID=1234,5678` を介して、PID のターゲット指定をグローバルに設定することもできます。

### コンテナのみ {#containers-only}

OCI コンテナ内で実行されている、計装対象のプロセスを選択します。
このチェックを行うために、OBI はプロセスのネットワーク名前空間を検査し、それを自身のネットワーク名前空間と照合します。
ネットワーク名前空間の検査を行うための十分な権限が OBI にない場合、このオプションは無視されます。

同じ `instrument` エントリで他のセレクターを指定した場合、プロセスはすべてのセレクタープロパティに一致する必要があります。

### コンテナ名 {#container-name}

このセレクタープロパティは、指定された glob パターンに一致する名前を持つ OCI コンテナ（Docker など）内で実行されているアプリケーションに計装を限定します。

たとえば次のとおりです。

```yaml
discovery:
  instrument:
    - container_name: '*testserver*'
    - container_name: 'my-app-*'
```

この例では、名前に `testserver` を含む、または `my-app-` で始まるコンテナ内で実行されているすべてのプロセスを検出します。

同じ `instrument` エントリで他のセレクターを指定した場合、プロセスはすべてのセレクタープロパティに一致する必要があります。

### K8s 名前空間 {#k8s-namespace}

このセレクタープロパティは、指定された glob に一致する名前を持つ Kubernetes 名前空間内で実行されているアプリケーションに計装を限定します。

同じ `instrument` エントリで他のセレクターを指定した場合、プロセスはすべてのセレクタープロパティに一致する必要があります。

### K8s Pod 名 {#k8s-pod-name}

このセレクタープロパティは、指定された glob に一致する名前を持つ Kubernetes Pod 内で実行されているアプリケーションに計装を限定します。

同じ `instrument` エントリで他のセレクターを指定した場合、プロセスはすべてのセレクタープロパティに一致する必要があります。

### K8s Deployment 名 {#k8s-deployment-name}

このセレクタープロパティは、指定された glob に一致する名前を持つ Kubernetes Deployment 内で実行されているアプリケーションに計装を限定します。

同じ `instrument` エントリで他のセレクターを指定した場合、プロセスはすべてのセレクタープロパティに一致する必要があります。

### K8s ReplicaSet 名 {#k8s-replicaset-name}

このセレクタープロパティは、指定された glob に一致する名前を持つ Kubernetes ReplicaSet 内で実行されているアプリケーションに計装を限定します。

同じ `instrument` エントリで他のセレクターを指定した場合、プロセスはすべてのセレクタープロパティに一致する必要があります。

### K8s StatefulSet 名 {#k8s-statefulset-name}

このセレクタープロパティは、指定された glob に一致する名前を持つ Kubernetes StatefulSet 内で実行されているアプリケーションに計装を限定します。

同じ `instrument` エントリで他のセレクターを指定した場合、プロセスはすべてのセレクタープロパティに一致する必要があります。

### K8s DaemonSet 名 {#k8s-daemonset-name}

このセレクタープロパティは、指定された glob に一致する名前を持つ Kubernetes DaemonSet 内で実行されているアプリケーションに計装を限定します。

同じ `instrument` エントリで他のセレクターを指定した場合、プロセスはすべてのセレクタープロパティに一致する必要があります。

### K8s オーナー名 {#k8s-owner-name}

このセレクタープロパティは、指定された glob に一致する名前を持つ `Deployment`、`ReplicaSet`、`DaemonSet`、または `StatefulSet` によって所有される Pod 内で実行されているアプリケーションに計装を限定します。

同じ `instrument` エントリで他のセレクターを指定した場合、プロセスはすべてのセレクタープロパティに一致する必要があります。

### K8s Pod ラベル {#k8s-pod-labels}

このセレクタープロパティは、指定された値に glob として一致するラベルを持つ Pod 内で実行されているアプリケーションに計装を限定します。

同じ `instrument` エントリで他のセレクターを指定した場合、プロセスはすべてのセレクタープロパティに一致する必要があります。

たとえば次のとおりです。

```yaml
discovery:
  instrument:
    - k8s_namespace: frontend
      k8s_pod_labels:
        instrument: obi
```

上記の例では、`frontend` 名前空間内で、glob `obi` に一致する値を持つラベル `instrument` を持つすべての Pod を検出します。

### K8s Pod アノテーション {#k8s-pod-annotations}

このセレクタープロパティは、指定された値に glob として一致するアノテーションを持つ Pod 内で実行されているアプリケーションに計装を限定します。

同じ `instrument` エントリで他のセレクターを指定した場合、プロセスはすべてのセレクタープロパティに一致する必要があります。

たとえば次のとおりです。

```yaml
discovery:
  instrument:
    - k8s_namespace: backend
      k8s_pod_annotations:
        obi.instrument: 'true'
```

上記の例では、`backend` 名前空間内で、glob `true` に一致する値を持つアノテーション `obi.instrument` を持つすべての Pod を検出します。

## 計装からのサービスの除外 {#exclude-services-from-instrumentation}

`exclude_instrument` セクションを使うと、計装対象からサービスを除外するための選択条件を指定できます。
これは、本ドキュメントの [ディスカバリーサービス](#discovery-services) セクションで説明されているのと同じ定義形式に従います。

このオプションは、オブザーバビリティ環境で一般的に見られるサービスの計装を避けるのに役立ちます。
たとえば、Prometheus の計装を除外するためにこのオプションを使用します。

### 例: 特定の名前空間を除外する {#example-exclude-specific-namespaces}

```yaml
discovery:
  instrument:
    - k8s_namespace: '*' # すべての名前空間を計装
  exclude_instrument:
    - k8s_namespace: development # development 名前空間を除く
    - k8s_namespace: staging # staging 名前空間も除く
```

### 例: ラベルによってサービスを除外する {#example-exclude-services-by-labels}

```yaml
discovery:
  rules:
    - match:
        k8s_namespace: production
      exclude:
        k8s_pod_labels:
          skip-instrumentation: 'true'
```

この例では、`skip-instrumentation` はユーザー定義の Kubernetes Pod ラベルです。
組織のラベル付け規約に基づいて、マッチングや除外のために任意のカスタムラベルのキーと値を使用できます。

### 例: 特定の実行可能ファイルを除外する {#example-exclude-specific-executables}

```yaml
discovery:
  rules:
    - match:
        open_ports: 80,443,8080
      exclude:
        exe_path: '*prometheus*'
        exe_path: '*grafana*'
```

## 計装からのデフォルトのサービス除外 {#default-exclude-services-from-instrumentation}

`default_exclude_instrument` セクションは、OBI 自身（自己計装）、OpenTelemetry Collector、およびその他のオブザーバビリティコンポーネントの計装を無効にします。
また、メトリクス生成の全体的なコストを削減するために、さまざまな Kubernetes システム名前空間の計装も無効にします。
次のセクションには、除外されるすべてのコンポーネントが含まれています。

- `exe_path` による除外サービス: `*/obi`、`obi`、`*otelcol`、`*otelcol-contrib`、`*otelcol-contrib[!/]*`。
- `k8s_namespace` による除外サービス: `kube-system`、`kube-node-lease`、`local-path-storage`、`cert-manager`、`monitoring`、`gke-connect`、`gke-gmp-system`、`gke-managed-cim`、`gke-managed-filestorecsi`、`gke-managed-metrics-server`、`gke-managed-system`、`gke-system`、`gke-managed-volumepopulator`、`gatekeeper-system`。

OBI が自身や除外された他のコンポーネントの一部を計装できるようにするには、このオプションを変更してください。

注意: そのような自己計装を有効にするには、それらを `instrument` セクションに含めるか、これらのコンポーネントがより大きな包含条件の一部である必要があります。

### 例: デフォルトで除外される名前空間の計装を有効にする {#example-enable-instrumentation-for-a-default-excluded-namespace}

デフォルトで除外されている名前空間（`monitoring` など）の計装を有効にするには、その名前空間をデフォルトの除外リストから削除し、かつ `instrument` セクションに追加する必要があります。

次の例では、`monitoring` 名前空間の計装を有効にします。

```yaml
discovery:
  # monitoring 名前空間を計装対象に含める
  instrument:
    - k8s_namespace: monitoring

  # デフォルトの除外リストを上書きして monitoring 名前空間を除去する
  # このリストは他のデフォルト除外を維持しつつ monitoring を削除する
  default_exclude_instrument:
    - exe_path: '{*/obi,obi,*otelcol,*otelcol-contrib,*otelcol-contrib[!/]*}'
    - k8s_namespace: kube-system
    - k8s_namespace: kube-node-lease
    - k8s_namespace: local-path-storage
    - k8s_namespace: cert-manager
    # monitoring 名前空間をこのリストから削除
    - k8s_namespace: gke-connect
    - k8s_namespace: gke-gmp-system
    - k8s_namespace: gke-managed-cim
    - k8s_namespace: gke-managed-filestorecsi
    - k8s_namespace: gke-managed-metrics-server
    - k8s_namespace: gke-managed-system
    - k8s_namespace: gke-system
    - k8s_namespace: gke-managed-volumepopulator
    - k8s_namespace: gatekeeper-system
```

### 例: すべてのデフォルト除外を無効にする {#example-disable-all-default-exclusions}

すべてのデフォルト除外を無効にし、OBI が一致する任意のサービス（自身やその他のオブザーバビリティコンポーネントを含む）を計装できるようにするには、`default_exclude_instrument` を空のリストに設定します。

```yaml
discovery:
  instrument:
    - k8s_namespace: '*' # または特定の名前空間／セレクター

  # 空のリストですべてのデフォルト除外を無効にする
  default_exclude_instrument: []
```

> [!WARNING]
>
> すべてのデフォルト除外を無効にすると、OBI が自身や他のテレメトリーコレクターを計装した場合に、リソース使用量の増加やフィードバックループが発生する可能性があります。
> 本番環境ではこの設定を慎重に使用してください。

## Go 固有トレーサーのスキップ {#skip-go-specific-tracers}

`skip_go_specific_tracers` オプションは、**eBPF** トレーサーが計装対象の実行可能ファイルを検査する際に、Go 固有の検出を無効にします。
トレーサーは汎用的な計装の使用にフォールバックしますが、これは一般的に効率が劣ります。

## OTel で計装済みのサービスの除外 {#exclude-otel-instrumented-services}

`exclude_otel_instrumented_services` オプションは、すでに OpenTelemetry で計装されているサービスに対する OBI の計装を無効にします。
OBI は Kubernetes クラスター内のすべてのサービスを監視するためにデプロイされることが多いため、計装の選択（または除外）条件を慎重に作り込まない限り、すでに計装済みのサービスを監視すると重複したテレメトリーデータにつながる可能性があります。
不要な設定オーバーヘッドを避けるために、OBI はメトリクスとトレースを公開する OpenTelemetry SDK の呼び出しを監視し、自身のテレメトリーデータを公開しているサービスの計装を自動的にオフにします。
アプリケーションが生成するテレメトリーデータが OBI の生成するメトリクスやトレースと競合しない場合は、このオプションをオフにしてください。

## サービス名と名前空間の上書き {#override-service-name-and-namespace}

OpenTelemetry または Prometheus を介して計装データをエクスポートする場合、OBI は他の計装ソリューションとの相互運用性を向上させるために、[OpenTelemetry operator のサービス名規約](https://github.com/open-telemetry/opentelemetry-operator/blob/main/docs/auto-instrumentation/resource-attributes.md#how-resource-attributes-are-calculated-from-the-pods-metadata) に従います。

OBI は、サービス名と名前空間を自動的に設定するために、次の条件をこの順序で使用します。

1. 計装対象のプロセスまたはコンテナの `OTEL_RESOURCE_ATTRIBUTES` および `OTEL_SERVICE_NAME` 環境変数を介して設定されたリソース属性。
2. Kubernetes では、次の Pod アノテーションを介して設定されたリソース属性。
   - `resource.opentelemetry.io/service.name`
   - `resource.opentelemetry.io/service.namespace`
3. Kubernetes では、次の Pod ラベルを介して設定されたリソース属性。
   - `app.kubernetes.io/name` はサービス名を設定します
   - `app.kubernetes.io/part-of` はサービス名前空間を設定します
4. Kubernetes では、Pod のオーナーのメタデータから計算されたリソース属性。次の順序で（利用可能性に応じて）使用されます。
   - `k8s.deployment.name`
   - `k8s.replicaset.name`
   - `k8s.statefulset.name`
   - `k8s.daemonset.name`
   - `k8s.cronjob.name`
   - `k8s.job.name`
   - `k8s.pod.name`
   - `k8s.container.name`
5. 計装対象プロセスの実行可能ファイル名。

前述の項目 3 の Kubernetes ラベルは、設定を介して上書きできます。

YAML の場合は次のとおりです。

```yaml
attributes:
  kubernetes:
    resource_labels:
      service.name:
        # 最初に存在する Pod ラベルからサービス名を取得する
        - override-svc-name
        - app.kubernetes.io/name
      service.namespace:
        # 最初に存在する Pod ラベルからサービス名前空間を取得する
        - override-svc-ns
        - app.kubernetes.io/part-of
```

これらは、アノテーション名とラベル名のカンマ区切りリストを受け付けます。

### 拡張サービス名ルックアップ (v0.5.0+) {#enhanced-service-name-lookup-v050}

v0.5.0 以降、OBI には、特に動的で分散された環境において、より正確なサービス識別を提供する拡張サービス名解決が含まれています。

**改善点**:

1. **DNS ベースの解決**: OBI は DNS クエリを使用してサービス名を解決でき、アプリケーションが使用する実際のサービスディスカバリーのメカニズムとの整合性が向上します。
2. **メタデータエンリッチメント**: コンテナランタイムやオーケストレーションプラットフォームを含む複数のメタデータソースからの拡張ルックアップ。

3. **接続トラッキング**: クライアントとサーバーの両方の識別情報を解決することによる、サービス間通信のより優れたトラッキング。

**動作の仕組み**:

OBI はサービス間のネットワーク通信を検出すると、利用可能な設定済みソースを使用して、次の優先順位でサービス名の解決を試みます。

1. **Kubernetes メタデータルックアップ**: Kubernetes API から Pod およびオーナーのメタデータを確認します（デフォルトで有効）。
2. **eBPF からの逆引き DNS**: カーネルレベルでキャプチャされた DNS レスポンスを使用します（オプション、`OTEL_EBPF_NAME_RESOLVER_SOURCES=rdns` が必要）。
3. **標準的な DNS 逆引き**: IP アドレスに対して逆引き DNS クエリを実行します（オプション、`OTEL_EBPF_NAME_RESOLVER_SOURCES=dns` が必要）。

ローカルのサービス名は、次の優先順位階層に従います。

1. `OTEL_SERVICE_NAME` 環境変数（最優先）。
2. `OTEL_RESOURCE_ATTRIBUTES` 環境変数（service.name キー）。
3. サービス名アノテーション（resource.opentelemetry.io/service.name）。
4. サービス名ラベル（例: app.kubernetes.io/name）。
5. Kubernetes Pod のオーナー名（例: Deployment 名）（最も低い優先度）。

この拡張は、特に次の場合に価値があります。

- **サービスメッシュ環境**: DNS がサービスルーティングに使用される環境。
- **Kubernetes クラスター**: Service リソースとの相関の向上。
- **マイクロサービスアーキテクチャ**: 正確なサービス名による、より優れたサービスグラフの可視化。

**設定**:

Kubernetes メタデータベースのサービスルックアップはデフォルトで有効です。
DNS ベースの解決方法を有効にするには、名前リゾルバーのソースを設定します。

```bash
# Kubernetes メタデータと標準 DNS 逆引きルックアップの両方を有効にする
export OTEL_EBPF_NAME_RESOLVER_SOURCES=k8s,dns

# または eBPF でキャプチャした DNS ルックアップを有効にする（DNS イベントキャプチャが必要）
export OTEL_EBPF_NAME_RESOLVER_SOURCES=k8s,rdns

# すべてのリゾルバーソースを有効にする
export OTEL_EBPF_NAME_RESOLVER_SOURCES=k8s,dns,rdns

# オプション: キャッシュサイズを調整する（デフォルト: 1024）
export OTEL_EBPF_NAME_RESOLVER_CACHE_LEN=2048

# オプション: キャッシュの TTL を調整する（デフォルト: 5分）
export OTEL_EBPF_NAME_RESOLVER_CACHE_TTL=10m
```

Kubernetes 環境では、次の点を確認してください。

- ネットワークポリシーが DNS クエリを許可していること（DNS ベースの解決を使用する場合）。
- CoreDNS または同等の DNS サービスが実行されていること。
- RDNS を使用する場合、eBPF プログラムが DNS イベントをキャプチャできること。

**メリット**:

- **より正確なサービスグラフ**: サービス間通信で、IP のかわりに実際のサービス名が表示されます。
- **より優れたトレースの相関**: トレースに、サービスカタログと一致するサービス名が表示されます。
- **トラブルシューティングの容易化**: 手動での IP ルックアップなしに、どのサービスが通信しているかを特定できます。

**例**:

拡張ルックアップがない場合、次のように表示されることがあります。

```console
service.name: "10.0.1.42"
peer.service: "10.0.2.15"
```

拡張ルックアップを有効にした場合は次のとおりです。

```console
service.name: "frontend"
peer.service: "backend-api"
```
