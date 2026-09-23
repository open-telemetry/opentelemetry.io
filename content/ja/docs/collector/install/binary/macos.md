---
title: macOSでコレクターをインストールする
linkTitle: macOS
weight: 200
default_lang_commit: 1f686d5f7b6bbdfaa30dafdc6ca0214c6f2308db
---

macOS向けの [リリース][releases] は Intel および ARM システムで利用可能です。
リリースはgzip圧縮されたtarball (`.tar.gz`) としてパッケージ化されています。
解凍するには、以下のコマンドを実行してください。

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

すべての Collector リリースには、解凍して実行できる実行ファイルが含まれています。

[releases]: https://github.com/open-telemetry/opentelemetry-collector-releases/releases
