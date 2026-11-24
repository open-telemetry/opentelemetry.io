---
title: Web
description: >-
  ウェブブラウザ上で動作するアプリで OpenTelemetry を使う
default_lang_commit: da8c5447f8c016ed7dd05903cb169274ff5c1378
---

OpenTelemetry Browser は、ウェブアプリケーション向けの SDK と計装を提供します。
ブラウザイベントをログレコードとして、ネットワークリクエストをスパンとして収集するため、ブラウザの視点からアプリケーションで何が起きているかを調査できます。

> [!WARNING]
>
> Browser SDK と計装は実験的なものです。
> リリースには破壊的変更が含まれる場合があります。
> 現在のセットアップと設定については、[Browser リポジトリのドキュメント][browser]を参照してください。

## 機能 {#features}

- 個別の計装モジュールを使用して、ナビゲーションとリソースのタイミング、ユーザーアクション、エラー、コンソールイベント、Web Vitals を収集します。
- fetch と XMLHttpRequest のリクエストをトレースします。
- OTLP/HTTP 経由でログとトレースをエクスポートします。
- 設定可能なセッションでテレメトリーを関連付けます。

Browser SDK はログとトレースをサポートしています。
現時点ではメトリクス SDK は提供していません。

## はじめに {#getting-started}

ECMAScript モジュールをサポートするバンドラーを使用してください。
アプリケーションや他のライブラリがブラウザ API を変更する前に、ブラウザで初期化コードを実行してください。

### パッケージのインストール {#install-packages}

```sh
npm install @opentelemetry/browser-sdk @opentelemetry/browser-instrumentation @opentelemetry/api
```

### SDK の初期化 {#initialize-the-sdk}

初期化モジュールを作成し、アプリケーションのブラウザエントリポイントからインポートします。

```javascript
import { quickStartBrowserSdk } from '@opentelemetry/browser-sdk';
import { NavigationTimingInstrumentation } from '@opentelemetry/browser-instrumentation/experimental/navigation-timing';
import { FetchInstrumentation } from '@opentelemetry/browser-instrumentation/experimental/fetch';

const sdk = quickStartBrowserSdk({
  serviceName: 'my-web-app',
  serviceVersion: '1.0.0',
  exportUrl: 'http://localhost:4318',
  instrumentations: [
    new NavigationTimingInstrumentation(),
    new FetchInstrumentation(),
  ],
});
```

この例では、ナビゲーションタイミングをログレコードとして、fetch リクエストをスパンとして収集します。
SDK はそれらを `exportUrl` 配下の `/v1/logs` と `/v1/traces` に送信します。
デプロイ時にはローカルアドレスを OTLP/HTTP エンドポイントに置き換えてください。

CORS を使用して、アプリケーションのオリジンからのリクエストを受け付けるようにレシーバーを設定してください。
HTTPS アプリケーションには HTTPS テレメトリーエンドポイントも必要です。
[エクスポーターの設定](/docs/languages/js/exporters/#configure-cors-headers)を参照してください。
ブラウザコードで設定されたヘッダーはユーザーに見えるため、アプリケーションバンドルにプライベートな認証情報を含めないでください。

## 設定 {#configuration}

`quickStartBrowserSdk` はログとトレースの両方を設定します。
オプションは以下のとおりです。

| オプション         | 目的                                              |
| ------------------ | ------------------------------------------------- |
| `serviceName`      | テレメトリーを生成するアプリケーションの名前。    |
| `serviceVersion`   | アプリケーションのバージョン。                    |
| `exportUrl`        | ログとトレースのベース OTLP/HTTP エンドポイント。 |
| `exportHeaders`    | エクスポートリクエストに含めるヘッダー。          |
| `instrumentations` | 登録する計装インスタンス。                        |
| `enabled`          | `false` に設定すると計装なしで開始します。        |
| `logLevel`         | 診断ログレベル。                                  |

`logLevel` を `DEBUG` またはより詳細なレベルに設定すると、SDK がレシーバーへのエクスポートを続けつつ、ログレコードとスパンをブラウザコンソールにも出力します。
デフォルトのレベルは `INFO` です。

ユーザーの同意を待つには、`enabled` を `false` に設定します。
SDK は計装を有効にせずに起動され、ユーザーが選択を変更したときはアプリケーション側で `sdk.enable()` または `sdk.disable()` を呼び出してください。
手動で作成したスパンとログレコードは引き続きエクスポートされます。

カスタムリソース、プロセッサー、エクスポーター、またはシグナルごとの設定が必要な場合は、`startBrowserSdk` を使用してください。
このパッケージはログとトレースそれぞれに個別のエントリポイントも提供しています。
[SDK 設定リファレンス][sdk]を参照してください。

クロスオリジンのトレース伝搬はエクスポーターの CORS とは別に設定します。
トレースコンテキストを受け取るべき送信先に対して、fetch 計装に `propagateTraceHeaderCorsUrls` を設定し、それらのサーバーがトレースヘッダーを許可するよう設定してください。
利用可能なモジュールとそのオプションについては、[計装リファレンス][instrumentation]を参照してください。

## セッション {#sessions}

セッションは、一定期間のアクティビティにおけるスパンとログレコードを関連付けます。
セッションサポートは `@opentelemetry/browser-sdk/session` を通じて利用でき、セッションマネージャーとプロセッサーの設定が必要です。
`quickStartBrowserSdk` を単独で呼び出すだけではセッションは設定されません。

ローカルストレージを使うセッションストアは、ページを読み込んだ後もセッションを保持し、同一オリジンのタブ間で共有されます。
セッションマネージャーは最大期間と非アクティブタイムアウトを秒単位で受け付けます。
これらのタイムアウトにはデフォルト値がありません。
アクティビティは、生のクリックやマウスの動きではなく、セッションプロセッサーのアクセスを通じて測定されます。
セッション識別子は関連付けのためのものであり、認証のためのものではありません。

マネージャーを初期化し、エクスポートプロセッサーの前にセッションプロセッサーを登録するには、[セッション管理ガイド][sessions]に従ってください。
`startBrowserSdk` でカスタムプロセッサーを使用する場合は、そのガイドに示されているように各シグナルのエクスポートを設定してください。

## リソース {#resources}

- [OpenTelemetry Browser リポジトリ][browser]
- [Browser SDK の設定][sdk]
- [Browser 計装リファレンス][instrumentation]
- [セッション管理ガイド][sessions]
- [Browser ロードマップ][roadmap]

[browser]: https://github.com/open-telemetry/opentelemetry-browser
[sdk]: https://github.com/open-telemetry/opentelemetry-browser/blob/main/packages/sdk/README.md
[instrumentation]: https://github.com/open-telemetry/opentelemetry-browser/blob/main/packages/instrumentation/README.md
[sessions]: https://github.com/open-telemetry/opentelemetry-browser/blob/main/docs/session-management.md
[roadmap]: https://github.com/open-telemetry/opentelemetry-browser/blob/main/docs/roadmap.md
