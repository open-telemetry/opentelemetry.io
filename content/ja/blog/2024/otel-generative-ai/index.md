---
title: 生成AIのための OpenTelemetry
linkTitle: OTel for GenAI
date: 2024-12-05
author: >-
  [Drew Robbins](https://github.com/drewby) (Microsoft),  [Liudmila
  Molkova](https://github.com/lmolkova) (Microsoft)
issue: https://github.com/open-telemetry/opentelemetry.io/issues/5581
sig: SIG GenAI Observability
crosspost_url: https://www.cncf.io/blog/2025/01/20/opentelemetry-for-generative-ai/
default_lang_commit: 89fe70663d19f375b1566b3688ef25257233cafc
cSpell:ignore: genai liudmila molkova
---

組織が大規模言語モデル（LLM）やその他の生成AI技術をますます導入するにつれて、ユーザーの期待に応え、リソースコストを最適化し、意図しない出力から保護するためには、信頼性の高いパフォーマンス、効率性、安全性を確保することが不可欠です。
AIの動作、振る舞い、結果に対する効果的なオブザーバビリティは、これらの目標達成に役立ちます。
OpenTelemetry は、生成AIに特化したこれらのニーズをサポートするために強化が進められています。

これを実現するために、**セマンティック規約**と**計装ライブラリ**という2つの主要なアセットが開発中です。
最初の計装ライブラリは [OpenAI Python API ライブラリ](https://pypi.org/project/openai/)を対象としています。

[**セマンティック規約**](/docs/concepts/semantic-conventions/)は、テレメトリーデータがプラットフォーム間でどのように構造化・収集されるかについて、入力、出力、運用の詳細を定義する標準化されたガイドラインを確立します。
生成AIにおいて、これらの規約はモデルパラメーター、レスポンスメタデータ、トークン使用量などの属性を標準化することで、AIモデルの監視、トラブルシューティング、最適化を効率化します。
この一貫性により、ツール、環境、API間のオブザーバビリティが向上し、組織がパフォーマンス、コスト、安全性を容易に追跡できるようになります。

[**計装ライブラリ**](/docs/specs/otel/overview/#instrumentation-libraries)は、[OpenTelemetry Python Contrib](https://github.com/open-telemetry/opentelemetry-python-contrib) 内の [instrumentation-genai](https://github.com/open-telemetry/opentelemetry-python-contrib/tree/5560324cff80148de07324715aef5efa1e6242c1/instrumentation-genai?from_branch=main) プロジェクトとして、生成AIアプリケーションのテレメトリー収集を自動化するために開発されています。
最初のリリースは、OpenAI クライアント呼び出しを計装するための Python ライブラリです。
このライブラリはスパンとイベントをキャプチャし、モデル入力、レスポンスメタデータ、トークン使用量などの重要なデータを構造化されたフォーマットで収集します。

## 生成AIのための主要シグナル {#key-signals-for-generative-ai}

[生成AIのためのセマンティック規約](/docs/specs/semconv/gen-ai/)は、3つの主要シグナルを通じてAIモデルの動作に関するインサイトを捉えることに焦点を当てています。
それは[トレース](/docs/concepts/signals/traces/)、[メトリクス](/docs/concepts/signals/metrics/)、[イベント](https://github.com/open-telemetry/opentelemetry-specification/blob/v1.40.0/specification/logs/event-api.md)です。

これらのシグナルを組み合わせることで、包括的な監視フレームワークが提供され、コスト管理、パフォーマンスチューニング、リクエストトレーシングがより効果的になります。

### トレース：モデルインタラクションのトレーシング {#traces-tracing-model-interactions}

トレースは、入力パラメーター（たとえば、temperature、top_p）やトークン数やエラーなどのレスポンス詳細をカバーして、各モデルインタラクションのライフサイクルを追跡します。
トレースにより各リクエストの可視性が得られ、ボトルネックの特定やモデル出力に対する設定の影響分析に役立ちます。

### メトリクス：使用量とパフォーマンスの監視 {#metrics-monitoring-usage-and-performance}

メトリクスは、リクエスト量、レイテンシー、トークン数などの高レベルな指標を集約し、コストとパフォーマンスの管理に不可欠です。
このデータは、レート制限やコストの考慮事項がある API 依存の AI アプリケーションにとって特に重要です。

### イベント：詳細なインタラクションのキャプチャ {#events-capturing-detailed-interactions}

イベントは、ユーザープロンプトやモデルのレスポンスなど、モデル実行中の詳細な瞬間を記録し、モデルインタラクションのきめ細かなビューを提供します。
これらのインサイトは、予期しない動作が発生する可能性のある AI アプリケーションのデバッグと最適化において非常に価値があります。

> [!NOTE]
>
> 生成AIのセマンティック規約では、[Logs API](/docs/specs/otel/logs/api/) 仕様を使用して[イベントを発行する][events emitted]ことを決定しました。
> イベントにより、キャプチャするユーザープロンプトとモデルレスポンスに対する特定の[セマンティック規約](/docs/specs/semconv/general/events/)を定義できます。
> この API への追加機能は開発中であり、不安定と見なされています。

[events emitted]: https://github.com/open-telemetry/opentelemetry-specification/blob/v1.40.0/specification/logs/api.md#emit-an-event

### ベンダー固有の属性によるオブザーバビリティの拡張 {#extending-observability-with-vendor-specific-attributes}

セマンティック規約は、OpenAI や Azure Inference API などのプラットフォーム向けにベンダー固有の属性も定義しており、テレメトリーが汎用的な詳細とプロバイダー固有の詳細の両方をキャプチャできるようにしています。
この柔軟性により、マルチプラットフォームの監視とより深いインサイトが可能になります。

## OpenAI 向け Python 計装ライブラリの構築 {#building-the-python-instrumentation-library-for-openai}

この OpenTelemetry 用の Python ベースライブラリは、OpenAI モデルの主要なテレメトリーシグナルをキャプチャし、AI ワークロードに特化したすぐに使えるオブザーバビリティソリューションを開発者に提供します。
[OpenTelemetry Python Contrib リポジトリ内でホストされている](https://github.com/open-telemetry/opentelemetry-python-contrib/tree/opentelemetry-instrumentation-openai-v2%3D%3D2.0b0/instrumentation-genai/opentelemetry-instrumentation-openai-v2)このライブラリは、リクエストとレスポンスのメタデータやトークン使用量を含む OpenAI モデルインタラクションからテレメトリーを自動的に収集します。

生成AIアプリケーションが成長するにつれて、他の言語向けの追加の計装ライブラリが続き、より多くのツールや環境にわたって OpenTelemetry のサポートが拡張されます。
現在のライブラリが OpenAI に焦点を当てているのは、AI 開発におけるその人気と需要を反映しており、価値ある最初の実装となっています。

### 使用例 {#example-usage}

以下は、OpenTelemetry Python ライブラリを使用して OpenAI クライアントで生成AIアプリケーションを監視する例です。

OpenTelemetry の依存関係をインストールします。

```shell
pip install opentelemetry-distro
opentelemetry-bootstrap -a install
```

以下の環境変数を設定し、エンドポイントとプロトコルを適切に更新してください。

```shell
OPENAI_API_KEY=<replace_with_your_openai_api_key>

OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf
OTEL_SERVICE_NAME=python-opentelemetry-openai
OTEL_LOGS_EXPORTER=otlp_proto_http
# ログイベントを無効にするにはfalseに設定するか削除してください
OTEL_INSTRUMENTATION_GENAI_CAPTURE_MESSAGE_CONTENT=true
```

次に、Python アプリケーションに以下のコードを含めます。

```python
import os
from openai import OpenAI

client = OpenAI()
chat_completion = client.chat.completions.create(
    model=os.getenv("CHAT_MODEL", "gpt-4o-mini"),
    messages=[
        {
            "role": "user",
            "content": "Write a short poem on OpenTelemetry.",
        },
    ],
)
print(chat_completion.choices[0].message.content)
```

そして `opentelemetry-instrument` を使用して例を実行します。

```shell
opentelemetry-instrument python main.py
```

テレメトリーを収集するサービスが稼働していない場合は、以下のようにコンソールにエクスポートできます。

```shell
opentelemetry-instrument --traces_exporter console --metrics_exporter console python main.py
```

完全な例が[こちらで利用可能](https://github.com/open-telemetry/opentelemetry-python-contrib/tree/fecd8afac9ecc3fdc0d581fbaad2e063a2f8018d/instrumentation-genai/opentelemetry-instrumentation-openai-v2/examples?from_branch=main)です。

このシンプルな計装により、生成AIアプリケーションからトレースのキャプチャを開始できます。
以下は、ローカルデバッグ用の [Aspire Dashboard](https://learn.microsoft.com/dotnet/aspire/fundamentals/dashboard/standalone?tabs=bash) からの例です。

Jaeger を起動するには、以下の `docker` コマンドを実行し、ウェブブラウザで `localhost:18888` を開きます。

```shell
docker run --rm -it -d -p 18888:18888 -p 4317:18889 -p 4318:18890 --name aspire-dashboard mcr.microsoft.com/dotnet/aspire-dashboard:9.0
```

![Aspire Dashboard でのチャットトレース](aspire-dashboard-trace.png)

以下は [Jaeger](https://www.jaegertracing.io/docs/getting-started/#all-in-one) でキャプチャされた同様のトレースです。

Jaeger を起動するには、以下の `docker` コマンドを実行し、ウェブブラウザで `localhost:16686` を開きます。

```shell
docker run --rm -it -d -p 16686:16686 -p 4317:4317 -p 4318:4318 --name jaeger jaegertracing/all-in-one:latest
```

![Jaeger でのチャットトレース](jaeger-trace.png)

デバッグやアプリケーションの改善のために、チャットのコンテンツ履歴をキャプチャすることも簡単です。
環境変数 `OTEL_INSTRUMENTATION_GENAI_CAPTURE_MESSAGE_CONTENT` を以下のように設定するだけです。

```shell
export OTEL_INSTRUMENTATION_GENAI_CAPTURE_MESSAGE_CONTENT=True
```

これによりコンテンツキャプチャが有効になり、ペイロードを含む OpenTelemetry イベントが収集されます。

![Aspire Dashboard でのコンテンツキャプチャ](aspire-dashboard-content-capture.png)

## 生成AIオブザーバビリティの未来を一緒に形作りましょう {#join-us-in-shaping-the-future-of-generative-ai-observability}

コミュニティのコラボレーションは OpenTelemetry の成功の鍵です。
開発者、AI 実践者、組織の皆さんに、コントリビューション、フィードバックの共有、ディスカッションへの参加を呼びかけます。
OpenTelemetry Python Contrib プロジェクトを探索し、コードをコントリビューションし、進化し続ける AI のオブザーバビリティの形成にご協力ください。

現在、[Amazon](https://aws.amazon.com/)、[Elastic](https://www.elastic.co/)、[Google](https://www.google.com/)、[IBM](https://www.ibm.com)、[Langtrace](https://www.langtrace.ai/)、[Microsoft](https://www.microsoft.com/)、[OpenLIT](https://openlit.io/)、[Scorecard](https://www.scorecard.io/)、[Traceloop](https://www.traceloop.com/) など、多くのコントリビューターが参加しています。

コミュニティへの参加を歓迎します。
詳細は[生成AIオブザーバビリティプロジェクトページ](https://github.com/open-telemetry/community/blob/5125996b5d159ff9aaa906f9a25226a821dc7bed/projects/gen-ai.md?from_branch=main)をご覧ください。

_この記事のバージョンは [CNCF ブログにも掲載][appears on the CNCF blog]されています。_

[appears on the CNCF blog]: <{{% param crosspost_url %}}>
