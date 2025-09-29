---
title: # bogus for markdownlint
default_lang_commit: 7811e854ba3b31c56ce681f1d60cf19e8a5c4358
drifted_from_default: true
---

[Instrumentar](/docs/concepts/instrumentation/) consiste en añadir el código de
observabilidad a una app.

Si estás instrumentando una app, necesitas usar el SDK de OpenTelemetry para tu
lenguaje. Luego debes usar el SDK para inicializar OpenTelemetry y la API para
instrumentar tu código. Esto emitirá telemetría desde tu app, y de cualquier
librería que hayas instalado que también esté instrumentada.

Si estás instrumentando una librería, tan solo instala el paquete de
OpenTelemetry API para tu lenguaje. Tu librería no emitirá telemetría por si
sola. Solo lo hará cuando sea parte de una app que use el SDK de OpenTelemetry.
Para más información sobre instrumentación de librerías, consulta
[Librerías](/docs/concepts/instrumentation/libraries/).

Para más información sobre la API y el SDK de OpenTelemetry, consulta la
[especificación](/docs/specs/otel/).
