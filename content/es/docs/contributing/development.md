---
title: Configuración y comandos para construir, publicar en el entorno local y más
linkTitle: Configuración del entorno y más
description: Aprende como configurar el entorno de desarrollo para este sitio web.
weight: 60
---

Las siguientes instrucciones detallan como configurar el entorno de desarrollo para este sitio web.

## Configuración IDE en la nube

Estas instrucciones están pensadas para [Gitpod.io], ajustalas como sea necesario para usar tu IDE en la nube:

1.  Bifurcar este repositorio. Si necesitas ayuda, mira en [Bifurcar un repositorio][fork].
2.  En [gitpod.io/workspaces], crea un nuevo espacio de trabajo (haz esto solo una vez) o abre un espacio de trabajo existente de tu fork. Tambien puedes visitar el link con el formato:
    `https://gitpod.io#https://github.com/YOUR_GITHUB_ID/opentelemetry.io`.

    > **Nota**: Si ya tienes los permisos necesiarios para trabajar en este repositorio, 
    > o solo quieres echar un vistazo, abre
    > <https://gitpod.io/#https://github.com/open-telemetry/opentelemetry.io>.

Gitpod instalará automaticamente los paquetes necesarios por ti.

Aún no estas listo para [construir](#construir), [publicar en el entorno local](#publicar) o hacer actualizaciones en los ficheros del sitio web.

## Configuración local

1.  [Bifurca][fork] y [clone][] el repositorio del sitio web desde 
    <{{% param github_repo %}}>.
2.  Navega hasta el directorio del repositorio clonado.
3.  Instala o actualiza a [**una versión LTS**][nodejs-rel] de Node.js.
    Recomendamos el uso de [nvm][] para manejar la instalación de Node. En Linux,
    ejecuta el siguiente comando, el cual instalará y actualizará a la versión especificada en el fichero .nvmrc:

    ```sh
    nvm install
    ```

    Para [instalar en Windows][nodejs-win], usa [nvm-windows][]:

    ```cmd
    > nvm install lts && nvm use lts
    ```

4.  Instala los paquetes de y otros prerequisitos:

    ```sh
    npm install
    ```

Aún no estas listo para [construir](#construir), [publicar en el entorno local](#publicar) o hacer actualizaciones en los ficheros del sitio web.

### Construir

Para construir el sitio web:

```sh
npm run build
```

Los ficheros se generan bajo la carpeta `public`.

### Publicar en el entorno local

Para publicar en el entorno local, ejecuta el comando:

```sh
npm run serve
```

La web estará publicada en [localhost:1313][].

If you need to test [Netlify] redirects, use the following command and visit the
site at [localhost:8888][]:

```sh
npm run serve:netlify
```

The serve command serves files from memory, not from disk.

If you see an error like `too many open files` or `pipe failed` under macOS, you
might need to increase the file descriptor limit. See
[Hugo issue #6109](https://github.com/gohugoio/hugo/issues/6109).

### Content and submodules

The website is built from the following content:

- Files under `content/`, `static/`, etc. per [Hugo][] defaults.
- Mount points, defined in [hugo.yaml][] under `mounts`. Mounts are either
  directly from git submodules under [content-modules][], or preprocessed
  content from `content-modules` (placed under `tmp/`), and no where else.

[hugo.yaml]:
  https://github.com/open-telemetry/opentelemetry.io/blob/main/hugo.yaml
[content-modules]:
  https://github.com/open-telemetry/opentelemetry.io/tree/main/content-modules

### Submodule changes

If you change any content inside of a [content-modules][] submodule, then you
need to first submit a PR (containing the submodule changes) to the submodule's
repository. Only after the submodule PR has been accepted, can you update the
submodule and have the changes appear in this website.

It's easiest to manage your `content-modules` changes by working with the
repository that the corresponding submodule is linked to, rather than inside the
submodule itself.

Expert contributors can work directly in the submodule. You are then able to
directly build and serve your (submodule) changes. By default, the CI scripts
get submodules on every invocation. To prevent this behavior while you work
within a submodule, set the environment variable `GET=no`. You also need to run
`git fetch --unshallow` the submodule before you can submit a PR. Alternatively,
set `DEPTH=100` and re-fetch submodules.

[clone]:
  https://docs.github.com/en/repositories/creating-and-managing-repositories/cloning-a-repository
[Bifurcar]: https://docs.github.com/es/get-started/quickstart/fork-a-repo
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
