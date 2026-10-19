---
title: 重要なレガシーアプリがブラックボックス？5分で変えましょう！
author: '[Lukasz Ciukaj](https://github.com/luke6Lh43) (Splunk)'
linkTitle: レガシーアプリのための OpenTelemetry
date: 2025-09-04
issue: 7678
sig: Java SIG
default_lang_commit: 7cded84e3bd5923350bc541714655e12401a59cf
cSpell:ignore: ciukaj lukasz spanmetrics
---

ほぼすべての老舗企業に、「あの」システムが存在します。
それは片隅で動いていて、何年も重要な機能を果たしています。
安定して動いていますが、完全にブラックボックスでもあります。
壊すのが怖くて誰も触りたがらず、当初の開発者はとっくにいなくなっています。
それは90年代のコアバンキング台帳かもしれませんし、倉庫の物流ルーティングエンジン、あるいは工場のデータ集約装置かもしれません。
動いていることがわかるのは、ただ単に...まだ壊れていないからです。

最終的な目標は明確です。
このアプリケーションを、モダンでスケーラブルかつサポート可能なプラットフォームに書き換えるか移行する必要があります。
しかし、そのようなプロジェクトには数ヶ月、あるいは数年かかります。
その間、何をすればよいのでしょうか。
暗闇の中で運用するわけにはいきません。

OpenTelemetry はモダンなクラウドネイティブアーキテクチャでの役割がよく注目されますが、その価値はそこに留まりません。
実際、クラウドネイティブではないシステムに対しても、強力で、見落とされがちな解決策を提供します。
OpenTelemetry はモダナイゼーションへの橋渡しとして機能します。
レガシーアプリケーションに対して今日から可視性を得ることで、運用リスクを低減し、リプレースの計画を立て、将来に向けたデータ駆動のビジネスケースを構築できます。
シミュレーションしたレガシーアプリを使って、コードを一行も変更せずにこれを実現する方法を見ていきましょう。

## OpenTelemetry：レガシーコードのためのモダンオブザーバビリティ {#opentelemetry-modern-observability-for-legacy-code}

よくあるレガシーパターンをシミュレートするために、シンプルなアプリケーションを構築しました。
C で書かれたコアの実行ファイル（システムレベルのプロセスを模擬）が Java Virtual Machine（JVM）を起動し、トランザクションやレコードの処理といった特定のタスクを実行します。

フローは次のとおりです。

```bash
C Application (legacy_app) -> starts JVM -> calls a Java method to process a task
```

`./legacy_app` を実行すると動作します。
しかし、重要な疑問には答えられません。
ビジネスの需要に追いついているか。
日次処理の終了時にメモリ不足でクラッシュしそうではないか。
先週の顧客からの苦情の根本原因は、このアプリの遅延にあるのではないか。

確かめてみましょう。

### ステージ1：基本的な健全性モニタリング（システムは安定しているか） {#stage-1-basic-health-monitoring-is-the-system-stable}

最初の目標は、アプリケーションのバイタルサインを監視することです。
CPU とメモリの使用量を確認して、障害が差し迫っていないことを確認する必要があります。
これは、JVM の起動引数で `-javaagent` フラグを使用して OpenTelemetry Java エージェントをアプリケーションにアタッチするだけで実現できます。
この例では、`_JAVA_OPTIONS` 環境変数を使用してこれを行います。

#### ステップ1：環境をセットアップする {#step-1-set-up-the-environment}

ターミナルで、アプリケーション自体に触れることなくエージェントを設定します。

```bash
# --- パート1：基本的なシステム健全性の設定 ---

# 1. サービスにわかりやすい名前を付ける
export OTEL_SERVICE_NAME=legacy-part-processor

# 2. メトリクスエクスポーターのみを有効にする
export OTEL_METRICS_EXPORTER=otlp

# 3. エージェントを Collector の gRPC エンドポイントに向ける
export OTEL_EXPORTER_OTLP_ENDPOINT=http://127.0.0.1:4317

# 4. OTLP プロトコルを指定する
export OTEL_EXPORTER_OTLP_PROTOCOL=grpc

# 5. Java 8 のランタイムメトリクスを有効にする
export OTEL_INSTRUMENTATION_RUNTIME_TELEMETRY_JAVA8_ENABLED=true

# 6. OpenTelemetry Java エージェントをアタッチする
export _JAVA_OPTIONS="-javaagent:./opentelemetry-javaagent.jar"
```

#### ステップ2：変更していないアプリケーションを実行し、動作を確認する {#step-2-run-the-unmodified-application-and-confirm-its-working}

```bash
./legacy_app
```

まず、レガシーアプリケーションが実行されていることを確認しましょう。
ターミナルのログを見ると、メッセージが安定して流れており、プロセスが正常に稼働していることが確認できます。

```bash
[C Wrapper] Reading new Part ID from assembly line: 3035
[Java Processor] Received Part ID 3035. Fetching processing parameters...
[Java Processor] Part ID 3035 processed successfully.
[C Wrapper] Processing request for Part ID 3035 completed successfully.

[C Wrapper] Reading new Part ID from assembly line: 3036
[Java Processor] Received Part ID 3036. Fetching processing parameters...
[Java Processor] Part ID 3036 processed successfully.
[C Wrapper] Processing request for Part ID 3036 completed successfully.

[C Wrapper] Reading new Part ID from assembly line: 3037
[Java Processor] Received Part ID 3037. Fetching processing parameters...
[Java Processor] Part ID 3037 processed successfully.
[C Wrapper] Processing request for Part ID 3037 completed successfully.
```

アプリケーションからのデータは標準的な経路をたどります。
OTel エージェントがメトリクスを OpenTelemetry Collector に送信し、そのメトリクスは Prometheus がスクレイプして保存します。
そして Grafana を使って Prometheus に接続し、データを可視化します。
これはよく知られた、ドキュメントも充実した構成なので、具体的な設定ファイルは省略し、この可視性で何が見えるようになるかに進みましょう。

#### ステップ3：基本的なモニタリングダッシュボードを構築する {#step-3-build-basic-monitoring-dashboard}

ここですべてが結実します。
Grafana にアクセスし、たった3つのシンプルなクエリで最初のダッシュボードを構築できます。
これだけで、平均 CPU 使用率、平均メモリ消費量、ガベージコレクションに費やされた時間をカバーする、アプリケーションの基本的なモニタリングが手に入ります。

![基本的なモニタリングダッシュボード](basic-monitoring.png)

結果：レガシーアプリケーションの基礎的な健全性メトリクス！

このたった1つの変更で、基礎的なオブザーバビリティの層を確立しました。
重要な JVM メトリクスがすぐにバックエンドに流れ始め、運用上の重要な疑問に答えるために必要なデータが得られます。

- メモリ使用量：アプリケーションはメモリリークを起こしていないか。
  ビジネスのピーク時にクラッシュしないか。
- CPU 負荷：高負荷の期間にプロセスは処理に追いついているか。
- ガベージコレクション：アプリケーションの頻繁な「停止」が、他のサービスで連鎖的なタイムアウトを引き起こしていないか。

完全なブラックボックスから、リアルタイムの健全性ダッシュボードを手に入れるところまで到達しました。

### ステージ2：パフォーマンスメトリクス（システムは効率的か） {#stage-2-performance-metrics-is-the-system-efficient}

健全性は一つの側面ですが、パフォーマンスは別の問題です。
コードをレビューすると、アプリのコアロジックが `processTransaction()` メソッドにあることがわかります。
しかし、静的なコードでは動的な疑問に答えられません。
実際の負荷のもとで、このメソッドの実行にどれくらい時間がかかるのか。
ボトルネックになっていないか。

#### ステップ1：環境を更新する {#step-1-update-the-environment}

このメソッドを具体的に計測するよう、エージェントに指示するための環境変数をいくつか追加します。
アプリケーションのソースコードを変更できないシナリオでは、OpenTelemetry の Java エージェントが強力なソリューションを提供します。
[otel.instrumentation.methods.include](/docs/zero-code/java/agent/annotations/#creating-spans-around-methods-with-otelinstrumentationmethodsinclude) という設定を使用すると、特定のメソッドの前後にスパンを自動的に作成するようエージェントに指示できます。

```bash
# --- パート2：アプリケーションパフォーマンスの設定 ---

# 1. トレースエクスポーターを有効にする
export OTEL_TRACES_EXPORTER=otlp

# 2. 計装するメソッドをエージェントに指示する
export OTEL_INSTRUMENTATION_METHODS_INCLUDE="LegacyJavaProcessor[processData]"
```

#### ステップ2：アプリケーションを実行し、既存のダッシュボードを更新する {#step-2-run-the-application-and-modify-existing-dashboard}

収集しているトレーススパンは、より充実したダッシュボードの素材になります。
OTel Collector はこれらのスパンを分析し、アプリケーションモニタリングの「ゴールデンシグナル」を生成するよう設定されています。
Grafana に戻り、3つのコアメトリクスである毎分コール数、平均レスポンスタイム、毎分エラー数のチャートを追加しましょう。

![拡張モニタリングダッシュボード](extended-monitoring.png)

結果：レガシーアプリケーションのコアビジネス KPI！

OpenTelemetry エージェントはすべてのトランザクションを計測するようになりました。
OTel Collector で spanmetrics コネクターを使用することで、重要なパフォーマンス指標が得られます。

- レイテンシー（処理時間）：1つのトランザクションの処理にかかる時間がようやくわかります。
  十分に速いか。
  SLO を満たしているか。

- スループット（毎分コール数）：1分あたりに処理しているトランザクション数が確認できます。
  システムは需要に追いついているか。
  ピーク負荷に対応できるか。

- エラーレート（作業品質）：ビジネスロジック自体の健全性を追跡できるようになりました。
  障害率はどのくらいか。
  問題がエスカレートする前に発見できるか。

### まとめと行動のすすめ {#summary-and-call-to-action}

限定的な可視性であっても、完全に見えない状態で運用するよりはるかに優れています。
レガシーなブラックボックスに対して、いくつかの環境変数と OpenTelemetry エージェントだけで計装すれば、リスクの高いコード変更やコストのかかるオーバーホールなしに、実用的なインサイトが得られます。
これは単なる技術的な成果ではなく、戦略的な一歩です。
実際のデータを武器に、よりスマートな意思決定を行い、潜在的な問題に先手を打ち、将来の計画に自信を持って取り組めます。

たとえアプリケーションがレガシーすぎて OpenTelemetry のメリットを受けられないと直感的に感じたとしても、技術スタックを確認してみる価値は常にあります。
多くの場合、ゼロコードの変更でも計装する方法があります。
エコシステムは常に進化しており、多くのフレームワークやプラットフォームがエージェントベースやサイドカーの計装をサポートするようになっているため、最も古いシステムからでも有用なテレメトリーデータを抽出することがこれまで以上に容易になっています。

覚えておいてください。
今日得られるあらゆる可視性が、モダナイゼーションの道のりが完了するまでの時間、耐障害性、そして安心をもたらしてくれます。
