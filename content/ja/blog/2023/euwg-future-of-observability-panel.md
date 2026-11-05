---
title: 'OTel End User Working Group プレゼンツ: オブザーバビリティの未来パネルディスカッション'
linkTitle: オブザーバビリティの未来パネル
date: 2023-10-21
author: >-
  [Adriana Villela](https://github.com/avillela) (Lightstep)
default_lang_commit: 9303f8245fc0b7e9f51d9b42696b7144bfef2ae1
cSpell:ignore: Dyrmishi Farfetch Iris Mellifera Nočnica Samuel Vijay youtube
---

OpenTelemetry はこの数年間で[オブザーバビリティ](/docs/concepts/observability-primer/)の状況に大きな影響を与えてきました。
テレメトリーの生成と収集にオープンな標準を導入している一方で、実際にオブザーバビリティチームの業務を改善しているものは何でしょうか。

ゲストの [David Wynn](https://www.linkedin.com/in/davidbwynn/)、
[Austin Parker](https://www.linkedin.com/in/austinlparker/)、
[Vijay Samuel](https://www.linkedin.com/in/vjsamuel/)、
[Nočnica Mellifera](https://www.linkedin.com/in/otel-mom/)、
[Iris Dyrmishi](https://www.linkedin.com/in/iris-dyrmishi-b15a9a164/) が集まり、
[OpenTelemetry End User Working Group](/community/end-user/) が主催するこのパネルで、オブザーバビリティのプラクティスの進化に関する経験と知見を共有しました。
ディスカッションは、彼らの OpenTelemetry に関する歩みと、それがオブザーバビリティのプラクティスをどのように形作ってきたかを中心に展開されました。
フルの録画をご覧ください。

{{<youtube zSeKL2-_sVg>}}

<br/>簡単なまとめとして、以下の主なディスカッションのポイントをご覧ください。

## 1- OpenTelemetry 以前のオブザーバビリティ {#1--observability-before-opentelemetry}

パネリストたちはまず、OpenTelemetry 以前の経験について語りました。
標準化の欠如、プロプライエタリなクライアントの使用、大規模で複雑なシステムの監視における困難さといった課題がありました。
オブザーバビリティのプラクティスは特定のツールや技術によって決まることが多く、断片的なソリューションにつながっていました。

[eBay](/blog/2022/why-and-how-ebay-pivoted-to-opentelemetry/) や [Farfetch](/blog/2023/end-user-q-and-a-03/) のような企業は、テレメトリーデータの標準化とベンダー非依存という特長から、OpenTelemetry の導入に価値を見出しました。

## 2- ゲームチェンジャーとしての OpenTelemetry {#2--opentelemetry-as-a-game-changer}

OpenTelemetry は、オブザーバビリティを実現するためのゲームチェンジャーとなるソリューションとして登場しました。
アプリケーションの計装に対する標準化されたアプローチを提供しました。
OpenTelemetry の導入により、さまざまなシステムや言語間でのシームレスな統合が可能になりました。
コミュニティ主導でオープンソースという OpenTelemetry の性質は多くの組織にとって魅力的であり、オブザーバビリティをより身近で開発者フレンドリーなものにしました。

## 3- OpenTelemetry Collector {#3--the-opentelemetry-collector}

パネリストたちは [OpenTelemetry Collector](/docs/collector/) について語り、ベンダー固有のエージェントを置き換えるためにどのように活用したかを話しました。
一部の組織は、[Collector Builder ツール](/docs/collector/extend/ocb/)を使用して、自分たちの要件に合わせた独自の Collector ディストリビューションを構築しました。
その結果、カスタムプロセッサーの使用を含め、自分たちのユースケースに適したコンポーネントのみを含めることができました。

## 4- OpenTelemetry 導入の意外な側面 {#4--surprising-aspects-of-opentelemetry-adoption}

[ログ](/docs/concepts/signals/logs/)などのコンポーネントがまだ安定版でない段階でチームに OpenTelemetry の導入を説得することが課題でした。
OpenTelemetry の進化する性質は、チームが遅れを取らないようにしつつ、新機能やアップデートに追いつくことを時として困難にしました。

## 5- オブザーバビリティにおける人の問題 {#5--the-people-problem-of-observability}

オブザーバビリティは、テック業界の多くの課題と同様に、技術的な問題よりも人の問題です。
OpenTelemetry の導入と実装を成功させるには、リーダーシップの賛同や開発者の受容など、文化的・組織的な課題に取り組む必要がありました。

## 参加しましょう！ {#join-us}

OpenTelemetry を組織でどのように使っているか共有したいストーリーがあれば、ぜひお聞かせください！
共有する方法はこちらです。

- [CNCF Community Slack](https://communityinviter.com/apps/cloud-native/cncf) の [#otel-endusers チャンネル](/community/end-user/#slack)に参加する
- 毎月の[エンドユーザーディスカッショングループコール](/community/end-user/#podcast)に参加する
- [OTel in Practice](/community/end-user/otel-in-practice/) セッションに参加する
- [OpenTelemetry ブログ](https://github.com/open-telemetry/opentelemetry.io/blob/954103a7444d691db3967121f0f1cb194af1dccb/README.md#submitting-a-blog-post)であなたのストーリーを共有する
- その他のセッションのご希望は、[CNCF Community Slack](https://communityinviter.com/apps/cloud-native/cncf) でお問い合わせください！

OpenTelemetry を [Mastodon](https://fosstodon.org/@opentelemetry) と [LinkedIn](https://www.linkedin.com/company/opentelemetry/) でフォローし、**#OpenTelemetry** ハッシュタグを使ってあなたのストーリーを共有してください！

さらに多くの素晴らしい OpenTelemetry コンテンツを見るために、[YouTube チャンネル](https://youtube.com/@otel-official)をぜひチャンネル登録してください！
