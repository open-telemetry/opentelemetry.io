---
title: Functions as a Service
linkTitle: FaaS
description: >-
  O OpenTelemetry suporta diversos métodos de monitoramento de
  Function-as-a-Service fornecido por diferentes provedores de nuvem
redirects: [{ from: /docs/faas/*, to: ':splat' }] # cSpell:disable-line
default_lang_commit: 4b5381a2e9f129651ab8658357ab846bd4c965f2
---

Functions as a Service (FaaS) é uma importante plataforma de computação
serverless para [aplicações cloud native][]. No entanto, peculiaridades da
plataforma geralmente significam que essas aplicações têm orientações e
requisitos de monitoramento ligeiramente diferentes em relação a aplicações
executadas em Kubernetes ou Máquinas Virtuais.

O escopo inicial de fornecedores da documentação FaaS abrange Microsoft Azure,
Google Cloud Platform (GCP) e Amazon Web Services (AWS). As funções AWS também
são conhecidas como Lambda.

## Recursos da Comunidade

A comunidade OpenTelemetry fornece atualmente Lambda layers pré-construídas
capazes de auto-instrumentar sua aplicação, bem como a opção de uma Lambda layer
standalone do Collector que pode ser usada ao instrumentar aplicações manual ou
automaticamente.

O status dos releases pode ser acompanhado no
[repositório OpenTelemetry-Lambda](https://github.com/open-telemetry/opentelemetry-lambda).

[aplicações cloud native]: https://glossary.cncf.io/cloud-native-apps/
