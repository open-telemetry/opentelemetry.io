---
title: 言語API & SDK
description: OpenTelemetryのコード計装は、多くの一般的なプログラミング言語でサポートされています。
weight: 250
aliases: [/docs/instrumentation]
default_lang_commit: d0a90db560d4f15934bdb43d994eabcfd91c515a
redirects:
  - { from: 'net/*', to: 'dotnet/:splat' }
---

OpenTelemetryのコード[計装][instrumentation]は、以下の[ステータスとリリース](#status-and-releases)の表に記載されている言語でサポートされています。
[その他の言語](/docs/languages/other)向けの非公式な実装も利用可能です。
それらは[レジストリ](/ecosystem/registry/)で確認できます。

Go、.NET、PHP、Python、Java、JavaScriptでは、[ゼロコードソリューション](/docs/zero-code)を使用することで、コードを変更せずにアプリケーションに計装を追加できます。

Kubernetesを使用している場合は、[OpenTelemetry Operator for Kubernetes][otel-op]を利用して、[ゼロコードソリューション][zero-code]をアプリケーションに注入できます。

## ステータスとリリース {#status-and-releases}

OpenTelemetryの主要な機能コンポーネントの現在のステータスは以下の通りです。

{{% alert title="重要" color="warning" %}}

APIやSDKのステータスに関わらず、使用している計装が[セマンティック規約仕様][semantic conventions]で[試験的][Experimental]とされている[セマンティック規約][semantic conventions specification]に依存している場合、データフローに**破壊的変更**が生じる可能性があります。

[semantic conventions]: /docs/concepts/semantic-conventions/
[Experimental]: /docs/specs/otel/document-status/
[semantic conventions specification]: /docs/specs/semconv/

{{% /alert %}}

{{% telemetry-support-table " " %}}

## APIリファレンス {#api-references}

特定の言語でOpenTelemetryのAPIおよびSDKを実装するSpecial Interest Group(SIG)は、開発者向けにAPIリファレンスも公開しています。
以下のリファレンスが利用できます。

{{% apidocs %}}

{{% alert title="Note" %}}

上記のリストは[`/api`](/api)へのエイリアスです。

{{% /alert %}}

[zero-code]: /docs/platforms/kubernetes/operator/automatic/
[instrumentation]: /docs/concepts/instrumentation/
[otel-op]: /docs/platforms/kubernetes/operator/
