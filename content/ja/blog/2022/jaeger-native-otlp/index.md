---
title: ネイティブ OTLP による Jaeger のサポート
linkTitle: Jaeger OTLP サポート
date: 2022-11-03
author: >-
  [Jason Plumb](https://github.com/breedx-splk) (Splunk)
default_lang_commit: 6e13d934026c15dc982e28c1234838ccf005ecb0
---

2022年5月、Jaeger プロジェクトは [OpenTelemetry Protocol のネイティブサポートを発表しました](https://medium.com/jaegertracing/introducing-native-support-for-opentelemetry-in-jaeger-eb661be8183c)（OTLP）。
これは多くの言語にわたる Jaeger クライアントライブラリの[十分な非推奨化の移行期間](https://twitter.com/YuriShkuro/status/1455170693197402119)に続くものでした。
これらの変更により、OpenTelemetry ユーザーは業界標準の OTLP を使用して Jaeger にトレースを送信できるようになり、Jaeger クライアントライブラリのリポジトリはついにアーカイブされました。

私たちは近い将来、OpenTelemetry から **Jaeger エクスポーターを非推奨化する**予定であり、非推奨化の期間を決定するために皆さんのフィードバックを求めています。
フィードバックを提供する最善の方法は、[4問のアンケートに回答する](https://forms.gle/aUuJg5DQwNzncJ4s8)か、[既存のドラフトプルリクエスト](https://github.com/open-telemetry/opentelemetry-specification/pull/2858)にコメントすることです。

## OpenTelemetry のサポート {#opentelemetry-support}

この相互運用性は、Jaeger ユーザーにとっても OpenTelemetry ユーザーにとっても素晴らしい成果です。
しかし、まだ完了ではありません。
OpenTelemetry の仕様では、依然として各言語で Jaeger クライアントエクスポーターのサポートが求められています。

これは Jaeger ユーザーと OpenTelemetry メンテナーの両方にとって課題となっています。

1. **選択肢の混乱**

   現在、ユーザーはエクスポーター（Jaeger または OTLP）の選択を迫られており、これが混乱の原因になりえます。
   Jaeger にテレメトリーをエクスポートする際、ユーザーは名前が一致するという理由だけで Jaeger エクスポーターを選びがちです（Jaeger が現在は OTLP の使用を積極的に推奨しているにもかかわらず）。

   この混乱を招きうる選択肢をなくすことで、ユーザーエクスペリエンスを改善し、単一の相互運用可能なプロトコルへの標準化を進めることができます。
   すべてが「そのまま動く」のは素晴らしいことです！

2. **メンテナンスと重複**

   Jaeger クライアントライブラリはアーカイブされたため、今後は更新（セキュリティパッチを含む）が行われません。
   Jaeger クライアントエクスポーターを適切にサポートし続けるためには、OpenTelemetry の開発者が、以前は Jaeger クライアントから利用していた機能の一部を再実装する必要があります。

   Jaeger が OTLP をサポートするようになった今、これは後退のように感じられます。
   メンテナンスの負担が増加する一方で、得られるメリットはほとんどありません。

### ユーザーへの影響 {#user-impact}

この提案は、Jaeger へのネイティブ OTLP 使用を推奨し、以下のエクスポーターを OpenTelemetry から非推奨化するものです。

- Jaeger Thrift over HTTP
- Jaeger protobuf via gRPC
- Jaeger Thrift over UDP

アプリケーションの設定変更に加えて、アーキテクチャ上の考慮事項が生じる可能性があります。
HTTP と gRPC は比較的容易に置き換えられますが、ポート 4317 と 4318 がまだアクセス可能でない場合は公開が必要になるかもしれません。

Thrift over UDP は [Jaeger エージェント](https://www.jaegertracing.io/docs/1.24/architecture/#agent)の使用を前提としています。
このデプロイ構成のユーザーは、やや複雑な変更が必要になります。
通常は以下のいずれかを行います。

1. 直接取り込み。
   アプリケーションは Thrift+UDP の使用から、`jaeger-collector` インスタンスへ直接 OTLP トレースを送信する方式に変更します。
   これはサンプリングにも影響する可能性があります。
2. Jaeger エージェントをサイドカーの [OpenTelemetry Collector](https://github.com/open-telemetry/opentelemetry-collector) インスタンスに置き換えます。
   これはサンプリングに影響する可能性があり、インフラストラクチャのデプロイコードの変更が必要です。

## 非推奨化の意向 - フィードバックをお寄せください！ {#intent-to-deprecate---wed-like-your-feedback}

OpenTelemetry と Jaeger の相互運用をより適切にサポートするため、OpenTelemetry における Jaeger クライアントエクスポーターのサポートを非推奨化し、最終的に削除する予定です。

フィードバックをお寄せください！
この変更の影響を受ける可能性のあるユーザーからの声をお待ちしています。
データに基づいた意思決定をより適切に行うため、[4問の短いアンケートを用意しました](https://forms.gle/aUuJg5DQwNzncJ4s8)。

皆さんの意見は、削除前の非推奨化期間の長さを決定するのに役立ちます。

この非推奨化をサポートするための[ドラフト PR が仕様リポジトリに作成されています](https://github.com/open-telemetry/opentelemetry-specification/pull/2858)。
フィードバックを提供したい方は、上記のリンクにアクセスしてコメントしてください。
皆さんの声をお待ちしています。
