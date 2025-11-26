---
title: Spring Boot スターター
aliases:
  - /docs/languages/java/spring-boot
  - /docs/languages/java/automatic/spring-boot
  - /docs/zero-code/java/agent/spring-boot
  - /docs/zero-code/java/spring-boot
default_lang_commit: 68e94a4555606e74c27182b79789d46faf84ec25
---

[Spring Boot](https://spring.io/projects/spring-boot) アプリケーションを OpenTelemetry で計装するには、2つのオプションを使用できます。

1. Spring Bootアプリケーションを計装するためのデフォルトの選択肢は、バイトコード計装を使用した [**OpenTelemetry Java エージェント**](../agent) です。
   - OpenTelemetryスターターよりも**すぐに使用できる計装機能**
2. **OpenTelemetry Spring Boot スターター**は以下の場合に役立ちます。
   - OpenTelemetry Javaエージェントが動作しない**Spring Bootネイティブイメージ**アプリケーション
   - OpenTelemetry Javaエージェントの**起動オーバーヘッド**が要件を超えている場合
   - OpenTelemetry Javaエージェントが他のエージェントと動作しない可能性があるため、Java 監視エージェントがすでに使用されている場合
   - OpenTelemetry Javaエージェントでは動作しないOpenTelemetry Spring Bootスターターを設定するための**Spring Boot 設定ファイル**(`application.properties`、`application.yml`)
