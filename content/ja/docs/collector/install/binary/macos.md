---
title: macOSでコレクターをインストールする
linkTitle: macOS
weight: 200
default_lang_commit: ec1657d18d8e1c63bf353049e8a7bf7e65c3e9cb
---

## macOS {#macos}

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

すべてのコレクターのリリースには、解凍後に実行できる `otelcol` 実行ファイルが含まれています。

[releases]: https://github.com/open-telemetry/opentelemetry-collector-releases/releases
