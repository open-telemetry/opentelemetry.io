---
title: What 10,000 Slack Messages Reveal About OpenTelemetry Adoption Challenges
linkTitle: Community Slack Analysis
date: 2026-01-07
author: '[Juraci Paixão Kröhling](https://github.com/jpkrohling) (OllyGarden)'
canonical_url: https://blog.olly.garden/what-10000-slack-messages-reveal-about-opentelemetry-adoption-challenges
cSpell:ignore: k8sattributes kubeletstats OllyGarden OTTL
---

![Cover image showing Slack message volume over time](cover.png)

The OpenTelemetry community has grown tremendously over the past few years, and
with that growth comes valuable insights hidden in our community conversations.
We analyzed nearly 10,000 messages from the
[`#otel-collector`](https://cloud-native.slack.com/archives/C01N6P7KR6W) and
[`#opentelemetry`](https://cloud-native.slack.com/archives/CJFCJHG4Q) channels
on [CNCF Slack](https://slack.cncf.io/) spanning from May 2019 to December 2025
to understand what challenges users face most often, which components generate
the most discussion, and where the community might need additional documentation
or tooling improvements.

## The Dataset

Our analysis covered 9,966 messages across two of the most active OpenTelemetry
Slack channels:

- **#otel-collector**: 5,570 messages (56%)
- **#opentelemetry**: 4,396 messages (44%)

These messages break down into several categories:

| Category       | Percentage |
| -------------- | ---------- |
| Questions      | 46.7%      |
| Error Reports  | 25.9%      |
| Discussions    | 23.3%      |
| Configuration  | 3.0%       |
| Help Responses | 1.0%       |

The high proportion of questions and error reports (over 72% combined) tells us
that these channels serve as critical support resources for the community, and
the topics that appear most frequently represent real adoption challenges.

We applied topic modeling using BERTopic to cluster similar messages, then
analyzed sentiment and frustration indicators to identify which topics cause the
most difficulty. Messages containing error reports, repeated requests for help,
or expressions of confusion scored higher on our frustration metric.

## Most Discussed Collector Components

Topic modeling revealed clear patterns in which Collector components generate
the most community discussion. Here are the top components by message volume:

### 1. Prometheus Receiver and Exporter (498 messages, 5.0%)

Prometheus integration dominates community discussions. Users frequently ask
about:

- Configuring the Prometheus receiver to scrape metrics
- Setting up the Prometheus remote write exporter
- Understanding metric type and metadata preservation across the pipeline
- Integrating with existing Prometheus infrastructure

This makes sense given Prometheus's widespread adoption. Many organizations
start their OpenTelemetry journey by wanting to integrate with or migrate from
existing Prometheus setups. The remote write exporter in particular sees heavy
use, as it allows teams to continue using Prometheus as a storage backend while
adopting OpenTelemetry for collection and processing.

### 2. k8sattributes Processor (258 messages, 2.6%)

Kubernetes metadata enrichment is the second most discussed topic. Common
challenges include:

- Pod association and metadata extraction in DaemonSet deployments
- RBAC permissions for accessing the Kubernetes API
- Performance implications in large clusters
- Interaction with the kubeletstats receiver

The complexity of Kubernetes environments and the desire for rich metadata
context makes this processor essential but sometimes tricky to configure
correctly. Users often discover that running the Collector as a DaemonSet
requires different pod association rules than running it as a gateway, leading
to troubleshooting cycles that could be avoided with clearer guidance.

### 3. Tail Sampling Processor (167 messages, 1.7%)

Tail-based sampling generates significant discussion, often with a higher
frustration level than other topics. Users struggle with:

- Policy configuration and interaction between multiple policies
- Stateful sampling across distributed services
- Head sampling vs. tail sampling trade-offs
- Debugging why traces are or aren't being sampled
- Understanding the decision wait period and its impact on latency

The stateful nature of tail sampling, which requires collecting all spans of a
trace before making a decision, adds operational complexity that head sampling
avoids. Many teams end up running both approaches, using head sampling at the
SDK level for baseline reduction and tail sampling in the Collector for
intelligent retention of interesting traces.

### 4. Kafka Receiver and Exporter (131 messages, 1.3%)

Kafka integration appears frequently, particularly around:

- Connection and authentication issues with managed Kafka services (AWS MSK)
- Topic configuration and consumer group management
- Message format and serialization
- High-availability deployment patterns

### 5. Memory Limiter Processor (125 messages, 1.3%)

Resource management is a consistent concern:

- Proper memory limit configuration relative to container limits
- GOMEMLIMIT interaction with the memory limiter
- Debugging memory spikes and OOM situations
- CPU usage profiling with pprof

Understanding the relationship between Go's memory management, container limits,
and the memory limiter processor requires knowledge that spans multiple domains.
The recent addition of `GOMEMLIMIT` support has helped, but users still need
guidance on proper configuration for their specific deployment scenarios.

## Top 10 Problem Areas and Pain Points

Beyond component-specific discussions, our frustration analysis identified the
topics that cause the most difficulty for users. These represent areas where
improved documentation, better error messages, or tooling enhancements could
have the highest impact.

### 1. Connection and Export Failures

The most frustrating experiences relate to OTLP export failures, particularly:

- `DEADLINE_EXCEEDED` errors when exporting to backends
- TLS configuration issues with load balancers
- gRPC vs. HTTP protocol confusion
- Connectivity issues behind proxies or in cloud environments

### 2. Custom Collector Distributions

Building custom distributions with `ocb` (OpenTelemetry Collector Builder)
generates significant frustration:

- Version conflicts between components
- Build failures on specific platforms (Windows MSI notably painful)
- Dependency resolution issues
- Understanding which components to include

### 3. Configuration Syntax and Validation

Many users struggle with basic configuration:

- YAML syntax errors that produce cryptic error messages
- Understanding the relationship between receivers, processors, and exporters
- Pipeline configuration and data flow
- Environment variable substitution syntax

### 4. Context Propagation

Distributed tracing fundamentals cause confusion:

- B3 vs. W3C trace context formats
- Baggage propagation across service boundaries
- Extract and inject operations in SDKs
- Cross-language propagation issues

### 5. Attribute and Resource Management

Understanding the data model proves challenging:

- When to use resource attributes vs. span/metric/log attributes
- Moving attributes between resource and signal levels
- Semantic conventions compliance
- Attribute cardinality and its impact

### 6. OTTL (OpenTelemetry Transformation Language)

While powerful, OTTL generates confusion:

- Function syntax and available operations
- Context-specific paths and accessors
- Debugging transformation failures
- Performance implications of complex transforms

### 7. Kubernetes Operator and Auto-Instrumentation

The Operator simplifies deployment but introduces its own challenges:

- Instrumentation injection not working as expected
- Multiple collector deployment modes (DaemonSet vs. Sidecar vs. Deployment)
- CRD configuration options
- Troubleshooting injected agents

### 8. Backend Integration

Connecting to observability backends requires effort:

- Jaeger configuration and migration from legacy setups
- Vendor-specific exporter configuration
- Authentication and authorization with managed services
- Multi-backend routing

### 9. Docker and Container Deployment

Container-related issues appear regularly:

- Image selection (contrib vs. core)
- Version availability on Docker Hub
- Custom image building
- Resource limits and performance tuning

### 10. Queue and Retry Behavior

Understanding the exporter helper's behavior:

- Persistent queue configuration and storage
- Retry policies and backoff behavior
- Data loss scenarios and prevention
- Queue sizing for high-volume deployments

## What This Tells Us

Several themes emerge from this analysis:

**The Prometheus ecosystem remains central.** Organizations aren't abandoning
Prometheus; they're integrating it with OpenTelemetry. Documentation and tooling
that bridges these ecosystems will continue to be valuable.

**Kubernetes complexity compounds OTel complexity.** The k8sattributes processor
and Operator discussions show that Kubernetes environments introduce additional
layers of configuration and troubleshooting. Simplified deployment patterns and
better defaults could help.

**Sampling is conceptually difficult.** Tail sampling, despite being well
documented, generates ongoing confusion. Interactive tools or visualization of
sampling decisions might help users understand and debug their configurations.

**Error messages need improvement.** Many frustration-heavy discussions start
with a cryptic error message. Investing in actionable error messages with
suggested fixes would significantly improve the user experience.

**The gap between "getting started" and "production ready" is real.** Basic
tutorials work, but scaling to production with proper memory limits, persistent
queues, and multi-backend routing requires significant learning.

## Moving Forward

We hope this analysis helps maintainers and SIGs identify areas where
documentation improvements would have the highest impact. The data clearly shows
that certain topics, particularly around configuration patterns, sampling
strategies, and multi-backend deployments, generate recurring questions that
better guides could address.

On my end, I have lined up a series of articles that tackle some of these pain
points directly, covering topics like decomposing Collector configuration files
into manageable pieces, routing telemetry to multiple backends based on tenant
or environment, and building effective tail sampling strategies.

## Acknowledgments

Thank you to everyone who participates in the OpenTelemetry Slack community.
Your questions, error reports, and discussions not only help each other but also
provide valuable signal for where the project can improve. A special thanks to
the community members who take time to answer questions and share their
experiences - the 1% of help responses in our data represent countless hours of
volunteer effort that makes this community welcoming for newcomers.

---

_This analysis used topic modeling and sentiment analysis on publicly available
Slack messages. Individual messages were aggregated into topics; no personally
identifiable information was used in this report._
