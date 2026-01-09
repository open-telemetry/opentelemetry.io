---
title: '宣言的設定のジャーニー: トレースにおけるヘルスチェックエンドポイントを無視するのに5年かかった理由'
linkTitle: 宣言的設定のジャーニー
date: 2025-10-20
author: >-
  [Gregor Zeitlinger](https://github.com/zeitlinger)(Grafana Labs), [Jay
  DeLuca](https://github.com/jaydeluca) (Grafana Labs), [Marylia
  Gutierrez](https://github.com/maryliag) (Grafana Labs)
default_lang_commit: 2e0c4fbe87eeefebb416874d28b8d332ab91b4a6
drifted_from_default: true
cSpell:ignore: Dotel marylia otelconf zeitlinger
---

過去数年間にわたり、Java OpenTelemetryに対する最も持続的に人気のある機能リクエストのひとつは、効率的に[ヘルスチェックエンドポイントのスパンをドロップする][drop-spans-issue]（またはその他の価値が低くコストのかかるエンドポイントをドロップする）機能でした。
このイシューは2020年8月に最初に提起されましたが、驚くほど長い間、包括的なソリューションは見つかりませんでした。
なぜこの一見単純な問題を解決するのに5年もかかったのでしょうか？
その答えは、OpenTelemetryの設定システムの基本原則と、より堅牢で柔軟なアプローチである宣言的設定へのジャーニーにあります。

OpenTelemetryは、当初から設定のために環境変数に依存していました。
これは環境変数が言語を問わず普遍的に利用可能であり、解析が容易であるという理由からの選択でした。
しかし、より複雑な設定のユースケースの必要性が高まるにつれて、単純な文字列ベースの環境変数の制限がますます明らかになり、高度な設定の管理が煩雑かつ困難になりました。

宣言的設定の導入は、YAMLファイルを活用してOpenTelemetryの設定を定義する強力な進化です。
この変化により、任意のツリー構造のソースからデータを読み取ることが可能になり、複雑な設定へのアプローチが根本的に変わります。
このポストを通じて、宣言的設定が過去の課題に対してどのようにエレガントなソリューションを提供するかを探り、Javaにおけるヘルスチェック除外などの実用的なユースケースでその即時的な影響を示します。

## はじめに {#getting-started}

設定ファイルは言語に依存しないため、一度ファイルを作成すれば、すべてのSDKで使用できます。
唯一の例外は、特定の言語名を持ち、その言語にのみ関連するパラメータです（たとえば`instrumentation/development.java.spring_batch`パラメータ）。

宣言的設定は **実験的** であるため、まだ変更される可能性があることに注意してください。

次の例は、開始するために使用できる基本的な設定ファイルです。

```yaml
file_format: '1.0-rc.1'

resource:
  attributes_list: ${OTEL_RESOURCE_ATTRIBUTES}
  detection/development:
    detectors:
      - service: # OTEL_SERVICE_NAMEから"service.instance.id"と"service.name"を追加します

tracer_provider:
  processors:
    - batch:
        exporter:
          otlp_http:
            endpoint: ${OTEL_EXPORTER_OTLP_TRACES_ENDPOINT:-http://localhost:4318/v1/traces}

meter_provider:
  readers:
    - periodic:
        exporter:
          otlp_http:
            endpoint: ${OTEL_EXPORTER_OTLP_METRICS_ENDPOINT:-http://localhost:4318/v1/metrics}

logger_provider:
  processors:
    - batch:
        exporter:
          otlp_http:
            endpoint: ${OTEL_EXPORTER_OTLP_LOGS_ENDPOINT:-http://localhost:4318/v1/logs}
```

実験的な宣言的設定オプションを有効にするには、アプリケーションに`OTEL_EXPERIMENTAL_CONFIG_FILE=/path/to/otel-config.yaml`を渡すだけです。
この変数は、執筆時点ではJavaエージェントとJavaScriptでのみ機能します。

## Javaにおける宣言的設定 {#declarative-config-in-java}

それでは、Javaエコシステム内での宣言的設定のより幅広い実装を見てみましょう。
この分野の先駆的な言語としてJavaエージェント2.21+は現在、宣言的設定を完全にサポートしており、ほとんどの計装と機能がすでに動作しています。
残りの機能を2026年中に組み込むよう取り組んでおり、[プロジェクトボード][java-project]で進捗を追跡し、[まだサポートされていない機能のリスト][list-not-supported]を参照できます。

新規に始めるか、環境変数を使用して移行するかに応じて、活用できるリソースがいくつかあります。

- 前のセクションの基本的な（言語に依存しない）設定ファイルの例は、それ以上のカスタマイズが不要な場合に最も迅速に開始する方法です。
- [移行設定ファイル][migration-file]は、古い環境変数をYAMLスキーマにマッピングし、環境変数がすでに設定されているワークロードのドロップイン置換を可能にします。
- [完全な設定ファイル][full-file]（「キッチンシンク」）は、ドキュメントがコメントとしてアノテーションされた完全なスキーマを示しています。
  これは、利用可能なすべてのオプションとそのデフォルトを確認したいユーザーに役立ちます。

上記のファイルはすべて、宣言的設定をサポートする任意の言語で機能します。

さらに、設定ファイルの計装セクションにはJavaエージェントに特有の多くの設定があります。
たとえば、アプリケーションにシステムプロパティ`otel.instrumentation.spring-batch.experimental.chunk.new-trace`がある場合、`otel.instrumentation`接頭辞を削除し、.で分割し、-を\_に変換することで、宣言的ファイルを作成できます。

```yaml
file_format: '1.0-rc.1'

# ...

instrumentation/development:
  java:
    spring_batch:
      experimental:
        chunk:
          new_trace: true
```

この設定により、開発者は通常どおりJava計装を使用し続け、選択したオブザーバビリティバックエンドにテレメトリーデータを送信できます。
さらに、宣言的ファイルは必要に応じてパラメータを拡張および追加する柔軟性を提供し、オブザーバビリティ設定を高度にカスタマイズおよび細かく制御できます。

## ヘルスチェックの除外 {#health-check-exclusion}

冒頭で述べたように、Javaコミュニティで最も人気のある機能リクエストのひとつは、ヘルスチェック（またはその他の重要でない、またはノイズの多いリソース）をトレースの生成から除外できるようにすることでした。

これを実現するには、以下に示すように`tracer_provider`設定内に新しい`sampler`ブロックを追加する必要があります。

```yaml
file_format: '1.0-rc.1'

# ... 残りの構成 ...

tracer_provider:
  # ヘルスチェックエンドポイントを除外するためのサンプリングを構成します。
  sampler:
    rule_based_routing:
      fallback_sampler:
        always_on:
      span_kind: SERVER
      rules:
        # ルールが一致した場合に実行するアクション。DROPまたはRECORD_AND_SAMPLEである必要があります。
        - action: DROP
          # 一致させるスパン属性。
          attribute: url.path
          # span属性と比較するパターン。
          pattern: /actuator.*
# ... 残りのtrace_provider設定 ...
```

使用可能なオプションの詳細については、[Javaサンプラーのドキュメント][java-sampler]を参照してください。

ぜひご自身で試してみてください。

1. [完全な設定][complete-config]を保存
2. Javaエージェントを`-Dotel.experimental.config.file=/path/to/otel-config.yaml`で実行

## 可用性 {#availability}

宣言的設定について読んだ後、どこで利用できるのか、そしてどのように使い始めることができるのか疑問に思うかもしれません。
開始方法とサポートされている言語についてのガイダンスは、[ドキュメント][declarative-docs]で見つけることができます。
このポスト執筆時点では、Javaは完全に準拠しており、PHP、JavaScript、Goは部分的に準拠しています。
最新のステータスを確認するには、[コンプライアンスマトリックス][compliance-matrix]または
[言語実装の追跡イシュー][tracking-issue]を確認してください。

### Java {#java}

前述の通り、[Java][java-declarative-config]の宣言的設定は実験的ですが、すぐに使用できます。
先ほど説明した例を使用して、新しい設定をセットアップしてください。
ご質問やフィードバックがある場合は、CNCF Slackの[`#otel-java`][slack-java]でお問い合わせください。

_他の言語メンテナーへの注意: 宣言的設定と環境変数を共通インターフェースに適応させるブリッジモジュールを作成することが有用です。
Javaの場合、これは[宣言的設定ブリッジ][java-bridge]です。_

### JavaScript {#javascript}

JavaScriptのSDK実装は、現在開発中です。
[opentelemetry-configuration][js-package]という新しいパッケージが作成されており、環境変数と宣言的設定の両方を処理します。
このアプローチにより、新しいパッケージが両方を処理し、両方のケースで同じ設定モデルを返すため、ユーザーは環境変数と設定ファイルの間で切り替えるときに計装を変更する必要がありません。
現在、この設定パッケージは他の計装パッケージに追加されており、宣言的設定を活用できます。
ご質問がある場合は、CNCF Slackの[`#otel-js`][slack-js]でお問い合わせください。

### PHP {#php}

PHP実装は部分的に準拠しており、[設定ファイルから初期化する][php-docs]ことで使用を開始できます。
ヘルプやフィードバックについては、CNCF Slackの[`#otel-php`][slack-php]でお問い合わせください。

### Go {#go}

Goには、宣言的設定の[部分的な実装][go-package]があります。
サポートされている各スキーマバージョンごとに対応するパッケージディレクトリが存在します。
たとえば、`go.opentelemetry.io/contrib/otelconf/v0.3.0`をインポートすると、設定スキーマのバージョン0.3.0をサポートするコードが得られます。
利用可能なすべてのバージョンは、[パッケージインデックス][go-package-index]で確認できます。
使用方法について質問がある場合は、CNCF Slackの[`#otel-go`][slack-go]でお問い合わせください。

## ジャーニー {#the-journey}

では、なぜ実際にトレースでヘルスチェックエンドポイントを無視するのに5年もかかったのでしょうか？

宣言的設定へのジャーニー、そしてそれに続くヘルスチェック除外のソリューションは、厳格な仕様を通じて持続可能なソリューションを構築するというOpenTelemetryの中心的な原則を強調しています。

OpenTelemetryは当初から環境変数に依存していましたが、普遍的に利用可能である一方で、高度な設定にはますます複雑になることが判明しました。
新しい環境変数は最終的に許可されなくなり、より堅牢なソリューションで埋める必要のある空白が生まれました。

このブログ投稿で紹介したように、その代替は宣言的設定です。
正確な構文とセマンティクスを作成し、合意に達することは時間がかかり、時には疲れ果ててしまうプロセスでした。
たとえば、環境変数を埋め込む方法についていくつかの提案を議論し、現在の
`${OTEL_EXPORTER_OTLP_ENDPOINT:-http://localhost:4318}`を使用するソリューションにたどり着きました。

このプロセスは、OpenTelemetryコミュニティがどのように機能するかの強力なケーススタディとして役立ちます。
これは、コンセンサスを確立し、コラボレーションを促進し、多様なプロジェクトを横断して重要な新機能を導入して実装を推進するために必要な集団的努力の証です。

## 今後の宣言的設定 {#whats-next-for-declarative-configuration}

宣言的設定のジャーニーはまだ終わっていません。
私たちは現在、言語サポートの拡張に注力しており、これは開発者が好みのツールに関係なく宣言的アプローチの利点を活用できるようにするために重要です。

私たちはこれらの機能の開発と改良を続けるなかで、ユーザーフィードバックに強い関心を持っています。
現在の実装を試してみて、不足している機能、問題点、改善の余地があれば積極的に伝えてください。
この協力的なアプローチにより、開発の優先順位を決定するのに役立ち、私たちが構築するソリューションがコミュニティのニーズを真に満たすことを保証します。
CNCF Slackの[`#otel-config-file`][slack-config]チャンネルを使用して、フィードバックや質問を共有してください。

フィードバックを提供する以外にも、宣言的設定の成長に関与して貢献する方法は他にもあります。
各OpenTelemetry SDKには、その実装に特化した[Special Interest Groups (SIGs)][sigs]があります。
これらのSIGに参加することで、開発の現状を理解し、議論に参加し、貢献する機会を特定する直接的な手段が得られます。
コードの貢献、ドキュメントの改善、または単に経験を共有するなど、さまざまな貢献が宣言的設定エコシステムの発展に役立ちます。
あなたの積極的な参加は、現代のアプリケーション開発のための堅牢で多目的なツールセットを育成する鍵となります。

私たちはあなたを待っています！

## 追加リソース {#additional-resources}

宣言的設定に関する作業について詳しく知るには、以下の追加リソースを参照してください。

- [Simplifying OpenTelemetry with Configuration - Alex Boten, Honeycomb & Jack
  Berg, New Relic][yt-config]
- [宣言的設定のドキュメント](/docs/languages/sdk-configuration/declarative-configuration/)
- [宣言的設定のリポジトリ][declarative-repo]

[drop-spans-issue]: https://github.com/open-telemetry/opentelemetry-java-instrumentation/issues/1060
[java-project]: https://github.com/orgs/open-telemetry/projects/151
[migration-file]: https://github.com/open-telemetry/opentelemetry-configuration/blob/main/examples/sdk-migration-config.yaml
[full-file]: https://github.com/open-telemetry/opentelemetry-configuration/blob/main/examples/kitchen-sink.yaml
[java-sampler]: https://github.com/open-telemetry/opentelemetry-java-contrib/tree/main/samplers
[complete-config]: https://gist.github.com/zeitlinger/09585b1ab57c454f87e6dcb9a6f50a5c
[declarative-docs]: /docs/languages/sdk-configuration/declarative-configuration
[compliance-matrix]: https://github.com/open-telemetry/opentelemetry-specification/blob/main/spec-compliance-matrix.md#declarative-configuration
[java-declarative-config]: /docs/zero-code/java/agent/declarative-configuration/
[slack-java]: https://cloud-native.slack.com/archives/C014L2KCTE3
[slack-js]: https://cloud-native.slack.com/archives/C01NL1GRPQR
[slack-php]: https://cloud-native.slack.com/archives/C01NFPCV44V
[slack-go]: https://cloud-native.slack.com/archives/C01NPAXACKT
[slack-config]: https://cloud-native.slack.com/archives/C0476L7UJT1
[java-bridge]: https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/declarative-config-bridge
[js-package]: https://github.com/open-telemetry/opentelemetry-js/tree/main/experimental/packages/configuration
[php-docs]: https://github.com/open-telemetry/opentelemetry-php/tree/main/src/Config/SDK#initialization-from-configuration-file
[go-package]: https://github.com/open-telemetry/opentelemetry-go-contrib/tree/main/otelconf
[go-package-index]: https://pkg.go.dev/go.opentelemetry.io/contrib/otelconf
[sigs]: https://github.com/open-telemetry/community?tab=readme-ov-file#implementation-sigs
[yt-config]: https://www.youtube.com/watch?v=u6svjtGpXO4
[declarative-repo]: https://github.com/open-telemetry/opentelemetry-configuration
[list-not-supported]: /docs/zero-code/java/agent/declarative-configuration/#not-yet-supported-features
[tracking-issue]: https://github.com/open-telemetry/opentelemetry-configuration/issues/100
