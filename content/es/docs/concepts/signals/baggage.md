---
title: Baggage
weight: 4
description: Información contextual que se pasa entre señales.
default_lang_commit: 7c0e4db0b6c39b0ca0e7efb17df5610d1b77b8a3
cSpell:ignore: embedidas
---

En OpenTelemetry, el `Baggage` es información contextual que viaja con el
contexto. El `Baggage` es un almacén de pares clave-valor, lo que significa que
te permite [propagar](../../context-propagation/#propagation) cualquier dato que
desees junto con el [contexto](../../context-propagation/#context).

El `Baggage` te permite pasar datos a través de servicios y procesos,
permitiendo que se puedan añadir a [trazas](../traces/), [métricas](../metrics/)
o [logs](../logs/) en esos servicios.

## Ejemplo {#example}

El `Baggage` se usa a menudo en el trazado distribuido para propagar datos
adicionales entre servicios.

Por ejemplo, imagina que tienes un `clientId` al inicio de una petición, pero te
gustaría que ese ID estuviera disponible en todos los spans de una traza, en
algunas métricas en otro servicio y en algunos logs a lo largo del camino.
Debido a que la traza puede abarcar múltiples servicios, necesitas alguna forma
de propagar esos datos sin necesidad de copiar el `clientId` en diversos lugares
de tu código.

Al usar la [propagación de contexto](../traces/#context-propagation) para pasar
el `Baggage` a través de estos servicios, el `clientId` queda disponible para
que se añada a cualquier span, métrica o log adicionales. Además, las
instrumentaciones se encargan de propagar automáticamente el `Baggage` por ti.

![Baggage en OpenTelemetry](../otel-baggage.svg)

## ¿Para qué debes usar el `Baggage` de OTel? {#what-should-otel-baggage-be-used-for}

El `Baggage` se usa típicamente para incluir información que sólo está
disponible al inicio de una solicitud en los servicios posteriores. Por ejemplo,
se pueden incluir la Identificación de la Cuenta, el ID del Usuario, el ID del
Producto o la IP de origen.

Propagar esta información usando `Baggage` permite un análisis más profundo de
la telemetría en un backend. Por ejemplo, si incluyes información como un ID de
Usuario en un span que rastrea una llamada a una base de datos, puedes responder
con mucha más facilidad a preguntas como: “¿qué usuarios están experimentando
más lentitud en las llamadas a la base de datos?”. También puedes registrar
información sobre una operación posterior adjuntando ese mismo ID de Usuario a
los logs.

![Baggage en OpenTelemetry](../otel-baggage-2.svg)

## Consideraciones de seguridad del `Baggage` {#baggage-security-considerations}

Los elementos sensibles del `Baggage` pueden compartirse con recursos no
deseados, como APIs de terceros. Esto se debe a que la instrumentación
automática incluye el `Baggage` en la mayoría de las solicitudes de red de tu
servicio. Específicamente, el `Baggage` y otras partes del contexto de traza se
envían en encabezados HTTP, haciéndolos visibles para cualquiera que esté
inspeccionando tu tráfico de red. Si el tráfico está restringido dentro de tu
red, este riesgo podría no aplicarse, pero ten en cuenta que los servicios
posteriores podrían propagar el `Baggage` fuera de tu red.

Además, no hay verificaciones de integridad embedidas que permitan asegurar que
los elementos del `Baggage` son tuyos, así que ten precaución al leerlos.

## El `Baggage` no es equivalente a los atributos {#baggage-is-not-the-same-as-attributes}

Es importante notar que el `Baggage` es un almacén separado de pares clave-valor
y, si no se añade explícitamente, no se asocia junto con los atributos a spans,
métricas o logs.

Para añadir `Baggage` a los atributos, debes leer explícitamente los datos del
`Baggage` y añadirlos como atributos a tus spans, métricas o logs.

Dado que uno de los casos de uso comunes del `Baggage` es añadir datos a los
[Atributos de Span](../traces/#attributes) a lo largo de toda una traza, varios
lenguajes tienen `Baggage Span Processors` que añaden datos del `Baggage` como
atributos al crear el span.

> Para más información, consulta la [especificación del
> `Baggage`][baggage specification].

[baggage specification]: /docs/specs/otel/overview/#baggage-signal
