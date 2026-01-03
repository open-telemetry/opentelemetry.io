---
title: Demystifying OpenTelemetry: Why You Shouldn’t Fear Observability in Traditional Environments
author: '[Lukasz Ciukaj](https://github.com/luke6Lh43) (Splunk)'
linkTitle: Demystifying OpenTelemetry
date: 2025-12-19
issue: 8548
sig: End-User
cSpell:ignore: ciukaj lukasz
---
For decades, traditional technology environments—ranging from on-premises data centers to legacy applications and industrial control systems—have powered the core of many organizations. These systems are battle-tested and deeply woven into business operations, but they also present unique challenges when it comes to modernizing IT practices—especially observability.

**Challenges of Implementing Observability in Traditional Environments:**

* Noisy, unstructured logs make it hard to extract meaningful information.
* Siloed monitoring data across different tools or systems leads to fragmented visibility.
* Limited instrumentation in legacy apps and systems hinders collection of modern metrics and traces.
* Concerns about performance impact from adding new observability tooling.
* Integration difficulties when bridging legacy protocols or hardware with modern platforms.

<br>

To make this practical, let’s follow a fictional manufacturing company with a busy production line. Here, a fleet of robotic arms equipped with sensors reports operational data via MQTT to a central broker. A legacy application logs production events and errors to disk, while a collection of SQL Servers and Windows machines support production, analytics, and inventory. Sound familiar? This is the reality for many organizations trying to bridge the old and new worlds.

![Alt text for the image](fictional-organization-architecture.png)

Unlike cloud-native environments where instrumentation is built-in, legacy and industrial systems rely on inconsistent logs, limited metrics, and fragmented tools. This leads to a lack of visibility that makes troubleshooting, tuning, and maintenance slow and painful. As organizations look to improve reliability and accelerate transformation, observability is no longer a “nice to have” - it’s a strategic necessity. But the path is often clouded by persistent myths. Let’s bust a few.

## Myth 1: Our systems just generate a bunch of useless logs – there’s no way observability can be done here.

Think about your legacy production systems: maybe you have old machinery or apps that simply spit out line after line of plain text logs to a file. No JSON, no structure, no API—just lines of text. It’s easy to assume there’s no way to extract meaningful insight from that mess.

**Why this myth persists:**

In many traditional environments, whether it’s a production line, a legacy application, or an industrial control system, the only digital “signal” you might see is a stream of raw, unstructured log files. These logs might seem like little more than noise: machine starts and stops, product counts, operator interventions, or fault messages written line by line to disk. But with modern observability tools like OpenTelemetry, these “useless” logs can become a goldmine of operational insight.

**Example legacy log lines:**

```
2025-12-14 12:01:03 | MACHINE_START: Line1
2025-12-14 12:01:05 | PRODUCT_COMPLETED: Line1, Count=1
2025-12-14 12:01:08 | FAULT_DETECTED: Line1, Fault=Overheat
2025-12-14 12:01:12 | OPERATOR_INTERVENTION: Line1, OperatorID=007
2025-12-14 12:01:14 | SENSOR_READING: Line1, Temp=78.4
2025-12-14 12:01:18 | MACHINE_STOP: Line1
2025-12-14 12:01:23 | MACHINE_START: Line2
2025-12-14 12:01:25 | PRODUCT_COMPLETED: Line2, Count=1
2025-12-14 12:01:28 | PRODUCT_COMPLETED: Line2, Count=1
2025-12-14 12:01:31 | FAULT_DETECTED: Line2, Fault=Jam
2025-12-14 12:01:34 | OPERATOR_INTERVENTION: Line2, OperatorID=011
```

**How to make logs observable:**

OpenTelemetry Collector can watch these files in real time, parse the events, and—without requiring any code changes to the legacy application—transform them into structured metrics.

**OpenTelemetry Collector config:**

```yaml
receivers:
  filelog:
    include: [ /logs/legacy.log ]
    start_at: end
    storage: file_storage
    poll_interval: 5s
    operators:
      - type: regex_parser
        regex: '^(?P<timestamp>\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}) \| (?P<event_type>[A-Z_]+): (?P<line>Line\d+)(?:, Count=(?P<count>\d+))?(?:, Fault=(?P<fault>\w+))?(?:, OperatorID=(?P<operator_id>\w+))?(?:, Temp=(?P<temp>[\d\.]+))?'
        timestamp:
          parse_from: attributes.timestamp
          layout: '%Y-%m-%d %H:%M:%S'

connectors:
  count:
    logs:
      legacy_log_events_total:
        description: "Counts the number of events from the legacy log file."
        attributes:
          - key: event_type
            default_value: "unknown"
          - key: line
            default_value: "unknown"
          - key: fault
            default_value: "none"
          - key: operator_id
            default_value: "none"

service:
  pipelines:
    logs:
      receivers: [filelog]
      exporters: [count]
    metrics/count:
      receivers: [count]
      exporters: [prometheus]
```

**How it works:**

* The filelog receiver tails your legacy log file in real time and parses out detailed attributes.
* The count connector turns parsed log events into metrics (like legacy_log_events_total), sliced by event type, line, fault, and operator.
* The metrics pipeline exposes these as Prometheus metrics, ready for dashboards and alerts.

**Result:**

With this configuration, your old logs become a structured, queryable data source—fueling dashboards and insights without any changes to the legacy app. Myth busted!

## Myth 2: Our IoT devices publish telemetry to MQTT broker, so integrating with OpenTelemetry isn’t possible.

Our production line relies on robotic arms and sensors that send readings to an MQTT broker, an industry standard for IoT, but not something OpenTelemetry natively understands. Does that mean we’re stuck without modern monitoring?

**Why this myth persists:**

MQTT is the messaging backbone for countless industrial and IoT environments, reliably ferrying sensor data from devices to brokers. However, since MQTT uses its own lightweight protocol and ecosystem, many teams assume their sensor data can’t be easily brought into modern observability pipelines. Some MQTT brokers now natively integrate with OpenTelemetry, allowing direct export of metrics and traces using the OTLP protocol. If you’re using a modern broker with this feature, you can simply point your broker at your collector’s OTLP endpoint—no additional code required. If your broker does not support OTLP export, you’re still not blocked: you can use a lightweight bridge service to subscribe to MQTT topics and forward messages to the OpenTelemetry Collector.

**Example: Data Sent from an IoT Sensor:**

In our case a payload published by a robotic arm sensor to MQTT might look like:

```json
{
  "device_id": "robot-arm-7",
  "job_id": "abc123",
  "temp": 78.4,
  "humidity": 32.6,
  "job_start": "2025-12-19T12:00:02Z",
  "job_end": "2025-12-19T12:00:05Z"
}
```

This message tells us which device sent it, details about the job, and the relevant sensor readings.

**Creating Traces and Spans in the MQTT Bridge App:**

To get real end-to-end visibility (not just metrics) it's powerful to create an OpenTelemetry span for the duration of each job. This allows you to correlate a specific device job with downstream processing, latency, or errors. Below is a short snipped of sample MQTT bridge app that listens for sensor messages, extracts job timing, and creates a span reflecting the job’s duration:

```python
import json
import datetime
import paho.mqtt.client as mqtt
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter
from opentelemetry.sdk.trace.export import BatchSpanProcessor

# OpenTelemetry tracing setup
trace.set_tracer_provider(TracerProvider())
tracer = trace.get_tracer(__name__)
span_processor = BatchSpanProcessor(OTLPSpanExporter(endpoint="http://collector:4318/v1/traces"))
trace.get_tracer_provider().add_span_processor(span_processor)

def on_message(client, userdata, msg):
    payload = json.loads(msg.payload.decode())
    job_start = datetime.datetime.fromisoformat(payload["job_start"].replace("Z", "+00:00"))
    job_end = datetime.datetime.fromisoformat(payload["job_end"].replace("Z", "+00:00"))
    duration = (job_end - job_start).total_seconds()

    with tracer.start_as_current_span(
        "robotic_job",
        start_time=job_start.timestamp(),
        end_on_exit=True,
    ) as span:
        span.set_attribute("device_id", payload["device_id"])
        span.set_attribute("job_id", payload["job_id"])
        span.set_attribute("temperature", payload["temp"])
        span.set_attribute("humidity", payload["humidity"])
        span.set_attribute("job_duration_s", duration)
        # ...additional processing...

# Set up MQTT client
client = mqtt.Client()
client.on_message = on_message
client.connect("mqtt-broker", 1883)
client.subscribe("production/robot-arms")
client.loop_forever()
```

Sample span in Jaeger:

![Alt text for the image](sample-span-jaeger.png)

**What’s the trick here?**

By explicitly specifying start_time=job_start.timestamp() (and optionally end_time), the span precisely tracks the job’s real-world execution, even if the message is processed later. This gives you accurate, queryable traces that show exactly when each job occurred and how long it took—across devices, processing steps, and backends.

You have several options for translating IoT sensor data into metrics for dashboards and alerts:

* Emit metrics directly from your bridge app: You can use OpenTelemetry’s metrics API to send custom metrics (such as temperature, humidity, or job duration) alongside or instead of spans.

* Write a dedicated processor: Build a custom OpenTelemetry Collector processor that derives metrics from incoming spans—extracting values from span attributes.
  
* Leverage your observability backend: Many modern backends can generate metrics from span attributes, making it easy to turn your job telemetry into actionable, queryable metrics with minimal extra plumbing.

<br>

**Bottom line:**
If your MQTT broker supports OpenTelemetry, use native OTLP export for seamless integration. If not, a simple bridge app can transform your sensor and event streams into full observability data—complete with metrics and traces. Modern observability backends make it even easier by allowing metrics to be derived from span attributes—so you can go from IoT signal to meaningful insight with very little friction. Myth busted!

## Myth 3: Windows and SQL Server Environments Are Incompatible with Observability.

Windows machines and SQL Servers are the backbone of our operations, running everything from analytics to inventory. Yet many believe these platforms are simply out of reach for modern, open observability tooling.

**Why this myth persists:**
It’s a common belief that monitoring and observability are only possible in cloud-native or Linux-based systems, leaving classic Windows servers and SQL Server workloads out of reach. In reality, OpenTelemetry Collector supports both environments with dedicated receivers that require minimal configuration. Let’s break it down.

**Observing SQL Server with the OpenTelemetry Collector:**

Many organizations rely on SQL Server databases for production, analytics, or inventory. With the OpenTelemetry Collector’s sqlserver receiver, you can scrape health and performance metrics directly—no agents needed on your database hosts.

```yaml
receivers:
  sqlserver/sql1:
    collection_interval: 30s
    username: oteluser
    password: YourStrong!Passw0rd
    server: sql-server-1
    port: 1433

  sqlserver/sql2:
    collection_interval: 30s
    username: oteluser
    password: YourStrong!Passw0rd
    server: sql-server-2
    port: 1433

service:
  pipelines:
    metrics/regular:
      receivers: [sqlserver/sql1, sqlserver/sql2]
      exporters: [prometheus]
```

**What this achieves:**
The Collector regularly scrapes key SQL Server metrics (connections, buffer pool, locks, batch rates, and more), exposing them to observability backends. 

![Alt text for the image](prometheus-sqlserver.png)

**Observing Windows Machines with the Windows Performance Counters Receiver:**

Classic Windows hosts still drive many production and control environments. The Windows Performance Counters Receiver (part of the OpenTelemetry Collector Contrib distribution) lets you collect a wide array of system, application, or custom metrics—right from the Windows registry—using the native PDH interface.

```yaml
receivers:
  windowsperfcounters:
    collection_interval: 30s
    metrics:
      processor.time.total:
        description: Total CPU active and idle time
        unit: "%"
        gauge:
      memory.committed:
        description: Committed memory in bytes
        unit: By
        gauge:
    perfcounters:
      - object: "Processor"
        instances: ["_Total"]
        counters:
          - name: "% Processor Time"
            metric: processor.time.total
      - object: "Memory"
        counters:
          - name: "Committed Bytes"
            metric: memory.committed

service:
  pipelines:
    metrics:
      receivers: [windowsperfcounters]
      exporters: [prometheus]
```

**What this achieves:**
You can ingest CPU, memory, disk, and any custom Windows counters—turning even decades-old systems into first-class observability citizens. The receiver is robust: if a counter isn’t present, it logs a warning but continues scraping all available metrics.

![Alt text for the image](prometheus-windows.png)

## Conclusion

OpenTelemetry Collector unifies data from legacy logs, MQTT streams, SQL Server databases, and even classic Windows hosts—busting the myth that observability is only for greenfield or cloud-native systems. With the right configuration, your entire environment—no matter how old or fragmented—can gain actionable, real-time insights for reliability, troubleshooting, and performance optimization.


The examples in this post show that it’s not just possible, but practical to bring decades-old logs, industrial telemetry, and classic Microsoft infrastructure into a modern observability stack. You don’t need to rip and replace; you can build on what you already have, instrument incrementally, and unlock new value from systems that used to be black boxes.


By breaking down these myths, we see that every environment - no matter how traditional or complex—has the potential to become observable, resilient, and ready for digital transformation. OpenTelemetry offers a flexible, open standard that grows with you, letting you modernize at your own pace.


All myths busted. Visibility achieved. Your traditional environment is ready for the future. Now’s the time to turn insight into action.