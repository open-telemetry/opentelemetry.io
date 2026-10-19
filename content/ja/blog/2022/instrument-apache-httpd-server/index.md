---
title: OpenTelemetry で Apache HTTP Server を計装する方法を学ぶ
linkTitle: Apache HTTP Server を計装する
date: 2022-05-27
author: '[Debajit Das](https://github.com/DebajitDas) (Cisco)'
default_lang_commit: 292689493111c46f41552901f76d4913e287608d
cSpell:ignore: Centos centos7 Debajit libmod webserver
---

Apache HTTP Server を使用していて、ウェブサーバーを監視するためのオブザーバビリティツールを切実に必要としているなら、[OpenTelemetry Module for Apache HTTP Server][] がまさに最適です。
このモジュールは、サーバーへの受信リクエストのトレースを可能にし、その受信リクエストに関与する多くのモジュール（`mod_proxy` を含む）のレスポンスタイムをキャプチャします。
これにより、各モジュールごとの階層的な時間消費を確認できます。
この記事では、OpenTelemetry Module for Apache HTTP Server の監視機能と、モジュールを使い始めるためのクイックガイドを紹介します。

## OpenTelemetry モジュールを使い始める {#getting-started-with-opentelemetry-module}

### モジュールのビルド {#building-the-module}

Apache HTTP Server 用の OpenTelemetry モジュールを使い始めるのは非常に簡単です。
必要なのは Docker エンジンと git だけです。
GitHub からソースコードをダウンロードし、CentOS7 上で Docker イメージをビルドします[^1]。

```sh
git clone https://github.com/open-telemetry/opentelemetry-cpp-contrib
cd  instrumentation/otel-webserver-module
docker compose --profile centos7 build
```

これらのコマンドにより、必要な依存関係がすべてダウンロードされ、Apache HTTP Server 用の OpenTelemetry モジュールがビルドされ、Docker イメージにインストールされます。

**Note**: 上記のコマンドは完了するまでに約1時間かかることがあります。

ビルドが完了したら、次のコマンドを入力して Docker イメージを実行します[^1]。

```sh
docker compose --profile centos7 up -d
```

上記のコマンドにより、centos7 イメージが `webserver_centos7` という名前の Docker コンテナで起動し、OpenTelemetry Collector と Zipkin バックエンドも一緒に起動します。

OpenTelemetry Module for Apache HTTP Server が設定・インストールされ、OpenTelemetry モジュールとともに Apache HTTP Server が起動します。

### バックエンドでスパンを表示する {#viewing-spans-on-the-backend}

[docker-compose.yml][] に記載されているように、`webserver_centos7` はポート9004、Zipkin はポート9411、OpenTelemetry Collector はポート4317でリッスンします。

Apache HTTP Server にリクエストを送信するには、ターミナルから curl を使用するか（`curl localhost:9004`）、任意のブラウザで [localhost:9004][] にアクセスします。
Centos 上の Apache HTTP Server のデフォルトランディングページ「Testing 123...」が以下のように表示されます。

![Testing](testing.png)

次に、Zipkin バックエンドでトレースとスパンを確認できます。
表示するには、ブラウザで [localhost:9411][] にアクセスし、**Run Query** ボタンをクリックします。
以下は、Apache HTTP Server が出力したスパンを示す Zipkin UI のスクリーンショットです。

![Span-List](span-list.png)

これは、`/noindex/css` など、Apache HTTP Server にトリガーされたクエリやエンドポイントの一覧を示しています。

詳細を確認するには、いずれかの **SHOW** ボタンをクリックします。
以下は、スパン階層を示す Zipkin UI のスクリーンショットです。

![Zipkin UI のスパン階層を示すスクリーンショット](span-hierarchy.png)

上記から、このリクエストの一部として `mod_proxy`、`mod_proxy_balancer`、`mod_dav` がリクエスト処理に関与し、各モジュールで消費された時間がわかります。

## モジュールレベルの詳細はどのように役立つか {#how-can-module-level-details-be-beneficial}

モジュールレベルの詳細の利点を示すために、PHP スクリプトに人為的な遅延を導入し、その遅延が Zipkin バックエンドでどのように表示されるかを確認します。
以下の手順を実行する必要があります。

- コンテナにログインして PHP モジュールをインストールします。

  ```sh
  docker exec -it webserver_centos7 /bin/bash
  yum install php -y
  ```

- `/etc/httpd/conf/httpd.conf` に `AddType application/x-httpd-php .html` を以下のように追加します。

  ![Php-Config](php-config.png)

- `**/var/www/html**` ディレクトリに `index.html` という名前のファイルを作成し、以下のテキストを追加します。

  ```html
  <!doctype html>
  <html>
    <head>
      <title>PHP Test Page</title>
    </head>

    <body>
      <?php echo date('h:i:s') . "<br />"; echo "Introduce delay of 1 seconds" .
      "<br />"; sleep(1); echo date('h:i:s'); ?>
    </body>
  </html>
  ```

- サーバーを再起動します。

  ```sh
  httpd -k restart
  ```

- 次に、[localhost:9004/index.html][] にアクセスします。
  以下のように表示されるはずです。

  ![Php-Response](php-response.png)

- 次に、Zipkin バックエンドでトレースとスパンを確認できます。
  表示するには、ブラウザで [localhost:9411][] にアクセスし、**Run Query** ボタンをクリックします。
  詳細を確認するには、`/index.html` に対応する **SHOW** ボタンをクリックします。

  ![Span-Delay](span-delay.png)

- `mod_php5.c_handler` が約**1秒**を消費しており、これがリクエスト全体の時間消費に寄与していることがわかります。

HTTP リクエストが個々のモジュールを通過する際、リクエストに関与するモジュールのいずれかで実行の遅延やエラーが発生する可能性があります。
リクエスト処理における遅延やエラーの根本原因を特定するために、モジュールごとの情報（個々のモジュールのレスポンスタイムなど）は Apache HTTP Server のデバッガビリティを向上させます。

## ターゲットシステムへの OpenTelemetry モジュールのインストール {#installing-opentelemetry-module-in-target-system}

Apache HTTP Server 用の OpenTelemetry モジュールを利用するには、以下の手順でパッケージを展開し、Apache HTTP Server がインストールされているターゲットシステムにインストールします。

- ソースコードをクローンするには、以下を実行します。

  ```sh
  git clone https://github.com/open-telemetry/opentelemetry-cpp-contrib
  cd  opentelemetry-cpp-contrib/instrumentation/otel-webserver-module
  ```

- Docker イメージ内にパッケージを生成するためにビルドコマンドを実行します[^1]。

  ```sh
  docker compose --profile centos7 build
  ```

上記はビルドに約1時間かかることがあります。
これにより Centos 7 イメージ上で `apache_centos7` としてビルドされます。

- ビルドが完了したら、イメージを展開します。
  以下のコマンドでコンテナを起動できます。

  ```sh
  docker run -idt --name <container_name> apache_centos7 /bin/bash
  ```

上記のコマンドでコンテナが実行され、`docker ps` コマンドで確認できます。

- コンテナ内で生成されたパッケージは `/otel-webserver-module/build` ディレクトリにあります。
  以下のようにホストシステムに展開できます。

  ```sh
  docker cp <container_name>:/otel-webserver-module/build/opentelemetry-webserver-sdk-x64-linux.tgz <target-directory>
  ```

**Note:** 上記のパッケージは、**x86-64** 命令セットと glibc バージョン2.17以上を持つ任意の Linux ディストリビューションで動作するはずです。
このブログ執筆時点では、他のアーキテクチャのサポートは提供されていません。

- 上記のパッケージと [opentelemetry_module.conf][] をターゲットシステムに転送します。

- パッケージ `opentelemetry-webserver-sdk-x64-linux.tgz` を `/opt` ディレクトリに展開します。

  ```sh
  tar -xvf opentelemetry-webserver-sdk-x64-linux.tgz -C /opt
  ```

- 次に、以下を実行してモジュールをインストールします。

  ```sh
  cd /opt/opentelemetry-webserver-sdk
  ./install.sh
  ```

- Centos の場合、Apache HTTP Server の設定は通常 `/etc/httpd/conf/` にあります。
  したがって、[opentelemetry_module.conf][] を `/etc/httpd/conf` にコピーします。

- `/etc/httpd/conf/httpd.conf` を編集し、ファイルの末尾に `Include conf/opentelemetry_module.conf` を以下のように追加します。

  ![Conf](conf.png)

- 次に、opentelemetry_module.conf とその内容を見てみましょう。
  - 以下の LoadFile は、パッケージに付属する依存ライブラリです。

    ![LoadFile](loadfile.png)

  - 以下の設定は OpenTelemetry モジュール用です。

    ![LoadModule](loadmodule.png)

    Apache HTTP Server 2.2の場合は、`libmod_apache_otel.so` のかわりに `libmod_apache_otel22.so` を使用する必要があります。

  - 以下のディレクティブは、OpenTelemetry モジュールを有効にするために ON にする必要があります。
    そうしないとモジュールは無効になります。

    ![enabled](enabled.png)

  - モジュールは Collector と連携し、OTLP 形式でデータを送信するため、以下のディレクティブが必要です。

    ![exporter](exporter.png)

    _ApacheModuleOtelExporterEndpoint_ は Collector のエンドポイントを指す必要があります。

  - ServiceNamespace、ServiceName、ServiceInstanceId は以下のディレクティブで指定する必要があります。

    ![service](service.png)

  - その他のディレクティブはオプションであり、このガイドではそのままにしておくことができます。

- OpenTelemetry モジュールが Apache HTTP Server に正しく有効化されているか確認するには、`httpd -M` と入力して `otel_apache_module (shared)` を探します。

  ![verify-module](verify-module.png)

- 次に、Apache HTTP Server を再起動すると、OpenTelemetry モジュールが計装されます。

[^1]: {{% param notes.docker-compose-v2 %}}

[docker-compose.yml]: https://github.com/open-telemetry/opentelemetry-cpp-contrib/blob/f6d29426ee9b4d6b476c09ca3cb9bed3cf23906f/instrumentation/otel-webserver-module/docker-compose.yml?from_branch=main
[localhost:9004]: http://localhost:9004
[localhost:9004/index.html]: http://localhost:9004/index.html
[localhost:9411]: http://localhost:9411
[opentelemetry_module.conf]: https://github.com/open-telemetry/opentelemetry-cpp-contrib/blob/715bab89e061b23ad95856d5a50e72f3ac9a42cb/instrumentation/otel-webserver-module/opentelemetry_module.conf?from_branch=main
[opentelemetry module for apache http server]: https://github.com/open-telemetry/opentelemetry-cpp-contrib/tree/5009fb7c0428ab7e3c18dd8eb283482ac77de932/instrumentation/otel-webserver-module?from_branch=main
