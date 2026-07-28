---
title: 計装
aliases: [manual]
weight: 30
description: OpenTelemetry Erlang/Elixir の計装
default_lang_commit: 66215f27a11cce93dc823a34713dc89cc5d96ca7
---

{{% include instrumentation-intro.md %}}

## セットアップ {#setup}

プロジェクトに以下の依存関係を追加してください。

- `opentelemetry_api`: コードを計装するために使用するインターフェイスが含まれています。
  `Tracer.with_span` や `Tracer.set_attribute` などがここで定義されています。
- `opentelemetry`: API で定義されたインターフェイスを実装する SDK が含まれています。
  これがなければ、API のすべての関数は no-op になります。

```elixir
# mix.exs
def deps do
  [
    {:opentelemetry, "~> 1.3"},
    {:opentelemetry_api, "~> 1.2"},
  ]
end
```

## トレース {#traces}

### トレーシングの初期化 {#initialize-tracing}

[トレーシング](/docs/concepts/signals/traces/)を開始するには、[`Tracer`](/docs/concepts/signals/traces/#tracer) を作成するために [`TracerProvider`](/docs/concepts/signals/traces/#tracer-provider) が必要です。
OpenTelemetry SDK アプリケーション（`opentelemetry`）が起動すると、グローバルな `TracerProvider` を開始して設定します。
`TracerProvider` が開始されると、読み込まれた各 OTP アプリケーションに対して `Tracer` が作成されます。

TracerProvider の作成に失敗した場合（たとえば `opentelemetry` アプリケーションが起動していない、または起動に失敗した場合）、トレーシング用の OpenTelemetry API は no-op 実装を使用し、データを生成しません。

### Tracer の取得 {#acquiring-a-tracer}

各 OTP アプリケーションには、`opentelemetry` アプリケーションの起動時に `Tracer` が作成されます。
各 `Tracer` の名前とバージョンは、`Tracer` を使用するモジュールが属する OTP アプリケーションの名前とバージョンと同じです。
`Tracer` の使用がモジュール内でない場合（たとえば対話型シェルを使用している場合）、名前とバージョンが空白の `Tracer` が使用されます。

作成された `Tracer` のレコードは、OTP アプリケーション内のモジュール名で検索できます。

{{< tabpane text=true >}} {{% tab Erlang %}}

```erlang
opentelemetry:get_application_tracer(?MODULE)
```

{{% /tab %}} {{% tab Elixir %}}

```elixir
:opentelemetry.get_application_tracer(__MODULE__)
```

{{% /tab %}} {{< /tabpane >}}

これが、Erlang と Elixir のマクロが `Spans` の開始や更新時に、各呼び出しで変数を渡すことなく自動的に `Tracer` を取得する仕組みです。

### スパンの作成 {#create-spans}

[Tracer](/docs/concepts/signals/traces/#tracer) が初期化されたので、[スパン](/docs/concepts/signals/traces/#spans)を作成できます。

{{< tabpane text=true >}} {{% tab Erlang %}}

```erlang
?with_span(main, #{}, fun() ->
                        %% ここで処理を行います。
                        %% この関数がリターンするとスパンが終了します
                      end).
```

{{% /tab %}} {{% tab Elixir %}}

```elixir
require OpenTelemetry.Tracer

...

OpenTelemetry.Tracer.with_span :main do
  # ここで処理を行います
  # ブロックが終了するとスパンが終了します
end
```

{{% /tab %}} {{< /tabpane >}}

上記のコードサンプルは、最も一般的な種類のスパンであるアクティブスパンの作成方法を示しています。

### ネストされたスパンの作成 {#create-nested-spans}

{{< tabpane text=true >}} {{% tab Erlang %}}

```erlang
parent_function() ->
    ?with_span(parent, #{}, fun child_function/0).

child_function() ->
    %% これは同じプロセスなので、上の with_span 呼び出しで
    %% アクティブスパンとして設定された親スパンが、この関数でもアクティブスパンになります
    ?with_span(child, #{},
               fun() ->
                   %% ここで処理を行います。この関数がリターンすると child が完了します。
               end).
```

{{% /tab %}} {{% tab Elixir %}}

```elixir
require OpenTelemetry.Tracer

def parent_function() do
    OpenTelemetry.Tracer.with_span :parent do
        child_function()
    end
end

def child_function() do
    # これは同じプロセスなので、上の with_span 呼び出しで
    # アクティブスパンとして設定された :parent スパンが、この関数でもアクティブスパンになります
    OpenTelemetry.Tracer.with_span :child do
        ## ここで処理を行います。この関数がリターンすると :child が完了します。
    end
end
```

{{% /tab %}} {{< /tabpane >}}

### 別プロセスのスパン {#spans-in-separate-processes}

前のセクションの例は、同じプロセス内で親子関係を持つスパンであり、子スパンを作成する際にプロセスディクショナリで親が利用可能でした。
プロセスディクショナリをこのように使用することは、プロセスをまたぐ場合（新しいプロセスをスポーンする場合や既存のプロセスにメッセージを送信する場合）には不可能です。
かわりに、コンテキストを変数として手動で渡す必要があります。

プロセス間でスパンを渡すには、特定のプロセスに接続されていないスパンを開始する必要があります。
これは `start_span` マクロで実行できます。
`with_span` とは異なり、`start_span` マクロはプロセスディクショナリのコンテキストで新しいスパンを現在のアクティブスパンとして設定しません。

新しいプロセスで親としてスパンを子に接続するには、コンテキストをアタッチし、新しいスパンをプロセスで現在アクティブとして設定します。
[バゲージ](/docs/specs/otel/baggage/api/)などの他のテレメトリーデータを失わないように、コンテキスト全体をアタッチする必要があります。

{{< tabpane text=true >}} {{% tab Erlang %}}

```erlang
SpanCtx = ?start_span(child),

Ctx = otel_ctx:get_current(),

proc_lib:spawn_link(fun() ->
                        otel_ctx:attach(Ctx),
                        ?set_current_span(SpanCtx),

                        %% ここで処理を行います

                        ?end_span(SpanCtx)
                    end),
```

{{% /tab %}} {{% tab Elixir %}}

```elixir
span_ctx = OpenTelemetry.Tracer.start_span(:child)
ctx = OpenTelemetry.Ctx.get_current()

task = Task.async(fn ->
                      OpenTelemetry.Ctx.attach(ctx)
                      OpenTelemetry.Tracer.set_current_span(span_ctx)
                      # ここで処理を行います

                      # ここでスパンを終了します
                      OpenTelemetry.Tracer.end_span(span_ctx)
                  end)

_ = Task.await(task)
```

{{% /tab %}} {{< /tabpane >}}

### 新しいスパンのリンク {#linking-the-new-span}

[スパン](/docs/concepts/signals/traces/#spans)は、別のスパンと因果関係でリンクする 0 個以上の[スパンリンク](/docs/concepts/signals/traces/#span-links)とともに作成できます。
スパンリンクを作成するにはスパンコンテキストが必要です。

{{< tabpane text=true >}} {{% tab Erlang %}}

```erlang
Parent = ?current_span_ctx,
proc_lib:spawn_link(fun() ->
                        %% 新しいプロセスは新しいコンテキストを持つため、
                        %% 以下の `with_span` で作成されるスパンには親がありません
                        Link = opentelemetry:link(Parent),
                        ?with_span('other-process', #{links => [Link]},
                                   fun() -> ok end)
                    end),
```

{{% /tab %}} {{% tab Elixir %}}

```elixir
parent = OpenTelemetry.Tracer.current_span_ctx()
task = Task.async(fn ->
                    # 新しいプロセスは新しいコンテキストを持つため、
                    # 以下の `with_span` で作成されるスパンには親がありません
                    link = OpenTelemetry.link(parent)
                    Tracer.with_span :"my-task", %{links: [link]} do
                      :hello
                    end
                 end)
```

{{% /tab %}} {{< /tabpane >}}

### スパンへの属性の追加 {#adding-attributes-to-a-span}

[属性](/docs/concepts/signals/traces/#attributes)を使用すると、スパンにキーと値のペアをアタッチして、追跡中の現在の操作に関するより多くの情報を持たせることができます。

以下の例は、開始オプションで属性を設定し、スパン操作の本体で `set_attributes` を使って再度設定する、2 つの属性設定方法を示しています。

{{< tabpane text=true >}} {{% tab Erlang %}}

```erlang
?with_span(my_span, #{attributes => [{'start-opts-attr', <<"start-opts-value">>}]},
           fun() ->
               ?set_attributes([{'my-attribute', <<"my-value">>},
                                {another_attribute, <<"value-of-attribute">>}])
           end)
```

{{% /tab %}} {{% tab Elixir %}}

```elixir
Tracer.with_span :span_1, %{attributes: [{:"start-opts-attr", <<"start-opts-value">>}]} do
  Tracer.set_attributes([{:"my-attributes", "my-value"},
                         {:another_attribute, "value-of-attributes"}])
end
```

{{% /tab %}} {{< /tabpane >}}

### セマンティック属性 {#semantic-attributes}

セマンティック属性は、HTTP メソッド、ステータスコード、ユーザーエージェントなどの共通概念に対して、複数の言語、フレームワーク、ランタイム間で共有された属性キーのセットを提供するために [OpenTelemetry Specification][] で定義された属性です。
これらの属性キーは仕様から生成され、[opentelemetry_semantic_conventions](https://hex.pm/packages/opentelemetry_semantic_conventions) で提供されています。

たとえば、HTTP クライアントまたはサーバーの計装では、URL のスキームなどのセマンティック属性を含める必要があります。

{{< tabpane text=true >}} {{% tab Erlang %}}

```erlang
-include_lib("opentelemetry_semantic_conventions/include/trace.hrl").

?with_span(my_span, #{attributes => [{?HTTP_SCHEME, <<"https">>}]},
           fun() ->
             ...
           end)
```

{{% /tab %}} {{% tab Elixir %}}

```elixir
alias OpenTelemetry.SemanticConventions.Trace, as: Trace

Tracer.with_span :span_1, %{attributes: [{Trace.http_scheme(), <<"https">>}]} do

end
```

{{% /tab %}} {{< /tabpane >}}

### イベントの追加 {#adding-events}

[スパンイベント](/docs/concepts/signals/traces/#span-events)は、[スパン](/docs/concepts/signals/traces/#spans)上の人間が読めるメッセージであり、単一のタイムスタンプで追跡できる期間のない離散的なイベントを表します。
プリミティブなログのようなものと考えることができます。

{{< tabpane text=true >}} {{% tab Erlang %}}

```erlang
?add_event(<<"Gonna try it">>),

%% 処理を実行

?add_event(<<"Did it!">>),
```

{{% /tab %}} {{% tab Elixir %}}

```elixir
Tracer.add_event("Gonna try it")

%% 処理を実行

Tracer.add_event("Did it!")
```

{{% /tab %}} {{< /tabpane >}}

イベントにも独自の属性を持たせることができます。

{{< tabpane text=true >}} {{% tab Erlang %}}

```erlang
?add_event(<<"Process exited with reason">>, [{pid, Pid)}, {reason, Reason}]))
```

{{% /tab %}} {{% tab Elixir %}}

```elixir
Tracer.add_event("Process exited with reason", pid: pid, reason: Reason)
```

{{% /tab %}} {{< /tabpane >}}

### スパンステータスの設定 {#set-span-status}

[ステータス](/docs/concepts/signals/traces/#span-status)は[スパン](/docs/concepts/signals/traces/#spans)に設定でき、通常はスパンが正常に完了しなかったことを示すために使用されます（`StatusCode.ERROR`）。
まれなケースでは、エラーステータスを `StatusCode.OK` でオーバーライドすることもできますが、正常に完了したスパンに `StatusCode.OK` を設定しないでください。

ステータスはスパンが終了する前であればいつでも設定できます。

{{< tabpane text=true >}} {{% tab Erlang %}}

```erlang
-include_lib("opentelemetry_api/include/opentelemetry.hrl").

?set_status(?OTEL_STATUS_ERROR, <<"this is not ok">>)
```

{{% /tab %}} {{% tab Elixir %}}

```elixir
Tracer.set_status(:error, "this is not ok")
```

{{% /tab %}} {{< /tabpane >}}

## メトリクス {#metrics}

メトリクスを生成するには、プロジェクトに依存関係 `opentelemetry_experimental_api` と `opentelemetry_experimental` を追加する必要があります。
`opentelemetry_experimental` のアプリケーション環境設定は、アプリケーション起動時に初期化される `MeterProvider` の設定に使用されます。
Meter は起動時に `MeterProvider` で自動的に作成され、コード内で計装を作成する場所に応じて適切な `Meter` が使用されます。
OpenTelemetry Erlang は現在、以下の計装をサポートしています。

- Counter: 非負の増分をサポートする同期計装
- Asynchronous Counter: 非負の増分をサポートする非同期計装
- Histogram: ヒストグラム、サマリー、パーセンタイルなどの統計的に意味のある任意の値をサポートする同期計装
- Asynchronous Gauge: 室温など、非加算的な値をサポートする非同期計装
- UpDownCounter: アクティブなリクエスト数など、増分と減分をサポートする同期計装
- Asynchronous UpDownCounter: 増分と減分をサポートする非同期計装

同期計装と非同期計装の詳細、およびユースケースに最適な種類については、[補足ガイドライン](/docs/specs/otel/metrics/supplementary-guidelines/)を参照してください。

### メトリクスの初期化 {#initialize-metrics}

> [!NB] ライブラリを計装している場合は、**このステップをスキップしてください**。

アプリケーションでメトリクスを有効にするには、`Reader` を持つ初期化された `MeterProvider` が必要です。
これは `opentelemetry_experimental` アプリケーションの設定で行います。

```erlang
{opentelemetry_experimental,
  [{readers, [#{module => otel_metric_reader,
                config => #{export_interval_ms => 1000,
                            exporter => {otel_exporter_metrics_otlp, #{}}}}]}]},
```

この設定は、単一の `Reader` を持つ `MetricProvider` を作成するようアプリケーションに指示します。
`Reader` は毎秒、デフォルトで `localhost:4318` にある Collector などの OTLP レシーバーにエクスポートします。
エンドポイントを変更するにはマップに `endpoints => ["<host>:<port>"]` を追加し、使用するプロトコルを `protocol => http_protobuf | grpc` で設定します。

メトリクスをコンソールに出力するには `exporter => {otel_exporter_metrics_console, #{}}` を使用してください。

### Meter の取得 {#acquiring-a-meter}

計装は `Meter` で作成されます。
`Meter` の手動取得は必須ではなく、計装作成用のマクロを使用する際に自動的に行われます。

### 同期計装と非同期計装 {#synchronous-and-asynchronous-instruments}

### Counter の使用 {#using-counters}

Counter は非負の増加する値を計測するために使用できます。

Counter の作成は `?create_counter` マクロで行えます。

```erlang
?create_counter(my_fun_counter, #{description => ~"Number of times this function
is called."})
```

Counter をインクリメントするには `?counter_add` マクロを使用し、計装名、インクリメント値、および属性のマップを渡します。

```erlang
?counter_add(my_fun_counter, 1, #{}),
```

### UpDown Counter の使用 {#using-updown-counters}

UpDown Counter は増分と減分が可能で、上下する累積値を観測できます。

たとえば、あるコレクションのアイテム数を報告する方法は以下のとおりです。

```erlang
create_items_counter() ->
  ?create_counter('items.counter', #{description => ~"Number of items",
                                     unit => '{items}'}),

add_item(Item) ->
  ...
  ?updown_counter_add('items.counter', 1),

remove_item(Item) ->
  ...
  ?updown_counter_add('items.counter', -1),
```

### Histogram の使用 {#using-histograms}

Histogram は時間の経過に伴う値の分布を計測するために使用されます。

```erlang
?create_histogram('task.duration', #{description => ~"Duration of a task",
                                     unit => 's'}),
```

`?histogram_record` マクロを使用して計測を記録します。

```erlang
{Microseconds, Result} = timer:tc(TaskFun),
?histogram_record('task.duration', Microseconds),
```

### Observable Counter の使用 {#using-observable-counters}

Observable Counter は、加算的で非負の単調に増加する値を計測するために使用できます。

たとえば、Erlang ノードが開始してからの経過時間を報告する方法は以下のとおりです。

```erlang
?create_observable_counter('uptime', fun(_Args) ->
                                         Uptime = erlang:convert_time_unit(erlang:monotonic_time() - erlang:system_info(start_time), native, seconds),
                                         [{Uptime, #{}}]
                                     end,
                                     [],
                                     #{description => ~"The duration since the node started.",
                                       unit => 's'}),
```

### Observable UpDown Counter の使用 {#using-observable-updown-counters}

Observable UpDown Counter は増分と減分が可能で、加算的で非負の単調増加しない累積値を計測できます。

たとえば、ウェブサーバーのアクティブな HTTP 接続数は以下のとおりです。

```erlang
?create_observable_updown_counter('http.server.active_requests', fun(_Args) ->
                                         ActiveRequests = ....
                                         [{ActiveRequests, #{}}]
                                     end,
                                     [],
                                     #{description => ~"Number of active HTTP server requests.",
                                       unit => {request}'}),
```

### Observable Gauge の使用 {#using-observable-gauges}

Observable Gauge は非加算的な値を計測するために使用します。

たとえば、ノード上の ETS テーブルのメモリ使用量を報告する方法は以下のとおりです。

```erlang
?create_observable_gauge('memory.ets', fun(_Args) ->
                                         EtsMemory = erlang:memory(ets),
                                         [{EtsMemory, #{}}]
                                     end,
                                     [],
                                     #{description => ~"Memory used by ETS tables.",
                                       unit => 'By'}),
```

### 属性の追加 {#adding-attributes}

属性は、記録用マクロの最後の位置にマップとして任意の計測に追加できます。

```erlang
?updown_counter_add('items.counter', 1, #{~"key-1" => ~"value-1"}),
```

### ビューの登録 {#registering-views}

ビューは、SDK によるメトリクス出力をカスタマイズする柔軟性を SDK ユーザーに提供します。
処理または無視するメトリクス計装をカスタマイズできます。
また、集約やメトリクスで報告する属性もカスタマイズできます。

すべての計装にはデフォルトビューがあり、元の名前、説明、属性を保持し、計装の種類に基づいたデフォルトの集約を持っています。
登録されたビューが計装に一致すると、デフォルトビューは登録されたビューに置き換えられます。
計装に一致する追加の登録ビューは加算的であり、計装に対して複数のエクスポートされたメトリクスが生成されます。

`latency` 計装を `request.latency` にリネームするビューを作成する方法は以下のとおりです。

```erlang
{opentelemetry_experimental,
  [...
    {views, [#{name => request.latency',
               selector => #{instrument_name => 'latency'}}]}
  ]},
```

かわりに、レイテンシー用のヒストグラムが必要な場合は以下のようにします。

```erlang
{opentelemetry_experimental,
  [...
    {views, [#{selector => #{instrument_name => 'latency'},
               aggregation_module => otel_aggregation_histogram_explicit}]}
  ]},
```

SDK はメトリクスのエクスポート前にメトリクスと属性をフィルタリングします。
たとえば、ビューを使用して高カーディナリティメトリクスのメモリ使用量を削減したり、機密データを含む可能性のある属性を削除したりできます。

レイテンシーを削除するビューを作成する方法は以下のとおりです。

```erlang
{opentelemetry_experimental,
  [...
    {views, [#{selector => #{instrument_name => 'latency'},
               aggregation_module => otel_aggregation_drop}]}
  ]},
```

ワイルドカードを使用してすべての計装に一致させることができます。

```erlang
{opentelemetry_experimental,
  [...
    {views, [#{selector => #{instrument_name => '*'},
               aggregation_module => otel_aggregation_drop}]}
  ]},
```

ビューは加算的であるため、追加のビューがあれば特定のメトリクスをエクスポートでき、ワイルドカード以外に一致しない他のすべてのメトリクスは削除されます。

## ログ {#logs}

ログ API は、[opentelemetry-erlang](https://github.com/open-telemetry/opentelemetry-erlang) リポジトリの `apps/opentelemetry_experimental_api` にありますが、現在不安定であり、ドキュメントは未定です。

## 次のステップ {#next-steps}

テレメトリーデータを 1 つ以上のテレメトリーバックエンドに[エクスポート](/docs/languages/erlang/exporters)するために、適切なエクスポーターの設定も必要です。

[opentelemetry specification]: /docs/specs/otel/
