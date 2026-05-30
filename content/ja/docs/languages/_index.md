---
title: 言語API & SDK
description: OpenTelemetryのコード計装は、多くの一般的なプログラミング言語でサポートされています。
weight: 250
aliases: [/docs/instrumentation]
redirects:
  - { from: 'net/*', to: 'dotnet/:splat' }
default_lang_commit: 68c29178b21e7ace970d27c5817a4edcff3ea9fb
---

OpenTelemetryのコード[計装][instrumentation]は、以下の[ステータスとリリース](#status-and-releases)の表に記載されている言語でサポートされています。
[その他の言語](/docs/languages/other)向けの非公式な実装も利用可能です。
それらは[レジストリ](/ecosystem/registry/)で確認できます。

Go、.NET、PHP、Python、Java、JavaScriptでは、[ゼロコードソリューション](/docs/zero-code)を使用することで、コードを変更せずにアプリケーションに計装を追加できます。

Kubernetesを使用している場合は、[OpenTelemetry Operator for Kubernetes][otel-op]を利用して、[ゼロコードソリューション][zero-code]をアプリケーションに注入できます。

## ステータスとリリース {#status-and-releases}

OpenTelemetryの主要な機能コンポーネントの現在のステータスは以下の通りです。

> [!WARNING]
>
> APIやSDKのステータスに関わらず、使用している計装が[セマンティック規約仕様][semconv]で[試験的][Experimental]とされている[セマンティック規約][semconv-spec]に依存している場合、データフローに**破壊的変更**が生じる可能性があります。
>
> [semconv]: /docs/concepts/semantic-conventions/
> [Experimental]: /docs/specs/otel/document-status/
> [semconv-spec]: /docs/specs/semconv/

{{% telemetry-support-table " " %}}

## APIリファレンス {#api-references}

特定の言語でOpenTelemetryのAPIおよびSDKを実装するSpecial Interest Group(SIG)は、開発者向けにAPIリファレンスも公開しています。
以下のリファレンスが利用できます。

{{% apidocs %}}

> [!NOTE]
>
> 上記のリストは[`/api`](/api)へのエイリアスです。

[zero-code]: /docs/platforms/kubernetes/operator/automatic/
[instrumentation]: /docs/concepts/instrumentation/
[otel-op]: /docs/platforms/kubernetes/operator/
