---
title: Integraciones
description:
  Bibliotecas, servicios y aplicaciones con soporte propio para OpenTelemetry.
aliases: [/integrations]
default_lang_commit: 8e30c42cfbbc8c5d04ea8715e0c312fd4aa50ab0
---

La misión de OpenTelemetry es
[facilitar una observabilidad eficaz haciendo que la telemetría portátil y de alta calidad sea ubicua](/community/mission/).
En otras palabras, la observabilidad debe estar integrada en el software que
desarrollas.

Si bien la instrumentación externa a través de
[soluciones de instrumentación sin código](/docs/concepts/instrumentation/zero-code)
y
[bibliotecas de instrumentación](/docs/specs/otel/overview/#instrumentation-libraries)
ofrece una forma práctica de que tu aplicación sea observable, creemos que en
última instancia, todas las aplicaciones deberían integrar las API y los SDK de
OpenTelemetry directamente para la telemetría nativa, o proporcionar un
complemento propio que se integre en el ecosistema del software en cuestión.

Esta página contiene una muestra de bibliotecas, servicios y aplicaciones que
ofrecen instrumentación nativa o complementos de primera clase.

## Bibliotecas {#libraries}

La instrumentación nativa de bibliotecas con OpenTelemetry proporciona una mejor
observabilidad y una mejor experiencia de desarrollo para los usuarios,
eliminando la necesidad de que las bibliotecas expongan y documenten enlaces. A
continuación, encontrarás una lista de bibliotecas que utilizan la API de
OpenTelemetry para proporcionar observabilidad inmediata.

{{% ecosystem/integrations-table "native libraries" %}}

## Aplicaciones y servicios {#applications-and-services}

La siguiente lista contiene una muestra de bibliotecas, servicios y aplicaciones
que integran directamente las API y SDK de OpenTelemetry para telemetría nativa
o que proporcionan un complemento propio que se integra en su propio ecosistema
de extensibilidad.

Los proyectos de código abierto (OSS) se encuentran al principio de la lista,
seguidos por los proyectos comerciales. Los proyectos que forman parte de
[CNCF](https://www.cncf.io/) tienen el logotipo de CNCF junto a su nombre.

{{% ecosystem/integrations-table "application integrations" %}}

## Añadiendo tu integración {#how-to-add}

Para que tu biblioteca, servicio o aplicación aparezca en la lista, [envía una
solicitud de registro][] con una entrada añadida al
[registro](/ecosystem/registry/adding). La entrada debe incluir lo siguiente:

- Enlace a la página principal de tu biblioteca, servicio o aplicación
- Enlace a la documentación que explica cómo habilitar la observabilidad con
  OpenTelemetry

{{% alert title="Nota" %}}

Si proporcionas integración externa de OpenTelemetry para cualquier tipo de
biblioteca, servicio o aplicación,
[considera añadirlo al registro](/ecosystem/registry/adding).

Si adoptas OpenTelemetry para la observabilidad como usuario final y no
proporcionas ningún tipo de servicio en torno a OpenTelemetry, consulta
[Adoptadores](/ecosystem/adopters).

Si proporcionas una solución que utiliza OpenTelemetry para ofrecer
observabilidad a los usuarios finales, consulta
[Proveedores](/ecosystem/vendors).

{{% /alert %}}

[envía una solicitud de registro]: /docs/contributing/pull-requests/

{{% include keep-up-to-date.md integration %}}
