---
title: OTel セマンティック規約で Kubernetes 属性がリリース候補に昇格
linkTitle: Kubernetes SemConv RC
date: 2026-03-16
author: >-
  [Christos Markou](https://github.com/ChrsMark)(Elastic) [David
  Ashpole](https://github.com/dashpole)(Google)
default_lang_commit: b2eb2bb46b0da10900c8fc36e3ee39b22b9894d9
cSpell:ignore: Ashpole Markou resourcedetection sattributes
---

ここ数か月、K8s（Kubernetes）Semantic Conventions SIG は、`k8sattributes` や `resourcedetection` などの OpenTelemetry Collector プロセッサーが使用する Kubernetes 属性の安定化に注力してきました。
その取り組みが実を結び、Kubernetes 属性がリリース候補ステータスに昇格しました。
ユーザーはフィーチャーゲートを通じてこの新しいスキーマを試し、最終的な安定版リリースの前にフィードバックを提供できます。
このマイルストーンに至った経緯と今後の展望について、以下で詳しく説明します。

## 先行事例 {#prior-art}

昨年10月、K8s（Kubernetes）Semantic Conventions SIG は、グループの目標の最初のターゲットを[達成しました](https://github.com/open-telemetry/semantic-conventions/issues/1032#issuecomment-3401648352)。
それは、OpenTelemetry Collector がすでに備えていた K8s 関連のメトリクス（`k8s.pod.cpu.time` など）をセマンティック規約として定義することでした。

## KubeCon NA 2025 {#kubecon-na-2025}

2025年11月の前回の KubeCon NA で、グループは対面で集まり、SIG の次の計画について議論しました。
提案は K8s 属性の安定性に注力し、メトリクスは二次的な優先事項とすることでした。
その主な理由は、最近設定された [Collector SIG の目標](https://github.com/open-telemetry/opentelemetry-collector-contrib/issues/44130)と連携して作業を進めるためでした。
その目標の一つが `k8sattributes` プロセッサーコンポーネントの安定化であり、このコンポーネントは K8s 属性セマンティック規約に大きく依存しています。
この文脈において、K8s 属性をセマンティック規約として安定させることは、`k8sattributes` プロセッサーの安定化の進捗に大きく貢献するものでした。

## Collector SIG との連携 {#alignment-with-collector-sig}

この議論から、私たちは決定を下し、[その後数か月間の計画](https://github.com/open-telemetry/semantic-conventions/issues/3119)を策定しました。
計画は、Collector SIG の優先事項に合わせて属性の安定性に注力し、その後 K8s メトリクスの安定性に取り組むというものでした。

## 最近の成果 {#recent-accomplishments}

その結果、ここ数か月間、グループは K8s 属性セマンティック規約の安定化に注力してきました。
具体的には、安定化を目指す OpenTelemetry Collector Contrib コンポーネント（`k8sattributes` プロセッサー、`resourcedetection` プロセッサーなど）がすでに使用している属性です。
該当するイシュー（[issue 3120](https://github.com/open-telemetry/semantic-conventions/issues/3120)）がこの作業を追跡しており、K8s SemConv SIG は [K8s 属性がリリース候補の安定性レベルに到達した](https://github.com/open-telemetry/semantic-conventions/pull/3491)ことを喜んでお知らせします。

## 次のステップ {#next-steps}

次に、セマンティック規約の次回リリース後、`k8sattributes` プロセッサーは Collector の[ガイドライン](https://github.com/open-telemetry/opentelemetry-collector/blob/v0.147.0/docs/rfcs/semconv-feature-gates.md#proposed-mechanism)に従い、該当するフィーチャーゲートの下で最新の `release_candidate` K8s セマンティック規約を使用するように更新されます。
これにより、ユーザーはフィーチャーゲートを使用してオプションで新しいスキーマに切り替えることができ、K8s 属性セマンティック規約が `stable` に昇格する前にコミュニティがフィードバックを提供できるようになります。
その期間中、K8s SemConv SIG はフィードバックを受け付けながら、K8s メトリクスおよびエンティティの安定化にも取り組みます。
[フィーチャーゲート](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/v0.147.0/processor/k8sattributesprocessor/documentation.md#feature-gates) `processor.k8sattributes.DontEmitV0K8sConventions` と `processor.k8sattributes.EmitV1K8sConventions` は `k8sattributes` プロセッサーですでに利用可能であり、その使い方についてはコンポーネントの[ドキュメント](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/v0.147.0/processor/k8sattributesprocessor/README.md#semantic-conventions-compatibility)で詳しく知ることができます。

## フィードバックのお願い {#call-for-feedback}

K8s セマンティック規約を使用または依存している方は、まだ `release_candidate` の安定性レベルにある今がフィードバックを提供する絶好の機会です。
CNCF Slack の [#otel-k8s-semconv-sig](https://cloud-native.slack.com/archives/C07Q1L0FGKX) チャンネルでお気軽にご連絡いただくか、[K8s SemConv SIG](https://github.com/open-telemetry/community/blob/184336e3d39010eb22496d97a01cc2120763c929/projects/k8s-semconv.md) のミーティングに直接ご参加ください。
皆さんのご意見をお待ちしています！
