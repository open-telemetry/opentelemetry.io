---
title: service.criticality を使用した tail-based サンプリング
linkTitle: Tail サンプリング
default_lang_commit: d503571bbd711e05b9e6f85966fed6f0e00ba910
---

この例では、OpenTelemetry
Collector において、賢い tail-based サンプリングの決定を行うために、リソース属性 [`service.criticality`](/docs/specs/semconv/resource/service/#service) を使用するやり方を示します。

デモアプリケーションは、各サービスに`service.criticality`値を割り当て、運用上の重要度に基づいて分類します。

| Criticality | Sampling Rate | Services                                                                               |
| ----------- | ------------- | -------------------------------------------------------------------------------------- |
| `critical`  | 100%          | 支払い、チェックアウト、フロントエンド、フロントエンドプロキシ                         |
| `high`      | 50%           | カート、商品カタログ、通貨、配送                                                       |
| `medium`    | 10%           | レコメンド、広告、製品レビュー、メール                                                 |
| `low`       | 1%            | 会計、不正検出、画像プロバイダー、ロードジェネレータ、見積もり、flagd、flagd-ui、Kafka |

## Collector Configuration

tail-based サンプリングを有効にするには、`otelcol-config-extras.yml` に以下を加えてください:

```yaml
processors:
  tail_sampling:
    decision_wait: 10s
    num_traces: 100000
    expected_new_traces_per_sec: 1000
    policies:
      # ポリシー 1: 常に重要なサービスとしてサンプリングする (100%)
      - name: critical-services-always-sample
        type: string_attribute
        string_attribute:
          key: service.criticality
          values:
            - critical
          enabled_regex_matching: false
          invert_match: false

      # ポリシー 2: 重要度が高いサービスの 50% をサンプリングする
      - name: high-criticality-probabilistic
        type: and
        and:
          and_sub_policy:
            - name: is-high-criticality
              type: string_attribute
              string_attribute:
                key: service.criticality
                values:
                  - high
            - name: probabilistic-50
              type: probabilistic
              probabilistic:
                sampling_percentage: 50

      # ポリシー 3: 重要度が中程度のサービスの 10% をサンプリングする
      - name: medium-criticality-probabilistic
        type: and
        and:
          and_sub_policy:
            - name: is-medium-criticality
              type: string_attribute
              string_attribute:
                key: service.criticality
                values:
                  - medium
            - name: probabilistic-10
              type: probabilistic
              probabilistic:
                sampling_percentage: 10

      # ポリシー 4: 重要度が低いサービスの 1% をサンプリングする
      - name: low-criticality-probabilistic
        type: and
        and:
          and_sub_policy:
            - name: is-low-criticality
              type: string_attribute
              string_attribute:
                key: service.criticality
                values:
                  - low
            - name: probabilistic-1
              type: probabilistic
              probabilistic:
                sampling_percentage: 1

      # ポリシー 5: 重要度に関わらず、常にエラートレースはサンプリングする
      - name: errors-always-sample
        type: status_code
        status_code:
          status_codes:
            - ERROR

      # ポリシー 6: 常にクリティカル/高負荷サービスからの低速トレースをサンプリングする
      - name: slow-critical-traces
        type: and
        and:
          and_sub_policy:
            - name: is-critical-or-high
              type: string_attribute
              string_attribute:
                key: service.criticality
                values:
                  - critical
                  - high
            - name: is-slow
              type: latency
              latency:
                threshold_ms: 5000

service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [resourcedetection, memory_limiter, transform, tail_sampling]
      exporters: [otlp, debug, spanmetrics]
```

## どのように機能するか

tail-sampling プロセッサーは完了したトレースを、設定済みのポリシーと照らし合わせ評価します。トレースは、以下のいずれかのポリシーに一致する場合にサンプリングされます。

- **重要なサービス** は常にサンプリングされ、決済フロー、チェックアウト、およびユーザー向けサービスを完全に可視化します。
- **重要度の高いサービス** は、可観測性とデータ量のバランスを取るため、50%の割合でサンプリングされます。
- **中・低重要度のサービス** は、重要度の低い経路からのノイズを低減するために、段階的に低いサンプリングレートでサンプリングされます。
- サービスの重要度に関わらず、 **エラーは常に捕捉される** ため、問題が見落とされることはありません。
- パフォーマンスのボトルネックを特定するために、重要度の高いサービスおよびクリティカル度の高いサービスからの**低速トレース**（5秒以上）は常にサンプリングされます。
