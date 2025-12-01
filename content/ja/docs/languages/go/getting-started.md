---
title: Getting Started（入門）
weight: 10
default_lang_commit: 276d7eb3f936deef6487cdd2b1d89822951da6c8
# prettier-ignore
cSpell:ignore: chan fatalln funcs intn itoa khtml otelhttp rolldice stdouttrace strconv
---

<!-- markdownlint-disable blanks-around-fences -->
<?code-excerpt path-base="examples/go/dice"?>

このページでは、GoにおけるOpenTelemetryの始め方を紹介します。

シンプルなアプリケーションに対して手動で計装を行い、[トレース][traces]、[メトリクス][metrics]、[ログ][logs]をコンソールに出力する方法を学ぶことができます。

{{% alert title="Note" %}}

ログシグナルは現在も実験的な段階にあります。将来のバージョンで破壊的変更が加えられる可能性があります。

{{% /alert %}}

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
	"log"
	"net/http"
)

func main() {
	http.HandleFunc("/rolldice", rolldice)

	log.Fatal(http.ListenAndServe(":8080", nil))
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

	resp := strconv.Itoa(roll) + "\n"
	if _, err := io.WriteString(w, resp); err != nil {
		log.Printf("Write failed: %v\n", err)
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

### 依存関係を追加する {#add-dependencies}

次のパッケージをインストールしてください

```shell
go get "go.opentelemetry.io/otel" \
  "go.opentelemetry.io/otel/exporters/stdout/stdoutmetric" \
  "go.opentelemetry.io/otel/exporters/stdout/stdouttrace" \
  "go.opentelemetry.io/otel/exporters/stdout/stdoutlog" \
  "go.opentelemetry.io/otel/sdk/log" \
  "go.opentelemetry.io/otel/log/global" \
  "go.opentelemetry.io/otel/propagation" \
  "go.opentelemetry.io/otel/sdk/metric" \
  "go.opentelemetry.io/otel/sdk/resource" \
  "go.opentelemetry.io/otel/sdk/trace" \
  "go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp"\
  "go.opentelemetry.io/contrib/bridges/otelslog"
```

これにより、OpenTelemetryのSDKコンポーネントと`net/http`の計装がインストールされます。

別のネットワークリクエスト用ライブラリを計装する場合は、対応する計装用ライブラリをインストールする必要があります。
詳しくは、[ライブラリ](/docs/languages/go/libraries/)をご覧ください。

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
	traceExporter, err := stdouttrace.New(
		stdouttrace.WithPrettyPrint())
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
	metricExporter, err := stdoutmetric.New()
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
	logExporter, err := stdoutlog.New()
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
		BaseContext:  func(_ net.Listener) context.Context { return ctx },
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

	// handleFuncはmux.HandleFuncの代替であり、
	// ハンドラーのHTTP計装において、パターンをhttp.routeとして付加します。
	handleFunc := func(pattern string, handlerFunc func(http.ResponseWriter, *http.Request)) {
		// Configure the "http.route" for the HTTP instrumentation.
		handler := otelhttp.WithRouteTag(pattern, http.HandlerFunc(handlerFunc))
		mux.Handle(pattern, handler)
	}

	// ハンドラーの登録。
	handleFunc("/rolldice/", rolldice)
	handleFunc("/rolldice/{player}", rolldice)

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
	"fmt"
	"io"
	"log"
	"math/rand"
	"net/http"
	"strconv"

	"go.opentelemetry.io/contrib/bridges/otelslog"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/metric"
)

const name = "go.opentelemetry.io/otel/example/dice"

var (
	tracer = otel.Tracer(name)
	meter  = otel.Meter(name)
	logger = otelslog.NewLogger(name)
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
		msg = fmt.Sprintf("%s is rolling the dice", player)
	} else {
		msg = "Anonymous player is rolling the dice"
	}
	logger.InfoContext(ctx, msg, "result", roll)

	rollValueAttr := attribute.Int("roll.value", roll)
	span.SetAttributes(rollValueAttr)
	rollCnt.Add(ctx, 1, metric.WithAttributes(rollValueAttr))

	resp := strconv.Itoa(roll) + "\n"
	if _, err := io.WriteString(w, resp); err != nil {
		log.Printf("Write failed: %v\n", err)
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
		"TraceID": "829fb7ceb787403c96eac3caf285c965",
		"SpanID": "8b6b408b6c1a35e5",
		"TraceFlags": "01",
		"TraceState": "",
		"Remote": false
	},
	"Parent": {
		"TraceID": "829fb7ceb787403c96eac3caf285c965",
		"SpanID": "612be4bbdf450de6",
		"TraceFlags": "01",
		"TraceState": "",
		"Remote": false
	},
	"SpanKind": 1,
	"StartTime": "2023-09-25T12:42:06.177119576+02:00",
	"EndTime": "2023-09-25T12:42:06.177136776+02:00",
	"Attributes": [
		{
			"Key": "roll.value",
			"Value": {
				"Type": "INT64",
				"Value": 6
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
				"Value": "1.19.0-rc.1"
			}
		}
	],
	"InstrumentationLibrary": {
		"Name": "rolldice",
		"Version": "",
		"SchemaURL": ""
	}
}
{
	"Name": "/",
	"SpanContext": {
		"TraceID": "829fb7ceb787403c96eac3caf285c965",
		"SpanID": "612be4bbdf450de6",
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
	"StartTime": "2023-09-25T12:42:06.177071077+02:00",
	"EndTime": "2023-09-25T12:42:06.177158076+02:00",
	"Attributes": [
		{
			"Key": "http.method",
			"Value": {
				"Type": "STRING",
				"Value": "GET"
			}
		},
		{
			"Key": "http.scheme",
			"Value": {
				"Type": "STRING",
				"Value": "http"
			}
		},
		{
			"Key": "http.flavor",
			"Value": {
				"Type": "STRING",
				"Value": "1.1"
			}
		},
		{
			"Key": "net.host.name",
			"Value": {
				"Type": "STRING",
				"Value": "localhost"
			}
		},
		{
			"Key": "net.host.port",
			"Value": {
				"Type": "INT64",
				"Value": 8080
			}
		},
		{
			"Key": "net.sock.peer.addr",
			"Value": {
				"Type": "STRING",
				"Value": "::1"
			}
		},
		{
			"Key": "net.sock.peer.port",
			"Value": {
				"Type": "INT64",
				"Value": 49046
			}
		},
		{
			"Key": "http.user_agent",
			"Value": {
				"Type": "STRING",
				"Value": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36"
			}
		},
		{
			"Key": "http.route",
			"Value": {
				"Type": "STRING",
				"Value": "/rolldice/Alice"
			}
		},
		{
			"Key": "http.wrote_bytes",
			"Value": {
				"Type": "INT64",
				"Value": 2
			}
		},
		{
			"Key": "http.status_code",
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
				"Value": "1.19.0-rc.1"
			}
		}
	],
	"InstrumentationLibrary": {
		"Name": "go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp",
		"Version": "0.44.0",
		"SchemaURL": ""
	}
}
```

</details>

トレースとともに、ログメッセージもコンソールに送出されます。

<details>
<summary>出力例</summary>

```json
{
  "Timestamp": "2023-09-25T12:42:05.177136776+02:00",
  "ObservedTimestamp": "2023-09-25T12:42:06.809396011+02:00",
  "Severity": 9,
  "SeverityText": "",
  "Body": {
    "Type": "String",
    "Value": "Alice is rolling the dice"
  },
  "Attributes": [
    {
      "Key": "result",
      "Value": {
        "Type": "Int64",
        "Value": 6
      }
    }
  ],
  "TraceID": "829fb7ceb787403c96eac3caf285c965",
  "SpanID": "8b6b408b6c1a35e5",
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
        "Value": "1.19.0-rc.1"
      }
    }
  ],
  "Scope": {
    "Name": "rolldice",
    "Version": "",
    "SchemaURL": ""
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
        "Value": "1.19.0-rc.1"
      }
    }
  ],
  "ScopeMetrics": [
    {
      "Scope": {
        "Name": "rolldice",
        "Version": "",
        "SchemaURL": ""
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
                      "Value": 1
                    }
                  }
                ],
                "StartTime": "2023-09-25T12:42:04.279204638+02:00",
                "Time": "2023-09-25T12:42:15.482694258+02:00",
                "Value": 4
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
                "StartTime": "2023-09-25T12:42:04.279204638+02:00",
                "Time": "2023-09-25T12:42:15.482694258+02:00",
                "Value": 3
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
                "StartTime": "2023-09-25T12:42:04.279204638+02:00",
                "Time": "2023-09-25T12:42:15.482694258+02:00",
                "Value": 4
              },
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
                "StartTime": "2023-09-25T12:42:04.279204638+02:00",
                "Time": "2023-09-25T12:42:15.482694258+02:00",
                "Value": 2
              },
              {
                "Attributes": [
                  {
                    "Key": "roll.value",
                    "Value": {
                      "Type": "INT64",
                      "Value": 6
                    }
                  }
                ],
                "StartTime": "2023-09-25T12:42:04.279204638+02:00",
                "Time": "2023-09-25T12:42:15.482694258+02:00",
                "Value": 5
              },
              {
                "Attributes": [
                  {
                    "Key": "roll.value",
                    "Value": {
                      "Type": "INT64",
                      "Value": 4
                    }
                  }
                ],
                "StartTime": "2023-09-25T12:42:04.279204638+02:00",
                "Time": "2023-09-25T12:42:15.482694258+02:00",
                "Value": 9
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
        "Version": "0.44.0",
        "SchemaURL": ""
      },
      "Metrics": [
        {
          "Name": "http.server.request_content_length",
          "Description": "",
          "Unit": "",
          "Data": {
            "DataPoints": [
              {
                "Attributes": [
                  {
                    "Key": "http.flavor",
                    "Value": {
                      "Type": "STRING",
                      "Value": "1.1"
                    }
                  },
                  {
                    "Key": "http.method",
                    "Value": {
                      "Type": "STRING",
                      "Value": "GET"
                    }
                  },
                  {
                    "Key": "http.route",
                    "Value": {
                      "Type": "STRING",
                      "Value": "/rolldice/Alice"
                    }
                  },
                  {
                    "Key": "http.scheme",
                    "Value": {
                      "Type": "STRING",
                      "Value": "http"
                    }
                  },
                  {
                    "Key": "http.status_code",
                    "Value": {
                      "Type": "INT64",
                      "Value": 200
                    }
                  },
                  {
                    "Key": "net.host.name",
                    "Value": {
                      "Type": "STRING",
                      "Value": "localhost"
                    }
                  },
                  {
                    "Key": "net.host.port",
                    "Value": {
                      "Type": "INT64",
                      "Value": 8080
                    }
                  }
                ],
                "StartTime": "2023-09-25T12:42:04.279212238+02:00",
                "Time": "2023-09-25T12:42:15.482695758+02:00",
                "Value": 0
              }
            ],
            "Temporality": "CumulativeTemporality",
            "IsMonotonic": true
          }
        },
        {
          "Name": "http.server.response_content_length",
          "Description": "",
          "Unit": "",
          "Data": {
            "DataPoints": [
              {
                "Attributes": [
                  {
                    "Key": "http.flavor",
                    "Value": {
                      "Type": "STRING",
                      "Value": "1.1"
                    }
                  },
                  {
                    "Key": "http.method",
                    "Value": {
                      "Type": "STRING",
                      "Value": "GET"
                    }
                  },
                  {
                    "Key": "http.route",
                    "Value": {
                      "Type": "STRING",
                      "Value": "/rolldice/Alice"
                    }
                  },
                  {
                    "Key": "http.scheme",
                    "Value": {
                      "Type": "STRING",
                      "Value": "http"
                    }
                  },
                  {
                    "Key": "http.status_code",
                    "Value": {
                      "Type": "INT64",
                      "Value": 200
                    }
                  },
                  {
                    "Key": "net.host.name",
                    "Value": {
                      "Type": "STRING",
                      "Value": "localhost"
                    }
                  },
                  {
                    "Key": "net.host.port",
                    "Value": {
                      "Type": "INT64",
                      "Value": 8080
                    }
                  }
                ],
                "StartTime": "2023-09-25T12:42:04.279214438+02:00",
                "Time": "2023-09-25T12:42:15.482696158+02:00",
                "Value": 54
              }
            ],
            "Temporality": "CumulativeTemporality",
            "IsMonotonic": true
          }
        },
        {
          "Name": "http.server.duration",
          "Description": "",
          "Unit": "",
          "Data": {
            "DataPoints": [
              {
                "Attributes": [
                  {
                    "Key": "http.flavor",
                    "Value": {
                      "Type": "STRING",
                      "Value": "1.1"
                    }
                  },
                  {
                    "Key": "http.method",
                    "Value": {
                      "Type": "STRING",
                      "Value": "GET"
                    }
                  },
                  {
                    "Key": "http.route",
                    "Value": {
                      "Type": "STRING",
                      "Value": "/rolldice/Alice"
                    }
                  },
                  {
                    "Key": "http.scheme",
                    "Value": {
                      "Type": "STRING",
                      "Value": "http"
                    }
                  },
                  {
                    "Key": "http.status_code",
                    "Value": {
                      "Type": "INT64",
                      "Value": 200
                    }
                  },
                  {
                    "Key": "net.host.name",
                    "Value": {
                      "Type": "STRING",
                      "Value": "localhost"
                    }
                  },
                  {
                    "Key": "net.host.port",
                    "Value": {
                      "Type": "INT64",
                      "Value": 8080
                    }
                  }
                ],
                "StartTime": "2023-09-25T12:42:04.279219438+02:00",
                "Time": "2023-09-25T12:42:15.482697158+02:00",
                "Count": 27,
                "Bounds": [
                  0, 5, 10, 25, 50, 75, 100, 250, 500, 750, 1000, 2500, 5000,
                  7500, 10000
                ],
                "BucketCounts": [
                  0, 27, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
                ],
                "Min": {},
                "Max": {},
                "Sum": 2.1752759999999993
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
