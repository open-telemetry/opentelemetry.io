---
title: Using instrumentation libraries
linkTitle: Libraries
weight: 40
cSpell:ignore: httpx instrumentor uninstrument
---

{{% docs/languages/libraries-intro "python" %}}

## Use instrumentation libraries

If a library does not ship with native OpenTelemetry support, you can use
[instrumentation libraries](/docs/specs/otel/glossary/#instrumentation-library)
to generate telemetry data for a library or framework.

For example,
[the instrumentation library for HTTPX](https://pypi.org/project/opentelemetry-instrumentation-httpx/)
automatically creates [spans](/docs/concepts/signals/traces/#spans) based on
HTTP requests.

## Setup

You can install each instrumentation library separately using pip. For example:

```sh
pip install opentelemetry-instrumentation-{instrumented-library}
```

In the previous example, `{instrumented-library}` is the name of the
instrumentation.

To install a development version, clone or fork the
`opentelemetry-python-contrib` repository and run the following command to do an
editable installation:

```sh
pip install -e ./instrumentation/opentelemetry-instrumentation-{integration}
```

After installation, you will need to initialize the instrumentation library.
Each library typically has its own way to initialize.

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

### Turn off instrumentations

If needed, you can uninstrument specific clients or all clients using the
`uninstrument_client` method. For example:

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
[Zero-code instrumentation for Python](/docs/zero-code/python/).

[opentelemetry-python-contrib]:
  https://github.com/open-telemetry/opentelemetry-python-contrib/tree/main/instrumentation#readme
