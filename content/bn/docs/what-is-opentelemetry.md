---
title: OpenTelemetry কী?
description: Opentelemetry কী এবং কী নয়, তার সংক্ষিপ্ত ব্যাখ্যা।
aliases: [/about, /docs/concepts/what-is-opentelemetry, /otel]
weight: 150
default_lang_commit: fb38bda3b4b9ae69c99b8d70543d0df37872aeac
drifted_from_default: true
cSpell:ignore: youtube
---

OpenTelemetry হলো:

- একটি **[অবজার্ভেবিলিটি][observability] ফ্রেমওয়ার্ক ও টুলকিট**, যা [টেলিমেট্রি ডেটা][telemetry data] — যেমন [ট্রেস][traces], [মেট্রিক্স][metrics], ও [লগের][logs] :

  - [জেনারেশন][instr]
  - এক্সপোর্ট
  - [কালেকশন](../concepts/components/#collector)

  কাজগুলোকে সহজ করে তুলতে তৈরি করা হয়েছে।

- **ওপেন সোর্স** এবং **ভেন্ডর ও টুল নিরপেক্ষ** হওয়ায় এটি বিভিন্ন ধরনের অবজার্ভেবিলিটি ব্যাকএন্ডে ব্যবহার করা যায়, ওপেন সোর্স টুলে ব্যবহার করা যায় যেমন [Jaeger], [Prometheus], তেমনি যেকোনো কমার্শিয়াল সলিউশনের সঙ্গেও।\
তবে OpenTelemetry নিজে কোনো অবজার্ভেবিলিটি ব্যাকএন্ড **নয়**।

OpenTelemetry-এর অন্যতম প্রধান লক্ষ্য হলো বিভিন্ন প্রোগ্রামিং ল্যাংগুয়েজ, ইনফ্রাস্ট্রাকচার ও রানটাইম এনভারমেন্ট নির্বিশেষে অ্যাপ্লিকেশন ও সিস্টেমগুলিকে সহজে ইন্সট্রুমেন্ট (instrumentation) করা।

টেলিমেট্রি ডেটার ব্যাকএন্ড (স্টোরেজ) ও ফ্রন্টএন্ড (ভিজ্যুয়ালাইজেশন) ইচ্ছাকৃতভাবে অন্য টুলের জন্য ছেড়ে দেওয়া হয়েছে।

<div class="td-max-width-on-larger-screens">
{{< youtube iEEIabOha8U >}}
</div>

আরও ভিডিও ও রিসোর্সের জন্য দেখুন [পরবর্তী ধাপ](#what-next)।

## অবজার্ভেবিলিটি কী? {#what-is-observability}

[অবজার্ভেবিলিটি][observability] মানে হলো—একটি সিস্টেমের আউটপুট দেখে তার ভেতরের অবস্থা বোঝার ক্ষমতা। সফটওয়্যারের ক্ষেত্রে, টেলিমেট্রি ডেটা (ট্রেস, মেট্রিক্স এবং লগ) দেখে সিস্টেমের ভেতরের অবস্থা জানাকে বোঝায়।

একটি সিস্টেমকে অবজার্ভেবল করতে হলে, সেটিকে [ইনস্ট্রুমেন্টেড][instr] করতে হয়। অর্থাৎ কোড থেকে [ট্রেস][traces], [মেট্রিক্স][metrics] বা [লগ][logs] বের করতে হবে এবং সেগুলো অবজার্ভেবিলিটি ব্যাকএন্ডে পাঠাতে হবে।

## কেন OpenTelemetry? {#why-opentelemetry}

ক্লাউড কম্পিউটিং, মাইক্রোসার্ভিস, এবং জটিল বিজনেস চাহিদা বাড়ার সাথে সাথে সফটওয়্যার ও অবকাঠামোর [অবজার্ভেবিলিটি][observability] এখন অত্যন্ত গুরুত্বপূর্ণ।

OpenTelemetry এই চাহিদা পূরণ করে দুটি মূল নীতিতে:

1. আপনি যে ডেটা তৈরি করেন, তার মালিক আপনি। কোনো ভেন্ডর লক-ইন করা হবে না।
2. আপনাকে শুধু এক সেট API ও কনভেনশন শিখলেই চলবে।

এই দুই নীতির ফলে টিম ও প্রতিষ্ঠানগুলো পায় আধুনিক প্রযুক্তি জগতে প্রয়োজনীয় নমনীয়তা।

আরও জানতে পড়ুন OpenTelemetry-র [মিশন, ভিশন ও মূল্যবোধ](/community/mission/)।

## OpenTelemetry-এর প্রধান কম্পোনেন্টসমূহ {#main-opentelemetry-components}

OpenTelemetry গঠিত নিম্নলিখিত প্রধান অংশ নিয়ে:

- সব কম্পোনেন্টের জন্য শুধুমাত্র একটি [স্পেসিফিকেশন](/docs/specs/otel)।
- একটি স্ট্যান্ডার্ড [প্রোটোকল](/docs/specs/otlp/) যা টেলিমেট্রি ডেটার আকৃতি সংজ্ঞায়িত করে।
- [সেমান্টিক কনভেনশন](/docs/specs/semconv/) সাধারণ টেলিমেট্রি ডেটাগুলোর জন্য একটি স্ট্যান্ডার্ড নামকরণ পদ্ধতি প্রদান করে।
- এপিআইগুলো (APIs) টেলিমেট্রি ডেটা কীভাবে তৈরি করতে হয় তা সংজ্ঞায়িত করে।
- [Language SDKs](../languages) স্পেসিফিকেশন, API এবং টেলিমেট্রি ডেটার এক্সপোর্ট বাস্তবায়ন করে।
- একটি [লাইব্রেরি ইকোসিস্টেম](/ecosystem/registry), যা কমন লাইব্রেরি এবং ফ্রেমওয়ার্কগুলির জন্য ইন্সট্রুমেন্টেশন বাস্তবায়ন করে।
- স্বয়ংক্রিয় ইনস্ট্রুমেন্টেশন কম্পোনেন্ট কোডে কোনো পরিবর্তনের প্রয়োজন ছাড়াই টেলিমেট্রি ডেটা তৈরি করে।
- [OpenTelemetry Collector](../collector) একটি প্রক্সি যা টেলিমেট্রি ডেটা গ্রহণ, প্রক্রিয়াকরণ এবং এক্সপোর্ট করে।
- এছাড়া আরও অনেক টুল, যেমন [Kubernetes-এর জন্য OpenTelemetry Operator](../platforms/kubernetes/operator/), [Helm Charts](../platforms/kubernetes/helm/), এবং [FaaS-এর জন্য কমিউনিটি অ্যাসেট](../platforms/faas/)

OpenTelemetry এখন বহু [লাইব্রেরি, সার্ভিস ও অ্যাপস](/ecosystem/integrations/)–এ অবজার্ভেবিলিটি দেওয়ার জন্য ডিফল্টভাবে ইন্টিগ্রেটেড থাকে।

এছাড়া, অনেক [ভেন্ডর](/ecosystem/vendors/) OpenTelemetry-কে কমার্শিয়াল সাপোর্ট দেয় এবং সরাসরি প্রজেক্টে কনট্রিবিউট করে।

## এক্সটেনসিবিলিটি {#extensibility}

OpenTelemetry ডিজাইন করা হয়েছে এক্সটেন্সিবল হিসেবে। নিম্নে তার কিছু উদাহরণ দেওয়া হলো:

- কাস্টম সোর্স থেকে টেলিমেট্রি ডেটা সাপোর্ট করার জন্য OpenTelemetry Collector-এ নতুন রিসিভার যুক্ত করা।
- SDK-তে কাস্টম ইনস্ট্রুমেন্টেশন লাইব্রেরি লোড করা।
- নির্দিষ্ট ইউজ কেসের জন্য SDK বা Collector-এর [ডিস্ট্রিবিউশন](../concepts/distributions/) তৈরি।
- OpenTelemetry protocol (OTLP) সাপোর্ট না করা কাস্টম ব্যাকএন্ডের জন্য নতুন এক্সপোর্টার তৈরি।
- ননস্ট্যান্ডার্ড কনটেক্সট প্রোপাগেশন ফরম্যাটের জন্য কাস্টম প্রোপাগেটর তৈরি।

বেশিরভাগ ব্যবহারকারীর OpenTelemetry এক্সটেন্ড করার দরকার না-ও হতে পারে, কিন্তু প্রজেক্টটি প্রায় সব স্তরের কথা মাথায় রেখেই তৈরি করা হয়েছে।

## ইতিহাস {#history}

OpenTelemetry হলো [Cloud Native Computing Foundation][] (CNCF)-এর একটি প্রজেক্ট, যা [OpenTracing](https://opentracing.io) ও [OpenCensus](https://opencensus.io) নামক দুটি পূর্ববর্তী প্রজেক্টের [একীভূতকরণের][merger] ফলে গঠিত হয়েছে। এই দুইটি প্রজেক্টের জন্ম হয়েছিলো কোড কীভাবে ইন্সট্রুমেন্ট করতে হবে এবং অবজার্ভেবিলিটি ব্যাকএন্ডে টেলিমেট্রি ডেটা কীভাবে পাঠাতে হবে, সে বিষয়ে কোনো নির্দিষ্ট কোনো স্ট্যান্ডার্ড না থাকায়। তবে কোনো প্রজেক্টই এককভাবে স্ট্যান্ডার্ড তৈরিতে সফল না হওয়ায়, তারা একত্রিত হয়ে OpenTelemetry তৈরি করে এবং একটি একক সমাধান নিয়ে আসে।

আপনি যদি বর্তমানে OpenTracing বা OpenCensus ব্যবহার করেন, তাহলে [মাইগ্রেশন গাইড](../migration/) থেকে OpenTelemetry-তে কীভাবে মাইগ্রেট করবেন তা জেনে নিতে পারেন।

[merger]: https://www.cncf.io/blog/2019/05/21/a-brief-history-of-opentelemetry-so-far/

## পরবর্তী ধাপ {#what-next}

- [শুরু করুন](../getting-started/) —  OpenTelemetry ব্যবহার শুরু করুন সহজেই।
- [OpenTelemetry এর কনসেপ্টগুলো](../concepts/)  সম্পর্কে জানুন।
- [ভিডিও দেখুন][watch videos] — [OTel for beginners] ও অন্যান্য [প্লেলিস্ট][playlists] থেকে।
- সাইন আপ করুন [ট্রেনিং](/training) এর জন্য এবং পেয়ে যান [Getting started with OpenTelemetry](/training/#courses) কোর্সটি একদম বিনামূল্যে।

[Cloud Native Computing Foundation]: https://www.cncf.io
[instr]: ../concepts/instrumentation
[Jaeger]: https://www.jaegertracing.io/
[logs]: ../concepts/signals/logs/
[metrics]: ../concepts/signals/metrics/
[observability]: ../concepts/observability-primer/#what-is-observability
[OTel for beginners]: https://www.youtube.com/playlist?list=PLVYDBkQ1TdyyWjeWJSjXYUaJFVhplRtvN
[playlists]: https://www.youtube.com/@otel-official/playlists
[Prometheus]: https://prometheus.io/
[telemetry data]: ../concepts/signals/
[traces]: ../concepts/signals/traces/
[Watch videos]: https://www.youtube.com/@otel-official
