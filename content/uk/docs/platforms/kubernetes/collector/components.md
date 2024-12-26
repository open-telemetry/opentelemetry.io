---
title: Важливі для Kubernetes компоненти
linkTitle: Компоненти
default_lang_commit: 5f551752635886a0d2d6b2a83e5a36866ca1b5f1
# prettier-ignore
cSpell:ignore: alertmanagers filelog horizontalpodautoscalers hostfs hostmetrics k8sattributes kubelet kubeletstats replicasets replicationcontrollers resourcequotas statefulsets varlibdockercontainers varlogpods
---

[OpenTelemetry Collector](/docs/collector/) підтримує багато різних приймачів та процесорів для полегшення моніторингу Kubernetes. У цьому розділі розглядаються компоненти, які є найважливішими для збору даних Kubernetes та їх покращення.

Компоненти, розглянуті на цій сторінці:

- [Процесор атрибутів Kubernetes](#kubernetes-attributes-processor): додає метадані Kubernetes до вхідної телеметрії застосунків.
- [Приймач kubeletstats](#kubeletstats-receiver): отримує метрики вузлів, podʼів та контейнерів з API сервера у kubelet.
- [Приймач filelog](#filelog-receiver): збирає логи Kubernetes та журнали застосунків, записані в stdout/stderr.
- [Приймач кластера Kubernetes](#kubernetes-cluster-receiver): збирає метрики на рівні кластера та події сутностей.
- [Приймач обʼєктів Kubernetes](#kubernetes-objects-receiver): збирає обʼєкти, такі як події, з API сервера Kubernetes.
- [Приймач Prometheus](#prometheus-receiver): отримує метрики у форматі [Prometheus](https://prometheus.io/).
- [Приймач метрик хосту](#host-metrics-receiver): збирає метрики хосту з вузлів Kubernetes.

Для трасування застосунків, метрик або журналів ми рекомендуємо [OTLP приймач](https://github.com/open-telemetry/opentelemetry-collector/tree/main/receiver/otlpreceiver), але будь-який приймач, що підходить для ваших даних, є відповідним.

## Процесор атрибутів Kubernetes {#kubernetes-attributes-processor}

| Шаблон розгортання | Підходить |
| ------------------ | --------- |
| DaemonSet (агент)  | Так       |
| Deployment (шлюз)  | Так       |
| Sidecar            | Ні        |

Процесор атрибутів Kubernetes автоматично виявляє podʼи Kubernetes, витягує їх метадані та додає витягнуті метадані до відрізків, метрик та журналів як атрибути ресурсів.

**Процесор атрибутів Kubernetes є одним з найважливіших компонентів для колектора, що працює в Kubernetes. Будь-який колектор, що отримує дані застосунків, повинен використовувати його.** Оскільки він додає контекст Kubernetes до вашої телеметрії, процесор атрибутів Kubernetes дозволяє вам корелювати трейси вашого застосунку, метрики та журнали з телеметрією Kubernetes, такою як метрики podʼів та трейси.

Процесор атрибутів Kubernetes використовує API Kubernetes для виявлення всіх podʼів, що працюють у кластері, і зберігає запис їх IP-адрес, UID podʼів та цікавих метаданих. Стандартно дані, що проходять через процесор, асоціюються з podʼом через IP-адресу вхідного запиту, але можуть бути налаштовані різні правила. Оскільки процесор використовує API Kubernetes, він потребує спеціальних дозволів (див. приклад нижче). Якщо ви використовуєте [Helm чарт OpenTelemetry Collector](/docs/platforms/kubernetes/helm/collector/), ви можете використовувати [пресет `kubernetesAttributes`](/docs/platforms/kubernetes/helm/collector/#kubernetes-attributes-preset) для початку роботи.

Наступні атрибути додаються стандартно:

- `k8s.namespace.name`
- `k8s.pod.name`
- `k8s.pod.uid`
- `k8s.pod.start_time`
- `k8s.deployment.name`
- `k8s.node.name`

Процесор атрибутів Kubernetes також може встановлювати власні атрибути користувачів ресурсів для трейсів, метрик та журналів, використовуючи мітки Kubernetes та анотації Kubernetes, які ви додали до своїх podʼів та просторів імен.

```yaml
k8sattributes:
  auth_type: 'serviceAccount'
  extract:
    metadata: # витягнуто з podʼа
      - k8s.namespace.name
      - k8s.pod.name
      - k8s.pod.start_time
      - k8s.pod.uid
      - k8s.deployment.name
      - k8s.node.name
    annotations:
      # Витягує значення анотації podʼа з ключем `annotation-one` та вставляє його як атрибут ресурсу з ключем `a1`
      - tag_name: a1
        key: annotation-one
        from: pod
      # Витягує значення анотації простору імен з ключем `annotation-two` з регулярним виразом та вставляє його як атрибут ресурсу з ключем `a2`
      - tag_name: a2
        key: annotation-two
        regex: field=(?P<value>.+)
        from: namespace
    labels:
      # Витягує значення мітки простору імен з ключем `label1` та вставляє його як атрибут ресурсу з ключем `l1`
      - tag_name: l1
        key: label1
        from: namespace
      # Витягує значення мітки podʼа з ключем `label2` з регулярним виразом та вставляє його як атрибут ресурсу з ключем `l2`
      - tag_name: l2
        key: label2
        regex: field=(?P<value>.+)
        from: pod
  pod_association: # Як асоціювати дані з podʼом (порядок має значення)
    - sources: # Спочатку спробуйте використовувати значення атрибуту ресурсу k8s.pod.ip
        - from: resource_attribute
          name: k8s.pod.ip
    - sources: # Потім спробуйте використовувати значення атрибуту ресурсу k8s.pod.uid
        - from: resource_attribute
          name: k8s.pod.uid
    - sources: # Якщо жоден з них не працює, використовуйте зʼєднання запиту для отримання IP podʼа.
        - from: connection
```

Існують також спеціальні параметри конфігурації для випадків, коли колектор розгортається як DaemonSet Kubernetes (агент) або як Deployment Kubernetes (шлюз). Для деталей дивіться [Сценарії розгортання](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/k8sattributesprocessor#deployment-scenarios)

Для деталей конфігурації процесора атрибутів Kubernetes дивіться [Процесор атрибутів Kubernetes](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/k8sattributesprocessor).

Оскільки процесор використовує API Kubernetes, він потребує правильних дозволів для коректної роботи. Для більшості випадків використання, ви повинні надати службовому обліковому запису, що запускає колектор, наступні дозволи через ClusterRole.

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

## Приймач kubeletstats {#kubeletstats-receiver}

| Шаблон розгортання | Підходить                                                            |
| ------------------ | -------------------------------------------------------------------- |
| DaemonSet (агент)  | Переважний                                                           |
| Deployment (шлюз)  | Так, але буде збирати метрики лише з вузла, на якому він розгорнутий |
| Sidecar            | Ні                                                                   |

Кожен вузол Kubernetes запускає kubelet, який включає API сервер. Приймач Kubernetes підключається до цього kubelet через API сервер для збору метрик про вузол та робочі навантаження, що працюють на вузлі.

Існують різні методи автентифікації, але зазвичай використовується службовий обліковий запис. Службовий обліковий запис також потребує правильних дозволів для отримання даних з Kubelet (див. нижче). Якщо ви використовуєте [Helm чарт OpenTelemetry Collector](/docs/platforms/kubernetes/helm/collector/), ви можете використовувати [пресет `kubeletMetrics`](/docs/platforms/kubernetes/helm/collector/#kubelet-metrics-preset) для початку роботи.

Стандартно метрики будуть збиратися для podʼів та вузлів, але ви можете налаштувати приймач для збору метрик контейнерів та томів. Приймач також дозволяє налаштувати як часто метрики збираються:

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

Для деталей про те, які метрики збираються, дивіться [Стандартні метрики](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/receiver/kubeletstatsreceiver/documentation.md). Для деталей конфігурації дивіться [Приймач kubeletstats](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/receiver/kubeletstatsreceiver).

Оскільки процесор використовує API Kubernetes, він потребує правильних дозволів для коректної роботи. Для більшості випадків використання, ви повинні надати службовому обліковому запису, що запускає колектор, наступні дозволи через ClusterRole.

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

## Приймач filelog {#filelog-receiver}

| Шаблон розгортання | Підходить                                                            |
| ------------------ | -------------------------------------------------------------------- |
| DaemonSet (агент)  | Переважний                                                           |
| Deployment (шлюз)  | Так, але буде збирати журнали лише з вузла, на якому він розгорнутий |
| Sidecar            | Так, але це буде вважатися складною конфігурацією                    |

Приймач filelog читає та аналізує журнали з файлів. Хоча це не специфічний для Kubernetes приймач, він все ще є де-факто рішенням для збору будь-яких журналів з Kubernetes.

Приймач filelog складається з операторів, які зʼєднуються разом для обробки журналу. Кожен оператор виконує просту відповідальність, таку як аналіз мітки часу або JSON. Налаштування приймача filelog не є тривіальним. Якщо ви використовуєте [Helm чарт OpenTelemetry Collector](/docs/platforms/kubernetes/helm/collector/), ви можете використовувати [пресет `logsCollection`](/docs/platforms/kubernetes/helm/collector/#logs-collection-preset) для початку роботи.

Оскільки журнали Kubernetes зазвичай відповідають набору стандартних форматів, типова конфігурація приймача filelog для Kubernetes виглядає так:

```yaml
filelog:
  include:
    - /var/log/pods/*/*/*.log
  exclude:
    # Виключити журнали з усіх контейнерів з назвою otel-collector
    - /var/log/pods/*/otel-collector/*.log
  start_at: end
  include_file_path: true
  include_file_name: false
  operators:
    # аналізувати журнали контейнерів
    - type: container
      id: container-parser
```

Для деталей конфігурації приймача filelog дивіться [Приймач filelog](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/filelogreceiver).

На додачу до конфігурації приймача filelog, ваша установка OpenTelemetry Collector в Kubernetes потребуватиме доступу до журналів, які вона хоче збирати. Зазвичай це означає додавання деяких томів та volumeMounts до вашого маніфесту колектора:

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
            # Монтувати томи до контейнера колектора
            - name: varlogpods
              mountPath: /var/log/pods
              readOnly: true
            - name: varlibdockercontainers
              mountPath: /var/lib/docker/containers
              readOnly: true
            ...
      volumes:
        ...
        # Зазвичай колектор потребує доступу до журналів podʼів та журналів контейнерів
        - name: varlogpods
          hostPath:
            path: /var/log/pods
        - name: varlibdockercontainers
          hostPath:
            path: /var/lib/docker/containers
        ...
```

## Приймач кластера Kubernetes {#kubernetes-cluster-receiver}

| Шаблон розгортання | Підходить                                                   |
| ------------------ | ----------------------------------------------------------- |
| DaemonSet (агент)  | Так, але призведе до дублювання даних                       |
| Deployment (шлюз)  | Так, але більше однієї репліки призведе до дублювання даних |
| Sidecar            | Ні                                                          |

Приймач кластера Kubernetes збирає метрики та події сутностей про кластер в цілому, використовуючи API сервер Kubernetes. Використовуйте цей приймач для відповідей на питання про фази podʼів, умови вузлів та інші питання на рівні кластера. Оскільки приймач збирає телеметрію для кластера в цілому, лише один екземпляр приймача потрібен у кластері для збору всіх даних.

Існують різні методи автентифікації, але зазвичай використовується службовий обліковий запис. Службовий обліковий запис також потребує правильних дозволів для отримання даних з API сервера Kubernetes (див. нижче). Якщо ви використовуєте [Helm чарт OpenTelemetry Collector](/docs/platforms/kubernetes/helm/collector/), ви можете використовувати [пресет `clusterMetrics`](/docs/platforms/kubernetes/helm/collector/#cluster-metrics-preset) для початку роботи.

Для умов вузлів приймач стандартно збирає лише `Ready`, але його можна налаштувати для збору більше. Приймач також можна налаштувати для звітування набору доступних ресурсів, таких як `cpu` та `memory`:

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

Щоб дізнатися більше про метрики, які збираються, дивіться [Стандартні метрики](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/receiver/k8sclusterreceiver/documentation.md). Для деталей конфігурації дивіться [Приймач кластера Kubernetes](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/k8sclusterreceiver).

Оскільки процесор використовує API Kubernetes, він потребує правильних дозволів для коректної роботи. Для більшості випадків використання, ви повинні надати службовому обліковому запису, що запускає колектор, наступні дозволи через ClusterRole.

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

## Приймач обʼєктів Kubernetes {#kubernetes-objects-receiver}

| Шаблон розгортання | Підходить                                                   |
| ------------------ | ----------------------------------------------------------- |
| DaemonSet (агент)  | Так, але призведе до дублювання даних                       |
| Deployment (шлюз)  | Так, але більше однієї репліки призведе до дублювання даних |
| Sidecar            | Ні                                                          |

Приймач обʼєктів Kubernetes збирає, або шляхом отримання, або спостереження, обʼєкти з API сервера Kubernetes. Найпоширеніший випадок використання цього приймача — це спостереження за подіями Kubernetes, але його можна використовувати для збору будь-якого типу обʼєктів Kubernetes. Оскільки приймач збирає телеметрію для кластера в цілому, лише один екземпляр приймача потрібен у кластері для збору всіх даних.

Наразі для автентифікації можна використовувати лише службовий обліковий запис. Службовий обліковий запис також потребує правильних дозволів для отримання даних з API сервера Kubernetes (див. нижче). Якщо ви використовуєте [Helm чарт OpenTelemetry Collector](/docs/platforms/kubernetes/helm/collector/) і хочете отримувати події, ви можете використовувати [пресет `kubernetesEvents`](/docs/platforms/kubernetes/helm/collector/#cluster-metrics-preset) для початку роботи.

Для обʼєктів, налаштованих для отримання, приймач буде використовувати API Kubernetes для періодичного отримання переліку всіх обʼєктів у кластері. Кожен обʼєкт буде перетворено на власний журнал. Для обʼєктів, налаштованих для спостереження, приймач створює потік з API Kubernetes, який отримує оновлення, коли обʼєкти змінюються.

Щоб побачити, які обʼєкти доступні для збору у вашому кластері, запустіть `kubectl api-resources`:

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

Для деталей конфігурації дивіться [Приймач обʼєктів Kubernetes](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/k8sobjectsreceiver).

Оскільки процесор використовує API Kubernetes, він потребує правильних дозволів для коректної роботи. Оскільки службові облікові записи є єдиним варіантом автентифікації, ви повинні надати службовому обліковому запису правильний доступ. Для будь-якого обʼєкта, який ви хочете забирати, ви повинні переконатися, що його назва додана до ролі кластера. Наприклад, якщо ви хочете забирати podʼи, то роль кластера буде виглядати так:

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

## Приймач Prometheus {#prometheus-receiver}

| Шаблон розгортання | Підходить |
| ------------------ | --------- |
| DaemonSet (агент)  | Так       |
| Deployment (шлюз)  | Так       |
| Sidecar            | Ні        |

Prometheus є загальним форматом метрик як для Kubernetes, так і для сервісів, що працюють на Kubernetes. Приймач Prometheus є мінімальною заміною для збору цих метрик. Він підтримує повний набір опцій [`scrape_config`](https://prometheus.io/docs/prometheus/latest/configuration/configuration/#scrape_config) Prometheus.

Існує кілька розширених функцій Prometheus, які приймач не підтримує. Приймач повертає помилку, якщо конфігурація YAML/код містить будь-що з наступного:

- `alert_config.alertmanagers`
- `alert_config.relabel_configs`
- `remote_read`
- `remote_write`
- `rule_files`

Для деталей конфігурації дивіться [Приймач Prometheus](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/prometheusreceiver).

Приймач Prometheus є [Stateful](https://github.com/open-telemetry/opentelemetry-collector/blob/main/docs/standard-warnings.md#statefulness), що означає, що є важливі деталі, які слід враховувати при його використанні:

- Колектор не може автоматично масштабувати процес збору при запуску кількох реплік колектора.
- При запуску кількох реплік колектора з однаковою конфігурацією, він буде збирати цілі кілька разів.
- Користувачі повинні налаштувати кожну репліку з різною конфігурацією збору, якщо вони хочуть вручну розподілити процес збору.

Щоб полегшити налаштування приймача Prometheus, OpenTelemetry Operator включає додатковий компонент з назвою [Target Allocator](../../operator/target-allocator). Цей компонент можна використовувати для вказівки колектору, які точки доступу Prometheus він повинен слухати.

Для отримання додаткової інформації про дизайн приймача дивіться [Дизайн](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/receiver/prometheusreceiver/DESIGN.md).

## Приймач метрик хосту {#host-metrics-receiver}

| Шаблон розгортання | Підходить                                                            |
| ------------------ | -------------------------------------------------------------------- |
| DaemonSet (агент)  | Переважний                                                           |
| Deployment (шлюз)  | Так, але буде збирати метрики лише з вузла, на якому він розгорнутий |
| Sidecar            | Ні                                                                   |

Приймач метрик хосту збирає метрики з хосту, використовуючи різні скрепери. Існує деякий перетин з [Приймачем kubeletstats](#kubeletstats-receiver), тому якщо ви вирішите використовувати обидва, можливо, варто відключити ці метрики, що дублюють одна одну.

У Kubernetes приймач потребує доступу до тому `hostfs` для коректної роботи. Якщо ви використовуєте [Helm чарт OpenTelemetry Collector](/docs/platforms/kubernetes/helm/collector/), ви можете використовувати [пресет `hostMetrics`](/docs/platforms/kubernetes/helm/collector/#host-metrics-preset) для початку роботи.

Доступні скрепери:

| Скрепер    | Підтримувані ОС       | Опис                                                               |
| ---------- | --------------------- | ------------------------------------------------------------------ |
| cpu        | Усі, крім macOS[^1]   | Метрики використання CPU                                           |
| disk       | Усі, крім macOS[^1]   | Метрики вводу/виводу диска                                         |
| load       | Усі                   | Метрики навантаження CPU                                           |
| filesystem | Усі                   | Метрики використання файлової системи                              |
| memory     | Усі                   | Метрики використання памʼяті                                       |
| network    | Усі                   | Метрики вводу/виводу мережевого інтерфейсу та метрики зʼєднань TCP |
| paging     | Усі                   | Метрики використання та вводу/виводу сторінкового простору/свопу   |
| processes  | Linux, macOS          | Метрики кількості процесів                                         |
| process    | Linux, Windows, macOS | Метрики CPU, памʼяті та вводу/виводу диска для кожного процесу     |

[^1]: Не підтримується у macOS, коли компілюється без cgo, що є стандартним для образів, випущених SIG колектора.

Для деталей про те, які метрики збираються та деталей конфігурації дивіться [Приймач метрик хосту](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/hostmetricsreceiver).

Якщо вам потрібно налаштувати компонент самостійно, переконайтеся, що ви монтуєте том `hostfs`, якщо ви хочете збирати метрики вузла, а не контейнера.

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

і потім налаштуйте приймач метрик хосту для використання `volumeMount`:

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

Для отримання додаткової інформації про використання приймача в контейнері дивіться [Збір метрик хосту зсередини контейнера (лише Linux)](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/hostmetricsreceiver#collecting-host-metrics-from-inside-a-container-linux-only)
