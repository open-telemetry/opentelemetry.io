---
title: OpenTelemetry で Spring ネイティブイメージアプリケーションを観測する
linkTitle: Spring ネイティブの観測
date: 2023-12-08
author: >-
  [Jean Bisutti](https://github.com/jeanbisutti) (Microsoft)
default_lang_commit: 145fd1194b631f2292d816d4d65d26b6c5a4aebd
cSpell:ignore: bisutti datasource
---

[OpenTelemetry Java エージェント](/docs/zero-code/java/agent/)は、Java アプリケーションを計装する便利で確立された方法です。
しかし、現時点では [GraalVM ネイティブイメージでは使用できません](https://github.com/oracle/graal/issues/1065)。

それにもかかわらず、Spring Boot ネイティブイメージアプリケーションのための簡単でシームレスな方法を提供するために、OpenTelemetry Java のコントリビューターは既存の OpenTelemetry Spring Boot スターターを改善し、Spring Boot ネイティブイメージアプリケーションで適切に動作するようにしました。
詳しくはこの先をお読みください！

## ここ数か月の歴史 {#a-history-of-the-last-months}

OpenTelemetry Spring Boot スターターを使うと、バイトコード計装なしでアプリケーションに OpenTelemetry を追加できます。
OpenTelemetry Java のコントリビューターは、これを利用して Spring Boot ネイティブイメージを計装しました。
プロジェクトにスターターの依存関係を追加するだけで、ログ（ここ数か月で追加されたもの）、スパン、メトリクスの OTLP エクスポートと、Spring HTTP フレームワークの自動計装（ここ数か月で Spring Boot 3 で動作するよう更新されたもの）をすぐに利用できます。

```xml
<dependencies>
  <dependency>
    <groupId>io.opentelemetry.instrumentation</groupId>
    <artifactId>opentelemetry-spring-boot-starter</artifactId>
    <version>1.32.0-alpha</version>
  </dependency>
</dependencies>
```

さらに可視性を高めるために、スターターは[計装ライブラリ](/docs/languages/java/instrumentation/)と組み合わせることができます。
この目的のために、OpenTelemetry Java のコントリビューターは JDBC（データベース）ライブラリとロギング計装ライブラリを改善しました。
たとえば、Logback ロギングライブラリについては、ネイティブモードでライブラリが動作するよう GraalVM 設定を追加しました[^1]。

さらに、スターターでのロギングおよびデータベース計装のセットアップに必要な設定を削減する作業も行いました。
たとえば、アプリケーションが DataSource Bean を宣言していない場合、`application.properties` ファイルに2つのプロパティを追加するだけでデータベース計装を有効にできます。

```properties
spring.datasource.url=jdbc:otel:h2:mem:db
spring.datasource.driver-class-name=io.opentelemetry.instrumentation.jdbc.OpenTelemetryDriver
```

詳しくは、[Spring Boot スターター](/docs/zero-code/java/spring-boot-starter/)をご覧ください。
[opentelemetry-java-examples/spring-native](https://github.com/open-telemetry/opentelemetry-java-examples/tree/6f6e932bbeb8f7826dfe2ade71c901271ea76091/spring-native?from_branch=main) を使って Spring Boot ネイティブイメージアプリケーションを実行し、生成されたログや HTTP およびデータベースのテレメトリーデータを確認できます。

最後に、OpenTelemetry Java のコントリビューターは、ネイティブモード実行に関連するリグレッションを検出するために、OpenTelemetry Java プロジェクトに GraalVM ネイティブの自動テストを追加しました。

## 次のステップ {#whats-next}

OpenTelemetry Java のコントリビューターは、ロギングおよびデータベースの計装設定の自動化を実現できると期待しています。

OpenTelemetry Spring Boot スターターを試してみた方は、[GitHub ディスカッション](https://github.com/open-telemetry/opentelemetry-java/discussions)や [#otel-java](https://cloud-native.slack.com/archives/C014L2KCTE3) [CNCF Slack](https://slack.cncf.io) チャンネルで、感想や体験をぜひ共有してください。

[^1]: Spring Boot ネイティブイメージアプリケーションは [Log4j2 ロギングライブラリをサポートしていません](https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-with-GraalVM)。
