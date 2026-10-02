---
title: コントリビューション
aliases: [/docs/contribution-guidelines]
sidebar_root_for: self
weight: 980
cascade:
  chooseAnIssueAtYourLevel: |
    自分の OpenTelemetry に関する**経験**と**理解**のレベルに合った[イシューを選択][choose an issue]してください。
    自分の能力を超えたイシューに取り組むことは避けてください。
  _issues: https://github.com/open-telemetry/opentelemetry.io/issues
  _issue: https://github.com/open-telemetry/opentelemetry.io/issues?q=state%3Aopen%20label%3A
default_lang_commit: 0a410d00f789607f64e6e71b785b9c027305117b
---

## 関心をお寄せいただきありがとうございます！ {#thank-you-for-your-interest}

OpenTelemetry へのコントリビューションに関心をお寄せいただきありがとうございます。
コントリビューターは OpenTelemetry を支えており、すべてのコントリビューションがコミュニティ全体のプロジェクト改善に役立ちます。

ここでは、コントリビューションを始めるためのアドバイスをいくつか紹介します。

- **必要に迫られたコントリビューションも歓迎します。**
  定期的にコントリビュートしてくださる方ももちろんありがたいですが、Collector のバグを見つけたときや、チームが必要とする機能を開発したいときなど、必要に迫られてコントリビュートすることもまったく問題ありません。

- **ギャップを見つけたら、それも立派なコントリビューションです。**
  OpenTelemetry は大規模なプロジェクトであり、コントリビューターやメンテナーが最善を尽くしても、ドキュメントや機能のギャップは避けられません。
  気づいたことがあれば、イシューを作成するか修正を送ることが意義あるコントリビューションになります。

- **返信にはお時間をいただく場合があります。**
  コントリビューターやメンテナーはプライベートの時間に OpenTelemetry に取り組んでいることが多く、複数のタスクを同時に抱えていることも少なくありません。
  すぐに返答がなくても気にしないでください。

- **OTel の専門家である必要はありません。**
  あなたが持っている既存のスキルと実務での経験がそのまま役に立ちます。
  SRE、DevRel、英語を母語としない方など、多様な視点がプロジェクトに積極的に貢献します。

### <i class='far fa-exclamation-triangle text-warning '></i> 初めてのコントリビュートですか? {#first-time-contributing}

- 以下のラベルが付いた**[イシューを選択][choose an issue]**してください。
  - [Good first issue](<{{% param _issue %}}%22good%20first%20issue%22>)
  - [Help wanted](<{{% param _issue %}}%22help%20wanted%22>)

  > [!WARNING] イシューはアサインしません
  >
  > メンターシップやオンボーディングプロセスの一部として確認されている場合を除き、[OpenTelemetry organization][org] にまだコントリビューションをしていない方には、イシューを***アサインしません***。
  >
  > [org]: https://github.com/open-telemetry

- {{% param chooseAnIssueAtYourLevel %}}

- [生成 AI コントリビューションポリシー](pull-requests#using-ai)をお読みください。

- [#opentelemetry-new-contributors](https://cloud-native.slack.com/archives/C09H3MNMBQV) Slack チャンネルに参加して、開発のエチケットを学び、他の新しいコントリビューターとつながりましょう。

- ほかのイシューやより大きな変更に取り組みたい場合は、[まずメンテナーと相談][discuss it with maintainers first]してください。

[discuss it with maintainers first]: issues/#fixing-an-existing-issue

## 今すぐ飛び込んでみよう! {#jump-right-in}

何がしたいですか?

- タイプミスやその他の簡単な修正を行う場合は、[GitHub を利用したコンテンツの提出](pull-requests/#changes-using-github)を確認してください
- ホームページアナウンスを追加または更新する場合は、[ホームページアナウンス](/site/build/announcements/)を確認してください
- より重要なコントリビューションを行う場合は、このセクション内の以下のページからお読みください。
  - [前提条件][Prerequisites]
  - [イシュー][issues]
  - [コンテンツの提出][Submitting content]

[Prerequisites]: prerequisites/
[Submitting content]: pull-requests/

## 何にコントリビュートできる? {#what-can-i-contribute-to}

OpenTelemetry は多くの参加方法がある大規模なプロジェクトです。
ドキュメントは参入ポイントの一つですが、それだけではありません。

### ドキュメント {#documentation}

OpenTelemetry ドキュメントコントリビューターは以下を行えます。

- 既存コンテンツの改善または新しいコンテンツの作成。
- [ブログ記事の作成](blog/)またはケーススタディ。
- OpenTelemetry Registry の追加または更新。
- サイトをビルドするコードの改善。

このページの本セクションは、OpenTelemetry **ドキュメント**へのコントリビュート方法について説明します。

### コードのコントリビューション {#code-contributions}

OpenTelemetry プロジェクトへのコードのコントリビュートの手引には、コミュニティの [OpenTelemetry New Contributor Guide][] を参照ください。
言語の実装、Collector、規約の各 [OTel リポジトリ][org]には、それぞれ独自のプロジェクト固有のコントリビュートガイドがあります。

[OTel Demo](https://github.com/open-telemetry/opentelemetry-demo) は、コードのコントリビューションに挑戦したい場合の良い出発点です。
15以上のサービスが複数の言語にまたがっており、実際の分散システムにおける計装の動作を具体的に体験できます。

### SIG への参加 {#sig-participation}

Special Interest Group（SIG）への参加は、OTel にコントリビュートするもっとも効果的な方法の一つです。
SIG はプロジェクトの特定の領域に焦点を当てており、言語固有の SDK、Collector、エンドユーザー、コントリビューター体験などを扱います。

SIG への参加は以下の点で役立ちます。

- OpenTelemetry プロジェクトの中の小規模で焦点を絞ったセクションにおける現在の優先事項を把握する
- メンテナー、承認者、他のコントリビューターとつながる
- 自分のトピックを持ち込み、プロジェクトの方向性を決める手助けをする

[OTel community リポジトリ](https://github.com/open-telemetry/community#specification-sigs)に、すべてのアクティブな SIG がカレンダー招待および Slack チャンネルのリンクとともに掲載されています。

### コミュニティ {#community}

OTel へのコントリビューションは、コードやドキュメントを書くことに限定されるものではありません。
以下のような方法もあります。

- SIG ミーティングで議事録のボランティアをする
- KubeCon の OpenTelemetry Contributor Day など、コミュニティイベントの開催を手伝う
- [ローカリゼーションの取り組み](localization/)にコントリビュートし、さまざまな言語の開発者が OTel にアクセスしやすくなるよう支援する
- [End-User SIG](https://cloud-native.slack.com/archives/C01RT3MSWGZ) に参加して実務経験を共有する、または [OTel Me](https://www.youtube.com/playlist?list=PLVYDBkQ1TdywIl9xKEo5_u7zlwY38dW43) や [OTel in Practice](https://www.youtube.com/playlist?list=PLVYDBkQ1TdyxKgdGE4ThYLkNRCuLLYy9x) などのコミュニティポッドキャストにコントリビュートする

[choose an issue]: issues/#fixing-an-existing-issue
[issues]: issues/
[OpenTelemetry New Contributor Guide]: https://github.com/open-telemetry/community/blob/main/guides/contributor
