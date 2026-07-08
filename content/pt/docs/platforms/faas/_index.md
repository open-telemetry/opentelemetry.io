---
title: Função como Serviço
linkTitle: FaaS
description: >-
  O OpenTelemetry suporta diversos métodos de monitoramento de Função como
  Serviço fornecidos por diferentes provedores de nuvem
redirects: [{ from: /docs/faas/*, to: ':splat' }] # cSpell:disable-line
default_lang_commit: 4b5381a2e9f129651ab8658357ab846bd4c965f2
---

Função como Serviço (FaaS, _Function as a Service_) é uma importante plataforma
de computação _serverless_ para [aplicações nativas em
nuvem][cloud native apps]. No entanto, peculiaridades da plataforma geralmente
fazem com que essas aplicações tenham orientações e requisitos de monitoramento
ligeiramente diferentes em relação a aplicações executadas em Kubernetes ou em
máquinas virtuais.

O escopo inicial de fornecedores da documentação FaaS abrange Microsoft Azure,
Google Cloud Platform (GCP) e Amazon Web Services (AWS). As funções AWS também
são conhecidas como Lambda.

## Recursos da Comunidade

Atualmente, a comunidade OpenTelemetry fornece camadas Lambda pré-construídas
capazes de auto-instrumentar a aplicação, bem como a opção de uma camada Lambda
independente com o Collector, que pode ser usada ao instrumentar aplicações de
forma manual ou automática.

O estado de lançamento pode ser acompanhado no
[repositório OpenTelemetry-Lambda](https://github.com/open-telemetry/opentelemetry-lambda).

[cloud native apps]: https://glossary.cncf.io/cloud-native-apps/
