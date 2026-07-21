---
title: Сервіс оплати
linkTitle: Оплата
aliases: [paymentservice]
default_lang_commit: 311e7819e9eacf9d8b6d250bbdee98c018ea232e
---

Цей сервіс відповідає за обробку платежів кредитними картками для замовлень. Він поверне помилку, якщо кредитна картка недійсна або платіж не може бути оброблений.

[Сирці сервісу оплати](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/payment/)

## Інструментування без коду {#zero-code-instrumentation}

Цей сервіс на Node.js використовує інструментування без коду OpenTelemetry Node.js, налаштовуючись шляхом підключення модуля `@opentelemetry/auto-instrumentations-node/register` під час запуску. Точки доступу експорту, атрибути ресурсів та назва сервісу автоматично встановлюються на основі змінних середовища. Це можна зробити у скрипті запуску `package.json` сервісу або через `NODE_OPTIONS`.

```json
"scripts": {
  "start": "node --require @opentelemetry/auto-instrumentations-node/register index.js"
}
```

## Трейси {#traces}

### Додавання атрибутів до автоінструментованих відрізків {#add-attributes-to-auto-instrumented-spans}

Під час виконання автоінструментованого коду ви можете отримати поточний відрізок з контексту.

```javascript
const span = opentelemetry.trace.getActiveSpan();
```

Додавання атрибутів до відрізка здійснюється за допомогою функції `setAttributes` на обʼєкті відрізка. У функції `chargeServiceHandler` атрибут додається до відрізка як анонімний обʼєкт (map) для пари ключ/значення атрибута.

```javascript
span?.setAttributes({
  'demo.payment.amount': parseFloat(`${amount.units}.${amount.nanos}`).toFixed(
    2,
  ),
});
```

### Виключення та статус відрізків {#span-exceptions-and-status}

Ви можете використовувати функцію `recordException` обʼєкта відрізка для створення події відрізка з повним стеком обробленої помилки. При записі виключення також обовʼязково встановіть статус відрізка відповідно. Ви можете побачити це у функції `charge` у файлі `charge.js`.

```javascript
span.recordException(err);
span.setStatus({ code: SpanStatusCode.ERROR, message: err.message });
```

## Метрики {#metrics}

### Створення лічильників та інструментів {#creating-meters-and-instruments}

Лічильники можуть бути створені за допомогою пакету `@opentelemetry/api`. Ви можете створити лічильники, як показано нижче, а потім використовувати створений лічильник для створення інструментів.

```javascript
const { metrics } = require('@opentelemetry/api');

const meter = metrics.getMeter('payment');
const transactionsCounter = meter.createCounter('demo.payment.transactions');
```

Лічильники та інструменти повинні залишатися. Це означає, що ви повинні отримати лічильник або інструмент один раз, а потім використовувати його за потреби, якщо це можливо.

## Логи {#logs}

TBD

## Baggage

OpenTelemetry Baggage використовується у цьому сервісі для перевірки, чи є запит синтетичним (від генератора навантаження). Синтетичні запити не будуть оплачуватись, що вказується атрибутом відрізка. Файл `charge.js`, який виконує фактичну обробку платежів, має логіку для перевірки baggage.

```javascript
// перевірити baggage на synthetic_request=true та додати атрибут charged відповідно
const baggage = propagation.getBaggage(context.active());
if (
  baggage &&
  baggage.getEntry('synthetic_request') &&
  baggage.getEntry('synthetic_request').value === 'true'
) {
  span.setAttribute('demo.payment.charged', false);
} else {
  span.setAttribute('demo.payment.charged', true);
}
```
