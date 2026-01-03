---
title: Встановлення Collector в macOS
linkTitle: macOS
weight: 200
default_lang_commit: 9cdf79c9345a05fb82d0e67132c9f68dabddadba
---

## macOS

[Випуски macOS][releases] доступні для систем Intel та ARM. Випуски упаковані у вигляді gzip-архівів (`.tar.gz`). Щоб розпакувати їх, виконайте наступні команди:

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

Кожен випуск Collector містить виконуваний файл `otelcol`, який можна запустити після розпакування.

[releases]: https://github.com/open-telemetry/opentelemetry-collector-releases/releases
