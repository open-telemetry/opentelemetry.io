---
title:
  Configuración de desarrollo y comandos para construir, visualizar en el
  entorno local y más
linkTitle: Configuración del entorno y más
description:
  Aprende cómo configurar el entorno de desarrollo para este sitio web.
weight: 60
default_lang_commit: 14fdef3f10e0a3214e6413c83426257f6ca1801f # patched
drifted_from_default: true
cSpell:ignore: adáptalas preprocesado prerequisitos redirección
---

Las siguientes instrucciones detallan cómo configurar el entorno de desarrollo
para este sitio web.

## Configuración IDE en la nube

Estas instrucciones están pensadas para [Gitpod.io], adáptalas si prefieres otro
entorno de desarrollo en la nube:

1.  Bifurcar este repositorio. Si necesitas ayuda, mira en [Bifurcar un
    repositorio][fork].
2.  En [gitpod.io/workspaces], crea un nuevo espacio de trabajo (haz esto solo
    una vez) o abre un espacio de trabajo existente de tu fork. También puedes
    visitar el enlace con el formato:
    `https://gitpod.io#https://github.com/YOUR_GITHUB_ID/opentelemetry.io`.

    > **Nota**: Si tienes los permisos necesarios para trabajar directamente en
    > este repositorio, o simplemente quieres explorar, abre
    > <https://gitpod.io/#https://github.com/open-telemetry/opentelemetry.io>.

Gitpod instalará automáticamente los paquetes necesarios por ti durante la
inicialización del entorno.

Aún no estás listo para [construir](#build),
[visualizar en el entorno local](#serve) o hacer actualizaciones en los ficheros
del sitio web.

## Configuración local

1.  [Crea un fork][fork] y [clona][clone] el repositorio del sitio web desde
    <{{% param github_repo %}}>.
2.  Navega hasta el directorio del repositorio clonado.
3.  Instala o actualiza a [**una versión LTS**][nodejs-rel] de Node.js.~~~~
    Recomendamos el uso de [nvm][] para manejar la instalación de Node. En
    Linux, ejecuta el siguiente comando, el cual instalará y actualizará a la
    versión especificada en el fichero .nvmrc:

    ```sh
    nvm install
    ```

    Para [instalar en Windows][nodejs-win], usa [nvm-windows][]:

    ```cmd
    > nvm install lts && nvm use lts
    ```

4.  Instala los paquetes del proyecto y otros prerequisitos:

    ```sh
    npm install
    ```

Aún no estás listo para [construir](#build),
[visualizar en el entorno local](#serve) o hacer actualizaciones en los ficheros
del sitio web.

### Construir {#build}

Para construir este sitio web:

```sh
npm run build
```

Los ficheros se generan bajo la carpeta `public`.

### Visualizar en el entorno local {#serve}

Para visualizar en el entorno local, ejecuta el comando:

```sh
npm run serve
```

La web estará publicada en [localhost:1313][].

Si necesitas probar la redirección de [Netlify], usa el siguiente comando y
accede a través de [localhost:8888][]:

```sh
npm run serve:netlify
```

El comando serve publica el sitio web utilizando archivos en memoria, no desde
el disco.

Si ves un error como `too many open files` o `pipe failed` en macOS, puede que
necesites aumentar el límite de ficheros abiertos. Consulta
[Hugo issue #6109](https://github.com/gohugoio/hugo/issues/6109).

### Contenido y submódulos

Este sitio web se genera a partir del siguiente contenido:

- Los ficheros bajo `content/`, `static/`, etc. Por defecto en [Hugo][].
- Los Hugo mounts, definidos en [hugo.yaml][] bajo la carpeta `mounts`. Los Hugo
  mounts también provienen directamente de los submódulos de Git, presentes en
  [content-modules][], o contenido preprocesado desde `content-modules` (situado
  bajo `tmp/`).

[hugo.yaml]:
  https://github.com/open-telemetry/opentelemetry.io/blob/bc94737/hugo.yaml
[content-modules]:
  https://github.com/open-telemetry/opentelemetry.io/tree/main/content-modules

### Cambios en los submódulos

Si realizas un cambio dentro del contenido en los [content-modules][], primero
necesitarás crear una PR (que contenga los cambios en el submódulo) al
repositorio de submódulos. Solo después de que la PR del submódulo haya sido
aceptada, será posible actualizar el submódulo y hacer que los cambios aparezcan
en este sitio web.

Es más sencillo gestionar tus cambios en `content-modules` realizando los
cambios en el repositorio al que corresponda el submódulo en lugar de dentro del
mismo submódulo.

Los colaboradores más expertos pueden trabajar directamente en el submódulo,
siendo capaces de construir y servir localmente directamente los cambios. Por
defecto, los scripts de CI obtienen los submódulos en cada invocación. Para
prevenir este comportamiento mientras trabajas dentro del submódulo, puedes
configurar la variable de entorno `GET=no`. También necesitarías ejecutar
`git fetch --unshallow` en el submódulo antes de crear la PR. De manera
alternativa, puedes configurar `DEPTH=100` para volver a clonar los submódulos.

[clone]:
  https://docs.github.com/en/repositories/creating-and-managing-repositories/cloning-a-repository
[fork]: https://docs.github.com/es/get-started/quickstart/fork-a-repo
[gitpod.io]: https://gitpod.io
[gitpod.io/workspaces]: https://gitpod.io/workspaces
[hugo]: https://gohugo.io
[localhost:1313]: http://localhost:1313
[localhost:8888]: http://localhost:8888
[netlify]: https://netlify.com
[nodejs-rel]: https://nodejs.org/es/about/previous-releases
[nodejs-win]:
  https://docs.microsoft.com/es-es/windows/dev-environment/javascript/nodejs-on-windows
[nvm]:
  https://github.com/nvm-sh/nvm/blob/master/README.md#installing-and-updating
[nvm-windows]: https://github.com/coreybutler/nvm-windows
