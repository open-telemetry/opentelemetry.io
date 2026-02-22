---
title: Інструментування .NET без коду
description: Надсилайте трасування та метрики з .NET застосунків та сервісів.
linkTitle: .NET
aliases: [net]
redirects: [{ from: /docs/languages/net/automatic/*, to: ':splat' }]
weight: 30
default_lang_commit: 5f551752635886a0d2d6b2a83e5a36866ca1b5f1
cSpell:ignore: coreutils HKLM iisreset Sonoma
---

Використовуйте OpenTelemetry .NET Automatic Instrumentation для надсилання трасування та метрик з .NET застосунків та сервісів до систем спостереження без необхідності змінювати їх вихідний код.

Щоб дізнатися, як інструментувати ваш сервіс або застосунок, прочитайте [Ручне інструментування](/docs/languages/dotnet/instrumentation).

## Сумісність {#compatibility}

OpenTelemetry .NET Automatic Instrumentation має працювати з усіма офіційно підтримуваними операційними системами та версіями [.NET](https://dotnet.microsoft.com/en-us/platform/support/policy/dotnet-core).

Мінімально підтримувана версія [.NET Framework](https://dotnet.microsoft.com/download/dotnet-framework) - `4.6.2`.

Підтримувані архітектури процесорів:

- x86
- AMD64 (x86-64)
- ARM64 ([Експериментально](/docs/specs/otel/versioning-and-stability))

> [!NOTE]
>
> ARM64 збірка не підтримує образи на базі CentOS.

CI тести виконуються на наступних операційних системах:

- [Alpine ARM64](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/blob/main/docker/alpine.dockerfile)
- [Debian x64](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/blob/main/docker/debian.dockerfile)
- [Debian ARM64](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/blob/main/docker/debian-arm64.dockerfile)
- [CentOS Stream 9 x64](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/blob/main/docker/centos-stream9.dockerfile)
- [macOS Sonoma 14 ARM64](https://github.com/actions/runner-images/blob/main/images/macos/macos-14-Readme.md)
- [Microsoft Windows Server 2022 x64](https://github.com/actions/runner-images/blob/main/images/windows/Windows2022-Readme.md)
- [Microsoft Windows Server 2025 x64](https://github.com/actions/runner-images/blob/main/images/windows/Windows2025-Readme.md)
- [Ubuntu 22.04 LTS x64](https://github.com/actions/runner-images/blob/main/images/ubuntu/Ubuntu2204-Readme.md)
- [Ubuntu 22.04 LTS ARM64](https://github.com/actions/partner-runner-images/blob/main/images/arm-ubuntu-22-image.md)

## Налаштування {#setup}

Щоб автоматично інструментувати .NET застосунок, завантажте та запустіть інсталяційний скрипт для вашої операційної системи.

### Linux та macOS {#linux-and-macos}

Завантажте та запустіть `.sh` скрипт:

```shell
# Завантажте bash скрипт
curl -sSfL https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/releases/latest/download/otel-dotnet-auto-install.sh -O

# Встановіть основні файли
sh ./otel-dotnet-auto-install.sh

# Дозвольте виконання інструментального скрипта
chmod +x $HOME/.otel-dotnet-auto/instrument.sh

# Налаштуйте інструментування для поточної shell сесії
. $HOME/.otel-dotnet-auto/instrument.sh

# Запустіть ваш застосунок з інструментуванням
OTEL_SERVICE_NAME=myapp OTEL_RESOURCE_ATTRIBUTES=deployment.environment=staging,service.version=1.0.0 ./MyNetApp
```

> [!IMPORTANT]
>
> В macOS потрібно встановити [`coreutils`](https://formulae.brew.sh/formula/coreutils). Якщо у вас встановлено [homebrew](https://brew.sh/), ви можете отримати його, виконавши
>
> ```shell
> brew install coreutils
> ```

### Windows (PowerShell) {#windows-powershell}

У Windows використовуйте PowerShell модуль як Адміністратор.

> [!NOTE] Version note
>
> Потрібен Windows [PowerShell Desktop](https://learn.microsoft.com/powershell/module/microsoft.powershell.core/about/about_windows_powershell_5.1#powershell-editions) (версія 5.1). Інші [версії](https://learn.microsoft.com/previous-versions/powershell/scripting/overview), включаючи PowerShell Core (v6.0+), на даний момент не підтримуються.

```powershell
# Потрібен PowerShell 5.1
# Потрібен -PSEdition Desktop

# Завантажте модуль
$module_url = "https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/releases/latest/download/OpenTelemetry.DotNet.Auto.psm1"
$download_path = Join-Path $env:temp "OpenTelemetry.DotNet.Auto.psm1"
Invoke-WebRequest -Uri $module_url -OutFile $download_path -UseBasicParsing

# Імпортуйте модуль для використання його функцій
Import-Module $download_path

# Встановіть основні файли (онлайн або офлайн метод)
Install-OpenTelemetryCore
Install-OpenTelemetryCore -LocalPath "C:\Path\To\OpenTelemetry.zip"

# Налаштуйте інструментування для поточної сесії PowerShell
Register-OpenTelemetryForCurrentSession -OTelServiceName "MyServiceDisplayName"

# Запустіть ваш застосунок з інструментуванням
.\MyNetApp.exe

# Ви можете отримати інформацію про використання, викликавши наступні команди

# Список всіх доступних команд
Get-Command -Module OpenTelemetry.DotNet.Auto

# Отримати інформацію про використання команди
Get-Help Install-OpenTelemetryCore -Detailed
```

## Інструментування Windows Service, що виконує .NET застосунок {#instrument-a-windows-service-running-a-net-application}

Використовуйте PowerShell модуль `OpenTelemetry.DotNet.Auto.psm1` для налаштування автоматичного інструментування для Windows Service:

```powershell
# Імпортуйте модуль
Import-Module "OpenTelemetry.DotNet.Auto.psm1"

# Встановіть основні файли
Install-OpenTelemetryCore

# Налаштуйте інструментування для вашого Windows Service
Register-OpenTelemetryForWindowsService -WindowsServiceName "WindowsServiceName" -OTelServiceName "MyServiceDisplayName"
```

> [!CAUTION]
>
> `Register-OpenTelemetryForWindowsService` виконує перезапуск сервісу.

### Налаштування для Windows Service {#configuration-for-windows-service}

> [!IMPORTANT]
>
> Не забудьте перезапустити Windows Service після внесення змін до налаштувань. Ви можете зробити це, виконавши `Restart-Service -Name $WindowsServiceName -Force` у PowerShell.

Для .NET Framework застосунків ви можете налаштувати [найбільш поширені `OTEL_` параметри](/docs/specs/otel/configuration/sdk-environment-variables/#general-sdk-configuration) (наприклад, `OTEL_RESOURCE_ATTRIBUTES`) через `appSettings` у `App.config`.

Альтернативою є встановлення змінних середовища для Windows Service у реєстрі Windows.

Ключ реєстру для даного Windows Service (з назвою `$svcName`) знаходиться за адресою:

```powershell
HKLM\SYSTEM\CurrentControlSet\Services\$svcName
```

Змінні середовища визначаються у `REG_MULTI_SZ` (багаторядкове значення реєстру) з назвою `Environment` у наступному форматі:

```env
Var1=Value1
Var2=Value2
```

## Інструментування ASP.NET застосунку, розгорнутого на IIS {#instrument-an-asp-net-application-deployed-on-iis}

> [!NOTE]
>
> Наступні інструкції застосовуються до .NET Framework застосунків.

Використовуйте PowerShell модуль `OpenTelemetry.DotNet.Auto.psm1` для налаштування автоматичного інструментування для IIS:

```powershell
# Імпортуйте модуль
Import-Module "OpenTelemetry.DotNet.Auto.psm1"

# Встановіть основні файли
Install-OpenTelemetryCore

# Налаштуйте інструментування для IIS
Register-OpenTelemetryForIIS
```

> [!CAUTION]
>
> `Register-OpenTelemetryForIIS` виконує перезапуск IIS.

### Налаштування для ASP.NET застосунків {#configuration-for-asp-net-applications}

> [!NOTE]
>
> Наступні інструкції застосовуються до .NET Framework застосунків.

Для ASP.NET додатків ви можете налаштувати [найбільш поширені `OTEL_` налаштування](/docs/specs/otel/configuration/sdk-environment-variables/#general-sdk-configuration) (наприклад, `OTEL_SERVICE_NAME`) через `appSettings` у `Web.config`.

Якщо імʼя сервісу не налаштоване явно, воно буде згенероване автоматично. Якщо застосунок розгорнуто на IIS у .NET Framework, це буде використовувати `SiteName\VirtualDirectoryPath` наприклад: `MySite\MyApp`

Для ASP.NET Core застосунків ви можете використовувати [`<environmentVariable>`](https://docs.microsoft.com/en-us/aspnet/core/host-and-deploy/iis/web-config#set-environment-variables) елементи всередині блоку `<aspNetCore>` вашого файлу `Web.config` для налаштування через змінні середовища.

> [!IMPORTANT]
>
> Не забудьте перезапустити IIS після внесення змін до налаштувань. Ви можете зробити це, виконавши `iisreset.exe`.

### Розширене налаштування {#advanced-configuration}

Ви можете додати [`<environmentVariables>`](https://docs.microsoft.com/en-us/iis/configuration/system.applicationhost/applicationpools/add/environmentvariables/) у `applicationHost.config` для встановлення змінних середовища для певних пулів застосунків.

Розгляньте можливість встановлення загальних змінних середовища для всіх застосунків, розгорнутих на IIS, встановивши змінні середовища для Windows Services `W3SVC` та `WAS`.

> [!TIP]
>
> Для версій IIS старших за 10.0, ви можете розглянути можливість створення окремого користувача, встановлення його змінних середовища та використання його як користувача пулу застосунків.

## NuGet пакунок {#nuget-package}

Ви можете інструментувати [`самостійні`](https://learn.microsoft.com/en-us/dotnet/core/deploying/#publish-self-contained) застосунки, використовуючи NuGet пакунки. Дивіться [NuGet пакунки](./nuget-packages) для отримання додаткової інформації.

## Інструментування контейнера {#instrument-a-container}

Для прикладу інструментування Docker контейнера, дивіться [приклад](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/tree/main/examples/demo) на GitHub.

Ви також можете використовувати [OpenTelemetry Operator для Kubernetes](/docs/platforms/kubernetes/operator/).

## Налаштування агента {#configuring-the-agent}

Щоб побачити повний спектр налаштувань, дивіться [Налаштування та параметри](./configuration).

## Кореляція логів з трейсами {#log-to-trace-correlation}

> [!NOTE]
>
> Автоматична кореляція логів з трейсами, надана OpenTelemetry .NET Automatic Instrumentation, наразі працює тільки для .NET застосунків, що використовують `Microsoft.Extensions.Logging`. Дивіться тікет [#2310](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/issues/2310) для отримання додаткової інформації.

OpenTelemetry .NET SDK автоматично корелює логи з даними трасування. Коли логи генеруються в контексті активного трасування, [поля](/docs/specs/otel/logs/data-model#trace-context-fields) контексту трасування `TraceId`, `SpanId`, `TraceState` заповнюються автоматично.

Наступні логи створені демонстраційним консольним застосунком:

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

Для отримання додаткової інформації, дивіться:

- [OpenTelemetry .NET SDK](https://github.com/open-telemetry/opentelemetry-dotnet/tree/main/docs/logs/correlation)
- [Специфікація OpenTelemetry](/docs/specs/otel/logs/data-model#trace-context-fields)

## Підтримувані бібліотеки та фреймворки {#supported-libraries-and-frameworks}

OpenTelemetry .NET Automatic Instrumentation підтримує широкий спектр бібліотек. Для повного списку, дивіться [Інструментування](./instrumentations).

## Розвʼязання проблем {#troubleshooting}

Щоб побачити телеметрію з вашого застосунку безпосередньо на стандартному виводі, додайте `console` до значення наступних змінних середовища перед запуском вашого застосунку:

- `OTEL_TRACES_EXPORTER`
- `OTEL_METRICS_EXPORTER`
- `OTEL_LOGS_EXPORTER`

Для загальних кроків розвʼязання проблем та отримання вирішень для конкретних питань, дивіться [Розвʼязання проблем](./troubleshooting).

## Наступні кроки {#next-steps}

Після того, як ви налаштували автоматичне інструментування для вашого застосунку або сервісу, ви можете [надсилати власні трасування та метрики](./custom) або додати [ручне інструментування](/docs/languages/dotnet/instrumentation) для збору власних телеметричних даних.

## Видалення {#uninstall}

### Linux та macOS {#uninstall-unix}

У Linux та macOS кроки встановлення впливають лише на поточну сесію оболонки, тому явне видалення не потрібне.

### Windows (PowerShell) {#uninstall-windows}

У Windows використовуйте модуль PowerShell як адміністратор.

> [!IMPORTANT] Version note
>
> Потрібен Windows [PowerShell Desktop][] (версія 5.1). Інші [версії][versions], включаючи PowerShell Core (v6.0+), на даний момент не підтримуються.

[PowerShell Desktop]: https://learn.microsoft.com/powershell/module/microsoft.powershell.core/about/about_windows_powershell_5.1#powershell-editions
[versions]: https://learn.microsoft.com/previous-versions/powershell/scripting/overview

```powershell
# Потрібен PowerShell 5.1
# Потрібен -PSEdition Desktop

# Імпортуйте раніше встановлений модуль
Import-Module "OpenTelemetry.DotNet.Auto.psm1"

# Якщо IIS був раніше зареєстрований, скасуйте його реєстрацію
Unregister-OpenTelemetryForIIS

# Якщо служби Windows були раніше зареєстровані, скасуйте їх реєстрацію
Unregister-OpenTelemetryForWindowsService -WindowsServiceName "WindowsServiceName"

# Нарешті, видаліть інструментування OpenTelemetry
Uninstall-OpenTelemetryCore
```
