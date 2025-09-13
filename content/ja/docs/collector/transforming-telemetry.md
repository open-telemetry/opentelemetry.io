---
title: テレメトリーの変換
weight: 26
default_lang_commit: 801233d066e99c97408663e5dbc6971fa38e94d3
# prettier-ignore
cSpell:ignore: accountid clustername k8sattributes metricstransform OTTL resourcedetection
---

OpenTelemetryコレクターは、データをベンダーや他のシステムに送信する前に変換するために便利な場所です。
変換は、データ品質、ガバナンス、コスト、およびセキュリティを理由にして頻繁に行われます。

[Collector Contrib repository](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor)には、メトリクス、スパン、ログデータに対して数十の異なる変換をサポートするプロセッサーが用意されています。
以下のセクションでは、よく使用される幾つかのプロセッサーを使い始めるための基本的な例をいくつか紹介します。

プロセッサーの構成、特に高度な変換はコレクターのパフォーマンスに大きな影響を与える可能性があります。

## 基本的なフィルタリング {#basic-filtering}

**プロセッサー**: [フィルタープロセッサー](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/filterprocessor)

フィルタープロセッサーを使用すると、ユーザーは[OTTL](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/ottl/README.md)を使用してテレメトリーをフィルタリングできます。
任意の条件に一致するテレメトリーはドロップされます。

たとえば、サービスapp1、app2、およびapp3からのスパンデータ _のみ_ を許可し、他のすべてのサービスからのデータをドロップするには次のようにします。

```yaml
processors:
  filter/ottl:
    error_mode: ignore
    traces:
      span:
        - |
        resource.attributes["service.name"] != "app1" and
        resource.attributes["service.name"] != "app2" and
        resource.attributes["service.name"] != "app3"
```

サービス `service1` からのスパンのみをドロップし、他のすべてのスパンを保持するには次のようにします。

```yaml
processors:
  filter/ottl:
    error_mode: ignore
    traces:
      span:
        - resource.attributes["service.name"] == "service1"
```

[フィルタープロセッサーのドキュメント](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/filterprocessor)には、ログとメトリクスのフィルタリングを含むさらに多くの例があります。

## 属性の追加または削除 {#adding-or-deleting-attributes}

**プロセッサー**: [属性プロセッサー](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/attributesprocessor)または[リソースプロセッサー](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/resourceprocessor)

属性プロセッサーは、メトリクスまたはトレースの既存の属性を更新、挿入、削除、または置換するために使用できます。
たとえば、すべてのスパンにaccount_idという属性を追加する構成は次のとおりです。

```yaml
processors:
  attributes/accountid:
    actions:
      - key: account_id
        value: 2245
        action: insert
```

リソースプロセッサーも同じ構成ですが、[リソース属性](/docs/specs/semconv/resource/)にのみ適用されます。
リソースプロセッサーを使用して、テレメトリーに関連するインフラストラクチャのメタデータを変更します。
たとえば、この例ではKubernetesクラスタ名を挿入します。

```yaml
processors:
  resource/k8s:
    attributes:
      - key: k8s.cluster.name
        from_attribute: k8s-cluster
        action: insert
```

## メトリクスまたはメトリクスラベルの名前変更 {#renaming-metrics-or-metric-labels}

**プロセッサー**: [メトリクス変換プロセッサー](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/metricstransformprocessor)

[メトリクス変換プロセッサー](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/metricstransformprocessor)
は[属性プロセッサー](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/attributesprocessor)といくつかの機能を共有しますが、名前変更やその他のメトリクス固有の機能もサポートしています。

```yaml
processors:
  metricstransform/rename:
    transforms:
      - include: system.cpu.usage
        action: update
        new_name: system.cpu.usage_time
```

[メトリクス変換プロセッサー](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/metricstransformprocessor)は、複数メトリクス名またはメトリクスラベルに同時に変換ルールを適用するための正規表現もサポートしています。
この例では、すべてのメトリクスのcluster_nameをcluster-nameに変更します。

```yaml
processors:
  metricstransform/clustername:
    transforms:
      - include: ^.*$
        match_type: regexp
        action: update
        operations:
          - action: update_label
            label: cluster_name
            new_label: cluster-name
```

## リソース属性によるテレメトリーの強化 {#enriching-telemetry-with-resource-attributes}

**プロセッサー**: [リソース検出プロセッサー](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/resourcedetectionprocessor)および[k8sattributesプロセッサー](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/k8sattributesprocessor)

これらのプロセッサーを使用すると、関連するインフラストラクチャのメタデータでテレメトリーを強化でき、基礎となるインフラストラクチャがサービスの健全性やパフォーマンスに影響を与えているかどうかをチームが迅速に特定できるようになります。

リソース検出プロセッサーは、テレメトリーに関連するクラウドまたはホストレベルの情報を追加します。

```yaml
processors:
  resourcedetection/system:
    # クラウド環境に合わせて検出器のリストを変更します
    detectors: [env, system, gcp, ec2, azure]
    timeout: 2s
    override: false
```

同様に、K8sプロセッサーはPod名、ノード名、またはワークロード名などの関連するKubernetesメタデータでテレメトリーを強化します。
コレクターのPodは、[特定のKubernetes RBAC APIへの読み取りアクセス](https://pkg.go.dev/github.com/open-telemetry/opentelemetry-collector-contrib/processor/k8sattributesprocessor#readme-role-based-access-control)を持つように構成する必要があります。
デフォルトのオプションを使用するには、空のブロックで構成できます。

```yaml
processors:
  k8sattributes/default:
```

## スパンステータスの設定 {#setting-a-span-status}

**プロセッサー**: [変換プロセッサー](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/transformprocessor)

変換プロセッサーを使用してスパンのステータスを設定します。
次の例では、`http.request.status_code`属性が400の場合、スパンステータスを`Ok`に設定します。

<!-- prettier-ignore-start -->

```yaml
transform:
  error_mode: ignore
  trace_statements:
    - set(span.status.code, STATUS_CODE_OK) where span.attributes["http.request.status_code"] == 400
```

<!-- prettier-ignore-end -->

変換プロセッサーを使用して、スパン名をその属性に基づいて変更したり、スパン名からスパン属性を抽出したりできます。
例については、変換プロセッサーの[構成ファイル](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/9b28f76c02c18f7479d10e4b6a95a21467fd85d6/processor/transformprocessor/testdata/config.yaml)の例を参照してください。

## 高度な変換 {#advanced-transformations}

[変換プロセッサー](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/transformprocessor)では、より高度な属性変換も利用できます。
変換プロセッサーを使用すると、エンドユーザーは[OpenTelemetry変換言語](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/pkg/ottl)を使用して、メトリクス、ログ、トレースの変換を指定できます。
