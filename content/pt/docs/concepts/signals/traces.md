---
title: Rastros
weight: 1
cSpell:ignore: Guten
description: O caminho de uma solicitação através do seu aplicativo.
---

Os **rastros** nos fornecem uma visão geral do que acontece quando uma
solicitação é feita para uma aplicação. Seja sua aplicação um monólito com um
único banco de dados ou uma grande variedade de serviços, os rastros são
essenciais para compreender o "caminho" completo que uma solicitação percorreu
na sua aplicação.

Vamos explorar isso com três unidades de trabalho, representadas como
[Trechos](#spans):

{{% alert title="Note" %}}

Os exemplos JSON a seguir não apresentam um formato específico, especialmente o
[OTLP/JSON](/docs/specs/otlp/#json-protobuf-encoding), que é mais verboso.

`olá` trecho:

```json
{
  "name": "olá",
  "context": {
    "trace_id": "0x5b8aa5a2d2c872e8321cf37308d69df2",
    "span_id": "0x051581bf3cb55c13"
  },
  "parent_id": null,
  "start_time": "2022-04-29T18:52:58.114201Z",
  "end_time": "2022-04-29T18:52:58.114687Z",
  "attributes": {
    "http.route": "alguma_rota1"
  },
  "events": [
    {
      "name": "Guten Tag!",
      "timestamp": "2022-04-29T18:52:58.114561Z",
      "attributes": {
        "event_attributes": 1
      }
    }
  ]
}
```
