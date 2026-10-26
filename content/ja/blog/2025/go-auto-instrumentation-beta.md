---
title: >-
  eBPF を使用した OpenTelemetry Go 自動計装のベータリリースを発表
linkTitle: Go 自動計装ベータ
date: 2025-01-30
author: >-
  [Tyler Yahn](https://github.com/MrAlias) (Splunk), [Mike
  Dame](https://github.com/damemi) (Odigos)
sig: SIG Go Auto-Instrumentation
default_lang_commit: acd264e5dd162cf417e7992698cf7efc995c780d
cSpell:ignore: Beyla Odigos rolldice Yahn
---

OpenTelemetry コミュニティは、[OpenTelemetry Go 自動計装プロジェクト](https://github.com/open-telemetry/opentelemetry-go-instrumentation)のベータリリースを発表できることを嬉しく思います！
このマイルストーンにより、Go アプリケーションにシンプルでアクセスしやすく効果的なオブザーバビリティを提供するという私たちのミッションに一歩近づきました。

## Go 自動計装とは {#what-is-go-auto-instrumentation}

OpenTelemetry Go 自動計装は、コードの手動変更やバイナリの再ビルドを必要とせずに、Go アプリケーションからトレースを収集できるようにします。
[eBPF](https://ebpf.io/) を使用して実行時にアプリケーションを動的に計装することで、オブザーバビリティのベストプラクティスの導入障壁を下げ、アプリケーションの動作に関する深い洞察を提供します。

## ベータリリースの主な機能 {#key-features-of-the-beta-release}

ベータリリースでは、以下の主要な機能を備えた自動計装の基本的なサポートを提供します。

- **HTTP サーバー計装**: [`net/http` パッケージ](https://pkg.go.dev/net/http)を使用する際に、トレースコンテキスト伝搬を伴う受信および送信 HTTP リクエストを自動的にトレースします。
- **データベース計装**: [`database/sql` パッケージ](https://pkg.go.dev/database/sql)を使用するデータベースクエリと接続を計装します。
- **gRPC 計装**: [gRPC クライアントとサーバー](https://pkg.go.dev/google.golang.org/grpc)からテレメトリーデータを簡単に収集します。
- **Kafka-go 計装**: [`kafka-go` パッケージ](https://pkg.go.dev/github.com/segmentio/kafka-go)を使用して Kafka メッセージングを監視およびトレースします。
- **OpenTelemetry の Trace API による拡張**: [OpenTelemetry Go Trace API](https://pkg.go.dev/go.opentelemetry.io/otel) を使用して、カスタムスパンで自動計装をシームレスに拡張します。
- **環境変数による設定**: 環境変数ベースの設定により、コード変更の必要性を減らして設定を簡素化します。
- **セマンティック規約への準拠**: 生成されるテレメトリーは最新の OpenTelemetry セマンティック規約に準拠しており、OTel エコシステムとの互換性を保証します。

## はじめに {#getting-started}

OpenTelemetry Go 自動計装を始めるのは簡単です！
インストール、設定、自動計装を使用したアプリケーションの実行に関する詳細な手順は、[Getting Started ガイド](https://github.com/open-telemetry/opentelemetry-go-instrumentation/blob/407fe957bbd8d9046ad6e29a2ab4a0731219931c/docs/getting-started.md?from_branch=main)をご覧ください。

完全な例を確認するには、[`rolldice` アプリケーション](https://github.com/open-telemetry/opentelemetry-go-instrumentation/tree/0ebb7f21116bfdd8e29c315efdbf359cd74bddac/examples/rolldice)をご覧ください。

## 安定版への道のり {#the-road-to-stabilization}

ベータリリースが利用可能になった今、プロジェクトチームは安定版リリースの準備に注力しています。
今後1年間で、以下の目標の達成に集中します。

1. **eBPF によるランタイム計装の最適化**

   eBPF を活用した動的ランタイム計装の改善を続け、Go アプリケーションが信頼性が高くオーバーヘッドの少ないオブザーバビリティを実現できるようにします。
   これには、Go と eBPF の両方のエコシステムにおける最新の動向への追従が含まれます。

2. **エコシステムサポートの拡大**

   ベータリリースでは限られた数の Go パッケージと単一のテレメトリー処理パイプラインのみをサポートしていますが、このサポートを拡大する予定です。
   追加の Go パッケージへの計装を導入し、ユーザーがカスタムのテレメトリー処理パイプラインを作成できるようにします。
   この拡張により、一般的な Go パッケージとの統合が容易になり、カスタム計装の柔軟性が向上します。

3. **Beyla の OpenTelemetry への寄贈との統合**

   提案されている [Beyla の OpenTelemetry への寄贈](https://github.com/open-telemetry/community/issues/2406)は、OpenTelemetry の eBPF ベースの自動計装機能を強化する機会となります。
   この寄贈が承認されれば、追加のシグナル、プロトコル、言語のサポートが拡大し、より包括的な eBPF ベースのオブザーバビリティソリューションが実現します。
   OpenTelemetry Go 自動計装はこれらの開発と並行して進化し、Go アプリケーションに堅牢なトレーシングを提供し続けながら、シームレスな連携を実現します。

[2025年の目標トラッキングイシュー](https://github.com/open-telemetry/opentelemetry-go-instrumentation/issues/1659)で進捗を確認してください。

## コミュニティへの参加 {#join-the-journey}

すべての OpenTelemetry プロジェクトと同様に、Go 自動計装の成功はコミュニティにかかっています。
コントリビューションに興味のある開発者、プロジェクトの採用を検討している企業、またはオブザーバビリティに関心がある方など、ぜひご参加ください。

参加する方法は以下のとおりです。

- **ベータ版を試す**: プロジェクトをアプリケーションに統合し、[フィードバックを提供](https://github.com/open-telemetry/opentelemetry-go-instrumentation/discussions/1697)してください。
- **コントリビュートする**: [GitHub](https://github.com/open-telemetry/opentelemetry-go-instrumentation) 上の[未解決のイシュー](https://github.com/open-telemetry/opentelemetry-go-instrumentation/issues)を確認し、プロジェクトに[コントリビュート](https://github.com/open-telemetry/opentelemetry-go-instrumentation/blob/0ebb7f21116bfdd8e29c315efdbf359cd74bddac/CONTRIBUTING.md)してください。
- **ディスカッションに参加する**: [SIG ミーティング](https://groups.google.com/a/opentelemetry.io/g/calendar-go)や [Slack](https://cloud-native.slack.com/archives/C03S01YSAS0) でのディスカッションにご参加ください。

## 謝辞 {#acknowledgments}

このベータリリースは、世界中のコントリビューターが数え切れないほどの時間をかけて行った作業の成果です。
このマイルストーンを実現するために、コード、ドキュメント、フィードバック、そして熱意を提供してくださったすべての方に感謝いたします。
