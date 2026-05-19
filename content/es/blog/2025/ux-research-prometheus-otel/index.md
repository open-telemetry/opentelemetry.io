---
title:
  ¿Cómo Debería Prometheus Manejar los Atributos de Recurso de OpenTelemetry? -
  Un Informe de Investigación UX
linkTitle: ¿Cómo Debería Prometheus Manejar los Atributos de Recurso de OTel?
date: 2025-07-22
author: >-
  [Victoria Nduka](https://github.com/nwanduka)
sig: End User
default_lang_commit: b4b91dc7bdbb03ae1de2c1e276194d98b9d15b94
# prettier-ignore
cSpell:ignore: Beorn cardinalidad conceptualizan correlacionen desenfatizar Kiripolsky Nduka Rabestein stakeholders Suereth superestrellas telescoping Volz
---

<!-- markdownlint-configure-file {"no-shortcut-ref-link": {"ignore_pattern": "^[Ww]ith$"}} -->

El 29 de mayo de 2025, finalicé mi mentoría con Prometheus a través del
[Linux Foundation Mentorship Program](https://mentorship.lfx.linuxfoundation.org/project/36e3f336-ce78-4074-b833-012015eb59be).
Mi proyecto se enfocó en entender cómo Prometheus maneja los atributos de
recurso de OpenTelemetry y cómo esa experiencia podría mejorarse para los
usuarios. Mi trabajo consistió en realizar una investigación de usuarios para
obtener la perspectiva del usuario sobre este desafío. En tres meses, realicé
entrevistas a usuarios y stakeholders, ejecuté una encuesta y analicé los
hallazgos.

En este artículo, compartiré cómo realicé la investigación, qué descubrí y hacia
dónde podrían dirigirse las comunidades involucradas a partir de aquí.

## Contexto del proyecto

OpenTelemetry (OTel) tiene algo llamado
[atributo de recurso](/docs/concepts/resources/), que es información adicional
sobre la fuente de una métrica, como el servicio, el host o el entorno que la
generó. Prometheus, una base de datos de series temporales, usa etiquetas para
identificar y consultar métricas. Si los atributos de recurso se convierten a
etiquetas, pueden causar lo que se conoce como "explosión de cardinalidad",
esencialmente creando demasiadas combinaciones únicas que abruman el sistema.
Esto suele suceder si los atributos cambian con frecuencia o incluyen muchos
valores únicos, como IDs de usuario o nombres de pods.

Actualmente, existen tres enfoques principales para manejar este desafío:

- **Mapear todos los atributos de recurso a etiquetas:** Esto crea problemas de
  explosión de cardinalidad, especialmente para aplicaciones con grandes
  cantidades de atributos o valores de atributos que cambian frecuentemente.
- **Promoción selectiva:** Los usuarios eligen manualmente qué atributos de
  recurso son suficientemente importantes como para convertirse en etiquetas en
  Prometheus.
- **Patrón target info:** Colocar todos los atributos de recurso en una métrica
  separada llamada `target_info`. Cuando los usuarios necesitan consultar
  métricas que involucran atributos de recurso específicos, tienen que realizar
  un "join" entre el target info y sus métricas reales.

Estas no son malas soluciones técnicamente, pero no ofrecen la mejor experiencia
de usuario. Por eso, realicé esta investigación para entender qué podrían estar
pasando por alto los mantenedores de Prometheus sobre la experiencia del
usuario.

Los objetivos de la investigación fueron:

- Entender cómo los ingenieros utilizan actualmente los atributos de recurso de
  OpenTelemetry con Prometheus
- Identificar puntos de dolor en la integración actual
- Descubrir las expectativas de los usuarios sobre cómo deberían representarse
  los atributos de recurso

## Enfoque de investigación

Mi enfoque de investigación fue una combinación de investigación cualitativa y
cuantitativa. Comencé con entrevistas a stakeholders para entender el contexto
histórico y evaluar qué tan abiertos estaban los stakeholders a cambios que
podrían resultar de mi investigación. Los stakeholders con los que hablé
representaban una variedad de roles, desde fundadores y cofundadores de
proyectos, hasta mantenedores de larga data con contexto histórico, y otros más
directamente involucrados en los desafíos actuales alrededor del manejo de
atributos de recurso.

A continuación, realicé entrevistas a usuarios para escuchar directamente de
personas que realmente usan estas herramientas. Finalmente, hice seguimiento con
una encuesta para llegar a una audiencia más amplia y validar lo que escuché en
las entrevistas.

## Perspectivas de las entrevistas a stakeholders

> [!NOTE] Las citas han sido traducidas del inglés original.

Hablé con 6 stakeholders—3 de cada proyecto:

**Stakeholders de Prometheus:**

- [Julius Volz](https://github.com/juliusv) – Cofundador de Prometheus
- [Beorn Rabestein](https://github.com/beorn7) – Mantenedor de larga data de
  Prometheus
- [Richard Hartmann](https://github.com/RichiH) – Cofundador de OpenMetrics y
  mantenedor de Prometheus

**Stakeholders de OpenTelemetry:**

- [Juraci Paixão Kröhling](https://github.com/jpkrohling) – Miembro del Comité
  de Gobernanza de OpenTelemetry
- [Josh Suereth](https://github.com/jsuereth) – Miembro del Comité Técnico de
  OpenTelemetry
- [Austin Parker](https://github.com/austinlparker) – Cofundador de
  OpenTelemetry y miembro del Comité de Gobernanza

Mis conversaciones con stakeholders sacaron a la luz varios descubrimientos
interesantes:

- La comunicación entre las comunidades de Prometheus y OpenTelemetry no siempre
  había sido la mejor y eso les impidió colaborar desde el principio.
- Gran parte de los problemas de interoperabilidad que existen ahora provienen
  de las diferentes bases filosóficas y técnicas sobre las que se construyó cada
  uno de los proyectos.

  > _(Traducción)_ "Si pensamos en situaciones exploratorias o casos de uso,
  > entonces podemos justificar muchas de las decisiones de diseño detrás de
  > OpenTelemetry. Y si pensamos en métricas y escalado, monitoreo, para
  > infraestructura enorme, entonces las decisiones de diseño para Prometheus
  > también están justificadas. Así que ambos tienen muy buenos argumentos." —
  > _Juraci Paixão Kröhling_

  <!-- markdownlint-disable no-shortcut-ref-link -->

  > _(Traducción)_ "Creo que uno de los mayores [problemas de interoperabilidad]
  > es la diferencia entre push y pull." — _Julius Volz_

  Julius luego elaboró que su preocupación va más allá del mecanismo de entrega
  en sí. En sus palabras:

  > _(Traducción)_ "Una de las mayores desventajas de usar OTLP para enviar
  > métricas a Prometheus es que terminas desechando una de las características
  > principales de Prometheus como sistema de monitoreo: su modelo de
  > recolección de métricas basado en pull que se basa en información de
  > descubrimiento de servicios dinámica (por lo que Prometheus siempre sabe qué
  > targets deberían existir actualmente), y el resultante monitoreo automático
  > de salud de targets a través de la métrica sintética 'up' que se genera para
  > cada scrape de target."

- Hay un reconocimiento compartido de la importancia de poner las necesidades
  del usuario primero, incluso mientras se mantienen algunos aspectos no
  negociables (por ejemplo, que Prometheus mantenga su modelo pull y no aliene a
  los usuarios existentes).

Una conclusión clave de las entrevistas para mí fue darme cuenta de que los
problemas actuales de interoperabilidad no son fallos, sino el resultado natural
de diferentes comunidades resolviendo diferentes problemas en diferentes
momentos. Y es bueno ver que ambos proyectos están trabajando juntos ahora para
mejorar la experiencia del usuario.

## Perspectivas de las entrevistas a usuarios

Las entrevistas a usuarios fueron tan reveladoras como las conversaciones con
stakeholders. Mi objetivo era hablar con alrededor de 10 usuarios (ciertamente
ambicioso) pero logré entrevistar a 7, y todos compartieron perspectivas
increíblemente útiles.

El punto de dolor más prominente que los usuarios compartieron fue la
complejidad de realizar joins con la integración actual. Otro problema
mencionado fue la discrepancia en los nombres de métricas causada por las
limitaciones del conjunto de caracteres, pero entiendo que eso ya se ha
abordado, ya que las versiones recientes de Prometheus ahora soportan caracteres
UTF-8 (aunque esto introduce la necesidad de la sintaxis de selector entre
comillas más engorrosa en PromQL).

Respecto a los modelos mentales, muchos usuarios (tanto entrevistados como
encuestados) no distinguen entre atributos de recurso y etiquetas de Prometheus.
Tienden a pensar en ellos como lo mismo.

> _(Traducción)_ "Esperaría que los atributos de recurso por regla se trataran
> exactamente de la misma manera que los atributos adjuntos al tracer, a la
> métrica... No trazaría una frontera entre ellos." — _Participante de
> Entrevista 1_

También aprendí sobre las diversas soluciones alternativas que las personas usan
para manejar problemas de atributos de recurso en sus casos de uso específicos.
Algunos promueven atributos de recurso seleccionados a etiquetas, otros manejan
la conversión a nivel del OpenTelemetry-Collector para evitar lidiar con ello en
Prometheus, y algunos convierten todos los atributos, aunque generalmente solo
cuando el número de atributos es pequeño.

## Perspectivas de la encuesta

La encuesta me ayudó a cuantificar lo que estaba escuchando en las entrevistas y
llegar a una audiencia más amplia. Al momento de escribir esto, hemos tenido 134
respuestas, con 61 de nuestro grupo objetivo—personas que usan OTel y Prometheus
juntos.

Aquí están los hallazgos clave:

- Los usuarios no conceptualizan los atributos de recurso como diferentes de las
  etiquetas regulares, sin embargo, la implementación actual los trata como
  metadatos separados.
- La sintaxis compleja de join es una gran barrera para la adopción, lo que hace
  que al desarrollador común le cueste escribir consultas básicas que accedan a
  atributos de recurso.
- La promoción manual de atributos crea una sobrecarga operacional que escala
  mal con el tamaño del equipo y la complejidad.
- El 78% de los encuestados encuentran las brechas de documentación un desafío
  en su uso de atributos de recurso.

![Un gráfico de barras mostrando desafíos con los atributos de recurso de OpenTelemetry en Prometheus](../../../en/blog/2025/ux-research-prometheus-otel/Chart.PNG)

Los patrones de la encuesta fueron consistentes con lo que surgió de mi
investigación cualitativa. Para resultados detallados, consulta las
[respuestas anonimizadas de la encuesta](https://github.com/prometheus-community/ux-research/blob/acc0194a79aa0f2ee1c6eb93462c9488d236a275/prom-otel-research/survey-results.csv?from_branch=main)

## Lo que no esperaba aprender (pero aprendí)

Comencé esta investigación para entender los puntos de dolor de los usuarios con
el manejo de atributos de recurso, pero descubrí algunos hallazgos inesperados e
importantes.

Uno de los más sorprendentes fue darme cuenta de que
[la característica de Detección de Recursos de OpenTelemetry](/docs/specs/otel/resource/#telescoping)
permite a los usuarios retener o descartar selectivamente atributos de recurso
según su relevancia usando un patrón conceptual a veces denominado
"telescoping". A pesar de su potencial, muchos usuarios e incluso algunos
miembros de la comunidad de Prometheus parecen no estar al tanto de ello. Esta
falta de conciencia puede haber contribuido a la adopción del patrón "join", que
desde entonces ha demostrado ser problemático.

Esto destaca un problema más amplio: las brechas de documentación y educación
son una barrera importante. En nuestra encuesta, el 78% de los encuestados citó
las brechas de documentación como un desafío.

Otra realización clave es que las decisiones de integración anteriores, como la
dependencia de joins, se tomaron sin una comprensión completa de las capacidades
de cada herramienta, una consecuencia inevitable de la falta de colaboración y
comunicación temprana entre las comunidades de Prometheus y OpenTelemetry.

## Soluciones recomendadas

Basándome en conversaciones con stakeholders y usuarios finales, aquí están
algunas de las soluciones propuestas, agrupadas por lo que es factible a corto
plazo vs. lo que es parte de una visión a largo plazo:

### Soluciones a corto plazo

- **Documentación mejorada para el manejo de atributos** Dado que los usuarios
  encuentran más fácil promover atributos que hacer join en target info, puede
  valer la pena desenfatizar (o incluso discontinuar) la documentación sobre
  joins, mientras se hace la
  [documentación de promoción de atributos](https://prometheus.io/docs/guides/opentelemetry/#promoting-resource-attributes)
  más prominente para aquellos que aún no están al tanto de la opción. El patrón
  telescoping de detección de recursos en OpenTelemetry también merece más
  visibilidad y documentación adecuada. Además, los usuarios han sugerido crear
  documentación consolidada Prometheus–OpenTelemetry que explique claramente
  cómo ambos sistemas manejan los atributos de recurso.

### Visión a largo plazo

- **Marco de entidades** El concepto en desarrollo de entidades de OpenTelemetry
  podría ayudar a Prometheus a distinguir entre atributos identificadores vs.
  descriptivos. Esto guiaría qué atributos se convierten en etiquetas y cuáles
  se almacenan o filtran.

- **Almacenamiento de metadatos** Los stakeholders también discutieron la idea
  de agregar soporte de metadatos de primera clase a Prometheus mismo. Esto
  permitiría que ciertos atributos de recurso se almacenen como metadatos (no
  etiquetas), evitando costos de cardinalidad mientras se mantiene la
  información disponible para consultas o joins.

- **Expandir para telemetría exploratoria** Esto podría ser ambicioso, pero
  Prometheus podría considerar expandir su alcance para soportar mejor casos de
  uso de telemetría exploratoria. Los stakeholders mostraron apertura al cambio,
  siempre que la arquitectura central de Prometheus permanezca intacta y los
  usuarios existentes no sean alienados. Eso sugiere que puede haber espacio
  para la evolución, especialmente si las nuevas capacidades pueden
  complementar, en lugar de reemplazar, el comportamiento actual.

  > _(Traducción)_ Veo a OTel y Prometheus como provenientes de supuestos muy
  > diferentes sobre cómo debería funcionar la telemetría en general. Entonces,
  > mientras que Prometheus es muy opinado sobre el almacenamiento de series
  > temporales...OTel, por otro lado, proviene de un contexto de tracing, lo que
  > significa que es más explorativo que Prometheus. Así que [con] Prometheus,
  > más o menos sé de antemano lo que necesito. [Con] OpenTelemetry, no sé lo
  > que podría necesitar, así que almaceno todo. — _Juraci Paixão Kröhling_

- **Correlación entre señales** Los usuarios mencionan usar plataformas que
  pueden ingerir todos los tipos de telemetría y correlacionar métricas, trazas
  y logs dentro de un único sistema. Aunque Prometheus probablemente permanecerá
  enfocado solo en métricas, podría habilitar herramientas que correlacionen
  métricas con telemetría almacenada en otras bases de datos. Prometheus
  actualmente soporta
  [exemplars](https://prometheus.io/docs/specs/om/open_metrics_spec/#exemplars),
  que permiten vincular métricas con trazas, pero eso es aproximadamente el
  alcance de su ámbito. Dependen de que el tracing esté presente, lo que los
  hace menos útiles en entornos donde las trazas no están disponibles o
  instrumentadas.

  > _(Traducción)_ "Una de las cosas clave innovadoras en OpenCensus era... que
  > podías dividir el uso de CPU por qué solicitudes estaban usando CPU y
  > obtener una métrica que dijera, 'aquí está el uso de CPU por solicitud.' Eso
  > es algo que podías lograr en OpenCensus porque todo estaba basado en
  > contexto." — _Josh Suereth_

Todavía hay trabajo por hacer. Las comunidades necesitarán tiempo para
desarrollar y probar soluciones. Pero estoy orgullosa de que esta investigación
haya proporcionado una base centrada en el usuario para ese trabajo.

Si estás interesado en las discusiones, propuestas y retroalimentación en curso
alrededor de estas ideas, puedes consultar el repositorio de GitHub donde todo
está siendo documentado:
[OpenTelemetry Resource Attributes in Prometheus UX Research](https://github.com/prometheus-community/ux-research/tree/a2f8c6684321fd04de7b94cfbd39a48bb1d7beb4/prom-otel-research?from_branch=main)

## Agradecimientos {#acknowledgments}

Esta publicación estaría incompleta sin reconocer a mis increíbles mentores:
[Amy Super](https://github.com/amy-super),
[Andrej Kiripolsky](https://github.com/AndrejKiri), y
[Arthur Silva Sens](https://github.com/ArthurSens) – gracias por confiar en mí
con este desafiante proyecto y preocuparse tan profundamente por mi trayectoria
profesional. Ustedes son las verdaderas superestrellas.

A todos los stakeholders y usuarios que dieron su tiempo: gracias por
comprometerse con este trabajo y confiar en mí con su retroalimentación honesta.
Sus perspectivas hicieron que esta investigación fuera significativa.

## Qué sigue para mí

Me entusiasma seguir trabajando en la intersección de UX y sistemas cloud
native. Si conoces oportunidades similares a esta mentoría, ¡me encantaría saber
de ti! Soy una trabajadora dedicada—solo pregúntales a mis mentores.
