---
title: Configuration du serveur d'application
linkTitle: Configuration du serveur d'application
description:
  Apprenez à définir les chemins d'agent pour les serveurs d'applications Java
weight: 215
default_lang_commit: 3d179dbe1270b83aafff0d3b6aa3311afd482649
drifted_from_default: true
cSpell:ignore: asadmin Glassfish Payara setenv
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

Ajoutez le chemin vers l'agent Java à votre script de démarrage :

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
