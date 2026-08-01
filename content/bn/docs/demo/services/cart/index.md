---
title: কার্ট সার্ভিস
linkTitle: কার্ট
aliases: [cartservice]
default_lang_commit: ae417344d183999236c22834435e0dfeb109da29
---

এই সার্ভিসটি ব্যবহারকারীদের শপিং কার্টে রাখা আইটেম সংরক্ষণ করে। এটি দ্রুত শপিং কার্ট
ডেটা অ্যাক্সেসের জন্য Valkey ক্যাশিং সার্ভিসের সাথে ইন্টারঅ্যাক্ট করে।

[কার্ট সার্ভিস সোর্স](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/cart/)

> **নোট** .NET-এর ট্রেস এবং মেট্রিক্স-এর জন্য, স্ট্যান্ডার্ড OpenTelemetry API ব্যবহার না করে,
> `System.Diagnostic.DiagnosticSource` লাইব্রেরিকে API হিসেবে ব্যবহার করা হয়।
> লগের জন্য `Microsoft.Extensions.Logging.Abstractions` লাইব্রেরি ব্যবহৃত হয়।

## ট্রেস {#traces}

### ট্রেসিং ইনিশিয়ালাইজ করা {#initializing-tracing}

OpenTelemetry .NET ডিপেন্ডেন্সি ইনজেকশন কন্টেইনারে কনফিগার করা হয়।
`AddOpenTelemetry()` বিল্ডার মেথডটি কাঙ্ক্ষিত ইনস্ট্রুমেন্টেশন লাইব্রেরি, এক্সপোর্টার এবং অন্যান্য
অপশন কনফিগার করতে ব্যবহৃত হয়। এক্সপোর্টার এবং রিসোর্স অ্যাট্রিবিউট কনফিগারেশন এনভারনমেন্ট
ভেরিয়েবল দ্বারা সম্পন্ন হয়।

```cs
Action<ResourceBuilder> appResourceBuilder =
    resource => resource
        .AddContainerDetector()
        .AddHostDetector();

builder.Services.AddOpenTelemetry()
    .ConfigureResource(appResourceBuilder)
    .WithTracing(tracerBuilder => tracerBuilder
        .AddSource("OpenTelemetry.Demo.Cart")
        .AddRedisInstrumentation(
            options => options.SetVerboseDatabaseStatements = true)
        .AddAspNetCoreInstrumentation()
        .AddGrpcClientInstrumentation()
        .AddHttpClientInstrumentation()
        .AddOtlpExporter());
```

### অটো-ইনস্ট্রুমেন্টেড স্প্যানে অ্যাট্রিবিউট যোগ করুন {#add-attributes-to-auto-instrumented-spans}

অটো-ইনস্ট্রুমেন্টেড কোডের এক্সিকিউশনের মধ্যে আপনি কনটেক্সট থেকে বর্তমান স্প্যান (activity) পেতে পারেন।

```cs
var activity = Activity.Current;
```

একটি স্প্যান (activity)-এ অ্যাট্রিবিউটস (যা .NET-এ tags নামে পরিচিত) যোগ করার কাজটি
activity অবজেক্টের উপর `SetTag` ব্যবহার করে সম্পন্ন হয়।
`services/CartService.cs` ফাইলের `AddItem` ফাংশনে একাধিক অ্যাট্রিবিউট অটো-ইনস্ট্রুমেন্টেড স্প্যানে যোগ
করা হয়েছে।

```cs
activity?.SetTag("app.user.id", request.UserId);
activity?.SetTag("app.product.quantity", request.Item.Quantity);
activity?.SetTag("app.product.id", request.Item.ProductId);
```

### স্প্যানে ইভেন্ট যোগ করুন {#add-span-events}

স্প্যানে (activity) ইভেন্ট যোগ করতে `AddEvent` ব্যবহার করা হয়। `services/CartService.cs`-এর `GetCart` ফাংশনে একটি স্প্যান ইভেন্ট যোগ করা হয়েছে।

```cs
activity?.AddEvent(new("Fetch cart"));
```

## মেট্রিক্স {#metrics}

### মেট্রিক্স ইনিশিয়ালাইজ করা {#initializing-metrics}

OpenTelemetry Traces কনফিগার করার মতোই, .NET ডিপেন্ডেন্সি ইনজেকশন কন্টেইনারে `AddOpenTelemetry()` কল করতে হয়। এই বিল্ডারটি কাঙ্ক্ষিত ইনস্ট্রুমেন্টেশন লাইব্রেরি, এক্সপোর্টার ইত্যাদি কনফিগার করে।

```cs
Action<ResourceBuilder> appResourceBuilder =
    resource => resource
        .AddContainerDetector()
        .AddHostDetector();

builder.Services.AddOpenTelemetry()
    .ConfigureResource(appResourceBuilder)
    .WithMetrics(meterBuilder => meterBuilder
        .AddMeter("OpenTelemetry.Demo.Cart")
        .AddProcessInstrumentation()
        .AddRuntimeInstrumentation()
        .AddAspNetCoreInstrumentation()
        .SetExemplarFilter(ExemplarFilterType.TraceBased)
        .AddOtlpExporter());
```

### এক্সেমপ্লার {#exemplars}

[Exemplars](/docs/specs/otel/metrics/data-model/#exemplars) কার্ট সার্ভিসে ট্রেস-ভিত্তিক এক্সেমপ্লার ফিল্টার দিয়ে কনফিগার করা হয়েছে, যা OpenTelemetry SDK-কে মেট্রিক্সে এক্সেমপ্লার সংযুক্ত করতে সক্ষম করে।

প্রথমে একটি `CartActivitySource`, `Meter` এবং দুটি `Histogram` তৈরি করা হয়। histogram দুটি গুরুত্বপূর্ণ মেথড `AddItem` এবং `GetCart`-এর latency ট্র্যাক করে।

ব্যবহারকারীরা যেন আইটেম যোগ করার সময় বা চেকআউটের আগে, তাদের কার্ট দেখার জন্য বেশিক্ষন অপেক্ষা না করতে হয়, তাই এই
দুটি মেথড কার্ট সার্ভিসের জন্য গুরুত্বপূর্ণ।

```cs
private static readonly ActivitySource CartActivitySource = new("OpenTelemetry.Demo.Cart");
private static readonly Meter CartMeter = new Meter("OpenTelemetry.Demo.Cart");
private static readonly Histogram<long> addItemHistogram = CartMeter.CreateHistogram<long>(
    "app.cart.add_item.latency",
    advice: new InstrumentAdvice<long>
    {
        HistogramBucketBoundaries = [ 500000, 600000, 700000, 800000, 900000, 1000000, 1100000 ]
    });
private static readonly Histogram<long> getCartHistogram = CartMeter.CreateHistogram<long>(
    "app.cart.get_cart.latency",
    advice: new InstrumentAdvice<long>
    {
        HistogramBucketBoundaries = [ 300000, 400000, 500000, 600000, 700000, 800000, 900000 ]
    });
```

নোট করুন, এখানে কাস্টম bucket boundary নির্ধারণ করা হয়েছে, কারণ ডিফল্ট মান কার্ট সার্ভিসের মাইক্রোসেকেন্ড ফলাফলের জন্য উপযুক্ত নয়।

একবার ভ্যারিয়েবল-গুলো সংজ্ঞায়িত হলে, প্রতিটি মেথডের এক্সিকিউশনের latency `StopWatch` দিয়ে ট্র্যাক করা হয়:

```cs
var stopwatch = Stopwatch.StartNew();

(method logic)

addItemHistogram.Record(stopwatch.ElapsedTicks);
```

সবকিছু সংযুক্ত করতে, Traces পাইপলাইনে তৈরি করা source যোগ করতে হয় (উপরের স্নিপেটে ইতিমধ্যেই আছে, তবে এখানে রেফারেন্স হিসেবে যোগ করা হয়েছে):

```cs
.AddSource("OpenTelemetry.Demo.Cart")
```

এবং, Metrics পাইপলাইনে `Meter` এবং `ExemplarFilter`:

```cs
.AddMeter("OpenTelemetry.Demo.Cart")
.SetExemplarFilter(ExemplarFilterType.TraceBased)
```

Exemplars দেখতে, যান Grafana <http://localhost:8080/grafana> > Dashboards > Demo > Cart Service Exemplars.

Exemplars "হীরার-আকৃতির ডট" হিসেবে ৯৫তম পার্সেন্টাইল চার্টে বা ছোট স্কোয়ার হিসেবে হিটম্যাপ চার্টে দেখা যায়।
যেকোনো exemplar সিলেক্ট করলে তার ডেটা দেখা যাবে, যার মধ্যে measurement-এর timestamp, raw value, এবং
trace context থাকবে। `trace_id` ব্যবহার করে tracing backend-এ (এক্ষেত্রে Jaeger) যেতে পারবেন।

![Cart Service Exemplars](exemplars.png)

## লগ {#logs}

লগ .NET ডিপেন্ডেন্সি ইনজেকশন কন্টেইনারে `LoggingBuilder`-এ `AddOpenTelemetry()` কল করে কনফিগার করা হয়। এই বিল্ডারটি কাঙ্ক্ষিত অপশন, এক্সপোর্টার ইত্যাদি কনফিগার করে।

```cs
builder.Logging
    .AddOpenTelemetry(options => options.AddOtlpExporter());
```
