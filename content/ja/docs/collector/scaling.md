---
title: コレクターのスケーリング
weight: 26
default_lang_commit: e14614722d84ee9dc8e66e3287afb1ca714f3819
# prettier-ignore
cSpell:ignore: fluentd hostmetrics Linkerd loadbalancer loadbalancing statefulset
---

OpenTelemetry Collectorを使用してオブザーバビリティパイプラインを計画する場合は、テレメトリー収集の増加に合わせてパイプラインをスケールする方法を検討する必要があります。

以降のセクションでは、どのコンポーネントをスケールするか、いつスケールアップするかを判断する方法、そしてその計画を実行する方法といった、計画フェーズについて説明します。

## 何をスケールするか {#what-to-scale}

OpenTelemetry Collectorはすべてのテレメトリーシグナルタイプを単一のバイナリで処理しますが、実際にはタイプごとに異なるスケーリングの需要があり、異なるスケーリング戦略が必要になる場合があります。
まずワークロードを確認して、どのシグナルタイプが負荷の大部分を占めると予想されるか、またコレクターによって受信されると予想されるフォーマットは何かを判断します。
たとえば、スクレイピングクラスターのスケーリングは、ログレシーバーのスケーリングとは大きく異なります。
1日の特定の時間にピークがあるのか、それとも24時間を通じて負荷が同様なのかなど、ワークロードの弾力性がどの程度かも考慮してください。
そのような情報を収集することで、何をスケールする必要があるかがわかります。

たとえば、スクレイピングされる数百のPrometheusエンドポイント、毎分fluentdインスタンスから送信される1テラバイトのログ、そして最新のマイクロサービスからOTLP形式で到着するアプリケーションのメトリクスとトレースがあると仮定します。
このシナリオでは、各シグナル個別にスケールできるアーキテクチャが必要になります。
Prometheusレシーバーのスケーリングには、どのスクレイパーがどのエンドポイントにアクセスするかを決定するために、スクレイパー間の調整が必要です。
対照的に、ステートレスなログレシーバーは必要に応じて水平スケーリングできます。
メトリクスとトレースのOTLPレシーバーを別のコレクタークラスターに配置することで、障害を分離し、ビジーなパイプラインを再起動する心配なしに迅速に反復できます。
OTLPレシーバーはすべてのテレメトリータイプの取り込みを可能にするため、アプリケーションのメトリクスとトレースを同じインスタンスに保持し、必要に応じて水平スケーリングできます。

## いつスケールするか {#when-to-scale}

再掲ですが、スケールアップまたはスケールダウンのタイミングを決定するにはワークロードを理解する必要がありますが、コレクターによって生成されるいくつかのメトリクスは、いつアクションを起こすべきかについての良いヒントを与えてくれます。

memory_limiterプロセッサーがパイプラインの一部である場合、コレクターが提供できる役立つヒントのひとつは `otelcol_processor_refused_spans` メトリクスです。
このプロセッサーは、コレクターが使用できるメモリの量を制限できます。
コレクターはこのプロセッサーで設定された最大量より少し多く消費する場合がありますが、新しいデータは最終的にmemory_limiterによってパイプラインの通過をブロックされ、このメトリクスにその事実が記録されます。
他のすべてのテレメトリータイプにも同じメトリクスが存在します。
パイプラインへのデータ入力が頻繁に拒否されている場合は、コレクタークラスターのスケールアップを検討してください。
ノード全体のメモリ消費量がこのプロセッサーで設定された制限を大幅に下回った場合、スケールダウンできます。

注目すべきもう一方のメトリクスのセットは、エクスポーターのキューサイズに関連するメトリクスである `otelcol_exporter_queue_capacity` と `otelcol_exporter_queue_size` です。
コレクターは、データを送信するためにワーカーが利用可能になるのを待つ間、メモリ内にデータをキューイングします。
十分なワーカーが存在しないか、バックエンドが遅すぎる場合、データはキューに蓄積され始めます。
キューがキャパシティ上限（`otelcol_exporter_queue_size` > `otelcol_exporter_queue_capacity`）に達すると、データは拒否されます（`otelcol_exporter_enqueue_failed_spans`）。
ワーカーを追加すると、コレクターがより多くのデータをエクスポートすることがよくありますが、それが必ずしも望ましいとは限りません（[スケールしない場合](#when-not-to-scale)を参照）。
一般的なガイダンスとしては、キューサイズをモニタリングし、キャパシティの60〜70％に達したときにスケールアップを検討し、一貫して低い場合はスケールダウンを検討しますが、回復力のために最低限のレプリカ数（たとえば3つ）を維持します。

異なるコンポーネントが他のメトリクスを生成する可能性があるため、使用する予定のコンポーネントについてよく理解しておくことも価値があります。
たとえば、[ロードバランシングエクスポーターはエクスポート操作に関するタイミング情報を記録](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/loadbalancingexporter#metrics)し、これを `otelcol_loadbalancer_backend_latency` ヒストグラムの一部として公開します。
この情報を抽出して、すべてのバックエンドがリクエストの処理に同様の時間を要しているかを判断できます。
単一のバックエンドが遅い場合は、コレクター外部の問題を示している可能性があります。

Prometheusレシーバーなどのスクレイピングを行うレシーバーの場合、すべてのターゲットのスクレイプを完了するのにかかる時間がスクレイピング間隔に非常に近くなることが多い場合、スクレイピングをスケールまたはシャーディングする必要があります。
そうなったら、スクレイパー（通常はコレクターの新しいインスタンス）を追加するタイミングです。

### スケールしない場合 {#when-not-to-scale}

おそらく、いつスケールするかを知ることと同じくらい重要なのは、スケーリング操作が何の利益をもたらさないことを示す兆候を理解することです。
ひとつの例として、テレメトリーデータベースが負荷に対応できない場合があります。
データベースをスケールアップしない限り、コレクターをクラスターに追加しても役に立ちません。
同様に、コレクターとバックエンド間のネットワーク接続が飽和している場合、コレクターを追加すると有害な副作用を引き起こす可能性があります。

繰り返しになりますが、この状況を把握する方法のひとつは、`otelcol_exporter_queue_size` と `otelcol_exporter_queue_capacity` のメトリクスを見ることです。
キューのサイズがキャパシティに近いままである場合、データのエクスポートがデータの受信よりも遅いことを示す兆候です。
キューのキャパシティを増やしてみることで、コレクターがより多くのメモリを消費するようになりますが、テレメトリーデータを恒久的にドロップすることなくバックエンドに余裕を持たせることができます。
しかし、キューのキャパシティを増やし続けてもキューのサイズが同じ割合で上昇し続ける場合は、コレクターの外部に目を向ける必要があることを示しています。
ここでさらにワーカーを追加しても役に立たないことにも注意が必要です。
すでに高負荷であるシステムにさらに負担をかけるだけになります。

バックエンドが問題を抱えている場合のもうひとつの兆候は、`otelcol_exporter_send_failed_spans` メトリクスの増加です。
これはバックエンドがデータの送信に恒久的に失敗したことを示しています。
これが継続的に発生している場合は、コレクターのスケールアップは状況を悪化させるだけです。

## どのようにスケールするか {#how-to-scale}

この時点で、パイプラインのどの部分をスケールする必要があるのかわかりました。
スケーリングに関しては、ステートレス、スクレイパー、ステートフルの3種類のコンポーネントがあります。

ほとんどのコレクターコンポーネントはステートレスです。
メモリ内に何らかの状態を保持している場合でも、スケーリングの目的には関係ありません。

Prometheusレシーバーのようなスクレイパーは、外部ロケーションからのテレメトリーデータを取得するように構成されています。
レシーバーはターゲットごとにスクレイプし、データをパイプラインに投入します。

テイルサンプリングプロセッサーのようなコンポーネントは、トレースの進行状況に関連する状態をメモリ内に保持しているため、簡単にスケールできません。
これらのコンポーネントはスケールアップする前に慎重な検討が必要です。

### ステートレスコレクターのスケーリングとロードバランサーの使用 {#scaling-stateless-collectors-and-using-load-balancers}

幸いなことに、ほとんどの場合においてコレクターのスケーリングは簡単であり、新しいレプリカを追加し、ロードバランサーを使用してそれらの間でトラフィックを分散するだけです。

ロードバランサーは以下の場合に不可欠です。

- 受信したテレメトリートラフィックを複数のステートレスコレクターインスタンスに分散し、単一のインスタンスが過負荷になるのを防ぎます。
- 収集パイプラインの可用性とフォールトトレランスを向上させます。
  あるコレクターインスタンスが障害を起こした場合、ロードバランサーはトラフィックを正常なインスタンスにリダイレクトできます。
- 需要に応じてコレクターレイヤーを水平スケーリングします。

Kubernetes環境で運用する場合、IstioやLinkerdのようなサービスメッシュ、あるいはクラウドプロバイダーのロードバランサーによって提供される、堅牢で既製の負荷分散およびレートリミットソリューションを活用してください。
これらのシステムは、基本的な負荷分散を超えたトラフィック管理、レジリエンス、オブザーバビリティのための成熟した機能を提供します。

データの受信にgRPCが使用されている場合、OTLPで一般的なシナリオでは、gRPCを理解するロードバランサー（L7ロードバランサー）を使用します。
標準のL4ロードバランサーでは、単一のバックエンドコレクターインスタンスへの永続的な接続が確立され、クライアントは常に同じバックエンドコレクターにヒットするため、スケーリングの利点は打ち消されます。
信頼性を考慮して、収集パイプラインを分割することを検討してください。
たとえば、ワークロードがKubernetesで実行されている場合、DaemonSetを使用してワークロードと同じ物理ノードにコレクターを配置し、データをストレージに送信する前のデータの前処理を担当するリモートの中央コレクターを配置することができます。
ノード数が少なくPod数が多い場合、gRPCに特化したロードバランサーを必要とせずにコレクターレイヤー間でgRPC接続の負荷分散を改善できるため、サイドカーの方が理にかなっているかもしれません。
サイドカーを使用することは、あるDaemonSetのPodが失敗したときにノード内のすべてのPodにとって重要なコンポーネントをダウンさせないようにするためにも理にかなっています。

サイドカーパターンとは、ワークロードPodにコンテナを追加することです。
[OpenTelemetry Operator](/docs/platforms/kubernetes/operator/)では自動的にサイドカーを追加できます。
それを実現するためには、OpenTelemetry Collector CRが必要であり、PodSpecまたはPodにアノテーションを追加して、オペレーターにサイドカーを注入するように指示する必要があります。

```yaml
---
apiVersion: opentelemetry.io/v1alpha1
kind: OpenTelemetryCollector
metadata:
  name: sidecar-for-my-workload
spec:
  mode: sidecar
  config: |
    receivers:
      otlp:
        protocols:
          grpc:
            endpoint: 0.0.0.0:4317
    processors:

    exporters:
      # Note: v0.86.0より前では `debug` のかわりに `logging` を使用してください。
      debug:

    service:
      pipelines:
        traces:
          receivers: [otlp]
          processors: []
          exporters: [debug]
---
apiVersion: v1
kind: Pod
metadata:
  name: my-microservice
  annotations:
    sidecar.opentelemetry.io/inject: 'true'
spec:
  containers:
    - name: my-microservice
      image: my-org/my-microservice:v0.0.0
      ports:
        - containerPort: 8080
          protocol: TCP
```

オペレーターをバイパスして手動でサイドカーを追加したい場合は、次の例を参照してください。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: my-microservice
spec:
  containers:
    - name: my-microservice
      image: my-org/my-microservice:v0.0.0
      ports:
        - containerPort: 8080
          protocol: TCP
    - name: sidecar
      image: ghcr.io/open-telemetry/opentelemetry-collector-releases/opentelemetry-collector:0.69.0
      ports:
        - containerPort: 8888
          name: metrics
          protocol: TCP
        - containerPort: 4317
          name: otlp-grpc
          protocol: TCP
      args:
        - --config=/conf/collector.yaml
      volumeMounts:
        - mountPath: /conf
          name: sidecar-conf
  volumes:
    - name: sidecar-conf
      configMap:
        name: sidecar-for-my-workload
        items:
          - key: collector.yaml
            path: collector.yaml
```

### スクレイパーのスケーリング {#scaling-the-scrapers}

一部のレシーバーは、hostmetricsやprometheusレシーバーのように、パイプラインに配置するために積極的にテレメトリーデータを取得しています。
ホストメトリクスの取得は通常スケールアップするものではありませんが、Prometheusレシーバーのために何千ものエンドポイントをスクレイプするジョブを分割する必要があるかもしれません。
また、同じ構成でインスタンスを追加することもできません。
なぜなら、各コレクターがクラスター内の他のすべてのコレクターと同じエンドポイントをスクレイプしようとし、サンプルの順序が乱れるなど、さらに多くの問題を引き起こすからです。

この解決策は、エンドポイントをコレクターインスタンスごとにシャーディングすることであり、そうすることでコレクターのレプリカをもうひとつ追加した場合でも、それぞれが異なるエンドポイントセットに対して処理を行うようになります。

もうひとつの方法は、各コレクターに1つの設定ファイルを用意し、各コレクターがそのコレクターに関連するエンドポイントのみを検出するようにすることです。
たとえば、各コレクターは1つのKubernetesの名前空間またはワークロードの特定のラベルを担当することができます。

Prometheusレシーバーのもうひとつのスケーリング方法は、[ターゲットアロケーター](/docs/platforms/kubernetes/operator/target-allocator/)を使用することです。
これは、OpenTelemetry Operatorの一部としてデプロイできる追加のバイナリであり、特定の構成のPrometheusスクレイプターゲットをコレクターのクラスター全体に分散します。
ターゲットアロケーターを使用するには、次のようなカスタムリソース（CR）を使用します。

```yaml
apiVersion: opentelemetry.io/v1alpha1
kind: OpenTelemetryCollector
metadata:
  name: collector-with-ta
spec:
  mode: statefulset
  targetAllocator:
    enabled: true
  config: |
    receivers:
      prometheus:
        config:
          scrape_configs:
          - job_name: 'otel-collector'
            scrape_interval: 10s
            static_configs:
            - targets: [ '0.0.0.0:8888' ]

    exporters:
      # Note: v0.86.0より前では `debug` のかわりに `logging` を使用してください。
      debug:

    service:
      pipelines:
        metrics:
          receivers: [prometheus]
          processors: []
          exporters: [debug]
```

リコンサイルの後、OpenTelemetry Operatorはコレクターの構成を次のように変換します。

```yaml
exporters:
   # Note: v0.86.0より前では `debug` のかわりに `logging` を使用してください。
   debug: null
 receivers:
   prometheus:
     config:
       global:
         scrape_interval: 1m
         scrape_timeout: 10s
         evaluation_interval: 1m
       scrape_configs:
       - job_name: otel-collector
         honor_timestamps: true
         scrape_interval: 10s
         scrape_timeout: 10s
         metrics_path: /metrics
         scheme: http
         follow_redirects: true
         http_sd_configs:
         - follow_redirects: false
           url: http://collector-with-ta-targetallocator:80/jobs/otel-collector/targets?collector_id=$POD_NAME
service:
   pipelines:
     metrics:
       exporters:
       - debug
       processors: []
       receivers:
       - prometheus
```

オペレーターが、`global`セクションと、プロビジョニングしたターゲットアロケーターインスタンスを指す`新しいhttp_sd_configs`を`otel-collector`スクレイプ構成に追加したことに注意してください。
次に、コレクターをスケールさせるには、CRの「replicas」属性を変更します。
そうすると、ターゲットアロケーターがコレクターインスタンス（Pod）ごとにカスタムの`http_sd_config`を提供することにより、それに応じて負荷を分散します。

### ステートフルコレクターのスケーリング {#scaling-stateful-collectors}

特定のコンポーネントはメモリ内にデータを保持している可能性があり、スケールアップすると異なる結果をもたらします。
これはテイルサンプリングプロセッサーの場合であり、特定の期間メモリ内にスパンを保持し、トレースが完了したとみなされたときにのみサンプリングの決定を評価します。
コレクタークラスターをレプリカの追加によってスケールさせると、異なるコレクターが特定のトレースのスパンを受信することになり、各コレクターがそのトレースをサンプリングするべきかを評価し、結果として異なる回答を出す可能性があります。
この動作は、トレースからスパンが欠落する原因となり、そのトランザクションで何が起こったかを誤って表現することになります。

同様の状況は、span-to-metricsプロセッサーを使用してサービスメトリクスを生成する場合にも発生します。
異なるコレクターが同じサービスに関連するデータを受信すると、サービス名に基づく集計が不正確になります。

これを克服するためには、テイルサンプリングやスパンからメトリクスへの処理を行うコレクターの前に、ロードバランシングエクスポーターを含むコレクターレイヤーをデプロイできます。
ロードバランシングエクスポーターはトレースIDまたはサービス名を一貫してハッシュ化し、そのトレースをどのコレクターバックエンドが受信するべきかを決定します。
ロードバランシングエクスポーターは、指定されたDNS Aエントリ（Kubernetesのヘッドレスサービスなど）の背後にあるホストのリストを使用するように構成できます。
そのサービスのバックエンドとなるDeploymentがスケールアップまたはスケールダウンされると、ロードバランシングエクスポーターは最終的に更新されたホストのリストを確認します。
あるいは、ロードバランシングエクスポーターが使用する静的ホストのリストを指定することもできます。
ロードバランシングエクスポーターを使用して構成されたコレクターレイヤーは、レプリカ数を増やすことでスケールアップできます。
ただし各コレクターが異なるタイミングでDNSクエリを実行する可能性があるため、しばらくの間クラスターのビューに違いが生じることに注意してください。
高い弾力性のある環境では、クラスタービューが異なる期間を短くするために、インターバル値を下げることをお勧めします。

以下は、バックエンド情報のインプットとしてDNS Aレコード（Kubernetesのobservability名前空間のotelcolサービス）を使用した構成例です。

```yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317

processors:

exporters:
  loadbalancing:
    protocol:
      otlp:
    resolver:
      dns:
        hostname: otelcol.observability.svc.cluster.local

service:
  pipelines:
    traces:
      receivers:
        - otlp
      processors: []
      exporters:
        - loadbalancing
```
