---
title: OBI security, permissions, and capabilities
linkTitle: Security
description: Privileges and capabilities required by OBI
weight: 22
cSpell:ignore: BPF_PROG_TYPE_KPROBE CAP_PERFMON eksctl
---

OBI needs access to various Linux interfaces to instrument applications, such as
reading from the `/proc` filesystem, loading eBPF programs, and managing network
interface filters. Many of these operations require elevated permissions. The
simplest solution is to run OBI as root, however this might not work well in
setups where full root access isn't ideal. To address this, OBI is designed to
use only the specific Linux kernel capabilities needed for its current
configuration.

## Linux kernel capabilities

Linux kernel capabilities are a fine-grained system for controlling access to
privileged operations. They allow you to grant specific permissions to processes
without giving them full superuser or root access, which helps improve security
by adhering to the principle of least privilege. Capabilities split privileges
typically associated with root into smaller privileged operations in the kernel.

Capabilities are assigned to processes and executable files. By using tools like
`setcap`, administrators can assign specific capabilities to a binary, enabling
it to perform only the operations it needs without running as root. For example:

```shell
sudo setcap cap_net_admin,cap_net_raw+ep myprogram
```

This example grants the `CAP_NET_ADMIN` and `CAP_NET_RAW` capabilities to
`myprogram`, allowing it to manage network settings without requiring full
superuser privileges.

By carefully choosing and assigning capabilities you can lower the risk of
privilege escalation while still letting processes do what they need to.

More information can be found in the
[capabilities manual page](https://man7.org/linux/man-pages/man7/capabilities.7.html).

## OBI operation modes

OBI can operate in two distinct modes: _application observability_ and _network
observability_. These modes are not mutually exclusive and can be used together
as needed. For more details on enabling these modes, refer to the
[configuration documentation](../configure/options/).

OBI reads its configuration and checks for the required capabilities, if any are
missing it displays a warning, for example:

```shell
time=2025-01-27T17:21:20.197-06:00 level=WARN msg="Required system capabilities not present, OBI may malfunction" error="the following capabilities are required: CAP_DAC_READ_SEARCH, CAP_BPF, CAP_CHECKPOINT_RESTORE"
```

OBI then attempts to continue running, but missing capabilities may lead to
errors later on.

You can set `OBI_ENFORCE_SYS_CAPS=1`, which causes OBI to fail immediately if
the required capabilities are not available.

## List of capabilities required by OBI

OBI requires the following list of capabilities for its functionality:

| Capability               | Usage in OBI                                                                                                                                                                                                                      |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `CAP_BPF`                | Enables general BPF functionality and socket filter (`BPF_PROG_TYPE_SOCK_FILTER`) programs, used for capturing network flows in _network observability mode_.                                                                     |
| `CAP_NET_RAW`            | Used to create `AF_PACKET` raw sockets, which is the mechanism used to attach socket filter programs used for capturing network flows in _network observability mode_.                                                            |
| `CAP_NET_ADMIN`          | Required to load `BPF_PROG_TYPE_SCHED_CLS` TC programs - these programs are used for capturing network flows and for trace context propagation, both for _network and application observability_.                                 |
| `CAP_PERFMON`            | Used for trace context propagation, general _application observability_ and network flow monitoring. Allows direct packet access by TC programs, loading eBPF probes in the kernel and pointer arithmetic used by these programs. |
| `CAP_DAC_READ_SEARCH`    | Access to `/proc/self/mem` to determine kernel version, used by OBI to determine the appropriate set of supported features to enable.                                                                                             |
| `CAP_CHECKPOINT_RESTORE` | Access to symlinks in the `/proc` filesystem, used by OBI to obtain various process and system information.                                                                                                                       |
| `CAP_SYS_PTRACE`         | Access to `/proc/pid/exe` and executable modules, used by OBI to scan executable symbols and instrument different parts of a program.                                                                                             |
| `CAP_SYS_RESOURCE`       | Increase the amount of locked memory available, **kernels < 5.11** only                                                                                                                                                           |
| `CAP_SYS_ADMIN`          | Library-level Go trace-context propagation via `bpf_probe_write_user()` and access to BTF data by the BPF metrics exporter                                                                                                        |

### Performance monitoring tasks

Access to `CAP_PERFMON` is subject to `perf_events` access controls governed by
the `kernel.perf_event_paranoid` kernel setting, which can adjusted via `sysctl`
or by modifying the file `/proc/sys/kernel/perf_event_paranoid`. The default
setting for `kernel.perf_event_paranoid` is typically `2`, which is documented
under the `perf_event_paranoid` section in the
[kernel documentation](https://www.kernel.org/doc/Documentation/sysctl/kernel.txt)
and more comprehensively under
[the perf-security documentation](https://www.kernel.org/doc/Documentation/admin-guide/perf-security.rst).

Some Linux distributions define higher levels for `kernel.perf_event_paranoid`,
for example Debian based distributions
[also use](https://lwn.net/Articles/696216/) `kernel.perf_event_paranoid=3`,
which disallows access to `perf_event_open()` without `CAP_SYS_ADMIN`. If you
are running on a distribution with `kernel.perf_event_paranoid` setting higher
than `2`, you can either modify your configuration to lower it to `2` or use
`CAP_SYS_ADMIN` instead of `CAP_PERFMON`.

### Deploy on AKS/EKS

Both AKS and EKS environments come with kernels that by default set
`sys.perf_event_paranoid > 1`, which means OBI needs `CAP_SYS_ADMIN` to work,
refer to the section on how to
[monitor task performance](#performance-monitoring-tasks) for further
information.

If you prefer to use just `CAP_PERFMON`, you can configure your node to set
`kernel.perf_event_paranoid = 1`. We've provided a few examples of how to do
this, keep in mind that your results may vary depending on your specific setup.

#### AKS

##### Create AKS configuration file

```json
{
  "sysctls": {
    "kernel.sys_paranoid": "1"
  }
}
```

##### Create or update your AKS cluster

```sh
az aks create --name myAKSCluster --resource-group myResourceGroup --linux-os-config ./linuxosconfig.json
```

For more information, see
"[Customize node configuration for Azure Kubernetes Service (AKS) node pools](https://learn.microsoft.com/en-us/azure/aks/custom-node-configuration?tabs=linux-node-pools)"

#### EKS (using EKS Anywhere Configuration)

##### Create EKS Anywhere configuration file

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

##### Deploy or update your EKS Anywhere cluster

```sh
eksctl create cluster --config-file hostosconfig.yaml
```

#### EKS (modifying node group settings)

##### Update the node group

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

Use the AWS Management Console, AWS CLI, or `eksctl` to apply the updated
configuration to your EKS cluster.

For more information refer to the
[EKS host OS configuration documentation](https://anywhere.eks.amazonaws.com/docs/getting-started/optional/hostosconfig/).

## Example scenarios

The following example scenarios showcases how to run OBI as a non-root user:

### Network metrics via a socket filter

Required capabilities:

- `CAP_BPF`
- `CAP_NET_RAW`

Set the required capabilities and start OBI:

```shell
sudo setcap cap_bpf,cap_net_raw+ep ./bin/obi
OBI_NETWORK_METRICS=1 OBI_NETWORK_PRINT_FLOWS=1 bin/obi
```

### Network metrics via traffic control

Required capabilities:

- `CAP_BPF`
- `CAP_NET_ADMIN`
- `CAP_PERFMON`

Set the required capabilities and start OBI:

```shell
sudo setcap cap_bpf,cap_net_admin,cap_perfmon+ep ./bin/obi
OBI_NETWORK_METRICS=1 OBI_NETWORK_PRINT_FLOWS=1 OBI_NETWORK_SOURCE=tc bin/obi
```

### Application observability

Required capabilities:

- `CAP_BPF`
- `CAP_DAC_READ_SEARCH`
- `CAP_CHECKPOINT_RESTORE`
- `CAP_PERFMON`
- `CAP_NET_RAW`
- `CAP_SYS_PTRACE`

Set the required capabilities and start OBI:

```shell
sudo setcap cap_bpf,cap_dac_read_search,cap_perfmon,cap_net_raw,cap_sys_ptrace+ep ./bin/obi
OBI_OPEN_PORT=8080 OBI_TRACE_PRINTER=text bin/obi
```

### Application observability with trace context propagation

Required capabilities:

- `CAP_BPF`
- `CAP_DAC_READ_SEARCH`
- `CAP_CHECKPOINT_RESTORE`
- `CAP_PERFMON`
- `CAP_NET_RAW`
- `CAP_SYS_PTRACE`
- `CAP_NET_ADMIN`

Set the required capabilities and start OBI:

```shell
sudo setcap cap_bpf,cap_dac_read_search,cap_perfmon,cap_net_raw,cap_sys_ptrace,cap_net_admin+ep ./bin/obi
OBI_ENABLE_CONTEXT_PROPAGATION=all OBI_OPEN_PORT=8080 OBI_TRACE_PRINTER=text bin/obi
```

## Internal eBPF tracer capability requirement reference

OBI uses _tracers_, a set of eBPF programs that implement the underlying
functionality. A tracer may load and use different kinds of eBPF programs, each
requiring their own set of capabilities.

The list below maps each internal tracer to their required capabilities,
intended to serve as a reference for developers, contributors, and those
interested in the internals of OBI:

**(Network observability) Socket flow fetcher:**

- `CAP_BPF`: for `BPF_PROG_TYPE_SOCK_FILTER`
- `CAP_NET_RAW`: to create `AF_PACKET` socket and attaching socket filters to a
  network interface

**(Network observability) Flow fetcher (tc):**

- `CAP_BPF`
- `CAP_NET_ADMIN`: for loading `PROG_TYPE_SCHED_CLS` eBPF TC programs, used for
  inspecting network traffic
- `CAP_PERFMON`: for direct access to packet memory via `struct __sk_buff::data`
  and to allow pointer arithmetic in eBPF programs

**(Application observability) Watcher:**

- `CAP_BPF`
- `CAP_CHECKPOINT_RESTORE`
- `CAP_DAC_READ_SEARCH`: for access to `/proc/self/mem` to determine kernel
  version
- `CAP_PERFMON`: for loading `BPF_PROG_TYPE_KPROBE` eBPF programs that require
  pointer arithmetic

**(Application observability) Support for languages other than Go:**

- `CAP_BPF`
- `CAP_DAC_READ_SEARCH`
- `CAP_CHECKPOINT_RESTORE`
- `CAP_PERFMON`
- `CAP_NET_RAW`: to create `AF_PACKET` socket used to attach
  `obi_socket__http_filter` to network interfaces
- `CAP_SYS_PTRACE`: for access to `/proc/pid/exe` and other nodes in `/proc`

**(Application and network observability) network monitoring in TC mode and
context propagation:**

- `CAP_BPF`
- `CAP_DAC_READ_SEARCH`
- `CAP_PERFMON`
- `CAP_NET_ADMIN`: allows loading`BPF_PROG_TYPE_SCHED_CLS`,
  `BPF_PROG_TYPE_SOCK_OPS` and `BPF_PROG_TYPE_SK_MSG`, all used by trace context
  propagation and network monitoring

**(Application observability) GO tracer:**

- `CAP_BPF`
- `CAP_DAC_READ_SEARCH`
- `CAP_CHECKPOINT_RESTORE`
- `CAP_PERFMON`
- `CAP_NET_RAW`: to create `AF_PACKET` socket used to attach
  `obi_socket__http_filter` to network interfaces
- `CAP_SYS_PTRACE`: for access to `/proc/pid/exe` and other nodes in `/proc`
- `CAP_SYS_ADMIN`: for probe based (`bpf_probe_write_user()`) library level
  context propagation
