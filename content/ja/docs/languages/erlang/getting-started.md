---
title: はじめに
weight: 10
default_lang_commit: d8f8517082691f743b88ff0a6d10fbc700ac9c98
# prettier-ignore
cSpell:ignore: defmodule defp ecto elixirc elli KHTML postgres rebar relx rolldice stdlib
---

<!-- markdownlint-disable no-duplicate-heading -->

Erlang/Elixir 向け OpenTelemetry のはじめにガイドへようこそ！
このガイドでは、OpenTelemetry のインストール、設定、データのエクスポートの基本的な手順を説明します。

## Phoenix {#phoenix}

このパートでは、Phoenix Web フレームワークで OpenTelemetry を使い始める方法を紹介します。

### 前提条件 {#prerequisites}

Erlang、Elixir、PostgreSQL（または任意のデータベース）、および Phoenix がローカルにインストールされていることを確認してください。
Phoenix の[インストールガイド](https://hexdocs.pm/phoenix/installation.html)が、必要なものをすべてセットアップするのに役立ちます。

### サンプルアプリケーション {#example-application}

以下の例では、基本的な [Phoenix](https://www.phoenixframework.org/) ウェブアプリケーションを作成し、OpenTelemetry で計装する手順を説明します。
参考までに、構築するコードの完全な例はこちらにあります:
[opentelemetry-erlang-contrib/examples/roll_dice](https://github.com/open-telemetry/opentelemetry-erlang-contrib/tree/main/examples/roll_dice)。

追加の例は [opentelemetry-erlang-contrib examples](https://github.com/open-telemetry/opentelemetry-erlang-contrib/tree/main/examples) にあります。

### 初期セットアップ {#initial-setup}

`mix phx.new roll_dice` を実行します。
依存関係をインストールするために「y」と入力します。

### 依存関係 {#dependencies}

Phoenix に含まれていない追加の依存関係がいくつか必要です。

- `opentelemetry_api`: コードを計装するために使用するインターフェイスが含まれています。
  `Tracer.with_span` や `Tracer.set_attribute` などがここで定義されています。
- `opentelemetry`: API で定義されたインターフェイスを実装する SDK が含まれています。
  これがないと、API のすべての関数は何も実行しません。
- `opentelemetry_exporter`: テレメトリーデータを OpenTelemetry Collector やセルフホストまたは商用サービスに送信できます。
- `opentelemetry_phoenix`: Phoenix が作成する Elixir の `:telemetry` イベントから OpenTelemetry スパンを作成します。
- `opentelemetry_cowboy`: Phoenix が使用する Cowboy ウェブサーバーが作成する Elixir の `:telemetry` イベントから OpenTelemetry スパンを作成します。

```elixir
# mix.exs
def deps do
  [
    # その他のデフォルトの依存関係...
    {:opentelemetry_exporter, "~> {{% param versions.otelExporter %}}"},
    {:opentelemetry, "~> {{% param versions.otelSdk %}}"},
    {:opentelemetry_api, "~> {{% param versions.otelApi %}}"},
    {:opentelemetry_phoenix, "~> {{% param versions.otelPhoenix %}}"},
    {:opentelemetry_cowboy, "~> {{% param versions.otelCowboy %}}"},
    {:opentelemetry_ecto, "~> {{% param versions.otelEcto %}}"} # ecto を使用する場合
  ]
end
```

最後の2つは、アプリケーション起動時にセットアップする必要があります:

```elixir
# application.ex
@impl true
def start(_type, _args) do
  :opentelemetry_cowboy.setup()
  OpentelemetryPhoenix.setup(adapter: :cowboy2)
  OpentelemetryEcto.setup([:dice_game, :repo]) # ecto を使用する場合
end
```

また、`endpoint.ex` ファイルに以下の行が含まれていることを確認してください:

```elixir
# endpoint.ex
plug Plug.Telemetry, event_prefix: [:phoenix, :endpoint]
```

さらに、プロジェクト設定に `releases` セクションを追加して、`opentelemetry` アプリケーションを temporary として設定する必要があります。
これにより、OpenTelemetry が異常終了した場合でも、`roll_dice` アプリケーションが終了しないことが保証されます。

```elixir
# mix.exs
def project do
  [
    app: :roll_dice,
    version: "0.1.0",
    elixir: "~> 1.14",
    elixirc_paths: elixirc_paths(Mix.env()),
    start_permanent: Mix.env() == :prod,
    releases: [
      roll_dice: [
        applications: [opentelemetry: :temporary]
      ]
    ],
    aliases: aliases(),
    deps: deps()
  ]
end
```

最後に必要なのはエクスポーターの設定です。
開発環境では、すべてが正しく動作していることを確認するために stdout エクスポーターを使用できます。
OpenTelemetry の `traces_exporter` を以下のように設定します:

```elixir
# config/dev.exs
config :opentelemetry, traces_exporter: {:otel_exporter_stdout, []}
```

これで、新しい `mix setup` コマンドを使用して、依存関係のインストール、アセットのビルド、データベースの作成とマイグレーションを行えます。

### 試してみる {#try-it-out}

`mix phx.server` を実行します。

すべてがうまくいけば、ブラウザで [`localhost:4000`](http://localhost:4000) にアクセスでき、ターミナルに以下のような行が多数表示されるはずです。

（形式が少し見慣れないものでも心配しないでください。
スパンは [Erlang の `record` データ構造](https://www.erlang.org/doc/reference_manual/records.html)で記録されており、[`otel_span.hrl`](https://github.com/open-telemetry/opentelemetry-erlang/blob/main/apps/opentelemetry/include/otel_span.hrl#L19) が `span` レコード構造を説明し、各フィールドの意味を解説しています。）

```shell
{span,64480120921600870463539706779905870846,11592009751350035697,[],
      undefined,<<"/">>,server,-576460731933544855,-576460731890088522,
      {attributes,128,infinity,0,
                  #{'http.status_code' => 200,
                    'http.client_ip' => <<"127.0.0.1">>,
                    'http.flavor' => '1.1','http.method' => <<"GET">>,
                    'http.scheme' => <<"http">>,'http.target' => <<"/">>,
                    'http.user_agent' =>
                        <<"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36">>,
                    'net.transport' => 'IP.TCP',
                    'net.host.name' => <<"localhost">>,
                    'net.host.port' => 4000,'net.peer.port' => 62839,
                    'net.sock.host.addr' => <<"127.0.0.1">>,
                    'net.sock.peer.addr' => <<"127.0.0.1">>,
                    'http.route' => <<"/">>,'phoenix.action' => home,
                    'phoenix.plug' =>
                        'Elixir.RollDiceWeb.PageController'}},
      {events,128,128,infinity,0,[]},
      {links,128,128,infinity,0,[]},
      undefined,1,false,
      {instrumentation_scope,<<"opentelemetry_phoenix">>,<<"1.1.0">>,
                             undefined}}
```

これらは生の Erlang レコードであり、お好みのサービス用にエクスポーターを設定するとシリアライズされて送信されます。

### サイコロを振る {#rolling-the-dice}

次に、サイコロを振って 1 から 6 のランダムな数値を返す API エンドポイントを作成します。

```elixir
# router.ex
scope "/api", RollDiceWeb do
  pipe_through :api

  get "/rolldice", DiceController, :roll
end
```

そして、計装なしのシンプルな `DiceController` を作成します:

```elixir
# lib/roll_dice_web/controllers/dice_controller.ex
defmodule RollDiceWeb.DiceController do
  use RollDiceWeb, :controller

  def roll(conn, _params) do
    send_resp(conn, 200, roll_dice())
  end

  defp roll_dice do
    to_string(Enum.random(1..6))
  end
end
```

お好みでルートを呼び出して結果を確認してください。
ターミナルにはまだテレメトリーが表示されます。
次は `roll` 関数を手動で計装してテレメトリーを充実させましょう。

`DiceController` では、ランダムな数値を生成するプライベートメソッド `dice_roll` を呼び出しています。
これはかなり重要な操作のようなので、トレースでキャプチャするためにスパンで囲む必要があります。

```elixir
defmodule RollDiceWeb.DiceController do
  use RollDiceWeb, :controller
  require OpenTelemetry.Tracer, as: Tracer

  # ...省略

  defp roll_dice do
    Tracer.with_span("dice_roll") do
      to_string(Enum.random(1..6))
    end
  end
end
```

どの数値が生成されたかも知りたいので、ローカル変数として抽出し、スパンの属性として追加できます。

```elixir
defp roll_dice do
  Tracer.with_span("dice_roll") do
    roll = Enum.random(1..6)

    Tracer.set_attribute(:roll, roll)

    to_string(roll)
  end
end
```

ブラウザ、curl などで [`localhost:4000/api/rolldice`](http://localhost:4000/api/rolldice) にアクセスすると、レスポンスとしてランダムな数値が返され、コンソールに 3 つのスパンが表示されるはずです。

<details>
<summary>すべてのスパンを表示</summary>

```shell
*SPANS FOR DEBUG*
{span,224439009126930788594246993907621543552,5581431573601075988,[],
      undefined,<<"/api/rolldice">>,server,-576460729549928500,
      -576460729491912750,
      {attributes,128,infinity,0,
                  #{'http.request_content_length' => 0,
                    'http.response_content_length' => 1,
                    'http.status_code' => 200,
                    'http.client_ip' => <<"127.0.0.1">>,
                    'http.flavor' => '1.1','http.host' => <<"localhost">>,
                    'http.host.port' => 4000,'http.method' => <<"GET">>,
                    'http.scheme' => <<"http">>,
                    'http.target' => <<"/api/rolldice">>,
                    'http.user_agent' =>
                        <<"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36">>,
                    'net.host.ip' => <<"127.0.0.1">>,
                    'net.transport' => 'IP.TCP',
                    'http.route' => <<"/api/rolldice">>,
                    'phoenix.action' => roll,
                    'phoenix.plug' => 'Elixir.RollDiceWeb.DiceController'}},
      {events,128,128,infinity,0,[]},
      {links,128,128,infinity,0,[]},
      undefined,1,false,
      {instrumentation_scope,<<"opentelemetry_cowboy">>,<<"0.2.1">>,
                             undefined}}

{span,237952789931001653450543952469252891760,13016664705250513820,[],
      undefined,<<"HTTP GET">>,server,-576460729422104083,-576460729421433042,
      {attributes,128,infinity,0,
                  #{'http.request_content_length' => 0,
                    'http.response_content_length' => 1258,
                    'http.status_code' => 200,
                    'http.client_ip' => <<"127.0.0.1">>,
                    'http.flavor' => '1.1','http.host' => <<"localhost">>,
                    'http.host.port' => 4000,'http.method' => <<"GET">>,
                    'http.scheme' => <<"http">>,
                    'http.target' => <<"/favicon.ico">>,
                    'http.user_agent' =>
                        <<"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36">>,
                    'net.host.ip' => <<"127.0.0.1">>,
                    'net.transport' => 'IP.TCP'}},
      {events,128,128,infinity,0,[]},
      {links,128,128,infinity,0,[]},
      undefined,1,false,
      {instrumentation_scope,<<"opentelemetry_cowboy">>,<<"0.2.1">>,
                             undefined}}

{span,224439009126930788594246993907621543552,17387612312604368700,[],
      5581431573601075988,<<"dice_roll">>,internal,-576460729494399167,
      -576460729494359917,
      {attributes,128,infinity,0,#{roll => 2}},
      {events,128,128,infinity,0,[]},
      {links,128,128,infinity,0,[]},
      undefined,1,false,
      {instrumentation_scope,<<"dice_game">>,<<"0.1.0">>,undefined}}
```

</details>
<!-- markdownlint-disable heading-increment -->

##### 生成されたスパン {#generated-spans}

上の出力には 3 つのスパンがあります。
スパンの名前はタプルの 6 番目の要素で、それぞれ以下の通りです:

###### `<<"/api/rolldice">>` {#apirolldice}

これはリクエストの最初のスパン、つまりルートスパンです。
スパン名の横にある `undefined` は、親スパンがないことを示しています。
2 つの非常に大きな負の数はスパンの開始時刻と終了時刻で、`native` 時間単位です。
興味があれば、以下のようにしてミリ秒単位の期間を計算できます:
`System.convert_time_unit(-576460729491912750 - -576460729549928500, :native, :millisecond)`。
`phoenix.plug` と `phoenix.action` は、リクエストを処理したコントローラーと関数を示します。
ただし、instrumentation_scope が `opentelemetry_cowboy` であることに気づくでしょう。
opentelemetry_phoenix の setup 関数に `:cowboy2` アダプターを使用することを伝えたとき、追加のスパンを作成せず、既存の cowboy スパンに属性を追加するようにしました。
これにより、トレースでより正確なレイテンシーデータが得られます。

###### `<<"HTTP GET">>` {#http-get}

これは favicon のリクエストで、`'http.target' => <<"/favicon.ico">>` 属性で確認できます。
`http.route` がないため、汎用的な名前になっていると思われます。

###### `<<"dice_roll">>` {#dice_roll}

これは、プライベートメソッドに追加したカスタムスパンです。
設定した 1 つの属性 `roll => 2` のみを持っていることがわかります。
また、`<<"/api/rolldice">>` スパンと同じトレース `224439009126930788594246993907621543552` に属しており、親スパン ID は `5581431573601075988` で、これは `<<"/api/rolldice">>` スパンのスパン ID です。
つまり、このスパンはそのスパンの子であり、お好みのトレーシングツールでレンダリングされると、その下に表示されます。

### 次のステップ {#next-steps}

自身のコードベースの[手動計装](/docs/languages/erlang/instrumentation)で、自動生成された計装を充実させましょう。
これにより、アプリケーションが出力するオブザーバビリティデータをカスタマイズできます。

また、1 つ以上のテレメトリーバックエンドに[テレメトリーデータをエクスポートする](/docs/languages/erlang/exporters)ために、適切なエクスポーターを設定することも必要です。

## Elli {#elli}

このセクションでは、OpenTelemetry と Elli HTTP サーバーを使い始める方法を紹介します。

### 前提条件 {#prerequisites-1}

Erlang と [rebar3](https://rebar3.org) がローカルにインストールされていることを確認してください。

### サンプルアプリケーション {#example-application-1}

以下の例では、基本的な [Elli](https://github.com/elli-lib/elli) ウェブアプリケーションを作成し、OpenTelemetry で計装する手順を説明します。
参考までに、構築するコードの完全な例はこちらにあります:
[opentelemetry-erlang-contrib/examples/roll_dice_elli](https://github.com/open-telemetry/opentelemetry-erlang-contrib/tree/main/examples/roll_dice_elli)。
完全な例には、ここでは扱わない HTML インターフェイス用の追加コードがあることに注意してください。

追加の例は [Erlang の例のドキュメント](/docs/languages/erlang/examples/)にあります。

### 初期セットアップ {#initial-setup-1}

`rebar3 new release roll_dice_elli`

### 依存関係 {#dependencies-1}

Elli に含まれていない追加の依存関係がいくつか必要です。

- `opentelemetry_api`: コードを計装するために使用するインターフェイスが含まれています。
  `Tracer.with_span` や `Tracer.set_attribute` などがここで定義されています。
- `opentelemetry`: API で定義されたインターフェイスを実装する SDK が含まれています。
  これがないと、API のすべての関数は何も実行しません。
- `opentelemetry_exporter`: テレメトリーデータを OpenTelemetry Collector やセルフホストまたは商用サービスに送信できます。
- `opentelemetry_elli`: Elli ミドルウェアとして OpenTelemetry スパンを作成します。
- `opentelemetry_api_experimental`: メトリクスのサポートを含む API の不安定な部分です。
- `opentelemetry_experimental`: メトリクスのサポートを含む SDK の不安定な部分です。

これらはすべて `elli` と共に rebar3 の依存関係と、リリースに含めるアプリケーションに追加されます:

```erlang
{deps, [elli,
        recon,
        opentelemetry_api,
        opentelemetry_exporter,
        opentelemetry,
        opentelemetry_elli,

        opentelemetry_api_experimental},
        opentelemetry_experimental}
       ]}.

{shell, [{apps, [opentelemetry_experimental, opentelemetry, roll_dice]},
         {config, "config/sys.config"}]}.

{relx, [{release, {roll_dice, "0.1.0"},
         [opentelemetry_exporter,
          opentelemetry_experimental,
          opentelemetry,
          recon,
          roll_dice,
          sasl]}
]}.
```

また、依存関係はアプリケーションの `.app.src`、`src/roll_dice.app.src` に含める必要があります:

```erlang
{application, roll_dice,
 [{description, "OpenTelemetry example application"},
  {vsn, "0.1.0"},
  {registered, []},
  {mod, {roll_dice_app, []}},
  {applications,
   [kernel,
    stdlib,
    elli,
    opentelemetry_api,
    opentelemetry_api_experimental,
    opentelemetry_elli
   ]},
  {env,[]},
  {modules, []},

  {licenses, ["Apache-2.0"]},
  {links, []}
 ]}.
```

### 設定 {#configuration}

SDK と Experimental SDK は `config/sys.config` で設定します:

```erlang
{opentelemetry,
 [{span_processor, batch},
  {traces_exporter, {otel_exporter_stdout, []}}]},

{opentelemetry_experimental,
 [{readers, [#{module => otel_metric_reader,
               config => #{export_interval_ms => 1000,
                           exporter => {otel_metric_exporter_console, #{}}}}]}]},
```

この設定により、完了したスパンと記録されたメトリクスが毎秒コンソールに出力されます。

### Elli サーバー {#the-elli-server}

HTTP サーバーは、アプリケーションのトップレベルスーパーバイザー `src/roll_dice_sup.erl` で起動されます:

```erlang
init([]) ->
    Port = list_to_integer(os:getenv("PORT", "3000")),

    ElliOpts = [{callback, elli_middleware},
                {callback_args, [{mods, [{roll_dice_handler, []}]}]},
                {port, Port}],

    ChildSpecs = [#{id => roll_dice_http,
                    start => {elli, start_link, [ElliOpts]},
                    restart => permanent,
                    shutdown => 5000,
                    type => worker,
                    modules => [roll_dice_handler]}],

    {ok, {SupFlags, ChildSpecs}}.
```

ハンドラー `roll_dice_handler` には、`GET` リクエストを受け取りランダムなサイコロの出目を返す `handle` 関数が必要です:

```erlang
handle(Req, _Args) ->
    handle(Req#req.method, elli_request:path(Req), Req).

handle('GET', [~"rolldice"], _Req) ->
    Roll = do_roll(),
    {ok, [], erlang:integer_to_binary(Roll)}.
```

`do_roll/0` は 1 から 6 のランダムな数値を返します:

```erlang
-spec do_roll() -> integer().
do_roll() ->
    rand:uniform(6).
```

### 計装 {#instrumentation}

計装の最初のステップは、Elli の計装ライブラリ [otel_elli_middleware](https://github.com/open-telemetry/opentelemetry-erlang-contrib/tree/main/instrumentation/opentelemetry_elli) を追加することです:

```erlang
{callback_args, [{mods, [{otel_elli_middleware, []},
                         {roll_dice_handler, []}]}]},
```

次に、ハンドラーで、ハンドラーが作成したスパンの名前を HTTP のセマンティック規約に合わせて更新する必要があります:

```erlang
handle('GET', [~"rolldice"], _Req) ->
    ?update_name(~"GET /rolldice"),
    Roll = do_roll(),
    {ok, [], erlang:integer_to_binary(Roll)}.

handle_event(_Event, _Data, _Args) ->
    ok.

%%

-spec do_roll() -> integer().
do_roll() ->
    ?with_span(dice_roll, #{},
               fun(_) ->
                       Roll = rand:uniform(6),
                       ?set_attribute('roll.value', Roll),
                       ?counter_add(?ROLL_COUNTER, 1, #{'roll.value' => Roll}),
                       Roll
               end).
```

最後に必要なコードは、`roll_dice_app.erl` で計装 `ROLL_COUNTER` を作成することです:

```erlang
-include_lib("opentelemetry_api_experimental/include/otel_meter.hrl").

start(_StartType, _StartArgs) ->
    create_instruments(),
    roll_dice_sup:start_link().

create_instruments() ->
    ?create_counter(?ROLL_COUNTER, #{description => ~"The number of rolls by roll value.",
                                     unit => '1'}).
```

### 試してみる {#try-it-out-1}

```text
rebar3 shell
```

ブラウザ、curl などで [`localhost:3000/rolldice`](http://localhost:3000/rolldice) にアクセスすると、レスポンスとしてランダムな数値が返され、コンソールに 3 つのスパンと 1 つのメトリクスが表示されるはずです。

<details>
<summary>すべてのスパンを表示</summary>

```text
roll_counter{roll.value=1} 1

{span,319413853664572622578356032097465423781,9329051549219651155,
{tracestate,[]},
4483837830122616505,true,dice_roll,internal,-576460743866039000,
-576460743861510287, {attributes,128,infinity,0,#{'roll.value' => 1}},
{events,128,128,infinity,0,[]}, {links,128,128,infinity,0,[]},
undefined,1,false,
{instrumentation_scope,<<"roll_dice">>,<<"0.1.0">>,undefined}}
{span,120980994633230227841304483210494731701,17581728945491241369,
{tracestate,[]}, undefined,undefined,<<"GET /">>,server,-576460745567307647,
-576460745552778124, {attributes,128,infinity,0, #{<<"http.flavor">> =>
<<"1.1">>, <<"http.host">> => <<"localhost:3000">>, <<"http.method">> =>
<<"GET">>, <<"http.response_content_length">> => 428, <<"http.status">> =>
200,<<"http.target">> => <<"/">>, <<"http.user_agent">> => <<"Mozilla/5.0 (X11;
Linux x86_64; rv:145.0) Gecko/20100101 Firefox/145.0">>, <<"net.host.ip">> =>
<<"127.0.0.1">>, <<"net.host.name">> => "rosa",<<"net.host.port">> => 3000,
<<"net.peer.ip">> => <<"127.0.0.1">>, <<"net.peer.name">> =>
<<"localhost:3000">>, <<"net.peer.port">> => 34112, <<"net.transport">> =>
<<"IP.TCP">>}}, {events,128,128,infinity,0,[]}, {links,128,128,infinity,0,[]},
{status,unset,<<>>}, 1,false,
{instrumentation_scope,<<"opentelemetry_elli">>,<<"0.2.0">>,undefined}}
{span,99954316162469909244758406078309269908,7583363800346194390,
{tracestate,[]}, undefined,undefined,<<"HTTP GET">>,server,-576460745388883955,
-576460745387339610, {attributes,128,infinity,0, #{<<"http.flavor">> =>
<<"1.1">>, <<"http.host">> => <<"localhost:3000">>, <<"http.method">> =>
<<"GET">>, <<"http.response_content_length">> => 457642, <<"http.status">> =>
200, <<"http.target">> => <<"/static/index.js">>, <<"http.user_agent">> =>
<<"Mozilla/5.0 (X11; Linux x86_64; rv:145.0) Gecko/20100101 Firefox/145.0">>,
<<"net.host.ip">> => <<"127.0.0.1">>, <<"net.host.name">> =>
"rosa",<<"net.host.port">> => 3000, <<"net.peer.ip">> => <<"127.0.0.1">>,
<<"net.peer.name">> => <<"localhost:3000">>, <<"net.peer.port">> => 34112,
<<"net.transport">> => <<"IP.TCP">>}}, {events,128,128,infinity,0,[]},
{links,128,128,infinity,0,[]}, {status,unset,<<>>}, 1,false,
{instrumentation_scope,<<"opentelemetry_elli">>,<<"0.2.0">>,undefined}}
{span,319413853664572622578356032097465423781,4483837830122616505,
{tracestate,[]}, 4897145615278856533,true,<<"GET
/rolldice">>,server,-576460743866475748, -576460743861225124,
{attributes,128,infinity,0, #{<<"http.flavor">> => <<"1.1">>, <<"http.host">> =>
<<"localhost:3000">>, <<"http.method">> => <<"GET">>,
<<"http.response_content_length">> => 1, <<"http.status">> => 200,
<<"http.target">> => <<"/rolldice">>, <<"http.user_agent">> => <<"Mozilla/5.0
(X11; Linux x86_64; rv:145.0) Gecko/20100101 Firefox/145.0">>, <<"net.host.ip">>
=> <<"127.0.0.1">>, <<"net.host.name">> => "rosa",<<"net.host.port">> => 3000,
<<"net.peer.ip">> => <<"127.0.0.1">>, <<"net.peer.name">> =>
<<"localhost:3000">>, <<"net.peer.port">> => 34112, <<"net.transport">> =>
<<"IP.TCP">>}}, {events,128,128,infinity,0,[]}, {links,128,128,infinity,0,[]},
{status,unset,<<>>}, 1,false,
{instrumentation_scope,<<"opentelemetry_elli">>,<<"0.2.0">>,undefined}}
```

</details>

## 次のステップ {#next-steps-1}

より多くの[手動計装](/docs/languages/erlang/instrumentation)で計装を充実させましょう。

また、1 つ以上のテレメトリーバックエンドに[テレメトリーデータをエクスポートする](/docs/languages/erlang/exporters)ために、適切なエクスポーターを設定することも必要です。
