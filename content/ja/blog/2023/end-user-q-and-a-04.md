---
title: 'エンドユーザー Q&A シリーズ: Lightstep での OTel への移行'
linkTitle: 'エンドユーザー Q&A: Lightstep での OTel への移行'
date: 2023-07-24
author: '[Reese Lee](https://github.com/reese-lee) (New Relic)'
body_class: otel-with-contributions-from
default_lang_commit: 503475ab918d7870c9f7c748a83ac49091a3b737
# prettier-ignore
cSpell:ignore: Aronoff fluentbit k8sattributesprocessor kubelet spanmetrics statefulset
---

<!-- markdownlint-configure-file {"no-shortcut-ref-link": {"ignore_pattern": "^(and|is|our)$"}} -->

[Adriana Villela](https://github.com/avillela)（Lightstep from ServiceNow）の協力のもと作成。

OpenTelemetry（OTel）End User Working Group の 2023 年第 4 回
[エンドユーザー Q&A セッション](/community/end-user/interviews-feedback/)では、
[Lightstep from ServiceNow](https://lightstep.com/) のスタッフソフトウェアエンジニアであり、OpenTelemetry Operator のメンテナーでもある [Jacob Aronoff](https://www.linkedin.com/in/jaronoff97) 氏にお話を伺いました。
ベンダーが社内でどのように OTel を活用しているか興味がある方は、ぜひお読みください！

このインタビューシリーズは、本番環境で OpenTelemetry を使用しているチームとの月例カジュアルディスカッションです。
コミュニティと共有するために、チームがどのように取り組んでいるか、成功と課題について学び、OpenTelemetry をともに改善していくことを目的としています。

## 概要 {#overview}

このセッションで Jacob 氏が共有した内容は以下のとおりです。

- OpenTracing と OpenCensus から OpenTelemetry への移行にどのようにアプローチしたか
- [`TargetAllocator`](https://github.com/open-telemetry/opentelemetry-operator/blob/ac5bae83adb06d320b49239cec50469c0db784df/cmd/otel-allocator/README.md?from_branch=main)
  とは何か、そして現在どのように使用しているか
- Collector をサイドカーとしてデプロイしたくない理由

## インタビュー {#the-interview}

### 背景 {#the-backstory}

Jacob 氏は Lightstep from ServiceNow の Telemetry Pipeline チームに約 2 年間在籍しています。
最初の 1 年間は、社内での OTel への移行と、顧客にとってより簡単にすることだけに集中していました。

チームに参加したとき、「トレーシングにはまだ OpenTracing を使っており、メトリクスには OpenCensus と手作りの Statsd を組み合わせて使っていました」と彼は言います。
つまり、すべての Kubernetes Pod でプロキシを実行する必要がありました（プロキシがすべての Pod にサイドカーとして配置され、[Statsd](https://github.com/statsd/statsd) から読み取ってメトリクスを転送する別のアプリケーションを実行する必要があるということです）。

これは OpenTelemetry メトリクスのリリース候補が発表されたころのことで、彼はこれをチャンスと捉えました。
「OTel に取り組み、改善方法について即座にフィードバックを得たいと考えている社内の OTel チームがいたので、私たちの移行を開始しました」と彼は言います。

### OpenCensus メトリクスの移行 {#the-opencensus-metrics-migration}

以前に同様の移行を行った経験から、彼は当初、できるだけ安全に進めることを計画していました。
モノレポだったので一度にすべて行うこともできましたが、バグがプッシュされるリスクがありました。

Jacob 氏は次のように言います。
「これは、すべての環境でワークロードがどのように機能しているかを理解するためにアラートに使用しているアプリデータです。そのため、ダウンさせないことが重要です。ダウンさせたら大惨事になります。ユーザーにとっても同じで、OTel に移行してもアラート機能を失わないことを知りたいのです。安全で簡単な移行が必要です。」

彼のチームは、設定のうちフィーチャーフラグに関わる部分を Kubernetes 側で実装しました。
「サイドカーを無効にして、OTel をメトリクス用にスワップし、適切な場所に転送するコードを有効にするものでした。それが移行のパスでした」と彼は言います。

しかし、途中で、パブリック環境を監視するために使用している環境でテストしたところ、「かなり大きなパフォーマンスの問題」に気づきました。
OTel チームと協力してこれらの懸念を軽減し、大きなブロッカーの 1 つがメトリクスでの属性の多用であることがわかりました。

「どのメトリクスがそれらを使用しているかを調べて取り除くのは面倒でした。1 つのコードパスが問題だという仮説がありました。それは内部のタグ実装から OTel タグへの変換を行っている部分で、多くの他のロジックが伴い、高コストで、ほぼすべての呼び出しで実行されていました」と彼は言います。
「OpenCensus から OTel への別の移行を始めるなら今しかありません。」

彼はこれを別のチャンスと捉えました。
「OTel チームがメトリクス側でよりパフォーマンスの高いコードと実装をプッシュするのを待つ間に、完全に OTel に移行すればさらにパフォーマンスの向上が見られるという仮説もテストできます。」
こうして、メトリクスの作業を一時停止し、トレーシングの移行を開始しました。

### OpenTracing の移行 {#the-opentracing-migration}

トレーシングについて、Jacob 氏は「オール・オア・ナッシング」のアプローチを試みることにしました。
OpenTracing から OTel へのパスはより知られており、参照できるドキュメントや例がいくつかありました。
さらに、「下位互換性があり、互いに併用できます」と彼は言います。
「ただしプロパゲーターが正しく設定されていれば、ですが。」

プロパゲーターを正しく設定した後、すべてのプラグイン（現在はオープンソース）が動作することを確認しました。
ステージング環境から何度かリバートする必要がありましたが、彼が見落としたバグ以外に大きな問題はありませんでした。

「カスタムサンプラーを実装する必要がありましたが、OTel では OpenTracing よりも 10 倍簡単でした」と彼は言います。
「千行のコードと危険なハックを取り除くことができたので、本当に良かったです。」

### 移行の始め方 {#how-to-start-a-migration}

「自分のチームが所有する、トラフィックが非常に少ないが一定量はある小さなサービスから始めました」と Jacob 氏は言います。
「こういうサービスを選ぶ理由は、トラフィックが少なすぎると（たとえば 10 分に 1 リクエスト）サンプルレートを気にしなければならず、比較するデータがあまりないかもしれないからです。重要なのは、比較するデータがあることです。」

彼はメトリクス移行の初期に、すべてのメトリクスに付いていた異なるビルドタグを照会するスクリプトを書いていました。
新しいビルドタグの標準偏差が前のリリースと比較して 1 より大きい場合、それは計装ライブラリに問題がある可能性を示唆します。

「移行前後ですべての属性がまだ存在しているかも確認する必要がありました。これも重要なことです」と Jacob 氏は述べています。
Statsd が、こちらが気にしていないものを自動的に追加していた場合など、属性が存在しないこともありました。そういったものは安全に無視できました。

トレーシングについて、Jacob 氏は次のように言います。
「内部のみのトレース（単一サービス内に留まる）と、異なる種類の計装を持つ複数のサービスにまたがるトレース（Envoy から OTel、OpenTracing まで）の両方を持つサービスを選びました。」

彼は次のように説明します。
「確認したいのは、移行前のトレースが移行後のトレースと同じ構造を持つことです。そこで、それらの構造がほぼ同じであること、同じ属性をすべて持っていることを確認する別のスクリプトを作りました。それがトレーシング移行のポイントです。重要なのは、すべての属性が同じまま維持されることです。」

### データが失われるとき {#when-data-goes-missing}

「'なぜ失われたのか'というストーリーは本当に複雑なものです」と Jacob 氏は言います。
「どこかに何かを追加し忘れた」というような単純な場合もありますが、上流のライブラリが OTel に対して期待どおりの出力をしないこともあります。

彼は、gRPC ユーティリティパッケージ（現在は Go contrib にあります）を移行した際に伝搬の問題を発見した話をしてくれました。

「何がうまくいかないのか理解しようとしていました。コードを見たとき――これは私がこの移行をどれだけ早い時期に行っていたかを物語っています――プロパゲーターがあるべき場所に、ただ 'TODO' があるだけでした」と彼は共有します。
「ステージングでサービス全体のトレースがダウンしました。」

しばらくその問題に取り組みましたが、彼らは別の何かを待っており、そしてまた別の何かを待っていて――Jacob 氏は「そういったことの無限サイクルがあります」と言います。
問題を解決した後、コミュニティで利用できるようにアップストリームに反映しました。

「メトリクスの作業の多くは、OTel メトリクスの大きなパフォーマンス向上をもたらしました」と彼は言います。
「たとえば OTel Go メトリクスです。また、さまざまな機能において API がどの程度記述的であるべきかという点についても、Statsd の人たちにアイデアを与えました。たとえば、Views やその使い方は、移行の初期に私たちが多用したものです。」

### メトリクス Views {#metrics-views}

「メトリクス View は、OTel の Meter Provider 内で実行されるものです」と Jacob 氏は説明します。
属性の削除など、最も一般的なユースケースを含む多くの設定オプションがあります。
「たとえば、あなたが集中管理型の SRE で、誰にもユーザー ID 属性でコードを計装させたくないとします。なぜなら、それは高カーディナリティなもので、メトリクスのコストが爆発するからです。計装に追加される View を作成し、その属性を記録せず拒否するように指示できます。」

たとえば、メトリクスのテンポラリティやアグリゲーションを動的に変更するなど、より高度なユースケースもあります。
テンポラリティとは、メトリクスが前回の測定値を組み込むかどうか（累積とデルタ）を指し、アグリゲーションとはメトリクスをどのように送信するかを指します。

「（私たちの用途では）ヒストグラムに最も有用です」と Jacob 氏は言います。
「ヒストグラムを記録する際、いくつかの異なる種類があります。DataDog や Statsd のヒストグラムは、記録しているのがアグリゲーションサンプルのようなものなので、真のヒストグラムではありません。最小値、最大値、カウント、平均値、P95 などが得られます。問題は、分散コンピューティングでは、複数のアプリケーションが P95 を報告している場合、そのアグリゲーションでのその観測から真の P95 を得る方法がないことです」と彼は続けます。

「その理由は、5 つの P95 の観測がある場合、そこから全体の P95 を出すためのアグリゲーションがないからです。再計算するためには元のデータに関する何かが必要です。P95 の平均は取れますが、それはあまり良いメトリクスではなく、多くを語りません。本当に正確ではありません。何かにアラートを設定して夜中に誰かを呼び出すなら、正確な測定値に基づいて呼び出すべきです。」

当初、最小値、最大値、合計、カウントの計装に依存している人が数人いました。
そこで Metrics SDK の View を使用し、カスタムアグリゲーションやヒストグラムがディストリビューション、つまり OpenTelemetry でいう指数ヒストグラムを出力するように設定しました。
「二重に出力していました。異なるメトリクス名だったので重複はなく、これはうまくいきました。」

移行を完了した後、最小値、最大値、合計、カウントを使用していたすべてのダッシュボードやアラートに立ち返り、それらでディストリビューションを使用するように変更できました。
「パブリック環境で OTel メトリクスを数週間、数ヶ月間実行した十分なデータがあったので、それが可能でした」と Jacob 氏は言います。
「これは重要な機能の 1 つでした。それがあったおかげで 10 倍簡単になり、アプリケーションからそれを行うことができ、他のコンポーネントを導入する必要がなかったのは本当に素晴らしかったです。」

### ログとスパンイベント {#logs-and-span-events}

Jacob 氏が OTel への移行を始めたとき、ログにはまだ早すぎました。
「変更するとしたら」と彼は言います。
「ログの収集方法です。以前は Google のログエージェント、基本的に GKE クラスターのすべてのノードで [fluentbit](https://fluentbit.io) を実行し、GCP に送信してそこで tail していました。」
彼は、現時点では把握していない最近の変更があるかもしれないと述べています。

「スパンイベントとログは、社内で長い間多くのことに使ってきました」と彼は言います。
「私はそれらの大ファンです。」
彼はロギングについてはそれほどファンではなく、「面倒でコストがかかる」と考えていると共有しています。
可能な限りトレーシングとトレースログを選択することをユーザーに勧めていますが、ローカル開発にはロギングが好きで、分散開発にはトレーシングが好きだと述べています。

### Kubernetes でのテレメトリー収集 {#telemetry-collection-in-kubernetes}

Kubernetes はネイティブに OTel トレースを出力する機能を持つようになり、Jacob 氏はそこから得られるトレースが
[spanmetrics プロセッサー](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/b01fd364d01962e666dc347eb13421053ea93bac/processor/spanmetricsprocessor?from_branch=main)を使用してより良い Kubernetes メトリクスを生成するのに十分かどうかに関心を持っています。

> **NOTE:** spanmetrics プロセッサーは非推奨であり、代わりに
> [spanmetrics コネクター](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/b01fd364d01962e666dc347eb13421053ea93bac/processor/spanmetricsprocessor?from_branch=main)を使用してください。

「私は Kubernetes インフラストラクチャメトリクスのようなインフラストラクチャメトリクスに非常に注力しており、現在の形では非常に扱いにくいと感じています」と彼は言います。
現在、Prometheus API を使用してそれらを収集しています。これは、Kubernetes がすでにネイティブに出力しているため、オブザーバビリティコミュニティでは最も一般的な方法です。

「それが今やっていることで、私が取り組んでいる Target Allocator という OTel コンポーネントを使用してそれらのターゲットを分配しています。これはすべてのデータを取得するかなり効率的な方法です」と Jacob 氏は言います。

「また、クラスターで
[DaemonSet](https://kubernetes.io/docs/concepts/workloads/controllers/daemonset/)
を実行してそのデータを追加で取得しています。これはかなり効果的に動作します。イライラするのは Prometheus そのものです。Prometheus のスクレイプ値は非常に一般的な問題になりえますし、メトリクスのカーディナリティも気にしなければならないので、爆発する可能性があり本当に面倒です。」

### Target Allocator {#the-target-allocator}

「Target Allocator は、
[OTel の Kubernetes Operator](https://github.com/open-telemetry/opentelemetry-operator)
の一部であるコンポーネントで、Prometheus にはできないこと、つまりスクレイパーのプール間でターゲットを動的にシャーディングすることを行います」と Jacob 氏は共有します。
Target Allocator を使用するために Prometheus インスタンスを実行する必要はありませんが、Target Allocator がピックアップするためには Prometheus CRD が存在する必要があります。

[ドキュメント](https://github.com/open-telemetry/opentelemetry-operator/tree/de81a64ae8d7d2f4f48945049d8ef9ad3509f89e/cmd/otel-allocator?from_branch=main#prometheuscr-specifics)より:

> Allocator がピックアップするためには、Prometheus CRD も存在する必要があります。
> それらを入手する最適な場所は prometheus-operator です:
> [Releases](https://github.com/prometheus-operator/prometheus-operator/releases)。
> Allocator が監視する CR の CRD のみをデプロイする必要があります。
> bundle.yaml ファイルから選び出すことができます。

彼はさらに、Prometheus には
[シャーディング](https://www.techtarget.com/searchoracle/definition/sharding)のための実験的な機能がいくつかありますが、クエリに関してはまだ問題があると説明します。
Prometheus はスクレイパーであるだけでなくデータベースでもあるため、これらの Prometheus インスタンス内である程度の調整を行う必要があり、コストがかかる場合があります。
あるいは、[Thanos](https://github.com/thanos-io/thanos#) や [Cortex](https://cortexmetrics.io) のような Prometheus スケーリングソリューションを使用できますが、監視する必要のあるコンポーネントをさらに実行することになります。

「OTel では、このすべてのデータを取得するために
[Prometheus レシーバー](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/c9585747e97d1ba5a0aae3bee72eaf76438951f4/receiver/prometheusreceiver/README.md?from_branch=main)を使用しますが、Prometheus よりも効率的でありたいので、データを保存する必要がないため、Target Allocator というコンポーネントがあり、Prometheus からサービスディスカバリーを行います」と Jacob 氏は言います。
「スクレイプする必要のあるすべてのターゲットを教えてくれと言います。そして Target Allocator は、これらのターゲットを実行中の Collector のセットに均等に分配すると言います。」

それがこのコンポーネントの主な機能であり、ジョブディスカバリーにも役立ちます。
[Prometheus Operator](https://github.com/prometheus-operator/prometheus-operator)
の一部である Prometheus サービスモニターを使用している場合（クラスターで Prometheus を実行する一般的な方法です）、「Target Allocator はそれらのサービスモニターやポッドモニターもプルして、モニターとスクレイプ設定を更新することもできます。」

Jacob 氏のチームは Prometheus インスタンスを実行していません。Prometheus レシーバーを実行する Collector でデータを Lightstep に送信するだけです。
「いい感じです」と彼は言います。

彼のチームは以前、Prometheus のインストールの一部として実行される Prometheus サイドカーを使用していました。
これは Prometheus インスタンスと同じ Pod に配置され、Prometheus が永続性とバッチ処理のために持つ先行書き込みログを読み取ります。
しかし、Prometheus インスタンスがノイジーな場合、非効率になる可能性があります。
「本当にノイジーになって最善ではないこともあります」と Jacob 氏は言います。
「Collector が一番良い方法です。」

### Collector のセットアップ {#the-collector-setup}

Jacob 氏のチームは Lightstep で多くの異なる種類の Collector を実行しています。
「メトリクス用、トレーシング用、内部用、外部用――常に多くの異なる Collector が実行されています」と彼は共有します。

「すべてが非常に流動的です。」
顧客やエンドユーザーのために機能を作成する最良の方法は、まず社内で動作することを確認することなので、多くの実験を行うために常に変更しています。

「1 つのパスで、2 つの環境にある 2 つの Collector が 2 つの異なるイメージと 2 つの異なるバージョンを実行している可能性があります。本当にメタで、話すと本当に混乱します」と彼は言います。
「そして、Collector A を環境をまたいで Collector B に送信している場合、Collector B も自身のテレメトリーを出力し、それが Collector C によって収集されるので、チェーンになります。」

要するに、Collector が実際に動作していることを確認する必要があります。
「これらをデバッグするときに、まさにそこが悩みどころです。問題があるとき、問題が実際にどこにあるのかを考えなければなりません。データの収集方法なのか、データの出力方法なのか、データが生成されたソースなのか。いくつかの可能性のうちの 1 つです。」

### OTel での Kubernetes モード {#kubernetes-modes-on-otel}

OTel Operator は、Kubernetes での OTel Collector に対して 4 つの
[デプロイモード](https://github.com/open-telemetry/opentelemetry-operator/blob/f6b0d947a4c48444a0483b3b0dcaf1e60c4458d6/docs/api/opentelemetrycollectors.md?from_branch=main)をサポートしています。

- [Deployment](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/) -
  例を参照:
  [ingress/00-install.yaml](https://github.com/open-telemetry/opentelemetry-operator/blob/107d2c31a61f1cea3a1d6b21241c5fee7ff79f41/tests/e2e/ingress/00-install.yaml?from_branch=main)
- [DaemonSet](https://kubernetes.io/docs/concepts/workloads/controllers/daemonset/) -
  例を参照:
  [daemonset-features/01-install.yaml](https://github.com/open-telemetry/opentelemetry-operator/blob/f6b0d947a4c48444a0483b3b0dcaf1e60c4458d6/tests/e2e/daemonset-features/01-install.yaml?from_branch=main)
- [StatefulSet](https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/) -
  例を参照:
  [smoke-statefulset/00-install.yaml](https://github.com/open-telemetry/opentelemetry-operator/blob/6d2f18b0ac0303aff2b904c2de76296cea60fbf9/tests/e2e/smoke-statefulset/00-install.yaml?from_branch=main)
- [サイドカー](https://www.techtarget.com/searchapparchitecture/tip/The-reasons-to-use-or-not-use-sidecars-in-Kubernetes) -
  例を参照:
  [instrumentation-python/00-install-collector.yaml](https://github.com/open-telemetry/opentelemetry-operator/blob/cd1d136a539820a87bbc26fa2d8ff1fb821bbcf1/tests/e2e/instrumentation-python/00-install-collector.yaml)

どれを使うべきかは、信頼性のためにアプリケーションをどのように実行するかなど、何をする必要があるかによります。

「サイドカーは私たちが最も使わないもので、業界全体でもおそらく最も使われていないと思います」と Jacob 氏は言います。
「コストがかかります。本当に必要でない限り、使うべきではありません。」
サイドカーとして実行されるものの例として Istio があります。
「プロキシトラフィックを行い、コンテナネットワークにフックしてすべての動作を変更するので、サイドカーとして実行するのは理にかなっています。」

すべてのサービスの Collector をサイドカーにすると、コストが発生し、機能も制限されます。
「Kubernetes API 呼び出しや属性エンリッチメントを行っている場合、サイドカーとして実行すると指数関数的にコストが高くなります」と彼は言います。
彼は次の例を共有します。
「...もしサイドカー [Collector で
[k8sattributesprocessor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/635d4254a3018eb3ca8f1736e71fcb54f8ed6e5a/processor/k8sattributesprocessor?from_branch=main)
を使用] が 1 万の Pod にある場合、K8s API への呼び出しが 1 万回発生します。コストがかかります。」

一方、StatefulSet にデプロイされた 5 つの Pod がある場合、「それほどコストはかかりません。」
StatefulSet モードで実行すると、常に存在すべき正確なレプリカ数が得られ、それぞれに予測可能な名前があります。
これは「一貫した ID が必要なときに本当に価値のあること」です。

一貫した ID のおかげで、Target Allocator で追加の作業ができます。これが Target Allocator が必要とされる理由です。
StatefulSet が保証するもう 1 つのことは、インプレースデプロイメントと呼ばれるもので、DaemonSet でも利用できます。
これは、新しい Pod を作成する前に Pod を停止するものです。

「Deployment では通常、1-up, 1-down、またはいわゆる
[ローリングデプロイメント](https://www.techtarget.com/searchitoperations/definition/rolling-deployment)、
つまりローリングアップデートを行います」と Jacob 氏は言います。
Target Allocator でこれを行うと、はるかに信頼性の低いスクレイプが発生する可能性が高くなります。
新しいレプリカが起動するとすべてのターゲットを再分配する必要があるためです。配置先のハッシュリングが変更され、割り当てたすべてのハッシュの再計算が必要になります。

一方、StatefulSet ではこれは不要です。一貫した ID 範囲が得られるからです。
「1-down 1-up をすると、毎回同じターゲットを保持します。プレースホルダーのようなもので、リングを再計算する必要がありません」と彼は説明します。

彼は、これは Prometheus をスクレイプするメトリクスのユースケースとしてのみ本当に有用だと述べています。
それ以外では、Deployment モードがほぼ必要なものをすべて提供するため、おそらくそちらを使うだろうと述べています。
Collector は通常ステートレスなので、何かを保持する必要がなく、結果として Deployment はよりスリムです。
「実行してロールアウトすれば、みんなハッピーです」と彼は言います。
「私たちのほとんどの Collector は、ただ Deployment として実行しています。」

ノードごとのスクレイプには、DaemonSet が便利です。
「すべてのノードで実行される kubelet をスクレイプでき、すべてのノードで実行されるノードエクスポーターもスクレイプできます。これはほとんどの人が実行する別の Prometheus DaemonSet です」と彼は説明します。

DaemonSet はスケールアウトに役立ちます。セレクターに一致するすべてのノードで Pod が実行されていることを保証するからです。
「800 以上のノードのクラスターがある場合、少数の大きな StatefulSet の Pod よりも、小さな Collector を多数実行してそれらの小さなメトリクスを取得する方が信頼性が高いです。なぜなら、影響範囲がはるかに小さいからです」と彼は言います。

「1 つの Pod がダウンしても、失われるデータはごくわずかです。ただし、このすべてのカーディナリティの問題を覚えておいてください。メモリが大量に必要です。StatefulSet でこれらのすべてのノードをスクレイプしている場合、ターゲットが多く、メモリも多く、はるかにダウンしやすく、より多くのデータを失う可能性があります。」

Collector がダウンしても、通常はステートレスなので素早く復旧します。
つまり、「通常、一時的な障害は小さい」と Jacob 氏は言います。
しかし、飽和点を超えている場合、「より不安定で、かなり素早く上下する可能性があります。」
そのため、水平 Pod オートスケーラー（HPA）を持つことは良いアイデアです。

これはメトリクスの観点からは有用ですが、トレーシングワークロードを使用してトレーシングでも行えます。
すべてプッシュベースなので、スケールがはるかに容易で、ターゲットを分配してロードバランスできます。

「プルベースであることが、Prometheus がこれほど普及している理由です。ローカル開発が本当に簡単になるからです。ローカルエンドポイントをスクレイプするだけで、ほとんどのバックエンド開発はそういうものです」と彼は言います。
「エンドポイント A にアクセスして、メトリクスエンドポイントにアクセスできます。もう一度エンドポイント A にアクセスしてメトリクスエンドポイントを確認する、という簡単な開発ループです。また、ネットワーク外にアクセスする必要がないので、データ送信に厳格なプロキシ要件がある場合、ローカル開発ははるかに簡単です。だからこそ OTel には本当に優れた Prometheus エクスポーターがあり、両方できるのです。」

### 集中型 OTel Collector ゲートウェイ {#the-centralized-otel-collector-gateway}

Jacob 氏が前述した Collector チェーンの一部である[集中型ゲートウェイ](/docs/collector/deploy/gateway/)が進行中です。
この取り組みは [Arrow](https://arrow.apache.org/) を中心としています。
Lightstep は「Apache Arrow を使用して OTel データの処理速度とイングレスコストを改善する」ための作業を行っています。
Apache Arrow は列ベースのデータ表現のためのプロジェクトだと、Jacob 氏は説明します。

現在、パフォーマンスを調査し、期待どおりに動作することを確認するための実装の概念実証を行っています。

### テレメトリーを最新に保つ {#keeping-telemetry-up-to-date}

Jacob 氏は、ライブラリの作者やメンテナーが常に新しいパフォーマンス機能やソフトウェアの改善に取り組んでいるため、テレメトリーを最新に保つことが重要だと述べています。

「移行も容易になります。何かの初期バージョンから最新バージョンへ移行しようとすると、多くの破壊的変更を見逃す可能性があり、注意が必要です」と彼は言います。

彼は OTel で使用している Dependabot の使用を推奨しています。
OTel パッケージはロックステップで更新されるため、「かなりの数のパッケージを一度に更新する必要がありますが、すべて自動で行ってくれるのは良いことです」と彼は言います。
しかし、すべての依存関係に対してこれを行うべきです。
「CVE は業界で常に発生しています。脆弱性の修正を最新の状態に保っていなければ、セキュリティ攻撃にさらされることになり、それは望ましくありません。'何かしら対策を取る'ことが私の推奨です。」

## その他のリソース {#additional-resources}

- このトークの全編は
  [OTel YouTube チャンネル](https://youtu.be/dpXhgZL9tzU)でご覧ください
- OTel Operator について詳しく知るには、
  [CNCF Slack](https://communityinviter.com/apps/cloud-native/cncf) の
  [#OTel-operator チャンネル](https://cloud-native.slack.com/archives/C033BJ8BASU)でお問い合わせください
- Jacob 氏は _8 月 17 日 13:00 ET/10:00 PT_ の
  [OTel in Practice](/community/end-user/otel-in-practice/) で End User Working Group と再び対話します。
  ぜひ[カレンダーに登録](https://shorturl.at/cIJT2)してください！

## おわりに {#final-thoughts}

OpenTelemetry はコミュニティがすべてであり、コントリビューター、メンテナー、ユーザーなしでは今の私たちはありません。
ユーザーのフィードバックを大切にしています。ぜひ体験を共有し、OpenTelemetry の改善にご協力ください。

私たちとつながる方法:

- [CNCF コミュニティ Slack](https://communityinviter.com/apps/cloud-native/cncf) の
  [#otel-endusers チャンネル](/community/end-user/slack-channel/)
- 月例の
  [エンドユーザーディスカッショングループミーティング](/community/end-user/discussion-group/)
- [OTel in Practice セッション](/community/end-user/otel-in-practice/)
- [月例インタビュー / フィードバックセッション](/community/end-user/interviews-feedback/)
- [LinkedIn の OpenTelemetry](https://www.linkedin.com/groups/14081251)
- [OpenTelemetry ブログ](https://github.com/open-telemetry/opentelemetry.io/blob/368f811f81c27798a031b4c92024ecdd65cddc19/README.md?from_branch=main#submitting-a-blog-post)

[Mastodon](https://fosstodon.org/@opentelemetry) と
[X](https://x.com/opentelemetry)（旧 Twitter）で OpenTelemetry をフォローし、**#OpenTelemetry** ハッシュタグを使ってあなたのストーリーを共有してください！
