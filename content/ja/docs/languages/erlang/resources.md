---
title: リソース
weight: 70
# For the writing of behaviour, see
# https://www.erlang.org/doc/reference_manual/modules.html#behaviour-module-attribute
default_lang_commit: 5c22cf6079a4d8b0c01abe4244565b0f193cf9cc
cSpell:ignore: behaviour
---

<!-- markdownlint-disable no-duplicate-heading -->

{{% docs/languages/resources-intro "OTP リリース" %}}

## リソース検出器の使用 {#using-resource-detectors}

リソース検出器はさまざまなソースからリソース属性を取得します。
デフォルトの検出器は、OS 環境変数 `OTEL_RESOURCE_ATTRIBUTES` と `opentelemetry` OTP アプリケーション環境変数 `resource` を使用します。

使用する検出器はモジュール名のリストであり、アプリケーション設定で構成できます。

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

または、環境変数 `OTEL_RESOURCE_DETECTORS` を使用します。

```sh
OTEL_RESOURCE_DETECTORS=otel_resource_env_var,otel_resource_app_env
```

すべてのリソース検出器はタイムアウト（ミリ秒単位）で保護されており、タイムアウト後は空の値を返します。
これにより、リソース検出器がネットワークアクセスのような処理を行う際に、プログラム全体が無期限にハングする可能性を防ぎます。
デフォルトは5000ミリ秒で、環境変数 `OTEL_RESOURCE_DETECTOR_TIMEOUT` またはアプリケーション変数 `otel_resource_detector_timeout` で設定できます。

## OS および OTP アプリケーション環境変数によるリソースの追加 {#adding-resources-with-os-and-otp-application-environment-variables}

2つのデフォルトリソース検出器が有効な状態で、OS 環境変数 `OTEL_RESOURCE_ATTRIBUTES` を使ってリソース属性を設定できます。

```sh
OTEL_RESOURCE_ATTRIBUTES="deployment.environment=development"
```

または、`sys.config` や `runtime.exs` の `opentelemetry` アプリケーション設定にある `resource` OTP アプリケーション環境変数を使用します。

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

`resource` OTP アプリケーション環境変数内のリソース属性はフラット化され、`.` で結合されます。
そのため、`#{deployment => #{environment => <<"development">> }` は `#{'deployment.environment' => <<"development">>}` と同じです。

## カスタムリソース検出器 {#custom-resource-detectors}

カスタムリソース検出器は、[`otel_resource_detector` ビヘイビア](https://hexdocs.pm/opentelemetry/1.3.0/otel_resource_detector.html#callbacks)を実装することで作成できます。
このビヘイビアには、[`otel_resource`](https://hexdocs.pm/opentelemetry/1.3.0/otel_resource.html) を返す単一のコールバック `get_resource/1` が含まれています。

新しいリソース属性を追加する際に該当する場合は、`resource` に対して定義されている[セマンティック規約](/docs/specs/semconv/resource/)に従うべきであることに注意してください。
