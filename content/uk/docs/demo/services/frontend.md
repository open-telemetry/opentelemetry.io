---
title: Фронтенд
default_lang_commit: 5489ba34bff91356aa2c501cd55f07eeb30cc355
cSpell:ignore: typeof
---

Фронтенд відповідає за надання інтерфейсу користувача, а також API, яке використовується інтерфейсом або іншими клієнтами. Застосунок базується на [Next.JS](https://nextjs.org/), щоб забезпечити вебінтерфейс на основі React та маршрути API.

[Сирці фронтенду](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/frontend/)

## Інструментування сервера {#server-instrumentation}

Рекомендується використовувати модулі Node, що вимагається, при запуску вашого застосунку Node.js для ініціалізації SDK та автоінструментування. При ініціалізації OpenTelemetry Node.js SDK ви можете опціонально вказати, які бібліотеки автоінструментування використовувати, або скористатися функцією `getNodeAutoInstrumentations()`, яка включає більшість популярних фреймворків. Файл `utils/telemetry/Instrumentation.js` містить весь код, необхідний для ініціалізації SDK та автоінструментування на основі стандартних [змінних середовища OpenTelemetry](/docs/specs/otel/configuration/sdk-environment-variables/) для експорту OTLP, атрибутів ресурсу та назви сервісу.

```javascript
const FrontendTracer = async () => {
  const { ZoneContextManager } = await import('@opentelemetry/context-zone');

  let resource = resourceFromAttributes({
    [ATTR_SERVICE_NAME]: NEXT_PUBLIC_OTEL_SERVICE_NAME,
  });
  const detectedResources = detectResources({ detectors: [browserDetector] });
  resource = resource.merge(detectedResources);

  const provider = new WebTracerProvider({
    resource,
    spanProcessors: [
      new SessionIdProcessor(),
      new BatchSpanProcessor(
        new OTLPTraceExporter({
          url:
            NEXT_PUBLIC_OTEL_EXPORTER_OTLP_TRACES_ENDPOINT ||
            'http://localhost:4318/v1/traces',
        }),
        {
          scheduledDelayMillis: 500,
        },
      ),
    ],
  });

  const contextManager = new ZoneContextManager();

  provider.register({
    contextManager,
    propagator: new CompositePropagator({
      propagators: [
        new W3CBaggagePropagator(),
        new W3CTraceContextPropagator(),
      ],
    }),
  });

  registerInstrumentations({
    tracerProvider: provider,
    instrumentations: [
      getWebAutoInstrumentations({
        '@opentelemetry/instrumentation-fetch': {
          propagateTraceHeaderCorsUrls: /.*/,
          clearTimingResources: true,
          applyCustomAttributesOnSpan(span) {
            span.setAttribute('app.synthetic_request', IS_SYNTHETIC_REQUEST);
          },
        },
      }),
    ],
  });
};
```

Модулі Node, що вимагаються, завантажуються за допомогою аргументу командного рядка `--require`. Це можна зробити в розділі `scripts.start` файлу `package.json` і запустити застосунок за допомогою `npm start`.

```json
"scripts": {
  "start": "node --require ./Instrumentation.js server.js",
},
```

## Трейси {#traces}

### Винятки та статуси відрізків {#span-exceptions-and-status}

Ви можете використовувати функцію `recordException` обʼєкта відрізка, щоб створити подію відрізка з повним стеком обробленої помилки. При записі винятку також не забудьте встановити статус відрізка відповідно. Ви можете побачити це в блоці catch функції `NextApiHandler` у файлі `utils/telemetry/InstrumentationMiddleware.ts`.

```typescript
span.recordException(error as Exception);
span.setStatus({ code: SpanStatusCode.ERROR });
```

### Створення нових відрізків {#create-new-spans}

Нові відрізки можна створити та запустити за допомогою `Tracer.startSpan("spanName", options)`. Декілька опцій можна використовувати для вказівки як відрізок може бути створений.

- `root: true` створить нове трасування, встановивши цей відрізок як кореневий.
- `links` використовуються для вказівки посилань на інші відрізки (навіть в іншому трасуванні), які повинні бути згадані.
- `attributes` є парами ключ/значення, доданими до відрізка, зазвичай використовуються для контексту застосунку.

```typescript
span = tracer.startSpan(`${method}`, {
  root: true,
  kind: SpanKind.SERVER,
  links: [{ context: syntheticSpan.spanContext() }],
  attributes: {
    'app.synthetic_request': true,
    [ATTR_HTTP_RESPONSE_STATUS_CODE]: response.statusCode,
    [ATTR_HTTP_REQUEST_METHOD]: method,
    [ATTR_USER_AGENT_ORIGINAL]: headers['user-agent'] || '',
    [ATTR_URL_PATH]: target,
    [ATTR_URL_FULL]: `${headers.host}${url}`,
    [ATTR_NETWORK_PROTOCOL_VERSION]: httpVersion,
  },
});
```

## Інструментування оглядача {#browser-instrumentation}

Вебінтерфейс, який надає фронтенд, також інструментується для вебоглядачів. Інструментування OpenTelemetry включено як частина компонента застосунку Next.js у файлі `pages/_app.tsx`. Тут інструментування імпортується та ініціалізується.

```typescript
import FrontendTracer from '../utils/telemetry/FrontendTracer';

if (typeof window !== 'undefined') FrontendTracer();
```

Файл `utils/telemetry/FrontendTracer.ts` містить код для ініціалізації TracerProvider, встановлення експорту OTLP, реєстрації поширювачів контексту трасування, та реєстрації бібліотек автоінструментування, специфічних для вебу. Оскільки оглядач буде надсилати дані до OpenTelemetry Collector, який, ймовірно, буде на окремому домені, заголовки CORS також налаштовані відповідним чином.

Як частина змін для перенесення прапорця атрибута `synthetic_request` для бекенд-сервісів, функція конфігурації `applyCustomAttributesOnSpan` була додана до логіки користувацьких атрибутів відрізків бібліотеки `instrumentation-fetch`, таким чином кожен відрізок на стороні оглядача буде включати його.

```typescript
import {
  CompositePropagator,
  W3CBaggagePropagator,
  W3CTraceContextPropagator,
} from '@opentelemetry/core';
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { getWebAutoInstrumentations } from '@opentelemetry/auto-instrumentations-web';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';

const FrontendTracer = async () => {
  const { ZoneContextManager } = await import('@opentelemetry/context-zone');

  const provider = new WebTracerProvider({
    resource: resourceFromAttributes({
      [ATTR_SERVICE_NAME]: process.env.NEXT_PUBLIC_OTEL_SERVICE_NAME,
    }),
    spanProcessors: [new SimpleSpanProcessor(new OTLPTraceExporter())],
  });

  const contextManager = new ZoneContextManager();

  provider.register({
    contextManager,
    propagator: new CompositePropagator({
      propagators: [
        new W3CBaggagePropagator(),
        new W3CTraceContextPropagator(),
      ],
    }),
  });

  registerInstrumentations({
    tracerProvider: provider,
    instrumentations: [
      getWebAutoInstrumentations({
        '@opentelemetry/instrumentation-fetch': {
          propagateTraceHeaderCorsUrls: /.*/,
          clearTimingResources: true,
          applyCustomAttributesOnSpan(span) {
            span.setAttribute('app.synthetic_request', 'false');
          },
        },
      }),
    ],
  });
};

export default FrontendTracer;
```

## Метрики {#metrics}

TBD

## Логи {#logs}

TBD

## Baggage

OpenTelemetry Baggage використовується у фронтенді для перевірки, чи є запит синтетичним (від генератора навантаження). Синтетичні запити примусять створення нового трасування. Кореневий відрізок нового трасування міститиме багато тих самих атрибутів, що й відрізок HTTP-запиту.

Щоб визначити, чи встановлено елемент Baggage, ви можете використовувати API `propagation` для розбору заголовка Baggage, та використовувати API `baggage` для отримання або встановлення записів.

```typescript
const baggage = propagation.getBaggage(context.active());
if (baggage?.getEntry("synthetic_request")?.value == "true") {...}
```
