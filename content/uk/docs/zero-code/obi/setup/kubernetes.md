---
title: Розгортання OBI в Kubernetes
linkTitle: Kubernetes
description: Дізнайтеся, як розгорнути OBI в Kubernetes.
weight: 4
default_lang_commit: 5f551752635886a0d2d6b2a83e5a36866ca1b5f1
# prettier-ignore
cSpell:ignore: cap_perfmon confuration containerd goblog kubeadm microk8s replicaset statefulset
---

> [!NOTE]
>
> Цей документ пояснює, як вручну розгорнути OBI в Kubernetes, налаштувавши всі необхідні сутності самостійно.
>
> <!-- Ви можете скористатися документацією [Розгортання OBI в Kubernetes за допомогою Helm](../kubernetes-helm/). -->

## Налаштування декорування метаданих Kubernetes {#configuring-kubernetes-metadata-decoration}

OBI може декорувати ваші трейси наступними мітками Kubernetes:

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

Щоб увімкнути декорування метаданих, вам потрібно:

- Створити ServiceAccount і привʼязати ClusterRole, що надає права list і watch для Pods і ReplicaSets. Ви можете зробити це, розгорнувши цей приклад файлу:

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

  (Вам потрібно змінити значення `namespace: default`, якщо ви розгортаєте OBI в іншому просторі імен).

- Налаштуйте OBI за допомогою змінної середовища `OTEL_EBPF_KUBE_METADATA_ENABLE=true` або конфігурації YAML `attributes.kubernetes.enable: true`.

- Не забудьте вказати властивість `serviceAccountName: obi` у вашому Pod OBI (як показано в наступних прикладах розгортання).

Додатково, виберіть, які сервіси Kubernetes інструментувати в розділі `discovery -> instrument` файлу конфігурації YAML. Для отримання додаткової інформації зверніться до розділу _Service discovery_ в [документі конфігурації](../../configure/options/), а також до розділу [Надання зовнішнього файлу конфігурації](#providing-an-external-configuration-file) цієї сторінки.

## Розгортання OBI {#deploying-obi}

Ви можете розгорнути OBI в Kubernetes двома різними способами:

- Як контейнер-sidecar
- Як DaemonSet

### Розгортання OBI як контейнера-sidecar {#deploy-obi-as-a-sidecar-container}

Це спосіб, яким ви можете розгорнути OBI, якщо хочете моніторити певний сервіс, який може бути не розгорнутий на всіх хостах, тому вам потрібно розгорнути лише один екземпляр OBI для кожного екземпляра сервісу.

Розгортання OBI як контейнера-sidecar має такі вимоги до конфігурації:

- Простір імен процесу повинен бути спільним між усіма контейнерами в Pod (`shareProcessNamespace: true` змінна pod).
- Контейнер автоматичного інструментування повинен працювати в режимі привілейованого доступу (`securityContext.privileged: true` властивість конфігурації контейнера).
  - Деякі установки Kubernetes дозволяють наступну конфігурацію `securityContext`, але вона може не працювати з усіма конфігураціями контейнерного середовища, оскільки деякі з них обмежують контейнери та видаляють деякі дозволи:

    ```yaml
    securityContext:
      runAsUser: 0
      capabilities:
        add:
          - SYS_ADMIN
          - SYS_RESOURCE # не потрібно для ядер 5.11+
    ```

Наступний приклад інструментує Pod `goblog`, приєднуючи OBI як контейнер (образ доступний за адресою `otel/ebpf-instrument:main`). Інструмент автоматичного інструментування налаштований на пересилання метрик і трейсів до OpenTelemetry Collector, який доступний за сервісом `otelcol` в тому ж просторі імен:

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
      # Потрібно, щоб інструмент контейнера-sidecar міг отримати доступ до процесу сервіса
      shareProcessNamespace: true
      serviceAccountName: obi # необхідно, якщо ви хочете декорувати метадані Kubernetes
      containers:
        # Контейнер для інструментованого сервісу
        - name: goblog
          image: mariomac/goblog:dev
          imagePullPolicy: IfNotPresent
          command: ['/goblog']
          ports:
            - containerPort: 8443
              name: https
        # Контейнер-sidecar з OBI - інструмент автоматичного інструментування eBPF
        - name: obi
          image: otel/ebpf-instrument:main
          securityContext: # Привілеї потрібні для встановлення eBPF-проб
            privileged: true
          env:
            # Внутрішній порт контейнера застосунку goblog
            - name: OTEL_EBPF_OPEN_PORT
              value: '8443'
            - name: OTEL_EXPORTER_OTLP_ENDPOINT
              value: 'http://otelcol:4318'
              # необхідно, якщо ви хочете декорувати метадані Kubernetes
            - name: OTEL_EBPF_KUBE_METADATA_ENABLE
              value: 'true'
```

Для отримання додаткової інформації про різні параметри конфігурації перегляньте розділ [Конфігурація](../../configure/options/) цієї документації.

### Розгортання OBI як Daemonset {#deploy-obi-as-a-daemonset}

Ви також можете розгорнути OBI як Daemonset. Це переважний спосіб, якщо:

- Ви хочете інструментувати Daemonset
- Ви хочете інструментувати кілька процесів з одного екземпляра OBI, або навіть всі процеси у вашому кластері.

Використовуючи попередній приклад (Pod `goblog`), ми не можемо вибрати процес для інструментування, використовуючи його відкритий порт, оскільки порт є внутрішнім для Pod. В той же час кілька екземплярів сервісу матимуть різні відкриті порти. У цьому випадку нам потрібно буде інструментувати, використовуючи сервіс застосунку та імʼя виконуваного файлу (див. наступний приклад).

На додачу до вимог щодо привілеїв сценарію контейнера-sidecar, вам потрібно буде налаштувати шаблон пода автоматичного інструментування з увімкненою опцією `hostPID: true`, щоб він міг отримати доступ до всіх процесів, що працюють на одному хості.

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
      hostPID: true # Потрібно для доступу до процесів на хості
      serviceAccountName: obi # потрібно, якщо ви хочете декорувати метадані Kubernetes
      containers:
        - name: autoinstrument
          image: otel/ebpf-instrument:main
          securityContext:
            privileged: true
          env:
            # Виберіть виконуваний файл за його назвою замість OTEL_EBPF_OPEN_PORT
            - name: OTEL_EBPF_AUTO_TARGET_EXE
              value: '*/goblog'
            - name: OTEL_EXPORTER_OTLP_ENDPOINT
              value: 'http://otelcol:4318'
              # потрібно, якщо ви хочете декорувати метадані Kubernetes
            - name: OTEL_EBPF_KUBE_METADATA_ENABLE
              value: 'true'
```

### Розгортання OBI без привілеїв {#deploy-obi-unprivileged}

Досі у всіх прикладах `privileged:true` або Linux capability `SYS_ADMIN` використовувались у секції `securityContext` розгортання OBI. Хоча це працює в усіх обставинах, існують способи розгорнути OBI в Kubernetes з обмеженими привілеями, якщо ваша конфігурація безпеки вимагає цього. Чи можливо це, залежить від версії Kubernetes, яку ви маєте, та використовуваного контейнерного середовища (наприклад, **Containerd**, **CRI-O** або **Docker**).

Наступний посібник заснований на тестах, проведених переважно за допомогою `containerd` з `GKE`, `kubeadm`, `k3s`, `microk8s` та `kind`.

Для запуску OBI без привілеїв, вам потрібно замінити налаштування `privileged:true` на набір Linux [capabilities](https://www.man7.org/linux/man-pages/man7/capabilities.7.html). Вичерпний список можливостей, необхідних для OBI, можна знайти в розділі [Безпека, дозволи та можливості](../../security/).

**Примітка** Завантаження BPF-програм вимагає, щоб OBI міг читати події продуктивності Linux або, принаймні, міг виконувати API ядра Linux `perf_event_open()`.

Ця дозволена дія надається через `CAP_PERFMON` або більш ліберально через `CAP_SYS_ADMIN`. Оскільки як `CAP_PERFMON`, так і `CAP_SYS_ADMIN` надають OBI дозвіл на читання подій продуктивності, вам слід використовувати `CAP_PERFMON`, оскільки він надає менші привілеї. Однак на рівні системи доступ до подій продуктивності контролюється через налаштування `kernel.perf_event_paranoid`, яке ви можете прочитати або записати, використовуючи `sysctl` або змінивши файл `/proc/sys/kernel/perf_event_paranoid`. Стандартне значення для `kernel.perf_event_paranoid` зазвичай становить `2`, про що вказано в розділі `perf_event_paranoid` у [документації ядра](https://www.kernel.org/doc/Documentation/sysctl/kernel.txt). Деякі дистрибутиви Linux визначають вищі рівні для `kernel.perf_event_paranoid`, наприклад, дистрибутиви на базі Debian [також використовують](https://lwn.net/Articles/696216/) `kernel.perf_event_paranoid=3`, що забороняє доступ до `perf_event_open()` без `CAP_SYS_ADMIN`. Якщо ви працюєте на дистрибутиві з налаштуванням `kernel.perf_event_paranoid`, яке перевищує `2`, ви можете або змінити свою конфігурацію, щоб знизити її до `2`, або використовувати `CAP_SYS_ADMIN` замість `CAP_PERFMON`.

Приклад конфігурації контейнера OBI без привілеїв наведено нижче:

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
      hostPID: true           # <-- Важливо. Необхідно в режимі Daemonset, щоб OBI міг виявляти всі процеси, що контролюються.
      containers:
      - name: obi
        terminationMessagePolicy: FallbackToLogsOnError
        image: otel/ebpf-instrument:main
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
              - BPF                 # <-- Важливо. Необхідно для правильної роботи більшості eBPF-проб.
              - SYS_PTRACE          # <-- Важливо. Дозволяє OBI отримувати доступ до простору імен контейнера та перевіряти виконувані файли.
              - NET_RAW             # <-- Важливо. Дозволяє OBI використовувати фільтри сокетів для http-запитів.
              - CHECKPOINT_RESTORE  # <-- Важливо. Дозволяє OBI відкривати ELF-файли.
              - DAC_READ_SEARCH     # <-- Важливо. Дозволяє OBI відкривати ELF-файли.
              - PERFMON             # <-- Важливо. Дозволяє OBI завантажувати BPF-програми.
              #- SYS_RESOURCE       # <-- тільки до версії 5.11. Дозволяє OBI збільшити обсяг заблокованої памʼяті.
              #- SYS_ADMIN          # <-- Необхідно для поширення контексту трасування застосунків Go, або якщо kernel.perf_event_paranoid >= 3 на дистрибутивах Debian.
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

## Використання зовнішнього файлу конфігурації {#providing-an-external-configuration-file}

У попередніх прикладах OBI налаштовувався за допомогою змінних середовища. Однак ви також можете налаштувати його за допомогою зовнішнього YAML-файлу (як документовано в [Конфігурація](../../configure/options/) розділі цього сайту).

Щоб надати конфігурацію у вигляді файлу, рекомендується розгорнути ConfigMap із потрібною конфігурацією, потім підключити його до OBI Pod і посилатися на нього за допомогою змінної середовища `OTEL_EBPF_CONFIG_PATH`.

Приклад ConfigMap із документацією OBI YAML:

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

Приклад конфігурації DaemonSet OBI, що монтує та отримує доступ до попереднього ConfigMap:

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
      hostPID: true #important!
      containers:
        - name: obi
          image: otel/ebpf-instrument:main
          imagePullPolicy: IfNotPresent
          securityContext:
            privileged: true
            readOnlyRootFilesystem: true
          # змонтувати попередній ConfigMap як теку
          volumeMounts:
            - mountPath: /config
              name: obi-config
            - mountPath: /var/run/obi
              name: var-run-obi
          env:
            # повідомте OBI, де знайти файл конфігурації
            - name: OTEL_EBPF_CONFIG_PATH
              value: '/config/obi-config.yml'
      volumes:
        - name: obi-config
          configMap:
            name: obi-config
        - name: var-run-obi
          emptyDir: {}
```

## Надання секретів для конфігурації {#providing-secret-confuration}

У попередньому прикладі використано звичайну конфігурацію, але не слід використовувати його для передачі секретної інформації, такої як паролі або ключі API.

Щоб надати секретну інформацію, рекомендується розгорнути Kubernetes Secret. Наприклад, цей секрет містить деякі вигадані облікові дані OpenTelemetry Collector:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: otelcol-secret
type: Opaque
stringData:
  headers: 'Authorization=Bearer Z2hwX0l4Y29QOWhr....ScQo='
```

Далі ви можете отримати доступ до значень секретів як до змінних середовища. Дотримуючись попереднього прикладу DaemonSet, це можна зробити, додавши наступний розділ `env` до контейнера OBI:

```yaml
env:
  - name: OTEL_EXPORTER_OTLP_HEADERS
    valueFrom:
      secretKeyRef:
        key: otelcol-secret
        name: headers
```
