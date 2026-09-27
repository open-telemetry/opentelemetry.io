---
title: 制限事項
description: OpenTelemetry PHP Distro の既知の制限事項と制約。
weight: 2
default_lang_commit: 60fad3b49e6097ce6a0fa8fc757be0131c25a367
# prettier-ignore
cSpell:ignore: basedir ComponentProvider opentelemetry-php-contrib passenv xdebug
---

このページでは、OpenTelemetry PHP Distro の既知の制限事項と制約について説明します。

## 他の PHP テレメトリーエージェントとの併用 {#running-with-another-php-telemetry-agent}

OpenTelemetry PHP Distro を、他の PHP APM や OpenTelemetry エージェントと同じプロセス内で同時に実行しないでください。
両方を実行すると、競合、重複した計装、不安定な動作の原因になります。

## `open_basedir` {#open_basedir}

`php.ini` で `open_basedir` が有効な場合、distro のインストールパスを許可されたパスに含める必要があります。
含めない場合、エージェントの読み込みに失敗する可能性があります。

## `xdebug` {#xdebug}

`xdebug` との併用は本番環境では推奨されず、計装されたプロセスで安定性やメモリの問題を引き起こす可能性があります。

## ファイルベース設定（`OTEL_CONFIG_FILE`） {#file-based-configuration-otel_config_file}

ファイルベース（宣言的）設定を使用する場合:

- リモート設定（OpAMP）は利用できません。
  ファイルベース設定とリモート設定は相互に排他的です。
- `Registry::registerResourceDetector()` で登録されたリソースディテクター（たとえば `opentelemetry-php-contrib` のクラウドプロバイダーディテクター）は自動的には有効になりません。
  `ComponentProvider` を提供し、YAML の `resource.detection/development.detectors` セクションに明示的にリストする必要があります。
- distro には `telemetry.distro.name` と `telemetry.distro.version` 属性のためのビルトイン `distro` ディテクターが付属しています。
  使い方については[設定](/docs/zero-code/php/distro/reference/configuration/#distro-resource-detector)を参照してください。
- YAML ファイル内の環境変数の置換（`${VAR_NAME}`）は、値の読み取りに `$_SERVER` を使用します。
  ウェブサーバーコンテキスト（Apache、nginx+FPM）では、プロセス環境変数は自動的に `$_SERVER` で利用可能にはなりません。
  YAML 設定で `${VAR_NAME}` 置換を使用するには、変数が PHP に公開されていることを確認してください:
  - **Apache (mod_php)**: バーチャルホスト設定で `PassEnv VAR_NAME` または `SetEnv VAR_NAME value` を使用してください。
  - **PHP-FPM**: FPM プール設定で `env[VAR_NAME] = value` を設定するか、`clear_env = no` を設定してすべてのプロセス環境変数を渡してください。
  - または、`${VAR_NAME}` 置換を使用するかわりに、YAML ファイルに値を直接ハードコードしてください。
