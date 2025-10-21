---
title: Blog
description: Aprende a enviar una publicación de blog.
weight: 30
default_lang_commit: 493a530efd3c2a058cc4aa055d7c8aadb5348beb
drifted_from_default: true
---

El [blog de OpenTelemetry](/blog/) comunica nuevas funciones, informes de la
comunidad y cualquier noticia relevante para la comunidad de OpenTelemetry. Esto
incluye a usuarios finales y desarrolladores. Cualquiera puede escribir una
entrada de blog. Lee a continuación los requisitos.

## ¿Documentación o publicación de blog?

Antes de escribir una entrada de blog, pregúntate si tu contenido también podría
ser una buena adición a la documentación. Si la respuesta es afirmativa, crea
una nueva incidencia o solicitud de incorporación de cambios (PR) con tu
contenido para que se añada a la documentación.

Ten en cuenta que el objetivo de los mantenedores y aprobadores del sitio web de
OpenTelemetry es mejorar la documentación del proyecto, por lo que tu entrada de
blog tendrá una menor prioridad de revisión.

## Antes de enviar una publicación de blog

Las publicaciones del blog no deben ser de naturaleza comercial y deben
consistir en contenido original que se aplica ampliamente a la comunidad de
OpenTelemetry. Las publicaciones del blog deben seguir las políticas descritas
en la
[Guía de Redes Sociales](https://github.com/open-telemetry/community/blob/main/social-media-guide.md).

Verifique que el contenido que deseas incluir se aplique ampliamente a la
Comunidad OpenTelemetry. El contenido adecuado incluye:

- Nuevas funcionalidades de OpenTelemetry
- Actualizaciones de proyectos de OpenTelemetry
- Actualizaciones de grupos de interés especial
- Tutoriales y guías
- Integraciones de OpenTelemetry

El contenido inadecuado incluye:

- Presentaciones de productos de proveedores

Si tu publicación de blog se ajusta a la lista de contenido apropiado,
[plantea un issue](https://github.com/open-telemetry/opentelemetry.io/issues/new?title=New%20Blog%20Post:%20%3Ctitle%3E)
con la siguiente información:

- Título de la entrada
- Breve descripción y resumen de la entrada
- Si corresponde, enumera las tecnologías utilizadas en la entrada. Asegúrate de
  que todas sean de código abierto y prioriza los proyectos CNCF sobre los que
  no lo son (por ejemplo, usa Jaeger para la visualización de trazas y
  Prometheus para la visualización de métricas).
- Nombre de un [SIG](https://github.com/open-telemetry/community/), que está
  relacionado con esta entrada del blog.
- Nombre de un patrocinador (mantenedor o aprobador) de este SIG, que ayudará a
  revisar esa solicitud de registro. Idealmente, ese patrocinador debería
  pertenecer a otra empresa.

Los mantenedores de la comunicación de SIG verificarán que tu entrada de blog
cumple con todos los requisitos para ser aceptada. Si no puedes nombrar una SIG
o patrocinador en los detalles iniciales de tu publicación, también te indicarán
una SIG adecuada a la que puedes contactar para obtener patrocinio. Contar con
un patrocinador es opcional, pero tener uno aumenta las posibilidades de que tu
entrada de blog sea revisada y aprobada más rápidamente.

Si tu publicación cumple con todos los requisitos, un mantenedor verificará que
puedes enviar tu entrada de blog.

## Enviar una entrada de blog

Puedes enviar una entrada de blog bifurcando este repositorio y escribiéndola
localmente o usando la interfaz de GitHub. En ambos casos, te pedimos que sigues
las instrucciones proporcionadas por la
[plantilla de publicación de blog](https://github.com/open-telemetry/opentelemetry.io/tree/main/archetypes/blog.md).

### Bifurcar y escribir localmente

Después de configurar la bifurcación local, puedes crear una entrada de blog
usando una plantilla. Sigue estos pasos para crear una entrada a partir de la
plantilla:

1. Ejecuta el siguiente comando desde la raíz del repositorio:

   ```sh
   npx hugo new content/en/blog/2024/short-name-for-post.md
   ```

   Si tu publicación tiene imágenes o otros recursos, ejecuta el siguiente
   comando:

   ```sh
   npx hugo new content/en/blog/2024/short-name-for-post/index.md
   ```

2. Edita el archivo Markdown en la ruta que proporcionó en el comando anterior.
   El archivo se inicializa desde el iniciador de la entrada del blog en
   [arquetipos](https://github.com/open-telemetry/opentelemetry.io/tree/main/archetypes/).

3. Coloca activos, como imágenes o otros archivos, en la carpeta que has creado.

4. Cuando tu publicación esta lista, envíala a través de una solicitud de
   extracción.

### Utiliza la interfaz de usuario de GitHub

Si prefieres no crear una bifurcación local, puedes usar la interfaz de GitHub
para crear una nueva publicación. Sigue estos pasos para agregar una publicación
usando la interfaz:

1.  Va a la
    [plantilla de publicación de blog](https://github.com/open-telemetry/opentelemetry.io/tree/main/archetypes/blog.md)
    y haz clic en **Copiar contenido sin procesar** en la parte superior derecha
    del menú.

2.  Selecciona
    [Crear un nuevo archivo](https://github.com/open-telemetry/opentelemetry.io/new/main).

3.  Pega el contenido de la plantilla que copiaste en el primer paso.

4.  Nombra tu archivo, por ejemplo
    `content/en/blog/2022/short-name-for-your-blog-post/index.md`.

5.  Edita el archivo Markdown en GitHub.

6.  Cuando tu publicación esta lista, selecciona **Proponer cambios** y sigue
    las instrucciones.

## Plazos de publicación

El blog de OpenTelemetry no sigue un plazo de publicación estricto. Esto
significa que:

- Tu entrada se publicará cuando cuenta con todas las aprobaciones necesarias.
- La publicación puede posponerse si es necesario, pero los mantenedores no
  pueden garantizar su publicación en una fecha determinada o antes.
- Ciertas entradas (anuncios importantes) tienen prioridad y podrían publicarse
  antes que la tuya.

## Publicación cruzada de contenido del blog

Si deseas compartir tu entrada de OpenTelemetry en otra plataforma, puedes
hacerlo. Solo ten en cuenta lo siguiente:

- Decide qué versión será la publicación canónica (normalmente la entrada
  original de OpenTelemetry).
- Las demás versiones de la entrada deben:
  - Mencionar claramente que la entrada original apareció en el blog de
    OpenTelemetry.
  - Incluir un enlace a la publicación original en la parte superior o inferior
    de la página.
  - Establezca una etiqueta URL canónica que apunta a la entrada del blog de
    OpenTelemetry, si la plataforma lo permite.

Esto ayuda a garantizar una atribución correcta, apoya las mejores prácticas de
SEO y evita la duplicación del contenido.
