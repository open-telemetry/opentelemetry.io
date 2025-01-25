---
title: Asuntos
description:
  Cómo solucionar un problema existente o informar un error, un riesgo de
  seguridad o una posible mejora.
weight: 10
_issues: https://github.com/open-telemetry/opentelemetry.io/issues
_issue: https://github.com/open-telemetry/opentelemetry.io/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc+label%3A
cSpell:ignore: prepopulated
---

## Solucionando un asunto existente

Una de las mejores maneras de ayudar a mejorar los documentos de OTel es
solucionar un asunto existente.

1. Navegar por la lista de asuntos [issues]({{% param _issues %}}).
2. Seleccione un asunto en el que le gustaría trabajar, idealmente uno que se
   pueda solucionar en poco tiempo.

   <!-- prettier-ignore -->
   <a name="primer-asunto"></a>
   {{% alert title="Contribuyendo por la primera vez? " %}}

   Seleccione un asunto con las siguientes etiquetas:

   - [Buen primer asunto]
   - [Se busca ayuda]

   <!-- prettier-ignore -->
   > **NOTA**: no **_ asignamos asuntos** a aquellos que aún no hayan realizado contribuciones a la organización [OpenTelemetry
   > organization][org], aunque sean parte de un proceso de tutoria o incorporación.
   {.mt-3}

   <!-- prettier-ignore -->
   [buen primer asunto]: {{% param _issue %}}%22good+first+issue%22
   [se busca ayuda]: {{% param _issue %}}%3A%22help+wanted%22
   [org]: https://github.com/open-telemetry

   {{% /alert %}}

3. Lea los comentarios del problema, si los hay.
4. Pregúntele a los encargados del mantenimiento si este asunto sigue siendo
   relevante y haga cualquier pregunta que necesite para aclarar el problema
   publicando comentarios sobre el problema.
5. Comparte tu intención de trabajar en el tema agregando un comentario a este
   efecto.
6. Trabaja para solucionar el problema. Informa a los encargados del
   mantenimiento si tiene algún problema.
7. Cuando este listo,
   [envia tu trabajo enviando un pull request](../pull-requests) (PR).

## Reportar un problema

Si encuentras un error o quieres hacer unas sugerencias para ameliorar el
contenido existente, abre un asunto.

1. Haz click en el enlace **Crea un asunto para la documentación** de cualquier
   documento. Eso te va a redireccionar a una pagina del asunto GitHub
   precargado con algunos encabezados.
2. Describa el problema o la sugerencia de mejora. Proporcione tantos detalles
   como pueda.
3. Haz click en **Submit new issue**.

Después de enviar el problema, verifique su problema de vez en cuando o active
las notificaciones de GitHub. Puede que pasen algunos días hasta que los
encargados del mantenimiento y aprobación respondan. Los revisores y otros
miembros de la comunidad pueden hacer preguntas antes de poder tomar medidas
sobre su problema.

## Sugerir nuevos contenidos o funciones

Si tienes una idea para un nuevo contenido o una nueva función, pero no estás
seguro de dónde debería ir, aún puedes presentar un asunto. También puedes
informar errores y vulnerabilidades de seguridad.

1. Ir a [GitHub](https://github.com/open-telemetry/opentelemetry.io/issues/new/)
   y selecciona **Nuevo asunto** dentro de la pestaña **Asuntos**.

1. Seleccione el tipo de problema que mejor se aplica a su solicitud o duda.

1. Rellene la plantilla.

1. Envia el asunto.

### Como presentar buenos asuntos

Tenga en cuenta lo siguiente al presentar un asunto:

- Proporcione una descripción clara del problema. Describa específicamente qué
  falta, qué está desactualizado, qué está mal o qué necesita mejorarse.
- Explique el impacto específico que tiene el problema en los usuarios.
- Limite el alcance de un problema determinado a una unidad de trabajo
  razonable. En el caso de problemas de gran alcance, divídalos en problemas más
  pequeños. Por ejemplo, "Reparar los documentos de seguridad" es demasiado
  amplio, pero "Agregar detalles al tema 'Restringir el acceso a la red'" es lo
  suficientemente específico como para que se pueda llevar a cabo una acción.
- Busque los problemas existentes para ver si hay algo relacionado o similar al
  nuevo problema.
- Si el nuevo problema se relaciona con otro problema o solicitud de
  incorporación de cambios, haga referencia a él por su URL completa o por el
  número del problema o solicitud de incorporación de cambios precedido por el
  carácter `#`, por ejemplo `Introducido por #987654`.
- Sigue el
  [Código de conducta](https://github.com/open-telemetry/community/blob/main/code-of-conduct.md).
  Respete a sus compañeros colaboradores. Por ejemplo, decir "Los documentos son
  terribles" no es un comentario útil ni cortés.
