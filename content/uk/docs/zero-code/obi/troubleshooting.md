---
title: Усунення несправностей
description: Усунення типових проблем і помилок OBI
weight: 22
default_lang_commit: 5489ba34bff91356aa2c501cd55f07eeb30cc355
cSpell:ignore: Clickhouse uprobe uprobes
---

На цій сторінці ви можете дізнатися, як діагностувати та вирішувати типові помилки та проблеми OBI.

## Інструменти для усунення несправностей {#troubleshooting-tools}

OBI надає різноманітні інструменти та параметри конфігурації, які допомагають діагностувати та усувати несправності.

### Детальне ведення журналу {#detailed-logging}

Ви можете збільшити детальність журналу OBI, встановивши конфігурацію `log_level` або змінну середовища `OTEL_EBPF_LOG_LEVEL` на `debug`. Це забезпечує більш детальні журнали, які можуть допомогти в діагностиці проблем.

Щоб увімкнути журнал з програм BPF, встановіть конфігурацію `ebpf.bpf_debug` або змінну середовища `OTEL_EBPF_BPF_DEBUG` на `true`. **Використовуйте це тільки для налагодження**, оскільки це може генерувати значну кількість логів.

### Ведення логу конфігурації {#configuration-logging}

Стандартно OBI обʼєднує свою конфігурацію з трьох різних джерел, від найменшого до найбільшого пріоритету:

- Вбудована стандартна конфігурація
- Файл конфігурації, наданий за допомогою прапорця `--config` або
  `OTEL_EBPF_CONFIG_PATH`
- Змінні середовища, що зазвичай починаються з `OTEL_EBPF_`

Часто буває корисно переглянути остаточну обʼєднану конфігурацію. Використовуючи значення конфігурації `log_config` (або змінну середовища `OTEL_EBPF_LOG_CONFIG`), ви можете вказати OBI реєструвати остаточну конфігурацію під час запуску.

`log_config` підтримує такі значення:

- `yaml` — реєструє остаточну конфігурацію у форматі YAML; найкраще підходить для читання людиною, оскільки відповідає структурі файлу конфігурації
- `json` — реєструє остаточну конфігурацію у форматі JSON; найкраще підходить для передавачів журналів, оскільки це один структурований рядок

### Внутрішні метрики {#internal-metrics}

Ви можете налаштувати та використовувати [внутрішні метрики OBI](../metrics/#internal-metrics) для моніторингу продуктивності та внутрішнього стану.

Щоб увімкнути внутрішні метрики, налаштуйте `internal_metrics.exporter` з одним із таких значень:

- `none` (стандартно): вимикає внутрішні метрики
- `prometheus`: експортує внутрішні метрики у форматі Prometheus через HTTP-сервер
- `otlp`: експортує внутрішні метрики через експортер OTLP

### Експортер трасування налагодження {#debug-traces-exporter}

Щоб налагодити необроблені трасування, згенеровані OBI, можна встановити значення конфігурації `otel_traces_exporter.protocol` або змінну середовища `OTEL_EXPORTER_OTLP_TRACES_PROTOCOL` на `debug`. Це реєструє необроблені трасування в консолі у форматі, зрозумілому для людини, що відповідає експортеру налагодження OTel Collector з `verbosity: detailed`. Приклад трасування в консолі виглядає так:

```text
Traces	{"resource spans": 1, "spans": 1}
ResourceSpans #0
Resource SchemaURL:
Resource attributes:
     -> service.name: Str(flagd)
     -> telemetry.sdk.language: Str(go)
     -> telemetry.sdk.name: Str(opentelemetry-ebpf-instrumentation)
     -> telemetry.sdk.version: Str(main)
     -> host.name: Str(flagd-5cccb4c4f5-sfkcm)
     -> os.type: Str(linux)
     -> service.namespace: Str(opentelemetry-demo)
     -> k8s.owner.name: Str(flagd)
     -> k8s.kind: Str(Deployment)
     -> k8s.replicaset.name: Str(flagd-5cccb4c4f5)
     -> k8s.pod.name: Str(flagd-5cccb4c4f5-sfkcm)
     -> k8s.container.name: Str(flagd)
     -> k8s.deployment.name: Str(flagd)
     -> service.version: Str(2.0.2)
     -> k8s.namespace.name: Str(default)
     -> otel.library.name: Str(go.opentelemetry.io/obi)
ScopeSpans #0
ScopeSpans SchemaURL:
InstrumentationScope
Span #0
    Trace ID       : 63a2723a58e0033170e58b1ff27ef03d
    Parent ID      :
    ID             : fab47609b60cc4e0
    Name           : /opentelemetry.proto.collector.metrics.v1.MetricsService/Export
    Kind           : Client
    Start time     : 2025-11-28 16:10:35.4241749 +0000 UTC
    End time       : 2025-11-28 16:10:35.42555658 +0000 UTC
    Status code    : Unset
    Status message :
Attributes:
     -> rpc.method: Str(/opentelemetry.proto.collector.metrics.v1.MetricsService/Export)
     -> rpc.system: Str(grpc)
     -> rpc.grpc.status_code: Int(0)
     -> server.address: Str(otel-collector.default)
     -> peer.service: Str(otel-collector.default)
     -> server.port: Int(4317)
```

### Профайлер продуктивності (pprof) {#performance-profiler-pprof}

OBI може відкрити порт `pprof` для профілювання продуктивності. Щоб увімкнути його, встановіть значення конфігурації `profile_port` або змінну середовища `OTEL_EBPF_PROFILE_PORT` на бажаний порт.

Це розширений випадок використання, який зазвичай не є необхідним.

## Поширені проблеми з OBI {#common-obi-issues}

У цьому розділі описано, як вирішувати поширені проблеми з OBI.

### Служби Node.js виходять з ладу або перестають відповідати під час роботи OBI {#nodejs-services-crash-or-become-unresponsive-when-obi-is-running}

Для кращого поширення контексту в застосунках Node.js OBI вставляє власний код для відстеження поточного контексту виконання. Для цього використовується протокол інспектора Node.js, який надсилає сигнал `SIGUSR1` до процесу Node для відкриття інспектора.

Однак, якщо застосунок визначає власний обробник сигналу `SIGUSR1`, він обробляє сигнал OBI у власний спосіб, що може спричинити збій або відсутність відповіді цільового застосунку. Наприклад:

```javascript
process.on('SIGUSR1', () => {
  process.exit(0);
});
```

Або за допомогою прапорців Node.js, які реєструють власну обробку сигналів, наприклад:

```commandline
node --heapsnapshot-signal=SIGUSR1
```

**Рішення:**

- Використовуйте конфігурацію `discovery`, щоб виключити певні застосунки Node.js із відстеження OBI, запобігаючи надсиланню OBI сигналу `SIGUSR1`.
- Повністю вимкніть поширення контексту Node.js, встановивши `nodejs.enabled:false` у файлі конфігурації або змінній середовища `OTEL_EBPF_NODEJS_ENABLED=false`.

### Екземпляри ClickHouse виходять з ладу під час роботи OBI {#clickhouse-instances-crash-when-obi-is-running}

Якщо ви використовуєте [Clickhouse](https://github.com/ClickHouse/ClickHouse) на тому самому вузлі, що й OBI, ви можете помітити, що ClickHouse виходить з ладу, і в журналах зʼявляються такі записи:

```text
Application: Code: 246. DB::Exception: Calculated checksum of the executable (...) does not correspond to the reference checksum ...
```

Проблема, ймовірно, викликана тим, що OBI приєднує eBPF uprobes до бінарного файлу ClickHouse.
[Відповідний тікет на GitHub](https://github.com/ClickHouse/ClickHouse/issues/83637) пояснює цю поведінку:

> При приєднанні uprobe ядро модифікує памʼять цільового процесу, щоб вставити інструкцію trap за адресою приєднання. Це призводить до того, що перевірка контрольної суми бінарного файлу ClickHouse під час запуску завершується з помилкою.

**Рішення:**

Запустіть ClickHouse з прапорцем [skip_binary_checksum_checks](https://clickhouse.com/docs/operations/server-configuration-parameters/settings#skip_binary_checksum_checks)

### Відсутні дані телеметрії для застосунків Go або запитів TLS {#missing-telemetry-data-for-go-applications-or-tls-requests}

Якщо вам не вистачає телеметричних даних, що надходять від застосунків Go або запитів TLS (наприклад, HTTPS-комунікації), це може бути спричинене недостатніми правами для підключення uprobes. Через нещодавні зміни в безпеці ядра, які були перенесені на багато старих версій ядра, uprobes тепер вимагають можливості `CAP_SYS_ADMIN`. OBI використовує uprobes для інструментування застосунків Golang і запитів TLS, а також інших інструментувань, специфічних для середовища виконання/мови. Якщо ваша конфігурація безпеки розгортання OBI не використовує привілейовану операцію (наприклад, `privileged:true` або Docker і Kubernetes) або не надає `CAP_SYS_ADMIN` як функцію безпеки, ви можете не бачити частину або всю телеметрію.

Щоб усунути цю проблему, увімкніть детальне логування OBI за допомогою `OTEL_EBPF_LOG_LEVEL=debug`. Якщо ви бачите, що всі введення uprobe завершуються з помилкою «setting uprobe (offset)...», то, ймовірно, ви стикаєтеся з цією проблемою.

**Рішення:**

Ви можете:

- Запустити OBI як привілейований процес.
- Додати `CAP_SYS_ADMIN` до списку можливостей у вашій конфігурації безпеки розгортання.
