---
title: Configuración de desarrollo y comandos para construir, servir y más
linkTitle: Configuración de dev y más
description:
  Aprende cómo configurar el entorno de desarrollo para este sitio web.
what-next: >
  Ya estás listo para [construir](#build), [servir](#serve) y hacer
  actualizaciones a los archivos del sitio web. Para más detalles sobre cómo
  enviar cambios, consulta [Enviar contenido][].
weight: 60
default_lang_commit: 400dcdabbc210eb25cda6c864110127ad6229da8 # patched
cSpell:ignore: preprocesado prerequisitos
---

> [!WARNING] Entornos de compilación soportados
>
> Las compilaciones están oficialmente soportadas en entornos basados en Linux y
> macOS. Otros entornos, como [DevContainers](#devcontainers), están soportados
> con el mejor esfuerzo posible. Para compilaciones en Windows, puedes seguir
> pasos similares a los de Linux usando la línea de comandos de Windows
> Subsystem for Linux [WSL][].

Las siguientes instrucciones explican cómo configurar un entorno de desarrollo
para este sitio web.

## Configuración de IDE en la nube

### Gitpod

Para trabajar a través de [Gitpod.io][]:

1.  Haz fork de este repositorio. Si necesitas ayuda, consulta [Fork a
    repository][fork].
2.  Desde [gitpod.io/workspaces][], crea un nuevo espacio de trabajo (haz esto
    solo una vez) o abre un espacio de trabajo existente de tu fork. También
    puedes visitar un enlace con el formato:
    `https://gitpod.io#https://github.com/TU_USUARIO_GITHUB/opentelemetry.io`.

    > **Nota**: Si tienes los permisos necesarios para trabajar desde este
    > repositorio, o simplemente quieres explorar, abre
    > <https://gitpod.io/#https://github.com/open-telemetry/opentelemetry.io>.

Gitpod instala automáticamente los paquetes específicos del repositorio por ti.
{{% param what-next %}}

### Codespaces

Para trabajar a través de GitHub [Codespaces][]:

1. Haz [Fork][] del repositorio del sitio web.
2. Abre un Codespace desde tu fork.

Tu entorno de desarrollo se inicializará a través de la configuración de
[DevContainer](#devcontainers). {{% param what-next %}}

## Configuración local

1.  Haz [Fork][] y luego [clone][] del repositorio del sitio web en
    <{{% param github_repo %}}>.
2.  Ve al directorio del repositorio:

    ```sh
    cd opentelemetry.io
    ```

3.  Instala o actualiza a la versión [**LTS activa**][nodejs-rel] de Node.js.
    Recomendamos usar [nvm][] para gestionar tu instalación de Node. En Linux,
    ejecuta el siguiente comando, que instalará y actualizará a la versión
    especificada en el archivo .nvmrc:

    ```sh
    nvm install
    ```

    Para [instalar en Windows][nodejs-win], usa [nvm-windows][]. Recomendamos
    usar `cmd` y no Windows PowerShell para el siguiente comando:

    ```cmd
    nvm install lts && nvm use lts
    ```

4.  Obtén los paquetes npm y otros prerequisitos:

    ```sh
    npm install
    ```

Inicia tu IDE favorito. {{% param what-next %}}

### Construir {#build}

Para construir el sitio ejecuta:

```sh
npm run build
```

Los archivos generados del sitio están en `public`.

### Servir {#serve}

Para servir el sitio ejecuta:

```sh
npm run serve
```

El sitio se sirve en [localhost:1313][].

Si necesitas probar las redirecciones de [Netlify][], usa el siguiente comando y
visita el sitio en [localhost:8888][]:

```sh
npm run serve:netlify
```

El comando serve sirve archivos desde memoria, no desde disco.

Si ves un error como `too many open files` o `pipe failed` en macOS, es posible
que necesites aumentar el límite de descriptores de archivo. Consulta
[Hugo issue #6109](https://github.com/gohugoio/hugo/issues/6109).

### Contenido y submódulos

El sitio web se construye a partir del siguiente contenido:

- Archivos bajo `content/`, `static/`, etc. según los valores predeterminados de
  [Hugo][].
- Puntos de montaje, definidos por la [configuración][config] de Hugo en
  `config/_default/module-template.yaml`. Los montajes son directamente desde
  submódulos de git bajo [content-modules][], o contenido preprocesado desde
  `content-modules` (colocado bajo `tmp/`), y en ningún otro lugar.

[config]: https://github.com/open-telemetry/opentelemetry.io/tree/main/config
[content-modules]:
  https://github.com/open-telemetry/opentelemetry.io/tree/main/content-modules

### Cambios en submódulos

Si cambias cualquier contenido dentro de un submódulo de [content-modules][],
necesitas primero enviar un PR (que contenga los cambios del submódulo) al
repositorio del submódulo. Solo después de que el PR del submódulo haya sido
aceptado, puedes actualizar el submódulo y hacer que los cambios aparezcan en
este sitio web.

Es más fácil gestionar tus cambios en `content-modules` trabajando con el
repositorio al que está vinculado el submódulo correspondiente, en lugar de
dentro del submódulo mismo.

Los contribuyentes expertos pueden trabajar directamente en el submódulo.
Entonces podrás construir y servir directamente tus cambios (del submódulo). Por
defecto, los scripts de CI obtienen submódulos en cada invocación. Para prevenir
este comportamiento mientras trabajas dentro de un submódulo, configura la
variable de entorno `GET=no`. También necesitas ejecutar `git fetch --unshallow`
en el submódulo antes de poder enviar un PR. Alternativamente, configura
`DEPTH=100` y vuelve a obtener los submódulos.

## Soporte de DevContainer {#devcontainers}

Este repositorio está configurado para usar [Development
Containers][devcontainers], que están soportados por varios IDEs en la nube y
locales como (en orden alfabético):

- [Codespaces][cs-devc]
- [DevPod](https://devpod.sh/docs/developing-in-workspaces/devcontainer-json)
- [Gitpod](https://www.gitpod.io/docs/flex/configuration/devcontainer/overview)
- [VSCode](https://code.visualstudio.com/docs/devcontainers/containers#_installation)

[clone]:
  https://docs.github.com/es/repositories/creating-and-managing-repositories/cloning-a-repository
[codespaces]: https://docs.github.com/es/codespaces
[cs-devc]:
  https://docs.github.com/es/codespaces/setting-up-your-project-for-codespaces/adding-a-dev-container-configuration/introduction-to-dev-containers#about-dev-containers
[devcontainers]: https://containers.dev/
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
[WSL]: https://learn.microsoft.com/es-es/windows/wsl/install
