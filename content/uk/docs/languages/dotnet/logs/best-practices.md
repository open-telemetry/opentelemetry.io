---
title: Поради
linkTitle: Поради
description: Ознайомтесь з найкращими практиками використання OpenTelemetry .NET для логів
weight: 120
default_lang_commit: 5489ba34bff91356aa2c501cd55f07eeb30cc355
---

Дотримуйтесь цих рекомендацій, щоб отримати максимальну віддачу від OpenTelemetry .NET для журналів.

## Logging API

### ILogger

.NET підтримує високопродуктивне структуроване логування за допомогою інтерфейсу [`Microsoft.Extensions. Logging.ILogger`](https://docs.microsoft.com/dotnet/api/microsoft.extensions.logging.ilogger) (включаючи [`ILogger<TCategoryName>`](https://learn.microsoft.com/dotnet/api/microsoft.extensions.logging.ilogger-1)), що допомагає контролювати поведінку застосунків і діагностувати проблеми.

#### Версія пакунка {#package-version}

Використовуйте інтерфейс [`ILogger`](https://docs.microsoft.com/dotnet/api/microsoft.extensions.logging.ilogger) (включаючи [`ILogger<TCategoryName>`](https://learn.microsoft.com/dotnet/api/microsoft.extensions.logging.ilogger-1)) з останньою стабільною версією пакунка [Microsoft.Extensions.Logging](https://www.nuget.org/packages/Microsoft.Extensions.Logging/), незалежно від версії середовища виконання .NET, що використовується:

- Якщо ви використовуєте останню стабільну версію [OpenTelemetry .NET SDK](/docs/languages/dotnet/), вам не потрібно турбуватися про версію пакунка `Microsoft.Extensions.Logging`, оскільки це вже враховано за вас через залежність пакунка.
- Починаючи з версії `3.1.0`, команда .NET runtime дотримується високих стандартів зворотної сумісності для `Microsoft.Extensions.Logging`, навіть під час великих оновлень версії, тому сумісність тут не є проблемою.

#### Отримання Logger {#get-logger}

Щоб використовувати інтерфейс `ILogger`, спочатку потрібно отримати логер. Як отримати логер, залежить від двох речей:

- Типу програми, яку ви створюєте.
- Місця, де ви хочете вести журнал.

Як правило:

- Якщо ви створюєте застосунок з [інʼєкцією залежностей (DI, dependency injection)](https://learn.microsoft.com/dotnet/core/extensions/dependency-injection) (наприклад, [ASP.NET Core](https://learn.microsoft.com/aspnet/core) та [.NET Worker](https://learn.microsoft.com/dotnet/core/extensions/workers)), у більшості випадків ви повинні використовувати логер, наданий DI, є особливі випадки, коли ви хочете вести журнал до того, як конвеєр логування DI стане доступним, або після того, як конвеєр логування DI буде знищено. Ознайомтеся з [офіційним документом .NET](https://learn.microsoft.com/dotnet/core/extensions/logging#integration-with-hosts-and-dependency-injection) та [Getting Started with OpenTelemetry .NET Logs in 5 Minutes - ASP.NET Core Application](/docs/languages/dotnet/logs/getting-started-aspnetcore/) для отримання додаткової інформації.
- Якщо ви створюєте застосунок без DI, створіть екземпляр [LoggerFactory](#loggerfactory) і налаштуйте OpenTelemetry для роботи з ним. Ознайомтеся з [Getting Started with OpenTelemetry .NET Logs in 5 Minutes - Console Application](/docs/languages/dotnet/logs/getting-started-console/) для отримання додаткової інформації.

Використовуйте розділені крапками [UpperCamelCase](https://en.wikipedia.org/wiki/Camel_case) як назву категорії журналу, що робить зручним [фільтрацію журналів](#log-filtering). Загальною практикою є використання повної кваліфікованої назви класу, а якщо потрібна подальша категоризація, додайте назву підкатегорії. Ознайомтеся з [офіційним документом .NET](https://learn.microsoft.com/dotnet/core/extensions/logging#log-category) для отримання додаткової інформації. Наприклад:

```csharp
loggerFactory.CreateLogger<MyClass>(); // це еквівалентно CreateLogger("MyProduct.MyLibrary.MyClass")
loggerFactory.CreateLogger("MyProduct.MyLibrary.MyClass"); // використовуйте повну кваліфіковану назву класу
loggerFactory.CreateLogger("MyProduct.MyLibrary.MyClass.DatabaseOperations"); // додайте назву підкатегорії
loggerFactory.CreateLogger("MyProduct.MyLibrary.MyClass.FileOperations"); // додайте ще одну назву підкатегорії
```

Уникайте надто частого створення логерів. Хоча логери не є надто дорогими, вони все ж вимагають витрат процесорного часу та памʼяті і призначені для повторного використання в усьому застосунку.

#### Запис повідомлень в журнал {#write-log-messages}

Використовуйте структуроване ведення журналу.

- Структуроване ведення журналу є більш ефективним, ніж неструктуроване.
  - Фільтрація та редагування можуть відбуватися в окремих парах ключ-значення, а не у всьому повідомленні журналу.
  - Зберігання та індексація є більш ефективними.
- Структуроване ведення журналу спрощує управління та використання журналів.

Наприклад:

```csharp
var food = "tomato";
var price = 2.99;

logger.LogInformation("Hello from {food} {price}.", food, price);
```

Уникайте інтерполяції рядків. Наприклад:

> [!WARNING]
>
> Наступний код має погану продуктивність через [інтерполяцію рядків](https://learn.microsoft.com/dotnet/csharp/tutorials/string-interpolation):

```csharp
var food = "tomato";
var price = 2.99;

logger.LogInformation($"Hello from {food} {price}.");
```

Використовуйте шаблон [генерації джерела журналу під час компіляції](https://docs.microsoft.com/dotnet/core/extensions/logger-message-generator) для досягнення найкращої продуктивності. Наприклад:

```csharp
var food = "tomato";
var price = 2.99;

logger.SayHello(food, price);

internal static partial class LoggerExtensions
{
    [LoggerMessage(Level = LogLevel.Information, Message = "Hello from {food} {price}.")]
    public static partial void SayHello(this ILogger logger, string food, double price);
}
```

> [!NOTE]
>
> При використанні [LoggerMessageAttribute](https://learn.microsoft.com/dotnet/api/microsoft.extensions.logging.loggermessageattribute) немає необхідності передавати явний [EventId](https://learn.microsoft.com/dotnet/api/microsoft.extensions.logging.eventid). Під час генерації коду автоматично присвоюється стійкий `EventId` на основі хешу імені методу.

Використовуйте [LogPropertiesAttribute](https://learn.microsoft.com/dotnet/api/microsoft.extensions.logging.logpropertiesattribute) з [Microsoft.Extensions.Telemetry.Abstractions](https://www.nuget.org/packages/Microsoft.Extensions.Telemetry.Abstractions/), якщо вам потрібно записати складні обʼєкти. Ознайомтеся з розділом [Логування з використанням складних обʼєктів](/docs/languages/dotnet/logs/complex-objects/) для отримання додаткової інформації.

Уникайте методів розширення з [LoggerExtensions](https://learn.microsoft.com/dotnet/api/microsoft.extensions.logging.loggerextensions), ці методи не оптимізовані для продуктивності. Наприклад:

> [!WARNING]
>
> Наступний код має погану продуктивність через [boxing](https://learn.microsoft.com/dotnet/csharp/programming-guide/types/boxing-and-unboxing):

```csharp
var food = "tomato";
var price = 2.99;

logger.LogInformation("Hello from {food} {price}.", food, price);
```

Дотримуйтесь високих стандартів, використовуючи [`ILogger.IsEnabled`](https://learn.microsoft.com/dotnet/api/microsoft.extensions.logging.ilogger.isenabled).

API журналювання є високо оптимізованим для сценарію, в якому більшість логерів **відключені** для певних рівнів журналювання. Додатковий виклик `IsEnabled` перед журналюванням не дасть вам жодного приросту продуктивності. Наприклад:

> [!WARNING]
>
> Виклик `logger.IsEnabled(LogLevel.Information)` у наведеному коді не дасть жодного приросту продуктивності.

```csharp
var food = "tomato";
var price = 2.99;

if (logger.IsEnabled(LogLevel.Information)) // не робіть цього, це не дасть жодного приросту продуктивності
{
    logger.SayHello(food, price);
}

internal static partial class LoggerExtensions
{
    [LoggerMessage(Level = LogLevel.Information, Message = "Hello from {food} {price}.")]
    public static partial void SayHello(this ILogger logger, string food, double price);
}
```

`IsEnabled` може дати переваги в продуктивності, коли оцінка аргументів є дорогою. Наприклад, у наступному коді виклик `Database.GetFoodPrice` буде пропущений, якщо логер не ввімкнено:

```csharp
if (logger.IsEnabled(LogLevel.Information))
{
    logger.SayHello(food, Database.GetFoodPrice(food));
}
```

Хоча `IsEnabled` може дати деякі переваги в продуктивності у вищезазначеному сценарії, для більшості користувачів це може спричинити більше проблем. Наприклад, продуктивність коду тепер залежить від того, який логер увімкнено, не кажучи вже про те, що оцінка аргументів може мати значні побічні ефекти, які тепер залежать від конфігурації логування.

Використовуйте спеціальний параметр для запису виключень при використанні генератора виходу на етапі компіляції. Наприклад:

```csharp
var food = "tomato";
var price = 2.99;

try
{
    // Execute some logic

    logger.SayHello(food, price);
}
catch (Exception ex)
{
    logger.SayHelloFailure(ex, food, price);
}

internal static partial class LoggerExtensions
{
    [LoggerMessage(Level = LogLevel.Information, Message = "Hello from {food} {price}.")]
    public static partial void SayHello(this ILogger logger, string food, double price);

    [LoggerMessage(Level = LogLevel.Error, Message = "Could not say hello from {food} {price}.")]
    public static partial void SayHelloFailure(this ILogger logger, Exception exception, string food, double price);
}
```

> [!NOTE]
>
> При використанні генератора джерел під час компіляції перший виявлений параметр `Exception` автоматично отримує спеціальну обробку. Він **НЕ ПОВИНЕН** бути частиною шаблону повідомлення. Детальніше див.: [Анатомія методу журналу](https://learn.microsoft.com/dotnet/core/extensions/logger-message-generator#log-method-anatomy).

Вам слід використовувати спеціальні перевантаження для запису виключень при використанні методів розширення журналювання.

```csharp
var food = "tomato";
var price = 2.99;

try
{
    // Execute some logic

    logger.LogInformation("Hello from {food} {price}.", food, price);
}
catch (Exception ex)
{
    logger.LogError(ex, "Could not say hello from {food} {price}.", food, price);
}
```

Уникайте додавання деталей помилок у шаблон повідомлення. Наприклад:

Вам слід використовувати правильні API `Exception`, оскільки специфікація OpenTelemetry [визначає спеціальні атрибути](/docs/specs/semconv/exceptions/) для деталей `Exception`. Наступні приклади показують, що **НЕ** слід робити. У цих випадках деталі не будуть втрачені, але спеціалізовані атрибути також не будуть додані.

```csharp
var food = "tomato";
var price = 2.99;

try
{
    // Execute some logic

    logger.SayHello(food, price);
}
catch (Exception ex)
{
    logger.SayHelloFailure(food, price, ex.Message);
}

internal static partial class LoggerExtensions
{
    [LoggerMessage(Level = LogLevel.Information, Message = "Hello from {food} {price}.")]
    public static partial void SayHello(this ILogger logger, string food, double price);

    // ПОГАНО — Помилка не повинна бути частиною шаблону повідомлення. Використовуйте спеціальний параметр.
    [LoggerMessage(Level = LogLevel.Error, Message = "Could not say hello from {food} {price} {message}.")]
    public static partial void SayHelloFailure(this ILogger logger, string food, double price, string message);
}
```

```csharp
var food = "tomato";
var price = 2.99;

try
{
    // Execute some logic

    logger.LogInformation("Hello from {food} {price}.", food, price);
}
catch (Exception ex)
{
    // ПОГАНО — Помилка не повинна бути частиною шаблону повідомлення. Використовуйте спеціальний параметр.
    logger.LogError("Could not say hello from {food} {price} {message}.", food, price, ex.Message);
}
```

## LoggerFactory

У багатьох випадках ви можете використовувати [ILogger](#ilogger) без необхідності взаємодіяти безпосередньо з [Microsoft.Extensions.Logging.LoggerFactory](https://learn.microsoft.com/dotnet/api/microsoft.extensions.logging.loggerfactory). Цей розділ призначений для користувачів, яким потрібно явно створювати та керувати `LoggerFactory`.

Уникайте надто частого створення екземплярів `LoggerFactory`, оскільки `LoggerFactory` є досить дорогим і призначений для повторного використання в усій програмі. Для більшості програм достатньо одного екземпляра `LoggerFactory` на процес.

Керуйте життєвим циклом екземплярів [LoggerFactory](https://learn.microsoft.com/dotnet/api/microsoft.extensions.logging.loggerfactory), якщо ви їх створили.

- Якщо ви забудете звільнити екземпляр `LoggerFactory` перед завершенням програми, журнали можуть бути втрачені через відсутність належного скидання.
- Якщо ви звільните екземпляр `LoggerFactory` занадто рано, будь-який подальший виклик API журналювання, повʼязаний з фабрикою журналів, може стати бездіяльним (тобто жоден журнал не буде виведений).

## Кореляція логів {#log-correlation}

В OpenTelemetry журнали автоматично корелюються з [трейсами](/docs/languages/dotnet/traces/). Щоб дізнатися більше, перегляньте підручник [Кореляція журналів](/docs/languages/dotnet/logs/correlation/).

## Фільтрація логів {#log-filtering}

Для більш просунутого фільтрування та вибірки команда .NET має план охопити це в рамках .NET 9. Використовуйте це [runtime issue](https://github.com/dotnet/runtime/issues/82465) для відстеження прогресу або надання відгуків і пропозицій.

## Цензурування логів {#log-redaction}

Журнали можуть містити чутливу інформацію, таку як паролі та номери кредитних карток, тому необхідно провести належне цензурування, щоб запобігти інцидентам з конфіденційністю та безпекою. Перегляньте посібник з [Цензурування логів](/docs/languages/dotnet/logs/redaction/), щоб дізнатися більше.
