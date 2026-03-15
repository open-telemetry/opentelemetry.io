---
title: Початок роботи
weight: 10
default_lang_commit: 5f551752635886a0d2d6b2a83e5a36866ca1b5f1
# prettier-ignore
cSpell:ignore: chan fatalln funcs intn itoa otelhttp rolldice stdouttrace strconv
---

<!-- markdownlint-disable blanks-around-fences -->
<?code-excerpt path-base="examples/go/dice"?>

Ця сторінка покаже вам, як почати роботу з OpenTelemetry в Go.

Ви дізнаєтеся, як можна інструментувати простий застосунок вручну, таким чином, щоб [трейси][], [метрики][], і [логи][] виводилися в консоль.

> [!NOTE]
>
> Сигнал логів все ще експериментальний. Можуть бути внесені зміни, що порушують сумісність, у майбутніх версіях.

## Передумови {#prerequisites}

Переконайтеся, що у вас встановлено наступне:

- [Go](https://go.dev/) 1.23 або новіше

## Приклад застосунку {#example-application}

Наступний приклад використовує базовий застосунок [`net/http`](https://pkg.go.dev/net/http). Якщо ви не використовуєте `net/http`, це не проблема — ви можете використовувати OpenTelemetry Go з іншими веб-фреймворками, такими як Gin та Echo. Для повного списку бібліотек для підтримуваних фреймворків дивіться [реєстр](/ecosystem/registry/?component=instrumentation&language=go).

Для складніших прикладів дивіться [приклади](/docs/languages/go/examples/).

### Налаштування {#setup}

Для початку налаштуйте `go.mod` у новій теці:

```shell
go mod init dice
```

### Створення та запуск HTTP сервера {#create-and-launch-an-http-server}

У тій самій теці створіть файл з назвою `main.go` і додайте наступний код до файлу:

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
	// Відповідна обробка SIGINT (CTRL+C).
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt)
	defer stop()

	// Start HTTP server.
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

	// Очікування на переривання.
	select {
	case err = <-srvErr:
		// Помилка під час запуску HTTP сервера.
		return err
	case <-ctx.Done():
		// Очікування на перше спрацьовування CTRL+C.
		// Припинення отримуванняи повідомлень сигналів як найшвидще.
		stop()
	}

	// Під час виклику Shutdown, ListenAndServe негайно повертає ErrServerClosed.
	err = srv.Shutdown(context.Background())
	return err
}

func newHTTPHandler() http.Handler {
	mux := http.NewServeMux()

	// Реєстрація обробників.
	mux.HandleFunc("/rolldice/", rolldice)
	mux.HandleFunc("/rolldice/{player}", rolldice)

	return mux
}
```

Створіть інший файл з назвою `rolldice.go` і додайте наступний код до файлу:

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

Зберіть і запустіть застосунок за допомогою наступної команди:

```shell
go run .
```

Відкрийте <http://localhost:8080/rolldice> у вашому вебоглядачі, щоб переконатися, що він працює.

## Додавання інструментів OpenTelemetry {#add-opentelemetry-instrumentation}

Тепер ми покажемо, як додати інструменти OpenTelemetry до демонстраційного застосунку. Якщо ви використовуєте свій власний застосунок, ви можете слідувати разом, просто зверніть увагу, що ваш код може трохи відрізнятися.

### Ініціалізація SDK OpenTelemetry {#initialize-the-opentelemetry-sdk}

Спочатку ми ініціалізуємо SDK OpenTelemetry. Це _обовʼязково_ для будь-якого застосунку, який експортує телеметрію.

Створіть `otel.go` з кодом для завантаження SDK OpenTelemetry:

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

// setupOTelSDK завантажує конвеєр OpenTelemetry.
// Якщо він не повертає помилку, обовʼязково викличте shutdown для правильного очищення.
func setupOTelSDK(ctx context.Context) (func(context.Context) error, error) {
	var shutdownFuncs []func(context.Context) error
	var err error

	// shutdown викликає функції очищення, зареєстровані через shutdownFuncs.
	// Помилки з викликів обʼєднуються.
	// Кожне зареєстроване очищення буде викликано один раз.
	shutdown := func(ctx context.Context) error {
		var err error
		for _, fn := range shutdownFuncs {
			err = errors.Join(err, fn(ctx))
		}
		shutdownFuncs = nil
		return err
	}

	// handleErr викликає shutdown для очищення і переконується, що всі помилки повертаються.
	handleErr := func(inErr error) {
		err = errors.Join(inErr, shutdown(ctx))
	}

	// Налаштування поширювача.
	prop := newPropagator()
	otel.SetTextMapPropagator(prop)

	// Налаштування провайдера трасування.
	tracerProvider, err := newTracerProvider()
	if err != nil {
		handleErr(err)
		return shutdown, err
	}
	shutdownFuncs = append(shutdownFuncs, tracerProvider.Shutdown)
	otel.SetTracerProvider(tracerProvider)

	// Налаштування провайдера метрик.
	meterProvider, err := newMeterProvider()
	if err != nil {
		handleErr(err)
		return return shutdown, err
	}
	shutdownFuncs = append(shutdownFuncs, meterProvider.Shutdown)
	otel.SetMeterProvider(meterProvider)

	// Налаштування провайдера логів.
	loggerProvider, err := newLoggerProvider()
	if err != nil {
		handleErr(err)
		return return shutdown, err
	}
	shutdownFuncs = append(shutdownFuncs, loggerProvider.Shutdown)
	global.SetLoggerProvider(loggerProvider)

	return return shutdown, err
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
			// Стандартно 5s. Встановлено на 1s для демонстраційних цілей.
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
			// Стандартно 1m. Встановлено на 3s для демонстраційних цілей.
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

Якщо ви використовуєте лише трасування або метрики, ви можете пропустити відповідний код ініціалізації TracerProvider або MeterProvider.

### Інструментування HTTP сервера {#instrument-the-http-server}

Тепер, коли ми ініціалізували SDK OpenTelemetry, ми можемо інструментувати HTTP сервер.

Змініть `main.go`, щоб включити код, який налаштовує SDK OpenTelemetry та інструментує HTTP сервер за допомогою бібліотеки інструментів `otelhttp`:

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
	// Належна обробка SIGINT (CTRL+C).
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt)
	defer stop()

	// Налаштування OpenTelemetry.
	otelShutdown, err := setupOTelSDK(ctx)
	if err != nil {
		return err
	}
	// Правильне завершення роботи, щоб нічого не витікало.
	defer func() {
		err = errors.Join(err, otelShutdown(context.Background()))
	}()

	// Запуск HTTP сервера.
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

	// Очікування переривання.
	select {
	case err = <-srvErr:
		// Помилка при запуску HTTP сервера.
		return err
	case <-ctx.Done():
		// Очікування першого CTRL+C.
		// Припинення отримання повідомлень про сигнали якомога швидше.
		stop()
	}

	// Коли викликається Shutdown, ListenAndServe негайно повертає ErrServerClosed.
	err = srv.Shutdown(context.Background())
	return err
}

func newHTTPHandler() http.Handler {
	mux := http.NewServeMux()

	// Реєстрація обробників.
	mux.Handle("/rolldice", http.HandlerFunc(rolldice))
	mux.Handle("/rolldice/{player}", http.HandlerFunc(rolldice))

	// Додавання HTTP інструментування для всього сервера.
	handler := otelhttp.NewHandler(mux, "/")
	return handler
}
```
<!-- prettier-ignore-end -->

### Додавання користувацького інструментування {#add-custom-instrumentation}

Бібліотеки інструментування захоплюють телеметрію на краях ваших систем, таких як вхідні та вихідні HTTP запити, але вони не захоплюють те, що відбувається у вашому застосунку. Для цього вам потрібно написати деяке власне [ручне інструментування](../instrumentation/).

Змініть `rolldice.go`, щоб включити власне інструментування за допомогою API OpenTelemetry:

<!-- prettier-ignore-start -->
<!--?code-excerpt "rolldice.go" from="package main"?-->
```go
package main

import (
	"io"
	"math/rand"
	"net/http"
	"strconv"

	"go.opentelemetry.io/contrib/bridges/otelslog"
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
		metric.WithDescription("Кількість кидків за значенням кидка"),
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
		msg = "Анонімний гравець кидає кістки"
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

Зверніть увагу, що якщо ви використовуєте лише трасування або метрики, ви можете пропустити відповідний код, який інструментує інший тип телеметрії.

### Запуск застосунку {#run-the-application}

Зберіть і запустіть застосунок за допомогою наступної команди:

```sh
go mod tidy
export OTEL_RESOURCE_ATTRIBUTES="service.name=dice,service.version=0.1.0"
go run .
```

Відкрийте <http://localhost:8080/rolldice/Alice> у вашому вебоглядачі. Коли ви надішлете запит до сервера, ви побачите два відрізки у трейсі, що виводяться в консоль. Відрізок, створений бібліотекою інструментів, відстежує тривалість запиту до маршруту `/rolldice/{player}`. Відрізок з назвою `roll` створюється вручну і є дочірнім до попередньо згаданого відрізка.

<details>
<summary>Переглянути приклад виводу</summary>

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

Разом з трейсом, повідомлення журналу виводяться в консоль.

<details>
<summary>Переглянути приклад виводу</summary>

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

Оновіть сторінку <http://localhost:8080/rolldice/Alice> кілька разів, а потім або зачекайте трохи, або завершіть роботу застосунку, і ви побачите метрики у виводі консолі. Ви побачите метрику `dice.rolls`, що виводиться в консоль, з окремими підрахунками для кожного значення кидка, а також HTTP метрики, створені бібліотекою інструментів.

<details>
<summary>Переглянути приклад виводу</summary>

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

## Наступні кроки {#next-steps}

Для отримання додаткової інформації про інструментування вашого коду зверніться до документації [ручного інструментування](/docs/languages/go/instrumentation/).

Вам також потрібно буде налаштувати відповідний експортер для [експорту ваших телеметричних даних](/docs/languages/go/exporters/) до одного або декількох бекендів телеметрії.

Якщо ви хочете дослідити складніший приклад, подивіться на [Демо OpenTelemetry](/docs/demo/), яке включає заснований на Go [Сервіс оформлення замовлень](/docs/demo/services/checkout/), [Сервіс каталогу продуктів](/docs/demo/services/product-catalog/), та [Сервіс бухгалтерії](/docs/demo/services/accounting/)

[трейси]: /docs/concepts/signals/traces/
[метрики]: /docs/concepts/signals/metrics/
[логи]: /docs/concepts/signals/logs/
