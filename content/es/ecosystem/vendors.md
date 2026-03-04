---
title: Proveedores
description: Proveedores que admiten OpenTelemetry de forma nativa
aliases: [/vendors]
default_lang_commit: 8e30c42cfbbc8c5d04ea8715e0c312fd4aa50ab0
---

Lista no exhaustiva de organizaciones que ofrecen soluciones que utilizan
OpenTelemetry de forma nativa mediante [OTLP](/docs/specs/otlp/), como backends
y pipelines de observabilidad.

Algunas organizaciones ofrecen una [distribución](/ecosystem/distributions/) (de
componentes personalizados de OpenTelemetry) que proporciona capacidades
adicionales o facilita su uso.

El código abierto (OSS) se refiere a un proveedor que ofrece un producto de
observabilidad de [código abierto](https://opensource.org/osd). Este proveedor
también puede tener otros productos de código cerrado, como una oferta SaaS que
aloja un producto de código abierto para sus clientes.

{{% ecosystem/vendor-table %}}

## Agregar su organización {#how-to-add}

Para que tu organización aparezca en la lista, [envía una solicitud de
registro][] con una entrada añadida a la [lista de proveedores][]. La entrada
debe incluir lo siguiente:

- Enlace a la documentación que detalla cómo tu oferta utiliza OpenTelemetry de
  forma nativa a través de [OTLP](/docs/specs/otlp/).
- Enlace a tu distribución, si corresponde.
- Enlace que demuestre que tu oferta es de código abierto, si corresponde. Una
  distribución de código abierto no permite que tu oferta se marque como "de
  código abierto".
- Dirección de GitHub o correo electrónico como punto de contacto para que
  podamos contactarte en caso de tener preguntas.

Ten en cuenta que esta lista es para organizaciones que utilizan OpenTelemetry y
ofrecen Observabilidad a [usuarios finales](/community/end-user/).

Si adoptas OpenTelemetry para Observabilidad como
[organización usuaria final](https://www.cncf.io/enduser/) y no ofreces ningún
tipo de servicio relacionado con OpenTelemetry, consulta
[Adoptadores](/ecosystem/adopters/).

Si proporcionas una biblioteca, un servicio o una aplicación que se hace
observable a través de OpenTelemetry, consulta
[Integraciones](/ecosystem/integrations/).

[envía una solicitud de registro]: /docs/contributing/pull-requests/

{{% include keep-up-to-date.md vendor %}}

[lista de proveedores]:
  https://github.com/open-telemetry/opentelemetry.io/tree/main/data/ecosystem/vendors.yaml
