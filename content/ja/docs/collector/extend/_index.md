---
title: コレクターの拡張
linkTitle: 拡張
description: OpenTelemetry Collectorをカスタムコンポーネントで拡張する方法を学ぶ
weight: 90
default_lang_commit: 6a7f17450ce3edc2e4363013551ee93ba7934a5d
---

OpenTelemetry Collectorは拡張可能なように設計されています。
コアコレクターにはさまざまなレシーバー、プロセッサー、エクスポーターが付属していますが、カスタムプロトコルをサポートしたり、特定の方法でデータを処理したり、独自のバックエンドにデータを送信したりする必要があるかもしれません。

このセクションでは、[OpenTelemetry Collector Builder (OCB)](./ocb/)を使用してコレクターを拡張し、カスタムコンポーネントを作成する方法について説明します。
