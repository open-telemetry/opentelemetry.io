---
title: 移行
description: OpenTelemetryへの移行方法
aliases:
  - /docs/migration/
weight: 800
default_lang_commit: b6536b5ba70214905f981c8854421f62d5082ece
---

## OpenTracingとOpenCensus {#opentracing-and-opencensus}

OpenTelemetryは、OpenTracingとOpenCensusの統合によって誕生しました。
当初から、OpenTelemetryは[OpenTracingとOpenCensusの次のメジャーバージョン][to be the next major version of both OpenTracing and OpenCensus]と位置づけられていました。
そのため、OpenTelemetryプロジェクトの[主要な目標][key goals]の1つは、両方のプロジェクトとの後方互換性を提供し、既存ユーザーに移行の道筋を示すことです。

これらのプロジェクトから移行する場合は、[OpenTracing](opentracing/)と[OpenCensus](opencensus/)の移行ガイドをご覧ください。

## Jaegerクライアント {#jaeger-client}

[Jaegerコミュニティ](https://www.jaegertracing.io/)はクライアントライブラリを非推奨にし、OpenTelemetryのAPI、SDK、計装への[移行](https://www.jaegertracing.io/docs/latest/migration/)を推奨しています。

Jaegerバックエンドは、v1.35以降、OpenTelemetry Protocol（OTLP）を使用したトレースデータの受信をサポートしています。
OpenTelemetry SDKとCollectorのJaegerエクスポーターからOTLPエクスポーターへの移行が可能です。

[to be the next major version of both OpenTracing and OpenCensus]: https://www.cncf.io/blog/2019/05/21/a-brief-history-of-opentelemetry-so-far/
[key goals]: https://medium.com/opentracing/merging-opentracing-and-opencensus-f0fe9c7ca6f0
