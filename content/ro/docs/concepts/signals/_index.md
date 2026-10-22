---
title: Semnale
description:
  Află mai multe despre categoriile de telemetrie susținute de OpenTelemetry
aliases: [data-sources, otel-concepts]
weight: 11
default_lang_commit: 1cf18d8b1b5f3e84865cc3f0ba9a37fc82a89fbc
---

Scopul OpenTelemetry este de a colecta, procesa și exporta [semnale][signals].
Semnalele sunt date furnizate de sistem care descriu activitatea de bază a
sistemului de operare și a aplicațiilor ce rulează pe o platformă. Un semnal
poate fi un parametru pe care dorești să-l măsori la un anumit moment dat — cum
ar fi temperatura sau utilizarea memoriei — ori un eveniment care traversează
componentele sistemului tău distribuit și pe care dorești să-l urmăresti (să-i
obții trasabilitatea). Poți grupa diverse semnale pentru a observa funcționarea
internă a unei anumite tehnologii din perspective diferite.

OpenTelemetry oferă în prezent suport pentru:

- [Urme](traces)
- [Metrici](metrics)
- [Jurnale](logs)
- [Bagaj](baggage)

De asemenea, în curs de dezvoltare sau în stadiu de [propunere][proposal]:

- [Evenimente][], un tip specific de [jurnal](logs)
- [Profil](profiles)

- [Evenimente][], a specific type of [jurnal](logs)
- [Profiluri](profiles)

[Events]: /docs/specs/otel/logs/data-model/#events
[proposal]:
  https://github.com/open-telemetry/opentelemetry-specification/tree/main/oteps/#readme
[signals]: /docs/specs/otel/glossary/#signals
