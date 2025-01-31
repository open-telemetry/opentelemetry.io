---
title: フィーチャーフラグ
aliases:
  - feature_flags
  - services/feature-flag
  - services/featureflagservice
cSpell:ignore: loadgenerator OLJCESPC7Z
default_lang_commit: e3ae3a294873ef7febe106a618e650872f4d1796
---

デモは、異なるシナリオのシミュレートするために利用できるいくつかのフィーチャーフラグを提供しています。
これらのフラグは、[OpenFeature](https://openfeature.dev) をサポートするシンプルなフィーチャーフラグサービスの [`flagd`](https://flagd.dev) によって管理されます。

フラグの値は、デモを起動している際に、<http://localhost:8080/feature> で提供されるユーザーインターフェースを通じて変更できます。
このユーザーインターフェースを通じて値を変更すると、flagd サービスに反映されます。

ユーザーフラグを通じたフィーチャーフラグの変更する場合、2 つのオプションがあります。

- **ベーシックビュー**: 各フィーチャーフラグに対して、デフォルトのバリエーション（生のファイルで構成するときに変更する必要がある同じオプション）を選択して保存できるユーザーフレンドリーなビュー。現在、ベーシックビューは部分ターゲティングはサポートされていません。
- **アドバンスドビュー**: 読み込んでブラウザで編集可能な生の JSON 設定ファイルのビュー。このビューは生の JSON ファイルを編集できるという柔軟性を提供しますが、JSON が有効であり、入力された設定値が正しいかを保証するスキーマチェックも提供します。

## 実装済みフィーチャーフラグ

| フューチャーフラグ                  | サービス                   | 説明                                                                                                           |
| ----------------------------------- | -------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `adServiceFailure`                  | 広告サービス               | 10分の1の確率で `GetAds` のエラーを生成する                                                                    |
| `adServiceManualGc`                 | 広告サービス               | 広告サービスで完全手動のガベージコレクションを引き起こす                                                       |
| `adServiceHighCpu`                  | 広告サービス               | 広告サービスでCPU負荷を高くします。CPUスロットリングをデモしたい場合は、CPUリソース制限を設定します            |
| `cartServiceFailure`                | カートサービス             | `EmptyCart` が呼び出されるたびにエラーを生成する                                                               |
| `productCatalogFailure`             | 商品カタログサービス       | 製品 ID: `OLJCESPC7Z` の `GetProduct` リクエストに対してエラーを生成する                                       |
| `recommendationServiceCacheFailure` | レコメンデーションサービス | 指数関数的に増大するキャッシュによりメモリリークが発生する。 1.4 倍の増大とリクエストの 50% が増大を引き起こす |
| `paymentServiceFailure`             | 支払いサービス             | `charge` メソッドを呼び出すときに、エラーを発生させる                                                          |
| `paymentServiceUnreachable`         | 決済サービス               | 支払いサービスを呼び出すときに支払いサービスが利用できないように見せるために、不正アドレスを使用する           |
| `loadgeneratorFloodHomepage`        | 負荷生成ツール             | 大量のリクエストでホームページにフラッディングを開始します。これは状態である flagd JSON の変更で設定可能       |
| `kafkaQueueProblems`                | キュー                     | Kafka キューに過負荷がかかり、同時にコンシューマー側の遅延も発生し、ラグの急増を引き起こす                     |
| `imageSlowLoad`                     | フロントエンド             | Envoy フォールトインジェクションを利用し、フロントエンドでの製品画像の読み込みに遅延を発生させる               |

## フューチャーフラグアーキテクチャ

flagd の動作の詳細については [flagd documentation](https://flagd.dev) を、OpenFeature の動作の詳細については [OpenFeature](https://openfeature.dev) と OpenFeature API を参照してください、
