---
title: HTTP 計装の設定
linkTitle: HTTP
weight: 110
default_lang_commit: 6fa8e87cacb431b31061635fcddb55990e80538a
---

## HTTP リクエストヘッダーとレスポンスヘッダーのキャプチャ {#capturing-http-request-and-response-headers}

[セマンティック規約](/docs/specs/semconv/http/http-spans/)に従って、事前に定義した HTTP ヘッダーをスパン属性としてキャプチャするようにエージェントを設定できます。
キャプチャする HTTP ヘッダーを定義するには、以下のプロパティを使用してください。

{{% config_option name="otel.instrumentation.http.client.capture-request-headers" %}}
HTTP ヘッダー名のカンマ区切りリスト。
HTTP クライアントの計装は、設定されたすべてのヘッダー名について HTTP リクエストヘッダーの値をキャプチャします。
{{% /config_option %}}

{{% config_option name="otel.instrumentation.http.client.capture-response-headers" %}}
HTTP ヘッダー名のカンマ区切りリスト。
HTTP クライアントの計装は、設定されたすべてのヘッダー名について HTTP レスポンスヘッダーの値をキャプチャします。
{{% /config_option %}}

{{% config_option name="otel.instrumentation.http.server.capture-request-headers" %}}
HTTP ヘッダー名のカンマ区切りリスト。
HTTP サーバーの計装は、設定されたすべてのヘッダー名について HTTP リクエストヘッダーの値をキャプチャします。
{{% /config_option %}}

{{% config_option name="otel.instrumentation.http.server.capture-response-headers" %}}
HTTP ヘッダー名のカンマ区切りリスト。
HTTP サーバーの計装は、設定されたすべてのヘッダー名について HTTP レスポンスヘッダーの値をキャプチャします。
{{% /config_option %}}

これらの設定オプションは、すべての HTTP クライアントおよびサーバーの計装でサポートされています。

> **Note**: テーブルに記載されているプロパティ名や環境変数名はまだ実験的なものであり、変更される可能性があります。

## サーブレットリクエストパラメーターのキャプチャ {#capturing-servlet-request-parameters}

Servlet API で処理されるリクエストについて、事前に定義した HTTP リクエストパラメーターをスパン属性としてキャプチャするようにエージェントを設定できます。
キャプチャするサーブレットリクエストパラメーターを定義するには、以下のプロパティを使用してください。

{{% config_option name="otel.instrumentation.servlet.experimental.capture-request-parameters" %}}
リクエストパラメーター名のカンマ区切りリスト。
{{% /config_option %}}

> **Note**: テーブルに記載されているプロパティ名や環境変数名はまだ実験的なものであり、変更される可能性があります。

## 既知の HTTP メソッドの設定 {#configuring-known-http-methods}

代替の HTTP リクエストメソッドのセットを認識するように計装を設定します。
その他のすべてのメソッドは `_OTHER` として扱われます。

{{% config_option
name="otel.instrumentation.http.known-methods"
default="CONNECT,DELETE,GET,HEAD,OPTIONS,PATCH,POST,PUT,TRACE"
%}} 既知の HTTP メソッドのカンマ区切りリスト。
{{% /config_option %}}

## 実験的な HTTP テレメトリーの有効化 {#enabling-experimental-http-telemetry}

追加の実験的な HTTP テレメトリーデータをキャプチャするようにエージェントを設定できます。

{{% config_option
name="otel.instrumentation.http.client.emit-experimental-telemetry"
default=false
%}} 実験的な HTTP クライアントテレメトリーを有効にします。
{{% /config_option %}}

{{% config_option name="otel.instrumentation.http.server.emit-experimental-telemetry"
default=false
%}}
実験的な HTTP サーバーテレメトリーを有効にします。
{{% /config_option %}}

クライアントおよびサーバーのスパンには、以下の属性が追加されます。

- `http.request.body.size` と `http.response.body.size`: それぞれリクエストボディとレスポンスボディのサイズ。

クライアントメトリクスには、以下のメトリクスが作成されます。

- [http.client.request.body.size](/docs/specs/semconv/http/http-metrics/#metric-httpclientrequestbodysize)
- [http.client.response.body.size](/docs/specs/semconv/http/http-metrics/#metric-httpclientresponsebodysize)

サーバーメトリクスには、以下のメトリクスが作成されます。

- [http.server.active_requests](/docs/specs/semconv/http/http-metrics/#metric-httpserveractive_requests)
- [http.server.request.body.size](/docs/specs/semconv/http/http-metrics/#metric-httpserverrequestbodysize)
- [http.server.response.body.size](/docs/specs/semconv/http/http-metrics/#metric-httpserverresponsebodysize)
