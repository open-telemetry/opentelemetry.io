---
title: トレースとログの相関
linkTitle: トレースとログの相関
weight: 35
description: より迅速なデバッグとトラブルシューティングのために、OBI がアプリケーションログを分散トレースとどのように相関付けるかを学びます。
default_lang_commit: 2728c8fbf4f09cf3b8257a1b628a7631fc77d639
cSpell:ignore: BPFFS NUL PYTHONUNBUFFERED
---

OpenTelemetry eBPF 計装 (OBI) は、JSON ログをトレースコンテキストで補強することで、アプリケーションログを分散トレースと相関付けます。
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
3. **コンテキストの注入**: JSON 形式のログに対して、OBI は `trace_id` および `span_id` フィールドを注入します
4. **トレースのエクスポート**: ログは既存のロギングパイプラインを通じて流れ続けます
5. **バックエンドでの紐付け**: オブザーバビリティバックエンドは、これらの ID を使用してログをトレースに紐づけます

### 技術的なアプローチ {#technical-approach}

OBI はアプリケーションバイナリを変更することなく、カーネルレベルで相関付けを行います。

- カーネルの eBPF プローブを使用して write 操作をインターセプトします
- パフォーマンスのためにファイルディスクリプタのキャッシュを維持します
- JSON ログを出力する任意のロギングフレームワークと連携します

OBI は JSON にすでに存在する `trace_id` および `span_id` フィールドを保持します。
OpenTelemetry トレースを直接エクスポートしていると検出されたサービスに対して、OBI は `trace_id` のみを注入します。
OBI が生成する eBPF ベースのスパン ID では SDK のスパンを特定できないためです。

## 設定 {#configuration}

トレースとログの相関は、トレースエクスポートが設定され、選択されたサービスに対してログの補強が有効化されている場合に有効になります。

### 基本的な設定 {#basic-configuration}

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

### サービスごとに相関を有効化する {#enabling-correlation-per-service}

OBI は `ebpf.log_enricher.services` 配下にリストされたサービスの JSON ログを補強します。
補強が同じプロセスを追跡するように、サービスセレクターを `discovery.instrument` と一致させてください。

## 要件 {#requirements}

### 1. JSON ログ形式 {#1-json-log-format}

トレースとログの相関は **JSON 形式のログを必要とします**。
OBI は JSON ログオブジェクトに `trace_id` および `span_id` フィールドを注入します。

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

プレーンテキストのログはそのまま通過し、トレースコンテキストでは**補強されません**。

#### ランタイムのバッファリングの制限 {#runtime-buffering-limitations}

ログエンリッチャーは、ログの書き込みがリクエスト処理スレッドで発生したときにのみトレースコンテキストを認識します。
標準出力を非同期にバッファリングするランタイムは、この前提を破る可能性があります。

- Docker 上の Python では `PYTHONUNBUFFERED=1` が一般的に必要です
- .NET の `Console.Out` は、標準出力がパイプの場合、デフォルトでバッファリングされます。`AutoFlush = true` の `StreamWriter` を使用してください
- ASP.NET Core のデフォルトの `Microsoft.Extensions.Logging.AddConsole()` パイプラインは、バックグラウンドスレッドから書き込むため互換性がありません
- Java の仮想スレッドのログは補強されません。
  キャリアカーネルスレッドは複数の仮想スレッドからの処理を実行できるためです。
  プラットフォームスレッドの補強は影響を受けません。

### 2. トレースのエクスポートとログ補強の有効化 {#2-trace-export-and-log-enrichment-enabled}

トレースをエクスポートし、ログ補強を有効化する必要があります。

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

### 4. JSON ログを出力するフレームワーク {#4-framework-that-emits-json-logs}

アプリケーションは JSON を出力するように設定されたロギングフレームワークを使用する必要があります。
例:

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

- **JSON のみ**: プレーンテキストのログはトレースコンテキストで補強されません
- **ファイルディスクリプタキャッシュ**: パフォーマンスのためにキャッシュされ、設定可能な TTL（デフォルト: 30 分）を持ちます
- **スパン整合のみ**: ログはスパンがアクティブな間のみ補強されます。
  スパンのスコープ外のログは補強されません。
- **書き込みあたり 8 KiB の制限**: OBI は単一の `write()` または `writev()` の最初の 8 KiB のみを補強および抑制します。
  残りのバイトは補強されずにそのまま通過し、プレースホルダー行フィルターにマッチしません。
- **Java 仮想スレッド**: 仮想スレッドから書き込まれたログは補強されません。

## トラブルシューティング {#troubleshooting}

### トレースコンテキストがログに表示されない {#trace-context-not-appearing-in-logs}

1. **JSON 形式の確認**: アプリケーションが有効な JSON ログを出力していることを確認します

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
