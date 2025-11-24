---
title: Cómo contribuir a OpenTelemetry
linkTitle: Cómo contribuir a OpenTelemetry
date: 2025-09-15
author: >-
  [Marylia Gutierrez](https://github.com/maryliag) (Grafana Labs)
default_lang_commit: 9383da27dd1d08b0c47e2792376dbd6ebbac1192 # patched
drifted_from_default: true
cSpell:ignore: marylia
---

Quizás hayas oído hablar de OpenTelemetry, lo encontraste interesante y quieres
involucrarte, pero el camino hacia la contribución no es inmediatamente claro.
Puede que empieces a enviar mensajes a personas pidiendo que te asignen
_issues_, o simplemente anunciar diciendo "Estoy aquí para ayudar, solo
avísenme", pero nunca recibes respuesta. Entonces, ¿cómo puedes empezar
realmente a contribuir a OpenTelemetry?

El _open source_ prospera gracias a la comunidad, al apoyo mutuo y al desarrollo
colaborativo de tecnología innovadora. Pero también trae desafíos, especialmente
si eres nuevo en este ecosistema.

## Dinámica de las contribuciones en _open source_ {#open-source-contribution-dynamics}

En el _open source_, tú eres el arquitecto de tu propio camino de contribución.
Nadie asignará tareas ni dictará cada uno de tus pasos. En cambio, debes ser
proactivo, identificar áreas donde se necesita ayuda y tomar la iniciativa de
trabajar en ellas.

Es crucial entender que las contribuciones en _open source_ difieren de un
trabajo tradicional, donde un gerente o _tech lead_ asigna tareas. En _open
source_, la decisión de en qué trabajar recae en ti.

## Identificar tu área de contribución {#identifying-your-contribution-area}

Puedes querer contribuir por diferentes motivos: desarrollar una funcionalidad
esencial para tu organización; resolver un _bug_ en un componente que usas
activamente; adquirir nuevas habilidades y ampliar tu base de conocimientos;
convertirte en un miembro activo de una comunidad vibrante y colaborativa;
expandir tus conexiones profesionales dentro de la industria tecnológica, etc.

Empieza explorando áreas dentro de OpenTelemetry que se alineen con tu
experiencia existente o que despierten tu curiosidad. OpenTelemetry es un
proyecto enorme, que abarca numerosos componentes, diversos lenguajes de
programación y características con distintos niveles de complejidad. Considera
qué es lo que más resuena contigo.

En esta página se listan todos los SIG existentes con sus respectivos canales de
Slack y horarios de reunión: [SIGs][sigs]. También puedes suscribirte al
calendario de OpenTelemetry y revisar las reuniones que te interesen:
[Calendar][calendar].

Aunque pueda resultar tentador elegir repositorios muy activos, ya que
probablemente recibirás más rápido comentarios en tu _pull request_ y respuestas
a tus preguntas, no pases por alto los menos activos, porque realmente se
beneficiarían de la ayuda. Si tu objetivo a largo plazo es alcanzar un estatus
como "Approver" o "Maintainer", contribuir en repositorios menos activos puede
acelerar este proceso debido al mayor impacto que tendrán tus aportes. Puedes
obtener más información sobre los niveles de membresía aquí:
[Membership][membership].

Para quienes recién comienzan, buscar _issues_ marcados como "_good first
issue_" dentro de esos repositorios es una excelente estrategia. Estos _issues_
suelen estar diseñados para ser accesibles a nuevos colaboradores, ofreciendo un
punto de entrada manejable al proyecto.

Si no estás seguro por dónde empezar a contribuir, la documentación es un
excelente punto inicial, ya que beneficia directamente a una amplia audiencia.
Puedes ver más detalles sobre cómo contribuir a la documentación aquí:
[Contributing][contrib], lo que incluye los esfuerzos de
[localización][localization].

Otro gran punto de partida es unirte a un Grupo de Interés Especial (SIG) dentro
de OpenTelemetry. Estos grupos se centran en áreas específicas del proyecto. Al
involucrarte en un SIG, obtendrás información sobre sus prioridades actuales e
identificarás tareas relevantes. No sientas que debes hablar en esas reuniones
desde el primer momento, ¡no hay presión! Puedes presentarte si lo deseas, pero
en general basta con unirte, escuchar y determinar si el área te interesa. Si es
así, luego puedes comenzar a participar en las discusiones o proponer tus
propios temas.

## Contribuciones de mayor impacto {#substantial-contributions}

Si estás considerando realizar una contribución más significativa o novedosa, es
aconsejable consultarlo con los _maintainers_ del SIG correspondiente. Ellos
pueden darte aportes valiosos y ayudarte a determinar si tu propuesta se alinea
con los objetivos actuales del proyecto y si tiene sentido que la emprendas en
ese momento.

Todos los repositorios de OpenTelemetry pueden encontrarse en [OTel
Repositories][repos]. Esta página ofrece una visión general de cada repositorio,
incluyendo los lenguajes de programación utilizados y una breve descripción.

La mayoría de los repositorios de OpenTelemetry incluyen una pestaña
"_contributing_". Esta pestaña ofrece orientación específica para el
repositorio, cubriendo información esencial como dependencias, instrucciones
para ejecutar tests localmente y otros procedimientos de configuración. Si
encuentras información faltante en estos documentos de contribución, no dudes en
hacer preguntas en los respectivos [canales de Slack][slack].

Durante tu camino de contribución, podrías identificar vacíos o áreas de mejora
en la documentación de contribución existente. Esto presenta una valiosa
oportunidad para colaborar creando un _pull request_ que agregue la información
faltante. Al hacerlo, no solo estarás aportando al proyecto, sino que también
ayudarás significativamente a futuros colaboradores que puedan tener las mismas
preguntas. Las contribuciones a la documentación son tan importantes como las
contribuciones de código.

## Reflexiones finales {#final-thoughts}

Una vez que decidas en qué trabajar, siempre puedes pedir ayuda. Recuerda que la
comunidad de OpenTelemetry es un recurso poderoso, y hay muchas personas
dispuestas a ofrecer orientación.

Si tienes ideas sobre cómo mejorar la experiencia general de los colaboradores
de OpenTelemetry, te animamos a compartirlas en el canal de Slack
`#otel-contributor-experience`. Tus sugerencias son muy valiosas y pueden ayudar
a crear un entorno más acogedor y eficiente para todos los involucrados.

¡Felices contribuciones!

[sigs]:
  https://github.com/open-telemetry/community?tab=readme-ov-file#special-interest-groups
[calendar]:
  https://github.com/open-telemetry/community?tab=readme-ov-file#calendar
[membership]:
  https://github.com/open-telemetry/community/blob/main/guides/contributor/membership.md
[contrib]: /docs/contributing
[localization]: /docs/contributing/localization/
[repos]: https://github.com/orgs/open-telemetry/repositories
[slack]: /community/end-user/#slack
