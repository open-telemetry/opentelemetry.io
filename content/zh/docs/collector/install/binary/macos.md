---
title: 在 macOS 上安装 Collector
linkTitle: macOS
weight: 200
default_lang_commit: 4f007739e0f0fc0b178b8dae457ef06c1c9a5757
---

macOS [发布版本](https://github.com/open-telemetry/opentelemetry-collector-releases/releases)提供适用于 Intel 和 ARM 系统的安装包。发布包以压缩 tarball (`.tar.gz`) 的形式提供。解压命令如下：

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

每个 Collector 版本都包含一个可执行文件，解压后即可运行。
