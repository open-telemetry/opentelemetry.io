---
title: Localización del sitio
description:
  Creación y mantenimiento de páginas del sitio en localizaciones que no están
  en inglés.
linkTitle: Localización
weight: 25
default_lang_commit: e1bf6c870fbf82791a3826baaf276bc0ca79c88b # patched
drifted_from_default: true
cSpell:ignore: shortcodes
---

El sitio web de OTel utiliza el [framework multilingüe] de Hugo para soportar la
localización de páginas. El inglés es el idioma predeterminado, con inglés
estadounidense como la localización predeterminada (implícita). Se admite un
número creciente de otras localizaciones, como se puede ver en el menú
desplegable de idiomas en la barra de navegación superior.

## Guía de traducción

Al traducir páginas del sitio web desde el inglés, te recomendamos seguir las
instrucciones que se ofrecen en esta sección.

### Resumen

#### ✅ Hacer {#do}

<div class="border-start border-success bg-success-subtle">

- **Traducir**:
  - El contenido de la página, incluyendo:
    - Campos de texto en diagramas [diagramas](#images) Mermaid
    - Comentarios en fragmentos de código (opcional)
  - Valores de los campos [Front matter][]: `title`, `linkTitle` y `description`
  - **Todo** el contenido de la página y del front matter, a menos que se
    indique lo contrario
- **Preservar** el _contenido_, _significado_ y _estilo_ del texto original
- **Consultar** a los [mantenedores] si tienes dudas o preguntas a través de:
  - Canales de [Slack] `#otel-localization-es` o `#otel-docs-localization` o
    `#otel-comms`
  - [Discusión], issue o comentario en un PR

[Discusión]:
  https://github.com/open-telemetry/opentelemetry.io/discussions?discussions_q=is%3Aopen+label%3Ai18n

</div>

#### ❌ No hacer {#do-not}

<div class="border-start border-warning bg-warning-subtle">

- **No traduzcas**:
  - **Nombres de archivos o directorios** de los recursos en este repositorio
  - [Enlaces](#links), esto incluye los [IDs de encabezados](#headings) [^*]
  - Etiquetas de definición de enlaces en Markdown
    ([link definition labels](#link-labels))
  - Fragmentos de código en línea como estos: `ejemplo de código en línea`
  - Elementos de Markdown marcados como `notranslate` (usualmente como una clase
    CSS), en particular los [encabezados](#headings)
  - Campos del [Front matter][] distintos a los mencionados en la sección
    [Hacer](#do). En particular, **no traduzcas** `aliases`. En caso de duda,
    consulta con los mantenedores.
  - Código
- Crear **copias de imágenes**, a menos que
  [localices el texto en las imágenes](#images)
- Agregar o cambiar:
  - El **contenido** si esto altera el significado original del texto
  - El estilo de **presentación**, incluyendo: _formato_, _estructura_ y
    _diseño_ (por ejemplo, tipografía, uso de mayúsculas/minúsculas y espaciado)

[^*]: Para una posible excepción, consulta la sección de [Enlaces](#links).

</div>

### IDs de encabezados {#headings}

Para garantizar que los anclajes de los encabezados sean uniformes en todas las
localizaciones, al traducir encabezados:

- Conserva el ID explícito del encabezado si ya lo tiene. La [sintaxis de ID de
  encabezado][] se escribe después del texto del encabezado usando una sintaxis
  como `{ #algún-id }`.
- De lo contrario, declara explícitamente un ID de encabezado que corresponda al
  ID autogenerado del encabezado original en inglés.

[Sintaxis de ID de encabezado]:
  https://github.com/yuin/goldmark/blob/master/README.md#headings

### Enlaces {#links}

**No** traduzcas las referencias de enlaces. Esto aplica tanto para enlaces
externos como para rutas a páginas del sitio web y recursos locales de la
sección, como las [imágenes](#images).

La única excepción son los enlaces a páginas externas (como
<https://en.wikipedia.org>) que tienen una versión específica para tu idioma
local. A menudo, esto implica reemplazar el `en` en la URL por el código de
idioma correspondiente a tu localidad.

{{% alert title="Nota" %}}

El repositorio del sitio web de OTel tiene un _hook_ personalizado para el
renderizado de enlaces que Hugo utiliza para convertir rutas absolutas a páginas
de documentación. **Los enlaces con el formato `/docs/alguna-pagina` se vuelven
específicos del idioma** al anteponer el código de idioma en la ruta al momento
de renderizar el enlace. Por ejemplo, la ruta del ejemplo anterior se
convertiría en `/ja/docs/alguna-pagina` cuando se renderiza desde una página en
japonés.

{{% /alert %}}

### Etiquetas de definición de enlaces {#link-labels}

**No** traduzcas las [etiquetas] de las [definiciones de enlaces][] en Markdown.
En su lugar, reescribe la etiqueta como texto traducido del enlace. Por ejemplo,
considera el siguiente Markdown:

```markdown
[Hola], mundo! Bienvenido al [sitio de OTel][].

[hola]: https://code.org/helloworld
[sitio de OTel]: https://opentelemetry.io
```

[etiquetas]: https://spec.commonmark.org/0.31.2/#link-label
[definiciones de enlaces]:
  https://spec.commonmark.org/0.31.2/#link-reference-definitions

### Imágenes y diagramas {#images}

**No** hagas copias de archivos de imagen a menos que localices el texto dentro
de la propia imagen[^shared-images].

**Sí** debes traducir el texto en los diagramas de [Mermaid][].

[^shared-images]:
    Hugo es inteligente en la forma en que renderiza archivos de imagen que se
    comparten entre las distintas localizaciones del sitio. Es decir, Hugo
    generará un único archivo de imagen y lo compartirá entre los distintos
    idiomas.

[Mermaid]: https://mermaid.js.org

### Archivos incluidos {#includes}

**Sí** debes traducir los fragmentos de página ubicados en los directorios
`_includes`, tal como traducirías cualquier otro contenido de la página.

### Shortcodes

{{% alert title="Nota" %}}

A partir de febrero de 2025, estamos en proceso de migrar de _shortcodes_ a
[archivos incluidos](#includes) como medio para admitir contenido compartido
entre páginas.

{{% /alert %}}

Algunos de los _shortcodes_ base contienen texto en inglés que podrías necesitar
localizar, especialmente aquellos que se encuentran en
[layouts/_shortcodes/docs].

Si necesitas crear una versión localizada de un _shortcode_, colócala en
`layouts/_shortcodes/xx`, donde `xx` es el código de idioma de tu localización.
A partir de ahí, utiliza la misma ruta relativa que el _shortcode_ base
original.

[layouts/_shortcodes/docs]:
  https://github.com/open-telemetry/opentelemetry.io/tree/main/layouts/_shortcodes/docs

## Seguimiento de cambios en páginas localizadas {#track-changes}

Uno de los principales desafíos al mantener páginas localizadas es identificar
cuándo se han actualizado las páginas correspondientes en inglés. Esta sección
explica cómo manejamos ese proceso.

### El campo `default_lang_commit` en el front matter

Cuando se escribe una página localizada, como `content/zh/<some-path>/page.md`,
esta traducción se basa en un commit específico de la rama [`main`][main] de la
versión en inglés correspondiente de la página ubicada en
`content/en/<some-path>/page.md`.

En este repositorio, cada página localizada identifica el commit de la página en
inglés en el _front matter_ de la página localizada de la siguiente manera:

```markdown
---
title: Título de la página localizada
# ...
default_lang_commit: <most-recent-commit-hash-of-default-language-page>
---
```

El _front matter_ anterior se encontraría en `content/zh/<some-path>/page.md`.
El hash del commit correspondería al último commit de
`content/en/<some-path>/page.md` en la rama `main`.

### Seguimiento de cambios en las páginas en inglés

A medida que se realizan actualizaciones en las páginas en inglés, puedes hacer
seguimiento de las páginas localizadas que necesitan ser actualizadas ejecutando
el siguiente comando:

```console
$ npm run check:i18n
1       1       content/en/docs/platforms/kubernetes/_index.md - content/zh/docs/platforms/kubernetes/_index.md
...
```

Puedes restringir las páginas objetivo a una o más localizaciones proporcionando
rutas como esta:

```sh
npm run check:i18n -- content/zh
```

### Ver detalles de los cambios

Para cualquier página localizada que necesite ser actualizada, puedes ver los
detalles del _diff_ de las páginas correspondientes en inglés usando la opción
`-d` y proporcionando las rutas a tus páginas localizadas, o puedes omitir las
rutas para ver todas. Por ejemplo:

```console
$ npm run check:i18n -- -d content/zh/docs/platforms/kubernetes
diff --git a/content/en/docs/platforms/kubernetes/_index.md b/content/en/docs/platforms/kubernetes/_index.md
index 3592df5d..c7980653 100644
--- a/content/en/docs/platforms/kubernetes/_index.md
+++ b/content/en/docs/platforms/kubernetes/_index.md
@@ -1,7 +1,7 @@
 ---
 title: OpenTelemetry with Kubernetes
 linkTitle: Kubernetes
-weight: 11
+weight: 350
 description: Using OpenTelemetry with Kubernetes
 ---
```

### Agregar `default_lang_commit` a nuevas páginas

Cuando crees páginas para tu localización, recuerda agregar
`default_lang_commit` al _front matter_ de la página junto con el hash de commit
correspondiente desde la rama `main`.

Si tu traducción se basa en una página en inglés de `main` en el commit
`<hash>`, puedes ejecutar el siguiente comando para agregar automáticamente
`default_lang_commit` al _front matter_ del archivo de tu página usando ese
`<hash>`.

También puedes usar `HEAD` como argumento si tus páginas están sincronizadas con
`main` en `HEAD`. Por ejemplo:

```sh
npm run check:i18n -- -n -c 1ca30b4d content/ja
npm run check:i18n -- -n -c HEAD content/zh/docs/concepts
```

Para listar los archivos de páginas localizadas que no tienen el campo de hash
(`default_lang_commit`), ejecuta:

```sh
npm run check:i18n -- -n
```

### Actualización de `default_lang_commit` en páginas existentes

Al actualizar tus páginas localizadas para que coincidan con los cambios
realizados en la página correspondiente en inglés, asegúrate de actualizar
también el hash de commit `default_lang_commit`.

{{% alert title="Consejo" %}}

Si tu página localizada ahora corresponde a la versión en inglés en `main` en
`HEAD`, entonces borra el valor del hash de commit en el _front matter_ y
ejecuta el comando de **agregar** dado en la sección anterior para actualizar
automáticamente el campo `default_lang_commit`.

{{% /alert %}}

Si has actualizado en lote todas tus páginas localizadas que se habían
desincronizado, puedes actualizar el hash de commit de estos archivos usando la
opción `-c` seguida de un hash de commit o de `HEAD` para usar `main@HEAD`.

```sh
npm run check:i18n -- -c <hash> <PATH-TO-YOUR-NEW-FILES>
npm run check:i18n -- -c HEAD <PATH-TO-YOUR-NEW-FILES>
```

{{% alert title="Importante" %}}

Cuando uses `HEAD` como especificador de hash, el script utilizará el hash de
`main` en `HEAD` de tu **entorno local**. Asegúrate de hacer fetch y pull de
`main` si quieres que `HEAD` corresponda a `main` en GitHub.

{{% /alert %}}

### Estado de desfase "Drift status"

Ejecuta `npm run fix:i18n:status` para agregar un campo en el _front matter_
llamado `drifted_from_default` a las páginas de localización objetivo que se
hayan desincronizado. Este campo pronto se usará para mostrar un banner en la
parte superior de las páginas que estén desincronizadas respecto a sus
equivalentes en inglés.

### Ayuda del script

Para más detalles sobre el script, ejecuta `npm run check:i18n -- -h`.

## Nuevas localizaciones

### Nuevo equipo de localización

Para iniciar una nueva localización del sitio web de OpenTelemetry necesitas:

1. Un **mentor de localización** que conozca bien tu idioma, como un [aprobador
   activo][] del [Glosario CNCF][], o del [sitio web de Kubernetes][].
2. Al menos dos colaboradores potenciales.

[aprobador activo]: https://github.com/cncf/glossary/blob/main/CODEOWNERS
[Glosario CNCF]: https://glossary.cncf.io/
[sitio web de Kubernetes]: https://github.com/kubernetes/website

Una vez que estés listo:

1. Crea un [nuevo issue][] para compartir tu interés en contribuir.

2. Añade los usuarios de GitHub del mentor y de los colaboradores potenciales.

3. Busca el [código oficial ISO 639-1][] del idioma que quieres agregar. Nos
   referiremos a este código de idioma como `LANG_ID` en el resto de esta
   sección.

4. Añade la siguiente lista de tareas al comentario inicial de tu issue:

   ```markdown
   - [ ] Language info:
     - ISO 639-1 language code: `LANG_ID`
     - Language name: ADD_NAME_HERE
   - [ ] Locale team info:
     - [ ] Locale mentor: @GITHUB_HANDLE1, @GITHUB_HANDLE2, ...
     - [ ] Contributors: @GITHUB_HANDLE1, @GITHUB_HANDLE2, ...
   - [ ] Read through
         [Localization](https://opentelemetry.io/docs/contributing/localization/)
         and all other pages in the Contributing section
   - [ ] Localize site homepage to YOUR_LANGUAGE_NAME
   - [ ] OTel maintainers:
     - [ ] Update `hugo.yaml`
     - [ ] Configure cSpell and other tooling support
     - [ ] Create an issue label for `lang:LANG_ID`
     - [ ] Create org-level group for `LANG_ID` approvers
     - [ ] Update components owners for `content/LANG_ID`
   ```

5. [Envía un pull request](../pull-requests/) con la traducción de la página
   principal del sitio web [homepage], y _nada más_, en el archivo
   `content/LANG_ID/_index.md`. Asegúrate de que los mantenedores tengan los
   permisos necesarios para editar tu PR, ya que ellos agregarán cambios
   adicionales necesarios para iniciar tu proyecto de localización.

[código oficial iso 639-1]: https://es.wikipedia.org/wiki/ISO_639-1
[homepage]:
  https://github.com/open-telemetry/opentelemetry.io/blob/main/content/en/_index.md

Después de que tu primer PR sea fusionado, los mantenedores configurarán la
etiqueta del issue, el grupo a nivel de organización y los responsables del
componente.

{{% alert title="Nota" %}}

No es necesario ser un colaborador existente del proyecto OpenTelemetry para
iniciar una nueva localización. Sin embargo, no se te añadirá como miembro de la
[organización de GitHub de OpenTelemetry](https://github.com/open-telemetry/) ni
como miembro del grupo de aprobadores de tu localización. Deberás cumplir con
los requisitos para convertirte en miembro establecido y aprobador, según lo
descrito en las
[directrices de membresía](https://github.com/open-telemetry/community/blob/main/guides/contributor/membership.md).

Al iniciar el proyecto de localización, los mantenedores tratarán tus revisiones
como si ya fueras un aprobador.

{{% /alert %}}

### Lista de verificación para mantenedores de OTel

#### Hugo

Actualiza `hugo.yaml`. Agrega las entradas correspondientes para `LANG_ID` bajo:

- `languages`
- `module.mounts`. Como mínimo, agrega una única entrada de `source`-`target`
  para `content`. Considera agregar entradas para las páginas de fallback en
  `en` solo cuando la localización tenga suficiente contenido.

#### Ortografía

Busca los [diccionarios cSpell][] disponibles como paquetes NPM
[@cspell/dict-LANG_ID][]. Si no hay un diccionario disponible para tu dialecto o
región, elige el que corresponda a la región más cercana.

Si no existe un diccionario disponible, entonces omite el resto de esta
subsección. De lo contrario:

- Agrega el paquete NPM como dependencia de desarrollo, por ejemplo:
  `npm install --save-dev @cspell/dict-bn`.
- Crea `.cspell/LANG_ID-words.txt` como el archivo de palabras para el
  diccionario local del sitio para `LANG_ID`.
- En `.cspell.yml`, añade entradas para:
  - `import`
  - `dictionaryDefinitions`
  - `dictionaries`: agrega dos entradas aquí, una para `LANG_ID` y otra para
    `LANG_ID-words.txt`

[diccionarios cSpell]: https://github.com/streetsidesoftware/cspell-dicts
[@cspell/dict-LANG_ID]: https://www.npmjs.com/search?q=%40cspell%2Fdict

#### Soporte para otras herramientas

- Soporte para Prettier: si `LANG_ID` no está bien soportado por Prettier,
  agrega reglas de exclusión en `.prettierignore`

## Guía para mantenedores del idioma inglés

### Evitar PRs con cambios en la documentación que abarquen varios locales {#prs-should-not-span-locales}

Los colaboradores deben evitar enviar PRs que realicen cambios en la
documentación que afecten a varios locales. La única excepción está documentada
en la siguiente sección.

### Cuando falla la verificación de enlaces en páginas que no están en inglés {#patch-locale-links}

A veces, los cambios en la documentación en inglés pueden provocar fallos en la
verificación de enlaces para locales no ingleses. Esto sucede cuando las páginas
de documentación se mueven o eliminan.

En tales situaciones, realiza las siguientes actualizaciones en cada página no
inglesa cuyo enlace falle en la verificación:

- Actualiza la referencia del enlace con la nueva ruta de la página.
- Agrega el comentario YAML `# patched` al final de la línea del campo
  `default_lang_commit` en el _front matter_.
- No realices ningún otro cambio en el archivo.
- Vuelve a ejecutar `npm run check:links` y asegúrate de que no queden fallos de
  enlaces.

[front matter]: https://gohugo.io/content-management/front-matter/
[main]: https://github.com/open-telemetry/opentelemetry.io/commits/main/
[mantenedores]: https://github.com/orgs/open-telemetry/teams/docs-maintainers
[framework multilingüe]: https://gohugo.io/content-management/multilingual/
[nuevo issue]: https://github.com/open-telemetry/opentelemetry.io/issues/new
[slack]: https://slack.cncf.io/
