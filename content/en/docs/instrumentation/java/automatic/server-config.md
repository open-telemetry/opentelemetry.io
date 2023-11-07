---
title: Application server configuration
linkTitle: App server config
description: Learn how to define agent paths for Java application servers
weight: 15
cSpell:ignore: asadmin binsetenv binstart Glassfish Payara setenv
---

When instrumenting an app that runs on a Java application server with a Java
agent, you must add the `javaagent` path to the JVM arguments. The way to do
this differs from server to server.

## JBoss EAP / WildFly

You can define the path to the Java agent by adding the `javaagent` argument to
the `JAVA_TOOL_OPTIONS` environment variable. For example:

{{< tabpane text=true persist=lang >}}

{{% tab header="Linux" lang=Linux %}}

```sh
export JAVA_TOOL_OPTIONS="-javaagent:/path/to/opentelemetry-javaagent.jar"
```

{{% /tab %}} {{% tab header="Windows" lang=Windows %}}

```bat
set JAVA_TOOL_OPTIONS="-javaagent:<Drive>:\path\to\opentelemetry-javaagent.jar"
```

{{% /tab %}} {{< /tabpane >}}

Alternatively, you can add the `javaagent` argument at the end of the standalone
configuration file:

{{< tabpane text=true persist=lang >}}

{{% tab header="Linux" lang=Linux %}}

```sh
# Add to standalone.conf
JAVA_OPTS="$JAVA_OPTS -javaagent:/path/to/opentelemetry-javaagent.jar"
```

{{% /tab %}} {{% tab header="Windows" lang=Windows %}}

```bat
rem Add to standalone.conf.bat
set "JAVA_OPTS=%JAVA_OPTS% -javaagent:<Drive>:\path\to\opentelemetry-javaagent.jar"
```

{{% /tab %}} {{< /tabpane >}}

## Jetty

To define the path to the Java agent, use the `-javaagent` argument:

```shell
java -javaagent:/path/to/opentelemetry-javaagent.jar -jar start.jar
```

If you use the `jetty.sh` file to start Jetty, add the following line to the
\<jetty_home\>/bin/jetty.sh file:

```shell
JAVA_OPTIONS="${JAVA_OPTIONS} -javaagent:/path/to/opentelemetry-javaagent.jar"
```

If you use the start.ini file to define JVM arguments, add the `javaagent`
argument after the `--exec` option:

```ini
#===========================================================
# Sample Jetty start.ini file
#-----------------------------------------------------------
--exec
-javaagent:/path/to/opentelemetry-javaagent.jar
```

## Glassfish / Payara

Add the path to the Java agent using the `asadmin` tool:

{{< tabpane text=true >}} {{% tab Linux %}}

```sh
<server_install_dir>/bin/asadmin create-jvm-options "-javaagent\:/path/to/opentelemetry-javaagent.jar"
```

{{% /tab %}} {{% tab Windows %}}

```powershell
<server_install_dir>\bin\asadmin.bat create-jvm-options '-javaagent\:<Drive>\:\\path\\to\\opentelemetry-javaagent.jar'
```

{{% /tab %}} {{< /tabpane >}}

You can also add the `-javaagent` argument from the Admin Console. For example:

1.  Open the GlassFish Admin Console at <http://localhost:4848>.
2.  Go to **Configurations > server-config > JVM Settings**.
3.  Select **JVM Options > Add JVM Option**.
4.  Enter the path to the agent:
    `-javaagent:/path/to/opentelemetry-javaagent.jar`
5.  **Save** and restart the server.

Make sure that the domain.xml file in your domain directory contains a
`<jmv-options>` entry for the agent.

## Tomcat / TomEE

Add the path to the Java agent to your startup script:

{{< tabpane text=true persist=lang >}}

{{% tab header="Linux" lang=Linux %}}

```sh
# Add to <tomcat_home>/bin/setenv.sh
CATALINA_OPTS="$CATALINA_OPTS -javaagent:/path/to/opentelemetry-javaagent.jar"
```

{{% /tab %}} {{% tab header="Windows" lang=Windows %}}

```bat
rem Add to <tomcat_home>\bin\setenv.bat
set CATALINA_OPTS=%CATALINA_OPTS% -javaagent:"<Drive>:\path\to\opentelemetry-javaagent.jar"
```

{{% /tab %}} {{< /tabpane >}}

## WebLogic

Add the path to the Java agent to your domain startup script:

{{< tabpane text=true persist=lang >}}

{{% tab header="Linux" lang=Linux %}}

```sh
# Add to <domain_home>/bin/startWebLogic.sh
export JAVA_OPTIONS="$JAVA_OPTIONS -javaagent:/path/to/opentelemetry-javaagent.jar"
```

{{% /tab %}} {{% tab header="Windows" lang=Windows %}}

```bat
rem Add to <domain_home>\bin\startWebLogic.cmd
set JAVA_OPTIONS=%JAVA_OPTIONS% -javaagent:"<Drive>:\path\to\opentelemetry-javaagent.jar"
```

{{% /tab %}} {{< /tabpane >}}

For managed server instances, add the `-javaagent` argument using the admin
console.

## WebSphere Liberty Profile

Add the path to the Java agent to the `jvm.options` file. For a single server,
edit `${server.config.dir}/jvm.options`, and for all servers, edit
`${wlp.install.dir}/etc/jvm.options`:

```ini
-javaagent:/path/to/opentelemetry-javaagent.jar
```

Restart the server after saving the file.

## WebSphere Traditional

Open the WebSphere Admin Console and follow these steps:

<!-- markdownlint-disable blanks-around-fences -->

1.  Navigate to **Servers > Server type > WebSphere application servers**.
2.  Select the server.
3.  Go to **Java and Process Management > Process Definition**.
4.  Select **Java Virtual Machine**.
5.  In **Generic JVM arguments**, enter the path to the agent:
    `-javaagent:/path/to/opentelemetry-javaagent.jar`.
6.  Save the configuration and restart the server.
