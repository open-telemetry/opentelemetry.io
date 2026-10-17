---
title: Вибірка
weight: 80
default_lang_commit: 311e7819e9eacf9d8b6d250bbdee98c018ea232e
---

[Вибірка](/docs/concepts/sampling/) — це процес, який обмежує кількість відрізків, що генеруються системою. Механізм вибірки, який ви повинні використовувати, залежить від ваших конкретних потреб, але загалом ви повинні приймати рішення на початку трасування і дозволяти рішенню про вибірку поширюватися на інші сервіси.

[`Sampler`][] можна встановити на постачальника трасувальника за допомогою опції [`WithSampler`](https://pkg.go.dev/go.opentelemetry.io/otel/sdk/trace#WithSampler), як показано нижче:

```go
provider := trace.NewTracerProvider(
    trace.WithSampler(trace.AlwaysSample()),
)
```

[`AlwaysSample`](https://pkg.go.dev/go.opentelemetry.io/otel/sdk/trace#AlwaysSample) та [`NeverSample`](https://pkg.go.dev/go.opentelemetry.io/otel/sdk/trace#NeverSample) є самопояснювальними значеннями. `AlwaysSample` означає, що кожен відрізок вибирається, тоді як `NeverSample` означає, що жоден відрізок не вибирається. Коли ви тільки починаєте, або в середовищі розробки, використовуйте `AlwaysSample`.

Серед інших механізмі вибірки:

- [`TraceIDRatioBased`](https://pkg.go.dev/go.opentelemetry.io/otel/sdk/trace#TraceIDRatioBased), який вибирає частину відрізків на основі частки, заданої вибірнику. Якщо ви встановите .5, половина всіх відрізків буде вибиратися.
- [`ParentBased`](https://pkg.go.dev/go.opentelemetry.io/otel/sdk/trace#ParentBased), це декоратор вибірника, який поводиться по-різному, залежно від батьківського відрізка. Якщо відрізок не має батька, використовується декорований вибірник для прийняття рішення. Типово, `ParentBased` вибирає відрізки, які мають батьків, що були вибрані, і не вибирає відрізки, чиї батьки не були вибрані.

Стандартно, постачальник трасувальника використовує механізм вибірки `ParentBased` з вибірником `AlwaysSample`.

У промисловому середовищі розгляньте можливість використання вибірника `ParentBased` з вибірником `TraceIDRatioBased`.

## Власні вибірники {#custom-samplers}

Якщо вбудовані вибірники не відповідають вашим потребам, ви можете створити власний вибірник, реалізувавши інтерфейс [`Sampler`][]. Власний вибірник повинен реалізовувати два методи:

- `ShouldSample(parameters SamplingParameters) SamplingResult`: приймає рішення про вибірку на основі наданих параметрів.
- `Description() string`: повертає опис вибірника.

> [!IMPORTANT] Збереження стану трасування батьківського елемента
>
> В `ShouldSample`, ви _повинні_ зберегти стан трасування батьківського елемента у вашому `SamplingResult`. Невиконання цієї вимоги порушує поширення контексту в розподілених системах, які покладаються на стан трасування для передачі даних трасування, специфічних для постачальника або застосунку.
>
> Завжди видобувайте стан трасування з контексту батьківського елемента:
>
> ```go
> psc := trace.SpanContextFromContext(parameters.ParentContext)
> ```
>
> Передайте `psc.TraceState()` при побудові вашого `SamplingResult`.

### Приклад {#example}

Наступний приклад демонструє власний механізм вибірки, який відбирає зразки на основі значення атрибута, правильно зберігаючи стан трасування:

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

    // Для інших відрізків поверніться до стандартного (запасного) вибірника.
    result := s.fallback.ShouldSample(p)

    // Переконайтеся, що стан трасування зберігається навіть при використанні запасного варіанту.
    // Вбудовані вибірники вже обробляють це, але перевіряти це є доцільним.
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

### Використання власного механізму вибірки {#using-your-custom-sampler}

Ви можете використовувати власний механізм вибірки із провайдером трасування:

```go
sampler := NewAttributeBasedSampler(sdktrace.TraceIDRatioBased(0.1))

provider := sdktrace.NewTracerProvider(
    sdktrace.WithSampler(sampler),
)
```

Ви також можете скомпонувати його за допомогою механізму вибірки `ParentBased`:

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

Під час впровадження власних механізмів вибірки враховуйте такі моменти:

1. **Ігнорування рішення батьківського механізму вибірки**: якщо ви хочете дотримуватися рішень батьківського механізму вибірки, оберніть свій механізм вибірки у `ParentBased` або вручну перевірте `psc.IsSampled()`.

2. **Важкі обчислення в ShouldSample**: Функція `ShouldSample` викликається синхронно для кожного створення відрізка. Уникайте витратних операцій, таких як мережеві виклики або складні обчислення, які можуть вплинути на продуктивність.

[`Sampler`]: https://pkg.go.dev/go.opentelemetry.io/otel/sdk/trace#Sampler
