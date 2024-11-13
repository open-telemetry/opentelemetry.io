---
title: Propagación de contexto
weight: 10
description: Aprende sobre el concepto que habilita el trazado distribuido.
default_lang_commit: 4966f752eb35f97c095ed1c813972c2ab38f0b1a
---

Con la propagación de contexto, [Señales](/docs/concepts/signals) pueden
correlacionarse entre sí, independientemente de dónde se generen. Aunque no está
limitado a las trazas, la propagación de contexto permite que las
[trazas](/docs/concepts/signals/traces) construyan información causal sobre un
sistema a través de servicios que están distribuidos arbitrariamente a través de
límites de procesos y redes.

Para entender la propagación de contexto, necesitas comprender dos conceptos
separados: contexto y propagación.

## Contexto {#context}

El contexto es un objeto que contiene la información para que el servicio emisor
y receptor, o la
[unidad de ejecución](/docs/specs/otel/glossary/#execution-unit), puedan
correlacionar una señal con otra.

Por ejemplo, si el servicio A llama al servicio B, entonces un span del servicio
A cuyo ID está en el contexto será usado como el span padre para el próximo span
creado en el servicio B. El ID de traza que está en el contexto también se usará
para el siguiente span creado en el servicio B, lo que significa que el span es
parte de la misma traza que el span del servicio A.

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
