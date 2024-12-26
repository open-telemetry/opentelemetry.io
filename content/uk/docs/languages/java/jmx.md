---
title: Метрики JMX
weight: 14
description: Збирання метрик з JMX MBeans за допомогою OpenTelemetry
default_lang_commit: 311e7819e9eacf9d8b6d250bbdee98c018ea232e
cSpell:ignore: jconsole jmxremote mbean mbeans visualvm wildfly
---

На цій сторінці описано, як збирати метрики з [JMX](https://docs.oracle.com/javase/8/docs/technotes/guides/management/agent.html) (Java Management Extensions) MBeans та експортувати їх до OpenTelemetry.

## Огляд {#overview}

JMX (Java Management Extensions) — це технологія Java, яка надає інструменти для керування та моніторингу застосунків через JMX MBeans (Managed Beans). Ці MBeans надають атрибути та операції керування, які можна спостерігати зовні.

Модуль OpenTelemetry JMX Metric Insight дозволяє інтегрувати метрики JMX в OpenTelemetry, що дає змогу:

- Моніторити метрики JVM (памʼять, збір сміття, потоки тощо)
- Збирати метрики з MBeans, специфічних для застосунку
- Експортувати дані JMX разом з іншими сигналами телеметрії OpenTelemetry
- Використовувати попередньо визначені відображення метрик для популярних цільових систем (Tomcat, Jetty, Wildfly, ...)

## Встановлення {#installation}

### Використання Java агента {#using-the-java-agent}

Найпростіший спосіб збирати метрики JMX — використовувати OpenTelemetry Java агент з розширенням метрик JMX:

1. Завантажте OpenTelemetry Java агента (якщо він ще не встановлений):

   ```sh
   curl -L -O https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/latest/download/opentelemetry-javaagent.jar
   ```

2. Запустіть ваш застосунок з агентом та увімкніть метрики JMX:

   ```sh
   java -javaagent:opentelemetry-javaagent.jar \
     -Dotel.jmx.target.system=tomcat \
     -Dotel.jmx.config=/path/to/custom-metrics.yaml \
     -jar myapp.jar
   ```

Збирання метрик JMX вмикається шляхом встановлення одного (або обох) з наступних параметрів конфігурації:

- `otel.jmx.target.system` для вибору попередньо визначених наборів метрик
- `otel.jmx.config` для вказання шляху до користувацьких правил JMX

При використанні Java агента, метрики виконання JVM (CPU, памʼять, ...) збираються через модуль `runtime-telemetry` і зазвичай увімкнені без додаткової конфігурації.

## Конфігурація {#configuration}

Метрики JMX можна збирати двома способами:

- **Зсередини JVM** за допомогою внутрішнього інтерфейсу JMX з Java агентом
- **Ззовні JVM** за допомогою віддаленого інтерфейсу JMX з JMX Scraper

### Конфігурація Java агента {#java-agent-configuration}

При використанні OpenTelemetry Java агента, налаштуйте метрики JMX за допомогою цих властивостей:

| Системна властивість     | Змінна середовища        | Опис                                                                            | Стандартно |
| ------------------------ | ------------------------ | ------------------------------------------------------------------------------- | ---------- |
| `otel.jmx.enabled`       | `OTEL_JMX_ENABLED`       | Увімкнути збір метрик JMX                                                       | `true`     |
| `otel.jmx.target.system` | `OTEL_JMX_TARGET_SYSTEM` | Список попередньо визначених наборів метрик для використання, розділених комами | немає      |
| `otel.jmx.config`        | `OTEL_JMX_CONFIG`        | Шлях до користувацького YAML для відображення метрик                            | немає      |

### Конфігурація JMX Scraper {#jmx-scraper-configuration}

При використанні автономного JMX Scraper для збору метрик з віддаленого JVM, налаштуйте його за допомогою цих властивостей (зауважте: `otel.jmx.enabled` не потрібен).

| Системна властивість     | Змінна середовища        | Опис                                                                            | Стандартно    |
| ------------------------ | ------------------------ | ------------------------------------------------------------------------------- | ------------- |
| `otel.jmx.service.url`   | `OTEL_JMX_SERVICE_URL`   | JMX service URL для підключення до віддаленого JVM                              | (обовʼязково) |
| `otel.jmx.target.system` | `OTEL_JMX_TARGET_SYSTEM` | Список попередньо визначених наборів метрик для використання, розділених комами | немає         |
| `otel.jmx.config`        | `OTEL_JMX_CONFIG`        | Шлях до користувацького YAML для відображення метрик                            | немає         |

Повну довідку щодо налаштування див. у [документації до JMX Scraper](https://github.com/open-telemetry/opentelemetry-java-contrib/tree/main/jmx-scraper#configuration-reference).

Зверніть увагу, що віддалений JVM повинен бути налаштований для приймання віддалених JMX-зʼєднань. Рекомендується спочатку перевірити підключення за допомогою інструментів `jconsole` або `visualvm`, щоб переконатися, що конфігурація та необовʼязкова автентифікація працюють належним чином.

### Попередньо визначені цільові системи {#predefined-target-systems}

OpenTelemetry надає попередньо визначені зіставлення метрик для популярних Java-фреймворків та серверів застосунків. Використовуйте властивість `otel.jmx.target.system`, щоб увімкнути їх (доступно як для Java агента, так і для JMX Scraper):

**Приклад - Моніторинг Tomcat (Java агент):**

```sh
java -javaagent:opentelemetry-javaagent.jar \
  -Dotel.jmx.target.system=tomcat \
  -jar myapp.jar
```

Для повного списку доступних цільових систем див.:

- [Попередньо визначені цільові системи Java агента](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/instrumentation/jmx-metrics/README.md#predefined-metric-sets)
- [Попередньо визначені цільові системи JMX Scraper](https://github.com/open-telemetry/opentelemetry-java-contrib/tree/main/jmx-scraper#predefined-metric-sets)

Ви можете вказати кілька цільових систем, розділивши їх комами.

### Віддалені JMX-зʼєднання {#remote-jmx-connections}

Щоб збирати метрики з віддаленого JVM, потрібно використовувати JMX Scraper. Це передбачає наявність двох окремих JVM:

1. **Цільовий JVM** — Застосунок, який моніториться
2. **Scraper JVM** — Збирач метрик JMX

#### Крок 1: Налаштування цільового JVM {#step-1-configure-the-target-jvm}

Спочатку запустіть ваш цільовий застосунок з увімкненим віддаленим JMX:

```sh
java -Dcom.sun.management.jmxremote \
  -Dcom.sun.management.jmxremote.port=9999 \
  -Dcom.sun.management.jmxremote.authenticate=false \
  -Dcom.sun.management.jmxremote.ssl=false \
  -jar myapp.jar
```

> [!WARNING] У наведеному прикладі автентифікація та SSL вимкнені для спрощення.
> У виробничих середовищах завжди увімкніть автентифікацію та SSL для JMX-зʼєднань.

#### Крок 2: Запуск JMX Scraper {#step-2-run-the-jmx-scraper}

Завантажте JMX Scraper зі сторінки [OpenTelemetry Java Contrib releases](https://github.com/open-telemetry/opentelemetry-java-contrib/releases) (шукайте `opentelemetry-jmx-scraper-<version>-all.jar`).

Потім запустіть scraper, вказавши вашу цільову JVM:

```sh
java -Dotel.jmx.service.url=service:jmx:rmi:///jndi/rmi://tomcat.example.com:9999/jmxrmi \
  -Dotel.jmx.target.system=tomcat \
  -jar opentelemetry-jmx-scraper.jar
```

Ви можете налаштувати scraper, використовуючи ті ж властивості, що й Java агент (цільова система, інтервал збору тощо).

Для отримання додаткової інформації див. [документацію JMX Scraper](https://github.com/open-telemetry/opentelemetry-java-contrib/tree/main/jmx-scraper).

> [!NOTE] Якщо ви переходите з застарілого JMX Metric Gatherer,
> див. [посібник з міграції](https://github.com/open-telemetry/opentelemetry-java-contrib/tree/main/jmx-scraper#migrating-from-jmx-metric-gatherer).

## Зіставлення власних метрик {#custom-metric-mappings}

Для специфічних MBean вашого застосунку або власних вимог до моніторингу, ви можете створювати власні зіставлення метрик за допомогою конфігураційного файлу YAML.

### Створення власної конфігурації YAML {#creating-a-custom-yaml-configuration}

Створіть файл YAML, який визначає, як зіставляти атрибути JMX з метриками OpenTelemetry:

**Приклад — `custom-jmx-metrics.yaml`:**

```yaml
rules:
  - bean: com.myapp:type=CustomMetrics
    mapping:
      RequestCount:
        metric: myapp.requests.count
        type: counter
        description: Total request count
        unit: '1'
      ResponseTime:
        metric: myapp.response.time
        type: gauge
        description: Average response time
        unit: ms
      ActiveSessions:
        metric: myapp.sessions.active
        type: updowncounter
        description: Active sessions
        unit: '1'
```

Використайте файл з вашим застосунком:

```sh
java -javaagent:opentelemetry-javaagent.jar \
  -Dotel.jmx.config=/path/to/custom-jmx-metrics.yaml \
  -jar myapp.jar
```

Для повного посилання на синтаксис YAML див. [документацію з конфігурації JMX Metrics](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/instrumentation/jmx-metrics).

## Перевірка {#verification}

Щоб перевірити, що метрики JMX збираються:

1. **Перевірте журнали** — Шукайте повідомлення, що вказують на початок збору метрик JMX
2. **Використовуйте експортер журналів** — налаштуйте експортер журналів, щоб переглядати метрики в консолі без необхідності в бекенді
3. **Використовуйте бекенд метрик** — Налаштуйте OTLP експортер і переглядайте метрики у вашій платформі спостереження
4. **Використовуйте JConsole** — Підключіться до вашого застосунку за допомогою JConsole, щоб перевірити доступність MBeans

**Приклад з експортером журналів (Java агент):**

```sh
java -javaagent:opentelemetry-javaagent.jar \
  -Dotel.metrics.exporter=logging \
  -jar myapp.jar
```

**Приклад з OTLP експортером (Java агент):**

```sh
java -javaagent:opentelemetry-javaagent.jar \
  -Dotel.metrics.exporter=otlp \
  -Dotel.exporter.otlp.endpoint=http://localhost:4318 \
  -jar myapp.jar
```

**Приклад з OTLP експортером (JMX Scraper):**

```sh
java -Dotel.jmx.service.url=service:jmx:rmi:///jndi/rmi://myapp.example.com:9999/jmxrmi \
  -Dotel.jmx.target.system=tomcat \
  -Dotel.metrics.exporter=otlp \
  -Dotel.exporter.otlp.endpoint=http://localhost:4318 \
  -jar opentelemetry-jmx-scraper.jar
```

## Додаткові ресурси {#additional-resources}

- [Документація JMX Scraper](https://github.com/open-telemetry/opentelemetry-java-contrib/tree/main/jmx-scraper) — Повний довідник з конфігурації та приклади
- [Посібник з міграції JMX Scraper](https://github.com/open-telemetry/opentelemetry-java-contrib/tree/main/jmx-scraper#migrating-from-jmx-metric-gatherer) — Міграція з застарілого JMX Metric Gatherer
- [Метрики JMX (Java агент)](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/instrumentation/jmx-metrics/README.md) — Документація з метрик JMX для Java агента
- [Попередньо визначені цільові системи](https://github.com/open-telemetry/opentelemetry-java-contrib/tree/main/jmx-scraper#predefined-metric-sets) — Вбудовані набори метрик для популярних фреймворків
- [Документація Java агента](/docs/zero-code/java/agent/) — Загальна конфігурація Java агента
- [Посібник з конфігурації](../configuration/) — Параметри конфігурації OpenTelemetry SDK

## Повʼязані теми {#related-topics}

- [Екосистема інструментування](../instrumentation/) — Інші варіанти інструментування
- [Shims](../instrumentation/#shims) — Міст між іншими бібліотеками спостереження
- [Metrics API](../api/#meterprovider) — Створення власних метрик
