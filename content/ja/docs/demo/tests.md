---
title: テスト
default_lang_commit: 99b15da7137cde4a6352576768f4c9203170d569
cSpell:ignore: Tracetest
---

現在、このリポジトリにはフロントエンドとバックエンドの両サービスのE2Eテストが含まれています。
フロントエンドでは、[Cypress](https://www.cypress.io/)を使用しており、Webストアの各フローを実行します。
一方、バックエンドサービスでは、統合テストのメインテストフレームワークとして[AVA](https://avajs.dev)を使用しており、トレースベースのテストには[Tracetest](https://tracetest.io/)を使用しています。

すべてのテストを実行する場合は、ルートディレクトリから `make run-tests` を実行します。

特定のテストスイートのみを実行したい場合は、テストの種類ごとに各種テストのコマンドを実行します[^1]:

- **フロントエンドのテスト**: `docker compose run frontendTests`
- **バックエンドのテスト**:
  - 統合テスト: `docker compose run integrationTests`
  - トレースベーステスト: `docker compose run traceBasedTests`

詳細な情報については、[Service Testing](https://github.com/open-telemetry/opentelemetry-demo/tree/main/test)を参照してください。

[^1]: `docker-compose` は非推奨です。詳細については、[Compose V2 への移行](https://docs.docker.com/compose/migrate/) を参照してください。
