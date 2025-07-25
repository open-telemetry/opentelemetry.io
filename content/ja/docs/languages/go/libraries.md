---
title: 計装ライブラリの使用
linkTitle: ライブラリ
aliases:
  - /docs/languages/go/using_instrumentation_libraries
  - /docs/languages/go/automatic_instrumentation
weight: 40
default_lang_commit: adc4264c2926e3d767b6a56affb19fb4ae3f2a22
---

{{% docs/languages/libraries-intro "go" %}}

## 計装ライブラリの使用 {#use-instrumentation-libraries}

ライブラリにOpenTelemetryが最初から付属していない場合は、[計装ライブラリ](/docs/specs/otel/glossary/#instrumentation-library)を使用して、ライブラリまたはフレームワークのテレメトリーデータを生成できます。

たとえば、[`net/http`の計装ライブラリ](https://pkg.go.dev/go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp)は、HTTPリクエストに基づいて[スパン](/docs/concepts/signals/traces/#spans)と[メトリクス](/docs/concepts/signals/metrics/)を自動的に作成します。

## セットアップ {#setup}

各計装ライブラリはパッケージです。一般的に、これは適切なパッケージを`go get`する必要があることを意味します。
たとえば、[Contribリポジトリ](https://github.com/open-telemetry/opentelemetry-go-contrib)で維持されている計装ライブラリを取得するには、以下を実行します。

```sh
go get go.opentelemetry.io/contrib/instrumentation/{import-path}/otel{package-name}
```

次に、ライブラリが有効化するために必要なものに基づいて、コード内で設定します。

[はじめに](../getting-started/)では、`net/http`サーバーの計装を設定する方法を示す例を提供しています。

## 利用可能なパッケージ {#available-packages}

利用可能な計装ライブラリの完全なリストは、[OpenTelemetryレジストリ](/ecosystem/registry/?language=go&component=instrumentation)で見つけることができます。

## 次のステップ {#next-steps}

計装ライブラリは、インバウンドおよびアウトバウンドHTTPリクエストのテレメトリーデータを生成するなどのことができますが、実際のアプリケーションを計装化することはありません。

[カスタムインストルメンテーション](../instrumentation/)をコードに統合して、テレメトリーデータを充実させてください。
これは標準ライブラリのテレメトリーを補完し、実行中のアプリケーションへのより深い洞察を提供できます。
