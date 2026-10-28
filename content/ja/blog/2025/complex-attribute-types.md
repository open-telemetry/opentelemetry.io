---
title: OTel における複合属性型のサポートを発表
linkTitle: OTel における複合属性型のサポートを発表
date: 2025-11-05
author: >-
  [Liudmila Molkova](https://github.com/lmolkova) (Grafana Labs), [Robert
  Pajak](https://github.com/pellared) (Splunk), [Trask
  Stalnaker](https://github.com/trask) (Microsoft), [Austin
  Parker](https://github.com/austinlparker) (honeycomb.io)
sig: Specification, Logs
issue: https://github.com/open-telemetry/opentelemetry-specification/pull/4485
default_lang_commit: de36656f997593939e9f6a2b89aa1da72e1718d6
cSpell:ignore: Liudmila Molkova Pajak
---

テレメトリーにおいて、シンプルなキーと値のプロパティを属性として使用するのは一般的です。
ほとんどのテレメトリーバックエンドはこのパターンに最適化されており、データの保存、インデックス作成、クエリを効率的に行えます。

OpenTelemetry はこの点を念頭に置いて設計されています。
セマンティック規約と計装は、簡単にフィルタリングや集約が可能な有用な属性を提供することを目指しています。

しかし、データ自体が複雑な場合はどうでしょうか。
OpenTelemetry は、観測可能なプロパティが時として複雑な、現実世界のシステム、ライブラリ、アプリケーションのオブザーバビリティを捕捉することも目指しています。

最近、OpenTelemetry は OTLP [1.9.0](https://github.com/open-telemetry/opentelemetry-proto/releases/tag/v1.9.0) を皮切りに、エコシステム全体の将来の OpenTelemetry API および SDK バージョンにおいて、すべての OTel シグナルで複合データを捕捉するためのサポートを予定していることを発表しました。

この記事では、複合データをいつ、どのように使用すべきか、いつ避けるべきか、そしてバックエンドがどのようにサポートを開始できるかについて説明します。

## OpenTelemetry における複合属性型の今後のサポート {#upcoming-support-for-complex-attribute-types-in-opentelemetry}

OpenTelemetry の API と SDK は、すべてのシグナルに対して以下の属性型のサポートを追加しています。

- マップ（文字列キーと任意のサポートされた型の値を持つ）
- 異種配列（任意のサポートされた型の要素を含む）
- バイト配列
- 空の値

最近まで、これらの型はログでのみサポートされていました。
他のシグナルの属性はプリミティブ型とプリミティブ型の配列に限定されていました。

[OTEP 4485: Extending attributes to support complex values](https://github.com/open-telemetry/opentelemetry-specification/blob/v1.49.0/oteps/4485-extending-attributes-to-support-complex-values.md) とその OTLP および仕様への実装に基づき、このサポートはすべての OTel シグナルに拡張されています。

新しい属性型、特にマップと異種配列は慎重に使用する必要があります。
多くのオブザーバビリティバックエンドは、複合属性のクエリ、インデックス作成、集約に最適化されていません。
セマンティック規約は、複合属性がインデックス化されないことを前提とし、メトリクスや効率的なクエリが重要な場面での使用を避けます。

可能な限り、プリミティブ値を使用してください。

## なぜこれを行うのか {#why-are-we-doing-this}

セマンティック規約と計装に取り組む中で、フラットな属性では現実世界のシナリオの複雑さを合理的に捕捉できないケースにますます遭遇するようになりました。

例としては以下が挙げられます。

- **[LLM オペレーション](/docs/specs/semconv/gen-ai/non-normative/examples-llm-calls)** — ツール定義や入出力メッセージなどの入力パラメーターは本質的に構造化されている
- **GraphQL** — レスポンスには[構造化されたエラーのリスト](https://graphql.org/learn/response/#errors)が含まれる場合がある
- **[データベースオペレーション](https://github.com/open-telemetry/semantic-conventions/blob/v1.38.0/docs/database/database-spans.md)** — バッチオペレーションにはフラットな属性では適切に捕捉できないプロパティがある

複合属性のサポートをすべてのシグナルに拡張する前に、いくつかの代替案を検討しました。

### ログ（およびスパン）へのサポートの限定 {#limiting-support-to-logs-and-spans}

シグナルごとに異なる属性コレクション型を持つことは API の使い勝手に影響し、属性を扱う際の利便性と効率性が低下します。

### フラット化 {#flattening}

フラット化はプリミティブ型のマップではうまく機能しますが、配列では破綻します。
たとえば、以下のような構造化データの場合:

```json
{
  "data": [
    {
      "foo": "bar",
      "baz": 42
    }
  ]
}
```

次のいずれかとして報告されます:

```text
data.0.foo = "bar"
data.0.baz = 42
```

または:

```text
data.foo = ["bar"]
data.baz = [ 42 ]
```

どちらのアプローチも限界があり、ユーザー体験の低下につながります。

### 文字列シリアライズ {#string-serialization}

もう一つの選択肢は、ユーザーまたは計装に複合データを文字列にシリアライズすることを要求することです。
これは実用的ではありますが、不整合やエラーのリスクがあります。
また、後処理が制限され、不適切なトランケーション戦略につながります。
最終的に、構造を保持するかデータをシリアライズするかはバックエンド側の判断であるべきです。
バックエンド側でシリアライズを処理することで、エンドユーザーにとってより高い一貫性と利便性が提供されます。

## バックエンドはどのように複合属性をサポートすべきか {#how-should-backends-support-complex-attributes}

私たちはバックエンドに対して、構造化された属性値を活用し、ユーザーがネストされたプロパティに基づいてデータをクエリできるユーザー体験を構築することを推奨します。

当面は、取り込み時に複合属性を JSON（または他の適切なフォーマット）にシリアライズすることをバックエンドに推奨します。

OTel の仕様、セマンティック規約、API ドキュメントは、複合属性のサポートが限定的である可能性があることを計装の作成者に明確に伝え、可能な限りフラットな属性を引き続き推奨します。

## 複合属性をいつ使用すべきか {#when-should-you-use-complex-attributes}

フラットな属性でデータを合理的に表現できる場合は、フラットな属性を使用してください。

複合属性は、データがフラットな属性で表現するには複雑すぎる場合にのみ使用してください。
たとえば、複雑なオブジェクトのリストを記録する場合です。

セマンティック規約と計装ライブラリについては、この発表を受けて既存のものを変更することは推奨しません。
これは、複合属性の使用が必要な新しい機能にのみ影響するはずです。

## コメント {#comments}

この記事について議論するための [GitHub イシュー](https://github.com/open-telemetry/community/issues/3119)を作成しましたので、ぜひフィードバックをお寄せください。
