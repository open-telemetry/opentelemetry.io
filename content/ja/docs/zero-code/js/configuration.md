---
title: ゼロコード計装の構成
linkTitle: 構成
description: Node.jsのゼロコード計装を構成する方法を学びます
aliases:
  - /docs/languages/js/automatic/configuration
  - /docs/languages/js/automatic/module-config
weight: 10
default_lang_commit: 115933c1b9c643c8b6cf0d413a32061cd3a1b65f
cSpell:ignore: serviceinstance
---

このモジュールは、[環境変数](/docs/specs/otel/configuration/sdk-environment-variables/)を設定することで高度に構成できます。
リソース検出器、エクスポーター、トレースコンテキストの伝搬ヘッダーなど、ゼロコード計装の動作の多くの側面をニーズに合わせて構成できます。

## SDKとエクスポーターの構成 {#sdk-and-exporter-configuration}

[SDKとエクスポーターの構成](/docs/languages/sdk-configuration/)は、環境変数を使用して設定できます。

## SDKリソース検出器の構成 {#sdk-resource-detector-configuration}

デフォルトでは、モジュールはすべてのSDKリソース検出器を有効にします。
`OTEL_NODE_RESOURCE_DETECTORS` 環境変数を使用して、特定の検出器のみを有効化または無効化できます。

- `env`
- `host`
- `os`
- `process`
- `serviceinstance`
- `container`
- `alibaba`
- `aws`
- `azure`
- `gcp`
- `all` - すべてのリソース検出器を有効化
- `none` - すべてのリソース検出器を無効化

たとえば、`env` と `host` 検出器のみを有効にするには、次のように設定します。

```shell
OTEL_NODE_RESOURCE_DETECTORS=env,host
```

## 計装ライブラリの除外 {#excluding-instrumentation-libraries}

デフォルトでは、[サポートされた計装ライブラリ](https://github.com/open-telemetry/opentelemetry-js-contrib/blob/main/packages/auto-instrumentations-node/README.md#supported-instrumentations)が有効化されていますが、環境変数を使用して特定の計装のみを有効化または無効化できます。

### 特定の計装を有効化 {#enable-specific-instrumentations}

環境変数 `OTEL_NODE_ENABLED_INSTRUMENTATIONS` を使用して、`@opentelemetry/instrumentation-` 接頭辞なしの計装ライブラリ名のカンマ区切りのリストを提供することで、特定の計装のみを有効化します。

たとえば、
[@opentelemetry/instrumentation-http](https://github.com/open-telemetry/opentelemetry-js/tree/main/experimental/packages/opentelemetry-instrumentation-http)
および
[@opentelemetry/instrumentation-express](https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/packages/instrumentation-express)
の計装のみを有効化します。

```shell
OTEL_NODE_ENABLED_INSTRUMENTATIONS="http,express"
```

### 特定の計装を無効化 {#disable-specific-instrumentations}

環境変数 `OTEL_NODE_DISABLED_INSTRUMENTATIONS` を使用して、完全に有効化されたリストを保持し、`@opentelemetry/instrumentation-` 接頭辞なしの計装ライブラリ名のカンマ区切りのリストを提供することで、特定の計装のみを無効化します。

たとえば、
[@opentelemetry/instrumentation-fs](https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/packages/instrumentation-fs)
および
[@opentelemetry/instrumentation-grpc](https://github.com/open-telemetry/opentelemetry-js/tree/main/experimental/packages/opentelemetry-instrumentation-grpc)
の計装のみを無効化します。

```shell
OTEL_NODE_DISABLED_INSTRUMENTATIONS="fs,grpc"
```

{{% alert title="Note" %}}

両方の環境変数が設定されている場合、最初に `OTEL_NODE_ENABLED_INSTRUMENTATIONS` が適用され、次に `OTEL_NODE_DISABLED_INSTRUMENTATIONS` がそのリストに適用されます。
したがって、両方のリストに同じ計装が含まれている場合、その計装は無効化されます。

{{% /alert %}}
