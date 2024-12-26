---
default_lang_commit: 5489ba34bff91356aa2c501cd55f07eeb30cc355
---

Надсилайте телеметрію до [OpenTelemetry Collector](/docs/collector/), щоб переконатися, що вона експортується правильно. Використання Collector у виробничих середовищах є найкращою практикою. Щоб візуалізувати вашу телеметрію, експортуйте її до бекенду, такого як [Jaeger](https://jaegertracing.io/), [Zipkin](https://zipkin.io/), [Prometheus](https://prometheus.io/) або [бекенд, специфічний для постачальника](/ecosystem/vendors/).

{{ if $name }}

## Доступні експортери {#available-exporters}

Реєстр містить [список експортерів для {{ $name }}][reg].

{{ end }}
{{ if not $name }}

Реєстр містить [список експортерів для конкретних мов][reg].

{{ end }}

Серед експортерів, експортери [OpenTelemetry Protocol (OTLP)][OTLP] розроблені з урахуванням моделі даних OpenTelemetry, що передають дані OTel без втрати інформації. Крім того, багато інструментів, які працюють з телеметричними даними, підтримують OTLP (таких як [Prometheus], [Jaeger] і більшість [постачальників][vendors]), надаючи вам високий ступінь гнучкості, коли це потрібно. Щоб дізнатися більше про OTLP, дивіться [Специфікацію OTLP][OTLP].

[Jaeger]: /blog/2022/jaeger-native-otlp/
[OTLP]: /docs/specs/otlp/
[Prometheus]: https://prometheus.io/docs/prometheus/2.55/feature_flags/#otlp-receiver
[reg]: </ecosystem/registry/?component=exporter&language={{ $lang }}>
[vendors]: /ecosystem/vendors/

{{ if $name }}

Ця сторінка охоплює основні експортери OpenTelemetry {{ $name }} та як їх налаштувати.

{{ end }}

{{ if $zeroConfigPageExists }}

> [!NOTE]
>
> Якщо ви використовуєте [інструментування без коду](</docs/zero-code/{{ $langIdAsPath }}>), ви можете дізнатися як налаштувати експортери, дотримуючись [Посібника з налаштування](</docs/zero-code/{{ $langIdAsPath }}/configuration/>).

{{ end }}

{{ if $supportsOTLP }}

## OTLP

### Налаштування Collector {#collector-setup}

> [!NOTE]
>
> Якщо у вас вже налаштований OTLP collector або бекенд, ви можете пропустити цей розділ і [налаштувати залежності OTLP експортерів](#otlp-dependencies) для вашого застосунку.

Щоб спробувати та перевірити ваші OTLP експортери, ви можете запустити collector у docker контейнері, який записує телеметрію безпосередньо в консоль.

У порожній теці створіть файл з назвою `collector-config.yaml` з наступним вмістом:

```yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
      http:
        endpoint: 0.0.0.0:4318
exporters:
  debug:
    verbosity: detailed
service:
  pipelines:
    traces:
      receivers: [otlp]
      exporters: [debug]
    metrics:
      receivers: [otlp]
      exporters: [debug]
    logs:
      receivers: [otlp]
      exporters: [debug]
```

Тепер запустіть collector у docker контейнері:

```shell
docker run -p 4317:4317 -p 4318:4318 --rm -v $(pwd)/collector-config.yaml:/etc/otelcol/config.yaml otel/opentelemetry-collector
```

Цей collector тепер може приймати телеметрію через OTLP. Пізніше ви можете [налаштувати collector](/docs/collector/configuration), щоб надсилати вашу телеметрію до вашого бекенду для спостереження.

{{ end }}
