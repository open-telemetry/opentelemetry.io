---
title: Reduce Telemetry Traffic by Up to 2 Times Using OTel Arrow Protocol
linkTitle: OTel Arrow
date: 2023-09-14 
author: >-
  [Laurent Quérel](https://github.com/lquerel) (F5),
  [Joshua MacDonald](https://github.com/jmacd) (ServiceNow)
draft: true # TODO: remove this line once your post is ready to be published
# canonical_url: http://somewhere.else/ # TODO: if this blog post has been posted somewhere else already, uncomment & provide the canonical URL here.
body_class: otel-with-contributions-from # TODO: remove this line if there are no secondary contributing authors
---

We are thrilled to unveil the OTel Arrow Protocol and to announce the release of
a new pair of receiver/exporter in the OTel contrib repo that supports it. This
protocol, designed to complement the OTLP protocol in situations with
substantial telemetry data volumes, has been under discussion and development
for two years. It represents a collaborative effort between F5, ServiceNow Cloud
Observability, and numerous OTel technical leaders (see [donation](https://github.com/open-telemetry/community/issues/1332)). 
The compression benefits are significant, demonstrating a 2x improvement for the
majority of workloads and even greater enhancements for workloads that contain
multivariate metrics, which share attributes. One of the highlights of the OTel
Arrow integration is its seamless adaptability. In a typical deployment,
incorporating OTel Arrow doesn't necessitate any substantial changes. Users
simply need to redeploy a new version of the collector with a slightly tweaked
configuration.This new protocol will serve as the cornerstone for future
advancements in telemetry data processing and will generally foster enhanced
integration with modern telemetry backends.

## Why a new protocol?

The growth in telemetry data is undeniable and swift. This surge is attributed
to several factors: the proliferation of devices and sensors, the shift from
monolithic application deployment to more granular forms like containers and
serverless functions, and the increasing reliance on data-driven and AI-driven
technologies. As telemetry data becomes increasingly distributed, workloads
become location-agnostic, spanning data centers, clouds, and the edge. This
distribution amplifies the urgency to optimize telemetry transport across the
internet. As the ecosystem transforms, the imperative to optimize and align the
components of a telemetry pipeline end-to-end becomes more pronounced. Enter the
OTel Arrow Protocol - a pivotal solution crafted to meet this growing demand.

![OTel Arrow](./otel_arrow.png)

Historically, when telemetry data volumes were moderate, their wire
representation didn’t pose significant concerns. Such data was typically
encapsulated as structured objects using diverse serialization frameworks. Until
recently, OpenTelemetry primarily supported either JSON or, more commonly, a
Protobuf-based binary format for metrics, logs, and traces. This choice,
particularly with Protobuf, offers a good balance between simplicity, data
representation efficiency, and performance, especially when transmitting low to
medium volumes of complex telemetry objects across the network. On the backend,
this data is typically stored in a columnar format to optimize compression
ratio, data retrieval, and processing efficiency (see fig 1 to compare row vs
columnar data representation). Transitioning to an end-to-end columnar
representation throughout the pipeline streamlines the interface between
telemetry transport and backend. Additionally, it reduces the network bandwidth
required for telemetry data transmission. The OTel Arrow Protocol utilizes this
columnar representation for metrics, logs, and traces, leading to significant
savings in network expenses.

![Row vs Columnar](./row_vs_columnar.png)
Fig 1: Memory representations: row vs columnar data.

To further optimize the transmission of batches of OTel entities, this new
protocol uses gRPC streams to efficiently leverage dictionary encoding. Much of
the textual data between batches is redundant; attribute names and values are
frequently repeated. Apache Arrow supports dictionary encoding, and with a
stream-oriented protocol, we can send only the deltas of those dictionaries
between consecutive batches. These techniques enhance the protocol's
compressibility.

Another area of inefficiency is the way the OTel data model handles multivariate
metrics. Currently, there's an absence of a streamlined approach to report a
batch of metrics with shared attributes without redundantly replicating these
attributes. In specific scenarios, this redundancy places an undue strain on
both the network bandwidth and overall resource utilization. Our newly designed
protocol addresses this by offering an enhanced representation of multivariate
metrics. In certain scenarios, we've seen compression improvements of up to 7x
compared to OTLP, all without modifications on the client side. Future client
SDKs could be implemented to seamlessly expose this enhancement, potentially
leading to even better results for applications.

The advancements don't end there. In a subsequent phase of this project, we aim
to leverage the columnar layout to significantly enhance data processing speeds
within an expanded OTel Collector architecture that natively supports a new
Arrow-based pipeline. Based on our proof of concept, we anticipate at least an
order of magnitude improvement in data processing speed with this updated
collector.

These different sources of inefficiency and misalignment are the rationale
behind our support for the new OTel Arrow Protocol as an alternative to the
existing OTLP protocol. Our decision to leverage the well known Apache Arrow
project for this new columnar representation offers numerous advantages. Apache
Arrow is very efficient and well adopted in the database, data stream processing
spaces. Its rich ecosystem boasts a range of powerful libraries and tools, from
Parquet bridges to query engines such as DataFusion. Such resources can expedite
the introduction of innovative features, aligning OpenTelemetry more closely
with modern data pipelines that are increasingly pivoting towards Apache Arrow.

A specification for this protocol can be found [here](https://github.com/open-telemetry/oteps/blob/main/text/0156-columnar-encoding.md). 
A reference implementation of the encoding/decoding function can be accessed
[here](https://github.com/open-telemetry/otel-arrow). Additionally, the new pair
of OTel receiver/exporter that supports this protocol is available in the
[contrib repo](https://github.com/open-telemetry/opentelemetry-collector-contrib).

## How can I leverage OTel Arrow in my deployment?

In the initial phase of this project, our primary goal is to optimize
communication between two collectors. This is commonly observed in setups where
telemetry traffic is funneled through one or multiple collectors before being
relayed across the internet for backend processing. Given the increased
complexity of the OTel Arrow Protocol compared to the original OTLP Protocol,
its containment between two collectors offers an easier target to hit and
reduces potential disruptions to the broader ecosystem. Existing client SDKs,
processors, receivers and exporters can continue to work seamlessly. Only the
exporter and the receiver between the two collectors need to be reconfigured.
The immediate benefit will be a reduction in network bandwidth, leading to
direct savings on network costs (up to 7x for metrics, 2x for logs, and traces).
For a comprehensive breakdown of this deployment, click here [add link].

![Internet Traffic Reduction](./traffic_reduction.png)

As is often the case, there isn't a one-size-fits-all solution. Deployments with
limited resources or those generating minimal telemetry should stick with the
standard collector based on OTLP. Moreover, OTel Arrow necessitates the support
of bi-directional gRPC streams and some degree of batching to fully benefit from
the columnar representation. This can make the solution unsuitable in certain
specific scenarios. It's also worth noting that, during this phase of the
project, a slight increase in CPU and memory usage is expected in the collector.
This is due to the overhead of automatically translating OTLP objects to OTel
Arrow objects. However, this overhead will be completely eliminated in the
subsequent phase of the project.

We value our users a lot so a validation framework has been developed to reduce
errors and mitigate the risk of regression. We've utilized a telemetry data
generator to test encoding and decoding processes, specifically converting
between OTLP and OTel Arrow, and vice versa. Additionally, a flexible comparator
has been put in place to semantically compare the original OTLP request,
produced by the generator, with the resulting OTLP request after the
encoding/decoding process. This approach has enabled us to address numerous edge
cases and rectify several critical bugs. To pinpoint the origins of potential
issues, our evaluation took place at two distinct levels: firstly, a
foundational one where we interacted directly with the core encoding/decoding
mechanisms, sidestepping both collector integration and network communications;
and secondly, at the collector level, providing a thorough review of the entire
pipeline, which encompassed network interactions.

To strengthen the decoding methods against ill-formed (whether intentional or
not) OTel Arrow messages, we deliberately introduced anomalies into the OTel
Arrow message prior to decoding. Our objective was to ensure the decoding
methods would respond with an error message, rather than crash, when
encountering invalid inputs.

Beyond these automated procedures, ServiceNow Cloud Observability took further
steps by deploying the experimental collector across various staging
environments. This was done to assess both the collector's behavior and the
protocol's resilience when confronted with real traffic. Not only did these
deployments result in enhancements to our automated validation framework, but
they also substantiated our benchmark findings.

While we've diligently worked to identify and address regressions and issues,
we recognize the complex and varied nature of real-world scenarios. Thus, we
encourage the community to evaluate this new protocol across diverse deployment
situations and traffic loads, starting with the least sensitive environments.
Your deployments and feedback will assist us in further strengthening this
project.

## Next

In the future, we plan to focus on fully integrating OTel Arrow throughout the
ecosystem. The proposed developments are as follows (not necessarily in order of
priority):
- **Development of Client SDKs with native support for OTel Arrow and multivariate
metrics**: Aimed at optimizing scenarios with high telemetry producers.
- **Introduction of a new pipeline type in the Collector**: This will introduce a
new generation of receiver, processor, and exporter, each designed specifically
for consuming and/or producing OTel Arrow messages. By streamlining
communication between components, we expect to enhance data processing
efficiency. Significant acceleration is anticipated as conversions to and from
OTLP, as well as the serialization and deserialization of telemetry batches,
will be bypassed.
- **Leveraging SIMD-based data processing engines from the Apache Arrow ecosystem**:
This will further accelerate telemetry data processing and expand the range of
data processing capabilities.
- **Consideration of adding Parquet exporters**: Made possible by the existing
bridge between Arrow and Parquet.
- The broader community is also anticipated to develop more streamlined
exporters to better integrate with specific telemetry backends.

![OTel Arrow Collector](./otel_arrow_collector.png)

## Conclusion

We're excited to witness the testing and benchmarking of this new protocol by
the community. In our view, this represents a significant milestone for the
OpenTelemetry community, with even more thrilling developments on the horizon.

For those keen on delving into the intricacies of integrating OpenTelemetry with
Apache Arrow, we recommend reading these two articles featured on the Apache
Arrow Blog [[1](https://arrow.apache.org/blog/2023/04/11/our-journey-at-f5-with-apache-arrow-part-1/), 
[2](https://arrow.apache.org/blog/2023/06/26/our-journey-at-f5-with-apache-arrow-part-2/)]. 
You will find a presentation of the various approaches to effectively represent
the hierarchical and dynamic objects that are the OTel metrics, logs, and traces.

We would like to express our gratitude to our employers, F5 and ServiceNow Cloud
Observability, for allowing us to spearhead and execute this project. 
Additionally, our thanks extend to the numerous OTel technical leaders for their
invaluable assistance.
