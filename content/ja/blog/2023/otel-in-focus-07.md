---
title: OpenTelemetry in Focus、2023年7月
linkTitle: OTel in Focus 2023/07
date: 2023-08-03
author: '[Austin Parker](https://github.com/austinlparker)'
default_lang_commit: ca99c1f23ef7e02acee3389ee766af6dbedb8e64
cSpell:ignore: exceptionsconnector opensearchexporter
---

**OpenTelemetry in Focus** の2023年7月号へようこそ！
皆さんが素晴らしい夏を過ごしていることを願っています（南半球にいる方は、素晴らしい冬を！）。
先月のアップデートとリリースについてお伝えします。

ここで取り上げてほしい内容があるメンテナーの方は、[Austin Parker にメール](mailto:austin+otel@ap2.io)、または [CNCF Slack #otel-comms](https://cloud-native.slack.com/archives/C02UN96HZH6) チャンネルでご連絡ください。

## リリースと更新 {#releases-and-updates}

主要なリポジトリの最新アップデートをお届けします。

<!-- markdownlint-disable heading-increment -->

##### [仕様](/docs/specs/otel/) {#specification}

[バージョン1.23](https://github.com/open-telemetry/opentelemetry-specification/releases/tag/v1.23.0) には大きな変更は含まれていませんが、`TracerProvider` と `MeterProvider` の設定にいくつかの改善が加えられています。

##### [セマンティック規約](/docs/specs/semconv/) {#semantic-conventions}

[バージョン1.21](https://github.com/open-telemetry/semantic-conventions/releases/tag/v1.21.0) は、仕様から分離された初のスタンドアロンリリースです。
このリリースは大規模なもので、`messaging`、`http`、`net` 名前空間にいくつかの注目すべき**破壊的変更**が含まれています。
詳細についてはリリースノートをご確認ください。

##### [コレクター](/docs/collector/) {#collector}

[バージョン0.82.0](https://github.com/open-telemetry/opentelemetry-collector/releases/tag/v0.82.0) が 0.81 と合わせてリリースされました。

0.82 の主な追加機能は、コレクターのテレメトリーを OTLP 経由でエクスポートできるようになったことです。
これは実験的な機能であることにご注意ください。
0.81 では、コネクターが実験的ではなくなったため、コネクターのフィーチャーゲートが削除されました。
両方のリリースには、さまざまな機能強化とバグ修正も含まれています。
詳細についてはリリースノートをご確認ください。

[collector-contrib](https://github.com/open-telemetry/opentelemetry-collector-contrib/releases/tag/v0.82.0) にも多くのアップデート、機能強化、バグ修正が含まれています。
特に、多くのレシーバーが設定に不透明な文字列を使用するようになりました。
これにより、コレクターの設定に変更が必要になる場合があります。
`exceptionsconnector` や `opensearchexporter` などの新しいコネクターやエクスポーターも追加されています。

##### [Java](/docs/languages/java/) {#java}

[バージョン1.28](https://github.com/open-telemetry/opentelemetry-java/releases/tag/v1.28.0) には、さまざまなアップデートとバグ修正が含まれています。

[Java Instrumentation](https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/tag/v1.28.0) もリリースされ、セマンティック規約のアップデートに伴ういくつかの必須マイグレーションが含まれています。

#### [Python](/docs/languages/python/) {#python}

[バージョン1.19](https://github.com/open-telemetry/opentelemetry-python/releases/tag/v1.19.0) には、OTLP とログサポートのアップデートが含まれています。

#### [JavaScript](/docs/languages/js/) {#javascript}

[バージョン1.15.1](https://github.com/open-telemetry/opentelemetry-js/releases/tag/v1.15.1) には、ヒストグラムと指数ヒストグラムに関するメトリクスのバグ修正が含まれています。
さらに、OTLP サポートがアップデートされました。

#### [.NET](/docs/languages/dotnet/) {#net}

[バージョン1.6.0-alpha.1](https://github.com/open-telemetry/opentelemetry-dotnet/releases/tag/core-1.6.0-alpha.1) がリリースされました。
1.6 ではエグザンプラーのサポートが再導入され、ログブリッジ API が実装されています。
その他のアップデートやバグ修正も含まれています。

## ニュースと今後のイベント {#news-and-upcoming-events}

シカゴで開催される KubeCon North America に、Observability Day がやってきます！
CFP は8月6日まで受け付けています。
[今すぐトークを応募しましょう！](https://events.linuxfoundation.org/kubecon-cloudnativecon-north-america/co-located-events/cfp-colocated-events/)
