---
title: OTTL コンテキストがコンテキスト推論でより簡単になりました
linkTitle: OTTL コンテキストがより簡単に
date: 2025-02-20
author: '[Edmo Vamerlatti Costa](https://github.com/edmocosta) (Elastic)'
issue: 6289
sig: Collector SIG
default_lang_commit: 2cc7b050cecdab1a7daadb6b78ce51b15a18bec8
cSpell:ignore: OTTL Vamerlatti
---

OTTL ステートメントを実行するための適切な OTTL コンテキストを選択することは、経験豊富なユーザーにとっても難しいことがあります。
正しいオプションを選択することは精度と効率の両方に影響します。なぜなら、より上位レベルの OTTL コンテキストを使用することで、ネストされた下位レベルのコンテキストの不要なイテレーションを避けることができるからです。

このプロセスを簡素化するために、OpenTelemetry コミュニティは [transform processor](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/635d4254a3018eb3ca8f1736e71fcb54f8ed6e5a/processor/transformprocessor?from_branch=main) における OTTL [コンテキスト推論](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/1afa19b190f2b68ffac6dd5bada4b3fd0297d0c9/processor/transformprocessor/README.md?from_branch=main#context-inference)のサポートを発表できることを嬉しく思います。
この機能により、ユーザーは OTTL の基盤となるコンテキストの概念を理解する必要がなくなり、データそのものに集中できるようになります。
また、最も適切な OTTL コンテキストを自動的に選択することで、ステートメントの処理効率も向上します。
この最適化により、データ変換が正確かつパフォーマンスに優れたものになります。

## どのように動作するのか {#how-does-it-work}

バージョン `0.120.0` から、transform processor はコンテキスト推論に対応した2つの新しい設定スタイルをサポートしています。
1つ目はよりシンプルでフラットなアプローチであり、2つ目は既存の設定フォーマットに近い形式です。

### 基本設定 {#basic-configuration}

[基本設定](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/1afa19b190f2b68ffac6dd5bada4b3fd0297d0c9/processor/transformprocessor/README.md?from_branch=main#basic-config)スタイルは、ユーザーが OTTL コンテキストや追加の設定構造を気にすることなく、すべてのステートメントをまとめてリストできるようにすることで、設定を簡素化します。
このスタイルは複数の OTTL コンテキストからのステートメントをサポートしており、それらを個別にグループ化する必要はありません。

これを説明するために、以下の設定を比較してみましょう。

```yaml
metric_statements:
  - context: resource
    statements:
      - keep_keys(attributes, ["host.name"])
  - context: metric
    statements:
      - set(description, "Sum") where type == "Sum"
      - convert_sum_to_gauge() where name == "system.processes.count"
  - context: datapoint
    statements:
      - limit(attributes, 100, ["host.name"])
```

新しい基本設定スタイルでは、ステートメントのリストを提供するだけで、同じロジックをより簡潔に表現できます。

```yaml
metric_statements:
  - keep_keys(resource.attributes, ["host.name"])
  - set(metric.description, "Sum") where metric.type == "Sum"
  - convert_sum_to_gauge() where metric.name == "system.processes.count"
  - limit(datapoint.attributes, 100, ["host.name"])
```

この合理化されたアプローチにより、可読性が向上し、設定がより直感的になります。
この設定スタイルを使用するには、ステートメント内のすべてのパスに対応する OTTL コンテキストの接頭辞を付ける必要があります。
これらの接頭辞は、すべてのコンテキスト推論設定で必須であり、最適な一致を選択するためのヒントとして機能します。
また、ステートメントを曖昧さのない、OTTL を使用するコンポーネント間でポータブルなものにします。

### 高度な設定 {#advanced-configuration}

コンテキスト推論に対応した[高度な設定](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/1afa19b190f2b68ffac6dd5bada4b3fd0297d0c9/processor/transformprocessor/README.md?from_branch=main#advanced-config)スタイルは、既存のフォーマットに近い形式であり、`error_mode` や `conditions` などのステートメント設定に対するきめ細かな制御を提供しながら、コンテキスト推論の利点を活用できます。
たとえば、以下の設定を考えてみましょう。

```yaml
metric_statements:
  - context: datapoint
    conditions:
      - resource.attributes["service.name"] == "my.service"
    statements:
      - set(metric.description, "counter") where attributes["my.attr"] == "some"
```

上記は以下のように書くことができます。

<!-- prettier-ignore -->
```yaml
metric_statements:
  - conditions:
      - resource.attributes["service.name"] == "my.service"
    statements:
      - set(metric.description, "counter") where datapoint.attributes["my.attr"] == "some"
```

この例では、`context` の値は省略されており、自動的に `datapoint` に推論されます。これは、`datapoint` と `metric` の両方のデータの解析をサポートするステートメント内で唯一存在する OTTL コンテキストであるためです。

上記の設定から `datapoint` の使用を削除した場合を見てみましょう。

```yaml
metric_statements:
  - conditions:
      - resource.attributes["service.name"] == "my.service"
    statements:
      - set(metric.description, "counter")
```

コンテキスト推論エンジンは、データポイントへのアクセスがないため、かわりに `metric` OTTL コンテキストを選択します。
`datapoint` OTTL コンテキストを使用してステートメントを実行することも可能ですが、`metric` が最も効率的なオプションです。

### どの設定スタイルを選ぶべきか {#which-configuration-style-should-i-choose}

[基本設定](#basic-configuration)スタイルは、シンプルさと使いやすさが最も重要なシナリオに最適です。
設定のニーズが単純で、追加の設定キーを使用する必要がない場合に理想的であり、OTTL コンテキストの基盤となる概念を理解することなく、最小限の労力で素早くステートメントをセットアップできます。

[高度な設定](#advanced-configuration)スタイルはより詳細であり、`error_mode` や `conditions` などの追加の設定キーを使用できます。
複数の OTTL コンテキストからのステートメントをサポートしていますが、基本設定スタイルとは異なり、それらを個別の設定グループに分割する必要がある場合があります（[高度な設定](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/635d4254a3018eb3ca8f1736e71fcb54f8ed6e5a/processor/transformprocessor?from_branch=main#advanced-config)を参照）。
パフォーマンスの面では、高度な設定は基本設定よりもわずかに高速であり、複雑なシナリオやステートメント数の多い設定に適した選択肢です。

## 試してみましょう {#try-it-out}

最後に、ユーザーの皆さんがこの新しい機能を探索し、テレメトリーパイプラインでその利点を活用されることをお勧めします。

ご質問やご提案がありましたら、ぜひお聞かせください！
[CNCF Slack ワークスペース](https://slack.cncf.io/)の `#otel-collector` チャンネルで会話に参加してください。
