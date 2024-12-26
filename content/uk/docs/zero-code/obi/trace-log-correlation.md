---
title: Кореляція трейсів і логів
linkTitle: Кореляція трейсів і логів
weight: 35
description: Дізнайтесь як OBI корелює логи застосунків з розподіленими трейсами для швидшого налагодження та усунення несправностей.
default_lang_commit: 5f551752635886a0d2d6b2a83e5a36866ca1b5f1
cSpell:ignore: BPFFS ringbuffer форвардер
---

Інструментування OpenTelemetry eBPF Instrumentation (OBI) корелює логи застосунків з розподіленими трейсами, збагачуючи JSON логи контекстом трасування. OBI не експортує логи; він записує збагачені логи назад до того самого потоку, тоді як трейси експортується через OTLP.

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
3. **Додавання контексту**: для логів у форматі JSON OBI вводить поля `trace_id` та `span_id`.
4. **Експорт трасування**: логи продовжують надходити через поточний конвеєр логів.
5. **Звʼязування бекенду**: бекенд спостережності повʼязує логи з трасуваннями за допомогою цих ідентифікаторів.

### Технічний підхід {#technical-approach}

OBI виконує кореляцію на рівні ядра без модифікації бінарних файлів застосунків:

- Використовує проби eBPF для перехоплення операцій запису
- Підтримує кешування дескрипторів файлів для покращення продуктивності
- Працює з будь-яким фреймворком логування, який записує логи в форматі JSON

## Налаштування {#configuration}

Кореляція trace-log є доступною, коли експорт трасування є налаштованим та збагачення логів увімкнено для обраних сервісів.

### Базові налаштування {#basic-configuration}

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

### Увімкнення кореляції для кожного сервісу {#enabling-correlation-per-service}

OBI збагачує логи JSON для сервісів, перерахованих у `ebpf.log_enricher.services`. Зберігайте вибір сервісів, щоб збагачення відстежувало ті самі процеси.

## Вимоги {#requirements}

### 1. Формат логів JSON {#1-json-log-format}

Кореляція trace-log **вимагає форматованих логів JSON**. OBI робить інʼєкції полів `trace_id` та `span_id` в обʼєкти логів JSON:

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

Логи в форматі plain text передаються без змін і **не збагачуються** контекстом трейсів.

### 2. Експорт трасування та збагачення логів увімкнено {2-trace-export-and-log-enrichment-enabled}

Трасування має бути експортованим та збагачення логів увімкненим:

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

### 4. Фреймворк, що генерує журнали JSON {#4-framework-that-emits-json-logs}

Застосунки мають використовувати налаштовані фреймворки логування для виводу JSON. Приклади:

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

## Зауваження щодо продуктивності {#performance-considerations}

- **Мінімальні накладні витрати**: кореляція використовує проби ядра eBPF з ефективним кешуванням файлових дескрипторів
- **Обмеження кешу**: кеш файлових дескрипторів має обмеження розміру та TTL, щоб запобігти необмеженому використанню памʼяті
- **Асинхронна обробка**: збагачення журналів використовує асинхронні робочі процеси, щоб уникнути переповнення ringbuffer ядра

## Відомі обмеження {#known-limitations}

- **Тільки JSON**: Логи в форматі звичайного тексту не збагачуються контекстом трасування
- **Кеш файлових дескрипторів**: Налаштовано на продуктивність, з налаштованим TTL (типово: 30 хвилин)
- **Тільки в межах відрізку**: Логи збагачуються тільки поки відрізок є активним; логи поза межами відрізку не збагачуються.

## Розвʼязання проблем {#troubleshooting}

### Вміст трасування не зʼявляється в логах {#trace-context-not-appearing-in-logs}

1. **Перевірте формат JSON**: Переконайтесь, що логи застосунків мають відповідний формат JSON

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
