---
title: Instalar o Collector
linkTitle: Instalar
weight: 2
default_lang_commit: 9f912d59a165ded5dec82d0e1a94c2aef54e5c57
---

É possível implantar o OpenTelemetry Collector em uma variedade de sistemas
operacionais e arquiteturas. As instruções a seguir mostram como baixar e
instalar a versão estável mais recente do Collector para o seu ambiente.

Antes de começar, certifique-se de que você entende os fundamentos do Collector,
incluindo [padrões de implantação][deployment patterns],
[componentes][components] e [configuração][configuration].

## Compilar a partir do código-fonte {#build-from-source}

É possível compilar a versão mais recente do Collector com base no sistema
operacional local usando os seguintes comandos:

```sh
git clone https://github.com/open-telemetry/opentelemetry-collector.git
cd opentelemetry-collector
make install-tools
make otelcorecol
```

[deployment patterns]: /docs/collector/deploy/
[components]: /docs/collector/components/
[configuration]: /docs/collector/configuration/
