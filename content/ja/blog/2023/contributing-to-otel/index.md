---
title: OpenTelemetry へのコントリビューションを考えていますか？私の経験をお伝えします。
linkTitle: OTel へのコントリビューション
date: 2023-09-18
author: '[Adriana Villela](https://github.com/avillela) (Lightstep)'
canonical_url: https://medium.com/cloud-native-daily/how-to-contribute-to-opentelemetry-5962e8b2447e
default_lang_commit: 090ad2caa2efdfa003e06e82a246dc4659446e36
cSpell:ignore: EUWG
---

![夕焼けのオレンジ色の空の下、水面に沈む太陽と、手前に広がる長い草。](turks-sunset.jpg)

あなたは [OpenTelemetry](/)（OTel）を使っていますか？
OpenTelemetry にコントリビューションしたいと思ったことはあるけれど、どこから始めればいいかわからなかったことはありませんか？
それなら、ちょうどいいところに来ましたね！

自分自身の経験をもとに、この活気があり開かれたオープンソースコミュニティに参加するために私が見つけた効果的な方法について、いくつかの知見を共有したいと思います。

## オープンソースへのコントリビューションは怖い！ {#contributing-to-open-source-can-be-scary}

正直に言いましょう。
私たちのほとんどは、日々の技術的な仕事でオープンソースプロジェクトを使っています（副業かもしれませんが）。
しかし、これらのオープンソースプロジェクトに「コントリビューションする」となるとどうでしょうか？
あなたはどうかわかりませんが、私にとっては、昨年まで、オープンソースにコントリビューションするという見通しは、ただひたすら「怖い」ものでした！！
[プルリクエスト](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-pull-requests)（PR）を開くと、[自分をさらけ出すこと][you are putting yourself out there]になるわけです。
コントリビューション先のリポジトリの承認者リストに並ぶ小さな GitHub アバターたちに評価されるのですから。
怖い！

しかし、PR を開くことが怖いと思う反面、自分のコントリビューションがコードベースにマージされるのを見るのは、とても満足感があります。
そして何より、あなたのコントリビューションが他の人の役に立つのです！！
すばらしいと思いませんか？

## OTel にコントリビューションする方法 {#ways-to-contribute-to-otel}

さあ、やる気が出てきましたか？
すばらしい。
OTel にコントリビューションするいくつかの方法を見ていきましょう。

### OTel ドキュメントにコントリビューションする {#contribute-to-the-otel-docs}

OTel を使い始めたばかりですか？
オープンソースプロジェクトにコードをコントリビューションすることに少し不安を感じていますか？
大丈夫です！
OpenTelemetry（あるいはどんなオープンソースプロジェクトでも）にコントリビューションするもっとも簡単で効果的な方法の一つは、ドキュメントにコントリビューションすることです！
新しいということは不利ではないことを覚えておいてください。
むしろ、ドキュメントにとっては強みです。
OTel の世界にまだ深く入り込んでいないからこそ、新しい人は OTel のドキュメントを評価するのに最適な人物なのです！

新しい OTel のコンセプトを調べる必要があるとき、私はいつもまずドキュメントを参照します。
必要な情報がすべて書かれていることもあれば、そうでないこともあります。
そうでない場合、ドキュメント以外に情報を探す必要があり、外部のブログ記事を読んだり、技術に詳しい友人に聞いたりします。
知識のギャップを埋めることができたら、私は2つのことをします。

1. ブログを書きます。
   例として、[OTel Python Logging Auto-Instrumentation with the OTel Operator](https://medium.com/cloud-native-daily/lets-learn-about-otel-python-logging-auto-instrumentation-with-the-otel-operator-663247666570) や [Let's Learn About the OTel Operator's Target Allocator!](https://adri-v.medium.com/lets-learn-about-the-otel-operator-s-target-allocator-47a2b1f07562) をご覧ください。
2. OTel のドキュメントにコントリビューションします。
   例として、[Include docs about Python logs auto-instrumentation](https://github.com/open-telemetry/opentelemetry.io/pull/3195)、[Add troubleshooting guidance to OTel Operator auto-instrumentation docs](https://github.com/open-telemetry/opentelemetry.io/pull/3098)、[Update Python auto-instrumentation docs](https://github.com/open-telemetry/opentelemetry.io/pull/2130) をご覧ください。

> ✨ **注意:** ✨ 2番目は「特に」重要です。
> なぜなら、OTel ドキュメントがすべての OTel 情報の信頼できる情報源（Source of Truth）<sup>TM</sup>であるためにもっともよい方法は、私たちのような人がギャップを見つけたときにドキュメントにコントリビューションすることだからです。

OTel ドキュメントへの[コントリビューション](/docs/contributing/)について、詳しくはこちらをご覧ください。

> ✨ **注意:** ✨ OTel ドキュメントのコントリビューションガイドラインがわかりにくかったり、間違いがあったりする場合、それを改善するのもすばらしいコントリビューションの方法です！
> 😉

### OTel ブログに記事を書く {#write-a-post-on-the-otel-blog}

OTel にコントリビューションするもう一つのすばらしい方法は、[OpenTelemetry ブログ](/blog)にブログ記事を書くことです。
OpenTelemetry で何か面白いことをしたり、組織内で複雑な OTel の実装に取り組んだりしたことがあれば、OpenTelemetry ブログはそれをより広いコミュニティと共有するすばらしい方法です。
販売中の製品を宣伝するものでなく、読者が作業を再現するために購入する必要がないものであれば、あなたのブログ記事は大歓迎です！

私の過去のブログ記事の例をご覧いただけます。
[HashiCorp Nomad で OpenTelemetry デモアプリを動かす](/blog/2022/otel-demo-app-nomad/)。

OTel ブログへの[記事の投稿](/docs/contributing/blog/)について、詳しくはこちらをご覧ください。

### OTel エンドユーザーワーキンググループに参加する {#join-the-otel-end-user-working-group}

OTel を使い始めたばかりで、他の OTel ユーザーとつながりたいですか？
OTel コミュニティ全体と共有したいフィードバックがありますか？
それとも、より上級の OTel ユーザーとして、自分のストーリーやユースケースをコミュニティと共有したいですか？
それなら、OTel エンドユーザーワーキンググループ（EUWG）がぴったりかもしれません！
このグループは、月に数回集まる OpenTelemetry ユーザーで構成されており、以下のことを行います。

- [OTel エンドユーザーディスカッション](/community/end-user/discussion-group/)を通じてフィードバックを共有し、質問をする
- [OTel Q&A](/community/end-user/interviews-feedback/) を通じて OpenTelemetry 導入のストーリーを共有する
- [OTel in Practice（OTiP）](/community/end-user/otel-in-practice/)を通じて OpenTelemetry の特定の分野について知識を共有する

ちなみに、私は共同議長の一人です。
ちょっと言ってみただけです… 😉

[OTel EUWG](/community/end-user/) について、詳しくはこちらをご覧ください。

### OpenTelemetry デモにコントリビューションする {#contribute-to-the-opentelemetry-demo}

コードをコントリビューションしたいけれど、OTel のコアコードにコントリビューションする準備がまだできていないなら、[OTel デモ](/docs/demo/)をチェックしてみてください。
OTel デモには、複数の言語で書かれたサービスを含む分散型オンライン望遠鏡ショップアプリケーションが含まれており、OpenTelemetry で計装されています。
選んだ言語でコードを計装する方法を学ぶのにすばらしい方法です。

[OTel デモのドキュメントによると](https://github.com/open-telemetry/opentelemetry-demo#welcome-to-the-opentelemetry-astronomy-shop-demo)、デモの目的は以下のとおりです。

- OpenTelemetry の計装とオブザーバビリティを実演するために使用できる、分散システムの現実的な例を提供する。
- ベンダー、ツール開発者、その他の人々が自身の OpenTelemetry インテグレーションを拡張・実演するための基盤を構築する。
- OpenTelemetry のコントリビューターが API、SDK、その他のコンポーネントや機能強化の新しいバージョンをテストするために使用できる、生きた実例を作る。

OTel デモは[1周年を迎えたばかり](/blog/2023/demo-birthday/)で、最初のリリースから大きく成長しました。
OTel が進化するにつれて、OTel デモもそれに合わせて進化し、[OTel Collector](/docs/collector/) や言語固有の計装の最新バージョンを活用する必要があります。
つまり、やるべきことは常にあるのです！

私のコントリビューションの例をご覧いただけます。
[Integrate with existing metrics code](https://github.com/open-telemetry/opentelemetry-demo/pull/432)。

[OTel デモへのコントリビューション方法](https://github.com/open-telemetry/opentelemetry-demo/blob/59c9b2ca32be41e464fedc1eed6dcf4ad1503c3d/CONTRIBUTING.md?from_branch=main)について、詳しくはこちらをご覧ください。

### Special Interest Group に参加する {#join-a-special-interest-group}

もう少し冒険してみたいですか？
それなら、OTel の他の [Special Interest Group](https://en.wikipedia.org/wiki/Special_interest_group)（SIG）に参加してみてはいかがでしょうか？
SIG に参加すると、SDK 開発、ライブラリの自動計装、[OTel Collector](/docs/collector/)、[OTel Operator](/docs/platforms/kubernetes/operator/) などにコントリビューションできます（これらに限りません）。
定期的なコントリビューターである必要さえありません。
コントリビューションが必要性から生まれることもあります。
たとえば、Collector にバグを見つけたとしましょう。
修正に挑戦してみてはどうでしょうか？
または、あなたとチームがどうしても必要な機能があるかもしれません。
それも、実装に挑戦してみてはどうでしょうか？

さて、コードを書き始める前に、以下のことを確認してください。

1. [適切な GitHub リポジトリ](https://github.com/open-telemetry)にイシューを立てる
2. [Slack](https://communityinviter.com/apps/cloud-native/cncf) でその機能が必要とされている/望まれているか確認する
3. [SIG のコール](https://shorturl.at/beJ09)に参加して、あなたの具体的な関心やニーズを共有する

OTel へのコードのコントリビューションが簡単だとは思っていません。
まったくそうではありません。
コードをコントリビューションすることになった場合、一人で行うストレスや学習曲線を軽減する一つの方法は、意欲的な OTel コミュニティメンバーとペアを組んでこうしたコード変更を実装することです。
OTel のコミュニティの人々は、とても親切で温かいと感じています。

私のコントリビューションの例をご覧いただけます。
[Specify gRPC endpoint in otlp receiver config](https://github.com/open-telemetry/opentelemetry-helm-charts/pull/531)。

[OTel SIG](/community/#special-interest-groups) について、詳しくはこちらをご覧ください。

### おわりに {#final-thoughts}

ここまで見てきたように、OpenTelemetry にコントリビューションする方法はたくさんあります。
ドキュメントへのコントリビューション、ブログの執筆、エンドユーザーワーキンググループへの参加、OTel デモへのコントリビューション、SIG への参加などです。

でも待ってください。まだあります！
「公式」の OpenTelemetry チャネル（つまり GitHub と Slack）以外でも、OpenTelemetry にコントリビューションできます。
OpenTelemetry について講演したり、ポッドキャストに出て OpenTelemetry を広めたり、友人や家族に OpenTelemetry のことを話したり…他にもたくさん！
どんなことでも力になります！

小さなコントリビューションなんてありません。
なぜなら、一つ一つの積み重ねが、OpenTelemetry をすばらしいものにする助けになるからです。

最後に、私は常に OTel についての発見や気づきをブログに書くことをお勧めしています。
もちろん、私もそうしています。
しかし、これらの知見を OTel のドキュメントやブログに直接コントリビューションすることで共有してください。
そうすることで、信頼できる唯一の情報源を維持でき、OTel の初心者でも上級者でも、すべての人が恩恵を受けられるようになります。

[you are putting yourself out there]: https://open.spotify.com/episode/5YrBEsXoJV3UjrHRrLRqBP?si=BpWISRD0SLytJF-vJ02sSA
