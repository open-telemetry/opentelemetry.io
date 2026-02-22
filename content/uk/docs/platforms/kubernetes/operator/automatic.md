---
title: Інʼєкція Автоінструментування
linkTitle: Автоінструментування
weight: 11
description: Реалізація автоінструментування за допомогою OpenTelemetry Operator.
default_lang_commit: 5489ba34bff91356aa2c501cd55f07eeb30cc355
# prettier-ignore
cSpell:ignore: GRPCNETCLIENT k8sattributesprocessor otelinst otlpreceiver REDISCALA
---

OpenTelemetry Operator підтримує інʼєкцію та налаштування бібліотек автоінструментування для .NET, Java, Node.js, Python та Go сервісів.

## Встановлення {#installation}

Спочатку встановіть [OpenTelemetry Operator](https://github.com/open-telemetry/opentelemetry-operator) у ваш кластер.

Ви можете зробити це за допомогою [Operator release manifest](https://github.com/open-telemetry/opentelemetry-operator#getting-started), [Operator helm chart](https://github.com/open-telemetry/opentelemetry-helm-charts/tree/main/charts/opentelemetry-operator#opentelemetry-operator-helm-chart), або через [Operator Hub](https://operatorhub.io/operator/opentelemetry-operator).

У більшості випадків вам потрібно буде встановити [cert-manager](https://cert-manager.io/docs/installation/). Якщо ви використовуєте helm chart, є опція для генерації самопідписного сертифіката.

> Якщо ви хочете використовувати автоінструментування для Go, вам потрібно увімкнути функцію gate. Дивіться [Контроль можливостей інструментування](https://github.com/open-telemetry/opentelemetry-operator#controlling-instrumentation-capabilities) для деталей.

## Створення OpenTelemetry Collector (Необовʼязково) {#create-an-opentelemetry-collector-optional}

Найкраще надсилати телеметрію з контейнерів до [OpenTelemetry Collector](/docs/platforms/kubernetes/collector/) замість безпосередньо до бекенду. Collector допомагає спростити управління секретами, розділяє проблеми експорту даних (наприклад, необхідність повторних спроб) від ваших застосунків, і дозволяє додавати додаткові дані до вашої телеметрії, наприклад, за допомогою [k8sattributesprocessor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/k8sattributesprocessor) компонента. Якщо ви вирішили не використовувати Collector, ви можете перейти до наступного розділу.

Operator надає [Custom Resource Definition (CRD) для OpenTelemetry Collector](https://github.com/open-telemetry/opentelemetry-operator/blob/main/docs/api/opentelemetrycollectors.md) який використовується для створення екземпляра Collector, яким керує Operator. Наступний приклад розгортає Collector як Deployment (стандартно), але є інші [режими розгортання](https://github.com/open-telemetry/opentelemetry-operator#deployment-modes) які можна використовувати.

При використанні режиму `Deployment` оператор також створить Сервіс, який можна використовувати для взаємодії з Collector. Назва сервісу — це назва ресурсу `OpenTelemetryCollector` з префіксом `-collector`. Для нашого прикладу це буде `demo-collector`.

```bash
kubectl apply -f - <<EOF
apiVersion: opentelemetry.io/v1beta1
kind: OpenTelemetryCollector
metadata:
  name: demo
spec:
  config:
    receivers:
      otlp:
        protocols:
          grpc:
            endpoint: 0.0.0.0:4317
          http:
            endpoint: 0.0.0.0:4318
    processors:
      memory_limiter:
        check_interval: 1s
        limit_percentage: 75
        spike_limit_percentage: 15

    exporters:
      debug:
        verbosity: basic

    service:
      pipelines:
        traces:
          receivers: [otlp]
          processors: [memory_limiter]
          exporters: [debug]
        metrics:
          receivers: [otlp]
          processors: [memory_limiter]
          exporters: [debug]
        logs:
          receivers: [otlp]
          processors: [memory_limiter]
          exporters: [debug]
EOF
```

Вищенаведена команда призводить до розгортання Collector, який ви можете використовувати як точку доступу для автоінструментування у ваших podʼах.

## Налаштування автоматичного інструментування {#configure-automatic-instrumentation}

Щоб мати можливість керувати автоматичним інструментуванням, оператор повинен знати, які podʼом інструментувати і яке автоматичне інструментування використовувати для цих podʼів. Це робиться через [Instrumentation CRD](https://github.com/open-telemetry/opentelemetry-operator/blob/main/docs/api/instrumentations.md).

Створення ресурсу Instrumentation правильно є ключовим для отримання автоінструментування. Переконання, що всі точки доступу та змінні середовища правильні є необхідним для правильного функціонування автоінструментування.

### .NET

Наступна команда створить базовий ресурс Instrumentation, який налаштований спеціально для інструментування .NET сервісів.

```bash
kubectl apply -f - <<EOF
apiVersion: opentelemetry.io/v1alpha1
kind: Instrumentation
metadata:
  name: demo-instrumentation
spec:
  exporter:
    endpoint: http://demo-collector:4318
  propagators:
    - tracecontext
    - baggage
  sampler:
    type: parentbased_traceidratio
    argument: "1"
EOF
```

Стандартно, ресурс Instrumentation, який автоінструментує .NET сервіси використовує `otlp` з протоколом `http/protobuf`. Це означає, що налаштована точка доступу повинна мати можливість приймати OTLP через `http/protobuf`. Тому, приклад використовує `http://demo-collector:4318`, який підключається до `http` порту `otlpreceiver` Collector, створеного на попередньому кроці.

#### Виключення автоінструментування {#dotnet-excluding-auto-instrumentation}

Стандартно, .NET автоінструментування постачається з [багатьма бібліотеками інструментування](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/blob/main/docs/config.md#instrumentations). Це робить інструментування легким, але може призвести до надмірних або небажаних даних. У випадку якщо є будь-які бібліотеки, які ви не хочете використовувати, ви можете встановити `OTEL_DOTNET_AUTO_[SIGNAL]_[NAME]_INSTRUMENTATION_ENABLED=false`, де `[SIGNAL]` — це тип сигналу, а `[NAME]` — це чутлива до регістру назва бібліотеки.

```yaml
apiVersion: opentelemetry.io/v1alpha1
kind: Instrumentation
metadata:
  name: demo-instrumentation
spec:
  exporter:
    endpoint: http://demo-collector:4318
  propagators:
    - tracecontext
    - baggage
  sampler:
    type: parentbased_traceidratio
    argument: '1'
  dotnet:
    env:
      - name: OTEL_DOTNET_AUTO_TRACES_GRPCNETCLIENT_INSTRUMENTATION_ENABLED
        value: false
      - name: OTEL_DOTNET_AUTO_METRICS_PROCESS_INSTRUMENTATION_ENABLED
        value: false
```

#### Дізнатися більше {#dotnet-learn-more}

Для отримання додаткової інформації дивіться [документацію автоінструментування .NET](/docs/zero-code/dotnet/).

### Deno

Наступна команда створює базовий ресурс Instrumentation, який налаштовано для сервісів [Deno](https://deno.com).

```bash
kubectl apply -f - <<EOF
apiVersion: opentelemetry.io/v1alpha1
kind: Instrumentation
metadata:
  name: demo-instrumentation
spec:
  env:
    - name: OTEL_DENO
      value: 'true'
  exporter:
    endpoint: http://demo-collector:4318
  propagators:
    - tracecontext
    - baggage
  sampler:
    type: parentbased_traceidratio
    argument: '1'
EOF
```

Процеси Deno автоматично експортують дані телеметрії до налаштованої точки доступу, коли вони запускаються зі змінною оточення `OTEL_DENO=true`. Тому у прикладі вказано цю змінну оточення у полі `env` ресурсу Instrumentation, тому вона встановлюється для всіх сервісів, які мають env-змінні, що вводяться з цим ресурсом Instrumentation.

Стандартно ресурс Instrumentation, який автоматично інсталює сервіси Deno, використовує `otlp` з протоколом `http/proto`. Це означає, що налаштована точка доступу повинна мати можливість отримувати OTLP за протоколом `http/proto`. Тому в прикладі використовується `http://demo-collector:4318`, який підключається до порту `http/proto` `otlpreceiver` колектора, створеного на попередньому кроці.

> [!NOTE]
>
> [Інтеграція Deno з OpenTelemetry][deno-docs] ще не є стабільною. Як наслідок, усі робочі навантаження, які хочуть працювати з Deno, повинні мати прапорець `--unstable-otel` під час запуску процесу Deno.
>
> [deno-docs]: https://docs.deno.com/runtime/fundamentals/open_telemetry/

#### Параметри конфігурації {#deno-configuration-options}

Стандартно, інтеграція Deno OpenTelemetry експортує вивід `console.log()` як [logs](/docs/concepts/signals/logs/), водночас друкуючи логи до stdout/stderr. Ви можете налаштувати ці альтернативні варіанти поведінки:

- `OTEL_DENO_CONSOLE=replace`: експортувати лише вивід `console.log()` у вигляді логів; не виводити у stdout / stderr.
- `OTEL_DENO_CONSOLE=ignore`: не експортувати вивід `console.log()` як журнали; виводити в stdout / stderr.

#### Докладніше {#deno-learn-more}

Більш детальну інформацію можна знайти у документації Deno [OpenTelemetry integration][deno-otel-docs] документацію.

[deno-otel-docs]: https://docs.deno.com/runtime/fundamentals/open_telemetry/

### Go

Наступна команда створює базовий ресурс Instrumentation, який налаштований спеціально для інструментування Go сервісів.

```bash
kubectl apply -f - <<EOF
apiVersion: opentelemetry.io/v1alpha1
kind: Instrumentation
metadata:
  name: demo-instrumentation
spec:
  exporter:
    endpoint: http://demo-collector:4318
  propagators:
    - tracecontext
    - baggage
  sampler:
    type: parentbased_traceidratio
    argument: "1"
EOF
```

Стандартно, ресурс Instrumentation, який автоінструментує Go сервіси використовує `otlp` з протоколом `http/protobuf`. Це означає, що налаштована точка доступу повинна мати можливість приймати OTLP через `http/protobuf`. Тому, приклад використовує `http://demo-collector:4318`, який підключається до `http/protobuf` порту `otlpreceiver` Collector, створеного на попередньому кроці.

Go автоінструментування не підтримує вимкнення будь-якого інструментування. [Дивіться репозиторій Go Auto-Instrumentation для отримання додаткової інформації.](https://github.com/open-telemetry/opentelemetry-go-instrumentation)

### Java

Наступна команда створює базовий ресурс Instrumentation, який налаштований для інструментування Java сервісів.

```bash
kubectl apply -f - <<EOF
apiVersion: opentelemetry.io/v1alpha1
kind: Instrumentation
metadata:
  name: demo-instrumentation
spec:
  exporter:
    endpoint: http://demo-collector:4318
  propagators:
    - tracecontext
    - baggage
  sampler:
    type: parentbased_traceidratio
    argument: "1"
EOF
```

Стандартно, ресурс Instrumentation, який автоінструментує Java сервіси використовує `otlp` з протоколом `http/protobuf`. Це означає, що налаштована точка доступу повинна мати можливість приймати OTLP через `http` з `protobuf` навантаженнями. Тому, приклад використовує `http://demo-collector:4318`, який підключається до `http` порту otlpreceiver Collector, створеного на попередньому кроці.

#### Виключення автоінструментування {#java-excluding-auto-instrumentation}

Стандартно, Java автоінструментування постачається з [багатьма бібліотеками інструментування](/docs/zero-code/java/agent/getting-started/#supported-libraries-frameworks-application-services-and-jvms). Це робить інструментування легким, але може призвести до надмірних або небажаних даних. Якщо є будь-які бібліотеки, які ви не хочете використовувати, ви можете встановити `OTEL_INSTRUMENTATION_[NAME]_ENABLED=false`, де `[NAME]` — це назва бібліотеки. Якщо ви точно знаєте, які бібліотеки ви хочете використовувати, ви можете вимкнути стандартні бібліотеки, встановивши `OTEL_INSTRUMENTATION_COMMON_DEFAULT_ENABLED=false`, а потім використовувати `OTEL_INSTRUMENTATION_[NAME]_ENABLED=true`, де `[NAME]` — це назва бібліотеки. Для отримання додаткової інформації дивіться [Придушення конкретного інструментування](/docs/zero-code/java/agent/disable/).

```yaml
apiVersion: opentelemetry.io/v1alpha1
kind: Instrumentation
metadata:
  name: demo-instrumentation
spec:
  exporter:
    endpoint: http://demo-collector:4318
  propagators:
    - tracecontext
    - baggage
  sampler:
    type: parentbased_traceidratio
    argument: '1'
  java:
    env:
      - name: OTEL_INSTRUMENTATION_KAFKA_ENABLED
        value: false
      - name: OTEL_INSTRUMENTATION_REDISCALA_ENABLED
        value: false
```

#### Дізнатися більше {#java-learn-more}

Для отримання додаткової інформації дивіться [Java agent Configuration](/docs/zero-code/java/agent/configuration/).

### Node.js

Наступна команда створює базовий ресурс Instrumentation, який налаштований для інструментування Node.js сервісів.

```bash
kubectl apply -f - <<EOF
apiVersion: opentelemetry.io/v1alpha1
kind: Instrumentation
metadata:
  name: demo-instrumentation
spec:
  exporter:
    endpoint: http://demo-collector:4317
  propagators:
    - tracecontext
    - baggage
  sampler:
    type: parentbased_traceidratio
    argument: "1"
EOF
```

Стандартно, ресурс Instrumentation, який автоінструментує Node.js сервіси використовує `otlp` з протоколом `grpc`. Це означає, що налаштована точка доступу повинна мати можливість приймати OTLP через `grpc`. Тому, приклад використовує `http://demo-collector:4317`, який підключається до `grpc` порту `otlpreceiver` Collector, створеного на попередньому кроці.

#### Виключення бібліотек інструментування {#js-excluding-instrumentation-libraries}

Стандартно, Node.js автоінструментування має всі бібліотеки інструментування увімкнені.

Щоб увімкнути лише конкретні бібліотеки інструментування, ви можете використовувати змінну середовища `OTEL_NODE_ENABLED_INSTRUMENTATIONS`, як це задокументовано в [документації з автоінструментування Node.js](/docs/zero-code/js/configuration/#excluding-instrumentation-libraries).

```yaml
apiVersion: opentelemetry.io/v1alpha1
kind: Instrumentation
# ... інші поля пропущені в цьому прикладі
spec:
  # ... інші поля пропущені в цьому прикладі
  nodejs:
    env:
      - name: OTEL_NODE_ENABLED_INSTRUMENTATIONS
        value: http,nestjs-core # список назв пакетів інструментування через кому без префіксу `@opentelemetry/instrumentation-`.
```

Щоб зберегти всі стандартні бібліотеки і вимкнути лише конкретні бібліотеки інструментування, ви можете використовувати змінну середовища `OTEL_NODE_DISABLED_INSTRUMENTATIONS`. Для деталей дивіться [Виключення бібліотек інструментування](/docs/zero-code/js/configuration/#excluding-instrumentation-libraries).

```yaml
apiVersion: opentelemetry.io/v1alpha1
kind: Instrumentation
# ... інші поля пропущені в цьому прикладі
spec:
  # ... інші поля пропущені в цьому прикладі
  nodejs:
    env:
      - name: OTEL_NODE_DISABLED_INSTRUMENTATIONS
        value: fs,grpc # список назв пакетів інструментування через кому без префіксу `@opentelemetry/instrumentation-`.
```

> [!NOTE]
>
> Якщо обидві змінні середовища встановлені, `OTEL_NODE_ENABLED_INSTRUMENTATIONS` застосовується першою, а потім `OTEL_NODE_DISABLED_INSTRUMENTATIONS` застосовується до цього списку. Тому, якщо одна й та сама бібліотека включена в обидва списки, ця бібліотека буде вимкнена.

#### Дізнатися більше {#js-learn-more}

Для отримання додаткової інформації дивіться [Node.js автоінструментування](/docs/languages/js/libraries/#registration).

### Python

Наступна команда створить базовий ресурс Instrumentation, який налаштований спеціально для інструментування Python сервісів.

```bash
kubectl apply -f - <<EOF
apiVersion: opentelemetry.io/v1alpha1
kind: Instrumentation
metadata:
  name: demo-instrumentation
spec:
  exporter:
    endpoint: http://demo-collector:4318
  propagators:
    - tracecontext
    - baggage
  sampler:
    type: parentbased_traceidratio
    argument: "1"
EOF
```

Стандартно, ресурс `Instrumentation`, який автоінструментує Python сервіси використовує `otlp` з протоколом `http/protobuf` (gRPC наразі не підтримується). Це означає, що налаштована точка доступу повинна мати можливість приймати OTLP через `http/protobuf`. Тому, приклад використовує `http://demo-collector:4318`, який підключається до `http` порту `otlpreceiver` Collector, створеного на попередньому кроці.

> Починаючи з версії оператора v0.108.0, ресурс Instrumentation автоматично встановлює `OTEL_EXPORTER_OTLP_PROTOCOL` на `http/protobuf` для Python сервісів. Якщо ви використовуєте старішу версію оператора, ви **МУСИТЕ** встановити цю змінну середовища на `http/protobuf`, інакше автоінструментування Python не працюватиме.

#### Автоінструментування Python логів {#auto-instrumenting-python-logs}

Стандартно, автоінструментування логів Python вимкнено. Якщо ви хочете увімкнути цю функцію, ви повинні встановити змінну середовища `OTEL_PYTHON_LOGGING_AUTO_INSTRUMENTATION_ENABLED` наступним чином:

```yaml
apiVersion: opentelemetry.io/v1alpha1
kind: Instrumentation
metadata:
  name: python-instrumentation
  namespace: application
spec:
  exporter:
    endpoint: http://demo-collector:4318
  env:
  propagators:
    - tracecontext
    - baggage
  python:
    env:
      - name: OTEL_PYTHON_LOGGING_AUTO_INSTRUMENTATION_ENABLED
        value: 'true'
```

> Починаючи з версії оператора v0.111.0, встановлення `OTEL_LOGS_EXPORTER` на `otlp` більше не потрібно.

#### Виключення автоінструментування {#python-excluding-auto-instrumentation}

Стандартно, Python автоінструментування постачається з [багатьма бібліотеками інструментування](https://github.com/open-telemetry/opentelemetry-operator/blob/main/autoinstrumentation/python/requirements.txt). Це робить інструментування легким, але може призвести до надмірних або небажаних даних. Якщо є будь-які пакети, які ви не хочете інструментувати, ви можете встановити змінну середовища `OTEL_PYTHON_DISABLED_INSTRUMENTATIONS`.

```yaml
apiVersion: opentelemetry.io/v1alpha1
kind: Instrumentation
metadata:
  name: demo-instrumentation
spec:
  exporter:
    endpoint: http://demo-collector:4318
  propagators:
    - tracecontext
    - baggage
  sampler:
    type: parentbased_traceidratio
    argument: '1'
  python:
    env:
      - name: OTEL_PYTHON_DISABLED_INSTRUMENTATIONS
        value: <comma-separated list of package names to exclude from
          instrumentation>
```

Дивіться [документацію налаштування агента Python](/docs/zero-code/python/configuration/#disabling-specific-instrumentations) для отримання додаткової інформації.

#### Дізнатися більше {#python-learn-more}

Для отримання додаткової інформації дивіться [документацію Python OpenTelemetry Operator](/docs/zero-code/python/operator/#python-specific-topics)
та [документацію налаштування агента Python](/docs/zero-code/python/configuration/).

---

Тепер, коли ваш обʼєкт Instrumentation створений, ваш кластер має можливість автоінструментувати сервіси та надсилати дані до точки доступу. Однак, автоінструментування з OpenTelemetry Operator слідує моделі opt-in. Щоб активувати автоматичне інструментування, вам потрібно додати анотацію до вашого deployment.

## Додавання анотацій до наявних deploymentʼів {#add-annotations-to-existing-deployments}

Останній крок — це підключення ваших сервісів до автоматичного інструментування. Це робиться шляхом оновлення `spec.template.metadata.annotations` вашого сервісу, щоб включити мовно-специфічну анотацію:

- .NET: `instrumentation.opentelemetry.io/inject-dotnet: "true"`
- Go: `instrumentation.opentelemetry.io/inject-go: "true"`
- Java: `instrumentation.opentelemetry.io/inject-java: "true"`
- Node.js: `instrumentation.opentelemetry.io/inject-nodejs: "true"`
- Python: `instrumentation.opentelemetry.io/inject-python: "true"`

Можливі значення для анотації можуть бути

- `"true"` — для впровадження ресурсу `Instrumentation` зі стандартним іменем з поточного простору імен.
- `"my-instrumentation"` — для впровадження екземпляра `Instrumentation` CR з іменем `"my-instrumentation"` у поточному просторі імен.
- `"my-other-namespace/my-instrumentation"` — для впровадження екземпляра `Instrumentation` CR з іменем `"my-instrumentation"` з іншого простору імен `"my-other-namespace"`.
- `"false"` — не виконувати інʼєкцію

Альтернативно, анотацію можна додати до простору імен, що призведе до додавання всіх сервісів у цьому просторі імен до автоматичного інструментування. Дивіться [документацію з автоінструментування операторів](https://github.com/open-telemetry/opentelemetry-operator/blob/main/README.md#opentelemetry-auto-instrumentation-injection) для отримання додаткової інформації.

### Підключення Go сервісу {#opt-in-go-service}

На відміну від автоінструментування інших мов, Go працює через eBPF агент, що працює через sidecar. При підключенні оператор зробить інʼєкцію цього sidecar у ваш pod. Крім анотації `instrumentation.opentelemetry.io/inject-go`, згаданої вище, ви також повинні надати значення для [змінної середовища `OTEL_GO_AUTO_TARGET_EXE`](https://github.com/open-telemetry/opentelemetry-go-instrumentation/blob/main/docs/how-it-works.md). Ви можете встановити цю змінну середовища через анотацію `instrumentation.opentelemetry.io/otel-go-auto-target-exe`.

```yaml
instrumentation.opentelemetry.io/inject-go: 'true'
instrumentation.opentelemetry.io/otel-go-auto-target-exe: '/path/to/container/executable'
```

Цю змінну середовища також можна встановити через ресурс Instrumentation, з анотацією, що має пріоритет. Оскільки Go автоінструментування вимагає встановлення `OTEL_GO_AUTO_TARGET_EXE`, ви повинні надати дійсний шлях до виконуваного файлу через анотацію або ресурс Instrumentation. Невстановлення цього значення призводить до припинення впровадження інструментування, залишаючи оригінальний pod незмінним.

Оскільки Go автоінструментування використовує eBPF, воно також вимагає підвищених дозволів. Коли ви opt-in, sidecar, який впроваджує оператор, вимагатиме наступних дозволів:

```yaml
securityContext:
  capabilities:
    add:
      - SYS_PTRACE
  privileged: true
  runAsUser: 0
```

### Автоінструментування Python musl на основі контейнера {#annotations-python-musl}

З версії оператора v0.113.0 Python автоінструментування також враховує анотацію, яка дозволить йому працювати на образах з іншою C бібліотекою, ніж glibc.

```sh
# для образів на основі Linux glibc, це стандартне значення і може бути пропущено
instrumentation.opentelemetry.io/otel-python-platform: "glibc"
# для образів на основі Linux musl
instrumentation.opentelemetry.io/otel-python-platform: "musl"
```

## Розвʼязання проблем {#troubleshooting}

Якщо у вас виникли проблеми з автоінструментуванням вашого коду, ось кілька речей, які ви можете спробувати.

### Чи встановився ресурс Instrumentation? {#did-the-instrumentation-resource-install}

Після встановлення ресурсу `Instrumentation`, перевірте, чи він встановився правильно, виконавши цю команду, де `<namespace>` — це простір імен, у якому розгорнуто ресурс `Instrumentation`:

```sh
kubectl describe otelinst -n <namespace>
```

Приклад виводу:

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
   Endpoint:  http://demo-collector.opentelemetry.svc.cluster.local:4318
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

### Чи показують журнали OTel Operator будь-які помилки автоінструментування? {#do-the-otel-operator-logs-show-any-auto-instrumentation-errors}

Перевірте журнали OTel Operator на наявність будь-яких помилок, повʼязаних з автоінструментуванням, виконавши цю команду:

```sh
kubectl logs -l app.kubernetes.io/name=opentelemetry-operator --container manager -n opentelemetry-operator-system --follow
```

### Чи були ресурси розгорнуті в правильному порядку? {#were-the-resources-deployed-in-the-right-order}

Порядок має значення! Ресурс `Instrumentation` повинен бути розгорнутий перед
розгортанням застосунку, інакше автоінструментування не працюватиме.

Згадайте анотацію автоінструментування:

```yaml
annotations:
  instrumentation.opentelemetry.io/inject-python: 'true'
```

Коли pod запускається, вищенаведена анотація вказує OTel Operator шукати обʼєкт `Instrumentation` у просторі імен podʼа. Вона також вказує оператору впровадити Python автоінструментування у pod.

Вона додає [init-container](https://kubernetes.io/docs/concepts/workloads/pods/init-containers/) до podʼа застосунку, з назвою `opentelemetry-auto-instrumentation`, який потім використовується для інʼєкції автоінструментування в контейнер застосунку.

Якщо ресурс `Instrumentation` не присутній до моменту розгортання застосунку, однак, init-container не може бути створений. Тому, якщо застосунок розгорнуто _перед_ розгортанням ресурсу `Instrumentation`, автоінструментування не вдасться.

Щоб переконатися, що init-container `opentelemetry-auto-instrumentation` запустився правильно (або взагалі запустився), виконайте наступну команду:

```sh
kubectl get events -n <your_app_namespace>
```

Що повинно вивести щось на зразок цього:

```text
53s         Normal   Created             pod/py-otel-server-7f54bf4cbc-p8wmj    Created container opentelemetry-auto-instrumentation
53s         Normal   Started             pod/py-otel-server-7f54bf4cbc-p8wmj    Started container opentelemetry-auto-instrumentation
```

Якщо у виводі відсутній запис `Created` і/або `Started` для `opentelemetry-auto-instrumentation`, це означає, що є проблема з вашим автоінструментуванням. Це може бути результатом будь-чого з наступного:

- Ресурс `Instrumentation` не був встановлений (або не був встановлений правильно).
- Ресурс `Instrumentation` був встановлений _після_ розгортання застосунку.
- Є помилка в анотації автоінструментування або анотація знаходиться в неправильному місці, дивіться #4 нижче.

Обовʼязково перевірте вихід `kubectl get events` на наявність будь-яких помилок, оскільки вони можуть допомогти вказати на проблему.

### Чи правильна анотація автоінструментування? {#is-the-auto-instrumentation-annotation-correct}

Іноді автоінструментування може не вдатися через помилки в анотації автоінструментування.

Ось кілька речей, які варто перевірити:

- **Чи автоінструментування обрано для відповідної мови?**
  - Наприклад, при інструментуванні Python застосунку, переконайтеся, що анотація не вказує `instrumentation.opentelemetry.io/inject-java: "true"` замість цього.
  - Для **Deno** переконайтеся, що ви використовуєте `instrumentation.opentelemetry.io/inject-sdk: "true"` анотацію, а не а не анотацію, що містить рядок `deno`.
- **Чи анотація автоінструментування знаходиться в правильному місці?** При визначенні `Deployment`, анотації можна додати в одне з двох місць: `spec.metadata.annotations` та `spec.template.metadata.annotations`. Анотація автоінструментування повинна бути додана до `spec.template.metadata.annotations`, інакше вона не працюватиме.

### Чи правильно налаштована точка доступу автоінструментування? {#was-the-auto-instrumentation-endpoint-configured-correctly}

Атрибут `spec.exporter.endpoint` ресурсу `Instrumentation` визначає куди надсилати дані. Це може бути [OTel Collector](/docs/collector/), або будь-яка OTLP точка доступу. Якщо цей атрибут залишити порожнім, він стандартно встановлюється у `http://localhost:4317`, що, швидше за все, не надсилатиме телеметричні дані нікуди.

При надсиланні телеметрії до OTel Collector, розташованого в тому ж Kubernetes кластері, `spec.exporter.endpoint` повинен посилатися на назву OTel Collector [`Service`](https://kubernetes.io/docs/concepts/services-networking/service/).

Наприклад:

```yaml
spec:
  exporter:
    endpoint: http://demo-collector.opentelemetry.svc.cluster.local:4317
```

Тут точка доступу Collector встановлена на `http://demo-collector.opentelemetry.svc.cluster.local:4317`, де `demo-collector` — це назва OTel Collector Kubernetes `Service`. У наведеному вище прикладі Collector працює в іншому просторі імен від застосунку, що означає, що `opentelemetry.svc.cluster.local` повинен бути доданий до назви сервісу Collector, де `opentelemetry` — це простір імен, у якому знаходиться Collector.
