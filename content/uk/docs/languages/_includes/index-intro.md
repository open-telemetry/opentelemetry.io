---
default_lang_commit: e05fefe6c9f7d8b159d9a9a95128098c646c78c4
---

Це документація OpenTelemetry {{ $name }}. OpenTelemetry — це фреймворк для спостереження. Він складається з API, SDK та інструментів, які призначені для допомоги у створенні та зборі телеметричних даних застосунків, таких як метрики, логи та трасування. Ця документація призначена для того, щоб допомогти вам зрозуміти, як почати використовувати OpenTelemetry {{ $name }}.

## Статус та випуски {#status-and-releases}

Поточний стан основних функціональних компонентів OpenTelemetry {{ $name }} наступний:

| Трейси              | Метрики              | Логи              |
| ------------------- | -------------------- | ----------------- |
| {{ $tracesStatus }} | {{ $metricsStatus }} | {{ $logsStatus }} |

Випуски, зокрема [останній випуск][latest release], див. у розділі [Випуски][Releases]. {{ $.Inner }}

[latest release]: <https://github.com/open-telemetry/opentelemetry-{{ $lang }}/releases/latest>
[Releases]: <https://github.com/open-telemetry/opentelemetry-{{ $lang }}/releases>
