---
title: Початок роботи
weight: 10
default_lang_commit: e05fefe6c9f7d8b159d9a9a95128098c646c78c4
# prettier-ignore
cSpell:ignore: bogons defmodule defp ecto elixirc erts Eshell hipe KHTML mixrebar postgres rebar relx rolldice stdlib
---

<!-- markdownlint-disable no-duplicate-heading -->
<!-- markdownlint-capture -->

Ласкаво просимо до посібника з початку роботи з OpenTelemetry для Erlang/Elixir! Цей посібник проведе вас через основні кроки встановлення, налаштування та експорту даних з OpenTelemetry.

## Phoenix

Ця частина посібника покаже вам, як почати роботу з OpenTelemetry у веб-фреймворку Phoenix.

### Передумови {#prerequisites}

Переконайтеся, що у вас встановлені Erlang, Elixir, PostgreSQL (або база даних на ваш вибір) та Phoenix локально. Посібник з [встановлення Phoenix](https://hexdocs.pm/phoenix/installation.html) допоможе вам налаштувати все необхідне.

### Приклад застосунку {#example-application}

Наступний приклад проведе вас через створення базового вебзастосунку [Phoenix](https://www.phoenixframework.org/) та його інструментування за допомогою OpenTelemetry. Для довідки, повний приклад коду, який ви створите, можна знайти тут: [opentelemetry-erlang-contrib/examples/roll_dice](https://github.com/open-telemetry/opentelemetry-erlang-contrib/tree/main/examples/roll_dice).

Додаткові приклади можна знайти в [opentelemetry-erlang-contrib examples](https://github.com/open-telemetry/opentelemetry-erlang-contrib/tree/main/examples).

### Початкове налаштування {#initial-setup}

Запустіть `mix phx.new roll_dice`. Введіть "y", щоб встановити залежності.

### Залежності {#dependencies}

Нам знадобиться кілька інших залежностей, які не входять до складу Phoenix.

- `opentelemetry_api`: містить інтерфейси, які ви будете використовувати для інструментування вашого коду. Такі речі, як `Tracer.with_span` та `Tracer.set_attribute`, визначені тут.
- `opentelemetry`: містить SDK, який реалізує інтерфейси, визначені в API. Без нього всі функції в API є no-ops.
- `opentelemetry_exporter`: дозволяє надсилати ваші телеметричні дані до OpenTelemetry Collector та/або до самостійно розміщених або комерційних сервісів.
- `opentelemetry_phoenix`: створює OpenTelemetry відрізки з подій Elixir `:telemetry`, створених Phoenix.
- `opentelemetry_cowboy`: створює OpenTelemetry відрізки з подій Elixir `:telemetry`, створених вебсервером Cowboy, який використовується Phoenix.

```elixir
# mix.exs
def deps do
  [
    # other default deps...
    {:opentelemetry, "~> {{% param versions.otelSdk %}}"},
    {:opentelemetry_api, "~> {{% param versions.otelApi %}}"},
    {:opentelemetry_exporter, "~> {{% param versions.otelExporter %}}"},
    {:opentelemetry_phoenix, "~> {{% param versions.otelPhoenix %}}"},
    {:opentelemetry_cowboy, "~> {{% param versions.otelCowboy %}}"},
    {:opentelemetry_ecto, "~> {{% param versions.otelEcto %}}"} # якщо використовуєте ecto
  ]
end
```

Останні два також потрібно налаштувати при запуску вашого застосунку:

```elixir
# application.ex
@impl true
def start(_type, _args) do
  :opentelemetry_cowboy.setup()
  OpentelemetryPhoenix.setup(adapter: :cowboy2)
  OpentelemetryEcto.setup([:dice_game, :repo]) # якщо використовуєте ecto
end
```

Також переконайтеся, що ваш файл `endpoint.ex` містить наступний рядок:

```elixir
# endpoint.ex
plug Plug.Telemetry, event_prefix: [:phoenix, :endpoint]
```

Нам також потрібно налаштувати застосунку `opentelemetry` як тимчасовий, додавши розділ `releases` до конфігурації вашого проєкту. Це забезпечить, що якщо він завершиться, навіть аномально, застосунок `roll_dice` не буде завершено.

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

Останнє, що вам потрібно, це налаштувати експортер. Для розробки ми можемо використовувати stdout експортер, щоб переконатися, що все працює правильно. Налаштуйте `traces_exporter` OpenTelemetry наступним чином:

```elixir
# config/dev.exs
config :opentelemetry, traces_exporter: {:otel_exporter_stdout, []}
```

Тепер ми можемо використовувати нову команду `mix setup`, щоб встановити залежності, зібрати активи та створити та мігрувати базу даних.

### Спробуйте {#try-it-out}

Запустіть `mix phx.server`.

Якщо все пройшло добре, ви повинні побачити кілька рядків, схожих на ці, у вашому терміналі, коли відвідаєте [localhost:4000](http://localhost:4000) у вашому оглядачі.

(Не хвилюйтеся, якщо формат виглядає трохи незвично. Відрізки записуються в [структурі даних Erlang `record`](https://www.erlang.org/doc/reference_manual/records.html), а [`otel_span.hrl`](https://github.com/open-telemetry/opentelemetry-erlang/blob/main/apps/opentelemetry/include/otel_span.hrl#L19) описує структуру запису `span` і пояснює, що таке різні поля.)

```shell
*SPANS FOR DEBUG*
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

Це сирі записи Erlang, які будуть серіалізовані та надіслані, коли ви налаштуєте експортер для вашого улюбленого сервісу.

### Кидання кубиків {#rolling-the-dice}

Тепер ми створимо точку доступу API, який дозволить нам кидати кубики та повертати випадкове число від 1 до 6.

```elixir
# router.ex
scope "/api", RollDiceWeb do
  pipe_through :api

  get "/rolldice", DiceController, :roll
end
```

І створимо простий `DiceController` без інструментування:

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

Якщо хочете, викличте маршрут, щоб побачити результат. Ви все ще побачите деяку телеметрію у вашому терміналі. Тепер настав час збагатити цю телеметрію, інструментуючи нашу функцію `roll` вручну.

У нашому `DiceController` ми викликаємо приватний метод `dice_roll`, який генерує наше випадкове число. Це здається досить важливою операцією, тому для її захоплення у нашому трасуванні нам потрібно обгорнути її у відрізок.

```elixir
defmodule RollDiceWeb.DiceController do
  use RollDiceWeb, :controller
  require OpenTelemetry.Tracer, as: Tracer

  # ...snip

  defp roll_dice do
    Tracer.with_span("dice_roll") do
      to_string(Enum.random(1..6))
    end
  end
end
```

Було б також добре знати, яке число було згенеровано, тому ми можемо витягти його як локальну змінну та додати як атрибут до відрізка.

```elixir
defp roll_dice do
  Tracer.with_span("dice_roll") do
    roll = Enum.random(1..6)

    Tracer.set_attribute(:roll, roll)

    to_string(roll)
  end
end
```

Тепер, якщо ви відкриєте у своєму оглядачі/curl/etc. [localhost:4000/api/rolldice](http://localhost:4000/api/rolldice), ви повинні отримати випадкове число у відповідь та 3 відрізки у вашій консолі.

<details>
<summary>Переглянути повні відрізки</summary>

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

##### `<<"/api/rolldice">>`

Це перший відрізок у запиті, тобто кореневий відрізок. Це `undefined` поруч з імʼям відрізка означає, що він не має батьківського відрізка. Два дуже великі негативні числа — це час початку та завершення відрізка у `native` одиницях часу. Якщо вам цікаво, ви можете обчислити тривалість у мілісекундах так: `System.convert_time_unit(-576460729491912750 - -576460729549928500, :native, :millisecond)`. `phoenix.plug` та `phoenix.action` покажуть вам контролер та функцію, яка обробила запит. Ви також помітите, що instrumentation_scope — це `opentelemetry_cowboy`. Коли ми сказали функції налаштування opentelemetry_phoenix, що ми хочемо використовувати адаптер `:cowboy2`, це дало їй знати, що не потрібно створювати додатковий відрізок, а натомість додати атрибути до наявного відрізка cowboy. Це забезпечує більш точні дані про затримку у наших трасуваннях.

##### `<<"HTTP GET">>`

Це запит на favicon, який ви можете побачити в атрибуті `'http.target' => <<"/favicon.ico">>`. Я _вважаю_, що він має загальне імʼя, тому що не має `http.route`.

##### `<<"dice_roll">>`

Це користувацький відрізок, який ми додали до нашого приватного методу. Ви помітите, що він має лише один атрибут, який ми встановили, `roll => 2`. Ви також повинні помітити, що він є частиною тієї ж трасування, що і наш відрізок `<<"/api/rolldice">>`, `224439009126930788594246993907621543552` і має ідентифікатор батьківського відрізка `5581431573601075988`, який є ідентифікатором відрізка `<<"/api/rolldice">>`. Це означає, що цей відрізок є дочірнім до того, і буде показаний під ним, коли буде відображений у вашому інструменті трасування.

### Наступні кроки {#next-steps}

Збагачуйте ваше автоматично згенероване інструментування [ручним інструментуванням](/docs/languages/erlang/instrumentation) вашого власного коду. Це дозволяє вам налаштовувати дані спостережуваності, які ваш застосунок генерує.

Вам також потрібно буде налаштувати відповідний експортер для [експорту ваших даних телеметрії](/docs/languages/erlang/exporters) до одного або більше бекендів телеметрії.

## Створення нового проєкту Mix/Rebar {#creating-a-new-mixrebar-project}

Щоб почати з цього посібника, створіть новий проєкт за допомогою `rebar3` або `mix`:

{{< tabpane text=true >}} {{% tab Erlang %}}

```erlang
rebar3 new release otel_getting_started
```

{{% /tab %}} {{% tab Elixir %}}

```elixir
mix new --sup otel_getting_started
```

{{% /tab %}} {{< /tabpane >}}

Потім, у проєкті, який ви щойно створили, додайте як `opentelemetry_api`, так і `opentelemetry` як залежності. Ми додаємо обидва, тому що це проєкт, який ми будемо запускати як Release та експортувати відрізки з нього.

{{< tabpane text=true >}} {{% tab Erlang %}}

```erlang
{deps, [{opentelemetry_api, "~> {{% param versions.otelApi %}}"},
        {opentelemetry, "~> {{% param versions.otelSdk %}}"}]}.
```

{{% /tab %}} {{% tab Elixir %}}

```elixir
def deps do
  [
    {:opentelemetry_api, "~> {{% param versions.otelApi %}}"},
    {:opentelemetry, "~> {{% param versions.otelSdk %}}"}
  ]
end
```

{{% /tab %}} {{< /tabpane >}}

У випадку Erlang, API-застосунок також потрібно додати до `src/otel_getting_started.app.src` та розділ `relx` до `rebar.config`. У проєкті Elixir потрібно додати розділ `releases` до `mix.exs`:

{{< tabpane text=true >}} {{% tab Erlang %}}

```erlang
%% src/otel_getting_started.app.src
...
{applications, [kernel,
                stdlib,
                opentelemetry_api]},
...

%% rebar.config
{relx, [{release, {otel_getting_started, "0.1.0"},
         [{opentelemetry, temporary},
          otel_getting_started]},

       ...]}.
```

{{% /tab %}} {{% tab Elixir %}}

```elixir
# mix.exs
releases: [
  otel_getting_started: [
    version: "0.0.1",
    applications: [opentelemetry: :temporary, otel_getting_started: :permanent]
  ]
]
```

{{% /tab %}} {{< /tabpane >}}

SDK `opentelemetry` слід додати якомога раніше у процес завантаження Release, щоб забезпечити його доступність до того, як буде створена будь-яка телеметрія. Тут він також встановлений як `temporary`, виходячи з припущення, що ми віддаємо перевагу робочому Release, який не створює телеметрію, ніж аварійному завершенню всього Release.

Крім API та SDK, потрібен експортер для виведення даних. SDK постачається з експортером для налагодження, який виводить дані на stdout, і є окремі пакунки для експорту через [OpenTelemetry Protocol (OTLP)](https://hex.pm/packages/opentelemetry_exporter) та [Zipkin protocol](https://hex.pm/packages/opentelemetry_zipkin).

## Ініціалізація та налаштування {#initialization-and-configuration}

Налаштування здійснюється через [середовище застосунків OTP](https://erlang.org/doc/design_principles/applications.html#configuring-an-application) або [змінні середовища ОС](/docs/specs/otel/configuration/sdk-environment-variables/). SDK (застосунок `opentelemetry`) використовує налаштування для ініціалізації [Tracer Provider](https://hexdocs.pm/opentelemetry/otel_tracer_server.html), його [Span Processors](https://hexdocs.pm/opentelemetry/otel_span_processor.html) та [Exporter](https://hexdocs.pm/opentelemetry/otel_exporter.html).

### Використання Console Exporter {#using-the-console-exporter}

Експортери — це пакунки, які дозволяють телеметричним даним бути виведеними кудись, або в консоль (що ми робимо тут), або на віддалену систему або колектор для подальшого аналізу та/або збагачення. OpenTelemetry підтримує різноманітні експортери через свою екосистему, включаючи популярні інструменти з відкритим вихідним кодом, такі як Jaeger та Zipkin.

Щоб налаштувати OpenTelemetry для використання певного експортера, у цьому випадку `otel_exporter_stdout`, середовище застосунків OTP для `opentelemetry` повинно встановити `exporter` для span processor `otel_batch_processor`, типу span processor, який обʼєднує кілька відрізків протягом певного періоду часу:

{{< tabpane text=true >}} {{% tab Erlang %}}

```erlang
%% config/sys.config.src
[
 {opentelemetry,
  [{span_processor, batch},
   {traces_exporter, {otel_exporter_stdout, []}}]}
].
```

{{% /tab %}} {{% tab Elixir %}}

```elixir
# config/runtime.exs
config :opentelemetry,
  span_processor: :batch,
  traces_exporter: {:otel_exporter_stdout, []}
```

{{% /tab %}} {{< /tabpane >}}

## Робота зі відрізками {#working-with-spans}

Тепер, коли залежності та налаштування встановлені, ми можемо створити модуль з функцією `hello/0`, яка запускає деякі відрізки:

{{< tabpane text=true >}} {{% tab Erlang %}}

```erlang
%% apps/otel_getting_started/src/otel_getting_started.erl
-module(otel_getting_started).

-export([hello/0]).

-include_lib("opentelemetry_api/include/otel_tracer.hrl").

hello() ->
    %% start an active span and run a local function
    ?with_span(operation, #{}, fun nice_operation/1).

nice_operation(_SpanCtx) ->
    ?add_event(<<"Nice operation!">>, [{<<"bogons">>, 100}]),
    ?set_attributes([{another_key, <<"yes">>}]),

    %% start an active span and run an anonymous function
    ?with_span(<<"Sub operation...">>, #{},
               fun(_ChildSpanCtx) ->
                       ?set_attributes([{lemons_key, <<"five">>}]),
                       ?add_event(<<"Sub span event!">>, [])
               end).
```

{{% /tab %}} {{% tab Elixir %}}

```elixir
# lib/otel_getting_started.ex
defmodule OtelGettingStarted do
  require OpenTelemetry.Tracer, as: Tracer

  def hello do
    Tracer.with_span :operation do
      Tracer.add_event("Nice operation!", [{"bogons", 100}])
      Tracer.set_attributes([{:another_key, "yes"}])

      Tracer.with_span "Sub operation..." do
        Tracer.set_attributes([{:lemons_key, "five"}])
        Tracer.add_event("Sub span event!", [])
      end
    end
  end
end
```

{{% /tab %}} {{< /tabpane >}}

У цьому прикладі ми використовуємо макроси, які використовують словник процесу для поширення контексту та отримання трейсера.

Всередині нашої функції ми створюємо новий відрізок з імʼям `operation` за допомогою макросу `with_span`. Макрос встановлює новий відрізок як `active` у поточному контексті, збереженому у словнику процесу, оскільки ми не передаємо контекст як змінну.

Відрізки можуть мати атрибути та події, які є метаданими та журналами, що допомагають вам інтерпретувати трасування після факту. Перший відрізок має подію `Nice operation!`, з атрибутами на події, а також атрибут, встановлений на самому відрізку.

Нарешті, у цьому фрагменті коду ми можемо побачити приклад створення дочірнього відрізка активного відрізка. Коли макрос `with_span` запускає новий відрізок, він використовує активний відрізок поточного контексту як батьківський. Тому, коли ви запустите цю програму, ви побачите, що відрізок `Sub operation...` був створений як дочірній до відрізка `operation`.

Щоб перевірити цей проєкт і побачити створені відрізки, ви можете запустити з `rebar3 shell` або `iex -S mix`, кожен з яких підбере відповідну конфігурацію для релізу, що призведе до запуску трейсера та експортера.

{{< tabpane text=true >}} {{% tab Erlang %}}

```console
$ rebar3 shell
===> Compiling otel_getting_started
Erlang/OTP 23 [erts-11.1] [source] [64-bit] [smp:8:8] [ds:8:8:10] [async-threads:1] [hipe]

Eshell V11.1  (abort with ^G)
1>
1> otel_getting_started:hello().
true
*SPANS FOR DEBUG*
{span,177312096541376795265675405126880478701,5706454085098543673,undefined,
      13736713257910636645,<<"Sub operation...">>,internal,
      -576460750077844044,-576460750077773674,
      [{lemons_key,<<"five">>}],
      [{event,-576460750077786044,<<"Sub span event!">>,[]}],
      [],undefined,1,false,undefined}
{span,177312096541376795265675405126880478701,13736713257910636645,undefined,
      undefined,operation,internal,-576460750086570890,
      -576460750077752627,
      [{another_key,<<"yes">>}],
      [{event,-576460750077877345,<<"Nice operation!">>,[{<<"bogons">>,100}]}],
      [],undefined,1,false,undefined}
```

{{% /tab %}} {{% tab Elixir %}}

```console
$ iex -S mix
Erlang/OTP 23 [erts-11.1] [source] [64-bit] [smp:8:8] [ds:8:8:10] [async-threads:1] [hipe]

Compiling 1 file (.ex)
Interactive Elixir (1.11.0) - press Ctrl+C to exit (type h() ENTER for help)
iex(1)> OtelGettingStarted.hello()
true
iex(2)>
*SPANS FOR DEBUG*
{span,180094370450826032544967824850795294459,5969980227405956772,undefined,
      14276444653144535440,<<"Sub operation...">>,'INTERNAL',
      -576460741349434100,-576460741349408901,
      [{lemons_key,<<"five">>}],
      [{event,-576460741349414157,<<"Sub span event!">>,[]}],
      [],undefined,1,false,undefined}
{span,180094370450826032544967824850795294459,14276444653144535440,undefined,
      undefined,:operation,'INTERNAL',-576460741353342627,
      -576460741349400034,
      [{another_key,<<"yes">>}],
      [{event,-576460741349446725,<<"Nice operation!">>,[{<<"bogons">>,100}]}],
      [],undefined,1,false,undefined}
```

{{% /tab %}} {{< /tabpane >}}

## Наступні кроки {#next-steps}

Збагачуйте ваше інструментування більшою кількістю [ручного інструментування](/docs/languages/erlang/instrumentation).

Вам також потрібно буде налаштувати відповідний експортер для [експорту ваших даних телеметрії](/docs/languages/erlang/exporters) до одного або більше бекендів телеметрії.
