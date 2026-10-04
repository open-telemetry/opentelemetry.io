---
title: .NET ゼロコード計装
description: .NET アプリケーションとサービスからトレースとメトリクスを送信します。
linkTitle: .NET
aliases: [net]
redirects: [{ from: /docs/languages/net/automatic/*, to: ':splat' }]
weight: 30
default_lang_commit: b7958404d74ea78a5e786cb7d4e837876d0890ea
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

`.sh` スクリプトをダウンロード、検証して実行します。

> [!NOTE]
>
> macOS では [`coreutils`](https://formulae.brew.sh/formula/coreutils) が必要です。
>
> ダウンロードしたインストーラーは、スクリプト自身が自分のコードの信頼性を確立できないため、実行前に検証する必要があります。
> デフォルトでは、インストーラーは [GitHub CLI](https://cli.github.com/) も必要とし、ダウンロードした ZIP アーカイブのイミュータブルリリースとアーティファクト証明の両方を検証します。
> アーカイブの検証を明示的にオプトアウトするには、`SKIP_RELEASE_VERIFICATION=true` を設定してください。
> 検証のスキップは推奨されません。

```shell
# インストーラーをプライベートディレクトリにダウンロード
version="v1.17.0"
repository="open-telemetry/opentelemetry-dotnet-instrumentation"
release_workflow="$repository/.github/workflows/release.yml"
download_dir="$(mktemp -d "${TMPDIR:-/tmp}/otel-dotnet-auto-installer.XXXXXX")"
installer="$download_dir/otel-dotnet-auto-install.sh"
trap 'rm -rf "$download_dir"' 0

# ダウンロード、検証、実行を単一の条件付きチェーンで行い、
# ダウンロードや検証に失敗した場合はインストーラーの実行を防止する
curl -sSfL "https://github.com/$repository/releases/download/$version/otel-dotnet-auto-install.sh" -o "$installer" &&
  gh release verify-asset "$version" "$installer" --repo "$repository" &&
  gh attestation verify "$installer" \
    --repo "$repository" \
    --signer-workflow "$release_workflow" \
    --source-ref "refs/tags/$version" &&
  VERSION="$version" sh "$installer"

# 計装スクリプトの実行を有効化
chmod +x $HOME/.otel-dotnet-auto/instrument.sh

# 現在のシェルセッション用に計装をセットアップ
. $HOME/.otel-dotnet-auto/instrument.sh

# 計装を有効にしてアプリケーションを実行
OTEL_SERVICE_NAME=myapp OTEL_RESOURCE_ATTRIBUTES=deployment.environment.name=staging,service.version=1.0.0 ./MyNetApp
```

エアギャップ環境では、アーカイブを転送する前に検証し、インストーラーのオンライン検証を明示的にスキップしてください。
アーカイブを直接指定するには以下を実行します。

```shell
SKIP_RELEASE_VERIFICATION=true LOCAL_PATH=<PATH_TO_ARCHIVE> sh ./otel-dotnet-auto-install.sh
```

または、ファイルが格納されたフォルダーを指定すると、インストールスクリプトが使用する正しいファイルを判別します。

```shell
SKIP_RELEASE_VERIFICATION=true DOWNLOAD_DIR=<PATH_TO_FOLDER_WITH_FILES> sh ./otel-dotnet-auto-install.sh
```

> [!IMPORTANT]
>
> macOS に [Homebrew](https://brew.sh/) がインストールされている場合は、以下を実行して `coreutils` をインストールできます。
>
> ```shell
> brew install coreutils
> ```

### Windows (PowerShell) {#windows-powershell}

Windows では、管理者として PowerShell モジュールを使用します。

> [!NOTE] 要件
>
> Windows
> [PowerShell Desktop](https://learn.microsoft.com/powershell/module/microsoft.powershell.core/about/about_windows_powershell_5.1#powershell-editions)
> (v5.1) が必要です。
> PowerShell Core (v6.0+) を含む他の[バージョン](https://learn.microsoft.com/previous-versions/powershell/scripting/overview)は、現時点ではサポートされていません。
>
> ダウンロードしたモジュールは、モジュール自身が自分のコードの信頼性を確立できないため、インポート前に検証する必要があります。
> デフォルトでは、インストールに [GitHub CLI](https://cli.github.com/) が必要で、イミュータブルリリースとアーティファクト証明の両方を検証します。
> 明示的にオプトアウトするには、`$skip_release_verification` を `$true` に設定してください。これにより、Windows アーカイブの `Install-OpenTelemetryCore` にも `-SkipReleaseVerification` が渡されます。
> 検証のスキップは推奨されません。

```powershell
# PowerShell 5.1 が必要です
#Requires -PSEdition Desktop

$version = "v1.17.0"
$repository = "open-telemetry/opentelemetry-dotnet-instrumentation"
$release_workflow = "$repository/.github/workflows/release.yml"
$skip_release_verification = $false

# Program Files のアクセス制御で保護された一意のディレクトリを使用する
$program_files = [System.Environment]::GetFolderPath([System.Environment+SpecialFolder]::ProgramFiles)
$download_dir = Join-Path $program_files "OpenTelemetry .NET AutoInstrumentation Download $([System.Guid]::NewGuid().ToString("N"))"
$download_path = Join-Path $download_dir "OpenTelemetry.DotNet.Auto.psm1"
$module_url = "https://github.com/$repository/releases/download/$version/OpenTelemetry.DotNet.Auto.psm1"

New-Item -ItemType Directory -Path $download_dir -ErrorAction Stop | Out-Null

try {
    Invoke-WebRequest -Uri $module_url -OutFile $download_path -UseBasicParsing

    if ($skip_release_verification) {
        Write-Warning "Release verification is skipped. Downloaded PowerShell code and binaries will not be verified."
    }
    else {
        $github_cli = Get-Command gh.exe -CommandType Application -ErrorAction SilentlyContinue | Select-Object -First 1
        if (-not $github_cli) {
            throw "The GitHub CLI ('gh') is required. Install it from https://cli.github.com/ or explicitly set `$skip_release_verification to `$true."
        }

        & $github_cli.Source release verify-asset $version $download_path --repo $repository
        if ($LASTEXITCODE -ne 0) {
            throw "GitHub release verification failed for the PowerShell module."
        }

        & $github_cli.Source attestation verify $download_path `
            --repo $repository `
            --signer-workflow $release_workflow `
            --source-ref "refs/tags/$version"
        if ($LASTEXITCODE -ne 0) {
            throw "GitHub artifact attestation verification failed for the PowerShell module."
        }
    }

    # 検証成功後にモジュールをインポートする
    Import-Module $download_path

    # 以前にダウンロードした Windows アーカイブからインストールするには、以下を追加:
    # -LocalPath "C:\Path\To\OpenTelemetry.zip"
    Install-OpenTelemetryCore -SkipReleaseVerification:$skip_release_verification -ErrorAction Stop

    # 検証済みモジュールを更新とアンインストール用にキャッシュする
    Copy-Item -LiteralPath $download_path -Destination (Get-OpenTelemetryInstallDirectory) -Force
}
finally {
    if (Test-Path -LiteralPath $download_dir) {
        Remove-Item -LiteralPath $download_dir -Force -Recurse
    }
}

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

[`self-contained`](https://learn.microsoft.com/en-us/dotnet/core/deploying/#publish-as-self-contained) アプリケーションを NuGet パッケージを使用して計装できます。
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
