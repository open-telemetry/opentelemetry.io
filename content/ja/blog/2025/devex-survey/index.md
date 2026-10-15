---
title: OpenTelemetry 開発者エクスペリエンスサーベイからの知見
linkTitle: 開発者エクスペリエンスサーベイからの知見
date: 2025-04-02
author: >
  [Tristan Sloughter](https://github.com/tsloughter) (MyDecisiveAI), [Juliano
  Costa](https://github.com/julianocosta89) (Datadog), [Steve
  Gordon](https://github.com/stevejgordon) (Elastic), [Damien
  Mathieu](https://github.com/dmathieu) (Elastic)
sig: Developer Experience
default_lang_commit: afdc2889da4a7cb97a858914baa3776bf0b16121
cSpell:ignore: OTTL Sloughter
---

OpenTelemetry Developer Experience SIG は先日、SIG が開発者エクスペリエンスの改善に最もインパクトを与えられる領域を把握するため、コミュニティに対してサーベイを実施しました。
218件の回答が寄せられ、SIG 内の作業の優先順位付けに活用していきます。
この記事ではサーベイの結果を要約し、短期的に注力する領域を紹介します。

サーベイに参加してくださったすべての方に感謝します！
この取り組みへの参加や、OpenTelemetry の開発者エクスペリエンス改善に関する追加のご意見がありましたら、お気軽にご連絡ください。
SIG の連絡先情報は、コミュニティリポジトリの[横断 SIG 一覧](https://github.com/open-telemetry/community/?tab=readme-ov-file#cross-cutting-sigs)に記載されています。
また、GitHub 上に私たちの[リポジトリ](https://github.com/open-telemetry/sig-developer-experience)もあります。

## 主なポイント {#key-takeaways}

サーベイの回答からは、ドキュメントの改善、より詳細なサンプル、そして本番環境での OpenTelemetry のデバッグ、設定、デプロイに関するより充実したガイダンスが必要であることが浮き彫りになりました。
以下が主な懸念領域です。

- ドキュメント：
  - ドキュメントをたどるのが難しく、OpenTelemetry ウェブサイトと GitHub リポジトリを行き来する必要があります。
    多くのユーザーが、さまざまな情報源から情報をつなぎ合わせなければならないと報告しています。
  - SDK と Collector の両方について、本番環境での使用例が不足しています。
- ローカルデバッグ：
  - エクスポートがなぜ動作しないのか、SDK がデータをドロップしているのかどうかを把握するのが難しい状況です。
    ローカルデバッグ用のツールが改善されれば、トラブルシューティングに役立つでしょう。
- SDK の設定：
  - 全体的な複雑さ（設定とコンセプトの両方）
  - SDK の設定は複雑で、多くのユーザーがエクスポーターのトラブルシューティングが最も苦痛な部分だと指摘しています。
- Collector の運用：
  - Collector の設定とそのコンポーネントに関するデバッグガイダンスが必要です。
    OTTL はトラブルシューティングが難しいとして、複数回言及されました。

## 詳細な知見 {#detailed-insights}

### 回答者の概要 {#general-information-about-respondents}

サーベイの回答は、大多数が本番環境で OpenTelemetry を使用しており（83%）、ベンダーに勤務していない（77.4%）ユーザーから寄せられました。
82%が、自分の組織はオブザーバビリティの取り組みにおいて中級または上級段階にあると考えています。

使用プラットフォームは Kubernetes（68.2%）と AWS（34.6%）が多く、ベアメタルも相当な割合（12%）を占めています。

プログラミング言語の使用状況は、Go、Java、JavaScript、Python、.NET といった主要な言語に分散していましたが、幅広い広がりを見せており、以下の2つ目のグラフに示すように、公式の API/SDK 実装がない言語も含まれていました。

バックエンドやオペレーションに携わる人々が回答者の大多数を占めましたが、3つ目のグラフに示すように、モバイルやブラウザの開発者も含まれていました。

![フォーム回答チャート。質問タイトル：あなたの組織はオブザーバビリティの取り組みのどの段階にありますか？](image3.png)

![フォーム回答チャート。質問タイトル：どのプラットフォームで OpenTelemetry を実行していますか？](image11.png)

![フォーム回答チャート。質問タイトル：OpenTelemetry でどのプログラミング言語を使用していますか？](image7.png)

![フォーム回答チャート。質問タイトル：普段どのような種類のサービスに携わっていますか？](image9.png)

### ドキュメント {#documentation}

結果から、OpenTelemetry を使い始める際の初日の情報について、圧倒的にウェブサイトと言語の GitHub リポジトリから取得しており、それぞれ75.1%と43.8%でした。
一方、25.1%がベンダーのドキュメントから始めていました。
しかし、手動計装、自動計装、SDK のセットアップに関する3つの質問では、不明確なドキュメントがいずれも最も多い回答でした。
Collector の場合は、「プロセッサーの設定」に次いで2番目でした。

ドキュメントに関するユーザーエクスペリエンスの詳細は、End User SIG が実施した[サーベイ](/blog/2024/otel-docs-survey/)の結果に記載されています。

### Collector の使用状況 {#collector-usage}

Collector の導入は比較的簡単な傾向がありましたが、Collector の運用上の問題に関する質問や全体的なエクスペリエンスに関する質問の結果から、導入と、より複雑なパイプラインや大規模なデプロイメントでの運用との間にギャップがあることは明らかです。
この点については、今後の計画のセクションで詳しく説明します。

興味深いことに、「どの Collector を使用していますか？」という質問への回答では、_collector-contrib_ が大きな割合を占めていました。
残念ながら、これがカスタムイメージのビルド用の OCB（[https://github.com/open-telemetry/opentelemetry-collector/tree/main/cmd/builder](https://github.com/open-telemetry/opentelemetry-collector/tree/d25efc7e2f31a3ba5347d0725a22d7bed1b4015d/cmd/builder?from_branch=main)）を知らないためなのか、使用に興味がないためなのか、あるいはその使い方に関する十分なドキュメントが不足しているためなのかは不明です。

![フォーム回答チャート。質問タイトル：OpenTelemetry Collector の運用を開始するのはどの程度複雑でしたか？](image10.png)

![フォーム回答チャート。質問タイトル：OpenTelemetry Collector をどのような環境で使用していますか？](image6.png)

![フォーム回答チャート。質問タイトル：どの Collector ディストリビューションを使用していますか？](image4.png)

### SDK と計装 {#sdk-and-instrumentation}

手動計装と SDK の導入は、やや難しい傾向がありました。
一方、自動計装はかなり簡単に始められる傾向がありました。
自動計装の導入は比較的簡単であったにもかかわらず、そのテレメトリーを充実させることはより難しいという結果が示されました。

![フォーム回答チャート。質問タイトル：使用している言語で OpenTelemetry SDK を直接使用していますか、それともベンダー SDK 経由で使用していますか？](image1.png)

![フォーム回答チャート。質問タイトル：OpenTelemetry でアプリケーションを手動計装するのはどの程度複雑でしたか？](image8.png)

![フォーム回答チャート。質問タイトル：OpenTelemetry SDK の導入はどの程度複雑でしたか？](image2.png)

![フォーム回答チャート。質問タイトル：自動計装の導入はどの程度複雑でしたか？](image5.png)

### デバッグ {#debugging}

サーベイの最後の質問「開発者エクスペリエンスを改善するために何を変更できるか？」への回答に共通するテーマは、実行中のアプリケーションから出力されるすべてのテレメトリーをローカルで確認できる、セットアップが容易なローカル環境への要望でした。
加えて、開発中および本番環境において、データがドロップされているときやエクスポーターの設定が誤っているときなど、何か問題が生じた際に SDK からより多くの情報を得たいという要望もありました。

## 今後の計画 {#future-plans}

回答してくださった方々からの結果は、OpenTelemetry の開発者エクスペリエンスを改善していく上で非常に貴重なリソースです。
このフィードバックの一部をそれぞれの SIG に共有し、ソリューションのプロトタイピングに取り組み、他のチームとフォローアップしていきます。

サーベイに参加してくださったすべての方に改めて感謝します！
サーベイは終了しましたが、引き続きフィードバックを歓迎しています。
追加情報の提供や私たちへの参加をご希望の場合は、[Slack または毎週のミーティング](https://github.com/open-telemetry/community/?tab=readme-ov-file#cross-cutting-sigs)からお気軽にご連絡ください。
