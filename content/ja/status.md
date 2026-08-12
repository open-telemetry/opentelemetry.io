---
title: ステータス
menu: { main: { weight: 30 } }
aliases: [/project-status, /releases]
description: 主要な OpenTelemetry コンポーネントの成熟度レベル
type: docs
body_class: td-no-left-sidebar
default_lang_commit: 24784ba7f811b7517d9dfa0c2178a9a1e29c1949
---

OpenTelemetry は[いくつかのコンポーネント](/docs/concepts/components/)で構成されており、言語固有のものと言語に依存しないものがあります。
[ステータス](/docs/specs/otel/versioning-and-stability/)を調べる際は、適切なコンポーネントのページからステータスを確認してください。
たとえば、仕様におけるシグナルのステータスは、特定の言語 SDK でのシグナルのステータスとは異なる場合があります。

## 言語 API と SDK {#language-apis--sdks}

[言語 API または SDK](/docs/languages/) の開発ステータス、つまり成熟度レベルについては、以下の表を参照してください。

{{% telemetry-support-table " " %}}

実装ごとの仕様準拠の詳細については、[仕様準拠マトリクス](https://github.com/open-telemetry/opentelemetry-specification/blob/main/spec-compliance-matrix.md)を参照してください。

## Collector {#collector}

Collector のステータスは、コアの Collector コンポーネントが現在さまざまな[安定性レベル](https://github.com/open-telemetry/opentelemetry-collector#stability-levels)を持つため、[混合状態（mixed）](/docs/specs/otel/document-status/#mixed)です。

**Collector コンポーネント**は成熟度が異なります。
各コンポーネントの安定性はそれぞれの `README.md` に記載されています。
利用可能な Collector コンポーネントの一覧は[レジストリ](/ecosystem/registry/?language=collector)にあります。

## Kubernetes Operator {#kubernetes-operator}

OpenTelemetry Operator のステータスは、異なるステータスのコンポーネントをデプロイするため、[混合状態（mixed）](/docs/specs/otel/document-status/#mixed)です。

Operator 自体も `v1alpha1` と `v1beta1` のコンポーネントを持つ[混合状態（mixed）](/docs/specs/otel/document-status/#mixed)です。

## 仕様 {#specifications}

[仕様](/docs/specs/otel/)の開発ステータス、つまり成熟度レベルについては、[仕様ステータス概要](/docs/specs/status/)を参照してください。
