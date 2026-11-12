---
title: OpenTelemetry コミュニティデモの発表
linkTitle: OpenTelemetry コミュニティデモ
date: 2022-06-20
author: '[Carter Socha](https://github.com/cartersocha)'
default_lang_commit: c03c6396c60a28c9fd83931cf1c310b5cad360fb
---

## TL;DR {#tldr}

OpenTelemetry コミュニティは、既存の優れたデモ（[Google](https://github.com/GoogleCloudPlatform/microservices-demo) に感謝！）を引き継ぎ、さらに改善する取り組みを進めています。
すべての GA SDK（Swift を除く）が対象となり、デモのサポートはメトリクスとログに拡大され、各シグナルのための標準的なシナリオがフォールトインジェクションなどとともにドキュメント化される予定です。

詳細を飛ばしたい場合は、[リポジトリ](https://github.com/open-telemetry/opentelemetry-demo)をクローンして、コマンドラインから `docker compose up`[^1] を実行してください。
いくつかの[技術的な前提条件](https://github.com/open-telemetry/opentelemetry-demo-webstore#local-quickstart)があるので、そちらも確認してください。

デモの初回ビルドには15〜20分かかるため、その間にストレッチをしたり水分補給をすることをお勧めします。

コマンドラインの出力は次のようになります。

![コンソール出力](otel-webstore-app-output.png)

- イメージがビルドされたら、次の URL でウェブストアにアクセスできます。
  <http://localhost:8080>

- Jaeger UI には次の URL でアクセスできます。
  <http://localhost:8080/jaeger/ui>

おめでとうございます！
これでショッピングを楽しみながらテレメトリーを送信できます。
まさに勝利です。

## 共有財産の成功 {#success-of-the-commons}

この共同デモの取り組みの推進力となっている、いくつかの普遍的な課題があります。

OpenTelemetry が成熟するにつれ、ユーザーや企業は、サービスを新しいパラダイムへ移行するためのベストプラクティスガイドや、新しいツールを自分で試すためのデモアプリケーションを求めるようになっています。
しかし、コミュニティのワーキンググループやベンダーには、自身の技術をデモンストレーションするための統一された洗練されたプラットフォームがありません。
"Hello, World!" だけでは限界があるのです。

複数のベンダーが独自のデモアプリケーションを作成していますが、開発と継続的なサポートの全責任を負っています。
既存のデモはそれぞれ不足している部分があり、言語のサポートが欠けていたり、バックエンドの選択肢が制限されていたり、計装ライブラリに過度に依存していたりします。

### プロジェクトの目標 {#project-goals}

- 開発者に対して、OpenTelemetry の計装を学ぶために使用できる堅牢なサンプルアプリケーションを提供する。
- オブザーバビリティベンダーに対して、さらにカスタマイズしたり、そのまま使用できる、単一の十分にサポートされたデモプラットフォームを提供する。
- OpenTelemetry コミュニティに対して、OTel の API、SDK、ツールの機能と能力を示す生きた成果物を提供する。
- OpenTelemetry のメンテナーやワーキンググループに対して、実際のシナリオに近い環境で新機能やコンセプトをデモンストレーションするプラットフォームを提供する。

## 現在の状態 {#current-state}

出発点として、人気のある GCP マイクロサービスデモのフォークを選択しました。
最初の機能追加として、単一の docker compose ファイルにプロジェクトを統合してローカルデプロイを簡素化し、ドキュメントを更新し、既存のサービスを Ruby の例に置き換えました。
それ以外は、GCP デモの既存の機能セットがそのまま維持されています。

- 6つの言語（C#、Go、Java、Node.js、Python、Ruby）をサポートする10個のアプリケーションマイクロサービス
  - Ruby サポートは公開日の直近2週間以内に追加された
- ローカルの docker 上で動作するように設計
- Redis キャッシュを使用
- 計装ライブラリを使用した自動計装で、gRPC、Redis、HTTP ライブラリのトレースをサポート
- OpenTelemetry Collector で転送された分散トレースの Jaeger 可視化
- 常時サンプリング（テレメトリーの100%が送信される）と合成負荷生成

### 現在のアーキテクチャ {#current-architecture}

![現在のアーキテクチャ](current-demo-architecture.png)

### BYOB（Bring Your Own Backend） {#byob-bring-your-own-backend}

Jaeger は素晴らしいですが（本当に）、お好みの APM ベンダーで試したい場合はどうすればよいでしょうか。
ベンダーの Collector エクスポーターを使用するように [Collector 設定ファイル](https://github.com/open-telemetry/opentelemetry-demo#bring-your-own-backend)を変更するか、ベンダーのデモのフォークを使用することで、お好みのバックエンドにデータを送信できます。

Lightstep は、フォークしたバージョンのデモから自社のエクスペリエンスを強化するためのデータ送信を開始する方法について、[素晴らしいブログ記事](https://lightstep.com/blog/observability-mythbusters-how-hard-is-it-to-get-started-with-opentelemetry)を公開しています。

## 将来の状態 {#future-state}

### 今後の新機能 {#upcoming-new-features}

このアプリケーションを OpenTelemetry の全機能を示す標準的な例に仕上げるために、計画中または進行中の多くのエキサイティングな改善があります。
以下は今後の機能のほぼ網羅的なリストですが、ここに記載された項目だけに限定されるわけではありません。

- [C++](https://github.com/open-telemetry/opentelemetry-demo/issues/36)、Erlang/Elixir、[PHP](https://github.com/open-telemetry/opentelemetry-demo/issues/34)、[Rust](https://github.com/open-telemetry/opentelemetry-demo/issues/35) の言語例
- すべての GA SDK に対する[メトリクス](https://github.com/open-telemetry/opentelemetry-demo/issues/43)と[ログ](https://github.com/open-telemetry/opentelemetry-demo/issues/44)のサポート拡大
- メトリクスを表示する可視化コンポーネント
- 複数の計装手法の実装
- サイドカーでのエージェントによる自動計装
- すべてのシグナルの手動計装
- [Service Level Objective](https://github.com/OpenSLO/OpenSLO#slo)（SLO）の定義とトラッキング
- 必要に応じた追加の計装ライブラリの導入
- [バゲージ](https://github.com/open-telemetry/opentelemetry-demo/issues/100)やその他のカスタムタグを追加する機能のデモンストレーション
- 以下のようなその他のクラウドネイティブ技術の継続的な活用
  - Kubernetes
  - gRPC
  - [OpenFeature](https://github.com/open-feature)
  - [OpenSLO](https://github.com/OpenSLO/OpenSLO)
  - その他
- 取り込み、変換、エクスポートのための強化された OpenTelemetry Collector ゲートウェイ機能
- 確率ベースのサンプリング
- フォールトインジェクションや、フィーチャーフラグに依存するサービスからテレメトリーを出力する方法などのさまざまなシナリオをデモンストレーションするフィーチャーフラグサービス

### 将来のアーキテクチャ {#future-architecture}

![将来のアーキテクチャ](future-demo-architecture.png)

## 今後について {#going-forward}

私たちはまだ旅の始まりにいますが、このプロジェクトには大きな勢いがあります。
貢献に興味がある方は、ぜひご参加ください。
GitHub リポジトリに参加方法のリンクがあり、そこから[全体の進捗を追跡](https://github.com/open-telemetry/opentelemetry-demo/issues)できます。

### 関連リンク {#interesting-links}

- [デモの要件](/docs/demo/requirements/)
- [参加する](https://github.com/open-telemetry/opentelemetry-demo#contributing)

[^1]: {{% param notes.docker-compose-v2 %}}
