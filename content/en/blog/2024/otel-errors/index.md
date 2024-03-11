---
title: Dude, where's my error? How OpenTelemetry records errors
linkTitle: OTel Errors
date: 2024-03-06
author: >- # If you have only one author, then add the single name on this line in quotes.
  [Reese Lee](https://github.com/reese-lee) (New Relic),
  [Adriana Villela](https://github.com/avillela) (ServiceNow)
draft: true # TODO: remove this line once your post is ready to be published
# canonical_url: http://somewhere.else/ # TODO: if this blog post has been posted somewhere else already, uncomment & provide the canonical URL here.
---
Depending on the language(s) you’re used to developing in, you may have certain 
ideas about what an error is, as well as what constitutes an exception and how 
it should be handled. For example, Go does not have exceptions, partly to 
discourage programmers from labeling too many ordinary errors as exceptional. 
On the other hand, languages such as Java and Python provide built-in support 
for throwing and catching exceptions. 

When you begin at a place where different languages disagree about what an error 
or exception is and how to handle them, where do you go when you need standardized 
telemetry and error reporting across microservices written in those languages? 
OpenTelemetry is the key to this answer, and is the lens through which we’ll 
address the following, and more:

* How an error is visualized in a backend may not be where you think it’ll be, 
or how you expect it to look. 
* How span kind affects error reporting. 
* Errors reported by spans vs logs.

## Errors vs exceptions

Before we get into how OTel deals with errors and exceptions, let’s establish 
what they are, and how they’re different from each other. While there are 
variations on the definitions of these terms, we’ve landed on the ones below, 
which we’ll be using in this article:

An **error** is an unexpected issue in a program that hinders its execution. 
Examples include syntax errors, such as a missing semicolon or incorrect 
indentation, and runtime errors, resulting from errors in logic.

An **exception** is a type of runtime error that disrupts the normal flow of a 
program. Examples include dividing by zero or accessing an invalid memory address. 

Some languages, such as Python and JavaScript, treat errors and exceptions as 
synonyms; others, such as PHP and Java, do not. Understanding the distinction 
between the two is crucial for effective error handling. By recognizing the 
differences between errors and exceptions, you can adopt more nuanced strategies 
for handling and recovering from failures in your applications.

## Errors in OpenTelemetry
So how does OTel deal with all these conceptual differences across languages? 
This is where the [specification](https://opentelemetry.io/docs/specs/otel/) (or 
“spec” for short) comes in. The spec provides a blueprint for developers working 
on various parts of the project, and standardizes implementation across all 
languages. 

Since language APIs and SDKs are implementations of the spec, there are general 
rules against implementing anything that isn’t covered in the spec. This provides 
a guiding principle to help organize contributions to the project. In practice, 
there are a few exceptions; for example, a language might prototype a new feature 
as part of adding it to the spec, but the feature may be published (usually as 
alpha or experimental) before the corresponding language is added. 

Another exception is when a language might decide to diverge from the spec. 
Although it is generally not advised, sometimes there are strong language-specific 
reasons to do something different. In this way, the spec allows for some 
flexibility for each language to implement features as idiomatically as possible. 
For example, most languages have implemented `RecordException`, while Go has 
implemented [`RecordError`](https://github.com/open-telemetry/opentelemetry-go/blob/main/sdk/trace/span.go), which does the same thing. 

You can view this [compliance matrix](https://github.com/open-telemetry/opentelemetry-specification/blob/main/spec-compliance-matrix.md) of the spec across all languages, but you’ll 
get the most updated info by checking the individual language repository. Now we have 
a place from which to begin figuring out how to handle errors in OTel, starting 
with how to report them:
* In spans
* In logs
  
### Errors Depicted in Spans
In OTel, spans are the building blocks of distributed traces, representing 
individual units of work within a distributed system. Spans are related to each 
other and to a trace through context. Put simply, context is the glue that turns 
a pack of data into a unified trace. Context propagation allows us to pass 
information across multiple systems, therefore tying them together. Traces can 
tell us all sorts of things about our applications through metadata and span 
events.

![Graphic that shows the spans within a trace](OTel-spans.png)

### Enhancing spans with metadata

OTel enables you to enhance spans with metadata ([attributes](https://opentelemetry.io/docs/concepts/signals/traces/#attributes)) in the form of key/value pairs. By attaching relevant 
information to spans, such as user IDs, request parameters, or environment 
variables, you can gain deeper insights into the circumstances surrounding an 
error and quickly identify its root cause. This metadata-rich approach to error 
handling can significantly reduce the time and effort required to diagnose and 
resolve issues, ultimately improving the reliability and maintainability of your 
applications.

Spans also have a [span kind](https://opentelemetry.io/docs/concepts/signals/traces/#span-kind) 
field, which gives us some additional metadata that can help developers 
troubleshoot errors. OTel defines several span kinds, each of which has unique 
implications for error reporting: 
* **client**: For outgoing synchronous remote calls (e.g. outgoing HTTP request 
or DB call)
* **server**: For incoming synchronous remote calls (e.g. incoming HTTP request 
or remote procedure call)
* **internal**: For operations that do not cross process boundaries (e.g. 
instrumenting a function call)
* **producer**: For the creation of a job which may be asynchronously processed 
later (e.g. job inserted into a job queue)
* **consumer**: For the processing of a job created by a producer, which may start 
long after the producer span has ended 

Span kind is determined automatically by the instrumentation libraries used. In 
the event that a span kind has been incorrectly set, you may be able to 
[override](https://developer.newrelic.com/collect-data/opentelemetry-manual/custom-span-event/) 
it while you await a possible bug fix. 

Spans can be further enhanced with [span status](https://opentelemetry.io/docs/concepts/signals/traces/#span-status). By default, span status is marked as `Unset` unless otherwise 
specified. You can mark a span status as `Error` if the resulting span depicts an 
error, and `Ok` if the resulting span is error-free. 

### Enhancing spans with span events

A [span event](https://opentelemetry.io/docs/concepts/signals/traces/#span-events) 
is a structured log message embedded within a span. Span events help enhance spans 
by providing descriptive information about a span. [Span events can also have 
attributes of their own](https://opentelemetry-python.readthedocs.io/en/latest/_modules/opentelemetry/trace/span.html#NonRecordingSpan.add_event). 

When a span status is set to `Error`, a span event is created automatically, 
capturing the span’s resulting error message and stack trace as an event on that 
span. You can further enhance this span error by adding attributes to it.

Earlier, we mentioned a method called `RecordException`. Per the spec (emphasis 
our own), “To facilitate recording an exception languages SHOULD provide a 
RecordException method **if the language uses exceptions**… The signature of the 
method is to be determined by each language and can be overloaded as appropriate.” 

Since Go doesn’t support the “conventional” concept of exceptions, it instead 
supports [`RecordError`](https://github.com/open-telemetry/opentelemetry-go/blob/main/sdk/trace/span.go#L445-L467), which essentially does the same thing idiomatically. You have to 
make an additional call to set its status to `Error` if that’s what it should be, 
as it won’t automatically be set to that. Similarly, `RecordException` can be used 
to record span events without setting the span’s status to `Error`, which means you 
can use it to record any additional data about a span. 

By decoupling the span status from being automatically set to `Error` when a span 
exception occurs, you can support the use case where you can have an exception 
event with a status of `Ok` or `Unset`. This gives instrumentation authors the 
most flexibility. 

### Errors Depicted in Logs
In OTel, a log is a structured, timestamped message emitted by a service or other 
component. The recent addition of logs to OTel gives us yet another way of 
reporting errors. Logs have traditionally had different severity levels for 
representing the type of message being emitted such as `DEBUG`, `INFO`, `WARNING`, 
`ERROR`, and `CRITICAL`.

OTel allows for the correlation of logs to traces, in which a log message can be 
associated to a span within a trace, via trace context correlation. Hence, looking 
for a log message with a log level of `ERROR` or `CRITICAL` can yield further 
information of what led to that error, by pulling up the correlated trace.

To record an error on a log, either `exception.type` or `exception.message` is 
required, while `exception.stacktrace` is recommended. You can view more 
information about the semantic conventions for log exceptions [here](/docs/specs/semconv/exceptions/exceptions-logs/).

## Logs or spans to capture errors?

After all this, you might be wondering which signal to use to capture errors: 
spans or logs? The answer is: "It depends!" Perhaps your team primarily uses 
traces; perhaps they primarily use logs.

Spans can be great for capturing errors, because if the operation errors out, 
marking a span as an error makes it stand out and therefore easier to spot. On 
the other hand, if you’re not filtering or tail sampling your traces and your 
system is producing thousands of spans per minute, you could miss errors that 
aren’t occurring frequently, but that still need to be handled. 

What about using span events versus logs? Again, this depends. It may be 
convenient to use span events, because when a span status is set to `Error`, a 
span event with the exception message (and other metadata you may wish to capture) 
is automagically created. 

Another consideration is your observability backend. Does your backend render 
both logs and traces? How easily queryable or discoverable are your logs, spans, 
and span events? Is logs and trace correlation supported?

## Visualizing errors in different backends

While OTel provides us with the raw telemetry data emitted by our systems, it 
doesn’t provide data visualization or interpretation. This is done by an 
observability backend. Because OTel is vendor-neutral, it means that the same 
information emitted can be visualized and interpreted by different backends 
without re-instrumenting your application. 

If you have been using a proprietary agent to monitor your applications and have 
recently migrated to OTel, you might notice that an OTel error may not be 
expressed the way you expect in your observability backend, as compared to the 
same error captured by the proprietary agent. This is  most likely due to the fact 
that OTel simply models errors differently than how vendors have been modeling 
them. 

As one example, OTel’s notion of span kinds may affect how your OTel error is 
visualized. For instance, if you have a trace that has one exception and it’s on 
an internal span with its status set to `Error`, you should see the trace marked 
with an error, but it may not be counted toward your app error rate. This is 
because the backend may have an opinion that only errors on entry point spans 
(server spans) and consumer spans should be counted toward your error rate. 

Furthermore, while [Jaeger](https://www.jaegertracing.io/) visualizes span events 
as logs, some backends may synthesize span events as its own data type instead of 
as a log data type, which would impact the way you query that data. 

What might some of these errors look like in an observability backend? We’ll take 
a look at Jaeger and a couple proprietary examples. The following screen captures 
show how different observability backends render the same error data differently. 
The error data was generated by the code in [this repository](https://github.com/avillela/otel-errors-talk).

### Jaeger
Here is a trace view for the service [`py-otel-server`](https://github.com/avillela/otel-errors-talk/blob/main/src/python/server.py). As you can see below, the error spans show up as 
red dots.

![List of traces in the Jaeger UI](Jaeger01.png)

And if we drill down and zero in on the error span, we see this:

![Attributes and other metadata for an error span in Jaeger](Jaeger02.png)

The span is clearly marked as error, and includes a span event with the exception 
captured. Jaeger expresses the span event as a log, but does not visualize logs 
outside the context of spans.  

### Backend 2
Here, you can see a high-level view of spans for the `do_roll` operation. There’s 
a mixture of green dots, which represent error-free spans, and red triangles, 
which represent spans with errors.

![View of a span with an error in example Backend 2](Backend0201.png)

If we drill down and click on one of the red triangles, we get this trace 
waterfall view of the span. Because the span was marked “error”, it is depicted 
as red in the UI. You can also see the associated span error (span event), just l
ike we saw in Jaeger:

![View of a waterfall of spans that show the error span's span event in Backend 2](Backend0202.png)

Here is an example of an error log. Because the log is marked as “error”, it shows 
up as red in the UI. Its correlated trace ID is also listed, so you can see in 
what trace this error originated.

![View of an error log in example Backend 2](Backend0203.png)

Here’s a screenshot of the above log relative to other logs captured. You can also 
see the other logs that are a part of the same trace:

![View of logs relative to other recorded logs in example Backend 2](Backend0204.png)

### Backend 3
You can click into the trace group, called `send_requests`, and see which traces 
contain spans with errors:

![View of traces within a trace group in example Backend 3](Backend0301.png)

Similar to what you see in Backend 2, selecting one of the error traces allows you 
to see a trace waterfall of all the spans involved. We can see that our `do_roll` 
span contains an exception as a span event. You can also click `Attributes` to see 
the associated metadata, including any custom attributes you’ve added: 

![View of a span with an error in example Backend 3](Backend0302.png)

You can click into the span events to view further details about the exception, 
as well as any custom attributes you’ve added to your span event – in this case, 
you can see our example dummy attributes. Because we’re manually recording a span 
event, you will also see a second span event captured in addition to the 
exception: 

![View of span events in example Backend 3](Backend0303.png)

You can access any correlated logs directly from the trace, by clicking `Logs` 
from the selected trace. Here, you’ll see three logs, and at which point in the 
trace they were generated. The chart shows how many were error logs: 

![View of logs in example Backend 3](Backend0304.png)

## Conclusion
Error handling is a challenging yet essential aspect of software development, and 
OTel offers a comprehensive solution for navigating its complexities. By 
leveraging OTel's capabilities to record errors through logs and spans and to 
enhance spans with metadata, you can gain deeper insights into your applications' 
behavior and more effectively troubleshoot issues. You'll be better equipped to 
build and maintain resilient, reliable, and high-performing software applications 
in today's dynamic and demanding environments. 
