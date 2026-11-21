---
title: 예제로 시작하기
description: 5분 안에 앱의 텔레메트리를 수집해 보자!
weight: 10
default_lang_commit: e3d2729f377c307e9e9517db7316d9ea12e1e879
# prettier-ignore
cSpell:ignore: autoexport chan fatalln funcs intn itoa otelhttp rolldice stdouttrace strconv
---

<!-- markdownlint-disable blanks-around-fences -->
<?code-excerpt path-base="content-modules/opentelemetry-go-contrib/examples/dice/instrumented"?>

이 페이지에서는 Go에서 오픈텔레메트리(OpenTelemetry)를 시작하는 방법을 설명한다.

간단한 애플리케이션을 수동으로 계측하여 [트레이스][traces], [메트릭][metrics],
[로그][logs]를 콘솔로 내보내는 방법을 알아본다.

> [!NOTE]
>
> 로그 시그널은 아직 실험 단계에 있으며, 향후 버전에서는 기존 버전과 호환되지
> 않는 변경이 있을 수 있다.

## 사전 요구 사항 {#prerequisites}

다음 항목이 로컬에 설치되어 있는지 확인한다.

- [Go](https://go.dev/) 1.23 이상

## 예제 애플리케이션 {#example-application}

다음 예제는 기본적인 [`net/http`](https://pkg.go.dev/net/http) 애플리케이션을
사용한다. `net/http`를 사용하지 않아도 된다. 오픈텔레메트리 Go는 Gin, Echo와
같은 다른 웹 프레임워크에서도 사용할 수 있다. 지원하는 프레임워크의 전체
라이브러리 목록은
[레지스트리](/ecosystem/registry/?component=instrumentation&language=go)를
참고한다.

더 자세한 예제는 [예제](/docs/languages/go/examples/)를 참고한다.

### 설정 {#setup}

먼저 새 디렉터리에 `go.mod`를 설정한다.

```shell
go mod init dice
```

### HTTP 서버 생성 및 실행 {#create-and-launch-an-http-server}

같은 폴더에 `main.go`라는 파일을 만들고 다음 코드를 추가한다.

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
	// SIGINT(CTRL+C)를 정상적으로 처리한다.
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt)
	defer stop()

	// HTTP 서버를 시작한다.
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

	// 인터럽트를 기다린다.
	select {
	case err = <-srvErr:
		// HTTP 서버를 시작하는 중 오류가 발생했다.
		return err
	case <-ctx.Done():
		// 첫 번째 CTRL+C를 기다린다.
		// 가능한 한 빨리 시그널 알림 수신을 중단한다.
		stop()
	}

	// Shutdown을 호출하면 ListenAndServe는 즉시 ErrServerClosed를 반환한다.
	err = srv.Shutdown(context.Background())
	return err
}

func newHTTPHandler() http.Handler {
	mux := http.NewServeMux()

	// 핸들러를 등록한다.
	mux.HandleFunc("/rolldice/", rolldice)
	mux.HandleFunc("/rolldice/{player}", rolldice)

	return mux
}
```

`rolldice.go`라는 파일을 하나 더 만들고 다음 코드를 추가한다.

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

다음 명령어로 애플리케이션을 빌드하고 실행한다.

```shell
go run .
```

웹 브라우저에서 <http://localhost:8080/rolldice>를 열어 작동하는지 확인한다.

## 오픈텔레메트리 계측 추가 {#add-opentelemetry-instrumentation}

이제 샘플 앱에 오픈텔레메트리 계측을 추가하는 방법을 살펴본다. 자신의
애플리케이션을 사용하고 있다면 그대로 따라 할 수 있지만, 코드가 조금 다를 수
있다는 점에 유의한다.

### 오픈텔레메트리 SDK 초기화 {#initialize-the-opentelemetry-sdk}

먼저 오픈텔레메트리 SDK를 초기화한다. 텔레메트리를 내보내는 모든
애플리케이션에는 이 작업이 _필수_ 다.

오픈텔레메트리 SDK 초기화 코드를 담은 `otel.go`를 만든다.

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

// setupOTelSDK는 오픈텔레메트리 파이프라인을 초기화한다.
// 오류를 반환하지 않으면, 반드시 shutdown을 호출하여 적절히 정리한다.
func setupOTelSDK(ctx context.Context) (func(context.Context) error, error) {
	var shutdownFuncs []func(context.Context) error
	var err error

	// shutdown은 shutdownFuncs를 통해 등록된 정리 함수를 호출한다.
	// 호출에서 발생한 오류는 하나로 합쳐진다.
	// 등록된 각 정리 함수는 한 번씩 호출된다.
	shutdown := func(ctx context.Context) error {
		var err error
		for _, fn := range shutdownFuncs {
			err = errors.Join(err, fn(ctx))
		}
		shutdownFuncs = nil
		return err
	}

	// handleErr는 정리를 위해 shutdown을 호출하고 모든 오류가 반환되도록 한다.
	handleErr := func(inErr error) {
		err = errors.Join(inErr, shutdown(ctx))
	}

	// 전파자를 설정한다.
	prop := newPropagator()
	otel.SetTextMapPropagator(prop)

	// 트레이스 프로바이더를 설정한다.
	tracerProvider, err := newTracerProvider()
	if err != nil {
		handleErr(err)
		return shutdown, err
	}
	shutdownFuncs = append(shutdownFuncs, tracerProvider.Shutdown)
	otel.SetTracerProvider(tracerProvider)

	// 미터 프로바이더를 설정한다.
	meterProvider, err := newMeterProvider()
	if err != nil {
		handleErr(err)
		return shutdown, err
	}
	shutdownFuncs = append(shutdownFuncs, meterProvider.Shutdown)
	otel.SetMeterProvider(meterProvider)

	// 로거 프로바이더를 설정한다.
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
			// 기본값은 5초다. 시연을 위해 1초로 설정한다.
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
			// 기본값은 1분이다. 시연을 위해 3초로 설정한다.
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
> 위 예제는 시연을 위해 콘솔(stdout) 익스포터를 사용한다.
> [`autoexport`](https://pkg.go.dev/go.opentelemetry.io/contrib/exporters/autoexport)
> 패키지를 사용하면 `OTEL_TRACES_EXPORTER`, `OTEL_METRICS_EXPORTER`,
> `OTEL_LOGS_EXPORTER`, `OTEL_EXPORTER_OTLP_ENDPOINT`와 같은 환경 변수로
> 익스포터를 구성할 수 있다. 자세한 내용은
> [익스포터](/docs/languages/go/exporters/)를 참고한다.

트레이싱이나 메트릭 중 하나만 사용한다면, 그에 따라 TracerProvider 또는
MeterProvider 초기화 코드를 생략할 수 있다.

### HTTP 서버 계측 {#instrument-the-http-server}

오픈텔레메트리 SDK를 초기화했으므로 이제 HTTP 서버를 계측할 수 있다.

오픈텔레메트리 SDK를 설정하고 `otelhttp` 계측 라이브러리로 HTTP 서버를 계측하는
코드를 포함하도록 `main.go`를 수정한다.

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
	// SIGINT(CTRL+C)를 정상적으로 처리한다.
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt)
	defer stop()

	// 오픈텔레메트리를 설정한다.
	otelShutdown, err := setupOTelSDK(ctx)
	if err != nil {
		return err
	}
	// 누수가 발생하지 않도록 종료를 적절히 처리한다.
	defer func() {
		err = errors.Join(err, otelShutdown(context.Background()))
	}()

	// HTTP 서버를 시작한다.
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

	// 인터럽트를 기다린다.
	select {
	case err = <-srvErr:
		// HTTP 서버를 시작하는 중 오류가 발생했다.
		return err
	case <-ctx.Done():
		// 첫 번째 CTRL+C를 기다린다.
		// 가능한 한 빨리 시그널 알림 수신을 중단한다.
		stop()
	}

	// Shutdown을 호출하면 ListenAndServe는 즉시 ErrServerClosed를 반환한다.
	err = srv.Shutdown(context.Background())
	return err
}

func newHTTPHandler() http.Handler {
	mux := http.NewServeMux()

	// 핸들러를 등록한다.
	mux.Handle("/rolldice", http.HandlerFunc(rolldice))
	mux.Handle("/rolldice/{player}", http.HandlerFunc(rolldice))

	// 서버 전체에 HTTP 계측을 추가한다.
	handler := otelhttp.NewHandler(mux, "/")
	return handler
}
```
<!-- prettier-ignore-end -->

### 커스텀 계측 추가 {#add-custom-instrumentation}

계측 라이브러리는 들어오고 나가는 HTTP 요청처럼 시스템 경계의 텔레메트리를
수집하지만, 애플리케이션 내부에서 일어나는 일은 수집하지 않는다. 이를 위해서는
커스텀 [수동 계측](../instrumentation/) 코드를 작성해야 한다.

오픈텔레메트리 API를 사용하는 커스텀 계측을 포함하도록 `rolldice.go`를 수정한다.

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

트레이싱이나 메트릭 중 하나만 사용한다면, 다른 텔레메트리 유형을 계측하는 해당
코드는 생략할 수 있다.

### 애플리케이션 실행 {#run-the-application}

다음 명령어로 애플리케이션을 빌드하고 실행한다.

```sh
go mod tidy
export OTEL_RESOURCE_ATTRIBUTES="service.name=dice,service.version=0.1.0"
go run .
```

웹 브라우저에서 <http://localhost:8080/rolldice/Alice>를 연다. 서버에 요청을
보내면 콘솔로 내보낸 트레이스에서 스팬 두 개를 볼 수 있다. 계측 라이브러리가
생성한 스팬은 `/rolldice/{player}` 경로에 대한 요청의 수명을 추적한다.
`roll`이라는 스팬은 수동으로 생성한 것이며, 앞서 언급한 스팬의 자식이다.

<details>
<summary>출력 예시 보기</summary>

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

트레이스와 함께 로그 메시지도 콘솔로 내보낸다.

<details>
<summary>출력 예시 보기</summary>

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

<http://localhost:8080/rolldice/Alice> 페이지를 몇 번 새로 고친 다음, 잠시
기다리거나 앱을 종료하면 콘솔 출력에서 메트릭을 볼 수 있다. 각 주사위 결과값의
횟수를 별도로 집계한 `dice.rolls` 메트릭과 계측 라이브러리가 생성한 HTTP
메트릭이 콘솔로 내보내지는 것을 확인할 수 있다.

<details>
<summary>출력 예시 보기</summary>

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

## 다음 단계 {#next-steps}

코드 계측에 대한 자세한 내용은 [수동 계측](/docs/languages/go/instrumentation/)
문서를 참고한다.

하나 이상의 텔레메트리 백엔드로
[텔레메트리 데이터를 내보내려면](/docs/languages/go/exporters/) 적절한
익스포터도 구성해야 한다.

더 복잡한 예제를 살펴보고 싶다면 Go로 작성된
[주문 처리 서비스](/docs/demo/services/checkout/),
[상품 카탈로그 서비스](/docs/demo/services/product-catalog/),
[회계 서비스](/docs/demo/services/accounting/)를 포함하는
[오픈텔레메트리 데모](/docs/demo/)를 참고한다.

[traces]: /docs/concepts/signals/traces/
[metrics]: /docs/concepts/signals/metrics/
[logs]: /docs/concepts/signals/logs/
