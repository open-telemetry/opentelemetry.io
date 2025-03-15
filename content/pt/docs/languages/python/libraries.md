---
title: Usando bibliotecas de instrumentação
linkTitle: Bibliotecas
weight: 40
cSpell:ignore: httpx instrumentor uninstrument
default_lang_commit: 918511661af010726c8847d7fe41a46231fa59cc
---

{{% docs/languages/libraries-intro "python" %}}

## Usar bibliotecas de instrumentação {#use-instrumentation-libraries}

Se uma biblioteca não oferece suporte nativo ao OpenTelemetry, você pode usar
[bibliotecas de instrumentação](/docs/specs/otel/glossary/#instrumentation-library)
para gerar dados de telemetria para uma biblioteca ou framework.

Por exemplo,
[a biblioteca de instrumentação para HTTPX](https://pypi.org/project/opentelemetry-instrumentation-httpx/)
cria automaticamente [trechos](/docs/concepts/signals/traces/#spans) com base em
solicitações HTTP.

## Configuração {#setup}

Você pode instalar cada biblioteca de instrumentação separadamente usando pip.
Por exemplo:

```sh
pip install opentelemetry-instrumentation-{instrumented-library}
```

No exemplo anterior, `{instrumented-library}` é o nome da instrumentação.

Para instalar uma versão de desenvolvimento, clone ou faça um _fork_ do
repositório `opentelemetry-python-contrib` e execute o seguinte comando para
fazer uma instalação editável:

```sh
pip install -e ./instrumentation/opentelemetry-instrumentation-{integration}
```

Após a instalação, você precisará inicializar a biblioteca de instrumentação.
Cada biblioteca geralmente tem sua própria maneira de inicializar.

## Exemplo com instrumentação HTTPX {#example-with-httpx-instrumentation}

Veja como você pode instrumentar solicitações HTTP feitas usando a biblioteca
`httpx`.

Primeiro, instale a biblioteca de instrumentação usando pip:

```sh
pip install opentelemetry-instrumentation-httpx
```

Em seguida, use o instrumentador para rastrear automaticamente as solicitações
de todos os clientes:

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

### Desativar instrumentações {#turn-off-instrumentations}

Se necessário, você pode desinstalar a instrumentação clientes específicas ou
todos os clientes usando o método `uninstrument_client`. Por exemplo:

```python
import httpx
from opentelemetry.instrumentation.httpx import HTTPXClientInstrumentor

HTTPXClientInstrumentor().instrument()
client = httpx.Client()

# Desinstrumentar um cliente específico
HTTPXClientInstrumentor.uninstrument_client(client)

# Desinstrumentar todos os clientes
HTTPXClientInstrumentor().uninstrument()
```

## Bibliotecas de instrumentação disponíveis {#available-instrumentation-libraries}

Uma lista completa de bibliotecas de instrumentação elaboradas pelo
OpenTelemetry está disponível no repositório [opentelemetry-python-contrib][].

Você também pode encontrar mais instrumentações disponíveis em
[registro](/ecosystem/registry/?language=python&component=instrumentation).

## Próximos passos {#next-steps}

Depois de configurar as bibliotecas de instrumentação, você pode querer
adicionar sua própria [instrumentação](/docs/languages/python/instrumentation)
no seu código, para coletar dados de telemetria personalizados.

Você também pode querer configurar um exporter apropriado para
[exportar seus dados de telemetria](/docs/languages/python/exporters) para um ou
mais _backends_ de telemetria.

Você também pode verificar a
[Instrumentação sem código para Python](/docs/zero-code/python/).

[opentelemetry-python-contrib]:
  https://github.com/open-telemetry/opentelemetry-python-contrib/tree/main/instrumentation#readme
