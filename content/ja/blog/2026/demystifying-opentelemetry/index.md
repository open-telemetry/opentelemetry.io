---
title: 'OpenTelemetry の謎を解く：従来型環境でオブザーバビリティを恐れる必要がない理由'
author: '[Lukasz Ciukaj](https://github.com/luke6Lh43) (Splunk)'
linkTitle: 従来型環境での OTel
date: 2026-01-13
issue: 8548
sig: End-User
default_lang_commit: 381c664de661c95074c2da7f649aa319fe642aaf
cSpell:ignore: ciukaj lukasz
---

何十年もの間、オンプレミスのデータセンターからレガシーアプリケーション、産業制御システムに至る従来型のテクノロジー環境は、多くの組織の基盤を支えてきました。
これらのシステムは実績があり、ビジネスオペレーションに深く組み込まれていますが、IT プラクティスの近代化、特にオブザーバビリティに関しては独特の課題を抱えています。

**従来型環境でオブザーバビリティを実装する際の課題：**

- ノイズが多く構造化されていないログからは、意味のある情報を抽出することが困難です。
- 異なるツールやシステムにわたってサイロ化された監視データは、可視性の断片化につながります。
- レガシーアプリケーションやシステムでは計装が限られているため、最新のメトリクスやトレースの収集が困難です。
- チームは新しいオブザーバビリティツールの追加によるパフォーマンスへの影響を懸念することが多いです。
- レガシープロトコルやハードウェアと最新のプラットフォームとの統合は困難な場合があります。

これを実践的に理解するために、忙しい生産ラインを持つ架空の製造会社を見ていきましょう。
ここでは、センサーを搭載したロボットアームが MQTT 経由で運用データを中央ブローカーに報告しています。
レガシーアプリケーションは生産イベントやエラーをディスクにログとして記録し、SQL Server と Windows マシンが生産、分析、在庫管理をサポートしています。
聞き覚えがあるでしょうか。
これは、古い世界と新しい世界をつなごうとする多くの組織の現実です。

![架空の組織のオブザーバビリティアーキテクチャ図](fictional-organization-architecture.png)

計装が組み込まれているクラウドネイティブ環境とは異なり、レガシーシステムや産業システムは一貫性のないログ、限られたメトリクス、断片化されたツールに依存しています。
これにより可視性が不足し、トラブルシューティング、チューニング、メンテナンスが遅く困難になります。
組織が信頼性の向上と変革の加速を目指す中で、オブザーバビリティはもはや「あれば便利」なものではなく、戦略的な必須要素です。
しかし、オブザーバビリティへの道、そして OpenTelemetry への標準化の道は、根強い誤解によって曇らされることがあります。
いくつかの誤解を打ち破りましょう！

## 誤解 1：私たちのシステムは大量の役に立たないログを生成するだけで、ここでオブザーバビリティを実現する方法はない {#myth-1-our-systems-just-generate-a-bunch-of-useless-logs--theres-no-way-observability-can-be-done-here}

レガシーの生産システムについて考えてみてください。古い機械やアプリケーションが、ファイルにプレーンテキストのログをひたすら出力し続けているかもしれません。
JSON も構造も API もなく、ただ延々とテキストの行が続くだけです。
そのような混沌から意味のある洞察を引き出す方法はないと思いがちです。

### なぜこの誤解が根強いのか（レガシーログ） {#why-this-myth-persists-legacy-logs}

多くの従来型環境では、生産ライン、レガシーアプリケーション、産業制御システムのいずれであっても、目にする唯一のデジタル「シグナル」は、生の構造化されていないログファイルのストリームかもしれません。
運用マネージャーにとって、これらのファイルは不透明でもどかしい存在です。
運用マネージャーは特定の障害を深く気にかけています。
ライン 1 が「Jam」で停止しているのか「LowPressure」で停止しているのかを知ることが、即時の対応とメンテナンス戦略を決定します。
しかし、その重要なデータが **FAULT_DETECTED: Line1, Fault=Jam** のような非構造化テキストに埋もれていると、標準的な監視ダッシュボードからは見えません。
テキストをグラフ化することはできず、ファイル内の文字列に対して簡単にアラートを設定することもできず、時間の経過に伴う傾向を把握することもできません。
このことが、これらのシステムは監視できないという誤解につながっています。
しかし、OpenTelemetry のような最新のオブザーバビリティツールを使えば、これらの「役に立たない」ログは運用上の洞察の宝庫になり得ます。

### レガシーログの行の例 {#example-legacy-log-lines}

```console
2026-01-04 00:39:58 | PRODUCT_COMPLETED: Line1, Count=1
2026-01-04 00:40:00 | FAULT_DETECTED: Line2, Fault=LowPressure
2026-01-04 00:40:02 | MACHINE_START: Line2
2026-01-04 00:40:07 | FAULT_DETECTED: Line2, Fault=Overheat
2026-01-04 00:40:10 | MACHINE_START: Line2
2026-01-04 00:40:14 | PRODUCT_COMPLETED: Line1, Count=1
2026-01-04 00:40:18 | MACHINE_START: Line2
2026-01-04 00:40:21 | PRODUCT_COMPLETED: Line1, Count=1
2026-01-04 00:40:27 | SENSOR_READING: Line1, Temp=83.9
2026-01-04 00:40:29 | FAULT_DETECTED: Line1, Fault=LowPressure
2026-01-04 00:40:32 | SENSOR_READING: Line1, Temp=84.7
2026-01-04 00:40:34 | PRODUCT_COMPLETED: Line1, Count=1
```

### このシステムを可観測にする方法 {#how-to-make-this-system-observable}

OpenTelemetry Collector はこれらのファイルをリアルタイムで監視し、イベントをパースし、レガシーアプリケーションにコード変更を加えることなく、構造化されたメトリクスに変換できます。

#### OpenTelemetry Collector の設定例 {#sample-opentelemetry-collector-config}

```yaml
receivers:
  filelog:
    include: [/logs/legacy.log]
    start_at: end
    operators:
      # 1. 汎用パース: タイムスタンプ、イベント、ラインをキャプチャし、残りを 'params' に格納
      - type: regex_parser
        regex:
          '^(?P<timestamp>.+?) \| (?P<event_type>[A-Z_]+): (?P<line>Line\d+)(?:,
          (?P<params>.*))?'
        timestamp:
          parse_from: attributes.timestamp
          layout: '%Y-%m-%d %H:%M:%S'

      # 2. 特定の抽出: 'params' 内で "Fault=" を検索
      - type: regex_parser
        regex: 'Fault=(?P<fault>\w+)'
        parse_from: attributes.params
        if: 'attributes.params != nil'

connectors:
  count:
    logs:
      machine_events_total:
        description: 'Count of manufacturing events by type, line, and fault.'
        attributes:
          - key: event_type
            default_value: 'unknown'
          - key: line
            default_value: 'unknown'
          - key: fault
            default_value: 'none' # 障害が見つからない場合に自動的に適用される

service:
  pipelines:
    logs:
      receivers: [filelog]
      exporters: [count]
    metrics/generated:
      receivers: [count]
      exporters: [prometheus]
```

#### 仕組み {#how-it-works}

- **チェーンパース：** filelog レシーバーはまず、高レベルのイベント（たとえば FAULT_DETECTED）を識別します。
  次に、障害タイプ（「Jam」や「Overheat」など）を抽出するために、2 番目の特定のチェックを実行します。
  これにより、設定が堅牢で読みやすくなります。
- **メトリクス生成：** count コネクターは、これらのパースされたログを `machine_events_total` というメトリクスに変換します。

#### 結果 {#result}

この設定により、古いテキストログは構造化されたクエリ可能なデータソースになります。
運用マネージャーはダッシュボードを開いて、過去 1 時間に「Line 1」で発生した「Jam」障害の数を正確に確認でき、レガシーアプリケーションのコードを 1 行も変更することなくデータドリブンの意思決定を促進できます。
誤解は打ち破られました！

Prometheus のサンプルダッシュボード：

![システム障害を表示する Prometheus ダッシュボード](prometheus-faults-dashboard.png)

## 誤解 2：IoT デバイスは MQTT ブローカーにテレメトリーを送信するので、OpenTelemetry との統合は不可能 {#myth-2-our-iot-devices-publish-telemetry-to-mqtt-broker-so-integrating-with-opentelemetry-isnt-possible}

生産ラインは、MQTT（Message Queuing Telemetry Transport）ブローカーにデータを送信するロボットアームとセンサーに依存しています。
MQTT は IoT（Internet of Things）の業界標準ですが、OpenTelemetry がネイティブに理解するものではありません。
これは、最新の監視が使えないということを意味するのでしょうか。

### なぜこの誤解が根強いのか（IoT と MQTT の統合） {#why-this-myth-persists-iot-and-mqtt-integration}

MQTT は、数多くの産業・IoT 環境のメッセージングバックボーンであり、デバイスからブローカーにセンサーデータを確実に運びます。
しかし、MQTT は独自の軽量プロトコルとエコシステムを使用しているため、多くのチームはセンサーデータを最新のオブザーバビリティパイプラインに簡単に取り込めないと思い込んでいます。
一部の MQTT ブローカーは現在 OpenTelemetry とネイティブに統合されており、OTLP プロトコルを使用してメトリクスとトレースを直接エクスポートできます。
この機能をサポートする最新のブローカーを使用している場合は、ブローカーを Collector の OTLP エンドポイントに向けるだけで、追加のコードは不要です。

ブローカーが OTLP エクスポートをサポートしていない場合でも、問題はありません。
軽量なブリッジサービスを使用して MQTT トピックをサブスクライブし、メッセージを OpenTelemetry Collector に転送できます。

### IoT センサーから送信されるデータの例 {#example-data-sent-from-an-iot-sensor}

この場合、ロボットアームのセンサーが MQTT に送信するペイロードは次のようになります。

```json
{
  "device_id": "robot-arm-7",
  "job_id": "abc123",
  "temp": 78.4,
  "humidity": 32.6,
  "job_start": "2025-12-19T12:00:02Z",
  "job_end": "2025-12-19T12:00:05Z"
}
```

このメッセージは、どのデバイスが送信したか、ジョブの詳細、および関連するセンサーの読み取り値を示しています。

### MQTT ブリッジアプリでのトレースとスパンの作成 {#creating-traces-and-spans-in-the-mqtt-bridge-app}

メトリクスだけでなく真のエンドツーエンドの可視性を得るには、各デバイスジョブの期間とコンテキストを表す OpenTelemetry スパンを作成できます。
これにより、特定のデバイスジョブをダウンストリームの処理、レイテンシー、またはエラーと相関させることが可能になり、デバイスの動作とパフォーマンスを時間の経過とともに分析しやすくなります。
プロセスが HTTP 経由で通信しない高度なシナリオでは、OpenTelemetry は環境変数を使用してトレースコンテキストを伝搬できるため、ダウンストリームのプロセスが自身のテレメトリーを元のジョブにリンクできます。
詳細は[環境変数によるコンテキスト伝搬に関する OpenTelemetry ドキュメント](/docs/specs/otel/context/env-carriers/)をご覧ください。

以下のスニペットは、センサーメッセージをリッスンし、ジョブのタイミングを抽出し、ジョブの期間を反映するスパンを作成する MQTT ブリッジ Python アプリのサンプルです。

```python
import json
import datetime
import paho.mqtt.client as mqtt
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter
from opentelemetry.sdk.trace.export import BatchSpanProcessor

# OpenTelemetry トレーシングのセットアップ
trace.set_tracer_provider(TracerProvider())
tracer = trace.get_tracer(__name__)
span_processor = BatchSpanProcessor(OTLPSpanExporter(endpoint="http://collector:4318/v1/traces"))
trace.get_tracer_provider().add_span_processor(span_processor)

def on_message(client, userdata, msg):
    payload = json.loads(msg.payload.decode())
    job_start = datetime.datetime.fromisoformat(payload["job_start"].replace("Z", "+00:00"))
    job_end = datetime.datetime.fromisoformat(payload["job_end"].replace("Z", "+00:00"))

    span = tracer.start_span(
        "robotic_job",
        start_time=job_start.timestamp(),
    )
    try:
        span.set_attribute("device_id", payload["device_id"])
        span.set_attribute("job_id", payload["job_id"])
        span.set_attribute("temperature", payload["temp"])
        span.set_attribute("humidity", payload["humidity"])
        # ...追加の処理...
    finally:
        span.end(end_time=job_end.timestamp())

# MQTT クライアントのセットアップ
client = mqtt.Client()
client.on_message = on_message
client.connect("mqtt-broker", 1883)
client.subscribe("production/robot-arms")
client.loop_forever()
```

Jaeger でのサンプルスパン：

![サンプルスパンを表示する Jaeger トレース](sample-span-jaeger.png)

#### ここでのポイントは？ {#whats-the-trick-here}

`start_time=job_start.timestamp()`（およびオプションで `end_time`）を明示的に指定することで、メッセージの処理が後で行われたとしても、スパンはジョブの実際の実行を正確に追跡します。
これにより、各ジョブがいつ発生し、デバイス、処理ステップ、バックエンドにわたってどれくらいの時間がかかったかを正確に示す、クエリ可能なトレースが得られます。

IoT センサーデータをダッシュボードやアラート用のメトリクスに変換するには、いくつかの方法があります。

- **ブリッジアプリから直接メトリクスを送信する：** OpenTelemetry のメトリクス API を使用して、スパンと併せて、またはスパンのかわりに、カスタムメトリクス（温度、湿度、ジョブの所要時間など）を送信できます。

- **専用のプロセッサーを作成する：** 受信スパンからメトリクスを導出し、スパン属性から値を抽出するカスタム OpenTelemetry Collector プロセッサーを構築します。
- **オブザーバビリティバックエンドを活用する：** 多くの最新バックエンドは、スパン属性からメトリクスを生成できるため、最小限の追加作業でジョブのテレメトリーをアクション可能でクエリ可能なメトリクスに変換できます。

### まとめ {#bottom-line}

MQTT ブローカーが OpenTelemetry をサポートしている場合は、ネイティブの OTLP エクスポートを使用してシームレスに統合できます。
サポートしていない場合でも、シンプルなブリッジアプリでセンサーやイベントストリームを完全なオブザーバビリティデータに変換できます。
最新のオブザーバビリティバックエンドはスパン属性からメトリクスを導出できるため、IoT シグナルから意味のある洞察への変換がさらに容易になります。
より深い統合やカスタム処理が必要な場合は、Collector に直接カスタム MQTT レシーバーを組み込むこともできます。
[カスタムレシーバーに関する OpenTelemetry ガイド](/docs/collector/extend/custom-component/receiver/)をご覧ください。
誤解は打ち破られました！

## 誤解 3：Windows と SQL Server の環境はオブザーバビリティと互換性がない {#myth-3-windows-and-sql-server-environments-are-incompatible-with-observability}

Windows マシンと SQL Server は、分析から在庫管理まであらゆるものを実行し、私たちのオペレーションのバックボーンです。
しかし、多くの人はこれらのプラットフォームが最新のオープンなオブザーバビリティツールの対象外であると信じています。

### なぜこの誤解が根強いのか（Windows と SQL Server） {#why-this-myth-persists-windows-and-sql-server}

監視とオブザーバビリティはクラウドネイティブまたは Linux ベースのシステムでのみ可能であり、従来の Windows サーバーや SQL Server のワークロードは対象外であるというのはよくある思い込みです。
実際には、OpenTelemetry Collector は両方の環境をサポートしており、最小限の設定で使用できる専用レシーバーを備えています。
詳しく見ていきましょう。

### OpenTelemetry Collector による SQL Server の監視 {#observing-sql-server-with-the-opentelemetry-collector}

多くの組織は、生産、分析、または在庫管理に SQL Server データベースを使用しています。
OpenTelemetry Collector の [sqlserver レシーバー](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/ab56dd45ea2240f7014470bcc31c1b3fafc1ef19/receiver/sqlserverreceiver?from_branch=main)を使用すると、データベースホストにエージェントを配置することなく、ヘルスやパフォーマンスのメトリクスを直接スクレイプできます。
以下は、このセットアップ方法を示す設定例です。

```yaml
receivers:
  sqlserver/sql1:
    collection_interval: 30s
    username: oteluser
    password: YourStrong!Passw0rd
    server: sql-server-1
    port: 1433

  sqlserver/sql2:
    collection_interval: 30s
    username: oteluser
    password: YourStrong!Passw0rd
    server: sql-server-2
    port: 1433

service:
  pipelines:
    metrics/regular:
      receivers: [sqlserver/sql1, sqlserver/sql2]
      exporters: [prometheus]
```

#### SQL Server 監視で達成できること {#what-this-achieves-for-sql-server-monitoring}

Collector は SQL Server の主要なメトリクス（接続、バッファプール、ロック、バッチレートなど）を定期的にスクレイプし、オブザーバビリティバックエンドに公開します。

![SQL Server メトリクスを表示する Prometheus ダッシュボード](prometheus-sqlserver.png)

### Windows パフォーマンスカウンターレシーバーによる Windows マシンの監視 {#observing-windows-machines-with-the-windows-performance-counters-receiver}

従来の Windows ホストは、今なお多くの生産・制御環境を支えています。
[Windows パフォーマンスカウンターレシーバー](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/ab56dd45ea2240f7014470bcc31c1b3fafc1ef19/receiver/windowsperfcountersreceiver?from_branch=main)（OpenTelemetry Collector Contrib ディストリビューションの一部）を使用すると、ネイティブの PDH インターフェイスを通じて、Windows レジストリからシステム、アプリケーション、またはカスタムメトリクスを幅広く収集できます。
以下は、Windows マシン上で動作する軽量エージェントが中央の Collector にデータを転送する設定例です。

```yaml
receivers:
  windowsperfcounters:
    collection_interval: 30s
    metrics:
      processor.time.total:
        description: Total CPU active and idle time
        unit: '%'
        gauge:
      memory.committed:
        description: Committed memory in bytes
        unit: By
        gauge:
    perfcounters:
      - object: 'Processor'
        instances: ['_Total']
        counters:
          - name: '% Processor Time'
            metric: processor.time.total
      - object: 'Memory'
        counters:
          - name: 'Committed Bytes'
            metric: memory.committed

exporters:
  otlp:
    endpoint: 'central-collector:4317'

service:
  pipelines:
    metrics:
      receivers: [windowsperfcounters]
      exporters: [otlp]
```

#### Windows マシンで達成できること {#what-this-achieves-for-windows-machines}

CPU、メモリ、ディスク、および任意のカスタム Windows カウンターを取り込み、数十年前のシステムでもファーストクラスのオブザーバビリティ対象にすることができます。
レシーバーは堅牢であり、カウンターが存在しない場合は警告をログに記録しますが、利用可能なすべてのメトリクスのスクレイプは継続します。

![Windows メトリクスを表示する Prometheus ダッシュボード](prometheus-windows.png)

## まとめ {#conclusion}

OpenTelemetry Collector は、レガシーログ、MQTT ストリーム、SQL Server データベース、さらに従来の Windows ホストからのデータを統合し、オブザーバビリティはグリーンフィールドやクラウドネイティブシステム専用であるという誤解を打ち破ります。
適切な設定があれば、環境がどれほど古く断片化されていても、信頼性、トラブルシューティング、パフォーマンス最適化のためのアクション可能なリアルタイムの洞察を得ることができます。

この投稿の例は、数十年前のログ、産業テレメトリー、従来の Microsoft インフラストラクチャを最新のオブザーバビリティスタックに取り込むことが、可能であるだけでなく実用的であることを示しています。
既存のものを破棄して置き換える必要はなく、すでにあるものの上に構築し、段階的に計装を進め、これまで不透明だったシステムから新しい価値を引き出すことができます。

これらの誤解を打ち破ることで、従来型であれ複雑であれ、あらゆる環境がオブザーバブルでレジリエントになり、デジタルトランスフォーメーションの準備が整う可能性を持っていることがわかります。
OpenTelemetry は、柔軟でオープンな標準を提供し、自分のペースで近代化を進めることを可能にします。

すべての誤解が打ち破られました。
可視性が実現しました。
従来型環境は未来に向けた準備ができています。
今こそ洞察をアクションに変える時です！
