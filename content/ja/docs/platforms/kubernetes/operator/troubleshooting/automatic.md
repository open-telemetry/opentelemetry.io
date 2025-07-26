---
title: 自動計装
default_lang_commit: 99a39c5e4e51daba968bfbb3eb078be4a14ad363
cSpell:ignore: PYTHONPATH
---

[OpenTelemetryオペレーター](/docs/platforms/kubernetes/operator)の機能を使用して[自動計装](/docs/platforms/kubernetes/operator/automatic)を注入しているのにトレースやメトリクスが表示されない場合、以下のトラブルシューティング手順に従って何が起きているのかを理解してください。

## トラブルシューティング手順 {#troubleshooting-steps}

### インストール状態の確認 {#check-installation-status}

`Instrumentation` リソースをインストールしたあと、次のコマンドを実行して正しくインストールされていることを確認します。

```shell
kubectl describe otelinst -n <namespace>
```

ここでの `<namespace>` は、`Instrumentation` リソースがデプロイされている名前空間です。

出力は次のようになります。

```yaml
Name:         python-instrumentation
Namespace:    application
Labels:       app.kubernetes.io/managed-by=opentelemetry-operator
Annotations:  instrumentation.opentelemetry.io/default-auto-instrumentation-apache-httpd-image:
               ghcr.io/open-telemetry/opentelemetry-operator/autoinstrumentation-apache-httpd:1.0.3
             instrumentation.opentelemetry.io/default-auto-instrumentation-dotnet-image:
               ghcr.io/open-telemetry/opentelemetry-operator/autoinstrumentation-dotnet:0.7.0
             instrumentation.opentelemetry.io/default-auto-instrumentation-go-image:
               ghcr.io/open-telemetry/opentelemetry-go-instrumentation/autoinstrumentation-go:v0.2.1-alpha
             instrumentation.opentelemetry.io/default-auto-instrumentation-java-image:
               ghcr.io/open-telemetry/opentelemetry-operator/autoinstrumentation-java:1.26.0
             instrumentation.opentelemetry.io/default-auto-instrumentation-nodejs-image:
               ghcr.io/open-telemetry/opentelemetry-operator/autoinstrumentation-nodejs:0.40.0
             instrumentation.opentelemetry.io/default-auto-instrumentation-python-image:
               ghcr.io/open-telemetry/opentelemetry-operator/autoinstrumentation-python:0.39b0
API Version:  opentelemetry.io/v1alpha1
Kind:         Instrumentation
Metadata:
 Creation Timestamp:  2023-07-28T03:42:12Z
 Generation:          1
 Resource Version:    3385
 UID:                 646661d5-a8fc-4b64-80b7-8587c9865f53
Spec:
...
 Exporter:
   Endpoint:  http://otel-collector-collector.opentelemetry.svc.cluster.local:4318
...
 Propagators:
   tracecontext
   baggage
 Python:
   Image:  ghcr.io/open-telemetry/opentelemetry-operator/autoinstrumentation-python:0.39b0
   Resource Requirements:
     Limits:
       Cpu:     500m
       Memory:  32Mi
     Requests:
       Cpu:     50m
       Memory:  32Mi
 Resource:
 Sampler:
Events:  <none>
```

### OpenTelemetryオペレーターのログを確認する {#check-opentelemetry-operator-logs}

次のコマンドを実行して、OpenTelemetryオペレーターのログを確認します。

```shell
kubectl logs -l app.kubernetes.io/name=opentelemetry-operator --container manager -n opentelemetry-operator-system --follow
```

ログには自動計装に関するエラーは表示されていないはずです。

### デプロイ順序の確認 {#check-deployment-order}

デプロイ順序が正しいことを確認してください。
`Instrumentation` リソースは、自動計装された対応する `Deployment` リソースよりも前にデプロイする必要があります。

次のような自動計装アノテーションのスニペットを考えてみましょう。

```yaml
annotations:
  instrumentation.opentelemetry.io/inject-python: 'true'
```

Podが起動すると、アノテーションはオペレーションに対してPodの名前空間で `Instrumentation` リソースを探し、PodにPythonの自動計装を注入するように指示します。
これによりアプリケーションのPodに `opentelemetry-auto-instrumentation` という[Initコンテナ](https://kubernetes.io/docs/concepts/workloads/pods/init-containers/)が追加され、それがアプリケーションコンテナに自動計装を注入するために使用されます。

実行すると次のように表示されます。

```shell
kubectl describe pod <your_pod_name> -n <namespace>
```

ここでの `<namespace>` は、Podがデプロイされた名前空間です。

出力結果は次の例のようになり、これは自動計装注入後のPodの仕様がどのようになるかを示しています。

```text
Name:             py-otel-server-f89fdbc4f-mtsps
Namespace:        opentelemetry
Priority:         0
Service Account:  default
Node:             otel-target-allocator-talk-control-plane/172.24.0.2
Start Time:       Mon, 15 Jul 2024 17:23:45 -0400
Labels:           app=my-app
                  app.kubernetes.io/name=py-otel-server
                  pod-template-hash=f89fdbc4f
Annotations:      instrumentation.opentelemetry.io/inject-python: true
Status:           Running
IP:               10.244.0.10
IPs:
  IP:           10.244.0.10
Controlled By:  ReplicaSet/py-otel-server-f89fdbc4f
Init Containers:
  opentelemetry-auto-instrumentation-python:
    Container ID:  containerd://20ecf8766247e6043fcad46544dba08c3ef534ee29783ca552d2cf758a5e3868
    Image:         ghcr.io/open-telemetry/opentelemetry-operator/autoinstrumentation-python:0.45b0
    Image ID:      ghcr.io/open-telemetry/opentelemetry-operator/autoinstrumentation-python@sha256:3ed1122e10375d527d84c826728f75322d614dfeed7c3a8d2edd0d391d0e7973
    Port:          <none>
    Host Port:     <none>
    Command:
      cp
      -r
      /autoinstrumentation/.
      /otel-auto-instrumentation-python
    State:          Terminated
      Reason:       Completed
      Exit Code:    0
      Started:      Mon, 15 Jul 2024 17:23:51 -0400
      Finished:     Mon, 15 Jul 2024 17:23:51 -0400
    Ready:          True
    Restart Count:  0
    Limits:
      cpu:     500m
      memory:  32Mi
    Requests:
      cpu:        50m
      memory:     32Mi
    Environment:  <none>
    Mounts:
      /otel-auto-instrumentation-python from opentelemetry-auto-instrumentation-python (rw)
      /var/run/secrets/kubernetes.io/serviceaccount from kube-api-access-x2nmj (ro)
Containers:
  py-otel-server:
    Container ID:   containerd://95fb6d06b08ead768f380be2539a93955251be6191fa74fa2e6e5616036a8f25
    Image:          otel-target-allocator-talk:0.1.0-py-otel-server
    Image ID:       docker.io/library/import-2024-07-15@sha256:a2ed39e9a39ca090fedbcbd474c43bac4f8c854336a8500e874bd5b577e37c25
    Port:           8082/TCP
    Host Port:      0/TCP
    State:          Running
      Started:      Mon, 15 Jul 2024 17:23:52 -0400
    Ready:          True
    Restart Count:  0
    Environment:
      OTEL_NODE_IP:                                       (v1:status.hostIP)
      OTEL_POD_IP:                                        (v1:status.podIP)
      OTEL_METRICS_EXPORTER:                             console,otlp_proto_http
      OTEL_LOGS_EXPORTER:                                otlp_proto_http
      OTEL_PYTHON_LOGGING_AUTO_INSTRUMENTATION_ENABLED:  true
      PYTHONPATH:                                        /otel-auto-instrumentation-python/opentelemetry/instrumentation/auto_instrumentation:/otel-auto-instrumentation-python
      OTEL_TRACES_EXPORTER:                              otlp
      OTEL_EXPORTER_OTLP_TRACES_PROTOCOL:                http/protobuf
      OTEL_EXPORTER_OTLP_METRICS_PROTOCOL:               http/protobuf
      OTEL_SERVICE_NAME:                                 py-otel-server
      OTEL_EXPORTER_OTLP_ENDPOINT:                       http://otelcol-collector.opentelemetry.svc.cluster.local:4318
      OTEL_RESOURCE_ATTRIBUTES_POD_NAME:                 py-otel-server-f89fdbc4f-mtsps (v1:metadata.name)
      OTEL_RESOURCE_ATTRIBUTES_NODE_NAME:                 (v1:spec.nodeName)
      OTEL_PROPAGATORS:                                  tracecontext,baggage
      OTEL_RESOURCE_ATTRIBUTES:                          service.name=py-otel-server,service.version=0.1.0,k8s.container.name=py-otel-server,k8s.deployment.name=py-otel-server,k8s.namespace.name=opentelemetry,k8s.node.name=$(OTEL_RESOURCE_ATTRIBUTES_NODE_NAME),k8s.pod.name=$(OTEL_RESOURCE_ATTRIBUTES_POD_NAME),k8s.replicaset.name=py-otel-server-f89fdbc4f,service.instance.id=opentelemetry.$(OTEL_RESOURCE_ATTRIBUTES_POD_NAME).py-otel-server
    Mounts:
      /otel-auto-instrumentation-python from opentelemetry-auto-instrumentation-python (rw)
      /var/run/secrets/kubernetes.io/serviceaccount from kube-api-access-x2nmj (ro)
Conditions:
  Type              Status
  Initialized       True
  Ready             True
  ContainersReady   True
  PodScheduled      True
Volumes:
  kube-api-access-x2nmj:
    Type:                    Projected (a volume that contains injected data from multiple sources)
    TokenExpirationSeconds:  3607
    ConfigMapName:           kube-root-ca.crt
    ConfigMapOptional:       <nil>
    DownwardAPI:             true
  opentelemetry-auto-instrumentation-python:
    Type:        EmptyDir (a temporary directory that shares a pod's lifetime)
    Medium:
    SizeLimit:   200Mi
QoS Class:       Burstable
Node-Selectors:  <none>
Tolerations:     node.kubernetes.io/not-ready:NoExecute op=Exists for 300s
                 node.kubernetes.io/unreachable:NoExecute op=Exists for 300s
Events:
  Type    Reason     Age   From               Message
  ----    ------     ----  ----               -------
  Normal  Scheduled  99s   default-scheduler  Successfully assigned opentelemetry/py-otel-server-f89fdbc4f-mtsps to otel-target-allocator-talk-control-plane
  Normal  Pulling    99s   kubelet            Pulling image "ghcr.io/open-telemetry/opentelemetry-operator/autoinstrumentation-python:0.45b0"
  Normal  Pulled     93s   kubelet            Successfully pulled image "ghcr.io/open-telemetry/opentelemetry-operator/autoinstrumentation-python:0.45b0" in 288.756166ms (5.603779501s including waiting)
  Normal  Created    93s   kubelet            Created container opentelemetry-auto-instrumentation-python
  Normal  Started    93s   kubelet            Started container opentelemetry-auto-instrumentation-python
  Normal  Pulled     92s   kubelet            Container image "otel-target-allocator-talk:0.1.0-py-otel-server" already present on machine
  Normal  Created    92s   kubelet            Created container py-otel-server
  Normal  Started    92s   kubelet            Started container py-otel-server
```

`Deployment` リソースがデプロイされる時点で `Instrumentation` リソースが存在しない場合、`init-container` は作成できません。
つまり、`Instrumentation` リソースをデプロイする前に `Deployment` リソースをデプロイすると、自動計装の初期化に失敗します。

次のコマンドを実行して、`opentelemetry-auto-instrumentation` と `init-container` が正しく起動した（またはそもそも起動していない）ことを確認します。

```shell
kubectl get events -n <namespace>
```

ここでの `<namespace>` は、Podがデプロイされた名前空間です。
出力結果は次の例のようになります。

```text
53s         Normal   Created             pod/py-otel-server-7f54bf4cbc-p8wmj    Created container opentelemetry-auto-instrumentation
53s         Normal   Started             pod/py-otel-server-7f54bf4cbc-p8wmj    Started container opentelemetry-auto-instrumentation
```

出力の `opentelemetry-auto-instrumentation` に `Created` または `Started` のエントリがない場合、自動計装の構成に問題がある可能性があります。
これには、次のような原因が考えられます。

- `Instrumentation` リソースがインストールされていないか、正しくインストールされていない。
- `Instrumentation` リソースがアプリケーションのデプロイ後にインストールされた。
- 自動計装アノテーションにエラーがあるか、アノテーションが間違った場所にある。次のセクションを参照してください。

また、イベントコマンドの出力のエラーを確認することで、問題の原因を特定するのに役立つ場合があります。

### 自動計装アノテーションを確認する {#check-the-auto-instrumentation-annotation}

次のような自動計装アノテーションのスニペットを考えてみましょう。

```yaml
annotations:
  instrumentation.opentelemetry.io/inject-python: 'true'
```

`Deployment` リソースが `application` という名前空間にデプロイされていて、`my-instrumentation` という `Instrumentation` リソースが `opentelemetry` という名前空間にデプロイされている場合、上記のアノテーションは機能しません。

かわりに、アノテーションは次のようになります。

```yaml
annotations:
  instrumentation.opentelemetry.io/inject-python: 'opentelemetry/my-instrumentation'
```

ここでの `opentelemetry` は `Instrumentation` リソースの名前空間で、`my-instrumentation` は `Instrumentation` リソースの名前です。

[アノテーションに利用できる値は次のとおりです](https://github.com/open-telemetry/opentelemetry-operator/blob/main/README.md?plain=1#L151-L156)。

- "true" - 名前空間から `OpenTelemetryCollector` リソースを挿入する。
- "sidecar-for-my-app" - 現在の名前空間内の `OpenTelemetryCollector` カスタムリソースインスタンスの名前。
- "my-other-namespace/my-instrumentation" - 別の名前空間内の `OpenTelemetryCollector` カスタムリソースインスタンスの名前と名前空間。
- "false" - 挿入しない。

### 自動計装の構成を確認する {#check-auto-instrumentation-configuration}

自動計装アノテーションが正しく追加されていない可能性があります。
次のことを確認してください。

- 適切な言語で自動計装を行っていますか？
  たとえば、JavaScriptの自動計装アノテーションを追加して、Pythonアプリケーションを自動計装しようとしませんでしたか？
- 正しい場所に自動計装アノテーションを追加しましたか？
  `Deployment` リソースを定義する場合、アノテーションは `spec.metadata.annotations` と `spec.template.metadata.annotations` の2箇所に追加できます。
  自動計装アノテーションは `spec.template.metadata.annotations` に追加する必要があり、さもなければ機能しません。

### 自動計装エンドポイントの構成を確認する {#check-auto-instrumentation-endpoint-configuration}

`Instrumentation` リソースの `spec.exporter.endpoint` の設定で、テレメトリーデータの送信先を定義できます。
設定を省略した場合、デフォルトで `http://localhost:4317` に設定され、データは削除されます。

テレメトリーを[コレクター](/docs/collector/)に送信する場合、`spec.exporter.endpoint` の値はコレクターの[`Service`](https://kubernetes.io/docs/concepts/services-networking/service/)の名前を参照する必要があります。

例: `http://otel-collector.opentelemetry.svc.cluster.local:4318`

ここでの `otel-collector` は、コレクターの[`Service`](https://kubernetes.io/docs/concepts/services-networking/service/)の名前です。

さらに、コレクターが別の名前空間で実行されている場合、コレクターのサービス名に `opentelemetry.svc.cluster.local` を追加する必要があります。
ここでの `opentelemetry` はコレクターが存在する名前空間です。
任意の名前空間を選択できます。

最後に、正しいコレクターのポートを使用していることを確認してください。
通常、`4317` (gRPC) または `4318` (HTTP) を使用できますが、[Pythonの自動計装では `4318` のみを使用できます](/docs/platforms/kubernetes/operator/automatic/#python)。

### 構成ソースを確認する {#check-configuration-sources}

自動計装は現在、Dockerイメージ内で設定されているか、`ConfigMap` 内で定義されている場合、Javaの `JAVA_TOOL_OPTIONS`、Pythonの `PYTHONPATH`、Node.jsの `NODE_OPTIONS` を上書きします。
これは既知の問題であるため、問題が解決されるまではこれらの環境変数を設定する方法は避ける必要があります。

[Java](https://github.com/open-telemetry/opentelemetry-operator/issues/1814)、
[Python](https://github.com/open-telemetry/opentelemetry-operator/issues/1884)、
および
[Node.js](https://github.com/open-telemetry/opentelemetry-operator/issues/1393)
の問題を参照してください。
