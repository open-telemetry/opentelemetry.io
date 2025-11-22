---
title: トラブルシューティング
description: コレクターのトラブルシューティングに関する推奨事項
weight: 25
default_lang_commit: 974cdea55c03089f4e86d6068ec133b04e2653da
drifted_from_default: true
cSpell:ignore: confmap pprof tracez zpages
---

このページでは、OpenTelemetryコレクターの健全性とパフォーマンスに関するトラブルシューティングの方法を学ぶことができます。

## トラブルシューティングツール {#troubleshooting-tools}

コレクターは、問題のデバッグのために様々なメトリクス、ログ、拡張機能を提供します。

### 内部テレメトリー {#internal-telemetry}

コレクター自身の[内部テレメトリー](/docs/collector/internal-telemetry/)を設定して使用することで、そのパフォーマンスを監視できます。

### ローカルエクスポーター {#local-exporters}

設定の検証やネットワークのデバッグなど、特定の問題については、ローカルログに出力するように設定されたコレクターに少量のテストデータを送信できます。
[ローカルエクスポーター](https://github.com/open-telemetry/opentelemetry-collector/tree/main/exporter#general-information)を使用することで、コレクターによって処理されているデータを検査できます。

ライブトラブルシューティングには、コレクターがデータを受信、処理、エクスポートしていることを確認できる[`デバッグ` エクスポーター](https://github.com/open-telemetry/opentelemetry-collector/blob/main/exporter/debugexporter/README.md)の使用を検討してください。
例を挙げましょう。

```yaml
receivers:
  zipkin:
exporters:
  debug:
service:
  pipelines:
    traces:
      receivers: [zipkin]
      processors: []
      exporters: [debug]
```

テストを開始するには、Zipkinペイロードを生成します。
たとえば、 `trace.json` という名前のファイルを以下の内容で作成できます。

```json
[
  {
    "traceId": "5982fe77008310cc80f1da5e10147519",
    "parentId": "90394f6bcffb5d13",
    "id": "67fae42571535f60",
    "kind": "SERVER",
    "name": "/m/n/2.6.1",
    "timestamp": 1516781775726000,
    "duration": 26000,
    "localEndpoint": {
      "serviceName": "api"
    },
    "remoteEndpoint": {
      "serviceName": "apip"
    },
    "tags": {
      "data.http_response_code": "201"
    }
  }
]
```

コレクターが実行している状態で、このペイロードをコレクターに送信します。

```shell
curl -X POST localhost:9411/api/v2/spans -H'Content-Type: application/json' -d @trace.json
```

以下のようなログエントリが表示されるはずです。

```shell
2023-09-07T09:57:43.468-0700    info    TracesExporter  {"kind": "exporter", "data_type": "traces", "name": "debug", "resource spans": 1, "spans": 2}
```

ペイロード全体が出力されるように `デバッグ` エクスポーターを設定することもできます。

```yaml
exporters:
  debug:
    verbosity: detailed
```

設定を変更して前回のテストを再実行すると、ログ出力は次のようになります。

```shell
2023-09-07T09:57:12.820-0700    info    TracesExporter  {"kind": "exporter", "data_type": "traces", "name": "debug", "resource spans": 1, "spans": 2}
2023-09-07T09:57:12.821-0700    info    ResourceSpans #0
Resource SchemaURL: https://opentelemetry.io/schemas/1.4.0
Resource attributes:
     -> service.name: Str(telemetrygen)
ScopeSpans #0
ScopeSpans SchemaURL:
InstrumentationScope telemetrygen
Span #0
    Trace ID       : 0c636f29e29816ea76e6a5b8cd6601cf
    Parent ID      : 1a08eba9395c5243
    ID             : 10cebe4b63d47cae
    Name           : okey-dokey
    Kind           : Internal
    Start time     : 2023-09-07 16:57:12.045933 +0000 UTC
    End time       : 2023-09-07 16:57:12.046058 +0000 UTC
    Status code    : Unset
    Status message :
Attributes:
     -> span.kind: Str(server)
     -> net.peer.ip: Str(1.2.3.4)
     -> peer.service: Str(telemetrygen)
```

### コレクターコンポーネントの確認 {#check-collector-components}

以下のサブコマンドを使用して、Collectorディストリビューションで利用可能なコンポーネントとその安定性のレベルを一覧表示します。
出力形式はバージョンによって変更される可能性があることに注意してください。

```shell
otelcol components
```

以下は出力例です。

```yaml
buildinfo:
  command: otelcol
  description: OpenTelemetry Collector
  version: 0.96.0
receivers:
  - name: opencensus
    stability:
      logs: Undefined
      metrics: Beta
      traces: Beta
  - name: prometheus
    stability:
      logs: Undefined
      metrics: Beta
      traces: Undefined
  - name: zipkin
    stability:
      logs: Undefined
      metrics: Undefined
      traces: Beta
  - name: otlp
    stability:
      logs: Beta
      metrics: Stable
      traces: Stable
processors:
  - name: resource
    stability:
      logs: Beta
      metrics: Beta
      traces: Beta
  - name: span
    stability:
      logs: Undefined
      metrics: Undefined
      traces: Alpha
  - name: probabilistic_sampler
    stability:
      logs: Alpha
      metrics: Undefined
      traces: Beta
exporters:
  - name: otlp
    stability:
      logs: Beta
      metrics: Stable
      traces: Stable
  - name: otlphttp
    stability:
      logs: Beta
      metrics: Stable
      traces: Stable
  - name: debug
    stability:
      logs: Development
      metrics: Development
      traces: Development
  - name: prometheus
    stability:
      logs: Undefined
      metrics: Beta
      traces: Undefined
connectors:
  - name: forward
    stability:
      logs-to-logs: Beta
      logs-to-metrics: Undefined
      logs-to-traces: Undefined
      metrics-to-logs: Undefined
      metrics-to-metrics: Beta
      traces-to-traces: Beta
extensions:
  - name: zpages
    stability:
      extension: Beta
  - name: health_check
    stability:
      extension: Beta
  - name: pprof
    stability:
      extension: Beta
```

### 拡張機能 {#extensions}

以下は、コレクターのデバッグのために有効にできる拡張機能のリストです。

#### パフォーマンスプロファイラ (pprof) {#performance-profiler}

ローカルのポート `1777` で利用可能な[pprof 拡張機能](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/extension/pprofextension/README.md)を使用すると、実行中のコレクターをプロファイリングできます。
これは高度なユースケースであり、ほとんどの状況では必要ないはずです。

#### zPages {#zpages}

[zPages 拡張機能](https://github.com/open-telemetry/opentelemetry-collector/tree/main/extension/zpagesextension/README.md)は、コレクターのレシーバーとエクスポーターからのライブデータを検査するために使用できます。

`/debug/tracez` で公開されるTraceZページは、次のようなトレース操作のデバッグに役立ちます。

- レイテンシーの問題。アプリケーションの遅い部分を特定します。
- デッドロックと計装の問題。終了しない実行中のスパンを特定します。
- エラー。発生しているエラーの種類と発生場所を特定します。

`zpages` には、コレクター自体が出力しないエラーログが含まれている場合があることに注意してください。

コンテナ環境では、このポートをローカルだけでなくパブリックインターフェースで公開したい場合があります。
`endpoint` は `extensions` 設定セクションを使用して構成できます。

```yaml
extensions:
  zpages:
    endpoint: 0.0.0.0:55679
```

## 複雑なパイプラインをデバッグするためのチェックリスト {#checklist-for-debugging-complex-pipelines}

テレメトリーが複数のコレクターやネットワークを経由して流れる場合、問題を特定するのは困難な場合があります。
テレメトリーがコレクターやパイプライン内の他のコンポーネントを通過する各"ホップ"で、以下を確認することが重要です。

- コレクターのログにエラーメッセージはありますか？
- テレメトリーはこのコンポーネントにどのように取り込まれていますか？
- テレメトリーはこのコンポーネントによってどのように変更（たとえば、サンプリングやリダクション）されていますか？
- テレメトリーはこのコンポーネントからどのようにエクスポートされていますか？
- テレメトリーはどの形式ですか？
- 次のホップはどのように設定されていますか？
- データの出入りを妨げるネットワークポリシーはありますか？

## 一般的なコレクターの問題 {#common-collector-issues}

このセクションでは、一般的なコレクターの問題を解決する方法について説明します。

### コレクターでデータに関する問題が発生している {#collector-is-experiencing-data-issues}

コレクターとそのコンポーネントでデータの問題が発生することがあります。

#### コレクターがデータをドロップしている {#collector-is-dropping-data}

コレクターがデータをドロップする理由は様々ですが、最も一般的なものは次のとおりです。

- コレクターのサイジングが不適切で、受信したデータを処理してエクスポートする速度が追いつかない。
- エクスポーターの宛先が利用できないか、データの受け入れが遅すぎる。

ドロップを軽減するには、[`batch` プロセッサー](https://github.com/open-telemetry/opentelemetry-collector/blob/main/processor/batchprocessor/README.md)を設定します。
さらに、有効化されているエクスポーターで[キューリトライオプション](https://github.com/open-telemetry/opentelemetry-collector/tree/main/exporter/exporterhelper#configuration)を設定する必要があるかもしれません。

#### コレクターがデータを受信していない {#collector-is-not-receiving-data}

コレクターがデータを受信しない理由は次のとおりです。

- ネットワーク設定の問題。
- レシーバー設定の誤り。
- クライアント設定の誤り。
- レシーバーが `レシーバーズ` セクションで定義されているが、どの `パイプライン` でも有効になっていない。

潜在的な問題については、コレクターの[logs](/docs/collector/internal-telemetry/#configure-internal-logs) と[zPages](https://github.com/open-telemetry/opentelemetry-collector/blob/main/extension/zpagesextension/README.md)を確認してください。

#### コレクターがデータを処理していない {#collector-is-not-processing-data}

ほとんどの処理の問題は、プロセッサーの動作に関する誤解やプロセッサーの誤った設定が原因です。
例を挙げましょう。

- アトリビュートプロセッサーはスパンの"タグ"にのみ機能します。スパン名はスパンプロセッサーによって処理されます。
- トレースデータのプロセッサー（テールサンプリングを除く）は、個々のスパンに対してのみ機能します。

#### コレクターがデータをエクスポートしていない {#collector-is-not-exporting-data}

コレクターがデータをエクスポートしない理由は次のとおりです。

- ネットワーク設定の問題。
- エクスポーター設定の誤り。
- 宛先が利用できない。

潜在的な問題については、コレクターの[logs](/docs/collector/internal-telemetry/#configure-internal-logs) と[zPages](https://github.com/open-telemetry/opentelemetry-collector/blob/main/extension/zpagesextension/README.md)を確認してください。

データのエクスポートが機能しないのは、ファイアウォール、DNS、プロキシの問題など、ネットワーク設定の問題が原因であることがよくあります。
コレクターには[プロキシのサポート](https://github.com/open-telemetry/opentelemetry-collector/tree/main/exporter#proxy-support)があることに注意してください。

### コレクターで制御に関する問題が発生している {#collector-is-experiencing-control-issues}

コレクターで起動の失敗や予期せぬ終了、再起動が発生することがあります。

#### コレクターが終了または再起動する {#collector-exits-or-restarts}

コレクターが終了または再起動する原因は次のとおりです。

- [`memory_limiter` プロセッサー](https://github.com/open-telemetry/opentelemetry-collector/blob/main/processor/memorylimiterprocessor/README.md)がないこと、もしくは設定ミスによるメモリ逼迫。
- 負荷に対する不適切なサイジング。
- 不適切な設定。たとえば、利用可能なメモリよりも大きいサイズのキュー。
- インフラストラクチャのリソース制限。たとえば、Kubernetesなど。

#### Windows Dockerコンテナでコレクターの起動に失敗する {#collector-fails-to-start-in-windows-docker-containers}

v0.90.1以前では、Windows DockerコンテナでCollectorの起動に失敗し `The service process could not connect to the service controller` というエラーメッセージが表示されることがあります。
この場合、`NO_WINDOWS_SERVICE=1` 環境変数を設定して、コレクターがWindowsサービスとして実行しようとせずに、インタラクティブなターミナルで実行されているかのように強制的に起動させる必要があります。

### コレクターで設定に関する問題が発生している {#collector-is-experiencing-configuration-issues}

設定の問題により、コレクターで問題が発生することがあります。

#### Nullマップ {#null-maps}

複数の設定ファイルを解決する際、後の設定値がnullであっても、前の設定ファイルの値は後の設定ファイルの値に置き換えられて削除されます。
この問題は、以下の方法で修正できます。

- `processors:` のかわりに `processors: {}` のように、空のマップを表すために `{}` を使用する。
- `processors:` のような空の設定を構成から省略する。

詳細については、[confmapのトラブルシューティング](https://github.com/open-telemetry/opentelemetry-collector/blob/main/confmap/README.md#null-maps)を参照してください。
