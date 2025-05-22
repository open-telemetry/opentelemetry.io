---
title: Status
menu: { main: { weight: 30 } }
aliases: [/project-status, /releases]
description: Nível de maturidade dos principais componentes do OpenTelemetry
type: docs
body_class: td-no-left-sidebar
default_lang_commit: 1f83b9ffa3ecdd5e2b507379cc259e5678596c7f
---

O OpenTelemetry é composto de
[diversos componentes](/docs/concepts/components/), alguns específicos e outros
independentes de linguagem. Ao procurar por um
_[status](/docs/specs/otel/versioning-and-stability/)_, certifique-se de
verificar o _status_ na página correta do componente. Por exemplo, o _status_ de
um sinal na especificação pode não ser o mesmo que o _status_ do sinal em um SDK
de uma linguagem especifica.

## APIs e SDKs de Linguagem de Programação {#language-apis--sdks}

Para o _status_ de desenvolvimento ou nível de maturidade de uma
[API ou SDK de linguagem de programação](/docs/languages/), consulte a tabela a
seguir:

{{% telemetry-support-table " " %}}

Para mais detalhes sobre a conformidade com a especificação por implementação,
veja a
[Matriz de Conformidade da Especificação](https://github.com/open-telemetry/opentelemetry-specification/blob/main/spec-compliance-matrix.md).

## Collector

O _status_ do Collector é: [misto](/docs/specs/otel/document-status/#mixed)),
pois os principais componentes do Collector atualmente possuem
[níveis de estabilidade](https://github.com/open-telemetry/opentelemetry-collector#stability-levels)
variados.

**Os componentes do Collector** diferem em seus níveis de maturidade. Cada
componente tem sua estabilidade documentada em seu arquivo `README.md`. Você
pode encontrar uma lista de todos os componentes do Collector disponíveis no
[registro](/ecosystem/registry/?language=collector).

## Kubernetes Operator

O _status_ do OpenTelemetry Operator é
[misto](/docs/specs/otel/document-status/#mixed), pois ele implementa
componentes com diferentes _status_.

O Operator em si está em um _status_
[misto](/docs/specs/otel/document-status/#mixed), com componentes nos _status_
`v1alpha1` e `v1beta1`.

## Especificações {#specifications}

Para o _status_ de desenvolvimento ou nível de maturidade da
[especificação](/docs/specs/otel/), consulte o seguinte:
[Resumo do _Status_ da Especificação](/docs/specs/status/).
