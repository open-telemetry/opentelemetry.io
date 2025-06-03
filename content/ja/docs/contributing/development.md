---
title: 開発環境のセットアップとビルド、サーブなどのコマンド
linkTitle: 開発環境セットアップなど
description: この Web サイトの開発環境をセットアップする方法を学びます。
what-next: >
  これで、[ビルド](#build)、[サーブ](#serve)、Web サイトファイルの更新を行う準備が整いました。
  変更の提出方法の詳細については、[コンテンツの提出][Submitting content]を参照してください。
weight: 60
default_lang_commit: 548e5e29f574fddc3ca683989a458e9a6800242f
---

{{% alert-md title="サポートされているビルド環境" color=warning %}}

ビルドは Linux ベースの環境と macOS で公式にサポートされています。
[DevContainers](#devcontainers) などの他の環境は、ベストエフォートベースでサポートされています。

{{% /alert-md %}}

以下の手順では、この Web サイトの開発環境をセットアップする方法を説明します。

## クラウド IDE のセットアップ {#cloud-ide-setup}

### Gitpod {#gitpod}

[Gitpod.io] で作業する手順は以下です。

1.  このリポジトリをフォークします。詳細は [リポジトリのフォーク方法][fork] を参照してください。
2.  [gitpod.io/workspaces] から新しいワークスペースを作成する（初回のみ）か、フォークしたリポジトリ上の既存のワークスペースを開きます。
    また、次の形式のリンクを開くこともできます。
    `https://gitpod.io#https://github.com/YOUR_GITHUB_ID/opentelemetry.io`

    > **注記**: このリポジトリで作業するための権限がある場合や、単に内容を確認したい場合は、
    > <https://gitpod.io/#https://github.com/open-telemetry/opentelemetry.io> を開いてください。

Gitpod はリポジトリ固有のパッケージを自動的にインストールします。
{{% param what-next %}}

### Codespaces {#codespaces}

GitHub [Codespaces] で作業するには、下記にしたがってください。

1. Web サイトのリポジトリを[フォーク][fork]します。
2. フォークから Codespace を開きます。

開発環境は [DevContainer](#devcontainers) 設定を介して初期化されます。{{% param what-next %}}

## ローカルセットアップ {#local-setup}

1.  <{{% param github_repo %}}> でWeb サイトのリポジトリ[フォーク][fork]した後に、[クローン][clone]します。
2.  リポジトリのディレクトリに移動します。

    ```sh
    cd opentelemetry.io
    ```

3.  Node.js の [**Active LTS** リリース][nodejs-rel] をインストールまたはアップグレードします。
    Node.js インストレーションの管理には [nvm] の使用を推奨します。
    Linux では以下のコマンドを実行してください。
    .nvmrc ファイルで指定されたバージョンにインストールとアップグレードします。

    ```sh
    nvm install
    ```

    Windows で [インストールする場合][nodejs-win] は、[nvm-windows] を使用してください。

    ```cmd
    nvm install lts && nvm use lts
    ```

4.  npm パッケージとその他の依存関係をインストールします。

    ```sh
    npm install
    ```

お好みの IDE を起動してください。{{% param what-next %}}

### ビルド {#build}

サイトをビルドするには、次のコマンドを実行します。

```sh
npm run build
```

生成されたサイトのファイルは `public` ディレクトリ内にあります。

### サーブ {#serve}

サイトをサーブするには、次のコマンドを実行します。

```sh
npm run serve
```

サイトは [localhost:1313][] でサーブされます。

[Netlify] のリダイレクトをテストする必要がある場合は、次のコマンドを実行し、[localhost:8888] にアクセスしてください。

```sh
npm run serve:netlify
```

この `serve` コマンドは、ディスクではなくメモリ上のファイルを提供します。

macOS で `too many open files` や `pipe failed` というエラーが発生する場合は、ファイルディスクリプタの制限を増やす必要があるかもしれません。
詳しくは [Hugo のイシューの #6109](https://github.com/gohugoio/hugo/issues/6109) を参照してください。

### コンテンツとサブモジュール {#content-and-submodules}

Web サイトは以下のコンテンツを基に構築されます。

- `content/`、`static/` などの [Hugo] のデフォルトディレクトリ
- [hugo.yaml] の `mounts` で定義されたマウントポイント。マウントは [content-modules] の Git サブモジュールから直接取得される場合や、`content-modules` から前処理されたコンテンツ（`tmp/` に配置）の場合があり、それ以外の場所からは取得されません。

[hugo.yaml]: https://github.com/open-telemetry/opentelemetry.io/blob/main/hugo.yaml
[content-modules]: https://github.com/open-telemetry/opentelemetry.io/tree/main/content-modules

### サブモジュールの変更 {#submodule-changes}

[content-modules] のサブモジュール内のコンテンツを変更する場合は、まずそのサブモジュールのリポジトリに対して PR（サブモジュールの変更を含む）を送信する必要があります。
サブモジュールの PR が承認された後にのみ、サブモジュールを更新し、この Web サイトに変更を反映できます。

これは、サブモジュールそのものを更新するよりも、対応するサブモジュールの元のリポジトリで作業することが、`content-modules` の変更を管理する最も簡単な方法です。

経験豊富なコントリビューターは、サブモジュール内で直接作業することも可能です。
その場合、（サブモジュールの）変更を直接ビルドおよびサーブできます。
デフォルトでは CI スクリプトが呼び出しのたびに、サブモジュールを取得します。
作業中にこの動作を防ぐには、環境変数 `GET=no` を設定してください。
サブモジュールの PR を提出する前に、サブモジュールに対して `git fetch --unshallow` を実行する必要もあります。
または、`DEPTH=100` を設定してサブモジュールを再取得してください。

## DevContainer サポート {#devcontainers}

このリポジトリは [Development Containers][devcontainers] での使用に設定されています。DevContainerは以下のようなさまざまなクラウドおよびローカル IDE でサポートされています（アルファベット順）。

- [Codespaces][cs-devc]
- [DevPod](https://devpod.sh/docs/developing-in-workspaces/devcontainer-json)
- [Gitpod](https://www.gitpod.io/docs/flex/configuration/devcontainer/overview)
- [VSCode](https://code.visualstudio.com/docs/devcontainers/containers#_installation)

[clone]: https://docs.github.com/en/repositories/creating-and-managing-repositories/cloning-a-repository
[codespaces]: https://docs.github.com/en/codespaces
[cs-devc]: https://docs.github.com/en/codespaces/setting-up-your-project-for-codespaces/adding-a-dev-container-configuration/introduction-to-dev-containers#about-dev-containers
[devcontainers]: https://containers.dev/
[fork]: https://docs.github.com/en/get-started/quickstart/fork-a-repo
[gitpod.io]: https://gitpod.io
[gitpod.io/workspaces]: https://gitpod.io/workspaces
[hugo]: https://gohugo.io
[localhost:1313]: http://localhost:1313
[localhost:8888]: http://localhost:8888
[netlify]: https://netlify.com
[nodejs-rel]: https://nodejs.org/en/about/previous-releases
[nodejs-win]: https://docs.microsoft.com/en-us/windows/dev-environment/javascript/nodejs-on-windows
[nvm]: https://github.com/nvm-sh/nvm/blob/master/README.md#installing-and-updating
[nvm-windows]: https://github.com/coreybutler/nvm-windows

<!-- markdownlint-disable link-image-reference-definitions -->

[Submitting content]: ../pull-requests/
