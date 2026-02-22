---
default_lang_commit: 5f551752635886a0d2d6b2a83e5a36866ca1b5f1
---

Ласкаво просимо до документації OpenTelemetry для {{ $name }}. У цьому розділі описано, як використовувати OpenTelemetry з {{ $name }} для генерації та збору телеметричних даних, таких як метрики, журнали та трасування, за допомогою API та SDK OpenTelemetry. Ці сторінки призначені для того, щоб допомогти вам розпочати роботу та зрозуміти поточні можливості та стан OpenTelemetry для {{ $name }}.

## Статус та випуски {#status-and-releases}

Поточний стан основних функціональних компонентів OpenTelemetry {{ $name }} наступний:

| Трейси              | Метрики              | Логи              |
| ------------------- | -------------------- | ----------------- |
| {{ $tracesStatus }} | {{ $metricsStatus }} | {{ $logsStatus }} |

Випуски, зокрема [останній випуск][latest release], див. у розділі [Випуски][Releases]. {{ $.Inner }}

[latest release]: <https://github.com/open-telemetry/opentelemetry-{{ $lang }}/releases/latest>
[Releases]: <https://github.com/open-telemetry/opentelemetry-{{ $lang }}/releases>
