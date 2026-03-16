---
title: Komponenty
description:
  Komponenty OpenTelemetry Collector - receivers, processors, exporters,
  connectors i extensions
weight: 22
default_lang_commit: 1c2b0563e8e66ef0952c442e3662e4bec18a8762
---

OpenTelemetry Collector składa się z komponentów, które obsługują dane
telemetryczne. Każdy komponent pełni określoną rolę w pipeline'ie danych.

## Typy komponentów

- **[Receivers](receiver/)** - Zbierają dane telemetryczne z różnych źródeł i
  formatów
- **[Processors](processor/)** - Przekształcają, filtrują i wzbogacają dane
  telemetryczne
- **[Exporters](exporter/)** - Wysyłają dane telemetryczne do backendów
  obserwowalności
- **[Connectors](connector/)** - Łączą dwa pipeline'y, działając jednocześnie
  jako exporter i receiver
- **[Extensions](extension/)** - Zapewniają dodatkowe możliwości, takie jak
  kontrole stanu
