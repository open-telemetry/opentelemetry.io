---
title: 開発環境のセットアップとビルド、サーブなどのコマンド
linkTitle: 開発環境セットアップなど
description: この Web サイトの開発環境をセットアップする方法を学びます。
weight: 60
default_lang_commit: 9ba98f4fded66ec78bfafa189ab2d15d66df2309
drifted_from_default: true
---

以下の手順では、この Web サイトの開発環境をセットアップする方法を説明します。

## クラウド IDE のセットアップ {#cloud-ide-setup}

これらの手順は [Gitpod.io] 用ですが、お好みのクラウド IDE に合わせて調整してください。

1.  このリポジトリをフォークします。詳細は [リポジトリのフォーク方法][fork] を参照してください。
2.  [gitpod.io/workspaces] から新しいワークスペースを作成する（初回のみ）か、フォークしたリポジトリ上の既存のワークスペースを開きます。
    また、次の形式のリンクを開くこともできます。
    `https://gitpod.io#https://github.com/YOUR_GITHUB_ID/opentelemetry.io`

    > **注記**: このリポジトリで作業するための権限がある場合や、単に内容を確認したい場合は、
    > <https://gitpod.io/#https://github.com/open-telemetry/opentelemetry.io> を開いてください。

Gitpod はリポジトリ固有のパッケージを自動的にインストールします。

これで、[ビルド](#build)、[サーブ](#serve)、または Web サイトファイルの更新を行う準備が整いました。

## ローカルセットアップ {#local-setup}

1.  <{{% param github_repo %}}> でWeb サイトのリポジトリ[フォーク][fork]した後に、[クローン][clone]します。
2.  リポジトリのディレクトリに移動します。
3.  Node.js の [**Active LTS** リリース][nodejs-rel] をインストールまたはアップグレードします。Node.js インストレーションの管理には [nvm][] の使用を推奨します。Linux では以下のコマンドを実行してください。.nvmrc ファイルで指定されたバージョンにインストールとアップグレードします。

    ```sh
    nvm install
    ```

    Windows で [インストールする場合][nodejs-win] は、[nvm-windows][] を使用してください。

    ```cmd
    > nvm install lts && nvm use lts
    ```

4.  npm パッケージとその他の依存関係をインストールします。

    ```sh
    npm install
    ```

これで、[ビルド](#build)、[サーブ](#serve)、または Web サイトファイルの更新を行う準備が整いました。

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

[Netlify] のリダイレクトをテストする必要がある場合は、次のコマンドを実行し、[localhost:8888][] にアクセスしてください。

```sh
npm run serve:netlify
```

この `serve` コマンドは、ディスクではなくメモリ上のファイルを提供します。

macOS で `too many open files` や `pipe failed` というエラーが発生する場合は、ファイルディスクリプタの制限を増やす必要があるかもしれません。
詳しくは [Hugo のイシューの #6109](https://github.com/gohugoio/hugo/issues/6109) を参照してください。

### コンテンツとサブモジュール {#content-and-submodules}

Web サイトは以下のコンテンツを基に構築されます。

- `content/`、`static/` などの [Hugo][] のデフォルトディレクトリ
- [hugo.yaml][] の `mounts` で定義されたマウントポイント
  - これらは [content-modules][] の Git サブモジュールから直接取得される場合や、
    `content-modules` 内で前処理されたコンテンツが `tmp/` に配置される場合があります。

[hugo.yaml]: https://github.com/open-telemetry/opentelemetry.io/blob/main/hugo.yaml
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

[clone]: https://docs.github.com/en/repositories/creating-and-managing-repositories/cloning-a-repository
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
