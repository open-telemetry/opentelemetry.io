---
title: 計装ライブラリの使用
linkTitle: ライブラリ
weight: 40
description: アプリが依存するライブラリを計装する方法
default_lang_commit: 147b494062edd35ab8900709a9f78e7fd086c3d3
---

{{% docs/languages/libraries-intro rust %}}

## 計装ライブラリの使用 {#use-instrumentation-libraries}

各計装ライブラリは [crate](https://crates.io/) です。

たとえば、[Actix Web 用の計装ライブラリ](https://crates.io/crates/opentelemetry-instrumentation-actix-web)は、受信した HTTP リクエストに基づいて[スパン](/docs/concepts/signals/traces/#spans)と[メトリクス](/docs/concepts/signals/metrics/)を自動的に作成します。

利用可能な計装ライブラリのリストは、[レジストリ](/ecosystem/registry/?language=rust&component=instrumentation)を参照してください。
