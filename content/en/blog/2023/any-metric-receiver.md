---
title: Receive any custom metric with the OpenTelemetry Collector
linkTitle: Any Metric Receiver
date: 2023-11-30
author: '[Severin Neumann](https://github.com/svrnm), Cisco'
# prettier-ignore
cSpell:ignore: carbonreceiver datapoint debugexporter enddate gomod helmuth noout openssl otlpexporter otlphttpexporter otlpreceiver ottl servername transformprocessor webserver
---

While OpenTelemetry (OTel) is here to help you with troubleshooting and handling
the _"unknown unknowns"_, it is also instrumental for managing route tasks like
monitoring system metrics, like disk usage, server availability or SSL
certificate expiration dates. This can be achieved by utilizing any one of the
[90+ receivers](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver)
available for the [OpenTelemetry Collector](/docs/collector), such as the
[Host Metrics Receiver](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/hostmetricsreceiver)
or the [HTTP Check Receiver](/blog/2023/synthetic-testing/).

But what if the available receivers don't meet your specific needs? Suppose you
have a collection of shell scripts that provide custom metrics, and you want to
export these to the OpenTelemetry Collector. You could write your own receiver,
but this would require proficiency in Go.

Before embarking on this path, consider examining the available receivers more
closely: Some of them are capable of assimilating metrics in different
formats—like
[Carbon](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/carbonreceiver),
[StatsD](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/statsdreceiver),
[InfluxDB](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/influxdbreceiver),
[Prometheus](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/prometheusreceiver),
and even
[SNMP](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/snmpreceiver)—and
integrating them into the OpenTelemetry ecosystem. With minor tweaks to your
shell scripts, you can use one of these receivers to achieve your objective. For
instance, the Carbon Receiver, with its simple
[plaintext protocol](https://graphite.readthedocs.io/en/stable/feeding-carbon.html#the-plaintext-protocol),
is ideal for use with shell scripts. Its protocol is incredibly straightforward:

> The plaintext protocol is the most straightforward protocol supported by
> Carbon. The data sent must be in the following format:
> `<metric path> <metric value> <metric timestamp>`.

## Example script: Check certificate expiration

Consider the following shell script, which accepts a host name as an argument,
and uses
[`openssl s_client`](https://www.openssl.org/docs/manmaster/man1/openssl-s_client.html)
to retrieve the certificate and compute the remaining time until certificate
expiration:

```shell
#!/bin/bash
HOST=${1}
PORT=${2:-443}

now=$(date +%s)
str=$(echo q | openssl s_client -servername "${HOST}" "${HOST}:${PORT}" 2>/dev/null | openssl x509 -noout -enddate | awk -F"=" '{ print $2; }')
if [[ "$(uname)" == "Darwin" ]] ; then
  notAfter=$(date -j -f "%b %d %H:%M:%S %Y %Z" "${notAfterString}" +%s)
else
  notAfter=$(date -d "${notAfterString}" +%s)
fi

secondsLeft=$(($notAfter-$now))

echo ${secondsLeft}
```

You can test this script as follows:

```shell
$ ./ssl_check.sh opentelemetry.io
4357523
```

## Use Carbon's plaintext protocol

To adapt this script to use Carbon's plaintext protocol, you'll need to modify
the script's last few lines to output a metric in Carbon format:

```shell {hl_lines=[12]}
#!/bin/bash
HOST=${1}
PORT=${2:-443}

now=$(date +%s)
str=$(echo q | openssl s_client -servername "${HOST}" "${HOST}:${PORT}" 2>/dev/null | openssl x509 -noout -enddate | awk -F"=" '{ print $2; }')
if [[ "$(uname)" == "Darwin" ]] ; then
  notAfter=$(date -j -f "%b %d %H:%M:%S %Y %Z" "${notAfterString}" +%s)
else
  notAfter=$(date -d "${notAfterString}" +%s)
fi

secondsLeft=$(($notAfter-$now))

metricPath="tls.server.not_after.time_left;unit=s"
echo "${metricPath} ${secondsLeft} ${now}"
```

In doing so, the script will output `<metric path>` as
`tls.server.not_after.time_left;unit=s`, the `<metric value>` as
`${secondsLeft}`, and the `<metric timestamp>` as `${now}`.

That's all we need to do to send our metric to the OpenTelemetry Collector with
the Carbon Receiver enabled.

## Receive any metric with the OTel Collector

To test this, initiate an OpenTelemetry Collector using the following
configuration::

```yaml
receivers:
  carbon:
    endpoint: localhost:8080
    transport: tcp
    parser:
      type: plaintext
      config:

exporters:
  debug:
    verbosity: detailed

service:
  pipelines:
    metrics:
      receivers: [carbon]
      exporters: [debug]
```

For instance, if you've saved this file as `collector-config.yml`, execute the
following command:

```console
$ ./otelcol --config collector-config.yml
2023-11-24T12:52:51.340+0100	info	service@v0.89.0/telemetry.go:85	Setting up own telemetry...
2023-11-24T12:52:51.341+0100	info	service@v0.89.0/telemetry.go:202	Serving Prometheus metrics	{"address": ":8888", "level": "Basic"}
2023-11-24T12:52:51.341+0100	info	exporter@v0.89.0/exporter.go:275	Development component. May change in the future.	{"kind": "exporter", "data_type": "metrics", "name": "debug"}
2023-11-24T12:52:51.341+0100	info	service@v0.89.0/service.go:143	Starting otelcol-any-metric...	{"Version": "1.0.0", "NumCPU": 10}
2023-11-24T12:52:51.341+0100	info	extensions/extensions.go:34	Starting extensions...
2023-11-24T12:52:51.342+0100	info	service@v0.89.0/service.go:169	Everything is ready. Begin running and processing data.
```

{{% alert title="Note" color="secondary" %}}

For testing, you can use the
[OpenTelemetry Collector Contrib](https://github.com/open-telemetry/opentelemetry-collector-releases/tree/main/distributions/otelcol-contrib)
distribution, which includes all available receivers. However, in a production
setting, you can
[construct your own Collector](/docs/collector/custom-collector/) using the
OpenTelemetry Collector Builder
([`ocb`](https://github.com/open-telemetry/opentelemetry-collector/tree/main/cmd/builder)).
Here's a suggested configuration:

```yaml
dist:
  name: otelcol-any-metric
  description: Custom OpenTelemetry Collector for receiving any kind of metric
  output_path: ./

exporters:
  - gomod: go.opentelemetry.io/collector/exporter/debugexporter v0.89.0
  - gomod: go.opentelemetry.io/collector/exporter/otlpexporter v0.89.0
  - gomod: go.opentelemetry.io/collector/exporter/otlphttpexporter v0.89.0

processors:
  - gomod:
      github.com/open-telemetry/opentelemetry-collector-contrib/processor/transformprocessor
      v0.89.0

receivers:
  - gomod: go.opentelemetry.io/collector/receiver/otlpreceiver v0.89.0
  - gomod:
      github.com/open-telemetry/opentelemetry-collector-contrib/receiver/carbonreceiver
      v0.89.0
```

{{% /alert %}}

With the OpenTelemetry Collector operational, open a secondary shell and
transmit your metric to it:

```shell
./ssl_check.sh opentelemetry.io | nc 127.0.0.1 8080
```

The
[Debug Exporter](https://github.com/open-telemetry/opentelemetry-collector/tree/main/exporter/debugexporter)
will display the metric on the console for you:

```log
2023-11-24T12:54:51.369+0100	info	ResourceMetrics #0
Resource SchemaURL:
ScopeMetrics #0
ScopeMetrics SchemaURL:
InstrumentationScope
Metric #0
Descriptor:
     -> Name: tls.server.not_after.time_left
     -> Description:
     -> Unit:
     -> DataType: Gauge
NumberDataPoints #0
Data point attributes:
     -> unit: Str(s)
StartTimestamp: 1970-01-01 00:00:00 +0000 UTC
Timestamp: 2023-11-24 11:54:51 +0000 UTC
Value: 4356471
	{"kind": "exporter", "data_type": "metrics", "name": "debug"}
```

That's it! You can implement the same technique with any other shell script you
have that reports custom metrics.

## Fine tuning with the Transform Processor

The Carbon Receiver split the `<metric path>` using `;` as a delimiter to
extract the metric name (first item) and data point attributes (all other
items). In our example, this means that the metric name will be
`tls.server.not_after.time_left` and there will be the data point attribute
`unit: Str(s)`.

While being straightforward, this approach does not allow you to set any other
details, like a [resource](/docs/concepts/resources/), a metric description, or
particularly, a metric unit.

However, the
[Transform Processor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/transformprocessor)
can help you with this. By incorporating OpenTelemetry Transformation Language
(OTTL) statements into your `collector-config.yml`, you can convert the data
point attribute `unit` into the metric's unit:

```yaml {hl_lines=["13-19",24]}
receivers:
  carbon:
    endpoint: localhost:8080
    transport: tcp
    parser:
      type: plaintext
      config:

exporters:
  debug:
    verbosity: detailed

processors:
  transform:
    metric_statements:
      - context: datapoint
        statements:
          - set(metric.unit, attributes["unit"])
          - delete_key(attributes, "unit")
service:
  pipelines:
    metrics:
      receivers: [carbon]
      processors: [transform]
      exporters: [debug]
```

Execute the `ssl_check.sh` once more:

```shell
./ssl_check.sh opentelemetry.io | nc 127.0.0.1 8080
```

Now, the Debug Exporter will also incorporate the unit into the metric
descriptor:

```text {hl_lines=[10]}
2023-11-24T12:54:51.369+0100	info	ResourceMetrics #0
Resource SchemaURL:
ScopeMetrics #0
ScopeMetrics SchemaURL:
InstrumentationScope
Metric #0
Descriptor:
     -> Name: tls.server.not_after.time_left
     -> Description:
     -> Unit: s
     -> DataType: Gauge
NumberDataPoints #0
Data point attributes:
     -> unit: Str(s)
StartTimestamp: 1970-01-01 00:00:00 +0000 UTC
Timestamp: 2023-11-24 11:54:51 +0000 UTC
Value: 4356471
	{"kind": "exporter", "data_type": "metrics", "name": "debug"}
```

If you wish to associate your metric with a
[service](/docs/specs/semconv/resource/#service) that you've instrumented using
OpenTelemetry, you can initially add `service.name` and `service.namespace` to
your shell script as data point attributes:

```shell
metricName="tls.server.not_after.time_left;unit=s;service.name=otel-webserver;service.namespace=opentelemetry.io"
echo "${metricName} ${secondsLeft} ${now}"
```

Next, add another OTTL statement to create a resource from those data point
attributes:

```yaml
processors:
  transform:
    metric_statements:
      - context: datapoint
        statements:
          - set(metric.unit, attributes["unit"])
          - set(resource.attributes["service.name"], attributes["service.name"])
          - set(resource.attributes["service.namespace"],
            attributes["service.namespace"])
          - delete_key(attributes, "unit")
          - delete_key(attributes, "service.name")
          - delete_key(attributes, "service.namespace")
```

Run the `ssl_check.sh` once again:

```shell
./ssl_check.sh opentelemetry.io | nc 127.0.0.1 8080
```

Now, the Debug Exporter will also include the resource with attributes
`service.name` and `service.namespace`:

```text
2023-11-24T14:49:03.806+0100	info	ResourceMetrics #0
Resource SchemaURL:
Resource attributes:
     -> service.name: Str(otel-webserver)
     -> service.namespace: Str(opentelemetry.io)
ScopeMetrics #0
ScopeMetrics SchemaURL:
InstrumentationScope
Metric #0
Descriptor:
     -> Name: tls.server.not_after.time_left
     -> Description:
     -> Unit: s
     -> DataType: Gauge
NumberDataPoints #0
StartTimestamp: 1970-01-01 00:00:00 +0000 UTC
Timestamp: 2023-11-24 13:49:03 +0000 UTC
Value: 4349619
	{"kind": "exporter", "data_type": "metrics", "name": "debug"}
```

The Transform Processor and OTTL offer a wide range of capabilities. Learn more
from:

- [OTTL README.md](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/ottl/README.md)
- [OTTL Me Why Transforming Telemetry in the OpenTelemetry Collector Just Got Better](https://www.youtube.com/watch?v=uVs0oUV72CE),
  a talk by [Tyler Helmuth](https://github.com/TylerHelmuth) and
  [Evan Bradley](https://github.com/evan-bradley)

With this, you are ready to receive any custom metric with the OpenTelemetry
Collector!

## Bonus: Use OTLP!

While the use of the Carbon Receiver and the Transform Processor is a dependable
method to gather custom metrics, it may seem unconventional to use an external
format to import metrics into OpenTelemetry, especially when the
[OpenTelemetry Protocol](/docs/specs/otlp/) (OTLP) provides everything you need.

As an alternative to using the Carbon Receiver, you can also transmit a custom
metrics using
[OTLP JSON](https://github.com/open-telemetry/opentelemetry-proto/tree/main/examples):

```shell
#!/bin/bash
URL=${1}
PORT=${2:-443}

now=$(date +%s)
notAfterString=$(echo q | openssl s_client -servername "${URL}" "${URL}:${PORT}" 2>/dev/null | openssl x509 -noout -enddate | awk -F"=" '{ print $2; }')
if [[ "$(uname)" == "Darwin" ]] ; then
  notAfter=$(date -j -f "%b %d %H:%M:%S %Y %Z" "${notAfterString}" +%s)
else
  notAfter=$(date -d "${notAfterString}" +%s)
fi

secondsLeft=$(($notAfter-$now))

data="
{
    \"resourceMetrics\": [
      {
        \"resource\": {
          \"attributes\": [
            {
              \"key\": \"service.name\",
              \"value\": {
                \"stringValue\": \"${URL}\"
              }
            }
          ]
        },
        \"scopeMetrics\": [
          {
            \"metrics\": [
              {
                \"name\": \"tls.server.not_after.time_left\",
                \"unit\": \"s\",
                \"description\": \"\",
                \"gauge\": {
                  \"dataPoints\": [
                    {
                      \"asInt\": ${secondsLeft},
                      \"timeUnixNano\": ${now}000000000
                    }
                  ]
                }
              }
            ]
          }
        ]
      }
    ]
  }
"
curl -X POST -H "Content-Type: application/json" -d "${data}" -i localhost:4318/v1/metrics
```

Activate the OTLP Receiver in your `collectors-config`:

```yaml
receivers:
  otlp:
    protocols:
      http:
      grpc:
exporters:
  debug:
    verbosity: detailed
service:
  pipelines:
    metrics:
      receivers: [otlp]
      exporters: [debug]
```

Execute your updated `ssl_check.sh`:

```shell
./ssl_check.sh opentelemetry.io
```

This time, your metric will be presented with the correct unit set and the
resource reported as defined in your JSON:

```text
2023-11-24T15:28:51.212+0100	info	ResourceMetrics #0
Resource SchemaURL:
Resource attributes:
     -> service.name: Str(opentelemetry.io)
ScopeMetrics #0
ScopeMetrics SchemaURL:
InstrumentationScope
Metric #0
Descriptor:
     -> Name: tls.server.not_after.time_left
     -> Description:
     -> Unit: s
     -> DataType: Gauge
NumberDataPoints #0
StartTimestamp: 1970-01-01 00:00:00 +0000 UTC
Timestamp: 2023-11-24 14:28:51 +0000 UTC
Value: 4347231
	{"kind": "exporter", "data_type": "metrics", "name": "debug"}
```

Working with JSON in shell scripts isn't particularly desirable, as this example
clearly demonstrates! While there are methods for improvement, you may
ultimately find it more efficient to use a language such as Python or Node.js,
or incorporate metrics (with gauge support) into your preferred OTel CLI tool!

## Summary

In this post you learned how to use a _catch-all_ receiver like the Carbon
Receiver to feed any metric into your OpenTelemetry Collector. Use this approach
when none of the available receivers meet your needs and you don't want to write
your own receiver in Go.

You learned how to send your metrics to the OpenTelemetry Collector directly
using OTLP and `curl`. Use this approach when you cannot modify the pipelines of
your OpenTelemetry Collector. It will also become a valid alternative to
_catch-all_ receivers with the availability of command line tools that export
metrics via OTLP.
