---
title: Семплінг
weight: 80
default_lang_commit: e05fefe6c9f7d8b159d9a9a95128098c646c78c4
---

[Семплінг](/docs/concepts/sampling/) — це процес, який обмежує кількість відрізків, що генеруються системою. Точний семплер, який ви повинні використовувати, залежить від ваших конкретних потреб, але загалом ви повинні приймати рішення на початку трасування і дозволяти рішенню про семплінг поширюватися на інші сервіси.

[`Sampler`](https://pkg.go.dev/go.opentelemetry.io/otel/sdk/trace#Sampler) можна встановити на постачальника трасувальника за допомогою опції [`WithSampler`](https://pkg.go.dev/go.opentelemetry.io/otel/sdk/trace#WithSampler), як показано нижче:

```go
provider := trace.NewTracerProvider(
    trace.WithSampler(trace.AlwaysSample()),
)
```

[`AlwaysSample`](https://pkg.go.dev/go.opentelemetry.io/otel/sdk/trace#AlwaysSample) та [`NeverSample`](https://pkg.go.dev/go.opentelemetry.io/otel/sdk/trace#NeverSample) є самопояснювальними значеннями. `AlwaysSample` означає, що кожен відрізок семплюється, тоді як `NeverSample` означає, що жоден відрізок не семплюється. Коли ви тільки починаєте, або в середовищі розробки, використовуйте `AlwaysSample`.

Інші семплери включають:

- [`TraceIDRatioBased`](https://pkg.go.dev/go.opentelemetry.io/otel/sdk/trace#TraceIDRatioBased), який семплює частину відрізків, на основі частки, заданої семплеру. Якщо ви встановите .5, половина всіх відрізків буде семплюватися.
- [`ParentBased`](https://pkg.go.dev/go.opentelemetry.io/otel/sdk/trace#ParentBased), це декоратор семплера, який поводиться по-різному, залежно від батьківського відрізка. Якщо відрізок не має батька, використовується декорований семплер для прийняття рішення про семплінг на основі батьківського відрізку. Типово, `ParentBased` семплює відрізки, які мають батьків, що були семпльовані, і не семплює відрізки, чиї батьки не були семпльовані.

Стандартно, постачальник трасувальника використовує семплер `ParentBased` з семплером `AlwaysSample`.

У промисловому середовищі розгляньте можливість використання семплера `ParentBased` з семплером `TraceIDRatioBased`.
