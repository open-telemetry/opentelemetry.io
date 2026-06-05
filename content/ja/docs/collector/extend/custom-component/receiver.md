---
title: レシーバーを構築する
linkTitle: レシーバー
weight: 100
aliases:
  - /docs/collector/trace-receiver
  - /docs/collector/building/receiver
default_lang_commit: 2af96e42fca16c64f346a174d62a9d53f43545b3
# prettier-ignore
cSpell:ignore: backendsystem crand debugexporter mapstructure pcommon pdata ptrace rcvr resourcespans struct tailtracer telemetrygen uber
---

<!-- markdownlint-disable heading-increment no-duplicate-heading -->

OpenTelemetry は[分散トレーシング](/docs/concepts/glossary/#distributed-tracing)を次のように定義しています。

> トレースは、アプリケーションを構成するサービスによって処理される、トレースとして知られる単一のリクエストの進行を追跡します。
> リクエストはユーザーまたはアプリケーションによって開始されることがあります。
> 分散トレーシングは、プロセス、ネットワーク、セキュリティの境界を越えるトレースの形態です。

分散トレースはアプリケーション中心の方法で定義されていますが、システムを通過する _あらゆる_ リクエストのタイムラインとして考えることができます。
各分散トレースは、リクエストが最初から最後まで完了するのにかかった時間を示し、完了するために実行されたステップを分解します。

システムがトレーシングテレメトリーを生成する場合、[OpenTelemetry Collector](/docs/collector/) にトレースレシーバーを設定して、そのテレメトリーを受信し変換できます。
レシーバーは、元の形式のデータを OpenTelemetry トレースモデルに変換し、Collector が処理できるようにします。

トレースレシーバーを実装するには、以下が必要です。

- `Config` 実装。トレースレシーバーが Collector の config.yaml で設定を収集し検証できるようにします。

- `receiver.Factory` 実装。Collector がトレースレシーバーコンポーネントを適切にインスタンス化できるようにします。

- `receiver.Traces` 実装。テレメトリーを収集し、内部トレース表現に変換し、パイプラインの次のコンシューマーにテレメトリーを渡します。

このチュートリアルでは、プル操作をシミュレートし、その操作の結果としてトレースを生成する `tailtracer` というトレースレシーバーの作成方法を説明します。

## レシーバーの開発およびテスト環境のセットアップ {#setting-up-receiver-development-and-testing-environment}

まず、[カスタム Collector の構築](/docs/collector/extend/ocb/)チュートリアルを使用して `otelcol-dev` という名前の Collector インスタンスを作成します。
[OpenTelemetry Collector Builder の設定](/docs/collector/extend/ocb/#configure-the-opentelemetry-collector-builder)に記載されている `builder-config.yaml` をコピーしてビルダーを実行するだけです。
結果として、次のようなフォルダ構造ができるはずです。

```text
.
├── builder-config.yaml
├── ocb
└── otelcol-dev
    ├── components.go
    ├── components_test.go
    ├── go.mod
    ├── go.sum
    ├── main.go
    ├── main_others.go
    ├── main_windows.go
    └── otelcol-dev
```

トレースレシーバーを適切にテストするには、Collector がテレメトリーを送信できる分散トレーシングバックエンドが必要になる場合があります。
ここでは [Jaeger](https://www.jaegertracing.io/docs/latest/getting-started/) を使用します。
`Jaeger` インスタンスが実行されていない場合は、次のコマンドで Docker を使用して簡単に起動できます。

```sh
docker run -d --name jaeger \
  -e COLLECTOR_OTLP_ENABLED=true \
  -p 16686:16686 \
  -p 14317:4317 \
  -p 14318:4318 \
  jaegertracing/all-in-one:1.41
```

コンテナが起動して実行されたら、次の URL から Jaeger UI にアクセスできます。
<http://localhost:16686/>

次に、Collector コンポーネントとパイプラインをセットアップするために `config.yaml` という名前の Collector 設定ファイルを作成します。

```sh
touch config.yaml
```

ここでは、`otlp` レシーバーと `otlp` および `debug` エクスポーターを使用した基本的なトレースパイプラインだけが必要です。
`config.yaml` ファイルは次のようになります。

> config.yaml

```yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317

exporters:
  debug:
    verbosity: detailed
  otlp/jaeger:
    endpoint: localhost:14317
    tls:
      insecure: true
    sending_queue:
      batch:

service:
  pipelines:
    traces:
      receivers: [otlp]
      exporters: [otlp/jaeger, debug]
  telemetry:
    logs:
      level: debug
```

> [!NOTE]
>
> ここでは簡単のために `otlp` エクスポーターの設定で `insecure` フラグを使用しています。
> 本番環境で Collector を実行する場合は、この[ガイド](/docs/collector/configuration/#setting-up-certificates)に従って、セキュアな通信のために TLS 証明書を使用するか、相互認証のために mTLS を使用してください。

Collector が正しくセットアップされていることを確認するには、次のコマンドを実行します。

```sh
./otelcol-dev/otelcol-dev --config config.yaml
```

出力は次のようになります。

```log
2023-11-08T18:38:37.183+0800	info	service@v0.88.0/telemetry.go:84	Setting up own telemetry...
2023-11-08T18:38:37.185+0800	info	service@v0.88.0/telemetry.go:201	Serving Prometheus metrics	{"address": ":8888", "level": "Basic"}
2023-11-08T18:38:37.185+0800	debug	exporter@v0.88.0/exporter.go:273	Stable component.	{"kind": "exporter", "data_type": "traces", "name": "otlp/jaeger"}
2023-11-08T18:38:37.186+0800	info	exporter@v0.88.0/exporter.go:275	Development component. May change in the future.	{"kind": "exporter", "data_type": "traces", "name": "debug"}
2023-11-08T18:38:37.186+0800	debug	receiver@v0.88.0/receiver.go:294	Stable component.	{"kind": "receiver", "name": "otlp", "data_type": "traces"}
2023-11-08T18:38:37.186+0800	info	service@v0.88.0/service.go:143	Starting otelcol-dev...	{"Version": "1.0.0", "NumCPU": 10}

<OMITTED>

2023-11-08T18:38:37.189+0800	info	service@v0.88.0/service.go:169	Everything is ready. Begin running and processing data.
2023-11-08T18:38:37.189+0800	info	zapgrpc/zapgrpc.go:178	[core] [Server #3 ListenSocket #4] ListenSocket created	{"grpc_log": true}
2023-11-08T18:38:37.195+0800	info	zapgrpc/zapgrpc.go:178	[core] [Channel #1 SubChannel #2] Subchannel Connectivity change to READY	{"grpc_log": true}
2023-11-08T18:38:37.195+0800	info	zapgrpc/zapgrpc.go:178	[core] [pick-first-lb 0x140005efdd0] Received SubConn state update: 0x140005eff80, {ConnectivityState:READY ConnectionError:<nil>}	{"grpc_log": true}
2023-11-08T18:38:37.195+0800	info	zapgrpc/zapgrpc.go:178	[core] [Channel #1] Channel Connectivity change to READY	{"grpc_log": true}
```

すべてうまくいけば、Collector インスタンスが起動して実行されているはずです。

[telemetrygen](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/cmd/telemetrygen) を使用してセットアップをさらに確認できます。
たとえば、別のコンソールを開いて次のコマンドを実行します。

```sh
go install github.com/open-telemetry/opentelemetry-collector-contrib/cmd/telemetrygen@latest

telemetrygen traces --otlp-insecure --traces 1
```

コンソールに詳細なログが表示され、次の URL から Jaeger UI でトレースを確認できるはずです。
<http://localhost:16686/>

Collector コンソールで <kbd>Ctrl + C</kbd> を押して Collector インスタンスを停止します。

## Go モジュールのセットアップ {#setting-up-go-module}

すべての Collector コンポーネントは Go モジュールとして作成する必要があります。
レシーバープロジェクトをホストする `tailtracer` フォルダを作成し、Go モジュールとして初期化しましょう。

```sh
mkdir tailtracer
cd tailtracer
go mod init github.com/open-telemetry/opentelemetry-tutorials/trace-receiver/tailtracer
```

> [!NOTE]
>
> 上記のモジュールパスはモックパスであり、任意のプライベートまたはパブリックパスにできます。
> [初期 trace-receiver コード](https://github.com/rquedas/otel4devs/tree/main/collector/receiver/trace-receiver)を参照してください。

`otelcol-dev` と `tailtracer`、そして将来的にはさらに多くのコンポーネントという複数の Go モジュールを管理するため、Go の [Workspaces](https://go.dev/doc/tutorial/workspaces) を有効にすることを推奨します。

```sh
cd ..
go work init
go work use otelcol-dev
go work use tailtracer
```

## レシーバー設定の設計と検証 {#designing-and-validating-receiver-settings}

レシーバーにはいくつかの設定可能な項目があり、Collector の設定ファイルで設定できます。

`tailtracer` レシーバーには以下の設定があります。

- `interval`: テレメトリーのプル操作間の時間間隔（分単位）を表す文字列。
- `number_of_traces`: 各間隔で生成されるモックトレースの数。

`tailtracer` レシーバーの設定は次のようになります。

```yaml
receivers:
  tailtracer: # この行はレシーバーの ID を表します
    interval: 1m
    number_of_traces: 1
```

レシーバーの設定をサポートするすべてのコードを記述するために、`tailtracer` フォルダの下に `config.go` という名前のファイルを作成します。

```sh
touch tailtracer/config.go
```

レシーバーの設定面を実装するには、`Config` 構造体を作成する必要があります。
`config.go` ファイルに次のコードを追加してください。

```go
package tailtracer

type Config struct{

}
```

レシーバーが設定にアクセスできるようにするには、`Config` 構造体にレシーバーの各設定項目に対応するフィールドが必要です。

上記の要件を実装した後の `config.go` ファイルは次のようになります。

> tailtracer/config.go

```go
package tailtracer

// Config は Collector の config.yaml におけるレシーバーの設定を表します
type Config struct {
   Interval    string `mapstructure:"interval"`
   NumberOfTraces int `mapstructure:"number_of_traces"`
}
```

> [!NOTE] 作業内容の確認
>
> - config.yaml の値に適切にアクセスするために、`Interval` と `NumberOfTraces` フィールドを追加しました。

設定にアクセスできるようになったので、オプションの [ConfigValidator](https://github.com/open-telemetry/opentelemetry-collector/blob/677b87e3ab5c615bc3f93b8f99bb1fa5be951751/component/config.go#L28) インターフェイスに従って `Validate` メソッドを実装し、それらの値に必要な検証を行えます。

この場合、`interval` の値はオプションです（デフォルト値の生成については後述します）。
ただし、定義する場合は少なくとも 1 分（1m）以上で、`number_of_traces` は必須の値です。
`Validate` メソッドを実装した後の config.go は次のようになります。

> tailtracer/config.go

```go
package tailtracer

import (
	"fmt"
	"time"
)

// Config は Collector の config.yaml におけるレシーバーの設定を表します
type Config struct {
	Interval       string `mapstructure:"interval"`
	NumberOfTraces int    `mapstructure:"number_of_traces"`
}

// Validate はレシーバーの設定が有効かどうかを確認します
func (cfg *Config) Validate() error {
	interval, _ := time.ParseDuration(cfg.Interval)
	if interval.Minutes() < 1 {
		return fmt.Errorf("when defined, the interval has to be set to at least 1 minute (1m)")
	}

	if cfg.NumberOfTraces < 1 {
		return fmt.Errorf("number_of_traces must be greater or equal to 1")
	}
	return nil
}
```

> [!NOTE] 作業内容の確認
>
> - エラーメッセージを適切にフォーマットして出力するために `fmt` パッケージをインポートしました。
> - `interval` 設定値が少なくとも 1 分（1m）以上であること、`number_of_traces` 設定値が 1 以上であることを確認する `Validate` メソッドを Config 構造体に追加しました。
>   これが満たされない場合、Collector は起動プロセス中にエラーを生成し、メッセージを適切に表示します。

コンポーネントの設定面に関わる構造体とインターフェイスを詳しく見たい場合は、Collector の GitHub プロジェクト内の [component/config.go](<https://github.com/open-telemetry/opentelemetry-collector/blob/v{{% param vers %}}/component/config.go>) ファイルを参照してください。

## receiver.Factory インターフェイスの実装 {#implementing-the-receiverfactory-interface}

`tailtracer` レシーバーは `receiver.Factory` 実装を提供する必要があります。
`receiver.Factory` インターフェイスは Collector プロジェクト内の [receiver/receiver.go](<https://github.com/open-telemetry/opentelemetry-collector/blob/v{{% param vers %}}/receiver/receiver.go#L58>) ファイルで定義されていますが、正しい実装方法は `go.opentelemetry.io/collector/receiver` パッケージで利用可能な関数を使用することです。

`factory.go` という名前のファイルを作成します。

```sh
touch tailtracer/factory.go
```

次に、慣例に従って `tailtracer` ファクトリのインスタンス化を担当する `NewFactory()` という名前の関数を追加しましょう。
`factory.go` ファイルに次のコードを追加してください。

```go
package tailtracer

import (
	"go.opentelemetry.io/collector/receiver"
)

// NewFactory は tailtracer レシーバーのファクトリを作成します。
func NewFactory() receiver.Factory {
	return nil
}
```

`tailtracer` レシーバーファクトリをインスタンス化するには、`receiver` パッケージの次の関数を使用します。

```go
func NewFactory(cfgType component.Type, createDefaultConfig component.CreateDefaultConfigFunc, options ...FactoryOption) Factory
```

`receiver.NewFactory()` は `receiver.Factory` をインスタンス化して返し、次のパラメーターが必要です。

- `component.Type`: すべての Collector コンポーネント間でレシーバーを一意に識別する文字列。

- `component.CreateDefaultConfigFunc`: レシーバーの `component.Config` インスタンスを返す関数への参照。

- `...FactoryOption`: レシーバーが処理できるシグナルの種類を決定する `receiver.FactoryOption` のスライス。

`receiver.NewFactory()` に必要なすべてのパラメーターをサポートするコードを実装しましょう。

## デフォルト設定の識別と提供 {#identifying-and-providing-default-settings}

前述の通り、`tailtracer` レシーバーの `interval` 設定はオプションです。
デフォルト設定の一部として使用できるように、デフォルト値を提供する必要があります。

`factory.go` ファイルに次のコードを追加してください。

```go
var (
	typeStr         = component.MustNewType("tailtracer")
)

const (
	defaultInterval = 1 * time.Minute
)
```

デフォルト設定については、`tailtracer` レシーバーのデフォルト設定を保持する `component.Config` を返す関数を追加するだけです。

それを実現するために、`factory.go` ファイルに次のコードを追加してください。

```go
func createDefaultConfig() component.Config {
	return &Config{
		Interval: string(defaultInterval),
	}
}
```

これら 2 つの変更の後、いくつかのインポートが不足していることに気づくでしょう。
適切なインポートを含めた `factory.go` ファイルは次のようになります。

> tailtracer/factory.go

```go
package tailtracer

import (
	"time"

	"go.opentelemetry.io/collector/component"
	"go.opentelemetry.io/collector/receiver"
)

var (
	typeStr         = component.MustNewType("tailtracer")
)

const (
	defaultInterval = 1 * time.Minute
)

func createDefaultConfig() component.Config {
	return &Config{
		Interval: string(defaultInterval),
	}
}

// NewFactory は tailtracer レシーバーのファクトリを作成します。
func NewFactory() receiver.Factory {
	return nil
}
```

> [!NOTE] 作業内容の確認
>
> - defaultInterval の time.Duration 型をサポートするために `time` パッケージをインポートしました。
> - `component.Config` が宣言されている `go.opentelemetry.io/collector/component` パッケージをインポートしました。
> - `receiver.Factory` が宣言されている `go.opentelemetry.io/collector/receiver` パッケージをインポートしました。
> - レシーバーの `Interval` 設定のデフォルト値を表す `defaultInterval` という `time.Duration` 定数を追加しました。
>   デフォルト値を 1 分に設定するため、値として `1 * time.Minute` を代入しています。
> - `component.Config` 実装を返す `createDefaultConfig` という関数を追加しました。
>   この場合、`tailtracer.Config` 構造体のインスタンスが返されます。
> - `tailtracer.Config.Interval` フィールドは `defaultInterval` 定数で初期化されました。

## レシーバーの機能の指定 {#specifying-the-receivers-capabilities}

レシーバーコンポーネントはトレース、メトリクス、ログを処理できます。
レシーバーのファクトリは、レシーバーが提供する機能を指定する責任があります。

トレーシングがこのチュートリアルの主題であるため、`tailtracer` レシーバーをトレースのみで動作するようにします。
`receiver` パッケージは、ファクトリがトレース処理機能を記述するために以下の関数と型を提供しています。

```go
func WithTraces(createTracesReceiver CreateTracesFunc, sl component.StabilityLevel) FactoryOption
```

`receiver.WithTraces()` は `receiver.FactoryOption` をインスタンス化して返し、次のパラメーターが必要です。

- `createTracesReceiver`: `receiver.CreateTracesFunc` 型に一致する関数への参照。
  `receiver.CreateTracesFunc` 型は、`receiver.Traces` インスタンスをインスタンス化して返す関数へのポインターであり、次のパラメーターが必要です。
  - `context.Context`: Collector の `context.Context` への参照。トレースレシーバーが実行コンテキストを適切に管理できるようにします。
  - `receiver.Settings`: レシーバーが作成される Collector 設定の一部への参照。
  - `component.Config`: Collector がファクトリに渡すレシーバー設定への参照。Collector 設定から適切に読み取れるようにします。
  - `consumer.Traces`: パイプライン内の次の `consumer.Traces` への参照。受信したトレースが送られる先です。
    これはプロセッサーまたはエクスポーターです。

`receiver.CreateTracesFunc` 関数ポインターを適切に実装するためのブートストラップコードを追加することから始めます。
`factory.go` ファイルに次のコードを追加してください。

```go
func createTracesReceiver(_ context.Context, params receiver.Settings, baseCfg component.Config, consumer consumer.Traces) (receiver.Traces, error) {
	return nil, nil
}
```

これで `receiver.NewFactory` 関数を使用してレシーバーファクトリを正常にインスタンス化するために必要なすべてのコンポーネントが揃いました。
`factory.go` ファイルの `NewFactory()` 関数を次のように更新してください。

```go
// NewFactory は tailtracer レシーバーのファクトリを作成します。
func NewFactory() receiver.Factory {
	return receiver.NewFactory(
		typeStr,
		createDefaultConfig,
		receiver.WithTraces(createTracesReceiver, component.StabilityLevelAlpha))
}
```

これらの変更の後、いくつかのインポートが不足していることに気づくでしょう。
適切なインポートを含めた `factory.go` ファイルは次のようになります。

> tailtracer/factory.go

```go
package tailtracer

import (
	"context"
	"time"

	"go.opentelemetry.io/collector/component"
	"go.opentelemetry.io/collector/consumer"
	"go.opentelemetry.io/collector/receiver"
)

var (
	typeStr         = component.MustNewType("tailtracer")
)

const (
	defaultInterval = 1 * time.Minute
)

func createDefaultConfig() component.Config {
	return &Config{
		Interval: string(defaultInterval),
	}
}

func createTracesReceiver(_ context.Context, params receiver.Settings, baseCfg component.Config, consumer consumer.Traces) (receiver.Traces, error) {
	return nil, nil
}

// NewFactory は tailtracer レシーバーのファクトリを作成します。
func NewFactory() receiver.Factory {
	return receiver.NewFactory(
		typeStr,
		createDefaultConfig,
		receiver.WithTraces(createTracesReceiver, component.StabilityLevelAlpha))
}
```

> [!NOTE] 作業内容の確認
>
> - `createTracesReceiver` 関数で参照される `context.Context` 型をサポートするために `context` パッケージをインポートしました。
> - `createTracesReceiver` 関数で参照される `consumer.Traces` 型をサポートするために `go.opentelemetry.io/collector/consumer` パッケージをインポートしました。
> - `NewFactory()` 関数を更新し、必要なパラメーターを指定した `receiver.NewFactory()` 呼び出しで生成された `receiver.Factory` を返すようにしました。
>   生成されたレシーバーファクトリは、`receiver.WithTraces(createTracesReceiver, component.StabilityLevelAlpha)` の呼び出しによりトレースを処理できるようになります。

## レシーバーコンポーネントの実装 {#implementing-the-receiver-component}

すべてのレシーバー API は現在、Collector プロジェクトの [receiver/receiver.go](<https://github.com/open-telemetry/opentelemetry-collector/blob/v{{% param vers %}}/receiver/receiver.go>) ファイルで宣言されています。
ファイルを開いて、すべてのインターフェイスを一通り確認してください。

`receiver.Traces`（およびその兄弟の `receiver.Metrics` と `receiver.Logs`）は、この時点では `component.Component` から「継承」されたメソッド以外に特定のメソッドを記述していないことに注目してください。

奇妙に感じるかもしれませんが、Collector API は拡張可能であることを意図していることを思い出してください。
コンポーネントとそのシグナルはさまざまな方法で進化する可能性があるため、これらのインターフェイスの役割はそれをサポートするために存在しています。

`receiver.Traces` を作成するには、`component.Component` インターフェイスで記述されている以下のメソッドを実装する必要があります。

```go
Start(ctx context.Context, host Host) error
Shutdown(ctx context.Context) error
```

両方のメソッドは、Collector がライフサイクルの一部としてコンポーネントと通信するために使用するイベントハンドラーとして機能します。

`Start()` メソッドは、Collector がコンポーネントに処理の開始を伝えるシグナルを表します。
イベントの一部として、Collector は以下の情報を渡します。

- `context.Context`: ほとんどの場合、レシーバーは長時間実行される操作を処理するため、このコンテキストを無視して context.Background() から新しいコンテキストを作成することを推奨します。
- `Host`: ホストは、レシーバーが起動して実行された後に Collector ホストと通信できるようにするためのものです。

`Shutdown()` メソッドは、Collector がコンポーネントにサービスがシャットダウンされることを伝えるシグナルを表します。
コンポーネントは処理を停止し、必要なクリーンアップ作業を行う必要があります。

- `context.Context`: シャットダウン操作の一部として Collector が渡すコンテキスト。

`tailtracer` フォルダに `trace-receiver.go` という新しいファイルを作成して実装を開始します。

```sh
touch tailtracer/trace-receiver.go
```

そして、`tailtracerReceiver` という型の宣言を次のように追加します。

```go
type tailtracerReceiver struct{

}
```

`tailtracerReceiver` 型ができたので、`Start()` と `Shutdown()` メソッドを実装して、レシーバー型が `receiver.Traces` インターフェイスに準拠するようにします。

> tailtracer/trace-receiver.go

```go
package tailtracer

import (
	"context"
	"go.opentelemetry.io/collector/component"
)

type tailtracerReceiver struct {
}

func (tailtracerRcvr *tailtracerReceiver) Start(ctx context.Context, host component.Host) error {
	return nil
}

func (tailtracerRcvr *tailtracerReceiver) Shutdown(ctx context.Context) error {
	return nil
}
```

> [!NOTE] 作業内容の確認
>
> - `Context` 型と関数が宣言されている `context` パッケージをインポートしました。
> - `Host` 型が宣言されている `go.opentelemetry.io/collector/component` パッケージをインポートしました。
> - `receiver.Traces` インターフェースに準拠するために `Start(ctx context.Context, host component.Host)` メソッドのブートストラップ実装を追加しました。
> - `receiver.Traces` インターフェースに準拠するために `Shutdown(ctx context.Context)` メソッドのブートストラップ実装を追加しました。

`Start()` メソッドは、レシーバーが処理操作の一部として保持する必要がある 2 つの参照（`context.Context` と `component.Host`）を渡しています。

`context.Context` の参照は、レシーバーの処理操作をサポートする新しいコンテキストの作成に使用する必要があります。
`Shutdown()` メソッドの一部としてコンテキストを適切に終了できるよう、コンテキストのキャンセルを処理する最適な方法を決定する必要があります。

`component.Host` はレシーバーのライフサイクル全体で役立つ可能性があるため、`tailtracerReceiver` 型にその参照を保持しましょう。

上記で提案された参照を保持するフィールドを含めた後の `tailtracerReceiver` 型宣言は次のようになります。

```go
type tailtracerReceiver struct {
	host   component.Host
	cancel context.CancelFunc
}
```

次に、レシーバーが独自の処理コンテキストを適切に初期化し、キャンセル関数を `cancel` フィールドに保持し、`host` フィールドの値を初期化できるように `Start()` メソッドを更新する必要があります。
また、`cancel` 関数を呼び出してコンテキストを終了するように `Stop()` メソッドも更新します。

変更を加えた後の `trace-receiver.go` ファイルは次のようになります。

> tailtracer/trace-receiver.go

```go
package tailtracer

import (
	"context"
	"go.opentelemetry.io/collector/component"
)

type tailtracerReceiver struct {
	host   component.Host
	cancel context.CancelFunc
}

func (tailtracerRcvr *tailtracerReceiver) Start(ctx context.Context, host component.Host) error {
	tailtracerRcvr.host = host
	ctx = context.Background()
	ctx, tailtracerRcvr.cancel = context.WithCancel(ctx)

	return nil
}

func (tailtracerRcvr *tailtracerReceiver) Shutdown(ctx context.Context) error {
	if tailtracerRcvr.cancel != nil {
		tailtracerRcvr.cancel()
	}
	return nil
}
```

> [!NOTE] 作業内容の確認
>
> Collector から渡された `component.Host` 参照で `host` フィールドの初期化を追加して `Start()` メソッドを更新しました。
>
> - `context.Background()` で作成した新しいコンテキストに基づくキャンセルで `cancel` 関数フィールドを設定しました（Collector API のドキュメントの提案に従って）。
> - `cancel()` コンテキストキャンセル関数の呼び出しを追加して `Shutdown()` メソッドを更新しました。

## レシーバーのファクトリから渡される情報の保持 {#keeping-information-passed-by-the-receivers-factory}

`receiver.Traces` インターフェイスのメソッドを実装したので、`tailtracer` レシーバーコンポーネントはファクトリによってインスタンス化されて返される準備ができました。

`tailtracer/factory.go` ファイルを開き、`createTracesReceiver()` 関数に移動します。
ファクトリは `createTracesReceiver()` 関数のパラメーターの一部として、レシーバーが適切に動作するために必要な参照を渡すことに注目してください。
これには、設定（`component.Config`）、パイプライン内で生成されたトレースを消費する次の `Consumer`（`consumer.Traces`）、Collector ロガーが含まれます。
これにより `tailtracer` レシーバーはそこに意味のあるイベントを追加できます（`receiver.Settings`）。

これらすべての情報はファクトリによってインスタンス化される瞬間にのみレシーバーに提供されるため、`tailtracerReceiver` 型にはその情報を保持し、ライフサイクルの他の段階で使用するためのフィールドが必要です。

更新された `tailtracerReceiver` 型宣言を含む `trace-receiver.go` ファイルは次のようになります。

> tailtracer/trace-receiver.go

```go
package tailtracer

import (
	"context"
	"time"
	"go.opentelemetry.io/collector/component"
	"go.opentelemetry.io/collector/consumer"
	"go.uber.org/zap"
)

type tailtracerReceiver struct {
	host         component.Host
	cancel       context.CancelFunc
	logger       *zap.Logger
	nextConsumer consumer.Traces
	config       *Config
}

func (tailtracerRcvr *tailtracerReceiver) Start(ctx context.Context, host component.Host) error {
	tailtracerRcvr.host = host
	ctx = context.Background()
	ctx, tailtracerRcvr.cancel = context.WithCancel(ctx)

	interval, _ := time.ParseDuration(tailtracerRcvr.config.Interval)
	go func() {
		ticker := time.NewTicker(interval)
		defer ticker.Stop()

		for {
			select {
				case <-ticker.C:
					tailtracerRcvr.logger.Info("I should start processing traces now!")
				case <-ctx.Done():
					return
			}
		}
	}()

	return nil
}

func (tailtracerRcvr *tailtracerReceiver) Shutdown(ctx context.Context) error {
	if tailtracerRcvr.cancel != nil {
		tailtracerRcvr.cancel()
	}
	return nil
}
```

> [!NOTE] 作業内容の確認
>
> - パイプラインのコンシューマー型とインターフェースが宣言されている `go.opentelemetry.io/collector/consumer` をインポートしました。
> - Collector がデバッグ機能に使用する `go.uber.org/zap` パッケージをインポートしました。
> - レシーバー内から Collector ロガー参照にアクセスできるように、`logger` という名前の `zap.Logger` フィールドを追加しました。
> - `tailtracer` レシーバーが生成したトレースを Collector パイプラインで宣言された次のコンシューマーにプッシュできるように、`nextConsumer` という名前の `consumer.Traces` フィールドを追加しました。
> - Collector の設定で定義されたレシーバーの設定にアクセスできるように、`config` という名前の `Config` フィールドを追加しました。
> - `tailtracer` レシーバーの `interval` 設定の値に基づいて `time.Duration` として初期化される `interval` という変数を追加しました。Collector の設定で定義されています。
> - `ticker` メカニズムを実装する `go func()` を追加しました。`ticker` が `interval` 変数で指定された時間に達するたびにレシーバーがトレースを生成できるようにします。
> - レシーバーがトレースを生成すべきタイミングごとに info メッセージを生成するために `tailtracerRcvr.logger` フィールドを使用しました。

`tailtracerReceiver` 型はインスタンス化される準備ができ、ファクトリから渡されるすべての意味のある情報を保持します。

`tailtracer/factory.go` ファイルを開き、`createTracesReceiver()` 関数に移動します。

レシーバーはパイプラインのコンポーネントとして宣言されている場合にのみインスタンス化され、ファクトリはパイプライン内の次のコンシューマー（プロセッサーまたはエクスポーター）が有効であることを確認する責任があります。
そうでない場合は、エラーを生成する必要があります。

`createTracesReceiver()` 関数にはその検証のためのガード句が必要です。

また、`tailtracerReceiver` インスタンスの `config` と `logger` フィールドを適切に初期化するための変数も必要です。

更新された `createTracesReceiver()` 関数を含む `factory.go` ファイルは次のようになります。

> tailtracer/factory.go

```go
package tailtracer

import (
	"context"
	"time"

	"go.opentelemetry.io/collector/component"
	"go.opentelemetry.io/collector/consumer"
	"go.opentelemetry.io/collector/receiver"
)

var (
	typeStr         = component.MustNewType("tailtracer")
)

const (
	defaultInterval = 1 * time.Minute
)

func createDefaultConfig() component.Config {
	return &Config{
		Interval: string(defaultInterval),
	}
}

func createTracesReceiver(_ context.Context, params receiver.Settings, baseCfg component.Config, consumer consumer.Traces) (receiver.Traces, error) {

	logger := params.Logger
	tailtracerCfg := baseCfg.(*Config)

	traceRcvr := &tailtracerReceiver{
		logger:       logger,
		nextConsumer: consumer,
		config:       tailtracerCfg,
	}

	return traceRcvr, nil
}

// NewFactory は tailtracer レシーバーのファクトリを作成します。
func NewFactory() receiver.Factory {
	return receiver.NewFactory(
		typeStr,
		createDefaultConfig,
		receiver.WithTraces(createTracesReceiver, component.StabilityLevelAlpha))
}
```

> [!NOTE] 作業内容の確認
>
> - `receiver.Settings` 参照の `Logger` という名前のフィールドで利用可能な Collector ロガーで初期化された `logger` という変数を追加しました。
> - `component.Config` 参照を `tailtracer` レシーバーの `Config` にキャストして初期化された `tailtracerCfg` という変数を追加しました。
> - 変数に格納されたファクトリ情報を使用して `tailtracerReceiver` インスタンスで初期化された `traceRcvr` という変数を追加しました。
> - `traceRcvr` インスタンスを含むように return 文を更新しました。

ここまでで、レシーバーのスケルトンは完全に実装されました。

## レシーバーを使用した Collector 初期化プロセスの更新 {#updating-the-collector-initialization-process-with-the-receiver}

レシーバーが Collector パイプラインに参加するために、生成された `otelcol-dev/components.go` ファイルにいくつかの更新を行う必要があります。
このファイルですべての Collector コンポーネントが登録されインスタンス化されます。

`tailtracer` レシーバーファクトリインスタンスを `factories` マップに追加して、Collector が初期化プロセスの一部として適切にロードできるようにする必要があります。

それをサポートするための変更を加えた後の `components.go` ファイルは次のようになります。

> otelcol-dev/components.go

```go
// Code generated by "go.opentelemetry.io/collector/cmd/builder". DO NOT EDIT.

package main

import (
	"go.opentelemetry.io/collector/exporter"
	"go.opentelemetry.io/collector/extension"
	"go.opentelemetry.io/collector/otelcol"
	"go.opentelemetry.io/collector/processor"
	"go.opentelemetry.io/collector/receiver"
	debugexporter "go.opentelemetry.io/collector/exporter/debugexporter"
	otlpexporter "go.opentelemetry.io/collector/exporter/otlpexporter"
	otlpreceiver "go.opentelemetry.io/collector/receiver/otlpreceiver"
	tailtracer "github.com/open-telemetry/opentelemetry-tutorials/trace-receiver/tailtracer" // 新しく追加した行
)

func components() (otelcol.Factories, error) {
	var err error
	factories := otelcol.Factories{}

	factories.Extensions, err = otelcol.MakeFactoryMap[extension.Factory](
	)
	if err != nil {
		return otelcol.Factories{}, err
	}

	factories.Receivers, err = otelcol.MakeFactoryMap[receiver.Factory](
		otlpreceiver.NewFactory(),
		tailtracer.NewFactory(), // 新しく追加した行
	)
	if err != nil {
		return otelcol.Factories{}, err
	}

	factories.Exporters, err = otelcol.MakeFactoryMap[exporter.Factory](
		debugexporter.NewFactory(),
		otlpexporter.NewFactory(),
	)
	if err != nil {
		return otelcol.Factories{}, err
	}

	factories.Processors, err = otelcol.MakeFactoryMap[processor.Factory](
	)
	if err != nil {
		return otelcol.Factories{}, err
	}

	return factories, nil
}
```

> [!NOTE] 作業内容の確認
>
> - レシーバーの型と関数がある `github.com/open-telemetry/opentelemetry-tutorials/trace-receiver/tailtracer` レシーバーモジュールをインポートしました。
> - `tailtracer` レシーバーファクトリが `factories` マップに適切に追加されるように、`otelcol.MakeFactoryMap()` 呼び出しのパラメーターとして `tailtracer.NewFactory()` への呼び出しを追加しました。

## レシーバーの実行とデバッグ {#running-and-debugging-the-receiver}

Collector の `config.yaml` が、パイプラインで使用されるレシーバーの 1 つとして `tailtracer` レシーバーが設定されて適切に更新されていることを確認します。

> config.yaml

```yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
  tailtracer: # この行はレシーバーの ID を表します
    interval: 1m
    number_of_traces: 1

exporters:
  debug:
    verbosity: detailed
  otlp/jaeger:
    endpoint: localhost:14317
    tls:
      insecure: true
    sending_queue:
      batch:

service:
  pipelines:
    traces:
      receivers: [otlp, tailtracer]
      exporters: [otlp/jaeger, debug]
  telemetry:
    logs:
      level: debug
```

`otelcol-dev/components.go` ファイルにコード変更があったため、以前生成した `./otelcol-dev/otelcol-dev` バイナリファイルのかわりに `go run` コマンドを使用して更新された Collector を起動しましょう。

```sh
go run ./otelcol-dev --config config.yaml
```

出力は次のようになります。

```log
2023-11-08T21:38:36.621+0800	info	service@v0.88.0/telemetry.go:84	Setting up own telemetry...
2023-11-08T21:38:36.621+0800	info	service@v0.88.0/telemetry.go:201	Serving Prometheus metrics	{"address": ":8888", "level": "Basic"}
2023-11-08T21:38:36.621+0800	info	exporter@v0.88.0/exporter.go:275	Development component. May change in the future.	{"kind": "exporter", "data_type": "traces", "name": "debug"}
2023-11-08T21:38:36.621+0800	debug	exporter@v0.88.0/exporter.go:273	Stable component.	{"kind": "exporter", "data_type": "traces", "name": "otlp/jaeger"}
2023-11-08T21:38:36.621+0800	debug	receiver@v0.88.0/receiver.go:294	Stable component.	{"kind": "receiver", "name": "otlp", "data_type": "traces"}
2023-11-08T21:38:36.621+0800	debug	receiver@v0.88.0/receiver.go:294	Alpha component. May change in the future.	{"kind": "receiver", "name": "tailtracer", "data_type": "traces"}
2023-11-08T21:38:36.622+0800	info	service@v0.88.0/service.go:143	Starting otelcol-dev...	{"Version": "1.0.0", "NumCPU": 10}
2023-11-08T21:38:36.622+0800	info	extensions/extensions.go:33	Starting extensions...

<OMITTED>

2023-11-08T21:38:36.636+0800	info	zapgrpc/zapgrpc.go:178	[core] [Channel #1] Channel Connectivity change to READY	{"grpc_log": true}
2023-11-08T21:39:36.626+0800	info	tailtracer/trace-receiver.go:33	I should start processing traces now!	{"kind": "receiver", "name": "tailtracer", "data_type": "traces"}
2023-11-08T21:40:36.626+0800	info	tailtracer/trace-receiver.go:33	I should start processing traces now!	{"kind": "receiver", "name": "tailtracer", "data_type": "traces"}
...
```

ログからわかるように、`tailtracer` は正常に初期化されました。
毎分、`tailtracer/trace-receiver.go` のダミー ticker によってトリガーされる `I should start processing traces now!` というメッセージが表示されます。

> [!TIP]
>
> プロセスを停止するには Collector ターミナルで <kbd>Ctrl + C</kbd> を押してください。

さらに、通常の Go プロジェクトをデバッグするのと同様に、お好みの IDE を使用してレシーバーをデバッグできます。
以下は [Visual Studio Code](https://code.visualstudio.com/) 用のシンプルな `launch.json` ファイルの参考例です。

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Launch otelcol-dev",
      "type": "go",
      "request": "launch",
      "mode": "auto",
      "program": "${workspaceFolder}/otelcol-dev",
      "args": ["--config", "${workspaceFolder}/config.yaml"]
    }
  ]
}
```

大きなマイルストーンとして、現在のフォルダ構造を確認しましょう。

```console
.
├── builder-config.yaml
├── config.yaml
├── go.work
├── go.work.sum
├── ocb
├── otelcol-dev
│   ├── components.go
│   ├── components_test.go
│   ├── go.mod
│   ├── go.sum
│   ├── main.go
│   ├── main_others.go
│   ├── main_windows.go
│   └── otelcol-dev
└── tailtracer
    ├── config.go
    ├── factory.go
    ├── go.mod
    └── trace-receiver.go
```

次のセクションでは、`tailtracer` レシーバーがようやく意味のあるトレースを生成できるように、OpenTelemetry トレースデータモデルについて詳しく学びます！

## Collector トレースデータモデル {#the-collector-trace-data-model}

SDK を使用し、アプリケーションを計装して Jaeger のような分散トレーシングバックエンドでトレースを観察・評価することで、OpenTelemetry トレースに馴染みがあるかもしれません。

以下は Jaeger でのトレースの表示例です。

![Jaeger trace](/img/docs/tutorials/Jaeger.jpeg)

これは Jaeger のトレースですが、Collector のトレースパイプラインによって生成されたものです。
これにより、OTel トレースデータモデルについていくつかのことが理解できます。

- トレースは、依存関係を表す階層構造で構成された 1 つ以上のスパンで構成されます。
- スパンは、サービス内および/またはサービス間の操作を表すことができます。

トレースレシーバーでのトレース作成は SDK で行う場合とは若干異なりますので、高レベルの概念を確認することから始めましょう。

### リソースの操作 {#working-with-resources}

OTel の世界では、すべてのテレメトリーは `Resource` によって生成されます。
以下は [OTel 仕様](/docs/specs/otel/resource/sdk)による定義です。

> `Resource` は、テレメトリーを生成するエンティティの属性としての不変な表現です。
> たとえば、Kubernetes 上のコンテナで実行されているテレメトリーを生成するプロセスには Pod 名があり、名前空間で実行され、独自の名前を持つ Deployment の一部である場合があります。
> これら 3 つの属性すべてを `Resource` に含めることができます。

トレースは最も一般的にサービスリクエスト（Jaeger のモデルで記述される Services エンティティ）を表すために使用されます。
これは通常、コンピュートユニットで実行されるプロセスとして実装されます。
しかし、OTel の API による属性を通じた `Resource` の記述方法は、ATM、IoT センサーなど、必要な任意のエンティティを表現するのに十分な柔軟性があります。

したがって、トレースが存在するためには `Resource` がそれを開始する必要があるといえます。

このチュートリアルでは、2 つの異なる州（たとえばイリノイ州とカリフォルニア州）にある ATM が Account のバックエンドシステムにアクセスして残高照会、入金、引き出しの操作を実行するテレメトリーを示すシステムをシミュレートします。
これを実現するために、ATM とバックエンドシステムを表す `Resource` 型を作成するコードを実装します。

`tailtracer` フォルダ内に `model.go` という名前のファイルを作成してください。

```sh
touch tailtracer/model.go
```

次に、`model.go` ファイルで `Atm` と `BackendSystem` 型の定義を次のように追加します。

> tailtracer/model.go

```go
package tailtracer

type Atm struct{
	ID           int64
	Version      string
	Name         string
	StateID      string
	SerialNumber string
	ISPNetwork   string
}

type BackendSystem struct{
	Version       string
	ProcessName   string
	OSType        string
	OSVersion     string
	CloudProvider string
	CloudRegion   string
	Endpoint      string
}
```

これらの型は、観測対象のシステムに表示されるエンティティを表すことを目的としています。
`Resource` 定義の一部としてトレースに追加すると非常に意味のある情報を含んでいます。
これらの型のインスタンスを生成するヘルパー関数を追加します。

ヘルパー関数を追加した後の `model.go` ファイルは次のようになります。

> tailtracer/model.go

```go
package tailtracer

import (
	"math/rand"
)

type Atm struct{
	ID           int64
	Version      string
	Name         string
	StateID      string
	SerialNumber string
	ISPNetwork   string
}

type BackendSystem struct{
	Version       string
	ProcessName   string
	OSType        string
	OSVersion     string
	CloudProvider string
	CloudRegion   string
	Endpoint      string
}

func generateAtm() Atm{
	i := getRandomNumber(1, 2)
	var newAtm Atm

	switch i {
		case 1:
			newAtm = Atm{
				ID: 111,
				Name: "ATM-111-IL",
				SerialNumber: "atmxph-2022-111",
				Version: "v1.0",
				ISPNetwork: "comcast-chicago",
				StateID: "IL",

			}

		case 2:
			newAtm = Atm{
				ID: 222,
				Name: "ATM-222-CA",
				SerialNumber: "atmxph-2022-222",
				Version: "v1.0",
				ISPNetwork: "comcast-sanfrancisco",
				StateID: "CA",
			}
	}

	return newAtm
}

func generateBackendSystem() BackendSystem{
	i := getRandomNumber(1, 3)

	newBackend := BackendSystem{
		ProcessName: "accounts",
		Version: "v2.5",
		OSType: "lnx",
		OSVersion: "4.16.10-300.fc28.x86_64",
		CloudProvider: "amzn",
		CloudRegion: "us-east-2",
	}

	switch i {
		case 1:
		 	newBackend.Endpoint = "api/v2.5/balance"
		case 2:
		  	newBackend.Endpoint = "api/v2.5/deposit"
		case 3:
			newBackend.Endpoint = "api/v2.5/withdrawn"

	}

	return newBackend
}

func getRandomNumber(min int, max int) int {
	i := (rand.Intn(max - min + 1) + min)
	return i
}
```

> [!NOTE] 作業内容の確認
>
> - `generateRandomNumber` 関数の実装をサポートするために `math/rand` パッケージをインポートしました。
> - `Atm` 型をインスタンス化し、`StateID` の値としてイリノイ州またはカリフォルニア州をランダムに割り当て、対応する `ISPNetwork` の値も設定する `generateAtm` 関数を追加しました。
> - `BackendSystem` 型のインスタンスを作成し、`Endpoint` フィールドにサービスエンドポイント値をランダムに割り当てる `generateBackendSystem` 関数を追加しました。
> - 指定された範囲内でランダムな数値を生成する `generateRandomNumber` 関数を追加しました。

テレメトリーを生成するエンティティを表すオブジェクトインスタンスを生成する関数ができたので、OTel Collector の世界でこれらのエンティティを表現する準備ができました。

Collector API は `pdata` パッケージの下にネストされた `ptrace` というパッケージを提供しています。
これには、Collector パイプラインコンポーネントでトレースを操作するために必要なすべての型、インターフェイス、ヘルパー関数が含まれています。

`tailtracer/model.go` ファイルを開き、`ptrace` パッケージの機能にアクセスできるように `import` 句に `go.opentelemetry.io/collector/pdata/ptrace` を追加してください。

`Resource` を定義する前に、Collector パイプラインを介してトレースを伝搬する `ptrace.Traces` を作成する必要があります。
ヘルパー関数 `ptrace.NewTraces()` を使用してインスタンス化できます。
トレースに関わるテレメトリーソースを表すデータを持つために、`Atm` と `BackendSystem` 型のインスタンスも作成する必要があります。

`tailtracer/model.go` ファイルを開き、次の関数を追加してください。

```go
func generateTraces(numberOfTraces int) ptrace.Traces{
	traces := ptrace.NewTraces()

	for i := 0; i < numberOfTraces; i++{
		newAtm := generateAtm()
		newBackendSystem := generateBackendSystem()
	}

	return traces
}
```

ここまでで、トレースがスパンで構成されることについて十分に聞いたり読んだりしてきたはずです。
SDK の関数と型を使用して計装コードを書いたことがあるかもしれません。
しかし、Collector API でのトレース作成には他の種類の「スパン」が関わっていることをご存じないかもしれません。

まず `ptrace.ResourceSpans` という型から始めます。
これはリソースと、トレースに参加している間にそのリソースが発生させたまたは受信したすべての操作を表します。
その定義は [/pdata/ptrace/generated_resourcespans.go](<https://github.com/open-telemetry/opentelemetry-collector/blob/v{{% param vers %}}/pdata/ptrace/generated_resourcespans.go>) ファイルにあります。

`ptrace.Traces` には `ResourceSpans()` というメソッドがあり、`ptrace.ResourceSpansSlice` というヘルパー型のインスタンスを返します。
`ptrace.ResourceSpansSlice` 型には `ptrace.ResourceSpans` の配列を扱うためのメソッドがあります。
配列には、トレースで表されるリクエストに参加している `Resource` エンティティの数と同じ数のアイテムが含まれます。

`ptrace.ResourceSpansSlice` には `AppendEmpty()` というメソッドがあり、新しい `ptrace.ResourceSpan` を配列に追加してその参照を返します。

`ptrace.ResourceSpan` のインスタンスを取得したら、`Resource()` というメソッドを使用して `ResourceSpan` に関連付けられた `pcommon.Resource` のインスタンスを返します。

次の変更を加えて `generateTrace()` 関数を更新してください。

- `ResourceSpan` を表す `resourceSpan` という変数を追加する。
- `ResourceSpan` に関連付けられた `pcommon.Resource` を表す `atmResource` という変数を追加する。
- 上記のメソッドを使用して、それぞれの変数を初期化する。

変更を実装した後の関数は次のようになります。

```go
func generateTraces(numberOfTraces int) ptrace.Traces{
	traces := ptrace.NewTraces()

	for i := 0; i < numberOfTraces; i++{
		newAtm := generateAtm()
		newBackendSystem := generateBackendSystem()

		resourceSpan := traces.ResourceSpans().AppendEmpty()
		atmResource := resourceSpan.Resource()
	}

	return traces
}
```

> [!NOTE] 作業内容の確認
>
> - `traces.ResourceSpans().AppendEmpty()` 呼び出しで返された `ResourceSpan` 参照で初期化された `resourceSpan` 変数を追加しました。
> - `resourceSpan.Resource()` 呼び出しで返された `pcommon.Resource` 参照で初期化された `atmResource` 変数を追加しました。

### 属性によるリソースの記述 {#describing-resources-through-attributes}

Collector API は `pdata` パッケージの下にネストされた `pcommon` というパッケージを提供しています。
`Resource` を記述するために必要なすべての型とヘルパー関数が含まれています。

Collector のコンテキストでは、`Resource` は `pcommon.Map` 型で表されるキー/値ペア形式の属性によって記述されます。

`pcommon.Map` 型の定義とサポートされている形式で属性値を作成するための関連ヘルパー関数については、Collector の GitHub プロジェクト内の [/pdata/pcommon/map.go](<https://github.com/open-telemetry/opentelemetry-collector/blob/v{{% param vers %}}/pdata/pcommon/map.go>) ファイルを参照してください。

キー/値ペアは、`Resource` データをモデル化するための多くの柔軟性を提供します。
OTel 仕様には、表現する必要があるさまざまな種類のテレメトリー生成エンティティ間の整理と競合の最小化を支援するガイドラインがあります。

これらのガイドラインは[リソースセマンティック規約](/docs/specs/semconv/resource/)として知られ、OTel 仕様に文書化されています。

独自のテレメトリー生成エンティティを表す独自の属性を作成する場合は、仕様で提供されているガイドラインに従うべきです。

> 属性は、記述するコンセプトの種類によって論理的にグループ化されます。
> 同じグループの属性には、ドットで終わる共通のプレフィックスがあります。
> たとえば、Kubernetes のプロパティを記述するすべての属性は `k8s.` で始まります。

まず `tailtracer/model.go` ファイルを開き、`pcommon` パッケージの機能にアクセスできるように `import` 句に `go.opentelemetry.io/collector/pdata/pcommon` を追加してください。

次に、`Atm` インスタンスからフィールド値を読み取り、それらを属性（接頭辞「atm.」でグループ化）として `pcommon.Resource` インスタンスに書き込む関数を追加します。
関数は次のようになります。

```go
func fillResourceWithAtm(resource *pcommon.Resource, atm Atm){
   atmAttrs := resource.Attributes()
   atmAttrs.PutInt("atm.id", atm.ID)
   atmAttrs.PutStr("atm.stateid", atm.StateID)
   atmAttrs.PutStr("atm.ispnetwork", atm.ISPNetwork)
   atmAttrs.PutStr("atm.serialnumber", atm.SerialNumber)
}
```

> [!NOTE] 作業内容の確認
>
> - `resource.Attributes()` 呼び出しで返された `pcommon.Map` 参照で初期化された `atmAttrs` という変数を宣言しました。
> - 同等の `Atm` フィールド型に基づいて int と string の属性を追加するために `pcommon.Map` の `PutInt()` と `PutStr()` メソッドを使用しました。
>   これらの属性は `Atm` エンティティに固有でそれのみを表すため、すべて `atm.` プレフィックスでグループ化されています。

リソースセマンティック規約には、[コンピュートユニット](/docs/specs/semconv/resource/#compute-unit)、[環境](/docs/specs/semconv/resource/#compute-unit)など、異なるドメインにまたがって一般的で適用可能なテレメトリー生成エンティティを表すための規定的な属性名とよく知られた値もあります。

`BackendSystem` エンティティには、[オペレーティングシステム](/docs/specs/semconv/resource/os/)と[クラウド](/docs/specs/semconv/resource/cloud/)に関連する情報を表すフィールドがあります。
リソースセマンティック規約で指定された属性名と値を使用して、この情報をその `Resource` に表現します。

リソースセマンティック規約のキーとよく知られた値は、OpenTelemetry セマンティック規約パッケージ [`go.opentelemetry.io/otel/semconv/v1.38.0`](https://pkg.go.dev/go.opentelemetry.io/otel/semconv/v1.38.0) で定義されています。

`BackendSystem` インスタンスからフィールド値を読み取り、それらを属性として `pcommon.Resource` インスタンスに書き込む関数を作成しましょう。
`tailtracer/model.go` ファイルを開き、次の関数を追加してください。

```go
func fillResourceWithBackendSystem(resource *pcommon.Resource, backend BackendSystem){
	backendAttrs := resource.Attributes()
	var osType, cloudProvider string

	switch {
		case backend.CloudProvider == "amzn":
			cloudProvider = semconv.CloudProviderAWS.Value.AsString()
		case backend.CloudProvider == "mcrsft":
			cloudProvider = semconv.CloudProviderAzure.Value.AsString()
		case backend.CloudProvider == "gogl":
			cloudProvider = semconv.CloudProviderGCP.Value.AsString()
	}

	backendAttrs.PutStr(string(semconv.CloudProviderKey), cloudProvider)
	backendAttrs.PutStr(string(semconv.CloudRegionKey), backend.CloudRegion)

	switch {
		case backend.OSType == "lnx":
			osType = semconv.OSTypeLinux.Value.AsString()
		case backend.OSType == "wndws":
			osType = semconv.OSTypeWindows.Value.AsString()
		case backend.OSType == "slrs":
			osType = semconv.OSTypeSolaris.Value.AsString()
	}

	backendAttrs.PutStr(string(semconv.OSTypeKey), osType)
	backendAttrs.PutStr(string(semconv.OSVersionKey), backend.OSVersion)
 }
```

`Atm` と `BackendSystem` エンティティ名を表す「atm.name」や「backendsystem.name」という属性を `pcommon.Resource` に追加していないことに注目してください。
これは、OTel トレース仕様と互換性のあるほとんど（すべてではないにしても）の分散トレーシングバックエンドシステムが、トレースで記述された `pcommon.Resource` を `Service` として解釈するためです。
したがって、リソースセマンティック規約で規定されている `service.name` という必須属性を `pcommon.Resource` が持つことを期待しています。

`Atm` と `BackendSystem` エンティティの両方のバージョン情報を表すために、`service.version` という非必須属性も使用します。

「service.」グループ属性を適切に割り当てるコードを追加した後の `tailtracer/model.go` ファイルは次のようになります。

> tailtracer/model.go

```go
package tailtracer

import (
	"math/rand"
	"time"

	"go.opentelemetry.io/collector/pdata/pcommon"
	"go.opentelemetry.io/collector/pdata/ptrace"
	"go.opentelemetry.io/otel/semconv/v1.38.0"
)

type Atm struct {
	ID           int64
	Version      string
	Name         string
	StateID      string
	SerialNumber string
	ISPNetwork   string
}

type BackendSystem struct {
	Version       string
	ProcessName   string
	OSType        string
	OSVersion     string
	CloudProvider string
	CloudRegion   string
	Endpoint      string
}

func generateAtm() Atm {
	i := getRandomNumber(1, 2)
	var newAtm Atm

	switch i {
	case 1:
		newAtm = Atm{
			ID:           111,
			Name:         "ATM-111-IL",
			SerialNumber: "atmxph-2022-111",
			Version:      "v1.0",
			ISPNetwork:   "comcast-chicago",
			StateID:      "IL",
		}

	case 2:
		newAtm = Atm{
			ID:           222,
			Name:         "ATM-222-CA",
			SerialNumber: "atmxph-2022-222",
			Version:      "v1.0",
			ISPNetwork:   "comcast-sanfrancisco",
			StateID:      "CA",
		}
	}

	return newAtm
}

func generateBackendSystem() BackendSystem {
	i := getRandomNumber(1, 3)

	newBackend := BackendSystem{
		ProcessName:   "accounts",
		Version:       "v2.5",
		OSType:        "lnx",
		OSVersion:     "4.16.10-300.fc28.x86_64",
		CloudProvider: "amzn",
		CloudRegion:   "us-east-2",
	}

	switch i {
	case 1:
		newBackend.Endpoint = "api/v2.5/balance"
	case 2:
		newBackend.Endpoint = "api/v2.5/deposit"
	case 3:
		newBackend.Endpoint = "api/v2.5/withdrawn"
	}

	return newBackend
}

func getRandomNumber(min int, max int) int {
	i := (rand.Intn(max-min+1) + min)
	return i
}

func generateTraces(numberOfTraces int) ptrace.Traces {
	traces := ptrace.NewTraces()

	for i := 0; i < numberOfTraces; i++ {
		newAtm := generateAtm()
		newBackendSystem := generateBackendSystem()

		resourceSpan := traces.ResourceSpans().AppendEmpty()
		atmResource := resourceSpan.Resource()
		fillResourceWithAtm(&atmResource, newAtm)

		resourceSpan = traces.ResourceSpans().AppendEmpty()
		backendResource := resourceSpan.Resource()
		fillResourceWithBackendSystem(&backendResource, newBackendSystem)
	}

	return traces
}

func fillResourceWithAtm(resource *pcommon.Resource, atm Atm) {
	atmAttrs := resource.Attributes()
	atmAttrs.PutInt("atm.id", atm.ID)
	atmAttrs.PutStr("atm.stateid", atm.StateID)
	atmAttrs.PutStr("atm.ispnetwork", atm.ISPNetwork)
	atmAttrs.PutStr("atm.serialnumber", atm.SerialNumber)
	atmAttrs.PutStr(string(semconv.ServiceNameKey), atm.Name)
	atmAttrs.PutStr(string(semconv.ServiceVersionKey), atm.Version)

}

func fillResourceWithBackendSystem(resource *pcommon.Resource, backend BackendSystem) {
	backendAttrs := resource.Attributes()
	var osType, cloudProvider string

	switch {
	case backend.CloudProvider == "amzn":
		cloudProvider = semconv.CloudProviderAWS.Value.AsString()
	case backend.CloudProvider == "mcrsft":
		cloudProvider = semconv.CloudProviderAzure.Value.AsString()
	case backend.CloudProvider == "gogl":
		cloudProvider = semconv.CloudProviderGCP.Value.AsString()
	}

	backendAttrs.PutStr(string(semconv.CloudProviderKey), cloudProvider)
	backendAttrs.PutStr(string(semconv.CloudRegionKey), backend.CloudRegion)

	switch {
	case backend.OSType == "lnx":
		osType = semconv.OSTypeLinux.Value.AsString()
	case backend.OSType == "wndws":
		osType = semconv.OSTypeWindows.Value.AsString()
	case backend.OSType == "slrs":
		osType = semconv.OSTypeSolaris.Value.AsString()
	}

	backendAttrs.PutStr(string(semconv.OSTypeKey), osType)
	backendAttrs.PutStr(string(semconv.OSVersionKey), backend.OSVersion)

	backendAttrs.PutStr(string(semconv.ServiceNameKey), backend.ProcessName)
	backendAttrs.PutStr(string(semconv.ServiceVersionKey), backend.Version)
}
```

> [!NOTE] 作業内容の確認
>
> - `Atm` エンティティを表す `pcommon.Resource` に「service.name」と「service.version」属性を適切に割り当てる行を追加して `fillResourceWithAtm()` 関数を更新しました。
> - `BackendSystem` エンティティを表す `pcommon.Resource` に「service.name」と「service.version」属性を適切に割り当てる行を追加して `fillResourceWithBackendSystem()` 関数を更新しました。
> - `fillResourceWithAtm()` と `fillResourceWithBackendSystem()` 関数を使用して、`Atm` と `BackendSystem` エンティティの両方の属性情報で `pcommon.Resource` を適切にインスタンス化して埋める行を追加して `generateTraces` 関数を更新しました。

### スパンによる操作の表現 {#representing-operations-with-spans}

これで、適切な属性で埋められた各 `Resource` を持つ `ResourceSpan` インスタンスにより、`Atm` と `BackendSystem` エンティティを表現できるようになりました。
`ResourceSpan` 内のトレースの一部として各 `Resource` が実行する操作を表現する準備ができました。

OTel の世界では、システムがテレメトリーを生成するためには、手動または計装ライブラリを通じて自動的に計装される必要があります。

計装ライブラリは、トレースに参加する操作が発生するスコープ（計装スコープとしても知られる）を設定し、これらの操作をトレースのコンテキストでスパンとして記述する責任があります。

`pdata.ResourceSpans` には `ScopeSpans()` というメソッドがあり、`ptrace.ScopeSpansSlice` というヘルパー型のインスタンスを返します。
`ptrace.ScopeSpansSlice` 型には `ptrace.ScopeSpans` の配列を扱うためのメソッドがあります。
配列には、トレースのコンテキストで異なる計装スコープとそれが生成したスパンを表す `ptrace.ScopeSpan` の数と同じ数のアイテムが含まれます。

`ptrace.ScopeSpansSlice` には `AppendEmpty()` というメソッドがあり、新しい `ptrace.ScopeSpans` を配列に追加してその参照を返します。

ATM システムの計装スコープとそのスパンを表す `ptrace.ScopeSpans` をインスタンス化する関数を作成しましょう。
`tailtracer/model.go` ファイルを開き、次の関数を追加してください。

```go
func appendAtmSystemInstrScopeSpans(resourceSpans *ptrace.ResourceSpans) ptrace.ScopeSpans {
	scopeSpans := resourceSpans.ScopeSpans().AppendEmpty()

	return scopeSpans
}
```

`ptrace.ScopeSpans` には `Scope()` というメソッドがあり、スパンを生成した計装スコープを表す `pcommon.InstrumentationScope` インスタンスへの参照を返します。

`pcommon.InstrumentationScope` には計装スコープを記述するための以下のメソッドがあります。

- `SetName(v string)` は計装ライブラリの名前を設定します。

- `SetVersion(v string)` は計装ライブラリのバージョンを設定します。

- `Name() string` は計装ライブラリに関連付けられた名前を返します。

- `Version() string` は計装ライブラリに関連付けられたバージョンを返します。

新しい `ptrace.ScopeSpans` の計装スコープの名前とバージョンを設定できるように `appendAtmSystemInstrScopeSpans` 関数を更新しましょう。
更新後の `appendAtmSystemInstrScopeSpans` は次のようになります。

```go
func appendAtmSystemInstrScopeSpans(resourceSpans *ptrace.ResourceSpans) ptrace.ScopeSpans {
	scopeSpans := resourceSpans.ScopeSpans().AppendEmpty()
	scopeSpans.Scope().SetName("atm-system")
	scopeSpans.Scope().SetVersion("v1.0")
	return scopeSpans
}
```

`generateTraces` 関数を更新して、`Atm` と `BackendSystem` エンティティの両方が使用する計装スコープを表す変数を `appendAtmSystemInstrScopeSpans()` で初期化して追加できます。
更新後の `generateTraces()` は次のようになります。

```go
func generateTraces(numberOfTraces int) ptrace.Traces{
	traces := ptrace.NewTraces()

	for i := 0; i < numberOfTraces; i++{
		newAtm := generateAtm()
		newBackendSystem := generateBackendSystem()

		resourceSpan := traces.ResourceSpans().AppendEmpty()
		atmResource := resourceSpan.Resource()
		fillResourceWithAtm(&atmResource, newAtm)

		atmInstScope := appendAtmSystemInstrScopeSpans(&resourceSpan)

		resourceSpan = traces.ResourceSpans().AppendEmpty()
		backendResource := resourceSpan.Resource()
		fillResourceWithBackendSystem(&backendResource, newBackendSystem)

		backendInstScope := appendAtmSystemInstrScopeSpans(&resourceSpan)
	}

	return traces
}
```

この時点で、システム内のテレメトリー生成エンティティと、操作を識別してシステムのトレースを生成する計装スコープを表現するために必要なすべてが揃いました。
次のステップは、指定された計装スコープがトレースの一部として生成した操作を表すスパンを作成することです。

`ptrace.ScopeSpans` には `Spans()` というメソッドがあり、`ptrace.SpanSlice` というヘルパー型のインスタンスを返します。
`ptrace.SpanSlice` 型には `ptrace.Span` の配列を扱うためのメソッドがあります。
配列には、計装スコープがトレースの一部として識別し記述できた操作の数と同じ数のアイテムが含まれます。

`ptrace.SpanSlice` には `AppendEmpty()` というメソッドがあり、新しい `ptrace.Span` を配列に追加してその参照を返します。

`ptrace.Span` には操作を記述するための以下のメソッドがあります。

- `SetTraceID(v pcommon.TraceID)` はこのスパンが関連付けられているトレースを一意に識別する `pcommon.TraceID` を設定します。

- `SetSpanID(v pcommon.SpanID)` は関連付けられたトレースのコンテキストでこのスパンを一意に識別する `pcommon.SpanID` を設定します。

- `SetParentSpanID(v pcommon.SpanID)` は、このスパンで表される操作が親の一部として（ネストして）実行される場合に、親スパン/操作の `pcommon.SpanID` を設定します。

- `SetName(v string)` はスパンの操作名を設定します。

- `SetKind(v ptrace.SpanKind)` はスパンが表す操作の種類を定義する `ptrace.SpanKind` を設定します。

- `SetStartTimestamp(v pcommon.Timestamp)` はスパンに関連付けられた操作が開始された日時を表す `pcommon.Timestamp` を設定します。

- `SetEndTimestamp(v pcommon.Timestamp)` はスパンに関連付けられた操作が終了した日時を表す `pcommon.Timestamp` を設定します。

上記のメソッドからわかるように、`ptrace.Span` は 2 つの必須 ID によって一意に識別されます。
`pcommon.SpanID` 型で表される独自の一意の ID と、`pcommon.TraceID` 型で表される関連付けられたトレースの ID です。

`pcommon.TraceID` は 16 バイト配列として表されるグローバルに一意の ID を保持する必要があり、[W3C Trace Context 仕様](https://www.w3.org/TR/trace-context/#trace-id)に従うべきです。
`pcommon.SpanID` は関連付けられたトレースのコンテキストで一意の ID であり、8 バイト配列として表されます。

`pcommon` パッケージはスパン ID を生成するための以下の型を提供しています。

- `type TraceID [16]byte`

- `type SpanID [8]byte`

このチュートリアルでは、`pcommon.TraceID` には `github.com/google/uuid` パッケージの関数を使用し、`pcommon.SpanID` のランダム生成には `crypto/rand` パッケージの関数を使用して ID を作成します。
まず、`tailtracer/model.go` ファイルを開き、両方のパッケージを `import` 文に追加してください。
その後、両方の ID を生成するための以下の関数を追加してください。

```go
import (
	crand "crypto/rand"
	"math/rand"
  	...
)

func NewTraceID() pcommon.TraceID {
	return pcommon.TraceID(uuid.New())
}

func NewSpanID() pcommon.SpanID {
	var rngSeed int64
	_ = binary.Read(crand.Reader, binary.LittleEndian, &rngSeed)
	randSource := rand.New(rand.NewSource(rngSeed))

	var sid [8]byte
	randSource.Read(sid[:])
	spanID := pcommon.SpanID(sid)

	return spanID
}
```

> [!NOTE] 作業内容の確認
>
> - `math/rand` との競合を避けるために `crypto/rand` を `crand` としてインポートしました。
> - トレース ID とスパン ID をそれぞれ生成するための新しい関数 `NewTraceID()` と `NewSpanID()` を追加しました。

スパンを適切に識別する方法ができたので、システム内のエンティティの内部および間の操作を表すスパンの作成を開始できます。

`generateBackendSystem()` 関数の一部として、`BackEndSystem` エンティティがシステムにサービスとして提供できる操作をランダムに割り当てました。
次に、`tailtracer/model.go` ファイルを開き、トレースを作成し `BackendSystem` の操作を表すスパンを追加する `appendTraceSpans()` という関数を見ます。
`appendTraceSpans()` 関数の初期実装は次のようになります。

```go
func appendTraceSpans(backend *BackendSystem, backendScopeSpans *ptrace.ScopeSpans, atmScopeSpans *ptrace.ScopeSpans) {
	traceId := NewTraceID()
	backendSpanId := NewSpanID()

	backendDuration, _ := time.ParseDuration("1s")
	backendSpanStartTime := time.Now()
	backendSpanFinishTime := backendSpanStartTime.Add(backendDuration)

	backendSpan := backendScopeSpans.Spans().AppendEmpty()
	backendSpan.SetTraceID(traceId)
	backendSpan.SetSpanID(backendSpanId)
	backendSpan.SetName(backend.Endpoint)
	backendSpan.SetKind(ptrace.SpanKindServer)
	backendSpan.SetStartTimestamp(pcommon.NewTimestampFromTime(backendSpanStartTime))
	backendSpan.SetEndTimestamp(pcommon.NewTimestampFromTime(backendSpanFinishTime))
}
```

> [!NOTE] 作業内容の確認
>
> - トレースとスパンの ID を表す `traceId` と `backendSpanId` 変数を追加し、前に作成したヘルパー関数で初期化しました。
> - 操作の開始時間と終了時間を表す `backendSpanStartTime` と `backendSpanFinishTime` を追加しました。
>   チュートリアルでは、すべての `BackendSystem` 操作は 1 秒かかります。
> - この操作を表す `ptrace.Span` のインスタンスを保持する `backendSpan` という変数を追加しました。
> - `BackendSystem` インスタンスの `Endpoint` フィールド値でスパンの `Name` を設定しました。
> - スパンの `Kind` を `ptrace.SpanKindServer` に設定しました。
>   SpanKind を適切に定義する方法については、トレース仕様の [SpanKind セクション](/docs/specs/otel/trace/api/#spankind)を参照してください。
> - 上記のすべてのメソッドを使用して、`BackendSystem` 操作を表す適切な値で `ptrace.Span` を埋めました。

`appendTraceSpans()` 関数のパラメーターに `ptrace.ScopeSpans` への参照が 2 つありますが、そのうち 1 つしか使用していないことに気づいたかもしれません。
今は心配しないでください。後で戻ります。

次に、`appendTraceSpans()` 関数を呼び出してトレースを生成できるように `generateTraces()` 関数を更新します。
更新後の `generateTraces()` 関数は次のようになります。

```go
func generateTraces(numberOfTraces int) ptrace.Traces {
	traces := ptrace.NewTraces()

	for i := 0; i < numberOfTraces; i++ {
		newAtm := generateAtm()
		newBackendSystem := generateBackendSystem()

		resourceSpan := traces.ResourceSpans().AppendEmpty()
		atmResource := resourceSpan.Resource()
		fillResourceWithAtm(&atmResource, newAtm)

		atmInstScope := appendAtmSystemInstrScopeSpans(&resourceSpan)

		resourceSpan = traces.ResourceSpans().AppendEmpty()
		backendResource := resourceSpan.Resource()
		fillResourceWithBackendSystem(&backendResource, newBackendSystem)

		backendInstScope := appendAtmSystemInstrScopeSpans(&resourceSpan)

		appendTraceSpans(&newBackendSystem, &backendInstScope, &atmInstScope)
	}

	return traces
}
```

これで `BackendSystem` エンティティとその操作が適切なトレースコンテキストのスパンで表現されました！
次に、パイプラインの次のコンシューマー（プロセッサーまたはエクスポーター）が受信して処理できるように、生成されたトレースをパイプラインを通じてプッシュする必要があります。

`tailtracer/model.go` ファイルは次のようになります。

> tailtracer/model.go

```go
package tailtracer

import (
	crand "crypto/rand"
	"encoding/binary"
	"math/rand"
	"time"

	"github.com/google/uuid"
	"go.opentelemetry.io/collector/pdata/pcommon"
	"go.opentelemetry.io/collector/pdata/ptrace"
	"go.opentelemetry.io/otel/semconv/v1.38.0"
)

type Atm struct {
	ID           int64
	Version      string
	Name         string
	StateID      string
	SerialNumber string
	ISPNetwork   string
}

type BackendSystem struct {
	Version       string
	ProcessName   string
	OSType        string
	OSVersion     string
	CloudProvider string
	CloudRegion   string
	Endpoint      string
}

func generateAtm() Atm {
	i := getRandomNumber(1, 2)
	var newAtm Atm

	switch i {
	case 1:
		newAtm = Atm{
			ID:           111,
			Name:         "ATM-111-IL",
			SerialNumber: "atmxph-2022-111",
			Version:      "v1.0",
			ISPNetwork:   "comcast-chicago",
			StateID:      "IL",
		}

	case 2:
		newAtm = Atm{
			ID:           222,
			Name:         "ATM-222-CA",
			SerialNumber: "atmxph-2022-222",
			Version:      "v1.0",
			ISPNetwork:   "comcast-sanfrancisco",
			StateID:      "CA",
		}
	}

	return newAtm
}

func generateBackendSystem() BackendSystem {
	i := getRandomNumber(1, 3)

	newBackend := BackendSystem{
		ProcessName:   "accounts",
		Version:       "v2.5",
		OSType:        "lnx",
		OSVersion:     "4.16.10-300.fc28.x86_64",
		CloudProvider: "amzn",
		CloudRegion:   "us-east-2",
	}

	switch i {
	case 1:
		newBackend.Endpoint = "api/v2.5/balance"
	case 2:
		newBackend.Endpoint = "api/v2.5/deposit"
	case 3:
		newBackend.Endpoint = "api/v2.5/withdrawn"
	}

	return newBackend
}

func getRandomNumber(min int, max int) int {
	i := (rand.Intn(max-min+1) + min)
	return i
}

func generateTraces(numberOfTraces int) ptrace.Traces {
	traces := ptrace.NewTraces()

	for i := 0; i < numberOfTraces; i++ {
		newAtm := generateAtm()
		newBackendSystem := generateBackendSystem()

		resourceSpan := traces.ResourceSpans().AppendEmpty()
		atmResource := resourceSpan.Resource()
		fillResourceWithAtm(&atmResource, newAtm)

		atmInstScope := appendAtmSystemInstrScopeSpans(&resourceSpan)

		resourceSpan = traces.ResourceSpans().AppendEmpty()
		backendResource := resourceSpan.Resource()
		fillResourceWithBackendSystem(&backendResource, newBackendSystem)

		backendInstScope := appendAtmSystemInstrScopeSpans(&resourceSpan)

		appendTraceSpans(&newBackendSystem, &backendInstScope, &atmInstScope)
	}

	return traces
}

func fillResourceWithAtm(resource *pcommon.Resource, atm Atm) {
	atmAttrs := resource.Attributes()
	atmAttrs.PutInt("atm.id", atm.ID)
	atmAttrs.PutStr("atm.stateid", atm.StateID)
	atmAttrs.PutStr("atm.ispnetwork", atm.ISPNetwork)
	atmAttrs.PutStr("atm.serialnumber", atm.SerialNumber)
	atmAttrs.PutStr(string(semconv.ServiceNameKey), atm.Name)
	atmAttrs.PutStr(string(semconv.ServiceVersionKey), atm.Version)

}

func fillResourceWithBackendSystem(resource *pcommon.Resource, backend BackendSystem) {
	backendAttrs := resource.Attributes()
	var osType, cloudProvider string

	switch {
	case backend.CloudProvider == "amzn":
		cloudProvider = semconv.CloudProviderAWS.Value.AsString()
	case backend.CloudProvider == "mcrsft":
		cloudProvider = semconv.CloudProviderAzure.Value.AsString()
	case backend.CloudProvider == "gogl":
		cloudProvider = semconv.CloudProviderGCP.Value.AsString()
	}

	backendAttrs.PutStr(string(semconv.CloudProviderKey), cloudProvider)
	backendAttrs.PutStr(string(semconv.CloudRegionKey), backend.CloudRegion)

	switch {
	case backend.OSType == "lnx":
		osType = semconv.OSTypeLinux.Value.AsString()
	case backend.OSType == "wndws":
		osType = semconv.OSTypeWindows.Value.AsString()
	case backend.OSType == "slrs":
		osType = semconv.OSTypeSolaris.Value.AsString()
	}

	backendAttrs.PutStr(string(semconv.OSTypeKey), osType)
	backendAttrs.PutStr(string(semconv.OSVersionKey), backend.OSVersion)

	backendAttrs.PutStr(string(semconv.ServiceNameKey), backend.ProcessName)
	backendAttrs.PutStr(string(semconv.ServiceVersionKey), backend.Version)
}

func appendAtmSystemInstrScopeSpans(resourceSpans *ptrace.ResourceSpans) ptrace.ScopeSpans {
	scopeSpans := resourceSpans.ScopeSpans().AppendEmpty()
	scopeSpans.Scope().SetName("atm-system")
	scopeSpans.Scope().SetVersion("v1.0")
	return scopeSpans
}

func NewTraceID() pcommon.TraceID {
	return pcommon.TraceID(uuid.New())
}

func NewSpanID() pcommon.SpanID {
	var rngSeed int64
	_ = binary.Read(crand.Reader, binary.LittleEndian, &rngSeed)
	randSource := rand.New(rand.NewSource(rngSeed))

	var sid [8]byte
	randSource.Read(sid[:])
	spanID := pcommon.SpanID(sid)

	return spanID
}

func appendTraceSpans(backend *BackendSystem, backendScopeSpans *ptrace.ScopeSpans, atmScopeSpans *ptrace.ScopeSpans) {
	traceId := NewTraceID()
	backendSpanId := NewSpanID()

	backendDuration, _ := time.ParseDuration("1s")
	backendSpanStartTime := time.Now()
	backendSpanFinishTime := backendSpanStartTime.Add(backendDuration)

	backendSpan := backendScopeSpans.Spans().AppendEmpty()
	backendSpan.SetTraceID(traceId)
	backendSpan.SetSpanID(backendSpanId)
	backendSpan.SetName(backend.Endpoint)
	backendSpan.SetKind(ptrace.SpanKindServer)
	backendSpan.SetStartTimestamp(pcommon.NewTimestampFromTime(backendSpanStartTime))
	backendSpan.SetEndTimestamp(pcommon.NewTimestampFromTime(backendSpanFinishTime))
}
```

`consumer.Traces` には `ConsumeTraces()` というメソッドがあり、生成されたトレースをパイプラインの次のコンシューマーにプッシュする責任があります。
`tailtracerReceiver` 型の `Start()` メソッドを更新して、それを使用するコードを追加する必要があります。

`tailtracer/trace-receiver.go` ファイルを開き、`Start()` メソッドを次のように更新してください。

```go
func (tailtracerRcvr *tailtracerReceiver) Start(ctx context.Context, host component.Host) error {
	tailtracerRcvr.host = host
	ctx = context.Background()
	ctx, tailtracerRcvr.cancel = context.WithCancel(ctx)

	interval, _ := time.ParseDuration(tailtracerRcvr.config.Interval)
	go func() {
		ticker := time.NewTicker(interval)
		defer ticker.Stop()
		for {
			select {
				case <-ticker.C:
					tailtracerRcvr.logger.Info("I should start processing traces now!")
					tailtracerRcvr.nextConsumer.ConsumeTraces(ctx, generateTraces(tailtracerRcvr.config.NumberOfTraces)) // 新しく追加した行
				case <-ctx.Done():
					return
			}
		}
	}()

	return nil
}
```

> [!NOTE] 作業内容の確認
>
> - `case <=ticker.C` 条件の下に `tailtracerRcvr.nextConsumer.ConsumeTraces()` メソッドの呼び出しを追加しました。
>   `Start()` メソッドで作成した新しいコンテキスト（`ctx`）と、生成されたトレースをパイプラインの次のコンシューマーにプッシュするための `generateTraces()` 関数の呼び出しを渡しています。

では `otelcol-dev` を再度実行しましょう。

```sh
go run ./otelcol-dev --config config.yaml
```

数分後に次のような出力が表示されるはずです。

```log
2023-11-09T11:38:19.890+0800	info	service@v0.88.0/telemetry.go:84	Setting up own telemetry...
2023-11-09T11:38:19.890+0800	info	service@v0.88.0/telemetry.go:201	Serving Prometheus metrics	{"address": ":8888", "level": "Basic"}
2023-11-09T11:38:19.890+0800	debug	exporter@v0.88.0/exporter.go:273	Stable component.	{"kind": "exporter", "data_type": "traces", "name": "otlp/jaeger"}
2023-11-09T11:38:19.890+0800	info	exporter@v0.88.0/exporter.go:275	Development component. May change in the future.	{"kind": "exporter", "data_type": "traces", "name": "debug"}
2023-11-09T11:38:19.891+0800	debug	receiver@v0.88.0/receiver.go:294	Stable component.	{"kind": "receiver", "name": "otlp", "data_type": "traces"}
2023-11-09T11:38:19.891+0800	debug	receiver@v0.88.0/receiver.go:294	Alpha component. May change in the future.	{"kind": "receiver", "name": "tailtracer", "data_type": "traces"}
2023-11-09T11:38:19.891+0800	info	service@v0.88.0/service.go:143	Starting otelcol-dev...	{"Version": "1.0.0", "NumCPU": 10}
2023-11-09T11:38:19.891+0800	info	extensions/extensions.go:33	Starting extensions...

<OMITTED>

2023-11-09T11:38:19.903+0800	info	zapgrpc/zapgrpc.go:178	[core] [Channel #1] Channel Connectivity change to READY	{"grpc_log": true}
2023-11-09T11:39:19.894+0800	info	tailtracer/trace-receiver.go:33	I should start processing traces now!	{"kind": "receiver", "name": "tailtracer", "data_type": "traces"}
2023-11-09T11:39:19.913+0800	info	TracesExporter	{"kind": "exporter", "data_type": "traces", "name": "debug", "resource spans": 4, "spans": 2}
2023-11-09T11:39:19.913+0800	info	ResourceSpans #0
Resource SchemaURL:
Resource attributes:
     -> atm.id: Int(222)
     -> atm.stateid: Str(CA)
     -> atm.ispnetwork: Str(comcast-sanfrancisco)
     -> atm.serialnumber: Str(atmxph-2022-222)
     -> service.name: Str(ATM-222-CA)
     -> service.version: Str(v1.0)
ScopeSpans #0
ScopeSpans SchemaURL:
InstrumentationScope
ResourceSpans #1
Resource SchemaURL:
Resource attributes:
     -> cloud.provider: Str(aws)
     -> cloud.region: Str(us-east-2)
     -> os.type: Str(linux)
     -> os.version: Str(4.16.10-300.fc28.x86_64)
     -> service.name: Str(accounts)
     -> service.version: Str(v2.5)
ScopeSpans #0
ScopeSpans SchemaURL:
InstrumentationScope
Span #0
    Trace ID       : bbcb00aead044a138cf96c0bf4a4ba83
    Parent ID      :
    ID             : 5056fe4e9adf621c
    Name           : api/v2.5/withdrawn
    Kind           : Server
    Start time     : 2023-11-09 03:39:19.894881 +0000 UTC
    End time       : 2023-11-09 03:39:20.894881 +0000 UTC
    Status code    : Unset
    Status message :
ResourceSpans #2
Resource SchemaURL:
Resource attributes:
     -> atm.id: Int(111)
     -> atm.stateid: Str(IL)
     -> atm.ispnetwork: Str(comcast-chicago)
     -> atm.serialnumber: Str(atmxph-2022-111)
     -> service.name: Str(ATM-111-IL)
     -> service.version: Str(v1.0)
ScopeSpans #0
ScopeSpans SchemaURL:
InstrumentationScope
ResourceSpans #3
Resource SchemaURL:
Resource attributes:
     -> cloud.provider: Str(aws)
     -> cloud.region: Str(us-east-2)
     -> os.type: Str(linux)
     -> os.version: Str(4.16.10-300.fc28.x86_64)
     -> service.name: Str(accounts)
     -> service.version: Str(v2.5)
ScopeSpans #0
ScopeSpans SchemaURL:
InstrumentationScope
Span #0
    Trace ID       : ba013b8223ec4d29806ae493ecd1a5e4
    Parent ID      :
    ID             : 4feb47b55c9c4129
    Name           : api/v2.5/withdrawn
    Kind           : Server
    Start time     : 2023-11-09 03:39:19.894953 +0000 UTC
    End time       : 2023-11-09 03:39:20.894953 +0000 UTC
    Status code    : Unset
    Status message :
	{"kind": "exporter", "data_type": "traces", "name": "debug"}
...
```

以下は Jaeger での生成されたトレースの表示です。
![Jaeger trace](/img/docs/tutorials/Jaeger-BackendSystem-Trace.png)

現在 Jaeger に表示されているのは、OTel SDK で計装されていない外部エンティティからリクエストを受信しているサービスを表しています。
その結果、トレースの起点/開始として識別できません。
`ptrace.Span` が、同じトレースコンテキスト内の `Resource` の内部または外部で発生した別の操作の結果として実行された操作を表していることを理解するには、以下を行う必要があります。

- 親/呼び出し元の `ptrace.Span` の `pcommon.TraceID` をパラメーターとして渡して `SetTraceID()` メソッドを呼び出し、呼び出し元の操作と同じトレースコンテキストを設定する。
- 親/呼び出し元の `ptrace.Span` の `pcommon.SpanID` をパラメーターとして渡して `SetParentId()` メソッドを呼び出し、トレースのコンテキストで呼び出し元の操作を定義する。

次に、`Atm` エンティティの操作を表す `ptrace.Span` を作成し、`BackendSystem` スパンの親として設定します。
`tailtracer/model.go` ファイルを開き、`appendTraceSpans()` 関数を次のように更新してください。

```go
func appendTraceSpans(backend *BackendSystem, backendScopeSpans *ptrace.ScopeSpans, atmScopeSpans *ptrace.ScopeSpans) {
	traceId := NewTraceID()

	var atmOperationName string

	switch {
		case strings.Contains(backend.Endpoint, "balance"):
			atmOperationName = "Check Balance"
		case strings.Contains(backend.Endpoint, "deposit"):
			atmOperationName = "Make Deposit"
		case strings.Contains(backend.Endpoint, "withdraw"):
			atmOperationName = "Fast Cash"
		}

	atmSpanId := NewSpanID()
	atmSpanStartTime := time.Now()
	atmDuration, _ := time.ParseDuration("4s")
	atmSpanFinishTime := atmSpanStartTime.Add(atmDuration)

	atmSpan := atmScopeSpans.Spans().AppendEmpty()
	atmSpan.SetTraceID(traceId)
	atmSpan.SetSpanID(atmSpanId)
	atmSpan.SetName(atmOperationName)
	atmSpan.SetKind(ptrace.SpanKindClient)
	atmSpan.Status().SetCode(ptrace.StatusCodeOk)
	atmSpan.SetStartTimestamp(pcommon.NewTimestampFromTime(atmSpanStartTime))
	atmSpan.SetEndTimestamp(pcommon.NewTimestampFromTime(atmSpanFinishTime))

	backendSpanId := NewSpanID()

	backendDuration, _ := time.ParseDuration("2s")
	backendSpanStartTime := atmSpanStartTime.Add(backendDuration)

	backendSpan := backendScopeSpans.Spans().AppendEmpty()
	backendSpan.SetTraceID(atmSpan.TraceID())
	backendSpan.SetSpanID(backendSpanId)
	backendSpan.SetParentSpanID(atmSpan.SpanID())
	backendSpan.SetName(backend.Endpoint)
	backendSpan.SetKind(ptrace.SpanKindServer)
	backendSpan.Status().SetCode(ptrace.StatusCodeOk)
	backendSpan.SetStartTimestamp(pcommon.NewTimestampFromTime(backendSpanStartTime))
	backendSpan.SetEndTimestamp(atmSpan.EndTimestamp())
}
```

最終的な `tailtracer/model.go` ファイルは次のようになります。

> tailtracer/model.go

```go
package tailtracer

import (
	crand "crypto/rand"
	"encoding/binary"
	"math/rand"
	"strings"
	"time"

	"github.com/google/uuid"
	"go.opentelemetry.io/collector/pdata/pcommon"
	"go.opentelemetry.io/collector/pdata/ptrace"
	 "go.opentelemetry.io/otel/semconv/v1.38.0"
)

type Atm struct {
	ID           int64
	Version      string
	Name         string
	StateID      string
	SerialNumber string
	ISPNetwork   string
}

type BackendSystem struct {
	Version       string
	ProcessName   string
	OSType        string
	OSVersion     string
	CloudProvider string
	CloudRegion   string
	Endpoint      string
}

func generateAtm() Atm {
	i := getRandomNumber(1, 2)
	var newAtm Atm

	switch i {
	case 1:
		newAtm = Atm{
			ID:           111,
			Name:         "ATM-111-IL",
			SerialNumber: "atmxph-2022-111",
			Version:      "v1.0",
			ISPNetwork:   "comcast-chicago",
			StateID:      "IL",
		}

	case 2:
		newAtm = Atm{
			ID:           222,
			Name:         "ATM-222-CA",
			SerialNumber: "atmxph-2022-222",
			Version:      "v1.0",
			ISPNetwork:   "comcast-sanfrancisco",
			StateID:      "CA",
		}
	}

	return newAtm
}

func generateBackendSystem() BackendSystem {
	i := getRandomNumber(1, 3)

	newBackend := BackendSystem{
		ProcessName:   "accounts",
		Version:       "v2.5",
		OSType:        "lnx",
		OSVersion:     "4.16.10-300.fc28.x86_64",
		CloudProvider: "amzn",
		CloudRegion:   "us-east-2",
	}

	switch i {
	case 1:
		newBackend.Endpoint = "api/v2.5/balance"
	case 2:
		newBackend.Endpoint = "api/v2.5/deposit"
	case 3:
		newBackend.Endpoint = "api/v2.5/withdrawn"
	}

	return newBackend
}

func getRandomNumber(min int, max int) int {
	i := (rand.Intn(max-min+1) + min)
	return i
}

func generateTraces(numberOfTraces int) ptrace.Traces {
	traces := ptrace.NewTraces()

	for i := 0; i < numberOfTraces; i++ {
		newAtm := generateAtm()
		newBackendSystem := generateBackendSystem()

		resourceSpan := traces.ResourceSpans().AppendEmpty()
		atmResource := resourceSpan.Resource()
		fillResourceWithAtm(&atmResource, newAtm)

		atmInstScope := appendAtmSystemInstrScopeSpans(&resourceSpan)

		resourceSpan = traces.ResourceSpans().AppendEmpty()
		backendResource := resourceSpan.Resource()
		fillResourceWithBackendSystem(&backendResource, newBackendSystem)

		backendInstScope := appendAtmSystemInstrScopeSpans(&resourceSpan)

		appendTraceSpans(&newBackendSystem, &backendInstScope, &atmInstScope)
	}

	return traces
}

func fillResourceWithAtm(resource *pcommon.Resource, atm Atm) {
	atmAttrs := resource.Attributes()
	atmAttrs.PutInt("atm.id", atm.ID)
	atmAttrs.PutStr("atm.stateid", atm.StateID)
	atmAttrs.PutStr("atm.ispnetwork", atm.ISPNetwork)
	atmAttrs.PutStr("atm.serialnumber", atm.SerialNumber)
	atmAttrs.PutStr(string(semconv.ServiceNameKey), atm.Name)
	atmAttrs.PutStr(string(semconv.ServiceVersionKey), atm.Version)

}

func fillResourceWithBackendSystem(resource *pcommon.Resource, backend BackendSystem) {
	backendAttrs := resource.Attributes()
	var osType, cloudProvider string

	switch {
	case backend.CloudProvider == "amzn":
		cloudProvider = semconv.CloudProviderAWS.Value.AsString()
	case backend.CloudProvider == "mcrsft":
		cloudProvider = semconv.CloudProviderAzure.Value.AsString()
	case backend.CloudProvider == "gogl":
		cloudProvider = semconv.CloudProviderGCP.Value.AsString()
	}

	backendAttrs.PutStr(string(semconv.CloudProviderKey), cloudProvider)
	backendAttrs.PutStr(string(semconv.CloudRegionKey), backend.CloudRegion)

	switch {
	case backend.OSType == "lnx":
		osType = semconv.OSTypeLinux.Value.AsString()
	case backend.OSType == "wndws":
		osType = semconv.OSTypeWindows.Value.AsString()
	case backend.OSType == "slrs":
		osType = semconv.OSTypeSolaris.Value.AsString()
	}

	backendAttrs.PutStr(string(semconv.OSTypeKey), osType)
	backendAttrs.PutStr(string(semconv.OSVersionKey), backend.OSVersion)

	backendAttrs.PutStr(string(semconv.ServiceNameKey), backend.ProcessName)
	backendAttrs.PutStr(string(semconv.ServiceVersionKey), backend.Version)
}

func appendAtmSystemInstrScopeSpans(resourceSpans *ptrace.ResourceSpans) ptrace.ScopeSpans {
	scopeSpans := resourceSpans.ScopeSpans().AppendEmpty()
	scopeSpans.Scope().SetName("atm-system")
	scopeSpans.Scope().SetVersion("v1.0")
	return scopeSpans
}

func NewTraceID() pcommon.TraceID {
	return pcommon.TraceID(uuid.New())
}

func NewSpanID() pcommon.SpanID {
	var rngSeed int64
	_ = binary.Read(crand.Reader, binary.LittleEndian, &rngSeed)
	randSource := rand.New(rand.NewSource(rngSeed))

	var sid [8]byte
	randSource.Read(sid[:])
	spanID := pcommon.SpanID(sid)

	return spanID
}

func appendTraceSpans(backend *BackendSystem, backendScopeSpans *ptrace.ScopeSpans, atmScopeSpans *ptrace.ScopeSpans) {
	traceId := NewTraceID()

	var atmOperationName string

	switch {
	case strings.Contains(backend.Endpoint, "balance"):
		atmOperationName = "Check Balance"
	case strings.Contains(backend.Endpoint, "deposit"):
		atmOperationName = "Make Deposit"
	case strings.Contains(backend.Endpoint, "withdraw"):
		atmOperationName = "Fast Cash"
	}

	atmSpanId := NewSpanID()
	atmSpanStartTime := time.Now()
	atmDuration, _ := time.ParseDuration("4s")
	atmSpanFinishTime := atmSpanStartTime.Add(atmDuration)

	atmSpan := atmScopeSpans.Spans().AppendEmpty()
	atmSpan.SetTraceID(traceId)
	atmSpan.SetSpanID(atmSpanId)
	atmSpan.SetName(atmOperationName)
	atmSpan.SetKind(ptrace.SpanKindClient)
	atmSpan.Status().SetCode(ptrace.StatusCodeOk)
	atmSpan.SetStartTimestamp(pcommon.NewTimestampFromTime(atmSpanStartTime))
	atmSpan.SetEndTimestamp(pcommon.NewTimestampFromTime(atmSpanFinishTime))

	backendSpanId := NewSpanID()

	backendDuration, _ := time.ParseDuration("2s")
	backendSpanStartTime := atmSpanStartTime.Add(backendDuration)

	backendSpan := backendScopeSpans.Spans().AppendEmpty()
	backendSpan.SetTraceID(atmSpan.TraceID())
	backendSpan.SetSpanID(backendSpanId)
	backendSpan.SetParentSpanID(atmSpan.SpanID())
	backendSpan.SetName(backend.Endpoint)
	backendSpan.SetKind(ptrace.SpanKindServer)
	backendSpan.Status().SetCode(ptrace.StatusCodeOk)
	backendSpan.SetStartTimestamp(pcommon.NewTimestampFromTime(backendSpanStartTime))
	backendSpan.SetEndTimestamp(atmSpan.EndTimestamp())
}
```

`otelcol-dev` を再度実行します。

```sh
go run ./otelcol-dev --config config.yaml
```

約 2 分後に、次のようなトレースが Jaeger に表示されるはずです。
![Jaeger trace](/img/docs/tutorials/Jaeger-FullSystem-Traces-List.png)

これで、システム内の `Atm` と `BackendSystem` の両方のテレメトリー生成エンティティを表すサービスができました。
両方のエンティティがどのように使用され、ユーザーが実行する操作のパフォーマンスにどのように貢献しているかを完全に理解できます。

以下は Jaeger でのそれらのトレースの 1 つの詳細ビューです。
![Jaeger trace](/img/docs/tutorials/Jaeger-FullSystem-Trace-Details.png)

以上です！
これでこのチュートリアルの最後に到達し、トレースレシーバーの実装に成功しました。おめでとうございます！
