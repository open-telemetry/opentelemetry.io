---
title: Anuncios
description: Crea anuncios o banners para eventos especiales.
weight: 50
default_lang_commit: 645760e1961cb45d9ce6b291887c74ce4efa0398 # patched
drifted_from_default: true
---

Un anuncio es una _página de Hugo normal_, ubicada en la sección `anuncios` de
una configuración regional. Esto significa que aprovechamos la gestión integrada
de Hugo de fechas de página (futuras o vencidas), internacionalización y más,
para mostrar u ocultar banners automáticamente según la fecha de compilación,
determinar el orden de los banners, gestionar el uso de banners en inglés, etc.

> Actualmente, los anuncios se usan solo como banners. Es _posible_ que, con el
> tiempo, también admitamos anuncios más generales.

## Creando un anuncio

Para agregar un nuevo anuncio, crea un archivo Markdown de anuncios en la
carpeta `anuncios` de su localización usando el siguiente comando:

```sh
hugo new --kind announcement content/YOUR-LOCALE/announcements/announcement-file-name.md
```

Modifica el archivo según la configuración regional y el nombre de archivo que
desees. Agrega el texto del anuncio como cuerpo de la página.

> En el caso de los banners, el cuerpo del anuncio debe ser una frase corta.

{{% alert title="Para localizaciones" %}}

Si estás creando una **anulación de anuncio específica de la configuración
regional**, asegúrate de utilizar el **mismo nombre de archivo** que el anuncio
en idioma inglés.

{{% /alert %}}

## Lista de anuncios

Cualquier anuncio aparecerá en la compilación de un sitio web cuando la fecha de
compilación se encuentre entre los campos `fecha` y `fecha de vencimiento`.
Cuando estos campos faltan, se asume que son "ahora" y "para siempre",
respectivamente.

Los anuncios aparecerán en el orden de páginas estándar según lo determinado
mediante la función de
[Páginas relacionadas](https://gohugo.io/methods/site/regularpages/) de Hugo. Es
decir, los anuncios más "ligeros" (por `peso`) aparecerán primero; cuando los
pesos sean iguales o no estén especificados, los anuncios más recientes (por
`fecha`) aparecerán primero, etc.

Por lo tanto, si deseas que un anuncio aparezca en la parte superior, utilice un
`peso` negativo en la portada.

Si encuentras un error o un problema con el contenido de este repositorio, o si
deseas solicitar una mejora, [crea un issue][new-issue].

Si descubres un problema de seguridad, lee la
[Política de Seguridad](https://github.com/open-telemetry/opentelemetry.io/security/policy)
antes de abrir un issue.

Antes de reportar un nuevo problema, asegúrate de que no se haya reportado o
solucionado previamente buscando en nuestra
[lista de issues](https://github.com/open-telemetry/opentelemetry.io/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc).

Al crear un nuevo issue, incluye un título breve y conciso, así como una
descripción clara. Añade toda la información relevante posible y, si es posible,
un caso de prueba.

[new-issue]:
  https://github.com/open-telemetry/opentelemetry.io/issues/new/choose
