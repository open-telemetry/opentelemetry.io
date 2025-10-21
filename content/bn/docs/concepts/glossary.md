---
title: শব্দকোষ
description:
  OpenTelemetry-তে ব্যবহৃত টেলিমেট্রি টার্মস-এর সংজ্ঞা এবং প্রচলিত নিয়ম।
weight: 200
default_lang_commit: 1ef7e909832c9c1cbf97aa15af0516f1d5b6bde5
drifted_from_default: true
---
এই শব্দকোষ OpenTelemetry প্রজেক্টে নতুন টার্মস
এবং ধারণাগুলো ([concepts](/docs/concepts/)) সংজ্ঞায়িত করে, এবং
অবজারভেবিলিটি ক্ষেত্রে প্রচলিত টার্মসগুলোর OpenTelemetry-সম্পর্কিত
ব্যবহার স্পষ্ট করে।

প্রয়োজনে আমরা বানান এবং ক্যাপিটালাইজেশনের উপরও মন্তব্য করি। উদাহরণস্বরূপ, [OpenTelemetry](#opentelemetry) এবং [OTel](#otel) দেখুন।

## টার্মস {#terms}

### এগ্রিগেশন (Aggregation) {#aggregation}

একটি নির্দিষ্ট সময়ের ব্যবধানে, প্রোগ্রাম এক্সিকিউশনের সময় ঘটে যাওয়া
পরিমাপগুলোর সম্পর্কে সুনির্দিষ্ট বা অনুমানভিত্তিক পরিসংখ্যানে একাধিক
পরিমাপকে একত্রিত করার প্রক্রিয়া। [Metric](#metric) [Data source]
(#data-source) দ্বারা ব্যবহৃত।

### API {#api}

Application Programming Interface। OpenTelemetry প্রজেক্টে, [Data source](#data-source) অনুযায়ী টেলিমেট্রি ডেটা কীভাবে তৈরি হয় তা
সংজ্ঞায়িত করতে ব্যবহৃত হয়।

### এপ্লিকেশন (Application) {#application}

এন্ড ইউজার (end user) বা অন্যান্য অ্যাপ্লিকেশনের জন্য ডিজাইন করা এক বা একাধিক [সার্ভিস](#service)।

### APM {#apm}

Application Performance Monitoring হল সফটওয়্যার অ্যাপ্লিকেশন, তাদের পারফরম্যান্স (গতি, রেলিয়াবিলিটি, এভাইল্যাবিলিটি ইত্যাদি) নিরীক্ষণ করে
সমস্যা শনাক্ত করা, সতর্কতা এবং
মূল কারণ খুঁজে বের করার জন্য একটা টুলিং সিস্টেম।

### অ্যাট্রিবিউট (Attribute) {#attribute}

[Metadata](#metadata)-এর জন্য OpenTelemetry টার্ম। টেলিমেট্রি উৎপাদনকারী এন্টিটিতে (entity) key-value তথ্য যুক্ত করে। [Signals](#signal) এবং
[Resources](#resource) জুড়ে
ব্যবহৃত হয়। [attribute spec][attribute] দেখুন।

### অটোমেটিক ইনস্ট্রুমেন্টেশন (Automatic instrumentation) {#automatic-instrumentation}

এটি টেলিমেট্রি কালেকশন মেথড-গুলিকে বোঝায় যেখানে এন্ড ইউজারকে (end user) অ্যাপ্লিকেশনের
সোর্স কোড পরিবর্তন করতে হয় না। মেথড-গুলো প্রোগ্রামিং ভাষা অনুযায়ী ভিন্ন হয়, এবং
উদাহরণ হিসেবে bytecode injection বা monkey patching-এর কথা বলা যায়।

### ব্যাগেজ (Baggage) {#baggage}

ইভেন্ট এবং সার্ভিস-গুলোর মধ্যে কার্যকারণ সম্পর্ক স্থাপনে সহায়তা করতে [Metadata](#metadata) প্রচারের একটি
মেকানিজম (mechanism)। [baggage spec][baggage] দেখুন।

### ক্লায়েন্ট লাইব্রেরি (Client library)

[Instrumented library](#instrumented-library) দেখুন।

### ক্লায়েন্ট-সাইড অ্যাপ (Client-side app)

এটি [Application](#application)-এর একটি উপাদান যা একটি প্রাইভেট ইনফ্রাস্ট্রাকচার-এর ভিতরে চলে না এবং
সাধারণত এন্ড ইউজাররা (end users) সরাসরি ব্যবহার করে। client-side app-এর উদাহরণ
হল ব্রাউজার অ্যাপ, মোবাইল অ্যাপ, এবং IoT ডিভাইসে চালিত অ্যাপ।

### কালেক্টর (Collector) {#collector}

[OpenTelemetry Collector], বা সংক্ষেপে Collector, হল টেলিমেট্রি ডেটা গ্রহণ, প্রক্রিয়াকরণ এবং
রপ্তানির একটি ভেন্ডর-এগ্নস্টিক (vendor-agnostic) বাস্তবায়ন। এটি একটি একক বাইনারি যা agent বা
gateway হিসেবে ডিপ্লয় (deploy) করা যায়।

> **বানান**: [OpenTelemetry Collector] উল্লেখ করার সময়, সর্বদা Collector
> বড় অক্ষরে লিখুন। আপনি যদি Collector-কে বিশেষণ হিসেবে ব্যবহার করেন তাহলে শুধু "Collector"
> ব্যবহার করুন &mdash; উদাহরণস্বরূপ, "Collector configuration"।

[OpenTelemetry Collector]: /docs/collector/

### কন্ট্রিব (Contrib) {#contrib}

বেশ কয়েকটি [Instrumentation Libraries](#instrumentation-library) এবং [Collector](#collector)
কোর ক্যাপাবিলিটিজ-এর (core capabilities) একটি সেট এবং সাথে vendor `Exporters` সহ
নন-কোর ক্যাপাবিলিটিজ-এর (non-core capabilities) জন্য একটি ডেডিকেটেড contrib repository অফার করে।

### কনটেক্সট প্রপাগেশন (Context propagation) {#context-propagation}

[Transaction](#transaction) এর জীবদ্দশায় state সংরক্ষণ এবং ডেটা অ্যাক্সেসের
জন্য সমস্ত [Data sources](#data-source) কে একটি underlying context
mechanism শেয়ার করে নেওয়ার অনুমতি দেয়।
[context propagation spec][context propagation] দেখুন।

### DAG {#dag}

[Directed Acyclic Graph][dag]।

### ডাটা সোর্স (Data source) {#data-source}

[Signal](#signal) দেখুন

### ডাইমেনশন (Dimension) {#dimension}

[Metrics](#metric) দ্বারা বিশেষভাবে ব্যবহৃত একটি টার্ম। [Attribute](#attribute) দেখুন।

### ডিস্ট্রিবিউটেড ট্রেসিং (Distributed tracing) {#distributed-tracing}

এটি একটি [Application](#application) তৈরিকারী [Services](#service) দ্বারা পরিচালিত হওয়ার
সাথে সাথে একটি একক [Request](#request)-এর অগ্রগতি ট্র্যাক করে, যাকে [Trace](#trace) বলা হয়।
একটি [Distributed trace](#distributed-tracing) প্রক্রিয়া,
নেটওয়ার্ক এবং নিরাপত্তা সীমানা অতিক্রম করে।

[Distributed tracing][distributed tracing] দেখুন।

### ডিস্ট্রিবিউশন (Distribution) {#distribution}

একটি distribution হল কিছু কাস্টমাইজেশন সহ একটি upstream OpenTelemetry repository-এর চারপাশে
একটি wrapper। [Distributions] দেখুন।

### (ইভেন্ট) Event {#event}

Event একটি event name এবং well-known structure সহ একটি [Log Record](#log-record)। উদাহরণস্বরূপ, OpenTelemetry-তে
ব্রাউজার ইভেন্টগুলো একটি নির্দিষ্ট নামকরণ নিয়ম
অনুসরণ করে এবং একটি সাধারণ কাঠামোতে নির্দিষ্ট ডেটা বহন করে।

### এক্সপোর্টার (Exporter) {#exporter}

consumers-দের কাছে টেলিমেট্রি নির্গত করার কার্যকারিতা প্রদান করে। Exporters push- বা
pull-based হতে পারে।

### ফিল্ড (Field) {#field}

[Log Records](#log-record) দ্বারা বিশেষভাবে ব্যবহৃত একটি পরিভাষা। [Attributes](#attribute) এবং
[Resource](#resource) সহ নির্ধারিত ক্ষেত্রগুলোর মাধ্যমে [Metadata](#metadata) যুক্ত করা যেতে পারে। অন্যান্য
ক্ষেত্রগুলোও `Metadata` হিসেবে বিবেচিত
হতে পারে, যার মধ্যে severity এবং trace তথ্য রয়েছে। [field spec][field] দেখুন।

### gRPC {#grpc}

একটি উচ্চ-পারফরম্যান্স, ওপেন সোর্স সর্বজনীন [RPC](#rpc) ফ্রেমওয়ার্ক।
[gRPC](https://grpc.io) দেখুন।

### HTTP {#http}

[Hypertext Transfer Protocol][http]-এর সংক্ষিপ্ত রূপ।

### ইন্স্ট্রুমেন্টেড লাইব্রেরি (Instrumented library) {#instrumented-library}

[Library](#library)-কে নির্দেশ করে, যার জন্য টেলিমেট্রি সিগনালগুলো
([Traces](#trace), [Metrics](#metric), [Logs](#log)) সংগ্রহ করা হয়।
[Instrumented library][] দেখুন।

### ইনস্ট্রুমেন্টেশন লাইব্রেরি (Instrumentation library) {#instrumentation-library}

[Library](#library)-কে নির্দেশ করে যা একটি নির্দিষ্ট [Instrumented library](#instrumented-library)-এর
জন্য instrumentation প্রদান করে। [Instrumented library](#instrumented-library)
এবং [Instrumentation library](#instrumentation-library)
একই [Library](#library) হতে পারে
যদি এতে built-in OpenTelemetry
instrumentation থাকে। [lib specification][spec-instrumentation-lib] দেখুন।

### JSON {#json}

[JavaScript Object Notation][json]-এর সংক্ষিপ্ত রূপ।

### লেবেল (Label) {#label}

[Metrics](#metric) দ্বারা বিশেষভাবে ব্যবহৃত একটি পরিভাষা। [Metadata](#metadata) দেখুন।

### ভাষা (Language) {#language}

Programming Language।

### লাইব্রেরি (Library) {#library}

একটি ইন্টারফেস দ্বারা আহ্বান করা আচরণের ভাষা-নির্দিষ্ট সংগ্রহ।

### লগ (Log) {#log}

কখনও কখনও [Log records](#log-record)-এর একটি সংগ্রহ বোঝাতে ব্যবহৃত হয়। অস্পষ্ট হতে পারে কারণ
লোকেরা কখনও কখনও একটি একক [Log record](#log-record) বোঝাতেও [Log](#log) ব্যবহার করে।
যেখানে অস্পষ্টতা সম্ভব,
অতিরিক্ত qualifier ব্যবহার করুন, উদাহরণস্বরূপ, `Log record`। [Log] দেখুন।

### লগ রেকর্ড (Log record) {#log-record}

একটি timestamp এবং একটি severity সহ ডেটার রেকর্ডিং। একটি trace-এর সাথে সম্পর্কিত হলে
একটি [Trace ID](#trace) এবং
[Span ID](#span) থাকতে পারে। [Log record][] দেখুন।

### মেটাডাটা (Metadata) {#metadata}

একটি key-value pair, উদাহরণস্বরূপ `foo="bar"`, টেলিমেট্রি উৎপাদনকারী একটি entity-তে যুক্ত।
OpenTelemetry এই জোড়াগুলোকে [Attributes](#attribute) বলে।
এছাড়াও, [Metrics](#metric)-এ [Dimensions](#dimension)
এবং [Labels](#label) আছে, যখন [Logs](#log)-এ [Fields](#field) আছে।

### মেট্রিক (Metric) {#metric}

[Metadata](#metadata) সহ time series হিসেবে একটি ডেটা পয়েন্ট রেকর্ড করে, raw measurements বা
predefined aggregation হিসেবে। [Metric] দেখুন।

### OC {#oc}

[OpenCensus](#opencensus)-এর সংক্ষিপ্ত রূপ।

### অবজারভেবিলিটি ব্যাকএন্ড (Observability backend) {#observability-backend}

একটি observability platform-এর কম্পোনেন্ট যা টেলিমেট্রি ডেটা গ্রহণ, প্রক্রিয়াকরণ, সংরক্ষণ এবং কোয়েরি (query) করার
জন্য দায়ী। উদাহরণের মধ্যে [Jaeger]
এবং [Prometheus]-এর মতো ওপেন সোর্স টুলস,
পাশাপাশি বাণিজ্যিক অফারিংও রয়েছে। OpenTelemetry একটি observability backend নয়।

### অবজারভেবিলিটি ফ্রন্টএন্ড (Observability frontend) {#observability-frontend}

একটি observability platform-এর কম্পোনেন্ট যা টেলিমেট্রি ডেটা ভিজুয়ালাইজ এবং বিশ্লেষণের জন্য ইউজার ইন্টারফেস প্রদান করে।
এটি প্রায়শই একটি observability backend-এর অংশ
হতে পারে, বিশেষ করে যখন বাণিজ্যিক অফারিং বিবেচনা করা হয়।

### OpAMP {#opamp}

[Open Agent Management Protocol](/docs/collector/management/#opamp)-এর
সংক্ষিপ্ত রূপ।

> **বানান**: বর্ণনা বা নির্দেশনায় OpAMP লিখুন, `OPAMP` বা `opamp`
> নয়।

### OpenCensus {#opencensus}

OpenTelemetry-এর পূর্বসূরি। বিস্তারিত জানতে,
[History](/docs/what-is-opentelemetry/#history) দেখুন।

### OpenTelemetry {#opentelemetry}

[OpenTracing](#opentracing) এবং [OpenCensus](#opencensus) প্রকল্পের [merger] এর মাধ্যমে গঠিত, OpenTelemetry &mdash; এই
ওয়েবসাইটের বিষয় হল [APIs](#api), [SDKs](#sdk), এবং
টুলসগুলোর একটি কালেকশন যা আপনি [instrument](/docs/concepts/instrumentation/),
generate, [collect](/docs/concepts/components/#collector),
এবং [export](/docs/concepts/components/#exporters) করতে
ব্যবহার করতে
পারেন [telemetry data](/docs/concepts/signals/)
যেমন [metrics](#metric), [logs](#log), এবং [traces](#trace)।

> **বানান**: OpenTelemetry সর্বদা একটি একক unhyphenated শব্দ হওয়া উচিত এবং
> বড় অক্ষরে লিখতে হবে।

[merger]: /docs/what-is-opentelemetry/#history

### OpenTracing {#opentracing}

OpenTelemetry-এর পূর্বসূরি। বিস্তারিত জানতে,
[History](/docs/what-is-opentelemetry/#history) দেখুন।

### OT {#ot}

[OpenTracing](#opentracing)-এর সংক্ষিপ্ত রূপ।

### OTel {#otel}

[OpenTelemetry](/docs/what-is-opentelemetry/)-এর সংক্ষিপ্ত রূপ।

> **বানান**: OTel লিখুন, `OTEL` নয়।

### OTelCol {#otelcol}

[OpenTelemetry Collector](#collector)-এর সংক্ষিপ্ত রূপ।

### OTEP {#otep}

[OpenTelemetry Enhancement Proposal]-এর একটি সংক্ষিপ্ত রূপ।

> **বানান**: বহুবচন হিসেবে "OTEPs" লিখুন। বর্ণনায় `OTep` বা `otep`
> লিখবেন না।

[OpenTelemetry Enhancement Proposal]:
  https://github.com/open-telemetry/opentelemetry-specification/blob/main/oteps/README.md

### OTLP {#otlp}

[OpenTelemetry Protocol](/docs/specs/otlp/)-এর সংক্ষিপ্ত রূপ।

### প্রপাগেটরস (Propagators)

span context এবং [Spans](#span)-এ [Baggage](#baggage)-এর মতো টেলিমেট্রি ডেটার নির্দিষ্ট অংশগুলো serialize এবং deserialize করতে ব্যবহৃত হয়।
[Propagators] দেখুন।

### Proto {#proto}

ভাষা নিরপেক্ষ ইন্টারফেস টাইপ। [opentelemetry-proto] দেখুন।

### গ্রাহক (Receiver) {#receiver}

পরিভাষা টেলিমেট্রি ডেটা কীভাবে গৃহীত হয় তা সংজ্ঞায়িত
করতে [Collector](/docs/collector/configuration/#receivers) দ্বারা ব্যবহৃত হয়।
Receivers push- বা pull-based হতে পারে। [Receiver] দেখুন।

### অনুরোধ (Request) {#request}

[Distributed Tracing](#distributed-tracing) দেখুন।

### রিসোর্স (Resource) {#resource}

টেলিমেট্রি উৎপাদনকারী entity সম্পর্কে তথ্য [Attributes](#attribute) হিসেবে ক্যাপচার করে।
উদাহরণস্বরূপ, Kubernetes-এ একটি container-এ চলমান একটি প্রক্রিয়া যা টেলিমেট্রি উৎপাদন করে তার একটি প্রসেস (process) নাম,
একটি pod নাম, একটি namespace, এবং সম্ভবত একটি deployment নাম আছে।
এই সমস্ত attributes `Resource`-এ
অন্তর্ভুক্ত করা যেতে পারে।

### REST {#rest}

[Representational State Transfer][rest]-এর সংক্ষিপ্ত রূপ।

### RPC {#rpc}

[Remote Procedure Call][rpc]-এর সংক্ষিপ্ত রূপ।

### Sampling {#sampling}

রপ্তানি করা ডেটার পরিমাণ নিয়ন্ত্রণের একটি মেকানিজম।
সবচেয়ে সাধারণভাবে [Tracing](#trace) [Data Source](#data-source)-এর সাথে ব্যবহৃত। [Sampling] দেখুন।

### SDK {#sdk}

Software Development Kit-এর সংক্ষিপ্ত রূপ। একটি টেলিমেট্রি SDK-কে বোঝায় যা একটি [Library](#library)
নির্দেশ করে যা OpenTelemetry [API](#api) implement করে।

### Semantic conventions {#semantic-conventions}

vendor-agnostic টেলিমেট্রি ডেটা প্রদানের জন্য [Metadata](#metadata)-এর মানক নাম এবং
মান সংজ্ঞায়িত করে।

### সেবা (Service) {#service}

[Application](#application)-এর একটি উপাদান। উচ্চ availability এবং scalability-এর জন্য সাধারণত
একটি [Service](#service)-এর একাধিক
instances ডিপ্লয় করা হয়। একটি [Service](#service) একাধিক স্থানে ডিপ্লয় করা যেতে পারে।

### সিগন্যাল (Signal) {#signal}

[Traces](#trace), [Metrics](#metric) বা [Logs](#log)-এর মধ্যে একটি। [Signals] দেখুন।

### স্প্যান (Span) {#span}

একটি [Trace](#trace)-এর মধ্যে একটি একক অপারেশন প্রতিনিধিত্ব করে। [Span] দেখুন।

### স্প্যান লিঙ্ক (Span link) {#span-link}

একটি span link হল কার্যকারণ-সম্পর্কিত spans-এর মধ্যে একটি লিঙ্ক।
বিস্তারিত জানতে [Links between spans](/docs/specs/otel/overview#links-between-spans) এবং
[Specifying Links](/docs/specs/otel/trace/api#specifying-links) দেখুন।

### স্পেসিফিকেশন (Specification) {#specification}

সমস্ত বাস্তবায়নের জন্য ক্রস-ল্যাঙ্গুয়েজ প্রয়োজনীয়তা এবং
প্রত্যাশা বর্ণনা করে। [Specification] দেখুন।

### স্ট্যাটাস (Status) {#status}

অপারেশনের ফলাফল। সাধারণত একটি ত্রুটি ঘটেছে কিনা
তা নির্দেশ করতে ব্যবহৃত। [Status] দেখুন।

### ট্যাগ (Tag) {#tag}

[Metadata](#metadata) দেখুন।

### ট্রেস (Trace) {#trace}

[Spans](#span)-এর একটি [DAG](#dag), যেখানে [Spans](#span)-এর
মধ্যে edges parent-child সম্পর্ক হিসেবে সংজ্ঞায়িত। [Traces] দেখুন।

### ট্রেসার (Tracer) {#tracer}

[Spans](#span) তৈরির জন্য দায়ী। [Tracer] দেখুন।

### ট্রানজেকশন (Transaction) {#transaction}

[Distributed Tracing](#distributed-tracing) দেখুন।

### zPages {#zpages}

external exporters-এর একটি in-process বিকল্প।
অন্তর্ভুক্ত করা হলে, তারা
পটভূমিতে tracing এবং metrics তথ্য সংগ্রহ এবং একত্রিত করে; অনুরোধ করা হলে এই ডেটা ওয়েব পৃষ্ঠাগুলোতে পরিবেশিত হয়। [zPages] দেখুন।

[attribute]: /docs/specs/otel/common/#attributes
[baggage]: /docs/specs/otel/baggage/api/
[context propagation]: /docs/specs/otel/overview#context-propagation
[dag]: https://en.wikipedia.org/wiki/Directed_acyclic_graph
[distributed tracing]: ../signals/traces/
[distributions]: ../distributions/
[field]: /docs/specs/otel/logs/data-model#field-kinds
[http]: https://en.wikipedia.org/wiki/Hypertext_Transfer_Protocol
[instrumented library]: /docs/specs/otel/glossary/#instrumented-library
[Jaeger]: https://www.jaegertracing.io/
[json]: https://en.wikipedia.org/wiki/JSON
[log record]: /docs/specs/otel/glossary#log-record
[log]: /docs/specs/otel/glossary#log
[metric]: ../signals/metrics/
[opentelemetry-proto]: https://github.com/open-telemetry/opentelemetry-proto
[propagators]: /docs/languages/go/instrumentation/#propagators-and-context
[Prometheus]: https://prometheus.io/
[receiver]: /docs/collector/configuration/#receivers
[rest]: https://en.wikipedia.org/wiki/Representational_state_transfer
[rpc]: https://en.wikipedia.org/wiki/Remote_procedure_call
[sampling]: /docs/specs/otel/trace/sdk#sampling
[signals]: ../signals/
[span]: /docs/specs/otel/trace/api#span
[spec-instrumentation-lib]: /docs/specs/otel/glossary/#instrumentation-library
[specification]: ../components/#specification
[status]: /docs/specs/otel/trace/api#set-status
[tracer]: /docs/specs/otel/trace/api#tracer
[traces]: /docs/specs/otel/overview#traces
[zpages]:
  https://github.com/open-telemetry/opentelemetry-specification/blob/main/development/trace/zpages.md
