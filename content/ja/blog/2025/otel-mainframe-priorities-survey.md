---
title: メインフレームにおける OpenTelemetry の優先事項アンケート
linkTitle: メインフレーム優先事項アンケート
date: 2025-01-31
author: '[Ruediger Schulze](https://github.com/rrschulze) (IBM)'
canonical_url: https://openmainframeproject.org/blog/opentelemetry-on-mainframe-priorities-survey/
issue: https://github.com/open-telemetry/opentelemetry.io/issues/6045
sig: SIG OpenTelemetry on Mainframe
default_lang_commit: c623aaf368e162473bd208fbc9fa9a0e9ca803a5
cSpell:ignore: Ruediger Schulze
---

[OpenTelemetry](/) プロジェクトと [The Open Mainframe Project](https://openmainframeproject.org/) は、2024年初頭に [SIG「OpenTelemetry on Mainframe」](https://github.com/open-telemetry/sig-mainframe)を設立しました。
私たちの焦点は、メインフレーム上で OpenTelemetry を有効にし、エンドツーエンドのオブザーバビリティを向上させ、ハイブリッドクラウドアプリケーションへのメインフレームの参加を支援することです。
**SIG は皆さまの参加を求める新しい[アンケート][survey]を開始しました。**

## 背景 {#background}

オブザーバビリティには多くの定義がありますが、ここではパブリッククラウド、プライベートクラウド、メインフレーム環境など、複数のランディングゾーンにまたがるハイブリッドアプリケーションの動作について、実用的なインサイトを得る能力を指します。

OpenTelemetry は、トレース、メトリクス、ログなどの高品質なテレメトリーデータを、あらゆるソースからあらゆるターゲットへ利用可能にすることを目指す、広く採用されているオブザーバビリティのためのオープンソースフレームワークです。
OpenTelemetry は、Cloud Native Computing Foundation（CNCF）の中で2番目に活発なプロジェクトであり続けています。
OpenTelemetry プロジェクトのコミュニティは、テレメトリーの収集、処理、配信を統一する仕様と実装の提供に多大な努力を払ってきました。

OpenTelemetry プロジェクトの幅広さとメインフレームの高度な機能を考慮し、SIG のコントリビューターとして、メインフレームで OpenTelemetry を最大限に活用するための優先事項をよりよく理解したいと考えています。
メインフレームのユーザーやオブザーバビリティソリューションのユーザー、開発者、サイトリライアビリティエンジニア、アプリケーションオーナー、アーキテクト、DevOps エンジニア、およびこの分野のすべての専門家から幅広くフィードバックを求めています。

[アンケート][survey]の結果は、メインフレームプラットフォームでの OpenTelemetry の採用を加速するための活動に優先順位を付け、実施するために役立てられます。
そのような活動としては、コード計装のための選定された SDK の z/OS への迅速な移植や、プラットフォーム固有の側面に対するセマンティック規約の定義などが考えられます。
アンケートが完了した後、OpenTelemetry プロジェクトと The Open Mainframe Project のウェブサイトで結果と優先順位付けされた活動リストを公開する予定です。

## アンケートへの参加 {#taking-the-survey}

[アンケート][survey]は2つのセクションで構成されています。
最初のセクションでは、あなたの役割と経歴に関する情報を収集します。
2番目のセクションでは、メインフレームで OpenTelemetry を有効にするための組織としての優先事項を収集します。
20の質問への回答には約15分かかります。
アンケートにお時間をいただけることに感謝し、皆さまからのフィードバックをお待ちしています！

ぜひ[アンケート][survey]にご参加ください。
OpenTelemetry on Mainframe SIG の活動について詳しく知りたい方は、[CNCF Slack](https://slack.cncf.io/) の [#otel-mainframes](https://cloud-native.slack.com/archives/C05PXDFTCPJ) で会話にご参加ください。

_この記事のバージョンは、Open Mainframe Project ブログに[当初掲載][originally posted]されたものです。_

[originally posted]: <{{% param canonical_url %}}>
[survey]: https://www.surveymonkey.com/r/HGTD2KJ
