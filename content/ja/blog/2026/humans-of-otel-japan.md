---
title: The Humans of OpenTelemetry - KubeCon Japan 2026
linkTitle: Humans of OTel Japan 2026
date: 2026-10-15
author: >-
  [Yoshi Yamaguchi](https://github.com/ymotongpoo) (Grafana Labs)
sig: End User SIG
default_lang_commit: 5c42532e37db75bdd0ffbf158ff088fb774f4492
drifted_from_default: true
# prettier-ignore
cSpell:ignore: chikahisa fujikane kohei loglass mikata mixi ohira okamoto sugimoto yoshi yoshiki yuzuru
---

[Humans of OpenTelemetry](/blog/2025/humans-of-otel-eu/) の第5弾をお届けします。
今回は初めて日本からです！
KubeCon + CloudNativeCon Japan 2026 の横浜会場で、日本のクラウドネイティブコミュニティから OpenTelemetry のエンドユーザーや実践者にインタビューし、OTel にどのように関わるようになったかを聞きました。

- [Yuzuru Ohira](https://github.com/yuzujoe) (LayerX)
- [Mikata Chikahisa](https://github.com/chmikata) (Loglass)
- [Yoshiki Fujikane](https://github.com/ffjlabo) (CyberAgent)
- [Takashi Okamoto](https://github.com/okamototk) (NTT DATA)
- [Kohei Sugimoto](https://github.com/kohbis) (MIXI)

インタビューは日本語で行われ、以下の書き起こしは英語に翻訳されたものです。
録画は公開され次第、この記事に追加します。

これまで OpenTelemetry に貢献してくださったすべての方々に感謝します。
2026年以降も皆さんの継続的な貢献を楽しみにしています！🎉

## 書き起こし {#transcript}

皆さんのお話を紹介します。

### 1- OTel の人々を紹介 {#1--meet-the-humans-of-otel}

**YUZURU OHIRA:** 大平 譲と申します。
LayerX でエンジニアリングマネージャーをしています。

**MIKATA CHIKAHISA:** 三方と申します。
Loglass で SRE をしています。

**YOSHIKI FUJIKANE:** 藤兼 義樹と申します。
プラットフォームエンジニアとして働いています。

**TAKASHI OKAMOTO:** 岡本 隆史と申します。
NTT DATA で AI ストラテジストをしています。

**KOHEI SUGIMOTO:** 杉本 康平と申します。
MIXI で SRE をしています。

### 2- OpenTelemetry にどのように関わるようになりましたか？ {#2--how-did-you-get-involved-in-opentelemetry}

**YUZURU OHIRA:** 以前オブザーバビリティの企業に勤めていて、そこで OpenTelemetry に携わっていました。
現在の会社でも実際に OpenTelemetry を使い続けることで、引き続き関わっています。

**MIKATA CHIKAHISA:** Grafana スタックを導入するプロジェクトがあり、それが OpenTelemetry との最初の出会いでした。

**YOSHIKI FUJIKANE:** 社内で運用しているプラットフォームのオブザーバビリティを向上させるために、Datadog などの SaaS ツールを使っています。
今はとくに OpenTelemetry Collector を採用したい段階にあります。
現在は評価フェーズにいて、その評価のために使い始めたのが関わるきっかけでした。

**TAKASHI OKAMOTO:** オブザーバビリティに最初に取り組んだ頃は、各ベンダーがそれぞれ異なるやり方をしていましたが、OpenTelemetry で標準化されました。
これは素晴らしいと思い、それが関わるきっかけになりました。

**KOHEI SUGIMOTO:** オブザーバビリティの SaaS 製品を使っている中で、もっと自分たちに合うものを探していたところ、OpenTelemetry に出会いました。

### 3- オブザーバビリティの意味とは？ {#3--what-is-the-meaning-of-observability}

**YUZURU OHIRA:** 私にとっては、システムアーキテクチャの一部です。
書くコードのアーキテクチャの一部として設計するものです。

**MIKATA CHIKAHISA:** システムの健全性を示すために欠かせない情報だと考えています。

**YOSHIKI FUJIKANE:** オブザーバビリティは、システムを運用するうえで欠かせない鍵の一つです。
さまざまな規模のサービスを開発していくと、年月が経つにつれてそれらのサービスに関する知識は薄れていきます。
それでも、システムからシグナルを継続的に収集し、ブラックボックスとしてシステムを理解するために活用できることに、運用の観点から価値を感じています。
その意味で、オブザーバビリティは本当に必要なものだと感じています。

**TAKASHI OKAMOTO:** オブザーバビリティは、システムの中をすべて見渡せるのぞき穴のようなものです。
悪いところも良いところも見えます。

**KOHEI SUGIMOTO:** 自分のシステムを正しく理解し、正しい方向に改善するための手段だと考えています。

### 4- あなたにとって OpenTelemetry とは？ {#4--what-is-opentelemetry-to-you}

**YUZURU OHIRA:** OpenTelemetry は、オブザーバビリティを設計する際の最も基本的な考え方です。
私にとっては教科書のようなもので、自分の実装を構築する際に OpenTelemetry の実装を参照しています。

**MIKATA CHIKAHISA:** システムの健全性を表現するための標準的なルールや仕様だと考えています。

**YOSHIKI FUJIKANE:** 私にとって OpenTelemetry とは？
これは本当に難しい質問です。
今の私にとっては、実験してみたくなる魅力的なものです。

**TAKASHI OKAMOTO:** OpenTelemetry は、あののぞき穴にデータを送り込むものです。
メトリクス、ログ、トレースなど、あらゆるデータを運びます。
つまりパイプです。
「穴」と呼んだら失礼なので、パイプですね。

**KOHEI SUGIMOTO:** オブザーバビリティには多くの困難が伴いますが、OpenTelemetry はその中で指針を与えてくれるものだと思います。

### 5- お気に入りのテレメトリーシグナルは？ {#5--what-is-your-favorite-telemetry-signal}

**YUZURU OHIRA:** トレーシングが大好きです。

**MIKATA CHIKAHISA:** トレースです。
トレースはすべての基盤であり、最初の、最も重要なコア部分だと信じているので、とても好きです。

**YOSHIKI FUJIKANE:** お気に入りのシグナルはトレースです。
個人的に、システムがどのように動いているかを学ぶのがとても楽しいので、システム内部でどんな動作が起きて、その結果何が起きたかを教えてくれるシグナルが自分に合っています。
だからトレースを選びました。

**TAKASHI OKAMOTO:** シグナルそのものというよりは、最近 AI エージェントのオブザーバビリティに取り組んでいるので、[生成 AI セマンティック規約](/docs/specs/semconv/gen-ai/)が好きです。

**KOHEI SUGIMOTO:** メトリクスです。
多くの種類のテレメトリーデータの中で、メトリクスは他のデータをうまく吸収し、コストの最適化や集約などに貢献できます。

## おわりに {#wrapping-up}

KubeCon + CloudNativeCon Japan からの初めての Humans of OpenTelemetry でした。
それぞれが異なるきっかけで OpenTelemetry に関わるようになりました。
オブザーバビリティベンダーでの勤務、Grafana スタックの導入、Collector の評価、ベンダー間の共通標準への期待、そして SaaS ツールよりも合うものの探求です。
5人のうち3人がトレースをお気に入りのシグナルに挙げ、メトリクスと生成 AI セマンティック規約にも支持がありました。

Yuzuru、Mikata、Yoshiki、Takashi、Kohei の皆さん、ストーリーを共有していただきありがとうございました。
今後のイベントでも、日本から Humans of OpenTelemetry をお届けできることを楽しみにしています！

## ご参加ください！ {#join-us}

あなたの組織で OpenTelemetry をどのように使っているかのストーリーがあれば、ぜひお聞かせください！
共有方法は以下の通りです。

- [CNCF Community Slack](https://communityinviter.com/apps/cloud-native/cncf) の [#otel-sig-end-user チャンネル](https://cloud-native.slack.com/archives/C01RT3MSWGZ)に参加する
- [OTel in Practice](/community/end-user/otel-in-practice/) セッションに参加する
- [OpenTelemetry ブログ](/docs/contributing/blog/)でストーリーを共有する
- あなたの経験に基づいた[ブループリントやリファレンス実装](/docs/guidance/#how-to-contribute)を提案する
- その他ご希望のセッション形式がありましたら、[CNCF Community Slack](https://communityinviter.com/apps/cloud-native/cncf) でお問い合わせください！

OpenTelemetry を [Bluesky](https://bsky.app/profile/opentelemetry.io)、[Mastodon](https://fosstodon.org/@opentelemetry)、[LinkedIn](https://www.linkedin.com/company/opentelemetry/) でフォローし、**#OpenTelemetry** ハッシュタグを使ってストーリーを共有してください！

そして、[YouTube チャンネル](https://youtube.com/@otel-official)の登録もお忘れなく。
素晴らしい OpenTelemetry コンテンツがもっとあります！
