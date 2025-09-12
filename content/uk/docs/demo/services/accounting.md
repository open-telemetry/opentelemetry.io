---
title: Сервіс Бухгалтерії
linkTitle: Бухгалтерія
aliases: [accountingservice]
default_lang_commit: e05fefe6c9f7d8b159d9a9a95128098c646c78c4
---

Цей сервіс обчислює загальну суму проданих продуктів. Це лише імітація, і отримані замовлення виводяться на екран.

[Сервіс Бухгалтерії](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/accounting/)

## Авто-інструментування {#auto-instrumentation}

Цей сервіс використовує автоматичне інструментування OpenTelemetry .NET для автоматичного інструментування бібліотек, таких як Kafka, і для налаштування SDK OpenTelemetry. Інструментування додається через пакет Nuget [OpenTelemetry.AutoInstrumentation](https://www.nuget.org/packages/OpenTelemetry.AutoInstrumentation) і активується за допомогою змінних середовища, які отримуються з `instrument.sh`. Використання цього підходу до встановлення також гарантує, що всі залежності інструментування правильно узгоджені з застосунком.

## Публікація {#publishing}

Додайте `--use-current-runtime` до команди `dotnet publish`, щоб розповсюдити відповідні компоненти рідного середовища виконання.

```sh
dotnet publish "./AccountingService.csproj" --use-current-runtime -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false
```
