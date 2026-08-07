---
title: 会計サービス
linkTitle: 会計
aliases: [accountingservice]
default_lang_commit: 119208cc7b365e78d78be27a7c2d507650c73f7d
---

このサービスは、販売された商品の合計金額を計算します。
この計算は現在モックされており、受注した注文が出力されます。
Kafka からレコードを取得すると、データベース（PostgreSQL）に保存されます。

[Accounting Service](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/accounting/)

## 自動計装 {#auto-instrumentation}

このサービスは、Kafka などのライブラリを自動的に計装し、OpenTelemetry SDK を設定するために、OpenTelemetry .NET Automatic Instrumentation に依存しています。
計装は NuGet パッケージ [OpenTelemetry.AutoInstrumentation](https://www.nuget.org/packages/OpenTelemetry.AutoInstrumentation) を通じて追加され、`instrument.sh` から取得される環境変数によって有効化されます。
このインストール方法を使用することで、すべての計装の依存関係がアプリケーションと適切に整合されることも保証されます。

## パブリッシング {#publishing}

適切なネイティブランタイムコンポーネントを配布するために、`dotnet publish` コマンドに `--use-current-runtime` を追加してください。

```sh
dotnet publish "./AccountingService.csproj" --use-current-runtime -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false
```
