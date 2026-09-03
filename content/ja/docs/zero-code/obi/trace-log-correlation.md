---
title: トレースとログの相関
linkTitle: トレースとログの相関
weight: 35
description: より迅速なデバッグとトラブルシューティングのために、OBI がアプリケーションログを分散トレースとどのように相関付けるかを学びます。
default_lang_commit: 552bd64ff45ca252d1da0ca875abd1584a619d7f
cSpell:ignore: BPFFS NUL PYTHONUNBUFFERED
---

OpenTelemetry eBPF 計装 (OBI) は、JSON およびプレーンテキストログをトレースコンテキストで補強することで、アプリケーションログを分散トレースと相関付けます。
OBI はログをエクスポートしません。
補強されたログを同じストリームに書き戻し、一方トレースは OTLP 経由でエクスポートされます。

## 概要 {#overview}

トレースとログの相関は、2 つの相補的なオブザーバビリティシグナルを結びつけます。

- **トレース**: タイミングと構造を伴って、サービスをまたぐリクエストの流れを示します
- **ログ**: 詳細なイベント情報とアプリケーションの状態を提供します

OBI のトレースとログの相関を使用すると、計装されたプロセスからのログにトレースコンテキストが自動的に補強されます。

- **トレース ID**: ログエントリを分散トレースに紐づけます
- **スパン ID**: ログエントリを特定のトレーススパンに紐づけます

これにより、アプリケーションへのコード変更なしに、オブザーバビリティバックエンドはログをその発信元のトレースと相関付けることができます。

## 動作の仕組み {#how-it-works}

OBI は eBPF を使用して、カーネルレベルでアプリケーションログにトレースコンテキストを注入します。

1. **トレースキャプチャ**: OBI はトレースされるすべての操作についてトレースコンテキスト（トレース ID およびスパン ID）をキャプチャします
2. **ログのインターセプト**: OBI はアプリケーションログをキャプチャするために write システムコールをインターセプトします
3. **コンテキストの注入**: OBI は JSON オブジェクトに `trace_id` および `span_id` フィールドを注入するか、選択されたプレーンテキスト行に設定可能な `key=value` フィールドを追加します
4. **トレースのエクスポート**: ログは既存のロギングパイプラインを通じて流れ続けます
5. **バックエンドでの紐付け**: オブザーバビリティバックエンドは、これらの ID を使用してログをトレースに紐づけます

### 技術的なアプローチ {#technical-approach}

OBI はアプリケーションバイナリを変更することなく、カーネルレベルで相関付けを行います。

- カーネルの eBPF プローブを使用して write 操作をインターセプトします
- パフォーマンスのためにファイルディスクリプタのキャッシュを維持します
- JSON またはプレーンテキストを出力するロギングフレームワークと連携します

OBI は、すでに存在する設定済みのトレースおよびスパンフィールドを保持します。
JSON キーはリテラルでマッチされ、プレーンテキストでは、OBI は行頭または空白の後にある `name=value` トークンを認識します。
OpenTelemetry トレースを直接エクスポートしていると検出されたサービスに対して、OBI は `trace_id` のみを注入します。
OBI が生成する eBPF ベースのスパン ID では SDK のスパンを特定できないためです。

## 設定 {#configuration}

ログをトレースと相関付けるには、トレースをエクスポートし、選択されたワークロードのログにトレースコンテキストを追加するよう OBI を設定します。
設定フィールドは Config v1 と Config v2 で異なります。
Config v2 を使用する場合は、[Config v2 リファレンス](/docs/zero-code/obi/configure/config-v2/)を参照してください。
既存の Config v1 ファイルを変換するには、[移行ガイド](/docs/zero-code/obi/configure/migrate-to-config-v2/)に従ってください。

### Config v1 {#config-v1}

```yaml
# Enable trace export
otel_traces_export:
  endpoint: http://otel-collector:4318/v1/traces

# Select services to instrument
discovery:
  instrument:
    - open_ports: '8380'

# Enable log enrichment for the same services
ebpf:
  log_enricher:
    services:
      - service:
          - open_ports: '8380'
```

ログ補強の動作は、`ebpf.log_enricher` 配下でさらに設定できます。

- `cache_ttl`: キャッシュされたファイルディスクリプタの time-to-live
- `cache_size`: キャッシュされるファイルディスクリプタの最大数
- `async_writer_workers`: 非同期ライターのシャード数
- `async_writer_channel_len`: シャードごとのキューサイズ
- `field_names`: トレース ID およびスパン ID の認識と注入に使用するフィールド名
- `plain_text.enabled`: 非 JSON ログにアノテーションするかどうか。デフォルトは `true`
- `plain_text.placement`: フィールドを `prefix` または `suffix` として追加する
- `plain_text.multiline`: インターセプトされた書き込みごとに `first_line`、`last_line`、または `each_line` にアノテーションする

たとえば:

```yaml
ebpf:
  log_enricher:
    field_names:
      trace_id: trace_id
      span_id: span_id
    plain_text:
      enabled: true
      placement: suffix
      multiline: first_line
```

プレーンテキスト補強は、v0.11.0 で選択されたサービスに対してデフォルトで有効になっています。
非 JSON の書き込みが以前のパススルー動作を維持する必要がある場合は、アップグレード前に `plain_text.enabled: false` を設定してください。
フィールド名は JSON およびプレーンテキスト出力に適用され、空でないこと、重複しないこと、空白、`=`、または制御文字を含まないことが必要です。

#### サービスの選択 {#service-selection}

OBI は `ebpf.log_enricher.services` 配下にリストされたサービスの JSON およびプレーンテキストログを補強します。
補強が同じプロセスを追跡するように、サービスセレクターを `discovery.instrument` と一致させてください。

### Config v2 {#config-v2}

Config v2 では、ログトレースアノテーションは OBI をスタンドアロンプロセスとして実行する場合にのみ利用できます。
デフォルトでは無効です。
`extensions.obi.correlation.log_trace_annotation` 配下で設定してください。

```yaml
extensions:
  obi:
    correlation:
      log_trace_annotation:
        enabled: true
        field_names:
          trace_id: trace_id
          span_id: span_id
        plain_text:
          enabled: true
          placement: suffix
          multiline: first_line
```

Config v2 のキャプチャ選択は、ログアノテーションの対象となるワークロードを決定します。
`log_trace_annotation.filter` フィールドは v0.11.0 では予約済みであり、空のままにする必要があります。

## 要件 {#requirements}

### 1. サポートされるログ形式 {#1-supported-log-format}

JSON 形式のログに対して、OBI は JSON オブジェクトに `trace_id` および `span_id` フィールドを注入します。

**OBI 適用前**:

```json
{ "level": "info", "message": "Request processed", "duration_ms": 125 }
```

**OBI による補強後**:

```json
{
  "level": "info",
  "message": "Request processed",
  "duration_ms": 125,
  "trace_id": "4bf92f3577b34da6a3ce929d0e0e4736",
  "span_id": "00f067aa0ba902b7"
}
```

プレーンテキストログに対して、OBI は小文字の固定幅 ID をスペース区切りの `key=value` フィールドとして追加します。
配置とマルチライン選択は設定可能です。

```text
request processed trace_id=4bf92f3577b34da6a3ce929d0e0e4736 span_id=00f067aa0ba902b7
```

改行区切りの JSON は構造化 JSON として処理されます。
OBI は各オブジェクトレコードを個別に補強し、有効な NDJSON にはプレーンテキストアノテーションを適用しません。
マルチライン選択は、1 回のインターセプトされた書き込み内の空でない物理行に対して動作します。
OBI は個別の書き込みをまたいで論理イベントを再構成しません。

#### ランタイムのバッファリングの制限 {#runtime-buffering-limitations}

ログエンリッチャーは、ログの書き込みがリクエスト処理スレッドで発生したときにのみトレースコンテキストを認識します。
標準出力を非同期にバッファリングするランタイムは、この前提を破る可能性があります。

- Docker 上の Python では `PYTHONUNBUFFERED=1` が一般的に必要です
- .NET の `Console.Out` は、標準出力がパイプの場合、デフォルトでバッファリングされます。`AutoFlush = true` の `StreamWriter` を使用してください
- ASP.NET Core のデフォルトの `Microsoft.Extensions.Logging.AddConsole()` パイプラインは、バックグラウンドスレッドから書き込むため互換性がありません
- Java の仮想スレッドのログは、キャリアカーネルスレッドが複数の仮想スレッドからの処理を実行できるため補強されません。
  プラットフォームスレッドの補強は影響を受けません。

### 2. トレースのエクスポートとログ補強の有効化 {#2-trace-export-and-log-enrichment-enabled}

トレースとログの相関には、トレースエクスポートとログ補強の両方が必要です。
Config v1 の場合:

```yaml
otel_traces_export:
  endpoint: http://collector:4318/v1/traces # Required

ebpf:
  log_enricher:
    services:
      - service:
          - open_ports: '8380' # Required
```

### 3. Linux カーネル {#3-linux-kernel}

トレースとログの相関には、特定のカーネル機能を持つ Linux が必要です。

- **Linux カーネル 6.0 以上**（トレースとログの相関に必要）
- サポートされるアーキテクチャ: x86_64、ARM64
- **BPFFS マウント**: カーネルで BPF ファイルシステムが `/sys/fs/bpf` にマウントされている必要があります
- **セキュリティロックダウンされていないカーネル**: セキュリティロックダウンモードで動作していないカーネルが必要です（ほとんどの本番ディストリビューションでは一般的）

### 4. サポートされるログを出力するフレームワーク {#4-framework-that-emits-supported-logs}

アプリケーションは JSON またはプレーンテキストを出力するように設定されたロギングフレームワークを使用できます。
以下の JSON の例は構造化フィールドを生成します。

{{< tabpane text=true persist=lang >}} {{% tab header="Python" lang=python %}}

```python
import json
import logging

class JSONFormatter(logging.Formatter):
    def format(self, record):
        log_entry = {
            'timestamp': self.formatTime(record),
            'level': record.levelname,
            'message': record.getMessage(),
            'module': record.module,
        }
        return json.dumps(log_entry)

logger = logging.getLogger()
handler = logging.StreamHandler()
handler.setFormatter(JSONFormatter())
logger.addHandler(handler)
```

{{% /tab %}} {{% tab header="Go (zapを使用)" lang=go %}}

```go
import "go.uber.org/zap"

logger, _ := zap.NewProduction() // Outputs JSON by default
defer logger.Sync()
logger.Info("Request processed", zap.Duration("duration", 125*time.Millisecond))
```

{{% /tab %}} {{% tab header="Java (Logbackを使用)" lang=java %}}

```xml
<appender name="FILE" class="ch.qos.logback.core.ConsoleAppender">
  <encoder class="net.logstash.logback.encoder.LogstashEncoder"/>
</appender>
```

{{% /tab %}} {{% tab header="Node.js (pinoを使用)" lang=javascript %}}

```javascript
const pino = require('pino');
const logger = pino();
logger.info({ duration_ms: 125 }, 'Request processed');
```

{{% /tab %}} {{< /tabpane >}}

### 5. ログ転送パイプライン {#5-log-shipping-pipeline}

OBI はログをその場で補強します。
既存のログフォワーダーや Collector を使用して、ログをバックエンドに転送してください。

OBI が元の行を抑制すると、コンテナログファイルにはその行のかわりに NUL バイトの行が含まれます。
8 KiB 以下の書き込みの場合、`^[\x00\s]*$` を使用してこれらのプレースホルダー行を下流でフィルタリングしてください。
たとえば、OpenTelemetry Collector の `filelog` レシーバーの場合は次のようにします。

```yaml
receivers:
  filelog:
    include:
      - /var/log/pods/*/*/*.log
    start_at: end
    operators:
      - type: container
      - type: filter
        expr: 'body matches "^[\\x00\\s]*$"'
```

CRI および Docker の JSON ログエンベロープは NUL を `\u0000` としてエンコードします。
`container` オペレーターはフィルターが実行される前にボディをデコードします。

## パフォーマンスに関する考慮事項 {#performance-considerations}

- **最小限のオーバーヘッド**: 相関付けには、効率的なファイルディスクリプタキャッシュを持つ eBPF カーネルプローブを使用します
- **キャッシュの制限**: ファイルディスクリプタキャッシュには、無制限のメモリ使用を防ぐためのサイズおよび TTL の制限があります
- **非同期処理**: ログ補強は、カーネルのリングバッファをあふれさせないように、非同期ワーカーを使用します

## 既知の制限事項 {#known-limitations}

- **書き込み単位のマルチライン選択**: OBI は個別の書き込みをまたいで論理的なマルチラインイベントを再構成しません
- **ファイルディスクリプタキャッシュ**: パフォーマンスのためにキャッシュされ、設定可能な TTL（デフォルト: 30 分）を持ちます
- **スパン整合のみ**: ログはスパンがアクティブな間のみ補強されます。
  スパンのスコープ外のログは補強されません。
- **書き込みあたり 8 KiB の制限**: OBI は単一の `write()` または `writev()` の最初の 8 KiB のみを補強および抑制します。
  残りのバイトは補強されずにそのまま通過し、プレースホルダー行フィルターにマッチしません。
- **Java 仮想スレッド**: 仮想スレッドから書き込まれたログは補強されません。

## トラブルシューティング {#troubleshooting}

### トレースコンテキストがログに表示されない {#trace-context-not-appearing-in-logs}

1. **設定された形式の確認**: JSON ログの場合、アプリケーションが有効な JSON を出力していることを確認します。
   プレーンテキストの場合、`plain_text.enabled` が `true` であることを確認し、配置とマルチラインの設定を確認します。

   ```bash
   # Check for malformed JSON
   cat app.log | jq empty && echo "Valid JSON" || echo "Invalid JSON"
   ```

2. **トレースエクスポートとログ補強の確認**:

   ```yaml
   otel_traces_export:
     endpoint: http://collector:4318/v1/traces

   ebpf:
     log_enricher:
       services:
         - service:
             - open_ports: '8380'
   ```

3. **Linux カーネルの確認**: トレースとログの相関には Linux が必要です

   ```bash
   uname -s  # Must return "Linux"
   ```

4. **ログパイプラインの確認**: ログフォワーダーがログをバックエンドに転送していることを確認します

## 次のステップ {#whats-next}

- トレースとメトリクスの [エクスポート先](/docs/zero-code/obi/configure/export-data/) を設定する
- 一元的な処理のために、[Collector のレシーバーとしての OBI](/docs/zero-code/obi/configure/collector-receiver/) を探索する
