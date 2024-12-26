---
title: Сервіс Реклами
linkTitle: Реклама
aliases: [adservice]
default_lang_commit: e05fefe6c9f7d8b159d9a9a95128098c646c78c4
---

Цей сервіс визначає відповідну рекламу для показу користувачам на основі ключів контексту. Реклама буде для продуктів, доступних у магазині.

[Сирці сервісу реклами](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/ad/)

## Автоматична інструменталізація {#auto-instrumentation}

Цей сервіс використовує агент OpenTelemetry Java для автоматичної інструменталізації бібліотек, таких як gRPC, і для налаштування SDK OpenTelemetry. Агент передається в процес за допомогою аргументу командного рядка `-javaagent`. Аргументи командного рядка додаються через `JAVA_TOOL_OPTIONS` у `Dockerfile` і використовуються під час автоматично згенерованого скрипту запуску Gradle.

```dockerfile
ENV JAVA_TOOL_OPTIONS=-javaagent:/app/opentelemetry-javaagent.jar
```

## Трейси {#traces}

### Додавання атрибутів до автоматично інструментованих відрізків {#add-attributes-to-auto-instrumented-spans}

Під час виконання автоматично інструментованого коду ви можете отримати поточний відрізок з контексту.

```java
Span span = Span.current();
```

Додавання атрибутів до відрізка здійснюється за допомогою `setAttribute` на обʼєкті відрізка. У функції `getAds` до відрізка додається кілька атрибутів.

```java
span.setAttribute("app.ads.contextKeys", req.getContextKeysList().toString());
span.setAttribute("app.ads.contextKeys.count", req.getContextKeysCount());
```

### Додавання подій до відрізка {#add-span-events}

Додавання події до відрізка здійснюється за допомогою `addEvent` на обʼєкті відрізка. У функції `getAds` подія з атрибутом додається, коли виникає помилка.

```java
span.addEvent("Error", Attributes.of(AttributeKey.stringKey("exception.message"), e.getMessage()));
```

### Встановлення статусу відрізка {#setting-span-status}

Якщо результат операції є помилкою, статус відрізка слід встановити відповідно за допомогою `setStatus` на обʼєкті відрізка. У функції `getAds` статус відрізка встановлюється, коли виникає помилка.

```java
span.setStatus(StatusCode.ERROR);
```

### Створення нових відрізків {#create-new-spans}

Нові відрізки можна створити та запустити за допомогою `Tracer.spanBuilder("spanName").startSpan()`. Новостворені відрізки слід встановити в контекст за допомогою `Span.makeCurrent()`. Функція `getRandomAds` створить новий відрізок, встановить його в контекст, виконає операцію і, нарешті, завершить відрізок.

```java
// створити та запустити новий відрізок вручну
Tracer tracer = GlobalOpenTelemetry.getTracer("ad");
Span span = tracer.spanBuilder("getRandomAds").startSpan();

// помістити відрізок у контекст, щоб якщо будь-який дочірній відрізок буде запущений, батьківський відрізок буде встановлений правильно
try (Scope ignored = span.makeCurrent()) {

  Collection<Ad> allAds = adsMap.values();
  for (int i = 0; i < MAX_ADS_TO_SERVE; i++) {
    ads.add(Iterables.get(allAds, random.nextInt(allAds.size())));
  }
  span.setAttribute("app.ads.count", ads.size());

} finally {
  span.end();
}
```

## Метрики {#metrics}

### Ініціалізація метрик {#initializing-metrics}

Подібно до створення відрізків, першим кроком у створенні метрик є ініціалізація екземпляра `Meter`, наприклад, `GlobalOpenTelemetry.getMeter("ad")`. Звідти, використовуйте різні методи побудови, доступні на екземплярі `Meter`, щоб створити бажаний інструмент метрики, наприклад:

```java
meter
  .counterBuilder("app.ads.ad_requests")
  .setDescription("Рахує запити реклами за типом запиту та відповіді")
  .build();
```

### Поточні метрики {#current-metrics-produced}

Зверніть увагу, що всі назви метрик нижче зʼявляються в Prometheus/Grafana з перетвореними символами `.` на `_`.

#### Власні метрики {#custom-metrics}

Наразі доступні такі власні метрики користувача:

- `app.ads.ad_requests`: Лічильник запитів на рекламу з вимірами, що описують, чи був запит цільовим за ключами контексту чи ні, і чи була відповідь цільовою або випадковою рекламою.

#### Автоматично інструментовані метрики {#auto-instrumented-metrics}

Для застосунку доступні такі автоматично інструментовані метрики:

- [Метрики часу виконання для JVM](/docs/specs/semconv/runtime/jvm-metrics/).
- [Метрики затримки для RPC](/docs/specs/semconv/rpc/rpc-metrics/#rpc-server)

## Логи {#logs}

Сервіс Реклами використовує Log4J, який автоматично налаштовується агентом OTel Java.

Він включає контекст трейсу в записи логів, що дозволяє кореляцію логів з трейсами.
