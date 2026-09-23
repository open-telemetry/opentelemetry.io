---
title: OpenTelemetry Collector で任意のカスタムメトリクスを受信する
linkTitle: 任意のメトリクスのレシーバー
date: 2023-11-30
author: '[Severin Neumann](https://github.com/svrnm), Cisco'
default_lang_commit: 0009192ae1f96290e0b5ecc7e800c2947d209f69
# prettier-ignore
cSpell:ignore: carbonreceiver debugexporter gomod helmuth openssl otlpexporter otlphttpexporter otlpreceiver ottl transformprocessor webserver
---

OpenTelemetry（OTel）は _"未知の未知"_ のトラブルシューティングや対処に役立つだけでなく、ディスク使用量、サーバーの可用性、SSL 証明書の有効期限といったシステムメトリクスの監視のような定型作業の管理にも有用です。
これは、[OpenTelemetry Collector](/docs/collector) で利用可能な [90以上のレシーバー](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/944d4a82c408d58f9d8ba1a1d4783094301af0de/receiver?from_branch=main)のいずれかを活用することで実現できます。
たとえば、[Host Metrics Receiver](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/635d4254a3018eb3ca8f1736e71fcb54f8ed6e5a/receiver/hostmetricsreceiver?from_branch=main) や [HTTP Check Receiver](/blog/2023/synthetic-testing/) があります。

しかし、利用可能なレシーバーが特定のニーズを満たさない場合はどうすればよいでしょうか。
カスタムメトリクスを提供するシェルスクリプトのコレクションがあり、それらを OpenTelemetry Collector にエクスポートしたいとします。
独自のレシーバーを書くこともできますが、それには Go の知識が必要です。

その道を進む前に、利用可能なレシーバーをもう少し詳しく調べてみてください。
一部のレシーバーは、さまざまな形式のメトリクスを取り込むことができます。
たとえば、[Carbon](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/944d4a82c408d58f9d8ba1a1d4783094301af0de/receiver/carbonreceiver?from_branch=main)、[StatsD](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/635d4254a3018eb3ca8f1736e71fcb54f8ed6e5a/receiver/statsdreceiver?from_branch=main)、[InfluxDB](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/635d4254a3018eb3ca8f1736e71fcb54f8ed6e5a/receiver/influxdbreceiver?from_branch=main)、[Prometheus](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/dbdb56d285d860849323346d58c83b14c1ed6c62/receiver/prometheusreceiver?from_branch=main)、さらには [SNMP](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/635d4254a3018eb3ca8f1736e71fcb54f8ed6e5a/receiver/snmpreceiver?from_branch=main) などがあり、これらを OpenTelemetry エコシステムに統合できます。
シェルスクリプトに少し手を加えるだけで、これらのレシーバーのいずれかを使って目的を達成できます。
たとえば、Carbon Receiver は、シンプルな[プレーンテキストプロトコル](https://graphite.readthedocs.io/en/stable/feeding-carbon.html#the-plaintext-protocol)を持つため、シェルスクリプトとの組み合わせに最適です。
そのプロトコルは非常にわかりやすいものです。

> プレーンテキストプロトコルは、Carbon がサポートする最も単純なプロトコルです。
> 送信されるデータは次の形式でなければなりません。
> `<metric path> <metric value> <metric timestamp>`

## スクリプトの例: 証明書の有効期限の確認 {#example-script-check-certificate-expiration}

次のシェルスクリプトは、ホスト名を引数として受け取り、[`openssl s_client`](https://www.openssl.org/docs/manmaster/man1/openssl-s_client.html) を使用して証明書を取得し、証明書の有効期限までの残り時間を計算します。

```shell
#!/bin/bash
HOST=${1}
PORT=${2:-443}

now=$(date +%s)
notAfterString=$(echo q | openssl s_client -servername "${HOST}" "${HOST}:${PORT}" 2>/dev/null | openssl x509 -noout -enddate | awk -F"=" '{ print $2; }')
if [[ "$(uname)" == "Darwin" ]] ; then
  notAfter=$(date -j -f "%b %d %H:%M:%S %Y %Z" "${notAfterString}" +%s)
else
  notAfter=$(date -d "${notAfterString}" +%s)
fi

secondsLeft=$(($notAfter-$now))

echo ${secondsLeft}
```

このスクリプトは次のようにテストできます。

```shell
$ ./ssl_check.sh opentelemetry.io
4357523
```

## Carbon のプレーンテキストプロトコルを使う {#use-carbons-plaintext-protocol}

このスクリプトを Carbon のプレーンテキストプロトコルに対応させるには、スクリプトの最後の数行を変更して、Carbon 形式でメトリクスを出力する必要があります。

```shell {hl_lines=[12]}
#!/bin/bash
HOST=${1}
PORT=${2:-443}

now=$(date +%s)
str=$(echo q | openssl s_client -servername "${HOST}" "${HOST}:${PORT}" 2>/dev/null | openssl x509 -noout -enddate | awk -F"=" '{ print $2; }')
if [[ "$(uname)" == "Darwin" ]] ; then
  notAfter=$(date -j -f "%b %d %H:%M:%S %Y %Z" "${notAfterString}" +%s)
else
  notAfter=$(date -d "${notAfterString}" +%s)
fi

secondsLeft=$(($notAfter-$now))

metricPath="tls.server.not_after.time_left;unit=s"
echo "${metricPath} ${secondsLeft} ${now}"
```

これにより、スクリプトは `<metric path>` を `tls.server.not_after.time_left;unit=s`、`<metric value>` を `${secondsLeft}`、`<metric timestamp>` を `${now}` として出力します。

これで、Carbon Receiver を有効にした OpenTelemetry Collector にメトリクスを送信する準備が整いました。

## OTel Collector で任意のメトリクスを受信する {#receive-any-metric-with-the-otel-collector}

これをテストするには、次の設定で OpenTelemetry Collector を起動します。

```yaml
receivers:
  carbon:
    endpoint: localhost:8080
    transport: tcp
    parser:
      type: plaintext
      config:

exporters:
  debug:
    verbosity: detailed

service:
  pipelines:
    metrics:
      receivers: [carbon]
      exporters: [debug]
```

たとえば、このファイルを `collector-config.yml` として保存した場合、次のコマンドを実行します。

```console
$ ./otelcol --config collector-config.yml
2023-11-24T12:52:51.340+0100	info	service@v0.89.0/telemetry.go:85	Setting up own telemetry...
2023-11-24T12:52:51.341+0100	info	service@v0.89.0/telemetry.go:202	Serving Prometheus metrics	{"address": ":8888", "level": "Basic"}
2023-11-24T12:52:51.341+0100	info	exporter@v0.89.0/exporter.go:275	Development component. May change in the future.	{"kind": "exporter", "data_type": "metrics", "name": "debug"}
2023-11-24T12:52:51.341+0100	info	service@v0.89.0/service.go:143	Starting otelcol-any-metric...	{"Version": "1.0.0", "NumCPU": 10}
2023-11-24T12:52:51.341+0100	info	extensions/extensions.go:34	Starting extensions...
2023-11-24T12:52:51.342+0100	info	service@v0.89.0/service.go:169	Everything is ready. Begin running and processing data.
```

> [!NOTE]
>
> テストには、利用可能なすべてのレシーバーを含む [OpenTelemetry Collector Contrib](https://github.com/open-telemetry/opentelemetry-collector-releases/tree/b590e8bc74a5aacca1236f02b10bafeb4959dd96/distributions/otelcol-contrib?from_branch=main) ディストリビューションを使用できます。
> ただし、本番環境では、OpenTelemetry Collector Builder（[`ocb`](https://github.com/open-telemetry/opentelemetry-collector/tree/d25efc7e2f31a3ba5347d0725a22d7bed1b4015d/cmd/builder?from_branch=main)）を使用して[独自の Collector を構築](/docs/collector/extend/ocb/)できます。
> 推奨される設定は次のとおりです。
>
> ```yaml
> dist:
>   name: otelcol-any-metric
>   description: Custom OpenTelemetry Collector for receiving any kind of metric
>   output_path: ./
>
> exporters:
>   - gomod: go.opentelemetry.io/collector/exporter/debugexporter v0.89.0
>   - gomod: go.opentelemetry.io/collector/exporter/otlpexporter v0.89.0
>   - gomod: go.opentelemetry.io/collector/exporter/otlphttpexporter v0.89.0
>
> processors:
>   - gomod:
>       github.com/open-telemetry/opentelemetry-collector-contrib/processor/transformprocessor
>       v0.89.0
>
> receivers:
>   - gomod: go.opentelemetry.io/collector/receiver/otlpreceiver v0.89.0
>   - gomod:
>       github.com/open-telemetry/opentelemetry-collector-contrib/receiver/carbonreceiver
>       v0.89.0
> ```

OpenTelemetry Collector が動作したら、別のシェルを開いてメトリクスを送信します。

```shell
./ssl_check.sh opentelemetry.io | nc 127.0.0.1 8080
```

[Debug Exporter](https://github.com/open-telemetry/opentelemetry-collector/tree/d25efc7e2f31a3ba5347d0725a22d7bed1b4015d/exporter/debugexporter?from_branch=main) がコンソールにメトリクスを表示します。

```log
2023-11-24T12:54:51.369+0100	info	ResourceMetrics #0
Resource SchemaURL:
ScopeMetrics #0
ScopeMetrics SchemaURL:
InstrumentationScope
Metric #0
Descriptor:
     -> Name: tls.server.not_after.time_left
     -> Description:
     -> Unit:
     -> DataType: Gauge
NumberDataPoints #0
Data point attributes:
     -> unit: Str(s)
StartTimestamp: 1970-01-01 00:00:00 +0000 UTC
Timestamp: 2023-11-24 11:54:51 +0000 UTC
Value: 4356471
	{"kind": "exporter", "data_type": "metrics", "name": "debug"}
```

これで完了です！
同じ手法を、カスタムメトリクスを報告する他のシェルスクリプトにも適用できます。

## Transform Processor による微調整 {#fine-tuning-with-the-transform-processor}

Carbon Receiver は `<metric path>` を `;` をデリミタとして分割し、メトリクス名（最初の項目）とデータポイント属性（それ以外の項目）を抽出します。
この例では、メトリクス名は `tls.server.not_after.time_left` となり、データポイント属性 `unit: Str(s)` が設定されます。

この方法はわかりやすいですが、[リソース](/docs/concepts/resources/)、メトリクスの説明、特にメトリクスの単位など、その他の詳細を設定することはできません。

しかし、[Transform Processor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/635d4254a3018eb3ca8f1736e71fcb54f8ed6e5a/processor/transformprocessor?from_branch=main) がこれを解決してくれます。
OpenTelemetry Transformation Language（OTTL）ステートメントを `collector-config.yml` に組み込むことで、データポイント属性 `unit` をメトリクスの単位に変換できます。

```yaml {hl_lines=["13-19",24]}
receivers:
  carbon:
    endpoint: localhost:8080
    transport: tcp
    parser:
      type: plaintext
      config:

exporters:
  debug:
    verbosity: detailed

processors:
  transform:
    metric_statements:
      - context: datapoint
        statements:
          - set(metric.unit, attributes["unit"])
          - delete_key(attributes, "unit")
service:
  pipelines:
    metrics:
      receivers: [carbon]
      processors: [transform]
      exporters: [debug]
```

`ssl_check.sh` をもう一度実行します。

```shell
./ssl_check.sh opentelemetry.io | nc 127.0.0.1 8080
```

これで、Debug Exporter がメトリクスの記述子に単位も含めて表示します。

```text {hl_lines=[10]}
2023-11-24T12:54:51.369+0100	info	ResourceMetrics #0
Resource SchemaURL:
ScopeMetrics #0
ScopeMetrics SchemaURL:
InstrumentationScope
Metric #0
Descriptor:
     -> Name: tls.server.not_after.time_left
     -> Description:
     -> Unit: s
     -> DataType: Gauge
NumberDataPoints #0
Data point attributes:
     -> unit: Str(s)
StartTimestamp: 1970-01-01 00:00:00 +0000 UTC
Timestamp: 2023-11-24 11:54:51 +0000 UTC
Value: 4356471
	{"kind": "exporter", "data_type": "metrics", "name": "debug"}
```

メトリクスを OpenTelemetry で計装した[サービス](/docs/specs/semconv/resource/#service)に関連付けたい場合は、まずシェルスクリプトにデータポイント属性として `service.name` と `service.namespace` を追加します。

```shell
metricName="tls.server.not_after.time_left;unit=s;service.name=otel-webserver;service.namespace=opentelemetry.io"
echo "${metricName} ${secondsLeft} ${now}"
```

次に、別の OTTL ステートメントを追加して、これらのデータポイント属性からリソースを作成します。

```yaml
processors:
  transform:
    metric_statements:
      - context: datapoint
        statements:
          - set(metric.unit, attributes["unit"])
          - set(resource.attributes["service.name"], attributes["service.name"])
          - set(resource.attributes["service.namespace"],
            attributes["service.namespace"])
          - delete_key(attributes, "unit")
          - delete_key(attributes, "service.name")
          - delete_key(attributes, "service.namespace")
```

`ssl_check.sh` を再度実行します。

```shell
./ssl_check.sh opentelemetry.io | nc 127.0.0.1 8080
```

これで、Debug Exporter がリソースと属性 `service.name` および `service.namespace` も含めて表示します。

```text
2023-11-24T14:49:03.806+0100	info	ResourceMetrics #0
Resource SchemaURL:
Resource attributes:
     -> service.name: Str(otel-webserver)
     -> service.namespace: Str(opentelemetry.io)
ScopeMetrics #0
ScopeMetrics SchemaURL:
InstrumentationScope
Metric #0
Descriptor:
     -> Name: tls.server.not_after.time_left
     -> Description:
     -> Unit: s
     -> DataType: Gauge
NumberDataPoints #0
StartTimestamp: 1970-01-01 00:00:00 +0000 UTC
Timestamp: 2023-11-24 13:49:03 +0000 UTC
Value: 4349619
	{"kind": "exporter", "data_type": "metrics", "name": "debug"}
```

Transform Processor と OTTL は幅広い機能を提供します。
詳しくは以下を参照してください。

- [OTTL README.md](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/28f41fd7d231bc25c69cffc73fd7dee697793f9a/pkg/ottl/README.md?from_branch=main)
- [OTTL Me Why Transforming Telemetry in the OpenTelemetry Collector Just Got Better](https://www.youtube.com/watch?v=uVs0oUV72CE)、[Tyler Helmuth](https://github.com/TylerHelmuth) と [Evan Bradley](https://github.com/evan-bradley) による講演

これで、OpenTelemetry Collector で任意のカスタムメトリクスを受信する準備が整いました！

## ボーナス: OTLP の使用 {#bonus-use-otlp}

Carbon Receiver と Transform Processor の使用はカスタムメトリクスを収集するための確実な方法ですが、[OpenTelemetry Protocol](/docs/specs/otlp/)（OTLP）が必要なものをすべて提供しているのに、外部形式を使ってメトリクスを OpenTelemetry にインポートするのは少し変に思えるかもしれません。

Carbon Receiver を使うかわりに、[OTLP JSON](https://github.com/open-telemetry/opentelemetry-proto/tree/b5947908941290bfa11cec2abf714e700412b5d7/examples?from_branch=main) を使ってカスタムメトリクスを送信することもできます。

```shell
#!/bin/bash
URL=${1}
PORT=${2:-443}

now=$(date +%s)
notAfterString=$(echo q | openssl s_client -servername "${URL}" "${URL}:${PORT}" 2>/dev/null | openssl x509 -noout -enddate | awk -F"=" '{ print $2; }')
if [[ "$(uname)" == "Darwin" ]] ; then
  notAfter=$(date -j -f "%b %d %H:%M:%S %Y %Z" "${notAfterString}" +%s)
else
  notAfter=$(date -d "${notAfterString}" +%s)
fi

secondsLeft=$(($notAfter-$now))

data="
{
    \"resourceMetrics\": [
      {
        \"resource\": {
          \"attributes\": [
            {
              \"key\": \"service.name\",
              \"value\": {
                \"stringValue\": \"${URL}\"
              }
            }
          ]
        },
        \"scopeMetrics\": [
          {
            \"metrics\": [
              {
                \"name\": \"tls.server.not_after.time_left\",
                \"unit\": \"s\",
                \"description\": \"\",
                \"gauge\": {
                  \"dataPoints\": [
                    {
                      \"asInt\": ${secondsLeft},
                      \"timeUnixNano\": ${now}000000000
                    }
                  ]
                }
              }
            ]
          }
        ]
      }
    ]
  }
"
curl -X POST -H "Content-Type: application/json" -d "${data}" -i localhost:4318/v1/metrics
```

`collectors-config` で OTLP Receiver を有効にします。

```yaml
receivers:
  otlp:
    protocols:
      http:
      grpc:
exporters:
  debug:
    verbosity: detailed
service:
  pipelines:
    metrics:
      receivers: [otlp]
      exporters: [debug]
```

更新した `ssl_check.sh` を実行します。

```shell
./ssl_check.sh opentelemetry.io
```

今回は、正しい単位が設定され、JSON で定義したとおりのリソースが含まれたメトリクスが表示されます。

```text
2023-11-24T15:28:51.212+0100	info	ResourceMetrics #0
Resource SchemaURL:
Resource attributes:
     -> service.name: Str(opentelemetry.io)
ScopeMetrics #0
ScopeMetrics SchemaURL:
InstrumentationScope
Metric #0
Descriptor:
     -> Name: tls.server.not_after.time_left
     -> Description:
     -> Unit: s
     -> DataType: Gauge
NumberDataPoints #0
StartTimestamp: 1970-01-01 00:00:00 +0000 UTC
Timestamp: 2023-11-24 14:28:51 +0000 UTC
Value: 4347231
	{"kind": "exporter", "data_type": "metrics", "name": "debug"}
```

シェルスクリプトで JSON を扱うのは、この例が明確に示しているように、あまり望ましくありません！
改善する方法はありますが、最終的には Python や Node.js のような言語を使うか、お気に入りの OTel CLI ツールにメトリクス（ゲージサポート付き）を組み込む方が効率的だと感じるかもしれません！

## まとめ {#summary}

この記事では、Carbon Receiver のような _汎用_ レシーバーを使って任意のメトリクスを OpenTelemetry Collector に取り込む方法を学びました。
利用可能なレシーバーがニーズを満たさず、Go で独自のレシーバーを書きたくない場合にこのアプローチを使ってください。

OTLP と `curl` を使って直接 OpenTelemetry Collector にメトリクスを送信する方法も学びました。
OpenTelemetry Collector のパイプラインを変更できない場合にこのアプローチを使ってください。
OTLP 経由でメトリクスをエクスポートするコマンドラインツールが利用可能になれば、_汎用_ レシーバーに代わる有効な選択肢にもなるでしょう。
