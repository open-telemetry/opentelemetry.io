---
title: Створення розширення автентифікатора
weight: 40
aliases: [/docs/collector/custom-auth/]
default_lang_commit: e05fefe6c9f7d8b159d9a9a95128098c646c78c4
cSpell:ignore: configauth oidc
---

OpenTelemetry Collector дозволяє підключати приймачі та експортери до автентифікаторів, забезпечуючи спосіб автентифікації вхідних зʼєднань на стороні приймача, а також додавання даних автентифікації до вихідних запитів на стороні експортера.

Цей механізм реалізовано на основі [розширень][extensions], і цей документ допоможе вам у створенні власних автентифікаторів. Якщо ви шукаєте документацію про те, як використовувати поточний автентифікатор, зверніться до сторінки Початок роботи та документації вашого автентифікатора. Ви можете знайти список наявних автентифікаторів у реєстрі цього вебсайту.

Використовуйте цей посібник для загальних вказівок щодо створення власного автентифікатора та зверніться до актуального [API Reference Guide](https://pkg.go.dev/go.opentelemetry.io/collector/config/configauth) для фактичної семантики кожного типу та функції.

Якщо вам потрібна допомога, приєднуйтесь до простору [#opentelemetry-collector](https://cloud-native.slack.com/archives/C01N6P7KR6W) у [CNCF Slack](https://slack.cncf.io).

## Архітектура {#architecture}

[Автентифікатори][authenticators] є звичайними розширеннями, які також задовольняють один або більше інтерфейсів, повʼязаних з механізмом автентифікації. [Серверні автентифікатори][sa] використовуються з приймачами та можуть перехоплювати HTTP та gRPC запити, тоді як клієнтські автентифікатори використовуються з експортерами, здатні додавати дані автентифікації до HTTP та gRPC запитів. Можливо, щоб автентифікатори реалізували обидва інтерфейси одночасно, дозволяючи одному екземпляру розширення використовуватися як для вхідних, так і для вихідних запитів. Зверніть увагу, що користувачі все ще можуть захотіти мати різні автентифікатори для вхідних та вихідних запитів, тому не робіть ваш автентифікатор обовʼязковим для використання на обох кінцях.

Як тільки розширення автентифікатора буде доступне в дистрибутиві колектора, на нього можна буде посилатися у конфігураційному файлі як на звичайне розширення:

```yaml
extensions:
  oidc:

receivers:
processors:
exporters:

service:
  extensions:
    - oidc
  pipelines:
    traces:
      receivers: []
      processors: []
      exporters: []
```

Однак, щоб автентифікатор був активним, компонент-споживач повинен посилатися на нього. Наступний приклад показує те саме розширення, що й вище, тепер використовується приймачем з назвою `otlp/auth`:

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

Коли потрібно кілька екземплярів даного автентифікатора, вони можуть мати різні назви:

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

[Серверний автентифікатор][sa] — це, по суті, розширення з функцією `Authenticate`, яка отримує заголовки корисного навантаження як параметр. Якщо автентифікатор може автентифікувати вхідне зʼєднання, він повинен повернути помилку `nil`, або конкретну помилку, якщо не може. Як розширення, автентифікатор повинен переконатися, що ініціалізує всі необхідні ресурси під час фази [`Start`](https://pkg.go.dev/go.opentelemetry.io/collector/component#Component), і очікується, що він очистить їх під час фази `Shutdown`.

Виклик `Authenticate` є частиною гарячого шляху для вхідних запитів і буде блокувати конвеєр, тому переконайтеся, що правильно обробляєте будь-які блокуючі операції, які вам потрібно виконати. Конкретно, дотримуйтесь дедлайну, встановленого контекстом, якщо він наданий. Також переконайтеся, що додали достатньо спостережуваності до вашого розширення, особливо у вигляді метрик та трейсів, щоб користувачі могли налаштувати систему сповіщень у разі підвищення рівня помилок і могли відстежувати конкретні збої.

### Клієнтські автентифікатори {#client-authenticators}

*Клієнтський автентифікатор* — це той, який реалізує один або більше інтерфейсів визначених в [клієнтських автентифікаторах][client authenticators].

Подібно до серверних автентифікаторів, вони є, по суті, розширеннями з додатковими функціями, кожна з яких отримує обʼєкт, який дає автентифікатору можливість вставити дані автентифікації. Наприклад, HTTP клієнтський автентифікатор надає [`http.RoundTripper`](https://pkg.go.dev/net/http#RoundTripper), тоді як gRPC клієнтський автентифікатор може створити [`credentials.PerRPCCredentials`](https://pkg.go.dev/google.golang.org/grpc/credentials#PerRPCCredentials).

## Додавання власного автентифікатора до дистрибутиву {#adding-your-custom-authenticator-to-a-distribution}

Власні автентифікатори повинні бути частиною того ж бінарного файлу, що й основний колектор. При створенні власного автентифікатора, вам, ймовірно, доведеться створити власний дистрибутив або надати засоби для ваших користувачів, щоб використовувати ваше розширення як частину їхніх власних дистрибутивів. На щастя, власний дистрибутив можна зробити за допомогою утиліти [OpenTelemetry Collector Builder][builder].

[authenticators]: https://pkg.go.dev/go.opentelemetry.io/collector/config/configauth
[builder]: https://github.com/open-telemetry/opentelemetry-collector/tree/main/cmd/builder
[client authenticators]: https://pkg.go.dev/go.opentelemetry.io/collector/config/configauth#client-authenticators
[extensions]: ../../configuration/#extensions
[sa]: https://pkg.go.dev/go.opentelemetry.io/collector/config/configauth#server-authenticators
