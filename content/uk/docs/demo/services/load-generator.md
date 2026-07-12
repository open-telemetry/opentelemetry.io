---
title: Генератор навантаження
aliases: [loadgenerator]
default_lang_commit: c060ef7682b152a285d3a2f0c6a84c93ff877070
cSpell:ignore: baggage goroutines loadgenerator otelHeaders xk6
---

Генератор навантаження базується на [k6](https://k6.io), інструменті для тестування навантаження, написаному на Go, який виконує тестові сценарії, написані на JavaScript. Стандартно він буде імітувати користувачів, які запитують різні маршрути з фронтенду. Все його інструментування OpenTelemetry походить від Go SDK, вбудованого в бінарний файл k6 за допомогою розширення `xk6-otel`, описаного нижче.

[Сирці генератора навантаження](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/load-generator/)

## Трейси {#traces}

### Ініціалізація трасування {#initializing-tracing}

Трасування у генераторі навантаження забезпечується спеціальним розширенням [xk6](https://github.com/grafana/xk6) (`xk6-otel`), яке обгортає OpenTelemetry Go SDK та надає доступ до нього з JavaScript-сценаріїв k6. Розширення компілюється в бінарний файл k6 під час збірки образу.

Розширення ініціалізує `TracerProvider` з експортером OTLP HTTP при першому використанні. Точка доступу колектора, протокол, атрибути ресурсів та імʼя сервісу зчитуються зі стандартних [змінних середовища OpenTelemetry](/docs/specs/otel/configuration/sdk-environment-variables/) (`OTEL_EXPORTER_OTLP_ENDPOINT`, `OTEL_EXPORTER_OTLP_PROTOCOL`, `OTEL_RESOURCE_ATTRIBUTES` та `OTEL_SERVICE_NAME`).

### Створення відрізків {#creating-spans}

Сценарії імпортують клас `Tracer` з модуля `k6/x/otel` та створюють відрізки вручну навколо кожної симульованої дії користувача:

```javascript
import { Tracer } from 'k6/x/otel';

const tracer = new Tracer();

function browseProduct() {
  const span = tracer.startSpan('user_browse_product', {
    'product.id': product,
  });
  http.get(`${BASE_URL}/api/products/${product}`, {
    headers: otelHeaders(span.traceParent()),
  });
  span.end();
}
```

Метод `startSpan(name, attrs?)` створює новий клієнтський відрізок і повертає обʼєкт з трьома методами:

- `traceParent()` — повертає значення заголовка W3C `traceparent` для відрізка, який використовується для поширення контексту трейсу на серверні сервіси.
- `log(message)` — створює корельований запис логу OTel, повʼязаний з трейсом та ідентифікатором відрізка.
- `end()` — завершує відрізок та відправляє його експортеру.

## Метрики {#metrics}

Генератор навантаження створює два види метрик:

- **Вбудовані тестові метрики k6** (тривалість запиту, рівень помилок, пропускна здатність тощо) експортуються до OpenTelemetry Collector через вбудований вивід `opentelemetry` k6 (`--out opentelemetry`). Протокол виводу та точка доступу колектора налаштовуються через змінні середовища `K6_OTEL_EXPORTER_PROTOCOL` та `K6_OTEL_HTTP_EXPORTER_ENDPOINT`.
- **Метрики середовища виконання Go** (памʼять, збирання сміття, goroutines) створюються розширенням `xk6-otel` за допомогою інструментування OpenTelemetry `runtime`.

## Логи {#logs}

Записи логів створюються викликом `span.log(message)` на будь-якому активному відрізку. Розширення `xk6-otel` додає ідентифікатори трейсу та відрізка до кожного запису логу.

## Baggage

OpenTelemetry Baggage використовується генератором навантаження для позначення того, що трейси синтетично згенеровані. Кожен вихідний HTTP-запит містить заголовок `baggage` та заголовок `traceparent`, створені допоміжною функцією `otelHeaders`:

```javascript
function otelHeaders(traceParent, extra) {
  return Object.assign(
    {
      baggage: `synthetic_request=true,session.id=${sessionId}`,
      traceparent: traceParent,
    },
    extra,
  );
}
```

Baggage сам по собі не позначає телеметрію. Кожен сервіс бекенду зчитує запис `synthetic_request` з отриманого baggage і копіює його у власні відрізки та записи логів як атрибут, і саме цей атрибут визначає, чи надійшла телеметрія від синтетичного потоку. Фронтенд встановлює `demo.synthetic_request`, а сервіси оформлення замовлення та платежів встановлюють `user_agent.synthetic.type` в `test`. Оскільки маркер потрапляє на саму телеметрію, ви можете фільтрувати трафік генератора навантаження в будь-якому запиті у вашій системі спостереження.
