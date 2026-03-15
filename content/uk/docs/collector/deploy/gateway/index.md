---
title: Шаблон розгортання — Gateway
linkTitle: Шаблон Gateway
description: Дізнайтеся, чому і як спочатку надсилати сигнали до єдиної точки доступу OTLP, а звідти до бекендів
aliases: [/docs/collector/deployment/gateway]
weight: 300
default_lang_commit: 5f551752635886a0d2d6b2a83e5a36866ca1b5f1
# prettier-ignore
cSpell:ignore: filelogreceiver hostmetricsreceiver hostnames loadbalancer loadbalancing resourcedetectionprocessor субключ
---

Схема розгортання шлюзу-колектора складається з застосунків або інших колекторів, які надсилають телеметричні сигнали до єдиної точки кінцевого доступу [OTLP](/docs/specs/otlp/). Ця точка доступу надається одним або кількома екземплярами колектора, що працюють як самостійний сервіс, наприклад, у Kubernetes deployment. Зазвичай точка доступу надається для кожного кластера, центру обробки даних або регіону.

У загальному випадку ви можете використовувати готовий балансувальник навантаження для розподілу навантаження між Колекторами:

![Концепція розгортання шлюзу](../../img/otel-gateway-sdk.svg)

Для випадків використання, коли дані телеметрії необхідно обробляти в певному колекторі, використовуйте дворівневу конфігурацію. Колектор першого рівня має конфігурований конвеєр із [експортером з балансуванням навантаження з урахуванням ідентифікатора трасування/назви сервісу][lb-exporter]. На другому рівні кожен колектор отримує та обробляє телеметрію, яка може бути спрямована саме до нього. Наприклад, ви можете використовувати експортер з балансуванням навантаження на першому рівні для надсилання даних до колектора другого рівня, налаштованого з [процесором вибірки наприкінці][tailsample-processor], щоб усі відрізки для певного трасування досягали того самого екземпляра колектора, де застосовується політика вибіркового відбору наприкінці.

На наступній діаграмі показано цю конфігурацію з використанням експортера з балансуванням навантаження:

![Розгортання шлюзу з експортером балансування навантаження](../../img/otel-gateway-lb-sdk.svg)

1. У застосунку SDK налаштовано на надсилання даних OTLP до центрального місця.
2. Колектор налаштований на використання експортера з балансуванням навантаження для розподілу сигналів між групою Колекторів.
3. Колектори надсилають телеметричні дані до одного або кількох бекендів.

## Приклади {#examples}

Наступні приклади показують, як налаштувати шлюз-колектор із загальними компонентами.

### NGINX як "готовий" балансувальник навантаження {#nginx-as-an-out-of-the-box-load-balancer}

Припустимо, у вас є три колектори (`collector1`, `collector2` та `collector2`), налаштовані, і ви хочете балансувати трафік між ними за допомогою NGINX, ви можете використовувати наступну конфігурацію:

```nginx
server {
    listen 4317 http2;
    server_name _;

    location / {
            grpc_pass      grpc://collector4317;
            grpc_next_upstream     error timeout invalid_header http_500;
            grpc_connect_timeout   2;
            grpc_set_header        Host            $host;
            grpc_set_header        X-Real-IP       $remote_addr;
            grpc_set_header        X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}

server {
    listen 4318;
    server_name _;

    location / {
            proxy_pass      http://collector4318;
            proxy_redirect  off;
            proxy_next_upstream     error timeout invalid_header http_500;
            proxy_connect_timeout   2;
            proxy_set_header        Host            $host;
            proxy_set_header        X-Real-IP       $remote_addr;
            proxy_set_header        X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}

upstream collector4317 {
    server collector1:4317;
    server collector2:4317;
    server collector3:4317;
}

upstream collector4318 {
    server collector1:4318;
    server collector2:4318;
    server collector3:4318;
}
```

### Експортер балансування навантаження {#load-balancing-exporter}

Для конкретного прикладу централізованої моделі розгортання Колектора спочатку розглянемо експортер з балансуванням навантаження. Він має два основні поля конфігурації:

- `resolver` визначає де знайти підлеглі (downstream) Колектори або бекенди. Якщо ви використовуєте субключ `static`, вам треба вручну вказати всі URL-адреси Колекторів. Інший підтримуваний резолвер — це DNS резолвер, який періодично перевіряє оновлення та виявляє IP-адреси. Для цього типу резолвера підключення `hostname` вказує імʼя хосту для запиту, щоб отримати список IP-адрес.
- Полем `routing_key` вказує експортеру маршрутизувати відрізки до конкретних підлеглих Колекторів. Якщо ви встановите це поле на `traceID`, експортер з балансуванням навантаження експортує відрізки на основі їх `traceID`. В іншому випадку, якщо ви використовуєте `service` як значення для `routing_key`, він експортує відрізки на основі назви їх сервісу, що корисно при використанні конекторів, таких як [конектор метрик відрізків][spanmetrics-connector], щоб усі відрізки сервісу надсилалися до одного і того ж підлеглого Колектора для збору метрик, гарантуючи точні агрегування.

Колектор першого рівня, що обслуговує точку доступу OTLP, буде налаштований, як показано нижче:

{{< tabpane text=true >}} {{% tab Static %}}

```yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317

exporters:
  loadbalancing:
    protocol:
      otlp:
        tls:
          insecure: true
    resolver:
      static:
        hostnames:
          - collector-1.example.com:4317
          - collector-2.example.com:5317
          - collector-3.example.com

service:
  pipelines:
    traces:
      receivers: [otlp]
      exporters: [loadbalancing]
```

{{% /tab %}} {{% tab DNS %}}

```yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317

exporters:
  loadbalancing:
    protocol:
      otlp:
        tls:
          insecure: true
    resolver:
      dns:
        hostname: collectors.example.com

service:
  pipelines:
    traces:
      receivers: [otlp]
      exporters: [loadbalancing]
```

{{% /tab %}} {{% tab "DNS with service" %}}

```yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317

exporters:
  loadbalancing:
    routing_key: service
    protocol:
      otlp:
        tls:
          insecure: true
    resolver:
      dns:
        hostname: collectors.example.com
        port: 5317

service:
  pipelines:
    traces:
      receivers: [otlp]
      exporters: [loadbalancing]
```

{{% /tab %}} {{< /tabpane >}}

Експортер балансування навантаження генерує [метрики](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/loadbalancingexporter#metrics), включаючи `otelcol_loadbalancer_num_backends` та `otelcol_loadbalancer_backend_latency`, які ви можете використовувати для моніторингу справності та продуктивності Колектора точки доступу OTLP.

## Комбіноване розгортання Колекторів як агентів та шлюзів {#combined-deployment-of-collectors-as-agents-and-gateways}

Часто розгортання кількох Колекторів OpenTelemetry включає запуск як Колекторів-шлюзів, так і [Колекторів-агентів](/docs/collector/deploy/agent/).

Наступна діаграма показує архітектуру для такого комбінованого розгортання:

- Використовуйте Колектори, що працюють у шаблоні розгортання агента (що працюють на кожному хості, подібно до daemonsets Kubernetes), для збору телеметрії з сервісів, що працюють на хості, і телеметрії хосту, таких як метрики хосту та збирання логів.
- Використовуйте Колектори, що працюють у шаблоні розгортання шлюзу, для обробки даних, таких як фільтрація, вибірковий відбір і експорт до бекендів.

![шлюз](otel-gateway-arch.svg)

Цей комбінований шаблон розгортання необхідний, коли ви використовуєте компоненти у вашому Колекторі, які або повинні бути унікальними для кожного хосту, або споживають інформацію, яка доступна лише на тому ж хості, де працює застосунок:

- Приймачі, такі як [`hostmetricsreceiver`](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/hostmetricsreceiver) або [`filelogreceiver`](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/filelogreceiver) повинні бути унікальними для кожного екземпляра хосту. Запуск кількох екземплярів цих приймачів на тому самому хості призведе до дублювання даних.

- Процесори, такі як [`resourcedetectionprocessor`](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/resourcedetectionprocessor) додають інформацію про хост, де обидва, і Колектор і застосунок, працюють. Виконання процесора в колекторі на окремій від застосунку машині призводить до некоректних даних.

## Компроміси {#trade-offs}

Переваги:

- Розділення обовʼязків, таких як централізоване управління обліковими даними
- Централізоване управління політиками (наприклад, фільтрація певних логів або вибірковий відбір)

Недоліки:

- Це ще одна річ, яку потрібно підтримувати і яка може вийти з ладу (складність)
- Додана затримка у випадку каскадних колекторів
- Вищі загальні витрати ресурсів (витрати)

[lb-exporter]: https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/loadbalancingexporter
[tailsample-processor]: https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/tailsamplingprocessor
[spanmetrics-connector]: https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/connector/spanmetricsconnector

## Кілька Колекторів та принцип єдиного записувача {#multiple-collectors-and-the-single-writer-principle}

Всі потоки даних метрик в OTLP повинні мати [єдиного записувача](/docs/specs/otel/metrics/data-model/#single-writer). При розгортанні декількох Колекторів у конфігурації шлюзу важливо переконатися, що всі потоки метрик мають єдиного записувача і глобальний унікальний ідентифікатор.

### Потенційні проблеми {#potential-problems}

Одночасний доступ з декількох застосунків, які змінюють або звітують про ті самі дані, може призвести до втрати даних або погіршення їх якості. Наприклад, ви можете побачити неузгоджені дані з декількох джерел на одному ресурсі, де різні джерела можуть перезаписати один одного, оскільки ресурс не має однозначної ідентифікації.

Існують закономірності в даних, які можуть дати певне уявлення про те, чи відбувається це чи ні. Наприклад, при візуальному огляді серія з незрозумілими прогалинами або стрибками в одній серії може свідчити про те, що кілька колекторів надсилають одну й ту ж вибірку. Ви також можете побачити помилки у вашому бекенді. Наприклад, у бекенді Prometheus:

`Error on ingesting out-of-order samples`

Ця помилка може вказувати на те, що в двох завданнях існують однакові цілі, а порядок міток часу неправильний. Наприклад:

- Метрика `M1` отримана в `T1` з міткою часу 13:56:04 зі значенням `100`.
- Метрика `M1` отримана о `T2` з міткою часу 13:56:24 зі значенням `120`
- Метрика `M1` отримана о `T3` з часовою міткою 13:56:04 зі значенням `110`
- Метрика `M1` отримана о 13:56:24 зі значенням `120
- Метрика `M1`, отримана о 13:56:04 зі значенням `110

### Поради {#best-practices}

- Використовуйте [обробник атрибутів Kubernetes](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/k8sattributesprocessor) для додавання міток до різних ресурсів Kubernetes.
- Використовуйте [процесор виявлення ресурсів](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/processor/resourcedetectionprocessor/README.md) для виявлення інформації про ресурси на хості та збору метаданих про ресурси.
