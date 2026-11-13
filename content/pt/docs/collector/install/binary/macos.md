---
title: Instale o Collector no macOS
linkTitle: macOS
weight: 200
default_lang_commit: 9f912d59a165ded5dec82d0e1a94c2aef54e5c57
---

As [distribuições][releases] de macOS estão disponíveis para sistemas Intel e ARM.
Elas são distribuídas como arquivos tar comprimidos com gzip (`.tar.gz`). Para
descompactá-los, execute os seguintes comandos:

{{< tabpane text=true >}} {{% tab Intel %}}

```sh
curl --proto '=https' --tlsv1.2 -fOL https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/v{{% param vers %}}/otelcol_{{% param vers %}}_darwin_amd64.tar.gz
tar -xvf otelcol_{{% param vers %}}_darwin_amd64.tar.gz
```

{{% /tab %}} {{% tab ARM %}}

```sh
curl --proto '=https' --tlsv1.2 -fOL https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/v{{% param vers %}}/otelcol_{{% param vers %}}_darwin_arm64.tar.gz
tar -xvf otelcol_{{% param vers %}}_darwin_arm64.tar.gz
```

{{% /tab %}} {{< /tabpane >}}

Cada distribuição do Collector inclui um executável que você pode descompactar e
executar.

[releases]:
  https://github.com/open-telemetry/opentelemetry-collector-releases/releases
