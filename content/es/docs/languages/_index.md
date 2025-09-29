---
title: APIs y SDKs para lenguajes
description:
  La instrumentación de código de OpenTelemetry es compatible con muchos
  lenguajes de programación populares.
weight: 250
default_lang_commit: 3815d1481fe753df10ea3dc26cbe64dba0230579
drifted_from_default: true
---

La [instrumentación][] de código de OpenTelemetry es compatible con los
lenguajes enumerados en la tabla de estados y lanzamientos presentada a
continuación. También están disponibles implementaciones no oficiales para
[otros lenguajes](/docs/languages/other). Puedes encontrarlas en el
[registro](/ecosystem/registry/).

Para Go, .NET, PHP, Python, Java y JavaScript puedes usar
[instrumentación zero-code](/docs/zero-code) para agregar instrumentación a tu
aplicación sin hacer cambios en el código.

Si estás utilizando Kubernetes, puedes usar el [Operador de OpenTelemetry para
Kubernetes][otel-op] para [inyectar estas soluciones zero-code][zero-code] en tu
aplicación.

## Estados y lanzamientos

El estado actual de los principales componentes funcionales de OpenTelemetry es
el siguiente:

{{% alert title="Importante" color="warning" %}}

Independientemente del estado de un API/SDK, si tu instrumentación depende de
[convenciones semánticas][] que estén marcadas como [Experimental] en la
[especificación de convenciones semánticas][], tu flujo de datos podría estar
sujeto a **cambios importantes**.

[convenciones semánticas]: /docs/concepts/semantic-conventions/
[Experimental]: /docs/specs/otel/document-status/
[especificación de convenciones semánticas]: /docs/specs/semconv/

{{% /alert %}}

{{% telemetry-support-table " " %}}

## Referencias de API

Los Grupos de Interés Especial (SIGs) que implementan el API y SDK de
OpenTelemetry en un lenguaje específico también publican referencias de API para
desarrolladores. Las siguientes referencias están disponibles:

{{% apidocs %}}

{{% alert title="Consejo" %}}

Puedes encontrar una lista de referencias de API disponibles en </api-docs>.

{{% /alert %}}

[zero-code]: /docs/platforms/kubernetes/operator/automatic/
[instrumentación]: /docs/concepts/instrumentation/
[otel-op]: /docs/platforms/kubernetes/operator/
