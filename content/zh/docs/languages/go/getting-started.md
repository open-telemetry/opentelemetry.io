---
title: 开始
weight: 10
default_lang_commit: 9363855aba3bb269c682c41f869601081a6c7807
# prettier-ignore
cSpell:ignore: autoexport chan fatalln funcs intn itoa otelhttp rolldice stdouttrace strconv
---

<!-- markdownlint-disable blanks-around-fences -->
<?code-excerpt path-base="examples/go/dice/instrumented"?>

本页面将向你展示如何在 Go 中开始使用 OpenTelemetry。

你将学习如何手动为一个简单的应用程序进行插桩，并且使其能将 [traces][]、[metrics][] 和 [logs][] 输出到终端。

> [!NOTE] 注意
>
> 日志信号仍处于实验阶段，在未来版本可能会引入不兼容的更改。

## 前置条件{#prerequisites}

确保你本地已经安装了：

- [Go](https://go.dev/) 1.23 及更高版本。

## 示例应用程序{#example-application}

以下示例使用了一个基本的 [`net/http`](https://pkg.go.dev/net/http) 应用程序。
如果你没有使用 `net/http` 也没关系 —— 你仍然可以在其他 Web 框架中使用
OpenTelemetry Go，比如 Gin 和 Echo，有关支持框架的完整库列表，请参阅
[registry](/ecosystem/registry/?component=instrumentation&language=go)。

如果需要更复杂的示例，请参阅 [examples](/docs/languages/go/examples/)。

### 开始{#setup}

首先，需要在新的目录中设置 `go.mod`：

```shell
go mod init dice
```

### 创建并启动 HTTP 服务器{#create-and-launch-an-http-server}

在同一个文件夹中，创建一个 `main.go` 文件，并添加以下代码到这个文件中：

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
  // 合理地处理中断信号（Ctrl+C）。
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt)
	defer stop()

	// 启动 HTTP 服务器。
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

	// 等待中断信号。
	select {
	case err = <-srvErr:
		// 启动 HTTP 服务器时出错。
		return err
	case <-ctx.Done():
		// 等待第一个 CTRL+C 信号。
		// 尽快停止接受信号通知。
		stop()
	}

	// 当调用 Shutdown 时，ListenAndServe 会立即返回 ErrServerClosed 错误。
	err = srv.Shutdown(context.Background())
	return err
}

func newHTTPHandler() http.Handler {
	mux := http.NewServeMux()

	// 注册 Handler。
	mux.HandleFunc("/rolldice/", rolldice)
	mux.HandleFunc("/rolldice/{player}", rolldice)

	return mux
}
```

创建另一个叫做 `rolldice.go` 的文件，并添加以下代码到该文件。

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

通过以下命令构建并运行应用程序：

```shell
go run .
```

在你的浏览器中打开 <http://localhost:8080/rolldice> 确保应用程序正常工作。

## 添加 OpenTelemetry 插桩{#add-opentelemetry-instrumentation}

现在我们将展示如何向示例应用程序添加 OpenTelemetry 插桩。如果你正在使用自己的应用程序，也可以按照步骤操作，只需要注意你的代码可能会略有不同。

### 初始化 OpenTelemetry SDK{#initialize-the-opentelemetry-sdk}

首先我们需要初始化 OpenTelemetry SDK。这对任何需要导出遥测数据的应用程序都是**必须**的。

创建一个 `otel.go` 文件，并在其中编写 OpenTelemetry SDK 的初始化代码：

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

// setupOTelSDK 初始化 OpenTelemetry 的管道。
// 如果没有返回错误，用户需要确保在之后调用返回的 shutdown 方法进行清理。
func setupOTelSDK(ctx context.Context) (func(context.Context) error, error) {
	var shutdownFuncs []func(context.Context) error
	var err error

	// shutdown 会调用所有通过 shutdownFuncs 注册的清理函数。
	// 所有返回的错误都会被合并到一起。
	// 每个注册的清理函数仅会被调用一次。
	shutdown := func(ctx context.Context) error {
		var err error
		for _, fn := range shutdownFuncs {
			err = errors.Join(err, fn(ctx))
		}
		shutdownFuncs = nil
		return err
	}

	// handleErr 用于调用 shutdown 进行清理，并确保返回所有的错误。
	handleErr := func(inErr error) {
		err = errors.Join(inErr, shutdown(ctx))
	}

	// 设置上下文传播器（用于跨服务传递追踪信息）。
	prop := newPropagator()
	otel.SetTextMapPropagator(prop)

	// 初始化 trace 提供者。
	tracerProvider, err := newTracerProvider()
	if err != nil {
		handleErr(err)
		return shutdown, err
	}
	shutdownFuncs = append(shutdownFuncs, tracerProvider.Shutdown)
	otel.SetTracerProvider(tracerProvider)

	// 初始化 Meter 提供者。
	meterProvider, err := newMeterProvider()
	if err != nil {
		handleErr(err)
		return shutdown, err
	}
	shutdownFuncs = append(shutdownFuncs, meterProvider.Shutdown)
	otel.SetMeterProvider(meterProvider)

	// 初始化日志提供者。
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
			// 默认批处理时间为 5 秒，这里设置为 1 秒用于演示。
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
			// 默认采集间隔为 1 分钟，这里设置为 3 秒用于演示。
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

> [!TIP] 提示
>
> 上面的示例使用控制台（stdout）导出器进行演示。你可以使用
> [`autoexport`](https://pkg.go.dev/go.opentelemetry.io/contrib/exporters/autoexport)
> 包，通过 `OTEL_TRACES_EXPORTER`、`OTEL_METRICS_EXPORTER`、`OTEL_LOGS_EXPORTER`
> 和 `OTEL_EXPORTER_OTLP_ENDPOINT` 等环境变量来配置导出器。详情请参阅
> [导出器](/docs/languages/go/exporters/)。

如果你只使用链路追踪（tracing）或者指标（metrics），你可以忽略对应的 TracerProvider 或者 MeterProvider 的初始化代码。

### 为 HTTP 服务器添加插桩{#instrument-the-http-server}

现在我们已经为 OpenTelemetry SDK 完成了初始化，可以为 HTTP 服务器添加插桩了。

修改 `main.go` 文件，添加设置并初始化 OpenTelemetry SDK 的代码，并使用 `otelhttp` 插桩库对 HTTP 服务器进行插桩处理：

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
	// 优雅地处理中断信号（Ctrl+C）。
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt)
	defer stop()

	// 设置并初始化 OpenTelemetry SDK。
	otelShutdown, err := setupOTelSDK(ctx)
	if err != nil {
		return err
	}
	// 确保在程序结束之前调用 shutdown 方法清理资源。
	defer func() {
		err = errors.Join(err, otelShutdown(context.Background()))
	}()

	// 启动 HTTP 服务器。
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

	// 等待中断信号。
	select {
	case err = <-srvErr:
		// 启动 HTTP 服务器时出错。
		return err
	case <-ctx.Done():
		// 等待第一个 CTRL+C 信号。
		// 尽快停止接受信号通知。
		stop()
	}

	// 当调用 Shutdown 时，ListenAndServe 会立即返回 ErrServerClosed 错误。
	err = srv.Shutdown(context.Background())
	return err
}

func newHTTPHandler() http.Handler {
	mux := http.NewServeMux()

	// 注册 Handler。
	mux.Handle("/rolldice", http.HandlerFunc(rolldice))
	mux.Handle("/rolldice/{player}", http.HandlerFunc(rolldice))

	// 为整个服务器添加 HTTP 插桩处理器。
	handler := otelhttp.NewHandler(mux, "/")
	return handler
}
```
<!-- prettier-ignore-end -->

### 添加自定义插桩器（Instrumentation）{#add-custom-instrumentation}

插桩库用于捕获系统边缘的遥测数据，比如传入和传出的 HTTP 请求，但是它们没办法捕获应用程序内部的执行情况。为此，你需要编写一些自定义[手动插桩](../instrumentation/)。

修改 `rolldice.go` 文件，使用 OpenTelemetry API 添加自定义插桩逻辑：

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

请注意，如果你只使用链路追踪（tracing）或指标（metrics），可以忽略对应的其他遥测类型的插桩代码。

### 运行应用程序{#run-the-application}

通过以下命令构建并运行应用程序：

```sh
go mod tidy
export OTEL_RESOURCE_ATTRIBUTES="service.name=dice,service.version=0.1.0"
go run .
```

在你的浏览器打开 <http://localhost:8080/rolldice/Alice>。当你向服务器发送请求的时候，控制台将会输出两个 span。一个是由插桩库生成的 span，用于追踪对 `/rolldice/{player}` 路由的请求生命周期。另一个名为 `roll` 的 span 是手动创建的，它是之前提到的 span 的子 span。

<details>
<summary>查看示例输出</summary>

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

除了追踪信息之外，日志信息也会被输出到控制台。

<details>
<summary>查看示例输出</summary>

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

多刷新几次 <http://localhost:8080/rolldice/Alice> 页面，然后等待一会或者终止你的应用程序，随后你会在控制台输出中看到指标信息。你会看到 `dice.rolls` 指标被打印到控制台，其中每个骰子点数都有单独的计数，同时还会看到由插桩库生成的 HTTP 请求相关指标。

<details>
<summary>查看示例输出</summary>

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

## 后续步骤{#next-steps}

如果想了解更多关于为你的代码插桩的内容，请参考[手动插桩](/docs/languages/go/instrumentation/)文档。

此外，你或许还想要配置合适的导出器（Exporter）来[将你的遥测数据导出](/docs/languages/go/exporters/)到一个或多个遥测后端。

如果你想要进一步探索更复杂的示例，可以查看
[OpenTelemetry 演示](/docs/demo/)，
其中包含用 Go 编写的[结账服务](/docs/demo/services/checkout/)，
[产品目录服务](/docs/demo/services/product-catalog/)以及[会计服务](/docs/demo/services/accounting/)。

[traces]: /docs/concepts/signals/traces/
[metrics]: /docs/concepts/signals/metrics/
[logs]: /docs/concepts/signals/logs/
