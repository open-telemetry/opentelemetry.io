---
default_lang_commit: b7589cf40b05480bc7a2022cf2dd36cc299904fa
---

Ласкаво просимо до документації OpenTelemetry для {{ $name }}. У цьому розділі описано, як використовувати OpenTelemetry з {{ $name }} для генерації та збору телеметричних даних, таких як метрики, журнали та трасування, за допомогою API та SDK OpenTelemetry.

Ці сторінки призначені для того, щоб допомогти вам розпочати роботу та зрозуміти поточні можливості та стан OpenTelemetry для {{ $name }}.

## Статус та випуски {#status-and-releases}

Поточний стан основних функціональних компонентів OpenTelemetry {{ $name }} наступний:

| Трейси              | Метрики              | Логи              |
| ------------------- | -------------------- | ----------------- |
| {{ $tracesStatus }} | {{ $metricsStatus }} | {{ $logsStatus }} |

Випуски, зокрема [останній випуск][latest release], див. у розділі [Випуски][Releases]. {{ $.Inner }}

[latest release]: <https://github.com/open-telemetry/opentelemetry-{{ $lang }}/releases/latest>
[Releases]: <https://github.com/open-telemetry/opentelemetry-{{ $lang }}/releases>
