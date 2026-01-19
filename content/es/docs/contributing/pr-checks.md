---
title: Verificaciones de pull request
description:
  Aprende cómo hacer que tu pull request pase exitosamente todas las
  verificaciones.
weight: 40
default_lang_commit: 400dcdabbc210eb25cda6c864110127ad6229da8
---

Cuando creas un
[pull request](https://docs.github.com/es/get-started/learning-about-github/github-glossary#pull-request)
(PR) con el
[repositorio de opentelemetry.io](https://github.com/open-telemetry/opentelemetry.io)
se ejecuta un conjunto de verificaciones. Las verificaciones del PR verifican
que:

- Has firmado el [CLA](#easy-cla)
- Tu PR se [despliega exitosamente a través de Netlify](#netlify-deployment)
- Tus cambios cumplen con nuestra [guía de estilo](#checks)

> [!NOTE]
>
> Si alguna de las verificaciones del PR falla, intenta
> [corregir problemas de contenido](../pull-requests/#fix-issues) primero
> ejecutando `npm run fix:all` localmente.
>
> También puedes agregar el comentario `/fix:all` a tu PR. Esto activará el Bot
> de OpenTelemetry para ejecutar ese comando en tu nombre y actualizar el PR.
> Asegúrate de hacer pull de esos cambios localmente.
>
> Solo si tus problemas persisten, lee a continuación qué hacen las diferentes
> verificaciones y cómo puedes recuperarte de un estado fallido.

## `Easy CLA` {.notranslate lang=en}

Esta verificación falla si no has [firmado el CLA](../prerequisites/#cla).

## Despliegue de Netlify {#netlify-deployment}

Si la compilación de [Netlify](https://www.netlify.com/) falla, selecciona
**Details** para más información.

## Verificaciones de PR en GitHub {#checks}

Para asegurar que las contribuciones sigan nuestra [guía de estilo](../style-guide/)
hemos implementado un conjunto de verificaciones que verifican las reglas de la
guía de estilo y fallan si encuentran algún problema.

La siguiente lista describe las verificaciones actuales y qué puedes hacer para
corregir errores relacionados:

### `TEXT linter` {.notranslate lang=en}

Esta verificación verifica que los
[términos y palabras específicos de OpenTelemetry se usen consistentemente en todo el sitio](../style-guide/#opentelemetryio-word-list).

Si se encuentran problemas, se agregan anotaciones a tus archivos en la vista
`files changed` de tu PR. Corrígelos para que la verificación se vuelva verde.
Como alternativa, puedes ejecutar `npm run check:text -- --fix` localmente para
corregir la mayoría de los problemas. Ejecuta `npm run check:text` nuevamente y
corrige manualmente los problemas restantes.

### `MARKDOWN linter` {.notranslate lang=en}

Esta verificación verifica que se
[apliquen estándares y consistencia para los archivos Markdown](../style-guide/#markdown-standards).

Si se encuentran problemas, ejecuta `npm run fix:markdown` para corregir la
mayoría de los problemas automáticamente. Para cualquier problema restante,
ejecuta `npm run check:markdown` y aplica los cambios sugeridos manualmente.

### `SPELLING check` {.notranslate lang=en}

Esta verificación verifica que
[todas las palabras estén escritas correctamente](../style-guide/#spell-checking).

Si esta verificación falla, ejecuta `npm run check:spelling` localmente para ver
las palabras mal escritas. Si una palabra está escrita correctamente, es posible
que necesites agregarla a la sección `cSpell:ignore` en el front matter del
archivo.

### `CSPELL` check {.notranslate lang=en}

Esta verificación verificará que todas las palabras en tu lista de ignorados de
cSpell estén normalizadas.

Si esta verificación falla, ejecuta `npm run fix:dict` localmente y sube los
cambios en un nuevo commit.

### `FILE FORMAT` {.notranslate lang=en}

Esta verificación verifica que todos los archivos cumplan con las
[reglas de formato de Prettier](../style-guide/#file-format).

Si esta verificación falla, ejecuta `npm run fix:format` localmente y sube los
cambios en un nuevo commit.

### `FILENAME check` {.notranslate lang=en}

Esta verificación verifica que todos los
[nombres de archivo estén en kebab-case](../style-guide/#file-names).

Si esta verificación falla, ejecuta `npm run fix:filenames` localmente y sube
los cambios en un nuevo commit.

### `BUILD` and `CHECK LINKS` {.notranslate lang=en}

Estas dos verificaciones compilan el sitio web y verifican que todos los enlaces
sean válidos.

Para compilar y verificar enlaces localmente, ejecuta `npm run check:links`.
Este comando también actualiza el caché de referencias. Sube cualquier cambio al
refcache en un nuevo commit.

#### Corregir 404s

Necesitas corregir las URLs reportadas como **inválidas** (estado HTTP **404**),
por el verificador de enlaces.

#### Manejo de enlaces externos válidos

El verificador de enlaces a veces obtendrá un estado HTTP diferente a 200
(éxito) por servidores que bloquean verificadores. Dichos servidores a menudo
devolverán un estado HTTP en el rango 400 diferente a 404, como 401, 403, o 406,
que son los más comunes. Algunos servidores, como LinkedIn, reportan 999.

Si has validado manualmente un enlace externo para el cual el verificador no
obtiene un estado de éxito, puedes agregar el siguiente parámetro de consulta a
tu URL para que el verificador de enlaces lo ignore: `?no-link-check`. Por
ejemplo, <https:/some-example.org?no-link-check> será ignorado por el
verificador de enlaces.

> [!TIP] Consejo para mantenedores
>
> Los mantenedores pueden ejecutar el siguiente script inmediatamente después de
> haber ejecutado el verificador de enlaces para que Puppeteer intente validar
> enlaces con estados no-ok:
>
> ```sh
> ./scripts/double-check-refcache-4XX.mjs
> ```
>
> Usa la bandera `-f` para también validar fragmentos de URL (anclas) en enlaces
> externos, lo cual `htmltest` no hace. Actualmente no ejecutamos esto
> frecuentemente, así que probablemente querrás limitar el número de entradas
> actualizadas usando la bandera `-m N`. Para información de uso, ejecuta con
> `-h`.

### `WARNINGS in build log?` {.notranslate lang=en}

Si esta verificación falla, revisa el log de `BUILD and CHECK LINKS`, bajo el
paso `npm run log:check:links`, para cualquier otro problema potencial. Pide
ayuda a los mantenedores si no estás seguro de cómo recuperarte.
