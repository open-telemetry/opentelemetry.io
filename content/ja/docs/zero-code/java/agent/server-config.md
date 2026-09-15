---
title: アプリケーションサーバーの設定
linkTitle: アプリケーションサーバーの設定
description: Java アプリケーションサーバーのエージェントパスの定義方法を学ぶ
weight: 215
default_lang_commit: 669d1a40e56ed2dd914d48340b31e16a83610d40
cSpell:ignore: asadmin Glassfish Payara setenv wildfly
---

Java エージェントを使用して Java アプリケーションサーバー上で動作するアプリを計装する場合、JVM 引数に `javaagent` パスを追加する必要があります。
追加方法はサーバーによって異なります。

## JBoss EAP / WildFly {#jboss-eap--wildfly}

スタンドアロン設定ファイルの末尾に `javaagent` 引数を追加できます。

{{< tabpane text=true persist=lang >}}

{{% tab header="Linux" lang=Linux %}}

```sh
# standalone.conf に追加
JAVA_OPTS="$JAVA_OPTS -javaagent:/path/to/opentelemetry-javaagent.jar"
```

{{% /tab %}} {{% tab header="Windows" lang=Windows %}}

```bat
rem standalone.conf.bat に追加
set "JAVA_OPTS=%JAVA_OPTS% -javaagent:<Drive>:\path\to\opentelemetry-javaagent.jar"
```

{{% /tab %}} {{< /tabpane >}}

## Jetty {#jetty}

Java エージェントのパスを定義するには、`-javaagent` 引数を使用します。

```shell
java -javaagent:/path/to/opentelemetry-javaagent.jar -jar start.jar
```

`jetty.sh` ファイルを使って Jetty を起動する場合は、`\<jetty_home\>/bin/jetty.sh` ファイルに以下の行を追加します。

```shell
JAVA_OPTIONS="${JAVA_OPTIONS} -javaagent:/path/to/opentelemetry-javaagent.jar"
```

start.ini ファイルを使って JVM 引数を定義する場合は、`--exec` オプションの後に `javaagent` 引数を追加します。

```ini
#===========================================================
# Jetty start.ini ファイルのサンプル
#-----------------------------------------------------------
--exec
-javaagent:/path/to/opentelemetry-javaagent.jar
```

## Glassfish / Payara {#glassfish--payara}

`asadmin` ツールを使って Java エージェントのパスを追加します。

{{< tabpane text=true >}} {{% tab Linux %}}

```sh
<server_install_dir>/bin/asadmin create-jvm-options "-javaagent\:/path/to/opentelemetry-javaagent.jar"
```

{{% /tab %}} {{% tab Windows %}}

```powershell
<server_install_dir>\bin\asadmin.bat create-jvm-options '-javaagent\:<Drive>\:\\path\\to\\opentelemetry-javaagent.jar'
```

{{% /tab %}} {{< /tabpane >}}

管理コンソールから `-javaagent` 引数を追加することもできます。
たとえば、以下の手順で行います。

1.  <http://localhost:4848> で GlassFish 管理コンソールを開きます。
2.  **Configurations > server-config > JVM Settings** に移動します。
3.  **JVM Options > Add JVM Option** を選択します。
4.  エージェントのパスを入力します。
    `-javaagent:/path/to/opentelemetry-javaagent.jar`
5.  **Save** をクリックしてサーバーを再起動します。

ドメインディレクトリ内の domain.xml ファイルに、エージェントの `<jmv-options>` エントリーが含まれていることを確認してください。

## Tomcat / TomEE {#tomcat--tomee}

起動スクリプトに Java エージェントのパスを追加します。
設定方法はインストール方法によって異なります。

**パッケージマネージャーによるインストール**（apt-get/yum）の場合、`/etc/tomcat*/tomcat*.conf` に追加します。

```sh
JAVA_OPTS="$JAVA_OPTS -javaagent:/path/to/opentelemetry-javaagent.jar"
```

**ダウンロードによるインストール**の場合、`<tomcat>/bin/setenv.sh`（Linux）または `<tomcat>/bin/setenv.bat`（Windows）を作成または編集します。

{{< tabpane text=true persist=lang >}}

{{% tab header="Linux" lang=Linux %}}

```sh
# <tomcat_home>/bin/setenv.sh に追加
CATALINA_OPTS="$CATALINA_OPTS -javaagent:/path/to/opentelemetry-javaagent.jar"
```

{{% /tab %}} {{% tab header="Windows" lang=Windows %}}

```bat
rem <tomcat_home>\bin\setenv.bat に追加
set CATALINA_OPTS=%CATALINA_OPTS% -javaagent:"<Drive>:\path\to\opentelemetry-javaagent.jar"
```

{{% /tab %}} {{< /tabpane >}}

**Windows サービスとしてインストールした場合**は、`<tomcat>/bin/tomcat*w.exe` を使用し、Java タブの Java Options に `-javaagent:<Drive>:\path\to\opentelemetry-javaagent.jar` を追加します。

## WebLogic {#weblogic}

ドメインの起動スクリプトに Java エージェントのパスを追加します。

{{< tabpane text=true persist=lang >}}

{{% tab header="Linux" lang=Linux %}}

```sh
# <domain_home>/bin/startWebLogic.sh に追加
export JAVA_OPTIONS="$JAVA_OPTIONS -javaagent:/path/to/opentelemetry-javaagent.jar"
```

{{% /tab %}} {{% tab header="Windows" lang=Windows %}}

```bat
rem <domain_home>\bin\startWebLogic.cmd に追加
set JAVA_OPTIONS=%JAVA_OPTIONS% -javaagent:"<Drive>:\path\to\opentelemetry-javaagent.jar"
```

{{% /tab %}} {{< /tabpane >}}

マネージドサーバーインスタンスの場合は、管理コンソールから `-javaagent` 引数を追加します。

## WebSphere Liberty Profile {#websphere-liberty-profile}

`jvm.options` ファイルに Java エージェントのパスを追加します。
単一サーバーの場合は `${server.config.dir}/jvm.options` を、すべてのサーバーの場合は `${wlp.install.dir}/etc/jvm.options` を編集します。

```ini
-javaagent:/path/to/opentelemetry-javaagent.jar
```

ファイルを保存した後、サーバーを再起動します。

## WebSphere Traditional {#websphere-traditional}

WebSphere 管理コンソールを開き、以下の手順に従います。

<!-- markdownlint-disable blanks-around-fences -->

1.  **Servers > Server type > WebSphere application servers** に移動します。
2.  サーバーを選択します。
3.  **Java and Process Management > Process Definition** に移動します。
4.  **Java Virtual Machine** を選択します。
5.  **Generic JVM arguments** にエージェントのパスを入力します。
    `-javaagent:/path/to/opentelemetry-javaagent.jar`
6.  設定を保存してサーバーを再起動します。

## 事前定義済み JMX メトリクスの有効化 {#enable-predefined-jmx-metrics}

Java エージェントには、いくつかの一般的なアプリケーションサーバー向けに事前定義済みの JMX メトリクス設定が含まれていますが、デフォルトでは有効になっていません。
事前定義済みメトリクスの収集を有効にするには、`otel.jmx.target.system` システムプロパティの値にターゲットのリストを指定します。
たとえば、以下のように指定します。

```bash
$ java -javaagent:path/to/opentelemetry-javaagent.jar \
     -Dotel.jmx.target.system=jetty,tomcat \
     ... \
     -jar myapp.jar
```

`otel.jmx.target.system` に指定できるアプリケーションサーバーの値は以下のとおりです。

- [`jetty`](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/instrumentation/jmx-metrics/library/jetty.md)
- [`tomcat`](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/instrumentation/jmx-metrics/library/tomcat.md)
- [`wildfly`](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/instrumentation/jmx-metrics/library/wildfly.md)

> [!NOTE]
>
> このリストは網羅的ではなく、他の JMX ターゲットシステムもサポートされています。

各アプリケーションサーバーから抽出されるメトリクスのリストについては、上記のリンクを選択するか、[Additional details and customization capabilities](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/instrumentation/jmx-metrics#predefined-metrics) を参照してください。
