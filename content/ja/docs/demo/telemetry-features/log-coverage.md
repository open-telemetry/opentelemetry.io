---
title: サービス別ログカバレッジ
linkTitle: ログカバレッジ
aliases: [log_service_features, logging-features, ../logging-features]
default_lang_commit: ec0a1a501eb7321af7150f534d8339cd22f23a8a
---

| サービス               | 言語       | OTLP ログ |
| ---------------------- | ---------- | --------- |
| 会計                   | .NET       | ✅        |
| 広告                   | Java       | ✅        |
| エージェント           | Python     | 🚧        |
| カート                 | .NET       | ✅        |
| チャットボット         | Python     | 🚧        |
| 決済                   | Go         | ✅        |
| 通貨                   | C++        | ✅        |
| メール                 | Ruby       | ✅        |
| Flagd                  | Go         | 🚧        |
| Flagd-ui               | Elixir     | 🚧        |
| 不正検知               | Kotlin     | ✅        |
| フロントエンド         | TypeScript | ✅        |
| フロントエンドプロキシ | Envoy      | ✅        |
| 画像プロバイダー       | NGINX      | 🚧        |
| 負荷生成ツール         | Python     | ✅        |
| MCP                    | Python     | 🚧        |
| 支払い                 | JavaScript | ✅        |
| 商品カタログ           | Go         | ✅        |
| 見積サービス           | PHP        | ✅        |
| レコメンデーション     | Python     | ✅        |
| 配送                   | Rust       | ✅        |

フロントエンドのログカバレッジはサーバー（`frontend`）に適用されます。
ブラウザの計装（`frontend-web`）は OTLP ログをエクスポートしません。

絵文字の凡例：

- 対応済み：✅
- 該当なし：🔕
- 未対応：🚧
