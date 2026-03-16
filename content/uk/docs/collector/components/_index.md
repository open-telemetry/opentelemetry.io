---
title: Компоненти
description:
  Компоненти OpenTelemetry Collector - receivers, processors, exporters,
  connectors та extensions
weight: 22
default_lang_commit: 1c2b0563e8e66ef0952c442e3662e4bec18a8762
---

OpenTelemetry Collector складається з компонентів, які обробляють дані
телеметрії. Кожен компонент має певну роль у конвеєрі даних.

## Типи компонентів

- **[Receivers](receiver/)** - Збирають дані телеметрії з різних джерел та
  форматів
- **[Processors](processor/)** - Перетворюють, фільтрують та збагачують дані
  телеметрії
- **[Exporters](exporter/)** - Надсилають дані телеметрії до бекендів
  спостережуваності
- **[Connectors](connector/)** - Зʼєднують два конвеєри, діючи одночасно як
  exporter і receiver
- **[Extensions](extension/)** - Надають додаткові можливості, такі як
  перевірки стану
