---
title: Blog
description: Aprende a enviar una publicación de blog.
weight: 30
default_lang_commit: 400dcdabbc210eb25cda6c864110127ad6229da8
---

El [blog de OpenTelemetry](/blog/) comunica nuevas funcionalidades, informes de
la comunidad y cualquier noticia relevante para la comunidad de OpenTelemetry.
Esto incluye usuarios finales y desarrolladores. Cualquiera puede escribir una
publicación de blog, lee a continuación cuáles son los requisitos.

## ¿Documentación o publicación de blog?

Antes de escribir una publicación de blog, pregúntate si tu contenido también
podría ser una buena adición a la documentación. Si la respuesta es "sí", crea
un nuevo issue o pull request (PR) con tu contenido para agregarlo a la
documentación.

Ten en cuenta que el enfoque de los mantenedores y aprobadores del sitio web de
OpenTelemetry es mejorar la documentación del proyecto, por lo que tu
publicación de blog tendrá una prioridad menor para revisión.

## Solicitud de contenido para redes sociales

Si quieres solicitar la publicación de contenido en los canales de redes
sociales del proyecto OpenTelemetry que no sea una publicación de blog,
[usa este formulario](https://github.com/open-telemetry/community/issues/new?template=social-media-request.yml).

## Antes de enviar una publicación de blog

Las publicaciones de blog no deben ser de naturaleza comercial y deben consistir
en contenido original que se aplique ampliamente a la comunidad de
OpenTelemetry. Las publicaciones de blog deben seguir las políticas descritas en
la
[Guía de Redes Sociales](https://github.com/open-telemetry/community/blob/main/social-media-guide.md).

### Enlazar a repositorios de GitHub

Al enlazar a código fuente en repositorios de GitHub, no enlaces a la rama
`main` (u otra rama predeterminada). En su lugar, enlaza a un **commit
específico** o una **versión etiquetada** que refleje el estado del código en el
momento en que se escribió la publicación del blog.

Esto asegura que las publicaciones de blog permanezcan estables y no se rompan
en el futuro a medida que los repositorios evolucionan.

Verifica que tu contenido se aplique ampliamente a la Comunidad de
OpenTelemetry. El contenido apropiado incluye:

- Nuevas funcionalidades de OpenTelemetry
- Actualizaciones de proyectos de OpenTelemetry
- Actualizaciones de Grupos de Interés Especial
- Tutoriales y guías paso a paso
- Integraciones de OpenTelemetry
- [Llamada a Contribuyentes](#call-for-contributors)

El contenido inadecuado incluye:

- Presentaciones de productos de proveedores

Si tu publicación de blog encaja en la lista de contenido apropiado,
[crea un issue](https://github.com/open-telemetry/opentelemetry.io/issues/new?title=New%20Blog%20Post:%20%3Ctitle%3E)
con los siguientes detalles:

- Título de la publicación de blog
- Breve descripción y esquema de tu publicación de blog
- Si corresponde, enumera las tecnologías utilizadas en tu publicación.
  Asegúrate de que todas sean de código abierto, con preferencia por los
  proyectos sobre proyectos no-CNCF (por ejemplo, usa Jaeger para visualización
  de trazas, y Prometheus para visualización de métricas)
- Nombre de un [SIG](https://github.com/open-telemetry/community/) relacionado
  con esta publicación de blog
- Nombre de un patrocinador (mantenedor o aprobador) de este SIG, que ayudará a
  revisar ese PR. Idealmente, ese patrocinador debería ser de una empresa
  diferente.

Los mantenedores de SIG Communication verificarán que tu publicación de blog
cumple con todos los requisitos para ser aceptada. Si no puedes nombrar un
SIG/patrocinador en los detalles iniciales de tu issue, también te indicarán un
SIG apropiado al que puedes contactar para obtener patrocinio. Tener un
patrocinador es opcional, pero tener uno aumenta las posibilidades de que tu
publicación de blog sea revisada y aprobada más rápidamente.

Si tu issue tiene todo lo necesario, un mantenedor verificará que puedes
proceder a enviar tu publicación de blog.

### Llamada a Contribuyentes {#call-for-contributors}

Si estás proponiendo la creación de un nuevo proyecto o SIG, o si estás
ofreciendo una donación al proyecto OpenTelemetry, necesitarás contribuyentes
adicionales para tener éxito con tu propuesta. Para ayudarte con eso, puedes
proponer una publicación de blog que sea una "Llamada a Contribuyentes" (CfC).

Esto requiere que sigas los procesos para
[nuevos proyectos](https://github.com/open-telemetry/community/blob/main/project-management.md)
y
[donaciones](https://github.com/open-telemetry/community/blob/main/guides/contributor/donations.md).

## Enviar una publicación de blog

Puedes enviar una publicación de blog ya sea haciendo fork de este repositorio y
escribiéndola localmente o usando la interfaz de GitHub. En ambos casos te
pedimos que sigas las instrucciones proporcionadas por la
[plantilla de publicación de blog](https://github.com/open-telemetry/opentelemetry.io/tree/main/archetypes/blog.md).

### Fork y escribir localmente

Después de configurar el fork local, puedes crear una publicación de blog usando
una plantilla. Sigue estos pasos para crear una publicación desde la plantilla:

1. Ejecuta el siguiente comando desde la raíz del repositorio:

   ```sh
   npx hugo new content/en/blog/$(date +%Y)/short-name-for-post.md
   ```

   Si tu publicación tiene imágenes u otros recursos, ejecuta el siguiente
   comando:

   ```sh
   npx hugo new content/en/blog/$(date +%Y)/short-name-for-post/index.md
   ```

2. Edita el archivo Markdown en la ruta que proporcionaste en el comando
   anterior. El archivo se inicializa desde el iniciador de publicación de blog
   en
   [archetypes](https://github.com/open-telemetry/opentelemetry.io/tree/main/archetypes/).

3. Coloca recursos, como imágenes u otros archivos, en la carpeta que creaste.

4. Cuando tu publicación esté lista, envíala mediante un pull request.

### Usar la interfaz de GitHub

Si prefieres no crear un fork local, puedes usar la interfaz de GitHub para
crear una nueva publicación. Sigue estos pasos para agregar una publicación
usando la interfaz:

1.  Ve a la
    [plantilla de publicación de blog](https://github.com/open-telemetry/opentelemetry.io/tree/main/archetypes/blog.md)
    y haz clic en **Copy raw content** en la parte superior derecha del menú.

1.  Selecciona
    [Create a new file](https://github.com/open-telemetry/opentelemetry.io/new/main).

1.  Pega el contenido de la plantilla que copiaste en el primer paso.

1.  Nombra tu archivo, por ejemplo (`YYYY` es el año actual):

    `content/en/blog/YYYY/short-name-for-your-blog-post/index.md`.

1.  Edita el archivo Markdown en GitHub.

1.  Cuando tu publicación esté lista, selecciona **Propose changes** y sigue las
    instrucciones.

## Plazos de publicación

El blog de OpenTelemetry no sigue un plazo de publicación estricto, esto
significa:

- Tu publicación de blog se publicará cuando tenga todas las aprobaciones
  requeridas.
- La publicación puede posponerse si es necesario, pero los mantenedores no
  pueden garantizar la publicación en o antes de una fecha determinada.
- Ciertas publicaciones de blog (anuncios importantes) tienen prioridad y pueden
  publicarse antes que tu publicación.

## Publicación cruzada de contenido del blog

Si te gustaría compartir tu publicación del blog de OpenTelemetry en otra
plataforma, eres bienvenido a hacerlo. Solo ten en cuenta lo siguiente:

- Decide cuál versión será la publicación canónica (típicamente la publicación
  original del blog de OpenTelemetry).
- Las otras versiones de la publicación deben:
  - Mencionar claramente que la publicación original apareció en el blog de
    OpenTelemetry.
  - Incluir un enlace de regreso a la original en la parte superior o inferior
    de la página.
  - Establecer una etiqueta URL canónica apuntando a la publicación del blog de
    OpenTelemetry, si la plataforma lo soporta.

Esto ayuda a asegurar la atribución correcta, apoya las mejores prácticas de SEO
y evita la duplicación de contenido.
