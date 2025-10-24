---
title: Використання пакунків NuGet OpenTelemetry.AutoInstrumentation
linkTitle: Пакунки NuGet
weight: 40
default_lang_commit: e05fefe6c9f7d8b159d9a9a95128098c646c78c4
cSpell:ignore: buildtasks
---

Використовуйте пакунки NuGet у наступних випадках:

1. Спрощення розгортання. Наприклад, контейнер, що запускає один застосунок.
1. Підтримка інструментування [`самостійних`](https://learn.microsoft.com/en-us/dotnet/core/deploying/#publish-self-contained) застосунків.
1. Полегшення експериментів розробників з автоматичним інструментуванням через пакунки NuGet.
1. Вирішення конфліктів версій між залежностями, які використовуються застосунком, та автоматичним інструментуванням.

## Обмеження {#limitations}

Хоча пакунки NuGet є зручним способом розгортання автоматичного інструментування, вони не можуть бути використані у всіх випадках. Найпоширеніші причини не використовувати пакунки NuGet включають наступні:

1. Ви не можете додати пакунок до проєкту застосунку. Наприклад, застосунок є стороннім і не може додати пакунок.
1. Зменшення використання дискового простору або розміру віртуальної машини, коли кілька застосунків, які потрібно інструментувати, встановлені на одній машині. У цьому випадку ви можете використовувати одне розгортання для всіх .NET застосунків, що працюють на машині.
1. Старий застосунок, який не можна мігрувати до [проєкту у стилі SDK](https://learn.microsoft.com/en-us/nuget/resources/check-project-format#check-the-project-format).

## Використання пакунків NuGet {#using-the-nuget-packages}

Щоб автоматично інструментувати ваш застосунок за допомогою OpenTelemetry .NET, додайте пакунок `OpenTelemetry.AutoInstrumentation` до вашого проєкту:

```terminal
dotnet add [<PROJECT>] package OpenTelemetry.AutoInstrumentation
```

Якщо застосунок посилається на пакунки, які можуть бути інструментовані, але потребують інших пакунків для роботи інструментування, збірка завершиться з помилкою і запропонує вам або додати відсутню бібліотеку інструментування, або пропустити інструментування відповідного пакунку:

```terminal
~packages/opentelemetry.autoinstrumentation.buildtasks/1.6.0/build/OpenTelemetry.AutoInstrumentation.BuildTasks.targets(29,5): error : OpenTelemetry.AutoInstrumentation: додайте посилання на пакунок інструментування 'MongoDB.Driver.Core.Extensions.DiagnosticSources' версії 1.4.0 або додайте 'MongoDB.Driver.Core' до властивості 'SkippedInstrumentations', щоб придушити цю помилку.
```

Щоб розвʼязати помилку, додайте рекомендовану бібліотеку інструментування або пропустіть інструментування зазначеного пакунка, додавши його до властивості `SkippedInstrumentation`, приклад:

```csproj
<PropertyGroup>
   <SkippedInstrumentations>MongoDB.Driver.Core;StackExchange.Redis</SkippedInstrumentations>
</PropertyGroup>
```

Ту саму властивість можна також вказати безпосередньо через CLI, зверніть увагу, що роздільник, `;`, потрібно правильно екранувати як '%3B':

```powershell
dotnet build -p:SkippedInstrumentations=StackExchange.Redis%3BMongoDB.Driver.Core
```

Щоб розповсюдити відповідні нативні компоненти середовища виконання з вашим .NET
застосунком, вкажіть [Ідентифікатор середовища виконання (RID)](https://learn.microsoft.com/en-us/dotnet/core/rid-catalog) для збірки застосунку за допомогою `dotnet build` або `dotnet publish`. Це може вимагати вибору між розповсюдженням [_самостійного_ або _залежного від середовища_](https://learn.microsoft.com/en-us/dotnet/core/deploying/) застосунку. Обидва типи сумісні з автоматичним інструментуванням.

Використовуйте скрипт у вихідній теці збірки, щоб запустити застосунок з активованим автоматичним інструментуванням.

- У Windows використовуйте `instrument.cmd <application_executable>`
- У Linux або Unix використовуйте `instrument.sh <application_executable>`

Якщо ви запускаєте застосунок за допомогою CLI `dotnet`, додайте `dotnet` після скрипту.

- У Windows використовуйте `instrument.cmd dotnet <application>`
- У Linux та Unix використовуйте `instrument.sh dotnet <application>`

Скрипт передає застосунку всі параметри командного рядка, які ви надаєте.
