---
title: OpenTelemetry Collector のアンチパターン
linkTitle: OTel Collector のアンチパターン
date: 2024-03-01
author: >-
  [Adriana Villela](https://github.com/avillela) (ServiceNow),

canonical_url: https://open.substack.com/pub/geekingoutpodcast/p/opentelemetry-collector-anti-patterns
default_lang_commit: 8fd99e125e5510385b18b541d97c283e28f76ef2
cSpell:ignore: antipattern antipatterns
---

![海と山を背景にした高床式の家](house-on-stilts.jpg)

[OpenTelemetry Collector](/docs/collector/) は、OpenTelemetry（OTel）のコンポーネントの中でも特にお気に入りのひとつです。
Collector は柔軟で強力なデータパイプラインであり、1つ以上のソースから OTel データを取り込み、変換（バッチ処理、フィルタリング、マスキングなど）し、分析のために1つ以上のオブザーバビリティバックエンドへエクスポートできます。
ベンダーに依存しません。
拡張性があり、独自のカスタムコンポーネントを作成できます。
嫌いになる理由があるでしょうか。

残念ながら、多くのツールと同様に、悪い習慣に陥りやすいという側面もあります。
この記事では、OpenTelemetry Collector の5つのアンチパターンと、その回避方法を紹介します。
さっそく始めましょう。

## アンチパターン {#antipatterns}

### 1- Collector のデプロイモードの不適切な使用 {#1--improper-use-of-collector-deployment-modes}

Collector を使うだけでは十分ではありません。
組織内で Collector が _どのように_ デプロイされるかも重要です。
そうです、Collector は複数形の Collector**s** です。
1つだけでは足りないことが多いからです。

Collector のデプロイモードにはエージェントモードとゲートウェイモードの2つがあり、両方とも必要です。

[エージェントモード](/docs/collector/deploy/agent/)では、Collector はアプリケーションの隣、またはアプリケーションと同じホスト上に配置されます。

![OTel Collector エージェントモード](otel-collector-agent.png)

[ゲートウェイモード](/docs/collector/deploy/gateway/)では、テレメトリーデータがロードバランサーに送信され、ロードバランサーが Collector のプール間で負荷を分散します。
Collector のプールがあるため、プール内の1つの Collector が障害を起こしても、プール内の他の Collector が引き継ぐことができます。
これにより、中断なくデータが宛先に流れ続けます。
ゲートウェイモードは通常、クラスター、データセンター、またはリージョンごとにデプロイされます。

![OTel Collector ゲートウェイモード](otel-collector-gateway.png)

では、どちらを使うべきでしょうか。
エージェントとゲートウェイの両方です。

アプリケーションのテレメトリーデータを収集する場合は、アプリケーションの隣に Collector エージェントを配置してください。
インフラストラクチャのデータを収集する場合は、インフラストラクチャの隣に Collector エージェントを配置してください。
いかなる場合でも、すべてのインフラストラクチャとアプリケーションのテレメトリーを1つの Collector で収集しないでください。
こうすることで、1つの Collector が障害を起こしても、残りのテレメトリー収集には影響しません。

Collector エージェントからのテレメトリーは、Collector ゲートウェイに送信できます。
ゲートウェイはロードバランサーの背後にあるため、テレメトリーデータのエクスポート（通常はオブザーバビリティバックエンドへ）に単一障害点がありません。

_結論:_ データをオブザーバビリティバックエンドに送信するための適切な Collector デプロイ構成を持つことで、テレメトリー収集インフラストラクチャの可用性が向上します。

### 2- Collector を監視しない {#2--not-monitoring-your-collectors}

複数の Collector エージェントと Collector ゲートウェイをデプロイするのは素晴らしいことですが、それだけでは十分ではありません。
Collector の1つが正常に動作していない場合や、データがドロップされている場合に知ることができたら便利だと思いませんか。
そうすれば、事態がエスカレートする前に対処できます。
ここで Collector の監視が役に立ちます。

では、Collector をどのように監視するのでしょうか。
OTel Collector は、[自身の監視のためのメトリクス](/docs/collector/internal-telemetry/#use-internal-telemetry-to-monitor-the-collector)をすでに出力しています。
これらのメトリクスをオブザーバビリティバックエンドに送信して監視できます。

### 3- 適切な Collector ディストリビューションを使用しない（または独自のディストリビューションを構築しない） {#3--not-using-the-right-collector-distribution-or-not-building-your-own-distribution}

OpenTelemetry Collector の公式ディストリビューションは2つあります。
[Core](https://github.com/open-telemetry/opentelemetry-collector) と [Contrib](https://github.com/open-telemetry/opentelemetry-collector-contrib) です。

Core ディストリビューションは、OTel 開発者が開発とテストに使用する最小限のディストリビューションです。
基本的な[エクステンション](/docs/collector/configuration/#service-extensions)、[コネクター](/docs/collector/configuration/#connectors)、[レシーバー](/docs/collector/configuration/#receivers)、[プロセッサー](/docs/collector/configuration/#processors)、[エクスポーター](/docs/collector/configuration/#exporters)のセットが含まれています。

Contrib ディストリビューションは、OTel 以外の開発者が実験や学習に使用するためのものです。
Core ディストリビューションを拡張し、サードパーティ（ベンダーや個人のコミュニティメンバーを含む）が作成したコンポーネントが含まれており、OpenTelemetry コミュニティ全体にとって有用です。

Core も Contrib も単体では本番ワークロードに使用することを意図していません。
Core だけでは最小限すぎて、組織のニーズには合いません。
（ただし、そのコンポーネント自体は必要です。）
また、多くの OpenTelemetry 実践者が各自の組織に Contrib をデプロイしていますが、Contrib には多くのコンポーネントが含まれており、すべてのエクスポーター、レシーバー、プロセッサー、コネクター、エクステンションが必要になることはないでしょう。
それは過剰であり、Collector インスタンスが不必要に肥大化し、攻撃対象領域が拡大する可能性があります。

では、必要なコンポーネントをどのように選択するのでしょうか。
答えは、独自のディストリビューションを構築することであり、[OpenTelemetry Collector Builder](/docs/collector/extend/ocb/)（OCB）というツールを使用して行えます。
さらに、プロセッサーやエクスポーターなど、独自のカスタム Collector コンポーネントを作成する必要が出てくることもあるでしょう。
OCB を使えば、カスタムコンポーネントを統合し、必要な Contrib コンポーネントを選択できます。

一部のベンダーが独自の [Collector ディストリビューション](/ecosystem/distributions/)を構築していることも注目に値します。
これらは、そのベンダーに固有の Collector コンポーネントが厳選された OTel Collector ディストリビューションです。
カスタムのベンダー開発コンポーネントと、厳選された Collector Contrib コンポーネントの組み合わせである場合があります。
ベンダー固有のディストリビューションを使用すれば、必要な Collector コンポーネントだけを使用でき、全体的な肥大化を削減できます。

_結論:_ 適切なディストリビューションを使用することで、肥大化を削減し、必要な Collector コンポーネントだけを含められます。

### 4- Collector を更新しない {#4--not-updating-your-collectors}

この項目は短く簡潔です。
ソフトウェアを最新の状態に保つことは重要であり、Collector も例外ではありません。
Collector を定期的に更新することで、最新バージョンに追従でき、新機能、バグ修正、パフォーマンス改善、セキュリティ修正を活用できます。

### 5- 適切な場面で OpenTelemetry Collector を使用しない {#5--not-using-the-opentelemetry-collector-where-appropriate}

OpenTelemetry では、アプリケーションからオブザーバビリティバックエンドにテレメトリーシグナルを送信する方法が2つあります。

- [アプリケーションから直接送信する](/docs/collector/deploy/other/no-collector/)
- [OpenTelemetry Collector 経由で送信する](/docs/collector/)

テレメトリーデータを「アプリケーションから直接送信する」方法は、OpenTelemetry を使い始めたばかりの非本番システムでは問題ありませんが、本番システムにこのアプローチを使用することは適切ではなく、推奨もされていません。
かわりに、[OpenTelemetry のドキュメントでは OpenTelemetry Collector の使用を推奨しています](/docs/collector/#when-to-use-a-collector)。
なぜでしょうか。

[OTel ドキュメントによると](/docs/collector/#when-to-use-a-collector)、Collector は「サービスがデータを迅速にオフロードすることを可能にし、Collector がリトライ、バッチ処理、暗号化、さらには機密データのフィルタリングなどの追加処理を行えます。」

Collector のその他の利点を確認しましょう。

- **Collector は、アプリケーションが出力するテレメトリーの品質を向上させると同時にコストを最小化できます。**
  たとえば、コスト削減のためのスパンのサンプリング、追加メタデータによるテレメトリーのエンリッチメント、スパンから派生したメトリクスなどの新しいテレメトリーの生成などがあります。
- **Collector を使用してテレメトリーデータを取り込むことで、新しいバックエンドへの変更や別の形式でのデータエクスポートが容易になります。**
  テレメトリーの処理方法やエクスポート方法を変更したい場合、その変更は1か所（Collector）で行えます。
  組織内の複数のアプリケーションに同じ変更を加える必要はありません。
- **Collector を使用すると、さまざまな形式のデータを受信し、エクスポートに必要な形式に変換できます。**
  これは、他のテレメトリーソリューションから OTel に移行する際に非常に便利です。
- **Collector を使用すると、アプリケーション以外のテレメトリーも取り込めます。**
  これには、Azure、Prometheus、CloudWatch などのインフラストラクチャからのログやアプリケーション以外のメトリクスが含まれます。

とはいえ、Collector を使いたくない、または使えないユースケースもあります。
たとえば、IoT デバイスからエッジでデータを収集する場合、エッジのリソースが限られていることを考えると、ローカルの Collector ではなく、オブザーバビリティバックエンドにデータを直接送信する方が良い場合があります。

_結論:_ 一般的に、OpenTelemetry Collector を使用することで、テレメトリーデータの管理においてさらなる柔軟性が得られます。

## おわりに {#final-thoughts}

OpenTelemetry Collector は、OpenTelemetry データの取り込み、操作、エクスポートのための強力で柔軟なツールです。
Collector の可能性を最大限に活用し、これら5つの落とし穴を避けることで、組織はオブザーバビリティの向上に向けて大きく前進できます。
