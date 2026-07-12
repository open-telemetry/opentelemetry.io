---
title: Вибірка
weight: 80
default_lang_commit: e05fefe6c9f7d8b159d9a9a95128098c646c78c4
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
