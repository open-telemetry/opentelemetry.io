---
title: サポートされているライブラリ
description: すぐに使える計装済みのライブラリとフレームワーク。
weight: 10
default_lang_commit: c9a73abce6f8c4b1ee1bdb244ed1ce6ce7192f04
# prettier-ignore
cSpell:ignore: anthropics gonic logrus openai runtimemetrics segmentio sirupsen
---

このツールは、以下のライブラリとフレームワーク用の計装パッケージを提供しています。
アプリケーションまたはその依存関係がこれらのいずれかを使用している場合、対応する計装がビルド時に自動的に注入されます。

| ライブラリまたはフレームワーク | インポートパス                           | 計装対象の操作                       |
| ------------------------------ | ---------------------------------------- | ------------------------------------ |
| HTTP（標準ライブラリ）         | `net/http`                               | クライアントおよびサーバーリクエスト |
| gRPC                           | `google.golang.org/grpc`                 | クライアントおよびサーバー呼び出し   |
| SQL データベース               | `database/sql`                           | データベース呼び出し                 |
| Gin                            | `github.com/gin-gonic/gin`               | サーバーリクエスト                   |
| Redis                          | `github.com/redis/go-redis/v9`           | クライアントコマンド                 |
| MongoDB                        | `go.mongodb.org/mongo-driver/mongo`      | クライアントコマンド                 |
| Kafka                          | `github.com/segmentio/kafka-go`          | 生産および消費されるメッセージ       |
| OpenAI                         | `github.com/openai/openai-go`（v1 – v3） | クライアント呼び出し                 |
| Anthropic                      | `github.com/anthropics/anthropic-sdk-go` | クライアント呼び出し                 |
| Kubernetes クライアント        | `k8s.io/client-go/tools/cache`           | Informer キャッシュ操作              |
| slog（標準ライブラリ）         | `log/slog`                               | ログレコード                         |
| Logrus                         | `github.com/sirupsen/logrus`             | ログレコード                         |

HTTP と gRPC の計装はスパンとメトリクスを生成し、サービス間の自動的な[コンテキスト伝搬](/docs/concepts/context-propagation/)を含みます。
計装は各ライブラリの OpenTelemetry [セマンティック規約](/docs/specs/semconv/)に従います。
Go ランタイムメトリクスはデフォルトで収集され、`OTEL_GO_DISABLED_INSTRUMENTATIONS` に `runtimemetrics` を追加することで無効にできます。

サポートされるライブラリバージョンのセットは、各計装のルールによって宣言されています。
最新の正確なリストについては、リポジトリの[計装パッケージ](https://github.com/open-telemetry/opentelemetry-go-compile-instrumentation/tree/main/instrumentation)を参照してください。

## ライブラリのリクエスト {#requesting-a-library}

使用しているライブラリがまだ計装されていない場合は、[フィーチャーリクエスト](https://github.com/open-telemetry/opentelemetry-go-compile-instrumentation/issues)を作成してください。
自分で計装を追加することもできます。
リポジトリの[計装ガイド](https://github.com/open-telemetry/opentelemetry-go-compile-instrumentation/blob/main/docs/instrument-guide.md)で、新しいライブラリのルール定義とフックの実装方法を説明しています。
