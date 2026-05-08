---
title: Configure OBI performance
linkTitle: Tune performance
description:
  Configure how the eBPF tracer component instruments HTTP and GRPC services of
  external processes and creates traces to forward to the next stage of the
  pipeline.
weight: 90
cSpell:ignore: qdisc ringbuffer
---

You can use the eBPF tracer to fine-tune OBI performance.

You can configure the component under the `ebpf` section of your YAML
configuration or with environment variables.

| YAML<br>environment variable                                      | Description                                                                                                                                                                       | Type    | Default |
| ----------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | ------- |
| `wakeup_len`<p>`OTEL_EBPF_BPF_WAKEUP_LEN`</p>                     | Sets how many messages OBI accumulates in the eBPF ring buffer before sending a wake-up request to user space. Refer to [wake up length](#wake-up-length).                        | int     | 500     |
| `traffic_control_backend`<p>`OTEL_EBPF_BPF_TC_BACKEND`</p>        | Selects the backend for attaching traffic control probes. Refer to the [traffic control backend](#traffic-control-backend) section for details.                                   | string  | `auto`  |
| `http_request_timeout`<p>`OTEL_EBPF_BPF_HTTP_REQUEST_TIMEOUT`</p> | Sets the time interval after which OBI considers an HTTP request a timeout. Refer to the [HTTP request timeout](#http-request-timeout) section for details.                       | string  | (0ms)   |
| `high_request_volume`<p>`OTEL_EBPF_BPF_HIGH_REQUEST_VOLUME`</p>   | Sends telemetry events as soon as OBI detects a response. Refer to the [high request volume](#high-request-volume) section for details.                                           | boolean | (false) |
| `maps_config.global_scale_factor`                                 | Scales eBPF map sizes in powers of two. Positive values grow map sizes, negative values shrink map sizes, and 0 keeps defaults. Refer to [eBPF map resizing](#ebpf-map-resizing). | int     | 0       |

## Wake up length

OBI accumulates messages in the eBPF ringbuffer and sends a wake-up request to
user space when it reaches this value.

For high-load services, set this option higher to reduce CPU overhead.

For low-load services, high values can delay when OBI submits metrics and when
they become visible.

## Traffic control backend

This option selects the backend for attaching traffic control probes. Linux 6.6
adds support for TCX, a file-descriptor based traffic control attachment. TCX is
more robust, doesn't require explicit qdisc management, and chains probes
deterministically. We recommend the `tcx` backend for kernels >= 6.6. When set
to `auto`, OBI chooses the best backend for your kernel.

Accepted backends: `tc`, `tcx`, and `auto`. If you leave this value empty or
unset, OBI uses `auto`.

## HTTP request timeout

This option sets how long OBI waits before considering an HTTP request a
timeout. OBI can report HTTP transactions that time out and never return. Set
this option to a non-zero value to enable automatic HTTP request timeouts. When
a request times out, OBI reports HTTP status code 408. Disconnects can look like
timeouts, so setting this value may increase your request averages.

## High request volume

This option makes OBI send telemetry events as soon as it detects a response. It
reduces timing accuracy for requests with large responses, but in high-volume
scenarios, it helps reduce dropped trace events.

## eBPF map resizing

The `maps_config.global_scale_factor` option allows you to dynamically resize
eBPF map sizes at runtime to tune performance based on your workload
characteristics.

- **Values > 0** increase map sizes by powers of two (for example, `1` means 2x,
  `2` means 4x).
- **Values < 0** decrease map sizes by powers of two (for example, `-1` means
  1/2x, `-2` means 1/4x).
- **Default value: `0`** keeps the standard map sizes.
- Valid range: `-3` to `3`.

Example configuration:

```yaml
ebpf:
  maps_config:
    global_scale_factor: 1 # Double the default map sizes
```

This is particularly useful in containerized or Kubernetes environments where
resource constraints may require careful tuning of eBPF memory usage.
