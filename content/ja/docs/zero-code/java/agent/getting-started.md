---
title: はじめに
weight: 1
default_lang_commit: 276d7eb3f936deef6487cdd2b1d89822951da6c8
cSpell:ignore: Dotel myapp
---

## セットアップ {#setup}

1.  `opentelemetry-java-instrumentation` リポジトリの [Releases][] から[opentelemetry-javaagent.jar][] をダウンロードし、任意のディレクトリにJAR ファイルを配置します。JAR ファイルには、エージェントと計装ライブラリが含まれています。
2.  JVM 起動引数に `-javaagent:path/to/opentelemetry-javaagent.jar` とその他の設定を追加して、アプリケーションを起動します。
    - 起動コマンドで直接指定する場合。

      ```shell
      java -javaagent:path/to/opentelemetry-javaagent.jar -Dotel.service.name=your-service-name -jar myapp.jar
      ```

    - `JAVA_TOOL_OPTIONS` およびその他の環境変数を使用する場合。

      ```shell
      export JAVA_TOOL_OPTIONS="-javaagent:path/to/opentelemetry-javaagent.jar"
      export OTEL_SERVICE_NAME="your-service-name"
      java -jar myapp.jar
      ```

## 宣言的設定 {#declarative-configuration}

宣言的設定では、環境変数やシステムプロパティのかわりに YAML ファイルを使用します。
これは、設定オプションが多数ある場合や、環境変数やシステムプロパティで利用できない設定オプションを使用したい場合に便利です。

詳細については、[宣言的設定](../declarative-configuration) ページを参照してください。

## エージェントの設定 {#configuring-the-agent}

エージェントは高度に設定可能です。

設定プロパティを `-D` フラグで渡す方法があります。
この例では、サービス名とトレース用の Zipkin エクスポーターが設定されています。

```sh
java -javaagent:path/to/opentelemetry-javaagent.jar \
     -Dotel.service.name=your-service-name \
     -Dotel.traces.exporter=zipkin \
     -jar myapp.jar
```

環境変数を使用してエージェントを設定することもできます。

```sh
OTEL_SERVICE_NAME=your-service-name \
OTEL_TRACES_EXPORTER=zipkin \
java -javaagent:path/to/opentelemetry-javaagent.jar \
     -jar myapp.jar
```

Java プロパティファイルを提供し、そこから設定値を読み込むこともできます。

```sh
java -javaagent:path/to/opentelemetry-javaagent.jar \
     -Dotel.javaagent.configuration-file=path/to/properties/file.properties \
     -jar myapp.jar
```

または、以下でも実装できます。

```sh
OTEL_JAVAAGENT_CONFIGURATION_FILE=path/to/properties/file.properties \
java -javaagent:path/to/opentelemetry-javaagent.jar \
     -jar myapp.jar
```

設定オプションの全範囲については、[エージェント設定](../configuration) を参照してください。

## サポートされているライブラリ、フレームワーク、アプリケーションサービス、JVM {#supported-libraries-frameworks-application-services-and-jvms}

Java エージェントには、多くの一般的なコンポーネント用の計装ライブラリが同梱されています。
完全なリストについては、[サポートされているライブラリ、フレームワーク、アプリケーションサービス、JVM][support]を参照してください。

## トラブルシューティング {#troubleshooting}

{{% config_option name="otel.javaagent.debug" %}}

`true` に設定すると、デバッグログが表示されます。
これらはかなり詳細であることに注意してください。

{{% /config_option %}}

## 次のステップ {#next-steps}

アプリケーションやサービスの自動計装を設定した後、選択したメソッドに [アノテーション](../annotations) を付けたり、カスタムテレメトリーデータを収集するための[手動計装](/docs/languages/java/instrumentation/) を追加したりすることができます。

[opentelemetry-javaagent.jar]: https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/latest/download/opentelemetry-javaagent.jar
[releases]: https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases
[support]: https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/docs/supported-libraries.md
