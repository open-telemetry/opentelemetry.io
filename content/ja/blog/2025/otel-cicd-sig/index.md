---
title: OpenTelemetry が CI/CD オブザーバビリティへ拡大
linkTitle: OpenTelemetry が CI/CD オブザーバビリティへ拡大
date: 2025-02-24
author: >-
  [Dotan Horovits](https://github.com/horovits/) (CNCF Ambassador), [Adriel
  Perkins](https://github.com/adrielp) (Liatrio)
canonical_url: https://www.cncf.io/blog/2024/11/04/opentelemetry-is-expanding-into-ci-cd-observability/
issue: 5546
sig: CI/CD Observability
default_lang_commit: 5085f8dbc5095f2fdde7de5aa3a37f49c0cf3edc
# prettier-ignore
cSpell:ignore: andrzej bäck bäckmark chacin cicd frittoli grassi helmuth horovits jemmic joao kamphaus keptn kowalski liatrio molkova robb ruech safyan sarahan shkuro skyscanner slsa stencel suereth tekton voss
---

CI/CD パイプラインの報告とオブザーバビリティのための共通の「言語」の必要性について何年も議論してきましたが、ついにこの言語の最初の「単語」がオブザーバビリティの「辞書」、つまり [OpenTelemetry のオープンな仕様](/docs/specs/otel/)に加わりました。
OpenTelemetry の[セマンティック規約](/docs/specs/semconv/) v1.27.0 の最新リリースでは、[CI/CD パイプラインの報告のための専用属性](/docs/specs/semconv/registry/attributes/cicd/)が含まれています。

これは、[OpenTelemetry 内の CI/CD オブザーバビリティ Special Interest Group（SIG）](https://github.com/open-telemetry/community/blob/514a684953f114217c7b673471969b3ddec5f3a2/projects/completed-projects/ci-cd.md?from_branch=main)の尽力の成果です。
第一フェーズのコアマイルストーンを達成した今、この成果を広く共有するよい機会だと考えました。

## エンジニアには CI/CD パイプラインのオブザーバビリティが必要 {#engineers-need-observability-into-their-cicd-pipelines}

[CI/CD オブザーバビリティ](https://medium.com/@horovits/fcc6c10c4987)は、ソフトウェアを効率的かつ確実に本番環境へリリースするために不可欠です。
適切に機能する CI/CD パイプラインは、[Lead Time for Changes DORA メトリクス](https://horovits.medium.com/improving-devops-performance-with-dora-metrics-918b9604f8e2)を短縮し、壊れたプロセスや不安定なプロセスの迅速な特定と解決を可能にすることで、ビジネス成果に直接的な影響を与えます。
CI/CD ワークフローにオブザーバビリティを統合することで、チームはパイプラインの健全性とパフォーマンスをリアルタイムに監視し、ボトルネックや改善が必要な領域についてのインサイトを得られます。

本番環境の監視に使用されている確立されたツールを活用することで、組織はオブザーバビリティの能力をリリースサイクルにまで拡張し、ソフトウェアデリバリーへの包括的なアプローチを実現できます。
オープンソースでもプロプライエタリなツールでも、CI/CD パイプラインのオブザーバビリティツールチェーンを選ぶ際に一から作り直す必要はありません。

## 標準化の必要性 {#the-need-for-standardization}

しかし、CI/CD ツールの多様な状況が、一貫したエンドツーエンドのオブザーバビリティを実現する上での課題となっています。
各ツールがパイプラインの実行ステータスを報告するための独自の手段、フォーマット、セマンティック規約を持っているため、ツールチェーン内の断片化がシームレスな監視を妨げる可能性があります。
ツール間の移行は、既存のダッシュボード、レポート、アラートの再実装が必要になるため、困難になります。

リリースパイプラインに関わる複数のツールを統一的に監視する必要がある場合、事態はさらに困難になります。
ここで[オープンな標準と仕様が重要](https://horovits.medium.com/the-rise-of-open-standards-in-observability-highlights-from-kubecon-13694e732c97)になります。
オープンな標準と仕様は、ツールやベンダーに依存しない共通の統一言語を作り出し、異なるツール間での一貫したオブザーバビリティを可能にし、チームが CI/CD パイプラインのパフォーマンスを明確かつ包括的に把握できるようにします。

標準化の必要性は、パイプラインで何が起きているかを報告するための言語である、前述のセマンティック規約の作成に関連しています。
また、パイプラインの実行中にプロセスを生成する際など、この報告がシステム内でどのように伝搬されるかという手段についても標準化が必要です。
これにより、プロセス間のコンテキストとバゲージの伝搬に環境変数を使用するための標準化を推進することになり、最近承認されてマージされた、もう一つの重要なマイルストーンとなりました。

## OpenTelemetry: CI/CD オブザーバビリティ仕様の自然な拠り所 {#opentelemetry-the-natural-home-for-cicd-observability-specification}

このような認識から、仕様を作成するための適切なアプローチを模索することになりました。
OpenTelemetry はテレメトリーの生成と収集の標準として台頭しています。
OpenTelemetry の仕様はまさにこの課題に取り組んでいます。つまり、テレメトリーのための共通の統一的でベンダー非依存な仕様の作成です。
そして、Cloud Native Computing Foundation（CNCF）からのサポートにより、オープンかつベンダーニュートラルであり続けることが保証されています。
OpenTelemetry の長年の支持者として、この重要な DevOps ユースケースをカバーするために OpenTelemetry を拡張することは当然のことでした。

数年前に [OpenTelemetry 拡張提案（OTEP #223）](https://github.com/open-telemetry/oteps/pull/223)から始め、CI/CD オブザーバビリティのユースケースをカバーするために OpenTelemetry を拡張するアイデアを提案しました。
並行して、CNCF Slack にチャネルを立ち上げ、このアイデアに賛同する仲間を集め、どのような形にすべきかのブレインストーミングを開始しました。
Slack チャネルは成長し、この課題が多くの組織に共通するものであることがすぐに分かりました。

Technical Oversight Committee や CNCF 内の他のメンバーからのフィードバックを受けて、OpenTelemetry のセマンティック規約 SIG（略して SIG SemConv）の下にこのトピック専用のワーキンググループを開始する権限を求める道を選びました。
その承認を得て、以前の Slack グループでの議論と目標を正式にするために、[正式な CI/CD オブザーバビリティ SIG を立ち上げました](https://github.com/open-telemetry/community/blob/514a684953f114217c7b673471969b3ddec5f3a2/projects/completed-projects/ci-cd.md?from_branch=main)。

## OpenTelemetry の CI/CD オブザーバビリティ SIG {#opentelemetrys-cicd-observability-sig}

2023年11月以降、SIG は複数の企業やオープンソースプロジェクトの専門家と協力して、CI/CD オブザーバビリティに関するセマンティクスの標準を積極的に開発してきました。
発足時に、2024年の重点分野として以下を決定しました。

- CI/CD システム間で共通する最初の属性セット。
- 包括的なものとシグナル固有の属性の両方を含むプロトタイプの開発。
- OpenTelemetry 仕様にコンテキスト伝搬のための環境変数を追加する提案の推進（OTEP #258）。
- OpenTelemetry の規約と [CDEvents](https://cdevents.dev/docs/) および [Eiffel](https://eiffel-community.github.io/) を橋渡しするための戦略。

当初、SIG は毎週月曜日のセマンティック規約ワーキンググループの会議に参加していました。
これにより、ロードマップ上の目標をどのように達成するかを調査・議論しながら、方向性を定めるよい機会となりました。
また、OpenTelemetry コミュニティのより多くのメンバーと知り合い、設計に対するフィードバックを求め、進め方についての指針を得ることもできました。
OpenTelemetry セマンティック規約ワーキンググループは、CI/CD の取り組みを非常に強力に支援してくれました。

最初のマイルストーン（後述）の完了とリリースに伴い、SIG は独自の[専用ミーティング枠](https://github.com/open-telemetry/community/pull/2293)を [OpenTelemetry カレンダー](https://github.com/open-telemetry/community#calendar)上に設けることが認められ、毎週木曜日の午前6時（PT）に開催されています。
グループはここで集まり、月曜日のセマンティック規約の会議に持ち込む前に、現在および将来の作業について議論しています。
標準化のこの重要な分野を推進し続ける中で、コミュニティからの継続的なサポートと参加を楽しみにしています。

## CI/CD は最新の OpenTelemetry セマンティック規約の一部 {#cicd-is-part-of-the-latest-opentelemetry-semantic-conventions}

数ヶ月にわたるイテレーションとフィードバックを経て、[最初のセマンティック規約がマージされ](https://github.com/open-telemetry/semantic-conventions/pull/1075)、v1.27.0 リリースに含まれました。
この変更により、`CICD`、`artifacts`、`VCS`、`test`、`deployment` の名前空間のもとに、CI/CD のための基盤となるセマンティクスの最初のセットが導入されました。
これは CI/CD オブザーバビリティ SIG と業界全体にとって重要なマイルストーンでした。
これにより、グループの他の目標が形になり始め、実装に至るための基盤が作られました。

しかし、具体的にはどういう意味でしょうか。
どのような価値を提供するのでしょうか。
2つの名前空間について実際の例を考えてみましょう。

### バージョン管理システム（VCS）からのリリースリビジョンの追跡 {#tracking-release-revisions-from-version-control-systems-vcs}

[バージョン管理システム（VCS）属性](/docs/specs/semconv/registry/attributes/vcs/)は、ref やチェンジ（プル/マージリクエスト）など、VCS に共通する複数の領域をカバーしています。
`vcs.repository.ref.revision` 属性は重要なメタデータです。
GitHub や GitLab などのバージョン管理システムがイベントを発行する際に、このセマンティクスに準拠した属性を持てるようになります。
つまり、コードを統合し、リリースし、環境にデプロイする際に、システムがこの属性を含めることで、境界を超えてコードリビジョンをより容易に追跡できます。
デプロイが失敗した場合、コードのリビジョンを素早く確認し、バグのあるリリースまで遡ることができます。
この属性は [DORA メトリクス](https://dora.dev/guides/dora-metrics-four-keys/)にとっても重要なメタデータであり、変更のリードタイムやデプロイ失敗からの復旧時間を計算する際に使用されます。

### サプライチェーンセキュリティのためのアーティファクト（SLSA 仕様との整合） {#artifacts-for-supply-chain-security-aligned-with-the-slsa-specification}

[アーティファクト属性の名前空間](/docs/specs/semconv/registry/attributes/artifact/)には、最初の実装で複数の属性が含まれていました。
この名前空間内の重要な属性セットの一つが、[SLSA](https://slsa.dev/spec/v1.0/about) モデルに密接に整合した[アテステーション](https://slsa.dev/attestation-model)をカバーしています。
これは、オブザーバビリティとソフトウェアサプライチェーンセキュリティの間に直接的な関連が作られる初めてのケースです。
SLSA が定義する以下の[サプライチェーン脅威モデル](https://slsa.dev/spec/v1.0/threats)について考えてみましょう。
{{< figure class="figure" src="SLSA-supply-chain-model.png" attr="SLSA Community Specification License 1.0" attrlink=`https://github.com/slsa-framework/slsa?tab=License-1-ov-file` >}}

アーティファクトとアテステーションのこれらの新しい属性は、上記の図でモデル化された一連のイベントをリアルタイムで観測するのに役立ちます。
現在存在する規約と将来追加される規約により、オブザーバビリティのセマンティクスを使って、セキュリティやプラットフォームエンジニアリングなどのコアソフトウェアデリバリー機能間の相互運用性が実現されます。

## CI/CD オブザーバビリティワーキンググループの次のステップ {#whats-next-for-cicd-observability-working-group}

すでに述べたように、私たちが達成した最初の主要なマイルストーンは、新しい属性でセマンティック規約を拡張するための OTEP のマージであり、これは現在 OpenTelemetry セマンティック規約の最新リリースの一部です。

2つ目の重要なマイルストーンは、環境変数コンテキスト伝搬のための [OTEP #258](https://github.com/open-telemetry/oteps/pull/258) であり、最近承認されてマージされました。
この OTEP は仕様の記述のための基盤を確立します。

最初のマイルストーンで進捗を遂げたため、[CI/CD オブザーバビリティ SIG の2024年残りのマイルストーン](https://github.com/open-telemetry/community/blob/514a684953f114217c7b673471969b3ddec5f3a2/projects/completed-projects/ci-cd.md?from_branch=main)を更新しました。
年末までに定義されたマイルストーンをできるだけ多く完了することが目標です。
特に以下に重点を置いています。

- [バージョン管理システムのメトリクス規約](https://github.com/open-telemetry/semantic-conventions/pull/1383)の追加。
- CICD システム（ArgoCD、GitHub、GitLab、Jenkins など）でのトレーシングプロトタイプの構築。
- [OTEP #258](https://github.com/open-telemetry/oteps/pull/258) を仕様への追加のための実装準備。
- 以下のような追加ドメインをカバーするレジストリへの属性の追加。
  - [ソフトウェア障害インシデント](https://github.com/open-telemetry/semantic-conventions/issues/1185)
  - [CI/CD ランナーに関するシステム属性](https://github.com/open-telemetry/semantic-conventions/issues/1184)
- 他の仕様との相互運用性を構築するための、トレースとイベント（ログ）シグナル固有の作業の開始。
- [Entity and Resource OTEP](https://github.com/open-telemetry/oteps/pull/264) からの変更の採用。
- [ベンダー固有の拡張](https://github.com/open-telemetry/semantic-conventions/issues/1193)の有効化。
- セマンティクスの採用のためのオープンソースコミュニティへのアウトリーチ戦略。

ここまで述べたことはすべて始まりに過ぎません。
[CICD プロジェクトボード](https://github.com/orgs/open-telemetry/projects/79)には多くの作業が定義されており、進行中の作業もあります。
2024年の残りの期間に設定した上記のマイルストーンについて、引き続きイテレーションしていきます。
注目すべき項目をいくつか紹介します。

- バージョン管理システムのメトリクス — DORA の先行指標
- GitHub Actions と監査ログからのトレース
  - このコンポーネントを実現している以下の方々に特別な感謝を申し上げます。
    - Tyler Helmuth – Honeycomb
    - Andrzej Stencel – Elastic
    - Curtis Robert – Splunk
    - Justin Voss
    - Kristof Kowalski – Anz Bank
    - Mike Sarahan – Nvidia
- GitHub Receiver コンポーネントに対応する GitLab 版の実装

その他にも多くの取り組みがあります。

## OpenTelemetry を拡張するにはコミュニティの力が必要 {#it-takes-a-village-to-extend-opentelemetry}

やるべきことがたくさんあります。
この SIG は2024年以降も2025年にかけて継続することは間違いありません。
標準の策定は困難ですが、不可欠です。
そして、SIG に参加しこれらの標準に貢献している素晴らしいメンバーがいます。
どのような方々でしょうか。

まず、これまでの作業を大きく推進してくれた、OpenTelemetry のリーダーシップ委員会の主要メンバーを紹介します。

OpenTelemetry Technical Committee からは、2人のコアスポンサーとして Lightstep の Carlos Alberto と Google の Josh Suereth がいます。
Carlos と Josh は CICD の作業を非常に支援してくれ、成功に必要なプロセスと詳細を通じて私たちを導いてくれました。

OpenTelemetry Governance Committee からは、Microsoft の Trask Stalnaker が優れた協力者として活動し、Skyscanner の Daniel Blanco が現在のリエゾンを務めています。
Trask と Daniel は SIG のサポートと、OpenTelemetry コミュニティ内で独自のミーティングを持つことを可能にする上で重要な役割を果たしました。

これらの方々に加えて、以下の主要メンバーからも大きなフィードバック、サポート、コントリビューションをいただきました。

- Yuri Shkuro – Jaeger の作者、OpenTelemetry の共同創設者
- Andrea Frittoli – Tekton CD メンテナー、CDEvents 共同作成者、IBM
- Emil Bäckmark – CDEvents と Eiffel のメンテナー、Ericsson
- Magnus Bäck – Eiffel、Axis Communications
- Liudmila Molkova – Microsoft
- Christopher Kamphaus – Jemmic、Jenkins
- Giordano Ricci – Grafana Labs
- Giovanni Liva – Dynatrace、Keptn
- Ivan Calvo – Elastic、Jenkins
- Armin Ruech – Dynatrace
- Michael Safyan – Google
- Robb Kidd – Honeycomb
- Pablo Chacin – Grafana Labs
- Alexandra Konrad – Elastic
- Alexander Wert – Elastic
- Joao Grassi – Dynatrace
- DJ Gregor – Discover

たくさんの名前を挙げました。
この取り組みを支援し、実現に導いてくれたすべての方々に心から感謝します。
業界全体の標準を構築するには、多大な思考力と時間が必要です。
困難な課題は困難ですが、これらの方々はオブザーバビリティと CICD システムの世界をより良く、より相互運用性の高い場所にするという挑戦に立ち向かってきました。

## ワーキンググループの議論に参加して貢献しよう {#join-the-working-group-discourse-and-make-an-impact}

もっと知りたいですか。
CI/CD オブザーバビリティの形成に参加したいですか。

開発者やプラクティショナーの皆さんが議論に参加し、アイデアを提供し、CI/CD オブザーバビリティと OpenTelemetry セマンティック規約の未来を形作ることに貢献することを歓迎します。
議論は [CNCF Slack](https://slack.cncf.io/) ワークスペースの `#otel-cicd` チャネルで行われています。
この記事で言及されている GitHub イシューにコメントしたり、毎週木曜日午前6時（PT）の CICD SIG [ウィークリーコール](https://github.com/open-telemetry/community/#sig-cicd)に参加したりできます。

_この記事は [CNCF ブログにも掲載][appears on the CNCF blog]されています。_

[appears on the CNCF blog]: <{{% param canonical_url %}}>
