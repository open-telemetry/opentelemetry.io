---
title: テスト
default_lang_commit: a44df6dd383b504864f60165b21459b7f5e005c5
cSpell:ignore: pytest
---

デモリポジトリには、2つのエンドツーエンドテストスイートが含まれており、どちらもルートディレクトリから `make` で実行します。

## フロントエンドテスト {#frontend-tests}

フロントエンドテストは [Cypress](https://www.cypress.io/) を使用して、ウェブストアの主要なフローを実行します。
ホームページの閲覧、商品ページの表示、チェックアウトの完了などが含まれます。
デモが起動した状態で実行します。

```shell
make run-frontend-tests
```

## テレメトリーテスト {#telemetry-tests}

テレメトリーテストは、コンテナ化された [pytest](https://docs.pytest.org/) スイートで、各サービスが想定どおりのシグナルを配信しているかを確認します。
サービスを直接検査するのではなく、デモに同梱されているバックエンドに問い合わせます。
トレースには Jaeger、メトリクスには Prometheus、ログには OpenSearch を使用します。
各サービスが出力するシグナルは [`test/telemetry/services.py`](https://github.com/open-telemetry/opentelemetry-demo/blob/main/test/telemetry/services.py) で宣言されています。

以下の各ターゲットはデモを起動し、スイートを実行した後、デモを停止します。
デモが停止した状態で実行してください。

```shell
make run-telemetry-tests           # すべてのサービス
make run-telemetry-tests-minimal   # ミニマルモードのみ
make run-telemetry-tests-agentic   # エージェント、MCP、チャットボット
```

詳細については、[Telemetry Sanity Tests](https://github.com/open-telemetry/opentelemetry-demo/tree/main/test/telemetry) を参照してください。
