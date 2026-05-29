---
title: OBI のセキュリティ、権限、ケーパビリティ
linkTitle: セキュリティ
description: OBI が必要とする権限とケーパビリティ
weight: 22
default_lang_commit: 813498074d85258c7180d137ace9e272d0149353
cSpell:ignore: BPF_PROG_TYPE_KPROBE CAP_PERFMON eksctl
---

OBI は、アプリケーションを計装するためにさまざまな Linux インターフェイスへのアクセスを必要とします。
たとえば、`/proc` ファイルシステムからの読み取り、eBPF プログラムのロード、ネットワークインターフェイスフィルターの管理などです。
これらの操作の多くには、昇格された権限が必要です。
最もシンプルな解決策は OBI を root として実行することですが、これは完全な root アクセスが理想的でない構成ではうまく機能しない可能性があります。
これに対処するため、OBI は現在の構成に必要な Linux カーネルケーパビリティだけを使うように設計されています。

## Linux カーネルケーパビリティ {#linux-kernel-capabilities}

Linux カーネルケーパビリティは、特権操作へのアクセスを制御するためのきめ細かな仕組みです。
プロセスにフルのスーパーユーザーまたは root アクセスを与えずに特定の権限のみを付与できるため、最小権限の原則に従ってセキュリティを高めるのに役立ちます。
ケーパビリティは、通常 root に関連付けられている権限を、カーネル内のより小さな特権操作に分割します。

ケーパビリティはプロセスや実行可能ファイルに割り当てられます。
管理者は `setcap` のようなツールを使うことで、バイナリに特定のケーパビリティを割り当てて、root として実行することなく必要な操作のみを実行できるようにできます。
例として次のような形です。

```shell
sudo setcap cap_net_admin,cap_net_raw+ep myprogram
```

この例では、`myprogram` に `CAP_NET_ADMIN` と `CAP_NET_RAW` ケーパビリティを付与しており、完全なスーパーユーザー権限を必要とせずにネットワーク設定を管理できるようにしています。

ケーパビリティを慎重に選択して割り当てることで、特権昇格のリスクを下げつつ、プロセスに必要な操作を許可できます。

詳細については [ケーパビリティのマニュアルページ](https://man7.org/linux/man-pages/man7/capabilities.7.html) を参照してください。

## OBI の動作モード {#obi-operation-modes}

OBI は _アプリケーションオブザーバビリティ_ と _ネットワークオブザーバビリティ_ の 2 つの異なるモードで動作します。
これらのモードは排他的ではなく、必要に応じて組み合わせて使用できます。
これらのモードを有効化する詳細については、[設定のドキュメント](../configure/options/) を参照してください。

OBI は構成を読み取り、必要なケーパビリティが揃っているかを確認します。
不足しているものがあれば、たとえば次のような警告を表示します。

```shell
time=2025-01-27T17:21:20.197-06:00 level=WARN msg="Required system capabilities not present, OBI may malfunction" error="the following capabilities are required: CAP_DAC_READ_SEARCH, CAP_BPF, CAP_CHECKPOINT_RESTORE"
```

その後、OBI は動作を継続しようとしますが、不足しているケーパビリティによって後でエラーが発生する場合があります。

`OTEL_EBPF_ENFORCE_SYS_CAPS=1` を設定すると、必要なケーパビリティが利用できない場合に OBI を即座に失敗させることができます。

## OBI が必要とするケーパビリティの一覧 {#list-of-capabilities-required-by-obi}

OBI は機能のために以下のケーパビリティのリストを必要とします。

| ケーパビリティ           | OBI での用途                                                                                                                                                                                                                                       |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `CAP_BPF`                | BPF の一般機能と、_ネットワークオブザーバビリティモード_ でネットワークフロー収集に使用するソケットフィルター (`BPF_PROG_TYPE_SOCK_FILTER`) プログラムを有効にします。                                                                             |
| `CAP_NET_RAW`            | _ネットワークオブザーバビリティモード_ でネットワークフローを収集するソケットフィルタープログラムをアタッチするための `AF_PACKET` raw ソケットを作成するために使用されます。                                                                       |
| `CAP_NET_ADMIN`          | `BPF_PROG_TYPE_SCHED_CLS` TC プログラムのロードに必要です。これらのプログラムは、_ネットワークおよびアプリケーションオブザーバビリティ_ の両方で、ネットワークフロー収集とトレースコンテキスト伝搬に使用されます。                                 |
| `CAP_PERFMON`            | トレースコンテキスト伝搬、一般的な _アプリケーションオブザーバビリティ_、ネットワークフロー監視に使用されます。TC プログラムによるパケットへの直接アクセス、カーネルへの eBPF プローブのロード、これらのプログラムによるポインタ演算を許可します。 |
| `CAP_DAC_READ_SEARCH`    | カーネルバージョンを判定するために `/proc/self/mem` へのアクセスを許可します。OBI が有効化可能な機能セットを判定するために使用されます。                                                                                                           |
| `CAP_CHECKPOINT_RESTORE` | `/proc` ファイルシステム内のシンボリックリンクへのアクセスを許可します。OBI がプロセスやシステムの各種情報を取得するために使用されます。                                                                                                           |
| `CAP_SYS_PTRACE`         | `/proc/pid/exe` および実行可能モジュールへのアクセスを許可します。OBI が実行可能ファイルのシンボルをスキャンし、プログラムのさまざまな部分を計装するために使用されます。                                                                           |
| `CAP_SYS_RESOURCE`       | ロックされたメモリの量を増やします。**カーネル 5.11 未満** でのみ必要です                                                                                                                                                                          |
| `CAP_SYS_ADMIN`          | `bpf_probe_write_user()` を用いたライブラリレベルの Go トレースコンテキスト伝搬と、BPF メトリクスエクスポーターによる BTF データへのアクセスに使用されます                                                                                         |

### パフォーマンス監視タスク {#performance-monitoring-tasks}

`CAP_PERFMON` へのアクセスは、`kernel.perf_event_paranoid` カーネル設定によって管理される `perf_events` アクセス制御に従います。
この設定は `sysctl` 経由で、またはファイル `/proc/sys/kernel/perf_event_paranoid` を変更して調整できます。
`kernel.perf_event_paranoid` のデフォルト設定は通常 `2` であり、[カーネルドキュメント](https://www.kernel.org/doc/Documentation/sysctl/kernel.txt) の `perf_event_paranoid` セクション、およびより包括的には [perf-security ドキュメント](https://www.kernel.org/doc/Documentation/admin-guide/perf-security.rst) に記載されています。

一部の Linux ディストリビューションでは、`kernel.perf_event_paranoid` により高いレベルを設定しています。
たとえば、Debian ベースのディストリビューションは [`kernel.perf_event_paranoid=3` も使用](https://lwn.net/Articles/696216/) しており、これにより `CAP_SYS_ADMIN` なしでは `perf_event_open()` へのアクセスが禁止されます。
`kernel.perf_event_paranoid` の設定が `2` より高いディストリビューションで実行している場合は、構成を変更して `2` に下げるか、`CAP_PERFMON` のかわりに `CAP_SYS_ADMIN` を使用できます。

### AKS/EKS へのデプロイ {#deploy-on-akseks}

AKS と EKS の環境は、いずれもデフォルトで `sys.perf_event_paranoid > 1` を設定したカーネルが付属しています。
これは OBI の動作に `CAP_SYS_ADMIN` が必要になることを意味します。
詳細については [パフォーマンス監視タスク](#performance-monitoring-tasks) のセクションを参照してください。

`CAP_PERFMON` のみを使用したい場合は、ノードに `kernel.perf_event_paranoid = 1` を設定できます。
これを行う方法の例をいくつか紹介しますが、結果は具体的なセットアップによって異なる可能性があることに注意してください。

#### AKS {#aks}

##### AKS 設定ファイルの作成 {#create-aks-configuration-file}

```json
{
  "sysctls": {
    "kernel.sys_paranoid": "1"
  }
}
```

##### AKS クラスタの作成または更新 {#create-or-update-your-aks-cluster}

```sh
az aks create --name myAKSCluster --resource-group myResourceGroup --linux-os-config ./linuxosconfig.json
```

詳細については「[Azure Kubernetes Service (AKS) ノードプールのノード構成のカスタマイズ](https://learn.microsoft.com/en-us/azure/aks/custom-node-configuration?tabs=linux-node-pools)」を参照してください。

#### EKS (EKS Anywhere 構成を使用) {#eks-using-eks-anywhere-configuration}

##### EKS Anywhere 設定ファイルの作成 {#create-eks-anywhere-configuration-file}

```yaml
apiVersion: anywhere.eks.amazonaws.com/v1alpha1
kind: VSphereMachineConfig
metadata:
  name: machine-config
spec:
  hostOSConfiguration:
    kernel:
      sysctlSettings:
        kernel.sys_paranoid: '1'
```

##### EKS Anywhere クラスタのデプロイまたは更新 {#deploy-or-update-your-eks-anywhere-cluster}

```sh
eksctl create cluster --config-file hostosconfig.yaml
```

#### EKS (ノードグループ設定の変更) {#eks-modifying-node-group-settings}

##### ノードグループの更新 {#update-the-node-group}

```yaml
apiVersion: eks.eks.amazonaws.com/v1beta1
kind: ClusterConfig
...
nodeGroups:
  - ...
    os: Bottlerocket
    eksconfig:
      ...
      sysctls:
        kernel.sys_paranoid: "1"
```

AWS マネジメントコンソール、AWS CLI、または `eksctl` を使用して、更新した構成を EKS クラスタに適用します。

詳細については [EKS のホスト OS 設定ドキュメント](https://anywhere.eks.amazonaws.com/docs/getting-started/optional/hostosconfig/) を参照してください。

## サンプルシナリオ {#example-scenarios}

以下のサンプルシナリオは、OBI を非 root ユーザーとして実行する方法を示しています。

### ソケットフィルター経由のネットワークメトリクス {#network-metrics-via-a-socket-filter}

必要なケーパビリティ:

- `CAP_BPF`
- `CAP_NET_RAW`

必要なケーパビリティを設定して OBI を起動します。

```shell
sudo setcap cap_bpf,cap_net_raw+ep ./bin/obi
OTEL_EBPF_NETWORK_METRICS=1 OTEL_EBPF_NETWORK_PRINT_FLOWS=1 bin/obi
```

### トラフィック制御経由のネットワークメトリクス {#network-metrics-via-traffic-control}

必要なケーパビリティ:

- `CAP_BPF`
- `CAP_NET_ADMIN`
- `CAP_PERFMON`

必要なケーパビリティを設定して OBI を起動します。

```shell
sudo setcap cap_bpf,cap_net_admin,cap_perfmon+ep ./bin/obi
OTEL_EBPF_NETWORK_METRICS=1 OTEL_EBPF_NETWORK_PRINT_FLOWS=1 OTEL_EBPF_NETWORK_SOURCE=tc bin/obi
```

### アプリケーションオブザーバビリティ {#application-observability}

必要なケーパビリティ:

- `CAP_BPF`
- `CAP_DAC_READ_SEARCH`
- `CAP_CHECKPOINT_RESTORE`
- `CAP_PERFMON`
- `CAP_NET_RAW`
- `CAP_SYS_PTRACE`

必要なケーパビリティを設定して OBI を起動します。

```shell
sudo setcap cap_bpf,cap_dac_read_search,cap_perfmon,cap_net_raw,cap_sys_ptrace+ep ./bin/obi
OTEL_EBPF_OPEN_PORT=8080 OTEL_EBPF_TRACE_PRINTER=text bin/obi
```

### トレースコンテキスト伝搬を含むアプリケーションオブザーバビリティ {#application-observability-with-trace-context-propagation}

必要なケーパビリティ:

- `CAP_BPF`
- `CAP_DAC_READ_SEARCH`
- `CAP_CHECKPOINT_RESTORE`
- `CAP_PERFMON`
- `CAP_NET_RAW`
- `CAP_SYS_PTRACE`
- `CAP_NET_ADMIN`

必要なケーパビリティを設定して OBI を起動します。

```shell
sudo setcap cap_bpf,cap_dac_read_search,cap_perfmon,cap_net_raw,cap_sys_ptrace,cap_net_admin+ep ./bin/obi
OTEL_EBPF_CONTEXT_PROPAGATION=all OTEL_EBPF_OPEN_PORT=8080 OTEL_EBPF_TRACE_PRINTER=text bin/obi
```

## 内部 eBPF トレーサーのケーパビリティ要件リファレンス {#internal-ebpf-tracer-capability-requirement-reference}

OBI は _トレーサー_ と呼ばれる、基盤となる機能を実装する eBPF プログラム群を使用します。
トレーサーはさまざまな種類の eBPF プログラムをロードして使用することがあり、それぞれが独自のケーパビリティセットを必要とします。

以下のリストは、各内部トレーサーと必要なケーパビリティの対応を示すもので、開発者、コントリビューター、OBI 内部に関心のある人向けのリファレンスとして提供しています。

**(ネットワークオブザーバビリティ) ソケットフローフェッチャー:**

- `CAP_BPF`: `BPF_PROG_TYPE_SOCK_FILTER` 用
- `CAP_NET_RAW`: `AF_PACKET` ソケットを作成し、ネットワークインターフェイスにソケットフィルターをアタッチするため

**(ネットワークオブザーバビリティ) フローフェッチャー (tc):**

- `CAP_BPF`
- `CAP_NET_ADMIN`: ネットワークトラフィックを検査する `PROG_TYPE_SCHED_CLS` eBPF TC プログラムをロードするため
- `CAP_PERFMON`: `struct __sk_buff::data` を介したパケットメモリへの直接アクセス、および eBPF プログラム内のポインタ演算を許可するため

**(アプリケーションオブザーバビリティ) ウォッチャー:**

- `CAP_BPF`
- `CAP_CHECKPOINT_RESTORE`
- `CAP_DAC_READ_SEARCH`: カーネルバージョンを判定するための `/proc/self/mem` へのアクセス用
- `CAP_PERFMON`: ポインタ演算を必要とする `BPF_PROG_TYPE_KPROBE` eBPF プログラムをロードするため

**(アプリケーションオブザーバビリティ) Go 以外の言語サポート:**

- `CAP_BPF`
- `CAP_DAC_READ_SEARCH`
- `CAP_CHECKPOINT_RESTORE`
- `CAP_PERFMON`
- `CAP_NET_RAW`: ネットワークインターフェイスに `obi_socket__http_filter` をアタッチするための `AF_PACKET` ソケットを作成するため
- `CAP_SYS_PTRACE`: `/proc/pid/exe` および `/proc` 内の他のノードへのアクセスのため

**(アプリケーションおよびネットワークオブザーバビリティ) TC モードでのネットワーク監視とコンテキスト伝搬:**

- `CAP_BPF`
- `CAP_DAC_READ_SEARCH`
- `CAP_PERFMON`
- `CAP_NET_ADMIN`: トレースコンテキスト伝搬とネットワーク監視で使用される `BPF_PROG_TYPE_SCHED_CLS`、`BPF_PROG_TYPE_SOCK_OPS`、`BPF_PROG_TYPE_SK_MSG` のロードを許可するため

**(アプリケーションオブザーバビリティ) Go トレーサー:**

- `CAP_BPF`
- `CAP_DAC_READ_SEARCH`
- `CAP_CHECKPOINT_RESTORE`
- `CAP_PERFMON`
- `CAP_NET_RAW`: ネットワークインターフェイスに `obi_socket__http_filter` をアタッチするための `AF_PACKET` ソケットを作成するため
- `CAP_SYS_PTRACE`: `/proc/pid/exe` および `/proc` 内の他のノードへのアクセスのため
- `CAP_SYS_ADMIN`: プローブベース (`bpf_probe_write_user()`) のライブラリレベルでのコンテキスト伝搬のため
