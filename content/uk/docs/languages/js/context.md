---
title: Контекст
description: Документація API контексту OpenTelemetry для JavaScript
aliases: [api/context]
weight: 60
default_lang_commit: 5489ba34bff91356aa2c501cd55f07eeb30cc355
---

Для того, щоб OpenTelemetry працював, він повинен зберігати та передавати важливі дані телеметрії. Наприклад, коли отримано запит і розпочато відрізок, він повинен бути доступний компоненту, який створює його дочірній відрізок. Щоб розвʼязати цю проблему, OpenTelemetry зберігає відрізок у Контексті. Цей документ описує API контексту OpenTelemetry для JavaScript та як його використовувати.

Більше інформації:

- [Специфікація контексту](/docs/specs/otel/context/)
- [Довідка API контексту](https://open-telemetry.github.io/opentelemetry-js/classes/_opentelemetry_api._opentelemetry_api.ContextAPI.html)

## Менеджер контексту {#context-manager}

API контексту залежить від менеджера контексту для роботи. Приклади в цьому документі припускають, що ви вже налаштували менеджера контексту. Зазвичай менеджер контексту надається вашим SDK, однак його можна зареєструвати безпосередньо ось так:

```typescript
import * as api from '@opentelemetry/api';
import { AsyncHooksContextManager } from '@opentelemetry/context-async-hooks';

const contextManager = new AsyncHooksContextManager();
contextManager.enable();
api.context.setGlobalContextManager(contextManager);
```

## Кореневий контекст {#root-context}

`ROOT_CONTEXT` — це порожній контекст. Якщо жоден контекст не активний, активним є `ROOT_CONTEXT`. Активний контекст пояснюється нижче [Активний контекст](#active-context).

## Ключі контексту {#context-keys}

Записи контексту є парами ключ-значення. Ключі можна створити, викликавши `api.createContextKey(description)`.

```typescript
import * as api from '@opentelemetry/api';

const key1 = api.createContextKey('Мій перший ключ');
const key2 = api.createContextKey('Мій другий ключ');
```

## Основні операції {#basic-operations}

### Отримати запис {#get-entry}

Записи доступні за допомогою методу `context.getValue(key)`.

```typescript
import * as api from '@opentelemetry/api';

const key = api.createContextKey('якийсь ключ');
// ROOT_CONTEXT - це порожній контекст
const ctx = api.ROOT_CONTEXT;

const value = ctx.getValue(key);
```

### Встановити запис {#set-entry}

Записи створюються за допомогою методу `context.setValue(key, value)`. Встановлення запису контексту створює новий контекст з усіма записами попереднього контексту, але з новим записом. Встановлення запису контексту не змінює попередній контекст.

```typescript
import * as api from '@opentelemetry/api';

const key = api.createContextKey('якийсь ключ');
const ctx = api.ROOT_CONTEXT;

// додати новий запис
const ctx2 = ctx.setValue(key, 'контекст 2');

// ctx2 містить новий запис
console.log(ctx2.getValue(key)); // "контекст 2"

// ctx не змінено
console.log(ctx.getValue(key)); // undefined
```

### Видалити запис {#delete-entry}

Записи видаляються за допомогою виклику `context.deleteValue(key)`. Видалення запису контексту створює новий контекст з усіма записами попереднього контексту, але без запису, ідентифікованого ключем. Видалення запису контексту не змінює попередній контекст.

```typescript
import * as api from '@opentelemetry/api';

const key = api.createContextKey('якийсь ключ');
const ctx = api.ROOT_CONTEXT;
const ctx2 = ctx.setValue(key, 'контекст 2');

// видалити запис
const ctx3 = ctx2.deleteValue(key);

// ctx3 не містить запису
console.log(ctx3.getValue(key)); // undefined

// ctx2 не змінено
console.log(ctx2.getValue(key)); // "контекст 2"
// ctx не змінено
console.log(ctx.getValue(key)); // undefined
```

## Активний контекст {#active-context}

**ВАЖЛИВО**: Припускаємо, що ви налаштували Менеджер Контексту. Без нього, `api.context.active()` _ЗАВЖДИ_ поверне `ROOT_CONTEXT`.

Активний контекст — це контекст, який повертається `api.context.active()`. Обʼєкт контексту містить записи, які дозволяють компонентам трасування, що обробляють один потік виконання, спілкуватися один з одним і забезпечувати успішне створення трасування. Наприклад, коли створюється відрізок, він може бути доданий до контексту. Пізніше, коли створюється інший відрізок, він може використовувати відрізок з контексту як свій батьківський відрізок. Це досягається за допомогою механізмів, таких як [async_hooks](https://nodejs.org/api/async_hooks.html) або [AsyncLocalStorage](https://nodejs.org/api/async_context.html#async_context_class_asynclocalstorage) у Node.js, або [zone.js](https://github.com/angular/angular/tree/main/packages/zone.js) у вебі для передачі контексту через один потік виконання. Якщо жоден контекст не активний, повертається `ROOT_CONTEXT`, який є просто порожнім обʼєктом контексту.

### Отримати активний контекст {#get-active-context}

Активний контекст — це контекст, який повертається `api.context.active()`.

```typescript
import * as api from '@opentelemetry/api';

// Повертає активний контекст
// Якщо жоден контекст не активний, повертається ROOT_CONTEXT
const ctx = api.context.active();
```

### Встановити активний контекст {#set-active-context}

Контекст може бути зроблений активним за допомогою `api.context.with(ctx, callback)`. Під час виконання `callback`, контекст, переданий до `with`, буде повернутий `context.active`.

```typescript
import * as api from '@opentelemetry/api';

const key = api.createContextKey('Ключ для зберігання значення');
const ctx = api.context.active();

api.context.with(ctx.setValue(key, 'контекст 2'), async () => {
  // "контекст 2" активний
  console.log(api.context.active().getValue(key)); // "контекст 2"
});
```

Значення, яке повертається `api.context.with(context, callback)`, є значенням, яке повертається зворотним викликом. Зворотний виклик завжди викликається синхронно.

```typescript
import * as api from '@opentelemetry/api';

const name = await api.context.with(api.context.active(), async () => {
  const row = await db.getSomeValue();
  return row['name'];
});

console.log(name); // імʼя, повернене з бази даних
```

Виконання активного контексту може бути вкладеним.

```typescript
import * as api from '@opentelemetry/api';

const key = api.createContextKey('Ключ для зберігання значення');
const ctx = api.context.active();

// Жоден контекст не активний
console.log(api.context.active().getValue(key)); // undefined

api.context.with(ctx.setValue(key, 'контекст 2'), () => {
  // "контекст 2" активний
  console.log(api.context.active().getValue(key)); // "контекст 2"
  api.context.with(ctx.setValue(key, 'контекст 3'), () => {
    // "контекст 3" активний
    console.log(api.context.active().getValue(key)); // "контекст 3"
  });
  // "контекст 2" активний
  console.log(api.context.active().getValue(key)); // "контекст 2"
});

// Жоден контекст не активний
console.log(api.context.active().getValue(key)); // undefined
```

### Приклад {#example}

Цей складніший приклад ілюструє, як контекст не змінюється, але створюються нові обʼєкти контексту.

```typescript
import * as api from '@opentelemetry/api';

const key = api.createContextKey('Ключ для зберігання значення');

const ctx = api.context.active(); // Повертає ROOT_CONTEXT, коли жоден контекст не активний
const ctx2 = ctx.setValue(key, 'контекст 2'); // не змінює ctx

console.log(ctx.getValue(key)); //? undefined
console.log(ctx2.getValue(key)); //? "контекст 2"

const ret = api.context.with(ctx2, () => {
  const ctx3 = api.context.active().setValue(key, 'контекст 3');

  console.log(api.context.active().getValue(key)); //? "контекст 2"
  console.log(ctx.getValue(key)); //? undefined
  console.log(ctx2.getValue(key)); //? "контекст 2"
  console.log(ctx3.getValue(key)); //? "контекст 3"

  api.context.with(ctx3, () => {
    console.log(api.context.active().getValue(key)); //? "контекст 3"
  });
  console.log(api.context.active().getValue(key)); //? "контекст 2"

  return 'значення, що повертається';
});

// Значення, яке повертається зворотним викликом, повертається викликачеві
console.log(ret); //? "значення, що повертається"
```
