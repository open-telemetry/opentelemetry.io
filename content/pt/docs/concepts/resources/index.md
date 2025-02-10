---
title: Recursos
weight: 70
default_lang_commit: 17c3b8eb53b8abc56213abb736c0f850eab752df
---

## Introdução {#introduction}

{{% pt/docs/languages/resources-intro %}}

Se você usar [Jaeger](https://www.jaegertracing.io/) como seu _backend_ de
observabilidade, os atributos do recurso são agrupados na guia **Process**:

![Uma captura de tela do Jaeger mostrando um exemplo de saída de atributos do recurso associados a um rastro.](screenshot-jaeger-resources.png)

Um recurso é adicionado ao `TraceProvider` ou `MetricProvider` quando eles são
criados durante a inicialização. Esta associação não pode ser alterada
posteriormente. Após um recurso ser adicionado, todos os trechos e métricas
produzidos a partir de um `Tracer` ou `Meter` do _provider_ terão o recurso
associado a eles.

## Atributos semânticos com valores padrões fornecidos pelo SDK {#semantic-attributes-with-sdk-provided-default-value}

Existem atributos fornecidos pelo SDK do OpenTelemetry. Um deles é o
`service.name`, que representa o nome lógico do serviço. Por padrão, os SDKs
atribuirão o valor `unknown_service` para este valor, então é recomendado
defini-lo explicitamente, seja no código ou definindo um valor para a variável
de ambiente `OTEL_SERVICE_NAME`.

Além disso, o SDK também fornecerá os seguintes atributos do recurso para se
autoidentificar: `telemetry.sdk.name`, `telemetry.sdk.language` e
`telemetry.sdk.version`.

## Detectores de recursos {#resource-detectors}

A maioria dos SDKs específicos de linguagem fornece um conjunto de detectores de
recursos que podem ser usados para detectar automaticamente informações de
recursos do ambiente. Os detectores de recursos mais comuns incluem:

- [Sistema Operacional](/docs/specs/semconv/resource/os/)
- [Host](/docs/specs/semconv/resource/host/)
- [Processos e tempo de execução de processos](/docs/specs/semconv/resource/process/)
- [Container](/docs/specs/semconv/resource/container/)
- [Kubernetes](/docs/specs/semconv/resource/k8s/)
- [Atributos específicos do provedor de nuvem](/docs/specs/semconv/resource/#cloud-provider-specific-attributes)
- [e mais](/docs/specs/semconv/resource/)

## Recursos personalizados {#custom-resources}

Você também pode fornecer seus próprios atributos do recurso. Você pode
fornecê-los em código ou definindo um valor para a variável de ambiente
`OTEL_RESOURCE_ATTRIBUTES`. Se aplicável, utilize
[convenções semânticas para seus atributos do recurso](/docs/specs/semconv/resource).
Por exemplo, você pode fornecer o nome do seu
[ambiente de execução](/docs/specs/semconv/resource/deployment-environment/)
usando `deployment.environment`:

```shell
env OTEL_RESOURCE_ATTRIBUTES=deployment.environment=production yourApp
```
