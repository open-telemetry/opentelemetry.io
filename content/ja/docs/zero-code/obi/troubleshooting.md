---
title: トラブルシューティング
description: OBI の一般的な問題やエラーのトラブルシューティング
weight: 22
default_lang_commit: 94498a7529f6d456201faebba59716baccf79bf8
drifted_from_default: true
cSpell:ignore: Clickhouse uprobe userland
---

このページでは、OBI で発生する一般的なエラーや問題を診断し、解決する方法を学びます。

## トラブルシューティングツール {#troubleshooting-tools}

OBI には、問題の診断やトラブルシューティングを支援するためのさまざまなツールや設定オプションがあります。

### 詳細なロギング {#detailed-logging}

`log_level` 設定または `OTEL_EBPF_LOG_LEVEL` 環境変数を `debug` に設定すると、OBI のログの詳細度を上げることができます。
これにより、問題の診断に役立つ、より詳細なログが得られます。

BPF プログラムからのログ出力を有効にするには、`ebpf.bpf_debug` 設定または `OTEL_EBPF_BPF_DEBUG` 環境変数を `true` に設定します。
ログが大量に生成されるため、**デバッグ目的でのみ使用してください**。

### 設定のロギング {#configuration-logging}

デフォルトでは、OBI は次の 3 つのソースから設定をマージします（優先度の低い順）。

- ビルトインのデフォルト設定
- `--config` フラグまたは `OTEL_EBPF_CONFIG_PATH` で指定する設定ファイル
- 通常 `OTEL_EBPF_` で始まる環境変数

最終的にマージされた設定を確認したいことがしばしばあります。
`log_config` 設定値（または `OTEL_EBPF_LOG_CONFIG` 環境変数）を使うと、OBI に対して起動時に最終的な設定をログ出力するよう指示できます。

`log_config` では次の値をサポートします。

- `yaml` — 最終的な設定を YAML 形式でログ出力します。設定ファイルの構造と一致するため、人間が読むのに最も適しています
- `json` — 最終的な設定を JSON 形式でログ出力します。構造化された 1 行になるため、ログシッパーに最も適しています

### 内部メトリクス {#internal-metrics}

[OBI の内部メトリクス](../metrics/#internal-metrics)を設定して使用することで、パフォーマンスや内部状態を監視できます。

内部メトリクスを有効にするには、`internal_metrics.exporter` に次のいずれかの値を設定します。

- `none`（デフォルト）: 内部メトリクスを無効化します
- `prometheus`: HTTP サーバー経由で Prometheus 形式で内部メトリクスをエクスポートします
- `otlp`: OTLP エクスポーター経由で内部メトリクスをエクスポートします

### デバッグ用トレースエクスポーター {#debug-traces-exporter}

OBI が生成する生のトレーススパンをデバッグするには、`otel_traces_exporter.protocol` 設定値または `OTEL_EXPORTER_OTLP_TRACES_PROTOCOL` 環境変数を `debug` に設定します。
これにより、生のトレーススパンが人間が読みやすい形式でコンソールにログ出力されます。形式は `verbosity: detailed` を指定した OTel Collector の debug エクスポーターと同じです。
コンソールに出力されるスパンの例は次のとおりです。

```text
Traces	{"resource spans": 1, "spans": 1}
ResourceSpans #0
Resource SchemaURL:
Resource attributes:
     -> service.name: Str(flagd)
     -> telemetry.sdk.language: Str(go)
     -> telemetry.sdk.name: Str(opentelemetry)
     -> telemetry.distro.name: Str(opentelemetry-ebpf-instrumentation)
     -> telemetry.sdk.version: Str(main)
     -> host.name: Str(flagd-5cccb4c4f5-sfkcm)
     -> os.type: Str(linux)
     -> service.namespace: Str(opentelemetry-demo)
     -> k8s.owner.name: Str(flagd)
     -> k8s.kind: Str(Deployment)
     -> k8s.replicaset.name: Str(flagd-5cccb4c4f5)
     -> k8s.pod.name: Str(flagd-5cccb4c4f5-sfkcm)
     -> k8s.container.name: Str(flagd)
     -> k8s.deployment.name: Str(flagd)
     -> service.version: Str(2.0.2)
     -> k8s.namespace.name: Str(default)
     -> otel.library.name: Str(go.opentelemetry.io/obi)
ScopeSpans #0
ScopeSpans SchemaURL:
InstrumentationScope
Span #0
    Trace ID       : 63a2723a58e0033170e58b1ff27ef03d
    Parent ID      :
    ID             : fab47609b60cc4e0
    Name           : /opentelemetry.proto.collector.metrics.v1.MetricsService/Export
    Kind           : Client
    Start time     : 2025-11-28 16:10:35.4241749 +0000 UTC
    End time       : 2025-11-28 16:10:35.42555658 +0000 UTC
    Status code    : Unset
    Status message :
Attributes:
     -> rpc.method: Str(/opentelemetry.proto.collector.metrics.v1.MetricsService/Export)
     -> rpc.system: Str(grpc)
     -> rpc.grpc.status_code: Int(0)
     -> server.address: Str(otel-collector.default)
     -> peer.service: Str(otel-collector.default)
     -> server.port: Int(4317)
```

OBI v0.6.0 以降では、`telemetry.sdk.name` は利用可能な場合に基盤となる SDK を反映し、OBI 自身は `telemetry.distro.name` で識別されます。

### パフォーマンスプロファイラー（pprof） {#performance-profiler-pprof}

OBI は、パフォーマンスプロファイリング用に `pprof` ポートを公開できます。
有効化するには、`profile_port` 設定値または `OTEL_EBPF_PROFILE_PORT` 環境変数を任意のポートに設定します。

これは高度なユースケースであり、通常は不要です。

## OBI の一般的な問題 {#common-obi-issues}

このセクションでは、OBI でよくある問題を解決する方法を説明します。

### OBI 実行中に ClickHouse インスタンスがクラッシュする {#clickhouse-instances-crash-when-obi-is-running}

OBI と同じノードで [Clickhouse](https://github.com/ClickHouse/ClickHouse) を実行している場合、次のようなログとともに ClickHouse がクラッシュすることがあります。

```text
Application: Code: 246. DB::Exception: Calculated checksum of the executable (...) does not correspond to the reference checksum ...
```

この問題は、OBI が ClickHouse バイナリに eBPF uprobe をアタッチすることが原因と考えられます。
関連する [GitHub Issue](https://github.com/ClickHouse/ClickHouse/issues/83637) では、この挙動について次のように説明されています。

> uprobe をアタッチする際、カーネルはアタッチアドレスにトラップ命令を挿入するために対象プロセスのメモリを変更します。
> これにより、起動時の ClickHouse バイナリのチェックサム検証が失敗します。

**解決策:**

ClickHouse を [skip_binary_checksum_checks](https://clickhouse.com/docs/operations/server-configuration-parameters/settings#skip_binary_checksum_checks) フラグ付きで起動してください。

### Go アプリケーションや TLS リクエストのテレメトリーデータが欠落する {#missing-telemetry-data-for-go-applications-or-tls-requests}

Go アプリケーションや TLS リクエスト（HTTPS 通信など）からのテレメトリーが欠落している場合、uprobe をアタッチするための権限が不足している可能性があります。
最近のカーネルのセキュリティ変更が多くの古いカーネルバージョンにもバックポートされたため、uprobe には `CAP_SYS_ADMIN` ケーパビリティが必要になりました。
OBI は Golang アプリケーションや TLS リクエストの計装、その他のランタイム / 言語固有の計装に uprobe を使用しています。
OBI のデプロイ時のセキュリティ設定で特権操作（たとえば Docker や Kubernetes における `privileged:true`）が使われていない、または `CAP_SYS_ADMIN` がセキュリティケーパビリティとして付与されていない場合、テレメトリーの一部または全部が欠落することがあります。

この問題をトラブルシューティングするには、`OTEL_EBPF_LOG_LEVEL=debug` で OBI の詳細ロギングを有効にしてください。
すべての uprobe 挿入が "setting uprobe (offset)..." エラーで失敗している場合は、この問題に該当している可能性が高いです。

**解決策:**

次のいずれかを行います。

- OBI を特権モードで実行する。
- デプロイ時のセキュリティ設定のケーパビリティリストに `CAP_SYS_ADMIN` を追加する。

### クライアントメトリクスやスパンが誤ったサービスに帰属する {#client-metrics-or-spans-attributed-to-the-wrong-service}

OBI がホスト PID 名前空間にアクセスできる状態で実行されており（たとえば Docker Compose の `pid: host` や Kubernetes の `hostPID: true`）、[オープンポート](../configure/service-discovery/#open-ports)でサービスを選択している場合、予期しない送信（クライアント）メトリクスやスパンが自分のサービスに帰属されることがあります。
よくある症状は、`GET /v1.43/containers/json` のような Docker Engine API 呼び出しが、意味のない `server.port` と `telemetry.sdk.language=go` を持つクライアントリクエストとして報告されることです。
対象のサービスが Go で書かれていない場合でもこの現象が発生します。

```text
http_client_request_body_size_bytes_sum{
  http_request_method="GET",
  http_route="/v1.43/containers/json",
  server_address="docker", server_port="4",
  service_name="python-service", telemetry_sdk_language="go", ...
}
```

**原因:**

コンテナポートを公開すると（たとえば Docker の `-p 7773:7773` や Compose の `ports:` エントリ）、ホスト側のフォワーダープロセスがホストネットワーク名前空間でそのポートをリッスンします。
コンテナランタイムに応じて、これは `docker-proxy`（userland プロキシが有効な Docker の場合）または同等のエージェントです。

OBI はホストプロセスを参照できるため、フォワーダーが選択したポートと同じポートをリッスンしている場合、OBI はフォワーダーを `open_ports` 条件に一致させ、自分のサービスの ID で計装します。
フォワーダー（ホストネットワーク名前空間内）と実際のサービス（コンテナネットワーク名前空間内）はどちらも同じポートをリッスンしているため、ポートだけでは区別できません。
フォワーダーは通常 Go バイナリであり、スパンに `telemetry.sdk.language=go` が付与される理由はこれです。
フォワーダー自体が生成するトラフィック（Docker ソケット経由の Docker Engine API 呼び出しなど）は、自分のサービスに帰属されます。

**解決策:**

実行ファイルパスを指定してフォワーダーを計装対象から除外します。

```yaml
discovery:
  exclude_instrument:
    - exe_path: '{*/docker-proxy,*/scon-agent}'
```

あるいは、オープンポートよりも具体的な条件でサービスを選択すると、同じポートを共有するホスト側フォワーダーが一致しなくなります。
たとえば、[実行ファイルパス](../configure/service-discovery/#executable-path)、[Kubernetes メタデータ](../configure/service-discovery/#k8s-namespace)、または[コンテナ名](../configure/service-discovery/#container-name)セレクターを使用します。

## v0.7.0 への移行: ネットワークポート推測の変更 {#migration-to-v070-network-port-guessing-changes}

OBI v0.7.0 では破壊的変更が導入されます。**ネットワークポート推測がデフォルトで無効になりました**。
この変更は、ネットワークフローにおいて発信元が不明な場合に推測を行わないことで、ネットワークメトリクスの精度を向上させます。

### 変更点 {#what-changed}

v0.6.0 以前では、ネットワークフローにおいて発信元を特定できない場合に、OBI はどちらのエンドポイントがクライアントでどちらがサーバーかを推測しようとしていました。
この推測は順序ヒューリスティック（通常、ポート番号が小さい方をサーバー、大きい方をクライアントと仮定）に基づいていました。

v0.7.0 ではこの推測がデフォルトで無効になり、次のような挙動になります。

- OBI が発信元を特定できないフローでは、`client.port` と `server.port` 属性が空になることがあります
- ネットワークメトリクスはより正確になりますが、不明なフローについては情報が失われることがあります

### 移行方法 {#how-to-migrate}

以前の挙動に依存しており、発信元が不明な場合でも `client.port` と `server.port` を推測したい場合は、順序ヒューリスティックによるポート推測を再度有効にします。

**YAML 設定:**

```yaml
network:
  guess_ports: ordinal
```

**環境変数:**

```sh
OTEL_EBPF_NETWORK_GUESS_PORTS=ordinal
```

詳細については、[ネットワーク設定のドキュメント](../network/config/)を参照してください。

### 推奨事項 {#recommendation}

特定のユースケースで必要でない限り、ポート推測は無効のままにすることを推奨します。
デフォルトの挙動の方が、誤分類が起きにくく、よりクリーンで正確なネットワークメトリクスを提供します。
