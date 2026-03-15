---
title: Семплювання
weight: 80
default_lang_commit: e05fefe6c9f7d8b159d9a9a95128098c646c78c4
cSpell:ignore: traceidratiobased
---

[Семплювання](/docs/concepts/sampling/) — це процес, який обмежує кількість трейсів, що генеруються системою. Ruby SDK пропонує кілька [головних семплерів](/docs/concepts/sampling#head-sampling).

## Стандартна поведінка {#default-behavior}

Стандартно, всі відрізки семплюються, і таким чином, 100% трейсів семплюються. Якщо ви не потребуєте керування обсягом даних, не варто налаштовувати семплер.

Зокрема, стандартний семплер є композицією [ParentBased][] та [ALWAYS_ON][], що гарантує, що кореневий відрізок у трейсі завжди семплюється, і що всі дочірні відрізки поважають прапорець семплювання свого пращура для прийняття рішення про семплювання. Це гарантує, що всі відрізки у трейсі стандартно семплюються.

[ParentBased]: https://www.rubydoc.info/gems/opentelemetry-sdk/OpenTelemetry/SDK/Trace/Samplers/ParentBased
[ALWAYS_ON]: https://www.rubydoc.info/gems/opentelemetry-sdk/OpenTelemetry/SDK/Trace/Samplers

## Семплер TraceIdRatioBased {#traceidratiobased-sampler}

Найпоширеніший головний семплер - це семплер [TraceIdRatioBased][]. Він детерміновано семплює відсоток трейсів, який ви передаєте як параметр.

[TraceIdRatioBased]: https://www.rubydoc.info/gems/opentelemetry-sdk/OpenTelemetry/SDK/Trace/Samplers/TraceIdRatioBased

### Змінні середовища {#environment-variables}

Ви можете налаштувати семплер `TraceIdRatioBased` за допомогою змінних середовища:

```shell
export OTEL_TRACES_SAMPLER="traceidratio"
export OTEL_TRACES_SAMPLER_ARG="0.1"
```

Це вказує SDK семплювати відрізки таким чином, щоб лише 10% трейсів експортувалися.

### Налаштування в коді {#configuring-in-code}

Хоча можливо налаштувати семплер `TraceIdRatioBased` в коді, це не рекомендується. Це вимагає вручну налаштувати Tracer Provider з усіма правильними опціями конфігурації, що важко зробити правильно порівняно з використанням `OpenTelemetry::SDK.configure`.
