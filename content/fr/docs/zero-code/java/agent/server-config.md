---
title: Configuration du serveur d'application
linkTitle: Configuration du serveur d'application
description:
  Apprenez à définir les chemins d'agent pour les serveurs d'applications Java
weight: 215
default_lang_commit: 6bf06ddb9fc057dd6e8092f26d988ffe7b1af5ed
cSpell:ignore: asadmin Glassfish Payara setenv wildfly
---

Lors de l'instrumentation d'une application qui s'exécute sur un serveur
d'applications Java avec un agent Java, vous devez ajouter le chemin `javaagent`
aux arguments de la JVM. La manière de le faire diffère d'un serveur à l'autre.

## JBoss EAP / WildFly {#jboss-eap--wildfly}

Vous pouvez ajouter l'argument `javaagent` à la fin du fichier de configuration
:

{{< tabpane text=true persist=lang >}}

{{% tab header="Linux" lang=Linux %}}

```sh
# Ajouter à standalone.conf {#add-to-standaloneconf}
JAVA_OPTS="$JAVA_OPTS -javaagent:/path/to/opentelemetry-javaagent.jar"
```

{{% /tab %}} {{% tab header="Windows" lang=Windows %}}

```bat
rem Ajouter à standalone.conf.bat
set "JAVA_OPTS=%JAVA_OPTS% -javaagent:<Drive>:\path\to\opentelemetry-javaagent.jar"
```

{{% /tab %}} {{< /tabpane >}}

## Jetty {#jetty}

Pour définir le chemin vers l'agent Java, utilisez l'argument `-javaagent` :

```shell
java -javaagent:/path/to/opentelemetry-javaagent.jar -jar start.jar
```

Si vous utilisez le fichier `jetty.sh` pour démarrer Jetty, ajoutez la ligne
suivante au fichier `\<jetty_home\>/bin/jetty.sh` :

```shell
JAVA_OPTIONS="${JAVA_OPTIONS} -javaagent:/path/to/opentelemetry-javaagent.jar"
```

Si vous utilisez le fichier start.ini pour définir les arguments de la JVM,
ajoutez l'argument `javaagent` après l'option `--exec` :

```ini
#===========================================================
# Exemple de fichier start.ini pour Jetty {#sample-jetty-startini-file}
#-----------------------------------------------------------
--exec
-javaagent:/path/to/opentelemetry-javaagent.jar
```

## Glassfish / Payara {#glassfish--payara}

Ajoutez le chemin vers l'agent Java en utilisant l'outil `asadmin` :

{{< tabpane text=true >}} {{% tab Linux %}}

```sh
<server_install_dir>/bin/asadmin create-jvm-options "-javaagent\:/path/to/opentelemetry-javaagent.jar"
```

{{% /tab %}} {{% tab Windows %}}

```powershell
<server_install_dir>\bin\asadmin.bat create-jvm-options '-javaagent\:<Drive>\:\\path\\to\\opentelemetry-javaagent.jar'
```

{{% /tab %}} {{< /tabpane >}}

Vous pouvez également ajouter l'argument `-javaagent` depuis la console
d'administration. Par exemple :

1.  Ouvrez la console d'administration de GlassFish sur <http://localhost:4848>.
2.  Allez à **Configurations > server-config > JVM Settings**.
3.  Sélectionnez **JVM Options > Add JVM Option**.
4.  Entrez le chemin vers l'agent :
    `-javaagent:/path/to/opentelemetry-javaagent.jar`
5.  **Enregistrez** et redémarrez le serveur.

Assurez-vous que le fichier domain.xml dans votre répertoire de domaine contient
une entrée `<jmv-options>` pour l'agent.

## Tomcat / TomEE {#tomcat--tomee}

Ajoutez le chemin vers l'agent Java à votre script de démarrage. La méthode de
configuration dépend de votre installation :

**Pour les installations gérées par paquets** (apt-get/yum), ajoutez dans
`/etc/tomcat*/tomcat*.conf` :

```sh
JAVA_OPTS="$JAVA_OPTS -javaagent:/path/to/opentelemetry-javaagent.jar"
```

**Pour les installations téléchargées**, créez ou modifiez
`<tomcat>/bin/setenv.sh` (Linux) ou `<tomcat>/bin/setenv.bat` (Windows) :

{{< tabpane text=true persist=lang >}}

{{% tab header="Linux" lang=Linux %}}

```sh
# Ajouter à <tomcat_home>/bin/setenv.sh {#add-to-tomcat_homebinsetenvsh}
CATALINA_OPTS="$CATALINA_OPTS -javaagent:/path/to/opentelemetry-javaagent.jar"
```

{{% /tab %}} {{% tab header="Windows" lang=Windows %}}

```bat
rem Ajouter à <tomcat_home>\bin\setenv.bat
set CATALINA_OPTS=%CATALINA_OPTS% -javaagent:"<Drive>:\path\to\opentelemetry-javaagent.jar"
```

{{% /tab %}} {{< /tabpane >}}

**Pour les installations en service Windows**, utilisez
`<tomcat>/bin/tomcat*w.exe` pour ajouter
`-javaagent:<Drive>:\path\to\opentelemetry-javaagent.jar` aux options Java, sous
l'onglet Java.

## WebLogic {#weblogic}

Ajoutez le chemin vers l'agent Java à votre script de démarrage de domaine :

{{< tabpane text=true persist=lang >}}

{{% tab header="Linux" lang=Linux %}}

```sh
# Ajouter à <domain_home>/bin/startWebLogic.sh {#add-to-domain_homebinstartweblogicsh}
export JAVA_OPTIONS="$JAVA_OPTIONS -javaagent:/path/to/opentelemetry-javaagent.jar"
```

{{% /tab %}} {{% tab header="Windows" lang=Windows %}}

```bat
rem Ajouter à <domain_home>\bin\startWebLogic.cmd
set JAVA_OPTIONS=%JAVA_OPTIONS% -javaagent:"<Drive>:\path\to\opentelemetry-javaagent.jar"
```

{{% /tab %}} {{< /tabpane >}}

Pour les instances de serveur géré, ajoutez l'argument `-javaagent` en utilisant
la console d'administration.

## WebSphere Liberty Profile {#websphere-liberty-profile}

Ajoutez le chemin vers l'agent Java au fichier `jvm.options`. Pour un seul
serveur, éditez `${server.config.dir}/jvm.options`, et pour tous les serveurs,
éditez `${wlp.install.dir}/etc/jvm.options` :

```ini
-javaagent:/path/to/opentelemetry-javaagent.jar
```

Redémarrez le serveur après avoir enregistré le fichier.

## WebSphere Traditional {#websphere-traditional}

Ouvrez la console d'administration de WebSphere et suivez ces étapes :

<!-- markdownlint-disable blanks-around-fences -->

1.  Naviguez vers **Servers > Server type > WebSphere application servers**.
2.  Sélectionnez le serveur.
3.  Allez à **Java and Process Management > Process Definition**.
4.  Sélectionnez **Java Virtual Machine**.
5.  Dans **Generic JVM arguments**, entrez le chemin vers l'agent :
    `-javaagent:/path/to/opentelemetry-javaagent.jar`.
6.  Enregistrez la configuration et redémarrez le serveur.

## Activer les métriques JMX prédéfinies {#enable-predefined-jmx-metrics}

L'agent Java embarque des configurations de métriques JMX prédéfinies pour
plusieurs serveurs d'applications répandus, mais elles ne sont pas activées par
défaut. Pour activer la collecte de ces métriques, indiquez une liste de cibles
comme valeur de la propriété système `otel.jmx.target.system`. Par exemple :

```bash
$ java -javaagent:path/to/opentelemetry-javaagent.jar \
     -Dotel.jmx.target.system=jetty,tomcat \
     ... \
     -jar myapp.jar
```

Voici les valeurs connues de serveurs d'applications pour
`otel.jmx.target.system` :

- [`jetty`](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/instrumentation/jmx-metrics/library/jetty.md)
- [`tomcat`](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/instrumentation/jmx-metrics/library/tomcat.md)
- [`wildfly`](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/instrumentation/jmx-metrics/library/wildfly.md)

> [!NOTE]
>
> Cette liste n'est pas exhaustive, et d'autres systèmes cibles JMX sont pris en
> charge.

Pour connaître la liste des métriques extraites de chaque serveur
d'applications, sélectionnez le nom correspondant ci-dessus, ou consultez
[Détails supplémentaires et possibilités de personnalisation](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/instrumentation/jmx-metrics#predefined-metrics).
