---
title: Конфігурація сервера застосунків
linkTitle: Конфігурація сервера застосунків
description: Дізнайтеся, як визначити шляхи агента для серверів застосунків Java
weight: 215
default_lang_commit: e05fefe6c9f7d8b159d9a9a95128098c646c78c4
cSpell:ignore: asadmin Glassfish Payara setenv
---

При інструментуванні застосунку, який працює на сервері застосунків Java з Java агентом, необхідно додати шлях `javaagent` до аргументів JVM. Спосіб зробити це відрізняється від сервера до сервера.

## JBoss EAP / WildFly

Ви можете додати аргумент `javaagent` в кінці файлу конфігурації standalone:

{{< tabpane text=true persist=lang >}}

{{% tab header="Linux" lang=Linux %}}

```sh
# Додати до standalone.conf
JAVA_OPTS="$JAVA_OPTS -javaagent:/path/to/opentelemetry-javaagent.jar"
```

{{% /tab %}} {{% tab header="Windows" lang=Windows %}}

```bat
rem Додати до standalone.conf.bat
set "JAVA_OPTS=%JAVA_OPTS% -javaagent:<Drive>:\path\to\opentelemetry-javaagent.jar"
```

{{% /tab %}} {{< /tabpane >}}

## Jetty

Щоб визначити шлях до Java агента, використовуйте аргумент `-javaagent`:

```shell
java -javaagent:/path/to/opentelemetry-javaagent.jar -jar start.jar
```

Якщо ви використовуєте файл `jetty.sh` для запуску Jetty, додайте наступний рядок до файлу `\<jetty_home\>/bin/jetty.sh`:

```shell
JAVA_OPTIONS="${JAVA_OPTIONS} -javaagent:/path/to/opentelemetry-javaagent.jar"
```

Якщо ви використовуєте файл start.ini для визначення аргументів JVM, додайте аргумент `javaagent` після опції `--exec`:

```ini
#===========================================================
# Приклад файлу Jetty start.ini
#-----------------------------------------------------------
--exec
-javaagent:/path/to/opentelemetry-javaagent.jar
```

## Glassfish / Payara

Додайте шлях до Java агента за допомогою інструменту `asadmin`:

{{< tabpane text=true >}} {{% tab Linux %}}

```sh
<server_install_dir>/bin/asadmin create-jvm-options "-javaagent\:/path/to/opentelemetry-javaagent.jar"
```

{{% /tab %}} {{% tab Windows %}}

```powershell
<server_install_dir>\bin\asadmin.bat create-jvm-options '-javaagent\:<Drive>\:\\path\\to\\opentelemetry-javaagent.jar'
```

{{% /tab %}} {{< /tabpane >}}

Ви також можете додати аргумент `-javaagent` з консолі адміністратора. Наприклад:

1.  Відкрийте консоль адміністратора GlassFish за адресою <http://localhost:4848>.
2.  Перейдіть до **Конфігурації > server-config > Налаштування JVM**.
3.  Виберіть **Опції JVM > Додати опцію JVM**.
4.  Введіть шлях до агента: `-javaagent:/path/to/opentelemetry-javaagent.jar`
5.  **Збережіть** і перезапустіть сервер.

Переконайтеся, що файл domain.xml у вашій теці домену містить запис `<jmv-options>` для агента.

## Tomcat / TomEE

Додайте шлях до Java агента до вашого стартового скрипту:

{{< tabpane text=true persist=lang >}}

{{% tab header="Linux" lang=Linux %}}

```sh
# Додати до <tomcat_home>/bin/setenv.sh
CATALINA_OPTS="$CATALINA_OPTS -javaagent:/path/to/opentelemetry-javaagent.jar"
```

{{% /tab %}} {{% tab header="Windows" lang=Windows %}}

```bat
rem Додати до <tomcat_home>\bin\setenv.bat
set CATALINA_OPTS=%CATALINA_OPTS% -javaagent:"<Drive>:\path\to\opentelemetry-javaagent.jar"
```

{{% /tab %}} {{< /tabpane >}}

## WebLogic

Додайте шлях до Java агента до вашого стартового скрипту домену:

{{< tabpane text=true persist=lang >}}

{{% tab header="Linux" lang=Linux %}}

```sh
# Додати до <domain_home>/bin/startWebLogic.sh
export JAVA_OPTIONS="$JAVA_OPTIONS -javaagent:/path/to/opentelemetry-javaagent.jar"
```

{{% /tab %}} {{% tab header="Windows" lang=Windows %}}

```bat
rem Додати до <domain_home>\bin\startWebLogic.cmd
set JAVA_OPTIONS=%JAVA_OPTIONS% -javaagent:"<Drive>:\path\to\opentelemetry-javaagent.jar"
```

{{% /tab %}} {{< /tabpane >}}

Для керованих екземплярів сервера додайте аргумент `-javaagent` за допомогою консолі адміністратора.

## WebSphere Liberty Profile

Додайте шлях до Java агента до файлу `jvm.options`. Для одного сервера редагуйте `${server.config.dir}/jvm.options`, а для всіх серверів редагуйте `${wlp.install.dir}/etc/jvm.options`:

```ini
-javaagent:/path/to/opentelemetry-javaagent.jar
```

Перезапустіть сервер після збереження файлу.

## WebSphere Traditional

Відкрийте консоль адміністратора WebSphere і виконайте наступні кроки:

<!-- markdownlint-disable blanks-around-fences -->

1.  Перейдіть до **Сервери > Тип сервера > Сервери застосунків WebSphere**.
2.  Виберіть сервер.
3.  Перейдіть до **Управління Java та процесами > Визначення процесу**.
4.  Виберіть **Віртуальна машина Java**.
5.  У **Загальні аргументи JVM** введіть шлях до агента: `-javaagent:/path/to/opentelemetry-javaagent.jar`.
6.  Збережіть конфігурацію і перезапустіть сервер.
