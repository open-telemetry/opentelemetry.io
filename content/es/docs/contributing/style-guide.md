---
title: Guía de estilo de documentación
description:
  Terminología y estilo al escribir la documentación de OpenTelemetry.
linkTitle: Guía de estilo
weight: 20
default_lang_commit: 400dcdabbc210eb25cda6c864110127ad6229da8 # patched
params:
  alertExamples: |
    > [!TIP]
    >
    > Si estás escribiendo contenido nuevo, generalmente prefiere usar esta sintaxis
    > de alerta de cita en bloque en lugar del
    > [shortcode alert](https://www.docsy.dev/docs/content/shortcodes/#alert) de Docsy.

    > [!WARNING] :warning: ¡Se requiere línea en blanco!
    >
    > Este sitio usa el formateador [Prettier], y requiere una línea vacía
    > separando la etiqueta/título de la alerta del cuerpo de la alerta.
cSpell:ignore: postgre
---

Aún no tenemos una guía de estilo oficial, pero el estilo actual de la
documentación de OpenTelemetry está inspirado en las siguientes guías de estilo:

- [Guía de estilo de documentación para desarrolladores de Google](https://developers.google.com/style)
- [Guía de estilo de Kubernetes](https://kubernetes.io/docs/contribute/style/style-guide/)

Las siguientes secciones contienen orientación específica para el proyecto
OpenTelemetry.

> [!NOTE]
>
> Muchos requisitos de nuestra guía de estilo se pueden aplicar ejecutando
> automatización: antes de enviar un [pull request][] (PR), ejecuta
> `npm run fix:all` en tu máquina local y haz commit de los cambios.
>
> Si encuentras errores o [verificaciones de PR fallidas](../pr-checks), lee
> sobre nuestra guía de estilo y aprende qué puedes hacer para corregir ciertos
> problemas comunes.

[pull request]:
  https://docs.github.com/es/get-started/learning-about-github/github-glossary#pull-request

## Lista de palabras de OpenTelemetry.io {#opentelemetryio-word-list}

Una lista de términos y palabras específicos de OpenTelemetry que se deben usar
de manera uniforme en todo el sitio:

- [OpenTelemetry](/docs/concepts/glossary/#opentelemetry) y
  [OTel](/docs/concepts/glossary/#otel)
- [Collector](/docs/concepts/glossary/#collector)
- [OTEP](/docs/concepts/glossary/#otep)
- [OpAMP](/docs/concepts/glossary/#opamp)

Para obtener una lista completa de los términos de OpenTelemetry y su
definición, consulta el [Glosario](/docs/concepts/glossary/).

Asegúrate de que los nombres propios, como otros proyectos de CNCF o
herramientas de terceros, estén escritos correctamente y utilicen la mayúscula
original. Por ejemplo, escribe "PostgreSQL" en lugar de "postgre". Para obtener
una lista completa, consulta el archivo
[`.textlintrc.yml`](https://github.com/open-telemetry/opentelemetry.io/blob/main/.textlintrc.yml).

## Markdown

Las páginas del sitio están escritas en la sintaxis Markdown soportada por el
renderizador Markdown [Goldmark][]. Para ver la lista completa de extensiones
Markdown soportadas, consulta [Goldmark][].

También puedes usar las siguientes extensiones de Markdown:

- [Alertas](#alerts)
- [Emojis][]: para ver la lista completa de emojis disponibles, consulta
  [Emojis][] en la documentación de Hugo.

[Emojis]: https://gohugo.io/quick-reference/emojis/

### Alertas {#alerts}

Puedes escribir alertas usando la siguiente sintaxis extendida:

- [Alertas][gfm-alerts] de [GitHub-flavored Markdown][GFM] (GFM)
- Sintaxis de [Obsidian callout][] para títulos de alerta personalizados

Aquí hay un ejemplo de cada una:

```markdown
{{% _param alertExamples %}}
```

Estas se renderizan como:

{{% _param alertExamples %}}

Para más detalles sobre la sintaxis de alertas de cita en bloque de Hugo,
consulta [Alertas][hugo-alerts] en la documentación de Hugo.

[gfm-alerts]:
  https://docs.github.com/es/contributing/style-guide-and-content-model/style-guide#alerts
[GFM]: https://github.github.com/gfm/
[Goldmark]: https://gohugo.io/configuration/markup/#goldmark
[hugo-alerts]: https://gohugo.io/render-hooks/blockquotes/#alerts
[Obsidian callout]: https://help.obsidian.md/callouts

### Verificaciones de Markdown {#markdown-standards}

Para hacer cumplir estándares y consistencia en los archivos Markdown, todos los
archivos deben seguir ciertas reglas, aplicadas por [markdownlint][]. Para ver
una lista completa, consulta los archivos [.markdownlint.yaml][] y
[.markdownlint-cli2.yaml][].

También aplicamos el [formato de archivo](#file-format) de Markdown y eliminamos
los espacios en blanco finales de los archivos. Esto impide la [sintaxis de
salto de línea] de 2+ espacios; usa `<br>` en su lugar o reformatea tu texto.

## Revisión ortográfica {#spell-checking}

Usa [CSpell](https://github.com/streetsidesoftware/cspell) para asegurarte de
que todo tu texto esté escrito correctamente. Para ver una lista de palabras
específicas del sitio web de OpenTelemetry, consulta el archivo
[`.cspell.yml`](https://github.com/open-telemetry/opentelemetry.io/blob/main/.cspell.yml).

Si `cspell` indica un error de "Unknown word", verifica si escribiste la palabra
correctamente. Si es así, agrega la palabra a la sección `cSpell:ignore` en la
parte superior de tu archivo. Si no existe dicha sección, puedes agregarla al
front matter de un archivo Markdown:

```markdown
---
title: TítuloDeLaPágina
cSpell:ignore: <word>
---
```

Para cualquier otro archivo, agrega `cSpell:ignore <word>` en una línea de
comentario apropiada para el contexto del archivo. Para un archivo YAML de
entrada del [registry](/ecosystem/registry/), podría verse así:

```yaml
# cSpell:ignore <word>
title: títuloDeEntradaDelRegistro
```

## Formato de archivo {#file-format}

Usamos [Prettier][] para aplicar el formato de archivos. Invócalo usando:

- `npm run fix:format` para formatear todos los archivos
- `npm run fix:format:diff` para formatear solo los archivos que han cambiado
  desde el último commit
- `npm run fix:format:staged` para formatear solo los archivos que están en
  staging para el próximo commit

## Nombres de archivos {#file-names}

Todos los nombres de archivo deben estar en
[kebab case](https://en.wikipedia.org/wiki/Letter_case#Kebab_case).

## Corregir problemas de validación

Para aprender cómo corregir problemas de validación, consulta
[Verificaciones de pull request](../pr-checks).

[.markdownlint.yaml]:
  https://github.com/open-telemetry/opentelemetry.io/blob/main/.markdownlint.yaml
[.markdownlint-cli2.yaml]:
  https://github.com/open-telemetry/opentelemetry.io/blob/main/.markdownlint-cli2.yaml
[sintaxis de salto de línea]:
  https://www.markdownguide.org/basic-syntax/#line-breaks
[markdownlint]: https://github.com/DavidAnson/markdownlint
[Prettier]: https://prettier.io
