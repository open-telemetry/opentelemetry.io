---
title: 'バージョン付きメトリクス: hostmetrics に初のリリース候補メトリクスを導入'
linkTitle: hostmetrics のバージョン付きメトリクス
date: 2026-10-13
author: >-
  [Dónal O'Sullivan](https://github.com/osullivandonal)(Elastic)
issue: 11728
sig: System
default_lang_commit: 20b4338daf3d7360b8446c657d809fb8b25f9a10
# prettier-ignore
cSpell:ignore: Dónal hostmetrics iowait mdatagen otelcontribcol processscraper
---

OpenTelemetry Collector Contrib v0.160.0 では、hostmetrics レシーバーの process スクレイパーにリリース候補（RC）の process セマンティック規約メトリクスを出力する機能が追加されました。
これは安定版 v1 の前の最終段階です。
System SIG は約1年かけてこの作業を進めてきました。
process メトリクスは良い状態になったと考えていますが、RC はコミュニティがそれを証明するために存在します。
process メトリクスを収集している方は、新しいバージョン付き出力を試して、何が壊れるかを教えてください。

## hostmetrics レシーバーの安定化が妨げられていた理由 {#why-stabilizing-the-hostmetrics-receiver-was-blocked}

process スクレイパーのメトリクスは OpenTelemetry セマンティック規約で変更されました。
これらの規約に合わせるということは、ユーザーがすでに依存しているメトリクス名、型、属性を変更することを意味するため、単純に定義をその場で編集してリリースすることはできませんでした。

Collector における動作変更のための通常のツールはフィーチャーゲートですが、ゲートはすでに存在するコードパスを切り替えるだけです。
必要だったのは、レガシーと RC のメトリクス定義の両方がコード内に同時に存在し、メトリクスごとに選択可能で、エンドユーザーが新しいメトリクスの使用をオプトインできることでした。
理想的には、これをユーザーの設定スキーマに影響を与えずに行うことです。

この要件は設定スキーマ `metadata.yaml` に突き当たります。
このファイルは、レシーバーが出力するメトリクスと属性、およびそれらの出力方法を定義します。
hostmetrics レシーバーの各スクレイパーはこのファイルを1つ持ち、[mdatagen](https://github.com/open-telemetry/opentelemetry-collector/tree/62cdad2ea133239380b44d20d84eb26e114779b6/cmd/mdatagen?from_branch=main) がこのファイルから出力コードを生成します。
`<metric>` の2つの定義が、名前は同じだが型や属性が異なる場合、1つのファイルに共存できません。

System SIG は、[バージョン付きメトリクスに関する GitHub イシュー](https://github.com/open-telemetry/opentelemetry-collector-contrib/issues/45592)で議論されたように、この問題を解決する2つの異なるアプローチに行き着きました。

1. レガシーメトリクスと RC メトリクスに2つの異なる設定スキーマを使用する。
2. レガシーメトリクスと RC メトリクスの両方を含む1つの設定スキーマを使用する。

1つ目は、レガシーと RC のメトリクスを別々のスキーマに保持する方法です。
これにより命名の競合は回避できましたが、`metadata.yaml` の `metrics:` ブロックはエンドユーザーが Collector の設定を書くために使用する `metrics:` ブロックを生成するものです。
そのため、2つのスキーマファイルは2つのユーザー設定ブロックを意味し、すべての既存ユーザーはアップグレード時か、レガシーブロックが最終的に削除される時点のいずれかで設定を編集しなければなりません。

2つ目は、両方の定義を1つのファイルに共存させ、mdatagen を更新して名前の競合を処理する方法です。
これはユーザーにコストをかけず、コンポーネントメンテナーに単一の `metadata.yaml` ファイルで作業できる環境を提供しますが、スクレイパーの作業を開始する前に、Collector のコアリポジトリで mdatagen 自体を変更する必要がありました。

System SIG は2つ目の方法を選択しました。
フィーチャーゲートで移行を駆動する、バージョン付きメトリクスです。
この投稿の残りの部分では、これらの移行を行うコンポーネントのコードオーナーにとって、それがどのようなものかを説明します。

## mdatagen へのバージョン付きメトリクスの追加 {#adding-versioned-metrics-to-mdatagen}

メトリクスにバージョンを付けるために、mdatagen に接尾辞のサポートを追加し、`@` を使ってバージョンを示すようにしました（例: `<metric-name>@<version-number>`）。
`@` を選んだのは、OTel のメトリクス名として有効な文字ではなく、実際のものと衝突し得ないためです。
接尾辞は `metadata.yaml` 内のキーとしてのみ存在し、出力時に除去されます。
そのため、バックエンドが受け取るメトリクスの名前は `process.cpu.utilization` であり、`process.cpu.utilization@v1` ではありません。

次に、mdatagen のスキーマ `metadata-schema.yaml` を更新しました。
このスキーマは、コンポーネントの `metadata.yaml` が使用できるフィールドを定義します。
メトリクスセクションに `migration` フィールドを追加し、レガシーメトリクスからバージョン付きの後継メトリクスへのパスを記述できるようにしました。

```yaml
metrics:
  # Optional: migration/aliasing information to support dual-schema emission.
  # When present, generated code will emit this metric and the target metric
  # according to the gates specified below.
  migration:
    # Required: target metric key in this metadata file to emit to during migration.
    to: string
    # Required: feature gates controlling emission. The referenced gates must be
    # declared under feature_gates below in this file.
    through_gates:
      # Required: when enabled, emission of the old (current) metric is disabled.
      disable_old: string
      # Required: when enabled, emission of the new (target) metric is enabled.
      enable_new: string
```

移行パスは、移行に使用されるフィーチャーゲートを定義する `through_gates` を提供します。
`disable_old` は有効にすると古いレガシーメトリクスの出力を無効にし、`enable_new` は有効にすると RC メトリクスの出力を有効にします。
以下に、このアプローチを示す、process スクレイパーの [`metadata.yaml`](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/47fd6d863a675e4e653418084645cccbc16aeb8b/receiver/hostmetricsreceiver/internal/scraper/processscraper/metadata.yaml?plain=1#L187) ファイルからの抜粋を示します。

```yaml
process.cpu.utilization:
  enabled: false
  description: >-
    Percentage of total CPU time used by the process since last scrape,
    expressed as a value between 0 and 1. On the first scrape, no data point is
    emitted for this metric.
  unit: '1'
  stability: development
  gauge:
    value_type: double
  attributes: [state]
  migration:
    to: process.cpu.utilization@v1
    through_gates:
      disable_old: scraper.process.DontEmitV0SystemConventions
      enable_new: scraper.process.EmitV1SystemConventions

process.cpu.utilization@v1:
  enabled: false
  description: >-
    Difference in process.cpu.time since the last measurement, divided by the
    elapsed time and number of CPUs available to the process. On the first
    scrape, no data point is emitted for this metric.
  unit: '1'
  stability: beta
  gauge:
    value_type: double
  attributes: [cpu.mode]
```

> [!NOTE]
>
> ここの例では `stability: beta` が使われていることに気付くかもしれません。
> これは mdatagen が RC の安定レベルを定義していないためで、beta の次の安定レベルが stable であることから、ここでは beta を使用しています。

次に、バージョン付きメトリクスを処理するためにテンプレートを更新しました。
テンプレートは mdatagen で、生成される Go コードの見た目を定義するために使用されます。
これは、同じ名前を持つ2つのメトリクス（たとえば、`process.cpu.utilization` と `process.cpu.utilization@v1`）がある場合に、命名の衝突が起きないようにするためです。
この更新により、mdatagen は2つの異なるメトリクスのコードを衝突なく生成できるようになりました。
この作業は Collector のコアリポジトリで行われました。
[mdatagen バージョン付きメトリクスの PR](https://github.com/open-telemetry/opentelemetry-collector/pull/15309) を参照してください。

最後に、System SIG はバージョン付きメトリクスに従うべきルールを定義しました。
これは要約すると、二重公開時の競合の処理、つまり同じ名前のメトリクスを出力する場合の処理に帰着します。
これはレガシーと RC の両方のメトリクスを出力する際に発生します。
この処理のために、以下のルールを定めた RFC が公開されました。
[セマンティック規約フィーチャーゲート RFC](https://github.com/open-telemetry/opentelemetry-collector/blob/71f0462d5460ad3055201fd0f17658e56362d63a/docs/rfcs/semconv-feature-gates.md#handling-conflicts-during-double-publishing) を参照してください。

- **属性が異なる場合**: メトリクス名が同じままで属性がリネームされた場合、v0 と v1 の両方の属性を持つ単一のメトリクスを出力します。
  たとえば、`process.cpu.time` が v0 で `process.owner` を使用し、v1 で `process.owner.name` を使用する場合、両方の属性を持つ1つのメトリクスを出力します。
- **メトリクスの型が異なる場合**: メトリクス名が同じままで型が変わる場合（たとえば、ゲージからアップダウンカウンターへ）、v1 の型で単一のメトリクスを出力し、実質的に新しい規約を優先します。
  たとえば、`system.memory.usage` がゲージからアップダウンカウンターに変わる場合、アップダウンカウンターとして出力します。

これらのルールは、`disable_old` ゲートをオフのままにして `enable_new` で RC メトリクスを有効にした場合に発動します。
これにより、レガシーと RC の両方のメトリクスの出力が可能になるためです。
これらのルールに従うため、mdatagen も更新され、生成コードがそれらを処理するようになりました。
このシナリオでは、レガシーメトリクスが無効化され、両方の属性が RC メトリクスの下で出力されることをエンドユーザーに知らせる警告をログに出力します。
これは、名前が同じレガシーと最新の両方のメトリクスを二重書き込みできないために発生します。
この例は上記の YAML に示されており、`process.cpu.utilization` はバージョン付きですが属性が変更されています。

次に、メトリクスの型が変更され、レガシーと RC の名前が同じ場合も、レガシーメトリクスを無効化して RC メトリクスのみを出力します。
これも同様に警告としてログに出力されます。

RFC ルールを生成コードで処理することにより、それに従う負担がコンポーネントメンテナーから生成コードに移り、レガシーから RC セマンティック規約への移行がシームレスになります。

## RC における process スクレイパー {#the-process-scraper-at-rc}

hostmetrics レシーバーの process スクレイパーは、このバージョン付きメトリクスのアプローチを採用した最初のコンポーネントです。
まず、process セマンティック規約がリリース候補に昇格されました。
これは[この PR](https://github.com/open-telemetry/semantic-conventions/pull/3758) で行われました。

process スクレイパーの `metadata.yaml` ファイルで定義された移行パスを使用して、レガシーと RC のフィーチャーゲートを定義しています。
スキーマが新しいリリース候補のメトリクスと属性で更新された後、更新された mdatagen ツールで新しいコードが生成されました。
これにより、正しい移行パスが提供されました。

以下のメトリクスと属性が更新され、バージョン付けされました。

| レガシーメトリクス              | RC メトリクス                           | 単位の変更                      | 属性の変更                                            |
| ------------------------------- | --------------------------------------- | ------------------------------- | ----------------------------------------------------- |
| `process.context_switches`      | `process.context_switches@v1`           | `{count}` → `{context_switch}`  | `context_switch_type` → `process.context_switch.type` |
| `process.cpu.time`              | `process.cpu.time@v1`                   | none                            | `state` → `cpu.mode`                                  |
| `process.cpu.utilization`       | `process.cpu.utilization@v1`            | none                            | `state` → `cpu.mode`                                  |
| `process.disk.io`               | `process.disk.io@v1`                    | none                            | `direction` → `disk.io.direction`                     |
| `process.handles`               | `process.windows.handle.count@v1`       | `{count}` → `{handle}`          | none                                                  |
| `process.open_file_descriptors` | `process.unix.file_descriptor.count@v1` | `{count}` → `{file_descriptor}` | none                                                  |
| `process.paging.faults`         | `process.paging.faults@v1`              | `{faults}` → `{fault}`          | `paging_fault_type` → `system.paging.fault.type`      |
| `process.threads`               | `process.thread.count@v1`               | `{threads}` → `{thread}`        | none                                                  |

process スクレイパーからレガシーまたは RC メトリクスを出力する方法の簡単なガイドを以下に示します。
まず、process スクレイパーのシンプルな Collector 設定が必要です。
この例では `process.cpu.utilization` も有効にしています。
レガシーメトリクスが有効であれば、ユーザーの設定で RC メトリクスに言及する必要がないことを示すためです。

```yaml
receivers:
  hostmetrics:
    collection_interval: 5s
    scrapers:
      process:
        metrics:
          process.cpu.utilization:
            enabled: true

exporters:
  debug:
    verbosity: detailed

service:
  pipelines:
    metrics:
      receivers: [hostmetrics]
      exporters: [debug]
```

次に、RC の process スクレイパーを使用するには、RC メトリクスを出力するためのフィーチャーゲートを指定する必要があります。
v0.160.0 時点ではフィーチャーゲートはアルファ段階であり、デフォルトでオフになっているため、これは必須です。

```sh
./otelcontribcol<your-local-system-image> --config=<your-config>.yaml --feature-gates=scraper.process.EmitV1SystemConventions
```

スクレイパーが動作し始めると、ログ出力に注目してください。

```text
[WARNING] Legacy metric `process.cpu.time` disabled: same emitted name as `process.cpu.time@v1` with different attributes; only latest will be emitted with combined attributes    {"resource": {"service.instance.id": "60c55fb8-c66b-4345-aef5-abb193e79a0d", "service.name": "otelcontribcol", "service.version": "0.161.0-dev"}, "otelcol.component.id": "hostmetrics", "otelcol.component.kind": "receiver", "otelcol.signal": "metrics", "scraper": "process", "legacy_attributes": ["state"], "latest_attributes": ["cpu.mode"]}
...
[WARNING] Legacy metric `process.cpu.utilization` disabled: same emitted name as `process.cpu.utilization@v1` with different attributes; only latest will be emitted with combined attributes    {"resource": {"service.instance.id": "60c55fb8-c66b-4345-aef5-abb193e79a0d", "service.name": "otelcontribcol", "service.version": "0.161.0-dev"}, "otelcol.component.id": "hostmetrics", "otelcol.component.kind": "receiver", "otelcol.signal": "metrics", "scraper": "process", "legacy_attributes": ["state"], "latest_attributes": ["cpu.mode"]}
...
[WARNING] Legacy metric `process.disk.io` disabled: same emitted name as `process.disk.io@v1` with different attributes; only latest will be emitted with combined attributes    {"resource": {"service.instance.id": "60c55fb8-c66b-4345-aef5-abb193e79a0d", "service.name": "otelcontribcol", "service.version": "0.161.0-dev"}, "otelcol.component.id": "hostmetrics", "otelcol.component.kind": "receiver", "otelcol.signal": "metrics", "scraper": "process", "legacy_attributes": ["direction"], "latest_attributes": ["disk.io.direction"]}
```

3つの警告がログに出力されていることがわかります。
`process.cpu.time` メトリクス、`process.cpu.utilization`、`process.disk.io` それぞれに対する警告です。
これは、v1 バージョンのこれらのメトリクスがレガシーバージョンと異なる属性を持っているためです。
生成コードは、上述の RFC で説明された二重公開の問題により、内部的にはここで RC メトリクスのみを出力し、レガシーメトリクスを出力していないことを示す警告をログに出力します。

そしてここでは、属性を伴う実際のメトリクスを確認できます。
ユーザーの設定では RC メトリクス `process.cpu.utilization@v1` に言及する必要はありませんでしたが、レガシーと RC の両方のメトリクスが同じ名前を共有し、属性が異なるため、ここでは RC メトリクスのみを出力しています。
この場合、レガシーメトリクスの属性は `state` で、RC メトリクスの属性は `cpu.mode` です。

```text
Metric #1
Descriptor:
     -> Name: process.cpu.utilization
     -> Description: Difference in process.cpu.time since the last measurement, divided by the elapsed time and number of CPUs available to the process. On the first scrape, no data point is emitted for this metric.
     -> Unit: 1
     -> DataType: Gauge
NumberDataPoints #0
Data point attributes:
     -> cpu.mode: Str(user)
     -> state: Str(user)
StartTimestamp: 2026-09-16 09:27:59.35 +0000 UTC
Timestamp: 2026-09-16 09:28:06.413091903 +0000 UTC
Value: 0.001253
NumberDataPoints #1
Data point attributes:
     -> cpu.mode: Str(system)
     -> state: Str(system)
StartTimestamp: 2026-09-16 09:27:59.35 +0000 UTC
Timestamp: 2026-09-16 09:28:06.413091903 +0000 UTC
Value: 0.001003
NumberDataPoints #2
Data point attributes:
     -> cpu.mode: Str(iowait)
     -> state: Str(wait)
```

バージョン付きメトリクスのアプローチにより、ユーザーの設定を壊すことなく移行できます。
設定で `process.cpu.utilization` を出力していた場合、そのメトリクスの最新 RC バージョンを出力するには、フィーチャーゲート `scraper.process.EmitV1SystemConventions` を使用するだけです。

## RC から安定版へ {#from-rc-to-stable}

process スクレイパーの安定化に向けた次のステップは、6か月待つことです。
System SIG は、RC の process スクレイパーをコミュニティに試してもらいたいと考えています。
これにより、エンドユーザーが RC メトリクスと属性が自分のダッシュボードを壊すかどうかを確認する時間が得られます。
RC メトリクスのみを出力した場合、クエリは期待どおりの結果を返し、ダッシュボードは正しく描画されるでしょうか。
描画されない場合、RC 期間がそれらを更新するための猶予期間です。
フィードバックがある方は、[CNCF Slack](https://slack.cncf.io/) の System SIG Slack チャンネル [#otel-system-metrics](https://cloud-native.slack.com/archives/C05CTFE9U4A?link-check=no&last-validated=2026-10-05) までお寄せください。

6か月が経過した後、process スクレイパーを安定版に移行できます。
これは、テスト、ベンチマーク、ドキュメント、テレメトリーの安定性をカバーする [「安定版」の安定性基準](https://github.com/open-telemetry/opentelemetry-collector/blob/7d1c25d46b14cce04a820d92a4ce462bf7a04b0b/docs/component-stability.md#stable)を満たしていることを検証することを意味します。
スクレイパーを安定版に移行するということは、移行フィーチャーゲートをベータに昇格させることを意味し、両方がデフォルトでオンになり、レガシーメトリクスが削除されます。
ユーザーは必要に応じて、両方のゲートを無効にすることでレガシーメトリクスを引き続き出力できます。
[フィーチャーゲートガイド](https://github.com/open-telemetry/opentelemetry-collector/blob/ac085a4d9f1bdaf3eb90aaebc9a3815f4e00954d/featuregate/README.md?plain=1#L1)を参照してください。

## hostmetrics の今後の安定化 {#future-stability-of-hostmetrics}

メトリクスにバージョンを付けて移行パスを与えられるようになったことで、hostmetrics レシーバーを安定化するためのより広範な計画のブロックが解除されました。
process スクレイパーがこの仕組みを使用する最初のコンポーネントですが、メカニズムは Collector のコアリポジトリの mdatagen にあるため、セマンティック規約の変更に直面するあらゆるコンポーネントが同じパスをたどることができます。

System SIG は、セマンティック規約における system 名前空間の RC への昇格に取り組んでいます。
これは CPU、メモリ、ディスク、ネットワーク、ファイルシステムをカバーする `system.*` メトリクスで、hostmetrics に残っている大部分です。
この作業はすでに開始されています。
これらの規約が RC に到達した後、同じバージョン付きメトリクスのアプローチを使用して、hostmetrics レシーバーの system メトリクスと属性をスクレイパーごとに昇格させ始めることができます。
