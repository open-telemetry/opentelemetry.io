---
title: Collecting Logs with OpenTelemetry Python
linkTitle: Python Logs Collection
date: 2023-11-17
author: '[Michael Hausenblas](https://github.com/mhausenblas) (AWS)'
# prettier-ignore
cSpell:ignore: asctime Chehab dataprepper exgru fileconsumer filelog Grogu grogu hossko Houssam levelname otelbin Padawan Prepper svrnm WORKDIR yoda
---

In the following, we will walk through how to do logs collection with
OpenTelemetry (OTel). To keep things simple, we will use Python as the
demonstration programming language, however note that at time of writing the
logs support there is still early days so things might need some updating.

We will show the evolution from using print statements for logging (_Baby Grogu_
level) to logging to a file along with the OTel collector (_Expert Grogu_ level)
to using the OTel logs bridge API to directly ingest OTLP (_Yoda_ level) into
the collector.

If you want to follow along, you need Docker installed and first off, go ahead
and `git clone https://github.com/open-telemetry/opentelemetry.io.git` and
change into the `/content/en/blog/2023/logs-collection/` directory.

## Baby Grogu level

We start our journey with Baby Grogu, an alias to protect the innocent ;) They
are a junior developer who is somewhat familiar with Python, however, doesn't
know or care about telemetry, more precisely, about logging. So, Baby Grogu one
day is asked to write a "Practice The Telemetry" piece of code including
catching bad input. What will the code look like and how will Baby Grogu deal
with communicating progress in the code execution and potential error cases to
the outside world?

To get started, first change into the [baby-grogu/][repo-baby-grogu] directory.

We're using Baby Grogu's Python code in `baby-grogu/main.py` as an example, with
the interesting part located in the `practice()` function:

```python
start_time = time.time()
try:
    how_long_int = int(how_long)
    print(f"Starting to practice The Telemetry for {how_long_int} second(s)")
    while time.time() - start_time < how_long_int:
        next_char = random.choice(string.punctuation)
        print(next_char, end="", flush=True)
        time.sleep(0.5)
    print("\nDone practicing")
except ValueError as ve:
    print(f"I need an integer value for the time to practice: {ve}")
    return False
except Exception as e:
    print(f"An unexpected error occurred: {e}")
    return False
return True
```

The above Python code doesn't really do anything useful, just printing out
random punctuation for the specified time, which represents the "practicing".
However, do notice the different semantics of the `print()` function Baby Grogu
is using here.

For example, when they say `print(next_char, end="", flush=True)` they're
actually performing work, whereas when they write `print("\nDone practicing")`
that's an informational message that the work is completed. This would be a
great candidate for a log message!

The same is true for
`print(f"I need an integer value for the time to practice: {ve}")`, which really
is Baby Grogu communicating that an error has occurred.

To execute the code you can either directly run it with `python3 main.py 3` to
have Baby Grogu practice for 3 seconds, or you can use a containerized version
(Python 3.11 required).

For the containerized version, we're using the following `Dockerfile`:

```docker
FROM python:3.11
WORKDIR /usr/src/app
COPY . .
```

Above Dockerfile, we use in the context of the following Docker Compose file
`docker-compose.yaml`:

```yaml
version: '3'
services:
  baby-grogu:
    build: .
    command: python main.py 3
    volumes:
      - .:/usr/src/app
```

At this point you can enjoy Baby Grogu's efforts by running it with
`docker-compose -f docker-compose.yaml` and you should see an output akin to
something shown in the following (note: edited to focus on the most important
bits):

```shell
baby-grogu-baby-grogu-1  | Starting to practice The Telemetry for 2 second(s)
baby-grogu-baby-grogu-1  | /)||
baby-grogu-baby-grogu-1  | Done practicing
baby-grogu-baby-grogu-1  | Practicing The Telemetry completed: True
```

OK, Baby Grogu did a good job, now it's time to rest. Go get up, drink a bit of
water, and when you come back with a fresh mind, let's up the game and use OTel!

## Expert Grogu level

Over time, Baby Grogu has learned about observability and telemetry
specifically. They have advanced to Expert Grogu level. How? Glad you asked, let
me show you.

First, change into the [expert-grogu/][repo-expert-grogu] directory.

In this scenario Expert Grogu is logging into a file (in JSON format), from
their Python app. Then, they are using the OTel collector to read that very log
file, parse the log records using the [filelog receiver][filelog] in the OTel
collector and finally output it to `stdout` using the [debug exporter][debug].
Makes sense? Let's see it in action …

Overall, we have the following setup:

```plain
( python main.py ) --> exgru.log --> ( OTel Collector ) --> stdout

Let's first have a look at what Expert Grogu is doing in terms of logging (in
`expert-grogu/main.py`, in the `practice()` function):

```python
start_time = time.time()
try:
    how_long_int = int(how_long)
    logger.info("Starting to practice The Telemetry for %i second(s)", how_long_int)
    while time.time() - start_time < how_long_int:
        next_char = random.choice(string.punctuation)
        print(next_char, end="", flush=True)
        time.sleep(0.5)
    logger.info("Done practicing")
except ValueError as ve:
    logger.error("I need an integer value for the time to practice: %s", ve)
    return False
except Exception as e:
    logger.error("An unexpected error occurred: %s", e)
    return False
return True
```

So, in above function we see Expert Grogu using `logger.xxx()` functions to
communicate status/progress as well as error conditions such as user providing
wrong input value for the time to practice (such as `python main.py ABC` rather
than `python main.py 5` since the former can't be parsed into an integer).

We are using the following `Dockerfile` (installing the one dependency we have,
`python-json-logger==2.0.7`):

```docker
FROM python:3.11
WORKDIR /usr/src/app
COPY requirements.txt requirements.txt
RUN pip3 install --no-cache-dir -r requirements.txt
COPY . .
```

With the following OTel collector config (visualize via
[OTelBin][otelbin-expert-grogu]):

```yaml
receivers:
  filelog:
    include: [/usr/src/app/*.log]
    operators:
      - type: json_parser
        timestamp:
          parse_from: attributes.asctime
          layout: '%Y-%m-%dT%H:%M:%S'
        severity:
          parse_from: attributes.levelname
exporters:
  debug:
    verbosity: detailed
service:
  pipelines:
    logs:
      receivers: [filelog]
      exporters: [debug]
```

In the Docker Compose file that looks as follows, we bring all above together:

```yaml
version: '3'
services:
  collector:
    image: otel/opentelemetry-collector-contrib:latest
    volumes:
      - ./otel-config.yaml:/etc/otelcol-contrib/config.yaml
      - ./:/usr/src/app
    command: ['--config=/etc/otelcol-contrib/config.yaml']
    ports:
      - '4317:4317'
  baby-grogu:
    build: .
    command: python main.py 10
    volumes:
      - .:/usr/src/app
```

Which you can run it with `docker-compose -f docker-compose.yaml` and you should
see something like:

```log
expert-grogu-collector-1   | 2023-11-15T17:21:32.811Z   info    service@v0.88.0/telemetry.go:84 Setting up own telemetry...
expert-grogu-collector-1   | 2023-11-15T17:21:32.812Z   info    service@v0.88.0/telemetry.go:201        Serving Prometheus metrics      {"address": ":8888", "level": "Basic"}
expert-grogu-collector-1   | 2023-11-15T17:21:32.812Z   info    exporter@v0.88.0/exporter.go:275        Deprecated component. Will be removed in future releases.       {"kind": "exporter", "data_type": "logs", "name": "logging"}
expert-grogu-collector-1   | 2023-11-15T17:21:32.812Z   info    service@v0.88.0/service.go:143  Starting otelcol-contrib...     {"Version": "0.88.0", "NumCPU": 4}
expert-grogu-collector-1   | 2023-11-15T17:21:32.812Z   info    extensions/extensions.go:33     Starting extensions...
expert-grogu-collector-1   | 2023-11-15T17:21:32.812Z   info    adapter/receiver.go:45  Starting stanza receiver        {"kind": "receiver", "name": "filelog", "data_type": "logs"}
expert-grogu-collector-1   | 2023-11-15T17:21:32.813Z   info    service@v0.88.0/service.go:169  Everything is ready. Begin running and processing data.
expert-grogu-collector-1   | 2023-11-15T17:21:33.014Z   info    fileconsumer/file.go:182        Started watching file   {"kind": "receiver", "name": "filelog", "data_type": "logs", "component": "fileconsumer", "path": "/usr/src/app/exgru.log"}
expert-grogu-collector-1   | 2023-11-15T17:21:33.113Z   info    LogsExporter    {"kind": "exporter", "data_type": "logs", "name": "logging", "resource logs": 1, "log records": 4}
expert-grogu-collector-1   | 2023-11-15T17:21:33.113Z   info    ResourceLog #0
expert-grogu-collector-1   | Resource SchemaURL:
expert-grogu-collector-1   | ScopeLogs #0
expert-grogu-collector-1   | ScopeLogs SchemaURL:
expert-grogu-collector-1   | InstrumentationScope
expert-grogu-collector-1   | LogRecord #0
expert-grogu-collector-1   | ObservedTimestamp: 2023-11-15 17:21:33.01473246 +0000 UTC
expert-grogu-collector-1   | Timestamp: 2023-11-15 17:16:58 +0000 UTC
expert-grogu-collector-1   | SeverityText: INFO
expert-grogu-collector-1   | SeverityNumber: Info(9)
expert-grogu-collector-1   | Body: Str({"asctime": "2023-11-15T17:16:58", "levelname": "INFO", "message": "Starting to practice The Telemetry for 10 second(s)", "taskName": null})
expert-grogu-collector-1   | Attributes:
expert-grogu-collector-1   |      -> log.file.name: Str(exgru.log)
expert-grogu-collector-1   |      -> asctime: Str(2023-11-15T17:16:58)
expert-grogu-collector-1   |      -> levelname: Str(INFO)
expert-grogu-collector-1   |      -> message: Str(Starting to practice The Telemetry for 10 second(s))
expert-grogu-collector-1   |      -> taskName: Str(<nil>)
expert-grogu-collector-1   | Trace ID:
expert-grogu-collector-1   | Span ID:
expert-grogu-collector-1   | Flags: 0
expert-grogu-collector-1   | LogRecord #1
expert-grogu-collector-1   | ObservedTimestamp: 2023-11-15 17:21:33.014871669 +0000 UTC
expert-grogu-collector-1   | Timestamp: 2023-11-15 17:17:08 +0000 UTC
expert-grogu-collector-1   | SeverityText: INFO
expert-grogu-collector-1   | SeverityNumber: Info(9)
expert-grogu-collector-1   | Body: Str({"asctime": "2023-11-15T17:17:08", "levelname": "INFO", "message": "Done practicing", "taskName": null})
expert-grogu-collector-1   | Attributes:
expert-grogu-collector-1   |      -> log.file.name: Str(exgru.log)
expert-grogu-collector-1   |      -> asctime: Str(2023-11-15T17:17:08)
expert-grogu-collector-1   |      -> levelname: Str(INFO)
expert-grogu-collector-1   |      -> message: Str(Done practicing)
expert-grogu-collector-1   |      -> taskName: Str(<nil>)
expert-grogu-collector-1   | Trace ID:
expert-grogu-collector-1   | Span ID:
expert-grogu-collector-1   | Flags: 0
expert-grogu-collector-1   | LogRecord #2
expert-grogu-collector-1   | ObservedTimestamp: 2023-11-15 17:21:33.01487521 +0000 UTC
expert-grogu-collector-1   | Timestamp: 2023-11-15 17:17:08 +0000 UTC
expert-grogu-collector-1   | SeverityText: INFO
expert-grogu-collector-1   | SeverityNumber: Info(9)
expert-grogu-collector-1   | Body: Str({"asctime": "2023-11-15T17:17:08", "levelname": "INFO", "message": "Practicing The Telemetry completed: True", "taskName": null})
expert-grogu-collector-1   | Attributes:
expert-grogu-collector-1   |      -> message: Str(Practicing The Telemetry completed: True)
expert-grogu-collector-1   |      -> taskName: Str(<nil>)
expert-grogu-collector-1   |      -> asctime: Str(2023-11-15T17:17:08)
expert-grogu-collector-1   |      -> log.file.name: Str(exgru.log)
expert-grogu-collector-1   |      -> levelname: Str(INFO)
expert-grogu-collector-1   | Trace ID:
expert-grogu-collector-1   | Span ID:
expert-grogu-collector-1   | Flags: 0
expert-grogu-collector-1   | LogRecord #3
expert-grogu-collector-1   | ObservedTimestamp: 2023-11-15 17:21:33.01487771 +0000 UTC
expert-grogu-collector-1   | Timestamp: 2023-11-15 17:21:32 +0000 UTC
expert-grogu-collector-1   | SeverityText: INFO
expert-grogu-collector-1   | SeverityNumber: Info(9)
expert-grogu-collector-1   | Body: Str({"asctime": "2023-11-15T17:21:32", "levelname": "INFO", "message": "Starting to practice The Telemetry for 10 second(s)", "taskName": null})
expert-grogu-collector-1   | Attributes:
expert-grogu-collector-1   |      -> log.file.name: Str(exgru.log)
expert-grogu-collector-1   |      -> asctime: Str(2023-11-15T17:21:32)
expert-grogu-collector-1   |      -> levelname: Str(INFO)
expert-grogu-collector-1   |      -> message: Str(Starting to practice The Telemetry for 10 second(s))
expert-grogu-collector-1   |      -> taskName: Str(<nil>)
expert-grogu-collector-1   | Trace ID:
expert-grogu-collector-1   | Span ID:
expert-grogu-collector-1   | Flags: 0
```

## Yoda level

Now we're switching gears and look over Yoda's shoulders, a Telemetry Master.

First, change into the [yoda/][repo-yoda] directory.

In this scenario we see Yoda using the OTel logs bridge API in the Python app to
directly ingest logs, in [OpenTelemetry Protocol][otlp] (OTLP) format, into the
OTel collector. This is both faster and more reliable than first logging to a
file and have the collector read it off of it!

Overall, we have the following setup Yoda is using:

```plain
( python main.py ) - OTLP -> ( OTel collector ) --> stdout
```

With the following OTel collector config (visualize via
[OTelBin][otelbin-yoda]):

```yaml
receivers:
  otlp:
    protocols:
      grpc:
exporters:
  debug:
    verbosity: detailed
service:
  pipelines:
    logs:
      receivers: [otlp]
      exporters: [debug]
```

Now run Yoda's setup with `docker-compose -f docker-compose.yaml` and you should
see something akin to below:

```shell
yoda-collector-1   | 2023-11-15T16:54:22.545Z   info    service@v0.88.0/telemetry.go:84 Setting up own telemetry...
yoda-collector-1   | 2023-11-15T16:54:22.546Z   info    service@v0.88.0/telemetry.go:201        Serving Prometheus metrics      {"address": ":8888", "level": "Basic"}
yoda-collector-1   | 2023-11-15T16:54:22.546Z   info    exporter@v0.88.0/exporter.go:275        Deprecated component. Will be removed in future releases.       {"kind": "exporter", "data_type": "logs", "name": "logging"}
yoda-collector-1   | 2023-11-15T16:54:22.547Z   info    service@v0.88.0/service.go:143  Starting otelcol-contrib...     {"Version": "0.88.0", "NumCPU": 4}
yoda-collector-1   | 2023-11-15T16:54:22.547Z   info    extensions/extensions.go:33     Starting extensions...
yoda-collector-1   | 2023-11-15T16:54:22.547Z   warn    internal@v0.88.0/warning.go:40  Using the 0.0.0.0 address exposes this server to every network interface, which may facilitate Denial of Service attacks    {"kind": "receiver", "name": "otlp", "data_type": "logs", "documentation": "https://github.com/open-telemetry/opentelemetry-collector/blob/main/docs/security-best-practices.md#safeguards-against-denial-of-service-attacks"}
yoda-collector-1   | 2023-11-15T16:54:22.549Z   info    otlpreceiver@v0.88.0/otlp.go:83 Starting GRPC server    {"kind": "receiver", "name": "otlp", "data_type": "logs", "endpoint": "0.0.0.0:4317"}
yoda-collector-1   | 2023-11-15T16:54:22.550Z   info    service@v0.88.0/service.go:169  Everything is ready. Begin running and processing data.
yoda-collector-1   | 2023-11-15T16:54:27.667Z   info    LogsExporter    {"kind": "exporter", "data_type": "logs", "name": "logging", "resource logs": 1, "log records": 1}
yoda-collector-1   | 2023-11-15T16:54:27.668Z   info    ResourceLog #0
yoda-collector-1   | Resource SchemaURL:
yoda-collector-1   | Resource attributes:
yoda-collector-1   |      -> telemetry.sdk.language: Str(python)
yoda-collector-1   |      -> telemetry.sdk.name: Str(opentelemetry)
yoda-collector-1   |      -> telemetry.sdk.version: Str(1.21.0)
yoda-collector-1   |      -> service.name: Str(train-the-telemetry)
yoda-collector-1   |      -> service.instance.id: Str(33992a23112e)
yoda-collector-1   | ScopeLogs #0
yoda-collector-1   | ScopeLogs SchemaURL:
yoda-collector-1   | InstrumentationScope opentelemetry.sdk._logs._internal
yoda-collector-1   | LogRecord #0
yoda-collector-1   | ObservedTimestamp: 1970-01-01 00:00:00 +0000 UTC
yoda-collector-1   | Timestamp: 2023-11-15 16:54:22.651675136 +0000 UTC
yoda-collector-1   | SeverityText: INFO
yoda-collector-1   | SeverityNumber: Info(9)
yoda-collector-1   | Body: Str(Starting to practice The Telemetry for 10 second(s))
yoda-collector-1   | Trace ID:
yoda-collector-1   | Span ID:
yoda-collector-1   | Flags: 0
yoda-collector-1   |    {"kind": "exporter", "data_type": "logs", "name": "logging"}
yoda-collector-1   | 2023-11-15T16:54:32.715Z   info    LogsExporter    {"kind": "exporter", "data_type": "logs", "name": "logging", "resource logs": 1, "log records": 2}
yoda-collector-1   | 2023-11-15T16:54:32.716Z   info    ResourceLog #0
yoda-collector-1   | Resource SchemaURL:
yoda-collector-1   | Resource attributes:
yoda-collector-1   |      -> telemetry.sdk.language: Str(python)
yoda-collector-1   |      -> telemetry.sdk.name: Str(opentelemetry)
yoda-collector-1   |      -> telemetry.sdk.version: Str(1.21.0)
yoda-collector-1   |      -> service.name: Str(train-the-telemetry)
yoda-collector-1   |      -> service.instance.id: Str(33992a23112e)
yoda-collector-1   | ScopeLogs #0
yoda-collector-1   | ScopeLogs SchemaURL:
yoda-collector-1   | InstrumentationScope opentelemetry.sdk._logs._internal
yoda-collector-1   | LogRecord #0
yoda-collector-1   | ObservedTimestamp: 1970-01-01 00:00:00 +0000 UTC
yoda-collector-1   | Timestamp: 2023-11-15 16:54:32.713701888 +0000 UTC
yoda-collector-1   | SeverityText: INFO
yoda-collector-1   | SeverityNumber: Info(9)
yoda-collector-1   | Body: Str(Done practicing)
yoda-collector-1   | Trace ID:
yoda-collector-1   | Span ID:
yoda-collector-1   | Flags: 0
yoda-collector-1   | LogRecord #1
yoda-collector-1   | ObservedTimestamp: 1970-01-01 00:00:00 +0000 UTC
yoda-collector-1   | Timestamp: 2023-11-15 16:54:32.714062336 +0000 UTC
yoda-collector-1   | SeverityText: INFO
yoda-collector-1   | SeverityNumber: Info(9)
yoda-collector-1   | Body: Str(Practicing The Telemetry completed: True)
yoda-collector-1   | Trace ID:
yoda-collector-1   | Span ID:
yoda-collector-1   | Flags: 0
yoda-collector-1   |    {"kind": "exporter", "data_type": "logs", "name": "logging"}
yoda-baby-grogu-1  | =`;*'+.|,+?):(*-<}~}
```

Fun, hu? You can play around with Yoda's source code to add more contextual
information and add processors to manipulate the log records as they pass the
collector, now.

May The Telemetry be with you, young Padawan!

## What's next?

Now that you're familiar with The Telemetry and its good practices, you could
extend Yoda's code to do the following:

1. Add more context. For example, try to use OTel resource attributes and the
   semantic conventions to make the context of the execution more explicit.
1. Enrich the logs in the OTel collector or filter certain severity levels,
   using processors such as the transform or attributes processors.
1. Add tracing support by emitting spans, where it makes sense.
1. Add an o11y backend such as OpenSearch (along with [Data
   Prepper][dataprepper]) to the setup, allowing to ingest spans and logs in
   OTLP format.
1. Once you have traces and logs ingested in a backend, try to correlate these
   two telemetry signal types in the backend along with a frontend such as
   Grafana.
1. Use auto-instrumentation to further enrich telemetry.

The community is currently working on the [Events API
Interface][otel-logs-events] which is a good place to continue your research and
maybe provide feedback?

## Kudos and References

Kudos go out to [Severin Neumann][svrnm] and [Houssam Chehab][hossko] who both
were very patient with me and pivotal concerning making Yoda level work, I owe
you!

If you want to dive deeper into OTel log collection (especially with Python),
check out the following resources:

- [OpenTelemetry Logging][otel-logs-spec] (OTel docs)
- [Events API Interface][otel-logs-events] (OTel docs)
- [General Logs Attributes][otel-semconv-logs] (semantic conventions)
- [OpenTelemetry Python][otel-python-repo] (GitHub repository)
- [A language-specific implementation of OpenTelemetry in Python][otel-python]
  (OTel docs)
- [OpenTelemetry Logging Instrumentation][py-docs-logs] (Python docs)
- [OpenTelemetry Logs SDK example][py-docs-logs-example] (Python docs)

[repo-baby-grogu]: baby-grogu/
[repo-expert-grogu]: expert-grogu/
[repo-yoda]: yoda/
[filelog]:
  https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/filelogreceiver
[debug]:
  https://github.com/open-telemetry/opentelemetry-collector/tree/main/exporter/debugexporter
[otelbin-expert-grogu]:
  https://www.otelbin.io/?#config=receivers%3A*N__filelog%3A*N____include%3A_%5B_%2Fusr%2Fsrc%2Fapp%2F**.log_%5D*N____start*_at%3A_beginning*N____operators%3A*N____-_type%3A_json*_parser*N______timestamp%3A*N________parse*_from%3A_attributes.asctime*N________layout%3A_*%22*.Y-*.m-*.dT*.H%3A*.M%3A*.S*%22*N______severity%3A*N________parse*_from%3A_attributes.levelname*Nexporters%3A*N__logging%3A*N____verbosity%3A_detailed*Nservice%3A*N__pipelines%3A*N____logs%3A*N______receivers%3A_%5B_filelog_%5D*N______exporters%3A_%5B_logging_%5D%7E
[otlp]: /docs/specs/otlp/
[otelbin-yoda]:
  https://www.otelbin.io/?#config=receivers%3A*N__otlp%3A*N____protocols%3A*N______grpc%3A*Nexporters%3A*N__logging%3A*N____verbosity%3A_detailed*Nservice%3A*N__pipelines%3A*N____logs%3A*N______receivers%3A_%5B_otlp_%5D*N______exporters%3A_%5B_logging_%5D%7E
[dataprepper]: https://opensearch.org/docs/latest/data-prepper/index/
[svrnm]: https://github.com/svrnm
[hossko]: https://github.com/hossko
[otel-logs-spec]: /docs/specs/otel/logs/
[otel-logs-events]: /docs/specs/otel/logs/event-api/
[otel-semconv-logs]: /docs/specs/semconv/general/logs/
[otel-python-repo]: https://github.com/open-telemetry/opentelemetry-python
[otel-python]: /docs/instrumentation/python/
[py-docs-logs]:
  https://opentelemetry-python-contrib.readthedocs.io/en/latest/instrumentation/logging/logging.html
[py-docs-logs-example]:
  https://opentelemetry-python.readthedocs.io/en/latest/examples/logs/README.html
