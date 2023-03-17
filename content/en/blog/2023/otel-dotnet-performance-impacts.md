---
title: Does OpenTelemetry in .NET Cause Performance Degradation?
linkTitle: OTel .NET Performance Impacts
date: 2023-03-10
author: '[MartinDotNet](https://github.com/martinjt) (Honeycomb)'
---

Contrary to Betteridge’s Law of Tabloid Headlines, the answer is “yes,” but
context is important. I get this question so often that I thought it was time to
get some stats on it.

I’ve heard comments like:

- “Instrumenting my code will make it slower”
- “Activity Object use memory”
- “If I instrument my code, it will cost me more as I’ll need bigger servers”
- “OpenTelemetry is immature and isn’t memory efficient”
- “OpenTelemetry causes performance issues”

I can only assume that these are based on previous versions, or things like
OpenTracing/OpenCensus (the heritage frameworks that were the feeders for
OpenTelemetry). This is not true of the current state of OpenTelemetry, and in
this post, I’ll provide evidence as to why this isn’t the case. My hope is that
this evidence will stop the debate of performance impact so that teams can
instead debate the value of instrumenting their code.

TL;DR: if you’re optimizing at the level where OpenTelemetry and Activity usage
would be a concern, you should probably be more worried about the .NET
as a whole.

## Activity vs. OpenTelemetry vs. OpenTelemetry Shim

The first thing to note is developers just now getting to grips with the
difference between using the `Activity` class in .NET and using the
OpenTelemetry SDKs to process and export telemetry to a backend.

Activity is the base of all instrumentation in .NET. It’s not tied to a third
party, or even a particular OpenSource project like OpenTelemetry. It’s in the
Base Class Library (BCL), which means it’s baked into .NET. You can instrument
your code with this without deciding how you’re going to extract.

OpenTelemetry is an open source SDK that takes generated `Activity` objects and
sends them to a telemetry backend (whether it’s open source like Jaeger, or
proprietary like Honeycomb or Lightstep).

OpenTelemetry Shim is an SDK that was developed by the OpenTelemetry project to
provide consistent naming across different languages. As .NET already had
`Activity`, it was reused, but this meant that OpenTelemetry terminology wasn’t
consistent over different languages. As such, Shim was created so engineers
could use the same terminology across languages. Under the hood, Shim still
creates `Activity` objects for Spans, and ActivitySource objects for Tracers.
Therefore, there is a minor impact of using Shim for the wrapper object
initialization.

## Existing benchmarks

For a while now, the OpenTelemetry .NET maintainers have had a BenchmarkDotNet
project that tests the OpenTelemetry components. This is great for showing that
the library doesn’t add any issues between releases. What it fails to answer is
“what if I start with nothing?” Those tests are the inspiration for both tests I
wrote, and also this post.

## Baseline test

What does a good test look like? All code is different, so it’s hard to put a
finger on some representative code. What I will say is that you need some
“actual code” to know whether the compiler is optimizing some things. This also
serves to give you some confidence that this is how the code would react in a
real application.

Let’s start with something really basic. This code will check if something
exists in a dictionary, and return the value.

```csharp
public class TestBase
{
    internal readonly ActivitySource _source = new("PerfTest");

    private readonly Dictionary<string, string> _dictionary = new();

    public TestBase()
    {
        _dictionary = new Dictionary<string, string> {
            { "blah", "blah" },
            { "blah1", "blah" }
        };
    }

    private string InternalTest()
    {
        if (_dictionary.ContainsKey("blah"))
            return _dictionary["blah"];

        return "";
    }

}
```

This should give us a nice baseline for something that has some actual
computation. We can then build on it to see how adding telemetry affects
response time.

## The tests

What I’m trying to achieve is to answer the question, “What if you start with
nothing?” Then, to build up what parts of instrumentation affect your code—and
establish the impact.

We’re looking at these specific questions:

1. **Does adding an `Activity` that isn’t listened to cause additional latency
   in calling the method?** This is to help answer the questions library authors
   have around adding `Activity` as a means to provide debug information to
   consumers of their library.
1. **Does listening to an `Activity` using OpenTelemetry cause additional
   latency in calling the method?** This is to help developers understand the
   impact of turning on different elements of telemetry for libraries they’re
   using.
1. **How do “Processors” in OpenTelemetry affect the performance of the
   application?** This is to help clarify the impact application developers can
   have on application code by augmenting telemetry.
1. **Does adding more “Tags” (Attributes) for an `Activity` affect an
   application’s performance?** This helps engineers understand the impact of
   adding more context to their tracing.

The overall hypothesis I’ve used for this analysis is that the effects are
negligible and should not be considered as a reason not to use them.

For the scope of this test, I’ll be running through WSL2, using Ubuntu and .NET
7.0. It’s an 11th Gen i7 (Surface Laptop Studio).

```
BenchmarkDotNet=v0.13.3, OS=ubuntu 22.10
11th Gen Intel Core i7-11370H 3.30GHz, 1 CPU, 8 logical and 4 physical cores
.NET SDK=7.0.100
  [Host]     : .NET 7.0.0 (7.0.22.51805), X64 RyuJIT AVX2
  DefaultJob : .NET 7.0.0 (7.0.22.51805), X64 RyuJIT AVX2
```

## The Results

| Method                                        |      Mean |     Error |    StdDev |    Median | Ratio | RatioSD |   Gen0 | Allocated | Alloc Ratio |
| --------------------------------------------- | --------: | --------: | --------: | --------: | ----: | ------: | -----: | --------: | ----------: |
| WithoutActivity                               |  18.19 ns |  0.386 ns |  0.715 ns |  18.07 ns |  1.00 |    0.00 |      - |         - |          NA |
| WithActivity                                  |  34.26 ns |  0.722 ns |  0.989 ns |  34.10 ns |  1.89 |    0.10 |      - |         - |          NA |
| WithActivityAndAttributes                     |  36.07 ns |  0.763 ns |  0.817 ns |  36.04 ns |  1.99 |    0.10 |      - |         - |          NA |
| WithTracerProviderAndBaggageProcessorNoData   | 501.09 ns |  9.955 ns | 15.789 ns | 498.76 ns | 27.56 |    1.43 | 0.0658 |     416 B |          NA |
| WithTracerProviderAndBaggageProcessorWithData | 650.13 ns | 15.282 ns | 42.601 ns | 637.79 ns | 35.14 |    2.92 | 0.1001 |     632 B |          NA |
| WithTracerProviderAndAlwaysOnSampler          | 483.04 ns |  9.630 ns | 13.181 ns | 482.71 ns | 26.64 |    1.27 | 0.0658 |     416 B |          NA |
| WithTracerProviderListeningToSource           | 506.78 ns |  9.781 ns | 12.717 ns | 510.11 ns | 27.85 |    1.24 | 0.0658 |     416 B |          NA |
| WithTracerProviderAndAttributeProcessor       | 550.76 ns | 10.923 ns | 24.430 ns | 546.85 ns | 30.36 |    1.84 | 0.0820 |     520 B |          NA |

### 1. The impact of adding `Activity`

For this, I ran the test code without any `Activity`, then added the `Activity`
to see the difference.

- Without Activity: 18.19ns
- With Activity: 34.26ns

There were zero allocations.

#### Results

Adding an `Activity` on its own adds around 16 nanoseconds. That’s a trivial
amount in relation to the latency of applications that the majority of engineers
work with. Given that most web developers are working on a scale of
milliseconds, adding a few nanoseconds should not concern us.

As a bonus round here, I also added a test that uses a check to see if the
underlying ActivitySource (tracer) is observed like this:

```csharp
        Activity activity = null;
        if (_source.HasListeners())
        {
            activity = _source.StartActivity("WithActivity");
        }
        var item = InternalTest();
        activity?.Dispose();
```

This reduced the overhead to 1ns. The downside here is that the code can become
a little less readable. I’m sure there are better ways to format the code,
however, that wasn’t my goal.

### 2. The impact of adding attributes/tags

For this, we’re using the baseline of the previous test, which did not do the
Activity Listeners check. We then add a simple string attribute to the activity
that is not listened to.

- Without Attributes: 36.43ns
- With Attributes: 35.80ns

There were still no allocations.

#### Results

The results here are a little weird, as adding attributes is actually faster. As
we’re working in nanoseconds, it’s hard to gauge whether that’s genuine or
natural fluctuations of the machine under test. Either way, I’m going to put my
neck out and say “It’s not worth measuring.”

### 3. Adding OpenTelemetry and Listening

For this, we’re again using the Basic Activity Test, and instantiate
OpenTelemetry without it listening to the activity, and then with it listening.

What we’re trying to do is work out a baseline of what happens when an
application implements OpenTelemetry on an already-instrumented application.

- Without TracerProvider: 33.60ns
- With TracerProvider, Not Listening: 34.10ns
- With TracerProvider, Listening: 500ns

#### Results

The results were a little weird in that there was variation with a few other
tests that brought in concepts, such as baggage, that were quicker. Again, as
we’re at nanosecond scale (1/1,000,000th of a millisecond), there’s lots of
things that can affect the tests.

Overall, we can see that setting up a TracerProvider on its own doesn’t affect
the method timings. When that TracerProvider is then set to listen to the
response, we have an additional 470ns.

For context, that’s 1/2,000th of a millisecond, meaning that creating 2,000
activities will add 1ms latency to your application. If you’re looking to add
2,000 Activity objects in a single request, I think you might be a little too
granular.

### Bonus round: custom processors

Within OpenTelemetry, you can write processors that run while an `Activity` is
created or disposed of. They run inside the thread with the `Activity` and can
be really useful to access HttpContext or other things that are available in the
method’s context. However, as they run at that stage, any processing done at
that level will take up additional time in the current request. These methods
are run on every `Activity` that is listened to, so they can quickly add up.

One of the useful things to do in that context is to access the OpenTelemetry
Baggage object, and add all the baggage items as Span attributes so that they’re
queryable in your backend.

Here’s an example of what that would look like:

```csharp
public class BaggageProcessor : BaseProcessor<Activity>
{
    public override void OnStart(Activity data)
    {
        foreach (var item in Baggage.Current)
            data.SetTag(item.Key, item.Value);

        base.OnStart(data);
    }
}
```

This runs on the Start of the activity and copies the Baggage into the Span’s
attributes.

- Without Processor: 477ns
- With Processor, no Baggage data: 503ns
- With Processor, with Baggage data: 625ns

#### Results

I observed that adding a processor is 26ns, and if it’s doing something, an
additional 125ns is added—or an additional ¼ of the overall time to process the
span. This is a relatively simple processor and you could do whatever you want
here, just be careful as it can affect your application’s performance
considerably.

You can mitigate some of this impact by guarding around the characteristics of
the `Activity`, such as only applying to your own `ActivitySource`, or when
certain attributes are present. Key Takeaways There’s definitely an impact when
instrumenting using `Activity`, and also processing using OpenTelemetry. That
said, the effects are minimal in the wider context of most standard .NET
applications. Further, the trade-off between sub-millisecond latency and the
ability to have a ton of context when errors occur is definitely one I would
take.

There are some foot guns in there around custom processing, but overall, you
can’t really go wrong.
