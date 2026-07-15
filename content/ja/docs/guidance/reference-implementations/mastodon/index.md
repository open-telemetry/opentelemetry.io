---
title: 'Mastodon: 小さなチームで本番環境の OpenTelemetry Collector を運用する'
linkTitle: Mastodon
author: >-
  [Juliano Costa](https://github.com/julianocosta89) (Datadog), [Tristan
  Sloughter](https://github.com/tsloughter) (community), [Johanna
  Öjeling](https://github.com/johannaojeling) (Grafana Labs), [Damien
  Mathieu](https://github.com/dmathieu) (Elastic), [Tim
  Campbell](https://github.com/timetinytim) (Mastodon)
sig: End-User
default_lang_commit: 92dfdd7f60d865cdc9a73ae1a469f991b523670f
drifted_from_default: true
cSpell:ignore: otelbin Sidekiq Sloughter Öjeling
---

[Juliano Costa](https://github.com/julianocosta89)（Datadog）、
[Tristan Sloughter](https://github.com/tsloughter)（community）、
[Johanna Öjeling](https://github.com/johannaojeling)（Grafana Labs）、
[Damien Mathieu](https://github.com/dmathieu)（Elastic）、
[Tim Campbell](https://github.com/timetinytim)（Mastodon）著 | 2026年3月18日

このリファレンス実装では、非営利組織としてグローバル規模で運用しながらも非常に小さなチームで活動する Mastodon が、本番環境で OpenTelemetry Collector をどのように運用しているかを説明します。

## Mastodon の概要 {#mastodon-at-a-glance}

[Mastodon](https://joinmastodon.org) は、非営利組織が運営する無料のオープンソース分散型ソーシャルメディアプラットフォームです。

ここでいう分散化はマーケティング用語ではなく、コアとなるアーキテクチャ原則です。
誰でも[自分の Mastodon サーバーを運用](https://docs.joinmastodon.org/user/run-your-own/)でき、それぞれ独立して運用されるサーバーは、オープンプロトコルを使って相互運用します。
これは _Fediverse_ と呼ばれるもの、つまり ActivityPub などの標準化されたプロトコルを使って互いに通信する独立したソーシャルプラットフォームの連合ネットワークの一部です。
メールと同様に、ユーザーは誰がサーバーを運営しているかに関わらず、インスタンスを超えてコミュニケーションできます。

この哲学は、Mastodon の機能に関する意思決定だけでなく、オブザーバビリティへのアプローチにも影響を与えています。

### 組織構造 {#organizational-structure}

Mastodon 組織全体は約20人で構成されており、オブザーバビリティインフラストラクチャ（OpenTelemetry Collector を含む）はエンジニア1人が管理しています。

チームの規模は小さいですが、Mastodon は2つの大規模な本番 Mastodon インスタンスを運用しています。

- [mastodon.social](https://mastodon.social)

  9〜15ノード（各16コア、64 GB RAM）のオートスケーリングを備えた Kubernetes 上で稼働しています。
  Web フロントエンドは5〜20 Pod でスケールし、さまざまな Sidekiq ワーカープールは10〜40 Pod でスケールします。
  平均して、mastodon.social は常時70〜80の Pod が稼働しています。
  このプラットフォームは1日あたり最大 **30万アクティブユーザー** を処理し、毎分約1,000万リクエストを処理します。

- [mastodon.online](https://mastodon.online)

  3〜6ノード（各8コア、32 GB RAM）のオートスケーリングを備えた Kubernetes 上で稼働しています。
  Web フロントエンドは3〜10 Pod でスケールし、Sidekiq プールは5〜15 Pod でスケールし、合計で平均20〜30の Pod が稼働しています。
  このインスタンスは、より小規模ですが、それでも相当な規模で運用されています。

このように限られた運用帯域幅の中では、シンプルさと信頼性は譲れません。

### OpenTelemetry の導入: 設計による選択の自由 {#opentelemetry-adoption-freedom-of-choice-by-design}

Mastodon はオープンソースであり、他者が運用することを前提に設計されているため、チームはオペレーターの自由を保つテレメトリーソリューションを求めていました。

OpenTelemetry がデフォルトとなったのは、各 Mastodon サーバーオペレーターがテレメトリーをどのように収集するか、あるいは収集するかどうかを自分で決められるためです。

シンプルな[環境変数による設定](https://docs.joinmastodon.org/admin/config/#otel)を使って、オペレーターは以下を選択できます。

- テレメトリーをオブザーバビリティバックエンドに直接送信する（Ruby SDK の設定のみを使用）
- テレメトリーを OpenTelemetry Collector 経由でルーティングする
- テレメトリーを完全に無効にする

Mastodon の中核組織は、外部のインスタンスがオブザーバビリティをどのように扱っているかを追跡していません。
重要なのは、送出されるテレメトリーが **[OpenTelemetry セマンティック規約](/docs/specs/semconv/)** に厳密に準拠しており、どこでも利用可能であることです。

このアプローチにより、ベンダー固有のデータモデルを回避し、Mastodon が独自の規約を維持する必要なく、より広い OpenTelemetry エコシステムとの互換性を確保しています。

## Collector アーキテクチャ: ネームスペースごとに1つ、それ以上は不要 {#collector-architecture-one-per-namespace-no-more}

Mastodon の Collector アーキテクチャは意図的にミニマルです。

Kubernetes のネームスペースごとに1つの OpenTelemetry Collector が、トレース、メトリクス、ログのすべてのテレメトリーシグナルを処理します。
ゲートウェイとエージェントの分離ティアも、複雑なルーティングレイヤーも、カスタムデプロイツールもありません。

![Mastodon ノードのアーキテクチャ図](mastodon-nodes.png)

この規模とトラフィックにおいて、これは十分すぎるほどの成果を上げています。

Mastodon のソフトウェアエンジニアである [Tim Campbell](https://github.com/timetinytim) は、Collector を運用してきた約2年間で _一度も問題が発生したことがない_ と述べています。

> 「驚いたことに、本当にうれしい驚きだったのですが、一度も問題に遭遇していません。
> Kubernetes オペレーターを使っているので、何か問題が起きてもそれは自動的に再起動されます。
> 少なくとも Datadog に送られる実際のトレースとログに関しては、ギャップが見られたことはありません。
> メモリとプロセスの面でも、設定した制限内でまったく問題なく動作し続けています。」

## デプロイとライフサイクル管理 {#deployment-and-lifecycle-management}

運用のオーバーヘッドを可能な限り低く抑えるために、Mastodon は以下を利用しています。

- Kubernetes 用の [OpenTelemetry Operator](/docs/platforms/kubernetes/operator/)
- Git ベースのデプロイとプロモーション用の Argo CD

各 Collector は `OpenTelemetryCollector` カスタムリソースとして定義されます。
そこから、Kubernetes がリコンサイル、再起動、ライフサイクル管理を自動的に処理します。

> 「基本的に、作成する必要のある各 `OpenTelemetryCollector` オブジェクトの yaml ファイルを作成するだけでよく、Argo が必要なものを自動的にデプロイ/更新してくれます。」

このモデルは以下を提供します。

- 宣言的な設定
- 障害時の自動復旧
- Git 履歴による明確な監査可能性

注目すべき点として、Mastodon は Collector の Pod に厳密な CPU やメモリの制限を強制していません。
実際には、リソース消費はプラットフォームの残りの部分と比較して無視できるほどにとどまっています。

## サンプリングによるトラフィック管理 {#traffic-management-through-sampling}

リソース制限に頼るのではなく、Mastodon は主にテイルベースサンプリングによってオブザーバビリティのオーバーヘッドを制御しています。

- mastodon.social では、成功したトレースは約 0.1% でサンプリングされ、非常に高いトラフィックにもかかわらず毎分数十のトレースしか生成されません。
- mastodon.online では、サンプリングはやや緩やかですが、同じ原則に従っています。
- すべてのエラートレースは常に収集され、障害に対する完全な可視性を確保しています。

このアプローチにより、データ量を予測可能に保ちながら、価値の高い診断データを維持しています。

## 設定: 主張はあるが、ミニマル {#configuration-opinionated-but-minimal}

Mastodon は OpenTelemetry Collector Contrib ディストリビューションを使用しています。
主な理由は利便性で、カスタムビルドを必要とせずに必要なものがすべて含まれているためです。

設定は以下に焦点を当てています。

- すべてのシグナルの OTLP インジェスション
- Kubernetes メタデータのエンリッチメント
- リソース検出
- テイルベースサンプリング
- バックエンド互換性のための変換

本番環境の完全な設定を以下に参考として掲載します（[otelbin][otelbin-mastodon] でも確認できます）。

<details><summary>Mastodon の Collector 設定</summary>

```yaml
apiVersion: opentelemetry.io/v1beta1
kind: OpenTelemetryCollector
metadata:
  name: mastodon-social
  namespace: mastodon-social
spec:
  nodeSelector:
    joinmastodon.org/property: mastodon.social
  env:
    - name: DD_API_KEY
      valueFrom:
        secretKeyRef:
          name: datadog-secret
          key: api-key
    - name: DD_SITE
      valueFrom:
        secretKeyRef:
          name: datadog-secret
          key: site
  config:
    receivers:
      otlp:
        protocols:
          grpc:
            endpoint: 0.0.0.0:4317
          http:
            endpoint: 0.0.0.0:4318
            cors:
              allowed_origins:
                - 'http://*'
                - 'https://*'

    processors:
      batch: {}
      resource:
        attributes:
          - key: deployment.environment.name
            value: 'production'
            action: upsert
          - key: property
            value: 'mastodon.social'
            action: upsert
          - key: git.commit.sha
            from_attribute: vcs.repository.ref.revision
            action: insert
          - key: git.repository_url
            from_attribute: vcs.repository.url.full
            action: insert
      k8sattributes:
        auth_type: 'serviceAccount'
        passthrough: false
        extract:
          metadata:
            - k8s.namespace.name
            - k8s.pod.name
            - k8s.pod.start_time
            - k8s.pod.uid
            - k8s.deployment.name
            - k8s.node.name
          labels:
            - tag_name: app.label.component
              key: app.kubernetes.io/component
              from: pod
        pod_association:
          - sources:
              - from: resource_attribute
                name: k8s.pod.ip
          - sources:
              - from: resource_attribute
                name: k8s.pod.uid
          - sources:
              - from: connection
      resourcedetection:
        detectors: [system]
        system:
          resource_attributes:
            os.description:
              enabled: true
            host.arch:
              enabled: true
            host.cpu.vendor.id:
              enabled: true
            host.cpu.family:
              enabled: true
            host.cpu.model.id:
              enabled: true
            host.cpu.model.name:
              enabled: true
            host.cpu.stepping:
              enabled: true
            host.cpu.cache.l2.size:
              enabled: true
      transform:
        error_mode: ignore

        # 適切なコード関数の命名
        trace_statements:
          - context: span
            conditions:
              - attributes["code.namespace"] != nil
            statements:
              - set(attributes["resource.name"],
                Concat([attributes["code.namespace"],
                attributes["code.function"]], "#"))

          # 適切な Kubernetes ホスト名
          - context: resource
            conditions:
              - attributes["k8s.node.name"] != nil
            statements:
              - set (attributes["k8s.node.name"],
                Concat([attributes["k8s.node.name"], "k8s-1"], "-"))
        metric_statements:
          - context: resource
            conditions:
              - attributes["k8s.node.name"] != nil
            statements:
              - set (attributes["k8s.node.name"],
                Concat([attributes["k8s.node.name"], "k8s-1"], "-"))
        log_statements:
          - context: resource
            conditions:
              - attributes["k8s.node.name"] != nil
            statements:
              - set (attributes["k8s.node.name"],
                Concat([attributes["k8s.node.name"], "k8s-1"], "-"))
      attributes/sidekiq:
        include:
          match_type: strict
          attributes:
            - key: messaging.sidekiq.job_class
        actions:
          - key: resource.name
            from_attribute: messaging.sidekiq.job_class
            action: upsert
      tail_sampling:
        policies:
          [
            {
              name: errors-policy,
              type: status_code,
              status_code: { status_codes: [ERROR] },
            },
            {
              name: randomized-policy,
              type: probabilistic,
              probabilistic: { sampling_percentage: 0.1 },
            },
          ]

    connectors:
      datadog/connector:
        traces:
          compute_stats_by_span_kind: true

    exporters:
      datadog:
        api:
          site: ${DD_SITE}
          key: ${DD_API_KEY}
        traces:
          compute_stats_by_span_kind: true
          trace_buffer: 500

    service:
      pipelines:
        traces/all:
          receivers: [otlp]
          processors:
            [
              resource,
              k8sattributes,
              resourcedetection,
              transform,
              attributes/sidekiq,
              batch,
            ]
          exporters: [datadog/connector]
        traces/sample:
          receivers: [datadog/connector]
          processors: [tail_sampling, batch]
          exporters: [datadog]
        metrics:
          receivers: [datadog/connector, otlp]
          processors:
            [resource, k8sattributes, resourcedetection, transform, batch]
          exporters: [datadog]
        logs:
          receivers: [otlp]
          processors:
            [
              resource,
              k8sattributes,
              resourcedetection,
              transform,
              attributes/sidekiq,
              batch,
            ]
          exporters: [datadog]
```

</details>

### 最新の状態を維持する {#staying-up-to-date}

Mastodon は通常、各リリースから1〜2日以内に OpenTelemetry Collector をアップグレードしています。

> 「すべてがドキュメント化されており、すべての破壊的変更が適切に詳述されています」と Tim はリリースノートの明確さを称賛しました。

頻繁なリリースにより破壊的変更が生じることもありますが、チームはこれを健全で活発な開発の証とみなしています（最新の状態を保っている限り）。

### 学びと苦労した点 {#lessons-and-pain-points}

旅路の中で最も難しかったのは、単純に始めることでした。
Collector のコンポーネントがどのように連携するかを理解するには時間がかかりました。
特に、専任のオブザーバビリティスペシャリストがいないチームにとってはなおさらです。
最近では、最大の複雑さは transform プロセッサーの高度な使用、特にバックエンド固有の命名要件に合わせてスパン属性を適応させる際に生じています。

```yaml
transform:
  error_mode: ignore

  # 適切なコード関数の命名
  trace_statements:
    - context: span
      conditions:
        - attributes["code.namespace"] != nil
      statements:
        - set(attributes["resource.name"], Concat([attributes["code.namespace"],
          attributes["code.function"]], "#"))
```

上記の transform プロセッサールールでは、`resource.name`（Datadog 固有の属性）を `code.namespace#code.function` の値に設定する条件を構成しています。
これにより、スパンがバックエンドに到着するたびに、定義した名前にマッピングできるようになりました。
その学習曲線にもかかわらず、全体的な体験は期待を上回るものでした。

> 「基本的にやりたいことは何でもできます。
> 期待を超えていました。
> すべてがかなりうまく動いています。」

その信頼性と柔軟性こそが、Mastodon が本番環境で OpenTelemetry Collector を使い続けている理由です。

## 小さなチームへのアドバイス {#advice-for-small-teams}

Mastodon の経験に基づいて、いくつかの教訓が浮かび上がります。

- **アーキテクチャをシンプルに保つ**: 1つの Collector で十分対応できる
- **Kubernetes オペレーターを活用する**: ライフサイクル管理のために
- **サンプリングを使う**: コストを制御するために
- **セマンティック規約に従う**: 長期的なロックインを避けるために
- **頻繁にアップグレードする**: 破壊的変更の負担を軽減するために

## まとめ {#takeaways}

Mastodon の事例は、非常に小さなチームでも、大きな運用負担なく、グローバル規模で OpenTelemetry Collector を本番環境で運用できることを示しています。

[otelbin-mastodon]: https://www.otelbin.io/?#config=receivers%3A*N__otlp%3A*N____protocols%3A*N______grpc%3A*N________endpoint%3A_0.0.0.0%3A4317*N______http%3A*N________endpoint%3A_0.0.0.0%3A4318*N________cors%3A*N__________allowed*_origins%3A*N____________-_*%22http%3A%2F%2F***%22*N____________-_*%22https%3A%2F%2F***%22*N*Nprocessors%3A*N__batch%3A_%7B%7D*N__resource%3A*N____attributes%3A*N______-_key%3A_deployment.environment.name*N________value%3A_*%22production*%22*N________action%3A_upsert*N______-_key%3A_property*N________value%3A_*%22mastodon.social*%22*N________action%3A_upsert*N______-_key%3A_git.commit.sha*N________from*_attribute%3A_vcs.repository.ref.revision*N________action%3A_insert*N______-_key%3A_git.repository*_url*N________from*_attribute%3A_vcs.repository.url.full*N________action%3A_insert*N__k8sattributes%3A*N____auth*_type%3A_*%22serviceAccount*%22*N____passthrough%3A_false*N____extract%3A*N______metadata%3A*N________-_k8s.namespace.name*N________-_k8s.pod.name*N________-_k8s.pod.start*_time*N________-_k8s.pod.uid*N________-_k8s.deployment.name*N________-_k8s.node.name*N______labels%3A*N________-_tag*_name%3A_app.label.component*N__________key%3A_app.kubernetes.io%2Fcomponent*N__________from%3A_pod*N____pod*_association%3A*N______-_sources%3A*N__________-_from%3A_resource*_attribute*N____________name%3A_k8s.pod.ip*N______-_sources%3A*N__________-_from%3A_resource*_attribute*N____________name%3A_k8s.pod.uid*N______-_sources%3A*N__________-_from%3A_connection*N__resourcedetection%3A*N____detectors%3A_%5Bsystem%5D*N____system%3A*N______resource*_attributes%3A*N________os.description%3A*N__________enabled%3A_true*N________host.arch%3A*N__________enabled%3A_true*N________host.cpu.vendor.id%3A*N__________enabled%3A_true*N________host.cpu.family%3A*N__________enabled%3A_true*N________host.cpu.model.id%3A*N__________enabled%3A_true*N________host.cpu.model.name%3A*N__________enabled%3A_true*N________host.cpu.stepping%3A*N__________enabled%3A_true*N________host.cpu.cache.l2.size%3A*N__________enabled%3A_true*N__transform%3A*N____error*_mode%3A_ignore*N*N____*H_Proper_code_function_naming*N____trace*_statements%3A*N______-_context%3A_span*N________conditions%3A*N__________-_attributes%5B%22code.namespace%22%5D_%21*E_nil*N________statements%3A*N__________-_set*Cattributes%5B%22resource.name%22%5D%2C*N____________Concat*C%5Battributes%5B%22code.namespace%22%5D%2C*N____________attributes%5B%22code.function%22%5D%5D%2C_%22*H%22*D*D*N*N______*H_Proper_kubernetes_hostname*N______-_context%3A_resource*N________conditions%3A*N__________-_attributes%5B%22k8s.node.name%22%5D_%21*E_nil*N________statements%3A*N__________-_set_*Cattributes%5B%22k8s.node.name%22%5D%2C*N____________Concat*C%5Battributes%5B%22k8s.node.name%22%5D%2C_%22k8s-1%22%5D%2C_%22-%22*D*D*N____metric*_statements%3A*N______-_context%3A_resource*N________conditions%3A*N__________-_attributes%5B%22k8s.node.name%22%5D_%21*E_nil*N________statements%3A*N__________-_set_*Cattributes%5B%22k8s.node.name%22%5D%2C*N____________Concat*C%5Battributes%5B%22k8s.node.name%22%5D%2C_%22k8s-1%22%5D%2C_%22-%22*D*D*N____log*_statements%3A*N______-_context%3A_resource*N________conditions%3A*N__________-_attributes%5B%22k8s.node.name%22%5D_%21*E_nil*N________statements%3A*N__________-_set_*Cattributes%5B%22k8s.node.name%22%5D%2C*N____________Concat*C%5Battributes%5B%22k8s.node.name%22%5D%2C_%22k8s-1%22%5D%2C_%22-%22*D*D*N__attributes%2Fsidekiq%3A*N____include%3A*N______match*_type%3A_strict*N______attributes%3A*N________-_key%3A_messaging.sidekiq.job*_class*N____actions%3A*N______-_key%3A_resource.name*N________from*_attribute%3A_messaging.sidekiq.job*_class*N________action%3A_upsert*N__tail*_sampling%3A*N____policies%3A*N______%5B*N________%7B*N__________name%3A_errors-policy%2C*N__________type%3A_status*_code%2C*N__________status*_code%3A_%7B_status*_codes%3A_%5BERROR%5D_%7D%2C*N________%7D%2C*N________%7B*N__________name%3A_randomized-policy%2C*N__________type%3A_probabilistic%2C*N__________probabilistic%3A_%7B_sampling*_percentage%3A_0.1_%7D%2C*N________%7D%2C*N______%5D*N*Nconnectors%3A*N__datadog%2Fconnector%3A*N____traces%3A*N______compute*_stats*_by*_span*_kind%3A_true*N*Nexporters%3A*N__datadog%3A*N____api%3A*N______site%3A_*S%7BDD*_SITE%7D*N______key%3A_*S%7BDD*_API*_KEY%7D*N____traces%3A*N______compute*_stats*_by*_span*_kind%3A_true*N______trace*_buffer%3A_500*N*Nservice%3A*N__pipelines%3A*N____traces%2Fall%3A*N______receivers%3A_%5Botlp%5D*N______processors%3A*N________%5B*N__________resource%2C*N__________k8sattributes%2C*N__________resourcedetection%2C*N__________transform%2C*N__________attributes%2Fsidekiq%2C*N__________batch%2C*N________%5D*N______exporters%3A_%5Bdatadog%2Fconnector%5D*N____traces%2Fsample%3A*N______receivers%3A_%5Bdatadog%2Fconnector%5D*N______processors%3A_%5Btail*_sampling%2C_batch%5D*N______exporters%3A_%5Bdatadog%5D*N____metrics%3A*N______receivers%3A_%5Bdatadog%2Fconnector%2C_otlp%5D*N______processors%3A*N________%5Bresource%2C_k8sattributes%2C_resourcedetection%2C_transform%2C_batch%5D*N______exporters%3A_%5Bdatadog%5D*N____logs%3A*N______receivers%3A_%5Botlp%5D*N______processors%3A*N________%5B*N__________resource%2C*N__________k8sattributes%2C*N__________resourcedetection%2C*N__________transform%2C*N__________attributes%2Fsidekiq%2C*N__________batch%2C*N________%5D*N______exporters%3A_%5Bdatadog%5D%7E
