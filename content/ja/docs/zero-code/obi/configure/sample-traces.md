---
title: OBI で OpenTelemetry トレースのサンプリングを設定する
linkTitle: トレースのサンプリング
description: OpenTelemetry トレースのサンプリング方法を設定する
weight: 70
default_lang_commit: 055e4933b5a29eb283300a071158d7caa0542b1c
---

> [!NOTE]
>
> このページでは Config v1 のフィールド名と例を使用しています。
> Config v2 では、トップレベルの `tracer_provider.sampler` フィールドでサンプリングを設定します。
> 詳細は [Config v2 リファレンス](/docs/zero-code/obi/configure/config-v2/)を参照してください。
> 既存のファイルを変換するには、[移行ガイド](/docs/zero-code/obi/configure/migrate-to-config-v2/)を使用してください。

OBI は、トレースのサンプリングレートを設定するために標準的な OpenTelemetry 環境変数を受け付けます。

YAML セクション: `otel_traces_export.sampler`

このコンポーネントは、YAML 設定の `otel_traces_export.sampler` セクション、または環境変数で設定できます。

```yaml
otel_traces_export:
  sampler:
    name: 'traceidratio'
    arg: '0.1'
```

| YAML<p>環境変数</p>                   | 説明                                                                                                                                                                                                                            | 型     | デフォルト              |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ----------------------- |
| `name`<p>`OTEL_TRACES_SAMPLER`</p>    | サンプラーの名前を指定します。[OpenTelemetry の仕様](/docs/languages/sdk-configuration/general/#otel_traces_sampler)で定義されている標準的なサンプラー名を受け付けます。詳細は[サンプラー名](#sampler-name)を参照してください。 | string | `parentbased_always_on` |
| `arg`<p>`OTEL_TRACES_SAMPLER_ARG`</p> | 選択したサンプラーの引数を指定します。引数が必要なのは `traceidratio` と `parentbased_traceidratio` のみです。詳細は[サンプラー引数](#sampler-argument)を参照してください。                                                     | string | (未設定)                |

## サンプラー名 {#sampler-name}

`name` プロパティは以下の標準的なサンプラー名を受け付けます。

- `always_on`: すべてのトレースをサンプリングします。
  トラフィックの多いアプリケーションでこのサンプラーを使用する場合は注意してください。
  リクエストごとに新しいトレースが開始され、エクスポートされます。
- `always_off`: トレースをまったくサンプリングしません。
- `traceidratio`: 指定された割合(`arg` プロパティで指定)でトレースをサンプリングします。
  割合は 0 から 1 の間の実数値でなければなりません。
  たとえば `"0.5"` という値は 50% のトレースをサンプリングします。
  1 以上の割合は常にサンプリングします。
  0 未満の割合はゼロとして扱われます。
  親トレースのサンプリング設定を尊重するには、`parentbased_traceidratio` サンプラーを使用してください。
- `parentbased_always_on` (デフォルト): `always_on` サンプラーの親ベース版です。
- `parentbased_always_off`: `always_off` サンプラーの親ベース版です。
- `parentbased_traceidratio`: `traceidratio` サンプラーの親ベース版です。

親ベースのサンプラーは、トレースされるスパンの親に応じて異なる動作をする複合サンプラーです。
スパンに親がない場合、ルートサンプラーがサンプリングの判断に使用されます。
スパンに親がある場合、サンプリング設定は親スパンに依存します。

## サンプラー引数 {#sampler-argument}

`arg` プロパティは、選択したサンプラーの引数を指定します。
引数が必要なのは `traceidratio` と `parentbased_traceidratio` のみです。

YAML ではこの値を必ず文字列として指定してください。
値が数値であっても、YAML ファイル内では引用符で囲んでください(たとえば、`arg: "0.25"`)。
