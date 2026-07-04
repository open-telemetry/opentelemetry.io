---
title: 'Observability by Design: OpenTelemetry Weaver で一貫性を実現する'
linkTitle: OTel Weaver
date: 2025-07-02
author: >-
  [Laurent Quérel](https://github.com/lquerel) (F5), [Jeremy
  Blythe](https://github.com/jerbly) (Evertz), [Josh
  Suereth](https://github.com/jsuereth) (Google), [Liudmila
  Molkova](https://github.com/lmolkova) (Microsoft)
sig: 'Semantic Conventions: Tooling'
default_lang_commit: 1143960b75c6faceb40eb64269e68390e3237671
cSpell:ignore: Evertz Liudmila Molkova promconv Quérel SDLC Suereth
---

> [!NOTE] TL;DR
>
> OpenTelemetry Weaver はチームが observability by design を実現するのを支援し、
> セマンティック規約を通じて一貫性のある、型安全で、自動化されたテレメトリーを可能にします。
> Weaver を使えば、テレメトリースキーマの定義、検証、進化を行い、
> システム全体の信頼性と明確性を確保できます。

## 一貫性が重要な理由: セマンティック規約の導入 {#why-consistency-matters-enter-semantic-conventions}

次のような経験をしたことはありませんか…

- メトリクス名が変更されたために、デプロイによって既存のアラートやダッシュボードが壊れた
- チームごとに同じものに異なるメトリクス名を使っているために、過度に複雑なクエリを書かなければならない
- 計装が不足していたり不明確だったりしたために、本番環境の問題のデバッグに何時間も費やした
- ドキュメント化されていない、または一貫性のないメトリクスの解釈にチームが苦労している

これらのいずれかに心当たりがあれば、あなただけではありません。
これらは、テレメトリーをソフトウェア設計の意図的な一部としてではなく、後付けとして扱っていることの症状です。
そこでセマンティック規約の出番です。

**セマンティック規約**は、テレメトリーデータのルールと標準名のセットです。
メトリクス、トレース、ログの「文法」と考えてください。
これにより、すべての人とすべてのもの（ツールを含む）が `http.request.method`、`db.system.name`、`http.client.request.duration` の意味を理解できます。

[OpenTelemetry セマンティック規約](/docs/specs/semconv/)は、9つのSIGによってメンテナンスされる、70以上のドメインにわたる900以上の属性とシグナルを含む大規模なオープンカタログです。
このオープンカタログにより、以下が確保されます。

- **一貫性**: 1つの名前、どこでも1つの意味。
- **相互運用性**: ツール、チーム、ベンダーが互いに理解できる。
- **自動化**: 機械可読な標準により、コードやドキュメントの生成、静的および動的なコンプライアンスチェックなどが可能になる。

しかし、チームやツールをまたいでこのようなレジストリをメンテナンスし進化させることは容易ではありません。
そこで [OTel Weaver](https://github.com/open-telemetry/weaver) の出番です。

## Observability by design: 現代的なエンジニアリングアプローチ {#observability-by-design-a-modern-engineering-approach}

Observability by design とは、オブザーバビリティをソフトウェア開発ライフサイクル（SDLC）の最初から組み込むことを意味します。
これは「オブザーバビリティのシフトレフト」と呼ばれることが多く、オブザーバビリティの関心事を開発タイムラインの中でより早い段階（「左」）に移動させます。
つまり、デプロイ後の監視から設計・開発フェーズへと移行します。

1. **明確な目標を設定する**: オブザーバビリティの目標を前もって定義する。
   どのシグナルが必要か。
2. **自動化する**: ツールを使ってコード、ドキュメント、テスト、スキーマを規約から生成する。
3. **検証する**: オブザーバビリティの問題を本番環境ではなく CI/CD の段階で早期に検出する。
4. **反復する**: 実際のフィードバックと進化するニーズに基づいてテレメトリーを改善する。

言い換えれば、**テレメトリーをパブリック API のように扱う**ということです。
アプリケーションの API をリリース間で壊さないのであれば、テレメトリーも壊さないでください。

## OTel Weaver: セマンティック規約と observability by design を支える {#otel-weaver-empowering-semantic-conventions-and-observability-by-design}

**OTel Weaver** は、セマンティック規約とオブザーバビリティワークフローの管理、検証、進化を支援するオープンソースの CLI および自動化プラットフォームです。

Weaver で何ができるのでしょうか。

- **セマンティック規約の定義とバージョン管理**: 独自の規約を作成するか、OTel の規約の上に構築する。
  スキーマをバージョン管理し、チームやコミュニティと共有できる。
- **ポリシーベースの検証**: ベストプラクティス（命名、安定性、不変性など）を強制する。
  破壊的変更を検出し、品質を維持する。
  独自のポリシーを定義することも可能。
- **ライブ計装チェック**: アプリケーションのテレメトリーが定義されたスキーマとベストプラクティスに一致するかチェックする。
  コードカバレッジと同様に計装カバレッジを測定し、ユニットテストと統合テストが実際にすべての計装されたコードを実行していることを確認する。
  本番環境で重要なシグナルを見逃すことがなくなる。
- **コードとドキュメントの生成**: Markdown ドキュメントや多くのプログラミング言語の定数をすぐに生成できる。
  さらに、より簡単で安全な統合のために、型安全な計装ヘルパー（Go、Rust など）を自動生成するより高度なソリューションにも取り組んでいる。
- **差分と進化**: 自動差分とアップグレード/ダウングレードのサポートにより、テレメトリースキーマを安全に進化させる。

> 定義: レジストリとは、セマンティック規約のコレクションであり、メトリクス、ログ、トレースなどのテレメトリーデータの命名と構造を標準化した定義です。
> OpenTelemetry は公式のセマンティック規約レジストリをメンテナンスしていますが、チーム、プロジェクト、ベンダーが特定のニーズに合わせて独自のカスタムレジストリを定義・公開することも可能です。

Weaver は現在、基本的な形式のマルチレジストリをサポートしており、カスタムレジストリが別のレジストリをインポートしてオーバーライドできます（たとえば、公式の OTel セマンティック規約を拡張する場合）。
現時点では2レベルのみサポートされています。
つまり、カスタムレジストリと単一の依存関係です。
これは多くの一般的なケースをカバーしますが、柔軟性とコラボレーションの可能性がさらに大きいことは認識しています。

## Weaver の実践: 主要コマンド {#weaver-in-action-key-commands}

Weaver を始めるのは簡単です。
ビルド済みバイナリ CLI（リリース[ページ](https://github.com/open-telemetry/weaver/releases)を参照）および Docker [イメージ](https://hub.docker.com/r/otel/weaver)として利用でき、あらゆる CI/CD パイプラインやローカルワークフローにすぐに組み込めます。

### OTel セマンティック規約コミュニティによる Weaver の活用方法 {#how-the-otel-semantic-conventions-community-uses-weaver}

OTel セマンティック規約コミュニティは、公式レジストリの構築、検証、進化のための主要ツールとして Weaver を活用しています。
以下は、コミュニティが使用しているコマンドの一部です。

**公式 OTel レジストリのチェック:**<br/> Weaver はレジストリへのすべての変更が一貫しており、検証済みで、コアポリシーに従っていることを保証します。

```bash
weaver registry check -r registry-path
```

以下のリストは、OTel レジストリに実装されているポリシーの概要を示します。

| **属性ルール**                                         | **命名と構造**                           | **安定性と進化**                 |
| ------------------------------------------------------ | ---------------------------------------- | -------------------------------- |
| レジストリ外の属性は不可                               | 名前はフォーマットルールに従う必要がある | 要素の削除は不可                 |
| 属性に要件レベルは不可                                 | ID は命名パターンに一致する必要がある    | 安定性のダウングレードは不可     |
| グループ内の重複属性は不可                             | 属性は完全修飾である必要がある           | 型やユニットの変更は不可         |
| 属性セットは不変でなければならない                     | 名前空間の衝突は不可                     | 定義には安定性が必要             |
| 安定グループ内の実験的属性はオプトインである必要がある | 定数名の衝突は不可                       | 列挙値は一度定義されたら変更不可 |

**Markdown ドキュメントの生成:**<br/> Weaver は opentelemetry.io で見られる人間が読めるドキュメントを自動的に生成します。

```bash
weaver registry update-markdown -r registry-path --target=markdown
```

**計装ヘルパー用のコード生成:**<br/> サポートされているすべての OpenTelemetry SDK は、各ネイティブ言語で自動生成された定数とコードの恩恵を受け、タイプミスや不整合を防ぎます。

たとえば、Go クライアント SDK 用に Weaver から生成されたコードは、この[リポジトリ](https://github.com/open-telemetry/opentelemetry-go/tree/3264bf171b1e6cd70f6be4a483f2bcb84eda6ccf/semconv?from_branch=main)で確認できます。
使用される Weaver コマンドは次のようになります。

```bash
weaver registry generate -r registry-path -t templates-root-dir go
```

同様に、OpenTelemetry Semantic Conventions for Java ライブラリ用に生成されたコードは、この[プロジェクト](https://github.com/open-telemetry/semantic-conventions-java)で確認できます。
Weaver は Jinja2互換の組み込みテンプレートシステムを提供しており、さまざまな言語でのコード生成を容易にする多数のカスタム関数があります。

**変更の追跡とスキーマの進化:**<br/> Weaver はレジストリバージョン間の差分を追跡し、破壊的変更や改善点を明示します。

```bash
weaver registry diff -r current-version-registry-path --baseline-registry previous-version-registry-path
```

**ライブ計装チェックとカバレッジ:**<br/> ユーザーとメンテナーは Weaver を活用して、アプリケーションが公式セマンティック規約またはカスタムレジストリ（下記参照）に準拠したテレメトリーを正しく出力しているかを[ライブチェック](https://github.com/open-telemetry/weaver/tree/4da6fa62e174e1f0df1a990234bd32f5018cb23a/crates/weaver_live_check?from_branch=main#readme)できます。

```bash
weaver registry live-check --registry registry-path
```

このコマンドは、レジストリに対するアプリケーションが出力するシグナルのコンプライアンスレポートを生成します。

![ライブチェックレポート](live-check.png)

Weaver の `live-check` は、アプリケーションのセマンティック規約への準拠を検証するだけでなく、リンクするすべてのライブラリに対しても CI/CD ワークフロー内で直接適用できます。
基本的なモデルコンプライアンスに加え、カスタム Rego ポリシーにより、組織固有の不変条件とベストプラクティスのチェックが可能です。
すべての属性とシグナルは、受信時にポリシーエンジンを通過します。
たとえば、メトリクスの値の範囲に関するポリシーや、特定の属性の文字列値が正規表現に一致するポリシーを定義できます。
ポリシーはセマンティック規約レジストリから独立しているため、アプリケーションやライブラリ固有のチェックを必要に応じて定義できます。

**`weaver emit` によるテレメトリーのシミュレーション**<br/> コードの計装とダッシュボードの構築は異なるタイミングで行われることが多く、異なる担当者が行うこともあります。
これはオブザーバビリティの取り組みを遅らせる可能性があります。
フロントエンドや SRE チームは、アプリケーションがステージングや本番環境で実データを出力するまで、有用なダッシュボードやアラートを構築できません。
Weaver は `emit` コマンドでこの鶏と卵の問題を解決します。

```bash
weaver registry emit --registry registry-path --endpoint http://localhost:4317
```

このコマンドは OTLP 形式のサンプルテレメトリーを生成し、Collector、バックエンド、可視化ツールに直接送信できます。

### カスタムレジストリ: 独自のテレメトリースキーマの定義とチェック {#custom-registries-defining-and-checking-your-own-telemetry-schema}

Weaver はコア OTel レジストリを支える一方で、アプリケーション独自のテレメトリースキーマの定義と管理にも使用できます。
これにより、公式の規約を再利用・拡張しつつ、ドメインに合わせたカスタムシグナル、属性、イベントを追加でき、アプリケーションのテレメトリーが最新で完全であることを静的およびライブチェックの両方で確認できます。

> Note: カスタムレジストリをさらに使いやすくするために、オンボーディングの改善、設定の簡素化、コード生成やドキュメントサポートのより緊密な統合に積極的に取り組んでいます。
> この領域でのフィードバックと協力を求めています。

始めやすいように、"ToDo" アプリのカスタムレジストリを使った簡単な例を紹介します。
まず、レジストリを指定する `registry_manifest.yaml` ファイルを作成します。

```yaml
name: todo_app
description: OTel signals for my native ToDo app
semconv_version: 0.1.0
dependencies:
  - name: otel
    registry_path: https://github.com/open-telemetry/semantic-conventions/archive/refs/tags/v1.34.0.zip[model]
```

既存の規約をインポートして拡張し、独自のシグナルと属性を定義します。

```yaml
imports: # 依存レジストリ（OTel セマンティック規約）からシグナルをインポート
  metrics:
    - db.client.* # `db.client.` で始まる名前のすべてのメトリクスをインポート
  events:
    - app.*
    - exception # `exception` という名前のイベントをインポート
  entities:
    - host
    - host.cpu

groups:
  - id: metric.todo.completion_time
    type: metric
    brief: Measures the time between the creation and completion of a ToDo item.
    metric_name: todo.completion_time
    instrument: histogram
    unit: s
    attributes:
      - id: todo.priority # 独自の属性を定義
        type: string
        brief: The priority of the ToDo item.
      - id: todo.category
        type: string
        brief: The category of the ToDo item.
      - ref: user.id # インポートしたレジストリの既存属性を参照
        requirement_level: required # 要件レベルを調整
    entity_associations:
      - os.name
      - os.version
  - id: event.todo.deleted
    type: event
    brief: Emitted whenever a ToDo item is deleted by the user.
    attributes:
      - id: delete.reason
        type: string
        brief: The reason for deletion.
      - id: todo.priority
        type: string
        brief: The priority of the deleted ToDo item.
      - ref: user.id
        requirement_level: required
    entity_associations:
      - os.name
      - os.version
```

## Weaver の今後の展望 {#whats-next-for-weaver}

Weaver をより強力で柔軟、かつ導入しやすくするために取り組んでいます。

- **ドキュメントの改善とオンボーディングの容易化**: より多くのハンズオン例、ステップバイステップガイド、使いやすさの向上に注力する。
  カスタムレジストリ向けに調整されたテンプレートとポリシーも作成中。
- **マルチレジストリサポート**: 複数のセマンティック規約レジストリの構成、レイヤリング、管理のサポートを強化する（コンフリクトの解決を含む）。
  これにより、ライブラリの作成者が独自のレジストリを簡単に公開・共有できるようになる。
- **スキーマ v2**: アプリケーションやライブラリ向けに、解決済みの自己完結型テレメトリースキーマをパッケージ化して公開するための新しいコマンドセット。
  この標準化の取り組み（テレメトリースキーマ v2）により、オブザーバビリティエコシステム全体がセマンティック規約と Weaver の上に構築しやすくなる。
- **型安全なセマンティック規約 API の生成**: 強く型付けされた計装ライブラリを自動生成し、エラーを削減して開発を加速させる。
  Prometheus 向けの Go の型安全なクライアント API の例が [promconv](https://github.com/sh0rez/promconv/tree/4ef6f697497dec4dc87a0d670cd90ee12335bcdf?from_branch=main) で進行中。
  Weaver を使用したより汎用的な Go の型安全なクライアント API も [MrAlias/semconv-go](https://github.com/MrAlias/semconv-go) で開発中。

次世代のセマンティック規約管理が間もなく登場します。
Weaver はコミュニティ全体にとってシームレスなものにしていきます。

## 参加しよう {#get-involved}

- **Weaver を試す**:
  [OpenTelemetry Weaver GitHub](https://github.com/open-telemetry/weaver)
- **詳しく知る**: [OTel セマンティック規約](/docs/specs/semconv/)
- **会話に参加する**: CNCF Slack:
  - [#otel-semantic-conventions](https://cloud-native.slack.com/archives/C041APFBYQP)
  - [#otel-weaver](https://cloud-native.slack.com/archives/C0697EXNTL3)
- **貢献する**: あなたのフィードバックと貢献がオブザーバビリティの未来を形作ります。

Weaver は高度に拡張可能で設定可能に構築されています。
カスタムレジストリの作成、Rego によるポリシーの記述、Jinja2によるテンプレートの設計が、Weaver の組み込みエンジンを使って可能です。
始めたい場合や質問がある場合は、Slack の [#otel-weaver](https://cloud-native.slack.com/archives/C0697EXNTL3) に参加してください。
喜んでお手伝いします。あなたのアイデアにも常に関心があります。

> オブザーバビリティは単なるツールではなく、プラクティスです。
> OpenTelemetry Weaver を活用した明確で一貫性のある自動化されたワークフローで、設計段階から構築しましょう。
