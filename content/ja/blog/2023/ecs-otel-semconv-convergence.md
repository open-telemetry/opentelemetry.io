---
title: Elastic Common Schema（ECS）と OpenTelemetry セマンティック規約の統合を発表
linkTitle: ECS と OTel セマンティック規約の統合
date: 2023-04-17
author: '[Reiley Yang](https://github.com/reyang)'
default_lang_commit: 134221e3bee516f02b424402300aef67d64159e1
cSpell:ignore: ECS Reiley Yang
---

本日、[Elastic](https://www.elastic.co/) と共同で、[Elastic Common Schema](https://www.elastic.co/guide/en/ecs/current/ecs-reference.html)（ECS）と [OpenTelemetry セマンティック規約][OpenTelemetry Semantic Conventions]の将来について発表できることを大変嬉しく思います。

目標は、ECS と OTel セマンティック規約を、OpenTelemetry によって管理される単一のオープンスキーマへと統合し、OpenTelemetry セマンティック規約が真に Elastic Common Schema の後継となることです。
OpenTelemetry はこの分野におけるオブザーバビリティとセキュリティの統合を改善することに同様の関心を持っています。
このスキーマの統合は、以下の理由からオープンソースコミュニティに大きな価値をもたらすと考えています。

- ECS は、ログ、メトリクス、トレース、セキュリティイベントのスキーマにおいて長年にわたる実績を持ち、一般的な問題領域を幅広くカバーしています。
- ECS はセキュリティドメインのフィールドに対するスキーマを提供しており、これはテレメトリーの重要な側面です。
- 2つの異なる標準を1つに統合することで、エコシステム（たとえば計装ライブラリ、ツール、利用体験など）の発展を後押しし、テレメトリーの生成者と利用者の双方に利益をもたらします。
- この共同の取り組みは、ロギング、分散トレーシング、メトリクス、セキュリティイベントの各分野の専門家からの知見を活用します。
  その結果、オブザーバビリティとセキュリティイベントの各領域にわたって、より一貫性のあるシグナルが得られることを期待しています。

Elastic と OpenTelemetry コミュニティの双方は、広く使われている2つの標準を1つの共通スキーマに統合し、ユーザーにとってスムーズな移行を実現することが重要であると認識しています。
Elastic と OpenTelemetry の双方からドメインの専門家が参加する、専用の OpenTelemetry セマンティック規約ワーキンググループが設立される予定です。
また、データスキーマやセマンティック規約に情熱を持つドメインの専門家の参加も歓迎しています。
コントリビューションに興味がある方は、[OTel セマンティック規約ワーキンググループ](https://github.com/open-telemetry/community#specification-sigs)に参加し、[Slack チャンネル](https://cloud-native.slack.com/archives/C041APFBYQP)でのディスカッションにご参加ください。

## リファレンス {#references}

- [Elastic からの発表][Announcement from Elastic]
- [OpenTelemetry セマンティック規約][OpenTelemetry Semantic Conventions]
- [OTEP 199: Elastic Common Schema と OpenTelemetry セマンティック規約の統合][OTEP 199: Merge Elastic Common Schema with OpenTelemetry Semantic Conventions]
- [OTEP Issue 197: 提案: OpenTelemetry における Elastic Common Schema（ECS）のサポート追加][OTEP Issue 197: Proposal: Add support for Elastic Common Schema (ECS) in OpenTelemetry]
- [OTEP Pull Request 199: OpenTelemetry における Elastic Common Schema のサポート][OTEP Pull Request 199: Support Elastic Common Schema in OpenTelemetry]
- [OTEP Pull Request 222: OpenTelemetry における Elastic Common Schema（ECS）のサポート][OTEP Pull Request 222: Support Elastic Common Schema (ECS) in OpenTelemetry]

[Announcement from Elastic]: https://elastic.co/blog/ecs-elastic-common-schema-otel-opentelemetry-announcement
[OpenTelemetry Semantic Conventions]: /docs/concepts/semantic-conventions/
[OTEP 199: Merge Elastic Common Schema with OpenTelemetry Semantic Conventions]: https://github.com/open-telemetry/oteps/blob/d02a3e2e75dc934fb38c5db88eb41fbe85730af4/text/0199-support-elastic-common-schema-in-opentelemetry.md
[OTEP Issue 197: Proposal: Add support for Elastic Common Schema (ECS) in OpenTelemetry]: https://github.com/open-telemetry/oteps/issues/197
[OTEP Pull Request 199: Support Elastic Common Schema in OpenTelemetry]: https://github.com/open-telemetry/oteps/pull/199
[OTEP Pull Request 222: Support Elastic Common Schema (ECS) in OpenTelemetry]: https://github.com/open-telemetry/oteps/pull/222
