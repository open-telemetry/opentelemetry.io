{{ $prettier_ignore := `

<!-- prettier-ignore -->
` -}}
{{ $lang := .Get 0 -}}
{{ $data := index $.Site.Data.instrumentation $lang }}
{{ $name := $data.name -}}

{{ $tracesStatus := partial "docs/get-signal-status.html" (dict "lang" $lang "signal" "traces") -}}
{{ $metricsStatus := partial "docs/get-signal-status.html" (dict "lang" $lang "signal" "metrics") -}}
{{ $logsStatus := partial "docs/get-signal-status.html" (dict "lang" $lang "signal" "logs") -}}

Це документація OpenTelemetry {{ $name }}. OpenTelemetry — це фреймворк для спостереження. Він складається з API, SDK та інструментів, які призначені для допомоги у створенні та зборі телеметричних даних застосунків, таких як метрики, логи та трасування. Ця документація призначена для того, щоб допомогти вам зрозуміти, як почати використовувати OpenTelemetry {{ $name }}.

## Статус та випуски {#status-and-releases}

Поточний статус основних функціональних компонентів для OpenTelemetry {{ $name }} є наступним:

| Трейси              | Метрики              | Логи              |
| ------------------- | -------------------- | ----------------- |
| {{ $tracesStatus }} | {{ $metricsStatus }} | {{ $logsStatus }} |

{{ partial "uk/docs/latest-release.md" (dict "lang" $lang "Inner" .Inner) -}}
