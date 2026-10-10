---
title: OpenTelemetry 計装エコシステムの探求
linkTitle: Ecosystem Explorer プロジェクトの最新情報
date: 2026-09-25
author: >-
  [Jay DeLuca](https://github.com/jaydeluca) (Grafana Labs)
issue: 11806
sig: Comms
body_class: otel-figure-captions
default_lang_commit: 097c3960ecb572d461cd4f6b14d9274f97e99150
cSpell:ignore: Isiaka Karimot
---

OpenTelemetry には多くの構成要素があります。
API、SDK、プロトコル、セマンティック規約、計装、そして Collector のようなツールです。
API とプロトコルはテレメトリーの作成と交換の方法を定義し、計装はアプリケーション内部で実際に何が起きているかを観測してテレメトリーに変換します。
セマンティック規約は、計装を書く人々に対して、観測対象を記述するための共通の方法を提供します。

このアプローチの優れた点は、まったく別々の作者が異なるライブラリを異なる言語で計装しても、同じ規約に従ったテレメトリーを生成できることです。
HTTP リクエストは、どのライブラリやどの言語が生成したかに関係なく、HTTP リクエストとして見えます。
ユーザーはその共通の理解に基づいて、クエリ、ダッシュボード、その他のツールを構築できます。
規約に合意しさえすれば、すべてが整合するはずです。

しかし、まだそうはなっていません。

規約は進化し、ドメインの安定化には何年もかかります。
HTTP は2019年6月に仕様に入りましたが、コア規約が安定版に達したのは2023年11月でした。
データベースはほぼ同時期に始まり、安定版に達したのは2025年5月でした。

{{< figure src="semconv-timeline.png" alt="Timeline comparing two semantic convention domains. HTTP enters the specification in June 2019, its core conventions reach stable in November 2023, and legacy attributes are listed in December 2023. Database enters in May 2019, goes through an attribute migration in May 2024, reaches release candidate in October 2024, and reaches stable in May 2025." caption="HTTP とデータベースのセマンティック規約のタイムライン。仕様への導入からコア規約の安定化まで。" >}}

エコシステム全体の計装ライブラリは、その後に追いつく必要があり、安定した規約はゴールラインというよりもスタートラインになります。
規約を公開しても、それを実装するコードが自動的に更新されるわけではなく、規約を読んでも、どのライブラリが変更を反映済みかはわかりません。
計装の確認自体も難しい場合があります。
計装が出力する内容は、設定やアプリケーションが実際に行う処理に依存することがあるためです。

規約が安定したとき、実装はどれくらい早く追従するのでしょうか。
属性やメトリクスがまだ欠けているのはどこでしょうか。
これらは、計装を調べて何が生成されるかを確認しない限り、答えるのが難しい問いです。
そして、それを体系的に行うには、まずどのコンポーネントが存在し、それぞれが何をするのかを知る必要があります。

[OpenTelemetry Ecosystem Explorer][explorer] は、OpenTelemetry エコシステムのコンポーネントをカタログ化し、各コンポーネントが何をするかを説明するウェブサイトです。
現在、[Java エージェント][java]と [Collector][collector] を閲覧でき、詳細なコンポーネント情報とリリース比較が提供されています。
Java の計装については、バージョンを選択すると、記述されたテレメトリーと設定オプションを確認できます。

これが現在の状態です。
私たちが目指しているのは、[semantic-conventions-conformance プロジェクト][conformance]からの測定結果をそのコンポーネント情報と統合し、実装の現状を示すとともに、メンテナーやコントリビューターが注力すべき領域を明確にすることです。

## この計装から何を期待すべきか {#what-should-i-expect-from-this-instrumentation}

計装を採用する前、またはアップグレードする前に、それが何を生成するかを知る必要があります。
どのスパンやメトリクスが記述されているのでしょうか。
それにどの属性が付随するのでしょうか。
どのシグナルに設定が必要で、実行中のバージョンから何が変わったのでしょうか。

Karimot Isiaka の最近の[ユーザーリサーチ][research]では、人々がドキュメント、リポジトリ、リリースノートからこれらの答えをどのようにつなぎ合わせているかが浮き彫りになりました。
Explorer はこれらの情報をバージョン固有のビューにまとめます。
Java の計装については、記述されたテレメトリーと設定オプションを確認し、リリース間を比較してアップグレードで何が変わるかを理解できます。

## 実装全体を見ると何がわかるのか {#what-happens-when-we-look-across-implementations}

1つのコンポーネントが何を記述しているかを知ることは出発点です。
実装がどこで遅れているかを把握するには、実際に動作させて、生成されるテレメトリーを確認する必要もあります。

それが [semantic-conventions-conformance プロジェクト][conformance]の役割です。
小さなテストシナリオを実行し、テレメトリーを収集し、Weaver の live-check 機能を使ってセマンティック規約と宣言された期待値と比較します。
現在の結果は JSON として公開されており、集約して分析することで、実装で欠けている属性、メトリクス、その他の期待されるシグナルを確認できます。

これを提示する際には注意が必要です。
あるシナリオで属性が観測されなかったことは、その計装がその属性を決して出力しないという証明にはなりません。
オプション属性は、何も問題がなくても存在しないことがあり、実験的やカスタムのテレメトリーも見えるようにする必要があります。

Java SIG はすでにこれを使って、Java エージェントの 3.0 リリースに向けた進捗を追跡しています。
データベース規約は安定化し、RPC とメッセージングでも進展がありました。
Java エージェントは [2.0][java-instrumentation-v2.0.0] で安定版 HTTP 規約を採用しましたが、監査によってギャップが見つかり、それらをその過程で修正しました。
これらのギャップが見えることで、SIG は作業の優先順位付けと進捗確認ができます。

この例は1つの言語からのものです。
HTTP クライアントについては、すでにより広い範囲を確認できます。
いくつかの言語が conformance プロジェクトにシナリオを持っているためです。

{{< figure src="across-implementations.png" alt="Matrix of HTTP client attributes against instrumentations from .NET, Go, Java, JavaScript, PHP, Python, and Ruby. The four required attributes, http.request.method, server.address, server.port, and url.full, are present in nearly every instrumentation. The two recommended attributes, network.peer.address and network.protocol.version, are present in far fewer." caption="7つの言語の conformance テスト実行で観測された、要件レベル別にグループ化された HTTP クライアント属性の一部。" >}}

このスナップショットでは、表示されている4つの必須属性はテストされたほぼすべての計装で観測されました。
表示されている2つの推奨属性は、観測の一貫性が低い結果となりました。
空のセルは、これらの実行で属性が観測されなかったことを意味し、その計装がその属性を決して出力できないという意味ではありません。

より多くのプロジェクトが構造化されたメタデータと再現可能な測定結果を提供するようになれば、同じ全体像をより多くのドメインに広げたいと考えています。
ライブラリ全体で繰り返し現れるギャップはどこでしょうか。
まだテストが不足しているのはどこでしょうか。

リリースに紐づいた繰り返しの測定があれば、その全体像がどのように変化するかも報告できるでしょう。
SIG は最近の作業でどのギャップが解消されたかを確認できます。
プロジェクトリーダーシップは、複数の SIG が同じ問題で支援を必要としている領域を特定できます。
コントリビューターは、計装ドメイン全体の一貫性を向上させる作業を見つけられます。

この種のデータがあれば、エコシステム全体を俯瞰できるようになります。
OpenTelemetry 全体で何がうまく機能しているか、どこで進展が起きているか、どこに支援が最も効果的か。
ダッシュボードやベンダー統合を構築している人にとっては、ある属性に依拠できるのか、フォールバックが必要なのか、あるいは修正をコントリビュートできるのかを判断する助けになるでしょう。

[提案されている OTel ポスト卒業ロードマップ][roadmap]は、計装ツールの改善、メンテナンスコストの削減、言語間でのセマンティック規約ツールのより広い活用を求めています。
これらのギャップを可視化することは、Explorer がこれらの目標に貢献できる方法の1つだと考えています。

現在、これらの結果は conformance プロジェクト内にピン留めされた実行からのレポートとして存在しており、Explorer のコンポーネントやリリースとの連携はまだこれからです。
ユーザーがコンポーネントを見て、そのカバレッジがどのように推移してきたか、類似の他のコンポーネントとどう比較できるかを確認できるようにしたいと考えています。

## この情報はどこから来るのか {#where-does-all-this-information-come-from}

ウェブサイトが表示できるのは、私たちが知っていることだけです。
その知識を収集し、コードの変更に合わせて最新に保つことに、作業の大部分がかかります。

Java では、[基本的なメタデータサポート][metadata-start]から[充実した計装カタログ][metadata-completion]に至るまで、1年以上かかりました。
この作業により、Java プロジェクトが独自のドキュメントやカタログで使用できる計装に関する構造化情報が作成され、Explorer はそれを利用して再活用しています。

この情報はプロジェクト自体にとって有用であるため、その労力には価値があると考えています。
一部はコードから生成でき、一部はメンテナーが意図や設定を記述する必要があり、一部は実際に何が起きているかを確認するためにランタイムチェックが必要です。
これらのソースを合わせることで、単独のソースよりもはるかに良い計装の理解が得られます。

これは、より多くのプロジェクトに [OpenTelemetry Weaver][weaver] を採用してもらいたい理由でもあります。
Weaver を使えば、プロジェクトはセマンティック規約レジストリでテレメトリースキーマを定義し、その定義を使ってドキュメントやコードを生成し、出力されたテレメトリーを検証できます。
プロジェクトがドキュメントだけから始めたとしても、テレメトリー定義を構造化して再利用可能にしたことになります。
コード生成は、プロジェクトにとって有用になった時点で、同じ出発点を基に構築できます。

私たちにとっての価値は、この情報のテレメトリー部分に共通の基盤があることです。
プロジェクトのドキュメントの背後にある定義は、バリデーションにも活用でき、Explorer のような消費者に構造化されたデータを提供できます。
メンテナーは自身のワークフローで価値を得られ、私たちはコンポーネントが記述するシグナルを理解するためのより明確な出発点を持てます。

それでも、答えるべき問いは他にもあります。
コンポーネントはどのライブラリバージョンをサポートしているのでしょうか。
どの設定でシグナルが有効になるのでしょうか。
特定のテストで実際に何が観測されたのでしょうか。
テレメトリーレジストリは、コンポーネントメタデータやランタイムエビデンスとともに、その全体像の一部です。

他のエコシステムでは出発点が異なるでしょう。
既存のフォーマットやツールと連携できます。
Weaver の採用は推奨しますが、参加のための前提条件とは限りません。
有用な出発点は、コンポーネント、人々がそれについて抱く疑問、そしてプロジェクトがすでに持っている回答に役立つ情報です。

## OpenTelemetry 外のプロジェクトについて {#what-about-projects-outside-opentelemetry}

同じ問いが、OpenTelemetry 組織の外部でメンテナンスされているライブラリやプロジェクトにも当てはまります。
あるライブラリが OpenTelemetry 互換またはネイティブと謳っている場合、ユーザーはそれが何を意味するのか期待できるのでしょうか。
メンテナーはそれをどのように実証し、その情報を最新に保てるのでしょうか。

将来的に Explorer への掲載を検討しているメンテナーにとって、これは有用な準備になります。
プロジェクトが出力する予定のテレメトリーを定義し、それを生成するコンポーネントと設定を記述し、リリースとともにそれらの記述を公開してください。
Weaver レジストリは、テレメトリー定義に再利用可能な場所を提供します。
コンポーネントメタデータと再現可能なチェックを組み合わせれば、プロジェクトを Explorer に取り込む際により多くの基盤が得られ、その間にユーザーにも有用な情報を提供できます。

最近の[エコシステムレジストリの凍結][registry-freeze]がこの問題を浮き彫りにしました。
メンテナーがバリデーションに充てられる時間やツールよりも多くの登録申請があり、プロジェクトを掲載するだけでは、その統合が実際に何をするかをユーザーに伝えるには不十分でした。

長期的には、プロジェクトが再現可能なチェックによって特定の主張を実証できるようにしたいと考えています。
どのシグナルを出力するのか、どの規約に従うのか、テストシナリオからのテレメトリーは該当する要件を満たしているのか。
他の人がチェックを再現するには、レポートに以下を含める必要があります。

- テスト対象のリリース
- 有効な設定オプションとその内容
- 実行されたシナリオ
- チェック対象のセマンティック規約バージョン

プロジェクトは開発の一環としてこれを実行し、リリースとともに更新されたエビデンスを公開できます。

提案されている [OpenTelemetry Support Self-Assessment and Maintainer Guidance プロジェクト][self-assessment]は、関連する目標を記述しています。
メンテナーが自分で実行できるツールと、さまざまな種類のプロジェクト向けのガイドです。
この提案では結果をプロジェクトのメンテナーに委ねており、共有を選択した場合は、そのエビデンスをコンポーネント情報とともに Explorer で発見可能にすることを検討できます。

サードパーティのオンボーディングと受け入れ基準については、まだやるべきことや検討すべきことがあります。
レジストリの議論では Explorer をその後継として挙げていますが、まだそれを引き受ける準備はできていません。
セマンティック規約チェックは良い出発点を提供しますが、他の互換性の主張も確実に必要になり、それぞれ独自のチェックが必要になるでしょう。

## 私たちと一緒にこの課題に取り組みましょう {#help-us-work-through-this}

公開された Java エージェント計装カタログと、他の言語やコンポーネントに向けた進行中のワークストリームがあります。
まだ取り組む必要があるのは、この情報をエコシステム全体で再利用可能にする方法です。
同じ問いを検討している他の SIG からの意見を聞きたいと考えています。
ユーザーにとって実際に役立つエビデンスは何でしょうか。

計装をメンテナンスしている方は、1つのコンポーネントから始めてください。
そのソース、設定、ドキュメント、テストからすでに何がわかりますか。
何を生成でき、何にランタイムチェックが必要ですか。
その例を [Explorer プロジェクト][project]に持ち込んで、情報を再利用可能にする方法を一緒に検討しましょう。
[conformance プロジェクト][conformance]も、出力されたテレメトリーの測定を支援する場所です。

すでに Weaver でテレメトリーを定義している方は、有用な出発点をお持ちです。
レジストリとサンプルコンポーネントを [Explorer プロジェクト][project]のイシューで共有し、Explorer に回答してほしい質問も添えてください。
異なるエコシステムからの例は、統合がどうあるべきかを検討する助けになります。

[explorer]: https://explorer.opentelemetry.io/
[java]: https://explorer.opentelemetry.io/java-agent
[collector]: https://explorer.opentelemetry.io/collector
[java-instrumentation-v2.0.0]: https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/tag/v2.0.0
[project]: https://github.com/open-telemetry/opentelemetry-ecosystem-explorer
[research]: https://github.com/open-telemetry/opentelemetry-ecosystem-explorer/blob/9893616a9042eaf2670882e5e55fad4ab12584cf/projects/ux-research-and-info-arc/user-interview-synthesis.md
[conformance]: https://github.com/open-telemetry/semantic-conventions-conformance
[weaver]: https://github.com/open-telemetry/weaver
[metadata-completion]: https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/e661d314d032e30aea0db8b4030a64a20aae17ae/docs/instrumentation-list.yaml?from_branch=main
[metadata-start]: https://github.com/open-telemetry/opentelemetry-java-instrumentation/issues/13468
[roadmap]: https://github.com/open-telemetry/community/pull/3452
[registry-freeze]: https://github.com/open-telemetry/opentelemetry.io/issues/11377
[self-assessment]: https://github.com/open-telemetry/community/pull/3435
