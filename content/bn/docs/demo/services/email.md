---
title: ইমেইল সার্ভিস
linkTitle: ইমেইল
aliases: [emailservice]
default_lang_commit: ae417344d183999236c22834435e0dfeb109da29
cSpell:ignore: sinatra
---

অর্ডার দেওয়ার পর এই সার্ভিসটি ব্যবহারকারীর কাছে একটি কনফার্মেশন ইমেইল পাঠায়।

[ইমেইল সার্ভিস সোর্স](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/email/)

## ট্রেসিং ইনিশিয়ালাইজ করা {#initializing-tracing}

আপনাকে OpenTelemetry-এর মূল SDK এবং এক্সপোর্টার Ruby gem গুলি যুক্ত করতে হবে, পাশাপাশি যেসব gem অটো-ইনস্ট্রুমেন্টেশন লাইব্রেরির (যেমন: Sinatra) জন্য প্রয়োজন, সেগুলিও ইনস্টল করতে হবে।

```ruby
require "opentelemetry/sdk"
require "opentelemetry/exporter/otlp"
require "opentelemetry/instrumentation/sinatra"
```

Ruby SDK OpenTelemetry-এর স্ট্যান্ডার্ড এনভায়রনমেন্ট ভেরিয়েবল ব্যবহার করে OTLP এক্সপোর্ট, রিসোর্স অ্যাট্রিবিউট এবং সার্ভিস নাম স্বয়ংক্রিয়ভাবে কনফিগার করে। OpenTelemetry SDK ইনিশিয়ালাইজ করার সময়, আপনি কোন অটো-ইনস্ট্রুমেন্টেশন লাইব্রেরি ব্যবহার করবেন সেটাও উল্লেখ করবেন (যেমন: Sinatra)।

```ruby
OpenTelemetry::SDK.configure do |c|
  c.use "OpenTelemetry::Instrumentation::Sinatra"
end
```

## ট্রেস {#traces}

### অটো-ইনস্ট্রুমেন্টেড স্প্যানগুলিতে অ্যাট্রিবিউট যোগ করা {#add-attributes-to-auto-instrumented-spans}

অটো-ইনস্ট্রুমেন্টেড কোডের এক্সিকিউশনের মধ্যে আপনি বর্তমান স্প্যানটি কনটেক্সট থেকে পেতে পারেন।

```ruby
current_span = OpenTelemetry::Trace.current_span
```

একটি span অবজেক্টে একাধিক attribute যোগ করতে হলে add_attributes মেথড ব্যবহার করতে হবে।

```ruby
current_span.add_attributes({
  "app.order.id" => data.order.order_id,
})
```

একটি মাত্র attribute যোগ করতে হলে span অবজেক্টে set_attribute মেথড ব্যবহার করতে হবে।

```ruby
span.set_attribute("app.email.recipient", data.email)
```

### নতুন স্প্যান তৈরি করা {#create-new-spans}

OpenTelemetry Tracer অবজেক্টের in_span মেথড ব্যবহার করে নতুন span তৈরি করে একটিভ কনটেক্সটে সেট করা যায়। যদি এটি do..end ব্লকের সাথে ব্যবহার করা হয়, তাহলে ব্লকটির কার্যক্রম শেষ হলে span নিজে থেকেই বন্ধ হয়ে যায়।

```ruby
tracer = OpenTelemetry.tracer_provider.tracer('email')
tracer.in_span("send_email") do |span|
  # স্প্যানের কনটেক্সটে লজিক এখানে
end
```

## মেট্রিক্স {#metrics}

TBD

## লগস {#logs}

TBD
