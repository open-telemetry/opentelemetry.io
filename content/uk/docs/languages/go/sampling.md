---
title: Семплінг
weight: 80
default_lang_commit: 5f551752635886a0d2d6b2a83e5a36866ca1b5f1
---

[Семплінг](/docs/concepts/sampling/) — це процес, який обмежує кількість відрізків, що генеруються системою. Семплер, який ви повинні використовувати, залежить від ваших конкретних потреб, але загалом ви повинні приймати рішення на початку трасування і дозволяти рішенню про семплінг поширюватися на інші сервіси.

[`Sampler`](https://pkg.go.dev/go.opentelemetry.io/otel/sdk/trace#Sampler) можна встановити на постачальника трасувальника за допомогою опції [`WithSampler`](https://pkg.go.dev/go.opentelemetry.io/otel/sdk/trace#WithSampler), як показано нижче:

```go
provider := trace.NewTracerProvider(
    trace.WithSampler(trace.AlwaysSample()),
)
```

[`AlwaysSample`](https://pkg.go.dev/go.opentelemetry.io/otel/sdk/trace#AlwaysSample) та [`NeverSample`](https://pkg.go.dev/go.opentelemetry.io/otel/sdk/trace#NeverSample) є самопояснювальними значеннями. `AlwaysSample` означає, що кожен відрізок семплюється, тоді як `NeverSample` означає, що жоден відрізок не семплюється. Коли ви тільки починаєте, або в середовищі розробки, використовуйте `AlwaysSample`.

Інші семплери включають:

- [`TraceIDRatioBased`](https://pkg.go.dev/go.opentelemetry.io/otel/sdk/trace#TraceIDRatioBased), який семплює частину відрізків, на основі частки, заданої семплеру. Якщо ви встановите .5, половина всіх відрізків буде семплюватися.
- [`ParentBased`](https://pkg.go.dev/go.opentelemetry.io/otel/sdk/trace#ParentBased), це декоратор семплера, який поводиться по-різному, залежно від батьківського відрізка. Якщо відрізок не має батька, використовується декорований семплер для прийняття рішення. Типово, `ParentBased` семплює відрізки, які мають батьків, що були семпльовані, і не семплює відрізки, чиї батьки не були семпльовані.

Стандартно, постачальник трасувальника використовує семплер `ParentBased` з семплером `AlwaysSample`.

У промисловому середовищі розгляньте можливість використання семплера `ParentBased` з семплером `TraceIDRatioBased`.

## Власні семплери {#custom-samplers}

Якщо вбудовані семплери не відповідають вашим потребам, ви можете створити власний семплер, реалізувавши інтерфейс [`Sampler`](https://pkg.go.dev/go.opentelemetry.io/otel/sdk/trace#Sampler). Власний семплер повинен реалізовувати два методи:

- `ShouldSample(parameters SamplingParameters) SamplingResult`: приймає рішення про вибірку на основі наданих параметрів.
- `Description() string`: повертає опис семплера.

### Збереження стану трасування {#preserving-tracestate}

{{% alert title="Критично: Зберегти стан трасування" color="warning" %}}

При впровадженні власного семплера ви **повинні** зберегти стан трасування батьківського елемента у вашому `SamplingResult`. Невиконання цієї вимоги порушує поширення контексту в розподілених системах, які покладаються на стан трасування для передачі даних трасування, специфічних для постачальника або застосунку.

Завжди видобувайте стан трасування з контексту батьківського елемента:

```go
psc := trace.SpanContextFromContext(parameters.ParentContext)
// Використовуйте psc.TraceState() у вашому SamplingResult
```

{{% /alert %}}

### Приклад {#example}

Наступний приклад демонструє власний семплер, який відбирає зразки на основі значення атрибута, правильно зберігаючи стан трасування:

```go
package main

import (
    "context"

    "go.opentelemetry.io/otel/attribute"
    sdktrace "go.opentelemetry.io/otel/sdk/trace"
    "go.opentelemetry.io/otel/trace"
)

// AttributeBasedSampler відбирає відрізки на основі значення атрибута.
// Він завжди відбирає відрізки з атрибутом "high.priority", встановленим на true.
type AttributeBasedSampler struct {
    fallback sdktrace.Sampler
}

// NewAttributeBasedSampler створює новий AttributeBasedSampler.
func NewAttributeBasedSampler(fallback sdktrace.Sampler) *AttributeBasedSampler {
    return &AttributeBasedSampler{fallback: fallback}
}

func (s *AttributeBasedSampler) ShouldSample(p sdktrace.SamplingParameters) sdktrace.SamplingResult {
    // Завжди отримуйте контекст батьківського відрізка, щоб отримати стан трасування.
    psc := trace.SpanContextFromContext(p.ParentContext)

    // Перевірте, чи є атрибути, що вказують на високий пріоритет.
    for _, attr := range p.Attributes {
        if attr.Key == "high.priority" && attr.Value.AsBool() {
            return sdktrace.SamplingResult{
                Decision:   sdktrace.RecordAndSample,
                Attributes: p.Attributes,
                // Критично: збереження стану трасування батьківського елемента
                Tracestate: psc.TraceState(),
            }
        }
    }

    // Для інших відрізків поверніться до стандартного (запасного) семплера.
    result := s.fallback.ShouldSample(p)

    // Переконайтеся, що стан трасування зберігається навіть при використанні запасного варіанту.
    // Вбудовані семплери вже обробляють це, але перевіряти це є доцільним.
    return sdktrace.SamplingResult{
        Decision:   result.Decision,
        Attributes: result.Attributes,
        Tracestate: psc.TraceState(),
    }
}

func (s *AttributeBasedSampler) Description() string {
    return "AttributeBasedSampler"
}
```

### Використання власного семплера {#using-your-custom-sampler}

Ви можете використовувати власний семплер із провайдером трасування:

```go
sampler := NewAttributeBasedSampler(sdktrace.TraceIDRatioBased(0.1))

provider := sdktrace.NewTracerProvider(
    sdktrace.WithSampler(sampler),
)
```

Ви також можете скомпонувати його за допомогою семплера `ParentBased`:

```go
provider := sdktrace.NewTracerProvider(
    sdktrace.WithSampler(
        sdktrace.ParentBased(
            NewAttributeBasedSampler(sdktrace.TraceIDRatioBased(0.1)),
        ),
    ),
)
```

### Додаткові рекомендації {#additional-considerations}

Під час впровадження власних семплерів враховуйте такі моменти:

1. **Ігнорування рішення батьківського семплера**: якщо ви хочете дотримуватися рішень батьківського семплера, оберніть свій семплер у `ParentBased` або вручну перевірте `psc.IsSampled()`.

2. **Важкі обчислення в ShouldSample**: Функція `ShouldSample` викликається синхронно для кожного створення відрізка. Уникайте витратних операцій, таких як мережеві виклики або складні обчислення, які можуть вплинути на продуктивність.
