---
title: Estado
menu: { main: { weight: 30 } }
aliases: [/project-status, /releases]
description: Nivel de madurez de los principales componentes de OpenTelemetry
cascade: { type: docs }
body_class: td-no-left-sidebar
default_lang_commit: f9a0439ac56dba1515283e1a1cb6d6a90634a20f
---

OpenTelemetry está compuesto por
[varios componentes](/docs/concepts/components/), algunos específicos de un
lenguaje y otros independientes del lenguaje. Al consultar un
[estado](/docs/specs/otel/versioning-and-stability/), asegúrate de buscar el
estado en la página del componente correcto. Por ejemplo, el estado de una señal
en la especificación puede no ser el mismo que el estado de esa señal en un SDK
de un lenguaje específico.

## API y SDK por lenguaje

Para conocer el estado de desarrollo o el nivel de madurez de una
[API o SDK por lenguaje](/docs/languages/), consulta la siguiente tabla:

{{% telemetry-support-table " " %}}

Para más detalles sobre el cumplimiento de la especificación por implementación,
consulta la
[Matriz de Cumplimiento de la Especificación](https://github.com/open-telemetry/opentelemetry-specification/blob/main/spec-compliance-matrix.md).

Para más detalles sobre el cumplimiento de la especificación por implementación,
consulta la
[Matriz de Cumplimiento de la Especificación](https://github.com/open-telemetry/opentelemetry-specification/blob/main/spec-compliance-matrix.md).

## Collector

El estado del collector es: [mixto](/docs/specs/otel/document-status/#mixed), ya
que los componentes principales del collector actualmente tienen
[niveles de estabilidad](https://github.com/open-telemetry/opentelemetry-collector#stability-levels)
mixtos.

**Los componentes del collector** difieren en sus niveles de madurez. Cada
componente tiene documentada su estabilidad en su archivo `README.md`. Puedes
encontrar una lista de todos los componentes disponibles del collector en el
[registro](/ecosystem/registry/?language=collector).

## Kubernetes Operator

El estado del OpenTelemetry Operator es
[mixto](/docs/specs/otel/document-status/#mixed), ya que despliega componentes
con diferentes estados.

El propio Operator está en un estado
[mixto](/docs/specs/otel/document-status/#mixed), con componentes en estados
`v1alpha1` y `v1beta1`.

## Especificaciones

Para conocer el estado de desarrollo o el nivel de madurez de la
[especificación](/docs/specs/otel/), consulta lo siguiente:
[Resumen del Estado de la Especificación](/docs/specs/status/).
