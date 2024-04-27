---
title: Using instrumentation libraries
linkTitle: Libraries
weight: 40
cSpell:ignore: HTTPX httpx instrumentor uninstrument
---

{{% docs/languages/libraries-intro "Python" %}}

## Use instrumentation libraries

If a library isn't included with OpenTelemetry, you can use
[instrumentation libraries](/docs/specs/otel/glossary/#instrumentation-library)
to generate telemetry data for a library or framework.

For example,
[the instrumentation library for HTTPX](https://pypi.org/project/opentelemetry-instrumentation-httpx/)
automatically creates [spans](/docs/concepts/signals/traces/#spans) based on
HTTP requests.

## Setup

You can install each instrumentation library separately using pip. For example:

```sh
pip install opentelemetry-instrumentation-{integration}
```

In the previous example, `{integration}` is the name of the instrumentation. For
a complete list of instrumentations and their names, browse the
[instrumentation](https://github.com/open-telemetry/opentelemetry-python-contrib/tree/main/instrumentation)
directory of the `opentelemetry-python-contrib` repository on GitHub.

To install a development version, clone or fork the
`opentelemetry-python-contrib` repository and run the following command to do an
editable installation:

```sh
pip install -e ./instrumentation/opentelemetry-instrumentation-{integration}
```

## Example with HTTPX instrumentation

Here's how you can instrument HTTP requests made using the `httpx` library.

First, install the instrumentation library using pip:

```sh
pip install opentelemetry-instrumentation-httpx
```

Next, use the instrumentor to automatically trace requests from all clients:

```python
import httpx
from opentelemetry.instrumentation.httpx import HTTPXClientInstrumentor

url = "https://some.url/get"
HTTPXClientInstrumentor().instrument()

with httpx.Client() as client:
     response = client.get(url)

async with httpx.AsyncClient() as client:
     response = await client.get(url)
```

If needed, you can uninstrument specific clients or all clients. For examples:

```python
import httpx
from opentelemetry.instrumentation.httpx import HTTPXClientInstrumentor

HTTPXClientInstrumentor().instrument()
client = httpx.Client()

# Uninstrument a specific client
HTTPXClientInstrumentor.uninstrument_client(client)

# Uninstrument all clients
HTTPXClientInstrumentor().uninstrument()
```

## Available instrumentation libraries

A full list of instrumentation libraries produced by OpenTelemetry is available
from the [opentelemetry-python-contrib][] repository.

You can also find more instrumentations available in the
[registry](/ecosystem/registry/?language=python&component=instrumentation).

## Next steps

After you have set up instrumentation libraries, you might want to add your own
[instrumentation](/docs/languages/python/instrumentation) to your code, to
collect custom telemetry data.

You might also want to configure an appropriate exporter to
[export your telemetry data](/docs/languages/python/exporters) to one or more
telemetry backends.

You can also check the
[automatic instrumentation for Python](/docs/languages/python/automatic).

[opentelemetry-python-contrib]:
  https://github.com/open-telemetry/opentelemetry-python-contrib/tree/main/instrumentation
