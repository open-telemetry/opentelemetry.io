---
title: 計装ライブラリの使用
linkTitle: ライブラリ
aliases: [configuring_automatic_instrumentation, automatic]
weight: 30
default_lang_commit: 6a865f53d8e40c17f42772fb8fb100d62a61fb7e
cSpell:ignore: faraday sinatra
---

{{% docs/languages/libraries-intro ruby %}}

## 計装ライブラリの使用 {#use-instrumentation-libraries}

ライブラリにOpenTelemetryが組み込まれていない場合は、[計装ライブラリ](/docs/specs/otel/glossary/#instrumentation-library)を使用して、ライブラリやフレームワークのテレメトリーデータを生成できます。

たとえば、Railsを使用していて、[`opentelemetry-instrumentation-rails`](https://rubygems.org/gems/opentelemetry-instrumentation-rails/)を有効にしている場合、実行中のRailsアプリはコントローラーへの受信リクエストのテレメトリーデータを自動的に生成します。

### すべての計装ライブラリの構成 {#configuring-all-instrumentation-libraries}

OpenTelemetry Rubyは、Rubyベースのすべての計装ライブラリを単一のパッケージにバンドルしたメタパッケージである [`opentelemetry-instrumentation-all`](https://rubygems.org/gems/opentelemetry-instrumentation-all) を提供します。
最小限の労力で、すべてのライブラリのテレメトリーを追加するための便利な方法です。

```sh
gem 'opentelemetry-sdk'
gem 'opentelemetry-exporter-otlp'
gem 'opentelemetry-instrumentation-all'
```

アプリケーションライフサイクルの早いタイミングで構成します。
Railsのイニシャライザーを使用した下記の例を参照してください。

```ruby
# config/initializers/opentelemetry.rb
require 'opentelemetry/sdk'
require 'opentelemetry/exporter/otlp'
require 'opentelemetry/instrumentation/all'
OpenTelemetry::SDK.configure do |c|
  c.service_name = '<YOUR_SERVICE_NAME>'
  c.use_all() # すべての計装を有効化します！
end
```

このコードにより、すべての計装ライブラリがインストールされ、アプリで使用しているライブラリに一致するものが有効になります。

### 特定の計装ライブラリの構成を上書きする {#overriding-configuration-for-specific-instrumentation-libraries}

すべての計装ライブラリを有効化しつつ、特定の計装ライブラリの構成を上書きしたい場合は、構成マップパラメーターを使用して `use_all` を呼び出します。
キーはライブラリを表し、値はその特定の構成パラメーターです。

たとえば、`Redis` 計装を _除く_ すべての計装をアプリにインストールする方法は次のとおりです。

```ruby
require 'opentelemetry/sdk'
require 'opentelemetry/instrumentation/all'

OpenTelemetry::SDK.configure do |c|
  config = {'OpenTelemetry::Instrumentation::Redis' => { enabled: false }}
  c.use_all(config)
end
```

さらに多くの計装を上書きするには、`config` マップに別のエントリを追加します。

#### 環境変数を使用して特定の計装ライブラリの構成を上書きする {#overriding-configuration-for-specific-instrumentation-libraries-with-environment-variables}

環境変数を使用して、特定の計装ライブラリを無効化することもできます。
環境変数によって無効化された計装は、ローカル構成よりも優先されます。
環境変数の命名規則は、ライブラリ名を大文字にして `::` をアンダースコアに置き換え、`OPENTELEMETRY` を `OTEL_LANG` に短縮し、最後に `_ENABLED` を追加したものです。

たとえば、`OpenTelemetry::Instrumentation::Sinatra` の環境変数名は `OTEL_RUBY_INSTRUMENTATION_SINATRA_ENABLED` です。

```bash
export OTEL_RUBY_INSTRUMENTATION_SINATRA_ENABLED=false
```

### 特定の計装ライブラリの構成 {#configuring-specific-instrumentation-libraries}

より選択的に特定の計装ライブラリのみをインストールして使用することもできます。
たとえば、`Sinatra` と `Faraday` のみを使用し、`Faraday` に追加の構成パラメーターを設定する方法は次のとおりです。

はじめに、使用したい特定の計装ライブラリをインストールします。

```sh
gem install opentelemetry-instrumentation-sinatra
gem install opentelemetry-instrumentation-faraday
```

次に、それらを構成します。

```ruby
require 'opentelemetry/sdk'

# デフォルト構成で、互換性のあるすべての計装をインストールします
OpenTelemetry::SDK.configure do |c|
  c.use 'OpenTelemetry::Instrumentation::Sinatra'
  c.use 'OpenTelemetry::Instrumentation::Faraday', { opt: 'value' }
end
```

#### 環境変数を使用して特定の計装ライブラリを構成する {#configuring-specific-instrumentation-libraries-with-environment-variables}

環境変数を使用して、特定の計装ライブラリのオプションを定義することもできます。
例によって、環境変数は計装の名前を大文字にして `::` をアンダースコアに置き換え、`OPENTELEMETRY` を `OTEL_{LANG}` に短縮し、最後に `_CONFIG_OPTS` を追加したものです。

たとえば、`OpenTelemetry::Instrumentation::Faraday` の環境変数名は `OTEL_RUBY_INSTRUMENTATION_FARADAY_CONFIG_OPTS` です。
`peer_service=new_service;span_kind=client` の値は、[前のセクション](#configuring-specific-instrumentation-libraries)でFaradayに設定されたオプションを上書きします。

```bash
export OTEL_RUBY_INSTRUMENTATION_FARADAY_CONFIG_OPTS="peer_service=new_service;span_kind=client"
```

次の表は、オプションのデータ型に応じた許容される値の形式を示しています。

| データ型 | 値                 | 例               |
| -------- | ------------------ | ---------------- |
| Array    | `,` 区切りの文字列 | `option=a,b,c,d` |
| Boolean  | true/false         | `option=true`    |
| Integer  | 文字列             | `option=string`  |
| String   | 文字列             | `option=string`  |
| Enum     | 文字列             | `option=string`  |
| Callable | 許容されない       | N\A              |

### 次のステップ {#next-steps}

計装ライブラリは、Rubyアプリに関する多くの有用なテレメトリーデータを生成する最も簡単な方法です。
しかし、アプリケーションロジック特有のデータは生成しません。
そのためには、[計装コード](../instrumentation)を使用して、計装ライブラリからの計装を強化する必要があります。
