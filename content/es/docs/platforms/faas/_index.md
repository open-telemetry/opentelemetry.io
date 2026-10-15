---
title: Funciones como servicio
linkTitle: FaaS
description: >-
  OpenTelemetry admite varios métodos de monitorización de funciones como
  servicio ofrecidas por distintos proveedores de nube
redirects: [{ from: /docs/faas/*, to: ':splat' }] # cSpell:disable-line
default_lang_commit: 4b5381a2e9f129651ab8658357ab846bd4c965f2
---

Las funciones como servicio (FaaS) son una plataforma de computación sin
servidor importante para las [aplicaciones nativas de la
nube][cloud native apps]. Sin embargo, las particularidades de cada plataforma
suelen hacer que estas aplicaciones tengan recomendaciones y requisitos de
monitorización ligeramente diferentes de los de las aplicaciones que se ejecutan
en Kubernetes o en máquinas virtuales.

El alcance inicial de la documentación de FaaS abarca Microsoft Azure, Google
Cloud Platform (GCP) y Amazon Web Services (AWS). Las funciones de AWS también
se conocen como Lambda.

## Recursos de la comunidad {#community-assets}

La comunidad de OpenTelemetry proporciona actualmente capas de Lambda
precompiladas que permiten instrumentar tu aplicación automáticamente, así como
una capa de Lambda independiente del Collector que se puede usar al instrumentar
aplicaciones de forma manual o automática.

Puedes consultar el estado de las versiones en el
[repositorio de OpenTelemetry-Lambda](https://github.com/open-telemetry/opentelemetry-lambda).

[cloud native apps]: https://glossary.cncf.io/cloud-native-apps/
