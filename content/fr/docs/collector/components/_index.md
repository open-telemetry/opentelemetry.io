---
title: Composants
description:
  Composants du Collector OpenTelemetry - receivers, processors, exporters,
  connectors et extensions
weight: 22
default_lang_commit: 1c2b0563e8e66ef0952c442e3662e4bec18a8762
---

Le Collector OpenTelemetry est composé de composants qui gèrent les données de
télémétrie. Chaque composant a un rôle spécifique dans le pipeline de données.

## Types de composants

- **[Receivers](receiver/)** - Collectent les données de télémétrie à partir de
  diverses sources et formats
- **[Processors](processor/)** - Transforment, filtrent et enrichissent les
  données de télémétrie
- **[Exporters](exporter/)** - Envoient les données de télémétrie vers des
  backends d'observabilité
- **[Connectors](connector/)** - Connectent deux pipelines, agissant à la fois
  comme exporter et receiver
- **[Extensions](extension/)** - Fournissent des capacités supplémentaires comme
  les vérifications de santé
