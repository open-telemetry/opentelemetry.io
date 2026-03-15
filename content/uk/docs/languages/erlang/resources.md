---
title: Ресурси
weight: 70
# For the writing of behaviour, see
# https://www.erlang.org/doc/reference_manual/modules.html#behaviour-module-attribute
default_lang_commit: 5489ba34bff91356aa2c501cd55f07eeb30cc355
cSpell:ignore: behaviour
---

<!-- markdownlint-disable no-duplicate-heading -->

{{% docs/languages/resources-intro "OTP Release" %}}

## Використання детекторів ресурсів {#using-resource-detectors}

Детектори ресурсів отримують атрибути ресурсів з різних джерел. Стандартно детектори використовують змінну середовища ОС `OTEL_RESOURCE_ATTRIBUTES` та змінну середовища застосунку OTP `resource`.

Детектори, які використовуються, це список імен модулів і можуть бути налаштовані в
конфігурації застосунку:

{{< tabpane text=true >}} {{% tab Erlang %}}

```erlang
%% sys.config
{opentelemetry, {resource_detectors, [otel_resource_env_var, otel_resource_app_env]}}
```

{{% /tab %}} {{% tab Elixir %}}

```elixir
## runtime.exs
config :opentelemetry, resource_detectors: [:otel_resource_env_var, :otel_resource_app_env]
```

{{% /tab %}} {{< /tabpane >}}

Або через змінну середовища `OTEL_RESOURCE_DETECTORS`:

```sh
OTEL_RESOURCE_DETECTORS=otel_resource_env_var,otel_resource_app_env
```

Усі детектори ресурсів захищені тайм-аутом, у мілісекундах, після якого вони повертають порожнє значення. Це дозволяє детекторам ресурсів робити такі речі, як доступ до мережі, без потенційного зависання всієї програми. Типово це 5000 мілісекунд і може бути встановлено за допомогою змінної середовища `OTEL_RESOURCE_DETECTOR_TIMEOUT` або змінної застосунку `otel_resource_detector_timeout`.

## Додавання ресурсів за допомогою змінних середовища ОС та застосунку OTP {#adding-resources-with-os-and-otp-environment-variables}

З двома увімкненими стандартними детекторами ресурсів ви можете встановити атрибути ресурсів за допомогою змінної середовища ОС `OTEL_RESOURCE_ATTRIBUTES`:

```sh
OTEL_RESOURCE_ATTRIBUTES="deployment.environment=development"
```

Альтернативно, використовуйте змінну середовища `resource` застосунку OTP у конфігурації застосунку `opentelemetry` у `sys.config` або `runtime.exs`:

{{< tabpane text=true >}} {{% tab Erlang %}}

```erlang
%% sys.config
{opentelemetry, {resource, #{deployment => #{environment => <<"development">>}}}}
```

{{% /tab %}} {{% tab Elixir %}}

```elixir
## runtime.exs
config :opentelemetry, resource: %{deployment: %{environment: "development" }}
```

{{% /tab %}} {{< /tabpane >}}

Атрибути ресурсів у змінній середовища `resource` застосунку OTP розгортаються та обʼєднуються з `.` таким чином, що `#{deployment => #{environment => <<"development">> }` є тим самим, що і `#{'deployment.environment' => <<"development">>}`.

## Користувацькі детектори ресурсів {#custom-resource-detectors}

Користувацькі детектори ресурсів можуть бути створені шляхом реалізації [поведінки `otel_resource_detector`](https://hexdocs.pm/opentelemetry/1.3.0/otel_resource_detector.html#callbacks), яка містить єдиний зворотний виклик `get_resource/1`, що повертає [`otel_resource`](https://hexdocs.pm/opentelemetry/1.3.0/otel_resource.html).

Зверніть увагу, що існують [семантичні домовленості](/docs/specs/semconv/resource/), визначені для `resource`, яких слід дотримуватися, якщо вони застосовуються при додаванні нових атрибутів ресурсів.
