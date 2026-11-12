---
title: ラムダを活用した関数が OTTL に登場
linkTitle: ラムダを活用した関数が OTTL に登場
date: 2026-07-22
author: '[Edmo Vamerlatti Costa](https://github.com/edmocosta) (Elastic)'
issue: 10848
sig: Collector SIG
default_lang_commit: e234c145b84f7c5e029afd1c7458ae162c307432
cSpell:ignore: OTTL Vamerlatti
---

テレメトリーパイプラインが高度化するにつれ、実行すべき変換も複雑になっています。
機密データのサニタイズ、一貫性のないスキーマの正規化、属性に関する契約の適用などです。
OTTL は豊富な変換関数を提供していますが、コレクション操作を表現するには、新しいユースケースごとにハードコードされた動作を持つ専用の関数が必要でした。

OpenTelemetry Collector Contrib `v0.157.0` では、OTTL にラムダ式を導入することでこの状況を変えます。
ラムダを使うと、ユーザーはインラインのロジックを汎用的な高階関数に直接渡すことができ、複雑なコレクション変換を再利用可能かつ簡潔にできます。
このリリースには、この機能を活用する8つの新しい関数が含まれています。
`Filter`、`MapEach`、`MapKeys`、`Any`、`All`、`Find`、`Reduce`、および `When` です。

ラムダ式は、使用する場所にインラインで直接定義される小さな無名関数です。
パラメーターのリストと本体を取り、本体は任意の有効な OTTL 式にできます。

<!-- prettier-ignore-start -->
```yaml
(key, value) => HasPrefix(key, "http.")
(key, value) => value * 2
```
<!-- prettier-ignore-end -->

以下の例は、これらの関数によって何が可能になるかを示しています。

## コレクションのフィルタリングと変換 {#filtering-and-transforming-collections}

これらの関数が登場する前は、スライスやマップのすべての要素に対して操作するには、ハードコードされた動作を持つ専用の関数に頼る必要がありました。
現在では次のように書けます。

<!-- prettier-ignore-start -->
```yaml
# キーが "http." で始まる属性のみを保持する
set(span.attributes, Filter(span.attributes, (k, _) => HasPrefix(k, "http.")))

# すべての属性値を文字列化する
set(span.attributes, MapEach(span.attributes, (_, v) => String(v)))

# すべての属性キー名を snake_case に正規化する
set(span.attributes, MapKeys(span.attributes, (k, _) => ToSnakeCase(k)))

# すべてのリソース属性キーにプレフィックスを追加する
set(resource.attributes, MapKeys(resource.attributes, (k, _) => Format("app.%s", [k])))
```
<!-- prettier-ignore-end -->

## コレクションに関する問い合わせ {#asking-questions-about-a-collection}

`Any` と `All` を使うと、スライスやマップの内容を条件として使用でき、以前は不可能だったフィルタールールや `where` 句を利用できるようになります。

<!-- prettier-ignore-start -->
```yaml
# 内部ネットワークから発信されたスパンを除外する
filter:
  trace_conditions:
    - Any(span.attributes["http.request.header.x-forwarded-for"],
      (_, v) => IsInCIDR(v, ["10.0.0.0/8", "172.16.0.0/12", "192.168.0.0/16"]))

# すべての db.* の値が空でないスパンのみを処理する
transform:
  trace_statements:
    - set(span.attributes["db.complete"], true)
      where All(span.attributes, (k, v) => not HasPrefix(k, "db.") or not IsEmpty(v))
```
<!-- prettier-ignore-end -->

## 単一の値を抽出する {#extracting-a-single-value}

`Find` は述語に一致する最初の要素を返します。
オプションの2番目のラムダで、結果を返す前に変換できます。

<!-- prettier-ignore-start -->
```yaml
# 最初の x- ヘッダーの値を見つける
set(span.attributes["custom_header"], Find(span.attributes, (k, _) => HasPrefix(k, "x-")))

# 値が "error" である最初の属性のキーを見つけ、値は無視する
set(log.attributes["error_key"], Find(log.attributes, (_, v) => v == "error", (k, _) => k))
```
<!-- prettier-ignore-end -->

## コレクションの集約 {#aggregating-a-collection}

`Reduce` はスライスやマップを単一の値に畳み込みます。

<!-- prettier-ignore-start -->
```yaml
# レスポンスサイズのリスト全体の合計バイト数
- set(span.attributes["total_bytes"],
  Reduce(span.attributes["response.sizes"], 0, (acc, _,  v) => acc + v))

# すべてのエラーメッセージを1つの文字列に連結する
- set(log.attributes["errors"],
  Reduce(log.attributes["error.messages"], "", (acc, _, v) => Format("%s; %s", acc, v)))
```
<!-- prettier-ignore-end -->

## インライン条件式 {#inline-conditionals}

`When` はコレクションベースではありませんが、同じ思想に基づいています。

```yaml
# 2つの `set` 文を1つに置き換える
- set(span.attributes["speed_class"], When(() => (span.end_time_unix_nano -
  span.start_time_unix_nano) > 1000000000, "slow", "fast"))
```

## 関数の組み合わせ {#combining-functions}

これらの関数は合成可能なため、ある関数の出力を別の関数の入力として直接渡すことができます。
ここでは、`Filter` がマップを PII に見える属性に絞り込み、`MapEach` がそれらの値をハッシュ化してからマージし直します。

<!-- prettier-ignore-start -->
```yaml
transform:
  trace_statements:
    - merge_maps(span.attributes,
      MapEach(
       Filter(span.attributes, (k, v) => IsMatch(k, "(?i)(email|phone|ssn|credit_card)")),
       (_, v) => Format("%s (redacted)", [SHA1(String(v))])
      ), "upsert")
```
<!-- prettier-ignore-end -->

これらの関数を組み合わせることで、幅広い変換をカバーできます。

## 試してみる {#trying-it-out}

8つの関数はすべて**実験的**であり、OpenTelemetry Collector Contrib `v0.157.0` でフィーチャーゲートを有効にすることで利用できます。

```yaml
--feature-gates=ottl.functions.enableLambda
```

この新機能をぜひ試し、テレメトリーパイプラインでその利点を活用してみてください。

質問や提案がある場合は、ぜひお聞かせください。
[CNCF Slack ワークスペース](https://slack.cncf.io/)の `#otel-collector` チャンネルでの会話にご参加ください。
