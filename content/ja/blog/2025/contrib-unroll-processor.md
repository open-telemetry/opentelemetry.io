---
title: Unroll プロセッサーを OpenTelemetry Collector Contrib にコントリビュートする
linkTitle: Unroll プロセッサーの追加
date: 2025-11-06
author: >-
  [Keith Schmitt](https://github.com/schmikei) (Bindplane)
issue: 8039
sig: Collector
default_lang_commit: 5dd59654f024bdc3d8ca1cccae5551d6b0f59e35
cSpell:ignore: Bindplane CloudWatch OTTL schmikei VPC
---

OpenTelemetry Collector 内でバンドルされたログを展開するというアイデアは、プロセッサーから始まったわけではありません。

「展開」とは、複数の論理イベントを含む単一のログレコード（たとえば10件のログエントリを持つ JSON 配列）を取り出し、各イベントに対応する10個の個別のログレコードに展開することを意味します。
これにより、バンドルされたペイロードではなく、個々のログエントリを扱えるようになります。

Collector SIG が、JSON 配列のように単一のボディに複数の論理イベントを含むログの扱い方を最初に議論したとき、最初の直感は [transform プロセッサー内の OTTL（OpenTelemetry Transform Language）関数](https://github.com/open-telemetry/opentelemetry-collector-contrib/issues/41791)で解決することでした。

最初はそれが理にかなっていると思いました。
OTTL は強力で柔軟性があり、レコードレベルの変換を扱えます。
しかし、より深い課題が見つかりました。
transform プロセッサーは、イテレーション中に新しいログレコードを追加することが困難でした。
既存のデータの変更やフィルタリングは可能ですが、1つのレコードを複数に展開することは、単一のプロセッサーとしての役割の中で実現するのが難しいものでした。

そこで私たちが手を差し伸べたいと思ったのです。
今年1月、私は OpenTelemetry Collector の自社ディストリビューションで専用の unroll プロセッサーの開発を手伝いました。
主な理由は、私たちの顧客基盤がこれらの問題に直面していたからです。

unroll プロセッサーは、バンドルされたレコードをクリーンで決定的な方法で展開します。
数か月間本番環境で運用した後、OpenTelemetry コミュニティが共有ソリューションの恩恵を受けられるよう、unroll プロセッサーを[アップストリームに反映](https://github.com/open-telemetry/opentelemetry-collector-contrib/issues/42491)することで貢献したいと考えました。

unroll プロセッサーとは何か、どのように動作するか、どのように役立つか、そして [Contrib ディストリビューションへのアップストリーム](https://github.com/open-telemetry/opentelemetry-collector-contrib/pull/42500)への貢献をどのように進めたかを説明します。

## なぜ展開するのか {#why-unroll}

根本的な問題はシンプルです。
一部のソースは、1つのログレコード内に複数のイベントを配信します。
クリーンで個別のログエントリとして扱いたいのです。

unroll 登場以前は、2つの選択肢がありました。

1. ロジックを挿入できるなら、Collector の外でログを前処理する。
2. OTTL/transform を、設計されていない用途に無理やり使おうとする。

どちらも問題に対処するための適切なアプローチではありませんでした。

## unroll プロセッサーの機能 {#what-the-unroll-processor-does}

unroll プロセッサーは、JSON 配列のようなリスト形式のログボディを受け取り、タイムスタンプ、リソース属性、ログ属性を保持しながら、要素ごとに1つのログレコードに展開します。

入力に JSON 配列内の10個のオブジェクトがあった場合、10個の個別のログレコードが出力されます。
すべてのログレコードはメタデータを保持し、変換、フィルタリング、削減など、あらゆる処理に対応できる状態になります。

シンプルで予測可能、そして本番環境で安全です。

## なぜ OTTL を採用しなかったのか {#why-decide-against-ottl}

この点については深く検討しました。

理論上は、transform と OTTL の組み合わせで解決する方がシンプルに見えました。
しかし実際に取り組んでみると、根本的な制限にぶつかりました。
OTTL はイテレーション中に安全に新しいレコードを追加できません。
ループの途中で新しいエントリを生成しようとすると、レコードのスキップ、不安定なステートメント実行、脆弱な挙動につながります。

transform プロセッサーと filter プロセッサーは、変更と抑制には優れています。
しかし展開は異なる責務です。
独自のセマンティクス、ライフサイクル、保証が必要です。

unroll プロセッサーは、レコード追加の関心事を変換ロジックから明確に分離し、合成可能で予測可能な方法で動作します。

私は Bindplane ディストリビューションの OpenTelemetry Collector で unroll プロセッサーの最初のバージョンの開発を手伝いました。
2025年1月に初めて出荷され、顧客に利用されて以来、本番環境で稼働し続けています。

顧客が以下のような用途で使用しているのを見てきました。

- VPC ログ
- CloudWatch 取り込みパイプライン
- Windows およびエンドポイントログ
- バンドルされた Collector テレメトリー

初期のレシーバーやログシグナルのソースがフォーマットにあまり依存しない場合でも、実際の本番環境の負荷下でイシューの発生量は非常に少ないことが確認できました。
これにより、コンポーネントをアップストリームに提案する自信が得られました。

## unroll プロセッサーの設定方法 {#how-to-configure-the-unroll-processor}

バンドルされたログペイロードを展開する必要がある場所に、unroll プロセッサーをパイプラインに組み込みます。
以下は、始めるための最小限の設定例です。

```yaml
processors:
  unroll:
service:
  pipelines:
    logs:
      receivers: [otlp]
      processors: [..., unroll, ...]
      exporters: [logging]
```

## よくある unroll パターン {#common-unroll-pattern}

unroll プロセッサーは、`log.body` がイテレート可能なリスト（たとえば適切な JSON 配列）である場合にのみ処理を実行します。
しかし実際のパイプラインでは、ログレコードが常にきれいに構造化されているわけではありません。
場合によっては、生のログペイロードを unroll プロセッサーが処理できる形式に変換するための追加の前処理が必要です。

### 例: 単一のログレコード内の複数の JSON オブジェクト {#example-multiple-json-objects-in-a-single-log-record}

以下のように、複数の JSON オブジェクトが単一のログレコードに連結されているケースを考えます。

```json
{"@timestamp":"2025-09-19T02:20:17.920Z", "log.level": "INFO", "message":"initialized", "ecs.version": "1.2.0","service.name":"ES_ECS","event.dataset":"elasticsearch.server","process.thread.name":"main","log.logger":"org.elasticsearch.node.Node","elasticsearch.node.name":"es-test-3","elasticsearch.cluster.name":"elasticsearch"},{"type": "server", "timestamp": "2025-09-18T20:44:01,838-04:00", "level": "INFO", "component": "o.e.n.Node", "cluster.name": "elasticsearch", "node.name": "es-test", "message": "initialized" }
```

以下は、`transform` プロセッサーで前処理してから `unroll` を適用する方法です。

```yaml
receivers: ...

processors:
  transform:
    error_mode: ignore
    log_statements:
      - context: log
        statements:
          - set(body, Split(body, "\"},"))
  unroll: {}
exporters: ...

services:
  pipelines:
    logs:
      receivers: [...]
      processors: [transform, unroll]
      exporters: [...]
```

この transform ステートメントは `Split` を使用して、`"},"` 区切り文字でボディをチャンクに分割し、unroll プロセッサーが展開できるリスト形式のボディを生成します。

## まとめ {#summary}

この機能は、シンプルなニーズから始まりました。
Collector をより汎用的にし、ログレコードを展開できるようにすることです。

OTTL のルートを試み、容易には実現できないことがわかり、目的に特化した、本番環境でテスト済みの、使いやすい unroll プロセッサーをアップストリームに反映しました。
その結果、小さな設定変更で、多数の実際のテレメトリー取り込みの問題を解決できるようになりました。

現時点では OTTL にレコード展開機能を追加することは提案していません。
展開はデータストリームのカーディナリティを変更し、異なるライフサイクルと正確性の保証が必要になる可能性が高いため、現時点では専用プロセッサーが適切です。
責務を分離することで、OTTL は既存のログレコードの変換に集中でき、unroll プロセッサーが展開を担います。

unroll プロセッサーは、公式の [OpenTelemetry Collector Contrib](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/635d4254a3018eb3ca8f1736e71fcb54f8ed6e5a/processor/unrollprocessor?from_branch=main) で利用可能です。
ぜひイシューを作成したり、ログパイプラインでテストしてみてください。
