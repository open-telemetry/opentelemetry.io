---
title: Prácticas del SIG para aprobadores y mantenedores
linkTitle: Prácticas del SIG
description:
  Aprende cómo los aprobadores y mantenedores gestionan issues y contribuciones.
weight: 999
default_lang_commit: 400dcdabbc210eb25cda6c864110127ad6229da8
# prettier-ignore
cSpell:ignore: chalin Comms contribfest docsy hotfixes inactivitiy triager triagers
---

Esta página incluye pautas y algunas prácticas comunes utilizadas por aprobadores
y mantenedores.

## Integración {#onboarding}

Si un colaborador asume un rol con mayor responsabilidad hacia la documentación
(aprobador, mantenedor), será integrado por los aprobadores y mantenedores
existentes:

- Se les agrega al grupo `docs-approvers` (o `docs-maintainers`).
- Se les agrega a los canales de Slack `#otel-comms` y `#otel-maintainers` y a
  los canales privados del equipo.
- Se les pide que se inscriban para las invitaciones del calendario para la
  [reunión SIG Comms](https://groups.google.com/a/opentelemetry.io/g/calendar-comms)
  y la
  [reunión de mantenedores](https://groups.google.com/a/opentelemetry.io/g/calendar-maintainer-meeting).
- Se les pide que verifiquen que el horario actual de la reunión de SIG Comms
  les funciona y, de no ser así, que colaboren con los aprobadores y
  mantenedores existentes para encontrar un horario que les convenga a todos.
- Se les pide que revisen los diferentes recursos disponibles para
  colaboradores:
  - [Recursos de la Comunidad](https://github.com/open-telemetry/community/),
    especialmente el documento sobre
    [Membresía de la Comunidad](https://github.com/open-telemetry/community/blob/main/community-membership.md)
    y la
    [guía de redes sociales](https://github.com/open-telemetry/community/blob/main/social-media-guide.md).
  - [Pautas de Contribución](/docs/contributing) Como parte de esto, revisarán
    esos documentos y proporcionarán retroalimentación para mejorarlos mediante
    issues o pull requests.

Recursos adicionales valiosos para revisar son:

- [Documentación de Hugo](https://gohugo.io/documentation/)
- [Documentación de Docsy](https://www.docsy.dev/docs/)
- [Directrices de marketing](/community/marketing-guidelines/), incluyendo la
  marca de la Linux Foundation y las
  [directrices de uso de marcas registradas](https://www.linuxfoundation.org/legal/trademark-usage).
  Estos son especialmente valiosos al revisar entradas al registro,
  integraciones, proveedores, adoptantes o distribuciones.

## Colaboración

- Los aprobadores y mantenedores tienen diferentes horarios y circunstancias de
  trabajo. Por eso, toda la comunicación se asume como asincrónica y no deberían
  sentirse obligados a responder fuera de su horario normal.
- Cuando un aprobador o mantenedor no esté disponible para contribuir durante un
  período prolongado (más de unos días o una semana) o no esté disponible en ese
  período, deben comunicarlo usando el canal
  [#otel-comms](https://cloud-native.slack.com/archives/C02UN96HZH6) y
  actualizando el estado de GitHub.
- Los aprobadores y mantenedores se adhieren al
  [Código de Conducta de OTel](https://github.com/open-telemetry/community/?tab=coc-ov-file#opentelemetry-community-code-of-conduct)
  y los [Valores de la Comunidad](/community/mission/#community-values). Son
  amables y serviciales con los colaboradores. En caso de conflicto,
  malentendido o cualquier otra situación que haga que un aprobador/mantenedor
  se sienta incómodo, pueden retirarse de una conversación, issue o PR y pedir a
  otro aprobador/mantenedor que intervenga.

## Triaje {#triage}

### Issues

- Los issues entrantes son triados por el equipo `@open-telemetry/docs-triagers`.
- Como primer paso, un triager leerá el título y la descripción del issue y
  aplicará el siguiente etiquetado:
  - Obligatorio: Una etiqueta `sig:*`, `lang:*` o `docs:*` para determinar la
    (co)propiedad del issue:
    - Una etiqueta `sig:*` si el issue está relacionado con contenido o una
      pregunta que es co-propiedad de un SIG (por ejemplo, una pregunta sobre el
      Collector será etiquetada `sig:collector`).
    - Una etiqueta `lang:*` si el issue está relacionado con contenido o una
      pregunta relacionada con una localización específica.
    - Una etiqueta `docs:*` si el issue está relacionado con contenido o una
      pregunta que es propiedad exclusiva del equipo de docs (SIG Comms):
      - `docs`
      - `docs:admin`
      - `docs:accessibility`
      - `docs:analytics-and-seo`
      - `docs:IA`
      - `docs:blog`
      - `docs:cleanup/refactoring`
      - `docs:upstream`, `docs:upstream/docsy`
      - `docs:javascript`
      - `docs:mobile`
      - `docs:registry`
      - `docs:ux`
  - Obligatorio: Una etiqueta `triage:*`:
    - `triage:accepted`, `triage:accepted:needs-pr`
    - `triage:deciding`, `triage:deciding:blocked`, `triage:deciding:needs-info`
    - `triage:rejected`, `triage:rejected:duplicate`, `triage:rejected:invalid`,
      `triage:rejected:wontfix`
  - Obligatorio: Establecer el "tipo" del issue de la siguiente manera:
    - tipo de issue `bug` para bugs
    - tipo de issue `enhancement` para solicitudes de funcionalidades
    - etiqueta `type:question` para preguntas
    - etiqueta `type:copyedit` para ediciones de texto
    - mover un issue a "discusiones" si parece ser una conversación abierta no
      trabajable
  - Opcional: Una etiqueta de estimación si aplica:
    - `e0-minutes`
    - ...
    - `e4-months`
  - Opcional (y solo establecido por mantenedores): Una etiqueta de prioridad:
    - `p0-critical`
    - `p1-high`
    - `p2-medium`
    - `p3-low`
  - Opcional: Una de las siguientes etiquetas especiales:
    - `good first issue`
    - `help wanted`
    - `contribfest`
    - `maintainers only`
    - `forever`
    - `stale`
- La automatización marcará un issue en `triage:deciding` con `triage:followup`
  para re-triaje después de 14 días de inactividad en un issue. Una etiqueta
  `triage:followup` debe ser removida dentro de 7 días. Hacer ping a los
  participantes y remover la etiqueta es actividad suficiente.

### PRs

- Los PRs deben tener un issue vinculado etiquetado como `triage:accepted` con
  las siguientes excepciones:
  - PRs automáticos
  - hotfixes por mantenedores/aprobadores
- La automatización asegurará que los PRs sean
  [etiquetados](https://github.com/open-telemetry/opentelemetry.io/blob/main/.github/component-label-map.yml)
  y
  [asignados](https://github.com/open-telemetry/opentelemetry.io/blob/main/.github/component-owners.yml)
  al SIG co-propietario o equipo de localización apropiado.
- Los PRs deben tener las mismas etiquetas de co-propiedad que los issues.
- Si el PR es co-propiedad de un SIG, este grupo es responsable de hacer una
  primera revisión para asegurar que el contenido sea técnicamente correcto.
- Si el PR es co-propiedad de un equipo de idioma, este grupo es responsable de
  asegurar que la traducción del contenido sea correcta.
- La responsabilidad principal del equipo de docs es asegurar que el PR esté en
  línea con los objetivos generales del proyecto, esté ubicado en el lugar
  correcto dentro de la estructura y siga las guías de estilo y contenido del
  proyecto.
- Los PRs a los que les falte algo para ser fusionados deben ser etiquetados
  apropiadamente:
  - `missing:cla`
  - `missing:docs-approval`
  - `missing:sig-approval`
  - `blocked`
- La automatización marcará un PR como `stale` para solicitar una re-revisión
  después de 21 días de inactividad. Una etiqueta `stale` debe ser removida
  dentro de 14 días. Hacer ping a los participantes y remover la etiqueta es
  actividad suficiente.
- Los PRs nunca se cierran automáticamente.

## Revisiones de código

### General

- Si la rama del PR está `desactualizada con respecto a la rama base`, no
  necesitan ser actualizadas continuamente: ¡cada actualización activa todas las
  verificaciones de CI del PR! A menudo es suficiente actualizarlas antes de
  fusionar.
- Un PR de no-mantenedores **nunca** debe actualizar submódulos de git. Esto
  sucede por accidente de vez en cuando. Avisa al autor del PR que no debe
  preocuparse por ello, lo arreglaremos antes de fusionar, pero en el futuro
  debe asegurarse de trabajar desde un fork actualizado.
- Si el colaborador tiene problemas para firmar el CLA o usó el correo
  electrónico incorrecto por error en uno de sus commits, pídele que corrija el
  problema o haga rebase del pull request. En el peor de los casos, cierra y
  vuelve a abrir el PR para activar una nueva verificación del CLA.
- Las palabras desconocidas para cspell deben ser agregadas a la lista de
  ignorados de cspell por página por los autores del PR. Solo los aprobadores y
  mantenedores agregarán términos de uso común a la lista global.

### PRs de co-propiedad

Los PRs con cambios a documentación co-propiedad de un SIG (collector, demo,
específico de lenguaje...) deben aspirar a dos aprobaciones: una por un
aprobador de docs y una por un aprobador del SIG:

- El aprobador de docs etiqueta dichos PRs con `sig:<name>` y etiqueta al grupo
  `-approvers` del SIG en ese PR.
- Después de que un aprobador de docs ha revisado y aprobado el PR, puede
  agregar la etiqueta
  [`sig-approval-missing`](https://github.com/open-telemetry/opentelemetry.io/labels/sig-approval-missing).
  Esto señala al SIG que necesitan manejar el PR.
- Si no se da aprobación del SIG dentro de un cierto período de gracia (dos
  semanas en general, pero puede ser menos en casos urgentes), el mantenedor de
  docs puede usar su propio juicio para fusionar ese PR.

### PRs de bots

Los PRs creados por bots pueden ser fusionados siguiendo la siguiente práctica:

- Los PRs que auto-actualizan versiones en el registro pueden ser corregidos,
  aprobados y fusionados inmediatamente.
- Los PRs que auto-actualizan las versiones de SDKs, instrumentaciones de código
  cero o el collector pueden ser aprobados y fusionados excepto si el SIG
  correspondiente señala que la fusión debe posponerse.
- Los PRs que auto-actualizan la versión de cualquier especificación a menudo
  requieren actualizaciones a scripts para que las verificaciones de CI pasen.
  En ese caso [@chalin](https://github.com/chalin/) manejará el PR. De lo
  contrario, esos PRs también pueden ser aprobados y fusionados excepto si el
  SIG correspondiente señala que la fusión debe posponerse.

### PRs de traducción

Los PRs con cambios a traducciones deben aspirar a dos aprobaciones: una por un
aprobador de docs y una por un aprobador de traducción. Prácticas similares
aplican como las sugeridas para los PRs de co-propiedad.

### Fusionar PRs

El siguiente flujo de trabajo puede ser aplicado por mantenedores para fusionar
PRs:

- Asegurarse de que un PR tenga todas las aprobaciones y que todas las
  verificaciones de CI pasen.
- Si la rama está desactualizada, actualizarla vía la interfaz de GitHub.
- La actualización activará todas las verificaciones de CI para ejecutarse de
  nuevo, esperar a que pasen o ejecutar un script como el siguiente para hacerlo
  en segundo plano:

  ```shell
  export PR=<ID OF THE PR>; gh pr checks ${PR} --watch && gh pr merge ${PR} --squash
  ```
