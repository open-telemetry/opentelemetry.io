---
title: Початок роботи
weight: 10
default_lang_commit: 5489ba34bff91356aa2c501cd55f07eeb30cc355
# prettier-ignore
cSpell:ignore: defmodule defp ecto elixirc elli KHTML postgres rebar relx rolldice stdlib
---

<!-- markdownlint-disable no-duplicate-heading -->

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
    {:opentelemetry_exporter, "~> {{% param versions.otelExporter %}}"},
    {:opentelemetry, "~> {{% param versions.otelSdk %}}"},
    {:opentelemetry_api, "~> {{% param versions.otelApi %}}"},
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

##### Створені відрізки {#generated-spans}

У наведеному вище виведенні є 3 відрізки. Назва відрізка є 6-м елементом у кортежі, і кожен з них детально описаний нижче:

###### `<<"/api/rolldice">>`

Це перший відрізок у запиті, тобто кореневий відрізок. Це `undefined` поруч з імʼям відрізка означає, що він не має батьківського відрізка. Два дуже великі негативні числа — це час початку та завершення відрізка у `native` одиницях часу. Якщо вам цікаво, ви можете обчислити тривалість у мілісекундах так: `System.convert_time_unit(-576460729491912750 - -576460729549928500, :native, :millisecond)`. `phoenix.plug` та `phoenix.action` покажуть вам контролер та функцію, яка обробила запит. Ви також помітите, що instrumentation_scope — це `opentelemetry_cowboy`. Коли ми сказали функції налаштування opentelemetry_phoenix, що ми хочемо використовувати адаптер `:cowboy2`, це дало їй знати, що не потрібно створювати додатковий відрізок, а натомість додати атрибути до наявного відрізка cowboy. Це забезпечує більш точні дані про затримку у наших трасуваннях.

###### `<<"HTTP GET">>`

Це запит на favicon, який ви можете побачити в атрибуті `'http.target' => <<"/favicon.ico">>`. Я _вважаю_, що він має загальне імʼя, тому що не має `http.route`.

###### `<<"dice_roll">>`

Це користувацький відрізок, який ми додали до нашого приватного методу. Ви помітите, що він має лише один атрибут, який ми встановили, `roll => 2`. Ви також повинні помітити, що він є частиною тієї ж трасування, що і наш відрізок `<<"/api/rolldice">>`, `224439009126930788594246993907621543552` і має ідентифікатор батьківського відрізка `5581431573601075988`, який є ідентифікатором відрізка `<<"/api/rolldice">>`. Це означає, що цей відрізок є дочірнім до того, і буде показаний під ним, коли буде відображений у вашому інструменті трасування.

### Наступні кроки {#next-steps}

Збагачуйте ваше автоматично згенероване інструментування [ручним інструментуванням](/docs/languages/erlang/instrumentation) вашого власного коду. Це дозволяє вам налаштовувати дані спостережуваності, які ваш застосунок генерує.

Вам також потрібно буде налаштувати відповідний експортер для [експорту ваших даних телеметрії](/docs/languages/erlang/exporters) до одного або більше бекендів телеметрії.

## Elli

У цьому розділі показано, як розпочати роботу з OpenTelemetry та HTTP-сервером Elli.

### Необхідні умови {#prerequisites}

Переконайтеся, що у вас локально встановлено Erlang та [rebar3](https://rebar3.org).

### Приклад застосунку {#example-application}

У наведеному нижче прикладі ви дізнаєтеся, як створити базовий веб-застосунок [Elli](https://github.com/elli-lib/elli) та налаштувати його за допомогою OpenTelemetry. Для довідки, повний приклад коду, який ви будете створювати, можна знайти тут: [opentelemetry-erlang-contrib/examples/roll_dice_elli](https://github.com/open-telemetry/opentelemetry-erlang-contrib/tree/main/examples/roll_dice_elli). Зверніть увагу, що повний приклад містить додатковий код для HTML-інтерфейсу, який ми тут не розглядатимемо.

Додаткові приклади можна знайти [в документації з прикладами для Erlang](/docs/languages/erlang/examples/).

### Початкові налаштування {#initial-setup}

`rebar3 new release roll_dice_elli`

### Залежності {#dependencies}

Нам знадобляться ще кілька залежностей, яких немає в Elli.

- `opentelemetry_api`: містить інтерфейси, які ви будете використовувати для інструментування свого коду. Тут визначені такі речі, як `Tracer.with_span` та `Tracer.set_attribute`.
- `opentelemetry`: містить SDK, що реалізує інтерфейси, визначені в API. Без нього всі функції в API не працюють.
- `opentelemetry_exporter`: дозволяє надсилати ваші телеметричні дані до OpenTelemetry Collector та/або до самостійно розміщених або комерційних сервісів.
- `opentelemetry_elli`: створює OpenTelemetry spans як проміжне програмне забезпечення Elli.
- `opentelemetry_api_experimental`: нестабільні частини API, що включають підтримку метрик.
- `opentelemetry_experimental`: нестабільні частини SDK, що включають підтримку метрик.

Всі вони додаються разом з `elli` до залежностей rebar3 та застосунків, що включаються до випуску:

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

А залежності повинні бути включені в `.app.src` застосунку, `src/roll_dice.app.src`:

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

### Конфігурація {#configuration}

SDK та експериментальний SDK налаштовуються у файлі `config/sys.config`:

```erlang
{opentelemetry,
 [{span_processor, batch},
  {traces_exporter, {otel_exporter_stdout, []}}]},

{opentelemetry_experimental,
 [{readers, [#{module => otel_metric_reader,
               config => #{export_interval_ms => 1000,
                           exporter => {otel_metric_exporter_console, #{}}}}]}]},
```

З цією конфігурацією завершені відрізки та записані показники будуть виводитися в консоль кожну секунду.

### Сервер Elli {#the-elli-server}

HTTP-сервер запускається в супервізорі верхнього рівня застосунку, `src/roll_dice_sup.erl`:

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

Обробник `roll_dice_handler` потребує функції `handle`, яка приймає запит `GET` і повертає випадковий результат кидка кубика:

```erlang
handle(Req, _Args) ->
    handle(Req#req.method, elli_request:path(Req), Req).

handle('GET', [~"rolldice"], _Req) ->
    Roll = do_roll(),
    {ok, [], erlang:integer_to_binary(Roll)}.
```

`do_roll/0` повертає випадкове число від 1 до 6:

```erlang
-spec do_roll() -> integer().
do_roll() ->
    rand:uniform(6).
```

### Інструментування {#instrumentation}

Першим кроком в інструментуванні є додавання бібліотеки інструментації Elli, [otel_elli_middleware](https://github.com/open-telemetry/opentelemetry-erlang-contrib/tree/main/instrumentation/opentelemetry_elli):

```erlang
{callback_args, [{mods, [{otel_elli_middleware, []},
                         {roll_dice_handler, []}]}]},
```

Потім в обробнику імʼя діапазону, створеного обробником, слід оновити відповідно до семантичних домовленостей для HTTP:

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

Останній код, який нам потрібен, — це створення інструментів, `ROLL_COUNTER` у `roll_dice_app.erl`:

```erlang
-include_lib("opentelemetry_api_experimental/include/otel_meter.hrl").

start(_StartType, _StartArgs) ->
    create_instruments(),
    roll_dice_sup:start_link().

create_instruments() ->
    ?create_counter(?ROLL_COUNTER, #{description => ~"The number of rolls by roll value.",
                                     unit => '1'}).
```

### Спробуйте {#try-it-out}

```text
rebar3 shell
```

Тепер, якщо ви вкажете у своєму оглядачі/curl/тощо адресу [`localhost:3000/rolldice`](http://localhost:3000/rolldice), ви повинні отримати у відповідь випадкове число, а також 3 відрізки та 1 метрику у своїй консолі.

<details>
<summary>Переглянути повні відрізки</summary>

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

## Наступні кроки {#next-steps}

Збагачуйте ваше інструментування більшою кількістю [ручного інструментування](/docs/languages/erlang/instrumentation).

Вам також потрібно буде налаштувати відповідний експортер для [експорту ваших даних телеметрії](/docs/languages/erlang/exporters) до одного або більше бекендів телеметрії.
