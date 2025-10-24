---
title: Усунення несправностей автоматичного інструментування .NET
linkTitle: Усунення несправностей
weight: 50
default_lang_commit: e05fefe6c9f7d8b159d9a9a95128098c646c78c4
# prettier-ignore
cSpell:ignore: additionaldeps corehost netfx openTelemetryautoInstrumentationruntimenative pjanotti TRACEFILE патчинг
---

## Загальні кроки {#general-steps}

Якщо ви зіткнулися з будь-якою проблемою з OpenTelemetry .NET Automatic Instrumentation, є кроки, які можуть допомогти вам зрозуміти проблему.

### Увімкніть детальне ведення журналу {#enable-detailed-logging}

Детальні журнали налагодження можуть допомогти вам усунути проблеми з інструментуванням і можуть бути додані до повідомлення у цьому проєкті для полегшення розслідування.

Щоб отримати детальні журнали від OpenTelemetry .NET Automatic Instrumentation, встановіть змінну середовища [`OTEL_LOG_LEVEL`](../configuration#internal-logs) на `debug` перед запуском інструментованого процесу.

Стандартно бібліотека записує файли журналів у попередньо визначені [місця](../configuration#internal-logs). Якщо потрібно, змініть стандартне місце, оновіть змінну середовища `OTEL_DOTNET_AUTO_LOG_DIRECTORY`.

Після отримання журналів видаліть змінну середовища `OTEL_LOG_LEVEL` або встановіть її на менш докладний рівень, щоб уникнути непотрібних накладних витрат.

### Увімкніть трасування хосту {#enable-host-tracing}

[Трасування хосту](https://github.com/dotnet/runtime/blob/edd23fcb1b350cb1a53fa409200da55e9c33e99e/docs/design/features/host-tracing.md#host-tracing) може бути використане для збору інформації, необхідної для розслідування проблем, повʼязаних з різними питаннями, такими як не знайдені збірки. Встановіть наступні змінні середовища:

```terminal
COREHOST_TRACE=1
COREHOST_TRACEFILE=corehost_verbose_tracing.log
```

Потім перезапустіть застосунок, щоб зібрати логи.

## Поширені проблеми {#common-issues}

### Не створюється телеметрія {#no-telemetry-is-produced}

Телеметрія не створюється. У [місці](../configuration#internal-logs) для внутрішніх журналів OpenTelemetry .NET Automatic Instrumentation немає логів.

Можливо, що .NET Profiler не може приєднатися, і тому журнали не будуть створені.

Найпоширенішою причиною є те, що інструментованому застосунку не вистачає дозволів для завантаження збірок OpenTelemetry .NET Automatic Instrumentation.

### Не вдалося встановити пакунок 'OpenTelemetry.AutoInstrumentation.Runtime.Native' {#could-not-install-package-openTelemetryautoInstrumentationruntimenative}

При додаванні пакунків NuGet до вашого проєкту ви отримуєте повідомлення про помилку, подібне до:

```txt
Could not install package 'OpenTelemetry.AutoInstrumentation.Runtime.Native 1.6.0'. You are trying to install this package into a project that targets '.NETFramework,Version=v4.7.2', but the package does not contain any assembly references or content files that are compatible with that framework. For more information, contact the package author.
```

Пакунки NuGet не підтримують проєкти старого стилю `csproj`. Або розгорніть автоматичне інструментування на машині замість використання пакунків NuGet, або переведіть свій проєкт на стиль SDK `csproj`.

### Проблеми з продуктивністю {#performance-issues}

Якщо виникає високе завантаження процесора, переконайтеся, що ви не увімкнули автоматичне інструментування глобально, встановивши змінні середовища на рівні системи або користувача.

Якщо використання системного або користувацького рівня є навмисним, використовуйте змінні середовища [`OTEL_DOTNET_AUTO_EXCLUDE_PROCESSES`](../configuration#global-settings), щоб виключити застосунки з автоматичного інструментування.

### Інструмент командного рядка `dotnet` аварійно завершує роботу {#dotnet-cli-tool-is-crashing}

Ви отримуєте повідомлення про помилку, подібне до наведеного нижче, при запуску застосунку, наприклад з `dotnet run`:

```txt
PS C:\Users\Administrator\Desktop\OTelConsole-NET6.0> dotnet run My.Simple.Console
Unhandled exception. System.Reflection.TargetInvocationException: Exception has been thrown by the target of an invocation.
---> System.Reflection.TargetInvocationException: Exception has been thrown by the target of an invocation.
---> System.TypeInitializationException: The type initializer for 'OpenTelemetry.AutoInstrumentation.Loader.Startup' threw an exception.
---> System.Reflection.TargetInvocationException: Exception has been thrown by the target of an invocation.
---> System.IO.FileNotFoundException: Could not load file or assembly 'Microsoft.Extensions.Configuration.Abstractions, Version=7.0.0.0, Culture=neutral, PublicKeyToken=adb9793829ddae60'. The system cannot find the file specified.
```

З версією `v0.6.0-beta.1` і нижче були проблеми при інструментуванні інструменту командного рядка `dotnet`.

Тому, якщо ви використовуєте одну з цих версій, ми радимо виконати `dotnet build` перед інструментуванням сеансу термінала або викликом його в окремому сеансі термінала.

Дивіться тікет [#1744](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/issues/1744) для отримання додаткової інформації.

### Конфлікти версій збірок {#assembly-version-conflicts}

Повідомлення про помилку, подібне до наведеного нижче:

```txt
Unhandled exception. System.IO.FileNotFoundException: Could not load file or assembly 'Microsoft.Extensions.DependencyInjection.Abstractions, Version=7.0.0.0, Culture=neutral, PublicKeyToken=adb9793829ddae60'. The system cannot find the file specified.

File name: 'Microsoft.Extensions.DependencyInjection.Abstractions, Version=7.0.0.0, Culture=neutral, PublicKeyToken=adb9793829ddae60'
   at Microsoft.AspNetCore.Builder.WebApplicationBuilder..ctor(WebApplicationOptions options, Action`1 configureDefaults)
   at Microsoft.AspNetCore.Builder.WebApplication.CreateBuilder(String[] args)
   at Program.<Main>$(String[] args) in /Blog.Core/Blog.Core.Api/Program.cs:line 26
```

Пакунки NuGet OpenTelemetry .NET та їх залежності розгортаються з OpenTelemetry .NET Automatic Instrumentation.

Щоб вирішити конфлікти версій залежностей, оновіть посилання на проєкт інструментованого застосунку, щоб використовувати ті ж версії, що й OpenTelemetry .NET Automatic Instrumentation.

Простий спосіб забезпечити відсутність таких конфліктів — додати пакунок `OpenTelemetry.AutoInstrumentation` до вашого застосунку. Для інструкцій про те, як додати його до вашого застосунку, дивіться [Використання пакунків NuGet OpenTelemetry.AutoInstrumentation](../nuget-packages).

Альтернативно додайте лише пакунки, що конфліктують, до вашого проєкту. Наступні залежності використовуються OpenTelemetry .NET Automatic Instrumentation:

- [OpenTelemetry.AutoInstrumentation](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/blob/main/src/OpenTelemetry.AutoInstrumentation/OpenTelemetry.AutoInstrumentation.csproj)
- [OpenTelemetry.AutoInstrumentation.AdditionalDeps](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/blob/main/src/OpenTelemetry.AutoInstrumentation.AdditionalDeps/Directory.Build.props)

Знайдіть їх версії в наступних місцях:

- [Directory.Packages.props](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/blob/main/Directory.Packages.props)
- [src/Directory.Packages.props](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/blob/main/src/Directory.Packages.props)
- [src/OpenTelemetry.AutoInstrumentation.AdditionalDeps/Directory.Packages.props](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/blob/main/src/OpenTelemetry.AutoInstrumentation.AdditionalDeps/Directory.Packages.props)

Стандартно посилання на збірки для застосунків .NET Framework перенаправляються під час виконання на версії, що використовуються автоматичним інструментуванням. Ця поведінка може бути керована через налаштування [`OTEL_DOTNET_AUTO_NETFX_REDIRECT_ENABLED`](../configuration).

Якщо застосунок вже містить перенаправлення привʼязок для збірок, що використовуються автоматичним інструментуванням, це автоматичне перенаправлення може не вдатися, дивіться [#2833](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/issues/2833). Перевірте, чи не заважає будь-яке наявне перенаправлення привʼязок перенаправленню на версії, перелічені в [netfx_assembly_redirection.h](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/blob/main/src/OpenTelemetry.AutoInstrumentation.Native/netfx_assembly_redirection.h).

Для того, щоб автоматичне перенаправлення вище працювало, є два конкретні сценарії, які вимагають, щоб збірки, що використовуються для інструментування додатків .NET Framework, ті, що знаходяться в теці `netfx` теки встановлення, також були встановлені в Глобальний кеш збірок (GAC):

1. [**Monkey-патчинг**](https://uk.wikipedia.org/wiki/Мавполатування) збірок, завантажених як нейтральні до домену.
2. Перенаправлення збірок для застосунків зі строгими іменами, якщо застосунок також містить різні версії деяких збірок, також поставлених у теці `netfx`.

Якщо у вас виникають проблеми в одному з наведених вище сценаріїв, знову запустіть команду `Install-OpenTelemetryCore` з модуля встановлення PowerShell, щоб переконатися, що необхідні установки GAC оновлені.

Для отримання додаткової інформації про використання GAC автоматичним інструментуванням дивіться [коментар pjanotti](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/issues/1906#issuecomment-1376292814).

Дивіться [#2269](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/issues/2269) та [#2296](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/issues/2296) для отримання додаткової інформації.

### Збірка в AdditionalDeps не знайдена {#assembly-in-additionaldeps-not-found}

#### Симптоми {#symptoms}

Ви отримуєте повідомлення про помилку, подібне до наступного:

```txt
An assembly specified in the application dependencies manifest (OpenTelemetry.AutoInstrumentation.AdditionalDeps.deps.json) was not found
```

Це може бути повʼязано з наступними проблемами:

- [#1744](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/issues/1744)
- [#2181](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/issues/2181)

## Інші проблеми {#other-issues}

Якщо ви зіткнулися з проблемою, не зазначеною на цій сторінці, дивіться [Загальні кроки](#general-steps) для збору додаткової діагностичної інформації. Це може допомогти полегшити усунення несправностей.
