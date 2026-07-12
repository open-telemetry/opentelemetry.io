---
title: Найкращі практики конфігурації Collector
linkTitle: Конфігурація Collector
weight: 112
default_lang_commit: 5489ba34bff91356aa2c501cd55f07eeb30cc355
cSpell:ignore: exporterhelper
---

Під час налаштування OpenTelemetry (OTel) Collector враховуйте ці найкращі практики для захисту вашого екземпляра Collector.

## Створення безпечних конфігурацій {#create-secure-configurations}

Дотримуйтесь цих рекомендацій, щоб захистити конфігурацію вашого Collector та його конвеєри.

### Зберігайте конфігурацію захищено {#store-configuration-securely}

Конфігурація Collector може містити конфіденційну інформацію, включаючи:

- Інформацію для автентифікації, таку як API токени.
- TLS сертифікати, включаючи приватні ключі.

Ви повинні зберігати конфіденційну інформацію захищено, наприклад, на зашифрованій
файловій системі або в сховищі секретів. Ви можете використовувати змінні середовища для обробки конфіденційних та неконфіденційних даних, оскільки Collector підтримує [розширення змінних середовища](/docs/collector/configuration/#environment-variables).

### Використовуйте шифрування та автентифікацію {#use-encryption-and-authentication}

Конфігурація вашого OTel Collector повинна включати шифрування та автентифікацію.

- Для шифрування звʼязку дивіться [Налаштування сертифікатів](/docs/collector/configuration/#setting-up-certificates).
- Для автентифікації використовуйте механізм автентифікації OTel Collector, як описано в розділі [Автентифікація](/docs/collector/configuration/#authentication).

### Мінімізуйте кількість компонентів {#minimize-the-number-of-components}

Ми рекомендуємо обмежити набір компонентів у конфігурації вашого Collector до лише тих, які вам потрібні. Мінімізація кількості використовуваних компонентів мінімізує експоновану поверхню атаки.

- Використовуйте [OpenTelemetry Collector Builder (`ocb`)](/docs/collector/extend/ocb/) для створення дистрибутиву Collector, який використовує лише необхідні компоненти.
- Видаліть невикористовувані компоненти з вашої конфігурації.

### Налаштовуйте з обережністю {#configure-with-caution}

Деякі компоненти можуть збільшити ризик небезпеки у ваших конвеєрів Collector.

- Приймачі, експортери та інші компоненти повинні встановлювати мережеві зʼєднання через захищений канал, можливо, також автентифікований.
- Приймачі та експортери можуть експонувати налаштування буфера, черги, навантаження та робітників за допомогою параметрів конфігурації. Якщо ці налаштування доступні, ви повинні діяти з обережністю перед зміною стандартних значень конфігурації. Неправильне налаштування цих значень може експонувати OpenTelemetry Collector до додаткових векторів атаки.

## Встановлюйте дозволи обережно {#set-permissions-carefully}

Уникайте запуску Collector від імені користувача root. Деякі компоненти можуть вимагати спеціальних дозволів. У таких випадках дотримуйтесь принципу найменших привілеїв і переконайтеся, що ваші компоненти мають лише той доступ, який їм потрібен для виконання своєї роботи.

### Спостерігачі {#observers}

Спостерігачі реалізовані як розширення. Розширення — це тип компонентів, які додають можливості поверх основних функцій Collector. Розширення не потребують прямого доступу до телеметрії та не є частиною конвеєрів, але вони все ще можуть становити ризики безпеки, якщо вони вимагають спеціальних дозволів.

Спостерігач виявляє мережеві точки доступу, такі як podʼи Kubernetes, контейнери Docker або локальні порти, що слухають, від імені [receiver creator](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/receiver/receivercreator/README.md). Для виявлення сервісів спостерігачі можуть вимагати більшого доступу. Наприклад, `k8s_observer` вимагає [дозволів на основі ролей (RBAC)](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/extension/observer/k8sobserver#setting-up-rbac-permissions) у Kubernetes.

## Управління конкретними ризиками безпеки {#manage-specific-security-risks}

Налаштуйте ваш Collector для блокування цих загроз безпеки.

### Захист від атак відмови в обслуговуванні {#protect-against-denial-of-service-attacks}

Для приймачів та розширень, що працюють як сервери, ви можете захистити ваш Collector від експонування в інтернет або до ширших мереж, ніж необхідно, привʼязуючи точки доступу цих компонентів до адрес, які обмежують зʼєднання до авторизованих користувачів. Намагайтеся завжди використовувати конкретні інтерфейси, такі як IP podʼа, або `localhost` замість `0.0.0.0`. Для отримання додаткової інформації дивіться [CWE-1327: Привʼязка до необмеженої IP-адреси](https://cwe.mitre.org/data/definitions/1327.html).

З Collector v0.110.0, стандартно хостом для всіх серверів у компонентах Collector є `localhost`. Для попередніх версій Collector змініть стандартну точку доступу з `0.0.0.0` на `localhost` у всіх компонентах, увімкнувши [функціональну можливість](https://github.com/open-telemetry/opentelemetry-collector/tree/main/featuregate) `component.UseLocalHostAsDefaultHost` .

Якщо `localhost` розвʼязується до іншої IP через ваші налаштування DNS, тоді явно використовуйте IP зворотнього виклику: `127.0.0.1` для IPv4 або `::1` для IPv6. Наприклад, ось конфігурація IPv4 з використанням порту gRPC:

```yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 127.0.0.1:4317
```

У налаштуваннях IPv6 переконайтеся, що ваша система підтримує як IPv4, так і IPv6 адреси зворотнього виклику, щоб мережа працювала належним чином у середовищах з подвійним стеком та застосунках, де використовуються обидві версії протоколу.

Якщо ви працюєте в середовищах з нестандартними мережевими налаштуваннями, таких як Docker або Kubernetes, `localhost` може не працювати як очікується. Наступні приклади показують налаштування для точки доступу приймача OTLP gRPC. Інші компоненти Collector можуть потребувати подібної конфігурації.

#### Docker

Ви можете запустити Collector у Docker, привʼязуючись до правильної адреси. Ось файл конфігурації `config.yaml` для експортера OTLP у Docker:

```yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: my-hostname:4317 # Використовуйте те саме імʼя хоста з вашої команди docker run
```

У вашій команді `docker run` використовуйте аргумент `--hostname`, щоб привʼязати Collector до адреси `my-hostname`. Ви можете отримати доступ до Collector з зовні цієї мережі Docker (наприклад, у звичайній програмі, що працює на хості), підключившись до `127.0.0.1:4567`. Ось приклад команди `docker run`:

```shell
docker run --hostname my-hostname --name container-name -p 127.0.0.1:4567:4317 otel/opentelemetry-collector:{{% param collector_vers %}}
```

#### Docker Compose

Подібно до звичайного Docker, ви можете запустити Collector у Docker, привʼязуючи до правильної адреси.

Файл Docker `compose.yaml`:

```yaml
services:
  otel-collector:
    image: otel/opentelemetry-collector-contrib:{{% param collector_vers %}}
    ports:
      - '4567:4317'
```

Файл конфігурації Collector `config.yaml`:

```yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: otel-collector:4317 # Використовуйте імʼя сервісу з вашого файлу Docker compose
```

Ви можете підключитися до цього Collector з іншого контейнера Docker, що працює в тій самій мережі, підключившись до `otel-collector:4317`. Ви можете отримати доступ до Collector з зовні цієї мережі Docker (наприклад, у звичайній програмі, що працює на хості), підключившись до `127.0.0.1:4567`.

#### Kubernetes

Якщо ви запускаєте Collector як `DaemonSet`, ви можете використовувати конфігурацію, як показано нижче:

```yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: collector
spec:
  selector:
    matchLabels:
      name: collector
  template:
    metadata:
      labels:
        name: collector
    spec:
      containers:
        - name: collector
          image: otel/opentelemetry-collector:{{% param collector_vers %}}
          ports:
            - containerPort: 4317
              hostPort: 4317
              protocol: TCP
              name: otlp-grpc
            - containerPort: 4318
              hostPort: 4318
              protocol: TCP
              name: otlp-http
          env:
            - name: MY_POD_IP
              valueFrom:
                fieldRef:
                  fieldPath: status.podIP
```

У цьому прикладі ви використовуєте [API Kubernetes Downward](https://kubernetes.io/docs/concepts/workloads/pods/downward-api/) для отримання IP вашого podʼа, а потім привʼязуєтеся до цього мережевого інтерфейсу. Потім ми використовуємо опцію `hostPort`, щоб переконатися, що Collector експонується на хості. Конфігурація Collector повинна виглядати так:

```yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: ${env:MY_POD_IP}:4317
      http:
        endpoint: ${env:MY_POD_IP}:4318
```

Ви можете надсилати дані OTLP до цього Collector з будь-якого podʼа на вузлі, підключившись до `${MY_HOST_IP}:4317` для надсилання OTLP через gRPC та `${MY_HOST_IP}:4318` для надсилання OTLP через HTTP, де `MY_HOST_IP` - це IP-адреса вузла. Ви можете отримати цю IP-адресу з API Downward:

```yaml
env:
  - name: MY_HOST_IP
    valueFrom:
      fieldRef:
        fieldPath: status.hostIP
```

### Видалення конфіденційних даних {#scrub-sensitive-data}

[Процесори](/docs/collector/configuration/#processors) — це компоненти Collector, які знаходяться між приймачами та експортерами. Вони відповідають за обробку телеметрії перед її аналізом. Ви можете використовувати `redaction` процесор OpenTelemetry Collector для обфускації або видалення конфіденційних даних перед експортом їх до бекенду.

[`redaction` процесор](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/redactionprocessor) видаляє атрибути точок даних відрізків, логів та метрик, які не відповідають списку дозволених атрибутів. Він також маскує значення атрибутів, які відповідають списку заблокованих значень. Атрибути, які не входять до списку дозволених, видаляються перед будь-якими перевірками значень.

Наприклад, ось конфігурація, яка маскує значення, що містять номери кредитних карток:

```yaml
processors:
  redaction:
    allow_all_keys: false
    allowed_keys:
      - description
      - group
      - id
      - name
    ignored_keys:
      - safe_attribute
    blocked_values: # Регулярні вирази для блокування значень дозволених атрибутів відрізків
      - '4[0-9]{12}(?:[0-9]{3})?' # Номер кредитної картки Visa
      - '(5[1-5][0-9]{14})' # Номер MasterCard
    summary: debug
```

Дивіться [документацію](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/redactionprocessor) щоб дізнатися, як додати `redaction` процесор до конфігурації вашого Collector.

### Захист використання ресурсів {#safeguard-resource-utilization}

Після впровадження заходів захисту використання ресурсів у вашій [інфраструктурі хостингу](../hosting-best-practices/), розгляньте також додавання цих заходів до конфігурації вашого OpenTelemetry Collector.

Пакетування вашої телеметрії та обмеження памʼяті, доступної для вашого Collector, може запобігти помилкам через нестачу памʼяті та пікам використання. Ви також можете обробляти піки трафіку, налаштовуючи розміри черг для управління використанням памʼяті, уникаючи втрати даних. Наприклад, використовуйте [`exporterhelper`](https://github.com/open-telemetry/opentelemetry-collector/blob/main/exporter/exporterhelper/README.md) для управління розміром черги для вашого експортера `otlp`:

```yaml
exporters:
  otlp:
    endpoint: <ENDPOINT>
    sending_queue:
      queue_size: 800
```

Фільтрація небажаної телеметрії — це ще один спосіб захисту ресурсів вашого Collector. Фільтрація не тільки захищає ваш екземпляр Collector, але й зменшує навантаження на ваш бекенд. Ви можете використовувати [`filter` процесор](/docs/collector/transforming-telemetry/#basic-filtering) для видалення логів, метрик та відрізків, які вам не потрібні. Наприклад, ось конфігурація, яка видаляє не-HTTP відрізки:

```yaml
processors:
  filter:
    error_mode: ignore
    traces:
      span:
        - attributes["http.request.method"] == nil
```

Ви також можете налаштувати ваші компоненти з відповідними обмеженнями часу очікування та повторних спроб. Ці обмеження повинні дозволити вашому Collector обробляти збої без накопичення надто великої кількості даних у памʼяті. Дивіться [документацію `exporterhelper`](https://github.com/open-telemetry/opentelemetry-collector/blob/main/exporter/exporterhelper/README.md) для отримання додаткової інформації.

Нарешті, розгляньте можливість використання стиснення з вашими експортерами для зменшення розміру відправлених даних та збереження мережевих та процесорних ресурсів.Стандартно, [`otlp` експортер](https://github.com/open-telemetry/opentelemetry-collector/tree/main/exporter/otlpexporter) використовує стиснення `gzip`.
