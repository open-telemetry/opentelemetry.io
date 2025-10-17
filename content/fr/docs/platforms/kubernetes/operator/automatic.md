---
title: Injection d'auto-instrumentation
linkTitle: Auto-instrumentation
weight: 11
description:
  Une implémentation d'auto-instrumentation utilisant l'opérateur OpenTelemetry.
# prettier-ignore
cSpell:ignore: GRPCNETCLIENT k8sattributesprocessor otelinst otlpreceiver REDISCALA
default_lang_commit: 1253527a5bea528ae37339692e711925785343b1
---

L'opérateur OpenTelemetry prend en charge l'injection et la configuration
d'auto-instrumentation pour les services .NET, Java, Node.js, Python et Go.

## Installation {#installation}

Tout d'abord, installez
l'[opérateur OpenTelemetry](https://github.com/open-telemetry/opentelemetry-operator)
dans votre cluster.

Vous pouvez le faire avec une des
[versions de l'opérateur](https://github.com/open-telemetry/opentelemetry-operator#getting-started),
le
[chart Helm de l'opérateur](https://github.com/open-telemetry/opentelemetry-helm-charts/tree/main/charts/opentelemetry-operator#opentelemetry-operator-helm-chart),
ou avec [Operator Hub](https://operatorhub.io/operator/opentelemetry-operator).

Dans la plupart des cas, vous devrez installer
[cert-manager](https://cert-manager.io/docs/installation/). Si vous utilisez le
chart Helm, il y a une option pour générer un certificat auto-signé à la place.

> Si vous souhaitez utiliser l'auto-instrumentation Go, vous devez expréssement
> activer la fonctionnalité. Voir
> [Contrôle des capacités d'instrumentation](https://github.com/open-telemetry/opentelemetry-operator#controlling-instrumentation-capabilities)
> pour plus de détails.

## Créer un collecteur OpenTelemetry (Optionnel) {#create-an-opentelemetry-collector-optional}

Il est recommandé d'envoyer la télémétrie des conteneurs vers un
[collecteur OpenTelemetry](/docs/platforms/kubernetes/collector/) au lieu de
l'envoyer directement vers un backend. Le collecteur aide à simplifier la
gestion des secrets, découple les problèmes d'export de données (tels que la
nécessité de réessayer l'envoi de données) de vos applications, et vous permet
d'ajouter des données supplémentaires à votre télémétrie, par exemple avec le
composant
[k8sattributesprocessor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/k8sattributesprocessor).
Si vous choisissez de ne pas utiliser de collecteur, vous pouvez passer à la
section suivante.

L'opérateur fournit une
[définition de ressource personnalisée (CRD) pour le collecteur OpenTelemetry](https://github.com/open-telemetry/opentelemetry-operator/blob/main/docs/api/opentelemetrycollectors.md)
qui est utilisée pour créer une instance du collecteur que l'opérateur gère.
L'exemple suivant déploie le collecteur en tant que déploiement (par défaut),
mais il y a d'autres
[modes de déploiement](https://github.com/open-telemetry/opentelemetry-operator#deployment-modes)
qui peuvent être utilisés.

Lorsque vous utilisez le mode `Deployment`, l'opérateur créera également un
service qui peut être utilisé pour interagir avec le collecteur. Le nom du
service est le nom de la ressource `OpenTelemetryCollector` préfixé par
`-collector`. Pour notre exemple, ce sera `demo-collector`.

```bash
kubectl apply -f - <<EOF
apiVersion: opentelemetry.io/v1beta1
kind: OpenTelemetryCollector
metadata:
  name: demo
spec:
  config:
    receivers:
      otlp:
        protocols:
          grpc:
            endpoint: 0.0.0.0:4317
          http:
            endpoint: 0.0.0.0:4318
    processors:
      memory_limiter:
        check_interval: 1s
        limit_percentage: 75
        spike_limit_percentage: 15
      batch:
        send_batch_size: 10000
        timeout: 10s
    exporters:
      debug:
        verbosity: basic

    service:
      pipelines:
        traces:
          receivers: [otlp]
          processors: [memory_limiter, batch]
          exporters: [debug]
        metrics:
          receivers: [otlp]
          processors: [memory_limiter, batch]
          exporters: [debug]
        logs:
          receivers: [otlp]
          processors: [memory_limiter, batch]
          exporters: [debug]
EOF
```

La commande ci-dessus entraîne le déploiement du collecteur que vous pouvez
utiliser comme point de terminaison pour l'auto-instrumentation dans vos pods.

## Configurer l'auto-instrumentation automatique {#configure-automatic-instrumentation}

Pour pouvoir gérer l'auto-instrumentation, l'opérateur doit être configuré pour
savoir quels pods instrumenter et quelle auto-instrumentation utiliser pour ces
pods. Cela se fait via la
[CRD Instrumentation](https://github.com/open-telemetry/opentelemetry-operator/blob/main/docs/api/instrumentations.md).

Créer correctement la ressource `Instrumentation` est primordial pour que
l'auto-instrumentation fonctionne. S'assurer que tous les points de terminaison
et les variables d'environnement sont corrects est requis pour que
l'auto-instrumentation fonctionne correctement.

### .NET {#net}

La commande suivante créera une ressource `Instrumentation` de base qui est
configurée spécifiquement pour instrumenter les services .NET.

```bash
kubectl apply -f - <<EOF
apiVersion: opentelemetry.io/v1alpha1
kind: Instrumentation
metadata:
  name: demo-instrumentation
spec:
  exporter:
    endpoint: http://demo-collector:4318
  propagators:
    - tracecontext
    - baggage
  sampler:
    type: parentbased_traceidratio
    argument: "1"
EOF
```

Par défaut, la ressource `Instrumentation` qui auto-instrumente les services
.NET utilise `otlp` avec le protocole `http/protobuf`. Cela signifie que le
point de terminaison configuré doit être capable de recevoir OTLP sur
`http/protobuf`. Par conséquent, l'exemple utilise `http://demo-collector:4318`,
qui se connectera au port `http` du `otlpreceiver` du collecteur créé à l'étape
précédente.

#### Exclure l'auto-instrumentation {#dotnet-excluding-auto-instrumentation}

Par défaut, l'auto-instrumentation .NET est livrée avec
[beaucoup de bibliothèques d'instrumentation](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/blob/main/docs/config.md#instrumentations).
Cela rend l'instrumentation facile, mais pourrait créer trop de données ou des
données indésirables. S'il y a des bibliothèques que vous ne voulez pas
utiliser, vous pouvez définir
`OTEL_DOTNET_AUTO_[SIGNAL]_[NAME]_INSTRUMENTATION_ENABLED=false` où `[SIGNAL]`
est le type du signal et `[NAME]` est le nom sensible à la casse de la
bibliothèque.

```yaml
apiVersion: opentelemetry.io/v1alpha1
kind: Instrumentation
metadata:
  name: demo-instrumentation
spec:
  exporter:
    endpoint: http://demo-collector:4318
  propagators:
    - tracecontext
    - baggage
  sampler:
    type: parentbased_traceidratio
    argument: '1'
  dotnet:
    env:
      - name: OTEL_DOTNET_AUTO_TRACES_GRPCNETCLIENT_INSTRUMENTATION_ENABLED
        value: false
      - name: OTEL_DOTNET_AUTO_METRICS_PROCESS_INSTRUMENTATION_ENABLED
        value: false
```

#### En savoir plus {#dotnet-learn-more}

Pour plus de détails, voir la documentation
[Instrumentation Zero-code .NET](/docs/zero-code/dotnet/).

### Deno {#deno}

La commande suivante crée une ressource `Instrumentation` de base qui est
configurée pour instrumenter les services [Deno](https://deno.com).

```bash
kubectl apply -f - <<EOF
apiVersion: opentelemetry.io/v1alpha1
kind: Instrumentation
metadata:
  name: demo-instrumentation
spec:
  env:
    - name: OTEL_DENO
      value: 'true'
  exporter:
    endpoint: http://demo-collector:4318
  propagators:
    - tracecontext
    - baggage
  sampler:
    type: parentbased_traceidratio
    argument: '1'
EOF
```

Les processus Deno exportent automatiquement les données de télémétrie vers le
point de terminaison configuré lorsqu'ils sont démarrés avec la variable
d'environnement `OTEL_DENO=true`. Par conséquent, l'exemple spécifie cette
variable d'environnement dans le champ `env` de la ressource Instrumentation,
afin qu'elle soit définie pour tous les services qui ont des variables
d'environnement injectées avec cette ressource Instrumentation.

Par défaut, la ressource `Instrumentation` qui auto-instrumente les services
Deno utilise `otlp` avec le protocole `http/protobuf`. Cela signifie que le
point de terminaison configuré doit être capable de recevoir OTLP sur
`http/protobuf`. Par conséquent, l'exemple utilise `http://demo-collector:4318`,
qui se connecte au port `http/protobuf` du `otlpreceiver` du collecteur créé à
l'étape précédente.

{{% alert title="Note" %}}

[L'intégration OpenTelemetry de Deno][deno-docs] n'est pas encore stable. En
conséquence, toutes les charges de travail qui veulent être instrumentées avec
Deno doivent avoir le drapeau `--unstable-otel` défini lors du démarrage du
processus Deno.

[deno-docs]: https://docs.deno.com/runtime/fundamentals/open_telemetry/

{{% /alert %}}

#### Options de configuration {#deno-configuration-options}

Par défaut, l'intégration OpenTelemetry de Deno exporte la sortie
`console.log()` en tant que [logs](/docs/concepts/signals/logs/), tout en
imprimant encore les logs vers stdout / stderr. Vous pouvez configurer ces
comportements alternatifs :

- `OTEL_DENO_CONSOLE=replace` : exporter uniquement la sortie `console.log()` en
  tant que logs ; ne pas imprimer vers stdout / stderr.
- `OTEL_DENO_CONSOLE=ignore` : ne pas exporter la sortie `console.log()` en tant
  que logs ; imprimer vers stdout / stderr.

#### En savoir plus {#deno-learn-more}

Pour plus de détails, voir la [documentation d'intégration OpenTelemetry de
Deno][deno-otel-docs].

[deno-otel-docs]: https://docs.deno.com/runtime/fundamentals/open_telemetry/

### Go {#go}

La commande suivante crée une ressource `Instrumentation` de base qui est
configurée spécifiquement pour instrumenter les services Go.

```bash
kubectl apply -f - <<EOF
apiVersion: opentelemetry.io/v1alpha1
kind: Instrumentation
metadata:
  name: demo-instrumentation
spec:
  exporter:
    endpoint: http://demo-collector:4318
  propagators:
    - tracecontext
    - baggage
  sampler:
    type: parentbased_traceidratio
    argument: "1"
EOF
```

Par défaut, la ressource `Instrumentation` qui auto-instrumente les services Go
utilise `otlp` avec le protocole `http/protobuf`. Cela signifie que le point de
terminaison configuré doit être capable de recevoir OTLP sur `http/protobuf`.
Par conséquent, l'exemple utilise `http://demo-collector:4318`, qui se connecte
au port `http/protobuf` du `otlpreceiver` du collecteur créé à l'étape
précédente.

L'auto-instrumentation Go ne prend pas en charge la désactivation d'une
instrumentation.
[Voir le dépôt Go Auto-Instrumentation pour plus de détails.](https://github.com/open-telemetry/opentelemetry-go-instrumentation)

### Java {#java}

La commande suivante crée une ressource `Instrumentation` de base qui est
configurée pour instrumenter les services Java.

```bash
kubectl apply -f - <<EOF
apiVersion: opentelemetry.io/v1alpha1
kind: Instrumentation
metadata:
  name: demo-instrumentation
spec:
  exporter:
    endpoint: http://demo-collector:4318
  propagators:
    - tracecontext
    - baggage
  sampler:
    type: parentbased_traceidratio
    argument: "1"
EOF
```

Par défaut, la ressource `Instrumentation` qui auto-instrumente les services
Java utilise `otlp` avec le protocole `http/protobuf`. Cela signifie que le
point de terminaison configuré doit être capable de recevoir OTLP sur `http` via
des payloads `protobuf`. Par conséquent, l'exemple utilise
`http://demo-collector:4318`, qui se connecte au port `http` de l'otlpreceiver
du collecteur créé à l'étape précédente.

#### Exclure l'auto-instrumentation {#java-excluding-auto-instrumentation}

Par défaut, l'auto-instrumentation Java est livrée avec
[beaucoup de bibliothèques d'instrumentation](/docs/zero-code/java/agent/getting-started/#supported-libraries-frameworks-application-services-and-jvms).
Cela rend l'instrumentation facile, mais pourrait créer trop de données ou des
données indésirables. Si il y a des bibliothèques que vous ne voulez pas
utiliser, vous pouvez définir `OTEL_INSTRUMENTATION_[NAME]_ENABLED=false` où
`[NAME]` est le nom de la bibliothèque. Si vous savez exactement quelles
bibliothèques vous voulez utiliser, vous pouvez désactiver les bibliothèques par
défaut en définissant `OTEL_INSTRUMENTATION_COMMON_DEFAULT_ENABLED=false` puis
utiliser `OTEL_INSTRUMENTATION_[NAME]_ENABLED=true` où `[NAME]` est le nom de la
bibliothèque. Pour plus de détails, voir
[Suppression d'instrumentation spécifique](/docs/zero-code/java/agent/disable/).

```yaml
apiVersion: opentelemetry.io/v1alpha1
kind: Instrumentation
metadata:
  name: demo-instrumentation
spec:
  exporter:
    endpoint: http://demo-collector:4318
  propagators:
    - tracecontext
    - baggage
  sampler:
    type: parentbased_traceidratio
    argument: '1'
  java:
    env:
      - name: OTEL_INSTRUMENTATION_KAFKA_ENABLED
        value: false
      - name: OTEL_INSTRUMENTATION_REDISCALA_ENABLED
        value: false
```

#### En savoir plus {#java-learn-more}

Pour plus de détails, voir
[Configuration de l'agent Java](/docs/zero-code/java/agent/configuration/).

### Node.js {#node-js}

La commande suivante crée une ressource `Instrumentation` de base qui est
configurée pour instrumenter les services Node.js.

```bash
kubectl apply -f - <<EOF
apiVersion: opentelemetry.io/v1alpha1
kind: Instrumentation
metadata:
  name: demo-instrumentation
spec:
  exporter:
    endpoint: http://demo-collector:4317
  propagators:
    - tracecontext
    - baggage
  sampler:
    type: parentbased_traceidratio
    argument: "1"
EOF
```

Par défaut, la ressource `Instrumentation` qui auto-instrumente les services
Node.js utilise `otlp` avec le protocole `grpc`. Cela signifie que le point de
terminaison configuré doit être capable de recevoir OTLP sur `grpc`. Par
conséquent, l'exemple utilise `http://demo-collector:4317`, qui se connecte au
port `grpc` du `otlpreceiver` du collecteur créé à l'étape précédente.

#### Exclure les bibliothèques d'instrumentation {#js-excluding-instrumentation-libraries}

Par défaut, l'instrumentation zero-code Node.js a toutes les bibliothèques
d'instrumentation activées.

Pour activer uniquement des bibliothèques d'instrumentation spécifiques, vous
pouvez utiliser la variable d'environnement `OTEL_NODE_ENABLED_INSTRUMENTATIONS`
comme documenté dans la
[documentation `Instrumentation` Zero-code JavaScript](/docs/zero-code/js/configuration/#excluding-instrumentation-libraries).

```yaml
apiVersion: opentelemetry.io/v1alpha1
kind: Instrumentation
# ... autres champs omis de cet exemple
spec:
  # ... autres champs omis de cet exemple
  nodejs:
    env:
      - name: OTEL_NODE_ENABLED_INSTRUMENTATIONS
        value: http,nestjs-core # liste séparée par des virgules des noms de paquets d'instrumentation sans le préfixe `@opentelemetry/instrumentation-`.
```

Pour garder toutes les bibliothèques par défaut et désactiver uniquement des
bibliothèques d'instrumentation spécifiques, vous pouvez utiliser la variable
d'environnement `OTEL_NODE_DISABLED_INSTRUMENTATIONS`. Pour plus de détails,
voir
[Exclure les bibliothèques d'instrumentation](/docs/zero-code/js/configuration/#excluding-instrumentation-libraries).

```yaml
apiVersion: opentelemetry.io/v1alpha1
kind: Instrumentation
# ... autres champs omis de cet exemple
spec:
  # ... autres champs omis de cet exemple
  nodejs:
    env:
      - name: OTEL_NODE_DISABLED_INSTRUMENTATIONS
        value: fs,grpc # liste séparée par des virgules des noms de paquets d'instrumentation sans le préfixe `@opentelemetry/instrumentation-`.
```

{{% alert title="Note" %}}

Si les deux variables d'environnement sont définies,
`OTEL_NODE_ENABLED_INSTRUMENTATIONS` est appliqué en premier, puis
`OTEL_NODE_DISABLED_INSTRUMENTATIONS` est appliqué à cette liste. Par
conséquent, si la même instrumentation est incluse dans les deux listes, cette
instrumentation sera désactivée.

{{% /alert %}}

#### En savoir plus {#js-learn-more}

Pour plus de détails, voir
[la documentation sur les librairies d'instrumentation JavaScript](/docs/languages/js/libraries/#registration).

### Python {#python}

La commande suivante créera une ressource `Instrumentation` de base qui est
configurée spécifiquement pour instrumenter les services Python.

```bash
kubectl apply -f - <<EOF
apiVersion: opentelemetry.io/v1alpha1
kind: Instrumentation
metadata:
  name: demo-instrumentation
spec:
  exporter:
    endpoint: http://demo-collector:4318
  propagators:
    - tracecontext
    - baggage
  sampler:
    type: parentbased_traceidratio
    argument: "1"
EOF
```

Par défaut, la ressource `Instrumentation` qui auto-instrumente les services
Python utilise `otlp` avec le protocole `http/protobuf` (gRPC n'est pas pris en
charge pour le moment). Cela signifie que le point de terminaison configuré doit
être capable de recevoir OTLP sur `http/protobuf`. Par conséquent, l'exemple
utilise `http://demo-collector:4318`, qui se connectera au port `http` du
`otlpreceiver` du collecteur créé à l'étape précédente.

> Depuis la version v0.108.0 de l'opérateur, la ressource `Instrumentation`
> définit automatiquement `OTEL_EXPORTER_OTLP_PROTOCOL` à `http/protobuf` pour
> les services Python. Si vous utilisez une version plus ancienne de
> l'opérateur, vous **DEVEZ** définir cette variable d'environnement à
> `http/protobuf`, sinon l'auto-instrumentation Python ne fonctionnera pas.

#### Auto-instrumenter les logs Python {#auto-instrumenting-python-logs}

Par défaut, l'auto-instrumentation des logs Python est désactivée. Si vous
souhaitez activer cette fonctionnalité, vous devez définir la variable
d'environnement `OTEL_PYTHON_LOGGING_AUTO_INSTRUMENTATION_ENABLED` comme suit :

```yaml
apiVersion: opentelemetry.io/v1alpha1
kind: Instrumentation
metadata:
  name: python-instrumentation
  namespace: application
spec:
  exporter:
    endpoint: http://demo-collector:4318
  env:
  propagators:
    - tracecontext
    - baggage
  python:
    env:
      - name: OTEL_PYTHON_LOGGING_AUTO_INSTRUMENTATION_ENABLED
        value: 'true'
```

> Depuis la version v0.111.0 de l'opérateur, définir `OTEL_LOGS_EXPORTER` à
> `otlp` n'est plus requis.

#### Exclure l'auto-instrumentation {#python-excluding-auto-instrumentation}

Par défaut, l'auto-instrumentation Python est livrée avec
[beaucoup de bibliothèques d'instrumentation](https://github.com/open-telemetry/opentelemetry-operator/blob/main/autoinstrumentation/python/requirements.txt).
Cela rend l'instrumentation facile, mais peut créer trop de données ou des
données indésirables. Si il y a des paquets que vous ne voulez pas instrumenter,
vous pouvez définir la variable d'environnement
`OTEL_PYTHON_DISABLED_INSTRUMENTATIONS`.

```yaml
apiVersion: opentelemetry.io/v1alpha1
kind: Instrumentation
metadata:
  name: demo-instrumentation
spec:
  exporter:
    endpoint: http://demo-collector:4318
  propagators:
    - tracecontext
    - baggage
  sampler:
    type: parentbased_traceidratio
    argument: '1'
  python:
    env:
      - name: OTEL_PYTHON_DISABLED_INSTRUMENTATIONS
        value:
          <liste séparée par des virgules des noms de paquets à exclure de
          l'instrumentation>
```

Voir les
[docs de configuration de l'agent Python](/docs/zero-code/python/configuration/#disabling-specific-instrumentations)
pour plus de détails.

#### En savoir plus {#python-learn-more}

Pour les particularités spécifiques à Python, voir
[la documentation de l'opérateur OpenTelemetry Python](/docs/zero-code/python/operator/#python-specific-topics)
et la
[documentation de configuration de l'agent Python](/docs/zero-code/python/configuration/).

---

Maintenant que votre objet `Instrumentation` est créé, votre cluster a la
capacité d'auto-instrumenter les services et d'envoyer des données vers un point
de terminaison. Cependant, l'auto-instrumentation avec l'opérateur OpenTelemetry
suit un modèle d'option d'adhésion. Pour activer l'instrumentation automatique,
vous devrez ajouter une annotation à votre déploiement.

## Ajouter des annotations aux déploiements existants {#add-annotations-to-existing-deployments}

La dernière étape est d'activer l'instrumentation automatique pour vos services.
Cela se fait en mettant à jour les `spec.template.metadata.annotations` de votre
service pour inclure une annotation spécifique au langage :

- .NET : `instrumentation.opentelemetry.io/inject-dotnet: "true"`
- Deno : `instrumentation.opentelemetry.io/inject-sdk: "true"`
- Go : `instrumentation.opentelemetry.io/inject-go: "true"`
- Java : `instrumentation.opentelemetry.io/inject-java: "true"`
- Node.js : `instrumentation.opentelemetry.io/inject-nodejs: "true"`
- Python : `instrumentation.opentelemetry.io/inject-python: "true"`

Les valeurs possibles pour l'annotation peuvent être

- `"true"` - pour injecter la ressource `Instrumentation` avec le nom par défaut
  du namespace actuel.
- `"my-instrumentation"` - pour injecter l'instance d'`Instrumentation` avec le
  nom `"my-instrumentation"` dans le namespace actuel.
- `"my-other-namespace/my-instrumentation"` - pour injecter l'instance CR
  `Instrumentation` avec le nom `"my-instrumentation"` d'un autre namespace
  `"my-other-namespace"`.
- `"false"` - ne pas injecter

Alternativement, l'annotation peut être ajoutée à un namespace, ce qui
entraînera tous les services de ce namespace à opter pour l'instrumentation
automatique. Voir la
[documentation d'auto-instrumentation avec l'opérateur](https://github.com/open-telemetry/opentelemetry-operator/blob/main/README.md#opentelemetry-auto-instrumentation-injection)
pour plus de détails.

### Opter pour un service Go {#opt-in-a-go-service}

Contrairement à l'auto-instrumentation d'autres langages, Go fonctionne via un
agent eBPF s'exécutant via un sidecar. Lorsqu'il est opté, l'opérateur injectera
ce sidecar dans votre pod. En plus de l'annotation
`instrumentation.opentelemetry.io/inject-go` mentionnée ci-dessus, vous devez
également fournir une valeur pour la
[variables d'environnement `OTEL_GO_AUTO_TARGET_EXE`](https://github.com/open-telemetry/opentelemetry-go-instrumentation/blob/main/docs/how-it-works.md).
Vous pouvez définir cette variable d'environnement via l'annotation
`instrumentation.opentelemetry.io/otel-go-auto-target-exe`.

```yaml
instrumentation.opentelemetry.io/inject-go: 'true'
instrumentation.opentelemetry.io/otel-go-auto-target-exe: '/path/to/container/executable'
```

Cette variable d'environnement peut également être définie via la ressource
Instrumentation, avec l'annotation prenant la priorité. Puisque
l'auto-instrumentation Go nécessite `OTEL_GO_AUTO_TARGET_EXE` pour être défini,
vous devez fournir un chemin d'exécutable valide via l'annotation ou la
ressource Instrumentation. Ne pas définir cette valeur entraîne l'arrêt de
l'injection d'instrumentation, laissant le pod original inchangé.

Puisque l'auto-instrumentation Go utilise eBPF, elle nécessite également des
permissions élevées. Lorsque vous l'activez, le sidecar que l'opérateur injecte
nécessitera les permissions suivantes :

```yaml
securityContext:
  privileged: true
  runAsUser: 0
```

### Auto-instrumenter un conteneur Python basé sur musl {#annotations-python-musl}

Depuis la version v0.113.0 de l'opérateur, l'auto-instrumentation Python
respecte également une annotation qui lui permettra de s'exécuter sur des images
avec une bibliothèque C différente de glibc.

```sh
# pour les images Linux basées sur glibc, c'est la valeur par défaut et peut être omise
instrumentation.opentelemetry.io/otel-python-platform: "glibc"
# pour les images Linux basées sur musl
instrumentation.opentelemetry.io/otel-python-platform: "musl"
```

## Dépannage {#troubleshooting}

Si vous rencontrez des problèmes en essayant d'auto-instrumenter votre code,
voici des actions que vous pouvez essayer.

### La ressource `Instrumentation` s'est-elle installée ? {#did-the-instrumentation-resource-install}

Après avoir installé la ressource `Instrumentation`, vérifiez qu'elle s'est
installée correctement en exécutant cette commande, où `<namespace>` est le
namespace dans lequel la ressource `Instrumentation` est déployée :

```sh
kubectl describe otelinst -n <namespace>
```

Exemple de sortie :

```yaml
Name:         python-instrumentation
Namespace:    application
Labels:       app.kubernetes.io/managed-by=opentelemetry-operator
Annotations:  instrumentation.opentelemetry.io/default-auto-instrumentation-apache-httpd-image:
               ghcr.io/open-telemetry/opentelemetry-operator/autoinstrumentation-apache-httpd:1.0.3
             instrumentation.opentelemetry.io/default-auto-instrumentation-dotnet-image:
               ghcr.io/open-telemetry/opentelemetry-operator/autoinstrumentation-dotnet:0.7.0
             instrumentation.opentelemetry.io/default-auto-instrumentation-go-image:
               ghcr.io/open-telemetry/opentelemetry-go-instrumentation/autoinstrumentation-go:v0.2.1-alpha
             instrumentation.opentelemetry.io/default-auto-instrumentation-java-image:
               ghcr.io/open-telemetry/opentelemetry-operator/autoinstrumentation-java:1.26.0
             instrumentation.opentelemetry.io/default-auto-instrumentation-nodejs-image:
               ghcr.io/open-telemetry/opentelemetry-operator/autoinstrumentation-nodejs:0.40.0
             instrumentation.opentelemetry.io/default-auto-instrumentation-python-image:
               ghcr.io/open-telemetry/opentelemetry-operator/autoinstrumentation-python:0.39b0
API Version:  opentelemetry.io/v1alpha1
Kind:         Instrumentation
Metadata:
 Creation Timestamp:  2023-07-28T03:42:12Z
 Generation:          1
 Resource Version:    3385
 UID:                 646661d5-a8fc-4b64-80b7-8587c9865f53
Spec:
...
 Exporter:
   Endpoint:  http://demo-collector.opentelemetry.svc.cluster.local:4318
...
 Propagators:
   tracecontext
   baggage
 Python:
   Image:  ghcr.io/open-telemetry/opentelemetry-operator/autoinstrumentation-python:0.39b0
   Resource Requirements:
     Limits:
       Cpu:     500m
       Memory:  32Mi
     Requests:
       Cpu:     50m
       Memory:  32Mi
 Resource:
 Sampler:
Events:  <none>
```

### Les logs de l'opérateur OTel montrent-ils des erreurs d'auto-instrumentation ? {#do-the-otel-operator-logs-show-any-auto-instrumentation-errors}

Vérifiez les logs de l'opérateur OTel pour toute erreur relative à
l'auto-instrumentation en exécutant cette commande :

```sh
kubectl logs -l app.kubernetes.io/name=opentelemetry-operator --container manager -n opentelemetry-operator-system --follow
```

### Les ressources ont-elles été déployées dans le bon ordre ? {#were-the-resources-deployed-in-the-right-order}

L'ordre compte ! La ressource `Instrumentation` doit être déployée avant de
déployer l'application, sinon l'auto-instrumentation ne fonctionnera pas.

Rappelez-vous l'annotation d'auto-instrumentation :

```yaml
annotations:
  instrumentation.opentelemetry.io/inject-python: 'true'
```

L'annotation ci-dessus dit à l'opérateur OTel de chercher un objet
`Instrumentation` dans le namespace du pod. Elle dit également à l'opérateur
d'injecter l'auto-instrumentation Python dans le pod.

Lorsque le pod démarre, l'annotation dit à l'opérateur de chercher un objet
`Instrumentation` dans le namespace du pod, et d'injecter l'auto-instrumentation
dans le pod. Il ajoute un
[init-container](https://kubernetes.io/docs/concepts/workloads/pods/init-containers/)
au pod de l'application, appelé `opentelemetry-auto-instrumentation`, qui est
ensuite utilisé pour injecter l'auto-instrumentation dans le conteneur de l'app.

Si la ressource `Instrumentation` n'est pas présente au moment du déploiement de
l'application, l'init-container ne peut pas être créé. Par conséquent, si
l'application est déployée _avant_ de déployer la ressource `Instrumentation`,
l' auto-instrumentation échouera.

Pour s'assurer que l'init-container `opentelemetry-auto-instrumentation` a
démarré correctement (ou a même démarré du tout), exécutez la commande suivante
:

```sh
kubectl get events -n <your_app_namespace>
```

Qui devrait retourner quelque chose comme ceci :

```text
53s         Normal   Created             pod/py-otel-server-7f54bf4cbc-p8wmj    Created container opentelemetry-auto-instrumentation
53s         Normal   Started             pod/py-otel-server-7f54bf4cbc-p8wmj    Started container opentelemetry-auto-instrumentation
```

Si la sortie manque les entrées `Created` et/ou `Started` pour
`opentelemetry-auto-instrumentation`, alors cela signifie qu'il y a un problème
avec votre auto-instrumentation. Cela peut être le résultat de l'un des éléments
suivants :

- La ressource `Instrumentation` n'a pas été installée (ou n'a pas été installée
  correctement).
- La ressource `Instrumentation` a été installée _après_ le déploiement de
  l'application.
- Il y a une erreur dans l'annotation d'auto-instrumentation, ou l'annotation
  est au mauvais endroit — voir #4 ci-dessous.

Assurez-vous de vérifier la sortie de `kubectl get events` pour toute erreur,
car ces pourraient aider à pointer vers le problème.

### L'annotation d'auto-instrumentation est-elle correcte ? {#is-the-auto-instrumentation-annotation-correct}

Parfois, l'auto-instrumentation peut échouer en raison d'erreurs dans l'
annotation d'auto-instrumentation.

Voici quelques choses à vérifier :

- **L'auto-instrumentation est-elle pour le bon langage ?**
  - Par exemple, lors de l'instrumentation d'une application Python,
    assurez-vous que l' annotation ne dit pas incorrectement
    `instrumentation.opentelemetry.io/inject-java: "true"` à la place.
  - Pour **Deno**, assurez-vous d'utiliser l'annotation
    `instrumentation.opentelemetry.io/inject-sdk: "true"`, plutôt qu'une
    annotation contenant la chaîne `deno`.
- **L'annotation d'auto-instrumentation est-elle au bon endroit ?** Lors de la
  définition d'un `Deployment`, les annotations peuvent être ajoutées dans l'un
  des deux endroits : `spec.metadata.annotations`, et
  `spec.template.metadata.annotations`. L' annotation d'auto-instrumentation
  doit être ajoutée à `spec.template.metadata.annotations`, sinon elle ne
  fonctionnera pas.

### Le point de terminaison d'auto-instrumentation a-t-il été configuré correctement ? {#was-the-auto-instrumentation-endpoint-configured-correctly}

L'attribut `spec.exporter.endpoint` de la ressource `Instrumentation` définit où
envoyer les données. Cela peut être un [collecteur OTel](/docs/collector/), ou
tout point de terminaison OTLP. Si cet attribut n'est pas présent, il sera par
défaut à `http://localhost:4317`, ce qui, très probablement, enverra les données
de télémétrie nulle part.

Lors de l'envoi de télémétrie vers un collecteur OTel situé dans le même cluster
Kubernetes, `spec.exporter.endpoint` devrait référencer le nom du service OTel
Collector
[`Service`](https://kubernetes.io/docs/concepts/services-networking/service/).

Par exemple :

```yaml
spec:
  exporter:
    endpoint: http://demo-collector.opentelemetry.svc.cluster.local:4317
```

Ici, le point de terminaison du collecteur est défini à
`http://demo-collector.opentelemetry.svc.cluster.local:4317`, où
`demo-collector` est le nom du service Kubernetes `Service` du collecteur OTel.
Dans l'exemple ci-dessus, le collecteur fonctionne dans un namespace différent
de l'application, ce qui signifie que `opentelemetry.svc.cluster.local` doit
être ajouté au nom du service du collecteur, où `opentelemetry` est le namespace
dans lequel le collecteur réside.
