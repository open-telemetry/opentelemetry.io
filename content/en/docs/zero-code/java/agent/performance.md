---
title: Performance
description: Performance reference for the OpenTelemetry Java agent
weight: 400
aliases:
  - /docs/languages/java/performance/
cSpell:ignore: Dotel
---

The OpenTelemetry Java agent instruments your application by running inside the
same Java Virtual Machine (JVM). Like any other software agent, the Java agent
requires system resources like CPU, memory, and network bandwidth. The use of
resources by the agent is called agent overhead or performance overhead. The
OpenTelemetry Java agent has minimal impact on system performance when
instrumenting JVM applications, although the final agent overhead depends on
multiple factors.

Some factors that might increase agent overhead are environmental, such as the
physical machine architecture, CPU frequency, amount and speed of memory, system
temperature, and resource contention. Other factors include virtualization and
containerization, the operating system and its libraries, the JVM version and
vendor, JVM settings, the algorithmic design of the software being monitored,
and software dependencies.

Due to the complexity of modern software and the broad diversity in deployment
scenarios, it is impossible to come up with a single agent overhead estimate. To
find the overhead of any instrumentation agent in a given deployment, you have
to conduct experiments and collect measurements directly. Therefore, treat all
statements about performance as general information and guidelines that are
subject to evaluation in a specific system.

The following sections describe the minimum requirements of the OpenTelemetry
Java agent, as well as potential constraints impacting performance, and
guidelines to optimize and troubleshoot the performance of the agent.

## Guidelines to reduce agent overhead

The following best practices and techniques might help reduce overhead caused by
the Java agent.

### Configure trace sampling

The volume of spans processed by the instrumentation might impact agent
overhead. You can configure trace sampling to adjust the span volume and reduce
resource usage. See [Sampling](/docs/languages/java/sdk/#sampler).

### Turn off specific instrumentations

You can further reduce agent overhead by turning off instrumentations that
aren't needed or are producing too many spans. To turn off an instrumentation,
use `-Dotel.instrumentation.<name>.enabled=false` or the
`OTEL_INSTRUMENTATION_<NAME>_ENABLED` environment variable, where `<name>` is
the name of the instrumentation.

For example, the following option turns off the JDBC instrumentation:
`-Dotel.instrumentation.jdbc.enabled=false`

### Allocate more memory for the application

Increasing the maximum heap size of the JVM using the `-Xmx<size>` option might
help in alleviating agent overhead issues, as instrumentations can generate a
large number of short-lived objects in memory.

### Reduce manual instrumentation to what you need

Too much manual instrumentation might introduce inefficiencies that increase
agent overhead. For example, using `@WithSpan` on every method results in a high
span volume, which in turn increases noise in the data and consumes more system
resources.

### Provision adequate resources

Make sure to provision enough resources for your instrumentation and for the
Collector. The amount of resources such as memory or disk depend on your
application architecture and needs. For example, a common setup is to run the
instrumented application on the same host as the OpenTelemetry Collector. In
that case, consider rightsizing the resources for the Collector and optimize its
settings. See [Scaling](/docs/collector/scaling/).

## Constraints impacting the performance of the Java agent

In general, the more telemetry you collect from your application, the greater
the impact on agent overhead. For example, tracing methods that aren't relevant
to your application can still produce considerable agent overhead because
tracing such methods is computationally more expensive than running the method
itself. Similarly, high cardinality tags in metrics might increase memory usage.
Debug logging, if turned on, also increases write operations to disk and memory
usage.

Some instrumentations, for example JDBC or Redis, produce high span volumes that
increase agent overhead. For more information on how to turn off unnecessary
instrumentations, see
[Turn off specific instrumentations](#turn-off-specific-instrumentations).

{{% alert title="Note" %}}

Experimental features of the Java agent might increase agent overhead due to the
experimental focus on functionality over performance. Stable features are safer
in terms of agent overhead.

{{% /alert %}}

## Troubleshooting agent overhead issues

When troubleshooting agent overhead issues, do the following:

- Check minimum requirements. See
  [Prerequisites](/docs/languages/java/getting-started/#prerequisites).
- Use the latest compatible version of the Java agent.
- Use the latest compatible version of your JVM.

Consider taking the following actions to decrease agent overhead:

- If your application is approaching memory limits, consider giving it more
  memory.
- If your application is using all the CPU, you might want to scale it
  horizontally.
- Try turning off or tuning metrics.
- Tune trace sampling settings to reduce span volume.
- Turn off specific instrumentations.
- Review manual instrumentation for unnecessary span generation.

## Guidelines for measuring agent overhead

Measuring agent overhead in your own environment and deployments provides
accurate data about the impact of instrumentation on the performance of your
application or service. The following guidelines describe the general steps for
collecting and comparing reliable agent overhead measurements.

### Decide what you want to measure

Different users of your application or service might notice different aspects of
agent overhead. For example, while end users might notice degradation in service
latency, power users with heavy workloads pay more attention to CPU overhead. On
the other hand, users who deploy frequently, for example due to elastic
workloads, care more about startup time.

Reduce your measurements to factors that are sure to impact user experience, so
your datasets don't contain irrelevant information. Some examples of
measurements include the following:

- User average, user peak, and machine average CPU usage
- Total memory allocated and maximum heap used
- Garbage collection pause time
- Startup time in milliseconds
- Average and percentile 95 (p95) service latency
- Network read and write average throughput

### Prepare a suitable test environment

By measuring agent overhead in a controlled test environment you can better
identify the factors affecting performance. When preparing a test environment,
complete the following:

1.  Make sure that the configuration of the test environment resembles
    production.
2.  Isolate the application under test from other services that might interfere.
3.  Turn off or remove all unnecessary system services on the application host.
4.  Ensure that the application has enough system resources to handle the test
    workload.

### Create a battery of realistic tests

Design the tests that you run against the test environment to resemble typical
workloads as much as possible. For example, if some REST API endpoints of your
service are susceptible to high request volumes, create a test that simulates
heavy network traffic.

For Java applications, use a warm-up phase prior to starting measurements. The
JVM is a highly dynamic machine that performs a large number of optimizations
through just-in-time compilation (JIT). The warm-up phase helps the application
to finish most of its class loading and gives the JIT compiler time to run the
majority of optimizations.

Make sure to run a large number of requests and to repeat the test pass many
times. This repetition helps to ensure a representative data sample. Include
error scenarios in your test data. Simulate an error rate similar to that of a
normal workload, typically between 2% and 10%.

{{% alert title="Note" %}}

Tests might increase costs when targeting observability backends and other
commercial services. Plan your tests accordingly or consider using alternative
solutions, such as self-hosted or locally run backends.

{{% /alert %}}

### Collect comparable measurements

To identify which factors might be affecting performance and causing agent
overhead, collect measurements in the same environment after modifying a single
factor or condition.

### Analyze the agent overhead data

After collecting data from multiple passes, you can plot results in a chart or
compare averages using statistical tests to check for significant differences.

Consider that different stacks, applications, and environments might result in
different operational characteristics and different agent overhead measurement
results.
