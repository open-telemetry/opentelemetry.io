---
title: Linux ホストでワンコマンド OpenTelemetry セットアップ
linkTitle: Linux ホストでワンコマンド OpenTelemetry セットアップ
date: 2026-07-23
author: >-
  [Antoine Toulme](https://github.com/atoulme) (Splunk), [Michele
  Mancioppi](https://github.com/mmanciop) (Dash0)
issue: 10908
sig: Packaging SIG
default_lang_commit: 095c2253901f844f21ec68dc2869cfdebfdc41dc
cSpell:ignore: Mancioppi Toulme
---

## システム依存関係としての OpenTelemetry {#opentelemetry-as-system-dependency}

アプリケーションやシステムに OpenTelemetry をセットアップするには、それらがどこで動作しているかに依存します。
OpenTelemetry Operator のおかげで Kubernetes は高度に自動化されていますし、AWS Lambda も OpenTelemetry Lambda レイヤーによって自動化されています。

しかし、Linux ホスト上で直接動作する数えきれないほどの Java、.NET、Node.js、Python アプリケーションには、このような自動化がありませんでした。
これらを計装するには、エージェントを手動でダウンロードし、環境変数を自分で設定する必要がありました。
今年2月にブリュッセルで開催された [OTel Unplugged EU](/blog/2025/otel-unplugged-fosdem/) では、ある要望が繰り返し上がりました。
明確なパッケージング、インストール、使用方法のパスです。
皆さんが求めたのは次のようなものでした。

```sh
{apt|yum} install opentelemetry
```

そして今、実際にそれができるようになりました！

## 試してみよう {#try-it-out}

`opentelemetry` パッケージは、[OpenTelemetry Injector](https://github.com/open-telemetry/opentelemetry-injector) と Java、.NET、Node.js、Python 向けの OpenTelemetry SDK および自動計装パッケージをインストールします。
インジェクターはホスト上のプロセス起動時にフックし、アプリケーションに対応する自動計装を有効化します。
アプリケーションコードやデプロイスクリプトの変更は不要です。

導入は3つのステップで完了します。
パッケージをインストールし、テレメトリーの送信先を SDK に設定し、計装対象のプロセスを再起動します。

### パッケージのインストール {#installing-the-packages}

プロジェクトには[今すぐ試すための手順が定義されています](https://github.com/open-telemetry/opentelemetry-packaging#installing)。
すぐに始めたい方は以下をご覧ください。

Debian、Ubuntu、およびその派生ディストリビューションでは、APT リポジトリを追加します。

```sh
echo "deb [trusted=yes] https://open-telemetry.github.io/opentelemetry-packaging/debian stable main" | sudo tee /etc/apt/sources.list.d/opentelemetry.list
sudo apt update
sudo apt install opentelemetry
```

Fedora、RHEL、およびその派生ディストリビューションでは、YUM リポジトリを追加します。

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

`opentelemetry-injector` パッケージと、監視したい言語の自動計装パッケージを個別にインストールすることもでき、それらはシームレスに連携します。

オプションやデータの送信先について詳しくは、[完全な手順](https://github.com/open-telemetry/opentelemetry-packaging#installing)をお読みください。

### テレメトリーの送信先の設定 {#configuring-where-to-send-the-telemetry}

デフォルトでは、自動計装は OTLP データを `localhost` に送信します。
ポート `4317` が OTLP/gRPC、ポート `4318` が OTLP/HTTP です。
ここから2つのオプションがあります。

**SDK から直接テレメトリーを送信する場合**: `/etc/opentelemetry/injector/default_env.conf` にエンドポイントとクレデンシャルを設定すると、インジェクターがそれらをすべての計装済みプロセスに渡します。

```sh
OTEL_EXPORTER_OTLP_ENDPOINT=https://otlp.example.com
OTEL_EXPORTER_OTLP_HEADERS=api-key=REPLACE_ME
```

**ホスト上で Collector を実行する場合**: デフォルトの `localhost` エンドポイントのまま、同じホストに OpenTelemetry Collector をインストールし、`/etc/otelcol/config.yaml` でテレメトリーの転送先を設定します。
Collector パッケージは現在 `opentelemetry` メタパッケージには含まれていません。
今後の変更については [Collector パッケージング](#collector-packaging)セクションをご覧ください。

## Packaging SIG がお届けします {#brought-to-you-by-the-packaging-sig}

Packaging SIG は、2026年5月に正式に[設立](https://github.com/open-telemetry/community/blob/898a6d5b4030a806883717dff3382c06d3dbd324/projects/packaging.md)されました。

> Packaging SIG の目標は、[OpenTelemetry Injector](https://github.com/open-telemetry/opentelemetry-injector) による SDK と自動計装パッケージの注入、[OpenTelemetry eBPF Instrumentation（OBI）](https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation)、および OpenTelemetry Collector を組み合わせることで、（仮想）ホスト上で動作するアプリケーションの監視において、プロダクトライクで慣用的な体験を提供することです。

私たちは OpenTelemetry がプロダクトのように感じられるべきだと考えており、プロジェクトの [Stable By Default ビジョン](/blog/2025/stability-proposal-announcement/)の実現に向けて取り組んでいます。

[opentelemetry-packaging](https://github.com/open-telemetry/opentelemetry-packaging) リポジトリで協力し、CNCF Slack の [#otel-packaging チャンネル](https://cloud-native.slack.com/archives/C0AD17NMBLZ)で議論し、[毎週水曜日の太平洋時間午前10時に](https://github.com/open-telemetry/community#sig-packaging)ミーティングを開催しています。

ぜひお越しください！

## 今後の展望（TM） {#the-future-tm}

パッケージングの取り組みはまだ新しいものです。
スコープ、スケーラビリティ、セキュリティに関する改善が直近のロードマップに含まれています。

### 本番環境に向けて {#towards-production}

リポジトリは GitHub 上で GitHub Pages を通じてホストされています。
これは本番ワークロード向けではなく、[本番環境レベルのホスティングソリューション](https://github.com/open-telemetry/opentelemetry-packaging/issues/4)を検討する予定です。

[パッケージの署名はまだ行われていません](https://github.com/open-telemetry/opentelemetry-packaging/issues/23)。
手動でエラーが発生しやすいステップを作ることなく、迅速にリリースできるセキュアなソリューションを見つける予定です。

### Collector パッケージング {#collector-packaging}

OpenTelemetry Collector パッケージを新しいリポジトリに追加する作業に取り組みます。
Collector パッケージは現在 [opentelemetry-collector-releases](https://github.com/open-telemetry/opentelemetry-collector-releases) で公開されています。
詳しくはこちらの[イシュー](https://github.com/open-telemetry/opentelemetry-collector-releases/issues/1561)を追跡してください。

### 対応言語の拡大と OBI {#more-languages-and-obi}

現在、インジェクターは Java、.NET、Node.js、Python 向けの SDK ベースの自動計装を有効化します。

SDK の自動計装がない言語（Go、Rust、C++ など）については、[OpenTelemetry eBPF Instrumentation（OBI）](https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation) と協力し、eBPF を使用してアプリケーションを計装できるようにする予定です。

OpenTelemetry Injector には [Ruby のサポート](https://github.com/open-telemetry/opentelemetry-injector/issues/367)計画もあり、近い将来に実現するかもしれません！

## ありがとうございます！ {#thank-you}

この取り組みに参加してくださったコントリビューターの皆さん、ありがとうございます。

Packaging SIG の提案と初期実装を多くのレビュアーの皆さんにもお礼申し上げます！
