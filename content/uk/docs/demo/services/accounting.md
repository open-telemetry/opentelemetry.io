---
title: Сервіс Бухгалтерії
linkTitle: Бухгалтерія
aliases: [accountingservice]
default_lang_commit: 624a5ad2ea3c8f07660370aab626532469f946a3
---

Цей сервіс обчислює загальну суму проданих продуктів. На даний момент цей розрахунок імітується, а отримані замовлення роздруковуються. Після отримання запису з Kafka він зберігається в базі даних (PostgreSQL).

[Сервіс Бухгалтерії](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/accounting/)

## Авто-інструментування {#auto-instrumentation}

Цей сервіс використовує автоматичне інструментування OpenTelemetry .NET для автоматичного інструментування бібліотек, таких як Kafka, і для налаштування SDK OpenTelemetry. Інструментування додається через пакет Nuget [OpenTelemetry.AutoInstrumentation](https://www.nuget.org/packages/OpenTelemetry.AutoInstrumentation) і активується за допомогою змінних середовища, які отримуються з `instrument.sh`. Використання цього підходу до встановлення також гарантує, що всі залежності інструментування правильно узгоджені з застосунком.

## Публікація {#publishing}

Додайте `--use-current-runtime` до команди `dotnet publish`, щоб розповсюдити відповідні компоненти рідного середовища виконання.

```sh
dotnet publish "./AccountingService.csproj" --use-current-runtime -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false
```
