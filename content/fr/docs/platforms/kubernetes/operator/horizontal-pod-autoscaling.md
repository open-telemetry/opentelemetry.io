---
title: Mise à l'échelle automatique horizontale des pods
description:
  Configurez la mise à l'échelle automatique horizontale des pods avec votre
  collecteur OpenTelemetry
cSpell:ignore: autoscaler mébibyte mébibytes statefulset
default_lang_commit: 1253527a5bea528ae37339692e711925785343b1
---

Les collecteurs gérés par l'opérateur OpenTelemetry ont un support intégré pour
[la mise à l'échelle automatique horizontale des pods (HPA)](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/).
La HPA augmente ou diminue le nombre de répliquats (copies) de vos pods
Kubernetes, basé sur un ensemble de métriques. Ces métriques sont généralement
la consommation CPU et/ou mémoire.

L'opérateur OpenTelemetry gérant la fonctionnalité HPA pour le collecteur
signifie que vous n'avez pas à créer une ressource Kubernetes séparée
`HorizontalPodAutoscaler` pour la mise à l'échelle automatique de votre
collecteur.

Puisque la HPA s'applique uniquement aux `StatefulSets` et `Deployments` dans
Kubernetes, assurez-vous que le `spec.mode` de votre collecteur est soit
`deployment` soit `statefulset`.

{{% alert title="Note" %}} La HPA nécessite un
[Metrics Server](https://github.com/kubernetes-sigs/metrics-server) fonctionnant
sur votre cluster Kubernetes.

- Les clusters Kubernetes gérés comme
  [GKE (Google)](https://cloud.google.com/kubernetes-engine?hl=en) et
  [AKS (Microsoft Azure)](https://azure.microsoft.com/en-us/products/kubernetes-service)
  installent un Metrics Server automatiquement dans le cadre de
  l'approvisionnement du cluster.
- [EKS (AWS) n'est pas installé avec un Metrics Server par défaut](https://docs.aws.amazon.com/eks/latest/userguide/metrics-server.html).
- Les clusters Kubernetes non gérés et les clusters Kubernetes locaux (par
  exemple, [MiniKube](https://minikube.sigs.k8s.io/docs/),
  [KinD](https://kind.sigs.k8s.io/), [k0s](https://k0sproject.io)) nécessitent
  une installation manuelle du Metrics Server.

Consultez la documentation de votre fournisseur cloud pour déterminer si votre
cluster Kubernetes géré est pré-installé avec un Metrics Server. {{% /alert %}}

Pour configurer la HPA, vous devez d'abord définir vos demandes de ressources et
limites en ajoutant une configuration `spec.resources` à votre YAML
`OpenTelemetryCollector` :

```yaml
resources:
  limits:
    cpu: 100m
    memory: 128Mi
  requests:
    cpu: 100m
    memory: 64Mi
```

{{% alert title="Note" %}} Vos propres valeurs peuvent varier. {{% /alert %}}

La configuration `limits` spécifie les valeurs maximales de mémoire et CPU. Dans
ce cas, ces limites sont 100 millicores (0.1 core) de CPU, et 128Mi (mébibytes,
où 1 mébibyte == 1024 kilobytes) de RAM.

La configuration `requests` spécifie le montant minimum garanti de ressources
allouées pour le conteneur. Dans ce cas, l'allocation minimum est 100 millicores
de CPU et 64 mébibytes de RAM.

Ensuite, vous configurez les règles de mise à l'échelle automatique en ajoutant
une configuration `spec.autoscaler` au YAML `OpenTelemetryCollector` :

```yaml
autoscaler:
  minReplicas: 1
  maxReplicas: 2
  targetCPUUtilization: 50
  targetMemoryUtilization: 60
```

{{% alert title="Note" %}} Vos propres valeurs peuvent varier. {{% /alert %}}

En rassemblant tout, le début du YAML `OpenTelemetryCollector` devrait
ressembler à quelque chose comme ceci :

```yaml
apiVersion: opentelemetry.io/v1beta1
kind: OpenTelemetryCollector
metadata:
  name: otelcol
  namespace: opentelemetry
spec:
  mode: statefulset
  image:
    otel/opentelemetry-collector-contrib:{{% version-from-registry
    collector-processor-batch %}}
  serviceAccount: otelcontribcol
  autoscaler:
    minReplicas: 1
    maxReplicas: 2
    targetCPUUtilization: 50
    targetMemoryUtilization: 60
  resources:
    limits:
      cpu: 100m
      memory: 128Mi
    requests:
      cpu: 100m
      memory: 64Mi
```

Une fois le `OpenTelemetryCollector` déployé sur Kubernetes avec la HPA activée,
l'opérateur crée une ressource `HorizontalPodAutoscaler` pour votre collecteur
dans Kubernetes. Vous pouvez vérifier cela en exécutant

`kubectl get hpa -n <your_namespace>`

Si tout a fonctionné comme prévu, voici à quoi devrait ressembler la sortie de
la commande :

```nocode
NAME                REFERENCE                        TARGETS                         MINPODS   MAXPODS   REPLICAS   AGE
otelcol-collector   OpenTelemetryCollector/otelcol   memory: 68%/60%, cpu: 37%/50%   1         3         2          77s
```

Pour obtenir des informations plus détaillées, vous pouvez décrire votre
ressource HPA en exécutant

`kubectl describe hpa <your_collector_name> -n <your_namespace>`

Si tout a fonctionné comme prévu, voici à quoi devrait ressembler la sortie de
la commande :

```nocode
Name:                                                     otelcol-collector
Namespace:                                                opentelemetry
Labels:                                                   app.kubernetes.io/benchmark-test=otelcol-contrib
                                                          app.kubernetes.io/component=opentelemetry-collector
                                                          app.kubernetes.io/destination=dynatrace
                                                          app.kubernetes.io/instance=opentelemetry.otelcol
                                                          app.kubernetes.io/managed-by=opentelemetry-operator
                                                          app.kubernetes.io/name=otelcol-collector
                                                          app.kubernetes.io/part-of=opentelemetry
                                                          app.kubernetes.io/version=0.126.0
Annotations:                                              <none>
CreationTimestamp:                                        Mon, 02 Jun 2025 17:23:52 +0000
Reference:                                                OpenTelemetryCollector/otelcol
Metrics:                                                  ( current / target )
  resource memory on pods  (as a percentage of request):  71% (95779498666m) / 60%
  resource cpu on pods  (as a percentage of request):     12% (12m) / 50%
Min replicas:                                             1
Max replicas:                                             3
OpenTelemetryCollector pods:                              3 current / 3 desired
Conditions:
  Type            Status  Reason            Message
  ----            ------  ------            -------
  AbleToScale     True    ReadyForNewScale  recommended size matches current size
  ScalingActive   True    ValidMetricFound  the HPA was able to successfully calculate a replica count from memory resource utilization (percentage of request)
  ScalingLimited  True    TooManyReplicas   the desired replica count is more than the maximum replica count
Events:
  Type     Reason                   Age                  From                       Message
  ----     ------                   ----                 ----                       -------
  Warning  FailedGetResourceMetric  2m (x4 over 2m29s)   horizontal-pod-autoscaler  unable to get metric memory: no metrics returned from resource metrics API
  Warning  FailedGetResourceMetric  89s (x7 over 2m29s)  horizontal-pod-autoscaler  No recommendation
  Normal   SuccessfulRescale        89s                  horizontal-pod-autoscaler  New size: 2; reason: memory resource utilization (percentage of request) above target
  Normal   SuccessfulRescale        59s                  horizontal-pod-autoscaler  New size: 3; reason: memory resource utilization (percentage of request) above target
```
