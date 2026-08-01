---
title: HTTPセマンティック規約の安定版宣言
linkTitle: HTTPセマンティック規約が安定版に
date: 2023-11-06
author: '[Trask Stalnaker](https://github.com/trask) (Microsoft)'
default_lang_commit: 1604e4a539552aea3cd5caff67e7c476d26ab7d6
cSpell:ignore: Liudmila Molkova
---

<!-- markdownlint-disable table-pipe-style table-column-count -->

今年の初め、HTTPセマンティック規約の安定化に向けた取り組みを開始しました。
本日、HTTPセマンティック規約がOpenTelemetryセマンティック規約として _初めて_ **[安定版](/docs/specs/otel/document-status/)** と宣言されたことを誇りを持って発表します！
この最初の安定版 [v1.23.0](https://github.com/open-telemetry/semantic-conventions/releases/tag/v1.23.0) リリースは、以前のバージョンからの大幅な進歩であり、以下の特長があります。

- [Elastic Common Schema との統合](/blog/2023/ecs-otel-semconv-convergence/)による改善点。
  たとえば以下のようなものがあります。
  - `url.*` 名前空間。
    将来、HTTP以外のセマンティック規約でも再利用可能です。
  - `net.peer.*` および `net.host.*` 名前空間を `client.*` および `server.*` に置き換え。
    これにより以下のメリットがあります。
    - ログにおいて、スパンの種類でどちら側がピアでどちら側がホストかを示す必要がなく、より適切に機能します。
    - クライアントとサーバーのテレメトリー間の相関を簡素化します（たとえば、`net.peer.addr` == `net.host.addr` を結合するかわりに、`server.address` で直接結合できます）。
    - `network.*` 名前空間からの明確な分離を提供します。
      `network.*` は現在、低レベルのネットワーク属性専用です。
  - `http.request.*` および `http.response.*` 名前空間の使用に関するより高い一貫性。
- Prometheus との一貫性の向上。
  メトリクス単位を秒に標準化しました。
- あまり有用でない属性を省略することで属性のキャプチャを合理化し、テレメトリーのキャプチャ、処理、ストレージのコストを削減しました。
- デフォルト値の定義を明確化し、属性が存在しない場合のあいまいさを排除しました。
- HTTPメトリクスがカーディナリティの爆発に対して脆弱でなくなりました。
  - `http.request.method` は（設定可能な）既知のメソッドの集合に制限されます。
  - `server.address` と `server.port` は `Host` ヘッダーの影響を受けるため、HTTPメトリクスではオプトインになりました。

## 移行計画 {#migration-plan}

変更が多数あり、影響を受けるユーザーベースも広いため、OpenTelemetryが公開している既存のHTTP計装には、ユーザーが安定版HTTPセマンティック規約に移行するのを支援する移行計画を実装することを求めています。
他のセマンティック規約を安定化する際にも、同様の戦略を使用する予定です。

具体的には、OpenTelemetryが公開している既存のHTTP計装を安定版HTTPセマンティック規約に更新する場合、以下を行う必要があります。

- 既存のメジャーバージョンに環境変数 `OTEL_SEMCONV_STABILITY_OPT_IN` を導入する必要があります。
  この環境変数は以下の値を受け付けます。
  - `http` - 安定版のHTTPおよびネットワーク規約を出力し、以前の計装が出力していた古いHTTPおよびネットワーク規約の出力を停止します。
  - `http/dup` - 古い規約と安定版のHTTPおよびネットワーク規約の両方を出力し、安定版セマンティック規約の段階的な展開を可能にします。
  - デフォルトの動作（これらの値が指定されていない場合）は、計装が以前出力していたバージョンの古いHTTPおよびネットワーク規約を引き続き出力することです。
- 両方の規約の出力を開始してから少なくとも6か月間は、既存のメジャーバージョンのメンテナンス（最低限セキュリティパッチ）を行う必要があります。
- 次のメジャーバージョンで環境変数を廃止し、安定版のHTTPおよびネットワーク規約のみを出力することができます。

## 変更の概要 {#summary-of-changes}

このセクションでは、HTTPセマンティック規約における [v1.20.0](https://github.com/open-telemetry/opentelemetry-specification/blob/v1.20.0/specification/trace/semantic_conventions/http.md) から [v1.23.0（安定版）](https://github.com/open-telemetry/semantic-conventions/blob/v1.23.0/docs/http/) への変更をまとめます。

### HTTPクライアントおよびサーバースパンの共通属性 {#common-attributes-across-http-client-and-server-spans}

<!-- prettier-ignore-start -->
| 変更 | コメント |
| --- | --- |
| `http.method` &rarr; `http.request.method` | デフォルトで9つの一般的なHTTPメソッドのみをキャプチャするようになりました（設定可能）。加えて `_OTHER` もキャプチャされます |
| `http.status_code` &rarr; `http.response.status_code` |  |
| `http.request.header.<key>` | &bullet; `<key>` におけるダッシュ (`"-"`) からアンダースコア (`"_"`) への正規化が削除されました<br>&bullet; HTTPサーバースパンの場合：サンプラーに提供する必要があります |
| `http.response.header.<key>` | `<key>` におけるダッシュ (`"-"`) からアンダースコア (`"_"`) への正規化が削除されました |
| `http.request_content_length` &rarr; `http.request.body.size` | &bullet; Recommended &rarr; Opt-In<br>&bullet; _まだ安定版としてマークされていません_ |
| `http.response_content_length` &rarr; `http.response.body.size` | &bullet; Recommended &rarr; Opt-In<br>&bullet; _まだ安定版としてマークされていません_ |
| `user_agent.original` | &bullet; HTTPクライアントスパンの場合：Recommended &rarr; Opt-In<br>&bullet; HTTPサーバースパンの場合：サンプラーに提供する必要があります<br>&bullet; [<= v1.18.0 からの移行](#migrating-from--v1180)の場合は注記を参照してください |
| `net.protocol.name` &rarr; `network.protocol.name` | Recommended &rarr; `http` ではなく、`network.protocol.version` が設定されている場合に条件付きで必須 |
| `net.protocol.version` &rarr; `network.protocol.version` | &bullet; 例の修正：`2.0` &rarr; `2` および `3.0` &rarr; `3`<br>&bullet; [<= v1.19.0 からの移行](#migrating-from--v1190)の場合は注記を参照してください |
| `net.sock.family` | 削除 |
| `net.sock.peer.addr` &rarr; `network.peer.address` | HTTPサーバースパンの場合：`http.client_ip` が不明な場合は `net.sock.peer.addr` &rarr; `client.address` にもなります。`client.address` はサンプラーに提供する必要があります |
| `net.sock.peer.port` &rarr; `network.peer.port` | `server.port` と同じ場合でもキャプチャされるようになりました |
| `net.sock.peer.name` | 削除 |
| 新規：`http.request.method_original` | `http.request.method` が `_OTHER` の場合にのみキャプチャされます |
| 新規：`error.type` | 新規 |
<!-- prettier-ignore-end -->

参考資料：

- [Common attributes v1.20.0](https://github.com/open-telemetry/opentelemetry-specification/blob/v1.20.0/specification/trace/semantic_conventions/http.md#common-attributes)
- [Common attributes v1.23.0（安定版）](https://github.com/open-telemetry/semantic-conventions/blob/v1.23.0/docs/http/http-spans.md#common-attributes)

### HTTPクライアントスパン属性 {#http-client-span-attributes}

<style>
.ot-table-first-col-50 th:first-child { width: 50%; }
</style>

<!-- prettier-ignore-start -->
| 変更 | コメント |
| --- | --- |
| `http.url` &rarr; `url.full` | |
| `http.resend_count` &rarr; `http.request.resend_count` | |
| `net.peer.name` &rarr; `server.address` | |
| `net.peer.port` &rarr; `server.port` | スキームのデフォルトポートと同じ場合でもキャプチャされるようになりました |
<!-- prettier-ignore-end -->

参考資料：

- [HTTP client span attributes v1.20.0](https://github.com/open-telemetry/opentelemetry-specification/blob/v1.20.0/specification/trace/semantic_conventions/http.md#http-client)
- [HTTP client span attributes v1.23.0（安定版）](https://github.com/open-telemetry/semantic-conventions/blob/v1.23.0/docs/http/http-spans.md#http-client)

### HTTPサーバースパン属性 {#http-server-span-attributes}

<!-- prettier-ignore-start -->
| 変更 | コメント |
| --- | --- |
| `http.route` | 変更なし |
| `http.target` &rarr; `url.path` および `url.query` | 2つの別々の属性に分割 |
| `http.scheme` &rarr; `url.scheme` | [X-Forwarded-Proto][]、[Forwarded#proto][] ヘッダーを考慮するようになりました |
| `http.client_ip` &rarr; `client.address` | `http.client_ip` が不明な場合（つまり [X-Forwarded-For][]、[Forwarded#for][] ヘッダーがない場合）は `net.sock.peer.addr` &rarr; `client.address` になります。サンプラーに提供する必要があります |
| `net.host.name` &rarr; `server.address` | [Host][Host header]、[:authority][HTTP/2 authority]、[X-Forwarded-Host][]、[Forwarded#host][] ヘッダーのみに基づくようになりました |
| `net.host.port` &rarr; `server.port` | [Host][Host header]、[:authority][HTTP/2 authority]、[X-Forwarded-Host][X-Forwarded-Host]、[Forwarded#host][] ヘッダーのみに基づくようになりました |
{.ot-table-first-col-50}
<!-- prettier-ignore-end -->

参考資料：

- [HTTP server span attributes v1.20.0](https://github.com/open-telemetry/opentelemetry-specification/blob/v1.20.0/specification/trace/semantic_conventions/http.md#http-server)
- [HTTP server span attributes v1.23.0（安定版）](https://github.com/open-telemetry/semantic-conventions/blob/v1.23.0/docs/http/http-spans.md#http-server)

### HTTPクライアントおよびサーバーのスパン名 {#http-client-and-server-span-names}

スパン名の `{http.method}` 部分は、`{http.method}` が `_OTHER` の場合に `HTTP` に置き換えられます。

[`<= v1.17.0` からの移行](#migrating-from--v1170)の場合は注記を参照してください。

参考資料：

- [HTTP client and server span names v1.20.0](https://github.com/open-telemetry/opentelemetry-specification/blob/v1.20.0/specification/trace/semantic_conventions/http.md#name)
- [HTTP client and server span names v1.23.0（安定版）](https://github.com/open-telemetry/semantic-conventions/blob/v1.23.0/docs/http/http-spans.md#name)

### HTTPクライアント持続時間メトリクス {#http-client-duration-metric}

メトリクスの変更：

- **名前**：`http.client.duration` &rarr; `http.client.request.duration`
- **単位**：`ms` &rarr; `s`
- **説明**：`Measures the duration of inbound HTTP requests.` &rarr;
  `Duration of HTTP server requests.`
- **ヒストグラムバケット**：ミリ秒から秒への変更を反映してバケット境界が更新され、ゼロバケット境界が削除されました
- **属性**：以下の表を参照

<!-- prettier-ignore-start -->
| 属性の変更 | コメント |
| --- | --- |
| `http.method` &rarr; `http.request.method` | デフォルトで9つの一般的なHTTPメソッドのみをキャプチャするようになりました。加えて `_OTHER` もキャプチャされます |
| `http.status_code` &rarr; `http.response.status_code` |  |
| `net.peer.name` &rarr; `server.address` |  |
| `net.peer.port` &rarr; `server.port` | スキームのデフォルトポートと同じ場合でもキャプチャされるようになりました |
| `net.sock.peer.addr` | 削除 |
| `net.protocol.name` &rarr; `network.protocol.name` | Recommended &rarr; `http` ではなく、`network.protocol.version` が設定されている場合に条件付きで必須 |
| `net.protocol.version` &rarr; `network.protocol.version` | 例の修正：`2.0` &rarr; `2` および `3.0` &rarr; `3`。[`<= v1.19.0` からの移行](#migrating-from--v1190)の場合は注記を参照してください |
| 新規：`error.type` | 新規 |
<!-- prettier-ignore-end -->

参考資料：

- [Metric `http.client.duration` v1.20.0](https://github.com/open-telemetry/opentelemetry-specification/blob/v1.20.0/specification/metrics/semantic_conventions/http-metrics.md#metric-httpclientduration)
- [Metric `http.client.request.duration` v1.23.0（安定版）](https://github.com/open-telemetry/semantic-conventions/blob/v1.23.0/docs/http/http-metrics.md#metric-httpclientrequestduration)

### HTTPサーバー持続時間メトリクス {#http-server-duration-metric}

メトリクスの変更：

- **名前**：`http.server.duration` &rarr; `http.server.request.duration`
- **単位**：`ms` &rarr; `s`
- **説明**：`Measures the duration of inbound HTTP requests.` &rarr;
  `Duration of HTTP server requests.`
- **ヒストグラムバケット**：ミリ秒から秒への変更を反映してバケット境界が更新され、ゼロバケット境界が削除されました
- **属性**：以下の表を参照

<!-- prettier-ignore-start -->
| 属性の変更 | コメント |
| --- | --- |
| `http.route` | 変更なし |
| `http.method` → `http.request.method` | デフォルトで9つの一般的なHTTPメソッドのみをキャプチャするようになりました。加えて `_OTHER` もキャプチャされます |
| `http.status_code` → `http.response.status_code` |  |
| `http.scheme` → `url.scheme` | [`X-Forwarded-Proto` span][X-Forwarded-Proto]、[`Forwarded#proto` span][Forwarded#proto] ヘッダーを考慮するようになりました |
| `net.protocol.name` → `network.protocol.name` | Recommended → `http` ではなく、`network.protocol.version` が設定されている場合に条件付きで必須 |
| `net.protocol.version` → `network.protocol.version` | 例の修正：`2.0` → `2` および `3.0` → `3`。[`<= v1.19.0` からの移行](#migrating-from--v1190)の場合は注記を参照してください |
| `net.host.name` → `server.address` | &bullet; Recommended → Opt-In（HTTPヘッダーに基づくため、高カーディナリティの脆弱性があります）<br>&bullet; [`Host` span][Host header]、[`:authority` span][HTTP/2 authority]、[`X-Forwarded-Host` span][X-Forwarded-Host]、[`Forwarded#host` span][Forwarded#host] ヘッダーのみに基づくようになりました |
| `net.host.port` → `server.port` | &bullet; Recommended → Opt-In（HTTPヘッダーに基づくため、高カーディナリティの脆弱性があります）<br>&bullet; [`Host` span][Host header]、[`:authority` span][HTTP/2 authority]、[`X-Forwarded-Host` span][X-Forwarded-Host]、[`Forwarded#host` span][Forwarded#host] ヘッダーのみに基づくようになりました |
| 新規：`error.type` | 新規 |
{.ot-table-first-col-50}
<!-- prettier-ignore-end -->

参考資料：

- [Metric `http.server.duration` v1.20.0](https://github.com/open-telemetry/opentelemetry-specification/blob/v1.20.0/specification/metrics/semantic_conventions/http-metrics.md#metric-httpserverduration)
- [Metric `http.server.request.duration` v1.23.0（安定版）](https://github.com/open-telemetry/semantic-conventions/blob/v1.22.0/docs/http/http-metrics.md#metric-httpserverrequestduration)

## v1.20.0 より前のバージョンからの移行 {#migrating-from-a-version-earlier-than-v1200}

### <= v1.19.0 からの移行 {#migrating-from--v1190}

- `http.flavor` &rarr; `network.protocol.version`
  - 例の修正：`2.0` &rarr; `2` および `3.0` &rarr; `3`

### <= v1.18.0 からの移行 {#migrating-from--v1180}

- `http.user_agent` &rarr; `user_agent.original`

### <= v1.17.0 からの移行 {#migrating-from--v1170}

#### HTTPサーバースパン名 {#http-server-span-name}

- `http.route` が利用可能な場合：<br> `{http.route}` &rarr;
  `{summary} {http.route}`
- `http.route` が利用できない場合：<br> `HTTP {http.method}` &rarr;
  `{summary}`

ここで `{summary}` は `{http.method}` です。
ただし `{http.method}` が `_OTHER` の場合、`{summary}` は `HTTP` になります。

#### HTTPクライアントスパン名 {#http-client-span-name}

- `HTTP {http.method}` &rarr; `{summary}`

ここで `{summary}` は `{http.method}` です。
ただし `{http.method}` が `_OTHER` の場合、`{summary}` は `HTTP` になります。

[Host header]: https://tools.ietf.org/html/rfc7230#section-5.4
[HTTP/2 authority]: https://tools.ietf.org/html/rfc9113#section-8.3.1
[Forwarded#for]: https://developer.mozilla.org/docs/Web/HTTP/Headers/Forwarded#for
[Forwarded#proto]: https://developer.mozilla.org/docs/Web/HTTP/Headers/Forwarded#proto
[Forwarded#host]: https://developer.mozilla.org/docs/Web/HTTP/Headers/Forwarded#host
[X-Forwarded-For]: https://developer.mozilla.org/docs/Web/HTTP/Headers/X-Forwarded-For
[X-Forwarded-Proto]: https://developer.mozilla.org/docs/Web/HTTP/Headers/X-Forwarded-Proto
[X-Forwarded-Host]: https://developer.mozilla.org/docs/Web/HTTP/Headers/X-Forwarded-Host

## コミュニティへの称賛 {#community-kudos}

これは大規模なコミュニティの取り組みでした。
関わってくださった全員に感謝します！
特に [Liudmila Molkova](https://github.com/lmolkova) には、HTTPドメインの専門知識を共有し、この取り組みのすべてのステップを推進する上で大きな力となっていただきました。
