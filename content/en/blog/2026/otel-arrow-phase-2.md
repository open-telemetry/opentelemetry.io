---
title:
  'OTel-Arrow Phase 2: From Efficient Transport to Efficient Telemetry Pipelines'
linkTitle: 'OTel-Arrow Phase 2: Efficient Telemetry Pipelines'
sig: OTel Arrow SIG
date: 2026-06-05
author: >-
  [Laurent Querel](https://github.com/lquerel) (F5, project lead), [Joshua
  MacDonald](https://github.com/jmacd) (Microsoft, project lead), [Albert
  Lockett](https://github.com/albertlockett) (F5), [Cijo
  Thomas](https://github.com/cijothomas) (Microsoft), [Drew
  Relmas](https://github.com/drewrelmas) (Microsoft), [Jake
  Dern](https://github.com/JakeDern) (F5)
# prettier-ignore
cSpell:ignore: Albert Cijo Dern Drew Jake Joshua Laurent Lockett MacDonald OTAP OTTL pushdown Querel Relmas reserialization Thomas
---

[Phase 1](https://github.com/open-telemetry/otel-arrow/blob/c6ed105cab28e537bf5c2c81a97e9b63677d3cff/docs/phase1-overview.md)
of OTel-Arrow established OTAP, the OpenTelemetry Arrow Protocol, as an
efficient transport protocol for OpenTelemetry. Apache Arrow is a
language-independent, columnar in-memory format designed to move and process
structured data efficiently across systems. We demonstrated that telemetry could
be transported with significantly lower network overhead while preserving
compatibility with the OpenTelemetry data model.

[Phase 2](/blog/2025/otel-arrow-phase-2/) asked a different question: what
happens if Arrow is used not only on the wire, but also as the representation
the pipeline works with internally?

Telemetry volume is increasing quickly, driven by broader OpenTelemetry
adoption, richer instrumentation, and more dynamic AI and agentic workloads. At
that scale, common pipeline operations such as removing an attribute, renaming a
field, adding metadata, or routing signals should cost as little as possible.
Many of these operations are simple and repetitive: if a processor touches an
attribute in one record, it will often touch the same attribute across many
records in the same batch.

That pattern maps well to a columnar representation. If telemetry can remain in
compact Arrow batches while processors rename attributes, enrich data, and route
signals, the pipeline can do less work around each transformation and use CPU
and memory more efficiently and predictably. We believe OTAP can play an
important role in helping OpenTelemetry pipelines handle this next phase of
telemetry growth more efficiently.

## A Dataflow Engine Built to Test the Arrow Path

To explore this idea, we built the OTel-Arrow Dataflow Engine, a Rust runtime
designed around OTAP as the primary in-pipeline representation. It can consume
and produce OTAP streams end to end, while also supporting OTLP through a
separate first-class data path.

This dual-path design lets us compare two modes in the same runtime: an
OTAP-direct path that keeps telemetry in Arrow record batches, and an
OTLP-compatible path that converts between OTLP and OTAP at explicit boundaries.
The result is clear: when telemetry stays on the OTAP path end to end, transport
and processing costs drop substantially.

The OpenTelemetry Collector is the broadly deployed, general-purpose
implementation for OpenTelemetry pipelines. Its pipeline model is built around
OTLP-shaped in-memory data structures, which makes it flexible and closely
aligned with the OpenTelemetry data model, but also relatively expensive for
high-volume batch processing. The purpose of this work is to test a different
design point: a telemetry data plane built around OTAP as the primary data
representation, with OTLP compatibility handled at explicit boundaries.

The Dataflow Engine uses a
[NUMA-friendly](https://www.kernel.org/doc/html/v4.18/vm/numa.html),
[thread-per-core, share-nothing](https://seastar.io/shared-nothing/)
architecture. It emphasizes bounded channels and data structures, avoids
synchronization in hot paths, propagates delivery acknowledgments through
pipelines, and supports live pipeline reconfiguration through an admin API.

Our benchmarks compare the cost of two pipeline data representations: the
OTLP-shaped object model used by the Collector, and the OTAP representation used
by the Dataflow Engine. They also evaluate runtime design choices such as
Arrow-based processing, fewer conversion boundaries, bounded execution, and
explicit flow control.

In the diagrams below, DFE refers to the OTel-Arrow Dataflow Engine, while
Collector refers to the OpenTelemetry Collector implementation.

## Benchmark Highlights

The Phase 2 benchmarks were designed to answer three practical questions:

- Does keeping telemetry in an Arrow representation make real pipeline
  processing less expensive, or does OTAP only help on the wire?
- If so, can the runtime architecture itself sustain and scale that efficiency
  linearly as more CPU cores are assigned?
- How much additional throughput do OTAP streams provide compared with OTLP
  streams using the same amount of resources?

The full benchmark matrix is available on the
[interactive benchmark site](https://open-telemetry.github.io/otel-arrow/compare/).
Here we focus on three summary diagrams that capture the most important results.
The interactive site provides the complete view, including additional rates,
batch sizes, compression settings, memory behavior, network usage, saturation
markers, and the test configurations used.

### Benchmark Context

The benchmark uses a deliberately simple transformation operation: renaming log
attributes such as `exception.type` to `exception.kind`.

This kind of work appears frequently in OpenTelemetry pipelines. Teams rename
attributes during semantic convention migrations, normalize fields before
sending data to a backend, add environment metadata, or prepare telemetry for
routing, governance, and enrichment. Individually, these operations should be
inexpensive; and they often are. But the cost is often the surrounding decode,
object-walk, allocation, and encode work, not the actual transformation itself.

Most transformation benchmarks were run on an Intel Xeon Platinum 8581C system
with 16 cores and 118 GiB of RAM, running Debian GNU/Linux 12; see the
[interactive benchmark website](https://open-telemetry.github.io/otel-arrow/compare/)
for full environment details. In these tests, _a single core_ was assigned to
the pipeline under test, while the remaining cores were used by the traffic
generator and simulated backend. Cores were pinned to keep placement stable and
reduce cross-component interference. Scaling and saturation tests used a
separate 64-core, 2-socket Intel Xeon 8358 system with 1024 GiB of RAM. See the
[benchmark documentation](https://github.com/open-telemetry/otel-arrow/blob/c6ed105cab28e537bf5c2c81a97e9b63677d3cff/docs/benchmarks.md)
for the full experimental setup, including how back-pressure was configured for
each tested pipeline.

## Result 1: OTAP Keeps Common Pipeline Work Cheap

![3 benchmark takeaways](3-takeaways.svg)

Figure 1: Summary of transformation benchmarks showing sensitivity to the count
of transformation rules, batch-size behavior, and overload behavior.

The diagram above summarizes three important observations from the
transformation benchmarks.

The first observation shows that adding more rename actions has very little
incremental cost on the Dataflow Engine. At 200K logs/sec, with approximately
300 bytes per log entry, the native OTAP path moves from 6.4% to 6.6% CPU as the
number of rename actions increases from one to four. The DFE OTLP path is more
expensive because telemetry first has to be decoded from OTLP and converted into
the OTAP-oriented internal representation, but once that conversion cost is
paid, additional rename actions add very little CPU there as well.

The OTel Collector OTLP path represents the current Collector. It pays the high
upfront cost of decoding OTLP proto and then a further 3.75% CPU per operation
for a total of 92.5% CPU after four operations.

The second observation shows that at 400K logs/sec, larger batches reduce CPU
cost for every path, but the OTAP path benefits the most. It drops from 21% CPU
at 256 logs per batch to 7.8% at 4096 logs per batch, which is the expected
behavior for a compact, columnar, batch-oriented representation.

The third observation is about overload behavior. The figure shows the Collector
OTLP path with a 512 MiB memory limit, chosen to keep the memory budget in the
same range as the Dataflow Engine OTLP path, which uses about 300 MiB in this
scenario. With that setting, Collector memory grows sharply under saturation
while received throughput drops. Higher Collector memory limits improve received
throughput: at 2x saturation, a 2048 MiB limit receives about 544K logs/sec
versus about 128K logs/sec with a 512 MiB limit, but average memory rises to
about 1.3 GiB. The higher limit lets the Collector keep more work in memory
while CPU is saturated, which improves received throughput but shifts more of
the overload cost into memory usage. The Dataflow Engine keeps memory bounded
even when overloaded as it applies backpressure, making overload visible instead
of letting memory absorb it.

Taken together, these results show that OTAP is not only about smaller payloads.
It keeps processing cost low, benefits significantly from batching, and helps
make overload behavior more predictable by applying backpressure.

The next two results separate two questions: first, whether the Dataflow Engine
runtime scales when telemetry enters through OTLP, and second, how much more
throughput is available when the same runtime can stay on the native OTAP path.

## Result 2: Scaling Stays Close to Linear

![OTLP scaling](otlp-scaling.svg)

Figure 2: OTLP scaling test comparing measured speedup with ideal linear scaling
from 1 to 16 cores.

The second diagram demonstrates how well the Dataflow Engine uses available CPU
cores. The thread-per-core, share-nothing architecture avoids synchronization
primitives in hot paths, so additional cores translate into additional
throughput with minimal coordination overhead. In this test, telemetry enters as
OTLP, meaning each batch must be decoded and converted before processing — a
deliberate choice to show scaling under realistic conversion cost rather than an
ideal Arrow-only workload. Even so, the engine reaches 14.6x speedup on 16
cores, close to the ideal 16x line, and 1.91M logs/sec overall. If a single core
handles throughput N, sixteen cores deliver close to 16N. For operators, this
means vertical scaling is effective — a benefit that complements the horizontal
scaling most pipelines already rely on.

This result separates the runtime question from the protocol question. In this
test, telemetry enters as OTLP and must be decoded and converted before
processing can happen. Even with that conversion cost, the thread-per-core,
share-nothing architecture with bounded flow control is able to use the assigned
CPU cores effectively. For operators, the practical result is vertical scaling:
more cores translate into more throughput with limited efficiency loss.

## Result 3: OTAP Provides Higher Throughput on the Same Runtime

![OTAP versus OTLP throughput](otap-scaling.svg)

Figure 3: Throughput comparison between OTAP and OTLP paths on the OTel-Arrow
Dataflow Engine.

The third diagram compares OTAP and OTLP throughput on the same Dataflow Engine,
using the same number of cores. When both input and output are OTAP, the engine
pays no conversion cost - telemetry stays in its Arrow-native representation
from ingestion through processing to export. When input is OTLP, the engine must
decode and convert each batch before processing, and convert back on the way
out. That conversion boundary is the entire difference between the two paths,
and eliminating it makes OTAP consistently **more than 10x faster** than OTLP on
the same runtime. At 1 core, the OTAP path reaches 2.47M logs/sec while the OTLP
path reaches 121K logs/sec.

This result shows the effect of removing the OTLP conversion boundary. OTAP
avoids heavy OTLP transcoding and lets the Arrow-native engine process data more
directly. The 8-core OTAP run is load-generator limited, and the projected
full-saturation throughput is about 16M logs/sec, so there is still room to move
closer to ideal scaling.

## Key Takeaways

These three benchmark summaries support the main direction of Phase 2. OTAP
reduces the cost of representing telemetry. The OTel-Arrow Dataflow Engine
preserves that advantage through processing, scales it across cores, and keeps
overload behavior visible and contained. For production telemetry pipelines,
that predictability matters as much as raw throughput. OTAP is not only cheaper
per operation; it also enables much higher throughput on the same hardware.

These comparisons should be read as measurements of the specific benchmark paths
and configurations shown here, not as universal claims about every possible
Collector deployment. The full benchmark matrix is available on the
[interactive benchmark site](https://open-telemetry.github.io/otel-arrow/compare/)
for readers who want to explore the raw charts and configuration details.

## Why Arrow Changes the Cost Model

The benchmark results are not only about avoiding serialization. They show a
deeper change in the cost model of telemetry processing.

In a row-oriented, OTLP-based path, telemetry arrives as protobuf bytes.
Decoding those bytes materializes each telemetry record as a heap-allocated
object graph spanning resource, scope, and individual signal records. A
processor walks and modifies those objects, and re-encoding converts the result
back to bytes. Every allocation on the way in becomes garbage on the way out.
For batch-uniform operations such as attribute renames, that allocation and
collection pressure can outweigh the transformation itself. This is a structural
cost of row-oriented processing, independent of any particular implementation.

With an OTAP-native path, telemetry can remain in Arrow record batches.
Processors can operate on a compact, columnar, batch-oriented representation,
with better memory locality and fewer allocations. Repeated values are grouped
more naturally, compression has a more favorable layout to work with, and
processors can take advantage of Arrow kernels, dictionary encodings, or
vectorized execution where the operation fits the columnar model.

In short, OTAP does not only reduce the number of bytes on the network. Its
larger opportunity is to reduce overhead inside the telemetry data plane itself.

## Current Maturity Level

The OTel-Arrow Dataflow Engine has reached a maturity level where many essential
capabilities are usable in realistic environments. It is still more accurate,
however, to describe it as an incubation-stage project than as a broadly
production-stabilized platform for external users.

Production users should treat the engine as something to evaluate, benchmark,
and shape through feedback, not as a drop-in replacement for existing Collector
deployments today.

Configuration formats, APIs, component interfaces, and certain operational
semantics may still evolve during Phase 3 as benchmarks improve, real-world
experimentation progresses, and community feedback accumulates. This caution is
intentional: the goal is to stabilize the engine once the architecture,
operational model, and integration boundaries are fully validated, rather than
freezing interfaces too early.

## Phase 3

Phase 3 is currently under discussion. It is expected to target a first stable,
production-usable release, with significant improvements in several areas:

- **Pipeline-level control mechanisms**: inter-pipeline topics, tenant-aware
  resource governance, live reconfiguration with rollback support, and possible
  OpAMP support.
- **Core component ecosystem**: receivers, processors, exporters, and extensions
  covering the majority of common telemetry pipelines, maintained within
  OpenTelemetry.
- **Extensibility and processing**: a WASM-based extension model for specialized
  components, including exploration of how selected existing OpenTelemetry
  Collector (and collector contrib) components could run inside the Dataflow
  Engine. This also includes a new OTAP-native transform processor with
  OTTL-compatible transformations and the experimental OPL language.
- **SDK-level OTAP export**: prototyping OTAP exporters in OpenTelemetry SDKs,
  starting with OTel Rust, to evaluate how much efficiency is gained when
  telemetry starts in an Arrow-friendly representation at the SDK boundary
  instead of being converted later in the pipeline.
- **Ecosystem validation and guidance**: collaboration with the OpenTelemetry
  Demo and relevant Blueprint efforts to validate OTAP and the Dataflow Engine
  in realistic end-to-end scenarios.
- **OpenTelemetry Profiles**: add support for OpenTelemetry profiles in the OTAP
  representation.

OPL, or OpenTelemetry Processing Language, is currently being specified and
implemented. It is intended to be stream-oriented, strongly typed, and safe for
processing signals that comply with the OpenTelemetry data model. This
processing language could also enable predicate and projection pushdown,
allowing receivers to apply filtering and field-selection requirements closer to
the source when supported.

We are also exploring native integration with agentic workflows, enabling agents
to discover engine capabilities, configuration possibilities, and internal
telemetry, and to safely validate generated configurations. During Phase 3, we
will begin a second round of discussions with the OpenTelemetry Governance
Committee to evaluate how this engine could integrate into the broader
OpenTelemetry ecosystem.

## Conclusion

OTAP is not simply a more compact network format. When telemetry remains inside
an Apache Arrow data model through transport and pipeline processing, the
pipeline can avoid repeated deserialization, object reconstruction, allocations,
copies, and reserialization, while opening the door to vectorized processing and
higher compression ratios.

Combined with an architecture grounded in bounded runtime design, this
representation enables gains across multiple dimensions: network efficiency, CPU
consumption, memory usage, stability under load, and controlled reconfiguration.
That is why we believe the Arrow-native path is an important direction for
OpenTelemetry as telemetry volumes continue to grow and observability pipelines
are expected to perform more work before data reaches the backend.

We would particularly welcome feedback from the OpenTelemetry community around
runtime semantics, operational models, processing APIs, pipeline guarantees, and
OTAP-native processing patterns. We are also interested in benchmark ideas,
real-world pipeline designs, and configurations that significantly improve
throughput, efficiency, memory behavior, or overload handling. We would like to
use them to challenge our assumptions and raise the performance and scalability
bar for telemetry pipelines.

Join the discussions in the
[otel-arrow](https://github.com/open-telemetry/otel-arrow/discussions) GitHub
project, on the
[#otel-arrow](https://cloud-native.slack.com/archives/C07S4Q67LTF) Slack
channel, or in the relevant OpenTelemetry
[SIG meetings - Arrow](https://github.com/open-telemetry/community/tree/fa6a4b68cf63438b760419124b0abfbe4ae238ed#sig-arrow).
Contributions are welcome. For larger contributions, we strongly encourage
opening a [GitHub issue](https://github.com/open-telemetry/otel-arrow/issues)
before beginning implementation work and using SIG discussions for early
feedback when the change affects architecture, semantics, or broader ecosystem
integration.
