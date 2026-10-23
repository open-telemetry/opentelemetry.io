---
title: Вибірка
weight: 80
default_lang_commit: 289056956a18cc707ed7fd307303394cc10fadc7
cSpell:ignore: traceidratiobased
---

[Вибірка](/docs/concepts/sampling/) — це процес, який обмежує кількість трейсів, що генеруються системою. Ruby SDK пропонує кілька [головних механізмів вибірки](/docs/concepts/sampling#head-sampling).

## Стандартна поведінка {#default-behavior}

Стандартно, всі відрізки вибираються, і таким чином, 100% трейсів вибираються. Якщо ви не потребуєте керування обсягом даних, не варто налаштовувати механізм вибірки.

Зокрема, стандартний вибірник є композицією [ParentBased][] та [ALWAYS_ON][], що гарантує, що кореневий відрізок у трейсі завжди вибирається, і що всі дочірні відрізки поважають прапорець вибірки свого пращура для прийняття рішення про вибірку. Це гарантує, що всі відрізки у трейсі стандартно вибираються.

[ParentBased]: https://www.rubydoc.info/gems/opentelemetry-sdk/OpenTelemetry/SDK/Trace/Samplers/ParentBased
[ALWAYS_ON]: https://www.rubydoc.info/gems/opentelemetry-sdk/OpenTelemetry/SDK/Trace/Samplers

## Вибірник TraceIdRatioBased {#traceidratiobased-sampler}

Найпоширеніший головний вибірник - це вибірник [TraceIdRatioBased][]. Він детерміновано вибирає відсоток трейсів, який ви передаєте як параметр.

[TraceIdRatioBased]: https://www.rubydoc.info/gems/opentelemetry-sdk/OpenTelemetry/SDK/Trace/Samplers/TraceIdRatioBased

### Змінні середовища {#environment-variables}

Ви можете налаштувати вибірник `TraceIdRatioBased` за допомогою змінних середовища:

```shell
export OTEL_TRACES_SAMPLER="traceidratio"
export OTEL_TRACES_SAMPLER_ARG="0.1"
```

Це вказує SDK вибирати відрізки таким чином, щоб лише 10% трейсів експортувалися.

### Налаштування в коді {#configuring-in-code}

Хоча можливо налаштувати вибірник `TraceIdRatioBased` в коді, це не рекомендується. Це вимагає вручну налаштувати Tracer Provider з усіма правильними опціями конфігурації, що важко зробити правильно порівняно з використанням `OpenTelemetry::SDK.configure`.

## Власні вибірники {#custom-samplers}

Ви можете створити власний [Sampler][], який приймає рішення на основі назви відрізка, атрибута або інших критеріїв ідентифікації. Вибірники є ідеальними, коли інформація, необхідна для прийняття рішення про вибірку, доступна на початку відрізка. Якщо інформація, необхідна для прийняття рішення, недоступна до кінця відрізка, розгляньте можливість використання [Span Processor][span-processor].

Нижче наведено приклад власного класу вибірника, який виключає всі відрізки зі значенням `db.statement` рівним `;`.

Цей запит є поширеним для застосунків, які використовують Active Record та PostgreSQL (гем `pg`) разом. Active Record перевіряє наявність активного зʼєднання з базою даних кожні дві секунди, що виконує запит лише з `;` в інструкції в `pg`. Це може призвести до великої кількості небажаних відрізків.

Коли відрізок відповідає цьому критерію, він відкидається. Коли він не відповідає цьому критерію, рішення про вибірку передається делегованому вибірнику. У цьому випадку делегованим вибірником є `TraceIdRatioBased`.

[Sampler]: https://www.rubydoc.info/gems/opentelemetry-sdk/OpenTelemetry/SDK/Trace/Samplers
[span-processor]: https://www.rubydoc.info/gems/opentelemetry-sdk/OpenTelemetry/SDK/Trace/SpanProcessor

```ruby
class CustomSampler
  def initialize(delegate)
    @delegate = delegate
  end

  def should_sample?(trace_id:, parent_context:, links:, name:, kind:, attributes:)
    if attributes && attributes["db.statement"] == ";"
      OpenTelemetry::SDK::Trace::Samplers::Result.new(
        decision: OpenTelemetry::SDK::Trace::Samplers::Decision::DROP,
        tracestate: OpenTelemetry::Trace.current_span(parent_context).context.tracestate
      )
    else
      @delegate.should_sample?(trace_id: trace_id, parent_context: parent_context,
        links: links, name: name, kind: kind, attributes: attributes)
    end
  end

  def description
    "CustomSampler{#{@delegate.description}}"
  end
end

# Потім, після виклику OpenTelemetry::SDK.configure, ви можете призначити вибірник
# стандартному постачальнику трейсерів.

OpenTelemetry.tracer_provider.sampler = CustomSampler.new(
  OpenTelemetry::SDK::Trace::Samplers.trace_id_ratio_based(0.5))
```
