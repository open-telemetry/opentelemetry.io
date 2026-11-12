---
title: OTTL コンテキスト推論が Filter Processor に対応しました
linkTitle: フィルタリングのためのコンテキスト推論
date: 2026-03-02
author: '[Kaise Cheng](https://github.com/kaisecheng) (Elastic)'
issue: 9190
sig: Collector SIG
default_lang_commit: afae27e30673d857278fcf0c1285d0ab0c51cd67
cSpell:ignore: Kaise OTTL spanevent
---

昨年、OpenTelemetry プロジェクトは [transform processor のための OTTL コンテキスト推論](/blog/2025/ottl-contexts-just-got-easier/)を導入しました。
その目的は、ユーザーが内部のテレメトリーコンテキストを気にすることなく OTTL ステートメントを記述できるようにすることでした。

**collector-contrib v0.146.0** から、コンテキスト推論が [Filter Processor](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/9c4165139f101a43895d9273192ddb9ae3204844/processor/filterprocessor) で利用可能になりました。
4つの新しいトップレベルの設定フィールド `trace_conditions`、`metric_conditions`、`log_conditions`、`profile_conditions` が追加されています。

この記事では、フィルタリングにおけるコンテキスト推論の意味について説明します。
設定をどのように簡素化するか、評価がどのように動作するかを見ていきます。

## 問題: OTTL コンテキストの混乱 {#the-issue-ottl-context-confusion}

レガシーの設定形式では、フィルターを記述するために OTel Collector の内部テレメトリー階層を理解する必要がありました。
条件は `resource`、`span`、`spanevent` などの特定の OTTL コンテキストブロック内に配置する必要があります。

```yaml
filter:
  traces:
    span:
      - resource.attributes["host.name"] == "localhost"
      - attributes["container.name"] == "app_container_1"
      - name == "app_3"
    spanevent:
      - attributes["grpc"] == true
      - IsMatch(name, ".*grpc.*")
```

これらのルールは1つの論理的なフィルタリングの意図を表しているにもかかわらず、異なるコンテキストブロックに分割して記述する必要があります。
この要件により、フィルタリングロジックそのものではなく、Collector の内部構造に注意が向けられてしまいます。

## 新しいアプローチ: OTTL コンテキスト推論を使った条件 {#the-new-approach-conditions-with-ottl-context-inference}

### 基本設定 {#basic-configuration}

コンテキスト推論によりこの複雑さが解消されます。
コンテキストブロックごとに条件を整理するかわりに、[基本設定](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/9c4165139f101a43895d9273192ddb9ae3204844/processor/filterprocessor/README.md#basic-config)スタイルを使ってフラットなリストとして記述できます。

```yaml
filter:
  trace_conditions:
    - resource.attributes["host.name"] == "localhost" # リソースコンテキストとして推論
    - span.attributes["container.name"] == "app_container_1" # スパンコンテキストとして推論
    - span.name == "app_3" # スパンコンテキストとして推論
    - spanevent.attributes["grpc"] == true # spaneventコンテキストとして推論
    - IsMatch(spanevent.name, ".*grpc.*") # spaneventコンテキストとして推論
```

各パスにはシンプルな接頭辞（`resource`、`scope`、`span`、`spanevent`）が含まれており、プロセッサーはその接頭辞から実行コンテキストを自動的に推論します。

これにより、すべての条件が論理 OR で結合され、設定が大幅に簡素化されます。
いずれかの条件に一致した場合、そのテレメトリーはドロップされます。

### 高度な設定 {#advanced-configuration}

より複雑なフィルタリングロジックでは、条件をグループ化し、`error_mode` などの独自の設定を指定できます。

```yaml
filter:
  error_mode: ignore
  log_conditions:
    - error_mode: propagate
      conditions:
        - log.severity_number < SEVERITY_NUMBER_WARN
    - error_mode: silent
      conditions:
        - resource.attributes["service.name"] == "noisy-service"
```

これにより、条件グループごとに異なるエラー処理が可能になります。
たとえば、ある条件はエラーを伝搬し、別の条件はエラーを無視するように設定できます。

### クロスコンテキスト条件 {#cross-context-conditions}

1つの条件で異なるコンテキストのパスを参照できます。

```yaml
trace_conditions:
  - resource.attributes["host.name"] == "localhost" or spanevent.name ==
    "grpc.timeout" # spaneventコンテキストとして推論
```

この例では、条件は各スパンイベントに対して評価されます。

結果として次のようになります。

- 名前が `grpc.timeout` のスパンイベントはドロップされます
- `host.name` が `localhost` に設定されたリソースに属するスパンイベントもドロップされます
- 親スパン自体は削除されず、一致するスパンイベントのみがドロップされます

### 階層的な実行 {#hierarchical-execution}

条件は推論されたコンテキストごとにグループ化され、上位レベルから下位レベルへと実行されます。

- **トレース**: resource → scope → span → spanevent
- **メトリクス**: resource → scope → metric → datapoint
- **ログ**: resource → scope → log
- **プロファイル**: resource → scope → profile

上位レベルの条件が一致した場合、プロセッサーはそのサブツリーを即座にドロップし、下位レベルの評価をスキップします。

たとえば、リソースがドロップルールに一致すると、そのスパンやスパンイベントは検査されません。
この短絡動作により、不要な処理が回避され、パフォーマンスが向上します。

コンテキスト推論の評価方法の詳細については、[Filter Processor コンテキスト推論ドキュメント](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/9c4165139f101a43895d9273192ddb9ae3204844/processor/filterprocessor#context-inference)を参照してください。

## 移行と互換性 {#migration-and-compatibility}

レガシーの設定形式（`traces.resource`、`traces.span` などのフィールド）は、当面のあいだ完全にサポートされ、後方互換性が維持されます。

## 試してみましょう {#try-it-out}

新しい `*_conditions` フィールドは、実行コンテキストを手動で選択する必要をなくし、フィルタリングルールをよりシンプルに表現する方法を提供します。
これにより、フィルター設定は読みやすく、保守しやすく、ルール自体の意図により近いものになります。

皆さまからのフィードバックをお待ちしています。
ぜひ使用感をお聞かせください。
[CNCF Slack](https://slack.cncf.io/) ワークスペースの [#otel-collector](https://cloud-native.slack.com/archives/C01N6P7KR6W) チャネルでご連絡いただけます。
