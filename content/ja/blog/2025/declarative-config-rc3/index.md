---
title: '新しい Configuration Schema のリリース候補'
linkTitle: 新しい Configuration Schema のリリース候補
date: 2025-12-12
author: >-
  [Alex Boten](https://github.com/codeboten)(Honeycomb)
default_lang_commit: 5cf207da7aef590bebe8ea29a1873d65ad5c02a2
cSpell:ignore: configtls severitynumber
---

OpenTelemetry Configuration Schema の[最新リリース][rc3-release]が今週公開されました。
このリリースにより、3年間の取り組みを経て Configuration ワーキンググループは完了に一歩近づき、スキーマは安定版としてマークされることに一歩近づきました。
楽観的すぎるかもしれませんが、安定版リリース前の最後のリリース候補になるかもしれないと考えています。

前回のリリース以降、リポジトリにおける変更の多くはツールの改善に関するもので、スキーマの一貫性を高め、将来新たな不整合が発生する可能性を減らすことを目的としています。
それ以外にも、エンドユーザー、Configuration Schema へのコントリビューター、およびスキーマの実装者の両方に影響する変更があります。

## エンドユーザー向けの変更 {#end-user-changes}

リリースノートには、すべての破壊的変更に関する情報が含まれています。
注目すべき変更の一つは、各種 OTLP エクスポーターにおける `tls` 設定のグループ化と、OpenTelemetry Collector の [`configtls`][configtls] パッケージにより近い形になるようオプション名を変更したことです。

```yaml
# 変更前
tracer_provider: # or meter_provider, logger_provider
  processors:
    - batch:
        exporter:
          otlp_http:
            certificate_file: /app/cert.pem
            client_key_file: /app/key.pem
            client_certificate_file: /app/client_cert.pem
---
# 変更後
tracer_provider:
  processors:
    - batch:
        exporter:
          otlp_http:
            tls:
              ca_file: /app/cert.pem
              key_file: /app/key.pem
              cert_file: /app/client_cert.pem
```

`log_level` は従来、`OTEL_LOG_LEVEL` の既存の仕様に合わせた文字列値でした。
今回のリリースでは、ロギング仕様で既に[定義されている][severity-levels]ものと同じ重大度レベルをサポートするように変更されました。
今月初め、Zipkin エクスポーターの非推奨化に関するアナウンスが行われました。
その結果、スキーマの今回のリリースでもこのエクスポーターが削除されました。
また、各種プロパティのバリデーションも改善されました。

最後に、スキーマはすべてのプロパティに `description` フィールドを設定するようになり、設定ファイルの編集時にユーザーにとって必要なコンテキストを提供します。

{{% figure
  src="schema.gif"
  caption="エディターからスキーマを使用し、description フィールドの利用方法を示す画面キャプチャ"
%}}

description フィールドにより、エンドユーザーは編集中の設定の詳細を理解しやすくなり、各言語の実装にも役立ちます。
多くの実装では、コード生成ツールを使用して Configuration Schema のコード内表現を自動的に生成しています。
description フィールドをサポートしているツールでは、モデルのプロパティに対するドキュメントが自動的に生成されます。

## コントリビューター向け {#contributors}

JSON Schema の以前のリリースでは、[schema][otel-config-schema] ディレクトリ配下の複数ファイルに分割されていました。
今回のリリース候補では、これが変更されました。
このディレクトリには、リポジトリのルートに格納される単一ファイルを生成するために使用される YAML ソースファイルが含まれるようになりました。
ソースファイルの新しい形式は、リポジトリ内のツールと組み合わせることで、ドキュメント、サンプル、および[生成される JSON Schema][schema] をより一貫性のある形で生成します。
コントリビューションに興味がある方は、[contributing][contrib-doc] ドキュメントでツールとプロセスの詳細をご覧ください。

## 実験的機能 {#experimental-features}

スキーマやサンプルファイルを見ていると、`development` 接尾辞が付いた設定オプションがあることに気づくかもしれません。
OpenTelemetry の他の多くの領域と同様に、Configuration Schema は仕様が安定化するにつれて進化し続けます。
スキーマで実験的機能を識別するために使用されるメカニズムは、`*/(development|alpha|beta)` という接尾辞です。
これは[バージョニングドキュメント][version-docs]に記載されています。
実験的機能を使用するユーザーは、設定の実験的セクションで利用可能なオプションが変更される可能性があることに注意してください。

何から始めればよいかわからない場合は、スキーマの[ドキュメント][schema-docs]ページで利用可能なすべての設定オプションについて詳しく学んでください。
この最新バージョンのスキーマに対するフィードバックをお待ちしています！

[rc3-release]: https://github.com/open-telemetry/opentelemetry-configuration/releases/tag/v1.0.0-rc.3
[configtls]: https://pkg.go.dev/go.opentelemetry.io/collector/config/configtls
[severity-levels]: /docs/specs/otel/logs/data-model/#field-severitynumber
[otel-config-schema]: https://github.com/open-telemetry/opentelemetry-configuration/tree/6b306495d6285dacfa815b24115f69f0743f9ad1/schema?from_branch=main
[schema]: https://github.com/open-telemetry/opentelemetry-configuration/blob/v1.0.0-rc.3/opentelemetry_configuration.json
[contrib-doc]: https://github.com/open-telemetry/opentelemetry-configuration/blob/1905936912045de1cb6ef04d13afe912f462dbe2/CONTRIBUTING.md?from_branch=main#project-tooling
[version-docs]: https://github.com/open-telemetry/opentelemetry-configuration/blob/0a18b0c19ba656c22aa2a8dab65d03380fcc2802/VERSIONING.md?from_branch=main#experimental-features
[schema-docs]: https://github.com/open-telemetry/opentelemetry-configuration/blob/28784d4ea2054f95affe3912189ccd51ee6aea3a/schema-docs.md?from_branch=main#opentelemetryconfiguration
