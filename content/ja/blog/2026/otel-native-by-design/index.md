---
title: >-
  OTel-Native by Design - あらゆるオブザーバビリティスタックへのエクスポートが可能なプロダクトを作る
linkTitle: OTel-Native by Design
date: 2026-10-08
author: >-
  [Nityananda Gohain](https://github.com/nityanandagohain) (SigNoz), [Dhruv
  Ahuja](https://github.com/dhruv-ahuja) (SigNoz)
body_class: otel-with-contributions-from
issue: 10300
sig: SIG End User
default_lang_commit: b83edac6fdc7da4c53d10ce00c2f78d9aea0c89b
cSpell:ignore: Ahuja Dhruv Gohain Nityananda
---

[Dan Gomez Blanco](https://github.com/danielgblanco)（New Relic）の協力のもと執筆。

セルフホスト型ソフトウェアや SaaS プロダクトを開発していると、ユーザーはいずれ**ログ、トレース、メトリクス**を自身のオブザーバビリティスタックに送りたいと要望するようになります。
コンプライアンスの順守やコスト管理、あるいはすべてのオブザーバビリティデータを一箇所に集約するためです。

ユーザーを組み込みのダッシュボードに囲い込んだり、エクスポート先を特定のベンダーに限定したりすることは、不必要な摩擦を生みます。
かわりに、OpenTelemetry（OTel）互換のあらゆるバックエンドへのエクスポートをサポートすることが、ベンダーニュートラルかつ将来性のあるプラクティスであり、ユーザーにオブザーバビリティスタックを自由に選択できる環境を提供します。

この記事では、ユーザーが望むときにログ、トレース、メトリクスを OTel バックエンドにエクスポートできるよう、プロダクトを設計する方法を概説します。

![OTLP 標準によるテレメトリーエクスポートを有効にすることで、ユーザーは自分が選んだプラットフォーム上でデータを所有・分析できるようになります。](cover.png)

## 4つのオブザーバビリティシグナル {#the-four-observability-signals}

OpenTelemetry は4つのシグナルタイプを定義しており、すべて標準の [OpenTelemetry Protocol（OTLP）](/docs/specs/otlp/)で伝送されます。

- **[ログ](/docs/concepts/signals/logs/):** イベントレコード、リクエスト/アクセスログ、およびタイムスタンプとメタデータを含むアプリケーションログ。
- **[トレース](/docs/concepts/signals/traces/):** 分散トレースとスパンにより、ユーザーはサービス間のリクエストフローを確認し、ログと関連付けることができます。
- **[メトリクス](/docs/concepts/signals/metrics/):** カウンター、ゲージ、ヒストグラム（例: リクエストレート、レイテンシー、エラーレート）。
- **[プロファイル](/docs/concepts/signals/profiles/):** アプリケーションが実行中にどこでリソースを消費しているかを示すサンプル。

> [!NOTE] プロファイルはパブリックアルファ段階です
>
> プロファイルは2026年3月26日に[パブリックアルファ](/blog/2026/profiles-alpha/)に入りました。
> シグナルとして、OpenTelemetry はプロファイルを現在の3つの主要なオブザーバビリティシグナルと並ぶものとして位置づけようとしており、コードベース全体のリソース使用パターンをキャプチャすることで、ユーザーが本番環境のインシデントをトラブルシュートする助けとなります。
>
> このブログではログ、トレース、メトリクスにのみ焦点を当てていますが、プロファイルがどのような形になるか、そしてコミュニティがオブザーバビリティシステムでどのように活用するか、楽しみにしています。

同じエクスポートの仕組みが3つすべて（ログ、トレース、メトリクス）に適用されます。
ユーザーが OTLP エンドポイントを設定し、テレメトリーをそこに**プッシュ**できるようにします。
プロダクトが生成するものに応じて、1つ、2つ、または3つすべてのシグナルをサポートできます。

OTel エクスポートをサポートする多くのプラットフォームは、少なくともトレースとログをサポートしており、メトリクスサポートを提供するプラットフォームも増えています。
3つすべてを最初から設計しておけば、後からレトロフィットする必要がなくなります。

## 「良い」テレメトリーシステムとは {#what-a-good-telemetry-system-looks-like}

優れたエクスポートの仕組みには、サポートするすべてのシグナルに対していくつかの明確な特性があります。

- **ベンダーニュートラル:** ユーザーは、ベンダーごとにカスタムインテグレーションを構築することなく、任意の OTel 互換エンドポイント、つまり [Collector インスタンス](/docs/collector/)や [OTLP を直接サポートする多くのバックエンド](/ecosystem/vendors/)のいずれかを指定できます。
- **深いカスタム開発が不要:** 外部プラットフォーム（またはユーザーのツール）は、独自 API のかわりに標準の [OTel SDK](/docs/languages/) と OTLP プロトコルを使ってインテグレーションできます。
- **豊富なコンテキストの保持:** エクスポートされたデータには、メタデータ、タイムスタンプ、利用可能な場合のトレース/スパンの関連付け（例: トレース ID にリンクされたログレコード）が含まれるべきであり、ユーザーはコンテキストを失うことなく自身のバックエンドでデバッグと分析ができます。
- **セマンティック規約のサポート:** [セマンティック規約](/docs/specs/semconv/)への準拠は、テレメトリーデータの標準化を保証し、互換性のあるあらゆるバックエンドで容易に解釈できるようにします。
  また、ファーストパーティかサードパーティかを問わず、ソフトウェアシステムの動作を理解するためのエンドユーザーの認知的負荷を軽減します。

サポートするシグナルに対してこれらの原則に沿った設計であれば、最新のプラットフォームがオブザーバビリティエクスポートについて考えるやり方と一致しています。

## 2つのコンテキスト: プロダクトはどこで実行されるか {#two-contexts-where-does-your-product-run}

OTel エクスポートを追加する方法は、テレメトリーを生成する**システムを誰が所有しているか**によって異なります。
これを明確にすることで、適切なアプローチを選択できます。

### セルフホスト型ソフトウェア {#self-hosted-software}

プロダクトは、顧客が*自身の*環境（自社のデータセンター、クラウド、Kubernetes クラスター）にインストールして実行するアプリケーションまたはシステム（例: ID サーバー、サービスメッシュ、データベース）です。

この場合、OpenTelemetry で**プロダクトを計装**します。
顧客がエンドポイントを設定すると（例: [環境変数](/docs/specs/otel/configuration/sdk-environment-variables/)や設定ファイルを介して）、アプリケーションは顧客が実行しているプロセスからテレメトリーをエクスポートします。

OpenTelemetry は[このような標準的な設定オプション](/docs/specs/otel/configuration/)を提供しているため、ユーザーは他の OTel で計装されたシステムと同じ設定体験を期待できます。

エクスポートは顧客の環境で行われ、バイナリと送信先は顧客が管理します。
_例: Keycloak、Kuma。_

### クラウドプラットフォーム {#cloud-platforms}

プロダクトは、顧客が*自身の*アプリをデプロイしたり、マネージドサービスを利用したりするプラットフォーム（例: PaaS、サーバーレス、API ゲートウェイ）です。
ワークロードは*あなたの*インフラストラクチャ上で実行されます。

この場合、**プラットフォーム機能**（「Telemetry Drains」や「Observability Destinations」など）を追加し、顧客がテレメトリーの送信先を設定できるようにします。
プラットフォームは顧客のワークロード（およびルーターなど自社サービス）からテレメトリーを収集し、顧客の OTLP エンドポイントに転送します。

エクスポートはあなたのインフラストラクチャが行い、顧客が実行するアプリケーションバイナリではありません。
_例: Heroku、Cloudflare。_

まとめると、**ユーザーがデプロイするソフトウェア** → **組み込みの計装**とエンドポイント設定に注力します。
**あなたが運用するプラットフォーム** → あなたのインフラストラクチャがデータ転送に使用する**設定可能なエクスポート先**に注力します。

## 他のプロダクトの実例 {#how-others-do-it}

この記事では、上記の2つのコンテキストの代表的な例として、Kuma、Keycloak、Cloudflare、Heroku の4つのインテグレーションに焦点を当てますが、OTLP を介してネイティブにテレメトリーをエクスポートしているのはこれらだけではありません。
[OpenTelemetry Integrations](/ecosystem/integrations/) ページには、ネイティブの計装やファーストクラスのプラグインを提供するライブラリやサービスが掲載されています。

以下は、これら4つが**3つすべてのシグナル**（またはそのサブセット）をどのように扱っているか、そしてそこから何を学べるかです。

| プラットフォーム   | ログ | トレース | メトリクス | デプロイモード                     | 備考                                            |
| ------------------ | ---- | -------- | ---------- | ---------------------------------- | ----------------------------------------------- |
| Kuma               | Yes  | Yes      | Yes        | ユーザーがデプロイするソフトウェア | シグナルごとに個別のポリシー、すべて OTel       |
| Keycloak           | Yes† | Yes      | Yes        | ユーザーがデプロイするソフトウェア | †ログはプレビュー段階、すべて同一エンドポイント |
| Cloudflare Workers | Yes  | Yes      | No\*       | プラットフォーム                   | \*メトリクスエクスポートは未サポート            |
| Heroku             | Yes  | Yes      | Yes        | プラットフォーム                   | ユーザーが `--signals` でシグナルを選択         |

### セルフホスト型アプローチ: Kuma と Keycloak {#the-self-hosted-approach-kuma-and-keycloak}

ユーザーがソフトウェアを自身の環境にデプロイする場合、ベストプラクティスは OpenTelemetry であらかじめ計装されたアプリケーションを出荷し、OTLP エンドポイントの設定フラグを公開することです。

#### Kuma {#kuma}

顧客が Kuma のコントロールプレーンとデータプレーンを自身の Kubernetes クラスターや VM 上で実行する場合でも、OTel バックエンドにログ、トレース、メトリクスを送信するよう事前設定されています。

ユーザーは、Kuma デプロイメントから実行されるエクスポートを、メッシュポリシーを通じて設定します。

- **MeshAccessLog:** アクセスログを OTel Collector にルーティングします（エンドポイント + メッシュ名、開始時刻などの属性）。
- **MeshTrace:** 設定可能なサンプリングとタグ付けで分散トレースを処理します。
- **MeshMetric:** コントロールプレーンとデータプレーンのメトリクスを公開します。
  OpenTelemetry と Prometheus に対応しています。

たとえば、OTel バックエンドにトレースを送信する設定は次のようになります。

```yaml
# MeshTrace ポリシー
backends:
  - type: OpenTelemetry
    openTelemetry:
      endpoint: otel-collector:4317
```

アクセスログの送信も、異なるポリシーでまったく同じパターンに従います。

```yaml
# MeshAccessLog ポリシー
backends:
  - type: OpenTelemetry
    openTelemetry:
      endpoint: otel-collector:4317
body:
  kvlistValue:
    values:
      - key: mesh
        value:
          stringValue: '%KUMA_MESH%'
attributes:
  - key: start_time
    value:
      stringValue: '%START_TIME%'
```

参考資料:

- [Kuma MeshAccessLog – OpenTelemetry](https://kuma.io/docs/2.13.x/policies/meshaccesslog/#opentelemetry)
- [Kuma MeshTrace](https://kuma.io/docs/latest/policies/meshtrace/)（OpenTelemetry バックエンド）
- [Kuma observability](https://kuma.io/docs/2.13.x/explore/observability/)

#### Keycloak {#keycloak}

Keycloak は、優れたテレメトリーエクスポート機能を提供するセルフホスト型ソフトウェアのもう一つの例です。

別途サイドカーやプラットフォーム機能を必要とするかわりに、ユーザーは Collector エンドポイントを指す起動フラグを渡すだけで、Keycloak プロセス自体がエクスポートを処理します。

単一のテレメトリーエンドポイントを使用しますが、特定のシグナルを切り替えるための細かいフラグを提供しています。

- **トレース:** `tracing-enabled=true`（HTTP リクエスト、DB、LDAP、送信 HTTP/IdP をカバー）。
- **メトリクス:** 同じ OTel インテグレーションを通じて詳細なメトリクスを公開。
- **ログ:** 現在プレビュー段階で、デフォルトでは無効（`--features=opentelemetry-logs --telemetry-logs-enabled=true`、レベルフィルタリングには `--telemetry-logs-level`）。

エンドポイント、オプションのヘッダー、優先プロトコル（gRPC または HTTP）の定義は次のようになります。

```bash
bin/kc.sh start --telemetry-endpoint=http://my-otel-endpoint:4317 --telemetry-protocol=grpc
```

参考資料:

- [Keycloak Observability / Telemetry](https://www.keycloak.org/observability/telemetry)

> [!NOTE] 共通の設計パターン
>
> どちらのデプロイモードにも、共通する繰り返しのテーマがあります。
>
> **OTel/OTLP を使用したプッシュベースのエクスポートが、推奨される実用的なパターンです。**
> 一部のプロダクトは3つすべてのシグナルに対して1つのエンドポイントを公開し（たとえば Keycloak は単一の共有エンドポイントを使用）、他のプロダクトはユーザーが送信するシグナルを選択できるようにしています（Heroku の `--signals`）。
>
> すべてのテレメトリーシグナルをネイティブにサポートすることで、ユーザーは任意のバックエンドで完全な全体像を構築する柔軟性を得られます。

### プラットフォームアプローチ: Cloudflare と Heroku {#the-platform-approach-cloudflare-and-heroku}

インフラストラクチャを管理している場合、わかりやすいユーザー体験は、プラットフォームレベルでエクスポートを処理し、ユーザーのワークロードからデータを取得して送信先にプッシュすることです。

#### Cloudflare Workers {#cloudflare-workers}

ユーザーのコードは Cloudflare のインフラストラクチャ上で直接実行されるため、**Observability Destinations** プラットフォーム機能を通じてエクスポートを処理します。
ユーザーがダッシュボードで OTLP エンドポイントを設定できる、合理化された設計を提供しています。
そこから Cloudflare は Workers のトレースとログを自動的にその送信先にプッシュします。

メトリクスはまだサポートされていませんが、トレースデータはハンドラー呼び出し、バインディング、送信 fetch 呼び出しなどを記録するため、エンドツーエンドの深い可視性を提供します。
ユーザーは `wrangler.toml` でサンプリングレートを設定することもできます。

参考資料:

- [Exporting OpenTelemetry data from Workers](https://developers.cloudflare.com/workers/observability/exporting-opentelemetry-data/)
- [Cloudflare Workers and Traces](https://developers.cloudflare.com/workers/observability/traces/)

#### Heroku {#heroku}

Heroku は **Telemetry Drains** を使った、やや異なる高度に設定可能なアプローチを取ります。
ユーザーはエンドポイント、トランスポートプロトコルとヘッダーを指定して送信先を追加し、*エクスポートするシグナルを明示的に選択*します。

Heroku のプラットフォームは、ユーザーのアプリケーション（OTel SDK を介して）とファーストパーティのサービス（Router など）の両方からデータを収集し、送信先にプッシュします。

```bash
heroku telemetry:add <endpoint> --app <app-name> --signals traces,metrics,logs --transport http --headers '{"Authorization": "ingestion key"}'
```

エクスポートするシグナルをユーザーがきめ細かく制御できることは、特にデータ量と取り込みコストを管理したいチームにとって、実用的な設計パターンです。

参考資料:

- [Heroku Telemetry](https://devcenter.heroku.com/articles/heroku-telemetry)
- [Heroku OpenTelemetry signals and attributes](https://devcenter.heroku.com/articles/heroku-opentelemetry-signals-and-attributes-reference)
- [Working with Heroku Telemetry Drains](https://devcenter.heroku.com/articles/working-with-heroku-telemetry-drains)

## エクスポートモデルの設計 {#designing-your-export-model}

3つの重要なテレメトリーシグナルにおいて、根本的なアーキテクチャの問題は同じです。
プラットフォームはユーザーに定期的に **API をポーリングしてデータを取得する**ことを求めるのか、それともユーザーが定義したエンドポイントに**テレメトリーを直接配信する**のか。

### 従来のアプローチ: カスタムポーリング API {#the-classic-approach-custom-polling-apis}

プラットフォームは従来、ユーザーが定期的にポーリングし、ページネーションを処理し、結果を自身のバックエンドに取り込む必要がある API を通じてテレメトリーを公開してきました。

ログやメトリクス用の成熟したテスト済み API がすでにある場合、それを拡張するほうが新しいプッシュパスを構築するよりも容易なことが多いため、合理的な出発点です。
ただし、実際にはコストが伴います。

- ユーザーに大きな運用上の責任を転嫁することになります。
  ユーザーはポーリング間隔の管理、API レスポンスのページネーション、失敗時のリトライ、欠損データのバックフィルが可能なスケーラブルなポーリングシステムを構築しなければなりません。
- ユーザーがスケールしない、あなたの基準に準拠しない、そしてプラットフォームの API スキーマの進化に合わせて多大なメンテナンスを要するカスタムソリューションを構築する可能性があります。
- ニアリアルタイムの配信がかなり困難になります。
  これはトレースやメトリクスのようなレイテンシーに敏感なシグナルにとって、しばしば重要な要件です。

ログの場合、プルベースの実装は多くの場合次のようになります（例: [CloudWatch Logs スタイル](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/8bee89f9928b4b1f81700f9ab0e5886d428bfae6/receiver/awscloudwatchreceiver/logs.go#L293)）。

```text
state: last_end_time
every poll_interval:
  start_time = last_end_time
  end_time   = now()
  next_token = null
  do:
    response = FilterLogEvents(log_groups, start_time, end_time, next_token)
    emit(response.events)
    next_token = response.nextToken
  while next_token != null
```

この場合、メトリクスやトレース API にも同様の状態追跡ロジックが必要になります。

カスタムポーリングモデルは、ユーザーに API レスポンスを標準フォーマットに変換するカスタムコードの作成を強制するにもかかわらず、Prometheus のようなより標準化されたアプローチを採用できない場合には、サポートされるすべてのシグナルに対して機能します。

しかし、新規設計においては、これをデフォルトにすべきではありません。

### 標準志向のアプローチ: OTLP {#the-standards-oriented-approach-otlp}

開発者向けのリアルタイムテレメトリーにおいて、OTLP プッシュは主流のパターンになっています。

要求を待つのではなく、サービス（またはあなたが運用する OpenTelemetry Collector）が、OTLP（HTTP または gRPC）を使用して、ログ、トレース、メトリクスをユーザーが設定したエンドポイントに直接アクティブにエクスポートします。

すべてのテレメトリーに対して1つのベンダーニュートラルな業界標準プロトコルを使用するため、サポートする個々のシグナルごとにテレメトリー配信ロジックを再実装する必要がありません。

さらに、OTLP は構造化データとメタデータのファーストクラスサポートを提供し、特定のログレコードを親トレース ID にリンクするなど、重要なコンテキストを自動的に保持します。

ユーザーの観点からは、実質的にプラグアンドプレイです。
OTel 互換のあらゆるバックエンドが、カスタムポーリングロジックを必要とせずに、ニアリアルタイムでデータを取り込めます。

### エクスポート体験の構築 {#building-the-export-experience}

プロダクトにエクスポートモデルを実装する際は、最小限の設定で柔軟性を最大化することを目指してください。

#### ユーザーが OTLP エンドポイントを設定できるようにする {#let-users-configure-an-otlp-endpoint}

まず、ユーザーが自身の OTLP エンドポイントと必要な認証ヘッダー（インジェストキーなど）を提供できるようにします。

_しかし、そこで止めないでください！_

ユーザーがエクスポート量を制御し、データ管理を簡素化し、コストを削減できるよう、Heroku の例に倣って、エクスポートするシグナルを明示的に切り替えられるようにしましょう。

#### アーキテクチャの標準化 {#standardize-the-architecture}

内部的には、主に2つのオプションがあります。
サービス内で OpenTelemetry SDK を直接使用してデータを送信するか、システムのテレメトリーを収集してユーザーのエンドポイントに再エクスポートする内部 OTel Collector を運用するかです。

標準の OpenTelemetry 環境変数（[`OTEL_EXPORTER_OTLP_ENDPOINT`](/docs/languages/sdk-configuration/otlp-exporter/#otel_exporter_otlp_endpoint) など）を使い続けることで、基盤となる仕組みが信頼性があり、ドキュメント化や理解が容易になります。

#### セマンティクスの一貫性を保つ {#keep-semantics-consistent}

OTel ベースの環境変数だけでなく、すべてのシグナルにわたって一貫したセマンティクスを維持するようにしてください。
[セマンティック規約](/docs/specs/semconv/)は、属性やスキーマを一貫して命名し、ログとメトリクスがトレースおよびスパン ID とどのように関連するかを正確に把握するためのリファレンスです。
セマンティック規約の上に構築された [Weaver](/blog/2025/otel-weaver/) を使えば、独自の属性名やスキーマを定義し、進化するコードやインフラストラクチャと同期を保ち、フェデレーテッドなセマンティック規約レジストリを維持できます。

ユーザーがテレメトリーをオブザーバビリティバックエンドに取り込む際、すべてがエンドツーエンドで接続され、完全なストーリーを伝えるべきです。

このアプローチの利点の一つは、異なるベンダーインテグレーションを構築する必要がなくなることです。
OTLP を介してテレメトリーをエクスポートすることで、ユーザーは希望するフォーマットにデータを変換・取り込むことができます。

たとえば、ユーザーがコンプライアンス要件を満たすために、ログをバックエンドと S3 のようなオブジェクトストアの両方に転送したい場合があります。

### ユーザーへのテレメトリーのルーティング {#routing-telemetry-to-the-user}

ユーザー向けの設定 UI を設計する際、テレメトリーのルーティングをどの程度きめ細かくするかを決める必要があります。
一般的に2つの方法があり、それぞれ異なるタイプのユーザーに対応しています。

#### 単一エンドポイント {#single-endpoint}

大多数のユーザーにとっては、単一のエンドポイント設定が理想的です。
ユーザーが1つのベース URL を入力すると、エクスポーターが内部的に標準の OTLP パス（`v1/traces`、`v1/metrics`、`v1/logs`）を付加します。

#### シグナルごとのエンドポイント {#per-signal-endpoints}

大規模な顧客や、複雑なオブザーバビリティ構成を管理している顧客は、テレメトリーシグナルを異なるプラットフォームに送信したい場合があります。

OTLP は `OTEL_EXPORTER_OTLP_<SIGNAL>_ENDPOINT` パターンで定義されるシグナル固有の変数と、対応する[ヘッダー設定](/docs/languages/sdk-configuration/otlp-exporter/#header-configuration)でこれをネイティブにサポートしています。
たとえば、ログ用に特定のエンドポイントを設定するには、[`OTEL_EXPORTER_OTLP_LOGS_ENDPOINT`](/docs/languages/sdk-configuration/otlp-exporter/#otel_exporter_otlp_logs_endpoint) を使用します。

このシグナルごとのルーティングをアプリケーションで公開することは技術的にはオプションですが、上級ユーザーにとっては大きな付加価値になります。

### マルチテナンシーを管理するための Collector の運用 {#running-collectors-to-manage-multi-tenancy}

OTLP（ログ、トレース、メトリクスの任意の組み合わせ）をプッシュするようになったら、複数のテナントを管理するために Collector をどのように運用するかを決める必要があります。

Collector のアーキテクチャは、ユーザーのオンボーディングの増加と、新機能のリリースに伴って生成される新しいテレメトリーの量という、2つの成長軸に沿って[スケール](/docs/collector/scaling/)する必要があります。

#### テナントごとの Collector {#one-collector-per-tenant}

アーキテクチャがすでにインフラストラクチャレベルでテナントを分離している場合、各顧客に専用の Collector インスタンスをデプロイできます。
この場合、各インスタンスにはその特定の顧客のエクスポートエンドポイントを直接指す専用の設定があります。

これにより、強力な論理的分離が保証されます。
ある顧客のパイプラインでの遅延や設定ミスが、他の顧客に影響を与えることはありません。

必要なコンポーネントのみを含む[カスタム Collector バイナリを構築](/docs/collector/extend/ocb/)することは可能ですが、数百から数千の Collector インスタンスをデプロイすると、リソース集約的になります。

このトレードオフがあるため、このアーキテクチャは通常、強力なマルチテナント分離が厳格な要件であり、顧客が複雑なエンドポイント設定を持つ可能性があるエンタープライズ SaaS プロダクトに最適です。

![テナントごとの Collector アーキテクチャは、リソース使用量の増加と引き換えに、強力な分離保証を提供します。](collector-per-tenant.png)

#### テナントごとの静的パイプラインを持つ共有 Collector {#shared-collector-with-static-pipelines-per-tenant}

ここでの「静的」とは、各テナントのパイプラインとルーティングルールが、実行時に動的にプロビジョニングされるのではなく、Collector の設定ファイルであらかじめ定義されていることを意味します。

これは[ゲートウェイデプロイパターン](/docs/collector/deploy/gateway/)に近い考え方です。
プラットフォームのすべてのテレメトリーが、単一の集中型 Collector に集約されます。
内部では、テナントごとに個別のパイプラインを定義します。
[ルーティングコネクター](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/v0.158.0/connector/routingconnector#readme)はここで自然に適合し、テナント ID などのリソース属性に基づいてデータを適切なパイプライン（ひいては適切な外部エンドポイント）に振り分けます。

このパターンは、テナントごとのインスタンスを管理するよりも単一のデプロイを運用するほうがシンプルな、初期または中規模のチームに適しています。
1つのデプロイのみを監視・スケールすればよく、すべてのルーティングを一箇所で設定できます。

ただし、顧客基盤が拡大するにつれて増え続ける動的な設定ファイルの管理を受け入れる必要があります。

![共有 Collector パターンは、すべてのエクスポートが1つの Collector インスタンスを通じてルーティングされるため、監視とメンテナンスが容易です。](shared-collector.png)

### カスタムポーリング API 対 OTLP: 結論 {#custom-polling-apis-vs-otlp-the-verdict}

ユーザーにカスタム API をポーリングさせるか、共有の標準で取り込ませるかの選択において、最新の開発者向けプラットフォームのほとんどは後者を選ぶべきです。
標準化が選択肢にならない場合は、カスタムポーリング API を使用してください。

OpenTelemetry の統一プロトコルは、豊富なコンテキストを保持し、ニアリアルタイムでデータを配信し、Cloudflare、Heroku、Kuma、Keycloak によってクラウドとセルフホストの両方のデプロイで大規模に実証されています。
さらに、OpenTelemetry が特定のベンダーから独立していることは、ユーザーがテレメトリーパイプラインの全面的な見直しを必要とせずに、ビジネスニーズに基づいてオブザーバビリティバックエンドを切り替える自由を意味します。

ただし、OpenTelemetry の導入は無償ではありません。
チームは OpenTelemetry の学習と実装に時間を投資し、ユーザーと社内チームにベストプラクティスを案内するために必要なドキュメントを構築する必要があります。

OTel のオブザーバビリティ分野での採用が拡大していることから — プロジェクトは最近 [CNCF を卒業しました](https://www.cncf.io/announcements/2026/05/21/cloud-native-computing-foundation-announces-opentelemetrys-graduation-solidifying-status-as-the-de-facto-observability-standard/) — この初期投資は、自身のテレメトリーをエクスポートするために OpenTelemetry に依存するツールをプラットフォームに統合する際に、大きなリターンをもたらすでしょう。

## すべてをまとめる {#putting-it-all-together}

結論として、ユーザーにテレメトリーを自身のバックエンドにエクスポートさせるために、個別のインテグレーションを構築する必要はありません。

アプリケーションに OTel ネイティブのエクスポートを実装する準備ができたら、以下が主要なアーキテクチャと設計のステップの概要です。

- ログ、トレース、メトリクスのうち、どのテレメトリーシグナルをサポートするかを決定します。
  理想的には3つすべてをサポートすべきですが、プロダクトが生成するものから始めてください。
- OTel SDK または Collector を介して OTLP でそれらのシグナルをエクスポートします。
  同じプッシュベースのアーキテクチャが3つすべてのシグナルで機能します。
- ユーザーが送信先エンドポイントとオプションの認証ヘッダーを設定できるようにします。
  より複雑な構成を持つチームには、シグナルごとのエンドポイントを検討してください。
- データ量とコストを制御するために、ユーザーが個々のシグナルを有効または無効にできるようにします。
- シグナルごとのエンドポイントフォーマット（gRPC/HTTP）、必要なヘッダー、属性/スキーマのセマンティクスをドキュメント化し、ユーザーがバックエンドのデータを確信を持って利用できるようにします。
- Collector のトポロジを選択します。
  強力な分離のためにテナントごとの Collector にするか、運用オーバーヘッドの低減のためにテナントごとのパイプラインを持つ共有 Collector にするかです。
- ユーザーがすぐに使い始められるよう、設定例や環境変数のスニペットを提供します。

上記のポイントは、Cloudflare（メトリクスを除く）、Heroku、Kuma、Keycloak が従っているゴールデンルールも要約しています。
**プッシュをデフォルトにし、ベンダーニュートラルを維持し、動作をドキュメント化する。**

3つすべてのシグナルに対してオープンスタンダードを使用した設計を最初から行うことで、摩擦を取り除き、エンジニアリングのオーバーヘッドを削減し、顧客が自分自身の条件でデータを最大限に活用できるようにします。

プロダクトに OTel ネイティブのエクスポートをすでに実装している場合は、[OpenTelemetry Integrations への追加](/ecosystem/integrations/#how-to-add)を検討してください。
より広いコミュニティにあなたの成果を公開する素晴らしい方法です。

> [!NOTE]
>
> **エンドユーザーとしてこの記事を読んでいる方（開発者ではなく）:** SaaS ベンダーがこの方向に進むのを待つ必要はありません。
>
> OTLP エクスポートを直接依頼してください。
> これは合理的で、ますます一般的になっているリクエストです。
> この記事をベンダーに紹介できます！
