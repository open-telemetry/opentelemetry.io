---
title: Configuração de desenvolvimento e comandos para compilar, servir e mais
linkTitle: Config. desenvolvimento
description:
  Aprenda como configurar um ambiente de desenvolvimento para este site.
what-next: >
  Agora você está pronto para [compilar](#build), [servir](#serve) e fazer
  atualizações nos arquivos do site. Para mais detalhes sobre como submeter
  alterações, veja [Enviando conteúdo][].
weight: 60
default_lang_commit: 3337aa6fbaccf5e8734a1ef2c6ca8b61496c3d93 # patched
drifted_from_default: true
---

{{% alert title="Ambientes de construção suportados" color=warning %}}

As compilações são oficialmente suportadas em ambientes baseados em Linux e
macOS. Outros ambientes, como os [DevContainers](#devcontainers), são suportados
com base na melhor forma que seja possível. Para compilação no Windows, você
pode seguir passos similares aos do Linux usando a linha de comando do Windows
Subsystem para Linux [WSL][windows-wsl].

{{% /alert %}}

As instruções a seguir explicam como configurar um ambiente de desenvolvimento
para este site.

## Configuração de IDE de nuvem {#cloud-ide-setup}

### Gitpod

Para trabalhar via [Gitpod.io]:

1.  Faça um _fork_ deste repositório. Para ajuda, veja [Fazer fork de um
    repositório][fork].
2.  De [gitpod.io/workspaces], crie um novo _workspace_ (faça isso apenas uma
    vez) ou abra um _workspace_ existente sobre seu fork. Você também pode
    visitar um link da forma:
    `https://gitpod.io#https://github.com/SEU_ID_GITHUB/opentelemetry.io`.

    > **Nota**: Se você tem as permissões necessárias para trabalhar neste
    > repositório, ou apenas quer dar uma olhada, abra
    > <https://gitpod.io/#https://github.com/open-telemetry/opentelemetry.io>.

O Gitpod instala automaticamente os pacotes específicos do repositório para
você. {{% param what-next %}}

### Codespaces {#codespaces}

Para trabalhar via GitHub [Codespaces]:

1. Faça um [_Fork_] do repositório do site.
2. Abra um _Codespace_ a partir do seu _fork_.

Seu ambiente de desenvolvimento será inicializado via a configuração
[DevContainer](#devcontainers). {{% param what-next %}}

## Configuração local {#local-setup}

1.  Faça um [_Fork_] e então [clone] o repositório do site em
    <{{% param github_repo %}}>.
2.  Vá para o diretório do repositório:

    ```sh
    cd opentelemetry.io
    ```

3.  Instale ou atualize para a [versão **LTS ativa**][nodejs-rel] do Node.js.
    Recomendamos usar [nvm] para gerenciar sua instalação do Node. No Linux,
    execute o seguinte comando, que instalará e atualizará para a versão
    especificada no arquivo .nvmrc:

    ```sh
    nvm install
    ```

    Para [instalar no Windows][nodejs-win], use [nvm-windows]. Recomendamos usar
    `cmd` e não o Windows PowerShell para o comando abaixo:

    ```cmd
    nvm install lts && nvm use lts
    ```

4.  Obtenha os pacotes npm e outros pré-requisitos:

    ```sh
    npm install
    ```

Abra sua IDE favorita. {{% param what-next %}}

### Compilar {#build}

Para compilar o site execute:

```sh
npm run build
```

Os arquivos gerados do site estão em `public`.

### Servir {#serve}

Para servir o site execute:

```sh
npm run serve
```

O site é servido em [localhost:1313].

Se você precisar testar redirecionamentos do [Netlify], use o seguinte comando e
visite o site em [localhost:8888]:

```sh
npm run serve:netlify
```

O comando `serve` disponibiliza arquivos da memória, não do disco.

Se você ver um erro como `too many open files` ou `pipe failed` no macOS, você
precisar aumentar o limite de descritores de arquivo. Veja
[Hugo issue #6109](https://github.com/gohugoio/hugo/issues/6109).

### Conteúdo e submódulos {#content-and-submodules}

O site é construído a partir do seguinte conteúdo:

- Arquivos sob `content/`, `static/`, etc. conforme os padrões do [Hugo].
- Pontos de montagem, definidos em [hugo.yaml] sob `mounts`. As montagens são
  diretamente de submódulos git sob [content-modules], ou conteúdo
  pré-processado de `content-modules` (colocado sob `tmp/`), e em nenhum outro
  lugar.

[hugo.yaml]:
  https://github.com/open-telemetry/opentelemetry.io/blob/bc94737/hugo.yaml
[content-modules]:
  https://github.com/open-telemetry/opentelemetry.io/tree/main/content-modules

### Alterações em submódulos {#content-modules-changes}

Se você alterar qualquer conteúdo dentro de um submódulo [content-modules],
então você precisa primeiro submeter um PR (contendo as alterações do submódulo)
para o repositório do submódulo. Somente depois que o PR do submódulo for
aceito, você pode atualizar o submódulo e ter as mudanças publicadas neste site.

É mais fácil gerenciar suas alterações em `content-modules` trabalhando com o
repositório ao qual o submódulo correspondente está vinculado, em vez de dentro
do próprio submódulo.

Contribuidores experientes podem trabalhar diretamente no submódulo. Você então
consegue construir e disponibilizar diretamente suas alterações (do submódulo).
Por padrão, os _scripts_ de CI obtêm submódulos a cada invocação. Para prevenir
esse comportamento enquanto você trabalha dentro de um submódulo, defina a
variável de ambiente `GET=no`. Você também precisa executar
`git fetch --unshallow` no submódulo antes de poder submeter um PR. De maneira
alternativa, defina `DEPTH=100` e busque novamente os submódulos.

## Suporte a DevContainer {#devcontainers}

Este repositório está configurado para uso em [Development
Containers][devcontainers], que são suportados por várias IDEs de nuvem e locais
como (em ordem alfabética):

- [Codespaces][cs-devc]
- [DevPod](https://devpod.sh/docs/developing-in-workspaces/devcontainer-json)
- [Gitpod](https://www.gitpod.io/docs/flex/configuration/devcontainer/overview)
- [VSCode](https://code.visualstudio.com/docs/devcontainers/containers#_installation)

[clone]:
  https://docs.github.com/en/repositories/creating-and-managing-repositories/cloning-a-repository
[codespaces]: https://docs.github.com/en/codespaces
[cs-devc]:
  https://docs.github.com/en/codespaces/setting-up-your-project-for-codespaces/adding-a-dev-container-configuration/introduction-to-dev-containers#about-dev-containers
[devcontainers]: https://containers.dev/
[fork]: https://docs.github.com/en/get-started/quickstart/fork-a-repo
[gitpod.io]: https://gitpod.io
[gitpod.io/workspaces]: https://gitpod.io/workspaces
[hugo]: https://gohugo.io
[localhost:1313]: http://localhost:1313
[localhost:8888]: http://localhost:8888
[netlify]: https://netlify.com
[nodejs-rel]: https://nodejs.org/en/about/previous-releases
[nodejs-win]:
  https://docs.microsoft.com/en-us/windows/dev-environment/javascript/nodejs-on-windows
[nvm]:
  https://github.com/nvm-sh/nvm/blob/master/README.md#installing-and-updating
[nvm-windows]: https://github.com/coreybutler/nvm-windows
[windows-wsl]: https://learn.microsoft.com/en-us/windows/wsl/install

<!-- markdownlint-disable link-image-reference-definitions -->

[Enviando conteúdo]: ../pull-requests/
