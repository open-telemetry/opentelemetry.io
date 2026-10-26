---
title: 'Deprecating the Collector Batch Processor'
linkTitle: 'Deprecating the Collector Batch Processor'
date: 2026-10-6
author: >-
  [Bogdan Drutu](https://github.com/bogdandrutu),
  [Dmitry Anoshin](https://github.com/dmitryax), and
  [Joshua MacDonald](https://github.com/jmacd).
draft: true
issue: 12069
sig: Collector SIG
# prettier-ignore
cSpell:ignore: Adii Aditya Anitha Anoshin Baeyens Blancas block_on_overflow Chethan Drutu flush_timeout Gergely Gizas Gnanaprakasam groupbyattrs Guiton Helmuth Karakaya Kuchekar Madarasz Makwana max_size metadata_keys min_size Morel mdatagen num_consumers queue_size QueueBatch queuebatch Ravishankar Semih Serhat simpleqt Sindy Terhar Toulme Vadla Vengal Vibhanshu Vihas Vinicius Vishal wait_for_result Wilkins Yiquan
---

**Batching** in the OpenTelemetry Collector is a process that ensures
requests are the right size for the exporter, large enough to improve
compression and amortize round-trip latency, but not so large as to
exceed limits. Batching combines a number of concerns that are
critical to performance, reliability, and cost in running Collectors.

Since OpenTelemetry began in 2019, its Collector has included a
`batch` processor component, responsible for managing the process of
combining and splitting requests, making outbound requests, monitoring
inbound and outbound timeouts, and holding back new requests when the
pipeline is full.

## TL;DR

The batch processor will be deprecated starting with version `v0.165.0`
(November 2026) in favor of exporter-level batching and the
`queuebatch` processor component.

Most users can migrate immediately to exporter-level batching. Common
before- and after-configurations are shown in the table below.

<table>
  <th><td>Before</td><td>After</td></th>
  <tr>
<td>
```yaml
receivers:
  host_metrics:

processors:
  batch:

exporters:
  otlp:
    sending_queue:
      # batch not enabled

service:
  pipelines:
    metrics:
      receivers: [host_metrics]
      processors: [batch]
      exporters: [otlp]
```

</td>
<td>
```yaml
receivers:
  host_metrics:

# no batch processor


exporters:
  otlp:
    sending_queue:
      batch:
        enabled: true

service:
  pipelines:
    metrics:
      receivers: [host_metrics]

      exporters: [otlp]
```

</td>
  </tr>
</table>

Exporter-level batching will be enabled by default for most components
in release `v0.171.0` (February 2027), and users can set a feature flag
to experiment with this mode today. The `batch` processor will be removed from the
core repository and distributions in `v0.177.0` (May 2027).

## Batchprocessor: now deprecated!

Collector processors consume and produce an in-memory representation
of OpenTelemetry data. Consequently, the `batch` processor is configured in
terms of _item counts_. Its default settings are:

```yaml
processors:
  batch:                     # deprecated processor
    timeout: 200ms           # maximum delay
    send_batch_size: 8192    # minimum item count
    # send_batch_max_size:   # unlimited maximum item count
```

In the basic configuration, the `batch` processor does not impose a
maximum item count. When both limits are set, the batching logic would
split and/or combine requests. For example:

```yaml
processors:
  batch:                       # deprecated processor
    timeout: 200ms             # maximum delay
    send_batch_size: 1000      # minimum item count
    send_batch_max_size: 5000  # maximum item count
```

By 2021, its basic behavior and default settings had effectively
stabilized. By then, `batch` processor users had identified three major
limitations of the design, wanting:

1. Control over size limits, to set limits in terms of _bytes_
2. Control over concurrency, to set limits on concurrent request counts
3. Control over back-pressure and error propagation.

Independently from these matters, the `batch` processor added partitioning, the
ability to isolate batches with common metadata values:

```yaml
processors:
  batch:                             # deprecated processor
    <...>
    metadata_keys:                   # partitioning
    - environment
    - customer
    metadata_cardinality_limit: 100  # maximum partitions
```

## Exporter-level queue and batch behavior

Exporter-level batching is generally available for the exporters that
have elected it, commonly through the exporter's `sending_queue`
configuration. Queuing and batching are integrated as follows.

First, a request from the pipeline tries to enter the queue. Queue
admission is determined by a limit over the total size of queued
requests, as determined by the `sending_queue.sizer` configuration,
measuring in `requests`, `items`, or `bytes`. If the queue is
configured for back-pressure using `block_on_overflow: true`, the
caller will wait until there is space in the queue. 

Storage extensions provide hooks to support a persistent queue;
however, without a storage extension, the queue is stored in
memory. For the in-memory queue only, a `wait_for_result` option
controls whether the caller will wait for the export. If
`wait_for_result` is false, the caller returns success
immediately. The queue spawns `num_consumers` concurrent workers for
executing export requests.

If batching is enabled, requests from the queue are combined into
batches next, as measured by the `sending_queue.batch.sizer`
configuration, which can be `items` or `bytes`, in terms of `min_size`
and optional `max_size`. If the request is right-sized on arrival to
the queue, it will pass through batching without additional cost. If a
pending batch reaches the `flush_timeout` before reaching `min_size`,
it exports immediately. If partitioning is configured, each partition
keeps a pending batch independently. 

Complete batches are handed to one of the queue's `num_consumer`
concurrent workers. Requests exiting the combined queue and batch
logic then pass to the exporter's configured timeout and retry
configuration. Here is the default configuration:

```yaml
exporters:
  <many>:
    sending_queue:                   # exporter queuebatch behavior
      num_consumers:     10          # concurrency limit
      sizer:             requests    # measure in arriving requests
      queue_size:        1000        # sized limit in memory or storage
      block_on_overflow: false       # no back-pressure
      wait_for_result:   false       # no error propagation
      batch:
        enabled:         false       # batching disabled by default
        sizer:           items       # measure in items of telemetry
        min_size:        8192        # minimum number of items
        flush_timeout:   200ms       # maximum delay
```

In detail:

- `num_consumers` determines concurrent exports, by default 10
- `queue_size` and `sizer` determine a limit on pending data, by default 1000 requests
- `block_on_overflow` false means fail fast; true means wait until the deadline
- `wait_for_result` false means do not wait for acknowledgement; true means wait for success or failure.

Because exporter-level batching was introduced after queueing behavior defaults were
settled, it remains disabled by default. However, exporter-level batching defaults
match the batch processor. At this time, we recommend that OpenTelemetry Collector users
replace their `batch` processor configuration with equivalent exporter-level batching. That means for most exporters today, you
can already opt in to exporter-level batching, for example:

```yaml
exporters:
  <many>:
    sending_queue:                   # exporter queuebatch behavior
      <...>
      batch:
        enabled:         true        # exporter-level batching
        sizer:           bytes       # measure in bytes
        min_size         1_000_000   # minimum bytes
        max_size         10_000_000  # maximum bytes
        flush_timeout:   200ms       # maximum delay
```

Like the `batch` processor, the queuebatch mechanism supports partitioning
by metadata; see [queuebatch documentation][QUEUEBATCH] for more
details. Note that if you simply enable exporter-level batching, the default behavior
matches the `batch` processor: a `min_size` limit of 8192 items with
`max_size` unset.

```yaml
exporters:
  <many>:
    sending_queue:     # exporter queuebatch behavior
      <...>
      batch:
        enabled: true  # default batching
```

The Collector's storage extension is available for all `sending_queue`
configurations, supporting configuration of [persistent
queues][PERSISTENT], for example:

```yaml
exporters:
  <many>:
    sending_queue:         # exporter queuebatch behavior
      <...>
      storage: persistent  # use persistent storage

extensions:
  persistent:              # extension name
    file_storage:          # file-based storage
      directory: <...>     # directory path
      <...>
```

[QUEUEBATCH]: https://github.com/open-telemetry/opentelemetry-collector/blob/main/exporter/exporterhelper/README.md#sending-queue-batch-settings

[PERSISTENT]: https://github.com/open-telemetry/opentelemetry-collector/blob/main/exporter/exporterhelper/README.md#persistent-queue

## Queuebatch processor

In most cases, configuring `sending_queue` in the exporter is the best
option for users, but there are still a few cases where batching in a
processor makes sense, for example:

- prior to an aggregation processor that improves with large batches
- multiple exporters sharing a processor in scenarios where the processor can save memory.

For such cases, we've introduced a new [`queuebatch`
processor][QUEUEBATCHPROCESSOR] as a `batch` processor replacement. It
uses the same configuration structure as `sending_queue`, and its
default settings match the original `batch` processor:

```yaml
processors:
  queuebatch:                        # processor queuebatch behavior
    num_consumers:     1             # single concurrent export
    sizer:             requests      # limit in requests
    queue_size:        10            # limit 10 in queue
    block_on_overflow: true          # block when queue is full
    wait_for_result:   false         # return success on queue entry
    batch:
      enabled:         true          # batching enabled
      sizer:           items         # measure in items
      min_size:        8192
      flush_timeout:   200ms
```

With integrated queue and batch behavior in a processor, users are now
able to apply batching, back-pressure, and persistent storage or error
propagation consistently whether in a processor or an exporter.

[QUEUEBATCHPROCESSOR]: https://github.com/open-telemetry/opentelemetry-collector/blob/main/processor/queuebatchprocessor/README.md

## Batching by default in 2027

The queuebatch-based `sending_queue` configuration has been stable
since around `v0.126.0`, and the replacement is completely ready. One
of the remaining tasks is to **enable batching by default** in most
exporters.

We are entering phase 2 of the [Collector batching migration
plan][MIGRATION]. The `batch` processor is now officially deprecated.

[MIGRATION]: https://github.com/open-telemetry/opentelemetry-collector/blob/main/docs/rfcs/batching-migration.md

In the upcoming Collector release, the `batch` processor will begin to
issue a deprecation warning. Users who do nothing will experience a
planned change of default. Batching will be enabled by default some
time around release `v0.170.0` in early 2027; the `batch` processor will
be removed from the Collector codebase at that time.

Until then, several immediate steps are available to developers:

1. Configure exporter `sending_queue` instead of the `batch` processor. Most
   exporters already support this feature. By configuring your own
   settings, the change of default has no effect.
2. Use the `queuebatch` processor instead of the `batch` processor.

Before we reach the point of batching being enabled by default, several
mitigation steps are ready to use today.

- The `pkg.exporterhelper.queueBatchEnabled` feature flag exists to
  allow testing with batching enabled by default.
- The Collector pipeline setup tries to detect when a pipeline has both
  a `batch` processor and a `sending_queue` with batching enabled. This
  will issue a warning, and in this case the `batch` processor can be
  simply removed.
- The [Collector `mdatagen` command][MDATAGEN] supports declaring the
  queuebatch configuration in the component's `metadata.yaml`,
  declaring whether `sending_queue` takes the default behavior, has
  specific overrides, or is entirely omitted.

[MDATAGEN](https://github.com/open-telemetry/opentelemetry-collector/blob/main/cmd/mdatagen/README.md)

## Thanks

There have been many contributors to the queuebatch codebase, from the
earliest issues to finishing touches. Almost, but not quite, too many
to mention.

The queuebatch lead authors are [Bogdan
Drutu](https://github.com/bogdandrutu) and [Dmitry
Anoshin](https://github.com/dmitryax), with partitioning support by
[Sindy Li](https://github.com/sfc-gh-sili).

Thanks to so many more contributors, including
[Adii](https://github.com/Adii-45),
[Aditya Amol Kuchekar](https://github.com/dev-aditya-hub),
[Alan Lee](https://github.com/malus2077),
[Alex Boten](https://github.com/codeboten),
[Andrew Gizas](https://github.com/gizas),
[Andrew Wilkins](https://github.com/axw),
[Andrzej Stencel](https://github.com/andrzej-stencel),
[Anitha Vadla](https://github.com/avadla),
[Antoine Toulme](https://github.com/atoulme),
[Chethan](https://github.com/chethanm99),
[Damien Mathieu](https://github.com/dmathieu),
[Evan Bradley](https://github.com/evan-bradley),
[Gergely Madarasz](https://github.com/madaraszg-tulip),
[Israel Blancas](https://github.com/iblancasa),
[Jade Guiton](https://github.com/jade-guiton-dd),
[Jan Korona](https://github.com/jkoronaAtCisco),
[Matthieu Morel](https://github.com/mmorel-35),
[Mike Terhar](https://github.com/mterhar),
[Pablo Baeyens](https://github.com/mx-psi),
[Paulo Dias](https://github.com/paulojmdias),
[Ravishankar Gnanaprakasam](https://github.com/ravishankar-sumo),
[Roger Coll](https://github.com/rogercoll),
[Semih Serhat Karakaya](https://github.com/karakayasemi),
[simpleqt](https://github.com/simpleqt),
[Tyler Helmuth](https://github.com/TylerHelmuth),
[Vengal Rao](https://github.com/vengalraoguttha),
[Vibhanshu Singh](https://github.com/singhvibhanshu),
[Vihas Makwana](https://github.com/VihasMakwana),
[Vinicius Azevedo](https://github.com/vynazevedo),
[Vishal Raj](https://github.com/lahsivjar),
[Yang Song](https://github.com/songy23), and
[Yiquan Zhou](https://github.com/yiquanzhou).
