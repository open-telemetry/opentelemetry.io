---
title: OpenTelemetry in Focus、2023年1月
linkTitle: OTel in Focus 2023/01
date: 2023-01-31
author: '[Austin Parker](https://github.com/austinlparker)'
default_lang_commit: 17662c24ee2f9789a70287c4ad02707582e3de98
---

_OpenTelemetry In Focus_ の第1回へようこそ！
このブログは、重要なリリース、ロードマップの更新、コミュニティニュースの概要をお届けすることを目的としています。
このシリーズでは、仕様、データフォーマット、ツール、そして最も人気のある API/SDK といったコアコンポーネントに焦点を当てていきます。

ここで取り上げてほしいことがあるメンテナーの方は、[Austin Parker にメール](mailto:austin@lightstep.com)、または [CNCF Slack の #otel-comms](https://cloud-native.slack.com/archives/C02UN96HZH6) チャンネルでご連絡ください。

## リリースと更新 {#releases-and-updates}

新年、新コード！
以下のリポジトリが今月新しいバージョンをリリースしました。
各リリースの詳細については、完全なリリースノートをご確認ください。

- [Specification v.1.17.0](https://github.com/open-telemetry/opentelemetry-specification/releases/tag/v1.17.0) がリリースされました！
  Jaeger エクスポーターの非推奨通知、ヒストグラムデータモデルの安定版、セマンティック規約の変更、その他いくつかの変更が含まれています。
- [Go v1.12.0/v0.35.0](https://github.com/open-telemetry/opentelemetry-go/releases/tag/v1.12.0) は、セマンティック規約とメトリクス計装の更新という重要なリリースに加え、いくつかのバグ修正やその他の重要な変更を含んでいます。
- [JavaScript](https://github.com/open-telemetry/opentelemetry-js/releases) は、API の v1.4.0、コアの v.1.9.0、実験的パッケージの v0.35.0 をリリースしました！
  これらのリリースには、トレーシングにおけるクロックドリフトに関する重要なバグ修正、その他の非推奨化と機能強化が含まれています。
- [Java v1.22.0](https://github.com/open-telemetry/opentelemetry-java/releases/tag/v1.22.0) には、エクスポーターに関するいくつかの修正と機能強化、およびその他の使いやすさと正確性に関する修正が含まれています。
  さらに、[Java agent v1.22.1](https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/tag/v1.22.1) がコア API および SDK に合わせてリリースされ、Spring Web MVC、JMS 3.0（Jakarta）、Spring JMS 6.0 の新しい計装が追加されています。
- [Operator v0.68.0](https://github.com/open-telemetry/opentelemetry-operator/releases/tag/v0.68.0) は、新しい OpAMP Bridge サービスと OpenShift クラスターへのデプロイを可能にする修正、およびその他のバグ修正を含んでいます。
- [Collector v1.0.0 (RC4)](https://github.com/open-telemetry/opentelemetry-collector/releases/tag/v0.70.0) および [Collector Contrib v0.70.0](https://github.com/open-telemetry/opentelemetry-collector-contrib/releases/tag/v0.70.0) が、Collector Builder でのコネクターサポートを含む大幅な変更とともにリリースされました。
- [Demo v1.3.0](https://github.com/open-telemetry/opentelemetry-demo/releases/tag/1.3.0) がリリースされ、メトリクスエグザンプラーのサポート、リソース検出の強化、OpenTelemetry API および SDK の更新が含まれています。

## プロジェクトの更新 {#project-updates}

ここ数か月の間に、対面およびオンラインでのコミュニティでの議論を通じて、新しい公開[ロードマップ](/community/roadmap/)が作成・公開されました！
このロードマップは、確定された優先事項のリストではなく、私たちの優先事項と優先順位付けのガイドとして意図されています。

AWS Lambda やその他の FaaS（Functions-as-a-Service）ワークロードに関心があり、それらから OpenTelemetry データを送信する方法を知りたい方へ。
[FaaS ワーキンググループ](https://github.com/open-telemetry/community#implementation-sigs)がこの問題に取り組むために活動を再開しました。
ミーティングに参加するか、[ノートを確認](https://docs.google.com/document/d/187XYoQcXQ9JxS_5v2wvZ0NEysaJ02xoOYNXj08pT0zc/)して、詳細をご覧ください。

[エンドユーザーワーキンググループ](/blog/2023/end-user-discussions-01)が、今月のディスカッションのまとめを公開しました。
OpenTelemetry のユーザーの方にとって、これらのミーティングは同じユーザー同士でつながり、プロジェクトの活用方法について議論するのに最適な場です。

## ニュースと今後のイベント {#news-and-upcoming-events}

KubeCon EU 2023 の一部として、[Observability Day Europe](https://events.linuxfoundation.org/kubecon-cloudnativecon-europe/cncf-hosted-co-located-events/observability-day/) をサポートできることを誇りに思います。
KubeCon のためにアムステルダムに行く予定の方は、ぜひ1日早く来て、OpenTelemetry のコントリビューターやメンテナーと交流しましょう！
