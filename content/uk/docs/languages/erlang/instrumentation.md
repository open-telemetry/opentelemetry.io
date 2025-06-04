---
title: Інструментування
aliases: [manual]
weight: 30
description: Інструментування для OpenTelemetry Erlang/Elixir
default_lang_commit: e05fefe6c9f7d8b159d9a9a95128098c646c78c4
---

{{% include instrumentation-intro %}}

## Налаштування {#setup}

Додайте наступні залежності до вашого проєкту:

- `opentelemetry_api`: містить інтерфейси, які ви будете використовувати для інструментування вашого коду. Такі речі, як `Tracer.with_span` і `Tracer.set_attribute`, визначені тут.
- `opentelemetry`: містить SDK, який реалізує інтерфейси, визначені в API. Без нього всі функції в API будуть no-ops.

```elixir
# mix.exs
def deps do
  [
    {:opentelemetry, "~> 1.3"},
    {:opentelemetry_api, "~> 1.2"},
  ]
end
```

## Трейси {#traces}

### Ініціалізація Трейсингу {#initializing-tracing}

Щоб почати [трейсинг](/docs/concepts/signals/traces/), потрібен [`TracerProvider`](/docs/concepts/signals/traces/#tracer-provider) для створення [`Tracer`](/docs/concepts/signals/traces/#tracer). Коли OpenTelemetry SDK Application (`opentelemetry`) запускається, він запускає та налаштовує глобальний `TracerProvider`. `Tracer` для кожного завантаженого OTP Application створюється після запуску `TracerProvider`.

Якщо TracerProvider не був успішно створений (наприклад, застосунок `opentelemetry` не запущений або не вдалося запустити), OpenTelemetry API для трейсингу використовуватиме no-op реалізацію і не буде генерувати дані.

### Отримання Трейсера {#acquiring-tracer}

Кожен OTP Application має `Tracer`, створений для нього, коли запускається застосунок `opentelemetry`. Імʼя та версія кожного `Tracer` такі ж, як імʼя та версія OTP Application, в якому використовується `Tracer`. Якщо виклик для використання `Tracer` не знаходиться в модулі, наприклад, при використанні інтерактивної оболонки, використовується `Tracer` з порожнім імʼям та версією.

Запис створеного `Tracer` можна знайти за імʼям модуля в OTP Application:

{{< tabpane text=true >}} {{% tab Erlang %}}

```erlang
opentelemetry:get_application_tracer(?MODULE)
```

{{% /tab %}} {{% tab Elixir %}}

```elixir
:opentelemetry.get_application_tracer(__MODULE__)
```

{{% /tab %}} {{< /tabpane >}}

Таким чином, макроси Erlang та Elixir для запуску та оновлення `Spans` автоматично отримують `Tracer` без необхідності передавати змінну в кожному виклику.

### Створення Відрізків {#create-spans}

Тепер, коли у вас є ініціалізовані [Tracer](/docs/concepts/signals/traces/#tracer), ви можете створювати [Відрізки](/docs/concepts/signals/traces/#spans).

{{< tabpane text=true >}} {{% tab Erlang %}}

```erlang
?with_span(main, #{}, fun() ->
                        %% do work here.
                        %% when this function returns the Span ends
                      end).
```

{{% /tab %}} {{% tab Elixir %}}

```elixir
require OpenTelemetry.Tracer

...

OpenTelemetry.Tracer.with_span :main do
  # do work here
  # when the block ends the Span ends
end
```

{{% /tab %}} {{< /tabpane >}}

Наведений вище приклад коду показує, як створити активний Відрізок, що є найпоширенішим типом Span для створення.

### Створення вкладених Відрізків {#creating-nested-spans}

{{< tabpane text=true >}} {{% tab Erlang %}}

```erlang
parent_function() ->
    ?with_span(parent, #{}, fun child_function/0).

child_function() ->
    %% this is the same process, so the span parent set as the active
    %% span in the with_span call above will be the active span in this function
    ?with_span(child, #{},
               fun() ->
                   %% do work here. when this function returns, child will complete.
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
    # this is the same process, so the span :parent set as the active
    # span in the with_span call above will be the active span in this function
    OpenTelemetry.Tracer.with_span :child do
        ## do work here. when this function returns, :child will complete.
    end
end
```

{{% /tab %}} {{< /tabpane >}}

### Відрізки в окремих процесах {#spans-in-separate-processes}

Приклади в попередньому розділі були відрізками з відношенням пращур-нащадок в межах одного процесу, де пращур доступний у словнику процесу при створенні дочірнього відрізка. Використання словника процесу таким чином неможливе при переході між процесами, або шляхом створення нового процесу, або відправленням повідомлення до наявного процесу. Замість цього контекст повинен бути переданий вручну як змінна.

Щоб передати відрізки між процесами, нам потрібно запустити відрізок, який не повʼязаний з конкретним процесом. Це можна зробити за допомогою макросу `start_span`. На відміну від `with_span`, макрос `start_span` не встановлює новий відрізок як активний відрізок у контексті словника процесу.

Звʼязування відрізка як пращура до нащадка в новому процесі можна зробити шляхом прикріплення контексту та встановлення нового відрізка як активного в процесі. Весь контекст повинен бути прикріплений, щоб не втратити інші дані телеметрії, такі як [baggage](/docs/specs/otel/baggage/api/).

{{< tabpane text=true >}} {{% tab Erlang %}}

```erlang
SpanCtx = ?start_span(child),

Ctx = otel_ctx:get_current(),

proc_lib:spawn_link(fun() ->
                        otel_ctx:attach(Ctx),
                        ?set_current_span(SpanCtx),

                        %% do work here

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
                      # do work here

                      # end span here
                      OpenTelemetry.Tracer.end_span(span_ctx)
                  end)

_ = Task.await(task)
```

{{% /tab %}} {{< /tabpane >}}

### Звʼязування нового Відрізка {#linking-the-new-span}

[Відрізок](/docs/concepts/signals/traces/#spans) може бути створений з нульовою або більше кількістю [Span Links](/docs/concepts/signals/traces/#span-links), які повʼязують його з іншим Span. Span Link потребує контексту Span для створення.

{{< tabpane text=true >}} {{% tab Erlang %}}

```erlang
Parent = ?current_span_ctx,
proc_lib:spawn_link(fun() ->
                        %% a new process has a new context so the span created
                        %% by the following `with_span` will have no parent
                        Link = opentelemetry:link(Parent),
                        ?with_span('other-process', #{links => [Link]},
                                   fun() -> ok end)
                    end),
```

{{% /tab %}} {{% tab Elixir %}}

```elixir
parent = OpenTelemetry.Tracer.current_span_ctx()
task = Task.async(fn ->
                    # a new process has a new context so the span created
                    # by the following `with_span` will have no parent
                    link = OpenTelemetry.link(parent)
                    Tracer.with_span :"my-task", %{links: [link]} do
                      :hello
                    end
                 end)
```

{{% /tab %}} {{< /tabpane >}}

### Додавання атрибутів до Відрізка {#adding-attributes-to-a-span}

[Атрибути](/docs/concepts/signals/traces/#attributes) дозволяють прикріплювати пари ключ/значення до відрізка, щоб він містив більше інформації про поточну операцію, яку він відстежує.

Наступний приклад показує два способи встановлення атрибутів на відрізок, встановлюючи атрибут у параметрах запуску, а потім знову за допомогою `set_attributes` у тілі операції відрізка:

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

### Семантичні атрибути {#semantic-attributes}

Семантичні Атрибути — це атрибути, визначені [Специфікацією OpenTelemetry][специфікація opentelemetry], щоб забезпечити спільний набір ключів атрибутів для різних мов, фреймворків та середовищ виконання для загальних концепцій, таких як HTTP методи, коди статусу, агенти користувача та інше. Ці ключі атрибутів генеруються зі специфікації та надаються в [opentelemetry_semantic_conventions](https://hex.pm/packages/opentelemetry_semantic_conventions).

Наприклад, інструментування для HTTP клієнта або сервера повинно включати семантичні атрибути, такі як схема URL:

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

### Додавання подій {#adding-events}

[Подія Відрізка](/docs/concepts/signals/traces/#span-events) — це повідомлення, яке можна прочитати людина, у [Відрізку](/docs/concepts/signals/traces/#spans), що являє собою дискретну подію без тривалості, яку можна відстежити за допомогою одного часового відбитка. Ви можете думати про це як про примітивний лог.

{{< tabpane text=true >}} {{% tab Erlang %}}

```erlang
?add_event(<<"Gonna try it">>),

%% Do the thing

?add_event(<<"Did it!">>),
```

{{% /tab %}} {{% tab Elixir %}}

```elixir
Tracer.add_event("Gonna try it")

%% Do the thing

Tracer.add_event("Did it!")
```

{{% /tab %}} {{< /tabpane >}}

Події також можуть мати власні атрибути:

{{< tabpane text=true >}} {{% tab Erlang %}}

```erlang
?add_event(<<"Process exited with reason">>, [{pid, Pid)}, {reason, Reason}]))
```

{{% /tab %}} {{% tab Elixir %}}

```elixir
Tracer.add_event("Process exited with reason", pid: pid, reason: Reason)
```

{{% /tab %}} {{< /tabpane >}}

### Встановлення статусу Відрізка {#set-span-status}

[Статус](/docs/concepts/signals/traces/#span-status) можна встановити на [Відрізок](/docs/concepts/signals/traces/#spans), зазвичай використовується для вказівки, що Відрізок не завершився успішно — `StatusCode.ERROR`. У рідкісних випадках ви можете перевизначити статус помилки на `StatusCode.OK`, але не встановлюйте `StatusCode.OK` на успішно завершених відрізках.

Статус можна встановити в будь-який час до завершення відрізка:

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

## Метрики {#metrics}

API метрик, який знаходиться в `apps/opentelemetry_experimental_api` репозиторію [opentelemetry-erlang](https://github.com/open-telemetry/opentelemetry-erlang), наразі нестабільний, документація TBA.

## Логи {#logs}

API логів, який знаходиться в `apps/opentelemetry_experimental_api` репозиторію [opentelemetry-erlang](https://github.com/open-telemetry/opentelemetry-erlang), наразі нестабільний, документація TBA.

## Наступні кроки {#next-steps}

Вам також потрібно буде налаштувати відповідний експортер для [експорту ваших даних телеметрії](/docs/languages/erlang/exporters) до одного або більше бекендів телеметрії.

[специфікація opentelemetry]: /docs/specs/otel/
