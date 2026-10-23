---
title: OpenTelemetry をラップしないでください — 助けるつもりが逆効果になっているかもしれません
linkTitle: OpenTelemetry をラップしないでください
date: 2026-06-24
author: >-
  [Cijo Thomas](https://github.com/cijothomas) (Microsoft)
issue: 10169
# sig:
canonical_url: https://medium.com/@cijo.thomas/dont-wrap-opentelemetry-you-re-probably-hurting-more-than-helping-96795803abeb
default_lang_commit: 86176b5ce89da875add2a77296131397f7a7ca31
# prettier-ignore
cSpell:ignore: Cijo cijothomas ConcurrentDictionary GetOrAdd InMemoryExporter KeyValue KeyValuePair TagList Vec
---

OpenTelemetry を導入する多くのチームで、あるパターンを目にしてきました。
毎回、善意から始まります。
あるエンジニアがチームの作業を楽にしたいと考え、OTel API の上に薄い抽象化レイヤーを構築します。
`IMetric` インターフェイス、`TelemetryHelper` クラス、`MetricsWrapper` モジュールなどを作り、チームの標準として展開します。
「これを使えばいい」と彼らは言います。
「もっとシンプルだから」と。

意図は本物です。
しかし、結果はたいていよくありません。

ここでは .NET と Rust のメトリクスを具体例として使いますが、アンチパターンはすべての OpenTelemetry 言語 SDK とシグナルタイプに共通して当てはまります。

明確にしておくと、この記事は [OTel API](/docs/specs/otel/overview/)、つまりアプリケーションやライブラリのコードがログ、メトリクス、トレースを生成するために呼び出す計装インターフェイスのラップについて述べています。
[SDK](/docs/specs/otel/glossary/#telemetry-sdk) を設定する共有ヘルパー、たとえばエクスポーターやサンプリングポリシー、リソース属性などのセットアップを組織が提供するのは、まったく合理的なことです。
それはインフラストラクチャのセットアップであり、API ラッパーではなく、開発者がコードを計装する方法を妨げるものではありません。

## ラッパーの典型的な姿 {#what-the-wrapper-looks-like}

ラッパーは通常、小さく合理的なところから始まります。
C# の場合:

```csharp
public interface IMetric
{
    void RecordHistogram(long val, List<KeyValuePair<string, string>> attributes);
}
```

Rust の場合:

```rust
fn record_histogram(
    value: f64,
    attributes: Vec<(String, String)>,
) { /* ... */ }
```

これがなぜ問題なのかを見ていきましょう。

## アンチパターン #1: アロケーションを強制するシグネチャ {#anti-pattern-1-the-signature-that-forces-allocation}

`List<KeyValuePair<string, string>>` や `Vec<(String, String)>` — ラッパーが呼び出し元に構築を強制するコレクション型であれば、どれも同じ問題を抱えています。
すべてヒープアロケーションが発生します。

OTel .NET の `Histogram<T>.Record()` には、設計上アロケーションが不要な、1個、2個、3個の属性に対応する専用オーバーロードがあります:

```csharp
// ヒープアロケーションなし — 属性が1〜3個の場合はこれらを使用
histogram.Record(value, new("status", "ok"));
histogram.Record(value, new("status", "ok"), new("tier", "premium"));
histogram.Record(value,
    new("status", "ok"),
    new("tier", "premium"),
    new("format", "json"));
```

属性が4〜8個の場合、`TagList`（構造体）を使えばヒープアロケーションを回避できます:

```csharp
var tags = new TagList
{
    { "status", "ok" },
    { "tier", "premium" },
    { "format", "json" },
    { "version", "v2" },
};
histogram.Record(value, tags);
```

Rust では、OTel API は `KeyValue` の借用スライスを受け取ります。
以下の例ではスタック上に割り当てた配列を使用しており、ヒープアロケーションは不要です:

```rust
histogram.record(value, &[KeyValue::new("status", "ok")]);

histogram.record(
    value,
    &[
        KeyValue::new("status", "ok"),
        KeyValue::new("tier", "premium"),
        KeyValue::new("format", "json"),
    ],
);
```

これらは意図的で、注意深く設計されたものです。
ラッパーのシグネチャが何らかのコレクション型を要求した瞬間、すべての呼び出し元がすべての計測でヒープアロケーションを行うことになります。
ゼロアロケーション設計は静かに失われ、ラッパーを使う開発者はそのような設計が存在していたことすら知りません。

## アンチパターン #2: ルックアップラッパー {#anti-pattern-2-the-lookup-wrapper}

このラッパーは計装の名前をパラメーターとして受け取り、内部で計装のキャッシュを保持し、呼び出しのたびにルックアップまたは作成を行います。
呼び出し元は計装への直接参照を持ちません。
その魅力は利便性にあります。
開発者が自分で計装を作成したり保持したりする必要がなくなります。

C# の場合:

```csharp
public void RecordHistogram(
    string name,
    long val,
    List<KeyValuePair<string, string>> attributes)
{
    // 名前で計装をルックアップし、存在しなければ作成してから記録する
    var histogram = _instruments.GetOrAdd(
        name, n => _meter.CreateHistogram<long>(n));
    histogram.Record(val, /* converted attributes */);
}
```

Rust の場合:

```rust
fn record_histogram(
    &self,
    name: &str,
    value: f64,
    attributes: Vec<(String, String)>,
) {
    let mut instruments = self.instruments.lock().unwrap();
    let histogram = instruments
        .entry(name.to_string())
        .or_insert_with(|| self.meter.f64_histogram(name).build());
    // ... 変換した属性で記録する
}
```

これで計装のルックアップがすべての記録呼び出しに入り込みました。
.NET では、これは通常 `ConcurrentDictionary` の `GetOrAdd` パターンの形を取りますが、それでもすべての計測でディクショナリのルックアップ、ハッシュ計算、比較が発生します。
Rust では、このパターンは `Mutex` で保護された `HashMap` になることが多く、記録の呼び出しのたびにロックを取得することになります。
ある程度の並行性がある状況では、ホットパスにおけるシリアライゼーションポイントになります。

OTel の計装は起動時に一度だけ作成し、参照として保持するように設計されています。
計装「そのもの」がファストパスなのです。
ルックアップをすべての記録呼び出しに組み込むと、OTel が構築されているパフォーマンスモデル全体を台無しにしてしまいます。

## パフォーマンス以外の複合的な問題 {#the-compounding-problems-beyond-performance}

**開発者が学ぶのは OTel ではなくラッパーです。**
`RecordHistogram(name, val, attributes)` を何ヶ月も呼び続けた人は、OpenTelemetry を学んだのではなく、あなたの抽象化を学んだのです。
チームを移動したり、別のサービスに取り組んだり、公式ドキュメントを読んだりするとき、最初からやり直す必要があります。

**メンテナンスの負担は時間とともに増大します。**
OTel API は頻繁に変わるものではありませんが、新しい機能や規約が追加されたとき、チームがそれを使えるようになる前に、ラッパーを通じて再公開する必要があります。
API の上に API を所有することになるのです。

**バグの診断が難しくなります。**
ラッパーは症状と原因の間に間接レイヤーを追加します。
問題は OTel にあるのか、ラッパーにあるのか、ラッパーの型変換にあるのか。
物事をシンプルにするはずだった抽象化が、デバッグをかえって困難にします。

## 「テストのために抽象化が必要だった」 {#but-we-needed-an-abstraction-for-testing}

OTel はすでにこれを解決しています。
各言語 SDK には `InMemoryExporter` が付属しており、実際の SDK の完全な忠実性をもって、記録された内容を収集しアサートできます。
ユニットテストに最適です。
開発中にテレメトリーを目視で確認したい場合は、stdout エクスポーターがすべてをコンソールに出力します。
よいテストを書くために OTel をインターフェイスの背後に隠す必要はありません。

## かわりにすべきこと {#what-to-do-instead}

チームには [OpenTelemetry 公式ドキュメント](/docs/) を案内してください。
言語固有のドキュメントは充実しており、ベストプラクティスもカバーしています。
不明確な点や不足している点があれば、ローカルなラッパーを構築するよりも、上流にコントリビュートする方がはるかに価値があります。
それは全員の助けになります。

## ラッパーが本当に必要なケース {#when-wrappers-are-genuinely-needed}

本当に必要なケースもあります。
たとえば、レガシーなメトリクスシステムからの移行時に、移行期間中に旧 API と OTel の両方にデュアルライトする必要がある場合です。
そのような状況にあり、ラッパーが本当に必要な場合は、公開する API の設計に十分注意してください。
OTel が苦労して提供したアロケーション不要のパスを静かに奪っていないか確認してください。

もう一つの正当なシナリオは、組織に厳格なガバナンス要件がある場合です。
許可される属性の制御、命名規約の強制、承認済みのメトリクス定義のみの使用を保証するといったケースです。
一部のチームは、独自のスキーマでメトリクス定義を宣言し、コード生成ツールで型安全な OTel API 呼び出しを生成することでこれに対応しています。
生成されたコードは OTel を直接使用するため、ランタイムのラッパーは存在しません。
あるのはコンパイル時のセーフティネットだけです。

これは実際に OpenTelemetry プロジェクト自身が向かっている方向です。
[OTel Weaver](https://github.com/open-telemetry/weaver) は、セマンティック規約の定義から型安全でイディオマティックな OTel 計装コードを生成するために設計されたツールです。
今日このようなものを構築している場合は、Weaver に注目してください。
いずれカスタムツールを上流のソリューションで置き換えられるようになるかもしれません。

## 結論 {#the-bottom-line}

OpenTelemetry は安定した、ユーザー向けの抽象化として設計されています。
それをラップすることは、シンプルにすることではなく、オープンスタンダードの上にプロプライエタリなレイヤーを構築することであり、その代償はヒープアロケーション、パフォーマンス、保守性、開発者の成長に及びます。

ラッパーはやめましょう。
