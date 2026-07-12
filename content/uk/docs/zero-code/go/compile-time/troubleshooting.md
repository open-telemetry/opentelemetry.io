---
title: Усунення несправностей
description: Діагностика проблем із Go compile-time інструментуванням.
weight: 50
default_lang_commit: f23a9af2244bae83dfc52bd677450fcf24ad80b3
cSpell:ignore: otelc
---

## Увімкнення налагоджувального логування {#enable-debug-logging}

Щоб побачити, що робить інструмент під час збірки, увімкніть режим налагодження:

```sh
otelc --debug go build -o myapp .
```

Налагоджувальний вивід, включаючи файл `debug.log`, записується до робочої теки інструменту (зазвичай тека `.otelc-build` у вашому модулі). Перевірте його, щоб побачити, які правила спрацювали та яке інструментування було впроваджено.

## Телеметрія не продукується {#no-telemetry-is-produced}

1. Переконайтеся, що бінарний файл було зібрано через `otelc`, а не звичайним `go build`.
2. Переконайтеся, що ваш застосунок дійсно використовує [підтримувану бібліотеку](../supported-libraries), і що версія, яку ви використовуєте, знаходиться в межах підтримуваного діапазону, оголошеного правилами інструментування.
3. Перевірте конфігурацію експортера: з `OTEL_EXPORTER_OTLP_ENDPOINT` не встановленим або неправильним, телеметрії немає куди йти. Встановіть `OTEL_LOG_LEVEL=debug`, щоб побачити помилки експорту.
4. Перевірте, чи інструментування не було вимкнено через `OTEL_GO_ENABLED_INSTRUMENTATIONS` або `OTEL_GO_DISABLED_INSTRUMENTATIONS`.

## Очищення артефактів збірки {#clean-up-build-artifacts}

Якщо збірка поводиться неочікувано, видаліть артефакти, створені попередніми фазами налаштування та збірки, та перебудуйте з чистого стану:

```sh
otelc cleanup
```

## Отримання допомоги {#getting-help}

- [GitHub issues](https://github.com/open-telemetry/opentelemetry-go-compile-instrumentation/issues) для повідомлень про помилки
- [GitHub discussions](https://github.com/open-telemetry/opentelemetry-go-compile-instrumentation/discussions) для запитань
- Канал [#otel-go-compt-instr-sig](https://cloud-native.slack.com/archives/C088D8GSSSF) у CNCF Slack
