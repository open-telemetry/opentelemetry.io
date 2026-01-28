---
title: Усунення несправностей
description: Дізнайтеся, як усунути несправності в OpenTelemetry .NET
weight: 100
default_lang_commit: 5489ba34bff91356aa2c501cd55f07eeb30cc355
cSpell:ignore: eventsource OTEL
---

Усі компоненти, що постачаються з репозиторіїв OpenTelemetry .NET ([opentelemetry-dotnet][] та [opentelemetry-dotnet-contrib][]), використовують [EventSource](https://docs.microsoft.com/dotnet/api/system.diagnostics.tracing.eventsource) для внутрішнього логування. Назва `EventSource`, що використовується SDK OpenTelemetry, — "OpenTelemetry-Sdk". Щоб дізнатися назви `EventSource`, що використовуються іншими компонентами, зверніться до документації окремих компонентів.

Хоча ці журнали можна переглянути за допомогою таких інструментів, як [PerfView](https://github.com/microsoft/perfview) або [`dotnet-trace`][dotnet-trace], SDK також має функцію самодіагностики, яка допомагає усунути несправності.

## Самодіагностика {#self-diagnostics}

SDK OpenTelemetry постачається з вбудованою функцією самодіагностики. Ця функція, коли вона ввімкнена, прослуховує внутрішні журнали, що генеруються всіма компонентами OpenTelemetry (тобто EventSources, імʼя яких починається з "OpenTelemetry-"), і записує їх у файл журналу.

Функцію самодіагностики можна ввімкнути, змінити або вимкнути під час роботи процесу (без його перезапуску). SDK намагається читати файл конфігурації кожні 10 секунд у невиключному режимі тільки для читання. SDK створює або перезаписує файл з новими журналами відповідно до конфігурації. Цей файл не перевищує заданий максимальний розмір і перезаписується циклічно.

Щоб увімкнути самодіагностику, перейдіть до [поточної робочої теки](https://en.wikipedia.org/wiki/Working_directory) вашого процесу та створіть файл конфігурації з назвою `OTEL_DIAGNOSTICS.json` із таким вмістом:

```json
{
  "LogDirectory": ".",
  "FileSize": 32768,
  "LogLevel": "Warning",
  "FormatMessage": "true"
}
```

Щоб вимкнути самодіагностику, видаліть файл конфігурації.

> [!TIP]
>
> У більшості випадків ви можете розмістити файл разом із вашим застосунком. У Windows ви можете скористатися [Process Explorer](https://docs.microsoft.com/sysinternals/downloads/process-explorer), двічі клацнути на процесі, щоб відкрити діалогове вікно Властивості, і знайти "Current directory" на вкладці "Image" .
>
> Внутрішньо SDK шукає файл конфігурації, розташований в [GetCurrentDirectory](https://docs.microsoft.com/dotnet/api/system.io.directory.getcurrentdirectory), а потім в [AppContext.BaseDirectory](https://docs.microsoft.com/dotnet/api/system.appcontext.basedirectory). Ви також можете знайти точну теку, викликавши ці методи з вашого коду.

### Параметри конфігурації {#configuration-parameters}

Файл конфігурації підтримує наступні параметри:

#### LogDirectory

Тека, в якій зберігається вихідний файл журналу. Це може бути абсолютний шлях або відносний шлях до поточної теки.

#### FileSize

Додатне ціле число, яке визначає розмір файлу журналу в [KiB](https://en.wikipedia.org/wiki/Kibibyte). Це значення повинно бути в діапазоні `[1024, 131072]` (1 MiB <= розмір <= 128 MiB), інакше воно буде округлено до найближчого верхньої або нижньої межі. Файл журналу ніколи не перевищує цей заданий розмір і перезаписується циклічно.

#### LogLevel

Найнижчий рівень подій, що підлягають фіксації. Він повинен бути одним із [значень](https://docs.microsoft.com/dotnet/api/system.diagnostics.tracing.eventlevel#fields) [`EventLevel` enum](https://docs.microsoft.com/dotnet/api/system.diagnostics.tracing.eventlevel). Рівень означає серйозність події. Нижчі рівні серйозності охоплюють вищі рівні серйозності. Наприклад, `Warning` включає рівні `Error` та `Critical`.

#### FormatMessage

Булеве значення, яке контролює, чи слід форматувати повідомлення журналу, замінюючи заповнювачі (`{0}`, `{1}` тощо) їхніми фактичними значеннями параметрів. Якщо встановлено значення `false` (стандартно), повідомлення реєструються з неформатованими заповнювачами, за якими йдуть необроблені значення параметрів. Якщо встановлено значення `true`, заповнювачі замінюються форматованими значеннями параметрів для покращення читабельності.

**Приклад з `FormatMessage: false` (стандартно):**

```text
2025-07-24T01:45:04.1020880Z:Measurements from Instrument '{0}', Meter '{1}' will be ignored. Reason: '{2}'. Suggested action: '{3}'{dotnet.gc.collections}{System.Runtime}{Instrument belongs to a Meter not subscribed by the provider.}{Use AddMeter to add the Meter to the provider.}
```

**Приклад з `FormatMessage: true`:**

```text
2025-07-24T01:44:44.7059260Z:Measurements from Instrument 'dotnet.gc.collections', Meter 'System.Runtime' will be ignored. Reason: 'Instrument belongs to a Meter not subscribed by the provider.'. Suggested action: 'Use AddMeter to add the Meter to the provider.'
```

### Примітки {#remarks}

У вказаній теці `LogDirectory` створюється файл журналу з назвою `ExecutableName.ProcessId.log` (наприклад, `myapp.exe.12345.log`), в який записуються журнали.

Якщо SDK не вдається проаналізувати поля `LogDirectory`, `FileSize` або `LogLevel`, файл конфігурації вважається недійсним і файл журналу не створюється.

Коли змінюється `LogDirectory` або `FileSize`, SDK створює або перезаписує файл з новими журналами відповідно до нової конфігурації. Розмір файлу конфігурації не повинен перевищувати 4 Кбайт. Якщо файл більший за 4 Кбайт, читається лише перші 4 Кбайт вмісту.

Файл журналу може не відповідати формату текстового файлу, необхідному для досягнення мети мінімальних накладних витрат і обмеженого використання ресурсів: він може містити кінцеві символи `NUL`, якщо текст журналу менший за заданий розмір; коли операція запису досягає кінця, вона починається з початку і перезаписує поточний текст.

[dotnet-trace]: https://docs.microsoft.com/dotnet/core/diagnostics/dotnet-trace
[opentelemetry-dotnet]: https://github.com/open-telemetry/opentelemetry-dotnet
[opentelemetry-dotnet-contrib]: https://github.com/open-telemetry/opentelemetry-dotnet-contrib
