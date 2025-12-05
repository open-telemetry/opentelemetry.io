---
title: Functions as a Service
linkTitle: FaaS
description: >-
  OpenTelemetryは、さまざまなクラウドベンダーが提供するFaaSを監視するさまざまな方法をサポートしています。
redirects: [{ from: /docs/faas/*, to: ':splat' }] # cSpell:disable-line
default_lang_commit: 9ba98f4fded66ec78bfafa189ab2d15d66df2309 # patched
drifted_from_default: true
---

Functions as a Service（FaaS）は、[クラウドネイティブアプリ][cloud native apps]にとって重要なサーバーレスコンピュートプラットフォームです。
しかし、プラットフォームの癖によって、これらのアプリケーションはKubernetesやVirtual Machines上で実行されるアプリケーションとは若干異なる監視ガイダンスや要件を持つことになります。

FaaSドキュメントの最初のベンダー範囲は、Microsoft Azure、Google Cloud Platform（GCP）、Amazon Web Services（AWS）です。
AWSのファンクション（関数）はLambdaとしても知られています。

## コミュニティアセット {#community-assets}

現在、OpenTelemetry コミュニティは、アプリケーションを自動計装することができるビルド済みの Lambda レイヤーと、アプリケーションを手動または自動で計装する際に使用できるスタンドアロンの Collector Lambda レイヤーを提供しています。

リリース状況は[OpenTelemetry-Lambdaリポジトリ](https://github.com/open-telemetry/opentelemetry-lambda)で追跡できます。

[cloud native apps]: https://glossary.cncf.io/cloud-native-apps/
