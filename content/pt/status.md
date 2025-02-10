---
title: Estado
menu: { main: { weight: 30 } }
aliases: [/project-status, /releases]
description: Nível de maturidade dos principais componentes do OpenTelemetry
default_lang_commit: a6e46dac8b73165a904e9fee4c1ee46305a8b968
---

{{% blocks/section color="white" %}}

## {{% param title %}}

O OpenTelemetry é composto de
[diversos componentes](/docs/concepts/components/), alguns específicos de
linguagem e outros independentes de linguagem. Ao procurar por um
[estado](/docs/specs/otel/versioning-and-stability/), certifique-se de verificar
o estado na página do componente correto. Por exemplo, o estado de um sinal na
especificação pode não ser o mesmo que o estado do sinal em um SDK de uma
linguagem especifica.

## APIs e SDKs de Linguagem de Programação {#language-apis--sdks}

Para o estado de desenvolvimento ou nível de maturidade de uma
[API ou SDK de linguagem de programação](/docs/languages/), consulte a tabela a
seguir:

{{% telemetry-support-table " " %}}

Para mais detalhes sobre a conformidade com a especificação por implementação,
veja a
[Matriz de Conformidade da Especificação](https://github.com/open-telemetry/opentelemetry-specification/blob/main/spec-compliance-matrix.md).

## Collector

O estado do Collector é: [misto](/docs/specs/otel/document-status/#mixed)), pois
os principais componentes do Collector atualmente possuem
[níveis de estabilidade](https://github.com/open-telemetry/opentelemetry-collector#stability-levels)
variados.

**Os componentes do Collector** diferem em seus níveis de maturidade. Cada
componente tem sua estabilidade documentada em seu arquivo `README.md`. Você
pode encontrar uma lista de todos os componentes do Collector disponíveis no
[registro](/ecosystem/registry/?language=collector).

## Kubernetes Operator

O estado do OpenTelemetry Operator é
[misto](/docs/specs/otel/document-status/#mixed), pois ele implementa
componentes com diferentes estados.

O Operator em si está em um estado
[misto](/docs/specs/otel/document-status/#mixed), com componentes nos estados
`v1alpha1` e `v1beta1`.

## Especificações {#specifications}

Para o estado de desenvolvimento ou nível de maturidade da
[especificação](/docs/specs/otel/), consulte o seguinte:
[Resumo do Estado da Especificação](/docs/specs/status/).

{{% /blocks/section %}}
