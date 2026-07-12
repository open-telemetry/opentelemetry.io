---
title: Сервіс Реклами
linkTitle: Реклама
aliases: [adservice]
default_lang_commit: 311e7819e9eacf9d8b6d250bbdee98c018ea232e
cSpell:ignore: рефакторингу
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

### Поєднання не-OTel власних метрик (клієнтська бібліотека Prometheus) {#bridging-non-otel-custom-metrics-prometheus-client-library}

Сервіс Реклами також надає невеликий набір власних метрик за допомогою [клієнтської бібліотеки Prometheus для Java](https://github.com/prometheus/client_java), а не OpenTelemetry SDK. Ці метрики доступні на окремій HTTP-точці доступу (`/metrics` на порту `AD_PROMETHEUS_PORT`, зазвичай `9465`) і збираються [приймачем `prometheus`](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/prometheusreceiver) колектора OpenTelemetry, який передає їх у той самий конвеєр, що й метрики OTel SDK:

```java
private static final Counter adsServedCounter =
    Counter.builder()
        .name("demo_ad_served_total")
        .help("Загальна кількість показаної реклами, з міткою за категорією")
        .labelNames("category")
        .register();

HTTPServer prometheusServer =
    HTTPServer.builder().port(prometheusPort).buildAndStart();
```

> [!NOTE]
>
> Це додано навмисно, щоб проілюструвати **типовий патерн під час впровадження OTel**: організації часто вже мають значну інструменталізацію Prometheus, у бібліотеках, сторонніх експортерах або застарілих сервісах, і хочуть передавати ці метрики у власний конвеєр OpenTelemetry без переписування всього з нуля. Приймач `prometheus` колектора є мостом, який уможливлює це.

Конфігурація колектора, яка це забезпечує:

```yaml
receivers:
  prometheus/ad:
    config:
      scrape_configs:
        - job_name: ad
          scrape_interval: 10s
          static_configs:
            - targets: ['ad:${env:AD_PROMETHEUS_PORT}']
```

> [!TIP]
>
> **Рекомендація**: розглядайте це як _перехідний_ патерн. Для нових власних метрик використовуйте OpenTelemetry SDK безпосередньо. Для наявних метрик Prometheus виконуйте поступову міграцію, коли торкаєтесь відповідного коду, або під час цілеспрямованого рефакторингу.
>
> Типові проблеми при змішуванні телеметрії OpenTelemetry та Prometheus:
>
> - **Невідповідність ідентичності**: `service.name` та `service.instance.id` можуть не збігатися в обох конвеєрах.
> - **Подвійні ментальні моделі**: Prometheus та OTel використовують різні концепції (мітки проти атрибутів, різні семантичні конвенції) з окремими API, конвеєрами передачі та потенційно різними правилами збагачення.
> - **Непослідовний код**: змішування викликів клієнтської бібліотеки Prometheus для старих метрик з викликами OTel API для нових залишає код без єдиного ідіоматичного стилю.

### Поточні метрики {#current-metrics-produced}

Зверніть увагу, що всі назви метрик нижче зʼявляються в Prometheus/Grafana з перетвореними символами `.` на `_`.

#### Власні метрики {#custom-metrics}

Наразі доступні такі власні метрики користувача:

- `app.ads.ad_requests` (OpenTelemetry SDK): Лічильник запитів на рекламу з вимірами, що описують, чи був запит цільовим за ключами контексту чи ні, і чи була відповідь цільовою або випадковою рекламою.
- `demo_ad_served_total` (клієнтська бібліотека Prometheus, збирається колектором): Лічильник показів реклами з міткою за `category` (наприклад, `telescopes`, `binoculars`, `random`). Див. [Поєднання не-OTel власних метрик](#bridging-non-otel-custom-metrics-prometheus-client-library) вище.

#### Автоматично інструментовані метрики {#auto-instrumented-metrics}

Для застосунку доступні такі автоматично інструментовані метрики:

- [Метрики часу виконання для JVM](/docs/specs/semconv/runtime/jvm-metrics/).
- [Метрики затримки для RPC](/docs/specs/semconv/rpc/rpc-metrics/#rpc-server)

## Логи {#logs}

Сервіс Реклами використовує Log4J, який автоматично налаштовується агентом OTel Java.

Він включає контекст трейсу в записи логів, що дозволяє кореляцію логів з трейсами.
