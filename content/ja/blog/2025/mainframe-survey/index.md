---
title: メインフレームにおける OpenTelemetry の優先事項の探求 - アンケート回答からのインサイト
linkTitle: メインフレームにおける OpenTelemetry のアンケートインサイト
date: 2025-10-10
author: '[Ruediger Schulze](https://github.com/rrschulze) (IBM)'
canonical_url: https://openmainframeproject.org/blog/exploring-opentelemetry-priorities-for-mainframes-insights-from-survey-responses/
issue: https://github.com/open-telemetry/opentelemetry.io/issues/7870
sig: SIG OpenTelemetry on Mainframes
default_lang_commit: 90678a748050ca7fb9614c39c1c077a248e9a279
cSpell:ignore: CICS Datacom HLASM IDMS REXX Ruediger Schulze VSAM
---

メインフレームのオブザーバビリティを向上させるために、ユーザーが最も重要と考える [OpenTelemetry](/) の機能は何でしょうか。
今年初め、[OpenTelemetry on Mainframes Special Interest Group](https://github.com/open-telemetry/community/?tab=readme-ov-file#sig-mainframes)（SIG）と [Open Mainframe Project](https://openmainframeproject.org/) は、この問いに答えるために[アンケート](/blog/2025/otel-mainframe-priorities-survey/)を実施しました。
このブログでは、アンケート結果の詳細な概要を紹介します。

## 背景と目的 {#background-and-purpose}

OpenTelemetry プロジェクトは、あらゆるソースからあらゆるターゲットへ高品質でポータブルなテレメトリーを提供することで、効果的なオブザーバビリティを実現することを目指しています。
このプロジェクトは現在、仕様と実装を網羅する 90 のリポジトリを [GitHub 上](https://github.com/open-telemetry/)でホストしています。
OpenTelemetry on Mainframes SIG が設立された際、メインフレームにおいて最も重要な OpenTelemetry コンポーネントを有効にすることを使命とし、セマンティック規約、プログラミング言語 SDK、および OpenTelemetry Collector の拡張の 3 つの重点領域に注力しました。
OpenTelemetry プロジェクトの広範なスコープとメインフレームの高度なアーキテクチャを考慮すると、メインフレームで OpenTelemetry の機能を最大限に活用するためには、ユーザーの優先事項を十分に理解することが不可欠であることがすぐに明らかになりました。
アンケート結果が出揃った今、SIG はメインフレームプラットフォームでの OpenTelemetry の採用を加速するための活動に優先順位を付け、実施していきます。

## 主な知見 {#key-insights}

メインフレーム SIG の活動に優先順位を付けるための主な知見を以下に示します。

1. メインフレームコミュニティ内で OpenTelemetry の専門知識を向上させる。
   OpenTelemetry 初心者 26 人のうち 21 人は 10 年以上のメインフレーム経験を持っていますが、11 人はその機能についてまったく知識がないと回答しています。
2. System Performance メトリクスのセマンティック規約を優先し、続いて Job Processing、Databases、Applications を優先する。
   回答者のうち 30 人が OpenTelemetry はまずメトリクスに注力すべきだと考えており、メトリクスのカテゴリについて尋ねたところ、約 32 人がシステムメトリクスを最優先事項として挙げました。
3. z/OS 向けの Java および Python SDK を優先し、COBOL SDK を開発する。
   Java（25 人）と Python（20 人）の SDK を希望するすべての回答者が、z/OS 向けの OpenTelemetry SDK も必要としています。
   COBOL SDK は 26 人から要望があり、Java SDK と同等の重要度でした。
4. OpenTelemetry Collector を使用して System Performance および Platform メトリクスを収集する方法を評価する。
   回答によると、30 人の参加者がエージェントとしてデプロイされた OpenTelemetry Collector で System Performance および Platform メトリクスを収集することに関心を示しました。
   28 人が Mainframe Operations を主なユーザーとして特定し、27 人が OpenTelemetry 形式の System Performance メトリクスを自組織にとって最も重要と評価しました。

## 貢献方法 {#ways-to-contribute}

コントリビューターや組織の皆さんに、[OpenTelemetry on Mainframes SIG](https://github.com/open-telemetry/community/?tab=readme-ov-file#sig-mainframes) への参加を呼びかけます。
アンケートで明らかになった優先事項のオーナーシップを持ち、OpenTelemetry プロジェクトのコントリビューターになりましょう。
たとえば、コード計装やポーティングの取り組みに参加してください。

- linux/s390x 用のセルフホスト GitHub Action ランナーの統合をサポートし、s390x プラットフォーム上での OpenTelemetry コンポーネントの継続的インテグレーション・デリバリーおよび自動検証を可能にする
- zos/s390x および linux/s390x における SDK のコミュニティサポートを拡大する。
  選定された OpenTelemetry SDK が z/OS および Linux on s390x で完全にサポートされ、メンテナンスされるようにする
- s390x プラットフォーム向けの SDK 最適化を実装する。
  パフォーマンスと互換性の改善に貢献し、メインフレーム上での OpenTelemetry の潜在能力を最大限に引き出す
- COBOL 向けの OpenTelemetry サポートを有効にする。
  堅牢な COBOL SDK の開発に協力し、レガシーアプリケーションに最新のオブザーバビリティ機能を提供する

## 調査方法 {#methodology}

アンケートは 2 つのセクションで構成されていました。
最初のセクションでは、回答者の役割と経歴に関する情報を収集しました。
2 番目のセクションでは、メインフレームで OpenTelemetry を有効にするための回答者の組織の優先事項を収集しました。
合計で、回答者は 20 の質問に答えるよう求められました。
アンケートは 1 月中旬から 2 か月間公開され、OpenTelemetry および Open Mainframe Project のブログやメインフレームカンファレンスを通じて告知されました。
アンケートには 45 件の回答が寄せられました。
すべての回答が結果に反映されています。
最小限のデータクレンジングのみが適用されました。
回答数がわずか 45 件であるため、サンプルサイズは統計的に有意な結果を出すには小さすぎます。
組織はこれらの結果に基づいて意思決定を行うべきではありません。
それでも、このアンケートは優先事項に関する初期的なインサイトを提供しており、メインフレーム SIG は上述のとおり、その一部の活動に反映させていきます。

## 詳細な回答結果 {#comprehensive-responses}

### 質問 1: あなたの組織での主な役割は何ですか？ {#question-1-what-is-your-primary-role-within-your-organization}

多様な役割から回答が寄せられました。
回答の半数以上（26 件）は、マネージャー、IT およびソフトウェアアーキテクト、システムプログラマーからのものでした（複数の役割を示す回答を含む）。
そのほとんど（22 人）は、メインフレームでの 10 年以上の経験を持っています。

![組織内での主な役割](q1.png)

### 質問 2: メインフレームシステムでの作業経験は何年ありますか？ {#question-2-how-many-years-of-experience-do-you-have-in-working-with-mainframe-systems}

回答者の大多数（33 人）はメインフレームでの 10 年以上の経験を持っています。
そのうちエキスパートまたは上級の OpenTelemetry 知識を持つと自称したのはわずか 4 人でした。
逆に、メインフレーム経験が 4 年未満の 6 人の回答者のうち、4 人が OpenTelemetry のエキスパートまたは上級の実践者であると自認しています。
全体として、回答の大部分はアンケート参加者がメインフレームのバックグラウンドを持っていることを示しています。

![メインフレームシステムでの作業経験年数](q2.png)

### 質問 3: あなたの組織の主要な業界はどこですか？ {#question-3-which-is-the-primary-industry-of-your-organization}

回答者の大多数は金融サービスセクター（全 45 件の回答のうち 22 件）からでした。
少数のグループは多様なロジスティクス分野（合計 8 件）からでした。
13 人の回答者は、ソフトウェア開発、独立ソフトウェアベンダー（ISV）、サービスプロバイダー、IBM zStack ソフトウェア、オブザーバビリティ、情報技術（IT）など、ソフトウェアおよび IT 関連分野に主に従事していました。

![組織の主要な業界](q3.png)

### 質問 4: 以下のメインフレームプラットフォームのうち、どれを使用していますか？ {#question-4-which-of-the-following-mainframe-platforms-do-you-work-with}

z/OS は、1 人を除くすべての回答者が使用しているメインフレームオペレーティングシステムです（その 1 人は Linux for IBM Z に注力しています）。
Linux on IBM Z は約 3 分の 1 の回答者（17 人）が使用しています。
仮想化プラットフォームとしての z/VM は 8 人の回答者が使用していました。
1 人の回答者は z/VSE と zTPF を含むすべてのオペレーティングシステムを使用していると回答しました。

![使用中のメインフレームプラットフォーム](q4.png)

### 質問 5: どの z/OS システムソフトウェアを使用していますか？ {#question-5-which-of-the-zos-system-software-do-you-work-with}

回答者の大多数（38 人）は、トランザクション処理システムである CICS または IMS、あるいはその両方を使用しています。
39 人のアンケート参加者が Db2 を利用し、31 人が VSAM を使用しています。
また、注目すべきサブグループの回答者は、ADABAS、IDMS、DVM、または Datacom をデータバックエンドとして使用しています。

![使用中の z/OS システムソフトウェア](q5.png)

### 質問 6: OpenTelemetry にどの程度精通していますか？ {#question-6-what-is-your-level-of-familiarity-with-opentelemetry}

OpenTelemetry 採用の初心者（26 人）が回答者の中で最大のグループを占めました。
そのうち 15 人は OpenTelemetry の機能やコンポーネントをまったく知りません。
エキスパートと自認したのはわずか 3 人で、中級の知識を持つすべての参加者は OpenTelemetry Collector にも精通していると回答しました。

![OpenTelemetry への精通度](q6.png)

### 質問 7: OpenTelemetry のどの機能やコンポーネントに精通していますか？ {#question-7-what-features-and-components-of-opentelemetry-are-you-familiar-with}

アンケート参加者の約半数が OpenTelemetry メトリクス（24 人）と OpenTelemetry Collector（22 人）に精通しています。
シグナルタイプに関しては、メトリクスが回答者の精通度でリードしていますが、ロギング（20 人）と分散トレーシング（17 人）が僅差で続いています。
分散トレーシングを補完する技術であるコンテキスト伝搬とサンプリングの認知度はやや低くなっています。
コード計装（ゼロコードおよび手動）は約 4 分の 1 の回答者にしか知られていません。
セマンティック規約と API 仕様についても同様です。
Kubernetes Operator と Open Agent Management Protocol に精通している参加者は少数であり、それらの参加者は OpenTelemetry について少なくとも中級以上、上級またはエキスパートレベルの知識を持っていると自認しています。

![OpenTelemetry の機能とコンポーネントへの精通度](q7.png)

### 質問 8: オブザーバビリティまたはパフォーマンスモニタリングツールのユーザーですか？ {#question-8-are-you-a-user-of-observability-or-performance-monitoring-tools}

回答者の 4 分の 3 がオブザーバビリティまたはパフォーマンスモニタリングツールを使用していると回答しています（35 人）。
ほとんどのユーザーはメインフレームプラットフォームの可視性を持っています（30 人）。
分散プラットフォームとメインフレームプラットフォームの両方でツールを使用している回答者のグループ（19 人）のうち、3 分の 2 がオブザーバビリティとモニタリング活動に 20% 以上の時間を費やしていると回答し（13 人）、5 人はこれらの活動にほぼフルタイム（80% 以上の時間）で取り組んでいます。

![オブザーバビリティまたはパフォーマンスモニタリングツールの使用状況](q8.png)

### 質問 9: オブザーバビリティまたはパフォーマンスモニタリング活動にどれくらいの時間を費やしていますか？ {#question-9-how-much-of-your-time-do-you-spend-on-observability-or-performance-monitoring-activities}

回答者の約 4 分の 1（11 人）がオブザーバビリティとパフォーマンスモニタリング活動に 60% 以上の時間を割いています。
アンケート参加者の大多数（19 人）はこれらの活動への関与が 20% 未満であり、これは彼らの職務の性質に起因しています。
そのうち 12 人が初心者レベル以上の OpenTelemetry 精通度を持っていると回答しています。

![オブザーバビリティとパフォーマンスモニタリング活動に費やす時間](q9.png)

### 質問 10: あなたの組織のオブザーバビリティ戦略の主な特徴は何ですか？ {#question-10-what-are-key-characteristics-of-the-observability-strategy-within-your-organization}

リアルタイム分析（35 件）とエンドツーエンドの可視性（33 件）が回答者の組織における主な目標であり、オープンスタンダード（26 件）とそれが実現する能力であるコンテキストと相関（22 件）、ツール選択の柔軟性（19 件）、統一データ処理（19 件）が続きます。
カーボンアカウントは 1 人の回答者によって明示的に追加されました。

![組織のオブザーバビリティ戦略の特徴](q10.png)

### 質問 11: メインフレームで OpenTelemetry 形式でサポートされるべき最優先のシグナルタイプは何ですか？ {#question-11-which-signal-type-do-you-need-first-to-be-supported-on-the-mainframe-in-opentelemetry-format}

アンケート参加者の中で、メトリクスがメインフレーム上の OpenTelemetry でサポートされるべき最も重要なシグナルタイプ（30 人）であり、ログ（20 人）とトレース（18 人）が続きます。

![シグナルタイプの優先順位](q11.png)

### 質問 12: あなたの組織で OpenTelemetry 形式のメインフレームテレメトリーの主なユーザーは誰になりますか？ {#question-12-who-in-your-organization-will-be-primary-users-of-mainframe-telemetry-in-opentelemetry-format}

回答者は、Mainframe Operations を OpenTelemetry 形式のメインフレームテレメトリーの主なユーザーと見なしています。
Mainframe Operations を優先する回答者グループのうち、80% が 7 年以上のメインフレーム作業経験を持っています。
特筆すべきは、22 人が 10 年以上の経験を持っており、プラットフォームの経験豊富なユーザーであっても、メインフレームテレメトリーの消費を簡素化するアプローチを強く好んでいることを示しています。
SRE（21 人）とアプリケーション開発者（19 人）が、OpenTelemetry 形式のメインフレームテレメトリーから恩恵を受けると期待される第 2 グループのユーザーを形成しており、組織のさまざまなドメインにわたる他の役割が続きます。

![組織の主要な業界](q12.png)

### 質問 13: OpenTelemetry 形式で出力されることが組織にとって最も重要なメトリクスのカテゴリはどれですか？ {#question-13-which-category-of-metrics-are-the-most-important-to-your-organization-to-be-emitted-in-opentelemetry-format}

ほとんどの回答者にとって、さまざまなワークロードおよびインフラストラクチャ関連のメトリクスと組み合わせた System Performance メトリクス（32 人）の OpenTelemetry サポートが最も重要です。
Job and Batch Processing（27 人）、Database（27 人）、Application（27 人）のメトリクスはアンケート参加者にとって同等に重要と認識されており、Network（24 人）、I/O（21 人）、Storage（20 人）、Capacity Planning（19 人）のインフラストラクチャメトリクスが続きます。
他のメトリクスドメインは選択数が少なかったものの、結果はこれらのドメインのサポートに対しても相当なレベルの関心があることを示しています。
たとえば、複数の回答者が DevOps および CI/CD メトリクスと、環境・エネルギー・サステナビリティメトリクスに関心を示しました。

![カテゴリ別メトリクスの重要度](q13.png)

### 質問 14: あなたの組織でメインフレームテレメトリーを OpenTelemetry 形式でエクスポートする主なユースケースは何ですか？ {#question-14-what-are-the-primary-use-cases-of-exporting-mainframe-telemetry-in-opentelemetry-format-in-your-organization}

エンドツーエンドの可視性は、組織のオブザーバビリティ戦略の重要な目標としてすでに特定されていましたが、メインフレームテレメトリーの OpenTelemetry サポートのユースケースを列挙する際に回答者によって確認されました。
ランディングゾーン間のエンドツーエンドの可視性（28 人）とインシデント管理の改善（28 人）が主なユースケースと見なされています。
列挙された他のユースケースもアンケート参加者の少なくとも 4 分の 1 にとって重要であり、アプリケーションパフォーマンスの最適化（22 人）やプロアクティブな問題判別と予測分析（21 人）などのユースケースはほぼ半数の回答者にとって関連性があります。
カーボンアカウンティングは 1 票で表示されており、1 人の回答者によって重要なユースケースとして追加されました。

![主なユースケース](q14.png)

### 質問 15: どのアプリケーションデプロイメントモデルに対して、OpenTelemetry による計装を最も必要としていますか？ {#question-15-for-which-application-deployment-models-do-you-need-instrumentation-with-opentelemetry-the-most}

アンケート参加者は、Online Transaction Processing（30 人）を優先して OpenTelemetry 計装を希望しており、Batch Processing（23 人）、Database-centric Applications（19 人）、その他のアプリケーションデプロイメントモデルが続きます。
Analytics および AI ワークロード（10 人）やクラウドネイティブ・コンテナ化ワークロード（7 人）の計装は一部の回答者にとって注目されており、メインフレーム上での新しいアプリケーションデプロイメントモデルの利用の拡大を示しています。

![アプリケーションデプロイメントモデル別の優先順位](q15.png)

### 質問 16: 既存の OpenTelemetry SDK のうち、あなたの組織がメインフレームサポートを必要としているのはどれですか？ {#question-16-for-which-of-the-existing-opentelemetry-sdks-does-your-organization-require-mainframe-support}

Java（25 人）と Python（20 人）が、メインフレームプラットフォーム向けの OpenTelemetry SDK サポートの実装で最も優先度の高い 2 つのプログラミング言語です。
回答者の 20% が C++ の SDK をメインフレームプラットフォームで利用可能にしてほしいと回答しています。

![OpenTelemetry SDK の優先順位](q16.png)

### 質問 17: 追加でどの言語の OpenTelemetry SDK を組織は必要としていますか？ {#question-17-for-which-additional-languages-does-your-organization-require-an-opentelemetry-sdk}

COBOL は、最も多くの回答者（26 人）が OpenTelemetry SDK の開発を希望しているメインフレーム向けプログラミング言語です。
COBOL SDK は主に 7 年以上のメインフレーム経験を持つアンケート参加者から要望されていますが、3 年未満の経験を持つ 5 人の回答者からも要望がありました。
アンケートでは、回答者の 40% 以上が REXX と JCL の SDK を求めました。
回答者の 4 分の 1 以上が HLASM の OpenTelemetry SDK を求め、20% が PL/1 および C の SDK を求めました。
3 人が Metal C の SDK に関心を示しました。

![メインフレーム言語サポートの需要](q17.png)

### 質問 18: あなたの組織が OpenTelemetry SDK のサポートを必要としているメインフレームオペレーティングシステムはどれですか？ {#question-18-for-which-of-the-mainframe-operating-systems-does-your-organization-require-the-support-of-opentelemetry-sdks}

回答者が利用しているオペレーティングシステムに合わせて、各プラットフォーム向けの OpenTelemetry SDK への関心が示されました。
OpenTelemetry SDK のサポート対象プラットフォームとして z/OS が回答者にとって最も重要であり（35 人）、Linux on IBM Z（13 人）と zTPF（1 件の選択）が続きます。

![OpenTelemetry SDK をサポートするオペレーティングシステムの優先順位](q18.png)

### 質問 19: メインフレームテレメトリーの処理と配信を可能にするために、OpenTelemetry Collector のどの機能が組織にとって最も興味深いですか？ {#question-19-what-functionality-of-the-opentelemetry-collector-is-most-interesting-for-your-organization-to-enable-the-processing-and-distribution-of-mainframe-telemetry}

OpenTelemetry Collector のデータ収集機能がアンケート参加者にとって最も重要です。
エージェントデプロイメントでの Collector を使用したソース近傍での収集（20 人）と、レシーバーを使用した任意のシステムからの収集（19 人）が回答で最高スコアを獲得しました。
さらに、メトリクスのデータ集約も回答者にとって重要度の高い機能です（20 人）。
データ処理（15 人）とエクスポート（16 人）、トレースサンプリング（14 人）、ゲートウェイデプロイメント（14 人）は回答者の 30% 以上が関心を持っています。
ハードウェアベースの圧縮と暗号化は 9 人のアンケート参加者にとって重要です。

![OpenTelemetry Collector 機能の優先順位](q19.png)

### 質問 20: メインフレームにおける OpenTelemetry Collector のシステムレベルのテレメトリー収集と処理のユースケースとして、何を想定していますか？ {#question-20-what-use-cases-of-system-level-telemetry-collection-and-processing-do-you-envision-for-the-opentelemetry-collector-on-the-mainframe}

OpenTelemetry Collector を評価する際、回答者はシステムパフォーマンスおよびプラットフォームメトリクスの収集を最も重要なユースケースとして優先しています（30 人）。
システムログの収集とメインフレームでのリソース検出のサポートは、約半数のアンケート参加者が重要と考えています。
Kubernetes やコンテナランタイムからのデータ収集は一部の回答者が注目しており、これらのユースケースで OpenTelemetry Collector を使用することに関心を持っています。

![カテゴリ別テレメトリー収集の OpenTelemetry Collector の優先順位](q20.png)

### まとめ {#summary}

アンケートの結果、メインフレームの実務者の大多数が OpenTelemetry を初めて使用する段階にあり、採用にあたっては System Performance メトリクスを優先していることが明らかになりました。
Java、Python、COBOL の SDK に対する需要があり、Collector サポートも求められています。
これらの知見は、教育、セマンティック規約、および OpenTelemetry コンポーネントをメインフレームプラットフォームに移植するための集中的な取り組みの必要性を示しています。

OpenTelemetry on Mainframe SIG に参加して、メインフレームでの OpenTelemetry の採用を加速する言語 SDK、計装、コミュニティの専門知識に貢献しましょう。
SIG のメンバーとは、Slack チャンネル [#otel-mainframes](https://cloud-native.slack.com/archives/C05PXDFTCPJ) または水曜日 10:00 PT の [SIG ミーティング](https://github.com/open-telemetry/community/?tab=readme-ov-file#sig-mainframes)で連絡できます。

_この記事のバージョンは、Open Mainframe Project のブログに[当初掲載][originally posted]されたものです。_

[originally posted]: <{{% param canonical_url %}}>
