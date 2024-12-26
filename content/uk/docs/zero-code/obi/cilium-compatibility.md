---
title: Сумісність OBI та Cilium
linkTitle: Сумісність з Cilium
description: Примітки щодо сумісності при запуску OBI разом з Cilium
weight: 23
default_lang_commit: 5489ba34bff91356aa2c501cd55f07eeb30cc355
cspell:ignore: ciliums
---

Cilium — це платформа з відкритим кодом для забезпечення безпеки, мережевої взаємодії та спостережуваності, яка використовує eBPF для забезпечення мережевої взаємодії та безпеки кластерів Kubernetes. У деяких випадках застосунки eBPF, які використовують Cilium і OBI, можуть конфліктувати з застосунками eBPF, які використовує OBI, і призводити до проблем.

OBI і Cilium використовують застосунки класифікації трафіку eBPF, `BPF_PROG_TYPE_SCHED_CLS`. Ці застосунки підключаються до вхідних і вихідних шляхів даних стеку мережі ядра. Разом вони формують ланцюг застосунків, які можуть перевіряти та потенційно змінювати пакети під час їх проходження через мережевий стек.

OBI застосунки ніколи не порушують потік пакета, але Cilium змінює потік пакета в рамках своєї роботи. Якщо Cilium обробляє пакети перед OBI, це може вплинути на його здатність обробляти пакети.

## Пріоритет вкладення {#attachment-priority}

OBI використовує API Traffic Control eXpress (TCX) або інтерфейс Netlink у ядрі Linux для підключення програм керування трафіком (TC).

TCX — це новий API, який дозволяє підключати застосунки до початку, середини або кінця списку. OBI і Cilium автоматично виявляють, чи підтримується ядро TCX, і стандартно використовують його.

Коли OBI і Cilium використовують TCX, вони не заважають один одному. OBI підключає свої eBPF застосунки до голови списку, а Cilium — до кінця. TCX є переважним режимом роботи, коли це можливо.

## Перехід до Netlink {#falling-back-to-netlink}

Коли TCX недоступний, як OBI, так і Cilium використовують інтерфейс Netlink для встановлення eBPF застосунків. Якщо OBI виявляє, що Cilium запускає застосунки з пріоритетом 1, OBI виходить і показує повідомлення про помилку. Ви можете розвʼязати цю помилку, налаштувавши Cilium на використання пріоритету, що перевищує 1.

OBI також відмовляється працювати, якщо вона налаштована на використання вкладень Netlink і виявляє, що Cilium використовує TCX.

### Налаштування пріоритету Cilium {#ciliums-priority-configuration}

Ви можете налаштувати пріоритет Cilium, використовуючи значення Helm `bpf.tc.priority` або параметр CLI `tc-filter-priority`.

```yaml
bpf:
  tc:
    priority: 2
```

Це забезпечує те, що застосунки OBI завжди виконуються перед застосунками Cilium.

## Налаштування режиму вкладення OBI {#obi-attachment-mode-configuration}

Дивіться [документацію з налаштування](../configure/options/), щоб налаштувати режим вкладення OBI TC, використовуючи параметр конфігурації `OTEL_EBPF_BPF_TC_BACKEND`.

Ви можете зробити наступне:

- Встановіть значення на `tcx`, щоб використовувати API TCX
- Встановіть значення на `netlink`, щоб використовувати інтерфейс Netlink
- Встановіть значення на `auto`, щоб автоматично визначити найкращий доступний варіант

## Демонстрація OBI і Cilium {#obi-and-cilium-demo}

Наступний приклад демонструє, як OBI і Cilium працюють разом для поширення контексту трасування в середовищах Kubernetes.

### Попередні вимоги {#prerequisites}

- Кластер Kubernetes з встановленим Cilium
- Налаштований kubectl для доступу до кластера
- Helm 3.0 або новіша версія

### Розгортання тестових сервісів {#deploy-test-services}

Використовуйте наступне визначення для розгортання тих самих сервісів. Це невеликі іграшкові сервіси, які спілкуються один з одним і дозволяють вам побачити, як OBI працює з поширенням контексту трасування:

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
          image: ghcr.io/open-teletry/obi-testimg:node-0.1.1
          ports:
            - containerPort: 3000
          env:
            - name: NODEJS_SERVICE_PORT
              value: '3000'
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
    - port: 3000
      targetPort: 3000
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
          image: ghcr.io/open-teletry/obi-testimg:go-0.1.1
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
          image: ghcr.io/open-teletry/obi-testimg:python-0.1.1
          ports:
            - containerPort: 8080
          env:
            - name: PYTHON_SERVICE_PORT
              value: '8080'
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
    - port: 8080
      targetPort: 8080
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
          image: ghcr.io/open-telemetry/obi-testimg:rails-0.1.1
          ports:
            - containerPort: 3000
          env:
            - name: RAILS_SERVICE_PORT
              value: '3000'
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
    - port: 3000
      targetPort: 3000
```

### Розгортання OBI {#deploy-obi}

Створіть простір імен OBI:

```bash
kubectl create namespace obi
```

Застосуйте дозволи:

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

Розгорніть OBI:

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
    # let's instrument only the docs server
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

Переадресуйте порт на хост і запустіть запит:

```shell
kubectl port-forward services/nodejs-service 3000:3000 &
curl http://localhost:3000/traceme
```

Нарешті, перевірте логи Podʼа OBI:

```shell
for i in `kubectl get pods -n obi -o name | cut -d '/' -f2`; do kubectl logs -n obi $i | grep "GET " | sort; done
```

Ви повинні побачити вивід, який показує запити, виявлені OBI з поширенням контексту трасування, подібний до цього:

```text
2025-01-17 21:42:18.11794218 (5.045099ms[5.045099ms]) HTTPClient 200 GET /tracemetoo [10.244.1.92 as go-service.default:37450]->[10.96.214.17 as python-service.default:8080] size:0B svc=[default/go-service go] traceparent=[00-14f07e11b5e57f14fd2da0541f0ddc2f-319fb03373427a41[cfa6d5d448e40b00]-01]
2025-01-17 21:42:18.11794218 (5.284521ms[5.164701ms]) HTTP 200 GET /gotracemetoo [10.244.2.144 as nodejs-service.default:57814]->[10.244.1.92 as go-service.default:8080] size:0B svc=[default/go-service go] traceparent=[00-14f07e11b5e57f14fd2da0541f0ddc2f-cfa6d5d448e40b00[cce1e6b5e932b89a]-01]
2025-01-17 21:42:18.11794218 (1.934744ms[1.934744ms]) HTTP 403 GET /users [10.244.2.32 as ruby-service.default:46876]->[10.244.2.176 as ruby-service.default:3000] size:222B svc=[default/ruby-service ruby] traceparent=[00-14f07e11b5e57f14fd2da0541f0ddc2f-57d77d99e9665c54[3d97d26b0051112b]-01]
2025-01-17 21:42:18.11794218 (2.116628ms[2.116628ms]) HTTPClient 403 GET /users [10.244.2.32 as ruby-service.default:46876]->[10.96.69.89 as ruby-service.default:3000] size:256B svc=[default/ruby-service ruby] traceparent=[00-14f07e11b5e57f14fd2da0541f0ddc2f-ff48ab147cc92f93[2770ac4619aa0042]-01]
2025-01-17 21:42:18.11794218 (4.281525ms[4.281525ms]) HTTP 200 GET /tracemetoo [10.244.1.92 as go-service.default:37450]->[10.244.2.32 as ruby-service.default:8080] size:178B svc=[default/ruby-service ruby] traceparent=[00-14f07e11b5e57f14fd2da0541f0ddc2f-2770ac4619aa0042[319fb03373427a41]-01]
2025-01-17 21:42:18.11794218 (5.391191ms[5.391191ms]) HTTPClient 200 GET /gotracemetoo [10.244.2.144 as nodejs-service.default:57814]->[10.96.134.167 as go-service.default:8080] size:256B svc=[default/nodejs-service nodejs] traceparent=[00-14f07e11b5e57f14fd2da0541f0ddc2f-202ee68205e4ef3b[9408610968fa20f8]-01]
2025-01-17 21:42:18.11794218 (6.939027ms[6.939027ms]) HTTP 200 GET /traceme [127.0.0.1 as 127.0.0.1:44720]->[127.0.0.1 as 127.0.0.1.default:3000] size:86B svc=[default/nodejs-service nodejs] traceparent=[00-14f07e11b5e57f14fd2da0541f0ddc2f-9408610968fa20f8[0000000000000000]-01]
```
