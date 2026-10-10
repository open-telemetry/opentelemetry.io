---
title: ログのリダクション
linkTitle: リダクション
description: 機密データに対するログのリダクションを実装する方法を学ぶ
weight: 60
default_lang_commit: f1a074a1d8dc390c2abcac98ad671f38d0c73d88
---

このガイドでは、OpenTelemetry .NET のログにおける機密情報のリダクションを実装する方法を説明します。
リダクションは、個人を特定できる情報（PII）、認証情報、その他の機密情報などのデータを保護するための重要なプラクティスです。

## なぜログをリダクションするのか {#why-redact-logs}

ログから機密情報をリダクションすることは、以下の観点から不可欠です。

1. **コンプライアンス**: GDPR、HIPAA、PCI DSS などの規制要件への準拠
2. **セキュリティ**: ログファイルやログ管理システムにおける機密データの露出防止
3. **プライバシー**: 個人を特定できる情報（PII）を除去することによるユーザープライバシーの保護
4. **リスク低減**: ログデータの潜在的な漏洩による影響の最小化

## 基本的なリダクションプロセッサーの実装 {#implementing-a-basic-redaction-processor}

OpenTelemetry では、ログレコードがエクスポートされる前にそれを変更できるカスタムプロセッサーを作成できます。
基本的なリダクションプロセッサーの作成方法は次のとおりです。

```csharp
using System.Collections;
using OpenTelemetry;
using OpenTelemetry.Logs;

internal sealed class MyRedactionProcessor : BaseProcessor<LogRecord>
{
    public override void OnEnd(LogRecord logRecord)
    {
        if (logRecord.Attributes != null)
        {
            logRecord.Attributes = new MyClassWithRedactionEnumerator(logRecord.Attributes);
        }
    }

    internal sealed class MyClassWithRedactionEnumerator : IReadOnlyList<KeyValuePair<string, object?>>
    {
        private readonly IReadOnlyList<KeyValuePair<string, object?>> state;

        public MyClassWithRedactionEnumerator(IReadOnlyList<KeyValuePair<string, object?>> state)
        {
            this.state = state;
        }

        public int Count => this.state.Count;

        public KeyValuePair<string, object?> this[int index]
        {
            get
            {
                var item = this.state[index];
                var entryVal = item.Value?.ToString();
                if (entryVal != null && entryVal.Contains("<secret>"))
                {
                    return new KeyValuePair<string, object?>(item.Key, "***REDACTED***");
                }

                return item;
            }
        }

        public IEnumerator<KeyValuePair<string, object?>> GetEnumerator()
        {
            for (var i = 0; i < this.Count; i++)
            {
                yield return this[i];
            }
        }

        IEnumerator IEnumerable.GetEnumerator()
        {
            return this.GetEnumerator();
        }
    }
}
```

このプロセッサーは各ログ属性の値をチェックし、文字列 "<secret>" を含む値を "**_REDACTED_**" に置き換えます。

## リダクションプロセッサーの使用 {#using-the-redaction-processor}

リダクションプロセッサーを使用するには、OpenTelemetry のログ設定に追加します。

```csharp
using Microsoft.Extensions.Logging;
using OpenTelemetry.Logs;

// MyRedactionProcessor は別の場所で定義されていると仮定する
// public class MyRedactionProcessor : BaseProcessor<LogRecord> { ... }

var loggerFactory = LoggerFactory.Create(builder =>
{
    builder.AddOpenTelemetry(logging =>
    {
        logging.AddProcessor(new MyRedactionProcessor());
        logging.AddConsoleExporter();
    });
});

var logger = loggerFactory.CreateLogger<Program>();
// メッセージは MyRedactionProcessor によってリダクションされる
logger.FoodPriceChanged("", 9.99);

loggerFactory.Dispose();
```

このコードを実行すると、"<secret>" を含むすべてのログ属性が出力内でリダクションされます。

## 高度なリダクション戦略 {#advanced-redaction-strategies}

実際のアプリケーションでは、SDK または OTel Collector プロセッサーを使用した、より洗練されたリダクション戦略が必要になります。

SDK を使用するアプローチをいくつか紹介します。

### 1. 正規表現によるパターンマッチング {#1-pattern-matching-with-regular-expressions}

```csharp
public KeyValuePair<string, object?> this[int index]
{
    get
    {
        var item = this.state[index];
        var entryVal = item.Value?.ToString();
        if (entryVal != null)
        {
            // クレジットカード番号をリダクションする
            var redactedValue = Regex.Replace(
                entryVal,
                @"\b(?:\d{4}[-\s]?){3}\d{4}\b",
                "***CARD-REDACTED***");

            // メールアドレスをリダクションする
            redactedValue = Regex.Replace(
                redactedValue,
                @"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b",
                "***EMAIL-REDACTED***");

            if (redactedValue != entryVal)
            {
                return new KeyValuePair<string, object?>(item.Key, redactedValue);
            }
        }

        return item;
    }
}
```

### 2. フィールドベースのリダクション {#2-field-based-redaction}

内容に関係なく、特定のフィールド名をリダクションしたい場合があります。

```csharp
public KeyValuePair<string, object?> this[int index]
{
    get
    {
        var item = this.state[index];

        // フィールド名に基づいて機密フィールドをリダクションする
        var sensitiveFields = new[] { "password", "ssn", "creditcard", "api_key" };
        if (sensitiveFields.Any(field => item.Key.Contains(field, StringComparison.OrdinalIgnoreCase)))
        {
            return new KeyValuePair<string, object?>(item.Key, "***REDACTED***");
        }

        return item;
    }
}
```

### 3. 部分的なリダクション {#3-partial-redaction}

一部のデータ型では、値の一部を表示したい場合があります。

```csharp
public KeyValuePair<string, object?> this[int index]
{
    get
    {
        var item = this.state[index];
        var entryVal = item.Value?.ToString();

        if (item.Key.Equals("email", StringComparison.OrdinalIgnoreCase) && entryVal != null)
        {
            var parts = entryVal.Split('@');
            if (parts.Length == 2)
            {
                // ユーザー名の最初の文字とドメインを表示する
                var redactedEmail = $"{parts[0][0]}***@{parts[1]}";
                return new KeyValuePair<string, object?>(item.Key, redactedEmail);
            }
        }

        return item;
    }
}
```

## ASP.NET Core との統合 {#integration-with-aspnet-core}

ASP.NET Core アプリケーションでは、リダクションプロセッサーを次のように統合できます。

```csharp
builder.Services.AddOpenTelemetry()
    .WithLogging(logging =>
    {
        logging.AddProcessor(new MyRedactionProcessor());
        logging.AddConsoleExporter();
    });
```

## さらに詳しく {#learn-more}

- [.NET の正規表現](https://learn.microsoft.com/dotnet/standard/base-types/regular-expressions)
