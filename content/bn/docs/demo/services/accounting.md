---
title: হিসাবরক্ষণ সার্ভিস
linkTitle: হিসাবরক্ষণ
aliases: [accountingservice]
default_lang_commit: 98a528997da383a8e152021f920ce510572b1b87
drifted_from_default: true
---

এই সার্ভিসটি বিক্রি হওয়া পণ্যের মোট পরিমাণ হিসাব করে। এটি কেবলমাত্র মকড (নকল) এবং প্রাপ্ত অর্ডারগুলো কনসোলে প্রিন্ট করে থাকে।

[হিসাবরক্ষণ সার্ভিস](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/accounting/)

## স্বয়ংক্রিয় ইন্সট্রুমেন্টেশন (#auto-instrumentation)

এই সার্ভিসটি OpenTelemetry .NET-এর অটোমেটিক ইন্সট্রুমেন্টেশনের উপর নির্ভরশীল, যা Kafka-এর মতো লাইব্রেরিগুলোকে স্বয়ংক্রিয়ভাবে ইন্সট্রুমেন্ট করে এবং OpenTelemetry SDK কনফিগার করে। ইন্সট্রুমেন্টেশনটি Nuget প্যাকেজ
[OpenTelemetry.AutoInstrumentation](https://www.nuget.org/packages/OpenTelemetry.AutoInstrumentation)
এর মাধ্যমে যোগ করা হয় এবং `instrument.sh` ব্যবহার করে এনভায়রনমেন্ট ভেরিয়েবলগুলো সক্রিয় করা হয়।
এই ইনস্টলেশন পদ্ধতি ব্যবহার করলে সব ইন্সট্রুমেন্টেশন ডিপেন্ডেন্সি, অ্যাপ্লিকেশনের সাথে সঠিকভাবে সামঞ্জস্যপূর্ণ থাকে।

## প্রকাশনা (#publishing)

উপযুক্ত নেটিভ রানটাইম কম্পোনেন্ট বিতরণের জন্য `dotnet publish` কমান্ডে `--use-current-runtime` যুক্ত করুন।

```sh
dotnet publish "./AccountingService.csproj" --use-current-runtime -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false
```
