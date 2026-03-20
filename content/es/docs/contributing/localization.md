---
title: Localización del sitio
description:
  Creación y mantenimiento de páginas del sitio en localizaciones que no están
  en inglés.
linkTitle: Localización
weight: 25
default_lang_commit: 400dcdabbc210eb25cda6c864110127ad6229da8 # patched
cSpell:ignore: Dowair shortcodes
---

El sitio web de OTel utiliza el [framework multilingüe][] de Hugo para soportar
la localización de páginas. El inglés es el idioma predeterminado, con inglés
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
    - Campos de texto en [diagramas](#images) Mermaid
    - Comentarios en fragmentos de código (opcional)
  - Valores de los campos [Front matter][]: `title`, `linkTitle` y `description`
  - **Todo** el contenido de la página y del front matter, a menos que se
    indique lo contrario
- **Preservar** el _contenido_, _significado_ y _estilo_ del texto original
- **Enviar el trabajo _de forma incremental_** mediante
  [pull requests pequeños](#small-prs)
- **Consultar** a los [mantenedores][] si tienes dudas o preguntas a través de:
  - Canales de [Slack][] `#otel-docs-localization` o `#otel-comms`
  - [Discusión][], issue o comentario en un PR

[Discusión]:
  https://github.com/open-telemetry/opentelemetry.io/discussions?discussions_q=is%3Aopen+label%3Ai18n

</div>

#### ❌ No hacer {#do-not}

<div class="border-start border-warning bg-warning-subtle">

- **No traduzcas**:
  - **Nombres de archivos o directorios** de los recursos en este repositorio
  - [Enlaces](#links), esto incluye los [IDs de encabezados](#headings) [^*]
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

> [!NOTE]
>
> El repositorio del sitio web de OTel tiene un _hook_ personalizado para el
> renderizado de enlaces que Hugo utiliza para convertir rutas absolutas a
> páginas de documentación. **Los enlaces con el formato `/docs/alguna-pagina`
> se vuelven específicos del idioma** al anteponer el código de idioma en la
> ruta al momento de renderizar el enlace. Por ejemplo, la ruta del ejemplo
> anterior se convertiría en `/ja/docs/alguna-pagina` cuando se renderiza desde
> una página en japonés.

### Etiquetas de definición de enlaces {#link-labels}

Los autores de localizaciones pueden optar por traducir o no las [etiquetas][]
de las [definiciones de enlaces][] en Markdown. Si eliges mantener la etiqueta
en inglés, sigue las instrucciones de esta sección.

Por ejemplo, considera el siguiente Markdown:

```markdown
[Hello], world! Welcome to the [OTel website][].

[hello]: https://code.org/helloworld
[OTel website]: https://opentelemetry.io
```

Esto se traduciría al francés como:

```markdown
[Bonjour][hello], le monde! Bienvenue sur le [site OTel][OTel website].

[hello]: https://code.org/helloworld
[OTel website]: https://opentelemetry.io
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

> [!NOTE]
>
> A partir de febrero de 2025, estamos en proceso de migrar de _shortcodes_ a
> [archivos incluidos](#includes) como medio para admitir contenido compartido
> entre páginas.

Algunos de los _shortcodes_ base contienen texto en inglés que podrías necesitar
localizar, especialmente aquellos que se encuentran en
[layouts/_shortcodes/docs][].

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

> [!TIP]
>
> Si tu página localizada ahora corresponde a la versión en inglés en `main` en
> `HEAD`, entonces borra el valor del hash de commit en el _front matter_ y
> ejecuta el comando de **agregar** dado en la sección anterior para actualizar
> automáticamente el campo `default_lang_commit`.

Si has actualizado en lote todas tus páginas localizadas que se habían
desincronizado, puedes actualizar el hash de commit de estos archivos usando la
opción `-c` seguida de un hash de commit o de `HEAD` para usar `main@HEAD`.

```sh
npm run check:i18n -- -c <hash> <PATH-TO-YOUR-NEW-FILES>
npm run check:i18n -- -c HEAD <PATH-TO-YOUR-NEW-FILES>
```

> [!IMPORTANT]
>
> Cuando uses `HEAD` como especificador de hash, el script utilizará el hash de
> `main` en `HEAD` de tu **entorno local**. Asegúrate de hacer fetch y pull de
> `main` si quieres que `HEAD` corresponda a `main` en GitHub.

### Estado de desfase

Ejecuta `npm run fix:i18n:status` para agregar un campo en el _front matter_
llamado `drifted_from_default` a las páginas de localización objetivo que se
hayan desincronizado. Este campo pronto se usará para mostrar un banner en la
parte superior de las páginas que estén desincronizadas respecto a sus
equivalentes en inglés.

### Ayuda del script

Para más detalles sobre el script, ejecuta `npm run check:i18n -- -h`.

## Nuevas localizaciones

¿Te interesa iniciar una nueva localización del sitio web de OTel? Contacta a
los mantenedores para expresar tu interés, por ejemplo, a través de una
discusión en GitHub o del canal de Slack `#otel-docs-localization`. Esta sección
explica los pasos necesarios para iniciar una nueva localización.

> [!NOTE]
>
> No es necesario ser un contribuyente existente del proyecto OpenTelemetry para
> iniciar una nueva localización. Sin embargo, no se te añadirá como miembro de
> la
> [organización de GitHub de OpenTelemetry](https://github.com/open-telemetry/)
> ni como miembro del grupo de aprobadores de tu localización hasta que cumplas
> con los requisitos para convertirte en miembro establecido y aprobador, según
> lo descrito en las [directrices de membresía][].
>
> Antes de obtener el estatus de aprobador, puedes indicar tu aprobación de un
> PR de localización agregando un comentario "LGTM" (Looks Good To Me). Durante
> esta fase inicial, los mantenedores tratarán tus revisiones como si ya fueras
> un aprobador.

[directrices de membresía]:
  https://github.com/open-telemetry/community/blob/main/guides/contributor/membership.md

### 1. Formar un equipo de localización {#team}

Crear una localización consiste en hacer crecer una comunidad activa y
solidaria. Para iniciar una nueva localización del sitio web de OpenTelemetry
necesitas:

1. Un **mentor de localización** que conozca bien tu idioma, como un [aprobador
   activo][] del [Glosario CNCF][] o del [sitio web de Kubernetes][].
2. Al menos dos colaboradores potenciales.

[aprobador activo]: https://github.com/cncf/glossary/blob/main/CODEOWNERS
[Glosario CNCF]: https://glossary.cncf.io/
[sitio web de Kubernetes]: https://github.com/kubernetes/website

### 2. Inicio de la localización: crear un issue {#kickoff}

Con el [equipo de localización](#team) listo o en proceso de formación, crea un
issue con la lista de tareas indicada a continuación:

1. Busca el [código oficial ISO 639-1][] del idioma que quieres agregar. Nos
   referiremos a este código de idioma como `LANG_ID` en el resto de esta
   sección. Si tienes dudas sobre qué etiqueta usar, especialmente cuando se
   trate de elegir una subregión, consulta con los mantenedores.

   [código oficial ISO 639-1]: https://en.wikipedia.org/wiki/ISO_639-1

2. Identifica los usuarios de GitHub del
   [mentor y colaboradores potenciales](#team).

3. Crea un [nuevo issue][] con la siguiente lista de tareas en el comentario
   inicial:

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
   - [ ] Localize site homepage (only) to YOUR_LANGUAGE_NAME and submit a PR.
         For details, see
         [Localize the homepage](https://opentelemetry.io/docs/contributing/localization/#homepage).
   - [ ] OTel maintainers:
     - [ ] Update Hugo config for `LANG_ID`
     - [ ] Configure cSpell and other tooling support
     - [ ] Create an issue label for `lang:LANG_ID`
     - [ ] Create org-level group for `LANG_ID` approvers
     - [ ] Update components owners for `content/LANG_ID`
   - [ ] Create an issue to track the localization of the **glossary**. Add the
         issue number here. For details, see
         [Localize the glossary](https://opentelemetry.io/docs/contributing/localization/#glossary).
   ```

### 3. Localizar la página principal {#homepage}

[Envía un pull request](../pull-requests/) con la traducción de la [página
principal][] del sitio web, y _nada más_, en el archivo
`content/LANG_ID/_index.md`. Asegúrate de que los mantenedores tengan los
permisos necesarios para editar tu PR, ya que ellos agregarán cambios
adicionales necesarios para iniciar tu proyecto de localización.

[página principal]:
  https://github.com/open-telemetry/opentelemetry.io/blob/main/content/en/_index.md

Después de que tu primer PR sea fusionado, los mantenedores configurarán la
etiqueta del issue, el grupo a nivel de organización y los responsables del
componente.

### 4. Localizar el glosario {#glossary}

La segunda página a localizar es el [Glosario](/docs/concepts/glossary/). Esta
es una página **crítica** para los lectores de las versiones localizadas, ya que
define los términos clave utilizados en observabilidad y OpenTelemetry en
particular. Esto es especialmente importante si dichos términos no existen en tu
idioma.

Para obtener orientación, consulta el [video][ali-d-youtube] de la charla de Ali
Dowair en Write the Docs 2024: [El arte de la traducción: Cómo localizar
contenido técnico][ali-dowair-2024].

[ali-dowair-2024]:
  https://www.writethedocs.org/conf/atlantic/2024/speakers/#speaker-ali-dowair-what-s-in-a-word-lessons-from-localizing-kubernetes-documentation-to-arabic-ali-dowair
[ali-d-youtube]: https://youtu.be/HY3LZOQqdig

### 5. Localizar las páginas restantes del sitio en incrementos pequeños {#rest}

Con la terminología establecida, ahora puedes localizar las páginas restantes
del sitio.

> [!IMPORTANT] Envía PRs pequeños <a id="small-prs"></a>
>
> Los equipos de localización deben enviar su trabajo en **incrementos
> pequeños**. Es decir, mantén los [PRs][] pequeños, preferiblemente limitados a
> uno o unos pocos archivos pequeños. Los PRs más pequeños son más fáciles de
> revisar y, por lo tanto, generalmente se fusionan más rápido.

### Lista de verificación para mantenedores de OTel

#### Hugo

Actualiza la configuración de Hugo para `LANG_ID`. Agrega las entradas
correspondientes para `LANG_ID` bajo:

- `languages` en `config/_default/hugo.yaml`
- `module.mounts` a través de `config/_default/module-template.yaml`. Como
  mínimo, agrega una única entrada de `source`-`target` para `content`.
  Considera agregar entradas para las páginas de fallback en `en` solo cuando la
  localización tenga suficiente contenido.

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

## Guía para aprobadores y mantenedores

### Los PRs con cambios semánticos no deben abarcar varios locales {#prs-should-not-span-locales}

Los aprobadores deben asegurar que los [PRs][] que realicen cambios
**semánticos** en las páginas de documentación no abarquen múltiples locales. Un
cambio semántico es aquel que impacta el _significado_ del contenido de la
página. Nuestro [proceso de localización](.) de documentación asegura que los
aprobadores de cada locale, a su debido tiempo, revisen las ediciones en inglés
para determinar si los cambios son apropiados para su locale y cómo
incorporarlos de la mejor manera. Si se requieren cambios, los aprobadores del
locale los harán mediante sus propios PRs específicos del locale.

### Los cambios puramente editoriales entre locales están permitidos {#patch-locale-links}

Las actualizaciones de páginas **puramente editoriales** son cambios que **no**
afectan el contenido existente y pueden abarcar múltiples locales. Estos
incluyen:

- **Mantenimiento de enlaces**: Corregir rutas de enlaces rotos cuando las
  páginas se mueven o eliminan.
- **Actualización de recursos**: Actualizar enlaces a recursos externos que se
  hayan movido.
- **Adiciones de contenido específico**: Agregar nuevas definiciones o secciones
  específicas a archivos que han divergido, cuando actualizar el archivo
  completo no sea factible.

#### Corrección de enlaces y actualización de recursos {#link-fixes-and-resource-updates}

Por ejemplo, a veces los cambios en la documentación en inglés pueden provocar
fallos en la verificación de enlaces para locales que no están en inglés. Esto
sucede cuando las páginas de documentación se mueven o eliminan.

En tales situaciones, realiza las siguientes actualizaciones en cada página no
inglesa cuyo enlace falle en la verificación:

- Actualiza la referencia del enlace con la nueva ruta de la página.
- Agrega el comentario YAML `# patched` al final de la línea del campo
  `default_lang_commit` en el _front matter_.
- No realices ningún otro cambio en el archivo.
- Vuelve a ejecutar `npm run check:links` y asegúrate de que no queden fallos de
  enlaces.

Cuando un _enlace externo_ a un recurso **movido** (pero semánticamente **sin
cambios**) (como un archivo de GitHub) resulte en un fallo de verificación de
enlaces, considera:

- Eliminar el enlace roto del refcache
- Actualizar el enlace en todos los locales usando el método descrito
  anteriormente en esta sección.

#### Adiciones de contenido específico a archivos divergentes {#targeted-content-additions}

Cuando agregues contenido nuevo específico a un archivo localizado que ha
divergido de la versión en inglés, puedes optar por hacer una actualización
específica en lugar de actualizar el archivo completo. Por ejemplo, cuando se
agrega un nuevo término de glosario como "cardinalidad" al glosario en inglés,
puedes agregar solo ese término al glosario localizado sin abordar otro
contenido divergente.

Aquí hay un ejemplo del flujo de trabajo para esta actualización específica:

- Agrega solo el bloque de definición de "cardinalidad" al archivo de glosario
  localizado
- Actualiza el front matter agregando `# patched` como comentario al final de la
  línea `default_lang_commit`
- Deja todo el contenido existente sin cambios
- En la descripción del PR, documenta claramente:
  - El contenido específico agregado (definición de "cardinalidad")
  - Que el archivo sigue divergente en otro contenido
  - La justificación de la actualización específica (por ejemplo, "Proporcionar
    nueva terminología crítica a los lectores localizados sin requerir
    sincronización completa del archivo")

Este enfoque permite mejoras incrementales al contenido localizado mientras se
mantiene la conciencia de que el archivo aún requiere atención futura para una
sincronización completa con la versión en inglés.

[front matter]: https://gohugo.io/content-management/front-matter/
[main]: https://github.com/open-telemetry/opentelemetry.io/commits/main/
[mantenedores]: https://github.com/orgs/open-telemetry/teams/docs-maintainers
[framework multilingüe]: https://gohugo.io/content-management/multilingual/
[nuevo issue]: https://github.com/open-telemetry/opentelemetry.io/issues/new
[PRs]: ../pull-requests/
[slack]: https://slack.cncf.io/
