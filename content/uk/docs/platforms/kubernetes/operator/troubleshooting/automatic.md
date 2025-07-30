---
title: Автоінструментування
weight: 10
default_lang_commit: e05fefe6c9f7d8b159d9a9a95128098c646c78c4
cSpell:ignore: PYTHONPATH
---

Якщо ви використовуєте можливість [OpenTelemetry Operator](/docs/platforms/kubernetes/operator) робити інʼєкцію [автоінструментування](/docs/platforms/kubernetes/operator/automatic) і не бачите жодних трейсів або метрик, дотримуйтесь цих кроків з усунення несправностей, щоб зрозуміти, що відбувається.

## Кроки з усунення несправностей {#troubleshooting-steps}

### Перевірте статус встановлення {#check-install-status}

Після встановлення ресурсу `Instrumentation`, переконайтеся, що він встановлений правильно, виконавши цю команду:

```shell
kubectl describe otelinst -n <namespace>
```

Де `<namespace>` — це простір імен, в якому розгорнуто ресурс `Instrumentation`.

Ваш результат повинен виглядати так:

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

### Перевірте логи OpenTelemetry Operator {#check-the-opentelemetry-operator-logs}

Перевірте логи OpenTelemetry Operator на наявність помилок, виконавши цю команду:

```shell
kubectl logs -l app.kubernetes.io/name=opentelemetry-operator --container manager -n opentelemetry-operator-system --follow
```

Логи не повинні містити жодних помилок, повʼязаних з автоінструментуванням.

### Перевірте порядок розгортання {#check-deployment-order}

Переконайтеся, що порядок розгортання правильний. Ресурс `Instrumentation` повинен бути розгорнутий перед розгортанням відповідних ресурсів `Deployment`, які автоматично інструментуються.

Розгляньте наступний фрагмент анотації автоінструментування:

```yaml
annotations:
  instrumentation.opentelemetry.io/inject-python: 'true'
```

Коли pod запускається, анотація повідомляє оператору шукати ресурс `Instrumentation` у просторі імен podʼа та виконувати інʼєкцію Python автоінструментування в pod. Це додає [init-контейнер](https://kubernetes.io/docs/concepts/workloads/pods/init-containers/) з назвою `opentelemetry-auto-instrumentation` до podʼа застосунку, який потім використовується для інʼєкції автоінструментування в контейнер застосунку.

Що ви можете побачити, коли виконаєте:

```shell
kubectl describe pod <your_pod_name> -n <namespace>
```

Де `<namespace>` — це простір імен, в якому розгорнуто ваш pod. Вивід повинен виглядати як наступний приклад, який показує, як може виглядати специфікація podʼа після інʼєкції автоінструментування:

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

Якщо ресурс `Instrumentation` не присутній на момент розгортання ресурсу `Deployment`, `init-контейнер` не може бути створений. Це означає, що якщо ресурс `Deployment` розгорнуто перед тим, як ви розгорнули ресурс `Instrumentation`, автоінструментування не зможе ініціалізуватися.

Перевірте, чи `init-контейнер` `opentelemetry-auto-instrumentation` запустився правильно (або взагалі запустився), виконавши наступну команду:

```shell
kubectl get events -n <namespace>
```

Де `<namespace>` — це простір імен, в якому розгорнуто ваш pod. Вивід повинен виглядати як наступний приклад:

```text
53s         Normal   Created             pod/py-otel-server-7f54bf4cbc-p8wmj    Created container opentelemetry-auto-instrumentation
53s         Normal   Started             pod/py-otel-server-7f54bf4cbc-p8wmj    Started container opentelemetry-auto-instrumentation
```

Якщо у виводі відсутні записи `Created` або `Started` для `opentelemetry-auto-instrumentation`, можливо, є проблема з вашою конфігурацією автоінструментування. Це може бути результатом будь-чого з наступного:

- Ресурс `Instrumentation` не був встановлений або не був встановлений правильно.
- Ресурс `Instrumentation` був встановлений після розгортання застосунку.
- Є помилка в анотації автоінструментування або анотація знаходиться в неправильному місці. Дивіться наступний розділ.

Ви також можете перевірити вивід команди events на наявність помилок, оскільки вони можуть допомогти вказати на вашу проблему.

### Перевірте анотацію автоінструментування {#check-auto-instrumentation-annotation}

Розгляньте наступний фрагмент анотації автоінструментування:

```yaml
annotations:
  instrumentation.opentelemetry.io/inject-python: 'true'
```

Якщо ваш ресурс `Deployment` розгорнуто в просторі імен з назвою `application`, а у вас є ресурс `Instrumentation` з назвою `my-instrumentation`, який розгорнуто в просторі імен з назвою `opentelemetry`, то вищезгадана анотація не працюватиме.

Натомість анотація повинна бути:

```yaml
annotations:
  instrumentation.opentelemetry.io/inject-python: 'opentelemetry/my-instrumentation'
```

Де `opentelemetry` — це простір імен ресурсу `Instrumentation`, а `my-instrumentation` — це назва ресурсу `Instrumentation`.

[Можливі значення для анотації можуть бути](https://github.com/open-telemetry/opentelemetry-operator/blob/main/README.md?plain=1#L151-L156):

- "true" — робити інʼєкцію ресурсу `OpenTelemetryCollector` з простору імен.
- "sidecar-for-my-app" — назва екземпляра CR `OpenTelemetryCollector` в поточному просторі імен.
- "my-other-namespace/my-instrumentation" — назва та простір імен екземпляра CR `OpenTelemetryCollector` в іншому просторі імен.
- "false" — не виконувати інʼєкцію

### Перевірте конфігурацію автоінструментування {#check-the-auto-instrumentation-configuration}

Анотація автоінструментування могла бути додана неправильно. Перевірте наступне:

- Ви автоінструментуєте для правильної мови? Наприклад, ви намагалися автоінструментувати Python-застосунок, додавши анотацію автоінструментування JavaScript?
- Ви розмістили анотацію автоінструментування в правильному місці? Коли ви визначаєте ресурс `Deployment`, є два місця, де ви могли б додати анотації: `spec.metadata.annotations` і `spec.template.metadata.annotations`. Анотація автоінструментування повинна бути додана до `spec.template.metadata.annotations`, інакше вона не працює.

### Перевірте конфігурацію точки доступу автоінструментування {#check-auto-instrumentation-endpoint-configuration}

Конфігурація `spec.exporter.endpoint` в ресурсі `Instrumentation` дозволяє вам визначити місце призначення для ваших телеметричних даних. Якщо ви пропустите це, стандартно використовується `http://localhost:4317`, що призводить до втрати даних.

Якщо ви надсилаєте свої телеметричні дані до [Collector](/docs/collector/), значення `spec.exporter.endpoint` повинно посилатися на назву вашого Collector [`Service`](https://kubernetes.io/docs/concepts/services-networking/service/).

Наприклад: `http://otel-collector.opentelemetry.svc.cluster.local:4318`.

Де `otel-collector` — це назва сервісу Kubernetes OTel Collector [`Service`](https://kubernetes.io/docs/concepts/services-networking/service/).

Крім того, якщо Collector працює в іншому просторі імен, ви повинні додати `opentelemetry.svc.cluster.local` до назви сервісу Collector, де `opentelemetry` — це простір імен, в якому знаходиться Collector. Це може бути будь-який простір імен на ваш вибір.

Нарешті, переконайтеся, що ви використовуєте правильний порт Collector. Зазвичай ви можете вибрати або `4317` (gRPC), або `4318` (HTTP); однак для [Python автоінструментування ви можете використовувати тільки порт `4318`](/docs/platforms/kubernetes/operator/automatic/#python).

### Перевірте джерела конфігурації {#check-configuration-sources}

Автоінструментування наразі перевизначає `JAVA_TOOL_OPTIONS` для Java, `PYTHONPATH` для Python та `NODE_OPTIONS` для Node.js, коли вони встановлені в Docker-образі або визначені в `ConfigMap`. Це відома проблема, і тому ці методи встановлення цих змінних середовища слід уникати, поки проблема не буде вирішена.

Дивіться референсні проблеми для [Java](https://github.com/open-telemetry/opentelemetry-operator/issues/1814), [Python](https://github.com/open-telemetry/opentelemetry-operator/issues/1884) та [Node.js](https://github.com/open-telemetry/opentelemetry-operator/issues/1393).
