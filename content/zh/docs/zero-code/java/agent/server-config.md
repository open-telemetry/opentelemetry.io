---
title: 应用服务器配置
linkTitle: 应用服务器配置
description: 如何为 Java 应用服务器定义代理路径
default_lang_commit: 086442fd859d3a316aac2b33aa7c97a4ac92079c
weight: 215
cSpell:ignore: asadmin Glassfish Payara setenv
---

在使用 Java 代理对运行在 Java 应用服务器上的应用程序进行插桩时，必须将 `javaagent` 路径添加到 JVM 参数中。
不同服务器的实现方法各不相同。

## JBoss EAP、WildFly {#jboss-eap-wildfly}

你可以在独立配置文件的末尾添加 `javaagent` 参数：

{{< tabpane text=true persist=lang >}}

{{% tab header="Linux" lang=Linux %}}

```sh
# 添加到 standalone.conf 中
JAVA_OPTS="$JAVA_OPTS -javaagent:/path/to/opentelemetry-javaagent.jar"
```

{{% /tab %}} {{% tab header="Windows" lang=Windows %}}

```bat
rem 添加到 standalone.conf 中
set "JAVA_OPTS=%JAVA_OPTS% -javaagent:<Drive>:\path\to\opentelemetry-javaagent.jar"
```

{{% /tab %}} {{< /tabpane >}}

## Jetty {#jetty}

要定义 Java 代理的路径，请使用 `-javaagent` 参数：

```shell
java -javaagent:/path/to/opentelemetry-javaagent.jar -jar start.jar
```

如果使用 `jetty.sh` 文件启动 Jetty，请将以下行添加到 `\<jetty_home\>/bin/jetty.sh` 文件中：

```shell
JAVA_OPTIONS="${JAVA_OPTIONS} -javaagent:/path/to/opentelemetry-javaagent.jar"
```

如果使用 start.ini 文件来定义 JVM 参数，请在 `--exec` 选项后添加 `javaagent` 参数：

```ini
#===========================================================
# Jetty 的 start.ini 文件示例
#-----------------------------------------------------------
--exec
-javaagent:/path/to/opentelemetry-javaagent.jar
```

## Glassfish、Payara {#glassfish-payara}

使用 `asadmin` 工具添加 Java 代理的路径：

{{< tabpane text=true >}} {{% tab Linux %}}

```sh
<server_install_dir>/bin/asadmin create-jvm-options "-javaagent\:/path/to/opentelemetry-javaagent.jar"
```

{{% /tab %}} {{% tab Windows %}}

```powershell
<server_install_dir>\bin\asadmin.bat create-jvm-options '-javaagent\:<Drive>\:\\path\\to\\opentelemetry-javaagent.jar'
```

{{% /tab %}} {{< /tabpane >}}

你也可以从管理控制台添加 `-javaagent` 参数。例如：

1.  在 <http://localhost:4848> 打开 GlassFish 管理控制台。
2.  转到 **Configurations > server-config > JVM Settings**。
3.  选择 **JVM Options > Add JVM Option**。
4.  输入代理的路径：
    `-javaagent:/path/to/opentelemetry-javaagent.jar`
5.  **Save** and restart the server.

确保你的域目录下的 domain.xml 文件中包含针对代理的 `<jmv-options>` 条目。

## Tomcat、TomEE {#tomcat-tomee}

将 Java 代理的路径添加到启动脚本中。配置方法取决于你的安装方式：

**对于包管理安装**（apt-get/yum），添加到 `/etc/tomcat*/tomcat*.conf`：

```sh
JAVA_OPTS="$JAVA_OPTS -javaagent:/path/to/opentelemetry-javaagent.jar"
```

**对于下载安装**，创建或修改 `<tomcat>/bin/setenv.sh`（Linux）或 `<tomcat>/bin/setenv.bat`（Windows）：

{{< tabpane text=true persist=lang >}}

{{% tab header="Linux" lang=Linux %}}

```sh
# 添加到 <tomcat_home>/bin/setenv.sh
CATALINA_OPTS="$CATALINA_OPTS -javaagent:/path/to/opentelemetry-javaagent.jar"
```

{{% /tab %}} {{% tab header="Windows" lang=Windows %}}

```bat
rem 添加到 <tomcat_home>\bin\setenv.bat
set CATALINA_OPTS=%CATALINA_OPTS% -javaagent:"<Drive>:\path\to\opentelemetry-javaagent.jar"
```

{{% /tab %}} {{< /tabpane >}}

**对于 Windows 服务安装**，使用 `<tomcat>/bin/tomcat*w.exe` 将 `-javaagent:<Drive>:\path\to\opentelemetry-javaagent.jar` 添加到 Java 选项的 Java 选项卡下。

## WebLogic {#weblogic}

将 Java 代理的路径添加到域启动脚本中：

{{< tabpane text=true persist=lang >}}

{{% tab header="Linux" lang=Linux %}}

```sh
# 添加到 <domain_home>/bin/startWebLogic.sh
export JAVA_OPTIONS="$JAVA_OPTIONS -javaagent:/path/to/opentelemetry-javaagent.jar"
```

{{% /tab %}} {{% tab header="Windows" lang=Windows %}}

```bat
rem 添加到 <domain_home>\bin\startWebLogic.cmd
set JAVA_OPTIONS=%JAVA_OPTIONS% -javaagent:"<Drive>:\path\to\opentelemetry-javaagent.jar"
```

{{% /tab %}} {{< /tabpane >}}

对于受管服务器实例，请通过管理控制台添加 `-javaagent` 参数。

## WebSphere Liberty Profile {#websphere-liberty-profile}

将 Java 代理的路径添加到 `jvm.options` 文件中。
对于单个服务器，编辑 `${server.config.dir}/jvm.options`，
对于所有服务器，编辑 `${wlp.install.dir}/etc/jvm.options`：

```ini
-javaagent:/path/to/opentelemetry-javaagent.jar
```

保存文件后重启服务器。

## WebSphere 传统版 {#websphere-traditional}

打开 WebSphere 管理控制台并执行以下步骤：

<!-- markdownlint-disable blanks-around-fences -->

1.  导航到 **Servers > Server type > WebSphere application servers**。
2.  选择服务器。
3.  转到 **Java and Process Management > Process Definition**。
4.  选择 **Java Virtual Machine**。
5.  在 **Generic JVM arguments** 中，输入代理的路径：
    `-javaagent:/path/to/opentelemetry-javaagent.jar`。
6.  保存配置并重启服务器。

## 启用预定义的 JMX 指标 {#enable-predefined-jmx-metrics}

Java 代理包含针对多个主流应用服务器的预定义 JMX 指标配置，但这些配置默认未启用。
若要启用预定义指标的采集，需将目标列表指定为 `otel.jmx.target.system` 系统属性的值。
例如：

```bash
$ java -javaagent:path/to/opentelemetry-javaagent.jar \
     -Dotel.jmx.target.system=jetty,tomcat \
     ... \
     -jar myapp.jar
```

以下是 `otel.jmx.target.system` 的已知应用服务器值：

- [`jetty`](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/instrumentation/jmx-metrics/library/jetty.md)
- [`tomcat`](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/instrumentation/jmx-metrics/library/tomcat.md)
- [`wildfly`](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/instrumentation/jmx-metrics/library/wildfly.md)

{{% alert title="注意" %}}

此列表并不全面，其他 JMX 目标系统也受支持。

{{% /alert %}}

有关从每个应用服务器提取的指标列表，请选择前面的名称，
或参考[其他详细信息和自定义功能](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/instrumentation/jmx-metrics#predefined-metrics)。
