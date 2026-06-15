---
title: Перетворення телеметрії
weight: 26
default_lang_commit: e05fefe6c9f7d8b159d9a9a95128098c646c78c4
# prettier-ignore
cSpell:ignore: accountid clustername k8sattributes metricstransform OTTL resourcedetection
---

OpenTelemetry Collector — це зручне місце для перетворення даних перед надсиланням їх постачальнику або іншим системам. Це часто робиться з міркувань якості даних, управління, вартості та безпеки.

Обробники, доступні в [Collector Contrib репозиторії](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor), підтримують десятки різних перетворень метрик, відрізків та даних логів. У наступних розділах наведено кілька базових прикладів для початку роботи з деякими часто використовуваними процесорами.

Конфігурація процесорів, особливо розширені перетворення, може мати значний вплив на продуктивність колектора.

## Базова фільтрація {#basic-filtering}

**Процесор**: [filter processor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/filterprocessor)

Процесор фільтрації дозволяє користувачам фільтрувати телеметрію за допомогою [OTTL](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/ottl/README.md). Телеметрія, яка відповідає будь-якій умові, відкидається.

Наприклад, дозволити _лише_ дані з сервісів app1, app2 та app3 і відкинути дані з усіх інших сервісів:

```yaml
processors:
  filter/ottl:
    error_mode: ignore
    traces:
      span:
        - |
        resource.attributes["service.name"] != "app1" and
        resource.attributes["service.name"] != "app2" and
        resource.attributes["service.name"] != "app3"
```

Для того, щоб відкинути лише відрізки з сервісу з назвою `service1`, зберігаючи всі інші відрізки:

```yaml
processors:
  filter/ottl:
    error_mode: ignore
    traces:
      span:
        - resource.attributes["service.name"] == "service1"
```

Документація [filter processor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/filterprocessor) містить більше прикладів, включаючи фільтрацію за логами та метриками.

## Додавання або видалення атрибутів {#adding-or-deleting-attributes}

**Процесор**: [attributes processor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/attributesprocessor) або [resource processor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/resourceprocessor)

Процесор атрибутів можна використовувати для оновлення, вставки, видалення або заміни наявних атрибутів у метриках або відрізках. Наприклад, ось конфігурація, яка додає атрибут з назвою account_id до всіх відрізків:

```yaml
processors:
  attributes/accountid:
    actions:
      - key: account_id
        value: 2245
        action: insert
```

Процесор ресурсів має ідентичну конфігурацію, але застосовується лише до [атрибутів ресурсів](/docs/specs/semconv/resource/). Використовуйте процесор ресурсів для зміни метаданих інфраструктури, повʼязаних з телеметрією. Наприклад, це додає назву кластера Kubernetes:

```yaml
processors:
  resource/k8s:
    attributes:
      - key: k8s.cluster.name
        from_attribute: k8s-cluster
        action: insert
```

## Перейменування метрик або міток метрик{#renaming-metrics-or-metric-labels}

**Процесор:** [metrics transform processor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/metricstransformprocessor)

[metrics transform processor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/metricstransformprocessor) має деяку функціональність, спільну з [attributes processor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/attributesprocessor), але також підтримує перейменування та іншу специфічну для метрик функціональність.

```yaml
processors:
  metricstransform/rename:
    transforms:
      - include: system.cpu.usage
        action: update
        new_name: system.cpu.usage_time
```

Процесор [metrics transform processor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/metricstransformprocessor) також підтримує регулярні вирази для застосування правил перетворення до кількох назв метрик або міток метрик одночасно. Цей приклад перейменовує cluster_name на cluster-name для всіх метрик:

```yaml
processors:
  metricstransform/clustername:
    transforms:
      - include: ^.*$
        match_type: regexp
        action: update
        operations:
          - action: update_label
            label: cluster_name
            new_label: cluster-name
```

## Збагачення телеметрії атрибутами ресурсів {#enriching-telemetry-with-resource-attributes}

**Процесор**:
[resource detection processor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/resourcedetectionprocessor) та [k8sattributes processor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/k8sattributesprocessor)

Ці процесори можна використовувати для збагачення телеметрії відповідними метаданими інфраструктури, щоб допомогти командам швидко визначити, коли підрядна інфраструктура впливає на справність або продуктивність служби.

Процесор виявлення ресурсів додає до телеметрії відповідну інформацію на рівні хмари або хосту:

```yaml
processors:
  resourcedetection/system:
    # Змініть список детекторів відповідно до хмарного середовища
    detectors: [env, system, gcp, ec2, azure]
    timeout: 2s
    override: false
```

Аналогічно, процесор K8s збагачує телеметрію відповідними метаданими Kubernetes, такими як назва пода, назва вузла або назва робочого навантаження. Под колектора повинен бути налаштований на надання [доступу для читання для певних API Kubernetes RBAC](https://pkg.go.dev/github.com/open-telemetry/opentelemetry-collector-contrib/processor/k8sattributesprocessor#readme-role-based-access-control). Щоб використовувати стандартні параметри, його можна налаштувати з порожнім блоком:

```yaml
processors:
  k8sattributes/default:
```

## Встановлення статусу відрізка {#setting-a-span-status}

**Процесор**: [transform processor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/transformprocessor)

Використовуйте процесор перетворення, щоб встановити статус відрізка. Наступний приклад встановлює статус відрізка на `Ok`, коли атрибут `http.request.status_code` дорівнює 400:

<!-- prettier-ignore-start -->

```yaml
transform:
  error_mode: ignore
  trace_statements:
    - set(span.status.code, STATUS_CODE_OK) where span.attributes["http.request.status_code"] == 400
```

<!-- prettier-ignore-end -->

Ви також можете використовувати процесор перетворення, щоб змінити назву відрізка на основі його атрибутів або витягнути атрибути відрізка з назви відрізка. Дивіться приклад [файлу конфігурації](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/9b28f76c02c18f7479d10e4b6a95a21467fd85d6/processor/transformprocessor/testdata/config.yaml) для процесора перетворення.

## Розширені перетворення {#advanced-transformations}

Складніші перетворення атрибутів також доступні в [процесорі перетворення](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/transformprocessor). Процесор перетворення дозволяє кінцевим користувачам вказувати перетворення для метрик, логів і трейсів за допомогою [OpenTelemetry Transformation Language](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/pkg/ottl).
