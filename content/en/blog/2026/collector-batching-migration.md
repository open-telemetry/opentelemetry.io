---
title: 'Deprecating the Collector Batch Processor'
linkTitle: 'Deprecating the Collector Batch Processor'
date: 2026-11-04
author: >-
  [Bogdan Drutu](https://github.com/bogdandrutu),
  [Dmitry Anoshin](https://github.com/dmitryax), and
  [Joshua MacDonald](https://github.com/jmacd).
draft: true
issue: 12069
sig: Collector SIG
# prettier-ignore
cSpell:ignore: Adii Aditya Anitha Anoshin Baeyens Blancas block_on_overflow Chethan Drutu flush_timeout Gergely Gizas Gnanaprakasam groupbyattrs Guiton Helmuth Karakaya Kuchekar Madarasz Makwana max_size metadata_keys min_size Morel mdatagen num_consumers queue_size queue_batch Ravishankar Semih Serhat simpleqt Sindy Terhar Toulme Vadla Vengal Vibhanshu Vihas Vinicius Vishal wait_for_result Wilkins Yiquan
---

**Batching** in the OpenTelemetry Collector is a process that ensures
requests are the right size for the exporter, large enough to improve
compression and amortize round-trip latency, but not so large as to
exceed limits. Batching combines a number of concerns that are
critical to performance, reliability, and cost in running Collectors.

Since OpenTelemetry began in 2019, its Collector has included a
`batch` processor component, responsible for combining and splitting
requests before sending them to downstream consumers, monitoring
inbound and outbound timeouts, and holding back new requests when the
pipeline is full.

## TL;DR

We are deprecating the `batch` processor. Batching is now supported
directly in exporters, called _exporter-level batching_, and a new
`queue_batch` processor replaces the original processor
component. Integrated queue and batch behavior brings numerous
improvements described below.

Most users can migrate immediately to exporter-level batching. Common
before and after configurations are shown below.

**Before:**

```yaml
receivers:
  host_metrics:
    scrapers:
      cpu: {}

processors:
  batch:

exporters:
  otlp:
    ...
    sending_queue:
      enabled: true
      # batch not enabled


service:
  pipelines:
    metrics:
      receivers: [host_metrics]
      processors: [batch]
      exporters: [otlp]
```

**After:**

```yaml
receivers:
  host_metrics:
    scrapers:
      cpu: {}




exporters:
  otlp:
    ...
    sending_queue:
      enabled: true
      batch:
        enabled: true

service:
  pipelines:
    metrics:
      receivers: [host_metrics]
      exporters: [otlp]
```

Exporter-level batching will be enabled by default for most components
in release `v0.171.0` (February 2027), and users can set a feature
flag to experiment with this mode today. The `batch` processor will be
removed from the core repository and distributions in `v0.177.0` (May
2027).

Use exporter-level batching in most cases. If you need batching before
another processor or shared batching for multiple exporters, use the
`queue_batch` processor instead.

## Why replace the `batch` processor?

Collector processors consume and produce an in-memory representation
of OpenTelemetry data. Consequently, the `batch` processor is
configured in terms of _item counts_, which are the number of
individual log records, metric data points, and trace spans. Its
default settings are:

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
2. Control over concurrency, to set limits on concurrent request count limit.
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

## Integrated exporter-level queue and batch behavior

Exporter-level batching is generally available for the exporters that
elect to use common `sending_queue` behavior. Queuing and batching
behavior are integrated

1. Requests try to enter the queue. The queue has limited
   capacity. When the queue is full, it can fail immediately or it can
   block the caller. Usually, the queue returns success to the caller
   no admission, however there is also an option to wait for a
   response.
2. A number of consumers concurrently pull requests from the queue. If
   batching, undersize and oversize requests are combined and split,
   before being handled by consumers, whereas right-sized requests
   pass straight through the batcher. When batch-partitioning, a
   limited number of independent batches are maintained, subject to an
   idle timeout.
  
Requests exiting the combined queue and batch logic then pass to the
exporter's configured timeout and retry configuration. Here is the
default configuration:

```yaml
exporters:
  <exporter>:
    sending_queue:                   # exporter queue_batch behavior
      queue_size:        1000        # size limit
      sizer:             requests    # size is number of requests
      block_on_overflow: false       # no backpressure
      wait_for_result:   false       # no error propagation
      num_consumers:     10          # concurrency limit
      batch:
        enabled:         false       # batching disabled by default
        sizer:           items       # measure in items of telemetry
        min_size:        8192        # minimum number of items
        flush_timeout:   200ms       # maximum delay
```

In detail:

- `num_consumers`: determines concurrent exports
- `queue_size` and `sizer`: determine a limit on pending data
- `block_on_overflow`: false means fail fast; true means wait until the deadline
- `wait_for_result`: false means do not wait for acknowledgement; true means wait for success or failure
- `storage`: optional storage extension for a durable queue.

By default, the queue does not block and does not wait for a result,
meaning it will return success or failure to the caller immediately.

Because exporter-level batching was introduced after queueing behavior
stabilized, batching remains disabled by default. After enabling
exporter-level batching, the default for `sizer`, `min_size`, and
`flush_timeout` match the original `batch` processor.

For most exporters today, you can migrate from the default `batch`
processor settings by removing it from the pipeline and enabling
exporter-level batching. This enables batching with the default
settings shown above:

```yaml
exporters:
  <exporter>:
    sending_queue:
      batch:
        enabled: true
```

In detail:

- `enabled`: Enable exporter-level batching
- `sizer`: How to measure batch size: items, bytes
- `min_size`: Minimum size of batch before sending
- `max_size`: Maximum size of batch (optional)
- `flush_timeout`: Maximum delay before sending.
- `partition`: Details below.

### Queue capacity after migration

Moving batching into `sending_queue` also moves it to the other side
of the queue. In a typical `batch` processor pipeline, the exporter
`sending_queue` appears after the `batch` processor. With an existing
`batch` processor in the pipeline, the default-size queue holds up to
1000 already-batched requests, so be careful translating existing
configuration.

With exporter-level batching, batching happens after the queue. Now,
the queue holds individual requests arriving from the pipeline,
typically much smaller requests. The same `queue_size: 1000`, measured
in requests may be a lot less data. Removing `batch` from the pipeline
may cause the queue to hold less data, which can lead to overflow.

When moving to `sending_queue` batching, consider raising `queue_size`
to hold an appropriate number of unbatched requests. For an in-memory
queue, meaming without a `storage` extension, ideally we want the
queue to hold at least as much data as will keep `num_consumers` busy.
Depending on whether callers will block, additional queue space should
be allocated to survive intermittent export failures.

When `queue_size` is measured in `items` or `bytes`, request size
matters less. For example, the following queue stores up to 100,000
items. With a minimum size of 5,000 items per batch, 10 consumers can
send 50,000 or more items concurrently. The queue allows an additional
50,000 items to enter and await ending before blocking or failing
requests.

```yaml
exporters:
  <exporter>:
    sending_queue:
      sizer:         items    # size the queue in items, not requests
      queue_size:    100_000  # fits around 50-100 of SDK-size batches
      num_consumers: 10       # 10 workers will export batches
      batch:
        enabled:  true
        sizer:    items       # export size in items
        min_size: 5_000       # minimum size export
```

An items- or bytes-sized queue makes `sending_queue` memory costs
explicit, where a request-sized queue can hold large or small
requests, varying in memory.

Using bytes helps when the backend limit is also in bytes. Use
`max_size` to every request under the limit:

```yaml
exporters:
  <exporter>:
    sending_queue:
      sizer:      bytes        # size the queue in bytes
      queue_size: 100_000_000  # 100 MB buffered
      batch:
        enabled:  true
        min_size: 1_000_000    # 1 MB batches
        max_size: 10_000_000   # stay under the backend's message limit
```

Both `items` and `bytes` sizers cost more CPU than requests, and
`bytes` is the most expensive because it computes the encoded
size. Watch `otelcol_exporter_queue_size` and compare it against
`otelcol_exporter_queue_capacity` after the switch.

### More features

Like the `batch` processor, the queue_batch mechanism supports
[partitioning by metadata][SENDING_QUEUE]:

```yaml
exporters:
  <exporter>:
    sending_queue:
      <...>
      batch:
        enabled: true
        <...>
        partition:
          enabled: true
          metadata_keys:      # list of request headers
            - x-auth-token
          cache_size: 100     # up to 100 simultaneous batches
          idle_timeout: 100s  # removed from memory afer 100s
```

The Collector's storage extension is available for all `sending_queue`
configurations, supporting configuration of [persistent
queues][PERSISTENT], for example:

```yaml
exporters:
  <exporter>:
    sending_queue:
      <...>
      storage: file_storage/persistent

extensions:
  file_storage/persistent: # file-based storage
    directory: <...>       # directory path
    <...>
```

[SENDING_QUEUE]: https://github.com/open-telemetry/opentelemetry-collector/blob/main/exporter/exporterhelper/README.md#sending-queue-batch-settings

[PERSISTENT]: https://github.com/open-telemetry/opentelemetry-collector/blob/main/exporter/exporterhelper/README.md#persistent-queue

## Queue/Batch processor

In most cases, configuring `sending_queue` in the exporter is the best
option for users, but there are still a few cases where batching in a
processor makes sense, for example:

- prior to an aggregation processor that improves with large batches
- multiple exporters sharing a processor in scenarios where the processor can save memory.

For such cases, we've introduced a new [`queue_batch`
processor][QUEUEBATCHPROCESSOR] as a `batch` processor replacement. It
uses the same configuration structure as `sending_queue`, and its
default item threshold and flush timeout match the original `batch` processor:

```yaml
processors:
  queue_batch:                       # processor queue and batch
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

The `sending_queue` configuration has been stable
since around `v0.126.0`, and the replacement is completely ready. One
of the remaining tasks is to **enable batching by default** in most
exporters.

We are entering phase 2 of the [Collector batching migration
plan][MIGRATION]. The `batch` processor is now officially deprecated.

[MIGRATION]: https://github.com/open-telemetry/opentelemetry-collector/blob/main/docs/rfcs/batching-migration.md

In the upcoming Collector release, the `batch` processor will begin to
issue a deprecation warning. Users who do nothing will experience a
planned change of default. Batching will be enabled by default in
release `v0.171.0` (February 2027); the `batch` processor will
be removed from the core repository and distributions in `v0.177.0` (May 2027).

Until then, several immediate steps are available to users:

1. Configure exporter `sending_queue` instead of the `batch` processor. Most
   exporters already support this feature. By configuring your own
   settings, the change of default has no effect.
2. Use the `queue_batch` processor instead of the `batch` processor.

Before we reach the point of batching being enabled by default, several
mitigation steps are ready to use today.

- The `pkg.exporterhelper.queueBatchEnabled` feature flag exists to
  allow testing with batching enabled by default.
- The Collector pipeline setup tries to detect when a pipeline has both
  a `batch` processor and a `sending_queue` with batching enabled. This
  will issue a warning, and in this case the `batch` processor can be
  simply removed.

### For component developers

The [Collector `mdatagen` command][MDATAGEN] supports declaring the
`sending_queue` configuration in the component's `metadata.yaml`,
declaring whether `sending_queue` takes the default behavior, has
specific overrides, or is entirely omitted.

[MDATAGEN]: https://github.com/open-telemetry/opentelemetry-collector/blob/main/cmd/mdatagen/README.md#exporter-queuebatch-sender-defaults

## Thanks

There have been many contributors to the queueing and batching
codebase, from the earliest issues to the finishing touches.

The `queue_batch` lead authors are [Bogdan
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
[Joshua MacDonald](https://github.com/jmacd),
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
