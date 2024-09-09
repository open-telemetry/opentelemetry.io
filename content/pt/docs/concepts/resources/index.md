---
title: Resources
weight: 70
default_lang_commit: a1740fd934e595f1396f2eb82a58a80824369b09
---

## Introdução

{{% pt/docs/languages/resources-intro %}}

Se você usar [Jaeger](https://www.jaegertracing.io/) como seu _backend_ de
observabilidade, os _resource attributes_ são agrupados na guia **Process**:

![Uma captura de tela do Jaeger mostrando um exemplo de saída de resource attributes associados a um rastro.](screenshot-jaeger-resources.png)

Um _resource_ é adicionado ao `TraceProvider` ou `MetricProvider` quando eles
são criados durante a inicialização. Esta associação não pode ser alterada
posteriormente. Após um _resource_ ser adicionado, todos os trechos e métricas
produzidos a partir de um `Tracer` ou `Meter` do _provider_ terão o _resource_
associado a eles.

## Atributos semânticos com valor padrão fornecidos pelo SDK

Existem atributos fornecidos pelo SDK do OpenTelemetry. Um deles é o
`service.name`, que representa o nome lógico do serviço. Por padrão, os SDKs
atribuirão o valor `unknown_service` para este valor, então é recomendado
defini-lo explicitamente, seja no código ou definindo um valor para a variável
de ambiente `OTEL_SERVICE_NAME`.

Além disso, o SDK também fornecerá os seguintes _resource attributes_ para se
autoidentificar: `telemetry.sdk.name`, `telemetry.sdk.language` e
`telemetry.sdk.version`.

## Detectores de _resources_

A maioria dos SDKs específicos de linguagem fornece um conjunto de detectores de
_resources_ que podem ser usados para detectar automaticamente informações de
recursos do ambiente. Os detectores de _resources_ comuns incluem:

- [Sistema Operacional](/docs/specs/semconv/resource/os/)
- [Host](/docs/specs/semconv/resource/host/)
- [Processos e tempo de execução de processos](/docs/specs/semconv/resource/process/)
- [Container](/docs/specs/semconv/resource/container/)
- [Kubernetes](/docs/specs/semconv/resource/k8s/)
- [Atributos específicos do provedor de nuvem](/docs/specs/semconv/resource/#cloud-provider-specific-attributes)
- [e mais](/docs/specs/semconv/resource/)

## _Resources_ personalizados

Você também pode fornecer seus próprios _resource attributes_. Você pode
fornecê-los em código ou definindo um valor para a variável de ambiente
`OTEL_RESOURCE_ATTRIBUTES`. Se aplicável, utilize
[convenções semânticas para seus _resource attributes_](/docs/specs/semconv/resource).
Pro exemplo, você pode fornecer o nome do seu
[ambiente de execução](/docs/specs/semconv/resource/deployment-environment/)
usando `deployment.environment`:

```shell
env OTEL_RESOURCE_ATTRIBUTES=deployment.environment=production yourApp
```
