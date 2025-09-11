---
title: Pautas para aprobadores y mantenedores
linkTitle: Pautas del SIG
description:
  Aprende cómo los aprobadores y mantenedores gestionan los problemas y las
  contribuciones.
weight: 999
default_lang_commit: 493a530efd3c2a058cc4aa055d7c8aadb5348beb
cSpell:ignore: asincrónica chalin Comms cscell docsy
---

Esta página incluye pautas y algunas prácticas comunes utilizadas por
aprobadores y mantenedores.

## Incorporación

Si un colaborador asume un rol con mayor responsabilidad en la documentación
(aprobador, mantenedor), será integrado por los aprobadores y mantenedores
existentes:

- Se agregan al grupo de `docs-approvers` (o `docs-maintainers`).
- Se agregan a los canales `#otel-comms` y `#otel-maintainers` y a los canales
  privados de Slack del equipo.
- Se les pide que se inscriban para recibir las invitaciones del calendario para
  la
  [reunión SIG Comms](https://groups.google.com/a/opentelemetry.io/g/calendar-comms)
  y
  [reunión de los mantenedores](https://groups.google.com/a/opentelemetry.io/g/calendar-maintainer-meeting).
- Se les pide que verifiquen que el horario actual de la reunión de SIG Comms
  les convenga y, de no ser así, que colaboren con los aprobadores y
  mantenedores existentes para encontrar un horario que les convenga a todos.
- Se les pide revisar los diferentes recursos disponibles para los
  colaboradores:
  - [Recursos Comunitarios](https://github.com/open-telemetry/community/),
    especialmente el documento alrededor
    [Membresía de la Comunidad](https://github.com/open-telemetry/community/blob/main/community-membership.md)
    y la
    [guía de redes sociales](https://github.com/open-telemetry/community/blob/main/social-media-guide.md).
  - [Pautas de Contribución](/docs/contributing) Como parte de esto, revisarán
    dichos documentos y compartirán sugerencias para mejorarlos mediante
    incidencias o solicitudes de incorporación de cambios.

Otros recursos valiosos para revisar son

- [documentación de Hugo](https://gohugo.io/documentation/)
- [documentación de Docsy](https://www.docsy.dev/docs/)
- [directrices de Marketing](/community/marketing-guidelines/), incluyendo la
  marca de la Fundación Linux y
  [pautas de uso de marcas registradas](https://www.linuxfoundation.org/legal/trademark-usage).
  Esos son especialmente valiosos al revisar entradas al registro,
  integraciones, proveedores, adoptantes o distribuciones.

## Colaboración

- Los aprobadores y los mantenedores tienen horarios y circunstancias de trabajo
  diferentes. Por eso, se asuma que toda la comunicación es asincrónica y no
  deberían sentirse obligados a responder fuera de su horario habitual.
- Cuando un aprobador o mantenedor no esta disponible para contribuir durante un
  período prolongado (más de unos días o una semana) o no esta disponible
  durante ese período, debe comunicarlo a través del canal
  [#otel-comms](https://cloud-native.slack.com/archives/C02UN96HZH6) y
  actualizar el estado de GitHub.
- El aprobador y el mantenedor se adhieren al
  [Código de Conducta de OTel](https://github.com/open-telemetry/community/?tab=coc-ov-file#opentelemetry-community-code-of-conduct)
  y a los [Valores de la Comunidad](/community/mission/#community-values). Son
  amables y serviciales con los colaboradores. En caso de conflicto,
  malentendido o cualquier otra situación que incomode al aprobador o
  mantenedor, puede retirarse de la conversación, problema o solicitud de
  relaciones públicas y pedirle a otro aprobador o mantenedor que intervenga.

## Revisiones de código

### General

- Si la rama de la solicitud de incorporación de cambios (PR) esta
  `desactualizada con respecto a la rama base`, no es necesario actualizarla
  continuamente: ¡cada actualización activa la ejecución de todas las
  comprobaciones de CI de la PR! A menudo, basta con actualizarlas antes de
  fusionar.
- Una solicitud de solicitud (PR) realizada por personas que no son mantenedoras
  **nunca** debe actualizar los submódulos de Git. Esto ocurre accidentalmente
  de vez en cuando. Informa al autor de la solicitud de solicitud (PR) que no
  debe preocuparse por ello; lo solucionaremos antes de la fusión, pero que en
  el futuro debe asegurarse de trabajar desde una bifurcación actualizada.
- Si el colaborador tiene problemas para firmar la CLA o usó un correo
  electrónico incorrecto por error en una de sus confirmaciones, pídele que
  solucione el problema o que rebase la solicitud de incorporación de cambios.
  En el peor de los casos, cierre y vuelve a abrir la solicitud de incorporación
  de cambios para activar una nueva comprobación de la CLA.
- Los autores de la solicitud de registro (PR) deben añadir las palabras
  desconocidas para cscell a la lista de ignorados de cscell por página. Solo
  los aprobadores y mantenedores añadirán términos de uso común a la lista
  global.

### Solicitudes de incorporación de cambios (PR) de propiedad conjunta

Las solicitudes de registro con cambios en la documentación de propiedad
compartida de un SIG (recopilador, demostración, específico del idioma...) deben
aspirar a dos aprobaciones: una por parte de un aprobador de documentos y otra
por parte de un aprobador del SIG:

- El aprobador de documentos etiqueta dichas solicitudes de registro con
  `sig:<name>` y etiqueta al grupo `-approvers` del SIG en esa solicitud.
- Una vez que el aprobador de documentos haya revisado y aprobado la solicitud
  de registro, podrá agregar la etiqueta
  [`sig-approval-missing`](https://github.com/open-telemetry/opentelemetry.io/labels/sig-approval-missing).
  Esto indica al SIG que debe gestionar la solicitud de registro.
- Si no se otorga la aprobación del SIG dentro de un período de gracia
  determinado (dos semanas en general, pero puede ser menos en casos urgentes),
  el responsable de la documentación puede usar su propio criterio para fusionar
  esa solicitud de incorporación de cambios.

### Solicitudes de incorporación de cambios (PR) de bots

Las solicitudes de incorporación de cambios creadas por bots se pueden fusionar
mediante la siguiente práctica:

- Las solicitudes de registro que actualizan automáticamente las versiones en el
  registro se pueden corregir, aprobar y fusionar de inmediato.
- Las solicitudes de registro que actualizan automáticamente las versiones de
  los SDK, las instrumentaciones de código cero o el recopilador pueden
  aprobarse y fusionarse, excepto si el SIG correspondiente indica que la fusión
  debe posponerse.
- Las solicitudes de cambio que actualizan automáticamente la versión de
  cualquier especificación a menudo requieren actualizaciones de los scripts
  para que se aprueben las comprobaciones de CI. En ese caso
  [@chalin](https://github.com/chalin/) gestionará la solicitud de incorporación
  de cambios. De lo contrario, esas solicitudes de incorporación de cambios
  también pueden aprobarse y fusionarse, salvo que el SIG correspondiente
  indique que la fusión debe posponerse.

### Solicitudes de registro traducción

Las solicitudes de registro con cambios en las traducciones deben aspirar a dos
aprobaciones: una por parte del aprobador de documentos y otra por parte del
aprobador de traducciones. Se aplican prácticas similares a las sugeridas para
las solicitudes de registro de copropiedad.

### Fusionando solicitudes de registro

Los mantenedores pueden aplicar el siguiente flujo de trabajo para fusionar
solicitudes de incorporación de cambios (PR):

- Asegurarse de que una PR tenga todas las aprobaciones y que se aprueben todas
  las comprobaciones de CI.
- Si la rama esta desactualizada, actualizarla mediante la interfaz de GitHub.
- La actualización activará la ejecución de todas las comprobaciones de CI;
  esperar a que se aprueban o ejecutar un script como el siguiente para que se
  ejecute en segundo plano:

  ```shell
  export PR=<ID OF THE PR>; gh pr checks ${PR} --watch && gh pr merge ${PR} --squash
  ```
