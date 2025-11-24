---
title: ターゲットアロケーター
default_lang_commit: f02328f074d7cbd837dda6653754daee0c452a2a
drifted_from_default: true
cSpell:ignore: bleh targetallocator
---

[OpenTelemetryオペレーター](/docs/platforms/kubernetes/operator/)上で[ターゲットアロケーター](/docs/platforms/kubernetes/operator/target-allocator/)のサービスディスカバリーを有効にしていて、ターゲットアロケーターがスクレイプ対象の検出に失敗した場合に、何が起きているのかを理解し、通常の動作を復元するためにいくつかのトラブルシューティング手順を実行できます。

## トラブルシューティング手順 {#troubleshooting-steps}

### すべてのリソースをKubernetesにデプロイしましたか？ {#did-you-deploy-all-of-your-resources-to-kubernetes}

最初のステップとして、関連するすべてのリソースがKubernetesクラスターにデプロイされていることを確認してください。

### メトリクスは実際にスクレイプされていますか？ {#do-you-know-if-metrics-are-actually-being-scraped}

すべてのリソースをKubernetesにデプロイしたら、ターゲットアロケーターが
[`ServiceMonitor`](https://prometheus-operator.dev/docs/getting-started/design/#servicemonitor)または[PodMonitor]からスクレイプ対象を検出していることを確認してください。

次のような `ServiceMonitor` の定義があるとします。

```yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: sm-example
  namespace: opentelemetry
  labels:
    app.kubernetes.io/name: py-prometheus-app
    release: prometheus
spec:
  selector:
    matchLabels:
      app: my-app
  namespaceSelector:
    matchNames:
      - opentelemetry
  endpoints:
    - port: prom
      path: /metrics
    - port: py-client-port
      interval: 15s
    - port: py-server-port
```

これは `Service` の定義です。

```yaml
apiVersion: v1
kind: Service
metadata:
  name: py-prometheus-app
  namespace: opentelemetry
  labels:
    app: my-app
    app.kubernetes.io/name: py-prometheus-app
spec:
  selector:
    app: my-app
    app.kubernetes.io/name: py-prometheus-app
  ports:
    - name: prom
      port: 8080
```

これは `OpenTelemetryCollector` の定義です。

```yaml
apiVersion: opentelemetry.io/v1beta1
kind: OpenTelemetryCollector
metadata:
  name: otelcol
  namespace: opentelemetry
spec:
  mode: statefulset
  targetAllocator:
    enabled: true
    serviceAccount: opentelemetry-targetallocator-sa
    prometheusCR:
      enabled: true
      podMonitorSelector: {}
      serviceMonitorSelector: {}
  config:
    receivers:
      otlp:
        protocols:
          grpc: {}
          http: {}
      prometheus:
        config:
          scrape_configs:
            - job_name: 'otel-collector'
              scrape_interval: 10s
              static_configs:
                - targets: ['0.0.0.0:8888']

    processors:
      batch: {}

    exporters:
      debug:
        verbosity: detailed

    service:
      pipelines:
        traces:
          receivers: [otlp]
          processors: [batch]
          exporters: [debug]
        metrics:
          receivers: [otlp, prometheus]
          processors: []
          exporters: [debug]
        logs:
          receivers: [otlp]
          processors: [batch]
          exporters: [debug]
```

まず、Kubernetesで `port-forward` を設定し、ターゲットアロケーターのサービスを公開できるようにします。

```shell
kubectl port-forward svc/otelcol-targetallocator -n opentelemetry 8080:80
```

`otelcol-targetallocator` は `OpenTelemetryCollector` CRの `metadata.name` の値と `-targetallocator` 接尾辞を連結したもので、`opentelemetry` は `OpenTelemetryCollector` CRがデプロイされている名前空間です。

{{% alert title="Tip" %}}

次のコマンドを実行してサービス名を取得することもできます。

```shell
kubectl get svc -l app.kubernetes.io/component=opentelemetry-targetallocator -n <namespace>
```

{{% /alert %}}

次に、ターゲットアロケーターに登録されているジョブのリストを取得します。

```shell
curl localhost:8080/jobs | jq
```

サンプル出力は次のようになります。

```json
{
  "serviceMonitor/opentelemetry/sm-example/1": {
    "_link": "/jobs/serviceMonitor%2Fopentelemetry%2Fsm-example%2F1/targets"
  },
  "serviceMonitor/opentelemetry/sm-example/2": {
    "_link": "/jobs/serviceMonitor%2Fopentelemetry%2Fsm-example%2F2/targets"
  },
  "otel-collector": {
    "_link": "/jobs/otel-collector/targets"
  },
  "serviceMonitor/opentelemetry/sm-example/0": {
    "_link": "/jobs/serviceMonitor%2Fopentelemetry%2Fsm-example%2F0/targets"
  },
  "podMonitor/opentelemetry/pm-example/0": {
    "_link": "/jobs/podMonitor%2Fopentelemetry%2Fpm-example%2F0/targets"
  }
}
```

`serviceMonitor/opentelemetry/sm-example/0` は、`ServiceMonitor` が取得した `Service` ポートのひとつを表しています。

- `opentelemetry` は `ServiceMonitor` リソースが存在する名前空間です。
- `sm-example` は `ServiceMonitor` の名前です。
- `0` は、`ServiceMonitor` と `Service` の間で一致するポートエンドポイントのひとつです。

同様に、`PodMonitor` は `curl` の出力で `podMonitor/opentelemetry/pm-example/0` として表示されます。

これは、スクレイプ構成の検出が機能していることを示す朗報です!

これは、(`otel-collector` という名前の)`OpenTelemetryCollector` リソースの `spec.config.receivers.prometheusReceiver` でセルフスクレイプが有効になっているためです。

```yaml
prometheus:
  config:
    scrape_configs:
      - job_name: 'otel-collector'
        scrape_interval: 10s
        static_configs:
          - targets: ['0.0.0.0:8888']
```

上記の `_link` の出力値に対して `curl` を実行して、`serviceMonitor/opentelemetry/sm-example/0` の詳細を確認し、どのスクレイプ対象が取得されているかを確認できます。

```shell
curl localhost:8080/jobs/serviceMonitor%2Fopentelemetry%2Fsm-example%2F0/targets | jq
```

サンプル出力

```json
{
  "otelcol-collector-0": {
    "_link": "/jobs/serviceMonitor%2Fopentelemetry%2Fsm-example%2F0/targets?collector_id=otelcol-collector-0",
    "targets": [
      {
        "targets": ["10.244.0.11:8080"],
        "labels": {
          "__meta_kubernetes_endpointslice_port_name": "prom",
          "__meta_kubernetes_pod_labelpresent_app_kubernetes_io_name": "true",
          "__meta_kubernetes_endpointslice_port_protocol": "TCP",
          "__meta_kubernetes_endpointslice_address_target_name": "py-prometheus-app-575cfdd46-nfttj",
          "__meta_kubernetes_endpointslice_annotation_endpoints_kubernetes_io_last_change_trigger_time": "2024-06-21T20:01:37Z",
          "__meta_kubernetes_endpointslice_labelpresent_app_kubernetes_io_name": "true",
          "__meta_kubernetes_pod_name": "py-prometheus-app-575cfdd46-nfttj",
          "__meta_kubernetes_pod_controller_name": "py-prometheus-app-575cfdd46",
          "__meta_kubernetes_pod_label_app_kubernetes_io_name": "py-prometheus-app",
          "__meta_kubernetes_endpointslice_address_target_kind": "Pod",
          "__meta_kubernetes_pod_node_name": "otel-target-allocator-talk-control-plane",
          "__meta_kubernetes_pod_labelpresent_pod_template_hash": "true",
          "__meta_kubernetes_endpointslice_label_kubernetes_io_service_name": "py-prometheus-app",
          "__meta_kubernetes_endpointslice_annotationpresent_endpoints_kubernetes_io_last_change_trigger_time": "true",
          "__meta_kubernetes_service_name": "py-prometheus-app",
          "__meta_kubernetes_pod_ready": "true",
          "__meta_kubernetes_pod_labelpresent_app": "true",
          "__meta_kubernetes_pod_controller_kind": "ReplicaSet",
          "__meta_kubernetes_endpointslice_labelpresent_app": "true",
          "__meta_kubernetes_pod_container_image": "otel-target-allocator-talk:0.1.0-py-prometheus-app",
          "__address__": "10.244.0.11:8080",
          "__meta_kubernetes_service_label_app_kubernetes_io_name": "py-prometheus-app",
          "__meta_kubernetes_pod_uid": "495d47ee-9a0e-49df-9b41-fe9e6f70090b",
          "__meta_kubernetes_endpointslice_port": "8080",
          "__meta_kubernetes_endpointslice_label_endpointslice_kubernetes_io_managed_by": "endpointslice-controller.k8s.io",
          "__meta_kubernetes_endpointslice_label_app": "my-app",
          "__meta_kubernetes_service_labelpresent_app_kubernetes_io_name": "true",
          "__meta_kubernetes_pod_host_ip": "172.24.0.2",
          "__meta_kubernetes_namespace": "opentelemetry",
          "__meta_kubernetes_endpointslice_endpoint_conditions_serving": "true",
          "__meta_kubernetes_endpointslice_labelpresent_kubernetes_io_service_name": "true",
          "__meta_kubernetes_endpointslice_endpoint_conditions_ready": "true",
          "__meta_kubernetes_service_annotation_kubectl_kubernetes_io_last_applied_configuration": "{\"apiVersion\":\"v1\",\"kind\":\"Service\",\"metadata\":{\"annotations\":{},\"labels\":{\"app\":\"my-app\",\"app.kubernetes.io/name\":\"py-prometheus-app\"},\"name\":\"py-prometheus-app\",\"namespace\":\"opentelemetry\"},\"spec\":{\"ports\":[{\"name\":\"prom\",\"port\":8080}],\"selector\":{\"app\":\"my-app\",\"app.kubernetes.io/name\":\"py-prometheus-app\"}}}\n",
          "__meta_kubernetes_endpointslice_endpoint_conditions_terminating": "false",
          "__meta_kubernetes_pod_container_port_protocol": "TCP",
          "__meta_kubernetes_pod_phase": "Running",
          "__meta_kubernetes_pod_container_name": "my-app",
          "__meta_kubernetes_pod_container_port_name": "prom",
          "__meta_kubernetes_pod_ip": "10.244.0.11",
          "__meta_kubernetes_service_annotationpresent_kubectl_kubernetes_io_last_applied_configuration": "true",
          "__meta_kubernetes_service_labelpresent_app": "true",
          "__meta_kubernetes_endpointslice_address_type": "IPv4",
          "__meta_kubernetes_service_label_app": "my-app",
          "__meta_kubernetes_pod_label_app": "my-app",
          "__meta_kubernetes_pod_container_port_number": "8080",
          "__meta_kubernetes_endpointslice_name": "py-prometheus-app-bwbvn",
          "__meta_kubernetes_pod_label_pod_template_hash": "575cfdd46",
          "__meta_kubernetes_endpointslice_endpoint_node_name": "otel-target-allocator-talk-control-plane",
          "__meta_kubernetes_endpointslice_labelpresent_endpointslice_kubernetes_io_managed_by": "true",
          "__meta_kubernetes_endpointslice_label_app_kubernetes_io_name": "py-prometheus-app"
        }
      }
    ]
  }
}
```

上記の出力の `_link` フィールドのクエリパラメータ `collector_id` は、これらのターゲットが `otelcol-collector-0` (`OpenTelemetryCollector` リソースのために作成された `StatefulSet` の名前) に関連することを示しています。

{{% alert title="Note" %}}

`/jobs` エンドポイントのより詳細な情報については、[ターゲットアロケーターのREADME](https://github.com/open-telemetry/opentelemetry-operator/blob/main/cmd/otel-allocator/README.md?plain=1#L128-L134)を参照してください。

{{% /alert %}}

### ターゲットアロケーターは有効ですか？Prometheusのサービスディスカバリーは有効ですか？ {#is-the-target-allocator-enabled-is-prometheus-service-discovery-enabled}

上記の `curl` コマンドで期待される `ServiceMonitor` や `PodMonitor` のリストが表示されない場合、それらの値を設定する機能が有効になっているかを確認する必要があります。

留意すべきことは、`OpenTelemetryCollector` CRに `targetAllocator` セクションを含めたからといって、それが有効になるわけではないということです。
ターゲットアロケーターは明示的に有効化する必要があります。
さらに、[Prometheusのサービスディスカバリー](https://github.com/open-telemetry/opentelemetry-operator/blob/main/cmd/otel-allocator/README.md#discovery-of-prometheus-custom-resources)を使用する場合は、明示的に有効化する必要があります。

- `spec.targetAllocator.enabled` を `true` に設定する
- `spec.targetAllocator.prometheusCR.enabled` を `true` に設定する

`OpenTelemetryCollector` リソースは次のようになります。

```yaml
apiVersion: opentelemetry.io/v1beta1
kind: OpenTelemetryCollector
metadata:
  name: otelcol
  namespace: opentelemetry
spec:
  mode: statefulset
  targetAllocator:
    enabled: true
    serviceAccount: opentelemetry-targetallocator-sa
    prometheusCR:
      enabled: true
```

完全な `OpenTelemetryCollector` [リソース定義については"メトリクスは実際にスクレイプされていますか？"](#do-you-know-if-metrics-are-actually-being-scraped)を参照してください。

### ServiceMonitor (または PodMonitor) のセレクターを設定しましたか？ {#did-you-configure-a-servicemonitor-or-podmonitor-selector}

[`ServiceMonitor`](https://observability.thomasriley.co.uk/prometheus/configuring-prometheus/using-service-monitors/)のセレクターを設定した場合、ターゲットアロケーターは[`serviceMonitorSelector`](https://github.com/open-telemetry/opentelemetry-operator/blob/main/docs/api/targetallocators.md#targetallocatorspecprometheuscrservicemonitorselector)の値と一致する `metadata.label` を持つ `ServiceMonitor` のみを探すことになります。

次の例のように、ターゲットアロケーターに[`serviceMonitorSelector`](https://github.com/open-telemetry/opentelemetry-operator/blob/main/docs/api/targetallocators.md#targetallocatorspecprometheuscrservicemonitorselector)を設定したとします。

```yaml
apiVersion: opentelemetry.io/v1beta1
kind: OpenTelemetryCollector
metadata:
  name: otelcol
  namespace: opentelemetry
spec:
  mode: statefulset
  targetAllocator:
    enabled: true
    serviceAccount: opentelemetry-targetallocator-sa
    prometheusCR:
      enabled: true
      serviceMonitorSelector:
        matchLabels:
          app: my-app
```

`app: my-app` に `spec.targetAllocator.prometheusCR.serviceMonitorSelector.matchLabels` の値を設定することで、`ServiceMonitor` リソースの `metadata.labels` にも同じ値が必要になります。

```yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: sm-example
  labels:
    app: my-app
    release: prometheus
spec:
```

完全な `ServiceMonitor` [リソース定義については"メトリクスは実際にスクレイプされていますか？"](#do-you-know-if-metrics-are-actually-being-scraped)を参照してください。

この場合、 `OpenTelemetryCollector` リソースの `prometheusCR.serviceMonitorSelector.matchLabels` は、前の例にあったように `app: my-app` ラベルを持つ `ServiceMonitor` のみを探します。

`ServiceMonitor` リソースにそのラベルがない場合、ターゲットアロケーターはその `ServiceMonitor` からスクレイプ対象を検出できません。

{{% alert title="Tip" %}}

[PodMonitor]を使用している場合も同様です。
その場合は、`serviceMonitorSelector` のかわりに [`podMonitorSelector`](https://github.com/open-telemetry/opentelemetry-operator/blob/main/docs/api/targetallocators.md#targetallocatorspecprometheuscr)を使用します。

{{% /alert %}}

### `serviceMonitorSelector` および/または `podMonitorSelector` の構成を完全に省略しましたか？ {#did-you-leave-out-the-servicemonitorselector-andor-podmonitorselector-configuration-altogether}

["ServiceMonitor (または PodMonitor) のセレクターを設定しましたか？"](#did-you-configure-a-servicemonitor-or-podmonitor-selector)で述べたように、`serviceMonitorSelector` と `podMonitorSelector` に一致しない値が設定されている場合、ターゲットアロケーターはそれぞれの `ServiceMonitor` と `PodMonitor` からスクレイプ対象を検出できなくなります。

同様に、`OpenTelemetryCollector` CRの[`v1beta1`](https://github.com/open-telemetry/opentelemetry-operator/blob/main/docs/api/opentelemetrycollectors.md#opentelemetryiov1beta1)では、この構成を完全に省略すると、ターゲットアロケーターは `ServiceMonitor` と `PodMonitor` からスクレイプ対象を検出できなくなります。

`OpenTelemetryCollector` の `v1beta1` では、`serviceMonitorSelector` と `podMonitorSelector` を使用する予定がない場合でも、次のように含める必要があります。

```yaml
prometheusCR:
  enabled: true
  podMonitorSelector: {}
  serviceMonitorSelector: {}
```

この構成は、すべての `PodMonitor` および `ServiceMonitor` リソースに一致することを意味します。
[完全なOpenTelemetryCollectorの定義については、"メトリクスは実際にスクレイプされていますか？ "](#do-you-know-if-metrics-are-actually-being-scraped)を参照してください。

### ServiceMonitorとService(または PodMonitor と Pod)のラベル、名前空間、ポートは一致していますか？ {#do-your-labels-namespaces-and-ports-match-for-your-servicemonitor-and-your-service-or-podmonitor-and-your-pod}

`ServiceMonitor` は、次の条件に一致するKubernetesの
[Service](https://kubernetes.io/docs/concepts/services-networking/service/)を取得するように構成されています。

- ラベル
- 名前空間 (optional)
- ポート (エンドポイント)

次のような `ServiceMonitor` があるとします。

```yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: sm-example
  labels:
    app: my-app
    release: prometheus
spec:
  selector:
    matchLabels:
      app: my-app
  namespaceSelector:
    matchNames:
      - opentelemetry
  endpoints:
    - port: prom
      path: /metrics
    - port: py-client-port
      interval: 15s
    - port: py-server-port
```

前述の `ServiceMonitor` は、次の条件に一致するサービスを探しています。

- ラベルが `app: my-app`
- `opentelemetry` という名前空間に存在する
- `prom`、`py-client-port`、_または_ `py-server-port` という名前のポート

たとえば、次の `Service` リソースは前述の条件に一致するため、`ServiceMonitor` によって取得されます。

```yaml
apiVersion: v1
kind: Service
metadata:
  name: py-prometheus-app
  namespace: opentelemetry
  labels:
    app: my-app
    app.kubernetes.io/name: py-prometheus-app
spec:
  selector:
    app: my-app
    app.kubernetes.io/name: py-prometheus-app
  ports:
    - name: prom
      port: 8080
```

次の `Service` リソースは、`ServiceMonitor` が `prom`、`py-client-port`、_または_ `py-server-port` という名前のポートを探していますが、このサービスのポートは `bleh` という名前であるため取得されません。

```yaml
apiVersion: v1
kind: Service
metadata:
  name: py-prometheus-app
  namespace: opentelemetry
  labels:
    app: my-app
    app.kubernetes.io/name: py-prometheus-app
spec:
  selector:
    app: my-app
    app.kubernetes.io/name: py-prometheus-app
  ports:
    - name: bleh
      port: 8080
```

{{% alert title="Tip" %}}

`PodMonitor` を使用している場合も同様に、ラベル、名前空間、およびポート名で一致するKubernetesのPodを取得します。

{{% /alert %}}

[PodMonitor]: https://prometheus-operator.dev/docs/developer/getting-started/#using-podmonitors
