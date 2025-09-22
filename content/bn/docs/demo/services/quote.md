---
title: Quote সার্ভিস
linkTitle: Quote
aliases: [quoteservice]
default_lang_commit: 98a528997da383a8e152021f920ce510572b1b87
cSpell:ignore: getquote
---

এই সার্ভিসের কাজ হলো কতগুলো আইটেম শিপ করতে হবে তার ভিত্তিতে শিপিং খরচ গণনা করা।
শিপিং সার্ভিস থেকে HTTP এর মাধ্যমে Quote সার্ভিসকে ডাকা হয়।

Quote সার্ভিসটি Slim ফ্রেমওয়ার্ক এবং ডিপেনডেন্সি ইনজেকশন পরিচালনার জন্য php-di ব্যবহার করে ইমপ্লিমেন্ট করা হয়েছে।

ভিন্ন কোনো ফ্রেমওয়ার্ক ব্যবহার করলে PHP ইনস্ট্রুমেন্টেশন পরিবর্তিত হতে পারে।

[Quote সার্ভিস সোর্স](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/quote/)

## ট্রেস (#traces)

### ট্রেসিং শুরু করা (#initializing-tracing)

এই ডেমোতে, OpenTelemetry SDK স্বয়ংক্রিয়ভাবে তৈরি হয়েছে SDK অটোলোডিংয়ের মাধ্যমে, যা কম্পোজার অটোলোডিংয়ের অংশ হিসেবে ঘটে।

এটি চালু করা হয়েছে এনভারনমেন্ট ভেরিয়েবল `OTEL_PHP_AUTOLOAD_ENABLED=true` সেট করে।

```php
require __DIR__ . '/../vendor/autoload.php';
```

`Tracer` তৈরি বা প্রাপ্ত করার একাধিক উপায় রয়েছে, এই উদাহরণে আমরা একটি ট্রেসার পেয়ে থাকি গ্লোবাল ট্রেসার প্রোভাইডার থেকে যা উপরে SDK অটোলোডিংয়ের অংশ হিসেবে ইনিশিয়ালাইজ করা হয়েছিল:

```php
$tracer = Globals::tracerProvider()->getTracer('manual-instrumentation');
```

### ম্যানুয়ালি স্প্যান তৈরি করা (#manually-creating-spans)

স্প্যান ম্যানুয়ালি তৈরি করা যায় একটি `Tracer` ব্যবহার করে। ডিফল্টভাবে স্প্যানটি বর্তমান কার্যকরী কন্টেক্সটে অ্যাক্টিভ স্প্যানের একটি চাইল্ড হবে:

```php
$span = Globals::tracerProvider()
    ->getTracer('manual-instrumentation')
    ->spanBuilder('calculate-quote')
    ->setSpanKind(SpanKind::KIND_INTERNAL)
    ->startSpan();
/* calculate quote */
$span->end();
```

### স্প্যান অ্যাট্রিবিউট যোগ করা (#add-span-attributes)

আপনি `OpenTelemetry\API\Trace\Span` ব্যবহার করে বর্তমান স্প্যানটি পেতে পারেন।

```php
$span = Span::getCurrent();
```

স্প্যানে অ্যাট্রিবিউট যোগ করা হয় `setAttribute` ব্যবহার করে। `calculateQuote` ফাংশনে দুইটি অ্যাট্রিবিউট `childSpan` এ যোগ করা হয়েছে।

```php
$childSpan->setAttribute('app.quote.items.count', $numberOfItems);
$childSpan->setAttribute('app.quote.cost.total', $quote);
```

### স্প্যান ইভেন্ট যোগ করা (#add-span-events)

স্প্যান ইভেন্ট যোগ করা হয় স্প্যান অবজেক্টের উপর `addEvent` ব্যবহার করে।
`getquote` রুটে স্প্যান ইভেন্টগুলো যোগ করা হয়। কিছু ইভেন্টে অতিরিক্ত অ্যাট্রিবিউট থাকে, আবার কিছুতে থাকে না।

অ্যাট্রিবিউট ছাড়া একটি স্প্যান ইভেন্ট যোগ করা:

```php
$span->addEvent('Received get quote request, processing it');
```

অতিরিক্ত অ্যাট্রিবিউট সহ স্প্যান ইভেন্ট যোগ করা:

```php
$span->addEvent('Quote processed, response sent back', [
    'app.quote.cost.total' => $payload
]);
```

## মেট্রিক্স (#metrics)

এই ডেমোতে, মেট্রিক্স ব্যাচ ট্রেস এবং লগ প্রসেসর দ্বারা তৈরি হয়। মেট্রিক্সে প্রসেসরের অভ্যন্তরীণ অবস্থা বর্ণিত হয়, যেমন এক্সপোর্ট করা স্প্যান বা লগের সংখ্যা, কিউ লিমিট, এবং কিউ ব্যবহার।

আপনি `OTEL_PHP_INTERNAL_METRICS_ENABLED` এনভারনমেন্ট ভেরিয়েবলটি `true` করে মেট্রিক্স চালু করতে পারেন।

একটি ম্যানুয়াল মেট্রিকও বের হয়, যা তৈরি করা Quote-এর সংখ্যা গুণে, একটি অ্যাট্রিবিউট সহ যা আইটেমের সংখ্যা বর্ণনা করে।

একটি কাউন্টার গ্লোবালি কনফিগার করা মিটার প্রোভাইডার থেকে তৈরি হয় এবং প্রতিবার Quote তৈরি হওয়ার সময় এটি বৃদ্ধি পায়:

```php
static $counter;
$counter ??= Globals::meterProvider()
    ->getMeter('quotes')
    ->createCounter('quotes', 'quotes', 'number of quotes calculated');
$counter->add(1, ['number_of_items' => $numberOfItems]);
```

মেট্রিকস জমা হয় এবং নির্দিষ্ট সময় অন্তর এক্সপোর্ট করা হয়, যা `OTEL_METRIC_EXPORT_INTERVAL`-এ কনফিগার করা মানের উপর ভিত্তি করে নির্ধারিত হয়।

## লগস (#logs)

কোনো Quote গণনা হওয়ার পর কোট সার্ভিস একটি লগ মেসেজ তৈরি করে।
Monolog লগিং প্যাকেজ একটি [Logs Bridge](/docs/concepts/signals/logs/#log-appender--bridge) দিয়ে কনফিগার করা থাকে, যা Monolog লগগুলোকে OpenTelemetry ফরম্যাটে রূপান্তর করে।
এই লগারে পাঠানো লগগুলো গ্লোবালি কনফিগার করা OpenTelemetry লগারের মাধ্যমে এক্সপোর্ট করা হবে।
