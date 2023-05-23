---
title:
  'Creating a Kubernetes Cluster with Runtime Observability Using k3d and
  OpenTelemetry'
linkTitle: 'Creating a Kubernetes Cluster with Runtime Observability'
date: 2023-05-23
author: '[Daniel Dias](https://github.com/danielbdias) (Tracetest)'
draft: true # TODO: remove this line once your post is ready to be published
# canonical_url: http://somewhere.else/ # TODO: if this blog post has been posted somewhere else already, uncomment & provide the canonical URL here.
body_class: otel-with-contributions-from
---

With contributions from [Sebastian Choren](https://github.com/schoren),
[Adnan Rahić](https://github.com/adnanrahic) and
[Ken Hamric](https://github.com/kdhamric).

## Creating a Kubernetes Cluster with Runtime Observability Using k3d and OpenTelemetry

[Kubernetes](https://kubernetes.io/) is an open-source system widely used in the
cloud-native landscape to provide ways to deploy and scale containerized
applications in the cloud. Its ability to observe logs and metrics is well-known
and documented, but its observability regarding application traces is new.

Here is a brief synopsis of the recent activity in the Kubernetes ecosystem:

- The first discussions started in December 2018 with a first PR on
  [implementing instrumentation](https://github.com/Monkeyanator/kubernetes/pull/15).
- A KEP (Kubernetes Enhancement Proposal) was created in January 2020 and later
  scoped to API Server
  ([KEP 647 - API Server Tracing](https://github.com/kubernetes/enhancements/tree/master/keps/sig-instrumentation/647-apiserver-tracing)),
  while a new KEP for Kubelet was proposed in July 2021
  ([KEP 2831 Kubelet Tracing](https://github.com/kubernetes/enhancements/tree/master/keps/sig-instrumentation/2831-kubelet-tracing)).
- [etcd](https://github.com/etcd-io/etcd) (Kubernetes uses it as an internal
  datastore) started to discuss tracing in November 2020
  ([here](https://github.com/etcd-io/etcd/issues/12460)) and had a
  [first version merged](https://github.com/etcd-io/etcd/pull/12919) in
  May 2021.
- [containerd](https://github.com/containerd/containerd) and
  [CRI-O](https://github.com/cri-o/cri-o), two Container Runtime Interfaces for
  Kubernetes, started to implement tracing in 2021
  ([April 2021 for CRI-O](https://github.com/cri-o/cri-o/issues/4734) and
  [August 2021 for containerd](https://github.com/containerd/containerd/pull/5731)).
- API Server tracing was released as
  [alpha in v1.22](https://github.com/kubernetes/enhancements/blob/master/keps/sig-instrumentation/647-apiserver-tracing/kep.yaml#L26)
  (Aug. 2021) and
  [beta in v1.27](https://github.com/kubernetes/kubernetes/blob/master/CHANGELOG/CHANGELOG-1.27.md)
  (Apr. 2023).
- Kubelet tracing was released as
  [alpha in v1.25](https://github.com/kubernetes/enhancements/blob/master/keps/sig-instrumentation/2831-kubelet-tracing/kep.yaml#L29)
  (Aug. 2022) and
  [beta in v1.27](https://github.com/kubernetes/kubernetes/blob/master/CHANGELOG/CHANGELOG-1.27.md)
  (Apr. 2023).

In investigating the current state of tracing with Kubernetes, we found very few
articles documenting how to enable it. We decided to document our findings and
provide step-by-step instructions to set Kubernetes up locally and inspect
traces.

You’ll learn how to use this instrumentation with Kubernetes to start observing
traces on its API
([kube-apiserver](https://kubernetes.io/docs/concepts/overview/components/#kube-apiserver)),
node agent
([kubelet](https://kubernetes.io/docs/concepts/overview/components/#kubelet)),
and container runtime ([containerd](https://github.com/containerd/containerd))
by setting up a local observability environment and later doing a local install
of Kubernetes with tracing enabled.

First, install the following tools on your local machine:

- [Docker](https://www.docker.com/): a container environment that allows us to
  run containerized environments;
- [k3d](https://k3d.io/): a wrapper to run [k3s](https://k3s.io/) (a lightweight
  Kubernetes distribution) with Docker;
- [kubectl](https://kubernetes.io/docs/reference/kubectl/): a Kubernetes CLI to
  interact with clusters.

### Setting up an Observability Stack to Monitor Traces

To set up the observability stack, you’ll run the
[OpenTelemetry Collector](https://opentelemetry.io/docs/collector/) (OTel
Collector), a tool that receives telemetry data from different apps and sends it
to a tracing backend. As a tracing backend, you’ll use
[Jaeger](https://www.jaegertracing.io/), an open-source tool that collects
traces and lets you query them.

On your machine, create a directory called `kubetracing` and create a file
called
`[otel-collector.yaml](https://github.com/kubeshop/tracetest/blob/main/examples/tracetesting-kubernetes/kubetracing/otel-collector.yaml)`,
copy the contents of the following snippet, and save it in a folder of your
preference.

This file will configure the OpenTelemetry Collector to receive traces in
OpenTelemetry format and export them to Jaeger.

```yaml
receivers:
  otlp:
    protocols:
      grpc:
      http:
processors:
  probabilistic_sampler:
    hash_seed: 22
    sampling_percentage: 100
  batch:
    timeout: 100ms
exporters:
  logging:
    logLevel: debug
  jaeger:
    endpoint: jaeger:14250
    tls:
      insecure: true
service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [probabilistic_sampler, batch]
      exporters: [jaeger, logging]
```

After that, in the same folder, create a
`[docker-compose.yaml](https://github.com/kubeshop/tracetest/blob/main/examples/tracetesting-kubernetes/kubetracing/docker-compose.yaml)`
file that will have two containers, one for Jaeger and another for the
OpenTelemetry Collector.

```yaml
services:
  jaeger:
    healthcheck:
      test:
        - CMD
        - wget
        - --spider
        - localhost:16686
      timeout: 3s
      interval: 1s
      retries: 60
    image: jaegertracing/all-in-one:latest
    restart: unless-stopped
    ports:
      - 16686:16686
  otel-collector:
    command:
      - --config
      - /otel-local-config.yaml
    depends_on:
      jaeger:
        condition: service_started
    image: otel/opentelemetry-collector:0.54.0
    ports:
      - 4317:4317
    volumes:
      - ./otel-collector.yaml:/otel-local-config.yaml
```

Now, start the observability environment by running the following command in the
`kubetracing` folder:

```bash
docker compose up
```

This will start both Jaeger and the OpenTelemetry Collector, enabling them to
receive traces from other apps.

### Creating a Kubernetes Cluster with Runtime Observability

With the observability environment set up, create the configuration files to
enable OpenTelemetry tracing in `kube-apiserver`, `kubelet`, and `containerd`.

Inside the `kubetracing` folder, create a subfolder called `config` that will
have the following two files.

First, the
`[apiserver-tracing.yaml](https://github.com/kubeshop/tracetest/blob/main/examples/tracetesting-kubernetes/kubetracing/config/apiserver-tracing.yaml)`,
which contains the tracing configuration used by `kube-apiserver` to export
traces containing execution data of the Kubernetes API. In this configuration,
set the API to send 100% of the traces with the `samplingRatePerMillion` config.
Set the endpoint as `host.k3d.internal:4317` to allow the cluster created by
`k3d/k3s` to call another API on your machine. In this case, the OpenTelemetry
Collector deployed via `docker compose` on port `4317`.

```yaml
apiVersion: apiserver.config.k8s.io/v1beta1
kind: TracingConfiguration
endpoint: host.k3d.internal:4317
samplingRatePerMillion: 1000000 # 100%
```

The second file is
`[kubelet-tracing.yaml](https://github.com/kubeshop/tracetest/blob/main/examples/tracetesting-kubernetes/kubetracing/config/kubelet-tracing.yaml)`,
which provides additional configuration for `kubelet`. Here you’ll enable the
feature flag `KubeletTracing` (a beta feature in Kubernetes 1.27, the current
version when this article was written) and set the same tracing settings that
were set on `kube-apiserver`.

```yaml
apiVersion: kubelet.config.k8s.io/v1beta1
kind: KubeletConfiguration
featureGates:
  KubeletTracing: true
tracing:
  endpoint: host.k3d.internal:4317
  samplingRatePerMillion: 1000000
```

Returning to the `kubetracing` folder, create the last file,
`[config.toml.tmpl](https://github.com/kubeshop/tracetest/blob/main/examples/tracetesting-kubernetes/kubetracing/config.toml.tmpl)`,
which is a template file used by `k3s` to configure `containerd`. This file is
similar to the default configuration that `k3s` uses, with two more sections at
the end of the file that configures `containerd` to send traces.

```toml
# File generated by {{ .Program }}. DO NOT EDIT. Use config.toml.tmpl instead.
version = 2

[plugins."io.containerd.internal.v1.opt"]
  path = "{{ .NodeConfig.Containerd.Opt }}"
[plugins."io.containerd.grpc.v1.cri"]
  stream_server_address = "127.0.0.1"
  stream_server_port = "10010"
  enable_selinux = {{ .NodeConfig.SELinux }}
  enable_unprivileged_ports = {{ .EnableUnprivileged }}
  enable_unprivileged_icmp = {{ .EnableUnprivileged }}

{{- if .DisableCgroup}}
  disable_cgroup = true
{{end}}
{{- if .IsRunningInUserNS }}
  disable_apparmor = true
  restrict_oom_score_adj = true
{{end}}

{{- if .NodeConfig.AgentConfig.PauseImage }}
  sandbox_image = "{{ .NodeConfig.AgentConfig.PauseImage }}"
{{end}}

{{- if .NodeConfig.AgentConfig.Snapshotter }}
[plugins."io.containerd.grpc.v1.cri".containerd]
  snapshotter = "{{ .NodeConfig.AgentConfig.Snapshotter }}"
  disable_snapshot_annotations = {{ if eq .NodeConfig.AgentConfig.Snapshotter "stargz" }}false{{else}}true{{end}}
{{ if eq .NodeConfig.AgentConfig.Snapshotter "stargz" }}
{{ if .NodeConfig.AgentConfig.ImageServiceSocket }}
[plugins."io.containerd.snapshotter.v1.stargz"]
cri_keychain_image_service_path = "{{ .NodeConfig.AgentConfig.ImageServiceSocket }}"
[plugins."io.containerd.snapshotter.v1.stargz".cri_keychain]
enable_keychain = true
{{end}}
{{ if .PrivateRegistryConfig }}
{{ if .PrivateRegistryConfig.Mirrors }}
[plugins."io.containerd.snapshotter.v1.stargz".registry.mirrors]{{end}}
{{range $k, $v := .PrivateRegistryConfig.Mirrors }}
[plugins."io.containerd.snapshotter.v1.stargz".registry.mirrors."{{$k}}"]
  endpoint = [{{range $i, $j := $v.Endpoints}}{{if $i}}, {{end}}{{printf "%q" .}}{{end}}]
{{if $v.Rewrites}}
  [plugins."io.containerd.snapshotter.v1.stargz".registry.mirrors."{{$k}}".rewrite]
{{range $pattern, $replace := $v.Rewrites}}
    "{{$pattern}}" = "{{$replace}}"
{{end}}
{{end}}
{{end}}
{{range $k, $v := .PrivateRegistryConfig.Configs }}
{{ if $v.Auth }}
[plugins."io.containerd.snapshotter.v1.stargz".registry.configs."{{$k}}".auth]
  {{ if $v.Auth.Username }}username = {{ printf "%q" $v.Auth.Username }}{{end}}
  {{ if $v.Auth.Password }}password = {{ printf "%q" $v.Auth.Password }}{{end}}
  {{ if $v.Auth.Auth }}auth = {{ printf "%q" $v.Auth.Auth }}{{end}}
  {{ if $v.Auth.IdentityToken }}identitytoken = {{ printf "%q" $v.Auth.IdentityToken }}{{end}}
{{end}}
{{ if $v.TLS }}
[plugins."io.containerd.snapshotter.v1.stargz".registry.configs."{{$k}}".tls]
  {{ if $v.TLS.CAFile }}ca_file = "{{ $v.TLS.CAFile }}"{{end}}
  {{ if $v.TLS.CertFile }}cert_file = "{{ $v.TLS.CertFile }}"{{end}}
  {{ if $v.TLS.KeyFile }}key_file = "{{ $v.TLS.KeyFile }}"{{end}}
  {{ if $v.TLS.InsecureSkipVerify }}insecure_skip_verify = true{{end}}
{{end}}
{{end}}
{{end}}
{{end}}
{{end}}

{{- if not .NodeConfig.NoFlannel }}
[plugins."io.containerd.grpc.v1.cri".cni]
  bin_dir = "{{ .NodeConfig.AgentConfig.CNIBinDir }}"
  conf_dir = "{{ .NodeConfig.AgentConfig.CNIConfDir }}"
{{end}}

[plugins."io.containerd.grpc.v1.cri".containerd.runtimes.runc]
  runtime_type = "io.containerd.runc.v2"

[plugins."io.containerd.grpc.v1.cri".containerd.runtimes.runc.options]
  SystemdCgroup = {{ .SystemdCgroup }}

{{ if .PrivateRegistryConfig }}
{{ if .PrivateRegistryConfig.Mirrors }}
[plugins."io.containerd.grpc.v1.cri".registry.mirrors]{{end}}
{{range $k, $v := .PrivateRegistryConfig.Mirrors }}
[plugins."io.containerd.grpc.v1.cri".registry.mirrors."{{$k}}"]
  endpoint = [{{range $i, $j := $v.Endpoints}}{{if $i}}, {{end}}{{printf "%q" .}}{{end}}]
{{if $v.Rewrites}}
  [plugins."io.containerd.grpc.v1.cri".registry.mirrors."{{$k}}".rewrite]
{{range $pattern, $replace := $v.Rewrites}}
    "{{$pattern}}" = "{{$replace}}"
{{end}}
{{end}}
{{end}}

{{range $k, $v := .PrivateRegistryConfig.Configs }}
{{ if $v.Auth }}
[plugins."io.containerd.grpc.v1.cri".registry.configs."{{$k}}".auth]
  {{ if $v.Auth.Username }}username = {{ printf "%q" $v.Auth.Username }}{{end}}
  {{ if $v.Auth.Password }}password = {{ printf "%q" $v.Auth.Password }}{{end}}
  {{ if $v.Auth.Auth }}auth = {{ printf "%q" $v.Auth.Auth }}{{end}}
  {{ if $v.Auth.IdentityToken }}identitytoken = {{ printf "%q" $v.Auth.IdentityToken }}{{end}}
{{end}}
{{ if $v.TLS }}
[plugins."io.containerd.grpc.v1.cri".registry.configs."{{$k}}".tls]
  {{ if $v.TLS.CAFile }}ca_file = "{{ $v.TLS.CAFile }}"{{end}}
  {{ if $v.TLS.CertFile }}cert_file = "{{ $v.TLS.CertFile }}"{{end}}
  {{ if $v.TLS.KeyFile }}key_file = "{{ $v.TLS.KeyFile }}"{{end}}
  {{ if $v.TLS.InsecureSkipVerify }}insecure_skip_verify = true{{end}}
{{end}}
{{end}}
{{end}}

{{range $k, $v := .ExtraRuntimes}}
[plugins."io.containerd.grpc.v1.cri".containerd.runtimes."{{$k}}"]
  runtime_type = "{{$v.RuntimeType}}"
[plugins."io.containerd.grpc.v1.cri".containerd.runtimes."{{$k}}".options]
  BinaryName = "{{$v.BinaryName}}"
{{end}}

[plugins."io.containerd.tracing.processor.v1.otlp"]
  endpoint = "host.k3d.internal:4317"
  protocol = "grpc"
  insecure = true

[plugins."io.containerd.internal.v1.tracing"]
  sampling_ratio = 1.0
  service_name = "containerd"
```

After creating these files, open a terminal inside the `kubetracing` folder and
run `k3d` to create a cluster. Before running this command, replace the
`[CURRENT_PATH]` placeholder for the entire path of the `kubetracing` folder.
You can retrieve it by running the `echo $PWD` command in the terminal in that
folder.

```toml
k3d cluster create tracingcluster \
  --image=rancher/k3s:v1.27.1-k3s1 \
  --volume '[CURRENT_PATH]/config.toml.tmpl:/var/lib/rancher/k3s/agent/etc/containerd/config.toml.tmpl@server:*' \
  --volume '[CURRENT_PATH]/config:/etc/kube-tracing@server:*' \
  --k3s-arg '--kube-apiserver-arg=tracing-config-file=/etc/kube-tracing/apiserver-tracing.yaml@server:*' \
  --k3s-arg '--kube-apiserver-arg=feature-gates=APIServerTracing=true@server:*' \
  --k3s-arg '--kubelet-arg=config=/etc/kube-tracing/kubelet-tracing.yaml@server:*'
```

This command will create a Kubernetes cluster with version `v1.17.1`, and set up
in three docker containers on your machine. If you run the command
`kubectl cluster-info` now, you will see this output:

```bash
Kubernetes control plane is running at https://0.0.0.0:60503
CoreDNS is running at https://0.0.0.0:60503/api/v1/namespaces/kube-system/services/kube-dns:dns/proxy
Metrics-server is running at https://0.0.0.0:60503/api/v1/namespaces/kube-system/services/https:metrics-server:https/proxy
```

Going back to the logs of the Observability environment, you should see some
spans of internal Kubernetes operations being published in OpenTelemetry
Collector, like this:

```bash
Span #90
    Trace ID       : 03a7bf9008d54f02bcd4f14aa5438202
    Parent ID      :
    ID             : d7a10873192f7066
    Name           : KubernetesAPI
    Kind           : SPAN_KIND_SERVER
    Start time     : 2023-05-18 01:51:44.954563708 +0000 UTC
    End time       : 2023-05-18 01:51:44.957555323 +0000 UTC
    Status code    : STATUS_CODE_UNSET
    Status message :
Attributes:
     -> net.transport: STRING(ip_tcp)
     -> net.peer.ip: STRING(127.0.0.1)
     -> net.peer.port: INT(54678)
     -> net.host.ip: STRING(127.0.0.1)
     -> net.host.port: INT(6443)
     -> http.target: STRING(/api/v1/namespaces/kube-system/pods/helm-install-traefik-crd-8w4wd)
     -> http.server_name: STRING(KubernetesAPI)
     -> http.user_agent: STRING(k3s/v1.27.1+k3s1 (linux/amd64) kubernetes/bc5b42c)
     -> http.scheme: STRING(https)
     -> http.host: STRING(127.0.0.1:6443)
     -> http.flavor: STRING(2)
     -> http.method: STRING(GET)
     -> http.wrote_bytes: INT(4724)
     -> http.status_code: INT(200)
```

### Testing the Cluster Runtime

With the Observability environment and the Kubernetes cluster set up, you can
now trigger commands against Kubernetes and see traces of these actions in
Jaeger.

Open the browser, and navigate to the Jaeger UI located at
[http://localhost:16686/search](http://localhost:16686/search). You’ll see that
the `apiserver`, `containerd`, and `kubelet` services are publishing traces:

![Jaeger screen with services dropdown open showing apiserver, containerd and kubelet services as options](https://res.cloudinary.com/djwdcmwdz/image/upload/v1684855720/Blogposts/creating-kubernetes-cluster-with-observability/screely-1684855324762_kk25pv.png)

Choose `apiserver` and click on **"Find Traces”.** Here you see traces from the
Kubernetes control plane:

![Jaeger screen showing a list of spans found for apiserver](https://res.cloudinary.com/djwdcmwdz/image/upload/v1684855720/Blogposts/creating-kubernetes-cluster-with-observability/screely-1684855412765_xe7rnr.png)

Let’s run a sample command against Kubernetes with `kubectl`, like running an
echo:

```bash
kubectl run -it --rm --image=alpine echo-command -- echo Hi

# Output
# If you don't see a command prompt, try pressing enter.
# warning: couldn't attach to pod/echo-command, falling back to streaming logs: unable to upgrade connection: container echo-command not found in pod echo-command_default
# Hi
# pod "echo-command" deleted
```

And now, open Jaeger again, choose the `kubelet` service, operation `syncPod`,
and add the tag `k8s.pod=default/echo-command`, you should be able to see spans
related to this pod:

![Jaeger screen showing a list of spans found for the syncPod operation on kubelet service](https://res.cloudinary.com/djwdcmwdz/image/upload/v1684855720/Blogposts/creating-kubernetes-cluster-with-observability/screely-1684855456007_flekwn.png)

Expanding one trace, you’ll see the operations that created this pod:

![Jaeger screen showing a single syncPod expanded](https://res.cloudinary.com/djwdcmwdz/image/upload/v1684855720/Blogposts/creating-kubernetes-cluster-with-observability/screely-1684855488540_mvy0ga.png)

### Conclusion

Even in beta, both traces for
[kubelet](https://github.com/kubernetes/enhancements/tree/master/keps/sig-instrumentation/2831-kubelet-tracing)
and
[apiserver](https://github.com/kubernetes/enhancements/tree/master/keps/sig-instrumentation/647-apiserver-tracing)
can help a developer understand what’s happening under the hood in Kubernetes
and start debugging issues.

This will be helpful for developers that create custom tasks, like
[Kubernetes Operators](https://kubernetes.io/docs/concepts/extend-kubernetes/operator/)
that update internal resources to add more functionalities to Kubernetes.

[Tracetest](https://github.com/kubeshop/tracetest) is interested in seeing how
applying trace-based testing techniques to traces from the core Kubernetes
engine can be leveraged to verify expected functionality. With the current level
of observability being exposed by Kubernetes, we feel it is a bit early to work
to enable the execution of `kubectl` commands as one of the supported triggers
for a trace-based test. We did, however, want to publish our findings in order
to help others interested in seeing the current state of distributed tracing in
the Kubernetes engine.

You can find the examples that were used in this article
[here](https://github.com/kubeshop/tracetest/tree/main/examples/tracetesting-kubernetes/kubetracing)
and a brief description of them
[here](https://github.com/kubeshop/tracetest/blob/main/examples/tracetesting-kubernetes/setup-k8s-with-k3d.md).

### References

- [https://kubernetes.io/docs/concepts/cluster-administration/system-traces/](https://kubernetes.io/docs/concepts/cluster-administration/system-traces/)
- [https://github.com/containerd/containerd/blob/7def13d/docs/tracing.md](https://github.com/containerd/containerd/blob/7def13d/docs/tracing.md)
- [https://www.goglides.dev/kubernetesio/blog-boosting-kubernetes-container-runtime-observability-with-opentelemetry-3j7i](https://www.goglides.dev/kubernetesio/blog-boosting-kubernetes-container-runtime-observability-with-opentelemetry-3j7i)
- [https://opentelemetry.io/docs/collector/getting-started/](https://opentelemetry.io/docs/collector/getting-started/)
