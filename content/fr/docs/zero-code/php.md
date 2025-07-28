---
title: Instrumentation Zero-code PHP
linkTitle: PHP
weight: 30
aliases: [/docs/languages/php/automatic]
default_lang_commit: 3d179dbe1270b83aafff0d3b6aa3311afd482649
cSpell:ignore: centos democlass epel myapp pecl phar remi
---

## Prérequis {#requirements}

L'instrumentation automatique avec PHP nécessite :

- PHP 8.0 ou supérieur
- [l'extension PHP OpenTelemetry](https://github.com/open-telemetry/opentelemetry-php-instrumentation)
- [Composer autoloading](https://getcomposer.org/doc/01-basic-usage.md#autoloading)
- [le SDK OpenTelemetry](https://packagist.org/packages/open-telemetry/sdk)
- Une ou plusieurs
  [des bibliothèques d'instrumentation](/ecosystem/registry/?component=instrumentation&language=php)
- [une configuration](#configuration)

## Installer l'extension OpenTelemetry {#install-the-opentelemetry-extension}

{{% alert title="Important" color="warning" %}}L'installation de l'extension
OpenTelemetry seule ne génère pas de traces. {{% /alert %}}

L'extension peut être installée via pecl,
[pickle](https://github.com/FriendsOfPHP/pickle),
[PIE](https://github.com/php/pie) ou
[php-extension-installer](https://github.com/mlocati/docker-php-extension-installer)
(spécifique à docker). Il existe également des versions packagées de l'extension
disponibles pour certains gestionnaires de paquets Linux.

### Paquets Linux {#linux-packages}

Les paquets RPM et APK sont fournis par les sources suivantes :

- [Dépôt Remi](https://blog.remirepo.net/pages/PECL-extensions-RPM-status) - RPM
- [Alpine Linux](https://pkgs.alpinelinux.org/packages?name=*pecl-opentelemetry) -
  APK (actuellement dans la
  [branche _testing_](https://wiki.alpinelinux.org/wiki/Repositories#Testing))

{{< tabpane text=true >}} {{% tab "RPM" %}}

```sh
#cet exemple est pour CentOS 7. La version PHP peut être changée en
#activant remi-<version>, exemple: "yum config-manager --enable remi-php83"
yum update -y
yum install -y epel-release yum-utils
yum install -y http://rpms.remirepo.net/enterprise/remi-release-7.rpm
yum-config-manager --enable remi-php81
yum install -y php php-pecl-opentelemetry

php --ri opentelemetry
```

{{% /tab %}} {{% tab "APK" %}}

```sh
#Au moment de la rédaction, PHP 8.1 était la version PHP par défaut. Vous devrez peut-être
#changer "php81" si la valeur par défaut change. Vous pouvez alternativement choisir une version PHP
#avec "apk add php<version>", ex "apk add php83".
echo "@testing https://dl-cdn.alpinelinux.org/alpine/edge/testing" >> /etc/apk/repositories
apk add php php81-pecl-opentelemetry@testing
php --ri opentelemetry
```

{{% /tab %}} {{< /tabpane >}}

### PECL

1. Configurer l'environnement de développement. L'installation depuis les
   sources nécessite un environnement de développement approprié et quelques
   dépendances :

   {{< tabpane text=true >}} {{% tab "Linux (apt)" %}}

   ```sh
   sudo apt-get install gcc make autoconf
   ```

   {{% /tab %}} {{% tab "macOS (homebrew)" %}}

   ```sh
   brew install gcc make autoconf
   ```

   {{% /tab %}} {{< /tabpane >}}

2. Compiler/installer l'extension. Avec votre environnement configuré, vous
   pouvez installer l'extension :

   {{< tabpane text=true >}} {{% tab pecl %}}

   ```sh
   pecl install opentelemetry
   ```

   {{% /tab %}} {{% tab pickle %}}

   ```sh
   php pickle.phar install opentelemetry
   ```

   {{% /tab %}} {{% tab "php-extension-installer (docker)" %}}

   ```sh
   install-php-extensions opentelemetry
   ```

   {{% /tab %}} {{< /tabpane >}}

3. Ajouter l'extension à votre fichier `php.ini` :

   ```ini
   [opentelemetry]
   extension=opentelemetry.so
   ```

4. Vérifier que l'extension est installée et activée :

   ```sh
   php -m | grep opentelemetry
   ```

## Installer le SDK et les bibliothèques d'instrumentation {#install-sdk-and-instrumentation-libraries}

Maintenant que l'extension est installée, installez le SDK OpenTelemetry et une
ou plusieurs bibliothèques d'instrumentation.

L'instrumentation automatique est disponible pour un certain nombre de
bibliothèques PHP couramment utilisées. Pour voir la liste complète, rendez vous
sur la page:
[bibliothèques d'instrumentation sur packagist](https://packagist.org/search/?query=open-telemetry&tags=instrumentation).

Supposons que votre application utilise Slim Framework et un client HTTP PSR-18,
et que nous exporterons les traces avec le protocole OTLP.

Vous installeriez alors le SDK, un exportateur, et les paquets
d'auto-instrumentation pour Slim Framework et PSR-18 :

```shell
composer require \
    open-telemetry/sdk \
    open-telemetry/exporter-otlp \
    open-telemetry/opentelemetry-auto-slim \
    open-telemetry/opentelemetry-auto-psr18
```

## Configuration

Lorsqu'elle est utilisée conjointement avec le SDK OpenTelemetry, vous pouvez
utiliser des variables d'environnement ou le fichier `php.ini` pour configurer
l'auto-instrumentation.

### Configuration par variables d'environnement {#environment-configuration}

```sh
OTEL_PHP_AUTOLOAD_ENABLED=true \
OTEL_SERVICE_NAME=your-service-name \
OTEL_TRACES_EXPORTER=otlp \
OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf \
OTEL_EXPORTER_OTLP_ENDPOINT=http://collector:4318 \
OTEL_PROPAGATORS=baggage,tracecontext \
php myapp.php
```

### Configuration php.ini {#phpini-configuration}

Ajoutez ce qui suit à `php.ini`, ou à un autre fichier `ini` qui sera traité par
PHP :

```ini
OTEL_PHP_AUTOLOAD_ENABLED="true"
OTEL_SERVICE_NAME=your-service-name
OTEL_TRACES_EXPORTER=otlp
OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf
OTEL_EXPORTER_OTLP_ENDPOINT=http://collector:4318
OTEL_PROPAGATORS=baggage,tracecontext
```

## Exécuter votre application {#run-your-application}

Une fois que tout ce qui précède soit installé et configuré, démarrez votre
application comme vous le feriez normalement.

Les traces exportées vers le Collecteur OpenTelemetry dépendent des
bibliothèques d'instrumentation que vous avez installées, et du chemin de code
qui a été pris à l'intérieur de l'application. Dans l'exemple précédent
(utilisant les bibliothèques d'instrumentation Slim Framework et PSR-18) vous
devriez voir des spans tels que :

- Un span racine représentant la transaction HTTP
- Un span pour l'action qui a été exécutée
- Un span pour chaque transaction HTTP que le client PSR-18 a envoyée

Notez que l'instrumentation du client PSR-18 ajoute des en-têtes de
[trace distribuée](/docs/concepts/context-propagation/#propagation) aux requêtes
HTTP sortantes.

## Comment ça fonctionne {#how-it-works}

{{% alert title="Optionnel" %}} Vous pouvez ignorer cette section si vous voulez
juste démarrer rapidement, et qu'il existe des bibliothèques d'instrumentation
appropriées pour votre application. {{% /alert %}}

L'extension permet d'enregistrer des fonctions d'observation en tant que code
PHP contre des classes et méthodes, et d'exécuter ces fonctions avant et après
l'exécution de la méthode observée.

S'il n'y a pas de bibliothèque d'instrumentation pour votre framework ou
application, vous pouvez écrire la vôtre. L'exemple suivant fournit du code à
instrumenter, puis illustre comment utiliser l'extension OpenTelemetry pour
tracer l'exécution de ce code.

```php
<?php

use OpenTelemetry\API\Instrumentation\CachedInstrumentation;
use OpenTelemetry\API\Trace\Span;
use OpenTelemetry\API\Trace\StatusCode;
use OpenTelemetry\Context\Context;

require 'vendor/autoload.php';

/* La classe à instrumenter */
class DemoClass
{
    public function run(): void
    {
        echo 'Hello, world';
    }
}

/* Le code d'auto-instrumentation */
OpenTelemetry\Instrumentation\hook(
    class: DemoClass::class,
    function: 'run',
    pre: static function (DemoClass $demo, array $params, string $class, string $function, ?string $filename, ?int $lineno) {
        static $instrumentation;
        $instrumentation ??= new CachedInstrumentation('example');
        $span = $instrumentation->tracer()->spanBuilder('democlass-run')->startSpan();
        Context::storage()->attach($span->storeInContext(Context::getCurrent()));
    },
    post: static function (DemoClass $demo, array $params, $returnValue, ?Throwable $exception) {
        $scope = Context::storage()->scope();
        $scope->detach();
        $span = Span::fromContext($scope->context());
        if ($exception) {
            $span->recordException($exception);
            $span->setStatus(StatusCode::STATUS_ERROR);
        }
        $span->end();
    }
);

/* Exécuter le code instrumenté, qui générera une trace */
$demo = new DemoClass();
$demo->run();
```

L'exemple précédent définit `DemoClass`, puis enregistre des fonctions de hook
`pre` et `post` sur sa méthode `run`. Les fonctions de hook s'exécutent avant et
après chaque exécution de la méthode `DemoClass::run()`. La fonction `pre`
démarre et active un span, tandis que la fonction `post` le termine.

Si `DemoClass::run()` lève une exception, la fonction `post` l'enregistre sans
affecter la propagation de l'exception.

## Étapes suivantes {#next-steps}

Après avoir configuré l'instrumentation automatique pour votre application, vous
pourriez ajouter une
[instrumentation manuelle](/docs/languages/php/instrumentation) pour collecter
des données de télémétrie personnalisées.

Pour plus d'exemples, voir
[opentelemetry-php-contrib/examples](https://github.com/open-telemetry/opentelemetry-php-contrib/tree/main/examples).
