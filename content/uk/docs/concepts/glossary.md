---
title: Глосарій
description: Визначення та домовленості для термінів телеметрії, що використовуються в OpenTelemetry.
weight: 200
default_lang_commit: f048ad97541439a7065511b689056e26aad62d23
---

Цей глосарій визначає терміни та [поняття] (/docs/concepts/), які є новими для проєкту OpenTelemetry, а також пояснює специфічне для OpenTelemetry використання термінів, поширених у сфері спостережуваності.

Ми також даємо коментарі щодо правопису та написання великих літер, коли це корисно. Наприклад, див. [OpenTelemetry](#opentelemetry) та [OTel](#otel).

## Терміни {#terms}

### Агрегація {#aggregation}

Процес обʼєднання кількох вимірювань у точну або оцінену статистику про вимірювання, що відбулися протягом інтервалу часу під час виконання програми. Використовується [Метрикою](#metric), [Джерелом даних](#data-source).

### API

Інтерфейс прикладного програмування. У проєкті OpenTelemetry використовується для визначення того, як генеруються дані телеметрії для кожного [Джерела даних](#data-source).

### Застосунок {#application}

Один або кілька [Сервісів](#service), призначених для кінцевих користувачів або інших застосунків.

### APM

Моніторинг продуктивності застосунків (Application Performance Monitoring) — це моніторинг програмного забезпечення, його продуктивності (швидкість, надійність, доступність тощо) для виявлення проблем, сповіщення та інструменти для пошуку першопричини.

### Атрибут {#attribute}

Термін OpenTelemetry для [Метаданих](#metadata). Додає інформацію у форматі ключ-значення до сутності, що генерує телеметрію. Використовується у всіх [Сигналах](#signal) та [Ресурсах](#resource). Див. [специфікацію атрибутів][attribute].

### Автоматична інструменталізація {#automatic-instrumentation}

Належить до методів збору телеметрії, які не вимагають від кінцевого користувача змінювати вихідний код застосунку. Методи варіюються залежно від мови програмування, прикладами є інʼєкція байт-коду або monkey-патчинг.

### Baggage

Механізм для поширення [Метаданих](#metadata), щоб допомогти встановити причинно-наслідковий звʼязок між подіями та сервісами. Див. [специфікацію baggage][baggage].

### Cardinality

Кількість унікальних значень для даного [Атрибута](#attribute) або набору атрибутів. Висока кардинальність означає багато унікальних значень, що може вплинути на продуктивність і вимоги до зберігання бекендів телеметрії. Наприклад, атрибут `user_id` матиме високу кардинальність, тоді як атрибут `status_code` зі значеннями "200", "404", "500" матиме низьку кардинальність.

### Клієнтська бібліотека {#client-library}

Див. [Інструментована бібліотека](#instrumented-library).

### Клієнтський застосунок {#client-side-application}

Компонент [Застосунку](#application), який не працює всередині приватної інфраструктури та зазвичай використовується безпосередньо кінцевими користувачами. Прикладами клієнтських застосунків є браузерні застосунки, мобільні застосунки та застосунки, що працюють на IoT-пристроях.

### Колектор {#collector}

[Колектор OpenTelemetry][OpenTelemetry Collector], або скорочено Колектор, — це незалежна від постачальника реалізація для отримання, обробки та експорту телеметричних даних. Єдиний бінарний файл, який може бути розгорнутий як агент або шлюз.

> **Правопис**: При посиланні на [OpenTelemetry Collector], завжди пишіть Collector з великої літери. Використовуйте просто «Колектор», якщо ви використовуєте Колектор як прикметник — наприклад, «конфігурація Колектора».

[OpenTelemetry Collector]: /docs/collector/

### Contrib

Кілька [Бібліотек інструменталізації](#instrumentation-library) та [Колектор](#collector) пропонують набір основних можливостей, а також спеціальний репозиторій contrib для неосновних можливостей, включаючи `Експортери` постачальників.

### Поширення контексту {#context-propagation}

Дозволяє всім [Джерелам даних](#data-source) використовувати спільний механізм контексту для зберігання стану та доступу до даних протягом усього життєвого циклу [Транзакції](#transaction). Див. [специфікацію поширення контексту][context propagation].

### DAG

[Спрямований ациклічний граф][dag] (Directed Acyclic Graph).

### Джерело даних {#data-source}

Див. [Сигнал](#signal)

### Вимір {#dimension}

Термін, що використовується спеціально для [Метрик](#metric). Див. [Атрибут](#attribute).

### Розподілене трасування {#distributed-tracing}

Відстежує прогрес одного [Запиту](#request), що називається [Трейсом](#trace), коли він обробляється [Сервісами](#service), що складають [Застосунок](#application). [Розподілений трейс](#distributed-tracing) перетинає процеси, мережеві та безпекові межі.

Див. [Розподілене трасування][distributed tracing].

### Дистрибутив {#distribution}

Дистрибутив — це обгортка навколо репозиторію OpenTelemetry з деякими налаштуваннями. Див. [Дистрибутиви][Distributions].

### Сутність {#entity}

Сукупність [атрибутів](#attribute), які ідентифікують та описують фізичний або логічний обʼєкт. Сутності зазвичай повʼязані з телеметрією. Наприклад, сутність CPU описує фізичний процесор, а сутність сервісу описує логічну групу процесів, з яких складається HTTP або інший сервіс.

### Подія {#event}

Подія — це [Запис журналу](#log-record) з назвою події та відомою структурою. Наприклад, події вебоглядача в OpenTelemetry дотримуються певної угоди про імена і несуть певні дані в загальній структурі.

### Експортер {#exporter}

Забезпечує функціональність для передачі телеметрії споживачам. Експортери можуть бути на основі дій push або pull.

### Поле {#field}

Термін, що використовується спеціально для [Записів журналу](#log-record). [Метадані](#metadata) можуть бути додані через визначені поля, включаючи [Атрибути](#attribute) та [Ресурси](#resource). Інші поля також можуть вважатися `Метаданими`, включаючи інформацію про важливість та трасування. Див. [специфікацію полів][field].

### gRPC

Високопродуктивний, відкритий універсальний [RPC](#rpc) фреймворк. Див. [gRPC](https://grpc.io).

### HTTP

[Протокол передачі гіпертексту][http]. Скорочення від Hypertext Transfer Protocol.

### Інструментована бібліотека {#instrumented-library}

Визначає [Бібліотеку](#library), для якої збираються телеметричні сигнали ([Трейси](#trace), [Метрики](#metric), [Журнали](#log)). Див. [Instrumented library][].

### Бібліотека інструменталізації {#instrumentation-library}

Позначає [Бібліотеку](#library), яка забезпечує інструменталізацію для даної [Інструментованої бібліотеки](#instrumented-library). [Інструментована бібліотека](#instrumented-library) та [Бібліотека інструменталізації](#instrumentation-library) можуть бути однією і тією ж [Бібліотекою](#library), якщо вона має вбудовану інструменталізацію OpenTelemetry. Див. [специфікацію бібліотеки][spec-instrumentation-lib].

### JSON

Скорочення від [JavaScript Object Notation][json].

### Мітка {#label}

Термін, що використовується спеціально для [Метрик](#metric). Див. [Метадані](#metadata).

### Мова {#language}

Мова програмування.

### Бібліотека {#library}

Колекція поведінки, специфічна для мови, викликана інтерфейсом.

### Журнал {#log}

Іноді використовується для позначення колекції [Записів журналу](#log-record). Може бути неоднозначним, оскільки люди іноді також використовують [Журнал](#log) для позначення одного [Запису журналу](#log-record). Де можлива неоднозначність, використовуйте додаткові кваліфікатори, наприклад, `Запис журналу`. Див. [Логи][log]

### Запис журналу {#log-record}

Запис даних з міткою часу та ступенем важливості. Може також мати [Trace ID](#trace) та [Span ID](#span), коли співвідноситься з трасуванням. Див. [Записи журналу][log record].

### Метадані {#metadata}

Пара ключ-значення, наприклад `foo="bar"`, додана до сутності, що генерує телеметрію. OpenTelemetry називає ці пари [Атрибутами](#attribute). Крім того, [Метрики](#metric) мають [Виміри](#dimension) та [Мітки](#label), а [Журнали](#log) мають [Поля](#field).

### Метрика {#metric}

Записує точку даних, або сирі вимірювання, або попередньо визначену агрегацію, як часові ряди з [Метаданими](#metadata). Див. [Метрики][Metric].

### OC

Скорочення від [OpenCensus](#opencensus).

### Observability backend {#observability-backend}

Компонент платформи спостережуваності, який відповідає за приймання, обробку, зберігання та запит телеметричних даних. Прикладами є інструменти з відкритим кодом, такі як [Jaeger] і [Prometheus], а також комерційні пропозиції. OpenTelemetry не є бекендом спостережності.

### Observability frontend {#observability-frontend}

Компонент платформи спостережуваності, який надає інтерфейси користувача для візуалізації та аналізу телеметричних даних. Він часто може бути частиною бекенду спостережності, особливо коли мова йде про комерційні пропозиції.

### OpAMP

Скорочення від [Open Agent Management Protocol](/docs/collector/management/#opamp).

> **Правопис**: Пишіть OpAMP, а не `OPAMP` чи `opamp` в описах та інструкціях.

### OpenCensus

Попередник OpenTelemetry. Детальніше див. [Історія](/docs/what-is-opentelemetry/#history).

### OpenTelemetry

Утворена шляхом [злиття][merger] проєктів [OpenTracing](#opentracing) та [OpenCensus](#opencensus), OpenTelemetry, предмет цього вебсайту — це колекція [API](#api), [SDK](#sdk) та інструментів, які ви можете використовувати для [інструментування](/docs/concepts/instrumentation/), генерації, [збору](/docs/concepts/components/#collector), та [експорту](/docs/concepts/components/#exporters) [телеметричних даних](/docs/concepts/signals/), таких як [метрики](#metric), [журнали](#log) та [трейси](#trace).

> **Правопис**: OpenTelemetry завжди має бути одним словом без дефісів і з великої літери, як показано тут.

[merger]: /docs/what-is-opentelemetry/#history

### OpenTracing

Попередник OpenTelemetry. Детальніше див. [Історія](/docs/what-is-opentelemetry/#history).

### OT

Скорочення від [OpenTracing](#opentracing).

### OTel

Скорочення від [OpenTelemetry](/docs/what-is-opentelemetry/).

> **Правопис**: Використовуйте OTel, not `OTEL`.

### OTelCol

Скорочення від [OpenTelemetry Collector](#collector).

### OTEP

Акронім від [OpenTelemetry Enhancement Proposal].

> **Правопис**: Пишіть «OTEPs» у формі множини. Не використовуйте `OTep` або `otep` в описах.

[OpenTelemetry Enhancement Proposal]: https://github.com/open-telemetry/opentelemetry-specification/blob/main/oteps/README.md

### OTLP

Скорочення від [OpenTelemetry Protocol](/docs/specs/otlp/).

### Поширювачі {#propagators}

Використовуються для серіалізації та десеріалізації конкретних частин телеметричних даних, таких як контекст відрізка та [Baggage](#baggage) у [Відрізках](#span). Див. [Поширювачі][propagators].

### Proto

Мовонезалежні типи інтерфейсів. Див. [opentelemetry-proto][].

### Приймач {#receiver}

Термін, що використовується [Колектором](/docs/collector/configuration/#receivers) для визначення того, як отримуються телеметричні дані. Приймачі можуть бути на основі дій push або pull. Див. [Приймач][Receiver].

### Запит {#request}

Див. [Розподілене трасування](#distributed-tracing).

### Ресурс {#resource}

Колекція [сутностей](#entity) або [атрибутів](#attribute), які ідентифікують або описують фізичний або логічний обʼєкт, що генерує телеметрію.

### REST

Скорочення від [Representational State Transfer][rest].

### RPC

Скорочення від [Remote Procedure Call][rpc] (Віддалений виклик процедур).

### Вибірка {#sampling}

Механізм для контролю кількості даних, що експортуються. Найчастіше використовується з [Трасуванням](#trace) [Джерелом даних](#data-source). Див. [Sampling][].

### SDK

Скорочення від Software Development Kit. Відноситься до телеметричного SDK, що позначає [Бібліотеку](#library), яка реалізує OpenTelemetry [API](#api).

### Семантичні домовленості {#semantic-conventions}

Визначає стандартні імена та значення [Метаданих](#metadata) для забезпечення незалежних від постачальників телеметричних даних.

### Сервіс {#service}

Компонент [Застосунку](#application). Зазвичай для високої доступності та масштабованості розгортається кілька екземплярів [Сервісу](#service). [Сервіс](#service) може бути розгорнутий у кількох місцях.

### Сигнал {#signal}

Один з [Трейсів](#trace), [Метрик](#metric) або [Журналів](#log). Дивись [Сигнали][Signals].

### Відрізок {#span}

Представляє одну операцію в межах [Трейсів](#trace). Див. [Span][].

### Посилання на відрізок {#span-link}

Посилання на відрізок — це посилання між повʼязаними відрізками. Для деталей див. [Посилання між відрізками](/docs/specs/otel/overview#links-between-spans) та [Визначення посилань](/docs/specs/otel/trace/api#specifying-links).

### Специфікація {#specification}

Описує міжмовні вимоги та очікування для всіх реалізацій. Див. [Специфікація][Specification].

### Статус {#status}

Результат операції. Зазвичай використовується для вказівки, чи сталася помилка. Див. [Status][].

### Теґ {#tag}

Див. [Метадані](#metadata).

### Трейс {#trace}

[Орієнтований ациклічний граф](#dag) [Відрізків](#span), де ребра між [Відрізками](#span) визначаються як відношення батько-дитина. Див. [Traces][].

### Трейсер {#tracer}

Відповідальний за створення [Відрізків](#span). Див. [Tracer][].

### Транзакція {#transaction}

Див. [Розподілене трасування](#distributed-tracing).

### zPages

Альтернатива зовнішнім експортерам в процесі. Коли вони включені, вони збирають та агрегують інформацію про трасування та метрики у фоновому режимі; ці дані відображаються на вебсторінках за запитом. Див. [zPages][].

[attribute]: /docs/specs/otel/common/#attributes
[baggage]: /docs/specs/otel/baggage/api/
[context propagation]: /docs/specs/otel/overview#context-propagation
[dag]: https://uk.wikipedia.org/wiki/Спрямований_ациклічний_граф
[distributed tracing]: ../signals/traces/
[distributions]: ../distributions/
[field]: /docs/specs/otel/logs/data-model#field-kinds
[http]: https://en.wikipedia.org/wiki/Hypertext_Transfer_Protocol
[instrumented library]: /docs/specs/otel/glossary/#instrumented-library
[json]: https://en.wikipedia.org/wiki/JSON
[log record]: /docs/specs/otel/glossary#log-record
[log]: /docs/specs/otel/glossary#log
[metric]: ../signals/metrics/
[opentelemetry-proto]: https://github.com/open-telemetry/opentelemetry-proto
[propagators]: /docs/languages/go/instrumentation/#propagators-and-context
[receiver]: /docs/collector/configuration/#receivers
[rest]: https://en.wikipedia.org/wiki/Representational_state_transfer
[rpc]: https://en.wikipedia.org/wiki/Remote_procedure_call
[sampling]: /docs/specs/otel/trace/sdk#sampling
[signals]: ../signals/
[span]: /docs/specs/otel/trace/api#span
[spec-instrumentation-lib]: /docs/specs/otel/glossary/#instrumentation-library
[specification]: ../components/#specification
[status]: /docs/specs/otel/trace/api#set-status
[tracer]: /docs/specs/otel/trace/api#tracer
[traces]: /docs/specs/otel/overview#traces
[zpages]: https://github.com/open-telemetry/opentelemetry-specification/blob/main/development/trace/zpages.md
