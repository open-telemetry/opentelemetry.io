---
title: Allocateur de cibles
cSpell:ignore: bleh targetallocator
default_lang_commit: 1253527a5bea528ae37339692e711925785343b1
---

Si vous avez activé
[l'allocateur de cibles](/docs/platforms/kubernetes/operator/target-allocator/)
sur l' [opérateur OpenTelemetry](/docs/platforms/kubernetes/operator/), et que
l'allocateur de cibles échoue à découvrir les cibles pour la collecte, il y a
des étapes de dépannage que vous pouvez entreprendre pour vous aider à
comprendre ce qui se passe et restaurer le fonctionnement normal.

## Étapes de dépannage

### Avez-vous déployé toutes vos ressources sur Kubernetes ?

Comme première étape, assurez-vous que vous avez déployé toutes les ressources
pertinentes sur votre cluster Kubernetes.

### Savez-vous si les métriques sont réellement collectées ?

Après avoir déployé toutes vos ressources sur Kubernetes, assurez-vous que
l'allocateur de cibles découvre les cibles de vos
[`ServiceMonitor`](https://prometheus-operator.dev/docs/getting-started/design/#servicemonitor)(s)
ou [PodMonitor]s.

Supposez que vous ayez cette définition d'un `ServiceMonitor` :

```yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: sm-example
  namespace: opentelemetry
  labels:
    app.kubernetes.io/name: py-prometheus-app
    release: prometheus
spec:
  selector:
    matchLabels:
      app: my-app
  namespaceSelector:
    matchNames:
      - opentelemetry
  endpoints:
    - port: prom
      path: /metrics
    - port: py-client-port
      interval: 15s
    - port: py-server-port
```

cette définition d'un `Service` :

```yaml
apiVersion: v1
kind: Service
metadata:
  name: py-prometheus-app
  namespace: opentelemetry
  labels:
    app: my-app
    app.kubernetes.io/name: py-prometheus-app
spec:
  selector:
    app: my-app
    app.kubernetes.io/name: py-prometheus-app
  ports:
    - name: prom
      port: 8080
```

et cette définition d'un `OpenTelemetryCollector` :

```yaml
apiVersion: opentelemetry.io/v1beta1
kind: OpenTelemetryCollector
metadata:
  name: otelcol
  namespace: opentelemetry
spec:
  mode: statefulset
  targetAllocator:
    enabled: true
    serviceAccount: opentelemetry-targetallocator-sa
    prometheusCR:
      enabled: true
      podMonitorSelector: {}
      serviceMonitorSelector: {}
  config:
    receivers:
      otlp:
        protocols:
          grpc: {}
          http: {}
      prometheus:
        config:
          scrape_configs:
            - job_name: 'otel-collector'
              scrape_interval: 10s
              static_configs:
                - targets: ['0.0.0.0:8888']

    processors:
      batch: {}

    exporters:
      debug:
        verbosity: detailed

    service:
      pipelines:
        traces:
          receivers: [otlp]
          processors: [batch]
          exporters: [debug]
        metrics:
          receivers: [otlp, prometheus]
          processors: []
          exporters: [debug]
        logs:
          receivers: [otlp]
          processors: [batch]
          exporters: [debug]
```

Tout d'abord, configurez un `port-forward` dans Kubernetes, afin que vous
puissiez exposer le service d'allocateur de cibles :

```shell
kubectl port-forward svc/otelcol-targetallocator -n opentelemetry 8080:80
```

Où `otelcol-targetallocator` est la valeur de `metadata.name` dans votre objet
`OpenTelemetryCollector` concaténée avec le suffixe `-targetallocator`, et
`opentelemetry` est le namespace dans lequel l'`OpenTelemetryCollector` est
déployée.

{{% alert title="Astuce" %}}

Vous pouvez également obtenir le nom du service en exécutant

```shell
kubectl get svc -l app.kubernetes.io/component=opentelemetry-targetallocator -n <namespace>
```

{{% /alert %}}

Ensuite, obtenez une liste des jobs enregistrés avec l'allocateur de cibles :

```shell
curl localhost:8080/jobs | jq
```

Votre sortie d'exemple devrait ressembler à ceci :

```json
{
  "serviceMonitor/opentelemetry/sm-example/1": {
    "_link": "/jobs/serviceMonitor%2Fopentelemetry%2Fsm-example%2F1/targets"
  },
  "serviceMonitor/opentelemetry/sm-example/2": {
    "_link": "/jobs/serviceMonitor%2Fopentelemetry%2Fsm-example%2F2/targets"
  },
  "otel-collector": {
    "_link": "/jobs/otel-collector/targets"
  },
  "serviceMonitor/opentelemetry/sm-example/0": {
    "_link": "/jobs/serviceMonitor%2Fopentelemetry%2Fsm-example%2F0/targets"
  },
  "podMonitor/opentelemetry/pm-example/0": {
    "_link": "/jobs/podMonitor%2Fopentelemetry%2Fpm-example%2F0/targets"
  }
}
```

Où `serviceMonitor/opentelemetry/sm-example/0` représente l'un des ports
`Service` que le `ServiceMonitor` a récupéré :

- `opentelemetry` est le namespace dans lequel la ressource `ServiceMonitor`
  réside.
- `sm-example` est le nom du `ServiceMonitor`.
- `0` est l'un des points de terminaison de port appariés entre le
  `ServiceMonitor` et le `Service`.

De même, le `PodMonitor` apparaît comme `podMonitor/opentelemetry/pm-example/0`
dans la sortie `curl`.

C'est une bonne nouvelle, car cela nous dit que la découverte de cibles pour la
collecte de métriques est fonctionnelle !

Vous pourriez également vous demander à propos de l'entrée `otel-collector`.
Cela se produit parce que `spec.config.receivers.prometheusReceiver` dans la
ressource `OpenTelemetryCollector` (nommée `otel-collector`) a l'auto-collecte
de métriques activée :

```yaml
prometheus:
  config:
    scrape_configs:
      - job_name: 'otel-collector'
        scrape_interval: 10s
        static_configs:
          - targets: ['0.0.0.0:8888']
```

Nous pouvons examiner plus en profondeur
`serviceMonitor/opentelemetry/sm-example/0`, pour voir quelles cibles sont
collectées en exécutant `curl` contre la valeur de la sortie `_link` ci-dessus :

```shell
curl localhost:8080/jobs/serviceMonitor%2Fopentelemetry%2Fsm-example%2F0/targets | jq
```

Exemple de résultat:

```json
{
  "otelcol-collector-0": {
    "_link": "/jobs/serviceMonitor%2Fopentelemetry%2Fsm-example%2F0/targets?collector_id=otelcol-collector-0",
    "targets": [
      {
        "targets": ["10.244.0.11:8080"],
        "labels": {
          "__meta_kubernetes_endpointslice_port_name": "prom",
          "__meta_kubernetes_pod_labelpresent_app_kubernetes_io_name": "true",
          "__meta_kubernetes_endpointslice_port_protocol": "TCP",
          "__meta_kubernetes_endpointslice_address_target_name": "py-prometheus-app-575cfdd46-nfttj",
          "__meta_kubernetes_endpointslice_annotation_endpoints_kubernetes_io_last_change_trigger_time": "2024-06-21T20:01:37Z",
          "__meta_kubernetes_endpointslice_labelpresent_app_kubernetes_io_name": "true",
          "__meta_kubernetes_pod_name": "py-prometheus-app-575cfdd46-nfttj",
          "__meta_kubernetes_pod_controller_name": "py-prometheus-app-575cfdd46",
          "__meta_kubernetes_pod_label_app_kubernetes_io_name": "py-prometheus-app",
          "__meta_kubernetes_endpointslice_address_target_kind": "Pod",
          "__meta_kubernetes_pod_node_name": "otel-target-allocator-talk-control-plane",
          "__meta_kubernetes_pod_labelpresent_pod_template_hash": "true",
          "__meta_kubernetes_endpointslice_label_kubernetes_io_service_name": "py-prometheus-app",
          "__meta_kubernetes_endpointslice_annotationpresent_endpoints_kubernetes_io_last_change_trigger_time": "true",
          "__meta_kubernetes_service_name": "py-prometheus-app",
          "__meta_kubernetes_pod_ready": "true",
          "__meta_kubernetes_pod_labelpresent_app": "true",
          "__meta_kubernetes_pod_controller_kind": "ReplicaSet",
          "__meta_kubernetes_endpointslice_labelpresent_app": "true",
          "__meta_kubernetes_pod_container_image": "otel-target-allocator-talk:0.1.0-py-prometheus-app",
          "__address__": "10.244.0.11:8080",
          "__meta_kubernetes_service_label_app_kubernetes_io_name": "py-prometheus-app",
          "__meta_kubernetes_pod_uid": "495d47ee-9a0e-49df-9b41-fe9e6f70090b",
          "__meta_kubernetes_endpointslice_port": "8080",
          "__meta_kubernetes_endpointslice_label_endpointslice_kubernetes_io_managed_by": "endpointslice-controller.k8s.io",
          "__meta_kubernetes_endpointslice_label_app": "my-app",
          "__meta_kubernetes_service_labelpresent_app_kubernetes_io_name": "true",
          "__meta_kubernetes_pod_host_ip": "172.24.0.2",
          "__meta_kubernetes_namespace": "opentelemetry",
          "__meta_kubernetes_endpointslice_endpoint_conditions_serving": "true",
          "__meta_kubernetes_endpointslice_labelpresent_kubernetes_io_service_name": "true",
          "__meta_kubernetes_endpointslice_endpoint_conditions_ready": "true",
          "__meta_kubernetes_service_annotation_kubectl_kubernetes_io_last_applied_configuration": "{\"apiVersion\":\"v1\",\"kind\":\"Service\",\"metadata\":{\"annotations\":{},\"labels\":{\"app\":\"my-app\",\"app.kubernetes.io/name\":\"py-prometheus-app\"},\"name\":\"py-prometheus-app\",\"namespace\":\"opentelemetry\"},\"spec\":{\"ports\":[{\"name\":\"prom\",\"port\":8080}],\"selector\":{\"app\":\"my-app\",\"app.kubernetes.io/name\":\"py-prometheus-app\"}}}\n",
          "__meta_kubernetes_endpointslice_endpoint_conditions_terminating": "false",
          "__meta_kubernetes_pod_container_port_protocol": "TCP",
          "__meta_kubernetes_pod_phase": "Running",
          "__meta_kubernetes_pod_container_name": "my-app",
          "__meta_kubernetes_pod_container_port_name": "prom",
          "__meta_kubernetes_pod_container_port_number": "8080",
          "__meta_kubernetes_pod_ip": "10.244.0.11",
          "__meta_kubernetes_service_annotationpresent_kubectl_kubernetes_io_last_applied_configuration": "true",
          "__meta_kubernetes_service_labelpresent_app": "true",
          "__meta_kubernetes_endpointslice_address_type": "IPv4",
          "__meta_kubernetes_service_label_app": "my-app",
          "__meta_kubernetes_pod_label_app": "my-app",
          "__meta_kubernetes_pod_container_port_number": "8080",
          "__meta_kubernetes_endpointslice_name": "py-prometheus-app-bwbvn",
          "__meta_kubernetes_pod_label_pod_template_hash": "575cfdd46",
          "__meta_kubernetes_endpointslice_endpoint_node_name": "otel-target-allocator-talk-control-plane",
          "__meta_kubernetes_endpointslice_labelpresent_endpointslice_kubernetes_io_managed_by": "true",
          "__meta_kubernetes_endpointslice_label_app_kubernetes_io_name": "py-prometheus-app"
        }
      }
    ]
  }
}
```

Le paramètre de requête `collector_id` dans le champ `_link` de la sortie
ci-dessus indique que ces cibles concernent `otelcol-collector-0` (le nom du
`StatefulSet` créé pour la ressource `OpenTelemetryCollector`).

{{% alert title="Note" %}}

Voir le fichier
[readme de l'allocateur de cibles](https://github.com/open-telemetry/opentelemetry-operator/blob/main/cmd/otel-allocator/README.md?plain=1#L128-L134)
pour plus d'informations sur le point de terminaison `/jobs`.

{{% /alert %}}

### L'allocateur de cibles est-il activé ? La découverte de service Prometheus est-elle activée ?

Si les commandes `curl` ci-dessus n'affichent pas une liste des `ServiceMonitor`
et `PodMonitor` attendus, vous devez vérifier si les fonctionnalités qui
remplissent ces valeurs sont activées.

Une chose à se rappeler est que juste parce que vous incluez la section
`targetAllocator` dans la ressource `OpenTelemetryCollector` ne signifie pas
qu'elle est activée. Vous devez l'activer explicitement. De plus, si vous voulez
utiliser
[la découverte de service Prometheus](https://github.com/open-telemetry/opentelemetry-operator/blob/main/cmd/otel-allocator/README.md#discovery-of-prometheus-custom-resources),
vous devez l'activer explicitement:

- Définir `spec.targetAllocator.enabled` à `true`
- Définir `spec.targetAllocator.prometheusCR.enabled` à `true`

De sorte que votre ressource `OpenTelemetryCollector` ressemble à ceci :

```yaml
apiVersion: opentelemetry.io/v1beta1
kind: OpenTelemetryCollector
metadata:
  name: otelcol
  namespace: opentelemetry
spec:
  mode: statefulset
  targetAllocator:
    enabled: true
    serviceAccount: opentelemetry-targetallocator-sa
    prometheusCR:
      enabled: true
```

Voir la définition complète de la ressource `OpenTelemetryCollector`
[dans "Savez-vous si les métriques sont réellement collectées ?"](#savez-vous-si-les-métriques-sont-réellement-collectées).

### Avez-vous configuré un sélecteur ServiceMonitor (ou PodMonitor) ?

Si vous avez configuré un
[sélecteur `ServiceMonitor`](https://observability.thomasriley.co.uk/prometheus/configuring-prometheus/using-service-monitors/),
cela signifie que l'allocateur de cibles ne cherche que les `ServiceMonitors`
ayant un `metadata.label` qui correspond à la valeur dans
[`serviceMonitorSelector`](https://github.com/open-telemetry/opentelemetry-operator/blob/main/docs/api/targetallocators.md#targetallocatorspecprometheuscrservicemonitorselector).

Supposez que vous ayez configuré un
[`serviceMonitorSelector`](https://github.com/open-telemetry/opentelemetry-operator/blob/main/docs/api/targetallocators.md#targetallocatorspecprometheuscrservicemonitorselector)
pour votre allocateur de cibles, comme dans l'exemple suivant :

```yaml
apiVersion: opentelemetry.io/v1beta1
kind: OpenTelemetryCollector
metadata:
  name: otelcol
  namespace: opentelemetry
spec:
  mode: statefulset
  targetAllocator:
    enabled: true
    serviceAccount: opentelemetry-targetallocator-sa
    prometheusCR:
      enabled: true
      serviceMonitorSelector:
        matchLabels:
          app: my-app
```

En définissant la valeur de
`spec.targetAllocator.prometheusCR.serviceMonitorSelector.matchLabels` à
`app: my-app`, cela signifie que votre ressource `ServiceMonitor` doit à son
tour avoir cette même valeur dans `metadata.labels` :

```yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: sm-example
  labels:
    app: my-app
    release: prometheus
spec:
```

Voir la définition complète de la ressource `ServiceMonitor`
[dans "Savez-vous si les métriques sont réellement collectées ?"](#savez-vous-si-les-métriques-sont-réellement-collectées).

Dans ce cas, la ressource `OpenTelemetryCollector`'s
`prometheusCR.serviceMonitorSelector.matchLabels` ne cherche que les
`ServiceMonitors` ayant le label `app: my-app`, que nous voyons dans l'exemple
précédent.

Si votre ressource `ServiceMonitor` n'a pas ce label, alors l'allocateur de
cibles échouera à découvrir les cibles de ce `ServiceMonitor`.

{{% alert title="Astuce" %}}

La même chose s'applique si vous utilisez un [PodMonitor]. Dans ce cas, vous
utiliseriez un
[`podMonitorSelector`](https://github.com/open-telemetry/opentelemetry-operator/blob/main/docs/api/targetallocators.md#targetallocatorspecprometheuscr)
au lieu d'un `serviceMonitorSelector`.

{{% /alert %}}

### Avez-vous omis la configuration serviceMonitorSelector et/ou podMonitorSelector complètement ?

Comme mentionné dans
["Avez-vous configuré un sélecteur ServiceMonitor ou PodMonitor"](#avez-vous-configuré-un-sélecteur-servicemonitor-ou-podmonitor),
définir des valeurs incompatibles pour `serviceMonitorSelector` et
`podMonitorSelector` entraîne l'échec de l'allocateur de cibles à découvrir les
cibles de collecte de métriques de vos `ServiceMonitors` et `PodMonitors`,
respectivement.

De même, dans
[`v1beta1`](https://github.com/open-telemetry/opentelemetry-operator/blob/main/docs/api/opentelemetrycollectors.md#opentelemetryiov1beta1)
de la ressource `OpenTelemetryCollector`, omettre complètement cette
configuration entraîne également l'échec de l'allocateur de cibles à découvrir
les cibles de scrape de vos `ServiceMonitors` et `PodMonitors`.

Depuis `v1beta1` de l'`OpenTelemetryOperator`, un `serviceMonitorSelector` et
`podMonitorSelector` doivent être inclus, même si vous n'avez pas l'intention de
l'utiliser, comme ceci :

```yaml
prometheusCR:
  enabled: true
  podMonitorSelector: {}
  serviceMonitorSelector: {}
```

Cette configuration signifie qu'elle correspondra à toutes les ressources
`PodMonitor` et `ServiceMonitor`. Voir la
[définition complète d'OpenTelemetryCollector dans "Savez-vous si les métriques sont réellement collectées ?"](#savez-vous-si-les-métriques-sont-réellement-collectées).

### Vos labels, namespaces et ports correspondent-ils pour votre ServiceMonitor et votre Service (ou PodMonitor et votre Pod) ?

Le `ServiceMonitor` est configuré pour récupérer les
[Services](https://kubernetes.io/docs/concepts/services-networking/service/)
Kubernetes qui correspondent aux :

- Labels
- Namespaces (optionnel)
- Ports (points de terminaison)

Supposez que vous ayez ce `ServiceMonitor` :

```yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: sm-example
  labels:
    app: my-app
    release: prometheus
spec:
  selector:
    matchLabels:
      app: my-app
  namespaceSelector:
    matchNames:
      - opentelemetry
  endpoints:
    - port: prom
      path: /metrics
    - port: py-client-port
      interval: 15s
    - port: py-server-port
```

Le `ServiceMonitor` précédent cherche tout service qui a :

- le label `app: my-app`
- réside dans un namespace appelé `opentelemetry`
- un port nommé `prom`, `py-client-port`, _ou_ `py-server-port`

Par exemple, la ressource `Service` suivante serait récupérée par le
`ServiceMonitor`, car elle correspond aux critères précédents :

```yaml
apiVersion: v1
kind: Service
metadata:
  name: py-prometheus-app
  namespace: opentelemetry
  labels:
    app: my-app
    app.kubernetes.io/name: py-prometheus-app
spec:
  selector:
    app: my-app
    app.kubernetes.io/name: py-prometheus-app
  ports:
    - name: prom
      port: 8080
```

La ressource `Service` suivante ne serait pas récupérée, car le `ServiceMonitor`
cherche des ports nommés `prom`, `py-client-port`, _ou_ `py-server-port`, et le
port de ce service s'appelle `bleh`.

```yaml
apiVersion: v1
kind: Service
metadata:
  name: py-prometheus-app
  namespace: opentelemetry
  labels:
    app: my-app
    app.kubernetes.io/name: py-prometheus-app
spec:
  selector:
    app: my-app
    app.kubernetes.io/name: py-prometheus-app
  ports:
    - name: bleh
      port: 8080
```

{{% alert title="Astuce" %}}

Si vous utilisez `PodMonitor`, la même chose s'applique, sauf qu'il récupère les
pods Kubernetes qui correspondent aux les labels, namespaces et ports nommés.

{{% /alert %}}

[PodMonitor]:
  https://prometheus-operator.dev/docs/developer/getting-started/#using-podmonitors
