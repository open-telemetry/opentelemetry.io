---
---

Bun venit la documentația OpenTelemetry {{ $name }}. Această secțiune prezintă
modul de utilizare a OpenTelemetry cu {{ $name }} pentru a genera și colecta
date de telemetrie, precum metrici, jurnale (logs) și urme (traces), folosind
API-ul și SDK-urile OpenTelemetry.

Aceste pagini sunt menite să te ajute să începi și să înțelegi capacitățile
actuale și stadiul OpenTelemetry {{ $name }}.

## Stadii și versiuni {#status-and-releases}

Stadiul actual al principalelor componente funcționale pentru OpenTelemetry
{{ $name }} este următorul:

| Urme (Traces)       | Metrici (Metrics)    | Jurnale (Logs)    |
| ------------------- | -------------------- | ----------------- |
| {{ $tracesStatus }} | {{ $metricsStatus }} | {{ $logsStatus }} |

Pentru versiuni, inclusiv [cea mai recentă versiune][latest release], vezi
[Versiuni][Releases]. {{ $.Inner }}

[latest release]:
  <https://github.com/open-telemetry/opentelemetry-{{ $lang }}/releases/latest>
[Releases]:
  <https://github.com/open-telemetry/opentelemetry-{{ $lang }}/releases>
