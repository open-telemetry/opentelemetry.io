---
title: フィーチャーフラグ
aliases:
  - feature_flags
  - services/feature-flag
  - services/featureflagservice
default_lang_commit: 24146bd1368e4c6082c7d6077efd29dba0d51055
cSpell:ignore: loadgenerator OLJCESPC7Z
---

デモは、異なるシナリオのシミュレートするために利用可能ないくつかのフィーチャーフラグを提供しています。
これらのフラグは、[OpenFeature](https://openfeature.dev) をサポートするシンプルなフィーチャーフラグサービスの [`flagd`](https://flagd.dev) によって管理されます。

フラグの値は、デモを起動している際に、<http://localhost:8080/feature> で提供されるユーザーインターフェースを通じて変更できます。
このユーザーインターフェースを通じて値を変更すると、flagd サービスに反映されます。

ユーザーフラグを通じたフィーチャーフラグの変更する場合、2 つのオプションがあります。

- **ベーシックビュー**: 各フィーチャーフラグに対して、デフォルトのバリエーション（生のファイルで構成するときに変更する必要がある同じオプション）を選択して保存できるユーザーフレンドリーなビュー。 現在、ベーシックビューは部分ターゲティングはサポートされていません。
- **アドバンスドビュー**: 読み込んでブラウザで編集可能な生の JSON 設定ファイルのビュー。 このビューは生の JSON ファイルを編集できるという柔軟性を提供しますが、JSON が有効であり、入力された設定値が正しいかを保証するスキーマチェックも提供します。

## 実装済みフィーチャーフラグ {#implemented-feature-flags}

| フューチャーフラグ                  | サービス                   | 説明                                                                                                                                 |
| ----------------------------------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `adServiceFailure`                  | 広告サービス               | 10分の1の確率で `GetAds` のエラーを生成します                                                                                        |
| `adServiceManualGc`                 | 広告サービス               | 広告サービスで完全手動のガベージコレクションを引き起こします                                                                         |
| `adServiceHighCpu`                  | 広告サービス               | 広告サービスで CPU を高負荷にします。 CPU スロットリングをデモしたい場合は、CPUリソース制限を設定します                              |
| `cartServiceFailure`                | カートサービス             | `EmptyCart` が呼び出されるたびにエラーを生成します                                                                                   |
| `productCatalogFailure`             | 商品カタログサービス       | 商品 ID: `OLJCESPC7Z` の `GetProduct` リクエストに対してエラーを生成します                                                           |
| `recommendationServiceCacheFailure` | レコメンデーションサービス | 指数関数的に増大するキャッシュによりメモリリークが発生します。 1.4 倍のペースで増加し、とリクエストの 50% がその増加を引き起こします |
| `paymentServiceFailure`             | 支払いサービス             | `charge` メソッドを呼び出すときに、エラーを発生させます                                                                              |
| `paymentServiceUnreachable`         | 決済サービス               | 支払いサービスを呼び出すときに支払いサービスが利用できないように見せるために、不正アドレスを使用します                               |
| `loadgeneratorFloodHomepage`        | 負荷生成ツール             | 大量のリクエストでホームページにフラッディングを開始します。 これは状態である flagd JSON の変更で設定可能です                        |
| `kafkaQueueProblems`                | キュー                     | Kafka キューに過負荷がかかり、同時にコンシューマー側の遅延も発生し、ラグの急増を引き起こします                                       |
| `imageSlowLoad`                     | フロントエンド             | Envoy フォールトインジェクションを利用し、フロントエンドでの製品画像の読み込みに遅延を発生させます                                   |

## フューチャーフラグアーキテクチャ {#feature-flag-architecture}

flagd の動作の詳細については [flagd documentation](https://flagd.dev) を、OpenFeature の動作の詳細については [OpenFeature](https://openfeature.dev) と OpenFeature API を参照してください。
