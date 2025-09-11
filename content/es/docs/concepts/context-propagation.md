---
title: Propagación de Contexto
weight: 10
description: Aprende sobre el concepto que habilita el trazado distribuido.
default_lang_commit: 9a1f7271288a46049ae28785f04a67fb77f677f7
---

Con la propagación de contexto, las [señales](../signals/) pueden
correlacionarse entre sí, independientemente de dónde se generen. Aunque no está
limitado a las trazas, la propagación de contexto permite que las
[trazas](../signals/traces/) construyan información causal sobre un sistema a
través de servicios que están distribuidos arbitrariamente a través de límites
de procesos y redes.

Para entender la propagación de contexto, necesitas comprender dos conceptos
separados: contexto y propagación.

## Contexto {#context}

El contexto es un objeto que contiene la información para que el servicio emisor
y receptor, o la
[unidad de ejecución](/docs/specs/otel/glossary/#execution-unit), puedan
correlacionar una señal con otra.

Cuando el Servicio A llama al Servicio B, incluye un ID de traza y un ID de span
como parte del contexto. El Servicio B usa estos valores para crear un nuevo
span que pertenece a la misma traza, estableciendo el span del Servicio A como
su padre. De esta forma, es posible seguir el recorrido completo de una petición
a través de los servicios.

## Propagación {#propagation}

La propagación es el mecanismo que mueve el contexto entre servicios y procesos.
Serializa o deserializa el objeto de contexto y proporciona la información
relevante para ser propagada de un servicio a otro.

La propagación generalmente es manejada por bibliotecas de instrumentación y es
transparente para el usuario. En caso de que necesites propagar manualmente el
contexto, puedes utilizar la
[API de Propagadores](/docs/specs/otel/context/api-propagators/).

OpenTelemetry mantiene varios propagadores oficiales. El propagador
predeterminado utiliza los encabezados especificados por la especificación de
[W3C TraceContext](https://www.w3.org/TR/trace-context/).

## Especificación

Para aprender más sobre la Propagación de Contexto, consulta la
[especificación de Contexto](/docs/specs/otel/context/).
