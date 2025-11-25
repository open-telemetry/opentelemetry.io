---
title: লোড জেনারেটর
aliases: [loadgenerator]
default_lang_commit: ae417344d183999236c22834435e0dfeb109da29
cSpell:ignore: instrumentor locustfile urllib
---

লোড জেনারেটর তৈরি করা হয়েছে Python লোড টেস্টিং ফ্রেমওয়ার্ক
[Locust](https://locust.io)-এর উপর ভিত্তি করে। ডিফল্টভাবে এটি ফ্রন্টএন্ড থেকে একাধিক ভিন্ন রুটে রিকোয়েস্ট করা ইউজারদের সিমুলেট করবে।

[লোড জেনারেটর সোর্স](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/load-generator/)

---

## ট্রেস (#traces)

### ট্রেসিং ইনিশিয়ালাইজ করা (#initializing-tracing)

যেহেতু এই সার্ভিসটি একটি
[locustfile](https://docs.locust.io/en/stable/writing-a-locustfile.html), তাই OpenTelemetry SDK ইমপোর্ট স্টেটমেন্টগুলোর পর ইনিশিয়ালাইজ করা হয়। এই কোড একটি ট্রেসার প্রোভাইডার তৈরি করবে এবং একটি স্প্যান প্রসেসর ব্যবহার করার জন্য সেটআপ করবে। এক্সপোর্ট এন্ডপয়েন্ট, রিসোর্স অ্যাট্রিবিউট এবং সার্ভিস নাম স্বয়ংক্রিয়ভাবে সেট হবে
[OpenTelemetry environment variables](/docs/specs/otel/configuration/sdk-environment-variables/) দিয়ে।

```python
tracer_provider = TracerProvider()
trace.set_tracer_provider(tracer_provider)
tracer_provider.add_span_processor(BatchSpanProcessor(OTLPSpanExporter()))
```

### ইন্সট্রুমেন্টেশন লাইব্রেরি যোগ করা (#adding-instrumentation-libraries)

ইন্সট্রুমেন্টেশন লাইব্রেরি যোগ করতে হলে Python কোডে প্রতিটি লাইব্রেরির জন্য Instrumentor ইমপোর্ট করতে হবে। Locust `Requests` এবং `URLLib3` লাইব্রেরি ব্যবহার করে, তাই আমরা তাদের Instrumentor ইমপোর্ট করব।

```python
from opentelemetry.instrumentation.requests import RequestsInstrumentor
from opentelemetry.instrumentation.urllib3 import URLLib3Instrumentor
```

আপনার কোডে লাইব্রেরি ব্যবহার করার আগেই `instrument()` কল করে Instrumentor ইনিশিয়ালাইজ করতে হবে।

```python
RequestsInstrumentor().instrument()
URLLib3Instrumentor().instrument()
```

একবার ইনিশিয়ালাইজ হয়ে গেলে, এই লোড জেনারেটরের প্রতিটি Locust রিকোয়েস্টের জন্য নিজস্ব একটি ট্রেস থাকবে এবং প্রতিটি `Requests` ও `URLLib3` লাইব্রেরির জন্য আলাদা span তৈরি হবে।

---

## মেট্রিকস (#metrics)

TBD

---

## লগস (#logs)

TBD

---

## ব্যাগেজ (#baggage)

OpenTelemetry Baggage ব্যবহার করা হয় লোড জেনারেটরে, যাতে বোঝানো যায় যে ট্রেসগুলো কৃত্রিমভাবে (synthetically) তৈরি। এটি করা হয় `on_start` ফাংশনে একটি context অবজেক্ট তৈরি করে, যেখানে baggage আইটেম যোগ করা হয় এবং সেই context লোড জেনারেটরের সব টাস্কের সাথে যুক্ত করা হয়।

```python
ctx = baggage.set_baggage("synthetic_request", "true")
context.attach(ctx)
```
