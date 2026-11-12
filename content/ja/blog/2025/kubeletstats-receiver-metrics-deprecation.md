---
title: >
  kubeletstats レシーバーにおける Kubernetes CPU メトリクス: .cpu.utilization から
  .cpu.usage への移行
linkTitle: kubeletstats レシーバーのメトリクス更新
author: >
  [Christos Markou](https://github.com/ChrsMark) (Elastic), [Tyler
  Helmuth](https://github.com/TylerHelmuth) (Honeycomb), [Dmitrii
  Anoshin](https://github.com/dmitryax) (Cisco/Splunk)
date: 2025-05-30
issue: https://github.com/open-telemetry/opentelemetry.io/issues/6847
default_lang_commit: a1e10f7fb11588cd9a0a982c366a67ecdd5b8628
cSpell:ignore: Anoshin Dmitrii Helmuth Kubelet kubeletstats Markou
---

OpenTelemetry Collector の
[`kubeletstats`](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/v0.127.0/receiver/kubeletstatsreceiver/README.md)
レシーバーは、Kubernetes のノード、Pod、コンテナのメトリクスを収集するための重要なコンポーネントです。
メトリクスの精度を向上させ、[OpenTelemetry セマンティック規約](/docs/specs/semconv/general/naming/#instrument-naming)に準拠するため、CPU メトリクスの命名と出力方法を更新しています。

このブログ記事では、この変更の背景にある動機、ユーザーへの影響、この変更のために導入されたフィーチャーゲートの役割、および移行のガイダンスについて説明します。

## なぜこの変更が必要なのか {#why-this-change}

歴史的に、
[`kubeletstats`](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/v0.127.0/receiver/kubeletstatsreceiver/README.md)
レシーバーは `.cpu.utilization` というラベルを持つ CPU メトリクスを出力していました。
たとえば以下のようなものです。

- [`k8s.node.cpu.utilization`](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/v0.127.0/receiver/kubeletstatsreceiver/documentation.md#k8snodecpuutilization)
- [`k8s.pod.cpu.utilization`](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/v0.127.0/receiver/kubeletstatsreceiver/documentation.md#k8spodcpuutilization)
- [`container.cpu.utilization`](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/v0.127.0/receiver/kubeletstatsreceiver/documentation.md#containercpuutilization)

これらのメトリクスは実際には[**CPU使用量（コア数）の生の値**](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/v0.127.0/receiver/kubeletstatsreceiver/internal/kubelet/cpu.go#L25-L26)を表しており、Kubernetes Kubelet の
[`UsageNanoCores`](https://github.com/kubernetes/kubernetes/blob/8adc0f041b8e7ad1d30e29cc59c6ae7a15e19828/staging/src/k8s.io/kubelet/pkg/apis/stats/v1alpha1/types.go#L230-L233)
フィールドから導出されたもので、CPU使用量の絶対値（ナノコア単位）を示します。

_utilization_（利用率）という用語は一般的に、使用済み CPU の合計 CPU 容量や制限に対する比率やパーセンテージとして表される相対的なメトリクスを指します。
絶対的な使用量の値に `.cpu.utilization` を使用することは、[セマンティック規約](/docs/specs/semconv/general/naming/#instrument-naming)に違反しており、利用率メトリクスが相対的であると期待するユーザーやツールに混乱を招く可能性があります。

## 何が変わるのか {#what-is-changing}

このセマンティック上のミスマッチに対処するため、CPU使用量の生の値を正しく表す新しい `.cpu.usage` メトリクスを導入しました。

- [`k8s.node.cpu.usage`](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/v0.127.0/receiver/kubeletstatsreceiver/documentation.md#k8snodecpuusage)
- [`k8s.pod.cpu.usage`](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/v0.127.0/receiver/kubeletstatsreceiver/documentation.md#k8spodcpuusage)
- [`container.cpu.usage`](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/v0.127.0/receiver/kubeletstatsreceiver/documentation.md#containercpuusage)

同時に、レガシーの `.cpu.utilization` メトリクスは[**非推奨としてマーク**](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/v0.127.0/receiver/kubeletstatsreceiver/README.md#metrics-deprecation)されました。

## フィーチャーゲート: `receiver.kubeletstats.enableCPUUsageMetrics` {#feature-gate-receiverkubeletstatsenablecpuusagemetrics}

`.cpu.utilization` メトリクスはこれまでデフォルトで有効になっていました。
移行をスムーズに管理するため、`receiver.kubeletstats.enableCPUUsageMetrics` という名前の**フィーチャーゲート**が[導入されました](https://github.com/open-telemetry/opentelemetry-collector-contrib/pull/35139)。

- **Alpha
  （[v0.111.0](https://github.com/open-telemetry/opentelemetry-collector-contrib/releases/tag/v0.111.0)）:**
  フィーチャーゲートが導入されましたが、デフォルトでは無効でした。
  ユーザーは `.cpu.utilization` のかわりに `.cpu.usage` メトリクスをデフォルトで受け取るには、明示的に有効にする必要がありました。
- **Beta
  （[v0.125.0](https://github.com/open-telemetry/opentelemetry-collector-contrib/releases/tag/v0.125.0)）:**
  フィーチャーゲートは
  [Beta に昇格](https://github.com/open-telemetry/opentelemetry-collector-contrib/pull/39488)し、**デフォルトで有効**になりました。
  この状態では次のようになります。
  - `.cpu.usage` メトリクスがデフォルトで出力されます。
  - `.cpu.utilization` メトリクスを有効にしようとすると失敗します。
  - 必要に応じて、**フィーチャーゲートを明示的に無効にする**ことで、非推奨の `.cpu.utilization` メトリクスを一時的に復元できます。
- **Stable（今後予定）:** フィーチャーゲートは、コミュニティが適応するための十分な時間を確保するため、数リリースの間 Beta のまま維持されます。
  Stable への移行の計画と議論は [Issue #39650](https://github.com/open-telemetry/opentelemetry-collector-contrib/issues/39650) で追跡されています。

## これはあなたにとって何を意味するのか {#what-does-this-mean-for-you}

### 既存ユーザーへの影響 {#impact-on-existing-users}

- **v0.125.0以降**にアップグレードすると、Collector はデフォルトで `.cpu.usage` メトリクスを出力するようになります。
- `.cpu.utilization` メトリクスに依存しているモニタリングダッシュボード、アラートルール、クエリは**動作しなくなるか、期待どおりに機能しなくなります**。
- 非推奨の `.cpu.utilization` メトリクスは最終的に削除される予定のため、長期的な互換性のためにも更新が必要です。

### 推奨されるアクション {#recommended-actions}

1. `.cpu.utilization` メトリクスへの参照がないか、**オブザーバビリティパイプラインを監査**してください。
2. 新しい `.cpu.usage` メトリクスを使用するように、**ダッシュボード、アラート、クエリを更新**してください。
3. ステージング環境でフィーチャーゲートを有効にして（または v0.125.0以降のデフォルト有効状態を利用して）、**新しいメトリクスをテスト**してください。
4. `.cpu.utilization` が将来のリリースで削除されることを考慮して、**移行のタイムラインを計画**してください。
5. [GitHub issues](https://github.com/open-telemetry/opentelemetry-collector-contrib/issues/27885) や PR のディスカッションを通じて、OpenTelemetry コミュニティとの**関わりを維持**してください。

## なぜフィーチャーゲートを Beta のまま維持するのか {#why-keep-the-feature-gate-in-beta}

フィーチャーゲートを複数のリリースにわたって Beta のまま維持する決定は、以下の理由に基づいています。

- 多くの本番オブザーバビリティパイプラインにとって、kubeletstats の CPU メトリクスが**極めて重要**であること。
- ユーザーやベンダーがツールを適応・更新するための**十分な時間を確保する**必要があること。
- 変更が恒久的になる前に、**フィードバックを収集**し、予期しない問題に対処する機会を得ること。

このアプローチにより、混乱を最小限に抑え、すべてのユーザーにとってスムーズな移行を実現します。

## 関連リンクとリファレンス {#useful-links-and-references}

- [Issue #27885 - kubeletstats CPU メトリクスのセマンティック更新](https://github.com/open-telemetry/opentelemetry-collector-contrib/issues/27885)
- [PR #35139 - `.cpu.usage` メトリクスとフィーチャーゲートの導入（alpha）](https://github.com/open-telemetry/opentelemetry-collector-contrib/pull/35139)
- [PR #39488 - フィーチャーゲートの Beta 昇格とデフォルト有効化](https://github.com/open-telemetry/opentelemetry-collector-contrib/pull/39488)
- [Issue #39650 - フィーチャーゲートの Stable 移行計画](https://github.com/open-telemetry/opentelemetry-collector-contrib/issues/39650)
- [OpenTelemetry メトリクスセマンティック規約](/docs/specs/semconv/general/metrics/)
- [Kubernetes Kubelet Stats API](https://pkg.go.dev/k8s.io/kubernetes@v1.19.16/pkg/kubelet/apis/stats/v1alpha1)

## まとめ {#final-thoughts}

`kubeletstats` レシーバーにおける `.cpu.utilization` から `.cpu.usage` メトリクスへの移行は、Kubernetes メトリクスがセマンティックのベストプラクティスに準拠するための重要なステップです。
これらの改善を進めるにあたり、コミュニティの忍耐と協力に感謝いたします。

質問がある場合、フィードバックを共有したい場合、または移行のサポートが必要な場合は、[CNCF Slack](https://slack.cncf.io/) にご参加ください。

より明確で信頼性の高い Kubernetes オブザーバビリティの構築にご協力いただき、ありがとうございます！
