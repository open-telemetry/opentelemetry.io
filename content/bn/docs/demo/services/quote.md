---
title: Quote সার্ভিস
linkTitle: Quote
aliases: [quoteservice]
cSpell:ignore: getquote
---

### Quote সার্ভিস

এই সার্ভিসটি শিপিং খরচ হিসাব করার জন্য দায়ী, যা প্রেরিত পণ্যের সংখ্যা অনুযায়ী নির্ধারিত হয়। শিপিং সার্ভিস থেকে HTTP এর মাধ্যমে Quote সার্ভিসটি কল করা হয়।

Quote সার্ভিসটি Slim ফ্রেমওয়ার্ক এবং ডিপেনডেন্সি ইনজেকশন পরিচালনার জন্য php-di ব্যবহার করে বাস্তবায়িত হয়েছে।

PHP ইনস্ট্রুমেন্টেশন ভিন্ন ফ্রেমওয়ার্ক ব্যবহার করার সময় কিছুটা আলাদা হতে পারে।

[Quote সার্ভিস সোর্স](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/quote/)

## ট্রেস

### ট্রেসিং শুরু করা

এই ডেমোতে, OpenTelemetry SDK স্বয়ংক্রিয়ভাবে তৈরি হয়েছে SDK অটোলোডিংয়ের মাধ্যমে, যা কম্পোজার অটোলোডিংয়ের অংশ হিসেবে ঘটে।

এটি সক্ষম করা হয়েছে পরিবেশ ভেরিয়েবল `OTEL_PHP_AUTOLOAD_ENABLED=true` সেট করে।

```php
require __DIR__ . '/../vendor/autoload.php';
```

`Tracer` তৈরি বা প্রাপ্ত করার একাধিক উপায় রয়েছে, এই উদাহরণে আমরা একটি ট্রেসার প্রাপ্ত করি গ্লোবাল ট্রেসার প্রোভাইডার থেকে যা উপরে SDK অটোলোডিংয়ের অংশ হিসেবে ইনিশিয়ালাইজ করা হয়েছিল:

```php
$tracer = Globals::tracerProvider()->getTracer('manual-instrumentation');
```

### স্প্যান ম্যানুয়ালি তৈরি করা

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

### স্প্যান অ্যাট্রিবিউট যোগ করা

আপনি `OpenTelemetry\API\Trace\Span` ব্যবহার করে বর্তমান স্প্যানটি পেতে পারেন।

```php
$span = Span::getCurrent();
```

স্প্যানে অ্যাট্রিবিউট যোগ করা হয় `setAttribute` ব্যবহার করে। `calculateQuote` ফাংশনে ২টি অ্যাট্রিবিউট `childSpan` এ যোগ করা হয়েছে।

```php
$childSpan->setAttribute('app.quote.items.count', $numberOfItems);
$childSpan->setAttribute('app.quote.cost.total', $quote);
```

### স্প্যান ইভেন্ট যোগ করা

স্প্যান ইভেন্ট যোগ করা হয় `addEvent` ব্যবহার করে। `getquote` রুটে স্প্যান ইভেন্ট যোগ করা হয়েছে। কিছু ইভেন্টে অতিরিক্ত অ্যাট্রিবিউট থাকে, কিছুতে থাকে না।

অ্যাট্রিবিউট ছাড়া স্প্যান ইভেন্ট যোগ করা:

```php
$span->addEvent('Received get quote request, processing it');
```

অতিরিক্ত অ্যাট্রিবিউট সহ স্প্যান ইভেন্ট যোগ করা:

```php
$span->addEvent('Quote processed, response sent back', [
    'app.quote.cost.total' => $payload
]);
```

## মেট্রিক্স

এই ডেমোতে, মেট্রিক্স ব্যাচ ট্রেস এবং লগ প্রসেসর দ্বারা নির্গত হয়। মেট্রিক্সে প্রসেসরের অভ্যন্তরীণ অবস্থা বর্ণিত হয়, যেমন এক্সপোর্ট করা স্প্যান বা লগের সংখ্যা, কিউ লিমিট, এবং কিউ ব্যবহার।

আপনি `OTEL_PHP_INTERNAL_METRICS_ENABLED` পরিবেশ ভেরিয়েবলটি `true` করে মেট্রিক্স সক্ষম করতে পারেন।

একটি ম্যানুয়াল মেট্রিকও নির্গত হয়, যা তৈরি করা Quoteের সংখ্যা গুণে, একটি অ্যাট্রিবিউট সহ যা আইটেমের সংখ্যা বর্ণনা করে।

একটি কাউন্টার গ্লোবালি কনফিগার করা মিটার প্রোভাইডার থেকে তৈরি হয় এবং প্রতিবার Quote তৈরি হওয়ার সময় এটি বৃদ্ধি পায়:

```php
static $counter;
$counter ??= Globals::meterProvider()
    ->getMeter('quotes')
    ->createCounter('quotes', 'quotes', 'number of quotes calculated');
$counter->add(1, ['number_of_items' => $numberOfItems]);
```

মেট্রিক্সগুলো সঞ্চিত হয় এবং নির্দিষ্ট সময় পর পর এক্সপোর্ট করা হয়, যা `OTEL_METRIC_EXPORT_INTERVAL` এ কনফিগার করা মানের ওপর নির্ভর করে।

## লগস

Quote সার্ভিস একটি লগ বার্তা নির্গত করে যখন একটি Quote হিসাব করা হয়। মনোলগ লগিং প্যাকেজটি একটি [Logs Bridge](/docs/concepts/signals/logs/#log-appender--bridge) সহ কনফিগার করা হয়েছে, যা মনোলগ লগগুলোকে OpenTelemetry ফরম্যাটে রূপান্তরিত করে। এই লগগুলো এই লগারের মাধ্যমে এক্সপোর্ট করা হবে যা গ্লোবালি কনফিগার করা OpenTelemetry লগারের মাধ্যমে।
