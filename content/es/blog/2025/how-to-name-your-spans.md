---
title: Cómo nombrar tus spans
linkTitle: Cómo nombrar tus spans
date: 2025-08-11
author: >-
  [Juraci Paixão Kröhling](https://github.com/jpkrohling) (OllyGarden)
canonical_url: https://blog.olly.garden/how-to-name-your-spans
default_lang_commit: 79619e1eba717a87f893989b5d016c3ddb4fb4e9
cSpell:ignore: Agregable cardinalidad jpkrohling OllyGarden SemConv
---

Uno de los aspectos más fundamentales - y a menudo pasados por alto - de una
buena instrumentación es la nomenclatura. Esta publicación es la primera de una
serie dedicada al arte y la ciencia de nombrar cosas en OpenTelemetry.
Comenzaremos con los spans, los bloques de construcción de una traza
distribuida, y te daremos desde el inicio la conclusión más importante: cómo
nombrar los spans que describen tu lógica de negocio única.

## Nombrando tus spans de negocio {#naming-your-business-spans}

Si bien la instrumentación automática de OpenTelemetry es fantástica para cubrir
operaciones estándar (como solicitudes HTTP entrantes o llamadas a la base de
datos), los conocimientos más valiosos suelen provenir de los spans
personalizados que agregas a tu propia lógica de negocio. Estas son las
operaciones únicas de tu dominio de aplicación.

Para estos spans personalizados, recomendamos un patrón inspirado en la
gramática básica. Las oraciones simples y claras suelen seguir una estructura
sujeto -> verbo -> objeto directo. El "sujeto" (el servicio que realiza el
trabajo) ya forma parte del contexto de la traza. Podemos usar el resto de esa
estructura para el nombre del span:

## {verbo} {objeto} {#verb-object}

Este patrón es descriptivo, fácil de entender y ayuda a mantener baja la
[cardinalidad](/docs/concepts/glossary/#cardinality) - un concepto crucial que
veremos más adelante.

- **{verbo}**: Un verbo que describe el trabajo que se está realizando (por
  ejemplo: procesar, enviar, calcular, renderizar).
- **{objeto}**: Un sustantivo que describe sobre qué se actúa (por ejemplo:
  pago, factura, carrito_de_compras, anuncio).

Veamos algunos ejemplos:

| Nombre incorrecto                                | Nombre de span recomendado | Por qué es mejor                                                                             |
| :----------------------------------------------- | :------------------------- | :------------------------------------------------------------------------------------------- |
| procesar_pago_para_usuario_jane_doe              | procesar pago              | El verbo y el objeto son claros. El ID de usuario debe ir en un atributo.                    |
| enviar*factura*#98765                            | enviar factura             | Agregable. Es fácil encontrar la latencia P95 para el envío de todas las facturas.           |
| renderizar_anuncio_para_campaña_verano_de_ventas | renderizar anuncio         | La campaña específica es un detalle, no la operación principal. Ponlo en un atributo.        |
| calcular_envío_para_zip_90210                    | calcular envío             | La operación es consistente. El código postal es un parámetro, no parte del nombre.          |
| validación_fallida                               | validar entrada_usuario    | Focalizarse en la operación, no en el resultado. El resultado debe ir en el estado del span. |

Al seguir el formato `{verbo} {objeto}`, creas un vocabulario claro y
consistente para tus operaciones de negocio. Esto hace que tus trazas sean
increíblemente poderosas. Un gerente de producto podría preguntar: "¿Cuánto
tiempo se tarda en procesar pagos?" y un ingeniero puede filtrar inmediatamente
por esos spans y obtener una respuesta.

## Por qué este patrón funciona {#why-this-pattern-works}

Entonces, ¿por qué `procesar pago` es bueno y `procesar_factura_#98765` es malo?
La razón es la **cardinalidad**.

La cardinalidad se refiere al número de valores únicos que un dato puede tener.
El nombre de un span debe tener **baja cardinalidad**. Si incluye
identificadores únicos como un ID de usuario o un número de factura en el nombre
del span, crearás un nombre distinto para cada operación. Esto sobrecarga tu
_backend_ de observabilidad, dificulta el agrupamiento y análisis de operaciones
similares, y puede aumentar significativamente tus costos.

El patrón `{verbo} {objeto}` produce nombres con baja cardinalidad de forma
natural. Los detalles únicos y de alta cardinalidad
(`factura_#98765, usuario_jane_doe`) deben ir en **atributos de span**, tema que
veremos en una publicación futura.

## Aprendiendo de las Convenciones Semánticas {#learning-from-semantic-conventions}

Este enfoque de `{verbo} {objeto}` no es arbitrario. Es una buena práctica que
refleja los principios detrás de las **Convenciones Semánticas de OpenTelemetry
(SemConv)**. SemConv proporciona un conjunto estandarizado de nombres para
operaciones comunes, asegurando que un span para una solicitud HTTP se nombre de
manera consistente, sin importar el lenguaje o _framework_.

Si lo analizas de cerca, verás este mismo patrón de describir una operación
sobre un recurso repetido en las convenciones. Al seguirlo para tus spans
personalizados, te alineas con la filosofía establecida en todo el ecosistema
OpenTelemetry.

Veamos algunos ejemplos de SemConv.

### Spans HTTP

Para spans HTTP del lado del servidor, la convención es `{método} {ruta}`.

- **Ejemplo:** `GET /api/users/:ID`
- **Análisis:** Es un verbo (`GET`) actuando sobre un objeto (`/api/users/:id`).
  El uso de una plantilla de ruta en lugar de la ruta real (`/api/users/123`) es
  un excelente ejemplo de cómo mantener baja la cardinalidad.

### Spans de base de datos {#database-spans}

Los spans de base de datos suelen seguir
`{db.operation} {db.name}.{db.sql.table}`.

- **Ejemplo:** `INSERT my_database.users`
- **Análisis:** Es un verbo (`INSERT`) actuando sobre un objeto
  (`my_database.users`). Los valores específicos insertados son de alta
  cardinalidad y, por lo tanto, se excluyen del nombre.

### Spans RPC

Para _Remote Procedure Calls (RPC)_, la convención es
`{rpc.system}/{rpc.method}`.

- **Ejemplo:** `com.example.UserService/GetUser`
- **Análisis:** Aunque el formato es diferente, el principio es el mismo.
  Describe un método (`GetUser`), que es un verbo, dentro de un servicio
  (`com.example.UserService`), que es el objeto o recurso.

La idea clave es que al usar `{verbo} {objeto}`, hablas el mismo "idioma" que el
resto de tu instrumentación.

## Cultivando un sistema saludable {#cultivating-a-healthy-system}

Nombrar spans no es una tarea trivial. Es una práctica fundamental para
construir una estrategia de observabilidad sólida y efectiva. Al adoptar un
patrón claro y consistente como `{verbo} {objeto}` para tus spans específicos de
negocio, puedes transformar tus datos de telemetría de un enredo confuso a un
jardín bien cuidado.

Un span bien nombrado es un regalo para tu yo del futuro y para tu equipo.
Aporta claridad durante incidentes estresantes, permite análisis de rendimiento
potentes y, en última instancia, te ayuda a construir software mejor y más
confiable.

En la próxima publicación de esta serie, profundizaremos en la siguiente capa de
detalle: **atributos de span**. Exploraremos cómo agregar el contexto rico y de
alta cardinalidad necesario para una depuración profunda, sin comprometer la
capacidad de agregación de los nombres de tus spans.
