---
title: Observing Lambdas using the OpenTelemetry Collector Extension Layer
author: '[Dominik Süß](https://github.com/theSuess) (Grafana)'
linkTitle: Observing Lambdas
date: 2025-01-20
---


Getting telemetry data out of modern applications is very straightforward (or at
least it should be). You set up a collector which either receives data from your
application or asks it to provide an up-to-date state of various counters. This
happens every minute or so, and if it’s a second late or early, no one really
bats an eye. But what if the application isn’t around for long? What if every
second waiting for the data to be collected is billed? Then you’re most likely
thinking of Function-as-a-Service (FaaS) environments, the most well known being
AWS Lambda.

In this execution model, functions are called directly, and the environment is
frozen afterward. You’re only billed for actual execution time and no longer
need a server to wait for incoming requests. This is also where the term
Serverless comes from. Keeping the function alive until metrics can be
collected isn’t really an option and even if you were willing to pay for that,
different invocations will have a completely separate context and not
necessarily know about all the other executions happening simultaneously. You
might now be saying: "I'll just push all the data at the end of my execution, no
issues here!", but that doesn’t solve the issue. You’ll still have to pay for
the time it takes to send the data and with many invocations, this adds up.

But there is another way! Lambda extension layers allow you to run any process
alongside your code, sharing the execution runtime and providing additional
services. With the
[opentelemetry-lambda](https://github.com/open-telemetry/opentelemetry-lambda/blob/main/collector/README.md)
extension layer, you get a local endpoint to send data to while it keeps track
of the Lambda lifecycle and ensures your telemetry gets to the storage layer.


## How does it work?

When your function is called for the first time, the extension layer starts an
instance of the OpenTelemetry Collector. The collector build is a stripped down
version, providing only components necessary in the context of Lambda. It
registers with the Lambda [extension api](https://docs.aws.amazon.com/lambda/latest/dg/runtimes-extensions-api.html)
and [telemetry api](https://docs.aws.amazon.com/lambda/latest/dg/telemetry-api.html). By doing
this, it receives notifications whenever your function is executed, emits a
logline, or the execution context is about to be shut down.

### This is where the magic happens

Up until now, this just seems like extra work for nothing. You'll still have to
wait for the collector to ship the data, right? This is where the special
`decouple` processor comes in. It separates the receiving and exporting
components while interfacing with the Lambda lifecycle. This allows for the
Lambda to return, even if not all data has been sent. At the next invocation (or
on shutdown) the collector continues shipping the data while your function does
its thing.

{{< figure src="diagram-execution-timing.svg" caption="Diagram showcasing how execution timing differs with and without a collector">}}


## How can I use it?

As of November 2024, the opentelemetry-lambda project publishes [releases of the
collector extension layer](https://github.com/open-telemetry/opentelemetry-lambda/releases/tag/layer-collector%2F0.12.0).
It can be configured through a configuration file hosted either in an S3 bucket
or on an arbitrary HTTP server. It is also possible to bundle the configuration
file with your Lambda code. In both cases, you have tradeoffs to consider.
Remote configuration files add to the cold start duration as an additional
request needs to be made, while bundling the configuration increases the
management overhead when trying to control the configuration for multiple
Lambdas.

The simplest way to get started, is with an embedded configuration. For this,
add a file called `collector.yaml` to your function. This is a regular Collector
configuration file. To take advantage of the Lambda specific extensions, they
need to be configured. As an example, the following configuration receives
traces and logs from the telemetry API and sends them to another endpoint:

```yaml
receivers:
 telemetryapi:
exporters:
 otlphttp/external:
   endpoint: "external-collector:4318"
processors:
 batch:
 decouple:
service:
 pipelines:
   traces:
 	receivers: [telemetryapi]
 	processors: [batch,decouple]
 	exporters: [otlphttp/external]
   logs:
 	receivers: [telemetryapi]
 	processors: [batch,decouple]
 	exporters: [otlphttp/external]
```

Afterward, set the `OPENTELEMETRY_COLLECTOR_CONFIG_URI` environment variable to
`/var/task/collector.yaml`. Once the function is redeployed, you’ll see your
function logs appear! You can see this in action in the video below.

<p>
  <video controls style="width: 100%">
    <source src="./video-lambda-real-time.webm" />
  </video>
</p>
