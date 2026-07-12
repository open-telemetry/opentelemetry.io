---
title: Встановлення Collector в macOS
linkTitle: macOS
weight: 200
default_lang_commit: 5489ba34bff91356aa2c501cd55f07eeb30cc355
---

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

Кожен випуск Collector містить виконуваний файл, який можна запустити після розпакування.

[releases]: https://github.com/open-telemetry/opentelemetry-collector-releases/releases
