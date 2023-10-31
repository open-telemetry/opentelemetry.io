---
title: Configuring application servers
description: Learn how to define agent paths for Java application servers
weight: 15
cSpell:ignore: Glassfish Payara asadmin setenv binsetenv binstart
---

When instrumenting an application running on an application server, you've to
define the path to the OpenTelemetry Java agent. The way to define the path
differs from server to server.

## JBoss EAP / WildFly

To define the path to the Java agent, add the `javaagent` argument at the end of
the `standalone.conf` or the `standalone.conf.bat` configuration files:

```shell
# Linux / standalone.conf
JAVA_OPTS="$JAVA_OPTS -javaagent:/path/to/opentelemetry-javaagent.jar"

# Windows / standalone.conf.bat
set "JAVA_OPTS=%JAVA_OPTS% -javaagent:<Drive>:\path\to\opentelemetry-javaagent.jar"
```

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

```shell
#===========================================================
# Sample Jetty start.ini file
#-----------------------------------------------------------
--exec
-javaagent:/path/to/opentelemetry-javaagent.jar
```

## Glassfish / Payara

Add the path to the Java agent using the `asadmin` tool:

```shell
# Linux
<server_install_dir>/bin/asadmin create-jvm-options "-javaagent\:/path/to/opentelemetry-javaagent.jar"

# Windows
<server_install_dir>\bin\asadmin.bat create-jvm-options '-javaagent\:<Drive>\:\\path\\to\\opentelemetry-javaagent.jar'
```

You can also add the `-javaagent` argument from the Admin Console. For example:

1.  Open the GlassFish Admin Console at `http://localhost:4848`.

2.  Go to **Configurations > server-config > JVM Settings**.

3.  Select **JVM Options > Add JVM Option**.

4.  Enter the path to the agent:

    `-javaagent:/path/to/opentelemetry-javaagent.jar`

5.  **Save** and restart the server.

Make sure that the domain.xml file in your domain directory contains a
`<jmv-options>` entry for the agent.

## Tomcat / TomEE

Add the path to the Java agent to your startup script:

```shell
# Linux: Add the following line to \<tomcat_home\>/bin/setenv.sh
CATALINA_OPTS="$CATALINA_OPTS -javaagent:/path/to/opentelemetry-javaagent.jar"

# Windows: Add the following line to \<tomcat_home\>binsetenv.bat
set CATALINA_OPTS=%CATALINA_OPTS% -javaagent:"<Drive>:\path\to\opentelemetry-javaagent.jar"
```

## WebLogic

Add the path to the Java agent to your domain startup script:

```shell
# Linux: Add the following line to \<domain_home\>/bin/startWebLogic.sh
export JAVA_OPTIONS="$JAVA_OPTIONS -javaagent:/path/to/opentelemetry-javaagent.jar"

# Linux: Add the following line to \<domain_home\>binstartWebLogic.cmd
set JAVA_OPTIONS=%JAVA_OPTIONS% -javaagent:"<Drive>:\path\to\opentelemetry-javaagent.jar"
```

For managed server instances, add the `-javaagent` argument using the admin
console.

## WebSphere Liberty Profile

Add the path to the Java agent to the `jvm.options` file:

```shell
# Single server: Edit ${server.config.dir}/jvm.options
# All servers: Edit ${wlp.install.dir}/etc/jvm.options
-javaagent:/path/to/opentelemetry-javaagent.jar
```

Restart the server after saving the file.

## WebSphere Traditional

Open the WebSphere Admin Console and follow these steps:

1.  Navigate to **Servers > Server type > WebSphere application servers**.

2.  Select the server.

3.  Go to **Java and Process Management > Process Definition**.

4.  Select **Java Virtual Machine**.

5.  In **Generic JVM arguments**, enter the path to the agent:

    ```bash
    -javaagent:/path/to/opentelemetry-javaagent.jar
    ```

6.  Save the configuration and restart the server.
