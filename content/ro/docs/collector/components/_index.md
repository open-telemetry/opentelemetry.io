---
title: Componente
description:
  Componentele OpenTelemetry Collector - receivere, procesoare, exportere,
  conectoare și extensii
weight: 22
default_lang_commit: 1c2b0563e8e66ef0952c442e3662e4bec18a8762
---

OpenTelemetry Collector este format din componente care gestionează datele de
telemetrie. Fiecare componentă are un rol specific în pipeline-ul de date.

## Tipuri de componente

- **[Receivers](receiver/)** - Colectează date de telemetrie din diverse surse
  și formate
- **[Processors](processor/)** - Transformă, filtrează și îmbogățesc datele de
  telemetrie
- **[Exporters](exporter/)** - Trimit date de telemetrie către backend-uri de
  observabilitate
- **[Connectors](connector/)** - Conectează două pipeline-uri, acționând atât ca
  exporter, cât și ca receiver
- **[Extensions](extension/)** - Oferă capabilități suplimentare precum
  verificări de sănătate
