---
title: 'エンドユーザー Q&A シリーズ: Farfetch での OTel の活用'
linkTitle: 'エンドユーザー Q&A: Farfetch での OTel'
date: 2023-06-07
author: '[Adriana Villela](https://github.com/avillela) (Lightstep)'
body_class: otel-with-contributions-from
default_lang_commit: 7b845384b1b55e20b254d452d4dcf45e983e243c
cSpell:ignore: Dyrmishi Farfetch
---

[Rynn Mancuso](https://github.com/musingvirtual)（Honeycomb）と
[Reese Lee](https://github.com/reese-lee)（New Relic）の協力のもと作成。

2023年5月25日（木）、OpenTelemetry（OTel）End User Working Group は 2023 年第 3 回の
[エンドユーザー Q&A セッション](/community/end-user/interviews-feedback/)を開催しました。
KubeCon Europe のため少し間が空きましたが、戻ってきました！
このシリーズは、本番環境で OpenTelemetry を使用しているチームとの月例カジュアルディスカッションです。
チームの環境、成功事例、直面している課題について学び、コミュニティと共有することで、ともに OpenTelemetry をより良いものにしていくことを目的としています。

今月は、[Farfetch](https://www.farfetch.com) のプラットフォームエンジニアである
[Iris Dyrmishi](https://www.linkedin.com/in/iris-dyrmishi-b15a9a164/) 氏にお話を伺いました。

## 概要 {#overview}

Iris 氏は[オブザーバビリティ](/docs/concepts/observability-primer/)と OpenTelemetry の熱烈なファンであり、彼女のこれら 2 つのトピックへの情熱は非常に感染力があります。

このセッションで Iris 氏が共有した内容は以下のとおりです。

- Farfetch の OpenTelemetry への道のり
- メトリクスとトレースの計装方法
- OpenTelemetry Collector のデプロイと設定

## Q&A {#qa}

### あなたの役割を教えてください {#tell-us-about-your-role}

Iris 氏は、Farfetch 全体のエンジニアリングチームにサービス監視ツールを提供する中央チームに所属しています。
トレース、メトリクス、ログ、アラートなどを対象としています。
チームはオブザーバビリティツールの保守、オブザーバビリティツールに関連するデプロイの管理、OpenTelemetry を使用したコードの計装についてチームを教育する責任を担っています。

Iris 氏はソフトウェアエンジニアとしてキャリアをスタートし、バックエンド開発に注力していました。
その後、DevOps エンジニアリングの役割に移り、そこで [Amazon CloudWatch](https://aws.amazon.com/cloudwatch/) や [Azure App Insights](https://azure.microsoft.com/en-ca/products/monitor) などの製品を通じてクラウド監視に出会いました。
監視について学ぶほど、それが彼女の情熱になっていきました。

その後、別の役割に移り、OpenTelemetry、Prometheus、Grafana に出会い、オブザーバビリティの世界をより深く探求する機会を得ました。
この役割が、1年以上前から担当している Farfetch での現在の役割への足がかりとなりました。

### OpenTelemetry をどのように知りましたか {#how-did-you-hear-about-opentelemetry}

Iris 氏が初めて OpenTelemetry を知ったのは LinkedIn でした。
当時勤めていた会社は[トレース](/docs/concepts/signals/traces/)を使用しておらず、トレースの使用を検討し始め、トレーシングソリューションを探していました。
OpenTelemetry について読んだ後、Iris 氏はマネージャーのために小さな概念実証（POC）を作成しました。
その役割では POC から先に進むことはありませんでしたが、Iris 氏が Farfetch に入社し、OpenTelemetry が再び話題になったとき、彼女はこの機会に飛びつきました。

### Farfetch のアーキテクチャはどのようなものですか？ OpenTelemetry はどのように役立っていますか？ {#what-is-the-architecture-at-farfetch-like-how-has-opentelemetry-helped}

Farfetch には現在 2000 人のエンジニアがおり、クラウドネイティブ、Kubernetes、3 つの異なるクラウドプロバイダー上で動作する仮想マシンを含む、複雑で多様なアーキテクチャを持っています。
あらゆるところから大量の情報が流れ込んでおり、この情報を収集する方法の標準化が不足していました。
たとえば、Prometheus はメトリクス収集の標準として主に使用されていましたが、場合によっては Prometheus がニーズに合わないことをエンジニアが見つけることもありました。
OpenTelemetry の導入により、Farfetch は[メトリクス](/docs/concepts/signals/metrics/)と[トレース](/docs/concepts/signals/traces/)の両方の収集を標準化でき、以前はシグナル収集ができなかったサービスからも[テレメトリーシグナル](/docs/concepts/signals/)を収集できるようになりました。

### Farfetch のビルドとデプロイのプロセスを説明してください {#can-you-describe-the-build-and-deployment-process-at-farfetch}

Farfetch は CI/CD に Jenkins を使用しており、これを管理する専門チームがあります。

### どのようなオブザーバビリティツールを使用していますか {#what-observability-tooling-do-you-use}

Iris 氏のチームは主にオープンソースツールを使用しており、チームが作成した社内ツールも併用しています。
オープンソースツールとしては以下のとおりです。

- [Grafana](https://grafana.com) をダッシュボードに使用
- OpenTelemetry をトレースの送信に使用し、[Grafana Tempo](https://grafana.com/oss/tempo/) をトレーシングバックエンドとして使用
- [Jaeger](https://jaegertracing.io) は、一部のチームがまだ OpenTelemetry でのトレース計装に完全に移行していないため、トレースの送信とトレーシングバックエンドとして引き続き使用されているケースがある（[Jaeger の OpenTracing API 実装経由](https://medium.com/velotio-perspectives/a-comprehensive-tutorial-to-implementing-opentracing-with-jaeger-a01752e1a8ce)）
- [Prometheus Thanos](https://github.com/thanos-io/thanos)（高可用性 Prometheus）をメトリクスの収集とストレージに使用
- OpenTelemetry もメトリクスの収集に使用

### Farfetch の OpenTelemetry への道のりについて教えてください {#tell-us-about-farfetchs-opentelemetry-journey}

Farfetch は非常にオブザーバビリティを重視する組織であり、シニアリーダーシップが OpenTelemetry の組織への導入を提案したとき、組織全体から圧倒的な支持を得ました。
OpenTelemetry に関する最大の課題は実装のタイミングでしたが、OpenTelemetry の作業が始まると、全員がそれを受け入れました。

### あなたとチームはどのように OpenTelemetry を通じてオブザーバビリティを実現しましたか {#how-did-you-and-your-team-enable-observability-through-opentelemetry}

Iris 氏が Farfetch に入社したころには、オブザーバビリティに関する大きな苦労や課題はほとんど解決されていました。
オブザーバビリティが組織内で初めて導入されたとき、多くのエンジニアにとってそれは非常に新しく未知のものであり、あらゆる新しいものと同様に学習曲線がありました。

Iris 氏とチームが組織全体で OpenTelemetry を有効にする作業に取り組んだとき、オブザーバビリティの概念はすでに受け入れられていました。
Farfetch に OpenTelemetry を導入する上での最大の課題は、エンジニアの業務に大きな混乱を与えないようにしながら、OpenTelemetry を導入するメリットを享受できるようにすることでした。
OpenTelemetry が Jaeger や Prometheus を含む既存のオブザーバビリティスタックの多くのツールと互換性があることが助けになりました。

Iris 氏と Farfetch のアーキテクトである同僚の一人が示した熱意、推進力、後押しにより、Iris 氏は現在 OpenTelemetry を本番環境で使用していることを誇らしげに共有しました。

### チームが OpenTelemetry を本番環境に導入するまでどのくらいかかりましたか {#how-long-did-it-take-your-team-to-get-opentelemetry-in-production}

Iris 氏とチームは 2023 年 1 月に OpenTelemetry の使用を開始する計画を立てました。
これには初期調査と情報収集が含まれていました。
3 月中旬までに、最初のコンポーネントを本番環境に導入しました。

まだ完全には達成されていません。

- メトリクスとトレースの生成について、Prometheus と Jaeger への依存が依然として多い
- すべてのアプリケーションが OpenTelemetry で計装されているわけではない

それにもかかわらず、Iris 氏とチームは [OpenTelemetry Collector](/docs/collector/) の力を活用して、メトリクスとトレースをさまざまなオブザーバビリティバックエンドに収集・送信しています。
OpenTelemetry の使用を開始して以来、より多くのトレースを計装するようになりました。
実際、現在のセットアップにより、1 秒あたり 1,000 スパンの処理から 1 秒あたり 40,000 スパンの処理へと拡大したことを Iris 氏はうれしそうに報告しました。

### 現在、トレースはどのように収集していますか {#how-are-you-collecting-your-traces-right-now}

トレースは[手動計装と自動計装](/docs/concepts/instrumentation/)の組み合わせで収集されています。

一部のアプリケーションは OpenTelemetry で手動計装されており、その他はレガシーの OpenTracing を使用して計装されています。
[shim の使用](/docs/migration/opentracing/)により移行が行われています。

OpenTelemetry Operator は Java と .NET コードの自動計装を実装するために使用されています。
特に、[OTel Operator](/docs/platforms/kubernetes/operator/) はインジェクションと .NET、Java、Python、Node.js での[自動計装の設定](/docs/platforms/kubernetes/operator/automatic/#configure-automatic-instrumentation)をサポートしています。
Iris 氏は Go の自動計装が近い将来利用可能になることを期待しています。
Go での自動計装の進捗を追跡するには、[OpenTelemetry Go Automatic Instrumentation](https://github.com/open-telemetry/opentelemetry-go-instrumentation) を参照してください。

これは長期にわたる時間のかかるプロセスになりますが、チームの目標はすべてのアプリケーションを OpenTelemetry で計装することです。

### チームは手動計装にどのようなサポートを提供していますか {#what-kind-of-support-does-your-team-provide-for-manual-instrumentation}

設計上、Iris 氏とチームは他のチームのコードを計装しません。
かわりに、手動計装に関するドキュメントとガイドラインを提供し、必要に応じて OpenTelemetry のドキュメントを参照するようチームに案内しています。
また、エンジニアとのセッションを行い、自分たちのコードを計装するためのベストプラクティスを紹介しています。
チームスポーツです！

### OTel Operator の使用経験を共有してください {#can-you-share-your-experience-around-using-the-otel-operator}

OTel Operator は本番環境で部分的にのみ使用されており、現在はすべてのユーザーに提供されていません。
Iris 氏とチームは OTel Operator をとても気に入っていますが、慣れるまでに少し時間がかかりました。
Iris 氏とチームは、[cert-manager](https://cert-manager.io/) と OTel Operator の間に密結合があることに気づきました。
独自のカスタム証明書を使用することができず、クラスターで [cert-manager](https://cert-manager.io/) をサポートしていなかったため、クラスターで Operator を使用するのが難しいと感じました。
これを解決するために PR を提出しました。
[opentelemetry-helm-charts PR #760](https://github.com/open-telemetry/opentelemetry-helm-charts/pull/760)！

彼女が OpenTelemetry を気に入っている点の 1 つは、Prometheus が Collector にメトリクスを送信しない問題のトラブルシューティング中に、アラートを作成できなくなった際のことでした。
そのとき、同僚が OpenTelemetry を使って OpenTelemetry をトラブルシュートすることを提案しました。

### あなたやチームのメンバー、Farfetch の誰かが OTel Logging を試し始めていますか {#have-you-or-anyone-on-your-team-or-at-farfetch-started-playing-with-otel-logging}

Iris 氏は OTel の[ロギング](/docs/concepts/signals/logs/)を少し試しており、主に [Kafka トピック](https://developer.confluent.io/learn-kafka/apache-kafka/topics/)からログを消費しています。
この実験には[ログ相関](/docs/specs/otel/logs/#log-correlation)は含まれていませんが、今後探求したいと考えています。

ログはまだ安定版ではないため、Iris 氏は Farfetch で OTel ロギングがすぐに本番環境に入ることは期待していません。
Farfetch には膨大な量のログ（トレースよりも多い）があるため、状況がより安定するまで OTel ロギングへの変換を開始したくないとのことです。

> **Note**: OTel ログの一部は安定版です。
> 詳細は[仕様ステータス概要](/docs/specs/status/#logging)を参照してください。

### メトリクスシグナルはどのように収集していますか {#how-are-you-collecting-the-metrics-signal}

自動計装がいくつかの [OTLP](/docs/specs/otlp/) メトリクスを出力していますが、メトリクスの大部分はまだ Prometheus から取得しています。

チームは現在、[Prometheus レシーバー](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/c9585747e97d1ba5a0aae3bee72eaf76438951f4/receiver/prometheusreceiver/README.md?from_branch=main)を使用して [Consul](https://consul.io) からメトリクスをスクレイプしています。
具体的には、Consul を使用してターゲットとスクレイプ先のポートを取得しています。
[レシーバーのスクレイプ設定](https://github.com/prometheus/prometheus/blob/v2.28.1/docs/configuration/configuration.md#scrape_config)は Prometheus と同じであるため、Prometheus から Prometheus レシーバーへの移行（リフト・アンド・シフト）は比較的容易でした。

また、Kubernetes から OTLP メトリクスを収集する計画もあります。
これは Prometheus レシーバーが [OTel Operator の Target Allocator](https://github.com/open-telemetry/opentelemetry-operator#target-allocator) をサポートしていることで容易になります。

Prometheus はその他の領域でもメトリクス収集に引き続き使用されており、特に仮想マシンからメトリクスを収集する場合はおそらくこのまま使われ続けるでしょう。

### いくつの Kubernetes クラスターを監視していますか {#how-many-kubernetes-clusters-are-you-observing}

監視している Kubernetes クラスターは 100 個あり、仮想マシンは数千台あります。
Iris 氏とチームは、これらすべてのクラスターにおける OTel Operator の管理を担当しており、クラスター上のスタックを維持できるよう Kubernetes のトレーニングも受けています。

### Kubernetes の OTel 実験的機能を試しましたか {#have-you-dabbled-in-any-of-the-otel-experimental-features-in-kubernetes}

> この質問は、Kubernetes コンポーネントが OTLP トレースを出力し、OTel Collector で消費できる機能に関するものです。
> 詳細は [Traces For Kubernetes System Components](https://kubernetes.io/docs/concepts/cluster-administration/system-traces/) を参照してください。
> この機能は現在ベータ版であり、[Kubernetes 1.25](https://sysdig.com/blog/kubernetes-1-25-whats-new/) で初めて導入されました。

Iris 氏とチームはこのベータ機能を試していません。

### OTel Collector はどのようにデプロイしていますか {#how-do-you-deploy-your-otel-collectors}

Kubernetes クラスターが多数あるため、単一の OTel Collector ではロードとシングルポイントオブフェイルの観点からボトルネックになります。
チームは現在、Kubernetes クラスターごとに 1 つの [OpenTelemetry Collector エージェント](/docs/collector/deploy/agent/)を配置しています。
最終的な目標は、これらのエージェントを [OTel Operator](/docs/platforms/kubernetes/operator/) に置き換えることです。
OTel Operator により、OTel Collector のデプロイと設定、および自動計装のインジェクションと設定が可能になります。

すべてのデータはデータセンターごとの集中型 OTel Collector（すなわち [OTel Collector ゲートウェイ](/docs/collector/deploy/gateway/)）に送信されます。
ここでデータマスキング（[transform プロセッサー](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/635d4254a3018eb3ca8f1736e71fcb54f8ed6e5a/processor/transformprocessor?from_branch=main)または [redaction プロセッサー](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/635d4254a3018eb3ca8f1736e71fcb54f8ed6e5a/processor/redactionprocessor?from_branch=main)）、データサンプリング（たとえば [tail sampling プロセッサー](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/635d4254a3018eb3ca8f1736e71fcb54f8ed6e5a/processor/tailsamplingprocessor?from_branch=main)または [probabilistic sample プロセッサー](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/635d4254a3018eb3ca8f1736e71fcb54f8ed6e5a/processor/probabilisticsamplerprocessor?from_branch=main)）などの処理が行われます。
その後、トレースを Grafana Tempo に送信します。

集中型 OTel Collector は、Farfetch のオブザーバビリティチーム専用の別の Kubernetes クラスター上に配置されており、Collector とチームに属する他のアプリケーションを実行しています。

### 集中型 Collector に障害が発生したらどうなりますか {#what-happens-if-the-central-collector-fails}

チームにはフォールバッククラスターがあり、集中型 Collector に障害が発生した場合、フォールバッククラスターがかわりに使用されます。
サテライトクラスターはフォールバッククラスター上の集中型 Collector にデータを送信するよう設定されているため、集中型クラスターに障害が発生しても、OTel データフローを中断することなくフォールバッククラスターを立ち上げることができます。

オートスケーリングポリシーを設定して、Collector がデータ負荷を処理するのに十分なメモリと CPU を確保することも、システムの高可用性維持に役立っています。

### OTel Collector のデプロイで経験した課題は何ですか {#what-were-some-of-the-challenges-you-experienced-in-deploying-the-otel-collector}

最大の課題は、Collector を理解し、効果的に使用する方法を習得することでした。
Farfetch はオートスケーリングに大きく依存しているため、チームが最初に行ったことの 1 つは Collector のオートスケーリングを有効にし、大量のデータを処理できるよう設定を調整することでした。

チームはまた、[OTel Helm charts](https://github.com/open-telemetry/opentelemetry-helm-charts/tree/2c6541c9914ea7ad82c00884af7fc28385fd522d/charts?from_branch=main) と OTel コミュニティに大いに頼りました。

現在 OTel Collector でプロセッサーを使用していますか？\
チームは現在、プロセッサーを試験的に使用しています。主にデータマスキング（[transform プロセッサー](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/635d4254a3018eb3ca8f1736e71fcb54f8ed6e5a/processor/transformprocessor?from_branch=main)または [redaction プロセッサー](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/635d4254a3018eb3ca8f1736e71fcb54f8ed6e5a/processor/redactionprocessor?from_branch=main)）のためです。
特に OTel ログの使用に移行するにあたり、オブザーバビリティバックエンドに送信したくない機密データが含まれるためです。
ただし、現時点では [batch プロセッサー](https://github.com/open-telemetry/opentelemetry-collector/blob/b3125cea266d6453df1bd48a17686f752f7d07d9/processor/batchprocessor/README.md?from_branch=main)のみを使用しています。

### スパンイベントを使用しているチームを知っていますか {#are-you-aware-of-any-teams-using-span-events}

> [スパンイベント](/docs/concepts/signals/traces/#span-events)は、トレース内の追加的なポイントインタイム情報を提供します。
> 基本的にはスパン内の構造化ログです。

現時点ではありませんが、今後探求したいと考えています。
オブザーバビリティチームが活動を開始した当初、トレーシングへの関心はあまりありませんでした。
OpenTelemetry とトレーシングの実装を開始すると、トレースをファーストクラスの要素として位置づけるようになり、エンジニアたちがトレースの有用性に気づき始めて関心が高まっています。

### OpenTelemetry に抵抗する人に出会ったことはありますか {#have-you-encountered-anyone-who-was-resistant-to-opentelemetry}

Farfetch は非常にオブザーバビリティを重視する文化があり、オブザーバビリティチームはオブザーバビリティや OpenTelemetry に反対する人にはほとんど出会っていません。
一部のエンジニアはどちらでもよいと思っているかもしれませんが、反対しているわけではありません。

### あなたやチームは OpenTelemetry にコントリビューションしましたか {#have-you-or-your-team-made-any-contributions-to-opentelemetry}

チームはアーキテクトの主導のもと、証明書に関する OTel Operator へのコントリビューションを最近行いました。
OTel Operator はカスタム証明書ではなく [cert-manager](https://cert-manager.io/) の証明書に依存していました。
最初はフィーチャーリクエストを提出しましたが、その後自分たちで機能を開発することにし、[プルリクエストを提出](https://github.com/open-telemetry/opentelemetry-helm-charts/pull/760)しました。

## 聴衆からの質問 {#audience-questions}

### メモリと CPU はどれくらいですか {#how-much-memory-and-cpu}

Collector が 1 秒あたり約 30,000 スパンを処理していたとき、Collector のインスタンスは 4 つあり、約 8GB のメモリを使用していました。

### メトリクスデータ、トレースデータ、ログデータ間の相関を行っていますか {#are-you-doing-any-correlation-between-metrics-data-trace-data-and-log-data}

現在検討中の内容です。
チームは OpenTelemetry を通じて[トレースとメトリクスの相関（エグザンプラー）](/docs/specs/otel/metrics/data-model/#exemplars)を探求しています。
ただし、この相関はトレーシングバックエンドの Tempo を通じた方がより容易に実現できることがわかりました。

### 生成、転送、収集するデータ量について懸念はありますか？ データ品質はどのように確保していますか？ {#are-you-concerned-about-the-amount-of-data-that-you-end-up-producing-transporting-and-collecting-how-do-you-ensure-data-quality}

これは懸念事項ではありません。データ量は変わっておらず、チームはこの大量のデータを処理できることを把握しています。
チームは単にデータの生成、転送、収集の方法を変更しているだけです。
Iris 氏はトレースデータの量が徐々に増加していることも認識しています。
ただし、データの増加は段階的であるため、チームはより大きなデータ量を処理するための準備ができます。

チームは品質の高いデータを取得することに注力しています。
これは特にメトリクスにおいて当てはまり、意味のあるデータを処理していることを確認するためにメトリクスデータをクリーンアップしています。
あるチームが出力するメトリクスの量を大幅に増加させる場合、増加が妥当かどうかを確認するために事前にオブザーバビリティチームに相談されます。

トレース量は当初少なかったため、トレースサンプリングについて心配する必要はありませんでした。
現在トレース量が増加しているため、注意深く監視しています。

チームはログのデータ品質と量にも注力しており、ニーズに合うログプロセッサーを調査しています。
最終的には、開発チームが従うべきガイドラインのセットを公開し、社内でプラクティスを広める予定です。

## フィードバック {#feedback}

Iris 氏とチームは、OpenTelemetry と OpenTelemetry コミュニティに対して非常に良い経験をしています。

### ドキュメント {#documentation}

Iris 氏は、ドキュメントがときに十分に明確でないことがあり、特定のコンポーネントがどのように動作するか、またはどのように設定すべきかを理解するためにエンジニアが追加の調査を必要とすることがあると共有しました。
たとえば、OpenTelemetry の [Consul SD 設定](https://prometheus.io/docs/prometheus/latest/configuration/configuration/)に関するドキュメントを見つけるのに苦労しました。
とはいえ、Iris 氏はドキュメントの改善に貢献したいと考えています。

### PR のターンアラウンドタイム {#turnaround-time-on-prs}

Iris 氏とチームは、[OTel Operator PR](https://github.com/open-telemetry/opentelemetry-helm-charts/pull/760) の承認とマージが素早く行われたことに良い意味で驚きました。

## その他のリソース {#additional-resources}

Iris 氏との会話の全編は [YouTube で公開](https://youtu.be/9iaGG-YZw5I)されています。

Iris 氏との会話を続けたい方は、[#otel-user-research](https://cloud-native.slack.com/archives/C01RT3MSWGZ) Slack チャンネルでご連絡ください！

また、[6 月 8 日の OTel in Practice](https://www.meetup.com/opentelemetry-in-practice-meetup-group/) で発表する予定です。

## おわりに {#final-thoughts}

OpenTelemetry はコミュニティがすべてであり、コントリビューター、メンテナー、ユーザーなしでは今の私たちはありません。
OpenTelemetry が実際にどのように実装されているかのストーリーを聞くことは全体像の一部にすぎません。
ユーザーのフィードバックを大切にしており、すべてのユーザーの皆さんに体験を共有していただき、OpenTelemetry の改善を続けていくことを推奨しています❣️

あなたの組織で OpenTelemetry をどのように使用しているかのストーリーを共有していただける方は、ぜひお聞かせください！
共有方法:

- [CNCF Community Slack](https://communityinviter.com/apps/cloud-native/cncf) の
  [#otel-endusers チャンネル](/community/end-user/slack-channel/)に参加する
- 月例の
  [エンドユーザーディスカッショングループミーティング](/community/end-user/discussion-group/)に参加する
- [OTel in Practice セッション](/community/end-user/otel-in-practice/)に参加する
- [月例インタビュー / フィードバックセッション](/community/end-user/interviews-feedback/)に申し込む
- [LinkedIn の OpenTelemetry グループ](https://www.linkedin.com/groups/14081251)に参加する
- [OpenTelemetry ブログ](https://github.com/open-telemetry/opentelemetry.io/blob/368f811f81c27798a031b4c92024ecdd65cddc19/README.md?from_branch=main#submitting-a-blog-post)でストーリーを共有する

[Mastodon](https://fosstodon.org/@opentelemetry) と [Twitter](https://twitter.com/opentelemetry) で OpenTelemetry をフォローし、**#OpenTelemetry** ハッシュタグを使ってあなたのストーリーを共有してください！
