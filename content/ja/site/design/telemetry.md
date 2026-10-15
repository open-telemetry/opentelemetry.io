---
title: ウェブサイトのテレメトリー
description: >-
  プロジェクトの Netlify サイトのすべてのデプロイでトレーサーを読み込み、ほかのデプロイでは読み込まない理由、コンテキスト伝搬に Zone
  を使わない理由、Collector がエクスポーターに追いついていないときにエクスポートの失敗がどう現れるかについて
weight: 30
default_lang_commit: cb07a7f2f522075ab85baaca6b23625cad38b30f
---

[ウェブサイトのテレメトリー](/site/features/#website-telemetry)機能の設計メモです。

## デプロイメントゲート {#deployment-gate}

トレーサーは[プロジェクトの Netlify サイトのすべてのデプロイ](/site/features/#website-telemetry)で読み込み、それ以外のデプロイでは読み込みません。
body-end パーシャルは、Netlify が設定するビルド変数 `SITE_NAME` でこのサイトを識別します。

- プレビューでもトレースする必要があります。
  Hugo の環境ではなくサイトそのものを条件にゲートするので、本番、デプロイプレビュー、ブランチデプロイがすべて同じ扱いになります。
  そのため、トレーシングへの変更はそのデプロイプレビューで確認できます。
- フォークではトレースしてはいけません。
  フォークを独自の Netlify サイトにデプロイすると `SITE_NAME` が変わるので、ゲートの仕組みは引き継がれても、トレーシングは有効になりません。
- これは単純なデプロイメントゲートです。
  Netlify が設定する値は変更できませんが、自分でビルドを管理している人なら任意の変数を設定できます。
  偽のテレメトリーをはじくのは Collector の役割であり、サイトの役割ではありません。
- `SITE_NAME` が未設定だとゲートは閉じたままになり、そのことを知らせるシグナルも出ません。
  Netlify のサイト名を変更した場合も、テンプレートを追従させるまでは同じ状態になります。
  ローカルビルドでは、この変数を設定すればトレーシングを有効にできます（[ビルドと配信](/site/build/npm-scripts/#build-and-serve)）。

## コンテキストマネージャー {#context-manager}

`ZoneContextManager` ではなく、`@opentelemetry/sdk-trace` パッケージの `StackContextManager` を使います。
`@opentelemetry/sdk-trace` は、JS SDK の [3.x 移行ガイド][3.x migration guide]が `sdk-trace-web` の後継として挙げているパッケージです。

- `zone.js` はブラウザーの一般的な非同期 API（`Promise`、タイマー、イベントリスナー）にパッチを当て、すべてのページに gzip 圧縮後で約 13 KB を上乗せします。
  コールバックを通じたコンテキスト伝搬は実際に機能しますが、ネイティブの `async`/`await` はまたげません。
  1ページあたりのフェッチが1、2回しかない静的サイトには不要です。

`await` の後やバインドされていないコールバックには、コンテキストは自動的には伝搬しません。
そこで開始したスパンは、コードが親コンテキストを明示的に渡さない限り、独立したルートスパンになります。
フェッチ計装は、プリフライトスパンに対してこの受け渡しを行っています。
このサイトのテレメトリーでは、それで問題ありません。

## Collector {#collector}

エクスポート先の Collector は、サイトとは管理者もリリースサイクルも異なります。
そのため Collector の OTLP バージョンはサイトのエクスポーターのバージョンに合わせて固定されておらず、エクスポーターをアップグレードすると、Collector がまだ受け付けないフィールドが送信される場合があります。
エクスポートが失敗しても、ページには影響しません。
SDK は失敗を報告しない（診断ロガーを設定していない）ので、失敗に気付く手がかりは、拒否されたリクエストをブラウザー自身が記録したものだけです。
これは DevTools のネットワークパネルで確認できます（Chromium ではコンソールにも出力されますが、Firefox では出力されません）。
コンソールエクスポーターが出力するスパンを見ても、Collector がそれを受け付けたかどうかはわかりません。

<!-- prettier-ignore-start -->
[3.x migration guide]: https://github.com/open-telemetry/opentelemetry-js/blob/main/doc/3.x/migration-guide.md#opentelemetrysdk-trace-web-package-removed
<!-- prettier-ignore-end -->
