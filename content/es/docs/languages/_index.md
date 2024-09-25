---
title: APIs y SDKs de Lenguaje
description:
  La instrumentación de código de OpenTelemetry es compatible con muchos
  lenguajes de programación populares.
weight: 250
aliases: [/docs/instrumentation]
redirects: [{ from: /docs/instrumentation/*, to: ':splat' }]
default_lang_commit: f7cb8b65a478450d80d703b34c8473c579702108
---

La [instrumentación][] de código de OpenTelemetry es compatible con los
lenguajes enumerados en la tabla de
[Estados y Lanzamientos](#status-and-releases) a continuación. También están
disponibles implementaciones no oficiales para
[otros lenguajes](/docs/languages/other). Puedes encontrarlas en el
[registro](/ecosystem/registry/).

Para Go, .NET, PHP, Python, Java y JavaScript puedes utilizar
[soluciones sin código](/docs/zero-code) para agregar instrumentación a tu
aplicación sin hacer cambios en el código.

Si estás utilizando Kubernetes, puedes usar el [Operador de OpenTelemetry para
Kubernetes][otel-op] para [inyectar estas soluciones sin código][zero-code] en
tu aplicación.

## Estados y Lanzamientos

El estado actual de los principales componentes funcionales de OpenTelemetry es
el siguiente:

{{% alert title="Importante" color="warning" %}}

Independientemente del estado de un API/SDK, si tu instrumentación depende de
[convenciones semánticas] que estén marcadas como [Experimentales] en la [especificación
de
convenciones semánticas], tu flujo de datos podría estar sujeto a **cambios
importantes**.

[convenciones semánticas]: /docs/concepts/semantic-conventions/
[Experimentales]: /docs/specs/otel/document-status/
[especificación de convenciones semánticas]: /docs/specs/semconv/

{{% /alert %}}

{{% telemetry-support-table " " %}}

## Referencias de API

Los Grupos de Interés Especial (SIGs) que implementan el API y SDK de
OpenTelemetry en un lenguaje específico también publican referencias de API para
desarrolladores. Las siguientes referencias están disponibles:

{{% apidocs %}}

{{% alert title="Consejo" color="info" %}}

Puedes encontrar una lista de referencias de API disponibles en
<https://opentelemetry.io/api-docs>.

{{% /alert %}}

[zero-code]: /docs/kubernetes/operator/automatic/
[instrumentación]: /docs/concepts/instrumentation/
[otel-op]: /docs/kubernetes/operator/
