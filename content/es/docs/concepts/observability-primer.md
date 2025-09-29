---
title: Introducción a la Observabilidad
description: Conceptos básicos de observabilidad.
weight: 9
default_lang_commit: e58a252c44875b04247b53e2394b4634f5a0a84e
cSpell:ignore: webshop
---

## ¿Qué es la observabilidad? {#what-is-observability}

La observabilidad te permite entender un sistema desde el exterior al permitirte
hacer preguntas sobre ese sistema sin conocer su funcionamiento interno. Además,
te permite solucionar problemas nuevos con facilidad, es decir, "lo que no
sabemos que no sabemos". También te ayuda a responder a la pregunta: "¿Por qué
está ocurriendo esto?"

Para hacer esas preguntas sobre tu sistema, tu aplicación debe estar
adecuadamente instrumentada. Es decir, el código de la aplicación debe emitir
[señales](/docs/concepts/signals/) como
[trazas](/docs/concepts/signals/traces/),
[métricas](/docs/concepts/signals/metrics/) y
[logs](/docs/concepts/signals/logs/). Una aplicación está adecuadamente
instrumentada cuando los desarrolladores no necesitan agregar más
instrumentación para solucionar un problema, porque ya tienen toda la
información que necesitan.

[OpenTelemetry](/docs/what-is-opentelemetry/) es el mecanismo por el cual el
código de la aplicación se instrumenta para ayudar a hacer un sistema
observable.

## Confiabilidad y métricas

**Telemetría** se refiere a los datos emitidos por un sistema y su
comportamiento. Los datos pueden venir en forma de
[trazas](/docs/concepts/signals/traces/),
[métricas](/docs/concepts/signals/metrics/) y
[logs](/docs/concepts/signals/logs/).

**Confiabilidad** responde a la pregunta: "¿Está el servicio haciendo lo que los
usuarios esperan que haga?" Un sistema podría estar funcionando el 100% del
tiempo, pero si, cuando un usuario hace clic en "Agregar al carrito" para añadir
un par de zapatos negros a su carrito, el sistema no siempre agrega los zapatos
negros, entonces el sistema podría ser **no** confiable.

**Métricas** son agregaciones durante un período de tiempo de datos numéricos
sobre tu infraestructura o aplicación. Por ejemplo: tasa de error del sistema,
uso de CPU y tasa de solicitudes para un servicio determinado. Para más
información sobre métricas y cómo se relacionan con OpenTelemetry, consulta
[Métricas](/docs/concepts/signals/metrics/).

**SLI**, o Indicador de Nivel de Servicio, representa una medición del
comportamiento de un servicio. Un buen SLI mide tu servicio desde la perspectiva
de tus usuarios. Un ejemplo de SLI puede ser la velocidad con la que se carga
una página web.

**SLO**, u Objetivo de Nivel de Servicio, representa el medio por el cual la
confiabilidad se comunica a una organización u otros equipos. Esto se logra
adjuntando uno o más SLIs al valor comercial.

## Entendiendo el trazado distribuido

El trazado distribuido te permite observar las solicitudes a medida que se
propagan a través de sistemas complejos y distribuidos. El trazado distribuido
mejora la visibilidad de la salud de tu aplicación o sistema y te permite
depurar comportamientos que son difíciles de reproducir localmente. Es esencial
para sistemas distribuidos, que comúnmente tienen problemas no determinísticos o
son demasiado complicados para reproducir localmente.

Para entender el trazado distribuido, necesitas comprender el papel de cada uno
de sus componentes: logs, spans y trazas.

### Logs

Un **log** es un mensaje con marca de tiempo emitido por servicios u otros
componentes. A diferencia de las [trazas](#distributed-traces), no están
necesariamente asociados con una solicitud o transacción de usuario en
particular. Los logs se pueden encontrar casi en cualquier parte del software.
Los logs han sido ampliamente utilizados en el pasado tanto por desarrolladores
como operadores para ayudarles a entender el comportamiento del sistema.

Ejemplo de un log:

```text
I, [2021-02-23T13:26:23.505892 #22473]  INFO -- : [6459ffe1-ea53-4044-aaa3-bf902868f730] Started GET "/" for ::1 at 2021-02-23 13:26:23 -0800
```

Los logs no son suficientes para rastrear la ejecución del código, ya que
normalmente carecen de información contextual, como dónde fueron llamados.

Se vuelven mucho más útiles cuando se incluyen como parte de un span o cuando se
correlacionan con una traza y un span.

Para más información sobre los logs y cómo se relacionan con OpenTelemetry,
consulta Logs.

### Spans

Un **span** representa una unidad de trabajo u operación. Los spans rastrean
operaciones específicas que realiza una solicitud, mostrando qué sucedió durante
el tiempo en que se ejecutó esa operación.

Un span contiene nombre, datos relacionados con el tiempo,
[mensajes de log estructurados](/docs/concepts/signals/traces/#span-events) y
[otros metadatos (es decir, atributos)](/docs/concepts/signals/traces/#attributes)
para proporcionar información sobre la operación que rastrea.

#### Atributos de span

Los atributos de span son metadatos adjuntos a un span.

La siguiente tabla contiene ejemplos de atributos de span:

| Clave                       | Valor                                                                              |
| :-------------------------- | :--------------------------------------------------------------------------------- |
| `http.request.method`       | `"GET"`                                                                            |
| `network.protocol.version`  | `"1.1"`                                                                            |
| `url.path`                  | `"/webshop/articles/4"`                                                            |
| `url.query`                 | `"?s=1"`                                                                           |
| `server.address`            | `"example.com"`                                                                    |
| `server.port`               | `8080`                                                                             |
| `url.scheme`                | `"https"`                                                                          |
| `http.route`                | `"/webshop/articles/:article_id"`                                                  |
| `http.response.status_code` | `200`                                                                              |
| `client.address`            | `"192.0.2.4"`                                                                      |
| `client.socket.address`     | `"192.0.2.5"` (el cliente pasa por un proxy)                                       |
| `user_agent.original`       | `"Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:72.0) Gecko/20100101 Firefox/72.0"` |

Para más información sobre los spans y cómo se relacionan con OpenTelemetry,
consulta [Spans](/docs/concepts/signals/traces/#spans).

### Trazas distribuidas {#distributed-traces}

Una **traza distribuida**, más comúnmente conocida como **traza**, registra los
caminos tomados por las solicitudes (realizadas por una aplicación o un usuario
final) a medida que se propagan a través de arquitecturas multi-servicio, como
aplicaciones de microservicios y sin servidor.

Una traza está compuesta por uno o más spans. El primer span representa el span
raíz. Cada span raíz representa una solicitud desde el inicio hasta el final.
Los spans debajo del span principal proporcionan un contexto más detallado de lo
que ocurre durante una solicitud (o los pasos que componen una solicitud).

Sin el trazado, encontrar la causa raíz de los problemas de rendimiento en un
sistema distribuido puede ser un desafío. El trazado hace que depurar y
comprender los sistemas distribuidos sea menos abrumador al desglosar lo que
sucede dentro de una solicitud a medida que fluye a través de un sistema
distribuido.

Muchos sistemas de observabilidad visualizan las trazas como diagramas de
cascada que se ven así:

![Trazado Ejemplo](/img/waterfall-trace.svg 'Diagrama de cascada de trazas')

Los diagramas de cascada muestran la relación padre-hijo entre un span raíz y
sus spans hijos. Cuando un span encapsula otro span, esto también representa una
relación anidada.

Para más información sobre las trazas y cómo se relacionan con OpenTelemetry,
consulta [Trazas](/docs/concepts/signals/traces/).
