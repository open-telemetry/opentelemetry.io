---
title: 水平Pod自動スケーリング
description: OpenTelemetryコレクターの水平Pod自動スケーリングを設定する
default_lang_commit: c392c714849921cd56aca8ca99ab11e0e4cb16f4
cSpell:ignore: autoscaler statefulset
---

OpenTelemetryオペレーターによって管理されるコレクターは、[水平Pod自動スケーリング(HPA)](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/)をビルトインでサポートしています。
HPAは、一連のメトリクスに基づいて、KubernetesのPodのレプリカ（コピー）の数を増減させます。
これらのメトリクスは通常、CPUやメモリの使用量です。
OpenTelemetryオペレーターがコレクターのHPA機能を管理することで、コレクターの自動スケーリングのために別のKubernetes `HorizontalPodAutoscaler` リソースを作成する必要がなくなります。

HPAはKubernetesの `StatefulSet` と `Deployment` にのみ適用されるため、コレクターの `spec.mode` が `deployment` または `statefulset` のいずれかであることを確認してください。

{{% alert title="Note" %}}
HPAは、Kubernetesクラスターで実行されている[Metrics Server](https://github.com/kubernetes-sigs/metrics-server)を必要とします。

- [GKE (Google)](https://cloud.google.com/kubernetes-engine?hl=en)や[AKS (Microsoft Azure)](https://azure.microsoft.com/en-us/products/kubernetes-service)などのマネージドKubernetesクラスターは、クラスターのプロビジョニングの一環としてMetrics Serverを自動的にインストールします。
- [EKS (AWS)にはデフォルトでMetrics Serverはインストールされていません](https://docs.aws.amazon.com/eks/latest/userguide/metrics-server.html)。
- マネージドでないKuberentesクラスターやローカルデスクトップのKubernetesクラスター(たとえば[MiniKube](https://minikube.sigs.k8s.io/docs/)、
  [KinD](https://kind.sigs.k8s.io/)、[k0s](https://k0sproject.io))では、Metrics Serverを手動でインストールする必要があります。

管理するKubernetesクラスターにMetrics Serverが事前にインストールされているかどうかを確認するには、クラウドプロバイダーのドキュメントを参照してください。
{{% /alert %}}

HPAを構成するには、まず `OpenTelemetryCollector` のYAMLに `spec.resources` 設定を追加して、リソースの要求と制限を定義する必要があります。

```yaml
resources:
  limits:
    cpu: 100m
    memory: 128Mi
  requests:
    cpu: 100m
    memory: 64Mi
```

{{% alert title="Note" %}} あなた自身の価値観は異なるかもしれません。 {{% /alert %}}

`limits` 設定には、メモリとCPUの最大値が指定されます。
このケースでは、これらの制限はCPUの100ミリコア（0.1コア）とRAMの128Mi（メビバイト、1メビバイト == 1024キロバイト）です。

`requests` 設定には、コンテナに割り当てが保証されるリソースの最小量が指定されます。
このケースでは、最小の割り当ては、100ミリコアのCPUと64メビバイトのRAMです。

次に、`OpenTelemetryCollector` のYAMLに `spec.autoscaler` 設定を追加して、自動スケーリングルールを構成します。

```yaml
autoscaler:
  minReplicas: 1
  maxReplicas: 2
  targetCPUUtilization: 50
  targetMemoryUtilization: 60
```

{{% alert title="Note" %}} あなた自身の価値観は異なるかもしれません。 {{% /alert %}}

すべてをまとめると、`OpenTelemetryCollector` のYAMLの始まりは次のようになります。

```yaml
apiVersion: opentelemetry.io/v1beta1
kind: OpenTelemetryCollector
metadata:
  name: otelcol
  namespace: opentelemetry
spec:
  mode: statefulset
  image: otel/opentelemetry-collector-contrib:{{% version-from-registry
    collector-processor-batch %}}
  serviceAccount: otelcontribcol
  autoscaler:
    minReplicas: 1
    maxReplicas: 2
    targetCPUUtilization: 50
    targetMemoryUtilization: 60
  resources:
    limits:
      cpu: 100m
      memory: 128Mi
    requests:
      cpu: 100m
      memory: 64Mi
```

HPAを有効にして `OpenTelemetryCollector` をKubernetesにデプロイすると、オペレーターはKubernetes内のコレクター用に `HorizontalPodAutoscaler` リソースを作成します。
これを確認するには、次のコマンドを実行します。

`kubectl get hpa -n <your_namespace>`

すべてが期待通りに動作した場合、コマンドの出力は次のようになります。

```nocode
NAME                REFERENCE                        TARGETS                         MINPODS   MAXPODS   REPLICAS   AGE
otelcol-collector   OpenTelemetryCollector/otelcol   memory: 68%/60%, cpu: 37%/50%   1         3         2          77s
```

より詳細な情報を得るには、次のコマンドを実行してHPAリソースの説明を取得できます。

`kubectl describe hpa <your_collector_name> -n <your_namespace>`

すべてが期待通りに動作した場合、コマンドの出力は次のようになります。

```nocode
Name:                                                     otelcol-collector
Namespace:                                                opentelemetry
Labels:                                                   app.kubernetes.io/benchmark-test=otelcol-contrib
                                                          app.kubernetes.io/component=opentelemetry-collector
                                                          app.kubernetes.io/destination=dynatrace
                                                          app.kubernetes.io/instance=opentelemetry.otelcol
                                                          app.kubernetes.io/managed-by=opentelemetry-operator
                                                          app.kubernetes.io/name=otelcol-collector
                                                          app.kubernetes.io/part-of=opentelemetry
                                                          app.kubernetes.io/version=0.126.0
Annotations:                                              <none>
CreationTimestamp:                                        Mon, 02 Jun 2025 17:23:52 +0000
Reference:                                                OpenTelemetryCollector/otelcol
Metrics:                                                  ( current / target )
  resource memory on pods  (as a percentage of request):  71% (95779498666m) / 60%
  resource cpu on pods  (as a percentage of request):     12% (12m) / 50%
Min replicas:                                             1
Max replicas:                                             3
OpenTelemetryCollector pods:                              3 current / 3 desired
Conditions:
  Type            Status  Reason            Message
  ----            ------  ------            -------
  AbleToScale     True    ReadyForNewScale  recommended size matches current size
  ScalingActive   True    ValidMetricFound  the HPA was able to successfully calculate a replica count from memory resource utilization (percentage of request)
  ScalingLimited  True    TooManyReplicas   the desired replica count is more than the maximum replica count
Events:
  Type     Reason                   Age                  From                       Message
  ----     ------                   ----                 ----                       -------
  Warning  FailedGetResourceMetric  2m (x4 over 2m29s)   horizontal-pod-autoscaler  unable to get metric memory: no metrics returned from resource metrics API
  Warning  FailedGetResourceMetric  89s (x7 over 2m29s)  horizontal-pod-autoscaler  No recommendation
  Normal   SuccessfulRescale        89s                  horizontal-pod-autoscaler  New size: 2; reason: memory resource utilization (percentage of request) above target
  Normal   SuccessfulRescale        59s                  horizontal-pod-autoscaler  New size: 3; reason: memory resource utilization (percentage of request) above target
```
