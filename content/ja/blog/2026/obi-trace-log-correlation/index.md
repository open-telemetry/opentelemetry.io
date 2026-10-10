---
title: OBI によるゼロコードのトレースとログの相関
linkTitle: OBI によるゼロコードのトレースとログの相関
date: 2026-10-06
author: >-
  [Mattia Meleleo](https://github.com/mmat11) (Coralogix)
sig: SIG eBPF Instrumentation
default_lang_commit: 6f4576bc4128278688d3400c5b2dfda0bb1d1491
cSpell:ignore: Mattia Meleleo PYTHONUNBUFFERED writev
---

ページャーが鳴ります。
トレースを見ると、あるサービスでリクエストが失敗していることがわかります。
答えはログの中にあるはずですが、_あの_ リクエストに属するログ行はどれでしょうか。
サービスがトレースコンテキスト付きの構造化ログを採用していなければ、正直なところ、タイムスタンプで grep して祈るしかありません。

[OpenTelemetry eBPF Instrumentation（OBI）](https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation)は、サービスがすでに出力しているログに、欠けていたトレースコンテキストを追加できるようになりました。
アプリケーション側の変更は不要です。
SDK も、ロギングライブラリの設定変更も、アプリケーションの再ビルドや再デプロイも必要ありません。

最初に制約を明確にしておきます。
対象となるのは stdout または stderr に書き込まれたログ、つまりコンテナランタイムがキャプチャするストリームです。
ログ行にアノテーションが付与されるのは、書き込み時点で OBI が処理中のリクエストに対してアクティブなトレースコンテキストを持っている場合です。
ロールアウトするのは、OBI の設定変更と、ログパイプラインでの1行のフィルター追加です。

内部的には、OBI は eBPF を通じて、各スレッドがログ行を書き込む時点でどのリクエストを処理しているかをすでに把握しています。
それがこの仕組みのすべてです。
コンテナのロギングパイプラインがログ行を受け取る前に、相関フィールドが追加されます。
この記事の残りでは、実際に何が変わるのか、この機能が環境に何を要求するのか、そして有効化する方法を説明します。

## インシデント時に何が変わるか {#what-changes-during-an-incident}

アプリケーションが次のように書き込みます。

```json
{ "level": "INFO", "message": "payment authorized", "amount": 42 }
```

コンテナログは次のようになります。

```json
{
  "level": "INFO",
  "message": "payment authorized",
  "amount": 42,
  "trace_id": "4bf92f3577b34da6a3ce929d0e0e4736",
  "span_id": "00f067aa0ba902b7"
}
```

ID は OBI がそのリクエストのスパンで報告するものと同一なので、相関は双方向に機能します。
失敗したトレースから `trace_id` をコピーしてログ検索に貼り付ければ、そのリクエストのログ行だけが得られます。
あるいは、不審なログ行から `trace_id` をコピーしてトレースバックエンドに入力すれば、そのログが属するトレースに到達できます。

JSON ログ、NDJSON、プレーンテキストで機能します。
自由形式のログ行には `key=value` アノテーションが付きます。

```text
payment authorized trace_id=4bf92f3577b34da6a3ce929d0e0e4736 span_id=00f067aa0ba902b7
```

ロガーが設定済みのフィールドのいずれかをすでに出力している場合、OBI はそれを保持し、欠けているフィールドのみを補完します。

小さなデモでのエンドツーエンドの例を示します。
計装されていない Go の `frontend` が計装されていない Go の `backend` を呼び出し、それぞれがリクエストごとに1行の JSON をログ出力します。
これに OBI と Jaeger を加えた合計4つのコンテナです。
アプリケーションコードには OpenTelemetry SDK は一切ありません。

フロントエンドへの1回のリクエストで、Jaeger に1つの分散トレースが生成されます。
OBI は2つのサービス間のトレースコンテキストも伝搬するため、フロントエンドとバックエンドのスパンは1つのトレースの下に結合されます。

![Jaeger showing the frontend and backend spans of one trace](jaeger-trace.png)

両方のサービスはトレースフィールドなしのプレーン JSON をログ出力しました。
OBI が一致するコンテキストを注入しました。
両方のサービスで同じ `trace_id` が使われ、それぞれ独自の `span_id` が付与されています。

![Enriched logs from both services carrying the same trace ID](logs-and-trace.png)

どちらのログ行の `trace_id` で Jaeger を検索しても、上に示したトレースに正確にたどり着きます。

## この機能はあなたの環境に適しているか {#is-this-a-fit-for-your-environment}

ロールアウトを計画する前に、以下を確認してください。

- **ログの出力先。**
  エンリッチメントの対象は、stdout または stderr に書き込まれ、コンテナランタイムによってキャプチャされたログです。
  ファイルに直接書き込まれたログや、インプロセスのアペンダーによってネットワーク経由で送信されたログは対象外です。
- **アクティブなトレースコンテキスト。**
  ログ行がエンリッチされるのは、OBI がそのサービス上でリクエストをトレースしている間に書き込まれた場合のみです。
  つまり、HTTP や gRPC のリクエスト、クライアント呼び出し、または実行中のデータベース操作がある場合です。
  起動メッセージやバックグラウンドジョブのログはそのまま通過します。
- **カーネルと権限。**
  OBI のログエンリッチャーには `CAP_SYS_ADMIN` と、ロックダウンモードでないカーネルが必要です。
  一般的な `write()` パスのエンリッチには Linux 6.0 以降が必要です。
  それより古いカーネルでは `writev()` ベースの書き込みのみがエンリッチされるため、カバレッジはランタイムのロガーがどのように書き込むかに依存します。
- **同期ログ出力。**
  ログ行とリクエストの紐付けは、リクエストを処理しているスレッドから書き込みが行われることに依存しています。
  Go、Java、Ruby のロガーはデフォルトでこの動作をします。
  Node.js の stdout はパイプにバックアップされている場合（コンテナでのデフォルト）に非同期となるため、書き込みバックプレッシャー下ではまれにログ行がコンテキストを取得できなかったり、古いコンテキストが付与されたりすることがあります。
  Python では `PYTHONUNBUFFERED=1` が必要です。
  .NET では同期コンソールライターが必要です。
  [Java の仮想スレッドはまだエンリッチされません](https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation/issues/2284)。
  プラットフォームスレッドのワークロードは影響を受けません。
- **OTel SDK で計装されたサービス。**
  エンリッチメントはそこでも機能し、SDK がトレースをエクスポートするがログはエクスポートしない場合に有用です。
  OBI は `trace_id` のみを注入します。
  OBI が生成するスパン ID は SDK のものと一致しないため、誤ったスパンリンクはないほうがましだからです。
  それでも、トレース ID でログからトランザクションを見つけることはできます。

## 有効化する {#enable-it}

エンリッチャーはオプトインです。
バージョン 2 の設定では、`extensions.obi.correlation.log_trace_annotation` の下で有効にします。
その `match` リストは `capture` ルールと同じマッチ句を取り、どのキャプチャ済みワークロードにアノテーションを付けるかを選択します。
少なくとも1つのワークロードを選択する必要があり、`capture` の選択範囲外のワークロードはアノテーションされません。

```yaml
extensions:
  obi:
    version: '2.0'
    capture:
      policy:
        default_action: exclude
      rules:
        - action: include
          match:
            process:
              exe_path_glob:
                - /frontend
                - /backend
    correlation:
      log_trace_annotation:
        enabled: true
        match:
          - process:
              exe_path_glob:
                - /frontend
                - /backend
        plain_text:
          enabled: true
          placement: suffix
          multiline: first_line
```

`plain_text` ブロックは、非 JSON ログにおける `key=value` アノテーションの配置場所と、複数行の書き込みのどの行にアノテーションを付けるかを制御します。
注入されるフィールド名はデフォルトで `trace_id` と `span_id` であり、`field_names` を通じて設定可能なため、ログパイプラインがすでに期待している出力と一致させることができます。

バージョン 1 の設定では、同じ選択が `ebpf.log_enricher.services` の下に配置されます。
詳細は[トレースとログの相関のドキュメント](/docs/zero-code/obi/trace-log-correlation/)を参照してください。

パイプラインの変更が1つ必要です。
エンリッチされた各行について、元のエンリッチされていない行はコンテナログ内で空のプレースホルダー（NUL バイト）に置き換えられ、エンリッチされた行がその場所に追記されます。
ログシッパーに空のプレースホルダー行を除外するフィルターを追加してください。
すべてが NUL のレコードに一致する1つのルールです。

## 本番環境で有効化する前に {#before-enabling-it-in-production}

ロールアウト計画で考慮すべき動作を説明します。

- **大きな書き込みは分割されます。**
  1回の `write()` または `writev()` が 8 KiB を超える場合、そのまま完全にはエンリッチされません。
  キャプチャされた接頭辞がトレースコンテキスト付きで再出力され、残りの部分はエンリッチなしでログストリームに別途到達します。
  つまり、1つの論理レコードが2つになる可能性があります。
  サービスが非常に大きなログ行を日常的に出力している場合は、有効化する前に計測してください。
- **段階的にロールアウトしてください。**
  まず1つの低リスクなサービスを `match` に追加し、ログバックエンドで2つのことを確認します。
  空のプレースホルダー行がフィルターによって除外されていること、そしてログ行が1回だけ出現すること（重複や分割がないこと）です。
  その後、さらにサービスを `match` に追加します。
  `match` から除外されたサービスは引き続きトレースされます。
  ログだけが変更されずに残ります。
  ロールバックは、サービスを `match` から削除するか、`enabled: false` に設定してすべてのサービスのアノテーションをオフにすることです。
  どちらの方向でもアプリケーションへの変更はありません。

## 試してみる {#try-it}

トレースとログの相関は OBI に同梱されています。
1つのサービスに向けて設定し、ログシッパーにプレースホルダーフィルターを追加すれば、既存のログが（アプリケーションの再ビルドや再デプロイなしで）直前のインシデントで必要だったトレース ID を持ち始めます。

- この記事のデモを自分で実行する:
  [docker compose の例](https://gist.github.com/mmat11/f3f23707e7bc9c94bce144f56276251d)
- [OBI のドキュメント](/docs/zero-code/obi/)
- [OBI のリポジトリ](https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation)
- 内部の仕組みに興味がありますか？
  eBPF の内部実装は[開発者ドキュメント](https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation/blob/6a9df076223faff5bb94ea75f15a8e24c7a1ca0d/devdocs/trace-log-correlation.md)にあります
- 質問やフィードバック:
  CNCF Slack の [#otel-ebpf-instrumentation](https://cloud-native.slack.com/archives/C06DQ7S2YEP) チャンネル
