---
title: Compilar a partir do código-fonte
description:
  Aprenda como compilar o OpenTelemetry Collector a partir do código-fonte
weight: 100
default_lang_commit: 6a7f17450ce3edc2e4363013551ee93ba7934a5d
---

Você pode compilar a versão mais recente do Collector com base no seu sistema
operacional local utilizando os seguintes comandos:

```sh
git clone https://github.com/open-telemetry/opentelemetry-collector.git
cd opentelemetry-collector
make install-tools
make otelcorecol
```
