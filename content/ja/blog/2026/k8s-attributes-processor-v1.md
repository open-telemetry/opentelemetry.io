---
title: Kubernetes attributes processor が v1.0.0 マイルストーンに到達
linkTitle: Kubernetes Processor v1
date: 2026-09-16
author: >-
  [Christos Markou](https://github.com/ChrsMark)(Elastic), [Pablo
  Baeyens](https://github.com/mx-psi/)(Datadog)
default_lang_commit: ab6ef133372515d3267cf99f06d4e5f8db0ef409
cSpell:ignore: Baeyens Markou
---

Kubernetes メタデータでテレメトリーを拡充する [Kubernetes attributes processor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/42e6adb99d409af1935536652e633d49c98e77cd/processor/k8sattributesprocessor#kubernetes-attributes-processor) が、正式に v1.0.0 へ移行しました！
カスタムディストロで試すことができ、最新の opentelemetry-collector-contrib および opentelemetry-collector-k8s ディストロリリースの一部としても利用可能です。

v1.0.0 であることは、このコンポーネントがテスト、ベンチマーク、ドキュメント、テレメトリーの安定性に関する要件を含む ['stable' 安定性基準](https://github.com/open-telemetry/opentelemetry-collector/blob/7d1c25d46b14cce04a820d92a4ce462bf7a04b0b/docs/component-stability.md#stable)を満たすことが検証されたことを意味します。
また、API の破壊なしに Go ライブラリとして、またはバイナリの一部として再配布できることも保証されます。

変更内容と移行期間の管理方法については、[移行ガイド](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/42e6adb99d409af1935536652e633d49c98e77cd/processor/k8sattributesprocessor#semantic-conventions-compatibility)をお読みください。

## ここまでの経緯と今後の展望 {#how-we-got-here-and-what-comes-next}

2025年後半から、OpenTelemetry Collector SIG は OpenTelemetry プロジェクトの ["Stable by Default"](/blog/2025/stability-proposal-announcement/) の取り組みの一環として、[複数のコンポーネントの安定化](https://github.com/open-telemetry/opentelemetry-collector-contrib/issues/44130)に取り組んできました。
これらの取り組みは、Collector ライブラリフレームワークの安定性を提供し、v1 Collector ディストロを生み出すための[既存の取り組み](https://github.com/open-telemetry/opentelemetry-collector/issues/9375)を補完し、継続しています。

[Collector のアンケート](/blog/2026/otel-collector-follow-up-survey-analysis/)に対するエンドユーザーのフィードバックのおかげで、最もよく使われているコンポーネントと、安定性と信頼性がユーザーの最優先事項であることがわかりました。
これにより、どのコンポーネントに注力すべきかが明確になり、ユーザーの期待に応えることを目指す[厳格な基準](https://github.com/open-telemetry/opentelemetry-collector/blob/7d1c25d46b14cce04a820d92a4ce462bf7a04b0b/docs/component-stability.md#stable)に重点を置いた安定化へのロードマップも明確になりました。

これらの基準を満たすことは容易ではありません。
コンポーネントの安定化には、そのコンポーネントが依存するセマンティック規約や仕様の一部の安定化も伴うため、Collector SIG は K8s Semantic Conventions SIG、System Semantic Conventions SIG、Prometheus Interoperability SIG などの他の SIG と緊密に協力しています。

K8s Semantic Conventions SIG は[この依存関係を早期に発見し](/blog/2026/k8s-semconv-rc/)、2025年11月に K8s は対応する K8s セマンティック規約を[安定化するための集中的な作業を開始しました](https://github.com/open-telemetry/semantic-conventions/issues/3120)。
2026年3月にこれらのセマンティック規約はリリース候補の状態に達し、2026年6月に [Semantic Conventions v1.42.0 で安定版として出荷されました](https://github.com/open-telemetry/semantic-conventions/releases/tag/v1.42.0)。

これにより、Kubernetes attributes processor は安定した K8s 属性でテレメトリーを拡充できるようになり、コンポーネントのテレメトリーが今後も安定し続けることが保証されました。
コンポーネントを安定性要件に適合させるための[長期にわたる作業](https://github.com/open-telemetry/opentelemetry-collector-contrib/issues/44483)とともに、コンポーネントは[卒業プロセスを経ました](https://github.com/open-telemetry/opentelemetry-collector-contrib/issues/49274)。
このコンポーネントをすでに本番環境で使用しているエンドユーザーと、再配布しているベンダーからの数週間にわたるコミュニケーションと承認を経て、コンポーネントは v1.0.0 として承認されました。

新しいセマンティック規約の名前への移行に必要な変更やその他の昇格関連の変更を適用する最終 PR は、[その直後にレビューを通過しました](https://github.com/open-telemetry/opentelemetry-collector-contrib/pull/49152)。
冒頭で述べたように、これは既存のプロセッサーユーザーにとっていくつかの破壊的変更を伴います。
そのため、更新を支援する[変更のまとめと移行ガイド](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/42e6adb99d409af1935536652e633d49c98e77cd/processor/k8sattributesprocessor#semantic-conventions-compatibility)を作成しました。

このマイルストーンは、より多くのコンポーネントが後に続く道を開くものであり、コミュニティからのさらなる協力が大いに歓迎されます。
OpenTelemetry Collector がより安定した未来に向かって進むことを支援したい場合、[やるべきことはまだたくさんあります](https://github.com/open-telemetry/opentelemetry-collector-contrib/issues/44130)。
フィードバックやご意見をお寄せいただくか、メンテナーにより直接的な方法でどのように支援できるかお問い合わせください。
