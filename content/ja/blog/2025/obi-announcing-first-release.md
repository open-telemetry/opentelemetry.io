---
title: OpenTelemetry eBPF 計装が最初のリリースを発表
linkTitle: OBI 最初のリリース
date: 2025-11-03
author: >-
  [Nikola Grcevski](https://github.com/grcevski) (Grafana Labs), [Tyler
  Yahn](https://github.com/MrAlias) (Splunk)
issue: 8295
sig: eBPF Instrumentation
default_lang_commit: 928c331f0bfd41439849bae5d6b7eca60af41e8b
cSpell:ignore: Beyla Coralogix Grcevski Odigos Yahn
---

Grafana Labs、Splunk、Coralogix、Odigos、そして多くのコミュニティメンバーによる重要なコラボレーションを経て、[OpenTelemetry eBPF Instrumentation][otel-ebpf-instrumentation]（略称 OBI）の最初のアルファリリースを発表できることを嬉しく思います。

このイベントは、Grafana Labs が今年初めに寄贈したプロジェクト（旧 Grafana Beyla）にとって重要なマイルストーンです。
OpenTelemetry の傘下でプロジェクトが管理されるようになってから、eBPF 計装の開発は大幅に加速しました。
多くの新しいプロトコルが追加され、品質が向上し（特に大規模デプロイ時）、テストの実行速度は10倍に高速化されました。
これは OpenTelemetry コミュニティの価値を示す真の証です。

## OpenTelemetry eBPF 計装とは何か、そしてなぜ注目すべきか {#so-what-is-opentelemetry-ebpf-instrumentation-and-why-should-you-care}

他の多くの OpenTelemetry 計装アプローチとは異なり、OpenTelemetry eBPF 計装（OBI）はプロセス外で実行され、ライブラリレベルではなくプロトコルレベルで計装を行います。
eBPF 技術のカーネル深層統合、プロセス分離、ランタイム安全性、パフォーマンスの利点を活用しています。

OBI はプロトコルレベルで計装を行うため、すべてのアプリケーション（すべてのプログラミング言語、すべてのライブラリ）を、手間をかけず、単一のコマンドで計装でき、常に一貫したデータが得られます。
この文を、エンドユーザーにとって何を意味するか少し掘り下げてみましょう。

1. 再起動不要、コード変更不要、アプリケーション設定変更不要です！
   OBI だけで、メトリクスとトレースの完全な自動キャプチャを提供します。
   eBPF の素晴らしい点は、実行中の環境に導入でき、システム/クラスター/アプリケーションを不安定にしないことが保証されることです。
2. 新しいアプリケーション依存関係の追加なし、つまり新しいセキュリティ脆弱性もありません。
   OBI はプロセス外で実行されるため、アプリケーションには何も追加されません。
   OpenTelemetry SDK の依存関係をアップグレードまたは追加する必要はなく、追加した OpenTelemetry SDK の依存関係に脆弱性があってもアプリケーションにパッチを当てる必要はありません。
   システム上の OBI へのアクセスを個別に保護でき、インストール済みの他のものには影響しません。
3. テレメトリーの追加によってアプリケーションが遅くなることはありません。
   アプリケーションがテレメトリーをエクスポートするために何かを追加したり作業したりする必要がないため、テレメトリーキャプチャによるアプリケーションのパフォーマンスへの影響はありません。
   OBI はほとんどの処理をカーネルレベルで行い、パフォーマンスに対して大幅に最適化されています。
   非常に高いリクエストレートでも、最小限の CPU およびメモリフットプリントで動作します。
4. テレメトリーは、すべてのプログラミング言語およびライブラリにわたって常に一貫しています。
   OBI は、すべてのサービスにわたってテレメトリーを最新の安定版 OpenTelemetry 仕様に保ち、コンプライアンスの管理に苦労する必要がありません。
5. 幅広いプロトコル計装をサポートしています。
   HTTP/HTTPS、HTTP/2、gRPC、SQL、Redis、MongoDB、Kafka、GraphQL、Elasticsearch/OpenSearch、AWS S3。
   すべてのプログラミング言語で自動トレースコンテキスト伝搬が可能です。

## すべてに OpenTelemetry eBPF 計装だけを使えばよいのか {#should-i-just-use-opentelemetry-ebpf-instrumentation-for-everything}

はい、そして…

OpenTelemetry eBPF 計装（OBI）は特定の用途に優れていますが、他の OpenTelemetry 技術と組み合わせるとさらに効果的になります。
これが実際に何を意味するか見てみましょう。

OpenTelemetry eBPF 計装は、OpenTelemetry を使い始めるための優れたツールです。
RED（Request Error Duration）メトリクス、サービスグラフ、特定の種類のアプリケーションのトレースなどの基本的なシグナルを素早く取得できます。
ただし、データキャプチャがカーネルレベルで行われるため、他のタイプの OpenTelemetry 計装で提供できる特定のレベルの詳細情報は得られません。
これが何を意味するか詳しく見てみましょう。

1. テレメトリーがまったくない場合や部分的にしかない場合は、OBI を試してみてください。
   すべてを自動計装する（特にコンパイル済みバイナリの場合）簡単な方法です。
   OBI は、アプリケーションが別の OpenTelemetry SDK で計装されていることを検出し、シグナルを重複させません。
   そのため、計装済みと未計装のアプリケーションが混在する環境に簡単かつ安全に導入できます。
2. アプリケーションが OpenTelemetry サポートのないライブラリを使用している場合は、OBI を試してみてください。
   たとえば、公式にサポートされているライブラリよりも古いライブラリや、誰も計装を提供していないライブラリなどです。
3. OpenTelemetry SDK やエージェントで正常に計装できているサービスはそのまま維持してください。
   パフォーマンスやコストに重大な問題が発生していない限り、他のタイプの OpenTelemetry 計装から移行する理由はほとんどありません。
   その場合は、OBI が役に立つかもしれません。
4. OBI はメトリクスとサービスグラフの収集には優れたツールですが、特定の言語や技術に対する分散トレーシングのサポートは十分ではありません。
   たとえば、現時点ではリアクティブプログラミングフレームワーク、Java の仮想スレッド、複雑なスレッドプールに対する分散トレーシングは処理できません。
   一般的に、OBI の分散トレースは Go（HTTP および gRPC）、Node.js（HTTP）、Python（HTTP）、NGINX（HTTP）、PHP（HTTP/FPM）で十分に動作しますが、他のプログラミング言語については、アプリケーションが内部的にスレッドと接続をどのように管理しているかによって大きく異なります。
   分散トレーシングのサポートをより広範に拡大するための貢献を求めています。
   分散トレーシングの制限事項は、ドキュメントの [OBI による分散トレース][distributed-traces] セクションに記載されています。

## まとめ {#to-summarize}

オブザーバビリティは、後付けのコストセンターではなく、最新のインフラストラクチャに組み込まれた機能であるべきだと私たちは考えています。
OpenTelemetry eBPF 計装を使えば、単一のコマンドラインで環境に必要なテレメトリーキャプチャを追加できます。
OpenTelemetry を使わない言い訳はもうなくなるはずです。
手間なし、ダウンタイムなし、コードや設定の変更なし。
試してみる理由は十分にあります。

## OpenTelemetry eBPF 計装を始める {#getting-started-with-opentelemetry-ebpf-instrumentation}

OpenTelemetry eBPF 計装（OBI）を始めるのは簡単です！
スタンドアロン、Docker イメージ、Kubernetes Daemonset（またはポッドサイドカー）としてデプロイできます。
インストール、設定、OBI でのアプリケーション実行の詳細な手順については、[入門ガイド][getting-started]を参照してください。

Docker 環境での OBI のインストール方法の完全な例については、多くの[インテグレーションテストの例][integration-examples]を参照してください。
複数のプログラミング言語、データベースバックエンド、クラウドサービスを組み合わせた例が含まれています。
また、Kubernetes の[テストリポジトリ][test-repository]にも多数の Kubernetes の例があります。

## 次のステップ {#next-steps}

私たちと連絡を取りたい場合、取り組むべき機能を提案したい場合、または作業をフォローしてリリースの最新情報を得たい場合は、GitHub の [OpenTelemetry eBPF Instrumentation リポジトリ][ebpf-repo]でいつでも見つけられます。
また、定期的で非常に活発な [Special Interest Group（SIG）コミュニティコール][sigs]を毎週開催しており、参加してコミュニティの一員になれます。
コミュニティコールに参加できない場合は、CNCF Community Slack チャンネル [#otel-ebpf-instrumentation][slack-ebpf] でも非同期で簡単にコンタクトできます。

## 謝辞 {#acknowledgments}

このアルファリリースは、世界中のコントリビューターによる数え切れないほどの作業の成果です。
このマイルストーンを達成するためにコード、ドキュメント、フィードバック、そして情熱を提供してくださったすべての方に感謝します。

[otel-ebpf-instrumentation]: https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation
[distributed-traces]: /docs/zero-code/obi/distributed-traces/
[getting-started]: /docs/zero-code/obi/setup/
[integration-examples]: https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation/tree/f6deabc4387de1e0bf4b2acdbc674f7601d4c7f2/internal/test/integration?from_branch=main
[test-repository]: https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation/tree/2feaeb84ef7aeeb1e57e642b46c96b965ae4b804/internal/test/integration/k8s/manifests?from_branch=main
[ebpf-repo]: https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation
[sigs]: https://github.com/open-telemetry/community?tab=readme-ov-file#sig-ebpf-instrumentation
[slack-ebpf]: https://cloud-native.slack.com/archives/C08P9L4FPKJ
