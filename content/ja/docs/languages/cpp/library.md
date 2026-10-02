---
title: 計装ライブラリを使用する
linkTitle: ライブラリ
weight: 40
default_lang_commit: 0a410d00f789607f64e6e71b785b9c027305117b
---

{{% docs/languages/libraries-intro cpp %}}

## 計装ライブラリを使用する {#using-instrumentation-libraries}

アプリを開発する際、作業を加速するためにサードパーティのライブラリやフレームワークを使用することがあるでしょう。
OpenTelemetry を使用してアプリを計装する場合、使用するサードパーティのライブラリやフレームワークにトレース、ログ、メトリクスを手動で追加するために追加の時間を費やすことを避けたいかもしれません。

多くのライブラリやフレームワークはすでに OpenTelemetry をサポートしているか、OpenTelemetry の[計装](/docs/concepts/instrumentation/libraries/)を介してサポートされているため、オブザーバビリティバックエンドにエクスポートできるテレメトリーを生成できます。

サードパーティのライブラリやフレームワークを使用するアプリやサービスを計装する場合は、以下の手順に従って、ネイティブに計装されたライブラリと依存関係の計装ライブラリの使用方法を学んでください。

## ネイティブに計装されたライブラリを使用する {#use-natively-instrumented-libraries-1}

デフォルトで OpenTelemetry サポートが付属しているライブラリの場合、アプリに OpenTelemetry SDK を追加して設定することで、そのライブラリから発行されるトレース、メトリクス、ログを取得できます。

ライブラリによっては、計装のために追加の設定が必要な場合があります。
詳細はそのライブラリのドキュメントをご覧ください。

ライブラリに OpenTelemetry サポートが含まれていない場合は、[計装ライブラリ](/docs/specs/otel/glossary/#instrumentation-library)を使用して、ライブラリやフレームワークのテレメトリーデータを生成できます。

## セットアップ {#setup}

計装ライブラリのセットアップについては、[otel-cpp-contrib](https://github.com/open-telemetry/opentelemetry-cpp-contrib/tree/main/instrumentation) をご覧ください。

## 利用可能なパッケージ {#available-packages}

利用可能な計装ライブラリの完全なリストは、[OpenTelemetry レジストリ](/ecosystem/registry/?language=cpp&component=instrumentation)で確認できます。

## 次のステップ {#next-steps}

計装ライブラリをセットアップした後、カスタムテレメトリーデータを収集するために[追加の計装](/docs/languages/cpp/instrumentation/)を追加することをお勧めします。

また、[テレメトリーデータをエクスポート](/docs/languages/cpp/exporters/)して1つ以上のテレメトリーバックエンドに送信するために、適切なエクスポーターを設定することもできます。
