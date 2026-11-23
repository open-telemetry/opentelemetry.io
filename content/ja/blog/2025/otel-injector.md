---
title: アプリへの自動計装の追加を簡単に ― OpenTelemetry Injector
linkTitle: OpenTelemetry Injector
date: 2025-06-25
author: >-
  [Isabella Langan](https://github.com/isabella-rose-l) (Causely)
default_lang_commit: 4dfe6a316054df9852167b1818ee509723046db8
cSpell:ignore: Causely Langan Omlet
---

OpenTelemetry の採用がインフラストラクチャとアプリケーションのレイヤー全体で拡大するにつれ、計装の運用負荷を軽減することは引き続き共通の優先事項です。
本日、Splunk から OpenTelemetry コミュニティへの最近の寄贈を紹介できることを嬉しく思います。
これは、任意の Linux ホスト上でアプリに OpenTelemetry の自動計装を自動的に注入する、ホストベースのメカニズムです。

このコンポーネントはプロダクション安定性に達しており、現在 **OpenTelemetry Injector** としてコミュニティに寄贈されています。
言語やシステムを問わず、OpenTelemetry のデプロイを効率化するのに役立ちます。

## 何ができるのか {#what-it-does}

OpenTelemetry Injector はホスト上のプロセス起動をインターセプトし、Java、Node.js、.NET、Python など、プログラムが使用する言語に応じた OpenTelemetry の自動計装をセットアップするための環境変数を追加します。

この注入には2つの方法がサポートされています。

- **systemd** の環境変数設定
- **`/etc/preload.so`** フック。プロセスの起動をスキャンしてインターセプトし、環境変数を追加します

## Splunk が寄贈する理由 {#why-splunk-is-donating-it}

このコンポーネントはプロダクショングレードの安定性に達しており、Splunk は以下の理由から寄贈を行います。

- メンテナンスの責任をコミュニティと共有するため
- OpenTelemetry の長期的な方向性により密接に連携するため
- エコシステムからのより広範なコラボレーションとフィードバックを促進するため

## どこで見つけられるか {#where-to-find-it}

コードは [`opentelemetry-injector`](https://github.com/open-telemetry/opentelemetry-injector) リポジトリで確認できます。
このリポジトリには Linux の注入メカニズムの完全な実装が含まれており、今後のコントリビューションの基盤となります。

## 今後の予定 {#whats-next}

**dash0** と **Omlet Stack** のコントリビューターとともに、チームは当面のあいだコードのサポートとメンテナンスを継続します。
さらに重要なのは、ロードマップを一緒に策定する追加のコラボレーターやメンテナーを OpenTelemetry コミュニティから積極的に募集していることです。

Linux での自動計装ワークフローの改善に興味がある方にとって、参加するのに最適な機会です。

## 参加するには {#get-involved}

詳しく知りたい方、またはコントリビュートしたい方へ。

- 💬 [OpenTelemetry Slack](https://slack.cncf.io/) の `#otel-injector` チャンネルで会話に参加してください。
- 🔗 [opentelemetry-injector リポジトリ](https://github.com/open-telemetry/opentelemetry-injector)をご覧ください。
