---
title: Екосистема інструментування
aliases:
  - /docs/java/getting_started
  - /docs/java/manual_instrumentation
  - manual
  - manual_instrumentation
  - libraries
weight: 10
description: Екосистема інструментування в OpenTelemetry Java
default_lang_commit: 5f551752635886a0d2d6b2a83e5a36866ca1b5f1
---

<!-- markdownlint-disable no-duplicate-heading -->

Інструментування записує телеметрію за допомогою [API](../api/). [SDK](../sdk/) є вбудованою еталонною реалізацією API і [налаштовується](../configuration/) для обробки та експорту телеметрії, створеної викликами API інструментування. Ця сторінка розглядає екосистему OpenTelemetry в OpenTelemetry Java, включаючи ресурси для кінцевих користувачів та наскрізні теми інструментування:

- [Категорії інструментування](#instrumentation-categories), що охоплюють різні випадки використання та шаблони встановлення.
- [Поширення контексту](#context-propagation) забезпечує кореляцію між трейсами, метриками та журналами, дозволяючи сигналам доповнювати один одного.
- [Семантичні домовленості](#semantic-conventions) визначають, як створювати телеметрію для стандартних операцій.
- [Інструментування журналів](#log-instrumentation), яке використовується для отримання журналів з наявної системи логів Java в OpenTelemetry.

> [!NOTE]
>
> Хоча [категорії інструментування](#instrumentation-categories) перераховують кілька варіантів інструментування застосунку, ми рекомендуємо користувачам почати з [Java-агента](#zero-code-java-agent). Java агент має простий процес встановлення й автоматично виявляє та встановлює інструментування з великої бібліотеки.

## Категорії інструментування {#instrumentation-categories}

Є кілька категорій інструментування:

- [Без програмування: Java-агент](#zero-code-java-agent) є формою інструментування без програмування **[1]**, яке динамічно маніпулює байт-кодом застосунку.
- [Без програмування: Spring Boot стартер](#zero-code-spring-boot-starter) є формою інструментування без програмування **[1]**, яке використовує spring autoconfigure для
  встановлення [бібліотечного інструментування](#library-instrumentation).
- [Бібліотечне інструментування](#library-instrumentation) обгортає або використовує точки розширення для інструментування бібліотеки, вимагаючи від користувачів встановлення та/або адаптації використання бібліотеки.
- [Нативне інструментування](#native-instrumentation) вбудоване безпосередньо в бібліотеки та фреймворки.
- [Ручне інструментування](#manual-instrumentation) написане авторами застосунків і зазвичай специфічне для сфери використання застосунку.
- [Шими](#shims) переносять дані з однієї бібліотеки спостережуваності в іншу, зазвичай _з_ якоїсь бібліотеки в OpenTelemetry.

**[1]**: Інструментування без програмування встановлюється автоматично на основі виявлених бібліотек / фреймворків.

Проєкт [opentelemetry-java-instrumentation](https://github.com/open-telemetry/opentelemetry-java-instrumentation) містить вихідний код для Java-агента, Spring Boot стартера та Бібліотечного інструментування.

### Без програмування: Java-агент {#zero-code-java-agent}

Java-агент є формою [автоматичного інструментування](/docs/specs/otel/glossary/#automatic-instrumentation) без програмування яке динамічно маніпулює байт-кодом застосунку.

Для списку бібліотек, інструментованих Java-агентом, дивіться колонку "Автоматично інструментовані версії" у [підтримуваних бібліотеках](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/docs/supported-libraries.md).

Дивіться [Java-агент](/docs/zero-code/java/agent/) для отримання додаткової інформації.

### Без програмування: Spring Boot стартер {#zero-code-spring-boot-starter}

Spring Boot стартер є формою [автоматичного інструментування](/docs/specs/otel/glossary/#automatic-instrumentation) без програмування яке використовує spring autoconfigure для встановлення [бібліотечного інструментування](#library-instrumentation).

Дивіться [Spring Boot стартер](/docs/zero-code/java/spring-boot-starter/) для отримання додаткової інформації.

### Бібліотечне інструментування {#library-instrumentation}

[Бібліотечне інструментування](/docs/specs/otel/glossary/#instrumentation-library) обгортає або використовує точки розширення для інструментування бібліотеки, вимагаючи від користувачів встановлення та/або адаптації використання бібліотеки.

Для списку бібліотек інструментування, дивіться колонку "Самостійні бібліотеки інструментування" у [підтримуваних бібліотеках](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/docs/supported-libraries.md).

### Нативне інструментування {#native-instrumentation}

[Нативне інструментування](/docs/specs/otel/glossary/#natively-instrumented) вбудоване безпосередньо в бібліотеки або фреймворки. OpenTelemetry заохочує авторів бібліотек додавати нативне інструментування за допомогою [API](../api/). У довгостроковій перспективі ми сподіваємося, що нативне інструментування стане нормою, і вигляд інструментування, яке підтримується OpenTelemetry в [opentelemetry-java-instrumentation](https://github.com/open-telemetry/opentelemetry-java-instrumentation) буде тимчасовим засобом заповнення прогалин.

Нативне інструментування повинно взаємодіяти з агентом OpenTelemetry Java наступним чином: під час запуску агент Java ініціалізує екземпляр [OpenTelemetry](../api/#opentelemetry) та встановлює інструментування [zero-code](#zero-code-java-agent). Бібліотеки, що додають нативну інструментацію, повинні дозволяти користувачам налаштовувати використовуваний екземпляр `OpenTelemetry`, але повинні автоматично використовувати екземпляр, ініціалізований агентом Java (якщо він присутній). Дивіться [GlobalOpenTelemetry](../api/#globalopentelemetry) для отримання вказівок щодо того, як цього досягти.

{{% docs/languages/native-libraries %}}

### Ручне інструментування {#manual-instrumentation}

[Ручне інструментування](/docs/specs/otel/glossary/#manual-instrumentation) написане авторами застосунків і зазвичай є специфічним для сфери використання застосунку.

Ручне інструментування повинно взаємодіяти з агентом OpenTelemetry Java наступним чином: під час запуску агент Java ініціалізує екземпляр [OpenTelemetry](../api/#opentelemetry) і робить його доступним для ручного інструментування застосунку через `GlobalOpenTelemetry`. Однак власник застосунку може не мати можливості покладатися на те, що агент Java буде встановлений постійно. Наприклад, агент Java може бути не встановлений у локальних середовищах розробки або тестування, або в особливих випадках, коли агент Java видаляється з метою налагодження. Ручне інструментування повинно використовувати екземпляр [OpenTelemetry](../api/#opentelemetry), ініціалізований агентом Java (якщо він присутній), але повинно бути здатним виявляти та, можливо, налаштовувати резервний екземпляр `OpenTelemetry`, якщо агент Java відсутній. Дивіться [GlobalOpenTelemetry](../api/#globalopentelemetry) для отримання вказівок щодо того, як цього досягти.

### Шими {#shims}

Шим — це вид інструментування, який переносить дані з однієї бібліотеки спостережуваності в іншу, зазвичай _з_ якоїсь бібліотеки в OpenTelemetry.

Шими, які підтримуються в екосистемі OpenTelemetry Java:

| Опис                                                                                                        | Документація                                                                                                                                                                    | Сигнал(и)       | Артефакт                                                                                                                        |
| ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Міст [OpenTracing](https://opentracing.io/) в OpenTelemetry                                                 | [README](https://github.com/open-telemetry/opentelemetry-java/tree/main/opentracing-shim)                                                                                       | Трейси          | `io.opentelemetry:opentelemetry-opentracing-shim:{{% param vers.otel %}}`                                                       |
| Міст [Opencensus](https://opencensus.io/) в OpenTelemetry                                                   | [README](https://github.com/open-telemetry/opentelemetry-java/tree/main/opencensus-shim)                                                                                        | Трейси, Метрики | `io.opentelemetry:opentelemetry-opencensus-shim:{{% param vers.otel %}}-alpha`                                                  |
| Міст [Micrometer](https://micrometer.io/) в OpenTelemetry                                                   | [README](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/instrumentation/micrometer/micrometer-1.5/library)                                      | Метрики         | `io.opentelemetry.instrumentation:opentelemetry-micrometer-1.5:{{% param vers.instrumentation %}}-alpha`                        |
| Міст [JMX](https://docs.oracle.com/javase/7/docs/technotes/guides/management/agent.html) into OpenTelemetry | [README](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/instrumentation/jmx-metrics/README.md)                                                  | Метрики         | `io.opentelemetry.instrumentation:opentelemetry-jmx-metrics:{{% param vers.instrumentation %}}-alpha`                           |
| Міст OpenTelemetry в [Prometheus Java client](https://github.com/prometheus/client_java)                    | [README](https://github.com/open-telemetry/opentelemetry-java-contrib/tree/main/prometheus-client-bridge)                                                                       | Метрики         | `io.opentelemetry.contrib:opentelemetry-prometheus-client-bridge:{{% param vers.contrib %}}-alpha`                              |
| Міст OpenTelemetry в [Micrometer](https://micrometer.io/)                                                   | [README](https://github.com/open-telemetry/opentelemetry-java-contrib/tree/main/micrometer-meter-provider)                                                                      | Метрики         | `io.opentelemetry.contrib:opentelemetry-micrometer-meter-provider:{{% param vers.contrib %}}-alpha`                             |
| Міст [Log4j](https://logging.apache.org/log4j/2.x/index.html) в OpenTelemetry                               | [README](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/instrumentation/log4j/log4j-appender-2.17/library)                                      | Журнали         | `io.opentelemetry.instrumentation:opentelemetry-log4j-appender-2.17:{{% param vers.instrumentation %}}-alpha`                   |
| Міст [Logback](https://logback.qos.ch/) в OpenTelemetry                                                     | [README](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/instrumentation/logback/logback-appender-1.0/library)                                   | Журнали         | `io.opentelemetry.instrumentation:opentelemetry-logback-appender-1.0:{{% param vers.instrumentation %}}-alpha`                  |
| Міст OpenTelemetry контексту в [Log4j](https://logging.apache.org/log4j/2.x/index.html)                     | [README](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/instrumentation/log4j/log4j-context-data/log4j-context-data-2.17/library-autoconfigure) | Контекст        | `io.opentelemetry.instrumentation:opentelemetry-log4j-context-data-2.17-autoconfigure:{{% param vers.instrumentation %}}-alpha` |
| Міст OpenTelemetry контексту в [Logback](https://logback.qos.ch/)                                           | [README](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/instrumentation/logback/logback-mdc-1.0/library)                                        | Контекст        | `io.opentelemetry.instrumentation:opentelemetry-logback-mdc-1.0:{{% param vers.instrumentation %}}-alpha`                       |

## Поширення контексту {#context-propagation}

API OpenTelemetry розроблені таким чином, щоб доповнювати один одного, створюючи ціле, яке є більшим ніж сума частин. Кожен сигнал має свої сильні сторони, і разом вони створюють переконливу історію спостережуваності.

Важливо, що дані з різних сигналів повʼязані між собою через контекст трасування:

- Відрізки повʼязані з іншими відрізками через батьківський відрізок і посилання, кожен з яких записує контекст трасування повʼязаних відрізків.
- Метрики повʼязані з відрізками через [екземпляри](/docs/specs/otel/metrics/data-model/#exemplars), які записують контекст трасування конкретного вимірювання.
- Журнали повʼязані з відрізками шляхом запису контексту трасування в записи журналу.

Для того, щоб ця кореляція працювала, контекст трасування повинен поширюватися по всьому застосунку (через виклики функцій і потоки) і за межі застосунків. [API контексту](../api/#context-api) сприяє цьому. Інструментування повинно бути написане таким чином, щоб враховувати контекст:

- Бібліотеки, які представляють точку входу в застосунок (тобто HTTP сервери, споживачі повідомлень тощо) повинні [видобувати контекст](../api/#contextpropagators) з вхідних повідомлень.
- Бібліотеки, які представляють точку виходу із застосунку (тобто HTTP клієнти, створювачі повідомлень тощо) повинні [вставляти контекст](../api/#contextpropagators) у вихідні повідомлення.
- Бібліотеки повинні неявно або явно передавати [Контекст](../api/#context) через стек викликів і через будь-які потоки.

## Семантичні домовленості {#semantic-conventions}

[Семантичні домовленості](/docs/specs/semconv/) визначають, як створювати телеметрію для стандартних операцій. Серед іншого, семантичні домовленості визначають імена відрізків, типи відрізків, інструменти метрик, одиниці вимірювання метрик, типи метрик та ключі атрибутів, значення та рівні вимог.

При написанні інструментування звертайтеся до семантичних конвенцій і дотримуйтесь будь-яких конвенцій, які застосовуються до домену.

OpenTelemetry Java [публікує артефакти](../api/#semantic-attributes) для допомоги у дотриманні семантичних конвенцій, включаючи згенеровані константи для ключів і значень атрибутів.

## Інструментування журналів {#log-instrumentation}

Хоча [LoggerProvider](../api/#loggerprovider) / [Logger](../api/#logger) API структурно схожі на еквівалентні [trace](../api/#tracerprovider) та [metric](../api/#meterprovider) API, вони служать іншій меті. Зараз `LoggerProvider` / `Logger` та повʼязані класи представляють [Log Bridge API](/docs/specs/otel/logs/api/), яке існує для написання доповнювачів логів для перенесення журналів, записаних через інші API логування / фреймворки в OpenTelemetry. Вони не призначені для кінцевих користувачів для використання як заміни для Log4j / SLF4J / Logback / тощо.

Існує два типових робочих процеси для споживання інструментування журналів в OpenTelemetry, що відповідають різним вимогам застосунків:

### Безпосередньо в колектор {#direct-to-collector}

У робочому процесі журнали передаються безпосередньо із застосунку до колектора за допомогою мережевого протоколу (наприклад, OTLP). Цей робочий процес простий у налаштуванні, оскільки не вимагає додаткових компонентів для пересилання журналів, і дозволяє застосунку легко передавати структуровані журнали, які відповідають [моделі даних журналів](/docs/specs/otel/logs/data-model/). Однак, накладні витрати,
необхідні для застосунків для черги та експорту журналів до місця в мережі, можуть бути неприйнятними для всіх застосунків.

Щоб використовувати цей робочий процес:

- Встановіть відповідний доповнювач логів. **[1]**
- Налаштуйте OpenTelemetry [Log SDK](../sdk/#sdkloggerprovider) для експорту записів журналів до бажаного цільового місця призначення ([колектора](https://github.com/open-telemetry/opentelemetry-collector) або іншого).

**[1]**: Доповнювачі логів є типом [шима](#shims), який переносить журнали з системи логування в OpenTelemetry log SDK. Дивіться "Міст Log4j в OpenTelemetry", "Міст Logback в OpenTelemetry" записи. Дивіться [Приклад доповнювача логів](https://github.com/open-telemetry/opentelemetry-java-docs/tree/main/log-appender) для демонстрації різних сценаріїв.

### Через файл або stdout {#via-file-or-stdout}

У робочому процесі журнали записуються у файли або стандартний вивід. Інший компонент (наприклад, FluentBit) відповідає за читання / відстеження журналів, їх розбір до більш структурованого формату та пересилання їх до місця призначення, такого як колектор. Цей робочий процес може бути кращим у ситуаціях, коли вимоги застосунку не дозволяють йому накладні витрати процесу [безпосередньої передачі в колектор](#direct-to-collector). Однак, він вимагає, щоб усі поля журналу, необхідні для подальшої обробки, були закодовані в журналах, і щоб компонент, який читає журнали, розбирав дані в [модель даних журналів](/docs/specs/otel/logs/data-model). Встановлення та налаштування компонентів для пересилання журналів виходить за рамки цього документа.

Кореляція журналів з трейсами доступна шляхом встановлення [шима](#shims) для перенесення контексту OpenTelemetry в систему логування. Дивіться "Міст OpenTelemetry контексту в Log4j", "Міст OpenTelemetry контексту в Logback".

> [!NOTE]
>
> Приклад наскрізного інструментування журналів за допомогою stdout доступний у [репозиторії прикладів Java](https://github.com/open-telemetry/opentelemetry-java-examples/blob/main/logging-k8s-stdout-otlp-json/README.md).
