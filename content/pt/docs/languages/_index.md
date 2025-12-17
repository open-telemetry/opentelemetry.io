---
title: APIs e SDKs de Linguagens
description:
  A instrumentação de código do OpenTelemetry é suportada para muitas linguagens
  populares de programação.
weight: 250
default_lang_commit: c392c714849921cd56aca8ca99ab11e0e4cb16f4
---

A [instrumentação][instrumentation] de código do OpenTelemetry é suportada para
as linguagens listadas na tabela de [Estado e Lançamentos](#status-and-releases)
abaixo. Implementações não oficiais para
[outras linguagens](/docs/languages/other) também estão disponíveis. Você pode
encontrá-las no [registro](/ecosystem/registry/).

Para Go, .NET, PHP, Python, Java e JavaScript, você pode usar
[soluções de instrumentação automática](/docs/zero-code) para instrumentar suas
aplicações sem alterações de código.

Se você estiver usando Kubernetes, você pode usar o [OpenTelemetry Operator para
Kubernetes][otel-op] para [injetar soluções de implementação
automática][zero-code] em suas aplicações.

## Estado e Lançamentos {#status-and-releases}

O estado atual dos principais componentes funcionais do OpenTelemetry estão a
seguir:

{{% alert title="Importante" color="warning" %}}

Independente do estado de um API/SDK, se a sua instrumentação depende de
[convenções semânticas][semantic conventions] que são marcadas como
[Experimental] na [especificação de convenções
semânticas][semantic conventions specification], seu fluxo de dados pode estar
sujeito à **quebra de compatibilidade**

[semantic conventions]: /docs/concepts/semantic-conventions/
[Experimental]: /docs/specs/otel/document-status/
[semantic conventions specification]: /docs/specs/semconv/

{{% /alert %}}

{{% telemetry-support-table " " %}}

## Referências da API

Os Grupos de Interesse Especial (SIGs), que implementam a API e o SDK do
OpenTelemetry em diferentes linguagens e também disponibilizam referências da
API para desenvolvedores. As referências a seguir estão disponíveis:

{{% apidocs %}}

{{% alert title="Nota" %}}

A lista acima é um alias para [`/api`](/api).

{{% /alert %}}

[zero-code]: /docs/platforms/kubernetes/operator/automatic/
[instrumentation]: /docs/concepts/instrumentation/
[otel-op]: /docs/platforms/kubernetes/operator/
