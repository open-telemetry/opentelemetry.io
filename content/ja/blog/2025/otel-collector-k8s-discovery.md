---
title: OpenTelemetry Collector の Kubernetes アノテーションベースディスカバリ
linkTitle: K8s アノテーションベースディスカバリ
date: 2025-01-27
author: >
  [Dmitrii Anoshin](https://github.com/dmitryax) (Cisco/Splunk), [Christos
  Markou](https://github.com/ChrsMark) (Elastic)
sig: Collector
issue: opentelemetry-collector-contrib#34427
default_lang_commit: b1a0f28af706594af1bb556226f78be7c2974f66
cSpell:ignore: Anoshin Dmitrii Markou
---

コンテナと [Kubernetes](https://kubernetes.io/) の世界では、オブザーバビリティが不可欠です。
ユーザーは、任意の時点でワークロードの状態を把握する必要があります。
言い換えれば、動き続けるオブジェクトに対するオブザーバビリティが必要なのです。

ここで [OpenTelemetry Collector](/docs/collector/) とその [receiver creator](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/v0.117.0/receiver/receivercreator) コンポーネントが役立ちます。
ユーザーは、クラスターレベルで最小権限の原則に従いながら、セルフサービス方式でかなり複雑な監視シナリオを構築できます。

セルフサービス方式は優れていますが、実際にどの程度セルフサービスにできるのでしょうか。
このブログ記事では、Collector に新しく追加された機能を紹介します。
この機能により、動的なワークロードディスカバリがさらに簡単になり、管理者とユーザーの双方にシームレスな体験を提供します。

## コンテナと Pod の自動ディスカバリ {#automatic-discovery-for-containers-and-pods}

コンテナや Pod 上で動作するアプリケーションは、監視システムにとって動くターゲットになります。
自動ディスカバリにより、Collector のような監視エージェントはコンテナや Pod レベルの変更を追跡し、監視設定を動的に調整できます。

現在、Collector、具体的には receiver creator がこのような体験を提供できます。
receiver creator を使うことで、オブザーバビリティのユーザーは環境条件に依存する設定「テンプレート」を定義できます。
たとえば、オブザーバビリティエンジニアとして、クラスター上に NGINX Pod がデプロイされたときに [NGINX receiver](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/v0.117.0/receiver/nginxreceiver) を有効にするように Collector を設定できます。
以下の設定でこれを実現できます。

```yaml
receivers:
  receiver_creator:
    watch_observers: [k8s_observer]
    receivers:
      nginx:
        rule: type == "port" && port == 80 && pod.name matches "(?i)nginx"
        config:
          endpoint: 'http://`endpoint`/nginx_status'
          collection_interval: '15s'
```

上記の設定は、Kubernetes API を通じて発見された Pod がポート `80`（NGINX の既知のポート）を公開しており、名前が `nginx` キーワードに一致する場合に有効になります。

これは素晴らしいことであり、SRE やプラットフォームエンジニアとしてオブザーバビリティソリューションを管理する場合、ユーザーの NGINX ワークロード監視ニーズに対応するためにこれを活用できます。
しかし、別のチームが Apache サーバーのような別の種類のワークロードを監視したい場合はどうなるでしょうか。
そのチームはあなたのチームに連絡し、あなたは新しい条件付き設定ブロックで設定を更新し、プルリクエストとレビュープロセスを経て、最終的にデプロイする必要があります。
このデプロイでは、新しい設定を反映するために Collector インスタンスの再起動が必要です。
このプロセスはチームによっては大きな問題ではないかもしれませんが、改善の余地は確実にあります。

では、Collector ユーザーとして自動ディスカバリを有効にするだけで、クラスターのユーザーが Pod に適切にアノテーションを付けることで、ワークロードをどのように監視すべきかを Collector に伝えられるとしたらどうでしょうか。
これは素晴らしいアイデアですが、実は新しいものではありません。
OpenTelemetry はすでに [Kubernetes Operator](/docs/platforms/kubernetes/operator/automatic/) を通じた自動計装をサポートしており、ユーザーは Pod にアノテーションを付けるだけでアプリケーションを自動的に計装できます。
さらに、これはオブザーバビリティ業界の他の監視エージェントがすでにサポートしている機能であり、ユーザーにとって馴染みのあるものです。

これらすべてのモチベーションにより、OpenTelemetry コミュニティ（[GitHub イシュー](https://github.com/open-telemetry/opentelemetry-collector-contrib/issues/17418)）は Collector 向けの同様の機能を作成しました。
Kubernetes アノテーションに基づく自動ディスカバリが Collector でサポートされるようになったことをお知らせできることを嬉しく思います（[GitHub イシュー](https://github.com/open-telemetry/opentelemetry-collector-contrib/issues/34427)）。

## 解決策 {#a-solution}

この解決策は、[Kubernetes observer](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/v0.117.0/extension/observer/k8sobserver) と [receiver creator](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/v0.117.0/receiver/receivercreator) が提供する既存の機能の上に構築されています。

K8s observer は、K8s クラスターに現れるオブジェクトについて receiver creator に通知し、それらに関するすべての情報を提供します。
K8s オブジェクトのメタデータに加えて、observer は Collector が接続できる検出されたエンドポイントに関する情報も提供します。
これは、検出された各エンドポイントが特定のスクレイプレシーバーによってメトリクスデータの取得に使用される可能性があることを意味します。

各スクレイプレシーバーには、必須フィールドが `endpoint` の1つだけのデフォルト設定があります。
エンドポイント情報は Kubernetes observer によって提供されるため、ユーザーが明示的に提供する必要がある唯一の情報は、検出されたエンドポイントからデータをスクレイプするためにどのレシーバー/スクレイパーを使用すべきかということです。
その情報は Collector で設定できますが、前述のとおり不便です。
特定の Pod からテレメトリーをスクレイプするためにどのレシーバーを使用できるかを定義するのに、はるかに便利な場所は Pod 自体です。
Pod のアノテーションは、そのような詳細を記述する自然な場所です。
receiver creator はアノテーションにアクセスできるため、レシーバーのデフォルト設定と検出されたエンドポイントを使って適切なレシーバーをインスタンス化できます。

以下のアノテーションは、この特定の Pod が NGINX を実行しており、[NGINX receiver](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/v0.117.0/receiver/nginxreceiver) を使用してメトリクスをスクレイプできることを receiver creator に指示します。

```yaml
io.opentelemetry.discovery.metrics/scraper: nginx
```

それとは別に、Pod でのディスカバリは以下のアノテーションで明示的に有効にする必要があります。

```yaml
io.opentelemetry.discovery.metrics/enabled: 'true'
```

一部のシナリオでは、レシーバーのデフォルト設定が特定の Pod への接続に適さない場合があります。
その場合、別のアノテーションの一部としてカスタム設定を定義できます。

```yaml
io.opentelemetry.discovery.metrics/config: |
  endpoint: "http://`endpoint`/nginx_status"
  collection_interval: '20s'
  initial_delay: '20s'
  read_buffer_size: '10'
```

アノテーションで定義された設定では、receiver creator を別の Pod に向けることはできないことに注意してください。
Collector はそのような設定を拒否します。

メトリクスのスクレイプに加えて、アノテーションベースのディスカバリは filelog レシーバーによるログ収集もサポートしています。
以下のアノテーションを使用して、特定の Pod でのログ収集を有効にできます。

```yaml
io.opentelemetry.discovery.logs/enabled: 'true'
```

メトリクスと同様に、オプションの設定を以下の形式で提供できます。

```yaml
io.opentelemetry.discovery.logs/config: |
  max_log_size: "2MiB"
  operators:
  - type: container
    id: container-parser
  - type: regex_parser
    regex: '^(?P<time>\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}) (?P<sev>[A-Z]*) (?P<msg>.*)$'
```

filelog レシーバーのオペレーター一覧を変更する必要がある場合、デフォルトのコンテナパーサーを含む完全なリストを再定義する必要があります。
リスト型の設定フィールドは、デフォルトの設定構造体にマージされる際に完全に置換されるためです。

ディスカバリ機能は、以下の設定フィールドを追加することで receiver creator で明示的に有効にする必要があります。

```yaml
receivers:
  receiver_creator:
    watch_observers: [k8s_observer]
    discovery:
      enabled: true
```

## 試してみよう {#give-it-a-try}

Kubernetes 上で OpenTelemetry Collector を使用しており、この新機能に興味がある場合は、[Receiver Creator configuration][] セクションを参照して詳細をご確認ください。

ぜひ試して、[CNCF Slack ワークスペース](https://slack.cncf.io/)の `#otel-collector` チャンネルでご意見をお聞かせください。

[Receiver Creator configuration]: https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/v0.117.0/receiver/receivercreator/README.md#generate-receiver-configurations-from-provided-hints
