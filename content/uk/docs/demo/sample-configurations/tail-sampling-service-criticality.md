---
title: Вибірка наприкінці з `service.criticality`
linkTitle: Вибірка наприкінці
default_lang_commit: b430165b39cfc929f23d116b193f2916778d458b
---

Цей приклад демонструє, як використовувати атрибут ресурсу [`service.criticality`](/docs/specs/semconv/resource/service/#service) для інтелектуальних рішень щодо вибірки наприкінці в OpenTelemetry Collector.

Демонстраційний застосунок присвоює значення `service.criticality` кожному сервісу, класифікуючи їх за операційною важливістю:

| Критичність | Частота вибірки | Сервіси                                                                                    |
| ----------- | --------------- | ------------------------------------------------------------------------------------------ |
| `critical`  | 100%            | payment, checkout, frontend, frontend-proxy                                                |
| `high`      | 50%             | cart, product-catalog, currency, shipping                                                  |
| `medium`    | 10%             | recommendation, ad, product-reviews, email                                                 |
| `low`       | 1%              | accounting, fraud-detection, image-provider, load-generator, quote, flagd, flagd-ui, Kafka |

## Конфігурація Collector {#collector-configuration}

Щоб увімкнути вибірку наприкінці, додайте наступне до вашого `otelcol-config-extras.yml`:

```yaml
processors:
  tail_sampling:
    decision_wait: 10s
    num_traces: 100000
    expected_new_traces_per_sec: 1000
    policies:
      # Політика 1: Завжди вибирати критичні сервіси (100%)
      - name: critical-services-always-sample
        type: string_attribute
        string_attribute:
          key: service.criticality
          values:
            - critical
          enabled_regex_matching: false
          invert_match: false

      # Політика 2: Вибірка 50% висококритичних сервісів
      - name: high-criticality-probabilistic
        type: and
        and:
          and_sub_policy:
            - name: is-high-criticality
              type: string_attribute
              string_attribute:
                key: service.criticality
                values:
                  - high
            - name: probabilistic-50
              type: probabilistic
              probabilistic:
                sampling_percentage: 50

      # Політика 3: Вибірка 10% середньокритичних сервісів
      - name: medium-criticality-probabilistic
        type: and
        and:
          and_sub_policy:
            - name: is-medium-criticality
              type: string_attribute
              string_attribute:
                key: service.criticality
                values:
                  - medium
            - name: probabilistic-10
              type: probabilistic
              probabilistic:
                sampling_percentage: 10

      # Політика 4: Вибірка 1% низькокритичних сервісів
      - name: low-criticality-probabilistic
        type: and
        and:
          and_sub_policy:
            - name: is-low-criticality
              type: string_attribute
              string_attribute:
                key: service.criticality
                values:
                  - low
            - name: probabilistic-1
              type: probabilistic
              probabilistic:
                sampling_percentage: 1

      # Політика 5: Завжди вибирати трасування з помилками незалежно від критичності
      - name: errors-always-sample
        type: status_code
        status_code:
          status_codes:
            - ERROR

      # Політика 6: Завжди вибирати повільні трасування з критичних/висококритичних сервісів
      - name: slow-critical-traces
        type: and
        and:
          and_sub_policy:
            - name: is-critical-or-high
              type: string_attribute
              string_attribute:
                key: service.criticality
                values:
                  - critical
                  - high
            - name: is-slow
              type: latency
              latency:
                threshold_ms: 5000

service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [resourcedetection, memory_limiter, transform, tail_sampling]
      exporters: [otlp, debug, spanmetrics]
```

## Як це працює {#how-it-works}

Процесор вибірки наприкінці оцінює завершені трасування відповідно до налаштованих політик. Трасування вибирається, якщо **будь-яка** політика має збіг:

- **Критичні сервіси** завжди підлягають вибірковому моніторингу, щоб забезпечити повну прозорість платіжних потоків, процесу оформлення замовлення та сервісів, що взаємодіють з користувачами.
- **Сервіси високої критичності** підлягають вибірковому моніторингу на 50 %, що дозволяє збалансувати можливість спостереження та обсяг даних.
- **Сервіси середньої та низької критичності** підлягають вибірковому моніторингу з поступовим зниженням частоти, щоб зменшити шум від менш критичних шляхів.
- **Помилки завжди фіксуються** незалежно від критичності сервісу, що гарантує, що жодна проблема не залишиться непоміченою.
- **Повільні трасування** (>5 с) від критичних сервісів та сервісів високої критичності завжди піддаються вибірковому моніторингу, щоб допомогти виявити вузькі місця у продуктивності.
