---
title: OpenTelemetry PHP Distro のセットアップ
description: >-
  OpenTelemetry PHP Distro をインストールおよび設定して、PHP
  アプリケーションからテレメトリーデータの送信を開始する方法を学びます。
weight: 1
default_lang_commit: 68992866a957386e428a4d63ec884ea9dc7570b6
cSpell:ignore: apk dpkg fpm RoadRunner Swoole
---

OpenTelemetry PHP Distro を使用して PHP アプリケーションを計装し、OTLP 互換バックエンドにテレメトリーデータを送信する方法を学びます。

## 前提条件 {#prerequisites}

- テレメトリーデータの送信先（OTLP エンドポイント）があること。
- サポートされている Linux ディストリビューションと PHP バージョンを使用していること。
- 同じプロセスで他の PHP APM や OpenTelemetry エージェントを実行していないこと。

サポートされているオペレーティングシステムと PHP バージョンについては、[サポートされているテクノロジー](/docs/zero-code/php/distro/reference/supported-technologies/)を参照してください。

## 制限事項 {#limitations}

既知のランタイムおよび互換性の制限事項については、[制限事項](/docs/zero-code/php/distro/getting-started/limitations/)に記載されています。

## パッケージのダウンロードとインストール {#download-and-install-packages}

[GitHub Releases](https://github.com/open-telemetry/opentelemetry-php-distro/releases) ページからプラットフォームに合ったパッケージをダウンロードしてインストールします。

### RPM（RHEL/CentOS/Fedora） {#rpm-rhelcentosfedora}

```sh
sudo rpm -ivh <package-file>.rpm
```

### DEB（Debian/Ubuntu） {#deb-debianubuntu}

```sh
sudo dpkg -i <package-file>.deb
```

### APK（Alpine） {#apk-alpine}

```sh
sudo apk add --allow-untrusted <package-file>.apk
```

## エクスポーターの設定 {#configure-exporter}

最低限、以下を設定してください。

- `OTEL_EXPORTER_OTLP_ENDPOINT`
- `OTEL_EXPORTER_OTLP_HEADERS`

例:

```sh
export OTEL_EXPORTER_OTLP_ENDPOINT="https://your-otlp-endpoint:443/"
export OTEL_EXPORTER_OTLP_HEADERS="Authorization=Bearer <token>"
```

## PHP プロセスの再起動 {#restart-php-processes}

インストールと設定が完了したら、PHP プロセス（たとえば `php-fpm`、Apache ワーカー、長時間実行される CLI ワーカー）を再起動して、エクステンションをロードします。

## テレメトリーの確認 {#confirm-telemetry}

1. オブザーバビリティバックエンドを開きます。
2. トレースからサービスを探します。
3. トレースがまだ表示されない場合は、トラフィックを生成してください。

## トラブルシューティング {#troubleshooting}

- [設定](/docs/zero-code/php/distro/reference/configuration/)で設定オプションを確認してください。
- [制限事項](/docs/zero-code/php/distro/getting-started/limitations/)で既知の制約を確認してください。
- Laravel Octane（Swoole または RoadRunner）を使用している場合は、[長時間実行 PHP サーバー](/docs/zero-code/php/distro/reference/long-running-server/)を参照してください。
