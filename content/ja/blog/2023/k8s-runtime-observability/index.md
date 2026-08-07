---
title: ランタイムオブザーバビリティを備えた Kubernetes クラスターの作成
linkTitle: K8s ランタイムオブザーバビリティ
date: 2023-06-05
author: '[Daniel Dias](https://github.com/danielbdias) (Tracetest)'
body_class: otel-with-contributions-from
default_lang_commit: 9d540b6cae6a5955f8f051fd876a1a42573ae33b
# prettier-ignore
cSpell:ignore: Adnan apiserver apparmor choren containerd Hamric healthcheck identitytoken keychain kube kubelet kubetracing Rahić runc snapshotter stargz tracetest tracingcluster
---

[Sebastian Choren](https://github.com/schoren)、
[Adnan Rahić](https://github.com/adnanrahic)、
[Ken Hamric](https://github.com/kdhamric) の協力のもと執筆。

[Kubernetes](https://kubernetes.io/) は、クラウドネイティブ領域で広く使われているオープンソースシステムであり、クラウド上でコンテナ化されたアプリケーションをデプロイおよびスケールする方法を提供します。
ログやメトリクスを観測する機能は[よく知られドキュメント化されています](https://kubernetes.io/docs/tasks/debug/debug-cluster/resource-usage-monitoring/)が、アプリケーショントレースに関するオブザーバビリティは新しい取り組みです。

以下は、Kubernetes エコシステムにおける最近の動向の概要です。

- 最初の議論は 2018年12月に始まり、[計装の実装](https://github.com/Monkeyanator/kubernetes/pull/15) に関する最初の PR が作成されました。
- KEP（Kubernetes Enhancement Proposal）が 2020年1月に作成され、のちに API Server にスコープが絞られました
  （[KEP 647 - API Server Tracing](https://github.com/kubernetes/enhancements/tree/f52255413e79b6905fd074370611c0841cb8effe/keps/sig-instrumentation/647-apiserver-tracing?from_branch=master)）。
  一方、Kubelet 向けの新しい KEP が 2021年7月に提案されました
  （[KEP 2831 Kubelet Tracing](https://github.com/kubernetes/enhancements/tree/f52255413e79b6905fd074370611c0841cb8effe/keps/sig-instrumentation/2831-kubelet-tracing?from_branch=master)）。
- [etcd](https://github.com/etcd-io/etcd)（Kubernetes が内部データストアとして使用）は、2020年11月にトレーシングの議論を開始し
  （[Add Distributed Tracing using OpenTelemetry](https://github.com/etcd-io/etcd/issues/12460)）、
  2021年5月に[最初のバージョンがマージ](https://github.com/etcd-io/etcd/pull/12919)されました。
- Kubernetes の 2 つの Container Runtime Interface である [containerd](https://github.com/containerd/containerd) と
  [CRI-O](https://github.com/cri-o/cri-o) は、2021年にトレーシングの実装を開始しました
  （[CRI-O は 2021年4月](https://github.com/cri-o/cri-o/issues/4734)、
  [containerd は 2021年8月](https://github.com/containerd/containerd/pull/5731)）。
- API Server トレーシングは、
  [v1.22 でアルファ版](https://github.com/kubernetes/enhancements/blob/f52255413e79b6905fd074370611c0841cb8effe/keps/sig-instrumentation/647-apiserver-tracing/kep.yaml?from_branch=master#L26)
  （2021年8月）としてリリースされ、
  [v1.27 でベータ版](https://github.com/kubernetes/kubernetes/blob/29e4f5a893bf47c608aa8593ae6e67d20b0fd775/CHANGELOG/CHANGELOG-1.27.md?from_branch=master)
  （2023年4月）としてリリースされました。
- Kubelet トレーシングは、
  [v1.25 でアルファ版](https://github.com/kubernetes/enhancements/blob/f52255413e79b6905fd074370611c0841cb8effe/keps/sig-instrumentation/2831-kubelet-tracing/kep.yaml?from_branch=master#L29)
  （2022年8月）としてリリースされ、
  [v1.27 でベータ版](https://github.com/kubernetes/kubernetes/blob/29e4f5a893bf47c608aa8593ae6e67d20b0fd775/CHANGELOG/CHANGELOG-1.27.md?from_branch=master)
  （2023年4月）としてリリースされました。

Kubernetes でのトレーシングの現状を調査する中で、有効化する方法をドキュメント化した記事がほとんどないことがわかりました。
たとえば、`kubelet` のオブザーバビリティに関する [Kubernetes ブログの記事](https://kubernetes.io/blog/2022/12/01/runtime-observability-opentelemetry/) がある程度です。
そこで、私たちの調査結果をドキュメント化し、ローカルで Kubernetes をセットアップしてトレースを確認するための手順を提供することにしました。

この記事では、Kubernetes の計装を使って、API
（[kube-apiserver](https://kubernetes.io/docs/concepts/overview/components/#kube-apiserver)）、
ノードエージェント
（[kubelet](https://kubernetes.io/docs/concepts/overview/components/#kubelet)）、
コンテナランタイム（[containerd](https://github.com/containerd/containerd)）のトレースを観測する方法を学びます。
ローカルのオブザーバビリティ環境をセットアップし、その後トレーシングを有効にした Kubernetes をローカルにインストールします。

まず、ローカルマシンに以下のツールをインストールしてください。

- [Docker](https://www.docker.com/): コンテナ化された環境を実行できるコンテナ環境
- [k3d](https://k3d.io/): [k3s](https://k3s.io/)（軽量な Kubernetes ディストリビューション）を Docker で実行するためのラッパー
- [kubectl](https://kubernetes.io/docs/reference/kubectl/): クラスターとやり取りするための Kubernetes CLI

## トレースを監視するためのオブザーバビリティスタックのセットアップ {#setting-up-an-observability-stack-to-monitor-traces}

オブザーバビリティスタックをセットアップするために、OpenTelemetry（OTel）[Collector](/docs/collector/) を実行します。
これは、さまざまなアプリからテレメトリーデータを受信し、トレーシングバックエンドに送信するツールです。
トレーシングバックエンドとして、トレースを収集しクエリできるオープンソースツールである [Jaeger](https://www.jaegertracing.io/) を使用します。

マシン上に `kubetracing` というディレクトリを作成し、
[otel-collector.yaml](https://github.com/kubeshop/tracetest/blob/33151f8df4bf708856ab9c564d849486eb45bbe2/examples/tracetesting-kubernetes/kubetracing/otel-collector.yaml?from_branch=main)
というファイルを作成します。
以下のスニペットの内容をコピーして、任意のフォルダに保存してください。

このファイルは、OpenTelemetry Collector が OpenTelemetry 形式でトレースを受信し、Jaeger にエクスポートするように設定します。

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
  otlp/jaeger:
    endpoint: jaeger:4317
    tls:
      insecure: true
service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [probabilistic_sampler, batch]
      exporters: [otlp/jaeger, logging]
```

次に、同じフォルダに
[docker-compose.yaml](https://github.com/kubeshop/tracetest/blob/87c20b32e8cb0447e922037ba659ef487fc88369/examples/tracetesting-kubernetes/kubetracing/docker-compose.yaml?from_branch=main)
ファイルを作成します。
このファイルには、Jaeger 用と OpenTelemetry Collector 用の 2 つのコンテナが含まれます。

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
    environment:
      - COLLECTOR_OTLP_ENABLED=true
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

次に、`kubetracing` フォルダで以下のコマンドを実行してオブザーバビリティ環境を起動します。

```bash
docker compose up
```

これにより、Jaeger と OpenTelemetry Collector の両方が起動し、他のアプリからトレースを受信できるようになります。

## ランタイムオブザーバビリティを備えた Kubernetes クラスターの作成 {#creating-a-kubernetes-cluster-with-runtime-observability}

オブザーバビリティ環境のセットアップが完了したら、`kube-apiserver`、`kubelet`、`containerd` で OpenTelemetry トレーシングを有効にするための設定ファイルを作成します。

`kubetracing` フォルダ内に `config` というサブフォルダを作成し、以下の 2 つのファイルを配置します。

1 つ目は
[apiserver-tracing.yaml](https://github.com/kubeshop/tracetest/blob/efb642fd82fb4187a8c14522bbcfc01d7f5739a6/examples/tracetesting-kubernetes/kubetracing/config/apiserver-tracing.yaml?from_branch=main)
で、Kubernetes API の実行データを含むトレースをエクスポートするために `kube-apiserver` が使用するトレーシング設定が含まれています。
この設定では、`samplingRatePerMillion` 設定を使って API がトレースの 100% を送信するように設定します。
エンドポイントを `host.k3d.internal:4317` に設定して、`k3d/k3s` で作成されたクラスターがマシン上の別の API を呼び出せるようにします。
この場合、`docker compose` でポート `4317` にデプロイされた OpenTelemetry Collector です。

```yaml
apiVersion: apiserver.config.k8s.io/v1beta1
kind: TracingConfiguration
endpoint: host.k3d.internal:4317
samplingRatePerMillion: 1000000 # 100%
```

2 つ目のファイルは
[kubelet-tracing.yaml](https://github.com/kubeshop/tracetest/blob/efb642fd82fb4187a8c14522bbcfc01d7f5739a6/examples/tracetesting-kubernetes/kubetracing/config/kubelet-tracing.yaml?from_branch=main)
で、`kubelet` の追加設定を提供します。
ここでは、フィーチャーフラグ `KubeletTracing`（この記事の執筆時点での最新バージョンである Kubernetes 1.27 のベータ機能）を有効にし、`kube-apiserver` と同じトレーシング設定を行います。

```yaml
apiVersion: kubelet.config.k8s.io/v1beta1
kind: KubeletConfiguration
featureGates:
  KubeletTracing: true
tracing:
  endpoint: host.k3d.internal:4317
  samplingRatePerMillion: 1000000 # 100%
```

`kubetracing` フォルダに戻り、最後のファイル
[config.toml.tmpl](https://github.com/kubeshop/tracetest/blob/33151f8df4bf708856ab9c564d849486eb45bbe2/examples/tracetesting-kubernetes/kubetracing/config.toml.tmpl?from_branch=main)
を作成します。
これは、`k3s` が `containerd` を設定するために使用するテンプレートファイルです。
このファイルは `k3s` が使用するデフォルト設定に似ていますが、ファイルの末尾に `containerd` がトレースを送信するように設定する 2 つのセクションが追加されています。

```go-html-template
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

これらのファイルを作成したら、`kubetracing` フォルダ内でターミナルを開き、`k3d` を実行してクラスターを作成します。
このコマンドを実行する前に、`[CURRENT_PATH]` プレースホルダーを `kubetracing` フォルダの完全なパスに置き換えてください。
そのフォルダ内のターミナルで `echo $PWD` コマンドを実行するとパスを取得できます。

```bash
k3d cluster create tracingcluster \
  --image=rancher/k3s:v1.27.1-k3s1 \
  --volume '[CURRENT_PATH]/config.toml.tmpl:/var/lib/rancher/k3s/agent/etc/containerd/config.toml.tmpl@server:*' \
  --volume '[CURRENT_PATH]/config:/etc/kube-tracing@server:*' \
  --k3s-arg '--kube-apiserver-arg=tracing-config-file=/etc/kube-tracing/apiserver-tracing.yaml@server:*' \
  --k3s-arg '--kube-apiserver-arg=feature-gates=APIServerTracing=true@server:*' \
  --k3s-arg '--kubelet-arg=config=/etc/kube-tracing/kubelet-tracing.yaml@server:*'
```

このコマンドは、バージョン `v1.27.1` の Kubernetes クラスターを作成し、マシン上の 3 つの Docker コンテナにセットアップします。
ここで `kubectl cluster-info` コマンドを実行すると、以下の出力が表示されます。

```text
Kubernetes control plane is running at https://0.0.0.0:60503
CoreDNS is running at https://0.0.0.0:60503/api/v1/namespaces/kube-system/services/kube-dns:dns/proxy
Metrics-server is running at https://0.0.0.0:60503/api/v1/namespaces/kube-system/services/https:metrics-server:https/proxy
```

オブザーバビリティ環境のログに戻ると、Kubernetes の内部オペレーションのスパンが OpenTelemetry Collector に送信されているのが確認できるはずです。
以下はその例です。

```text
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

## クラスターランタイムのテスト {#testing-the-cluster-runtime}

オブザーバビリティ環境と Kubernetes クラスターのセットアップが完了したので、Kubernetes に対してコマンドを実行し、Jaeger でこれらのアクションのトレースを確認できます。

ブラウザを開き、<http://localhost:16686/search> にある Jaeger UI に移動します。
`apiserver`、`containerd`、`kubelet` サービスがトレースを公開していることが確認できます。

![apiserver、containerd、kubelet サービスがオプションとして表示されている Jaeger のサービスドロップダウン画面](k8s-services-reported-on-jaeger.png)

`apiserver` を選択し、**「Find Traces」** をクリックします。
ここで Kubernetes コントロールプレーンからのトレースが確認できます。

![apiserver で見つかったスパンのリストを表示する Jaeger 画面](spans-found-for-apiserver.png)

`kubectl` を使って Kubernetes に対してサンプルコマンドを実行してみましょう。
たとえば echo の実行です。

```console
$ kubectl run -it --rm --restart=Never --image=alpine echo-command -- echo hi

# 出力
# コマンドプロンプトが表示されない場合は、Enter キーを押してみてください。
# warning: couldn't attach to pod/echo-command, falling back to streaming logs: unable to upgrade connection: container echo-command not found in pod echo-command_default
# Hi
# pod "echo-command" deleted
```

次に、Jaeger を再度開き、`kubelet` サービス、オペレーション `syncPod` を選択し、タグ `k8s.pod=default/echo-command` を追加すると、この Pod に関連するスパンが表示されるはずです。

![kubelet サービスの syncPod オペレーションで見つかったスパンのリストを表示する Jaeger 画面](syncpod-operations-on-kubelet.png)

トレースを展開すると、この Pod を作成したオペレーションが確認できます。

![単一の syncPod を展開した Jaeger 画面](single-syncpod-expanded.png)

## まとめ {#conclusion}

ベータ版であっても、
[kubelet](https://github.com/kubernetes/enhancements/tree/f52255413e79b6905fd074370611c0841cb8effe/keps/sig-instrumentation/2831-kubelet-tracing?from_branch=master)
と
[apiserver](https://github.com/kubernetes/enhancements/tree/f52255413e79b6905fd074370611c0841cb8effe/keps/sig-instrumentation/647-apiserver-tracing?from_branch=master)
の両方のトレースは、開発者が Kubernetes 内部で何が起きているかを理解し、問題のデバッグを始めるのに役立ちます。

これは、内部リソースを更新して Kubernetes に機能を追加する
[Kubernetes Operators](https://kubernetes.io/docs/concepts/extend-kubernetes/operator/)
のようなカスタムタスクを作成する開発者にとって有用です。

オブザーバビリティ分野のオープンソースツールの構築に注力するチームとして、OpenTelemetry コミュニティ全体を支援する機会は私たちにとって重要でした。
そのため、Kubernetes のコアエンジンからトレースを収集する新しい方法を研究していました。
Kubernetes が公開しているオブザーバビリティの現在のレベルを踏まえ、Kubernetes エンジンにおける分散トレーシングの現状に関心を持つ他の人々を支援するために、私たちの調査結果を公開したいと考えました。
Daniel Dias と Sebastian Choren は、OpenTelemetry を使って分散システムの開発とテストを行えるオープンソースツールである Tracetest に取り組んでいます。
Tracetest はあらゆる OTel 互換システムで動作し、トレースベースのテストを作成できます。
<https://github.com/kubeshop/tracetest> で確認してください。

この記事で使用した
[サンプルソース](https://github.com/kubeshop/tracetest/tree/87c20b32e8cb0447e922037ba659ef487fc88369/examples/tracetesting-kubernetes/kubetracing?from_branch=main)
と
[セットアップ手順](https://github.com/kubeshop/tracetest/blob/33151f8df4bf708856ab9c564d849486eb45bbe2/examples/tracetesting-kubernetes/setup-k8s-with-k3d.md?from_branch=main)
は Tracetest リポジトリから入手できます。

## 参考文献 {#references}

- [Traces For Kubernetes System Components](https://kubernetes.io/docs/concepts/cluster-administration/system-traces/)
- [Tracing on ContainerD](https://github.com/containerd/containerd/blob/459a95287ba66a0cde820435e9883bc3b0d0ab17/docs/tracing.md?from_branch=main)
- [Kubernetes: Tools for Monitoring Resources](https://kubernetes.io/docs/tasks/debug/debug-cluster/resource-usage-monitoring/)
- [OTel Collector quick start](/docs/collector/quick-start/)
- [Boosting Kubernetes container runtime observability with OpenTelemetry](https://kubernetes.io/blog/2022/12/01/runtime-observability-opentelemetry/)
