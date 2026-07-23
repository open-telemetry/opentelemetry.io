---
title: Go ウェブアプリの計装
linkTitle: Go アプリの計装
date: 2022-08-23
author: '[Naveh Mevorach](https://github.com/NavehMevorach) (Aspecto)'
canonical_url: https://www.aspecto.io/blog/opentelemetry-go-getting-started/
default_lang_commit: 0bfcaf7e0a3d58dfa7db4f4e22f965e5de758e69
# prettier-ignore
cSpell:ignore: bson dogz gonic Mandalorian Mevorach Naveh otelgin otelmongo sdktrace todos
---

このブログ記事では、事前知識なしで OpenTelemetry Go を使ってトレースを作成し可視化する方法をハンズオン形式で学びます。

まず、Mongo と Gin フレームワークを使用したシンプルな To-Do アプリを作成します。
そして、トレーシングデータを Jaeger Tracing に送信して可視化します。
関連するすべてのファイルは、この [GitHub リポジトリ](https://github.com/aspecto-io/opentelemetry-examples/tree/d522230db13780dfd0352ccb7ac63cf021d62108/go?from_branch=master) にあります。

![OpenTelemetry Go - The Mandalorian](OpenTelemetry-Go-The-Mandalorian-2048x1406.png)

## Hello world: OpenTelemetry Go の例 {#hello-world-opentelemetry-go-example}

まず、To-Do サービスを作成し、2つのライブラリ（Gin と Mongo）をインストールして、計装の仕組みを理解します。

### ステップ1: To-Do アプリ用の main.go ファイルを作成する {#step-1-create-maingo-file-for-our-to-do-app}

1. Gin と Mongo-driver をインストールする

   ```shell
   go get -u github.com/gin-gonic/gin
   go get go.mongodb.org/mongo-driver/mongo
   ```

2. gin と mongo を設定して "/todo" でリッスンする

3. Mongo にシードするための To-Do をいくつか作成する

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
       //データベースに To-Do をシードする
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
           //重要: c ではなく c.Request.Context() をコンテキストとして渡すこと - TBD
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

これでシンプルな To-Do アプリの準備ができました。OpenTelemetry を導入しましょう。

### ステップ2: OpenTelemetry Go をインストールする {#step-2-install-opentelemetry-go}

Go アプリを計装するために OpenTelemetry を設定します。

1. OTel SDK をインストールするには、以下を実行します。

   ```shell
   go get go.opentelemetry.io/otel /
   go.opentelemetry.io/otel/sdk /
   ```

2. Gin と Mongo のライブラリを計装してトレースを生成する。

3. Gin と Mongo の計装: otelgin と otelmongo をインストールする

   ```shell
   go get go.opentelemetry.io/contrib/instrumentation/github.com/gin-gonic/gin/otelgin /
   go get go.opentelemetry.io/contrib/instrumentation/go.mongodb.org/mongo-driver/mongo/otelmongo
   ```

### Gin の計装: gin.Context {#gin-instrumentation-gincontext}

先ほどコンテキスト伝搬の考え方について触れました。
これは、分散サービス間でメタデータを転送し、システム内のイベントを関連付ける方法です。

Gin フレームワークには、独自の型である gin.Context があり、HTTP ハンドラーにパラメーターとして渡されます。
しかし、mongo のオペレーションに渡すべきコンテキストは、gin.Context.Request.Context で利用可能な標準 Go ライブラリの Context オブジェクトです。

```go
//c ではなく c.Request.Context() をコンテキストとして渡すこと
cur, findErr := collection.Find(c.Request.Context(), bson.D{})
```

MongoDB のオペレーションに Context を渡すようにしてください。
詳しくはこちらのイシューを確認してください。

これで、To-Do アプリの準備と計装が完了しました。
OpenTelemetry を最大限に活用しましょう。
トレースを可視化できることが、このテクノロジーの真のトラブルシューティング能力を発揮するところです。

可視化には、オープンソースの Jaeger Tracing を使用します。

## Jaeger による可視化 {#visualization-with-jaeger}

### OpenTelemetry Go と Jaeger Tracing: トレースを Jaeger にエクスポートする {#opentelemetry-go-and-jaeger-tracing-export-traces-to-jaeger}

[Jaeger Tracing](https://www.aspecto.io/blog/jaeger-tracing-the-ultimate-guide/) は、分散トレーシングの「スタック」全体（クライアント、コレクター、UI）を管理するオープンソースプロジェクト群です。
Jaeger UI は、トレースを可視化するために最もよく使われるオープンソースです。

セットアップは次のようになります。

1. Jaeger エクスポーターをインストールする

   ```shell
   go get go.opentelemetry.io/otel/exporters/jaeger
   ```

2. tracing フォルダーと jaeger.go ファイルを作成する

3. ファイルに以下のコードを追加する

   ```go
   package tracing
   import (
       "go.opentelemetry.io/otel/exporters/jaeger"
       "go.opentelemetry.io/otel/sdk/resource"
       sdktrace "go.opentelemetry.io/otel/sdk/trace"
       semconv "go.opentelemetry.io/otel/semconv/v1.4.0"
   )

   func JaegerTracerProvider()(*sdktrace.TracerProvider, error) {
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

4. main.go ファイルに戻り、先ほど作成した JaegerTracerProvider 関数を使用するようにコードを変更する

   ```go
   func main() {
       tp, tpErr: = tracing.JaegerTracerProvider()
       if tpErr != nil {
           log.Fatal(tpErr)
       }
       otel.SetTracerProvider(tp)
       otel.SetTextMapPropagator(propagation.NewCompositeTextMapPropagator(propagation.TraceContext {}, propagation.Baggage {}))
       connectMongo()
       setupWebServer()
   }
   ```

   次に、インストールした計装をフックアップします。

5. connectMongo 関数に以下の行を追加して、Mongo の計装を追加する

   ```go
   opts.Monitor = otelmongo.NewMonitor()
   ```

   関数は以下のようになります。

   ```go
   func connectMongo() {
       opts: = options.Client()
       //Mongo OpenTelemetry 計装
       opts.Monitor = otelmongo.NewMonitor()
       opts.ApplyURI("mongodb://localhost:27017")
       client, _ = mongo.Connect(context.Background(), opts)
       //データベースに To-Do をシードする
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

   次に、Gin の計装を追加します。

6. startWebServer 関数で、gin インスタンスを作成した直後に以下の行を追加する

   ```go
   r.Use(otelgin.Middleware("todo-service"))
   ```

   関数は以下のようになります。

   ```go
   func startWebServer() {
       r: = gin.Default()
       //Gin OpenTelemetry 計装
       r.Use(otelgin.Middleware("todo-service"))
       r.GET("/todo", func(c * gin.Context) {
           collection: = client.Database("todo").Collection("todos")
           //c ではなく c.Request.Context() をコンテキストとして渡すこと
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

   完全な `main.go` ファイルは以下を参照してください。
   これで Jaeger にエクスポートする準備が整いました。

   ```go
   package main
   import (
       "context"
       "log"
       "net/http"
       "github.com/aspecto-io/opentelemetry-examples/tracing"
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
       //トレースを Jaeger にエクスポートする
       tp, tpErr: = tracing.JaegerTracerProvider()
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
       //Mongo OpenTelemetry 計装
       opts.Monitor = otelmongo.NewMonitor()
       opts.ApplyURI("mongodb://localhost:27017")
       client, _ = mongo.Connect(context.Background(), opts)
       //データベースに To-Do をシードする
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
       //gin OpenTelemetry 計装
       r.Use(otelgin.Middleware("todo-service"))
       r.GET("/todo", func(c * gin.Context) {
           collection: = client.Database("todo").Collection("todos")
           //c ではなく c.Request.Context() をコンテキストとして渡すこと
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

### トレースを Jaeger にエクスポートする {#export-traces-to-jaeger}

1. `go run main.go` で todo-service を実行する。
2. トレースを生成するために、<http://localhost:8080/todo> に HTTP GET リクエストを送る。
3. トレースを表示するために、<http://localhost:16686/search> で Jaeger を開く。

Jaeger UI が表示されます。
todo-service を選択して Find traces をクリックしてください。
右側にトレースが表示されるはずです。

![Jaeger UI は todo-service の go における OpenTelemetry トレースを表示する](jaeger-otel-todo.png)

Jaeger UI は todo-service の Go における OpenTelemetry トレースを表示します。
トレースをクリックすると、ドリルダウンしてさらに詳細を確認し、自分で調査を進めることができます。

![Jaeger UI。To-Do サービスのドリルダウン](jaeger-otel-todo-drill-down.png)

## まとめ {#summary}

以上です！このガイドが参考になり、わかりやすかったことを願っています。
すべてのファイルは GitHub [リポジトリ](https://github.com/aspecto-io/opentelemetry-examples/tree/d522230db13780dfd0352ccb7ac63cf021d62108/go?from_branch=master) ですぐに使える状態で公開されています。

_この記事の原文は、[もともと Aspecto ブログに投稿されました][originally posted]。_

[originally posted]: <{{% param canonical_url %}}>
