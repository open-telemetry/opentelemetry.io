---
title: Python
description: >-
  <img width="35" class="img-initial" src="/img/logos/32x32/Python_SDK.svg"
  alt="Python"> Uma implementação específica de linguagem do OpenTelemetry em
  Python.
weight: 22
default_lang_commit: 5c112f86bd72c1d17f031b3a95b6fe2f79d6f699
drifted_from_default: true
---

{{% docs/languages/index-intro python /%}}

## Suporte de Versão {#status-and-releases}

O OpenTelemetry suporta a versão Python 3.9 e superiores.

## Instalação {#installation}

Os pacotes API e SDK estão disponíveis no PyPI e podem ser instalados via pip:

```sh
pip install opentelemetry-api
pip install opentelemetry-sdk
```

Além disso, existem vários pacotes de extensão que podem ser instalados
separadamente como:

```sh
pip install opentelemetry-exporter-{exporter}
pip install opentelemetry-instrumentation-{instrumentation}
```

Essas são as bibliotecas de exporters e instrumentação, respectivamente. Os
exporters Jaeger, Zipkin, Prometheus, OTLP e OpenCensus podem ser encontrados no
diretório de
[exporters](https://github.com/open-telemetry/opentelemetry-python/blob/main/exporter/)
do repositório. Instrumentações e exporters adicionais podem ser encontrados no
repositório contrib
[instrumentação](https://github.com/open-telemetry/opentelemetry-python-contrib/tree/main/instrumentation)
e
[exporter](https://github.com/open-telemetry/opentelemetry-python-contrib/tree/main/exporter)
diretórios.

## Extensões {#extensions}

Para encontrar projetos relacionados como exporters, bibliotecas de
instrumentação, implementações de rastreadores, etc., visite o
[Registro](/ecosystem/registry/?s=python).

### Instalando Pacotes de Ponta {#installing-cutting-edge-packages}

Há algumas funcionalidades que ainda não foram lançadas no PyPI. Nessa situação,
você pode querer instalar os pacotes diretamente do repositório. Isso pode ser
feito clonando o repositório e fazendo uma
[instalação editável](https://pip.pypa.io/en/stable/reference/pip_install/#editable-installs):

```sh
git clone https://github.com/open-telemetry/opentelemetry-python.git
cd opentelemetry-python
pip install -e ./opentelemetry-api -e ./opentelemetry-sdk -e ./opentelemetry-semantic-conventions
```

## Repositórios e _benchmarks_

- Repositório Principal: [opentelemetry-python][]
- Repositório Contrib: [opentelemetry-python-contrib][]

[opentelemetry-python]: https://github.com/open-telemetry/opentelemetry-python
[opentelemetry-python-contrib]:
  https://github.com/open-telemetry/opentelemetry-python-contrib
