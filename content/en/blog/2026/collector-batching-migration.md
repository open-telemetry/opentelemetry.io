---
title: 'Batching in the OpenTelemetry Collector'
linkTitle: 'Batching in the OpenTelemetry Collector: deprecating the batchprocessor'
date: 2026-10-6
author: >-
  [Bogdan Drutu](https://github.com/bogdandrutu),
  [Dmitry Anoshin](https://github.com/dmitryax), and
  [Joshua MacDonald](https://github.com/jmacd).
draft: true
issue: 12069
sig: Collector SIG
# prettier-ignore
cSpell:ignore: Adii Aditya Anitha Anoshin Baeyens Blancas block_on_overflow Chethan Drutu exporterhelper flush_timeout Gergely Gizas Gnanaprakasam groupbyattrs Guiton Helmuth Karakaya Kuchekar Madarasz Makwana max_size metadata_keys min_size Morel mdatagen num_consumers queue_size QueueBatch queuebatchprocessor Ravishankar Semih Serhat simpleqt Sindy Terhar Toulme Vadla Vengal Vibhanshu Vihas Vinicius Vishal wait_for_result Wilkins Yiquan
---

**Batching** in the OpenTelemetry Collector is a process that ensures
requests are the right size for the exporter, large so they improve
compression and amortize round-trip latency, but not too large to
exceed a limit. Batching combines a number of concerns that are
critical to performance, reliability, and cost in running Collectors.

Since OpenTelemetry began in 2019, its Collector has included a
`batchprocessor` component, responsible for managing the process of
combining and splitting requests, making outbound requests, monitoring
inbound and outbound timeouts, and holding back new requests when the
pipeline is full.

## Batchprocessor configuration

Collector processors consume and produce an in-memory representation
of OpenTelemetry data. Consequently, `batchprocessor` is configured in
terms of _item counts_. Its default settings:

```yaml
processors:
  batch:                     # deprecated processor
    timeout: 200ms           # maximum delay
    send_batch_size: 8192    # minimum item count
    # send_batch_max_size:   # unlimited maximum item count
```

In the basic configuration, `batchprocessor` does not impose a maximum
item count. Larger requests would pass through the batch processor
without also specifying a limit, again in items

```yaml
processors:
  batch:                       # deprecated processor
    timeout: 200ms             # maximum delay
    send_batch_size: 1000      # minimum item count
    send_batch_max_size: 5000  # maximum item count
```

By 2021, its basic behavior and default settings had effectively
stabilized. By then, `batchprocessor` users had identified three major
limitations of the design, wanting:

1. Control over size limits, to set limits in terms of _bytes_
2. Control over concurrency, to set limits on concurrent request coutn limit
3. Control over back-pressure and error propagation.

Independently from these matters, `batchprocessor` added partitioning, the
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

## Queuebatch configuration

These considerations led to a new implementation known as
"queuebatch", made available for use inside the exporter through its
`exporterhelper` interface which is the unit responsible for common
queueing, batching, retry, timeout, and observability functions in
most exporters.

Queuebatch combines control over size limits, concurrency,
back-pressure, and error propagation in a single module of shared
code. It integrates queueing and batching logic while separating
several cross-current concerns. It's default configuration follows

```yaml
exporters:
  <many>:
    sending_queue:                   # exporter queuebatch behavior
      num_consumers:     10          # concurrency limit
      sizer:             requests    # measure in arriving requests
      queue_size:        1_000       # sized limit in memory or storage
      block_on_overflow: false       # no back-pressure
      wait_for_result:   false       # no error propagation
      batch:
        enabled:         false       # no batching
```

In detail:

- `num_consumers` determines concurrent exports, by default 10
- `queue_size` and `sizer` determine a limit on pending data, by default 1000 requests
- `block_on_overflow` false indicates to fail fast, true means wait until deadline
- `wait_for_result` false indicates not to wait for acknowledgement on entry, true means wait for success or failure.

Because batching was introduced after queueing behavior defaults were
settled, it remains disabled by default, but with preset defaults that
match the batch processor. That means for most exporters today, you
can already opt-in to batching, for example:

```yaml
exporters:
  <many>:
    sending_queue:                   # exporter queuebatch behavior
      <...>
      batch:
        enabled:         true        # batching
        sizer:           bytes       # measure in bytes
        min_size         1_000_000   # minimum bytes
        max_size         10_000_000  # maximum bytes
        flush_timeout:   200ms       # maximum delay
```

Like `batchprocessor`, the queuebatch mechanism supports partitioning
by metadata, see [queuebatch documentation][QUEUEBATCH] for more
details. Note that if simply enable batching, the default behavior
matches `batchprocessor`, a `min_size` limit of 8192 items with
`max_size` unset.

```yaml
exporters:
  <many>:
    sending_queue:     # exporter queuebatch behavior
      <...>
      batch:
        enabled: true  # default batching
```

Note that queuebatch also integrates the Collector's standard storage
extension, supporting configuration of [persistent
queues][PERSISTENT], whereas queuebatch behavior is ephemeral by
default.

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

In most cases, configuring `sending_queue` in the exporter is the
better option for users for cost and convenience, there are still a
few cases where batching in a processor makes sense, such as prior to
aggregation and in multi-exporter scenarios. For the cases where it's
still beneficial, we've introduced a new
[`queuebatchprocessor`][QUEUEBATCHPROCESSOR] as its replacement. Its
default settings match the original processor behavior:

```yaml
processors:
  queuebatch:                        # processor queuebatch behavior
    num_consumers:     1             # single concurrent export
    sizer:             requests      # limit in requests
    queue_size:        10            # limit 10 in queue
    block_on_overflow: true          # block when queue full
    wait_for_result:   false         # return success on queue entry
    batch:
      enabled:         true          # batching
      sizer:           items         # items
      min_size:        8192
      flush_timeout:   200ms
```

With queuebatch behavior in a processor, users are now able to apply
batching, back-pressure, and persistent storage or error propagation 
consistently whether in a processor or an exporter.

[QUEUEBATCHPROCESSOR]: https://github.com/open-telemetry/opentelemetry-collector/blob/main/processor/queuebatchprocessor/README.md

## Batching by default in 2027

The queuebatch-based `sending_queue` configuration has been stable
since around `v0.126.0`, and the replacement is completely ready. One
of the remaining tasks is to **enable batching on by default** in most
exporters.

We are entering phase 2 of the [Collector batching migration
plan][MIGRATION]. The `batchprocessor` is now officially deprecated.

[MIGRATION]: https://github.com/open-telemetry/opentelemetry-collector/blob/main/docs/rfcs/batching-migration.md

In the upcoming Collector release, `batchprocessor` it will begin to
issue a deprecation warning. Users who do nothing will experience a
planned change of default. Batching will be enabled by default some
time around release `v0.170.0` in early 2027; `batchprocessor` will
be removed from the Collector codebase at that time.

Until then, several immediate steps are available to developers:

1. Configure exporter `sending_queue` instead of `batchprocessor`. Most
   exporters already support this feature. By configuring your own
   settings the change of default has no effect.
2. Use `queuebatchprocessor` instead of `batchprocessor`.

Before we reach the point of batching-enabled by default, several
mitigation steps are ready to use during phase 2.

- The `pkg.exporterhelper.queueBatchEnabled` feature flag exists to
  allow testing with batching enabled by default.
- The Collector pipeline setup tries to detect when a pipeline has both
  a `batchprocessor` and a `sending_queue` with batching enabled. This
  will issue a warning, and in this case the `batchprocessor` can be
  simply removed.
- The [Collector `mdatagen` command][MDATAGEN] supports declaring the
  queuebatch configuration in the component's `metadata.yaml`,
  declaring whether `sending_queue` takes the default behavior, has
  specific overrides, or is entirely omitted.

[MDATAGEN](https://github.com/open-telemetry/opentelemetry-collector/blob/main/cmd/mdatagen/README.md)

## Thanks

There have been many contributors to the queuebatch codebase, from the
earliest issues to finishing touches. Almost, but not quite too many
to mention. Including the authors

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
[Chethan](https://github.com/chethanm99).
[Damien Mathieu](https://github.com/dmathieu),
[Evan Bradley](https://github.com/evan-bradley).
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
[Tyler Helmuth](https://github.com/TylerHelmuth)
[Vengal Rao](https://github.com/vengalraoguttha),
[Vibhanshu Singh](https://github.com/singhvibhanshu),
[Vihas Makwana](https://github.com/VihasMakwana),
[Vinicius Azevedo](https://github.com/vynazevedo),
[Vishal Raj](https://github.com/lahsivjar),
[Yang Song](https://github.com/songy23), and
[Yiquan Zhou](https://github.com/yiquanzhou).
