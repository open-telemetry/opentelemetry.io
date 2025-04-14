---
title: APIs e SDKs de Linguagens
description:
  A instrumentação de código do OpenTelemetry é suportada para muitas linguagens
  populares de programação.
weight: 250
default_lang_commit: d1ef521ee4a777881fb99c3ec2b506e068cdec4c
drifted_from_default: true
---

A [instrumentação][] de código do OpenTelemetry é suportada para as linguagens
listadas na tabela de [Estado e Lançamentos](#status-and-releases) abaixo.
Implementações não oficiais para [outras linguagens](/docs/languages/other)
também estão disponíveis. Você pode encontrá-las no
[registro](/ecosystem/registry/).

Para Go, .NET, PHP, Python, Java e JavaScript, você pode usar
[soluções de instrumentação automática](/docs/zero-code) para instrumentar suas
aplicações sem alterações de código.

Se você estiver usando Kubernetes, você pode usar o [OpenTelemetry Operator para
Kubernetes][otel-op] para [injetar soluções de implementação
automática][implementação automática] em suas aplicações.

## Estado e Lançamentos {#status-and-releases}

O estado atual dos principais componentes funcionais do OpenTelemetry estão a
seguir:

{{% alert title="Importante" color="warning" %}}

Independente do estado de um API/SDK, se a sua instrumentação depende de
[convenções semânticas] que são marcadas como [Experimental] na [especificação
de convenções semânticas], seu fluxo de dados pode estar sujeito à **quebra de
compatibilidade**

[convenções semânticas]: /docs/concepts/semantic-conventions/
[Experimental]: /docs/specs/otel/document-status/
[especificação de convenções semânticas]: /docs/specs/semconv/

{{% /alert %}}

{{% telemetry-support-table " " %}}

## Referências da API

Os Grupos de Interesse Especial (SIGs), que implementam a API e o SDK do
OpenTelemetry em diferentes linguagens e também disponibilizam referências da
API para desenvolvedores. As referências a seguir estão disponíveis:

{{% apidocs %}}

{{% alert title="Nota" color="info" %}}

A lista acima é um alias para [`/api`](/api).

{{% /alert %}}

[implementação automática]: /docs/platforms/kubernetes/operator/automatic/
[instrumentação]: /docs/concepts/instrumentation/
[otel-op]: /docs/platforms/kubernetes/operator/
