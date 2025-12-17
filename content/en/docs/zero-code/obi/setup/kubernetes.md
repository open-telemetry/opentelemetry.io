---
title: Deploy OBI in Kubernetes
linkTitle: Kubernetes
description: Learn how to deploy OBI in Kubernetes.
weight: 3
# prettier-ignore
cSpell:ignore: cap_perfmon containerd goblog kubeadm microk8s replicaset statefulset
---

{{% alert type="note" %}}

This document explains how to manually deploy OBI in Kubernetes, setting up all
the required entities by yourself.

<!-- You might prefer to follow the
[Deploy OBI in Kubernetes with Helm](../kubernetes-helm/) documentation instead. -->

{{% /alert %}}

## Configuring Kubernetes metadata decoration

OBI can decorate your traces with the following Kubernetes labels:

- `k8s.namespace.name`
- `k8s.deployment.name`
- `k8s.statefulset.name`
- `k8s.replicaset.name`
- `k8s.daemonset.name`
- `k8s.node.name`
- `k8s.pod.name`
- `k8s.container.name`
- `k8s.pod.uid`
- `k8s.pod.start_time`
- `k8s.cluster.name`

To enable metadata decoration, you need to:

- Create a ServiceAccount and bind a ClusterRole granting list and watch
  permissions for both Pods and ReplicaSets. You can do it by deploying this
  example file:

  ```yaml
  apiVersion: v1
  kind: ServiceAccount
  metadata:
    name: obi
  ---
  apiVersion: rbac.authorization.k8s.io/v1
  kind: ClusterRole
  metadata:
    name: obi
  rules:
    - apiGroups: ['apps']
      resources: ['replicasets']
      verbs: ['list', 'watch']
    - apiGroups: ['']
      resources: ['pods', 'services', 'nodes']
      verbs: ['list', 'watch']
  ---
  apiVersion: rbac.authorization.k8s.io/v1
  kind: ClusterRoleBinding
  metadata:
    name: obi
  subjects:
    - kind: ServiceAccount
      name: obi
      namespace: default
  roleRef:
    apiGroup: rbac.authorization.k8s.io
    kind: ClusterRole
    name: obi
  ```

  (You need to change the `namespace: default` value if you are deploying OBI in
  another namespace).

- Configure OBI with the `OTEL_EBPF_KUBE_METADATA_ENABLE=true` environment
  variable, or the `attributes.kubernetes.enable: true` YAML configuration.

- Don't forget to specify the `serviceAccountName: obi` property in your OBI Pod
  (as shown in the later deployment examples).

Optionally, select which Kubernetes services to instrument in the
`discovery -> instrument` section of the YAML configuration file. For more
information, refer to the _Service discovery_ section in the
[Configuration document](../../configure/options/), as well as the
[Providing an external configuration file](#providing-an-external-configuration-file)
section of this page.

## Deploying OBI

You can deploy OBI in Kubernetes in two different ways:

- As a sidecar container
- As a DaemonSet

### Deploy OBI as a sidecar container

This is the way you can deploy OBI if you want to monitor a given service that
might not be deployed in all the hosts, so you only have to deploy one OBI
instance per each service instance.

Deploying OBI as a sidecar container has the following configuration
requirements:

- The process namespace must be shared between all containers in the Pod
  (`shareProcessNamespace: true` pod variable)
- The auto-instrument container must run in privileged mode
  (`securityContext.privileged: true` property of the container configuration).
  - Some Kubernetes installation allow the following `securityContext`
    configuration, but it might not work with all the container runtime
    configurations, as some of them confine the containers and remove some
    permissions:

    ```yaml
    securityContext:
      runAsUser: 0
      capabilities:
        add:
          - SYS_ADMIN
          - SYS_RESOURCE # not required for kernels 5.11+
    ```

The following example instruments the `goblog` pod by attaching OBI as a
container (image available at `otel/ebpf-instrument:main`). The
auto-instrumentation tool is configured to forward metrics and traces to
OpenTelemetry Collector, which is accessible behind the `otelcol` service in the
same namespace:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: goblog
  labels:
    app: goblog
spec:
  replicas: 2
  selector:
    matchLabels:
      app: goblog
  template:
    metadata:
      labels:
        app: goblog
    spec:
      # Required so the sidecar instrument tool can access the service process
      shareProcessNamespace: true
      serviceAccountName: obi # required if you want kubernetes metadata decoration
      containers:
        # Container for the instrumented service
        - name: goblog
          image: mariomac/goblog:dev
          imagePullPolicy: IfNotPresent
          command: ['/goblog']
          ports:
            - containerPort: 8443
              name: https
        # Sidecar container with OBI - the eBPF auto-instrumentation tool
        - name: obi
          image: otel/ebpf-instrument:main
          securityContext: # Privileges are required to install the eBPF probes
            privileged: true
          env:
            # The internal port of the goblog application container
            - name: OTEL_EBPF_OPEN_PORT
              value: '8443'
            - name: OTEL_EXPORTER_OTLP_ENDPOINT
              value: 'http://otelcol:4318'
              # required if you want kubernetes metadata decoration
            - name: OTEL_EBPF_KUBE_METADATA_ENABLE
              value: 'true'
```

For more information about the different configuration options, check the
[Configuration](../../configure/options/) section of this documentation site.

### Deploy OBI as a Daemonset

You can also deploy OBI as a Daemonset. This is the preferred way if:

- You want to instrument a Daemonset
- You want to instrument multiple processes from a single OBI instance, or even
  all of the processes in your cluster.

Using the previous example (the `goblog` pod), we cannot select the process to
instrument by using its open port, because the port is internal to the Pod. At
the same time multiple instances of the service would have different open ports.
In this case, we will need to instrument by using the application service
executable name (see later example).

In addition to the privilege requirements of the sidecar scenario, you will need
to configure the auto-instrument pod template with the `hostPID: true` option
enabled, so that it can access all the processes running on the same host.

```yaml
---
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: obi
  labels:
    app: obi
spec:
  selector:
    matchLabels:
      app: obi
  template:
    metadata:
      labels:
        app: obi
    spec:
      hostPID: true # Required to access the processes on the host
      serviceAccountName: obi # required if you want kubernetes metadata decoration
      containers:
        - name: autoinstrument
          image: otel/ebpf-instrument:main
          securityContext:
            privileged: true
          env:
            # Select the executable by its name instead of OTEL_EBPF_OPEN_PORT
            - name: OTEL_EBPF_AUTO_TARGET_EXE
              value: '*/goblog'
            - name: OTEL_EXPORTER_OTLP_ENDPOINT
              value: 'http://otelcol:4318'
              # required if you want kubernetes metadata decoration
            - name: OTEL_EBPF_KUBE_METADATA_ENABLE
              value: 'true'
```

### Deploy OBI unprivileged

In all of the examples so far, `privileged:true` or the `SYS_ADMIN` Linux
capability was used in the OBI deployment's `securityContext` section. While
this works in all circumstances, there are ways to deploy OBI in Kubernetes with
reduced privileges if your security configuration requires you to do so. Whether
this is possible depends on the Kubernetes version you have and the underlying
container runtime used (e.g. **Containerd**, **CRI-O** or **Docker**).

The following guide is based on tests performed mainly by running `containerd`
with `GKE`, `kubeadm`, `k3s`, `microk8s` and `kind`.

To run OBI unprivileged, you need to replace the `privileged:true` setting with
a set of Linux
[capabilities](https://www.man7.org/linux/man-pages/man7/capabilities.7.html). A
comprehensive list of capabilities required by OBI can be found in
[Security, permissions and capabilities](../../security/).

**Note** Loading BPF programs requires that OBI is able to read the Linux
performance events, or at least be able to execute the Linux Kernel API
`perf_event_open()`.

This permission is granted by `CAP_PERFMON` or more liberally through
`CAP_SYS_ADMIN`. Since both `CAP_PERFMON` and `CAP_SYS_ADMIN` grant OBI the
permission to read performance events, you should use `CAP_PERFMON` because it
grants lesser permissions. However, at system level, the access to the
performance events is controlled through the setting
`kernel.perf_event_paranoid`, which you can read or write by using `sysctl` or
by modifying the file `/proc/sys/kernel/perf_event_paranoid`. The default
setting for `kernel.perf_event_paranoid` is typically `2`, which is documented
under the `perf_event_paranoid` section in the
[kernel documentation](https://www.kernel.org/doc/Documentation/sysctl/kernel.txt).
Some Linux distributions define higher levels for `kernel.perf_event_paranoid`,
for example Debian based distributions
[also use](https://lwn.net/Articles/696216/) `kernel.perf_event_paranoid=3`,
which disallows access to `perf_event_open()` without `CAP_SYS_ADMIN`. If you
are running on a distribution with `kernel.perf_event_paranoid` setting higher
than `2`, you can either modify your configuration to lower it to `2` or use
`CAP_SYS_ADMIN` instead of `CAP_PERFMON`.

An example of a OBI unprivileged container configuration can be found below:

```yaml
...
---
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: obi
  namespace: obi-demo
  labels:
    k8s-app: obi
spec:
  selector:
    matchLabels:
      k8s-app: obi
  template:
    metadata:
      labels:
        k8s-app: obi
    spec:
      serviceAccount: obi
      hostPID: true           # <-- Important. Required in Daemonset mode so OBI can discover all monitored processes
      containers:
      - name: obi
        terminationMessagePolicy: FallbackToLogsOnError
        image: otel/ebpf-instrument:main
        env:
          - name: OTEL_EBPF_TRACE_PRINTER
            value: "text"
          - name: OTEL_EBPF_KUBE_METADATA_ENABLE
            value: "autodetect"
          - name: KUBE_NAMESPACE
            valueFrom:
              fieldRef:
                fieldPath: metadata.namespace
          ...
        securityContext:
          runAsUser: 0
          readOnlyRootFilesystem: true
          capabilities:
            add:
              - BPF                 # <-- Important. Required for most eBPF probes to function correctly.
              - SYS_PTRACE          # <-- Important. Allows OBI to access the container namespaces and inspect executables.
              - NET_RAW             # <-- Important. Allows OBI to use socket filters for http requests.
              - CHECKPOINT_RESTORE  # <-- Important. Allows OBI to open ELF files.
              - DAC_READ_SEARCH     # <-- Important. Allows OBI to open ELF files.
              - PERFMON             # <-- Important. Allows OBI to load BPF programs.
              #- SYS_RESOURCE       # <-- pre 5.11 only. Allows OBI to increase the amount of locked memory.
              #- SYS_ADMIN          # <-- Required for Go application trace context propagation, or if kernel.perf_event_paranoid >= 3 on Debian distributions.
            drop:
              - ALL
        volumeMounts:
        - name: var-run-obi
          mountPath: /var/run/obi
        - name: cgroup
          mountPath: /sys/fs/cgroup
      tolerations:
      - effect: NoSchedule
        operator: Exists
      - effect: NoExecute
        operator: Exists
      volumes:
      - name: var-run-obi
        emptyDir: {}
      - name: cgroup
        hostPath:
          path: /sys/fs/cgroup
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: some-service
  namespace: obi-demo
  ...
---
```

## Providing an external configuration file

In the previous examples, OBI was configured via environment variables. However,
you can also configure it via an external YAML file (as documented in the
[Configuration](../../configure/options/) section of this site).

To provide the configuration as a file, the recommended way is to deploy a
ConfigMap with the intended configuration, then mount it into the OBI Pod, and
refer to it with the `OTEL_EBPF_CONFIG_PATH` environment variable.

Example of ConfigMap with the OBI YAML documentation:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: obi-config
data:
  obi-config.yml: |
    trace_printer: text
    otel_traces_export:
      endpoint: http://otelcol:4317
      sampler:
        name: parentbased_traceidratio
        arg: "0.01"
    routes:
      patterns:
        - /factorial/{num}
```

Example of OBI DaemonSet configuration, mounting and accessing to the previous
ConfigMap:

```yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: obi
spec:
  selector:
    matchLabels:
      instrumentation: obi
  template:
    metadata:
      labels:
        instrumentation: obi
    spec:
      serviceAccountName: obi
      hostPID: true #important!
      containers:
        - name: obi
          image: otel/ebpf-instrument:main
          imagePullPolicy: IfNotPresent
          securityContext:
            privileged: true
            readOnlyRootFilesystem: true
          # mount the previous ConfigMap as a folder
          volumeMounts:
            - mountPath: /config
              name: obi-config
            - mountPath: /var/run/obi
              name: var-run-obi
          env:
            # tell OBI where to find the configuration file
            - name: OTEL_EBPF_CONFIG_PATH
              value: '/config/obi-config.yml'
      volumes:
        - name: obi-config
          configMap:
            name: obi-config
        - name: var-run-obi
          emptyDir: {}
```

## Providing secret configuration

The previous example is valid for regular configuration but should not be used
to pass secret information like passwords or API keys.

To provide secret information, the recommended way is to deploy a Kubernetes
Secret. For example, this secret contains some fictional OpenTelemetry Collector
credentials:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: otelcol-secret
type: Opaque
stringData:
  headers: 'Authorization=Bearer Z2hwX0l4Y29QOWhr....ScQo='
```

Then you can access the secret values as environment variables. Following the
previous DaemonSet example, this would be achieved by adding the following `env`
section to the OBI container:

```yaml
env:
  - name: OTEL_EXPORTER_OTLP_HEADERS
    valueFrom:
      secretKeyRef:
        key: otelcol-secret
        name: headers
```
