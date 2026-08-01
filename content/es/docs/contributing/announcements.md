---
title: Anuncios
description: Crea anuncios o banners para eventos especiales.
weight: 50
default_lang_commit: 400dcdabbc210eb25cda6c864110127ad6229da8
---

Un anuncio es una _página normal de Hugo_ contenida bajo la sección
`announcements` de un locale. Esto significa que aprovechamos el manejo
integrado de Hugo de fechas de página (futuras o expiradas),
internacionalización y más, para mostrar u ocultar automáticamente banners
dependiendo de la fecha de compilación, determinar el orden de los banners,
manejar el fallback a banners en inglés, etc.

> Los anuncios actualmente se usan solo como banners. Es _posible_ que
> eventualmente también soportemos anuncios más generales.

## Crear un anuncio

Para agregar un nuevo anuncio, crea un archivo Markdown de anuncio bajo la
carpeta `announcements` de tu localización usando el siguiente comando:

```sh
hugo new --kind announcement content/YOUR-LOCALE/announcements/announcement-file-name.md
```

Ajusta según tu locale y nombre de archivo deseado. Agrega el texto del anuncio
como el cuerpo de la página.

> Para banners, el cuerpo del anuncio debe ser una frase corta.

<!-- markdownlint-disable no-blanks-blockquote -->

> [!NOTE] Para localizaciones
>
> Si estás creando una **anulación de anuncio específica del locale**, asegúrate
> de usar el **mismo nombre de archivo** que el anuncio en idioma inglés.

## Lista de anuncios

Cualquier anuncio dado aparecerá en una compilación del sitio cuando la fecha de
compilación esté entre los campos `date` y `expiryDate` del anuncio. Cuando esos
campos faltan, se asume que son "ahora" y "para siempre", respectivamente.

Los anuncios aparecerán en el orden de página estándar según lo determinado
usando la función de
[Regular pages](https://gohugo.io/methods/site/regularpages/) de Hugo. Es decir,
los anuncios más "ligeros" (por `weight`) aparecerán primero; cuando los pesos
son iguales o no están especificados, los anuncios más recientes (por `date`)
aparecerán primero, etc.

Entonces, si quieres forzar un anuncio al principio, usa un `weight` negativo en
el front matter.

Si encuentras un bug o un problema con el contenido de este repositorio, o te
gustaría solicitar una mejora, [crea un issue][new-issue].

Si descubres un problema de seguridad, lee la
[Política de Seguridad](https://github.com/open-telemetry/opentelemetry.io/security/policy)
antes de abrir un issue.

Antes de reportar un nuevo issue, asegúrate de que el issue no haya sido
reportado o solucionado previamente buscando en nuestra
[lista de issues](https://github.com/open-telemetry/opentelemetry.io/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc).

Al crear un nuevo issue, incluye un título corto y significativo, y una
descripción clara. Agrega toda la información relevante que puedas, y, si es
posible, un caso de prueba.

[new-issue]:
  https://github.com/open-telemetry/opentelemetry.io/issues/new/choose
