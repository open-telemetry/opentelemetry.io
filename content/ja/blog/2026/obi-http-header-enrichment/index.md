---
title: OBI がインシデント対応に必要なリクエストコンテキストを提供する
linkTitle: OBI インシデント対応コンテキスト
date: 2026-04-10
author: >-
  [Tyler Yahn](https://github.com/MrAlias) (Splunk), [Nimrod
  Avni](https://github.com/NimrodAvni78) (Coralogix)
sig: SIG eBPF Instrumentation
default_lang_commit: 56822f6fceee3f9a58cfbac337869438994f1437
cSpell:ignore: Avni obfuscate x-tenant-id x-user-segment Yahn
---

インシデントが発生しているとき、トレースは通常、何かがおかしいということを教えてくれます。
より難しい問題は、誰が影響を受けていて、なぜなのかを素早く特定することです。

[OpenTelemetry eBPF Instrumentation（OBI）](https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation)
[v0.7.0](https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation/releases/tag/v0.7.0) では、HTTP ヘッダーエンリッチメントが追加され、スパンがテナントやユーザーセグメントなどのリクエストコンテキストを保持できるようになりました。
このコンテキストこそが、「エラーレートが上がっている」から「これは特定の顧客コホートに限定された問題だ」へと絞り込む助けになることが多いのです。

最大の利点は、これが OBI 自体の設定変更だけで実現できることです。
既存のアプリケーションを再ビルドしたり再デプロイしたりする必要はありません。

## 実際に重要な理由 {#why-this-matters-in-practice}

トレースがレイテンシーや障害を示しているのに、トリアージ時にスコープを絞り込むのに十分なリクエストコンテキストがない、という辛さはほとんどのチームが経験しています。
ヘッダーエンリッチメントは、アプリケーションコードの変更なしにそのギャップを埋めます。

このデモでは、以下を含めています。

- `x-tenant-id`
- `x-user-segment`

また、以下は意図的に難読化しています。

- `authorization`

これにより、レスポンダーはセンシティブな値をマスクしつつ、有用なデバッグコンテキストを得ることができます。

## 設定変更 {#the-config-change}

これがデモで使用されるコアポリシーです。

```yaml
ebpf:
  # エンリッチメントのためにヘッダーがキャプチャされるように必要です。
  track_request_headers: true
  payload_extraction:
    http:
      enrichment:
        enabled: true
        policy:
          # ルールが明示的にマッチしたヘッダーのみを出力します。
          default_action: exclude
          # 難読化されたヘッダーの置換値。
          obfuscation_string: '***'
        rules:
          - action: include
            type: headers
            scope: all
            match:
              patterns: ['x-tenant-id', 'x-user-segment']
              case_sensitive: false
          - action: obfuscate
            type: headers
            scope: all
            match:
              patterns: ['authorization']
              case_sensitive: false
```

2つの小さな点を指摘しておきます。`scope: all` はリクエストヘッダーとレスポンスヘッダーの両方にルールを適用し、`case_sensitive: false` は大文字小文字の違いによるヘッダーの見逃しを防ぎます。

この機能のオン・オフは、OBI の設定更新と OBI の再デプロイだけで切り替えられます。
アプリケーションの再ビルドは不要です。

## ビジュアルウォークスルー {#visual-walkthrough}

ベースラインのトレース（エンリッチメント前）：スパンにヘッダー属性はありません。

![エンリッチされたヘッダーのない Jaeger ベースライントレース](v0-6-0-baseline.png)

OBI v0.7.0 でエンリッチメントを有効にした後：スパンにリクエストヘッダーコンテキストが含まれるようになりました。

![エンリッチされたリクエストヘッダー属性のある Jaeger トレース](v0-7-0-header-enrichment.png)

`authorization` が存在するもののマスクされていて、`x-tenant-id` と `x-user-segment` は可視のままであることに注目してください。

![難読化された authorization と含まれているテナントおよびセグメントヘッダーを示す Jaeger スパンタグ](v0-7-0-obfuscated-closeup.png)

エンリッチされた属性（たとえば `http.request.header.x-tenant-id`）でトレースをフィルタリングして、影響を受けたコホートに焦点を当てることができるようになりました。

![テナントトリアージのためにエンリッチされたヘッダー属性でフィルタリングした Jaeger トレース検索](v0-7-0-triage.png)

## まとめ {#takeaway}

OBI
[v0.7.0](https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation/releases/tag/v0.7.0) のヘッダーエンリッチメントは、実用的なデバッグ機能です。
インシデント対応のシグナルを改善し、ポリシーを明示的に保ち、OBI の設定変更のみでロールアウト（またはロールバック）できます。

すでに OBI を使っていますか？
v0.7.0 にアップグレードして、[ヘッダーエンリッチメント](/docs/zero-code/obi/configure/metrics-traces-attributes/#http-header-enrichment-for-spans)を試してみてください。

OBI が初めてですか？
[この投稿で使用したデモ](https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation/tree/b1f159092a3743464e53e78b16f0c4d817c47e02/examples/http-header-enrichment-demo)から始めて、エンドツーエンドの動作例を確認してください。
そして、アプリケーションで [OBI を使い始める方法](/docs/zero-code/obi/setup/)もぜひ確認してください。

すでにヘッダーエンリッチメントを試しましたか？
どうだったか教えてください。
[`#otel-ebpf-instrumentation` CNCF Slack チャンネル](https://cloud-native.slack.com/archives/C06DQ7S2YEP)で私たちを見つけるか、今後のリリースの改善に役立つフィードバックがあれば[ディスカッションを開いて](https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation/discussions)ください。
