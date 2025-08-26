---
title: Getting Started
description: 5分以内にあなたのアプリからテレメトリを取得します！
aliases: [getting_started]
weight: 10
default_lang_commit: 646aedf04033f2d955dbdfb20f5e912c3cc89482
cSpell:ignore: darwin rolldice sinatra struct tracestate truffleruby
---

このページでは、RubyでOpenTelemetryを始める方法を説明します。

コンソールに[トレース][traces]を出力するように、シンプルなアプリケーションを計装する方法を学びましょう。

## 前提条件 {#prerequisites}

以下がローカルにインストールされていることを確認してください。

- CRuby >= `3.1`, JRuby >= `9.3.2.0`, または TruffleRuby >= `22.1`
- [Bundler](https://bundler.io/)

{{% alert  title="Warning" color="warning" %}}
試験中ですが、`jruby` と `truffleruby` のサポートは現時点ではベストエフォートベースです。
{{% /alert %}}

## アプリケーションの例 {#example-application}

以下の例では、基本的な[Rails](https://rubyonrails.org/)
アプリケーションを使用します。
Railsを使用しない場合でも問題ありません。
SinatraやRackなどの他のWebフレームワークでもOpenTelemetry Rubyを使用できます。
サポートされているフレームワークの完全なリストは、[レジストリ](/ecosystem/registry/?component=instrumentation&language=ruby)を参照してください。

より詳細な例については、[examples](/docs/languages/ruby/examples/)を参照してください。

### 依存関係 {#dependencies}

はじめに、Railsをインストールします。

```sh
gem install rails
```

### アプリケーションの作成 {#create-the-application}

`dice-ruby` という名前のAPI専用アプリケーションを作成し、新しく作成された `dice-ruby` フォルダに移動します。

```sh
rails new --api dice-ruby
cd dice-ruby
```

サイコロを振るためのコントローラーを作成します。

```sh
rails generate controller dice
```

このコマンドは、`app/controllers/dice_controller.rb` というファイルを作成します。
任意のエディタでそのファイルを開き、以下のコードに更新します。

```ruby
class DiceController < ApplicationController
  def roll
    render json: rand(1..6).to_s
  end
end
```

次に、`config/routes.rb` ファイルを開き、以下のコードを追加します。

```ruby
Rails.application.routes.draw do
  get 'rolldice', to: 'dice#roll'
end
```

次のコマンドでアプリケーションを起動し、Webブラウザで <http://localhost:8080/rolldice> を開いて動作確認を行います。

```sh
rails server -p 8080
```

すべてが正常に動作していれば、1から6のいずれかの数字が返されるはずです。
これで、アプリケーションを停止し、OpenTelemetryを使用して計装することができます。

### 計装 {#instrumentation}

`opentelemetry-sdk` と `opentelemetry-instrumentation-all` パッケージをインストールします。

```sh
bundle add opentelemetry-sdk opentelemetry-instrumentation-all
```

`opentelemetry-instrumentation-all` を含めると、Rails、Sinatra、いくつかのHTTPライブラリなどの[計装][instrumentations]が提供されます。

Railsアプリケーションでは、OpenTelemetryの初期化は通常Railsのイニシャライザで行います。
他のRubyサービスでは、起動プロセスの可能な限り早い段階で初期化を行います。

次のコードを含む `config/initializers/opentelemetry.rb` という名前のファイルを作成します。

```ruby
# config/initializers/opentelemetry.rb
require 'opentelemetry/sdk'
require 'opentelemetry/instrumentation/all'
OpenTelemetry::SDK.configure do |c|
  c.service_name = 'dice-ruby'
  c.use_all() # すべての計装を有効化します！
end
```

`c.use_all()` を呼び出すことで、`instrumentation/all` パッケージ内のすべての計装が有効化されます。
より高度な設定が必要な場合は、[特定の計装ライブラリの設定][config]を参照してください。

### 計装されたアプリを実行する {#run-the-instrumented-app}

これで、計装されたアプリを実行し、コンソールに出力することができます。

```sh
env OTEL_TRACES_EXPORTER=console rails server -p 8080
```

Webブラウザで <http://localhost:8080/rolldice> を開き、ページを数回リロードしてください。
コンソールに以下のようなスパンが表示されるはずです。

```ruby
#<struct OpenTelemetry::SDK::Trace::SpanData
 name="DiceController#roll",
 kind=:server,
 status=#<OpenTelemetry::Trace::Status:0x000000010587fc48 @code=1, @description="">,
 parent_span_id="\x00\x00\x00\x00\x00\x00\x00\x00",
 total_recorded_attributes=8,
 total_recorded_events=0,
 total_recorded_links=0,
 start_timestamp=1683555544407294000,
 end_timestamp=1683555544464308000,
 attributes=
  {"http.method"=>"GET",
   "http.host"=>"localhost:8080",
   "http.scheme"=>"http",
   "http.target"=>"/rolldice",
   "http.user_agent"=>"curl/7.87.0",
   "code.namespace"=>"DiceController",
   "code.function"=>"roll",
   "http.status_code"=>200},
 links=nil,
 events=nil,
 resource=
  #<OpenTelemetry::SDK::Resources::Resource:0x000000010511d1f8
   @attributes=
    {"service.name"=>"<YOUR_SERVICE_NAME>",
     "process.pid"=>83900,
     "process.command"=>"bin/rails",
     "process.runtime.name"=>"ruby",
     "process.runtime.version"=>"3.2.2",
     "process.runtime.description"=>"ruby 3.2.2 (2023-03-30 revision e51014f9c0) [arm64-darwin22]",
     "telemetry.sdk.name"=>"opentelemetry",
     "telemetry.sdk.language"=>"ruby",
     "telemetry.sdk.version"=>"1.2.0"}>,
 instrumentation_scope=#<struct OpenTelemetry::SDK::InstrumentationScope name="OpenTelemetry::Instrumentation::Rack", version="0.23.0">,
 span_id="\xA7\xF0\x9B#\b[\xE4I",
 trace_id="\xF3\xDC\b8\x91h\xB0\xDF\xDEn*CH\x9Blf",
 trace_flags=#<OpenTelemetry::Trace::TraceFlags:0x00000001057b7b08 @flags=1>,
 tracestate=#<OpenTelemetry::Trace::Tracestate:0x00000001057b67f8 @hash={}>>
```

## 次は何をしますか？ {#what-next}

単一のサービスにトレースを追加することは、すばらしい第一歩です。
OpenTelemetryにはさらにいくつかの機能があり、より深い洞察を得ることができます！

- [エクスポーター][exporters]を使用して、データを任意のバックエンドにエクスポートできます。
- [コンテキスト伝搬][context propagation]は、単一サービスのトレースを`分散トレース`にアップグレードし、OpenTelemetryベンダーがプロセスやネットワークの境界を超えてリクエストを可視化できるようにするための、おそらくOpenTelemetryの最も強力な概念のひとつです。
- [スパンイベント][span events]を使用して、スパンのライフタイム内に"何かが起こった"ことを表す人間が読みやすいメッセージを追加できます。
- [計装][instrumentation]を使用して、ドメイン固有のデータを追加してトレースを強化できます。
- [OpenTelemetryデモ](/docs/demo/)には、Rubyベースの[メールサービス](/docs/demo/services/email/)が含まれています。

[traces]: /docs/concepts/signals/traces/
[instrumentations]: https://github.com/open-telemetry/opentelemetry-ruby-contrib/tree/main/instrumentation
[config]: ../libraries/#configuring-specific-instrumentation-libraries
[exporters]: ../exporters/
[context propagation]: ../instrumentation/#context-propagation
[instrumentation]: ../instrumentation/
[span events]: ../instrumentation/#add-span-events
