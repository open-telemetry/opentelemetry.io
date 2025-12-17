---
title: Java エージェント
linkTitle: エージェント
aliases:
  - /docs/java/automatic_instrumentation
  - /docs/languages/java/automatic_instrumentation
redirects: [{ from: /docs/languages/java/automatic/*, to: ':splat' }]
default_lang_commit: 276d7eb3f936deef6487cdd2b1d89822951da6c8
---

Java でのゼロコード計装は、Java 8+ アプリケーションにアタッチされた Java エージェント JAR を使用します。
多くの一般的なライブラリやフレームワークからテレメトリーをキャプチャするために、動的にバイトコードを注入します。
これは、インバウンドリクエスト、アウトバウンド HTTP コール、データベースコールなど、アプリやサービスの「エッジ」でテレメトリーデータをキャプチャするために使用できます。
サービスやアプリのコードを手動で計装する方法については、[手動計装](/docs/languages/java/instrumentation/) を参照してください。
