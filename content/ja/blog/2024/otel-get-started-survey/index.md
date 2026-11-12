---
title: OpenTelemetry 入門アンケートからの洞察
linkTitle: OpenTelemetry 入門アンケート
date: 2024-06-19
author: '[Ana Margarita Medina](https://github.com/AnaMMedina21) (ServiceNow)'
issue: 4662
sig: End User SIG
default_lang_commit: 9c32e973d7dd7fa0ec965d45a20954b7a4a613b2
---

新しいテクノロジーを使い始めるのは大変なことです。
だからこそ、私たちはエンドユーザーの状況に合わせて支援するよう努めています。
その目標の一環として、[OpenTelemetry エンドユーザー SIG](/community/end-user/) はコミュニティに対してアンケートを実施し、ユーザーが OpenTelemetry を使い始める際にどのように支援できるかを調査しました。
寄せられた104件の回答は、コミュニティおよびベンダーからのイネーブルメントコンテンツの改善に役立てられます。

ぜひ結果をご覧ください！

## 主な要点 {#key-takeaways}

- OTel の経験レベルにかかわらず、回答者は以下を求めています。
  1. 包括的なドキュメント（回答者の67.3%）。
  2. 計装のリファレンス実装（回答者の65.3%）。
  3. 詳細なチュートリアル（回答者の63.4%）。
- 回答者の多くはコンテナ技術を使用しており、79.8%が Kubernetes を、63.5%が Docker を使用しています。
- 回答者の83%超が、トレース仕様、計装 API および SDK、メトリクス仕様が OTel の導入過程において最も重要な要素であると回答しました。

## 詳細な分析 {#detailed-insights}

### Q: オブザーバビリティの導入にあたり、どのようなテクノロジーを使用していますか？ {#q-what-technologies-are-you-using-when-setting-up-your-observability-journey}

104人の回答者のうち、ほとんどがコンテナを使用しています。
79.8%が Kubernetes を、63.5%が Docker を使用しています。

![使用されているテクノロジーを示すグラフ](1-technologies-used.png)

### Q: あなたの組織はオブザーバビリティ導入のどの段階にいますか？ {#q-where-in-your-observability-journey-is-your-organization}

104人の回答者のうち:

- 25%は初心者で、オブザーバビリティについて学んでいるか、監視ツールを使用したことがあります。
- 49%は中級者で、オブザーバビリティのプラクティスを構築中です。
- 26%は上級者で、確立されたオブザーバビリティのプラクティスを持っています。

![オブザーバビリティ導入の段階を示すグラフ](2-level.png)

### Q: あなたの組織ではどのようなプログラミング言語を使用していますか？ {#q-what-languages-are-you-using-in-your-organization}

[JavaScript](/docs/languages/js/)、[Java](/docs/languages/java/)、[Go](/docs/languages/go/)、[Python](/docs/languages/python/) が最も広く使用されている言語です。
これらは回答者の50%超に使用されています。

[その他の言語](/docs/languages/other/)としては、Scala、TypeScript、[Erlang/Elixir](/docs/languages/erlang/)、Perl、R、Lua、Matlab、Julia、Haskell、COBOL、Kotlin、SAS が挙げられました。

![使用されている言語を示すグラフ](3-languages.png)

### Q: OpenTelemetry を始めるにあたり、どのようなリソースがあればよかったと思いますか？ {#q-what-resources-do-you-wish-you-had-when-getting-started-with-opentelemetry}

オブザーバビリティ導入の段階に応じて、回答者が好むリソースは異なります。

- オブザーバビリティについて学んでいる人やオブザーバビリティのプラクティスを構築中の人は、包括的なドキュメントおよび詳細なチュートリアルや動画を求めています。
- 確立されたオブザーバビリティのプラクティスを持つ人は、計装のリファレンス実装と包括的なドキュメントを好んでいます。

![求められているリソースを示すグラフ](4-resources.png)

### Q: OTel の導入過程において、プロジェクトのどの部分が最も重要ですか？ {#q-what-part-of-the-project-is-most-important-to-you-in-your-otel-journey}

回答者の多くは、[トレース仕様](/docs/specs/otel/trace/api/)、[計装 API および SDK](/docs/languages/)、[メトリクス仕様](/docs/specs/otel/metrics/api/)が最も重要であると回答しました。

![最も重要な要素を示すグラフ](5-importance.png)

## もっと詳しく {#learn-more}

アンケート結果をより詳しく確認するには、[結果](https://github.com/open-telemetry/sig-end-user/tree/e834e9da4494b626d1e4a4936fba31563b37b607/end-user-surveys/getting-started?from_branch=main)をご覧ください。

## お問い合わせ {#keep-in-touch}

アンケートにご参加いただいた皆さま、ありがとうございました！
OpenTelemetry の今後の開発を導き、進化するニーズに応え続けるために、皆さまのフィードバックを頼りにしています。
今後のアンケートは以下のチャネルで告知します。

- [#otel-sig-end-user Slack チャンネル](https://cloud-native.slack.com/archives/C01RT3MSWGZ) – こちらからお問い合わせいただくことも可能です！
- [エンドユーザーリソースページ](/community/end-user/)。
