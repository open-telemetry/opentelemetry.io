{{/* cSpell:ignore cond */ -}}
Надсилайте телеметрію до [OpenTelemetry Collector](/docs/collector/), щоб переконатися, що вона експортується правильно. Використання Collector у виробничих середовищах є найкращою практикою. Щоб візуалізувати вашу телеметрію, експортуйте її до бекенду, такого як [Jaeger](https://jaegertracing.io/), [Zipkin](https://zipkin.io/), [Prometheus](https://prometheus.io/) або [бекенд, специфічний для постачальника](/ecosystem/vendors/).

{{ $lang := .Get 0 | default "" -}}

{{ $name := "" -}}

{{ if $lang -}}

{{ $name = (index $.Site.Data.instrumentation $lang).name -}}

## Доступні експортери {#available-exporters}

Реєстр містить [список експортерів для {{ $name }}][reg].

{{ else -}}

Реєстр містить [список експортерів для конкретних мов][reg].

{{ end -}}

Серед експортерів, [OpenTelemetry Protocol (OTLP)][OTLP] експортери розроблені з урахуванням моделі даних OpenTelemetry, випускаючи дані OTel без втрати інформації. Крім того, багато інструментів, які працюють з телеметричними даними, підтримують OTLP (таких як [Prometheus], [Jaeger] і більшість [постачальників][vendors]), надаючи вам високий ступінь гнучкості, коли це потрібно. Щоб дізнатися більше про OTLP, дивіться [Специфікацію OTLP][OTLP].

[Jaeger]: /blog/2022/jaeger-native-otlp/
[OTLP]: /docs/specs/otlp/
[Prometheus]:
  https://prometheus.io/docs/prometheus/latest/feature_flags/#otlp-receiver
[vendors]: /ecosystem/vendors/

[reg]: /ecosystem/registry/?component=exporter&language={{ $lang }}

{{ if $name -}}

Ця сторінка охоплює основні експортери OpenTelemetry {{ $name }} та як їх налаштувати.

{{ end -}}

{{ $l := cond (eq $lang "dotnet") "net" $lang }}
{{ with $.Page.GetPage (print "/docs/zero-code/" $l "/configuration" ) }}

<div class="alert alert-info" role="alert"><h4 class="alert-heading">Примітка</h4>

Якщо ви використовуєте [нульовий код інструментування](/docs/zero-code/{{ $l }}), ви можете дізнатися як налаштувати експортери, дотримуючись [Посібника з налаштування](/docs/zero-code/{{ $l }}/configuration/).

</div>

{{ end -}}

{{/*
 нижче список повинен рости, поки всі мови не будуть оновлені до узгодженої структури.
 */ -}}

{{ if in (slice "python" "js" "java" "cpp" "dotnet") $lang -}}

## OTLP

### Налаштування Collector {#collector-setup}

<div class="alert alert-info" role="alert"><h4 class="alert-heading">Примітка</h4>

Якщо у вас вже налаштований OTLP collector або бекенд, ви можете пропустити цей розділ і [налаштувати залежності OTLP експортерів](#otlp-dependencies) для вашого застосунку.

</div>

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

{{ end -}}
