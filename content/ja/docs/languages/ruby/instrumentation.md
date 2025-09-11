---
title: 計装
aliases:
  - manual_instrumentation
  - manual
  - /docs/languages/ruby/events
  - /docs/languages/ruby/context-propagation
weight: 20
description: OpenTelemetry Ruby計装
default_lang_commit: c651bbf2a61f1ea643ae1d2ae89d496c58dbb56d
cSpell:ignore: SIGHUP
---

{{% include instrumentation-intro.md %}}

## セットアップ {#setup}

はじめに、SDKパッケージがインストールされていることを確認してください。

```sh
gem install opentelemetry-sdk
```

次に、プログラムの初期化時に実行される、設定コードを記述します。
サービス名を設定して、`service.name` が設定されていることを確認してください。

## トレース {#traces}

### トレーサーの取得 {#acquiring-a-tracer}

[トレース](/docs/concepts/signals/traces)を開始するには、[`トレーサープロバイダー`](/docs/concepts/signals/traces#tracer-provider)から取得する、初期化された[`トレーサー`](/docs/concepts/signals/traces#tracer)が必要です。

最も簡単で一般的な方法は、グローバルに登録されたトレーサープロバイダーを使用することです。
Railsアプリなどで[`計装ライブラリ`](/docs/languages/ruby/libraries)を使用している場合、トレーサープロバイダーは自動的に登録されます。

```ruby
# Railsアプリの場合、このコードはconfig/initializers/opentelemetry.rbにあります。
require "opentelemetry/sdk"

OpenTelemetry::SDK.configure do |c|
  c.service_name = '<YOUR_SERVICE_NAME>'
end

# `トレーサー`は、コード全体で使用できるようになっています。
MyAppTracer = OpenTelemetry.tracer_provider.tracer('<YOUR_TRACER_NAME>')
```

`トレーサー`を取得することで、コードを手動でトレースできます。

### 現在のスパンを取得 {#get-current-span}

プログラム内のどこかで現在の[スパン](/docs/concepts/signals/traces#spans)に情報を追加することは、ごく一般的です。
そのためには、現在のスパンを取得して、それに[属性](/docs/concepts/signals/traces#attributes)を追加することができます。

```ruby
require "opentelemetry/sdk"

def track_extended_warranty(extended_warranty)
  # 現在のスパンを取得する
  current_span = OpenTelemetry::Trace.current_span

  # さらに、現在のスパンに有用な情報を追加します！
  current_span.add_attributes({
    "com.extended_warranty.id" => extended_warranty.id,
    "com.extended_warranty.timestamp" => extended_warranty.timestamp
  })
end
```

### 新しいスパンの作成 {#creating-new-spans}

[スパン](/docs/concepts/signals/traces#spans)を作成するには、[`構成済みのトレーサー`](/docs/concepts/signals/traces#tracer)が必要です。

通常、新しいスパンを作成するときは、そのスパンをアクティブもしくは現在のスパンにしたいと思うでしょう。
それには、`in_span`を使用します。

```ruby
require "opentelemetry/sdk"

def do_work
  MyAppTracer.in_span("do_work") do |span|
    # `do_work`スパンが追跡する何らかの処理を実行
  end
end
```

### ネストされたスパンの作成 {#creating-nested-spans}

別の操作の一部として追跡したい個別のサブ操作がある場合、関係を表すためにネストされた[スパン](/docs/concepts/signals/traces#spans)を作成できます。

```ruby
require "opentelemetry/sdk"

def parent_work
  MyAppTracer.in_span("parent") do |span|
    # `parent`スパンが追跡する何らかの処理を実行！

    child_work

    # 何らかの後続処理
  end
end

def child_work
  MyAppTracer.in_span("child") do |span|
    # `child`スパンが追跡する何らかの処理を実行！
  end
end
```

前述の例では、`parent` と `child` という名前の2つのスパンが作成され、`child` は `parent` の下にネストされています。
トレース可視化ツールでこれらのスパンを表示すると、`child` は `parent` の下にネストされていることがわかります。

### スパンへの属性の追加 {#add-attributes-to-a-span}

[属性](/docs/concepts/signals/traces#attributes)によって、[スパン](/docs/concepts/signals/traces#spans)にキー/値のペアを追加し、追跡している現在の操作に関するより多くの情報を保持することができます。

スパンに単一の属性を追加するには、`set_attribute`を使用できます。

```ruby
require "opentelemetry/sdk"

current_span = OpenTelemetry::Trace.current_span

current_span.set_attribute("animals", ["elephant", "tiger"])
```

属性のマップを追加するには、`add_attributes`を使用できます。

```ruby
require "opentelemetry/sdk"

current_span = OpenTelemetry::Trace.current_span

current_span.add_attributes({
  "my.cool.attribute" => "a value",
  "my.first.name" => "Oscar"
})
```

スパンの[作成時](#creating-new-spans)に属性を追加することもできます。

```ruby
require "opentelemetry/sdk"

MyAppTracer.in_span('foo', attributes: { "hello" => "world", "some.number" => 1024 }) do |span|
  # スパンを使用した何らかの処理を実行
end
```

> &#9888; スパンは、変更されるときにロックを必要とするスレッドセーフなデータ構造です。
> したがって、`set_attribute` を複数回呼び出すことは避け、代わりにスパンの作成中または既存のスパンの `add_attributes` を使用して、ハッシュで属性を一括で割り当てることが望ましいです。
>
> &#9888; サンプリングの決定は、スパンの作成時に行われます。
> サンプラーがスパンをサンプリングするか決定する際にスパン属性を考慮する場合は、スパン作成の一部としてそれらの属性を渡す _必要があります_ 。
> スパン作成後に追加された属性は、サンプリングの決定がすでに行われているため、サンプラーには表示されません。

### セマンティック属性の追加 {#add-semantic-attributes}

[セマンティック属性][semconv-spec]は、一般的な種類のデータに対するよく知られた命名規則に基づいた、事前定義された[属性](/docs/concepts/signals/traces#attributes)です。
セマンティック属性を使用することで、システム全体でこの種の情報を正規化できます。

Rubyでセマンティック属性を使用するには、適切なgemを追加します。

```sh
gem install opentelemetry-semantic_conventions
```

次に、コードで使用できます。

```ruby
require 'opentelemetry/sdk'
require 'opentelemetry/semantic_conventions'

current_span = OpenTelemetry::Trace.current_span

current_span.add_attributes({
  OpenTelemetry::SemanticConventions::Trace::HTTP_METHOD => "GET",
  OpenTelemetry::SemanticConventions::Trace::HTTP_URL => "https://opentelemetry.io/",
})
```

### スパンイベントの追加 {#add-span-events}

[スパンイベント](/docs/concepts/signals/traces#span-events)は、スパンのライフタイム中に"何かが起こった"ことを表す、人間が読める形式のメッセージです。
たとえば、ミューテックスで保護されているリソースへの排他的アクセスを必要とする関数を考えてみましょう。
イベントは2つのポイントで作成できます。
ひとつはリソースへのアクセスを試行するとき、もうひとつはミューテックスを取得するときです。

```ruby
require "opentelemetry/sdk"

span = OpenTelemetry::Trace.current_span

span.add_event("Acquiring lock")
if mutex.try_lock
  span.add_event("Got lock, doing work...")
  # 何らかのコード
  span.add_event("Releasing lock")
else
  span.add_event("Lock already in use")
end
```

イベントの便利な特徴は、タイムスタンプがスパンの開始からのオフセットとして表示されるため、イベント間の経過時間を簡単に確認できることです。

イベントは、例のように独自の属性を持つこともできます。

```ruby
require "opentelemetry/sdk"

span.add_event("Cancelled wait due to external signal", attributes: {
  "pid" => 4328,
  "signal" => "SIGHUP"
})
```

### スパンリンクの追加 {#add-span-links}

[スパン](/docs/concepts/signals/traces#spans)は、他のスパンと因果関係を持つ0個以上の[スパンリンク](/docs/concepts/signals/traces#span-links)を作成できます。
リンクを作成するには、[スパンコンテキスト](/docs/concepts/signals/traces#span-context)が必要です。

```ruby
require "opentelemetry/sdk"

span_to_link_from = OpenTelemetry::Trace.current_span

link = OpenTelemetry::Trace::Link.new(span_to_link_from.context)

MyAppTracer.in_span("new-span", links: [link])
  # `new_span` が追跡する何らかの処理を実行

  # `new_span` リンクは、リンク元のスパンと偶然関連付けられていますが、必ずしも子スパンではありません。
end
```

スパンリンクは、サブタスクが非同期的に呼び出す長期間実行されるタスクなど、何らかのかたちで関連するさまざまなトレースをリンクするためによく使用されます。

リンクは、追加の属性を持つこともできます。

```ruby
link = OpenTelemetry::Trace::Link.new(span_to_link_from.context, attributes: { "some.attribute" => 12 })
```

### スパンステータスを設定する {#set-span-status}

{{% include "span-status-preamble.md" %}}

```ruby
require "opentelemetry/sdk"

current_span = OpenTelemetry::Trace.current_span

begin
  1/0 # 明らかに失敗する何らかの処理
rescue
  current_span.status = OpenTelemetry::Trace::Status.error("error message here!")
end
```

### スパン内での例外の記録 {#record-exceptions-in-spans}

例外が発生したときに記録することは、良いアイデアです。
[スパンステータス](#set-span-status)の設定と組み合わせて行うことをお勧めします。

```ruby
require "opentelemetry/sdk"

current_span = OpenTelemetry::Trace.current_span

begin
  1/0 # 明らかに失敗する何らかの処理
rescue Exception => e
  current_span.status = OpenTelemetry::Trace::Status.error("error message here!")
  current_span.record_exception(e)
end
```

例外を記録すると、現在のスパンに[スパンイベント](/docs/concepts/signals/traces#span-events)が作成され、スタックトレースがスパンイベントの属性として追加されます。

例外は、追加の属性とともに記録することもできます。

```ruby
current_span.record_exception(ex, attributes: { "some.attribute" => 12 })
```

### コンテキストの伝搬 {#context-propagation}

> 分散トレーシングは、アプリケーションを構成するサービスによって処理される単一の（トレースと呼ばれる）リクエストの進行状況を追跡します。
> 分散トレースは、プロセス、ネットワーク、セキュリティの境界を横断します。[用語集][glossary]

これには _コンテキスト伝搬_ 、つまりトレースの識別子がリモートプロセスに送信されるメカニズムが必要です。

> &#8505; OpenTelemetry Ruby SDKは、サービスが自動計装ライブラリを使用している限り、コンテキストの伝搬を処理します。
> 詳細については[README][auto-instrumentation]を参照してください。

トレースコンテキストをネットワーク越しに伝搬するためには、OpenTelemetry SDKにプロパゲーターを登録する必要があります。
W3 TraceContextおよびBaggageプロパゲーターはデフォルトで構成されています。
運用者は、環境変数 `OTEL_PROPAGATORS` にカンマ区切りの[プロパゲーター][propagators]のリストを設定することで、この値を上書きできます。
たとえば、B3伝搬を追加するには、`OTEL_PROPAGATORS` にサポートしたい伝搬フォーマットの完全なリストを設定します。

```sh
export OTEL_PROPAGATORS=tracecontext,baggage,b3
```

`tracecontext` と `baggage` 以外のプロパゲーターは、例のように、Gemfileにgem依存関係として追加する必要があります。

```ruby
gem 'opentelemetry-propagator-b3'
```

## メトリクス {#metrics}

メトリクスAPIとSDKは現在開発中です。

## ログ {#logs}

ログAPIとSDKは現在開発中です。

## 次のステップ {#next-steps}

1つ以上のテレメトリーバックエンドに[テレメトリーデータをエクスポートする](/docs/languages/ruby/exporters)ために、適切なエクスポーターを設定することも必要です。

[glossary]: /docs/concepts/glossary/
[propagators]: https://github.com/open-telemetry/opentelemetry-ruby/tree/main/propagator
[auto-instrumentation]: https://github.com/open-telemetry/opentelemetry-ruby-contrib/tree/main/instrumentation
[semconv-spec]: /docs/specs/semconv/general/trace/
