---
title: Comprobaciones para PR
description:
  Aprenda cómo hacer que su PR pase con éxito todas las comprobaciones
weight: 40
default_lang_commit: 389e023192e051a3a835bfc6a71089c98af3b8a8
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

{{% alert title="Note" color="primary" %}}

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

## Despliegue Netlify {#netlify-deployment}

Si la compilación [Netlify](https://www.netlify.com/) falla, selecciona
**Details** para mas informacion.

## Comprobaciones de estilo {#style-checks}

Para asegurarnos de que las contribuciones sigan nuestra
[guía de estilo](../style-guide/) hemos implementado un conjunto de
comprobaciones que verifican las reglas de la guía de estilo y fallan si
encuentran algún problema.

La siguiente lista describe las comprobaciones actuales y lo que puedes hacer
para corregir errores relacionados:

### Linter TEXT {#text-linter}

Esta comprobación verifica que
[los términos y palabras específicos de OpenTelemetry se usan de manera uniforme en todo el sitio](../style-guide/#opentelemetryio-word-list).

Si se encuentran problemas, se agregan anotaciones a sus archivos en la vista
`archivos modificados` de su PR. Solucione esos problemas para que la marca de
verificación se vuelva verde. Como alternativa, puede ejecutar
`npm run check:text -- --fix` localmente para corregir la mayoría de los
problemas. Ejecute `npm run check:text` nuevamente y corrige manualmente los
problemas restantes.

### Linter MARKDOWN {#markdown-linter}

Esta comprobación verifica que
[se apliquen los estándares y la coherencia para los archivos Markdown](../style-guide/#markdown-standards).

Si se encuentran problemas, ejecuta `npm:run format` para corregir la mayoría de
los problemas. Para problemas más complejos, ejecuta `npm run check:markdown` y
aplique los cambios sugeridos.

### Verificación ORTOGRAFÍA {#spelling-check}

Esta verificación comprueba que
[todas las palabras estén escritas correctamente](../style-guide/#spell-checking).

### Comprobación CSPELL:IGNORE {#cspellignore-check}

Esta verificación comprobará que todas las palabras en su lista de ignorados de
cSpell estén normalizadas.

Si esta verificación falla, ejecuta `npm run fix:dict` localmente y envíe los
cambios en una nueva confirmación.

### Comprobación FILENAME {#filename-check}

Esta verificación comprueba que todos
[los archivos estén formateados por prettier](../style-guide/#file-format).

Si esta verificación falla, ejecuta `npm fix:format` localmente y envía los
cambios en una nueva confirmación.

### FORMATO DE ARCHIVO {#file-format}

Esta verificación comprueba que todos
[los nombres de archivo estén en mayúsculas y minúsculas](../style-guide/#file-names).

Si esta comprobación falla, ejecute `npm fix:filenames` localmente y envíe los
cambios en una nueva confirmación.

### COMPILACIÓN y VERIFICACIÓN DE ENLACES / actualizaciones de REFCACHE {#build-and-check-links--refcache-updates}

Esta comprobación verifica que todos los enlaces que sus confirmaciones están
introduciendo sean funcionales.

Ejecuta `npm run check:links` para verificarlos localmente. Esto también
actualiza el caché de referencia, o `REFCACHE`. Envía cualquier cambio a
`REFCACHE` en una nueva confirmación.

### ADVERTENCIAS en el registro de compilación {#warnings-in-build-log}

Si esta comprobación falla, revisa el registro de compilación para ver si hay
otros problemas potenciales. Pide ayuda a los mantenedores si no estás seguro de
cómo solucionarlos.
