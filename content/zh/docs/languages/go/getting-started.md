---
title: 开始
weight: 10
default_lang_commit: 3512b0ae11f72d3a954d86da59ad7f98d064bdad # patched
drifted_from_default: true
# prettier-ignore
cSpell:ignore: chan fatalln funcs intn itoa khtml otelhttp rolldice stdouttrace strconv
---

<!-- markdownlint-disable blanks-around-fences -->
<?code-excerpt path-base="examples/go/dice"?>

本页面将向你展示如何在 Go 中开始使用 OpenTelemetry。

你将学习如何手动为一个简单的应用程序进行插桩, 并且使其能将 [traces][]，[metrics][] 和 [logs][] 输出到终端。

{{% alert title="注意" %}}

日志信号仍处于实验阶段，在未来版本可能会引入不兼容的更改。

{{% /alert %}}

## 前置条件{#prerequisites}

确保你本地已经安装了：

- [Go](https://go.dev/) 1.22 及更高版本。

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
    "log"
    "net/http"
)

func main() {
    http.HandleFunc("/rolldice", rolldice)

    log.Fatal(http.ListenAndServe(":8080", nil))
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

    resp := strconv.Itoa(roll) + "\n"
    if _, err := io.WriteString(w, resp); err != nil {
        log.Printf("Write failed: %v\n", err)
    }
}
```

通过以下命令构建并运行应用程序。

```shell
go run .
```

在你的浏览器中打开 <http://localhost:8080/rolldice> 确保应用程序正常工作。

## 添加 OpenTelemetry 插桩{#add-opentelemetry-instrumentation}

现在我们将展示如何向示例应用程序添加 OpenTelemetry 插桩。如果你正在使用自己的应用程序，也可以按照步骤操作，只需要注意你的代码可能会略有不同。

### 添加依赖项{#add-dependencies}

安装以下软件包：

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

这将安装 OpenTelemetry SDK 组件以及 `net/http` 的插桩库。

如果你要为其他网络请求库进行插桩，需要安装对应的插桩库，更多信息请查看
[libraries](/docs/languages/go/libraries/)。

### 初始化 OpenTelemetry SDK{#initialize-the-opentelemetry-sdk}

首先我们需要初始化 OpenTelemetry SDK。这对任何需要导出遥测数据的应用程序都是**必须**的

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
// 如果没有返回错误, 用户需要确保在之后调用返回的 shutdown 方法进行清理。
func setupOTelSDK(ctx context.Context) (func(context.Context) error, error) {
    var shutdownFuncs []func(context.Context) error
    var err error

    // shutdown 会调用所有注册的清理函数。
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

    // handleErr 用户调用 shutdown 并合并返回的错误。
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
        return
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
            // 默认批处理时间为 5 秒，这里设置为 1 秒用于演示。
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
            // 默认采集间隔为 1 分钟，这里设置为 3 秒用于演示。
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

如果你只使用链路追踪（tracing）或者指标（metrics），你可以忽略对应的 TracerProvider 或者 MeterProvider 的初始化代码。

### 为 HTTP 服务器添加插桩{#instrument-the-http-server}

现在我们已经为 OpenTelemetry SDK 完成了初始化，可以为 HTTP 服务器添加插桩了。

修改 `main.go` 文件，添加设置并初始化 OpenTelemetry SDK 的代码，并使用 otelhttp 插桩库对 HTTP 服务器进行插桩处理：

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
        BaseContext:  func(_ net.Listener) context.Context { return ctx },
        ReadTimeout:  time.Second,
        WriteTimeout: 10 * time.Second,
        Handler:      newHTTPHandler(),
    }
    srvErr := make(chan error, 1)
    go func() {
        srvErr <- srv.ListenAndServe()
    }()

    // 等待中断信号
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


    // handleFunc 是对 mux.HandleFunc 的封装，
    // 它将 handler 注册到指定路径 pattern（如 "/rolldice/"）上，
    // 并在 OpenTelemetry 中记录该路径作为 http.route 插桩标签，用于丰富 HTTP 插桩信息。
    handleFunc := func(pattern string, handlerFunc func(http.ResponseWriter, *http.Request)) {
        // 为 HTTP 插桩配置 "http.route" 标签。
        handler := otelhttp.WithRouteTag(pattern, http.HandlerFunc(handlerFunc))
        // 这里是真正的处理函数。
        mux.Handle(pattern, handler)
    }

    // 注册 Handler。
    handleFunc("/rolldice/", rolldice)
    handleFunc("/rolldice/{player}", rolldice)

    // 为整个服务器添加 HTTP 插桩处理器。
    handler := otelhttp.NewHandler(mux, "/")
    return handler
}
```
<!-- prettier-ignore-end -->

### 添加自定义插桩器（Instrumentation）{#add-custom-instrumentation}

插桩库用于捕获系统边缘的遥测数据，比如传入和传出的 HTTP 请求，但是他们没办法捕获应用程序内部的执行情况。为此，你需要编写一些自定义[手动插桩](../instrumentation/).

修改 `rolldice.go` 文件，使用 OpenTelemetry API 添加自定义插桩逻辑：

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
    // rollCnt 是自定义的需要捕捉的指标对象。
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

    // 为这个指标定义一个属性，表示是骰子点数值。
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

请注意，如果你只使用链路追踪（tracing）或指标（metrics），可以忽略对应的其他遥测类型的插桩代码。

### 运行应用程序{#run-the-application}

使用以下命令构建并运行应用程序：

```sh
go mod tidy
export OTEL_RESOURCE_ATTRIBUTES="service.name=dice,service.version=0.1.0"
go run .
```

在你的浏览器打开 <http://localhost:8080/rolldice/Alice>。当你向服务器发送请求的时候，控制台将会输出两个 span。一个是由插桩库生成的 span，用于追踪对 `/rolldice/{player}` 路由的请求生命周期。另一个名为 `roll` 的 span 是手动创建的，他是之前提到的 span 的子 span。

<details>
<summary>查看示例输出</summary>

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

除了追踪信息之外，日志信息也会被输出到控制台。

<details>
<summary>查看示例输出</summary>

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

多刷新几次 <http://localhost:8080/rolldice/Alice> 页面，然后等待一会或者终止你的应用程序，随后你会在控制台输出中看到指标信息。你会看到 `dice.rolls` 指标被打印到控制台，其中每个骰子都有单独的计数，同时还会看到由插桩库生成的 HTTP 请求相关指标。

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
