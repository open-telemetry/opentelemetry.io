---
title: Створення розширення автентифікатора
linkTitle: Автентифікатор
weight: 100
aliases:
  - /docs/collector/custom-auth
  - /docs/collector/building/authenticator-extension
default_lang_commit: 5f551752635886a0d2d6b2a83e5a36866ca1b5f1
cSpell:ignore: configauth oidc
---

OpenTelemetry Collector дозволяє підключати приймачі та експортери до автентифікаторів, щоб ви могли автентифікувати вхідні зʼєднання на стороні приймача та додавати дані автентифікації до вихідних запитів на стороні експортера.

Автентифікатори реалізуються за допомогою [розширень][extensions]. Цей документ містить вказівки щодо реалізації власних автентифікаторів. Якщо ви хочете дізнатися, як використовувати наявний автентифікатор, ознайомтеся з документацією для цього конкретного автентифікатора. Перелік доступних автентифікаторів можна знайти в [реєстрі](/ecosystem/registry/) на цьому вебсайті.

Використовуйте цей посібник для отримання загальних вказівок щодо створення власного автентифікатора, а також
ознайомтеся з [Довідником API](https://pkg.go.dev/go.opentelemetry.io/collector/config/configauth) для ознайомлення з семантикою кожного типу та функції.

Якщо вам потрібна допомога, приєднайтеся до каналу [#opentelemetry-collector-dev](https://cloud-native.slack.com/archives/C07CCCMRXBK) у [робочому просторі CNCF Slack](https://slack.cncf.io).

## Архітектура {#architecture}

[Автентифікатори][authenticators] в OpenTelemetry подібні до будь-яких інших розширень, але вони також повинні реалізовувати один або кілька специфічних інтерфейсів, які визначають, як виконується автентифікація (наприклад, автентифікація HTTP- або gRPC-запитів). Використовуйте [серверні автентифікатори][sa] з приймачами для перехоплення HTTP- та gRPC-запитів. Використовуйте клієнтські автентифікатори з експортерами для додавання даних автентифікації до HTTP- та gRPC-запитів. Автентифікатори також можуть реалізовувати обидва інтерфейси одночасно, що дозволяє одному екземпляру розширення обробляти як вхідні, так і вихідні запити.

Як тільки розширення автентифікатора стає доступним у дистрибутиві Collector, ви можете посилатися на нього у файлі конфігурації так само, як і на інші розширення. Однак автентифікатор є ефективним лише тоді, коли на нього посилається компонент-споживач. Наступна конфігурація показує приймач з назвою `otlp/auth`, який використовує розширення автентифікатора `oidc`:

```yaml
extensions:
  oidc:

receivers:
  otlp/auth:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
        auth:
          authenticator: oidc

processors:
exporters:

service:
  extensions:
    - oidc
  pipelines:
    traces:
      receivers:
        - otlp/auth
      processors: []
      exporters: []
```

Якщо вам потрібно кілька екземплярів автентифікатора, надайте їм різні імена:

```yaml
extensions:
  oidc/some-provider:
  oidc/another-provider:

receivers:
  otlp/auth:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
        auth:
          authenticator: oidc/some-provider

processors:
exporters:

service:
  extensions:
    - oidc/some-provider
    - oidc/another-provider
  pipelines:
    traces:
      receivers:
        - otlp/auth
      processors: []
      exporters: []
```

### Серверні автентифікатори {#server-authenticators}

[Серверний автентифікатор][sa] — це розширення з методом `Authenticate`. Ця функція викликається щоразу, коли надходить запит, і перевіряє заголовки запиту для його автентифікації. Якщо автентифікатор вирішує, що запит є дійсним, він повертає помилку `nil`. Якщо запит не є дійсним, він повертає помилку з поясненням причини.

Оскільки це розширення, автентифікатор повинен налаштувати необхідні ресурси (такі як ключі, клієнти або кеші) при [`Start`](https://pkg.go.dev/go.opentelemetry.io/collector/component#Component) і очистити все при `Shutdown`.

Функція `Authenticate` виконується для кожного вхідного запиту, і конвеєр не може рухатися далі, поки ця функція не завершиться. Через це ваш автентифікатор повинен уникати повільної або непотрібної роботи. Якщо `context` встановлює кінцевий термін, переконайтеся, що ваш код дотримується його, щоб конвеєр не затримувався і не залишався в підвішеному стані.

Ви також повинні додати хорошу спостережуваність до вашого автентифікатора, особливо метрики та трасування. Це допомагає користувачам налаштовувати сповіщення, якщо кількість помилок починає зростати, і полегшує їм усунення проблем з автентифікацією.

### Автентифікатори клієнта {#client-authenticators}

[Клієнтські автентифікатори][client authenticators] — це розширення з додатковими функціями, які реалізують один або кілька визначених інтерфейсів. Кожен автентифікатор отримує обʼєкт, який дозволяє йому вводити дані автентифікації. Наприклад, клієнтський автентифікатор HTTP надає [`http.RoundTripper`](https://pkg.go.dev/net/http#RoundTripper), а клієнтський автентифікатор gRPC може створювати [`credentials.PerRPCCredentials`](https://pkg.go.dev/google.golang.org/grpc/credentials#PerRPCCredentials).

## Додайте свій власний автентифікатор у дистрибутив {#add-your-custom-authenticator-to-a-distribution}

Власні автентифікатори повинні бути частиною того самого бінарного файлу, що й сам колектор. При створенні власного автентифікатора у вас є два варіанти:

- Ви можете створити власний дистрибутив колектора за допомогою [OpenTelemetry Collector Builder][builder]
- Ви можете надати користувачам спосіб, наприклад, опублікувати модуль Go, щоб вони могли додати ваше розширення до своїх дистрибутивів.

[authenticators]: https://pkg.go.dev/go.opentelemetry.io/collector/config/configauth
[builder]: https://github.com/open-telemetry/opentelemetry-collector/tree/main/cmd/builder
[client authenticators]: https://pkg.go.dev/go.opentelemetry.io/collector/config/configauth#client-authenticators
[extensions]: /docs/collector/configuration/#extensions
[sa]: https://pkg.go.dev/go.opentelemetry.io/collector/config/configauth#server-authenticators
