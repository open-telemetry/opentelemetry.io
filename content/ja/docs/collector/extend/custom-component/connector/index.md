---
title: コネクターをビルドする
linkTitle: コネクター
aliases:
  - /docs/collector/build-connector
  - /docs/collector/building/connector
weight: 200
default_lang_commit: 8013aa5f0aae284fa343311981625be6dbb25e5b
# prettier-ignore
cSpell:ignore: debugexporter exampleconnector gomod gord Jaglowski mapstructure otlpreceiver pdata pmetric ptrace servicegraph spanmetrics struct uber
---

## OpenTelemetry におけるコネクター {#connectors-in-opentelemetry}

このページの内容は、すでに計装されたアプリケーションが何らかのトレーシングテレメトリーデータを生成しており、[OpenTelemetry Collector](/docs/collector) を理解していることを前提としています。

## コネクターとは {#what-is-a-connector}

コネクターは、異なる Collector パイプライン間でテレメトリーデータを送信する手段として、パイプライン同士を接続する役割を果たします。
コネクターは、一方のパイプラインに対してはエクスポーターとして、もう一方のパイプラインに対してはレシーバーとして機能します。
OpenTelemetry Collector の各パイプラインは、1つの種類のテレメトリーデータを処理します。
ある形式のテレメトリーデータを別の形式に変換する必要がある場合がありますが、その際はデータを適切な Collector パイプラインにルーティングする必要があります。

## なぜコネクターを使うのか {#why-use-a-connector}

コネクターは、データストリームのマージ、ルーティング、レプリケーションに有効です。
パイプラインを接続するシーケンシャルパイプラインに加えて、コネクターコンポーネントは条件付きデータフローと生成データストリームの機能を備えています。
条件付きデータフローとは、最も優先度の高いパイプラインにデータを送信し、必要に応じて代替パイプラインにルーティングするエラー検出機能を持つことを意味します。
生成データストリームとは、受信したデータに基づいてコンポーネントが独自のデータを生成し出力することを意味します。
このチュートリアルでは、コネクターのパイプライン接続機能に焦点を当てます。

OpenTelemetry には、テレメトリーデータの種類を別の種類に変換するプロセッサーがあります。
例として、spanmetrics プロセッサーや servicegraph プロセッサーがあります。
spanmetrics プロセッサーは、スパンデータから集約されたリクエスト、エラー、およびデュレーションメトリクスを生成します。
servicegraph プロセッサーは、トレースデータを分析し、サービス間の関係を記述するメトリクスを生成します。
これらのプロセッサーは、いずれもトレースデータを取り込んでメトリクスデータに変換します。
OpenTelemetry Collector のパイプラインは1つの種類のデータのみを扱うため、トレースパイプライン内のプロセッサーからトレースデータを変換してメトリクスパイプラインに送信する必要があります。
歴史的に、一部のプロセッサーは、プロセッサーが処理後に直接データをエクスポートするという悪い慣行に基づくワークアラウンドを使用してデータを送信していました。
コネクターコンポーネントは、このワークアラウンドの必要性を解消し、ワークアラウンドを使用していたプロセッサーは非推奨になりました。
同様に、前述のプロセッサーも最近のリリースで非推奨となり、コネクターに置き換えられています。

コネクターの完全な機能に関する追加の詳細は、以下のリンクを参照してください。
[OpenTelemetry のコネクターとは？](https://observiq.com/blog/what-are-connectors-in-opentelemetry/)、
[OpenTelemetry コネクター設定](/docs/collector/configuration/#connectors)

### 旧アーキテクチャ: {#the-old-architecture}

![プロセッサーが別のパイプラインのエクスポーターに直接データを出力していた以前の様子](./otel-collector-before-connector.svg)

### コネクターを使った新アーキテクチャ: {#new-architecture-using-a-connector}

![コネクターコンポーネントを使用したパイプラインの動作](./otel-collector-after-connector.svg)

## コネクターのビルド例 {#building-example-connector}

このチュートリアルでは、トレースを取り込んでメトリクスに変換するサンプルコネクターを作成します。
これは、OpenTelemetry におけるコネクターコンポーネントの基本的な使用例です。
この基本的なコネクターの機能は、特定の属性名を含むトレース内のスパン数を単純にカウントすることです。
これらの出現回数はコネクターに保存されます。

## 設定 {#configurations}

### Collector 設定のセットアップ: {#setting-up-collector-config}

OpenTelemetry Collector で使用する設定を `config.yaml` ファイルに記述します。
このファイルは、データがどのようにルーティング、処理、エクスポートされるかを定義します。
ファイル内の設定は、データパイプラインの動作を詳細に記述します。
コンポーネントの定義と、データが定義されたパイプラインの最初から最後までどのように流れるかを記述できます。
Collector の設定方法の詳細については、[Collector の設定](/docs/collector/configuration)を参照してください。

以下のコードは、これからビルドするサンプルコネクターに使用します。
このコードは、基本的で有効な OpenTelemetry Collector 設定ファイルの例です。

```yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
      http:
        endpoint: 0.0.0.0:4318

exporters:
  debug:

connectors:
  example:

service:
  pipelines:
    traces:
      receivers: [otlp]
      exporters: [example]
    metrics:
      receivers: [example]
      exporters: [debug]
```

上記コードの connectors セクションでは、パイプラインで使用可能なコネクターの名前を宣言する必要があります。
ここで、`example` はこのチュートリアルで作成するコネクターの名前です。

## 実装 {#implementation}

1.  サンプルコネクター用のフォルダーを作成します。
    このチュートリアルでは `exampleconnector` というフォルダーを作成します。
2.  フォルダーに移動して以下を実行します。

    ```sh
    go mod init github.com/gord02/exampleconnector
    ```

3.  `go mod tidy` を実行します。

    これにより `go.mod` と `go.sum` ファイルが作成されます。

4.  フォルダー内に以下のファイルを作成します。
    - `config.go` - コネクターの設定を定義するファイル
    - `factory.go` - コネクターのインスタンスを作成するファイル

### config.go でコネクターの設定を作成する {#create-your-connector-settings-in-configgo}

インスタンス化してパイプラインに参加するためには、Collector がコネクターを識別し、その設定ファイルから設定を適切に読み込む必要があります。

コネクターが設定にアクセスできるようにするために、`Config` 構造体を作成します。
この構造体には、コネクターの各設定に対応するエクスポートされたフィールドが必要です。
追加されたパラメーターフィールドは config.yaml ファイルからアクセスできます。
設定ファイルでの名前は構造体タグで設定されます。
構造体を作成してパラメーターを追加します。
オプションとして、コネクターのインスタンスに対して指定されたデフォルト値が有効かどうかを確認するバリデーション関数を追加できます。

`config.go` ファイルは以下のようになります。

> exampleconnector/config.go

```go
package exampleconnector

import "fmt"

// Config は Collector の config.yaml 内のコネクター設定を表します
type Config struct {
    AttributeName string `mapstructure:"attribute_name"`
}

func (c *Config) Validate() error {
    if c.AttributeName == "" {
        return fmt.Errorf("attribute_name must not be empty")
    }
    return nil
}
```

mapstructure の詳細については、[Go mapstructure](https://pkg.go.dev/github.com/mitchellh/mapstructure) を参照してください。

## ファクトリの実装 {#implement-the-factory}

オブジェクトをインスタンス化するには、各コンポーネントに関連付けられた `NewFactory` 関数を使用する必要があります。
ここでは `connector.NewFactory` 関数を使用します。
`connector.NewFactory` 関数は `connector.Factory` をインスタンス化して返し、以下のパラメーターが必要です。

- `component.Type`: すべての Collector コンポーネントの中で同じ種類のコネクターを一意に識別する文字列。
  この文字列は、コネクターを参照する際の名前としても機能します。
- `component.CreateDefaultConfigFunc`: コネクターのデフォルトの `component.Config` インスタンスを返す関数への参照。
- `...FactoryOption`: `connector.FactoryOptions` のスライスで、コネクターが処理できるシグナルの種類を決定します。

1.  factory.go ファイルを作成し、コネクターを識別する一意の文字列をグローバル定数として定義します。

    ```go
    const defaultVal string = "request.n"

    // Type はこのコネクターのコンポーネントタイプ名です
    var Type = component.MustNewType("example")
    ```

2.  デフォルト設定関数を作成します。
    これは、コネクターオブジェクトをデフォルト値で初期化する方法を定義します。

    ```go
    func createDefaultConfig() component.Config {
        return &Config{
            AttributeName: defaultVal,
        }
    }
    ```

3.  作業するコネクターの種類を定義します。
    これはファクトリオプションとして渡されます。
    コネクターは異なる種類または同じ種類のパイプラインを接続できます。
    コネクターのエクスポート側の種類とレシーバー側の種類を定義する必要があります。
    トレースをエクスポートしてメトリクスを受信するコネクターは、コネクターコンポーネントの1つの固有の構成であり、定義の順序が重要です。
    トレースをエクスポートしてメトリクスを受信するコネクターは、メトリクスをエクスポートしてトレースを受信するコネクターとは異なります。

    ```go
    // createTracesToMetricsConnector はコネクターのコンシューマータイプを定義します
    // トレースを消費してメトリクスをエクスポートしたいため、nextConsumer をメトリクスとして定義します。コンシューマーはパイプラインの次のコンポーネントだからです
    func createTracesToMetricsConnector(ctx context.Context, params connector.Settings, cfg component.Config, nextConsumer consumer.Metrics) (connector.Traces, error) {
        return newConnector(params.Logger, cfg, nextConsumer)
    }
    ```

    `createTracesToMetricsConnector` は、コネクターコンポーネントのコンシューマーコンポーネント、つまりコネクターがデータを送信した後にデータを取り込む次のコンポーネントを定義することで、コネクターコンポーネントをさらに初期化する関数です。
    コネクターは、ここで示しているような1つの順序付けされた型の組み合わせに制限されないことに注意してください。
    たとえば、count コネクターは、トレースからメトリクス、ログからメトリクス、メトリクスからメトリクスなど、複数の関数を定義しています。

    `createTracesToMetricsConnector` のパラメーター:
    - `context.Context`: Collector の `context.Context` への参照で、トレースレシーバーが実行コンテキストを適切に管理できるようにします。
    - `connector.CreateSettings`: レシーバーが作成される際の Collector の設定の一部への参照。
    - `component.Config`: レシーバーの設定を Collector の設定から適切に読み取れるように、Collector からファクトリに渡されるレシーバー設定への参照。
    - `consumer.Metrics`: パイプライン内の次のコンシューマー種類への参照で、受信したトレースの送信先です。
      プロセッサー、エクスポーター、または別のコネクターになり得ます。

4.  コネクター（コンポーネント）のカスタムファクトリをインスタンス化する `NewFactory` 関数を作成します。

    ```go
    // NewFactory は example コネクターのファクトリを作成します。
    func NewFactory() connector.Factory {
        // コネクターのファクトリを作成するための OpenTelemetry コネクターファクトリ
        return connector.NewFactory(
            Type,
            createDefaultConfig,
            connector.WithTracesToMetrics(createTracesToMetricsConnector, component.StabilityLevelAlpha))
    }
    ```

    コネクターは複数の順序付けされたデータ型の組み合わせをサポートできることに注意してください。

完成した `factory.go` は以下のとおりです。

```go
package exampleconnector

import (
	"context"

	"go.opentelemetry.io/collector/component"
	"go.opentelemetry.io/collector/connector"
	"go.opentelemetry.io/collector/consumer"
)

const defaultVal string = "request.n"

// Type はこのコネクターのコンポーネントタイプ名です
var Type = component.MustNewType("example")

// NewFactory は example コネクターのファクトリを作成します。
func NewFactory() connector.Factory {
	// コネクターのファクトリを作成するための OpenTelemetry コネクターファクトリ
	return connector.NewFactory(
		Type,
		createDefaultConfig,
		connector.WithTracesToMetrics(createTracesToMetricsConnector, component.StabilityLevelAlpha))
}

func createDefaultConfig() component.Config {
	return &Config{
		AttributeName: defaultVal,
	}
}

// createTracesToMetricsConnector はコネクターのコンシューマータイプを定義します
// トレースを消費してメトリクスをエクスポートしたいため、nextConsumer をメトリクスとして定義します。コンシューマーはパイプラインの次のコンポーネントだからです
func createTracesToMetricsConnector(ctx context.Context, params connector.Settings, cfg component.Config, nextConsumer consumer.Metrics) (connector.Traces, error) {
	return newConnector(params.Logger, cfg, nextConsumer)
}
```

## トレースコネクターの実装 {#implementing-the-trace-connector}

`connector.go` ファイルに、コンポーネントの種類に固有のインターフェイスメソッドを実装します。
このチュートリアルでは、トレースコネクターを実装するため、`baseConsumer`、`Traces`、および `component.Component` のインターフェイスを実装する必要があります。

1.  コネクターに必要なパラメーターを持つコネクター構造体を定義します。

    ```go
    // コネクターのスキーマ
    type connectorImp struct {
        config          Config
        metricsConsumer consumer.Metrics
        logger          *zap.Logger
        // Start と Shutdown 関数の特定の実装が不要な場合はこれらのパラメーターを含めます
        component.StartFunc
        component.ShutdownFunc
    }
    ```

2.  コネクターを作成する `newConnector` 関数を定義します。

    ```go
    // newConnector は新しいコネクターを作成する関数です
    func newConnector(logger *zap.Logger, config component.Config, nextConsumer consumer.Metrics) (*connectorImp, error) {
        logger.Info("Building exampleconnector connector")
        cfg := config.(*Config)

        return &connectorImp{
            config:          *cfg,
            logger:          logger,
            metricsConsumer: nextConsumer,
        }, nil
    }
    ```

    `newConnector` 関数は、コネクターのインスタンスを作成するファクトリ関数です。

3.  インターフェイスを適切に実装するために `Capabilities` メソッドを実装します。

    ```go
    // Capabilities はコンシューマーインターフェースを実装します。
    func (c *connectorImp) Capabilities() consumer.Capabilities {
        return consumer.Capabilities{MutatesData: false}
    }
    ```

    コネクターがコンシューマー型であることを保証するために `Capabilities` メソッドを実装します。
    このメソッドは、コンポーネントの機能、つまりコンポーネントがデータを変更できるかどうかを定義します。
    `MutatesData` を true に設定すると、コネクターが渡されたデータ構造を変更することを示します。

4.  テレメトリーデータを消費する `Consumer` メソッドを実装します。

    ```go
    // ConsumeTraces メソッドは、コネクターに送信されたトレースの各インスタンスに対して呼び出されます
    func (c *connectorImp) ConsumeTraces(ctx context.Context, td ptrace.Traces) error {
        // 消費された1つのトレースのスパンの各レベルをループします
        for i := 0; i < td.ResourceSpans().Len(); i++ {
            resourceSpan := td.ResourceSpans().At(i)

            for j := 0; j < resourceSpan.ScopeSpans().Len(); j++ {
                scopeSpan := resourceSpan.ScopeSpans().At(j)

                for k := 0; k < scopeSpan.Spans().Len(); k++ {
                    span := scopeSpan.Spans().At(k)
                    attrs := span.Attributes()
                    if _, ok := attrs.Get(c.config.AttributeName); ok {
                        // トレースのスパンが特定の属性を持っていた場合にのみメトリクスを作成します
                        metrics := pmetric.NewMetrics()
                        return c.metricsConsumer.ConsumeMetrics(ctx, metrics)
                    }
                }
            }
        }
        return nil
    }
    ```

5.  オプション: 特定の実装が必要な場合にのみ、インターフェイスを適切に実装するための `Start` と `Shutdown` メソッドを実装します。
    そうでない場合は、定義されたコネクター構造体の一部として `component.StartFunc` と `component.ShutdownFunc` を含めるだけで十分です。

完成したコネクターファイルは以下のようになります。

> exampleconnector/connector.go

```go
package exampleconnector

import (
	"context"

	"go.uber.org/zap"

	"go.opentelemetry.io/collector/component"
	"go.opentelemetry.io/collector/consumer"
	"go.opentelemetry.io/collector/pdata/pmetric"
	"go.opentelemetry.io/collector/pdata/ptrace"
)

// コネクターのスキーマ
type connectorImp struct {
	config          Config
	metricsConsumer consumer.Metrics
	logger          *zap.Logger
	// Start と Shutdown 関数の特定の実装が不要な場合はこれらのパラメーターを含めます
	component.StartFunc
	component.ShutdownFunc
}

// newConnector は新しいコネクターを作成する関数です
func newConnector(logger *zap.Logger, config component.Config, nextConsumer consumer.Metrics) (*connectorImp, error) {
	logger.Info("Building exampleconnector connector")
	cfg := config.(*Config)

	return &connectorImp{
		config:          *cfg,
		logger:          logger,
		metricsConsumer: nextConsumer,
	}, nil
}

// Capabilities はコンシューマーインターフェースを実装します。
func (c *connectorImp) Capabilities() consumer.Capabilities {
	return consumer.Capabilities{MutatesData: false}
}

// ConsumeTraces メソッドは、コネクターに送信されたトレースの各インスタンスに対して呼び出されます
func (c *connectorImp) ConsumeTraces(ctx context.Context, td ptrace.Traces) error {
	// 消費された1つのトレースのスパンの各レベルをループします
	for i := 0; i < td.ResourceSpans().Len(); i++ {
		resourceSpan := td.ResourceSpans().At(i)

		for j := 0; j < resourceSpan.ScopeSpans().Len(); j++ {
			scopeSpan := resourceSpan.ScopeSpans().At(j)

			for k := 0; k < scopeSpan.Spans().Len(); k++ {
				span := scopeSpan.Spans().At(k)
				attrs := span.Attributes()
				if _, ok := attrs.Get(c.config.AttributeName); ok {
					// トレースのスパンが特定の属性を持っていた場合にのみメトリクスを作成します
					metrics := pmetric.NewMetrics()
					return c.metricsConsumer.ConsumeMetrics(ctx, metrics)
				}
			}
		}
	}
	return nil
}
```

## コンポーネントの使用 {#using-the-component}

### OpenTelemetry Collector Builder の使用方法の概要: {#summary-of-using-opentelemetry-collector-builder}

[OpenTelemetry Collector Builder](/docs/collector/extend/ocb/) を使用して、コードをビルドし実行できます。
Collector Builder は、独自の OpenTelemetry Collector バイナリをビルドできるツールです。
ニーズに合わせてコンポーネント（レシーバー、プロセッサー、コネクター、エクスポーター）を追加または削除できます。

1.  OpenTelemetry Collector Builder の[インストール手順](/docs/collector/extend/ocb/)に従います。

2.  設定ファイルの作成:

    インストール後の次のステップは、設定ファイル `builder-config.yaml` を作成することです。
    このファイルは、カスタムバイナリに含める Collector コンポーネントを定義します。

    新しいコネクターコンポーネントを含む設定ファイルの例を以下に示します。

    ```yaml
    dist:
      name: otelcol-dev-bin
      description: Basic OpenTelemetry collector distribution for Developers
      output_path: ./otelcol-dev

    exporters:
      - gomod: go.opentelemetry.io/collector/exporter/debugexporter v0.129.0

    receivers:
      - gomod: go.opentelemetry.io/collector/receiver/otlpreceiver v0.129.0

    # このチュートリアルでは使用しませんが、ユースケースに応じて追加できます
    # processors:

    connectors:
      - gomod: github.com/gord02/exampleconnector v0.129.0

    replaces:
      # 結果として生成される go.mod の一部となる "replaces" ディレクティブのリスト

      # 新しく追加されたコンポーネントがまだ GitHub に公開されていないため、この replace 文が必要です。GitHub パスへの参照をローカルパスに置き換えます
      - github.com/gord02/exampleconnector =>
        [PATH-TO-COMPONENT-CODE]/exampleconnector
    ```

    replace 文を含める必要があります。
    新しく作成されたコンポーネントがまだ GitHub に公開されていないため、replace セクションが必要です。
    コンポーネントの GitHub パスへの参照を、コードのローカルパスに置き換える必要があります。

    Go における replacement の詳細については、[Go mod file Replace](https://go.dev/ref/mod#go-mod-file-replace) を参照してください。

3.  Collector バイナリのビルド:

    含まれるコネクターコンポーネントを記載したビルダー設定ファイルを渡してビルダーを実行すると、カスタム Collector バイナリがビルドされます。

    ```sh
    ./ocb --config [PATH-TO-CONFIG]/builder-config.yaml
    ```

    これにより、設定ファイルで指定した出力パスディレクトリに Collector バイナリが生成されます。

    ビルドが成功すると、以下のような出力が表示されます。

    ```sh
    ./ocb --config builder-config.yaml
    2025-07-15T22:10:10.351+0900    INFO    internal/command.go:99  OpenTelemetry Collector Builder {"version": "0.129.0"}
    2025-07-15T22:10:10.352+0900    INFO    internal/command.go:104 Using config file       {"path": "builder-config.yaml"}
    2025-07-15T22:10:10.353+0900    INFO    builder/config.go:160   Using go        {"go-executable": "/opt/homebrew/Cellar/go@1.23/1.23.6/bin/go"}
    2025-07-15T22:10:10.354+0900    INFO    builder/main.go:99      Sources created {"path": "./otelcol-dev"}
    2025-07-15T22:10:10.516+0900    INFO    builder/main.go:201     Getting go modules
    2025-07-15T22:10:10.554+0900    INFO    builder/main.go:110     Compiling
    2025-07-15T22:10:13.369+0900    INFO    builder/main.go:140     Compiled        {"binary": "./otelcol-dev/otelcol-dev-bin"}
    ```

4.  Collector バイナリの実行:

    ステップ 3 の出力に記載されたバイナリパス（例: `{"binary": "./otelcol-dev/otelcol-dev-bin"}`）を使用して、カスタム Collector バイナリを実行できます。

    ```sh
    ./otelcol-dev/otelcol-dev-bin --config [PATH-TO-CONFIG]/config.yaml
    ```

    出力パス名とディストリビューション名は `build-config.yaml` に記載されています。

## コネクターのテスト {#testing-your-connector}

サンプルコネクターのビルドが完了したら、ユニットテストでその機能を検証しましょう。
Go のユニットテストは、より広いカバレッジを提供し、保守も容易です。

### ユニットテストの作成 {#writing-unit-tests}

コネクターのディレクトリにテストファイル `connector_test.go` を作成します。

> exampleconnector/connector_test.go

```go
package exampleconnector

import (
	"context"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"github.com/vibeus/opentelemetry-collector/confmap/xconfmap"
	"go.opentelemetry.io/collector/consumer/consumertest"
	"go.opentelemetry.io/collector/pdata/ptrace"
	"go.uber.org/zap"
)

func TestConsumeTraces(t *testing.T) {
	// メトリクスをキャプチャするテストコンシューマーを作成します
	metricsConsumer := &consumertest.MetricsSink{}

	// テスト設定でコネクターを作成します
	cfg := &Config{
		AttributeName: "request.n",
	}

	connector, err := newConnector(zap.NewNop(), cfg, metricsConsumer)
	require.NoError(t, err)

	ctx := context.Background()

	t.Run("span with target attribute generates metric", func(t *testing.T) {
		// コンシューマーをリセットします
		metricsConsumer.Reset()

		// 対象の属性を持つトレースデータを作成します
		traces := ptrace.NewTraces()
		resourceSpan := traces.ResourceSpans().AppendEmpty()
		scopeSpan := resourceSpan.ScopeSpans().AppendEmpty()
		span := scopeSpan.Spans().AppendEmpty()

		// 対象の属性を追加します
		span.Attributes().PutStr("request.n", "test-value")
		span.Attributes().PutStr("http.method", "GET")

		// トレースを消費します
		err := connector.ConsumeTraces(ctx, traces)
		require.NoError(t, err)

		// メトリクスが生成されたことを検証します
		assert.Equal(t, 1, len(metricsConsumer.AllMetrics()))
	})

	t.Run("span without target attribute does not generate metric", func(t *testing.T) {
		// コンシューマーをリセットします
		metricsConsumer.Reset()

		// 対象の属性を持たないトレースデータを作成します
		traces := ptrace.NewTraces()
		resourceSpan := traces.ResourceSpans().AppendEmpty()
		scopeSpan := resourceSpan.ScopeSpans().AppendEmpty()
		span := scopeSpan.Spans().AppendEmpty()

		// 対象以外の属性を追加します
		span.Attributes().PutStr("http.method", "POST")
		span.Attributes().PutStr("user.id", "12345")

		// トレースを消費します
		err := connector.ConsumeTraces(ctx, traces)
		require.NoError(t, err)

		// メトリクスが生成されていないことを検証します
		assert.Equal(t, 0, len(metricsConsumer.AllMetrics()))
	})

	t.Run("multiple spans with mixed attributes", func(t *testing.T) {
		// コンシューマーをリセットします
		metricsConsumer.Reset()

		// 複数のスパンを持つトレースデータを作成します
		traces := ptrace.NewTraces()
		resourceSpan := traces.ResourceSpans().AppendEmpty()
		scopeSpan := resourceSpan.ScopeSpans().AppendEmpty()

		// 対象の属性を持つ最初のスパン
		span1 := scopeSpan.Spans().AppendEmpty()
		span1.Attributes().PutStr("request.n", "value1")

		// 対象の属性を持たない2番目のスパン
		span2 := scopeSpan.Spans().AppendEmpty()
		span2.Attributes().PutStr("other.attr", "value2")

		// トレースを消費します
		err := connector.ConsumeTraces(ctx, traces)
		require.NoError(t, err)

		// 最初のスパンからのみ、正確に1つのメトリクスが生成されるべきです
		assert.Equal(t, 1, len(metricsConsumer.AllMetrics()))
	})
}

func TestConnectorCapabilities(t *testing.T) {
	connector := &connectorImp{}
	capabilities := connector.Capabilities()
	assert.False(t, capabilities.MutatesData)
}

func TestCreateDefaultConfig(t *testing.T) {
	cfg := createDefaultConfig()
	assert.NotNil(t, cfg)

	exampleConfig := cfg.(*Config)
	assert.Equal(t, "request.n", exampleConfig.AttributeName)
}

func TestConfigValidation(t *testing.T) {
	t.Run("valid config", func(t *testing.T) {
		cfg := &Config{
			AttributeName: "test.attribute",
		}
		err := xconfmap.Validate(cfg)
		assert.NoError(t, err)
	})

	t.Run("invalid config - empty attribute name", func(t *testing.T) {
		cfg := &Config{
			AttributeName: "",
		}
		err := xconfmap.Validate(cfg)
		assert.Error(t, err)
		assert.Contains(t, err.Error(), "attribute_name must not be empty")
	})
}
```

### テストの実行 {#running-the-tests}

1. **`go.mod` にテスト依存関係を追加します:**

   ```sh
   go mod tidy
   ```

2. **テストを実行します:**

   ```sh
   go test -cover -v ./...
   ```

### 期待されるテスト出力 {#expected-test-output}

テストが正常に実行されると、以下のような出力が表示されます。

```sh
go test -cover -v ./...
=== RUN   TestConsumeTraces
=== RUN   TestConsumeTraces/span_with_target_attribute_generates_metric
=== RUN   TestConsumeTraces/span_without_target_attribute_does_not_generate_metric
=== RUN   TestConsumeTraces/multiple_spans_with_mixed_attributes
--- PASS: TestConsumeTraces (0.00s)
    --- PASS: TestConsumeTraces/span_with_target_attribute_generates_metric (0.00s)
    --- PASS: TestConsumeTraces/span_without_target_attribute_does_not_generate_metric (0.00s)
    --- PASS: TestConsumeTraces/multiple_spans_with_mixed_attributes (0.00s)
=== RUN   TestConnectorCapabilities
--- PASS: TestConnectorCapabilities (0.00s)
=== RUN   TestCreateDefaultConfig
--- PASS: TestCreateDefaultConfig (0.00s)
=== RUN   TestConfigValidation
=== RUN   TestConfigValidation/valid_config
=== RUN   TestConfigValidation/invalid_config_-_empty_attribute_name
--- PASS: TestConfigValidation (0.00s)
    --- PASS: TestConfigValidation/valid_config (0.00s)
    --- PASS: TestConfigValidation/invalid_config_-_empty_attribute_name (0.00s)
PASS
coverage: 90.5% of statements
ok      github.com/gord02/exampleconnector      0.501s  coverage: 90.5% of statements
```

これらのユニットテストは、コネクターの機能を包括的にカバーしており、OpenTelemetry Collector エコシステムにおけるコンポーネントの動作を検証するための推奨アプローチです。

OpenTelemetry Collector Builder に関する追加リソース:

- [カスタム Collector のビルド](/docs/collector/extend/ocb/)
- [OpenTelemetry Collector Builder README](https://github.com/open-telemetry/opentelemetry-collector/tree/main/cmd/builder)
- [Connected Observability Pipelines in the OpenTelemetry Collector by Dan Jaglowski](https://www.youtube.com/watch?v=uPpZ23iu6kI)
- [Connector README](https://github.com/open-telemetry/opentelemetry-collector/blob/main/connector/README.md)
