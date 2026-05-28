---
title: Getting Started（入門）
weight: 10
default_lang_commit: 869b2bb90ca9e54d8d98e7815e66111b577165eb
# prettier-ignore
cSpell:ignore: autoexport chan fatalln funcs intn itoa otelhttp rolldice stdouttrace strconv
---

<!-- markdownlint-disable blanks-around-fences -->
<?code-excerpt path-base="examples/go/dice/instrumented"?>

このページでは、GoにおけるOpenTelemetryの始め方を紹介します。

シンプルなアプリケーションに対して手動で計装を行い、[トレース][traces]、[メトリクス][metrics]、[ログ][logs]をコンソールに出力する方法を学ぶことができます。

> [!NOTE]
>
> ログシグナルは現在も実験的な段階にあります。
> 将来のバージョンで破壊的変更が加えられる可能性があります。

## 前提条件 {#prerequisites}

以下がローカルにインストールされていることを確認してください。

- [Go](https://go.dev/)1.23以上

## アプリケーション例 {#example-application}

次の例では、基本的な[`net/http`](https://pkg.go.dev/net/http)アプリケーションを使用しています。
もし`net/http`を使用していなくても問題ありません。GinやEchoなど、他のWebフレームワークでもOpenTelemetry Goを利用できます。
対応しているフレームワーク用ライブラリの一覧については、[レジストリ](/ecosystem/registry/?component=instrumentation&language=go)をご覧ください。

より詳しい例については、[こちら](/docs/languages/go/examples/)をご覧ください。

### セットアップ {#setup}

はじめに、新しいディレクトリ内で`go.mod`をセットアップします。

```shell
go mod init dice
```

### HTTP サーバーを作成して起動する {#create-and-launch-an-http-server}

同じフォルダ内に`main.go`という名前のファイルを作成し、次のコードをそのファイルに追加してください。

```go
package main

import (
	"context"
	"log"
	"net"
	"net/http"
	"os"
	"os/signal"
	"time"
)

func main() {
	if err := run(); err != nil {
		log.Fatalln(err)
	}
}

func run() (err error) {
	// SIGINT (CTRL+C) を適切に処理します。
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt)
	defer stop()

	// HTTPサーバーを起動します。
	srv := &http.Server{
		Addr:         ":8080",
		BaseContext:  func(net.Listener) context.Context { return ctx },
		ReadTimeout:  time.Second,
		WriteTimeout: 10 * time.Second,
		Handler:      newHTTPHandler(),
	}
	srvErr := make(chan error, 1)
	go func() {
		log.Println("Running HTTP server...")
		srvErr <- srv.ListenAndServe()
	}()

	// 割り込みを待ちます。
	select {
	case err = <-srvErr:
		// HTTPサーバーの起動時にエラーが発生しました。
		return err
	case <-ctx.Done():
		// 最初のCTRL+Cを待ちます。
		// できるだけ早くシグナル通知の受信を停止します。
		stop()
	}

	// Shutdownが呼び出されると、ListenAndServeはすぐにErrServerClosedを返します。
	err = srv.Shutdown(context.Background())
	return err
}

func newHTTPHandler() http.Handler {
	mux := http.NewServeMux()

	// ハンドラーを登録します。
	mux.HandleFunc("/rolldice/", rolldice)
	mux.HandleFunc("/rolldice/{player}", rolldice)

	return mux
}
```

`rolldice.go`という名前のファイルを作成し、次のコードを追加してください。

```go
package main

import (
	"io"
	"log"
	"math/rand"
	"net/http"
	"strconv"
)

func rolldice(w http.ResponseWriter, r *http.Request) {
	roll := 1 + rand.Intn(6)

	var msg string
	if player := r.PathValue("player"); player != "" {
		msg = player + " is rolling the dice"
	} else {
		msg = "Anonymous player is rolling the dice"
	}
	log.Printf("%s, result: %d", msg, roll)

	resp := strconv.Itoa(roll) + "\n"
	if _, err := io.WriteString(w, resp); err != nil {
		log.Printf("Write failed: %v", err)
	}
}
```

次のコマンドでアプリケーションをビルドして実行します

```shell
go run .
```

動作を確認するために、ウェブブラウザで<http://localhost:8080/rolldice>を開いてください。

## OpenTelemetryの計装を追加する {#add-opentelemetry-instrumentation}

サンプルアプリケーションにOpenTelemetryの計装を追加する方法を紹介します。
自身のアプリケーションを使用している場合でも、同様の手順で進めることができますが、コードが多少異なる場合がある点にご注意ください。

### OpenTelemetry SDKを初期化する {#initialize-the-opentelemetry-sdk}

まず、OpenTelemetry SDKを初期化します。
これはテレメトリーデータをエクスポートするすべてのアプリケーションに必須の手順です。

`otel.go`を作成し、OpenTelemetry SDKの初期化コードを追加します。

<!-- prettier-ignore-start -->
<!-- code-excerpt "otel.go" from="package main"?-->
```go
package main

import (
	"context"
	"errors"
	"time"

	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/exporters/stdout/stdoutlog"
	"go.opentelemetry.io/otel/exporters/stdout/stdoutmetric"
	"go.opentelemetry.io/otel/exporters/stdout/stdouttrace"
	"go.opentelemetry.io/otel/log/global"
	"go.opentelemetry.io/otel/propagation"
	"go.opentelemetry.io/otel/sdk/log"
	"go.opentelemetry.io/otel/sdk/metric"
	"go.opentelemetry.io/otel/sdk/trace"
)

// setupOTelSDKは、OpenTelemetryのパイプラインを初期化します。
// エラーが返されなかった場合は、適切にクリーンアップを行うためにshutdownを必ず呼び出してください。
func setupOTelSDK(ctx context.Context) (func(context.Context) error, error) {
	var shutdownFuncs []func(context.Context) error
	var err error

	// shutdown は、shutdownFuncsを通じて登録されたクリーンアップ関数を呼び出します。
	// 各クリーンアップ関数の呼び出しで発生したエラーはjoinされます。
	// 登録された各クリーンアップ関数は一度だけ実行されます。
	shutdown := func(ctx context.Context) error {
		var err error
		for _, fn := range shutdownFuncs {
			err = errors.Join(err, fn(ctx))
		}
		shutdownFuncs = nil
		return err
	}

	// handleErrはクリーンアップのためにshutdownを呼び出し、すべてのエラーが確実に返されるようにします。
	handleErr := func(inErr error) {
		err = errors.Join(inErr, shutdown(ctx))
	}

	// プロパゲーターのセットアップ。
	prop := newPropagator()
	otel.SetTextMapPropagator(prop)

	// トレースプロバイダーのセットアップ。
	tracerProvider, err := newTracerProvider()
	if err != nil {
		handleErr(err)
		return shutdown, err
	}
	shutdownFuncs = append(shutdownFuncs, tracerProvider.Shutdown)
	otel.SetTracerProvider(tracerProvider)

	// メータープロバイダーのセットアップ。
	meterProvider, err := newMeterProvider()
	if err != nil {
		handleErr(err)
		return shutdown, err
	}
	shutdownFuncs = append(shutdownFuncs, meterProvider.Shutdown)
	otel.SetMeterProvider(meterProvider)

	// ロガープロバイダーのセットアップ。
	loggerProvider, err := newLoggerProvider()
	if err != nil {
		handleErr(err)
		return shutdown, err
	}
	shutdownFuncs = append(shutdownFuncs, loggerProvider.Shutdown)
	global.SetLoggerProvider(loggerProvider)

	return shutdown, err
}

func newPropagator() propagation.TextMapPropagator {
	return propagation.NewCompositeTextMapPropagator(
		propagation.TraceContext{},
		propagation.Baggage{},
	)
}

func newTracerProvider() (*trace.TracerProvider, error) {
	traceExporter, err := stdouttrace.New(stdouttrace.WithPrettyPrint())
	if err != nil {
		return nil, err
	}

	tracerProvider := trace.NewTracerProvider(
		trace.WithBatcher(traceExporter,
			// デフォルトは5秒です。デモ用に1秒に設定しています。
			trace.WithBatchTimeout(time.Second)),
	)
	return tracerProvider, nil
}

func newMeterProvider() (*metric.MeterProvider, error) {
	metricExporter, err := stdoutmetric.New(stdoutmetric.WithPrettyPrint())
	if err != nil {
		return nil, err
	}

	meterProvider := metric.NewMeterProvider(
		metric.WithReader(metric.NewPeriodicReader(metricExporter,
			// デフォルトは1分です。デモ用に3秒に設定しています。
			metric.WithInterval(3*time.Second))),
	)
	return meterProvider, nil
}

func newLoggerProvider() (*log.LoggerProvider, error) {
	logExporter, err := stdoutlog.New(stdoutlog.WithPrettyPrint())
	if err != nil {
		return nil, err
	}

	loggerProvider := log.NewLoggerProvider(
		log.WithProcessor(log.NewBatchProcessor(logExporter)),
	)
	return loggerProvider, nil
}
```
<!-- prettier-ignore-end -->

> [!TIP]
>
> 前述の例ではデモのためにコンソール (stdout) エクスポーターを使用しています。
> [`autoexport`](https://pkg.go.dev/go.opentelemetry.io/contrib/exporters/autoexport) パッケージを使うと、`OTEL_TRACES_EXPORTER`、`OTEL_METRICS_EXPORTER`、`OTEL_LOGS_EXPORTER`、`OTEL_EXPORTER_OTLP_ENDPOINT` といった環境変数によってエクスポーターを設定できます。
> 詳細については [エクスポーター](/docs/languages/go/exporters/) を参照してください。

トレースまたはメトリクスのどちらか一方のみを使用する場合は、対応するTracerProviderまたはMeterProviderの初期化コードを省略できます。

### HTTPサーバーを計装する {#instrument-the-http-server}

OpenTelemetry SDKの初期化が完了したので、HTTPサーバーの計装ができます。

`main.go`を修正して、OpenTelemetry SDKのセットアップと、`otelhttp`計装ライブラリを使ったHTTPサーバーの計装を行うコードを追加してください。

<!-- prettier-ignore-start -->
<!--?code-excerpt "main.go" from="package main"?-->
```go
package main

import (
	"context"
	"errors"
	"log"
	"net"
	"net/http"
	"os"
	"os/signal"
	"time"

	"go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp"
)

func main() {
	if err := run(); err != nil {
		log.Fatalln(err)
	}
}

func run() error {
	// SIGINT（CTRL+C）を適切に処理するようにします。
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt)
	defer stop()

	// OpenTelemetryのセットアップ。
	otelShutdown, err := setupOTelSDK(ctx)
	if err != nil {
		return err
	}
	// リークが発生しないよう、適切にシャットダウン処理を行います。
	defer func() {
		err = errors.Join(err, otelShutdown(context.Background()))
	}()

	// HTTPサーバーを起動。
	srv := &http.Server{
		Addr:         ":8080",
		BaseContext:  func(net.Listener) context.Context { return ctx },
		ReadTimeout:  time.Second,
		WriteTimeout: 10 * time.Second,
		Handler:      newHTTPHandler(),
	}
	srvErr := make(chan error, 1)
	go func() {
		srvErr <- srv.ListenAndServe()
	}()

	// 割り込みを待機する。
	select {
	case err = <-srvErr:
		// Error when starting HTTP server.
		// HTTPサーバーの起動中のエラー。
		return err
	case <-ctx.Done():
		// 最初の CTRL+C を待機します。
		// 可能な限り早くシグナル通知の受信を停止します。
		stop()
	}

	// Shutdownが呼び出されると、ListenAndServeは即座にErrServerClosedを返します。
	err = srv.Shutdown(context.Background())
	return err
}

func newHTTPHandler() http.Handler {
	mux := http.NewServeMux()

	// ハンドラーの登録。
	mux.Handle("/rolldice", http.HandlerFunc(rolldice))
	mux.Handle("/rolldice/{player}", http.HandlerFunc(rolldice))

	// サーバー全体に対してHTTP計装を追加します。
	handler := otelhttp.NewHandler(mux, "/")
	return handler
}
```
<!-- prettier-ignore-end -->

### カスタム計装を追加する {#add-custom-instrumentation}

計装ライブラリは、システムの境界（たとえばHTTPリクエストの受信および送信）でテレメトリーを収集しますが、アプリケーション内部で何が起きているかまでは捕捉しません。
そのためには、カスタムの[手動計装](../instrumentation/)を記述する必要があります。

`rolldice.go`を修正して、OpenTelemetryのAPIを使ってカスタム計装を追加しましょう。

<!-- prettier-ignore-start -->
<!--?code-excerpt "rolldice.go" from="package main"?-->
```go
package main

import (
	"io"
	"math/rand"
	"net/http"
	"strconv"

	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/metric"

	"go.opentelemetry.io/contrib/bridges/otelslog"
)

const name = "go.opentelemetry.io/contrib/examples/dice"

var (
	tracer  = otel.Tracer(name)
	meter   = otel.Meter(name)
	logger  = otelslog.NewLogger(name)
	rollCnt metric.Int64Counter
)

func init() {
	var err error
	rollCnt, err = meter.Int64Counter("dice.rolls",
		metric.WithDescription("The number of rolls by roll value"),
		metric.WithUnit("{roll}"))
	if err != nil {
		panic(err)
	}
}

func rolldice(w http.ResponseWriter, r *http.Request) {
	ctx, span := tracer.Start(r.Context(), "roll")
	defer span.End()

	roll := 1 + rand.Intn(6)

	var msg string
	if player := r.PathValue("player"); player != "" {
		msg = player + " is rolling the dice"
	} else {
		msg = "Anonymous player is rolling the dice"
	}
	logger.InfoContext(ctx, msg, "result", roll)

	rollValueAttr := attribute.Int("roll.value", roll)
	span.SetAttributes(rollValueAttr)
	rollCnt.Add(ctx, 1, metric.WithAttributes(rollValueAttr))

	resp := strconv.Itoa(roll) + "\n"
	if _, err := io.WriteString(w, resp); err != nil {
		logger.ErrorContext(ctx, "Write failed", "error", err)
	}
}
```
<!-- prettier-ignore-end -->

トレースまたはメトリクスのどちらか一方のみを使用している場合は、もう一方のテレメトリータイプに対する計装のコードは省略できます。

### アプリケーションを実行する {#run-the-application}

次のコマンドでアプリケーションをビルドして実行します。

```sh
go mod tidy
export OTEL_RESOURCE_ATTRIBUTES="service.name=dice,service.version=0.1.0"
go run .
```

ウェブブラウザで<http://localhost:8080/rolldice/Alice>を開いてください。
サーバーにリクエストを送信すると、トレース内の2つのスパンが送出され、コンソールに表示されます。
計装ライブラリによって生成されたスパンは、`/rolldice/{player}`ルートへのリクエストのライフタイムを追跡します。
`roll`という名前のスパンは手動で作成されたもので、前述のスパンの子スパンとなっています。

<details>
<summary>出力例</summary>

```json
{
	"Name": "roll",
	"SpanContext": {
		"TraceID": "f00f8045a6c78b3aa5ecaca9f3b971b4",
		"SpanID": "f641bd25400a1b70",
		"TraceFlags": "01",
		"TraceState": "",
		"Remote": false
	},
	"Parent": {
		"TraceID": "f00f8045a6c78b3aa5ecaca9f3b971b4",
		"SpanID": "a10f1d2ca2f685c9",
		"TraceFlags": "01",
		"TraceState": "",
		"Remote": false
	},
	"SpanKind": 1,
	"StartTime": "2026-01-28T09:58:44.298985982+01:00",
	"EndTime": "2026-01-28T09:58:44.299067482+01:00",
	"Attributes": [
		{
			"Key": "roll.value",
			"Value": {
				"Type": "INT64",
				"Value": 1
			}
		}
	],
	"Events": null,
	"Links": null,
	"Status": {
		"Code": "Unset",
		"Description": ""
	},
	"DroppedAttributes": 0,
	"DroppedEvents": 0,
	"DroppedLinks": 0,
	"ChildSpanCount": 0,
	"Resource": [
		{
			"Key": "service.name",
			"Value": {
				"Type": "STRING",
				"Value": "dice"
			}
		},
		{
			"Key": "service.version",
			"Value": {
				"Type": "STRING",
				"Value": "0.1.0"
			}
		},
		{
			"Key": "telemetry.sdk.language",
			"Value": {
				"Type": "STRING",
				"Value": "go"
			}
		},
		{
			"Key": "telemetry.sdk.name",
			"Value": {
				"Type": "STRING",
				"Value": "opentelemetry"
			}
		},
		{
			"Key": "telemetry.sdk.version",
			"Value": {
				"Type": "STRING",
				"Value": "1.39.0"
			}
		}
	],
	"InstrumentationScope": {
		"Name": "go.opentelemetry.io/contrib/examples/dice",
		"Version": "",
		"SchemaURL": "",
		"Attributes": null
	},
	"InstrumentationLibrary": {
		"Name": "go.opentelemetry.io/contrib/examples/dice",
		"Version": "",
		"SchemaURL": "",
		"Attributes": null
	}
}
{
	"Name": "/",
	"SpanContext": {
		"TraceID": "f00f8045a6c78b3aa5ecaca9f3b971b4",
		"SpanID": "a10f1d2ca2f685c9",
		"TraceFlags": "01",
		"TraceState": "",
		"Remote": false
	},
	"Parent": {
		"TraceID": "00000000000000000000000000000000",
		"SpanID": "0000000000000000",
		"TraceFlags": "00",
		"TraceState": "",
		"Remote": false
	},
	"SpanKind": 2,
	"StartTime": "2026-01-28T09:58:44.298951202+01:00",
	"EndTime": "2026-01-28T09:58:44.299109293+01:00",
	"Attributes": [
		{
			"Key": "server.address",
			"Value": {
				"Type": "STRING",
				"Value": "localhost"
			}
		},
		{
			"Key": "http.request.method",
			"Value": {
				"Type": "STRING",
				"Value": "GET"
			}
		},
		{
			"Key": "url.scheme",
			"Value": {
				"Type": "STRING",
				"Value": "http"
			}
		},
		{
			"Key": "server.port",
			"Value": {
				"Type": "INT64",
				"Value": 8080
			}
		},
		{
			"Key": "network.peer.address",
			"Value": {
				"Type": "STRING",
				"Value": "127.0.0.1"
			}
		},
		{
			"Key": "network.peer.port",
			"Value": {
				"Type": "INT64",
				"Value": 43804
			}
		},
		{
			"Key": "user_agent.original",
			"Value": {
				"Type": "STRING",
				"Value": "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0"
			}
		},
		{
			"Key": "client.address",
			"Value": {
				"Type": "STRING",
				"Value": "127.0.0.1"
			}
		},
		{
			"Key": "url.path",
			"Value": {
				"Type": "STRING",
				"Value": "/rolldice/Alice"
			}
		},
		{
			"Key": "network.protocol.version",
			"Value": {
				"Type": "STRING",
				"Value": "1.1"
			}
		},
		{
			"Key": "http.response.body.size",
			"Value": {
				"Type": "INT64",
				"Value": 2
			}
		},
		{
			"Key": "http.response.status_code",
			"Value": {
				"Type": "INT64",
				"Value": 200
			}
		}
	],
	"Events": null,
	"Links": null,
	"Status": {
		"Code": "Unset",
		"Description": ""
	},
	"DroppedAttributes": 0,
	"DroppedEvents": 0,
	"DroppedLinks": 0,
	"ChildSpanCount": 1,
	"Resource": [
		{
			"Key": "service.name",
			"Value": {
				"Type": "STRING",
				"Value": "dice"
			}
		},
		{
			"Key": "service.version",
			"Value": {
				"Type": "STRING",
				"Value": "0.1.0"
			}
		},
		{
			"Key": "telemetry.sdk.language",
			"Value": {
				"Type": "STRING",
				"Value": "go"
			}
		},
		{
			"Key": "telemetry.sdk.name",
			"Value": {
				"Type": "STRING",
				"Value": "opentelemetry"
			}
		},
		{
			"Key": "telemetry.sdk.version",
			"Value": {
				"Type": "STRING",
				"Value": "1.39.0"
			}
		}
	],
	"InstrumentationScope": {
		"Name": "go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp",
		"Version": "0.64.0",
		"SchemaURL": "",
		"Attributes": null
	},
	"InstrumentationLibrary": {
		"Name": "go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp",
		"Version": "0.64.0",
		"SchemaURL": "",
		"Attributes": null
	}
}
```

</details>

トレースとともに、ログメッセージもコンソールに送出されます。

<details>
<summary>出力例</summary>

```json
{
  "Timestamp": "2026-01-28T09:58:44.29900397+01:00",
  "ObservedTimestamp": "2026-01-28T09:58:44.299031783+01:00",
  "Severity": 9,
  "SeverityText": "INFO",
  "Body": {
    "Type": "String",
    "Value": "Alice is rolling the dice"
  },
  "Attributes": [
    {
      "Key": "result",
      "Value": {
        "Type": "Int64",
        "Value": 1
      }
    }
  ],
  "TraceID": "f00f8045a6c78b3aa5ecaca9f3b971b4",
  "SpanID": "f641bd25400a1b70",
  "TraceFlags": "01",
  "Resource": [
    {
      "Key": "service.name",
      "Value": {
        "Type": "STRING",
        "Value": "dice"
      }
    },
    {
      "Key": "service.version",
      "Value": {
        "Type": "STRING",
        "Value": "0.1.0"
      }
    },
    {
      "Key": "telemetry.sdk.language",
      "Value": {
        "Type": "STRING",
        "Value": "go"
      }
    },
    {
      "Key": "telemetry.sdk.name",
      "Value": {
        "Type": "STRING",
        "Value": "opentelemetry"
      }
    },
    {
      "Key": "telemetry.sdk.version",
      "Value": {
        "Type": "STRING",
        "Value": "1.39.0"
      }
    }
  ],
  "Scope": {
    "Name": "go.opentelemetry.io/contrib/examples/dice",
    "Version": "",
    "SchemaURL": "",
    "Attributes": {}
  },
  "DroppedAttributes": 0
}
```

</details>

<http://localhost:8080/rolldice/Alice>のページを数回リロードし、しばらく待つかアプリケーションを終了すると、コンソール出力にメトリクスが表示されます。
コンソールには`dice.rolls`メトリクスが送出され、それぞれの出目ごとのカウントが個別に表示されます。
さらに、計装ライブラリによって生成された HTTPメトリクスも確認できます。

<details>
<summary>出力例</summary>

```json
{
  "Resource": [
    {
      "Key": "service.name",
      "Value": {
        "Type": "STRING",
        "Value": "dice"
      }
    },
    {
      "Key": "service.version",
      "Value": {
        "Type": "STRING",
        "Value": "0.1.0"
      }
    },
    {
      "Key": "telemetry.sdk.language",
      "Value": {
        "Type": "STRING",
        "Value": "go"
      }
    },
    {
      "Key": "telemetry.sdk.name",
      "Value": {
        "Type": "STRING",
        "Value": "opentelemetry"
      }
    },
    {
      "Key": "telemetry.sdk.version",
      "Value": {
        "Type": "STRING",
        "Value": "1.39.0"
      }
    }
  ],
  "ScopeMetrics": [
    {
      "Scope": {
        "Name": "go.opentelemetry.io/contrib/examples/dice",
        "Version": "",
        "SchemaURL": "",
        "Attributes": null
      },
      "Metrics": [
        {
          "Name": "dice.rolls",
          "Description": "The number of rolls by roll value",
          "Unit": "{roll}",
          "Data": {
            "DataPoints": [
              {
                "Attributes": [
                  {
                    "Key": "roll.value",
                    "Value": {
                      "Type": "INT64",
                      "Value": 2
                    }
                  }
                ],
                "StartTime": "2026-01-28T09:58:36.297218201+01:00",
                "Time": "2026-01-28T09:59:04.826103626+01:00",
                "Value": 2,
                "Exemplars": [
                  {
                    "FilteredAttributes": null,
                    "Time": "2026-01-28T09:58:58.310873844+01:00",
                    "Value": 1,
                    "SpanID": "MFfLVpcp2E8=",
                    "TraceID": "KGizZKX5cz9DqgG95WoBvQ=="
                  }
                ]
              },
              {
                "Attributes": [
                  {
                    "Key": "roll.value",
                    "Value": {
                      "Type": "INT64",
                      "Value": 3
                    }
                  }
                ],
                "StartTime": "2026-01-28T09:58:36.297218201+01:00",
                "Time": "2026-01-28T09:59:04.826103626+01:00",
                "Value": 1,
                "Exemplars": [
                  {
                    "FilteredAttributes": null,
                    "Time": "2026-01-28T09:58:48.446722639+01:00",
                    "Value": 1,
                    "SpanID": "Xa6wKaCre6k=",
                    "TraceID": "VncSsITnUTtWpMAFGRoLng=="
                  }
                ]
              },
              {
                "Attributes": [
                  {
                    "Key": "roll.value",
                    "Value": {
                      "Type": "INT64",
                      "Value": 1
                    }
                  }
                ],
                "StartTime": "2026-01-28T09:58:36.297218201+01:00",
                "Time": "2026-01-28T09:59:04.826103626+01:00",
                "Value": 4,
                "Exemplars": [
                  {
                    "FilteredAttributes": null,
                    "Time": "2026-01-28T09:58:56.340332341+01:00",
                    "Value": 1,
                    "SpanID": "RAsXIMJQIcg=",
                    "TraceID": "NbZh738k1TlZ/I32RuLS/A=="
                  }
                ]
              },
              {
                "Attributes": [
                  {
                    "Key": "roll.value",
                    "Value": {
                      "Type": "INT64",
                      "Value": 5
                    }
                  }
                ],
                "StartTime": "2026-01-28T09:58:36.297218201+01:00",
                "Time": "2026-01-28T09:59:04.826103626+01:00",
                "Value": 1,
                "Exemplars": [
                  {
                    "FilteredAttributes": null,
                    "Time": "2026-01-28T09:58:55.131367409+01:00",
                    "Value": 1,
                    "SpanID": "eVC0Kj4/vzw=",
                    "TraceID": "NVuservV50eLN7sNu9Sm4A=="
                  }
                ]
              }
            ],
            "Temporality": "CumulativeTemporality",
            "IsMonotonic": true
          }
        }
      ]
    },
    {
      "Scope": {
        "Name": "go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp",
        "Version": "0.64.0",
        "SchemaURL": "",
        "Attributes": null
      },
      "Metrics": [
        {
          "Name": "http.server.request.body.size",
          "Description": "Size of HTTP server request bodies.",
          "Unit": "By",
          "Data": {
            "DataPoints": [
              {
                "Attributes": [
                  {
                    "Key": "http.request.method",
                    "Value": {
                      "Type": "STRING",
                      "Value": "GET"
                    }
                  },
                  {
                    "Key": "http.response.status_code",
                    "Value": {
                      "Type": "INT64",
                      "Value": 200
                    }
                  },
                  {
                    "Key": "network.protocol.name",
                    "Value": {
                      "Type": "STRING",
                      "Value": "http"
                    }
                  },
                  {
                    "Key": "network.protocol.version",
                    "Value": {
                      "Type": "STRING",
                      "Value": "1.1"
                    }
                  },
                  {
                    "Key": "server.address",
                    "Value": {
                      "Type": "STRING",
                      "Value": "localhost"
                    }
                  },
                  {
                    "Key": "server.port",
                    "Value": {
                      "Type": "INT64",
                      "Value": 8080
                    }
                  },
                  {
                    "Key": "url.scheme",
                    "Value": {
                      "Type": "STRING",
                      "Value": "http"
                    }
                  }
                ],
                "StartTime": "2026-01-28T09:58:36.297829232+01:00",
                "Time": "2026-01-28T09:59:04.82612558+01:00",
                "Count": 8,
                "Bounds": [
                  0, 5, 10, 25, 50, 75, 100, 250, 500, 750, 1000, 2500, 5000,
                  7500, 10000
                ],
                "BucketCounts": [
                  8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
                ],
                "Min": 0,
                "Max": 0,
                "Sum": 0,
                "Exemplars": [
                  {
                    "FilteredAttributes": null,
                    "Time": "2026-01-28T09:58:58.310903274+01:00",
                    "Value": 0,
                    "SpanID": "YQY4fyjDhiQ=",
                    "TraceID": "KGizZKX5cz9DqgG95WoBvQ=="
                  }
                ]
              }
            ],
            "Temporality": "CumulativeTemporality"
          }
        },
        {
          "Name": "http.server.response.body.size",
          "Description": "Size of HTTP server response bodies.",
          "Unit": "By",
          "Data": {
            "DataPoints": [
              {
                "Attributes": [
                  {
                    "Key": "http.request.method",
                    "Value": {
                      "Type": "STRING",
                      "Value": "GET"
                    }
                  },
                  {
                    "Key": "http.response.status_code",
                    "Value": {
                      "Type": "INT64",
                      "Value": 200
                    }
                  },
                  {
                    "Key": "network.protocol.name",
                    "Value": {
                      "Type": "STRING",
                      "Value": "http"
                    }
                  },
                  {
                    "Key": "network.protocol.version",
                    "Value": {
                      "Type": "STRING",
                      "Value": "1.1"
                    }
                  },
                  {
                    "Key": "server.address",
                    "Value": {
                      "Type": "STRING",
                      "Value": "localhost"
                    }
                  },
                  {
                    "Key": "server.port",
                    "Value": {
                      "Type": "INT64",
                      "Value": 8080
                    }
                  },
                  {
                    "Key": "url.scheme",
                    "Value": {
                      "Type": "STRING",
                      "Value": "http"
                    }
                  }
                ],
                "StartTime": "2026-01-28T09:58:36.297836516+01:00",
                "Time": "2026-01-28T09:59:04.826130841+01:00",
                "Count": 8,
                "Bounds": [
                  0, 5, 10, 25, 50, 75, 100, 250, 500, 750, 1000, 2500, 5000,
                  7500, 10000
                ],
                "BucketCounts": [
                  0, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
                ],
                "Min": 2,
                "Max": 2,
                "Sum": 16,
                "Exemplars": [
                  {
                    "FilteredAttributes": null,
                    "Time": "2026-01-28T09:58:58.310905174+01:00",
                    "Value": 2,
                    "SpanID": "YQY4fyjDhiQ=",
                    "TraceID": "KGizZKX5cz9DqgG95WoBvQ=="
                  }
                ]
              }
            ],
            "Temporality": "CumulativeTemporality"
          }
        },
        {
          "Name": "http.server.request.duration",
          "Description": "Duration of HTTP server requests.",
          "Unit": "s",
          "Data": {
            "DataPoints": [
              {
                "Attributes": [
                  {
                    "Key": "http.request.method",
                    "Value": {
                      "Type": "STRING",
                      "Value": "GET"
                    }
                  },
                  {
                    "Key": "http.response.status_code",
                    "Value": {
                      "Type": "INT64",
                      "Value": 200
                    }
                  },
                  {
                    "Key": "network.protocol.name",
                    "Value": {
                      "Type": "STRING",
                      "Value": "http"
                    }
                  },
                  {
                    "Key": "network.protocol.version",
                    "Value": {
                      "Type": "STRING",
                      "Value": "1.1"
                    }
                  },
                  {
                    "Key": "server.address",
                    "Value": {
                      "Type": "STRING",
                      "Value": "localhost"
                    }
                  },
                  {
                    "Key": "server.port",
                    "Value": {
                      "Type": "INT64",
                      "Value": 8080
                    }
                  },
                  {
                    "Key": "url.scheme",
                    "Value": {
                      "Type": "STRING",
                      "Value": "http"
                    }
                  }
                ],
                "StartTime": "2026-01-28T09:58:36.297850485+01:00",
                "Time": "2026-01-28T09:59:04.826135353+01:00",
                "Count": 8,
                "Bounds": [
                  0.005, 0.01, 0.025, 0.05, 0.075, 0.1, 0.25, 0.5, 0.75, 1, 2.5,
                  5, 7.5, 10
                ],
                "BucketCounts": [8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                "Min": 0.000067593,
                "Max": 0.000635093,
                "Sum": 0.001617854,
                "Exemplars": [
                  {
                    "FilteredAttributes": null,
                    "Time": "2026-01-28T09:58:58.310908469+01:00",
                    "Value": 0.000197799,
                    "SpanID": "YQY4fyjDhiQ=",
                    "TraceID": "KGizZKX5cz9DqgG95WoBvQ=="
                  }
                ]
              }
            ],
            "Temporality": "CumulativeTemporality"
          }
        }
      ]
    }
  ]
}
```

</details>

## 次のステップ {#next-steps}

コードに計装を追加する方法について、詳しくは[手動計装](/docs/languages/go/instrumentation/)のドキュメントを参照してください。

1つ以上のテレメトリーバックエンドに[テレメトリーデータをエクスポートする](/docs/languages/go/exporters/)ために、適切なエクスポーターを設定することも必要です。

より複雑な例を試してみたい場合は、[OpenTelemetryデモ](/docs/demo/)をご覧ください。
このデモには、Goで実装された[Checkout Service](/docs/demo/services/checkout/)、[Product Catalog Service](/docs/demo/services/product-catalog/)、[Accounting Service](/docs/demo/services/accounting/)が含まれています。

[traces]: /docs/concepts/signals/traces/
[metrics]: /docs/concepts/signals/metrics/
[logs]: /docs/concepts/signals/logs/
