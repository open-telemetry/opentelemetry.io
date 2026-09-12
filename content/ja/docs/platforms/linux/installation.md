---
title: インストール
weight: 10
description:
  OpenTelemetry パッケージリポジトリを追加し、Debian、Ubuntu、Fedora、または RHEL
  とその派生ディストリビューションにシステムパッケージをインストールします。
default_lang_commit: 6fa8e87cacb431b31061635fcddb55990e80538a
---

OpenTelemetry システムパッケージは、Debian ベースのディストリビューション向けの APT リポジトリと、RPM ベースのディストリビューション向けの YUM リポジトリに公開されています。
このページでは、リポジトリの追加と `opentelemetry` メタパッケージのインストールについて説明します。
このメタパッケージは [OpenTelemetry Injector](https://github.com/open-telemetry/opentelemetry-injector) と Java、.NET、Node.js、Python の自動計装を取り込みます。

> [!WARNING]
>
> これらのパッケージはまだ初期段階にあり、本番ワークロードでの使用は想定されていません。
> リポジトリは GitHub Pages 上でホストされており、パッケージはまだ署名されていないため、以下の手順では署名検証を無効にしています。
> [ステータスと制限事項](../#status-and-limitations)を参照してください。

## Debian、Ubuntu、およびその派生ディストリビューション {#apt}

APT リポジトリを追加してパッケージをインストールします。

```sh
echo "deb [trusted=yes] https://open-telemetry.github.io/opentelemetry-packaging/debian stable main" |
  sudo tee /etc/apt/sources.list.d/opentelemetry.list
sudo apt update
sudo apt install opentelemetry
```

## Fedora、RHEL、およびその派生ディストリビューション {#yum}

YUM リポジトリを追加してパッケージをインストールします。

```sh
cat <<EOF | sudo tee /etc/yum.repos.d/opentelemetry.repo
[opentelemetry]
name=OpenTelemetry Auto-Instrumentation System Packages
baseurl=https://open-telemetry.github.io/opentelemetry-packaging/rpm/packages
enabled=1
gpgcheck=0
EOF
sudo dnf install opentelemetry
```

## インストールの確認 {#verify-the-installation}

サポートされている言語で書かれたアプリケーションを再起動するか、新しいアプリケーションを起動して、設定した送信先にテレメトリーが送信されていることを確認します。
[送信先を設定する](../configuration/)までは、テレメトリーは OTLP を使用して `localhost` のポート `4317`（gRPC）および `4318`（HTTP）に送信されるため、データを確認するにはそこでリッスンしている [Collector](/docs/collector/) または他の OTLP レシーバーが必要です。

## 個別の言語のインストール {#install-individual-languages}

`opentelemetry` メタパッケージは、インジェクターとサポートされているすべての言語の自動計装をインストールします。
一部の言語のみ必要な場合は、言語固有のパッケージを個別にインストールできます。

- `opentelemetry-java`
- `opentelemetry-nodejs`
- `opentelemetry-dotnet`
- `opentelemetry-python`

## 次のステップ {#next-steps}

- [設定](../configuration/)：テレメトリーを Collector またはバックエンドに送信し、計装対象を制御します。
