---
title: はじめに
weight: 1
default_lang_commit: dabd30226437f71ca1eca69f9e8f04926a042bae
cSpell:ignore: Dotel
---

## セットアップ {#setup}

1.  `opentelemetry-java-instrumentation`リポジトリの [Releases][]から[opentelemetry-javaagent.jar][]をダウンロードし、任意のディレクトリに配置してください。この JAR ファイルにはエージェントと計装ライブラリが含まれています。
2.  JVM の起動引数に `-javaagent:path/to/opentelemetry-javaagent.jar` とその他の設定を追加し、アプリケーションを起動します。
    - 起動コマンドに直接指定する場合。

      ```shell
      java -javaagent:path/to/opentelemetry-javaagent.jar -Dotel.service.name=your-service-name -jar myapp.jar
      ```

    - `JAVA_TOOL_OPTIONS` やその他の環境変数を経由する場合。

      ```shell
      export JAVA_TOOL_OPTIONS="-javaagent:path/to/opentelemetry-javaagent.jar"
      export OTEL_SERVICE_NAME="your-service-name"
      java -jar myapp.jar
      ```

## 宣言的設定 {#declarative-configuration}

宣言的設定では、環境変数やシステムプロパティのかわりに YAML ファイルを使用します。
多くの設定オプションを指定する場合や、環境変数やシステムプロパティでは利用できない設定オプションを使用したい場合に便利です。

詳細については、[宣言的設定](../declarative-configuration)ページを参照してください。

## エージェントの設定 {#configuring-the-agent}

エージェントは高度にカスタマイズ可能です。

一つの選択肢は、設定プロパティを`-D`フラグを通じて渡すことです。
この例では、サービス名とトレース用の Zipkin エクスポーターを設定しています。

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

Javaプロパティファイルを指定して、そこから設定値を読み込むこともできます。

```sh
java -javaagent:path/to/opentelemetry-javaagent.jar \
     -Dotel.javaagent.configuration-file=path/to/properties/file.properties \
     -jar myapp.jar
```

または、以下のように設定もできます。

```sh
OTEL_JAVAAGENT_CONFIGURATION_FILE=path/to/properties/file.properties \
java -javaagent:path/to/opentelemetry-javaagent.jar \
     -jar myapp.jar
```

すべての設定オプションについては、[エージェント設定](../configuration)を参照してください。

## サポートされているライブラリ、フレームワーク、アプリケーションサービス、JVM {#supported-libraries-frameworks-application-services-and-jvms}

Java エージェントには、多くの人気なコンポーネント用の計装ライブラリが同梱されています。
すべてのリストについては、[サポートされているライブラリ、フレームワーク、アプリケーションサービス、JVM][support]を参照してください。

## トラブルシューティング {#troubleshooting}

{{% config_option name="otel.javaagent.debug" %}}

デバッグログを表示するには `true` に設定してください。ログは非常に詳細になることに注意してください。

{{% /config_option %}}

## 次のステップ {#next-steps}

アプリケーションやサービスの自動計装を設定した後、選択したメソッドに[アノテーション](../annotations)を付けたり、カスタムテレメトリーデータを収集するための[手動計装](/docs/languages/java/instrumentation/)を追加できます。

[opentelemetry-javaagent.jar]: https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/latest/download/opentelemetry-javaagent.jar
[releases]: https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases
[support]: https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/docs/supported-libraries.md
