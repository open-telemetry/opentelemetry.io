---
title: Open Agent Management Protocol (OpAMP) 2023年の現状報告
linkTitle: OpAMP ステータス
date: 2023-10-23
author: >-
  [Jacob Aronoff](https://github.com/jaronoff97) (Lightstep), [Evan
  Bradley](https://github.com/evan-bradley) (Dynatrace), [Michael
  Hausenblas](https://github.com/mhausenblas) (AWS), [Andy
  Keller](https://github.com/andykellr) (observIQ, Inc), [Tigran
  Najaryan](https://github.com/tigrannajaryan) (Splunk)
default_lang_commit: 86176b5ce89da875add2a77296131397f7a7ca31
cSpell:ignore: Aronoff Najaryan observ Tigran
---

[Open Agent Management Protocol (OpAMP)](/docs/collector/management/) は、テレメトリーエージェントのフリートを大規模に管理するための新しいオープン標準です。
2022年に、Splunk が OpAMP を OpenTelemetry（OTel）プロジェクトに寄贈しました。
これは observIQ が BindPlane で使用していた独自プロトコルに基づき、observIQ からの初期フィードバックを受けて行われました。
[OpAMP 仕様](/docs/specs/opamp/)は、エージェントのフリートをリモート管理するためのネットワークプロトコルを定義しています。
これらのエージェントは、[OpenTelemetry Collector](/docs/collector/) や [Fluent Bit](https://fluentbit.io/) などのテレメトリーエージェントから、ご自身の環境で使用しているカスタムエージェントまで、実際にはあらゆるものが対象になります。

OpAMP では、通常コントロールプレーンでホストされるサーバー側と、管理対象のエージェントに実装されるクライアント側を区別します。
たとえば、OpAMP を使用して OpenTelemetry Collector のフリートを管理する場合、以下のようになります。

![OpAMP のハイレベルな概念: コントロールプレーンとエージェント](opamp-concept.svg)

Collector はステータスを OpAMP コントロールプレーンに報告し、そこから設定を受信します。
OpAMP プロトコルはベンダー中立かつ汎用的（OTel 固有ではない）であるため、OpAMP サーバーは異なるエージェントのフリートをリモートで監視・管理できます。
OpAMP は現在、とりわけ以下のことをサポートしています。

- OpenTelemetry Collector などのエージェントは、自身のプロパティ（たとえば種類やバージョン、またはホストオペレーティングシステムの詳細）をサーバー（OpAMP コントロールプレーン）に報告できます。
- サーバーはエージェントに設定をプッシュし、その設定が適用されることを保証します。
  たとえばエージェントのリロードを通じて行います。
- エージェント自体のテレメトリー（ログとメトリクス）を、[OTLP](/docs/specs/otlp/) 準拠のオブザーバビリティバックエンドに取り込むことができます。
- エージェントのアップグレードとダウングレードの両方に対応した、安全な自動アップデート機能。
- クライアント側の TLS 証明書の失効やローテーションを含む、組み込みの接続資格情報管理。

OpAMP が何であり、何をサポートするかの大まかな理解が得られたところで、OpenTelemetry Collector での実装方法を見ていきましょう。

OTel エンドユーザーや Collector コントリビューターとの議論の中で、彼らが OpAMP を限定的な機能を持つ Collector エクステンションとしてだけでなく、より広範な OpAMP 機能を実装する（Collector 外部の）スーパーバイザーとしても使用したいと考えていることがわかりました。

> [!NOTE]
>
> 詳しくは、
> [OpenTelemetry Collector 向け OpAMP ドキュメント](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/85c75369612717542acf07ff7bd2700af80dd0d4/cmd/opampsupervisor/specification?from_branch=main)
> をご覧ください。
> このドキュメントでは、コードの重複を最小限に抑えながら両方のオプションを実装する方法が説明されています。

両方のモードをサポートする主な考え方は、最小限の OpAMP 機能を持つエクステンションを Collector に実装することです。
この Collector エクステンションは単独で使用でき、また、このエクステンションをヘルパーとして利用し、エクステンションが実装する機能の上に残りの OpAMP 機能を実装する外部スーパーバイザーを作成するためにも使用できます。

![OpAMP スーパーバイザー](opamp-supervisor.png)

まず Collector の OpAMP エクステンションを詳しく見てから、OpAMP スーパーバイザーに移ります。

## OpAMP エクステンション {#opamp-extension}

[OpenTelemetry Collector OpAMP エクステンション](https://github.com/open-telemetry/opentelemetry-collector-contrib/pull/16594)は、Collector 内に OpAMP クライアントを実装する予定であり、OpAMP を通じた Collector インスタンスの管理において、スタンドアロンモデルと監視付きモデルの両方で使用される予定です。
スーパーバイザーと連携する場合の OpAMP エクステンションの機能は、スーパーバイザーの設計ドキュメントの一部として定義されており、エクステンションは主にスーパーバイザーにブートストラップ情報を提供し、Collector の実効設定を通信する役割を担うことになります。

## OpAMP スーパーバイザー {#opamp-supervisor}

OpAMP スーパーバイザーは、OpenTelemetry Collector インスタンスを実行し、OpAMP サーバーからの設定をリモートおよびローカルの設定ソースとマージして、Collector が起動時に使用できるファイルにリレーする OpAMP クライアントを実装する、別のバイナリとして存在します。
Collector の監視付きモデルでは、OpAMP プロトコルを通じた追加バイナリのダウンロードも可能になり、追加ファイルのダウンロードや Collector の更新が行えます。

さらに、OpAMP サーバーがスーパーバイザーに「不正な」設定を送信し、Collector の起動に失敗した場合、スーパーバイザーは別プロセスとして実行されているため、OpAMP サーバーにこの状況を通知できます。
OpAMP クライアントの実装に加え、スーパーバイザーは OpAMP サーバーも実装し、Collector 内で実行されている OpAMP エクステンションと通信して Collector に関する情報を受信します。
スーパーバイザーの機能は[設計ドキュメント](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/85c75369612717542acf07ff7bd2700af80dd0d4/cmd/opampsupervisor/specification?from_branch=main)で定義し、それに基づいて [opentelemetry-collector-contrib リポジトリ](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/9e5f710f8d760adb80f27cfa2516538de0637037/cmd/opampsupervisor?from_branch=main)に初期実装をコントリビュートしました。
さらなる開発を導くためのイシューのバックログも作成されています。

## Kubernetes における OpAMP {#opamp-in-kubernetes}

OTel では、[Kubernetes 向け OpenTelemetry Operator](/docs/platforms/kubernetes/operator/) を通じて、コンピュートプラットフォームとしての Kubernetes を専用にサポートしています。
この文脈で、Kubernetes における OpAMP サポートにも取り組んでおり、OpenTelemetry Operator によってデプロイされる[ブリッジコンポーネント](https://docs.google.com/document/d/1M8VLNe_sv1MIfu5bUR5OV_vrMBnAI7IJN-7-IAr37JY/)を通じて利用可能になる予定です。

![OTel Operator における OpAMP ブリッジ](opamp-kubernetes-bridge.png)

> [!NOTE]
>
> 現時点では、Helm chart によるデプロイのサポートはありません。
> ただし、どなたのコントリビュートも歓迎します。

OpAMP ブリッジは OTel の [SIG Kubernetes Operator](https://docs.google.com/document/d/1Unbs2qp_j5kp8FfL_lRH-ld7i5EOQpsq0I4djkOOSL4/) が開発したバイナリで、Kubernetes クラスター内の OpenTelemetry Collector リソースのプールを維持する責任を担います。
ブリッジは OpAMP オペレーターサーバーのクライアントとして機能し、Collector プールの実効設定を報告し、Collector プールのリモート設定を可能にします。
将来的には、ブリッジはステータスの強化やヘルスチェックの改善を通じて、Kubernetes で実行されている Collector プールに関するより豊富な情報を報告するようになります。
また、ブリッジを拡張して Instrumentation リソースのリモート設定をサポートすることもできます。
ブリッジのイメージはすでに OpenTelemetry Operator と共にビルドおよびリリースされています。
さらに、Kubernetes クラスターにブリッジを簡単にデプロイできるようにする、便利な[カスタムリソース定義（CRD）](https://github.com/open-telemetry/opentelemetry-operator/blob/d8953ec7247c41bec4cc9dc154d272a568662c00/apis/v1alpha1/opentelemetrycollector_types.go?from_branch=main)にも取り組んでいます。

## 次のステップ {#whats-next}

コミュニティは1年以上にわたって OpAMP に取り組んでおり、ユーザーはその可能性に期待を寄せています。
2023年11月6日から9日にかけて[米国シカゴで開催される KubeCon NA](/blog/2023/kubecon-na/) に参加される方は、OpenTelemetry メンテナーブースにお越しいただくか、[Observability Day](/blog/2023/kubecon-na/#co-located-events) などのオブザーバビリティ関連イベントで私たちを見つけてください。
OTel 以外の Collector のユースケースや要件についても、皆さまからお話を伺えることを楽しみにしています。
今のところ、ベンダーの方で OpAMP 仕様を実装されている場合はフィードバックをお寄せください。
エンドユーザーの方は、[OTel ドキュメントの OpAMP エントリ](/docs/collector/management/)の手順に従ってサーバー、スーパーバイザー、シンプルな UI のリファレンス実装を試していただくか、OTel Collector の[スーパーバイザーコード（Go）](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/9e5f710f8d760adb80f27cfa2516538de0637037/cmd/opampsupervisor?from_branch=main)を深く掘り下げてみてください。
