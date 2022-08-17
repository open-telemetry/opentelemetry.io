---
title: Go Web App & PpenTelemetry Instrumentation
linkTitle: Go Web App Instrumentation
date: 2022-06-27
author: Naveh Mevorach (Aspecto)
canonical_url: https://www.aspecto.io/blog/opentelemetry-go-getting-started/
---

# How to Get Started with OpenTelemetry Go

In this guide, you will learn hands-on how to create and visualize traces with OpenTelemetry Go without prior knowledge.

We will start with creating a simple to-do app that uses Mongo and the Gin framework. Then, we will send tracing data to Jaeger Tracing for visualization. You can find all the relevant files in this [Github repository](https://github.com/aspecto-io/opentelemetry-examples/tree/master/go).

!["OpenTelemetry Go The Mandalorian"](https://www.aspecto.io/wp-content/uploads/2022/06/OpenTelemetry-Go-The-Mandalorian-2048x1406.png)

## What to Expect

- Intro to OpenTelemetry
- Hello world: OpenTelemetry GO example
  - Create main.go file with Gin and Mongo
  - Install OpenTelemetry GO
  - Gin instrumentation: gin.Context
- Visualization with Jaeger
## Intro to OpenTelemetry

OpenTelemetry is a collection of APIs and SDKs that allows us to collect, export, and generate **traces, logs, and metrics** (also known as the three pillars of observability).

It is a CNCF community-driven open-source project (Cloud Native Computing Foundation, the folks in charge of Kubernetes).

In a cloud-native environment, we use OpenTelemetry (OTel for short) to gather data from our system operations and events. In other words, to instrument our distributed services. This data enables us to understand and investigate our software’s behavior and troubleshoot performance issues and errors.

OpenTelemetry serves as a standard observability framework that captures all data under a single specification. It provides several components, including:

1. APIs and SDKs per programming language for generating telemetry
2. The OpenTelemetry Collector; receives, processes, and exports telemetry data to different destinations.
3. [OTLP](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/protocol/otlp.md) protocol for shipping telemetry data
   To get a deeper understanding of this technology, including its structure and the primary motivation, visit this guide.

For this OpenTelemetry Golang guide, here are the terms you need to know:

- **Span:** Represents a single operation within a Trace.
- **Trace:** [‘Call-stacks’ for distributed services](https://www.aspecto.io/blog/guide-to-distributed-tracing/). A DAG of Spans, where the edges between Spans are defined as parent/child. relationship.
- **Exporter:** Provides functionality to emit telemetry to consumers. Used by Instrumentation Libraries and the Collector. Exporters can be push- or pull-based.
- **Context propagation:** Allows all Data Sources to share an underlying context mechanism for storing state and accessing data across the lifespan of a Transaction. See context propagation spec.
- **Instrumentation:** Denotes the Library that provides the instrumentation for a given Instrumented Library. Instrumented Library and Instrumentation Library may be the same Library if it has built-in OpenTelemetry instrumentation.

There are two ways to instrument our app – manually and automatically:

- **Auto instrumentation:** Automatically create spans from the application libraries we use with ready-to-use OpenTelemetry libraries.
- **Manual instrumentation:** Manually add code to your application to define the beginning and end of each span and the payload.

  To learn more, see [Instrumenting](/docs/concepts/instrumenting/).

## Hello world: OpenTelemetry Go example

We will start by creating our to-do service and installing two libraries (Gin and Mongo) to understand how instrumentations work.

### Step 1: Create main.go file for our to-do app

1. Install Gin and Mongo-driver

```go
go get -u github.com/gin-gonic/gin
go get go.mongodb.org/mongo-driver/mongo
```

2. Set up gin and mongo to listen on “/todo”

3. Create some to-do’s to seed Mongo

```go
package main
import (
    "context"
    "net/http"
    "github.com/gin-gonic/gin"
    "go.mongodb.org/mongo-driver/bson"
    "go.mongodb.org/mongo-driver/mongo"
    "go.mongodb.org/mongo-driver/mongo/options"
)
var client * mongo.Client
func main() {
    connectMongo()
    setupWebServer()
}
func connectMongo() {
    opts: = options.Client()
    opts.ApplyURI("mongodb://localhost:27017")
    client, _ = mongo.Connect(context.Background(), opts)
    //Seed the database with todo's
    docs: = [] interface {} {
        bson.D {
                {
                    "id", "1"
                }, {
                    "title", "Buy groceries"
                }
            },
            bson.D {
                {
                    "id", "2"
                }, {
                    "title", "install Aspecto.io"
                }
            },
            bson.D {
                {
                    "id", "3"
                }, {
                    "title", "Buy dogz.io domain"
                }
            },
    }
    client.Database("todo").Collection("todos").InsertMany(context.Background(), docs)
}
func setupWebServer() {
    r: = gin.Default()
    r.GET("/todo", func(c * gin.Context) {
        collection: = client.Database("todo").Collection("todos")
        //Important: Make sure to pass c.Request.Context() as the context and not c itself - TBD
        cur, findErr: = collection.Find(c.Request.Context(), bson.D {})
        if findErr != nil {
            c.AbortWithError(500, findErr)
            return
        }
        results: = make([] interface {}, 0)
        curErr: = cur.All(c, & results)
        if curErr != nil {
            c.AbortWithError(500, curErr)
            return
        }
        c.JSON(http.StatusOK, results)
    })
    _ = r.Run(":8080")
}
```

Now that our small todo app is ready, let’s introduce OpenTelemetry.

### Step 2: Install OpenTelemetry Go

We will be configuring OpenTelemetry to instrument our Go app.

1. To install the OTel SDK, run:

```console
go get go.opentelemetry.io/otel /
go.opentelemetry.io/otel/sdk /
```

2. Instrument our Gin and Mongo libraries to generate traces.

3. Gin & Mongo instrumentation: Install otelgin & otelmongo

```console
go get go.opentelemetry.io/contrib/instrumentation/github.com/gin-gonic/gin/otelgin /
go get go.opentelemetry.io/contrib/instrumentation/go.mongodb.org/mongo-driver/mongo/otelmongo
```
### Gin instrumentation: gin.Context

We previously discussed the idea of context propagation – the way to transfer metadata between distributed services to correlate events in our system.

The Gin framework has its own type gin.Context which gets passed as a parameter to an HTTP handler. However, the context that should be passed down to the mongo operations is the standard Go library Context object, available in gin.Context.Request.Context.

```go
//Make sure to pass c.Request.Context() as the context and not c itself
cur, findErr := collection.Find(c.Request.Context(), bson.D{})
```
So make sure that you pass the Context to the mongodb operation. Check out this issue for more info.

We now have our todo app ready and instrumented. It’s time to utilize OpenTelemetry to its full potential. Our ability to visualize traces is where the true troubleshooting power of this technology comes into play.

For visualization, we’ll be using the open-source Jaeger Tracing.


## Visualization with Jaeger


### OpenTelemetry Go and Jaeger Tracing: Export traces to Jaeger

[Jaeger Tracing](https://www.aspecto.io/blog/jaeger-tracing-the-ultimate-guide/) is a suite of open source projects managing the entire distributed tracing “stack”: client, collector, and UI. Jaeger UI is the most commonly used open-source to visualize traces.

Here’s what the setup looks like:

1. Install the Jaeger exporter

```console
go get go.opentelemetry.io/otel/exporters/jaeger
```

2. Create a tracing folder and a jaeger.go file

3. Add the following code to the file

```go
package tracing
import (
    "go.opentelemetry.io/otel/exporters/jaeger"
    "go.opentelemetry.io/otel/sdk/resource"
    sdktrace "go.opentelemetry.io/otel/sdk/trace"
    semconv "go.opentelemetry.io/otel/semconv/v1.4.0"
)
func JaegerTraceProvider()(*sdktrace.TracerProvider, error) {
    exp, err: = jaeger.New(jaeger.WithCollectorEndpoint(jaeger.WithEndpoint("http://localhost:14268/api/traces")))
    if err != nil {
        return nil, err
    }
    tp: = sdktrace.NewTracerProvider(
        sdktrace.WithBatcher(exp),
        sdktrace.WithResource(resource.NewWithAttributes(
            semconv.SchemaURL,
            semconv.ServiceNameKey.String("todo-service"),
            semconv.DeploymentEnvironmentKey.String("production"),
        )),
    )
    return tp, nil
}
```

4. Go back to the main.go file and modify our code to use the JaegerTraceProvider function we just created

```go
func main() {
    tp, tpErr: = tracing.JaegerTraceProvider()
    if tpErr != nil {
        log.Fatal(tpErr)
    }
    otel.SetTracerProvider(tp)
    otel.SetTextMapPropagator(propagation.NewCompositeTextMapPropagator(propagation.TraceContext {}, propagation.Baggage {}))
    connectMongo()
    setupWebServer()
}
```

Next, we are going to hook up the instrumentations we installed.

5. Add the Mongo instrumentation. In our connectMongo function by adding this line

```go
opts.Monitor = otelmongo.NewMonitor()
```

The function shold look like this

```go
func connectMongo() {
    opts: = options.Client()
    //Mongo OpenTelemetry instrumentation
    opts.Monitor = otelmongo.NewMonitor()
    opts.ApplyURI("mongodb://localhost:27017")
    client, _ = mongo.Connect(context.Background(), opts)
    //Seed the database with some todo's
    docs: = [] interface {} {
        bson.D {
                {
                    "id", "1"
                }, {
                    "title", "Buy groceries"
                }
            },
            bson.D {
                {
                    "id", "2"
                }, {
                    "title", "install Aspecto.io"
                }
            },
            bson.D {
                {
                    "id", "3"
                }, {
                    "title", "Buy dogz.io domain"
                }
            },
    }
    client.Database("todo").Collection("todos").InsertMany(context.Background(), docs)
}
```

Now, add the Gin instrumentation.

6. Go to the startWebServer function and add this line right after we create the gin instance

```go
r.Use(otelgin.Middleware("todo-service"))
```

The function should look like this

```go
func startWebServer() {
    r: = gin.Default()
    //Gin OpenTelemetry instrumentation
    r.Use(otelgin.Middleware("todo-service"))
    r.GET("/todo", func(c * gin.Context) {
        collection: = client.Database("todo").Collection("todos")
        //make sure to pass c.Request.Context() as the context and not c itself
        cur, findErr: = collection.Find(c.Request.Context(), bson.D {})
        if findErr != nil {
            c.AbortWithError(500, findErr)
            return
        }
        results: = make([] interface {}, 0)
        curErr: = cur.All(c, & results)
        if curErr != nil {
            c.AbortWithError(500, curErr)
            return
        }
        c.JSON(http.StatusOK, results)
    })
    _ = r.Run(":8080")
}
```

Below is the complete main.go file. Now we’re finally ready to export to Jaeger.

```go
package main
import (
    "context"
    "log"
    "net/http"
    "github.com/aspecto-io/opentelemerty-examples/tracing"
    "github.com/gin-gonic/gin"
    "go.mongodb.org/mongo-driver/bson"
    "go.mongodb.org/mongo-driver/mongo"
    "go.mongodb.org/mongo-driver/mongo/options"
    "go.opentelemetry.io/contrib/instrumentation/github.com/gin-gonic/gin/otelgin"
    "go.opentelemetry.io/contrib/instrumentation/go.mongodb.org/mongo-driver/mongo/otelmongo"
    "go.opentelemetry.io/otel"
    "go.opentelemetry.io/otel/propagation"
)
var client * mongo.Client
func main() { 
    //Export traces to Jaeger
    tp, tpErr: = tracing.JaegerTraceProvider()
    if tpErr != nil {
        log.Fatal(tpErr)
    }
    otel.SetTracerProvider(tp)
    otel.SetTextMapPropagator(propagation.NewCompositeTextMapPropagator(propagation.TraceContext {}, propagation.Baggage {}))
    connectMongo()
    startWebServer()
}
func connectMongo() {
    opts: = options.Client()
    //Mongo OpenTelemetry instrumentation
    opts.Monitor = otelmongo.NewMonitor()
    opts.ApplyURI("mongodb://localhost:27017")
    client, _ = mongo.Connect(context.Background(), opts)
    //Seed the database with some todo's
    docs: = [] interface {} {
        bson.D {
                {
                    "id", "1"
                }, {
                    "title", "Buy groceries"
                }
            },
            bson.D {
                {
                    "id", "2"
                }, {
                    "title", "install Aspecto.io"
                }
            },
            bson.D {
                {
                    "id", "3"
                }, {
                    "title", "Buy dogz.io domain"
                }
            },
    }
    client.Database("todo").Collection("todos").InsertMany(context.Background(), docs)
}
func startWebServer() {
    r: = gin.Default()
    //gin OpenTelemetry instrumentation
    r.Use(otelgin.Middleware("todo-service"))
    r.GET("/todo", func(c * gin.Context) {
        collection: = client.Database("todo").Collection("todos")
        //Make sure to pass c.Request.Context() as the context and not c itself
        cur, findErr: = collection.Find(c.Request.Context(), bson.D {})
        if findErr != nil {
            c.AbortWithError(500, findErr)
            return
        }
        results: = make([] interface {}, 0)
        curErr: = cur.All(c, & results)
        if curErr != nil {
            c.AbortWithError(500, curErr)
            return
        }
        c.JSON(http.StatusOK, results)
    })
    _ = r.Run(":8080")
}
```

### Export traces to Jaeger

1. Run the todo-service with go run main.go
2. Make an HTTP GET request to localhost:8080/todo to generate some traces in Go
3. Open Jaeger at http://localhost:16686/search to view those traces

You can now see the Jaeger UI. Select todo-service and click on Find traces. You should see your trace on the right:
!["Jaeger UI displays opentelemetry traces in go for our todo-service"](https://lh5.googleusercontent.com/ZeFbAE9-XVSc-5GHjZkslHuJ3f01VQqSrObOgLY9yDSjuTyJdvvAzIapIvTQqumFTUP2BZE4gxd-Vt2JXjvqO1ep3JUBhkHKiry_m8bSAwwvEf3kKNfzFiKwzFP8E3btWtQV0pLZZWnsbY-sUA)

Jaeger UI displays opentelemetry traces in go for our todo-service
By clicking the trace, you can drill down and see more details about it that allow you to further investigate on your own:
!["Jaeger UI. To-do service drill down."](https://lh5.googleusercontent.com/5KI-tGGriWaMf98vNjewZZTwE1f-g7dQJXCEaCWmklT_xmCc5E_2VSGcRDeKf4GNZwRSNnSpQCQFH-1nUXIF7a5gd6Y7odFiEukSbaWaukFKP0cXXylHIqGJvAMfbQ2p60nt3wmeOwTtRr3eKQ)

## Summary

That’s all folks! We hope this guide was informative and easy to follow. You can find all files ready to use in our Github [repository](https://github.com/aspecto-io/opentelemetry-examples/tree/master/go).

_A version of this article was [originally posted][] on the Aspecto blog._

[originally posted]: {{% param canonical_url %}}
