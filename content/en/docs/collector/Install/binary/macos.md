---
title: Install the Collector on macOS
aliases: [/docs/collector/installation/#macos]
---

## macOS

macOS [releases][] are available for Intel and ARM systems. The releases are
packaged as gzipped tarballs (`.tar.gz`). To unpack them, run the following
commands:

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

Every Collector release includes an `otelcol` executable that you can run after
unpacking.

[releases]:
  https://github.com/open-telemetry/opentelemetry-collector-releases/releases
