---
title: Configuração de desenvolvimento e comandos para compilar, servir e mais
linkTitle: Config. desenvolvimento
description: >-
  Configurações de ambiente em IDE de nuvem e local, e os comandos de
  compilação, execução e verificação do site
what-next: >
  Agora você está pronto para [compilar](#build), [servir](#serve) e fazer
  atualizações nos arquivos do site. Para mais detalhes sobre como submeter
  alterações, veja [Enviando conteúdo](../pull-requests).
weight: 60
default_lang_commit: ddf2415df2c47195339aaaa6d4cfb5c12a00b759
drifted_from_default: true
cSpell:ignore: TOCSS
---

> [!WARNING] Ambientes de compilação suportados
>
> As compilações são oficialmente suportadas em ambientes baseados em Linux e
> macOS. Outros ambientes, como os [DevContainers](#devcontainers), são
> suportados com base na melhor forma que seja possível. Para compilação no
> Windows, é possível seguir passos similares aos do Linux usando a linha de
> comando do Windows Subsystem for Linux [WSL][].

## Configuração de IDE de nuvem {#cloud-ide-setup}

### Gitpod

Para trabalhar via [Gitpod.io][]:

1.  Faça um _fork_ deste repositório. Para ajuda, veja [Fazer fork de um
    repositório][fork].
2.  De [gitpod.io/workspaces][], crie um novo _workspace_ (faça isso apenas uma
    vez) ou abra um _workspace_ existente sobre seu fork. Você também pode
    visitar um link da forma:
    `https://gitpod.io#https://github.com/SEU_ID_GITHUB/opentelemetry.io`.

    > **Nota**: Se você tem as permissões necessárias para trabalhar neste
    > repositório, ou apenas quer dar uma olhada, abra
    > <https://gitpod.io/#https://github.com/open-telemetry/opentelemetry.io>.

O Gitpod instala automaticamente os pacotes específicos do repositório para
você. {{% param what-next %}}

### Codespaces {#codespaces}

Para trabalhar via GitHub [Codespaces][]:

1. Faça um [_fork_][fork] do repositório do site.
2. Abra um _Codespace_ a partir do seu _fork_.

Seu ambiente de desenvolvimento será inicializado via a configuração
[DevContainer](#devcontainers). {{% param what-next %}}

## Configuração local {#local-setup}

1.  Faça um [_fork_][fork] e então [clone][] o repositório do site em
    <{{% param github_repo %}}>.
2.  Vá para o diretório do repositório:

    ```sh
    cd opentelemetry.io
    ```

3.  Instale a versão do Node.js fixada no arquivo `.nvmrc` (uma versão [LTS
    ativa][nodejs-rel]). Recomendamos o [nvm][] para gerenciar a instalação do
    Node; no Linux, execute:

    ```sh
    nvm install
    ```

    Para [instalar no Windows][nodejs-win], use o [nvm-windows][], que não lê o
    arquivo `.nvmrc` por conta própria; o comando a seguir fornece a versão
    fixada. Recomendamos usar `cmd` e não o Windows PowerShell:

    ```cmd
    for /f %v in (.nvmrc) do nvm install %v && nvm use %v
    ```

4.  Obtenha os pacotes npm e outros pré-requisitos, usando a [configuração com
    versões exatas do _lockfile_ e sem execução de _scripts_][ci-install] que o
    devcontainer utiliza:

    ```sh
    npm run install:safe
    ```

    Ou, use uma instalação padrão:

    ```sh
    npm install
    ```

    Ambas as instalações usam as versões de dependências fixadas no
    `package-lock.json` versionado, e qualquer _script_ de ciclo de vida de
    dependência que for executado está sujeito à lista de permissões revisada.
    Relacionado: [atualização de dependências][dep-updates].

Abra sua IDE favorita. {{% param what-next %}}

### Compilar {#build}

Para compilar o site execute:

```sh
npm run build
```

Os arquivos gerados do site estão em `public`.

> [!IMPORTANT]
>
> Caso ocorram **erros** nos comandos de compilação ou de execução semelhantes
> ao seguinte:
>
> ```log
> ERROR error building site: ...[long message]... TOCSS: failed to transform "/scss/main.scss" (text/x-scss)
> ```
>
> Ou:
>
> ```log
> ERROR failed to load modules: module "github.com/FortAwesome/Font-Awesome" not found
> ```
>
> Isso geralmente acontece porque nem todas as etapas da
> [configuração local](#local-setup) foram concluídas. Em particular, execute
> (novamente) este comando:
>
> ```sh
> npm install
> ```

### Servir {#serve}

Para servir o site execute:

```sh
npm run serve
```

O site é servido em [localhost:1313][].

O comando `serve` disponibiliza arquivos da memória, não do disco.

Para testar redirecionamentos do Netlify, use a [prévia de
_deploy_][deploy preview] do seu PR.

Caso ocorra um erro como `too many open files` ou `pipe failed` no macOS, pode
ser necessário aumentar o limite de descritores de arquivo. Veja
[Hugo issue #6109](https://github.com/gohugoio/hugo/issues/6109).

### Conteúdo e submódulos {#content-and-submodules}

O site é construído a partir do seguinte conteúdo:

- Arquivos sob `content/`, `static/`, etc. conforme os padrões do [Hugo][].
- Pontos de montagem, definidos pela [configuração][config] do Hugo em
  `config/_default/module-template.yaml`. As montagens são diretamente de
  submódulos git sob [content-modules][], ou conteúdo pré-processado de
  `content-modules` (colocado sob `tmp/`), e em nenhum outro lugar.

[config]: https://github.com/open-telemetry/opentelemetry.io/tree/main/config
[content-modules]:
  https://github.com/open-telemetry/opentelemetry.io/tree/main/content-modules

### Alterações em submódulos {#content-modules-changes}

Se você alterar qualquer conteúdo dentro de um submódulo [content-modules][],
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
- [Gitpod](https://ona.com/docs/ona/configuration/devcontainer/overview)
- [VSCode](https://code.visualstudio.com/docs/devcontainers/containers#_installation)

## Ferramentas {#tools}

### Code-excerpter {#code-excerpter}

Use o [code-excerpter][] para trechos de código que devem permanecer
sincronizados com arquivos-fonte deste repositório. Páginas do site em qualquer
idioma podem conter trechos de código, mas o conteúdo original que os utiliza é
escrito em inglês em `content/en` e depois atualizado pelas equipes de
localização para seus próprios idiomas.

Na página de origem em inglês, coloque uma diretiva de trecho de arquivo
imediatamente antes do bloco de código delimitado que ela atualiza:

````md
<?code-excerpt path-base="content-modules/opentelemetry-java-examples/doc-snippets/getting-started"?>

<?code-excerpt "src/main/java/otel/DiceApplication.java" from="@SpringBootApplication"?>

```java
@SpringBootApplication
public class DiceApplication {
  public static void main(String[] args) {
    SpringApplication app = new SpringApplication(DiceApplication.class);
    app.setBannerMode(Banner.Mode.OFF);
    app.run(args);
  }
}
```
````

Use uma diretiva opcional `path-base` uma única vez, próximo ao topo da página,
quando vários trechos vierem do mesmo diretório. Para detalhes sobre a sintaxe
da diretiva `code-excerpt`, consulte o README do [code-excerpter][].

Edite o arquivo-fonte ou a diretiva, **não o bloco de código**. Em seguida,
execute o seguinte [_script_ npm](/site/build/npm-scripts/):

```sh
npm run fix:code-excerpts
```

Para verificar se os trechos de código estão atualizados, execute:

```sh
npm run check:code-excerpts
```

[code-excerpter]: https://github.com/chalin/code-excerpter

<!-- prettier-ignore-start -->
[ci-install]: /site/build/dependencies/#install-contracts
[dep-updates]: /site/build/dependencies/#updating
[clone]: https://docs.github.com/en/repositories/creating-and-managing-repositories/cloning-a-repository
[codespaces]: https://docs.github.com/en/codespaces
[cs-devc]: https://docs.github.com/en/codespaces/setting-up-your-project-for-codespaces/adding-a-dev-container-configuration/introduction-to-dev-containers#about-dev-containers
[deploy preview]: ../pull-requests/#site-deploys-and-pr-previews
[devcontainers]: https://containers.dev/
[fork]: https://docs.github.com/en/get-started/quickstart/fork-a-repo
[gitpod.io]: https://gitpod.io
[gitpod.io/workspaces]: https://gitpod.io/workspaces
[hugo]: https://gohugo.io
[localhost:1313]: http://localhost:1313
[nodejs-rel]: https://nodejs.org/en/about/previous-releases
[nodejs-win]: https://docs.microsoft.com/en-us/windows/dev-environment/javascript/nodejs-on-windows
[nvm-windows]: https://github.com/coreybutler/nvm-windows
[nvm]: https://github.com/nvm-sh/nvm/blob/master/README.md#installing-and-updating
[WSL]: https://learn.microsoft.com/en-us/windows/wsl/install
<!-- prettier-ignore-end -->
