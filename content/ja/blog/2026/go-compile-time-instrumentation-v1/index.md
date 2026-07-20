---
title: OpenTelemetry Goのコンパイル時の計装v1の発表
linkTitle: Goのコンパイル時の計装v1
date: 2026-07-16
author: '[Kemal Akkoyun](https://github.com/kakkoyun) (Datadog)'
issue: 10670
sig: Go Compile-Time Instrumentation
default_lang_commit: d88ab6df454cbc6de0b0ae5a4de4684e1154cea4
# prettier-ignore
cSpell:ignore: Akkoyun Azhar Cabify Castañé Dario GOFLAGS Haibin Martinez Momin otelc toolexec Xabier
---

Java、Python、Node.js、.NETで開発している場合、コードを編集せずにOpenTelemetryをアプリケーションへ追加することが長年可能で、起動時にエージェントをアタッチすれば、テレメトリーの送信が始まります。
Goは例外でした。
Goプログラムは、起動時にフックできるランタイムを持たない単一の静的バイナリにコンパイルされるため、Go開発者は手動で計装するか、プロセス外のeBPFエージェントを使用する必要がありました。

この隔たりは埋まりつつあります。
OpenTelemetryコミュニティは、[OpenTelemetry Go Compile-Time Instrumentation](https://github.com/open-telemetry/opentelemetry-go-compile-instrumentation)の最初の安定版リリースを発表します。
2025年の初めに[このSIGを発表](/blog/2025/go-compile-time-instrumentation/)した際、AlibabaとDatadogは、Goをビルド時に計装する統一されたベンダー中立の方法を構築するために協力しました。
v1はこのプロジェクトにとって最初の安定版リリースです。

Goサービスをビルドして実行している場合、バイナリまたはコンテナイメージのビルド方法を1行変更するだけで、コードを変更せずにアプリケーションとその依存関係のOpenTelemetryトレースとメトリクスを取得できます。
プラットフォームエンジニアやSREにとっては、各チームが独自にコードを計装するのを待たずに、フリート全体のサービスへオブザーバビリティを追加できることを意味します。

## Goのコンパイル時の計装とは {#what-is-go-compile-time-instrumentation}

Goは単一の静的バイナリにコンパイルされるため、長い間、インタプリタ言語よりも自動計装が困難でした。
このプロジェクトは、ビルド中に標準のGoツールチェーン（`-toolexec`メカニズム経由）にフックし、コード、依存関係、標準ライブラリがコンパイルされる際にOpenTelemetry計装を注入します。
別個のエージェントはなく、ランタイムでアタッチするものもありません。

つまり、ソースコードを変更せずにテレメトリーを取得でき、計装はバイナリに直接コンパイルされます。
アプリケーションコードは計装に関する懸念から解放され、自分が所有していないサードパーティライブラリもカバーされます。

## v1の主な機能 {#key-capabilities-in-v1}

- **ゼロコード計装**: 手動でコードを変更せずに、アプリケーションとその依存関係を計装します。
- **コンパイル時の注入、ランタイムオーバーヘッドの追加なし**: 計装はランタイムでアタッチされるのではなく、バイナリに組み込まれます。
- **サードパーティと標準ライブラリのカバレッジ**: 自分が所有していない依存関係と標準ライブラリパッケージを計装します。
- **v1でサポートされる計装**: `net/http`、`database/sql`、gRPC、Redis、Goランタイムメトリクスを含む一般的なライブラリとフレームワークをサポートしており、さらに計装が定期的に追加されています。
  完全な最新リストは、[サポートされるライブラリ](/docs/zero-code/go/compile-time/supported-libraries/)を参照してください。
- **ルールベースで拡張可能**: SIGの計装ルール形式を通じて、新しいライブラリのサポートを追加できます。
  [計装ガイド](https://github.com/open-telemetry/opentelemetry-go-compile-instrumentation/blob/v1.0.0/docs/instrument-guide.md)と[ルールリファレンス](https://github.com/open-telemetry/opentelemetry-go-compile-instrumentation/blob/v1.0.0/docs/rules.md)を参照してください。
- **セマンティック規約への準拠**: 送信されるテレメトリーは、現在のOpenTelemetryセマンティック規約に従います。
- **CI/CDに対応**: 開発時にツールを実行するか、ビルドパイプラインに組み込めます。

## はじめに {#getting-started}

このプロジェクトは、標準のGoツールチェーンをラップする`otelc`というコマンドラインツールを提供します。
ビルドの変更は1行だけで、以前 `go build` を実行していた場所で `otelc go build` を実行します。
`go` の後に続くすべての引数はツールチェーンに転送されるため、ビルドの残りの部分は変わりません。

`go install` でインストールします。

```sh
go install go.opentelemetry.io/otelc/tool/cmd/otelc@latest
```

次に、これを介してアプリケーションをビルドします。

```sh
otelc go build -o myapp .
```

ビルドコマンドを変更したくない場合は、モジュールを準備するために一度 `otelc setup` を実行し、続いて、`GOFLAGS`を通じてGoツールチェーンを`otelc`に向け、通常どおり`go build`を実行します。

```sh
otelc setup
export GOFLAGS="${GOFLAGS} '-toolexec=otelc toolexec'"
go build -o myapp .
```

デフォルトでは、`otelc` はモジュール内のサポート対象ライブラリを検出し、設定やコード変更なしで自動的に計装します。
同じ置き換えはコンテナビルドでも機能し、ビルドステージに `otelc` をインストールして、`Dockerfile` の `go build` 行を `otelc go build` に置き換えます。
完全な手順は、[コンパイル時の計装のドキュメント](/docs/zero-code/go/compile-time/)を参照してください。

## どのような場合に使うべきか {#when-should-you-use-it}

Goサービスを開発または運用している場合、OpenTelemetryのテレメトリーを取得するための補完的な方法が3つあり、コンパイル時の計装は創設時の投稿で約束された3番目の選択肢です。

- **コンパイル時の計装（このプロジェクト）**: アプリケーションを再ビルドでき、コード変更やランタイムオーバーヘッドを加えずに、依存関係と標準ライブラリをカバーしたい場合に最適です。
- **eBPF計装（[OpenTelemetry eBPF Instrumentation、またはOBI](/docs/zero-code/obi/)）**: バイナリを再ビルドできない場合や、プロセス外部からゼロコードで複数言語を計装したい場合に最適です。
- **[OpenTelemetry Go API](/docs/languages/go/) による手動計装**: カスタムスパンやドメイン固有のテレメトリーに最適で、他の2つの方法と組み合わせられます。

v1はGoエコシステム全体を網羅するのではなく、対象を絞った計装セットを提供しており、カバレッジはリリースごとに拡大します。
依存するライブラリがまだカバーされていない場合は、そのためのルールを追加するか、コンパイル時の計装と手動スパンを組み合わせることができます。
上記の3つの方法は異なる方法で重複する問題を解決するため、OBIとGo SIGとともに、それらをより深く比較するフォローアップ投稿に取り組んでいます。

## 次の予定 {#whats-next}

v1はコンパイル時のアプローチの中核をカバーしています。
今後の優先事項は次のとおりです。

- **より多くの計装**: 一般的なGoライブラリとフレームワーク全体にカバレッジを広げ、`otelc`に置き換えた直後からより多くのアプリケーションが動作するようにします。
- **レジストリベースの検出**: 既存の[OpenTelemetry Registry](/ecosystem/registry/)を使用して計装を検出・配布し、新しい `otelc` リリースを待たずに新しいライブラリのサポートを取得できるようにします。
- **パフォーマンス**: ビルド時とランタイムの両方のコストを引き続き削減します。
- **採用と認知**: チームがツールの存在とビルドへの組み込み方を知るために、ドキュメント、例、アウトリーチに投資します。

## 参加する {#get-involved}

コンパイル時の計装はv1であり、その次の展開を形作る最良の方法は、使用して参加することです。

- **試して結果を教えてください。** ビルドに`otelc`を追加し、何が機能し何が機能しなかったかをプロジェクトの[GitHub DiscussionsとIssues](https://github.com/open-telemetry/opentelemetry-go-compile-instrumentation)で共有してください。
  実際の利用からのフィードバックがロードマップを推進します。
- **使用するライブラリを計装してください。** カバレッジはSIGのルール形式を通じて拡大します。
  [計装ガイド](https://github.com/open-telemetry/opentelemetry-go-compile-instrumentation/blob/v1.0.0/docs/instrument-guide.md)では、ルールを1つ追加する手順を説明しています。
- **SIGに参加してください。** CNCF Slackの[#otel-go-compile-instrumentation](https://cloud-native.slack.com/archives/C088D8GSSSF)とSIGミーティングで見つけられます。

## 謝辞 {#acknowledgments}

v1の達成は、Go Compile-Time Instrumentation SIG全体にとっての節目です。
リリースを安定版まで推進した、[Xabier Martinez](https://github.com/txabman42)（Cabify）、[Yi Yang](https://github.com/y1yang0)（Alibaba）、[Haibin Zhang](https://github.com/NameHaibinZhang)（Alibaba）、[Dario Castañé](https://github.com/darccio)（Datadog）を含むメンテナー、およびコード、ルール、ドキュメント、フィードバックを提供したすべての方に感謝します。

[Azhar Momin](https://github.com/amazingakai)には、[LFX Mentorshipプログラム](https://mentorship.lfx.linuxfoundation.org/project/3e530f5c-12f3-4321-836a-39de799a4d15)を通じてプロジェクトに参加し、最も活発なコントリビューターの一人であり、承認者になったことに特別な感謝を申し上げます。
