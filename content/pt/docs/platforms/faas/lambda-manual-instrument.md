---
title: Instrumentação manual do Lambda
weight: 11
description: Instrumente manualmente seus Lambdas com o OpenTelemetry
default_lang_commit: f49ec57e5a0ec766b07c7c8e8974c83531620af3
---

A comunidade oferece camadas de auto-instrumentação apenas para as linguagens
listadas no
[documento de auto-instrumentação do Lambda](../lambda-auto-instrument/). Para
as demais, siga as orientações gerais de instrumentação da linguagem escolhida e
adicione a camada Lambda do Collector para enviar seus dados.

## Adicione o ARN da camada Lambda do OTel Collector {#add-the-arn-of-the-otel-collector-lambda-layer}

Veja as [orientações sobre a camada Lambda do Collector](../lambda-collector/)
para adicionar a camada à sua aplicação e configurar o Collector. Recomenda-se
fazer isso primeiro.

## Instrumente o Lambda com o OTel {#instrument-the-lambda-with-otel}

Consulte as [orientações de instrumentação da linguagem](/docs/languages/)
escolhida para instrumentar manualmente sua aplicação.

## Publique seu Lambda {#publish-your-lambda}

Publique uma nova versão do seu Lambda para implantar as novas alterações e a
instrumentação.
