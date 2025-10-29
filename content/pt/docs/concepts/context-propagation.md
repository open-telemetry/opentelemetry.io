---
title: Propagação de contexto
weight: 10
description:
  Entenda os conceitos que tornam possível o Rastreamento Distribuído.
default_lang_commit: 9a1f7271288a46049ae28785f04a67fb77f677f7
---

Com a propagação de contexto, os [sinais](../signals/) podem ser correlacionados
entre si, independentemente de onde são gerados. Embora não se limite ao
rastreamento, a propagação de contexto permite que os
[rastros](../signals/traces/) criem informações causais sobre um sistema que é
distribuído arbitrariamente entre processos e limites de rede.

Para compreender a propagação de contexto, você precisa entender dois conceitos
distintos: contexto e propagação.

## Contexto {#context}

O contexto é um objeto que contém as informações necessárias para que o serviço
emissor e receptor, ou
[unidade de execução](/docs/specs/otel/glossary/#execution-unit), correlacionem
um sinal com outro.

Quando o serviço A chama o serviço B, um ID de rastro (_trace ID_) e um ID de
trecho (_span ID_) são incluídos como parte do contexto. O serviço B utiliza
estes valores para criar um novo trecho que pertence ao mesmo rastro, definindo
o trecho do serviço A como seu pai. Isso torna possível acompanhar todo o fluxo
de uma requisição através dos limites dos serviços.

## Propagação {#propagation}

Propagação é o mecanismo que move o contexto entre serviços e processos. Ele
serializa ou desserializa o objeto de contexto e fornece as informações
relevantes a serem propagadas de um serviço para outro.

A propagação geralmente é gerenciada por bibliotecas de instrumentação e é
transparente para o usuário. Caso precise propagar o contexto manualmente, você
pode usar a [API de Propagadores](/docs/specs/otel/context/api-propagators/).

O OpenTelemetry mantém vários propagadores oficiais. O propagador padrão utiliza
os cabeçalhos definidos na especificação
[W3C TraceContext](https://www.w3.org/TR/trace-context/).

## Especificação

Para saber mais sobre a Propagação de Contexto, consulte a
[Especificação de Contexto](/docs/specs/otel/context/).
