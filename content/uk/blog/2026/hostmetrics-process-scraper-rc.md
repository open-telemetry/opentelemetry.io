---
title: 'Метрики з версіями: випуск перших метрик реліз-кандидата в hostmetrics'
linkTitle: Метрики з версіями в hostmetrics
date: 2026-10-13
author: >-
  [Dónal O'Sullivan](https://github.com/osullivandonal)(Elastic)
issue: 11728
sig: System
default_lang_commit: 83c4047e5396d66375137c7bd1952bd45285b4ef
# prettier-ignore
cSpell:ignore: Dónal hostmetrics iowait mdatagen otelcontribcol processscraper скрейпера скрейпером скрейпері інфопанелі
---

OpenTelemetry Collector Contrib v0.160.0 додає можливість надавати метрики семантичних домовленостей процесів зі статусом реліз-кандидата (RC) у скрейпері процесів приймача hostmetrics — останній етап перед стабільною версією v1. System SIG працював над цим більшу частину року, і ми вважаємо, що метрики процесів перебувають у добрій формі, але RC існує саме для того, щоб спільнота могла це довести. Якщо ви збираєте метрики процесів, ми хотіли б, щоб ви спробували новий вивід з версіями і розповіли нам, що зламалося.

## Чому стабілізацію приймача hostmetrics було заблоковано {#why-stabilizing-the-hostmetrics-receiver-was-blocked}

Метрики скрейпера процесів змінилися в семантичних домовленостях OpenTelemetry. Приведення у відповідність до цих домовленостей означає зміну назв метрик, типів і атрибутів, від яких користувачі вже залежать, тож ми не могли просто відредагувати визначення на місці й створити реліз.

Звичний інструмент для зміни поведінки в Колекторі — це функціональний прапорець, але прапорець лише перемикає між шляхами коду, які вже існують. Нам було потрібно, щоб і застаріле, і RC-визначення метрики існували в коді одночасно й вибиралися для кожної метрики окремо, щоб кінцеві користувачі могли за бажанням перейти на нові метрики. В ідеалі це мало відбуватися без впливу на схему конфігурації користувача.

Ця вимога наштовхується на схему конфігурації `metadata.yaml`. Цей файл визначає, які метрики й атрибути надає приймач і як саме він їх надає. Кожен скрейпер у приймачі hostmetrics має один такий файл, і [mdatagen](https://github.com/open-telemetry/opentelemetry-collector/tree/62cdad2ea133239380b44d20d84eb26e114779b6/cmd/mdatagen?from_branch=main) генерує з нього код, який надає метрики. Два визначення `<metric>` не можуть існувати в одному файлі, якщо вони мають однакову назву, але різняться типом чи атрибутами.

System SIG зупинився на двох різних шляхах розвʼязання цієї проблеми, як обговорювалося в [GitHub-issue про метрики з версіями](https://github.com/open-telemetry/opentelemetry-collector-contrib/issues/45592).

1. Використовувати дві різні схеми конфігурації для застарілих і RC-метрик.
2. Використовувати одну схему конфігурації з і застарілими, і RC-метриками.

Перший полягав у тому, щоб тримати застарілі та RC-метрики в окремих схемах. Це обходило конфлікт назв, але блок `metrics:` у `metadata.yaml` — це саме те, що генерує блок `metrics:`, який кінцеві користувачі використовують для написання конфігурації Колектора, тож два файли схеми означають два блоки конфігурації користувача, і кожному наявному користувачеві доведеться рано чи пізно редагувати свою конфігурацію — або під час оновлення, або коли застарілий блок зрештою приберуть.

Другий полягав у тому, щоб дозволити обом визначенням жити в одному файлі й оновити mdatagen, щоб він обробляв конфлікти назв. Це нічого не коштує користувачам і дає супровідникам компонентів єдиний файл `metadata.yaml` для роботи, але це означало змінити сам mdatagen у базовому репозиторії Колектора, перш ніж можна було почати роботу над скрейпером.

System SIG обрав другий варіант: метрики з версіями, де міграцією керують функціональні прапорці. Далі в цьому дописі описано, як це виглядає для власника коду компонента, який виконує одну з таких міграцій.

## Додавання метрик з версіями до mdatagen {#adding-versioned-metrics-to-mdatagen}

Щоб надати метриці версію, ми додали до mdatagen підтримку суфіксів, використовуючи `@` для позначення версії, наприклад `<metric-name>@<version-number>`. Ми обрали `@`, тому що він не є допустимим у назві метрики OTel, тож не може ні з чим реальним зіткнутися. Суфікс існує лише як ключ у `metadata.yaml`; під час надання він відкидається, тож метрика, яку отримує бекенд, називається `process.cpu.utilization`, а не `process.cpu.utilization@v1`.

Далі ми оновили схему mdatagen `metadata-schema.yaml`, яка визначає поля, які може використовувати `metadata.yaml` компонента. Ми додали поле `migration` до розділу метрик, щоб описати шлях від застарілої метрики до її заміни з версією.

```yaml
metrics:
  # Необовʼязково: інформація про міграцію/псевдоніми для підтримки подвійного надання схем.
  # Якщо вказано, згенерований код надаватиме цю метрику та цільову метрику
  # відповідно до прапорців, зазначених нижче.
  migration:
    # Обовʼязково: ключ цільової метрики в цьому файлі метаданих, у яку надавати під час міграції.
    to: string
    # Обовʼязково: функціональні прапорці, що керують наданням. Згадані прапорці мають бути
    # оголошені в розділі feature_gates нижче в цьому файлі.
    through_gates:
      # Обовʼязково: коли увімкнено, надання старої (поточної) метрики вимкнено.
      disable_old: string
      # Обовʼязково: коли увімкнено, надання нової (цільової) метрики увімкнено.
      enable_new: string
```

Шлях міграції надає `through_gates`, які визначають функціональні прапорці, що використовуються для міграції: `disable_old` вимикає старі застарілі метрики, коли його ввімкнено, а `enable_new` вмикає RC-метрики, коли його ввімкнено. Нижче наведено фрагмент із файлу [`metadata.yaml`](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/47fd6d863a675e4e653418084645cccbc16aeb8b/receiver/hostmetricsreceiver/internal/scraper/processscraper/metadata.yaml?plain=1#L187) скрейпера процесів, який демонструє цей підхід.

```yaml
process.cpu.utilization:
  enabled: false
  description: >-
    Percentage of total CPU time used by the process since last scrape,
    expressed as a value between 0 and 1. On the first scrape, no data point is
    emitted for this metric.
  unit: '1'
  stability: development
  gauge:
    value_type: double
  attributes: [state]
  migration:
    to: process.cpu.utilization@v1
    through_gates:
      disable_old: scraper.process.DontEmitV0SystemConventions
      enable_new: scraper.process.EmitV1SystemConventions

process.cpu.utilization@v1:
  enabled: false
  description: >-
    Difference in process.cpu.time since the last measurement, divided by the
    elapsed time and number of CPUs available to the process. On the first
    scrape, no data point is emitted for this metric.
  unit: '1'
  stability: beta
  gauge:
    value_type: double
  attributes: [cpu.mode]
```

> [!NOTE]
>
> Можливо, ви помітите, що в прикладі тут використовується `stability: beta`. Це через те, що mdatagen не визначає рівня стабільності для RC, тож тут ми використовуємо beta, оскільки наступний рівень стабільності після beta — це stable.

Далі ми оновили шаблони, щоб вони обробляли метрики з версіями. Шаблони використовуються в mdatagen, щоб визначити, як виглядає згенерований код Go. Це було потрібно, щоб уникнути конфліктів назв, коли є дві метрики з однаковою назвою, наприклад `process.cpu.utilization` і `process.cpu.utilization@v1`. Оновлення дозволяє mdatagen генерувати код для цих двох різних метрик без жодних конфліктів. Цю роботу виконано в базовому репозиторії Колектора; див. [PR про метрики з версіями в mdatagen](https://github.com/open-telemetry/opentelemetry-collector/pull/15309).

Нарешті, System SIG визначив правила, яких ми маємо дотримуватися для метрик з версіями. Це зводилося до обробки конфліктів під час подвійного публікування, тобто коли ми надаємо метрики з однаковою назвою. Це трапляється, коли надаються і застарілі, і RC-метрики. Щоб упоратися з цим, було опубліковано RFC з такими правилами; див. [RFC про функціональні прапорці семантичних домовленостей](https://github.com/open-telemetry/opentelemetry-collector/blob/71f0462d5460ad3055201fd0f17658e56362d63a/docs/rfcs/semconv-feature-gates.md#handling-conflicts-during-double-publishing).

- **Різні атрибути**: Якщо назва метрики залишається незмінною, але атрибут перейменовано, надавайте одну метрику з наявними і атрибутами v0, і атрибутами v1. Наприклад, якщо `process.cpu.time` використовує `process.owner` у v0 та `process.owner.name` у v1, надайте одну метрику з обома атрибутами.
- **Різний тип метрики**: Якщо назва метрики залишається незмінною, але тип змінюється (наприклад, Gauge на UpDownCounter), надавайте одну метрику з типом v1, фактично надаючи пріоритет новій домовленості. Наприклад, якщо `system.memory.usage` змінюється з Gauge на UpDownCounter, надайте її як UpDownCounter.

Ці правила спрацьовують, коли ви залишаєте прапорець `disable_old` вимкненим і вмикаєте RC-метрики за допомогою `enable_new`, оскільки це дозволяє надавати і застарілі, і RC-метрики. Щоб дотримуватися цих правил, mdatagen також було оновлено, щоб згенерований код їх обробляв. У цьому сценарії ми записуємо попередження, щоб повідомити кінцевого користувача, що застарілу метрику було вимкнено і що обидва атрибути надаватимуться під RC-метрикою. Це відбувається тому, що ми не можемо двічі записати і застарілу, і найновішу метрику, якщо їхні назви однакові. Приклад цього наведено у YAML вище, де `process.cpu.utilization` має версію, але атрибут змінився.

Далі, якщо тип метрики змінився, а її назва в застарілій і RC-версіях однакова, ми також вимикаємо застарілу метрику й надаємо лише RC-метрику; це також записується як попередження.

Обробка правил RFC у згенерованому коді переносить тягар їх дотримання з супровідників компонентів у згенерований код, роблячи міграцію від застарілих до RC-семантичних домовленостей безшовною.

## Скрейпер процесів на етапі RC {#the-process-scraper-at-rc}

Скрейпер процесів у приймачі hostmetrics — перший компонент, який застосував цей підхід із метриками з версіями. Спершу семантичні домовленості процесів було підвищено до статусу реліз-кандидата; це було зроблено в [цьому PR](https://github.com/open-telemetry/semantic-conventions/pull/3758).

Ми використовуємо шлях міграції, визначений у файлі `metadata.yaml` скрейпера процесів, щоб визначити застарілі та RC-функціональні прапорці. Щойно схему було оновлено новими метриками й атрибутами реліз-кандидата, новий код згенерували за допомогою оновленого інструментарію mdatagen. Це забезпечило правильний шлях міграції.

Наведені нижче метрики й атрибути було оновлено та надано їм версії:

| Застаріла метрика               | RC-метрика                              | Зміна одиниці                   | Зміна атрибута                                        |
| ------------------------------- | --------------------------------------- | ------------------------------- | ----------------------------------------------------- |
| `process.context_switches`      | `process.context_switches@v1`           | `{count}` → `{context_switch}`  | `context_switch_type` → `process.context_switch.type` |
| `process.cpu.time`              | `process.cpu.time@v1`                   | немає                           | `state` → `cpu.mode`                                  |
| `process.cpu.utilization`       | `process.cpu.utilization@v1`            | немає                           | `state` → `cpu.mode`                                  |
| `process.disk.io`               | `process.disk.io@v1`                    | немає                           | `direction` → `disk.io.direction`                     |
| `process.handles`               | `process.windows.handle.count@v1`       | `{count}` → `{handle}`          | немає                                                 |
| `process.open_file_descriptors` | `process.unix.file_descriptor.count@v1` | `{count}` → `{file_descriptor}` | немає                                                 |
| `process.paging.faults`         | `process.paging.faults@v1`              | `{faults}` → `{fault}`          | `paging_fault_type` → `system.paging.fault.type`      |
| `process.threads`               | `process.thread.count@v1`               | `{threads}` → `{thread}`        | немає                                                 |

Ось простий посібник про те, як надавати застарілі або RC-метрики зі скрейпера процесів. Спершу нам потрібна проста конфігурація Колектора для скрейпера процесів. У цьому прикладі ми також вмикаємо `process.cpu.utilization`, щоб продемонструвати, що в конфігурації користувача не потрібно згадувати RC-метрики, аби вони надавалися, якщо застарілу метрику було ввімкнено:

```yaml
receivers:
  hostmetrics:
    collection_interval: 5s
    scrapers:
      process:
        metrics:
          process.cpu.utilization:
            enabled: true

exporters:
  debug:
    verbosity: detailed

service:
  pipelines:
    metrics:
      receivers: [hostmetrics]
      exporters: [debug]
```

Далі, щоб скористатися RC-скрейпером процесів, ми маємо надати функціональний прапорець, щоб генерувати RC-метрики. Починаючи з v0.160.0 це обовʼязково, оскільки функціональні прапорці перебувають в альфі, тобто стандартно вимкнені:

```sh
./otelcontribcol<your-local-system-image> --config=<your-config>.yaml --feature-gates=scraper.process.EmitV1SystemConventions
```

Коли скрейпер запущено, зверніть увагу на вивід журналу:

```text
[WARNING] Legacy metric `process.cpu.time` disabled: same emitted name as `process.cpu.time@v1` with different attributes; only latest will be emitted with combined attributes    {"resource": {"service.instance.id": "60c55fb8-c66b-4345-aef5-abb193e79a0d", "service.name": "otelcontribcol", "service.version": "0.161.0-dev"}, "otelcol.component.id": "hostmetrics", "otelcol.component.kind": "receiver", "otelcol.signal": "metrics", "scraper": "process", "legacy_attributes": ["state"], "latest_attributes": ["cpu.mode"]}
...
[WARNING] Legacy metric `process.cpu.utilization` disabled: same emitted name as `process.cpu.utilization@v1` with different attributes; only latest will be emitted with combined attributes    {"resource": {"service.instance.id": "60c55fb8-c66b-4345-aef5-abb193e79a0d", "service.name": "otelcontribcol", "service.version": "0.161.0-dev"}, "otelcol.component.id": "hostmetrics", "otelcol.component.kind": "receiver", "otelcol.signal": "metrics", "scraper": "process", "legacy_attributes": ["state"], "latest_attributes": ["cpu.mode"]}
...
[WARNING] Legacy metric `process.disk.io` disabled: same emitted name as `process.disk.io@v1` with different attributes; only latest will be emitted with combined attributes    {"resource": {"service.instance.id": "60c55fb8-c66b-4345-aef5-abb193e79a0d", "service.name": "otelcontribcol", "service.version": "0.161.0-dev"}, "otelcol.component.id": "hostmetrics", "otelcol.component.kind": "receiver", "otelcol.signal": "metrics", "scraper": "process", "legacy_attributes": ["direction"], "latest_attributes": ["disk.io.direction"]}
```

Ми бачимо, що записуємо три попередження: одне для метрики `process.cpu.time`, одне для `process.cpu.utilization` і одне для `process.disk.io`. Це тому, що версії v1 цих метрик мають інші атрибути порівняно із застарілими версіями. Згенерований код записує попередження, щоб показати, що внутрішньо ми надаємо тут лише RC-метрику, а не застарілу, через проблему подвійного публікування, описану в RFC вище.

А ось власне метрики з їхніми атрибутами. Зверніть увагу, що в конфігурації користувача не потрібно було згадувати RC-метрику `process.cpu.utilization@v1`, але тут ми надаємо лише RC-метрику, оскільки і застаріла, і RC-метрика мають однакову назву, але різняться атрибутами. У цьому випадку атрибут застарілої метрики — `state`, а атрибут RC-метрики — `cpu.mode`.

```text
Metric #1
Descriptor:
     -> Name: process.cpu.utilization
     -> Description: Difference in process.cpu.time since the last measurement, divided by the elapsed time and number of CPUs available to the process. On the first scrape, no data point is emitted for this metric.
     -> Unit: 1
     -> DataType: Gauge
NumberDataPoints #0
Data point attributes:
     -> cpu.mode: Str(user)
     -> state: Str(user)
StartTimestamp: 2026-09-16 09:27:59.35 +0000 UTC
Timestamp: 2026-09-16 09:28:06.413091903 +0000 UTC
Value: 0.001253
NumberDataPoints #1
Data point attributes:
     -> cpu.mode: Str(system)
     -> state: Str(system)
StartTimestamp: 2026-09-16 09:27:59.35 +0000 UTC
Timestamp: 2026-09-16 09:28:06.413091903 +0000 UTC
Value: 0.001003
NumberDataPoints #2
Data point attributes:
     -> cpu.mode: Str(iowait)
     -> state: Str(wait)
```

Підхід із метриками з версіями дозволяє нам не ламати конфігурацію користувача. Якщо ви надавали `process.cpu.utilization` у своїй конфігурації, то, щоб надавати найновішу RC-версію цієї метрики, вам достатньо скористатися функціональним прапорцем `scraper.process.EmitV1SystemConventions`.

## Від RC до стабільної версії {#from-rc-to-stable}

Наступний крок до стабільності скрейпера процесів — зачекати шість місяців. System SIG хоче, щоб спільнота спробувала скрейпер процесів на етапі RC, що дає кінцевим користувачам час зʼясувати, чи ламають RC-метрики й атрибути їхні інфопанелі. Якщо вони надають лише RC-метрики, чи повертають їхні запити те, що вони очікують, і чи все ще відображаються їхні інфопанелі? Там, де ні, період RC — це вікно для їх оновлення. Ви можете надіслати будь-який відгук до каналу System SIG [#otel-system-metrics](https://cloud-native.slack.com/archives/C05CTFE9U4A?link-check=no&last-validated=2026-10-05) у [CNCF Slack](https://slack.cncf.io/).

Щойно мине шість місяців, ми зможемо перевести скрейпер процесів у стабільний статус. Це означає перевірити, що він відповідає ['критеріям стабільності' stable](https://github.com/open-telemetry/opentelemetry-collector/blob/7d1c25d46b14cce04a820d92a4ce462bf7a04b0b/docs/component-stability.md#stable), які охоплюють тестування, бенчмаркінг, документацію та стабільність телеметрії. Переведення скрейпера в стабільний статус означає підвищення функціональних прапорців міграції до beta, тобто обидва будуть увімкнені за замовчуванням, що прибере застарілі метрики. Користувачі все ще можуть надавати застарілі метрики за потреби, вимкнувши обидва прапорці. Див. [посібник із функціональних прапорців](https://github.com/open-telemetry/opentelemetry-collector/blob/ac085a4d9f1bdaf3eb90aaebc9a3815f4e00954d/featuregate/README.md?plain=1#L1).

## Майбутня стабільність hostmetrics {#future-stability-of-hostmetrics}

Можливість надавати метрикам версії й давати їм шлях міграції розблоковує ширший план стабілізації приймача hostmetrics. Скрейпер процесів — перший компонент, який цим скористався, але механізм живе в mdatagen у базовому репозиторії Колектора, тож тепер будь-який компонент, що стикається зі зміною семантичних домовленостей, може піти тим самим шляхом.

System SIG працює над підвищенням простору імен system до RC у семантичних домовленостях — метрики `system.*`, що охоплюють CPU, памʼять, диск, мережу та файлову систему, а це більшість того, що залишилося в hostmetrics. Ця робота вже розпочалася. Щойно ці домовленості досягнуть RC, ми зможемо почати підвищувати системні метрики й атрибути в приймачі hostmetrics, скрейпер за скрейпером, використовуючи той самий підхід із метриками з версіями.
