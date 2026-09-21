---
title: 開発環境のセットアップとビルド、サーブなどのコマンド
linkTitle: 開発環境セットアップなど
description: >-
  クラウド IDE およびローカル環境のセットアップと、サイトのビルド、サーブ、チェックコマンド
what-next: >
  これで、[ビルド](#build)、[サーブ](#serve)、Web サイトファイルの更新を行う準備が整いました。
  変更の提出方法の詳細については、[コンテンツの提出](../pull-requests)を参照してください。
weight: 60
default_lang_commit: d18938b8ff4dfb2ed696f976815225f7ad8ed2a3
cSpell:ignore: TOCSS
---

> [!WARNING] サポートされているビルド環境
>
> ビルドは Linux ベースの環境と macOS で公式にサポートされています。
> [DevContainers](#devcontainers) などの他の環境は、ベストエフォートベースでサポートされています。
> Windows でのビルドについては、Windows Subsystem for Linux コマンドライン [WSL][] を使用して Linux と同様の手順に従うことができます。

## クラウド IDE のセットアップ {#cloud-ide-setup}

### Gitpod {#gitpod}

[Gitpod.io][] で作業する手順は以下です。

1.  このリポジトリをフォークします。詳細は [リポジトリのフォーク方法][fork] を参照してください。
2.  [gitpod.io/workspaces][] から新しいワークスペースを作成する（初回のみ）か、フォークしたリポジトリ上の既存のワークスペースを開きます。
    また、次の形式のリンクを開くこともできます。
    `https://gitpod.io#https://github.com/YOUR_GITHUB_ID/opentelemetry.io`

    > **Note**: このリポジトリで作業するための権限がある場合や、単に内容を確認したい場合は、
    > <https://gitpod.io/#https://github.com/open-telemetry/opentelemetry.io> を開いてください。

Gitpod はリポジトリ固有のパッケージを自動的にインストールします。
{{% param what-next %}}

### Codespaces {#codespaces}

GitHub [Codespaces][] で作業するには、下記にしたがってください。

1. Web サイトのリポジトリを[フォーク][fork]します。
2. フォークから Codespace を開きます。

開発環境は [DevContainer](#devcontainers) 設定を介して初期化されます。{{% param what-next %}}

## ローカルセットアップ {#local-setup}

1.  <{{% param github_repo %}}> でWeb サイトのリポジトリ[フォーク][fork]した後に、[クローン][clone]します。
2.  リポジトリのディレクトリに移動します。

    ```sh
    cd opentelemetry.io
    ```

3.  `.nvmrc` ファイルで指定された Node.js リリース（[Active LTS][nodejs-rel] バージョン）をインストールします。
    Node.js のインストール管理には [nvm][] を推奨します。
    Linux では以下を実行してください。

    ```sh
    nvm install
    ```

    Windows で[インストールする場合][nodejs-win]は、[nvm-windows][] を使用してください。
    nvm-windows は `.nvmrc` を自動的に読み取らないため、以下のコマンドで指定バージョンを渡します。
    `cmd` を使用し、Windows PowerShell を使用しないことをお勧めします。

    ```cmd
    for /f %v in (.nvmrc) do nvm install %v && nvm use %v
    ```

4.  DevContainer が使用する[ロックファイルに厳密に準拠し、スクリプトを抑制するセットアップ][ci-install]で、npm パッケージとその他の依存関係をインストールします。

    ```sh
    npm run install:safe
    ```

    または、標準のインストールを使用します。

    ```sh
    npm install
    ```

    どちらのインストールでも、コミットされた `package-lock.json` に固定された依存関係のバージョンを使用し、実行される依存関係のライフサイクルスクリプトはレビュー済みの許可リストに従います。
    関連情報: [依存関係の更新][dep-updates]

お好みの IDE を起動してください。{{% param what-next %}}

### ビルド {#build}

サイトをビルドするには、次のコマンドを実行します。

```sh
npm run build
```

生成されたサイトのファイルは `public` ディレクトリ内にあります。

> [!IMPORTANT]
>
> 以下のような `build` または `serve` コマンドの**エラー**が発生する場合、
>
> ```log
> ERROR error building site: ...[long message]... TOCSS: failed to transform "/scss/main.scss" (text/x-scss)
> ```
>
> または
>
> ```log
> ERROR failed to load modules: module "github.com/FortAwesome/Font-Awesome" not found
> ```
>
> 通常、これは[ローカルセットアップ](#local-setup)の手順を完了していないことが原因です。
> 特に、次のコマンドを実行してください。
>
> ```sh
> npm install
> ```

### サーブ {#serve}

サイトをサーブするには、次のコマンドを実行します。

```sh
npm run serve
```

サイトは [localhost:1313][] でサーブされます。

この `serve` コマンドは、ディスクではなくメモリ上のファイルを提供します。

Netlify のリダイレクトをテストするには、PR の[デプロイプレビュー][deploy preview]を使用してください。

macOS で `too many open files` や `pipe failed` というエラーが発生する場合は、ファイルディスクリプタの制限を増やす必要があるかもしれません。
詳しくは [Hugo のイシューの #6109](https://github.com/gohugoio/hugo/issues/6109) を参照してください。

### コンテンツとサブモジュール {#content-and-submodules}

Web サイトは以下のコンテンツを基に構築されます。

- `content/`、`static/` などの [Hugo][] のデフォルトディレクトリ
- `config/_default/module-template.yaml` の Hugo [config][] で定義されたマウントポイント。
  マウントは [content-modules][] の Git サブモジュールから直接取得される場合や、`content-modules` から前処理されたコンテンツ（`tmp/` に配置）の場合があり、それ以外の場所からは取得されません。

[config]: https://github.com/open-telemetry/opentelemetry.io/tree/main/config
[content-modules]: https://github.com/open-telemetry/opentelemetry.io/tree/main/content-modules

### サブモジュールの変更 {#submodule-changes}

[content-modules][] のサブモジュール内のコンテンツを変更する場合は、まずそのサブモジュールのリポジトリに対して PR（サブモジュールの変更を含む）を送信する必要があります。
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
- [Gitpod](https://ona.com/docs/ona/configuration/devcontainer/overview)
- [VSCode](https://code.visualstudio.com/docs/devcontainers/containers#_installation)

## ツール {#tools}

### Code-excerpter {#code-excerpter}

このリポジトリ内のソースファイルと同期を保つ必要があるコードスニペットには、[code-excerpter][] を使用してください。
各ロケールのサイトページはコードの抜粋を含みますが、それらを利用する原文は `content/en` 配下で英語で作成され、ローカリゼーションチームが各ロケール向けに更新します。

英語のソースページでは、更新対象となるフェンス付きコードブロックの直前に、ファイル抜粋ディレクティブを記載してください。

````md
<?code-excerpt path-base="examples/java/getting-started"?>

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

複数の抜粋が同じディレクトリから取得される場合は、任意の `path-base` ディレクティブをページ上部付近に 1 度だけ記載してください。
`code-excerpt` ディレクティブ構文の詳細については、[code-excerpter][] の README を参照してください。

ソースファイルまたはディレクティブを編集し、**フェンス付きコードを編集しないでください**。
その後、次の [npm スクリプト](/site/build/npm-scripts/) を実行してください。

```sh
npm run fix:code-excerpts
```

code-excerpts が最新かどうかを確認するには、次のコマンドを実行してください。

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
