---
title: Розподільник цілей
weight: 30
default_lang_commit: 5489ba34bff91356aa2c501cd55f07eeb30cc355
cSpell:ignore: bleh podmonitor podmonitorselector targetallocator
---

Якщо ви ввімкнули [Розподільник цілей](/docs/platforms/kubernetes/operator/target-allocator/) для виявлення сервісів у [OpenTelemetry Operator](/docs/platforms/kubernetes/operator), і Розподільник цілей не може виявити цілі для збору метрик, є кілька кроків для усунення несправностей, які ви можете виконати, щоб зрозуміти, що відбувається, і відновити нормальну роботу.

## Кроки для усунення несправностей {#troubleshooting-steps}

### Ви розгорнули всі свої ресурси в Kubernetes? {#did-you-deploy-all-your-resources-to-kubernetes}

Як перший крок, переконайтеся, що ви розгорнули всі відповідні ресурси у вашому кластері Kubernetes.

### Чи метрики дійсно збираються? {#do-you-know-if-metrics-are-actually-being-scraped}

Після того, як ви розгорнули всі свої ресурси в Kubernetes, переконайтеся, що Розподільник цілей виявляє цілі для збору метрик з вашого [`ServiceMonitor`](https://prometheus-operator.dev/docs/getting-started/design/#servicemonitor)(ів) або [`PodMonitor`][PodMonitor](ів).

Припустимо, у вас є таке визначення `ServiceMonitor`:

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

та таке визначення `Service`:

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

та таке визначення `OpenTelemetryCollector`:

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

    exporters:
      debug:
        verbosity: detailed

    service:
      pipelines:
        traces:
          receivers: [otlp]
          exporters: [debug]
        metrics:
          receivers: [otlp, prometheus]
          exporters: [debug]
        logs:
          receivers: [otlp]
          exporters: [debug]
```

Спочатку налаштуйте `port-forward` у Kubernetes, щоб ви могли експонувати сервіс Розподільника цілей:

```shell
kubectl port-forward svc/otelcol-targetallocator -n opentelemetry 8080:80
```

Де `otelcol-targetallocator` — це значення `metadata.name` у вашому `OpenTelemetryCollector` CR, до якого додано суфікс `-targetallocator`, а `opentelemetry` — це простір імен, до якого розгорнуто `OpenTelemetryCollector` CR.

> [!TIP]
>
> Ви також можете отримати імʼя сервісу, виконавши
>
> ```shell
> kubectl get svc -l app.kubernetes.io/component=opentelemetry-targetallocator -n <namespace>
> ```

Далі отримайте список завдань, зареєстрованих у Розподільнику цілей:

```shell
curl localhost:8080/jobs | jq
```

Ваш зразок вихідних даних повинен виглядати так:

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

Де `serviceMonitor/opentelemetry/sm-example/0` представляє один з портів сервісу, який виявив `ServiceMonitor`:

- `opentelemetry` — це простір імен, у якому знаходиться ресурс `ServiceMonitor`.
- `sm-example` — це імʼя `ServiceMonitor`.
- `0` — це один з портів, що відповідають між `ServiceMonitor` та `Service`.

Аналогічно, `PodMonitor` зʼявляється як `podMonitor/opentelemetry/pm-example/0` у вихідних даних `curl`.

Це хороша новина, оскільки це означає, що виявлення конфігурації збору метрик працює!

Ви також можете цікавитися записом `otel-collector`. Це відбувається тому, що `spec.config.receivers.prometheusReceiver` у ресурсі `OpenTelemetryCollector` (названому `otel-collector`) має ввімкнене самозбирання:

```yaml
prometheus:
  config:
    scrape_configs:
      - job_name: 'otel-collector'
        scrape_interval: 10s
        static_configs:
          - targets: ['0.0.0.0:8888']
```

Ми можемо детальніше розглянути `serviceMonitor/opentelemetry/sm-example/0`, щоб побачити, які цілі для збору метрик виявляються, виконавши `curl` за значенням поля `_link` у наведених вище вихідних даних:

```shell
curl localhost:8080/jobs/serviceMonitor%2Fopentelemetry%2Fsm-example%2F0/targets | jq
```

Зразок вихідних даних:

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

Параметр запиту `collector_id` у полі `_link` наведених вище вихідних даних вказує, що це цілі, що належать до `otelcol-collector-0` (імʼя `StatefulSet`, створеного для ресурсу `OpenTelemetryCollector`).

> [!NOTE]
>
> Дивіться [readme Розподільника цілей](https://github.com/open-telemetry/opentelemetry-operator/blob/main/cmd/otel-allocator/README.md?plain=1#L128-L134) для отримання додаткової інформації про точку доступу `/jobs`.

### Чи ввімкнено Розподільник цілей? Чи ввімкнено виявлення сервісів Prometheus? {#is-the-target-allocator-enabled-is-prometheus-service-discovery-enabled}

Якщо команди `curl`, наведені вище, не показують список очікуваних `ServiceMonitor`ів та
`PodMonitor`ів, вам потрібно перевірити, чи ввімкнено функції, які заповнюють ці значення.

Одне, що потрібно памʼятати, це те, що додавання розділу `targetAllocator` у `OpenTelemetryCollector` CR не означає, що він увімкнений. Вам потрібно явно його ввімкнути. Крім того, якщо ви хочете використовувати [виявлення сервісів Prometheus](https://github.com/open-telemetry/opentelemetry-operator/blob/main/cmd/otel-allocator/README.md#discovery-of-prometheus-custom-resources), ви повинні явно його ввімкнути:

- Встановіть `spec.targetAllocator.enabled` у `true`
- Встановіть `spec.targetAllocator.prometheusCR.enabled` у `true`

Таким чином, ваш ресурс `OpenTelemetryCollector` виглядатиме так:

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

Дивіться повне визначення ресурсу `OpenTelemetryCollector` [у розділі "Чи дійсно збираються метрики?"](#do-you-know-if-metrics-are-actually-being-scraped).

### Ви налаштували селектор ServiceMonitor (або PodMonitor)? {#did-you-configure-a-servicemonitor-or-podmonitor-selector}

Якщо ви налаштували [`ServiceMonitor`](https://observability.thomasriley.co.uk/prometheus/configuring-prometheus/using-service-monitors/) селектор, це означає, що Розподільник цілей шукає лише `ServiceMonitor`и з `metadata.label`, що відповідає значенню в [`serviceMonitorSelector`](https://github.com/open-telemetry/opentelemetry-operator/blob/main/docs/api/targetallocators.md#targetallocatorspecprometheuscrservicemonitorselector).

Припустимо, ви налаштували [`serviceMonitorSelector`](https://github.com/open-telemetry/opentelemetry-operator/blob/main/docs/api/targetallocators.md#targetallocatorspecprometheuscrservicemonitorselector) для вашого Розподільника цілей, як у наступному прикладі:

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

Встановивши значення `spec.targetAllocator.prometheusCR.serviceMonitorSelector.matchLabels` на `app: my-app`, це означає, що ваш ресурс `ServiceMonitor` повинен мати те саме значення в `metadata.labels`:

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

Дивіться повне визначення ресурсу `ServiceMonitor` [у розділі "Чи дійсно збираються метрики?"](#do-you-know-if-metrics-are-actually-being-scraped).

У цьому випадку ресурс `OpenTelemetryCollector` `prometheusCR.serviceMonitorSelector.matchLabels` шукає лише `ServiceMonitor`и з міткою `app: my-app`, яку ми бачимо в попередньому прикладі.

Якщо ваш ресурс `ServiceMonitor` не має цієї мітки, то Розподільник цілей не зможе виявити цілі для збору метрик з цього `ServiceMonitor`.

> [!TIP]
>
> Те ж саме стосується, якщо ви використовуєте [PodMonitor]. У цьому випадку ви б використовували [`podMonitorSelector`] замість `serviceMonitorSelector`.

### Ви взагалі не включили конфігурацію serviceMonitorSelector та/або podMonitorSelector? {#did-you-leave-out-the-servicemonitorselector-andor-podmonitorselector-configuration}

Як зазначено в ["Ви налаштували селектор ServiceMonitor або PodMonitor"](#did-you-configure-a-servicemonitor-or-podmonitor-selector), встановлення невідповідних значень для `serviceMonitorSelector` та `podMonitorSelector` призводить до того, що Розподільник цілей не може виявити цілі для збору метрик з ваших `ServiceMonitor`ів та `PodMonitor`ів відповідно.

Аналогічно, у [`v1beta1`](https://github.com/open-telemetry/opentelemetry-operator/blob/main/docs/api/opentelemetrycollectors.md#opentelemetryiov1beta1) `OpenTelemetryCollector` CR, відсутність цієї конфігурації взагалі також призводить до того, що Розподільник цілей не може виявити цілі для збору метрик з ваших `ServiceMonitor`ів та `PodMonitor`ів.

У версії `v1beta1` `OpenTelemetryOperator`, `serviceMonitorSelector` та `podMonitorSelector` повинні бути включені, навіть якщо ви не маєте наміру їх використовувати, як це:

```yaml
prometheusCR:
  enabled: true
  podMonitorSelector: {}
  serviceMonitorSelector: {}
```

Ця конфігурація означає, що вона буде відповідати всім ресурсам `PodMonitor` та
`ServiceMonitor`. Дивіться [повне визначення OpenTelemetryCollector у розділі "Чи дійсно збираються метрики?"](#do-you-know-if-metrics-are-actually-being-scraped).

### Чи мають збіг ваші мітки, простори імен та порти для вашого ServiceMonitor та вашого Service (або PodMonitor та вашого Podʼа)? {#do-your-labels-namespaces-and-ports-match-for-your-servicemonitor-and-your-service-or-podmonitor-and-your-pod}

`ServiceMonitor` налаштований на виявлення Kubernetes [Сервісів](https://kubernetes.io/docs/concepts/services-networking/service/), які відповідають:

- Міткам
- Просторам імен (необовʼязково)
- Портам (точки доступу)

Припустимо, у вас є такий `ServiceMonitor`:

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

Попередній `ServiceMonitor` шукає будь-які сервіси, які мають:

- мітку `app: my-app`
- знаходяться у просторі імен з назвою `opentelemetry`
- порт з назвою `prom`, `py-client-port` або `py-server-port`

Наприклад, наступний ресурс `Service` буде виявлений `ServiceMonitor`, оскільки він відповідає попереднім критеріям:

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

Наступний ресурс `Service` не буде виявлений, оскільки `ServiceMonitor` шукає порти з назвою `prom`, `py-client-port` або `py-server-port`, а порт цього сервісу називається `bleh`.

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

> [!TIP]
>
> Якщо ви використовуєте `PodMonitor`, те ж саме стосується, за винятком того, що він виявляє Kubernetes podʼи, які відповідають міткам, просторам імен та названим портам.

[`podMonitorSelector`]: https://github.com/open-telemetry/opentelemetry-operator/blob/main/docs/api/targetallocators.md#targetallocatorspecprometheuscr
[PodMonitor]: https://prometheus-operator.dev/docs/developer/getting-started/#using-podmonitors
