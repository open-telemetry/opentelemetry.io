---
title: ウェブサイトテレメトリー
description: >-
  プロジェクトの Netlify サイトのデプロイごとにのみトレーサーを読み込む理由、コンテキスト伝搬が
  Zone を使わない理由、そして Collector がエクスポーターに追いつかない場合にエクスポート
  失敗がどのように現れるかについて
weight: 30
default_lang_commit: cb07a7f2f522075ab85baaca6b23625cad38b30f
---

[ウェブサイトテレメトリー](/site/features/#website-telemetry)機能の設計ノートです。

## デプロイメントゲート {#deployment-gate}

[プロジェクトの Netlify サイトのすべてのデプロイ](/site/features/#website-telemetry)に対してのみトレーサーを読み込み、それ以外のデプロイでは読み込みません。
body-end パーシャルは、Netlify が設定する `SITE_NAME` ビルド変数によってそのサイトを識別します。

- プレビューはトレースしなければなりません。
  Hugo 環境ではなくサイトの同一性に基づいてゲートすることで、本番環境、デプロイプレビュー、ブランチデプロイを同等に扱い、トレーシングへの変更がデプロイプレビューに反映されるようにします。
- フォークはトレースしてはなりません。
  独自の Netlify サイトにデプロイされたフォークは独自の `SITE_NAME` を持つため、ゲートは引き継がれますがトレーシングは引き継がれません。
- これは単純なデプロイメントゲートです。
  Netlify の値は変更できませんが、自分のビルドを制御できる人は任意の変数を設定できます。
  偽造されたテレメトリーを拒否するのは Collector の役割であり、サイトの役割ではありません。
- 未設定の `SITE_NAME` はシグナルなしでゲートを閉じます。
  Netlify のサイト名変更も、テンプレートが追従するまで同様になります。
  ローカルビルドでは変数を設定することでオプトインできます（[ビルドと配信](/site/build/npm-scripts/#build-and-serve)）。

## コンテキストマネージャー {#context-manager}

`ZoneContextManager` ではなく、JS SDK の [3.x 移行ガイド][3.x migration guide]が `sdk-trace-web` の後継として挙げている `@opentelemetry/sdk-trace` パッケージの `StackContextManager` を使用します。

- `zone.js` はブラウザーの一般的な非同期 API（`Promise`、タイマー、イベントリスナー）にパッチを当て、すべてのページに約 13 KB（gzip 圧縮後）を追加します。
  コールバックを介したコンテキスト伝搬は機能しますが、ネイティブの `async`/`await` をまたぐことはできず、ページあたり1つか2つのフェッチしかない静的サイトでは使い道がありません。

`await` やバインドされていないコールバックをまたいでコンテキストが自動的に伝搬されることはありません。
そこで開始されたスパンは、フェッチ計装がプリフライトスパンに対して行っているように、コードが親コンテキストを明示的に渡さない限り、独自のルートになります。
このサイトのテレメトリーではそれで問題ありません。

## Collector {#collector}

エクスポートの背後にある Collector はサイトとは異なるオーナーとリリーストレインを持つため、その OTLP バージョンはサイトのエクスポーターバージョンに固定されておらず、エクスポーターのアップグレードによって Collector がまだ受け付けないフィールドが送信される可能性があります。
エクスポートの失敗はページに影響しません。
SDK はそれを報告せず（診断ロガーは設定されていません）、唯一の兆候はブラウザー自体が記録する拒否されたリクエストの記録で、DevTools のネットワークパネルに表示されます（Chromium のコンソールもログに記録しますが、Firefox のコンソールは記録しません）。
コンソールエクスポーターが出力するスパンは、Collector がそれらを受け入れたかどうかについては何も示しません。

<!-- prettier-ignore-start -->
[3.x migration guide]: https://github.com/open-telemetry/opentelemetry-js/blob/main/doc/3.x/migration-guide.md#opentelemetrysdk-trace-web-package-removed
<!-- prettier-ignore-end -->
