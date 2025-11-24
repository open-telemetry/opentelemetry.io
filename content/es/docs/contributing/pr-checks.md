---
title: Comprobaciones para PR
description:
  Aprenda cómo hacer que su PR pase con éxito todas las comprobaciones
weight: 40
default_lang_commit: 565307515b288bf5e8bee88d73ff4fac1fd93d5e # patched
drifted_from_default: true
cSpell:ignore: REFCACHE
---

Cuando creas un
[pull request](https://docs.github.com/en/get-started/learning-about-github/github-glossary#pull-request)
(PR) con
[repositorio opentelemetry.io](https://github.com/open-telemetry/opentelemetry.io)
se ejecutan una serie de comprobaciones. Las comprobaciones PR verifican que:

- Has firmado el [CLA](#easy-cla).
- Su confirmación se puede implementar a través de
  [Netlify](#netlify-deployment) exitosamente.
- Sus cambios cumplen con nuestra [guía de estilo](#style-checks).

{{% alert title="Note" %}}

Si alguna de las comprobaciones del pull request fallan, intenta ante todo
[solucionar automáticamente problemas de contenido](../pull-requests/#fix-issues)
ejecutando `npm run fix:all` en tu máquina.

Además, puedes comentar `/fix:all` en tus PRs. Esto hará que el bot
OpenTelemetry ejecute esos comandos en su nombre y actualice la solicitud de
incorporación de cambios. Asegúrate de extraer esos cambios localmente.

Si los problemas persisten, lee a continuación qué hacen las diferentes
comprobaciones y cómo puede recuperarse un estado fallido.

{{% /alert %}}

## Easy CLA {#easy-cla}

Esta comprobación falla si no has [firmado el CLA](../prerequisites/#cla).

## Despliega Netlify {#netlify-deployment}

Si la compilación [Netlify](https://www.netlify.com/) falla, selecciona
**Details** para mas información.

## Comprobaciones de estilo {#style-checks}

Para asegurarnos de que las contribuciones sigan nuestra
[guía de estilo](../style-guide/) hemos implementado un conjunto de
comprobaciones que verifican las reglas de la guía de estilo y fallan si
encuentran algún problema.

La siguiente lista describe las comprobaciones actuales y lo que puedes hacer
para corregir errores relacionados:

### `TEXT linter` {.notranslate lang=en}

Esta comprobación verifica que
[los términos y palabras específicos de OpenTelemetry se usan de manera uniforme en todo el sitio](../style-guide/#opentelemetryio-word-list).

Si se encuentran problemas, se agregan anotaciones a sus archivos en la vista
`archivos modificados` de su PR. Solucione esos problemas para que la marca de
verificación se vuelva verde. Como alternativa, puede ejecutar
`npm run check:text -- --fix` localmente para corregir la mayoría de los
problemas. Ejecute `npm run check:text` nuevamente y corrige manualmente los
problemas restantes.

### `MARKDOWN linter` {.notranslate lang=en}

Esta comprobación verifica que
[se apliquen los estándares y la coherencia para los archivos Markdown](../style-guide/#markdown-standards).

Si se encuentran problemas, ejecuta `npm:run format` para corregir la mayoría de
los problemas. Para problemas más complejos, ejecuta `npm run check:markdown` y
aplique los cambios sugeridos.

### `SPELLING check` {.notranslate lang=en}

Esta verificación comprueba que
[todas las palabras estén escritas correctamente](../style-guide/#spell-checking).

### `CSPELL check` {.notranslate lang=en}

Esta verificación comprobará que todas las palabras en su lista de ignorados de
cSpell estén normalizadas.

Si esta verificación falla, ejecuta `npm run fix:dict` localmente y envíe los
cambios en una nueva confirmación.

### `FILENAME check` {.notranslate lang=en}

Esta verificación comprueba que todos
[los archivos estén formateados por prettier](../style-guide/#file-format).

Si esta verificación falla, ejecuta `npm fix:format` localmente y envía los
cambios en una nueva confirmación.

### `FILE FORMAT` {.notranslate lang=en}

Esta verificación comprueba que todos
[los nombres de archivo estén en mayúsculas y minúsculas](../style-guide/#file-names).

Si esta comprobación falla, ejecute `npm fix:filenames` localmente y envíe los
cambios en una nueva confirmación.

### `BUILD and CHECK LINKS` {.notranslate lang=en}

Esta comprobación verifica que todos los enlaces que sus confirmaciones están
introduciendo sean funcionales.

Ejecuta `npm run check:links` para verificarlos localmente. Esto también
actualiza el caché de referencia, o refcache. Envía cualquier cambio a la
refcache en un nuevo commit.

#### Arreglar 404s

Has de arreglar las URLs reportadas como **no válidas** (estado HTTP **404**),
por el comprobador de enlaces.

#### Tratamiento de enlaces externos válidos

El comprobador de enlaces obtiene a veces un estado HTTP diferente a 200 (éxito)
debido a servidores que bloquean comprobadores. Estos servidores devuelven a
menudo estados HTTP en el rango 400 que no son 404, como 401, 403, o 406, que
son los más comunes. Algunos servidores, como LinkedIn, devuelven un 999.

Si has comprobado manualmente un enlace externo que el comprobador de enlaces no
consigue validar con estado exitoso, añade el siguiente parámetro query a la URL
que quieres que el comprobador de enlaces ignore: `?no-link-check`. Por ejemplo,
<https:/some-example.org?no-link-check> es ignorado por el comprobador de
enlaces.

{{% alert title="Maintainers tip" %}}

Los mantenedores pueden ejecutar el siguiente script justo después de haber
ejecutado el comprobador de enlaces para que Puppeteer intente validar enlaces
con estados no exitosos.

```sh
./scripts/double-check-refcache-400s.mjs -f --max-num-to-update 99
```

Este script también valida fragmentos de URL que el comprobador de enlaces no
chequea.

{{% /alert %}}

### `WARNINGS in build log?` {.notranslate lang=en}

Si esta comprobación falla, revisa el registro de compilación para ver si hay
otros problemas potenciales. Pide ayuda a los mantenedores si no estás seguro de
cómo solucionarlos.
