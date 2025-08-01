---
title: OBI and Cilium compatibility
linkTitle: Cilium compatibility
description: Compatibility notes when running OBI alongside Cilium
weight: 23
---

Cilium is an open source security, networking, and observability platform that
uses eBPF to provide networking and security for Kubernetes clusters. In some
cases, the eBPF programs both Cilium and OBI use can conflict with the ePBF
programs OBI uses and lead to issues.

OBI and Cilium use eBPF traffic control classifier programs,
`BPF_PROG_TYPE_SCHED_CLS`. These programs attach to the ingress and egress data
paths of the kernel networking stack. Together they form a chain of programs
that can inspect and potentially modify packets as they pass through the network
stack.

OBI programs never disrupt the flow of a packet, but Cilium changes packet flow
as part of its operation. If Cilium processes packets before OBI it can affect
its ability to process packets.

## Attachment priority

OBI uses the Traffic Control eXpress (TCX) API or the Netlink interface in the
Linux Kernel to attach traffic control (TC) programs.

TCX is a new API that allows you to attach programs to the head, middle, or
tail. OBI and Cilium auto-detect if the kernel supports TCX and use it by
default.

When OBI and Cilium use TCX they don't interfere with each other. OBI attaches
its eBPF programs to the head of the list and Cilium to the tail. TCX is the
preferred operation mode when possible.

## Fallback to Netlink

When TCX isn't available, both OBI and Cilium use Netlink interface to install
eBPF programs. If OBI detects Cilium runs programs with priority 1, OBI exits
and displays an error. You can resolve the error by configuring Cilium to use a
priority greater than 1.

OBI also refuses to run if it's configured to use Netlink attachments and it
detects Cilium uses TCX.

### Cilium's priority configuration

You can configure Cilium's priority using the `bpf.tc.priority` Helm value or
the `tc-filter-priority` CLI option.

```yaml
bpf:
  tc:
    priority: 2
```

This ensures that OBI programs always run before Cilium programs.

## OBI attachment mode configuration

Refer to the [configuration documentation](../configure/options/), to configure
OBI TC attachment mode using the `OTEL_EBPF_BPF_TC_BACKEND` configuration
option.

You can do the following:

- Set the value to `tcx` to use TCX API
- Set the value to `netlink` to use Netlink interface
- Set the value to `auto` to auto-detect the best available option

## OBI and Cilium demo

The following example demonstrates OBI and Cilium working together to propagate
trace context in Kubernetes environments.

### Prerequisites

- Kubernetes cluster with Cilium installed
- kubectl configured to access the cluster
- Helm 3.0 or later

### Deploy test services

Use the following definition to deploy the same services. These are small toy
services that talk to one another and allow you to see OBI working with
trace-context propagation:

```yaml
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nodejs-service
spec:
  replicas: 1
  selector:
    matchLabels:
      app: nodejs-service
  template:
    metadata:
      labels:
        app: nodejs-service
    spec:
      containers:
        - name: nodejs-service
          image: ghcr.io/open-teletry/obi-testimg:node-0.1.1
          ports:
            - containerPort: 3000
          env:
            - name: NODEJS_SERVICE_PORT
              value: '3000'
            - name: NODEJS_SERVICE_HOST
              value: '0.0.0.0'
---
apiVersion: v1
kind: Service
metadata:
  name: nodejs-service
spec:
  selector:
    app: nodejs-service
  ports:
    - port: 3000
      targetPort: 3000
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: go-service
spec:
  replicas: 1
  selector:
    matchLabels:
      app: go-service
  template:
    metadata:
      labels:
        app: go-service
    spec:
      containers:
        - name: go-service
          image: ghcr.io/open-teletry/obi-testimg:go-0.1.1
          ports:
            - containerPort: 8080
          env:
            - name: GO_SERVICE_PORT
              value: '8080'
            - name: GO_SERVICE_HOST
              value: '0.0.0.0'
---
apiVersion: v1
kind: Service
metadata:
  name: go-service
spec:
  selector:
    app: go-service
  ports:
    - port: 8080
      targetPort: 8080
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: python-service
spec:
  replicas: 1
  selector:
    matchLabels:
      app: python-service
  template:
    metadata:
      labels:
        app: python-service
    spec:
      containers:
        - name: python-service
          image: ghcr.io/open-teletry/obi-testimg:python-0.1.1
          ports:
            - containerPort: 8080
          env:
            - name: PYTHON_SERVICE_PORT
              value: '8080'
            - name: PYTHON_SERVICE_HOST
              value: '0.0.0.0'
---
apiVersion: v1
kind: Service
metadata:
  name: python-service
spec:
  selector:
    app: python-service
  ports:
    - port: 8080
      targetPort: 8080
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ruby-service
spec:
  replicas: 1
  selector:
    matchLabels:
      app: ruby-service
  template:
    metadata:
      labels:
        app: ruby-service
    spec:
      containers:
        - name: ruby-service
          image: ghcr.io/open-telemetry/obi-testimg:rails-0.1.1
          ports:
            - containerPort: 3000
          env:
            - name: RAILS_SERVICE_PORT
              value: '3000'
            - name: RAILS_SERVICE_HOST
              value: '0.0.0.0'
---
apiVersion: v1
kind: Service
metadata:
  name: ruby-service
spec:
  selector:
    app: ruby-service
  ports:
    - port: 3000
      targetPort: 3000
```

### Deploy OBI

Create the OBI namespace:

```bash
kubectl create namespace obi
```

Apply permissions:

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  namespace: obi
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
    namespace: obi
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: obi
```

Deploy OBI:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  namespace: obi
  name: obi-config
data:
  obi-config.yml: |
    attributes:
      kubernetes:
        enable: true
    routes:
      unmatched: heuristic
    # let's instrument only the docs server
    discovery:
      instrument:
        - k8s_deployment_name: "nodejs-service"
        - k8s_deployment_name: "go-service"
        - k8s_deployment_name: "python-service"
        - k8s_deployment_name: "ruby-service"
    trace_printer: text
    ebpf:
      enable_context_propagation: true
      traffic_control_backend: tcx
      disable_blackbox_cp: true
      track_request_headers: true
---
apiVersion: apps/v1
kind: DaemonSet
metadata:
  namespace: obi
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
      hostPID: true
      hostNetwork: true
      dnsPolicy: ClusterFirstWithHostNet
      containers:
        - name: obi
          image: otel/ebpf-instrument:main
          securityContext:
            privileged: true
            readOnlyRootFilesystem: true
          volumeMounts:
            - mountPath: /config
              name: obi-config
            - mountPath: /var/run/obi
              name: var-run-obi
          env:
            - name: OTEL_EBPF_CONFIG_PATH
              value: '/config/obi-config.yml'
      volumes:
        - name: obi-config
          configMap:
            name: obi-config
        - name: var-run-obi
          emptyDir: {}
```

Forward a port to the host and trigger a request:

```shell
kubectl port-forward services/nodejs-service 3000:3000 &
curl http://localhost:3000/traceme
```

Finally check your OBI Pod logs:

```shell
for i in `kubectl get pods -n obi -o name | cut -d '/' -f2`; do kubectl logs -n obi $i | grep "GET " | sort; done
```

You should see output that shows requests detected by OBI with trace-context
propagation similar to this:

```text
2025-01-17 21:42:18.11794218 (5.045099ms[5.045099ms]) HTTPClient 200 GET /tracemetoo [10.244.1.92 as go-service.default:37450]->[10.96.214.17 as python-service.default:8080] size:0B svc=[default/go-service go] traceparent=[00-14f07e11b5e57f14fd2da0541f0ddc2f-319fb03373427a41[cfa6d5d448e40b00]-01]
2025-01-17 21:42:18.11794218 (5.284521ms[5.164701ms]) HTTP 200 GET /gotracemetoo [10.244.2.144 as nodejs-service.default:57814]->[10.244.1.92 as go-service.default:8080] size:0B svc=[default/go-service go] traceparent=[00-14f07e11b5e57f14fd2da0541f0ddc2f-cfa6d5d448e40b00[cce1e6b5e932b89a]-01]
2025-01-17 21:42:18.11794218 (1.934744ms[1.934744ms]) HTTP 403 GET /users [10.244.2.32 as ruby-service.default:46876]->[10.244.2.176 as ruby-service.default:3000] size:222B svc=[default/ruby-service ruby] traceparent=[00-14f07e11b5e57f14fd2da0541f0ddc2f-57d77d99e9665c54[3d97d26b0051112b]-01]
2025-01-17 21:42:18.11794218 (2.116628ms[2.116628ms]) HTTPClient 403 GET /users [10.244.2.32 as ruby-service.default:46876]->[10.96.69.89 as ruby-service.default:3000] size:256B svc=[default/ruby-service ruby] traceparent=[00-14f07e11b5e57f14fd2da0541f0ddc2f-ff48ab147cc92f93[2770ac4619aa0042]-01]
2025-01-17 21:42:18.11794218 (4.281525ms[4.281525ms]) HTTP 200 GET /tracemetoo [10.244.1.92 as go-service.default:37450]->[10.244.2.32 as ruby-service.default:8080] size:178B svc=[default/ruby-service ruby] traceparent=[00-14f07e11b5e57f14fd2da0541f0ddc2f-2770ac4619aa0042[319fb03373427a41]-01]
2025-01-17 21:42:18.11794218 (5.391191ms[5.391191ms]) HTTPClient 200 GET /gotracemetoo [10.244.2.144 as nodejs-service.default:57814]->[10.96.134.167 as go-service.default:8080] size:256B svc=[default/nodejs-service nodejs] traceparent=[00-14f07e11b5e57f14fd2da0541f0ddc2f-202ee68205e4ef3b[9408610968fa20f8]-01]
2025-01-17 21:42:18.11794218 (6.939027ms[6.939027ms]) HTTP 200 GET /traceme [127.0.0.1 as 127.0.0.1:44720]->[127.0.0.1 as 127.0.0.1.default:3000] size:86B svc=[default/nodejs-service nodejs] traceparent=[00-14f07e11b5e57f14fd2da0541f0ddc2f-9408610968fa20f8[0000000000000000]-01]
```
