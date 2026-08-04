---
title: The Humans of OpenTelemetry
linkTitle: Humans of OTel
date: 2023-12-22
author: '[Adriana Villela](https://github.com/avillela) (Lightstep)'
default_lang_commit: de831c090fcae11c643908504392583cbebb09ea
# prettier-ignore
cSpell:ignore: alex aronoff bogdan boten caramanolis constance drutu jacob juraci kanal kröhling paixāo purvi tyler villela yahn youtube
---

OpenTelemetry にとって、なんて素晴らしい一年だったのでしょう！
[OTel デモが1周年を迎え](/blog/2023/demo-birthday/)、
[OpenTelemetry プロジェクトは OpenTelemetry 仕様の一般提供を発表し](https://youtu.be/OEGgmTNfYsU?si=ZdjNwLbGTrWIVs1D&t=288)、
[トレースベースのテストが OTel デモに追加され](/blog/2023/testing-otel-demo/)、
いくつかのエキサイティングな [OTel](/blog/2023/tyk-api-gateway/) [インテグ](/blog/2023/cloud-foundry/)[レーション](/blog/2023/otterize-otel/)が登場しました。
そして忘れてはいけないのが、2023年には Observability Day が1回ではなく2回も開催されたことです。
1回目は[アムステルダムでの KubeCon Europe](https://shorturl.at/osHRX)、2回目は[シカゴでの KubeCon North America](https://shorturl.at/kAEQX) です。
これらはハイライトのほんの一部にすぎません！
その他の多くのハイライトは、過去の [OpenTelemetry in Focus](/blog/2023/otel-in-focus-break/) で紹介されています。

OpenTelemetry の背後にいる素晴らしい人々なしには、これらのどれも実現しなかったでしょう。
メンテナー、コントリビューター、プラクティショナーを問わず、皆さんのやっていることが重要だということをお伝えしたいのです！

2023年を締めくくるにあたり、過去から現在まで OTel に関わってきた方々にインタビューしました。

- [Tyler Yahn](https://github.com/MrAlias/)
- [Amy Tobey](https://github.com/tobert)
- [Ted Young](https://github.com/tedsuo)
- [Carter Socha](https://github.com/cartersocha)
- [Bogdan Drutu](https://github.com/bogdandrutu)
- [Constance Caramanolis](https://github.com/ccaraman)
- [Juraci Paixāo Kröhling](https://github.com/jpkrohling)
- [Jacob Aronoff](https://github.com/jaronoff97)
- [Alex Boten](https://github.com/codeboten)
- [Purvi Kanal](https://github.com/pkanal)

カメラワークを担当してくれた [Reese Lee](https://github.com/reese-lee) に特別な感謝を捧げます！

フルバージョンの録画はこちらからご覧いただけます。

{{<youtube coPrhP_7lVU>}}

<br/>これまで OpenTelemetry に貢献してくださったすべての方々に感謝します。
2024年も皆さんの貢献を楽しみにしています！🎉

## 書き起こし {#transcript}

読む方がお好みの方のために、インタビューの書き起こしを以下に掲載します。

### 1- OTel の人々を紹介 {#1--meet-the-humans-of-otel}

**TYLER YAHN:** 私は Tyler Yahn です。
[OpenTelemetry Go SIG](https://github.com/open-telemetry/opentelemetry-go) のメンテナーをしています。
そこでは[自動計装](https://github.com/open-telemetry/opentelemetry-go-instrumentation/)や[仕様](https://github.com/open-telemetry/opentelemetry-specification/)に取り組んでいます。

**AMY TOBEY:** 私は Amy Tobey です。
Equinix のデジタルインターコネクション担当シニアプリンシパルエンジニアです。
[OTel CLI](https://github.com/equinix-labs/otel-cli) というツールをメンテナンスしています。

**ADRIANA VILLELA:** あっ、OTel CLI をメンテナンスしているんですね！

**AMY TOBEY:** ええ、私のプロジェクトなんです。
現在は主にトレースだけを扱っています。
ログとメトリクスもしばらく前から実装しようと思っていて、ログが最近 GA になったので、そろそろやる時期ですね。
でもトレースがとても効果的で皆さんに好評なので、ログやメトリクスへの需要はあまりなかったんです。

**ADRIANA VILLELA:** OTel CLI は OpenTelemetry の一部なんですか？

**AMY TOBEY:** まだです。
Equinix Labs の GitHub アカウントでメンテナンスしています。
プロセスはあまり多くありません。
ほとんど私一人で、Alex や他の方々がたまに PR を投げてくれる程度です。
コミュニティに戻すことも考えましたが、今の私は標準からちょっと離れているかもしれません。
コマンドラインでやっていると、標準の多くがうまく当てはまらないんです。
いくつかの箇所で標準から少し逸れてしまっています。
意味はあると思いますし、Austin とも話しました。

**ADRIANA VILLELA:** Ted Young が来てくれました！こんにちは！

**TED YOUNG:** こんにちは！

**CARTER SOCHA:** 私は Carter Socha です。
いくつかの異なることに取り組んでいます。
数少ないプロダクトマネージャーの一人ですが、[OpenTelemetry デモ](/docs/demo/)の立ち上げを手伝い、そのメンテナーをしています。
また、プロジェクトのセキュリティレスポンスプロセスの改善を支援する [SIG Security](https://github.com/open-telemetry/sig-security) にも参加しています。

**BOGDAN DRUTU:** 私の名前は Bogdan です。
育児休暇を取っていたので、ちょうど復帰したところです。
その前は何をしていたかですって？
[TC](https://github.com/open-telemetry/community/blob/a1cf837e5516294ce1b5023095467b24a7ff6f44/tech-committee-charter.md?from_branch=main) のメンバー、[GC](https://github.com/open-telemetry/community/blob/614ece1538e6697842bc25d436d8d70ab6175808/governance-charter.md?from_branch=main) のメンバー、[Collector](https://github.com/open-telemetry/opentelemetry-collector) のメンテナー、[Java](https://github.com/open-telemetry/opentelemetry-java) の元メンテナーなど、たくさんのことをやってきました。

**CONSTANCE CARAMANOLIS:** こんにちは。
私は Constance Caramanolis です。

**ADRIANA VILLELA:** あなたが OpenTelemetry に関わっていたこと、そして OG コントリビューターの一人であることは知っています。
その関わりについて教えてください。

**CONSTANCE CARAMANOLIS:** ええ、OpenTelemetry Collector の開発に携わりました。
コンフィグ関連のことをたくさんやりました。
OpenTelemetry Governance Committee にも参加していました。
立ち上げ期にはたくさんのことをやりました。
インキュベーションプロセスの実施、全体的な集約プロセスの開始、POC、多くのプロセスの整備、導入推進、そしてかなりの数の講演もしました。
KubeCon での講演も…。

**JURACI PAIXĀO KRÖHLING:** 私の名前は Juraci です。
ソフトウェアエンジニアで、もう何年もオブザーバビリティや OpenTelemetry システムに関わっています。
トレーシングのバックグラウンドがあり、[Jaeger](https://www.jaegertracing.io/) のメンテナーをしていました。
OpenTracing にも参加していましたし、今のプロジェクト名を選ぶのにも関わりました。
現在は Collector の開発者で、OpenTelemetry Collector のコンポーネント開発を手伝っています。
また、OpenTelemetry の Governing Committee のメンバーでもあります。

**ADRIANA VILLELA:** そして最近再選されましたよね？

**JURACI PAIXĀO KRÖHLING:** はい、再選されました。

**JACOB ARONOFF:** 私の名前は Jacob Aronoff です。
[OpenTelemetry Operator](https://github.com/open-telemetry/opentelemetry-operator) プロジェクトのメンテナーをしています。

**ALEX BOTEN:** こんにちは、Alex です。
OpenTelemetry のコントリビューター兼メンテナーです。
OpenTelemetry に関する本も書きました。
他に何だろう。
OTel 関連のことをいろいろやっています。
OpenTelemetry Collector と [OpenTelemetry Collector Contrib](https://github.com/open-telemetry/opentelemetry-collector-contrib) リポジトリのコントリビューター兼メンテナーで、[コンフィグレーション](https://github.com/open-telemetry/opentelemetry-configuration)やセキュリティに関するさまざまな SIG や専門ワーキンググループに多くの時間を費やしてきました。
以前は [Python](https://github.com/open-telemetry/opentelemetry-python) のメンテナンスとコントリビューションに多くの時間を費やしていました。

**PURVI KANAL:** こんにちは、私は Purvi です。
シニアソフトウェアエンジニアで、キャリアを通じてブラウザーや JavaScript に多く関わってきました。

### 2- あなたにとってオブザーバビリティとは？ {#2--what-does-observability-mean-to-you}

**TYLER YAHN:** それは良い質問ですね。
個人的には、オブザーバビリティとは、午前2時に問題を修正するために起こされたとき、実際にそれを修正できるということだと思います。
そして理想的には、翌日そのコードをもう一度見て、その問題が二度と起きないようにする方法を見つけられることです。
私にとっては、それがオブザーバビリティの本質です。

**AMY TOBEY:** ボックスから出てくるものを見て、部品の内部で何が起きているかがわかることですね。
とても便利です。

**TED YOUNG:** まず、モニタリングですよね… でも本当のところ、オブザーバビリティは漠然とした用語ですが、システムの監視方法に関する考え方の転換の一部として登場しました。
その転換について言うと、以前のやり方は、異なるシグナルがあって、ログが必要だからロギングシステムを作り、メトリクスが必要だからメトリクスシステムを作り、トレーシングが必要だけど何なのかわからないからやらない、というものでした。
この3つの完全にサイロ化されたシステムを別々に持つのではなく、ここ数年、特に OpenTelemetry プロジェクトでは、この3つ（プロファイリングを含めれば4つ）が別々であることは本当に良くない、と言おうとしてきました。

これらのツールを使うとき、一緒に使います。
行ったり来たりしますよね？
設定したメトリクスに基づいてアラートを受け取ります。
でもエラーか何かが急増してアラートが発火したとき、次にほしいのは、そのアラートを引き起こしているトランザクションのログを見ることです。
特定のトランザクションのログを見たいのです。
それらすべてのログにトレース ID が付いていてほしいですよね、そうすれば実際に検索できます。
つまり、これらすべてのツールを一緒に使いたいのです。

そしてこれらすべてのツールを一緒に使うためには、入ってくるデータ、テレメトリーが実際に統合されている必要があります。
テレメトリーの3つの別々のストリームがあって、バックエンドで「相互参照したい」というわけにはいきません。
すべてのテレメトリーが実際のグラフに組織化されている必要があります。
個々のシグナルすべてがその一部となるグラフィカルなデータ構造が必要です。
私にとって、これこそが現代のオブザーバビリティのすべてです。

すべてのデータをグラフに接続し、マシンが得意とすることを活用して、問題の調査に費やす時間を減らせるようにすることです。
「これが問題かもしれない」と思って、すべてのログを収集して grep で検索し、絞り込もうとするのではなく。
自分ですべての設定ファイルを見て、何が起きているのか把握しようとするのではなく。
それらの多くの疑問にすばやく答えを得て、次の仮説に進むことができるのです。

現代のオブザーバビリティで節約できる時間は、実際に私たちのプラクティスを変えるほどだと思います。
それは進行中のトレンドです。
しかし、OpenTelemetry が事実上今年 GA となり、トレーシング、メトリクス、ログが安定版になった今――はい、ようやく、たった2年遅れでしたけどね。
しかし今それがあること、これらの相関関係がすべて組み込まれたテレメトリーがあるという事実により、新しい波の分析ツールが登場し始めるでしょう。
既存のものもありますが、このデータが利用可能であること、そしてそれが標準データフォーマットであり、プロプライエタリなデータフォーマットのようなものではなく、安定したデータフォーマットであるという事実を活用した新しいツールも構築されるでしょう。
それに頼ることができます。

つまり、このデータの上に巨大なプラットフォームを構築したり、一つのことだけをとても上手にやる小さな分析ツールを構築したりすることができるのです。
それが私が見ているオブザーバビリティの向かう先であり、オブザーバビリティが私にとって意味するものです。

**CARTER SOCHA:** オブザーバビリティが私にとって何を意味するか… アプリケーションオーナーが自分の環境で何が起きているかを把握し、ビジネスやサービスの改善に関する重要な質問に答えられることを意味します。

**BOGDAN DRUTU:** オブザーバビリティは現代では過剰に使われている用語ですが、本番環境で何か問題が起きたときにそれを監視し判断する能力を意味します。

**CONSTANCE CARAMANOLIS:** オブザーバビリティとは… 私にとって何を意味するか？
物事が期待通りに動いているかを確認するためのツールとして使っています。
ブラックボックスやホワイトボックスの中を見通すことです。
何かが見えるけれど、そこからたくさんの疑問が生まれ、オブザーバビリティを使って実際に何が起きているかを解明するという感じです。
私はこれをいつもミステリー小説に例えています。

**JURACI PAIXĀO KRÖHLING:** 良い質問ですね。
定義を厳密にするつもりはありませんが、本当に意味するところは、システムに問題がある場合に何が悪いのか、何が起きているのかを答えたり判断したりする方法だと思います。
ログから来ようがメトリクスから来ようがトレーシングから来ようが関係なく、何が起きているか理解できる限り、それがオブザーバビリティがあると言えるときだと思います。
そしてこれはイエスかノーかではありません。
スペクトラムです。
初日から完璧なオブザーバビリティを持つことは期待していませんが、何が起きているかを理解するのに役立つ何らかのテレメトリーは持っていることが期待されます。
テレメトリーは、おそらくユートピア的な、システムのすべてを理解できる場所に到達するための道だと思います。

**JACOB ARONOFF:** オブザーバビリティが私にとって何を意味するか… アプリケーションの内部で何が起きているかを理解することだと思います。
自分が気にしているコードの中で何が起きているか、ですね。

**ALEX BOTEN:** なんて答えたらいいんでしょう。
すべてを意味します。
オブザーバビリティは人生です。
何か問題が起きたとき、事前に何を期待すべきか知らなくても、システムについて質問して何が起きているか把握できることだと思います。
ただデータを掘り下げることができて、サービスが十分にうまく計装されていて――完璧ではなく、十分にうまく――何が起きたか把握できること。
そしておそらく本番環境で起きたことを自分の環境で再現して、次回はコードをより良く管理できるようにすること。

**ADRIANA VILLELA:** 「完璧に計装されていなくても」と言ったのがいいですね。
完璧な計装なんてものは存在しません。
嘘です。
完成したコードなんてものがないのと同じですよね？

**ALEX BOTEN:** それも嘘です。
あるいは、ネットワークは決して壊れない。
それも嘘です。

**PURVI KANAL:** ああ、とても良い質問ですね。
私にとってオブザーバビリティとは、データに対して好奇心を持ち、本番システムについてより多くの自信を持てることです。
問題が発生する前に潰すことができること。
本番環境でのテストは、システムをテストする最良の方法です。
なぜなら誰が何と言おうと、本番環境は常にまったく別の生き物だからです。
本当に良いオブザーバビリティがあれば、本番環境でテストできます。
ユーザーにとっても開発者にとっても、はるかに良い体験になります。

### 3- いつ OTel に関わるようになりましたか？ {#3--when-did-you-get-involved-with-otel}

**TYLER YAHN:** 2019年に関わり始めたと思います。

**ADRIANA VILLELA:** ああ、かなり初期からですね？

**TYLER YAHN:** はい、初期からです。
最初のミーティングにはいませんでしたが、かなり早い段階で参加しました。
Go を書くのが大好きなので、そこから始めました。
しかしすぐに仕様にも取り組み始めて、その分野で活動するようになりました。
稼働中のシステムを使わなければならないという苦痛から来ていたと思います。
午前2時に起こされた経験のある人間として、もっと良いソフトウェアソリューションがほしかったのです。
その価値を感じて飛び込みました。

**ADRIANA VILLELA:** 痛みとトラウマの中で働いていますよね？

**TYLER YAHN:** ええ、まさにその通りです。

**AMY TOBEY:** Equinix に入社したとき、Equinix Metal 製品のスタック全体を計装するために雇われました。
最初の1年はそれに取り組みました。
3年前くらいのことで、ファンシーな自動計装がすべて完成する前に、すべてのシステムに計装を追加していました。

**ADRIANA VILLELA:** つまり、OpenTelemetry の OG ユーザーなんですね。

**AMY TOBEY:** ちょっとだけね。

**CARTER SOCHA:** Microsoft で所属していたチーム、少なくとも私の組織は、すでに OpenTelemetry の分野で多くのことをやっていて、そこがクールなことが起きている場所でした。
それで興味を持ちました。
そして、外部向けと内部向けの両方で OpenTelemetry に特化した開発チームに異動になりました。
Microsoft は内部的に OpenTelemetry を非常に多く使っているからです。
それがきっかけでした。
そして周りを見回し始めたとき、実際に OpenTelemetry を使っている良い例がないことに気づきました。
それはすべてのベンダーが抱えている問題かもしれないと思いました。
コミュニティとして一緒に解決できることで、実際に解決しました。

**ADRIANA VILLELA:** OpenTelemetry にはどのくらい取り組んでいますか？

**BOGDAN DRUTU:** 最初からです。

**ADRIANA VILLELA:** つまり2019年から？それとも、もっと前から？

**BOGDAN DRUTU:** もっと前からです。

**ADRIANA VILLELA:** Ted と一緒に… 最初の頃から始めたんですか？

**BOGDAN DRUTU:** いいえ。
実は、OpenTelemetry に統合された2つの競合プロジェクトがありました。

**ADRIANA VILLELA:** そうですよね。

**BOGDAN DRUTU:** 私はもう一つのプロジェクトにいました。

**ADRIANA VILLELA:** どっち、OpenCensus？

**BOGDAN DRUTU:** そうです。

**PURVI KANAL:** 私は Honeycomb で働くことを通じて OpenTelemetry に関わるようになりました。
特に [OpenTelemetry JavaScript](https://github.com/open-telemetry/opentelemetry-js) に興味があり、とりわけ OpenTelemetry JavaScript のブラウザー側に関心があります。
関わることができてとても嬉しいです。

### 4- あなたにとって OTel とは？ {#4--what-does-otel-mean-to-you}

**TYLER YAHN:** OpenTelemetry は、標準であり、オブザーバビリティ領域全体にわたるコラボレーションだと思います。
そしてすべての計装の未来への道だと思います。
ベンダーロックインがないという考え、一つのコードベースで常にシステムを見通す方法があるという考え、それが長期的にソフトウェアをより良くしていく未来だと思います。

**AMY TOBEY:** OpenTelemetry は私の生活を楽にしてくれます。
使っているオープンソースコンポーネントやプロプライエタリなコンポーネントと統合でき、最終的にすべての OpenTelemetry がオブザーバビリティベンダーに流れ、使っているすべてのプロダクトのトレースを一箇所で見ることができます。

**BOGDAN DRUTU:** 私の… 魂のプロジェクトです。

**CONSTANCE CARAMANOLIS:** OpenTelemetry はかなりバイアスがかかってしまいますが、多くの異なる視点がついに一つになって、以前は難しかった進歩を実際に容易にしている、本当に良い組み合わせだと感じています。
データを集めるのは大変ですが、それを理解することが本当に難しい部分です。
そしてそれがついに一つにまとまってきました。
メトリクス、トレース、ログを得るためのコラボレーションとして、かなりうまくいっています。

**JURACI PAIXĀO KRÖHLING:** ああ、深い質問ですね… 技術的な面では、OpenTelemetry は典型的なアプリケーションからテレメトリーデータを取得するのに役立つツールのセットです。
インフラからも取得できることがあります。
しかし OpenTelemetry は、ベンダーニュートラルな方法でアプリケーションからデータを取得できるツールです。
完璧な計装があれば、そのユートピア的な場所に到達できます。
OpenTelemetry は徐々にそこに到達するために必要なツールを提供してくれます。
ただ、非常に特定の場所で止まります。
つまり、データを送信したら、そこが OpenTelemetry の終わりです。
そこからはベンダーやオープンソースツールがデータベース、可視化ツールなどを提供します。
でも、より深い面では、OpenTelemetry は私の同僚がいる場所であり、数年間日常的に一緒に働いている人々がいる場所です。
それが私にとっての OpenTelemetry です。

**JACOB ARONOFF:** OpenTelemetry は、みんなに支えられたオブザーバビリティです。
単一のベンダーではありません。
データの送信先に依存しない形で、やるべきことをやらせてくれるものです。
新しい車に乗るたびに運転の仕方を覚え直す必要がないのと同じように。
買った自転車のベンダーによって乗り方を学び直す必要がないのと同じように。
データの送信先に関係なく、コードを計装できるべきです。
それが私の説明の仕方であり、考え方です。

**JACOB ARONOFF:** もう一つの利点は、メンテナーとして、多くのメンテナーや承認者がここにいるので、今後数ヶ月で本当に必要なことを一緒に考え、協力できることです。
サマーキャンプみたいだと表現しました。
「あっ、数ヶ月ぶりだね。元気だった？」みたいな感じで。
近況報告のようなものです。

**ALEX BOTEN:** OTel は本当に素晴らしいです。
プロジェクト自体が素晴らしいです。
多くの標準を取ってきて、より少ない標準に集約した最初のプロジェクトの一つです。
OpenCensus、OpenTracing を持ち寄り、[Prometheus](https://prometheus.io/) もテーブルに持ってきました。
[Elastic Cache フォーマット](/blog/2023/ecs-otel-semconv-convergence/)もあります。
OpenTelemetry は素晴らしいコミュニティです、それだけです。
ベンダーの境界を越えて協力し、オブザーバビリティの世界をより良くしようとしています。
これは私がこれまでやったことのないことです。
これほど多くのベンダーとエンドユーザーコミュニティが関わっているオープンソースプロジェクトで働いたことはありませんでした。
本当に素晴らしいです。

**ADRIANA VILLELA:** ええ。
個人的に OpenTelemetry で好きなのは、みんなが仲良くやっていることです。
「いいえ、一つのベンダーを他よりも優遇しません」という姿勢が非常に意図的だと感じます。
もしベンダーが目立とうとしたら、それはほぼ即座に止められます。
それはとても良いことだと思います。

**ALEX BOTEN:** プロジェクトのすべてのレベルで、みんなを正しい方向に導こうとする本当に良い人たちがたくさんいます。
それをとても感謝しています。
特にその一人である Ted Young にエールを送りたいです。
彼はあっちのどこかにいて… ちょうど見えますが、周りを見回しているだけです。
自分たちが彼のことを話していることを全然知りません。

**PURVI KANAL:** 私にとって OpenTelemetry は、本当にコミュニティのすべてです。
コミュニティが自分たちのテレメトリーデータのオーナーシップを取れること。
なぜなら、ベンダーがシステムに送信されるテレメトリーデータのタイプを決めるべきではないからです。
システムのオブザーバビリティはそのシステムに非常に固有のものです。
ベンダーロックインや、ベンダーの計装によるロックインがあると、非常に制限的になり得ます。

### 5- お気に入りのテレメトリーシグナルは？ {#5--whats-your-favorite-telemetry-signal}

**TYLER YAHN:** 良い質問ですね。
もっと洗練された答えがあればいいのですが。
わかりません… メトリクスは一番長く知っています。
でもトレースの方がおそらくお気に入りに近いです。
なぜなら、運用上の振る舞いについてより深い洞察が得られるからです。
ええ、おそらくトレースを選びます。
トレースの方がより自動的でもあります。
メトリクスは本当にそれらが何であるか理解して、何かに組み立てる必要があります。
一方でトレーシングは、付属する構造だけで見せてくれます。
ということで、トレースにします。

**AMY TOBEY:** もちろんトレースです。

**TED YOUNG:** 私のお気に入りのシグナル… おそらく[バットシグナル](https://en.wikipedia.org/wiki/Bat-Signal)ですね。
システムがダウンするたびにあれが点灯したら、嬉しいですね。

**CARTER SOCHA:** この例えはどこかで聞いたことがありますが… 本当にそう思います。
トレースはログのクールなバージョンです。
口ひげとシルクハットをつけたログみたいなものです。
基本的にスパンはただのログですが、トレースで相関されたログです。
なのでおそらくトレースと答えますが、予備の答えはログです。

**BOGDAN DRUTU:** シグナル？
一番… メトリクスが好きです。
以前のメトリクスのやり方を変えようとしましたし、まだ最も成功しているとは言えませんが、そこに向かっています。
しかし必要な変化でしたし、物事の進め方に何かを変えたと感じています。
トレーシングについては、他の Dapper 論文などからそれほど変えていませんが、メトリクスについては変えたと思います。

**CONSTANCE CARAMANOLIS:** 私はトレースが大好きです。
特に… 私のお気に入りの例は、以前 Lyft にいたときの話です。
真夜中にページングされて… あるサービスが4階層深くて… すべてがおかしくなっていて… そのサービスとフロントの間のすべてがページングされていました。
「これが原因だ」と実際に特定できたんです。
過度に考え込むこともなく。
それがトレースの好きなところです。
私たちが慣れ親しんできたものとはまったく異なるパラダイムです。

**JURACI PAIXĀO KRÖHLING:** トレースです。
当然でしょう。
美しいんです。
いや本当に。
トレースです。

**JACOB ARONOFF:** トレースです。
一番です。
最も扱いやすいです。
始めるのがとても簡単で、他の何よりもはるかに便利です。
だからトレース一択です。

**ALEX BOTEN:** トレースです。
明らかにエレガントなログだからです。
でもメトリクスも取得できます。
シグナルに必要なものがすべて含まれています。
コンテキストで相関されたメトリクスとログです。
美しいです。
魔法です。

**PURVI KANAL:** ああ、簡単ですね。
トレーシングです。

## ぜひ参加してください！ {#join-us}

組織で OpenTelemetry をどのように使っているかについてのストーリーをお持ちの方は、ぜひお聞かせください！
共有方法はこちらです。

- [CNCF Community Slack](https://communityinviter.com/apps/cloud-native/cncf) の [#otel-endusers チャンネル](/community/end-user/slack-channel/)に参加する
- 毎月開催の[エンドユーザーディスカッショングループ](/community/end-user/discussion-group/)に参加する
- [OTel in Practice](/community/end-user/otel-in-practice/) セッションに参加する
- [OpenTelemetry ブログ](https://github.com/open-telemetry/opentelemetry.io/blob/954103a7444d691db3967121f0f1cb194af1dccb/README.md#submitting-a-blog-post)でストーリーを共有する
- その他のセッションのご要望は、[CNCF Community Slack](https://communityinviter.com/apps/cloud-native/cncf) でお問い合わせください！

OpenTelemetry の [Mastodon](https://fosstodon.org/@opentelemetry) と [LinkedIn](https://www.linkedin.com/company/opentelemetry/) をフォローし、**#OpenTelemetry** ハッシュタグを使ってストーリーを共有してください！

そして、[YouTube チャンネル](https://youtube.com/@otel-official)をチャンネル登録して、さらに素晴らしい OpenTelemetry コンテンツをお楽しみください！
