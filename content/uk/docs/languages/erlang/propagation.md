---
title: Поширення
weight: 60
default_lang_commit: 873e42833f8e17860becdff26de4717194eb11ca
cSpell:ignore: elli
---

{{% docs/languages/propagation %}}

## Автоматичне поширення контексту {#automatic-context-propagation}

Розподілені трасування виходять за межі одного сервісу, що означає, що деякий контекст повинен бути переданий між сервісами для створення відносин пращур-нащадок між Відрізками. Це вимагає міжсервісного [_поширення контексту_](/docs/specs/otel/overview/#context-propagation), механізму, за допомогою якого ідентифікатори для Трасування надсилаються до віддалених процесів.

Бібліотеки інструментування для HTTP фреймворків та серверів, таких як [Phoenix](https://github.com/open-telemetry/opentelemetry-erlang-contrib/tree/main/instrumentation/opentelemetry_phoenix),
[Cowboy](https://github.com/open-telemetry/opentelemetry-erlang-contrib/tree/main/instrumentation/opentelemetry_cowboy), [Elli](https://github.com/open-telemetry/opentelemetry-erlang-contrib/tree/main/instrumentation/opentelemetry_elli) та клієнтів, таких як [Tesla](https://github.com/open-telemetry/opentelemetry-erlang-contrib/tree/main/instrumentation/opentelemetry_tesla) автоматично впроваджують або витягують контекст, використовуючи глобально зареєстровані поширювачі. Стандартно використовуються глобальні поширювачі W3C [Trace Context](https://w3c.github.io/trace-context/) та [Baggage](https://www.w3.org/TR/baggage/) формати.

Ви можете налаштувати глобальні поширювачі, використовуючи змінну середовища OTP `text_map_propagators`:

{{< tabpane text=true >}} {{% tab Erlang %}}

```erlang
%% sys.config
...
{text_map_propagators, [baggage,
                        trace_context]},
...
```

{{% /tab %}} {{% tab Elixir %}}

```elixir
## runtime.exs
...
text_map_propagators: [:baggage, :trace_context],
...
```

{{% /tab %}} {{< /tabpane >}}

Ви також можете передати список, розділений комами, використовуючи змінну середовища `OTEL_PROPAGATORS`. Обидві форми конфігурації приймають значення `trace_context`, `baggage`, [`b3`](https://github.com/openzipkin/b3-propagation) та `b3multi`.

## Ручне поширення контексту {#manual-context-propagation}

Щоб вручну впровадити або витягти контекст, ви можете використовувати модуль `otel_propagator_text_map`:

{{< tabpane text=true >}} {{% tab Erlang %}}

```erlang
%% використовує контекст з словника процесу для додавання до порожнього списку заголовків
Headers = otel_propagator_text_map:inject([]),

%% створює контекст у словнику процесу з Headers
otel_propagator_text_map:extract(Headers),
```

{{% /tab %}} {{% tab Elixir %}}

```elixir
# використовує контекст з словника процесу для додавання до порожнього списку заголовків
headers = :otel_propagator_text_map.inject([])

# створює контекст у словнику процесу з headers
:otel_propagator_text_map.extract(headers)
```

{{% /tab %}} {{< /tabpane >}}

`otel_propagator_text_map:inject/1` та `otel_propagator_text_map:extract/1` використовують глобально зареєстровані поширювачі. Щоб використовувати конкретний поширювач, `otel_propagator_text_map:inject/2` та `otel_propagator_text_map:extract/2` можуть бути використані з першим аргументом, що є назвою модуля поширювача.

## Наступні кроки {#next-steps}

Щоб дізнатися більше про поширення, прочитайте [Специфікацію API поширювачів](/docs/specs/otel/context/api-propagators/).
