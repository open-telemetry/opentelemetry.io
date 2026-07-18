---
title: .NET ゼロコード計装
description: .NET アプリケーションとサービスからトレースとメトリクスを送信します。
linkTitle: .NET
aliases: [net]
redirects: [{ from: /docs/languages/net/automatic/*, to: ':splat' }]
weight: 30
default_lang_commit: d03483e1d5cc696a5541f8bcc8ff97170f2f2ca1
cSpell:ignore: coreutils HKLM iisreset Sonoma
---

OpenTelemetry .NET 自動計装を使用すると、ソースコードを変更せずに .NET アプリケーションやサービスからトレースとメトリクスをオブザーバビリティバックエンドに送信できます。

サービスやアプリケーションのコードを計装する方法については、[手動計装](/docs/languages/dotnet/instrumentation)を参照してください。

## 互換性 {#compatibility}

OpenTelemetry .NET 自動計装は、[.NET](https://dotnet.microsoft.com/en-us/platform/support/policy/dotnet-core) の公式にサポートされているすべてのオペレーティングシステムとバージョンで動作します。

[.NET Framework](https://dotnet.microsoft.com/download/dotnet-framework) のサポートされる最小バージョンは `4.6.2` です。

サポートされるプロセッサーアーキテクチャは以下のとおりです。

- x86
- AMD64 (x86-64)
- ARM64（[Experimental](/docs/specs/otel/versioning-and-stability)）

> [!NOTE]
>
> ARM64 ビルドは CentOS ベースのイメージをサポートしていません。

CI テストは以下のオペレーティングシステムに対して実行されています。

- [Alpine x64](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/blob/main/docker/alpine.dockerfile)
- [Alpine ARM64](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/blob/main/docker/alpine.dockerfile)
- [Debian x64](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/blob/main/docker/debian.dockerfile)
- [Debian ARM64](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/blob/main/docker/debian-arm64.dockerfile)
- [CentOS Stream 9 x64](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/blob/main/docker/centos-stream9.dockerfile)
- [macOS Sonoma 14 ARM64](https://github.com/actions/runner-images/blob/main/images/macos/macos-14-Readme.md)
- [Microsoft Windows Server 2022 x64](https://github.com/actions/runner-images/blob/main/images/windows/Windows2022-Readme.md)
- [Microsoft Windows Server 2025 x64](https://github.com/actions/runner-images/blob/main/images/windows/Windows2025-Readme.md)
- [Ubuntu 22.04 LTS x64](https://github.com/actions/runner-images/blob/main/images/ubuntu/Ubuntu2204-Readme.md)
- [Ubuntu 22.04 LTS ARM64](https://github.com/actions/partner-runner-images/blob/main/images/arm-ubuntu-22-image.md)

## セットアップ {#setup}

.NET アプリケーションを自動的に計装するには、お使いのオペレーティングシステム用のインストーラスクリプトをダウンロードして実行してください。

### Linux と macOS {#linux-and-macos}

`.sh` スクリプトをダウンロードして実行します。

> [!NOTE]
>
> エアギャップ環境では、`LOCAL_PATH` 変数を使用してインストールファイルを直接指定します。
>
> ```shell
> LOCAL_PATH=<PATH_TO_INSTALLER> sh ./otel-dotnet-auto-install.sh
> ```
>
> または、`DOWNLOAD_DIR` を使用してファイルが格納されたフォルダーを指定すると、インストールスクリプトが使用する正しいファイルを判別します。
>
> ```shell
> DOWNLOAD_DIR=<PATH_TO_FOLDER_WITH_FILES> sh ./otel-dotnet-auto-install.sh
> ```

```shell
# bash スクリプトをダウンロード
curl -sSfL https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/releases/latest/download/otel-dotnet-auto-install.sh -O

# コアファイルをインストール
sh ./otel-dotnet-auto-install.sh

# 計装スクリプトの実行を有効化
chmod +x $HOME/.otel-dotnet-auto/instrument.sh

# 現在のシェルセッション用に計装をセットアップ
. $HOME/.otel-dotnet-auto/instrument.sh

# 計装を有効にしてアプリケーションを実行
OTEL_SERVICE_NAME=myapp OTEL_RESOURCE_ATTRIBUTES=deployment.environment.name=staging,service.version=1.0.0 ./MyNetApp
```

> [!IMPORTANT]
>
> macOS では [`coreutils`](https://formulae.brew.sh/formula/coreutils) が必要です。
> [homebrew](https://brew.sh/) がインストールされている場合は、以下を実行して入手できます。
>
> ```shell
> brew install coreutils
> ```

### Windows (PowerShell) {#windows-powershell}

Windows では、管理者として PowerShell モジュールを使用します。

> [!NOTE] Version note
>
> Windows
> [PowerShell Desktop](https://learn.microsoft.com/powershell/module/microsoft.powershell.core/about/about_windows_powershell_5.1#powershell-editions)
> (v5.1) が必要です。
> PowerShell Core (v6.0+) を含む他の[バージョン](https://learn.microsoft.com/previous-versions/powershell/scripting/overview)は、現時点ではサポートされていません。

```powershell
# PowerShell 5.1 が必要です
#Requires -PSEdition Desktop

# モジュールをダウンロード
$module_url = "https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/releases/latest/download/OpenTelemetry.DotNet.Auto.psm1"
$download_path = Join-Path $env:temp "OpenTelemetry.DotNet.Auto.psm1"
Invoke-WebRequest -Uri $module_url -OutFile $download_path -UseBasicParsing

# モジュールをインポートしてその関数を使用
Import-Module $download_path

# コアファイルをインストール（オンライン方式 vs オフライン方式）
Install-OpenTelemetryCore
Install-OpenTelemetryCore -LocalPath "C:\Path\To\OpenTelemetry.zip"

# 現在の PowerShell セッション用に計装をセットアップ
Register-OpenTelemetryForCurrentSession -OTelServiceName "MyServiceDisplayName"

# 計装を有効にしてアプリケーションを実行
.\MyNetApp.exe

# 以下のコマンドを呼び出すと使用方法を確認できます

# 利用可能なすべてのコマンドを一覧表示
Get-Command -Module OpenTelemetry.DotNet.Auto

# コマンドの使用方法を取得
Get-Help Install-OpenTelemetryCore -Detailed
```

## .NET アプリケーションを実行する Windows サービスの計装 {#instrument-a-windows-service-running-a-net-application}

`OpenTelemetry.DotNet.Auto.psm1` PowerShell モジュールを使用して、Windows サービスの自動計装をセットアップします。

```powershell
# モジュールをインポート
Import-Module "OpenTelemetry.DotNet.Auto.psm1"

# コアファイルをインストール
Install-OpenTelemetryCore

# Windows サービスの計装をセットアップ
Register-OpenTelemetryForWindowsService -WindowsServiceName "WindowsServiceName" -OTelServiceName "MyServiceDisplayName"
```

> [!CAUTION]
>
> `Register-OpenTelemetryForWindowsService` はサービスの再起動を実行します。

### Windows サービスの構成 {#configuration-for-windows-service}

> [!IMPORTANT]
>
> 構成を変更した後は、Windows サービスを再起動することを忘れないでください。
> PowerShell で `Restart-Service -Name $WindowsServiceName -Force` を実行すると再起動できます。

.NET Framework アプリケーションの場合、`App.config` の `appSettings` で[最も一般的な `OTEL_` 設定](/docs/specs/otel/configuration/sdk-environment-variables/#general-sdk-configuration)（`OTEL_RESOURCE_ATTRIBUTES` など）を構成できます。

別の方法として、Windows レジストリで Windows サービスの環境変数を設定することもできます。

指定した Windows サービス（`$svcName`）のレジストリキーは以下の場所にあります。

```powershell
HKLM\SYSTEM\CurrentControlSet\Services\$svcName
```

環境変数は `REG_MULTI_SZ`（複数行レジストリ値）の `Environment` で以下の形式で定義されます。

```env
Var1=Value1
Var2=Value2
```

## IIS にデプロイされた ASP.NET アプリケーションの計装 {#instrument-an-aspnet-application-deployed-on-iis}

> [!NOTE]
>
> 以下の手順は .NET Framework アプリケーションに適用されます。

`OpenTelemetry.DotNet.Auto.psm1` PowerShell モジュールを使用して、IIS の自動計装をセットアップします。

```powershell
# モジュールをインポート
Import-Module "OpenTelemetry.DotNet.Auto.psm1"

# コアファイルをインストール
Install-OpenTelemetryCore

# IIS の計装をセットアップ
Register-OpenTelemetryForIIS
```

> [!CAUTION]
>
> `Register-OpenTelemetryForIIS` は IIS の再起動を実行します。

### ASP.NET アプリケーションの構成 {#configuration-for-aspnet-applications}

> [!NOTE]
>
> 以下の手順は .NET Framework アプリケーションに適用されます。

ASP.NET アプリケーションの場合、`Web.config` の `appSettings` で[最も一般的な `OTEL_` 設定](/docs/specs/otel/configuration/sdk-environment-variables/#general-sdk-configuration)（`OTEL_SERVICE_NAME` など）を構成できます。

サービス名が明示的に構成されていない場合、自動的に生成されます。
.NET Framework で IIS 上にホストされているアプリケーションの場合、`SiteName\VirtualDirectoryPath`（例: `MySite\MyApp`）が使用されます。

ASP.NET Core アプリケーションの場合、`Web.config` ファイルの `<aspNetCore>` ブロック内の [`<environmentVariable>`](https://docs.microsoft.com/en-us/aspnet/core/host-and-deploy/iis/web-config#set-environment-variables) 要素を使用して、環境変数で構成を設定できます。

> [!IMPORTANT]
>
> 構成を変更した後は、IIS を再起動することを忘れないでください。
> `iisreset.exe` を実行すると再起動できます。

### 詳細な構成 {#advanced-configuration}

`applicationHost.config` に [`<environmentVariables>`](https://docs.microsoft.com/en-us/iis/configuration/system.applicationhost/applicationpools/add/environmentvariables/) を追加して、特定のアプリケーションプールの環境変数を設定できます。

IIS にデプロイされたすべてのアプリケーションに共通の環境変数を設定するには、`W3SVC` と `WAS` Windows サービスの環境変数を設定することを検討してください。

> [!TIP]
>
> IIS 10.0 より古いバージョンの場合、別のユーザーを作成し、その環境変数を設定して、アプリケーションプールのユーザーとして使用することを検討できます。

## NuGet パッケージ {#nuget-package}

[`self-contained`](https://learn.microsoft.com/en-us/dotnet/core/deploying/#publish-self-contained) アプリケーションを NuGet パッケージを使用して計装できます。
詳細については、[NuGet パッケージ](./nuget-packages)を参照してください。

## コンテナの計装 {#instrument-a-container}

Docker コンテナの計装例については、GitHub の[サンプル](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/tree/main/examples/demo)を参照してください。

[OpenTelemetry Operator for Kubernetes](/docs/platforms/kubernetes/operator/) も使用できます。

## エージェントの構成 {#configuring-the-agent}

構成オプションの全範囲については、[構成と設定](./configuration)を参照してください。

## ログとトレースの相関 {#log-to-trace-correlation}

> [!NOTE]
>
> OpenTelemetry .NET 自動計装が提供する自動ログ・トレース相関は、現在 `Microsoft.Extensions.Logging` を使用する .NET アプリケーションでのみ動作します。
> 詳細については、[#2310][] を参照してください。

[#2310]: https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/issues/2310

OpenTelemetry .NET SDK は自動的にログをトレースデータに相関させます。
アクティブなトレースのコンテキスト内でログが出力されると、トレースコンテキスト[フィールド](/docs/specs/otel/logs/data-model#trace-context-fields)の `TraceId`、`SpanId`、`TraceState` が自動的に設定されます。

以下は、サンプルコンソールアプリケーションが生成するログです。

```json
"logRecords": [
    {
        "timeUnixNano": "1679392614538226700",
        "severityNumber": 9,
        "severityText": "Information",
        "body": {
            "stringValue": "Success! Today is: {Date:MMMM dd, yyyy}"
        },
        "flags": 1,
        "traceId": "21df288eada1ce4ace6c40f39a6d7ce1",
        "spanId": "a80119e5a05fed5a"
    }
]
```

詳細については、以下を参照してください。

- [OpenTelemetry .NET SDK](https://github.com/open-telemetry/opentelemetry-dotnet/tree/main/docs/logs/correlation)
- [OpenTelemetry 仕様](/docs/specs/otel/logs/data-model#trace-context-fields)

## サポートされるライブラリとフレームワーク {#supported-libraries-and-frameworks}

OpenTelemetry .NET 自動計装は、さまざまなライブラリをサポートしています。
完全なリストについては、[計装](./instrumentations)を参照してください。

## トラブルシューティング {#troubleshooting}

アプリケーションからのテレメトリーを標準出力に直接表示するには、アプリケーションを起動する前に、以下の環境変数の値に `console` を追加してください。

- `OTEL_TRACES_EXPORTER`
- `OTEL_METRICS_EXPORTER`
- `OTEL_LOGS_EXPORTER`

一般的なトラブルシューティング手順と特定の問題の解決方法については、[トラブルシューティング](./troubleshooting)を参照してください。

## 次のステップ {#next-steps}

アプリケーションやサービスに自動計装を構成した後は、[カスタムトレースとメトリクスの送信](./custom)や[手動計装](/docs/languages/dotnet/instrumentation)を追加してカスタムテレメトリーデータを収集することもできます。

## アンインストール {#uninstall}

### Linux と macOS {#uninstall-unix}

Linux と macOS では、インストール手順は現在のシェルセッションにのみ影響するため、明示的なアンインストールは不要です。

### Windows (PowerShell) {#uninstall-windows}

Windows では、管理者として PowerShell モジュールを使用します。

> [!IMPORTANT] Version note
>
> Windows [PowerShell Desktop][] (v5.1) が必要です。
> PowerShell Core (v6.0+) を含む他の[バージョン][versions]は、現時点ではサポートされていません。

[PowerShell Desktop]: https://learn.microsoft.com/powershell/module/microsoft.powershell.core/about/about_windows_powershell_5.1#powershell-editions
[versions]: https://learn.microsoft.com/previous-versions/powershell/scripting/overview

```powershell
# PowerShell 5.1 が必要です
#Requires -PSEdition Desktop

# 以前にインストールしたモジュールをインポート
Import-Module "OpenTelemetry.DotNet.Auto.psm1"

# 以前に IIS を登録した場合、登録を解除
Unregister-OpenTelemetryForIIS

# 以前に Windows サービスを登録した場合、登録を解除
Unregister-OpenTelemetryForWindowsService -WindowsServiceName "WindowsServiceName"

# 最後に、OpenTelemetry 計装をアンインストール
Uninstall-OpenTelemetryCore
```
