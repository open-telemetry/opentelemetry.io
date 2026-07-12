---
title: Кореляція трейсів і логів
linkTitle: Кореляція трейсів і логів
weight: 35
description: Дізнайтесь як OBI корелює логи застосунків з розподіленими трейсами для швидшого налагодження та усунення несправностей.
default_lang_commit: 2021ec6e35d03a3f5f99da13b908091068154a44
cSpell:ignore: BPFFS NUL PYTHONUNBUFFERED ringbuffer форвардер
---

Інструментування OpenTelemetry eBPF Instrumentation (OBI) корелює логи застосунків з розподіленими трейсами, збагачуючи JSON та plain-text логи контекстом трасування. OBI не експортує логи; він записує збагачені логи назад до того самого потоку, тоді як трейси експортуються через OTLP.

## Огляд {#overview}

Кореляція trace-log зʼєднує два доповнюючи сигнали спостережуваності:

- **Трасування**: Показує проходження запиту крізь сервіси з таймінгом і структурою
- **Логи**: Надають детальну інформацію про події та стан застосунку

За допомогою OBI trace-log correlation, логи з інструментованих процесів автоматично збагачуються контекстом трасування:

- **Trace ID**: Повʼязує запис логу з розподіленим трейсом
- **Span ID**: Повʼязує запис логу з конкретним відрізком трейсу

Це дозволяє вашому бекенду спостережуваності корелювати логи з трейсами з яких вони походять без будь-яких змін у вашому застосунку.

## Як це працює {#how-it-works}

OBI використовує eBPF для того щоб робити інʼєкцію контексту трейсів в логи застосунку на рівні ядра:

1. **Захоплення трасування**: OBI захоплює контекст трасування (ідентифікатор трасування та ідентифікатор відрізка) для всіх відстежуваних операцій
2. **Перехоплення логів**: OBI перехоплює системні виклики запису для збору логів застосунків.
3. **Додавання контексту**: OBI вводить поля `trace_id` та `span_id` в JSON обʼєкти або додає `key=value` поля, які можна налаштовувати, до обраних plain-text рядків
4. **Експорт трасування**: логи продовжують надходити через поточний конвеєр логів.
5. **Звʼязування бекенду**: бекенд спостережності повʼязує логи з трасуваннями за допомогою цих ідентифікаторів.

### Технічний підхід {#technical-approach}

OBI виконує кореляцію на рівні ядра без модифікації бінарних файлів застосунків:

- Використовує проби eBPF для перехоплення операцій запису
- Підтримує кешування дескрипторів файлів для покращення продуктивності
- Працює з фреймворками логування, що записують JSON або plain text

OBI зберігає сконфігуровані trace та span поля, які вже існують. JSON ключі збігаються літерально; у plain text OBI розпізнає `name=value` токени на початку рядка або після пробілу. Для сервісу, який виявлено як такий, що безпосередньо експортує OpenTelemetry трейси, OBI вставляє лише `trace_id`: його eBPF-згенерований span ID не ідентифікує SDK span.

## Налаштування {#configuration}

Щоб зіставити логи з трейсами, експортуйте трейси та налаштуйте OBI для додавання контексту трейсу до логів із вибраних робочих навантажень. Поля конфігурації відрізняються у Config v1 та Config v2. Якщо ви використовуєте Config v2, див. [Довідник по Config v2](../configure/config-v2/). Щоб перетворити наявний файл Config v1, дотримуйтесь [посібника з міграції](../configure/migrate-to-config-v2/).

### Config v1

```yaml
# Увімкнення експорту трасувань
otel_traces_export:
  endpoint: http://otel-collector:4318/v1/traces

# Оберіть сервіс для інструментування
discovery:
  instrument:
    - open_ports: '8380'

# Увімкнення збагачення логів для цих сервісів
ebpf:
  log_enricher:
    services:
      - service:
          - open_ports: '8380'
```

Збагачення логів може бути далі налаштоване у `ebpf.log_enricher`:

- `cache_ttl`: час існування дескрипторів файлів кешування
- `cache_size`: максимальна кількість кешованих дескрипторів файлів
- `async_writer_workers`: кількість асинхронних фрагментів записувача
- `async_writer_channel_len`: розмір черги на кожен фрагмент
- `field_names`: імена полів, що використовуються для розпізнавання та інʼєкції trace та span ID
- `plain_text.enabled`: чи анотувати не-JSON логи; зазвичай `true`
- `plain_text.placement`: додавати поля як `prefix` або `suffix`
- `plain_text.multiline`: анотувати `first_line`, `last_line`, або `each_line` в кожному перехопленому записі

Наприклад:

```yaml
ebpf:
  log_enricher:
    field_names:
      trace_id: trace_id
      span_id: span_id
    plain_text:
      enabled: true
      placement: suffix
      multiline: first_line
```

Plain-text збагачення стандартно увімкнено для обраних сервісів у v0.11.0. Встановіть `plain_text.enabled: false` перед оновленням, якщо non-JSON записи повинні зберегти попередню поведінку pass-through. Імена полів застосовуються до JSON та plain-text виводу і мають бути непорожніми, унікальними і не містити пробілів, `=`, або контрольних символів.

#### Вибір сервісів {#service-selection}

OBI збагачує JSON та plain-text логи для сервісів, перелічених у `ebpf.log_enricher.services`. Зберігайте вибір сервісів узгодженим з `discovery.instrument`, щоб збагачення відстежувало ті самі процеси.

### Config v2

З Config v2, анотація логів трасування доступна лише коли ви запускаєте OBI як самостійний процес. Вона стандартно вимкнена. Налаштуйте її в `extensions.obi.correlation.log_trace_annotation`:

```yaml
extensions:
  obi:
    correlation:
      log_trace_annotation:
        enabled: true
        field_names:
          trace_id: trace_id
          span_id: span_id
        plain_text:
          enabled: true
          placement: suffix
          multiline: first_line
```

Config v2 вибір захоплення визначає, які робочі навантаження є придатними для анотації логів. Поле `log_trace_annotation.filter` зарезервоване у v0.11.0 і повинно залишатися порожнім.

## Вимоги {#requirements}

### 1. Підтримуваний формат логів {#1-supported-log-format}

Для логів у форматі JSON, OBI вводить поля `trace_id` та `span_id` в JSON обʼєкти:

**До OBI**:

```json
{ "level": "info", "message": "Request processed", "duration_ms": 125 }
```

**Після збагачення OBI**:

```json
{
  "level": "info",
  "message": "Request processed",
  "duration_ms": 125,
  "trace_id": "4bf92f3577b34da6a3ce929d0e0e4736",
  "span_id": "00f067aa0ba902b7"
}
```

Для логів у вигляді простого тексту OBI додає ідентифікатори з малими літерами та фіксованою шириною у вигляді полів `key=value`, розділених пробілами. Розташування та вибір кількох рядків можна налаштувати:

```text
request processed trace_id=4bf92f3577b34da6a3ce929d0e0e4736 span_id=00f067aa0ba902b7
```

JSON, розділений символами нового рядка, обробляється як структурований JSON. OBI доповнює кожен запис обʼєкта окремо і не застосовує анотації у вигляді простого тексту до валідного NDJSON. Багаторядкове виділення здійснюється для непорожніх фізичних рядків за один перехоплений запис; OBI не відтворює логічні події між окремими записами.

#### Обмеження буферизації часу виконання {#runtime-buffering-limitations}

OBI бачить контекст трейсів лише тоді, коли запис логу відбувається в потоці обробки запиту. Середовища виконання, які буферизують stdout асинхронно, можуть порушити це припущення.

- Python у Docker зазвичай потребує `PYTHONUNBUFFERED=1`
- .NET `Console.Out` зазвичай буферизується, коли stdout є pipe; використовуйте `StreamWriter` з `AutoFlush = true`
- Стандартний конвеєр `Microsoft.Extensions.Logging.AddConsole()` у ASP.NET Core не сумісний, оскільки запис відбувається з фонового потоку
- Логи віртуальних потоків Java не збагачуються, оскільки потік ядра-носій може виконувати роботу з декількох віртуальних потоків; збагачення звичайних потоків не порушується

### 2. Експорт трасування та збагачення логів увімкнено {2-trace-export-and-log-enrichment-enabled}

Для кореляції трасування та логів необхідні як експорт трасування, так і збагачення логів. Для Config v1:

```yaml
otel_traces_export:
  endpoint: http://collector:4318/v1/traces # Обовʼязково

ebpf:
  log_enricher:
    services:
      - service:
          - open_ports: '8380' # Обовʼязково
```

### 3. Ядро Linux {#linux-kernel}

Кореляція trace-log вимагає певних функцій ядра Linux:

- **Linux ядро 6.0+** (потрібне для роботи trace-log кореляції)
- Підтримувані архітектури: x86_64, ARM64
- **BPFFS монтування**: Ядро повинне мати файлову систему BPF змонтовану у `/sys/fs/bpf`
- **Ядро без блокування безпеки**: Потрібне ядро, яке не працює в режимі блокування безпеки (типово для більшості робочих дистрибутивів).

### 4. Фреймворк, що генерує підтримувані логи {#4-framework-that-emits-supported-logs}

Застосунки можуть використовувати фреймворк логування, налаштований для виводу JSON або plain text. Наступні JSON приклади створюють структуровані поля:

{{< tabpane text=true persist=lang >}} {{% tab header="Python" lang=python %}}

```python
import json
import logging

class JSONFormatter(logging.Formatter):
    def format(self, record):
        log_entry = {
            'timestamp': self.formatTime(record),
            'level': record.levelname,
            'message': record.getMessage(),
            'module': record.module,
        }
        return json.dumps(log_entry)

logger = logging.getLogger()
handler = logging.StreamHandler()
handler.setFormatter(JSONFormatter())
logger.addHandler(handler)
```

{{% /tab %}} {{% tab header="Go (через zap)" lang=go %}}

```go
import "go.uber.org/zap"

logger, _ := zap.NewProduction() // Outputs JSON by default
defer logger.Sync()
logger.Info("Request processed", zap.Duration("duration", 125*time.Millisecond))
```

{{% /tab %}} {{% tab header="Java (через Logback)" lang=java %}}

```xml
<appender name="FILE" class="ch.qos.logback.core.ConsoleAppender">
  <encoder class="net.logstash.logback.encoder.LogstashEncoder"/>
</appender>
```

{{% /tab %}} {{% tab header="Node.js (через pino)" lang=javascript %}}

```javascript
const pino = require('pino');
const logger = pino();
logger.info({ duration_ms: 125 }, 'Request processed');
```

{{% /tab %}} {{< /tabpane >}}

### 5. Конвеєр постачання логів {#5-log-shipping-pipeline}

OBI збагачує логи на місці. Використовуйте наявний лог-форвардер або колектор для передачі логів у ваш бекенд.

Коли OBI пригнічує оригінальний рядок, файли контейнерних логів містять рядок з NUL байтів на його місці. Для записів до 8 KiB фільтруйте ці рядки-заповнювачі на етапі доставки за допомогою `^[\x00\s]*$`. Наприклад, з приймачем `filelog` колектора OpenTelemetry:

```yaml
receivers:
  filelog:
    include:
      - /var/log/pods/*/*/*.log
    start_at: end
    operators:
      - type: container
      - type: filter
        expr: 'body matches "^[\\x00\\s]*$"'
```

CRI та Docker JSON конверти логів кодують NUL як `\u0000`; оператор `container` декодує тіло перед виконанням фільтра.

## Зауваження щодо продуктивності {#performance-considerations}

- **Мінімальні накладні витрати**: кореляція використовує проби ядра eBPF з ефективним кешуванням файлових дескрипторів
- **Обмеження кешу**: кеш файлових дескрипторів має обмеження розміру та TTL, щоб запобігти необмеженому використанню памʼяті
- **Асинхронна обробка**: збагачення журналів використовує асинхронні робочі процеси, щоб уникнути переповнення ringbuffer ядра

## Відомі обмеження {#known-limitations}

- **Per-write багаторядковий вибір**: OBI не реконструює логічні багаторядкові події між окремими записами
- **Кеш файлових дескрипторів**: Налаштовано на продуктивність, з налаштованим TTL (типово: 30 хвилин)
- **Тільки в межах відрізку**: Логи збагачуються тільки поки відрізок є активним; логи поза межами відрізку не збагачуються.
- **Обмеження 8 KiB на один запис**: OBI збагачує та пригнічує максимум перші 8 KiB одного виклику `write()` або `writev()`. Решта байтів проходять без збагачення та не відповідають фільтру рядків-заповнювачів.
- **Віртуальні потоки Java**: Логи, записані з віртуальних потоків, не збагачуються.

## Розвʼязання проблем {#troubleshooting}

### Вміст трасування не зʼявляється в логах {#trace-context-not-appearing-in-logs}

1. **Перевірте налаштований формат**: Для JSON логів, переконайтесь, що застосунок виводить валідний JSON. Для plain text, підтвердьте, що `plain_text.enabled` є `true` та перевірте налаштування placement та multiline.

   ```bash
   # Перевка на наявність пошкдження JSON
   cat app.log | jq empty && echo "Valid JSON" || echo "Invalid JSON"
   ```

2. **Перевірте експорт трасування та збагачення логів**:

   ```yaml
   otel_traces_export:
     endpoint: http://collector:4318/v1/traces

   ebpf:
     log_enricher:
       services:
         - service:
             - open_ports: '8380'
   ```

3. **Перевірте ядро Linux**: Кореляція trace-log вимагає Linux

   ```bash
   uname -s  # У відповід маєте отримати "Linux"
   ```

4. **Перевірте конвеєр логів**: Перевірте ваш лог-форвардер, чи пересилає він логи до бекенду

## Що далі? {#whats-next}

- Встановлення [місця призначення експорту](/docs/zero-code/obi/configure/export-data/) для трасувань та метрик
- Більше про OBI як [приймач Колектора](/docs/zero-code/obi/configure/collector-receiver/) для централізованої обробки
