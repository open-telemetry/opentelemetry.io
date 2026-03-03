---
title: Distribuciones de terceros
linkTitle: Distribuciones
description:
  Lista de distribuciones de OpenTelemetry de código abierto mantenidas por
  terceros.
default_lang_commit: 1a6db8fe3a989fa20267368336aceb5665b4394b
---

Las [distribuciones][] de OpenTelemetry permiten personalizar los
[componentes][] de OpenTelemetry para que sean más fáciles de implementar y usar
con backends de observabilidad específicos.

Cualquier tercero puede personalizar los componentes de OpenTelemetry con
cambios específicos del backend, del [proveedor][] o del usuario final. Se
pueden usar componentes de OpenTelemetry sin una distribución, pero una
distribución puede facilitar las cosas en algunos casos, como cuando un
proveedor tiene requisitos específicos.

La siguiente lista contiene un ejemplo de distribuciones de OpenTelemetry sin el
Collector y el componente que personalizan. Para distribuciones del
[Collector de OpenTelemetry](/docs/collector/), consulta
[Distribuciones del Collector](/docs/collector/distributions/).

{{% ecosystem/distributions-table filter="non-collector" %}}

## Añadiendo tu distribución {#how-to-add}

Para que tu distribución aparezca en la lista, [envia una solicitud de
registro][] con una entrada añadida a la [lista de distribuciones][]. La entrada
debe incluir lo siguiente:

- Enlace a la página principal de su distribución
- Enlace a la documentación que explica cómo usar la distribución
- Lista de los componentes que contiene tu distribución
- Dirección de GitHub o correo electrónico como punto de contacto para que
  podamos contactarte en caso de tener preguntas

{{% alert title="Nota" %}}

- Si proporcionas integración externa de OpenTelemetry para cualquier tipo de
  biblioteca, servicio o aplicación, considera
  [añadirlo al registro](/ecosystem/registry/adding).
- Si adoptas OpenTelemetry para la observabilidad como usuario final y no
  proporcionas ningún tipo de servicio relacionado con OpenTelemetry, consulta
  [Adoptadores](/ecosystem/adopters).
- Si ofreces una solución que utiliza OpenTelemetry para ofrecer observabilidad
  a los usuarios finales, consulta [Proveedores](/ecosystem/vendors).

{{% /alert %}}

[envia una solicitud de registro]: /docs/contributing/pull-requests/

{{% include keep-up-to-date.md distribution %}}

[componentes]: /docs/concepts/components/
[distribuciones]: /docs/concepts/distributions/
[lista de distribuciones]:
  https://github.com/open-telemetry/opentelemetry.io/tree/main/data/ecosystem/distributions.yaml
[proveedores]: ../vendors/
