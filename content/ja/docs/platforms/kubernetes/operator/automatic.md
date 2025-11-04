---
title: 自動計装の注入
linkTitle: 自動計装
weight: 11
description: OpenTelemetryオペレーターを使用した自動計装の実装。
default_lang_commit: 276d7eb3f936deef6487cdd2b1d89822951da6c8
drifted_from_default: true
# prettier-ignore
cSpell:ignore: GRPCNETCLIENT k8sattributesprocessor otelinst otlpreceiver REDISCALA
---

OpenTelemetryオペレーターは、.NET、Java、Node.js、Python、およびGoのサービスについて、自動計装ライブラリの注入と構成をサポートしています。

## インストール {#installation}

まず、クラスターに[OpenTelemetryオペレーター](https://github.com/open-telemetry/opentelemetry-operator)をインストールします。

インストールは、[オペレーターのリリースマニフェスト](https://github.com/open-telemetry/opentelemetry-operator#getting-started)、[オペレーターのHelmチャート](https://github.com/open-telemetry/opentelemetry-helm-charts/tree/main/charts/opentelemetry-operator#opentelemetry-operator-helm-chart)、または[Operator Hub](https://operatorhub.io/operator/opentelemetry-operator)を使用できます。

多くのケースでは、[cert-manager](https://cert-manager.io/docs/installation/)をインストールする必要があります。
Helmチャートを使用する場合は、自己証明書を生成するオプションがあります。

> Goの自動計装を使用したい場合、フィーチャーゲートを有効にする必要があります。
> 詳細は[Controlling Instrumentation Capabilities](https://github.com/open-telemetry/opentelemetry-operator#controlling-instrumentation-capabilities)を参照してください。

## OpenTelemetryコレクターの作成（オプション） {#create-an-opentelemetry-collector-optional}

コンテナからテレメトリーをバックエンドに直接送信するのではなく、[OpenTelemetryコレクター](/docs/platforms/kubernetes/collector/)に送信するのがベストプラクティスです
コレクターによって、シークレット管理が簡素化され、データエクスポートの問題（リトライが必要な場合など）がアプリから分離され、[k8sattributesprocessor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/k8sattributesprocessor)コンポーネントなどを使用してテレメトリーにデータを追加できます。
コレクターを使用しない場合、次のセクションに進んでください。

オペレーターは、オペレーターが管理するコレクターのインスタンスを作成するために使用される[OpenTelemetryコレクターのカスタムリソース定義 (CRD)](https://github.com/open-telemetry/opentelemetry-operator/blob/main/docs/api/opentelemetrycollectors.md)です。
次の例では、コレクターをDeploymentとしてデプロイします（デフォルト）が、他の[deploymentモード](https://github.com/open-telemetry/opentelemetry-operator#deployment-modes)も使用できます。

`Deployment` モードを使用する場合、オペレーターはコレクターと対話に使用できるサービスも作成します。
サービス名は `OpenTelemetryCollector` リソース名に `-collector` を付与したものです。
この例では `demo-collector` になります。

```bash
kubectl apply -f - <<EOF
apiVersion: opentelemetry.io/v1beta1
kind: OpenTelemetryCollector
metadata:
  name: demo
spec:
  config:
    receivers:
      otlp:
        protocols:
          grpc:
            endpoint: 0.0.0.0:4317
          http:
            endpoint: 0.0.0.0:4318
    processors:
      memory_limiter:
        check_interval: 1s
        limit_percentage: 75
        spike_limit_percentage: 15
      batch:
        send_batch_size: 10000
        timeout: 10s
    exporters:
      debug:
        verbosity: basic

    service:
      pipelines:
        traces:
          receivers: [otlp]
          processors: [memory_limiter, batch]
          exporters: [debug]
        metrics:
          receivers: [otlp]
          processors: [memory_limiter, batch]
          exporters: [debug]
        logs:
          receivers: [otlp]
          processors: [memory_limiter, batch]
          exporters: [debug]
EOF
```

上記のコマンドを実行すると、Pod内の自動計装のエンドポイントとして使用できるコレクターがデプロイされます。

## 自動計装の構成 {#configure-automatic-instrumentation}

自動計装を管理するには、計装するPodとそれらのPodに使用する自動計装をオペレーターを認識するように、オペレーターを構成する必要があります。
これは[CRDの実装](https://github.com/open-telemetry/opentelemetry-operator/blob/main/docs/api/instrumentations.md)を介して行われます。

自動計装を機能させるには、Instrumentationリソースを正しく作成することが最も重要です。
自動計装が正しく機能するには、すべてのエンドポイントと環境変数が正しいことを確認する必要があります。

### .NET　{#net}

次のコマンドは、.NETサービス用に構成された基本的なInstrumentationリソースを作成します。

```bash
kubectl apply -f - <<EOF
apiVersion: opentelemetry.io/v1alpha1
kind: Instrumentation
metadata:
  name: demo-instrumentation
spec:
  exporter:
    endpoint: http://demo-collector:4318
  propagators:
    - tracecontext
    - baggage
  sampler:
    type: parentbased_traceidratio
    argument: "1"
EOF
```

デフォルトでは、.NETサービスを自動計装するInstrumentationリソースは `http/protobuf` プロトコルで `otlp` を使用します。
つまり、構成されたエンドポイントは `http/protobuf` 経由でOTLPを受信できる必要があります。
したがって、この例では `http://demo-collector:4318` を使用し、前のステップで作成されたコレクターの `otlpreceiver` の `http` ポートに接続します。

#### 自動計装の除外 {#dotnet-excluding-auto-instrumentation}

デフォルトでは、.NETの自動計装には[多くの計装ライブラリ](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/blob/main/docs/config.md#instrumentations)を付属しています。
これによって計装は容易になりますが、過剰なデータや不要なデータが生成される可能性があります。
使用したくないライブラリがある場合は、`OTEL_DOTNET_AUTO_[SIGNAL]_[NAME]_INSTRUMENTATION_ENABLED=false` を設定でき、`[SIGNAL]` はシグナルのタイプ、`[NAME]` はライブラリのケースセンシティブな名前です。

```yaml
apiVersion: opentelemetry.io/v1alpha1
kind: Instrumentation
metadata:
  name: demo-instrumentation
spec:
  exporter:
    endpoint: http://demo-collector:4318
  propagators:
    - tracecontext
    - baggage
  sampler:
    type: parentbased_traceidratio
    argument: '1'
  dotnet:
    env:
      - name: OTEL_DOTNET_AUTO_TRACES_GRPCNETCLIENT_INSTRUMENTATION_ENABLED
        value: false
      - name: OTEL_DOTNET_AUTO_METRICS_PROCESS_INSTRUMENTATION_ENABLED
        value: false
```

#### もっと詳しく {#dotnet-learn-more}

より詳細については、[.NET自動計装ドキュメント](/docs/zero-code/dotnet/)を参照してください。

### Deno　 {#deno}

次のコマンドは、[Deno](https://deno.com)サービスを計装するために構成された基本的なInstrumentationリソースを作成します。

```bash
kubectl apply -f - <<EOF
apiVersion: opentelemetry.io/v1alpha1
kind: Instrumentation
metadata:
  name: demo-instrumentation
spec:
  env:
    - name: OTEL_DENO
      value: 'true'
  exporter:
    endpoint: http://demo-collector:4318
  propagators:
    - tracecontext
    - baggage
  sampler:
    type: parentbased_traceidratio
    argument: '1'
EOF
```

Denoプロセスは、`OTEL_DENO=true` 環境変数とともに起動されると、構成されたエンドポイントにテレメトリーデータを自動的にエクスポートします。
したがって、この例ではInstrumentationリソースの `env` フィールドにこの環境変数を指定することによって、このInstrumentationリソースで環境変数が挿入されたすべてのサービスにこの環境変数が設定されます。

デフォルトでは、Denoサービスを自動計装するInstrumentationリソースは、`http/proto` プロトコルで `otlp` を使用します。
つまり、構成されたエンドポイントは `http/proto` 経由でOTLPを受信できる必要があります。
したがって、この例では `http://demo-collector:4318` を使用し、前のステップで作成されたコレクターの `otlpreceiver` の `http/proto` ポートに接続します。

{{% alert title="Note" %}}

[DenoのOpenTelemetry統合][deno-docs]はまだ安定版ではありません。
そのため、Denoで実装されたすべてのワークロードでは、Denoプロセスの起動時に `--unstable-otel` フラグを設定する必要があります。

[deno-docs]: https://docs.deno.com/runtime/fundamentals/open_telemetry/

{{% /alert %}}

#### 構成オプション {#deno-configuration-options}

デフォルトでは、DenoのOpenTelemetry統合は `console.log()` の出力を[ログ](/docs/concepts/signals/logs/)としてエクスポートしますが、ログは標準出力や標準エラーにも出力されます。
これらは代替動作を構成できます。

- `OTEL_DENO_CONSOLE=replace`: `console.log()` の出力をログとしてのみエクスポートし、標準出力や標準エラーには出力しません。
- `OTEL_DENO_CONSOLE=ignore`: `console.log()` の出力をログとしてエクスポートせず、標準出力や標準エラーには出力します。

#### もっと詳しく {#deno-learn-more}

より詳細については、Denoの[OpenTelemetry統合][deno-otel-docs]ドキュメントを参照してください。

[deno-otel-docs]: https://docs.deno.com/runtime/fundamentals/open_telemetry/

### Go　{#go}

次のコマンドは、Goサービスを計装するために構成された基本的なInstrumentationリソースを作成します。

```bash
kubectl apply -f - <<EOF
apiVersion: opentelemetry.io/v1alpha1
kind: Instrumentation
metadata:
  name: demo-instrumentation
spec:
  exporter:
    endpoint: http://demo-collector:4318
  propagators:
    - tracecontext
    - baggage
  sampler:
    type: parentbased_traceidratio
    argument: "1"
EOF
```

デフォルトでは、Goサービスを自動計装するInstrumentationリソースは、`http/protobuf` プロトコルで `otlp` を使用します。
つまり、構成されたエンドポイントは `http/protobuf` 経由でOTLPを受信できる必要があります。
したがって、この例では `http://demo-collector:4318` を使用し、前のステップで作成されたコレクターの `otlpreceiver` の `http/protobuf` ポートに接続します。

Goの自動計装は、あらゆる計装の無効化をサポートしていません。
[より詳細については、Goの自動計装リポジトリを参照してください。](https://github.com/open-telemetry/opentelemetry-go-instrumentation)

### Java　{#java}

次のコマンドは、Javaサービスを計装するために構成された基本的なInstrumentationリソースを作成します。

```bash
kubectl apply -f - <<EOF
apiVersion: opentelemetry.io/v1alpha1
kind: Instrumentation
metadata:
  name: demo-instrumentation
spec:
  exporter:
    endpoint: http://demo-collector:4318
  propagators:
    - tracecontext
    - baggage
  sampler:
    type: parentbased_traceidratio
    argument: "1"
EOF
```

デフォルトでは、Javaサービスを自動計装するInstrumentationリソースは、`http/protobuf` プロトコルで `otlp` を使用します。
つまり、構成されたエンドポイントは `http/protobuf` 経由でOTLPを受信できる必要があります。
したがって、この例では `http://demo-collector:4318` を使用し、前のステップで作成されたコレクターの `otlpreceiver` の `http` ポートに接続します。

#### 自動計装の除外 {#java-excluding-auto-instrumentation}

デフォルトでは、Javaの自動計装には[多くの計装ライブラリ](/docs/zero-code/java/agent/getting-started/#supported-libraries-frameworks-application-services-and-jvms)が付属しています。
これによって計装は容易になりますが、過剰なデータや不要なデータが生成される可能性があります。
使用したくないライブラリがある場合は、`OTEL_INSTRUMENTATION_[NAME]_ENABLED=false` を設定でき、`[NAME]` はライブラリの名前です。
使用したいライブラリを正確に把握している場合は、`OTEL_INSTRUMENTATION_COMMON_DEFAULT_ENABLED=false` を設定し、その後に
`OTEL_INSTRUMENTATION_[NAME]_ENABLED=true` を使用でき、`[NAME]` はライブラリの名前です。
詳細については[特定の計装を抑制](/docs/zero-code/java/agent/disable/)を参照してください。

```yaml
apiVersion: opentelemetry.io/v1alpha1
kind: Instrumentation
metadata:
  name: demo-instrumentation
spec:
  exporter:
    endpoint: http://demo-collector:4318
  propagators:
    - tracecontext
    - baggage
  sampler:
    type: parentbased_traceidratio
    argument: '1'
  java:
    env:
      - name: OTEL_INSTRUMENTATION_KAFKA_ENABLED
        value: false
      - name: OTEL_INSTRUMENTATION_REDISCALA_ENABLED
        value: false
```

#### もっと詳しく {#java-learn-more}

詳細については[Javaエージェントの構成](/docs/zero-code/java/agent/configuration/)を参照してください。

### Node.js　{#nodejs}

次のコマンドは、Node.jsサービスを計装するために構成された基本的なInstrumentationリソースを作成します。

```bash
kubectl apply -f - <<EOF
apiVersion: opentelemetry.io/v1alpha1
kind: Instrumentation
metadata:
  name: demo-instrumentation
spec:
  exporter:
    endpoint: http://demo-collector:4317
  propagators:
    - tracecontext
    - baggage
  sampler:
    type: parentbased_traceidratio
    argument: "1"
EOF
```

デフォルトでは、Node.jsサービスを自動計装するInstrumentationリソースは、`grpc` プロトコルで `otlp` を使用します。
つまり、構成されたエンドポイントは `grpc` 経由でOTLPを受信できる必要があります。
したがって、この例では `http://demo-collector:4317` を使用し、前のステップで作成されたコレクターの `otlpreceiver` の `grpc` ポートに接続します。

#### 計装ライブラリの除外 {#js-excluding-instrumentation-libraries}

デフォルトでは、Node.jsのゼロコード計装ではすべての計装ライブラリが有効になっています。

特定の計装ライブラリのみを有効にするには、[Node.jsのゼロコード計装ドキュメント](/docs/zero-code/js/configuration/#excluding-instrumentation-libraries)に記載されているように、`OTEL_NODE_ENABLED_INSTRUMENTATIONS` 環境変数を使用できます。

```yaml
apiVersion: opentelemetry.io/v1alpha1
kind: Instrumentation
# ... この例では省略された他のフィールド
spec:
  # ... この例では省略された他のフィールド
  nodejs:
    env:
      - name: OTEL_NODE_ENABLED_INSTRUMENTATIONS
        value: http,nestjs-core # `@opentelemetry/instrumentation-` 接頭辞を除いた計装パッケージ名のカンマ区切りのリスト
```

すべてのデフォルトライブラリを保持し、特定の計装ライブラリのみを無効にするには、`OTEL_NODE_DISABLED_INSTRUMENTATIONS` 環境変数を使用できます。
詳細については、[計装ライブラリの除外](/docs/zero-code/js/configuration/#excluding-instrumentation-libraries)を参照してください。

```yaml
apiVersion: opentelemetry.io/v1alpha1
kind: Instrumentation
# ... この例では省略された他のフィールド
spec:
  # ... この例では省略された他のフィールド
  nodejs:
    env:
      - name: OTEL_NODE_DISABLED_INSTRUMENTATIONS
        value: fs,grpc # `@opentelemetry/instrumentation-` 接頭辞を除いた計装パッケージ名のカンマ区切りのリスト
```

{{% alert title="Note" %}}

両方の環境変数が設定されている場合、`OTEL_NODE_ENABLED_INSTRUMENTATIONS` が最初に適用され、次にそのリストに `OTEL_NODE_DISABLED_INSTRUMENTATIONS` が適用されます。
したがって、同じ計装が両方のリストに含まれている場合、その計装は無効になります。

{{% /alert %}}

#### もっと詳しく {#js-learn-more}

詳細については[Node.jsの自動計装](/docs/languages/js/libraries/#registration)を参照してください。

### Python　{#python}

次のコマンドは、Pythonサービスを計装するために構成された基本的なInstrumentationリソースを作成します。

```bash
kubectl apply -f - <<EOF
apiVersion: opentelemetry.io/v1alpha1
kind: Instrumentation
metadata:
  name: demo-instrumentation
spec:
  exporter:
    endpoint: http://demo-collector:4318
  propagators:
    - tracecontext
    - baggage
  sampler:
    type: parentbased_traceidratio
    argument: "1"
EOF
```

デフォルトでは、Pythonサービスを自動計装する `Instrumentation` リソースは、`http/protobuf` プロトコルで `otlp` を使用します（gRPCは現在サポートされていません）。
つまり、構成されたエンドポイントは `http/protobuf` 経由でOTLPを受信できる必要があります。
したがって、この例では `http://demo-collector:4318` を使用し、前のステップで作成されたコレクターの `otlpreceiver` の `http` ポートに接続します。

> Operator v0.108.0以降、Instrumentationリソースは自動的に `OTEL_EXPORTER_OTLP_PROTOCOL` を `http/protobuf` に設定します。
> 古いバージョンのオペレーターを使用する場合は、この環境変数を `http/protobuf` に設定する**必要があり**、設定しない場合はPythonの自動計装が機能しません。

#### Pythonのログ自動計装 {#auto-instrumenting-python-logs}

デフォルトでは、Pythonのログ自動計装は無効になっています。
この機能を有効にするには、次のように `OTEL_PYTHON_LOGGING_AUTO_INSTRUMENTATION_ENABLED` 環境変数を設定する必要があります。

```yaml
apiVersion: opentelemetry.io/v1alpha1
kind: Instrumentation
metadata:
  name: python-instrumentation
  namespace: application
spec:
  exporter:
    endpoint: http://demo-collector:4318
  env:
  propagators:
    - tracecontext
    - baggage
  python:
    env:
      - name: OTEL_PYTHON_LOGGING_AUTO_INSTRUMENTATION_ENABLED
        value: 'true'
```

> Operator v0.111.0以降、`OTEL_LOGS_EXPORTER` を `otlp` に設定する必要はなくなりました。

#### 自動計装の除外 {#python-excluding-auto-instrumentation}

デフォルトでは、Pythonの自動計装には[多くの計装ライブラリ](https://github.com/open-telemetry/opentelemetry-operator/blob/main/autoinstrumentation/python/requirements.txt)が付属しています。
これによって計装は容易になりますが、過剰なデータや不要なデータが生成される可能性があります。
計装したくないパッケージがある場合は、`OTEL_PYTHON_DISABLED_INSTRUMENTATIONS` 環境変数を設定できます。

```yaml
apiVersion: opentelemetry.io/v1alpha1
kind: Instrumentation
metadata:
  name: demo-instrumentation
spec:
  exporter:
    endpoint: http://demo-collector:4318
  propagators:
    - tracecontext
    - baggage
  sampler:
    type: parentbased_traceidratio
    argument: '1'
  python:
    env:
      - name: OTEL_PYTHON_DISABLED_INSTRUMENTATIONS
        value: <計装から除外するパッケージ名のカンマ区切りリスト>
```

より詳細については、[Pythonエージェントの構成ドキュメント](/docs/zero-code/python/configuration/#disabling-specific-instrumentations)を参照してください。

#### さらに詳しく {#python-learn-more}

Python特有の挙動については、[PythonのOpenTelemetryオペレータードキュメント](/docs/zero-code/python/operator/#python-specific-topics)および[Pythonエージェントの構成ドキュメント](/docs/zero-code/python/configuration/)を参照してください。

---

Instrumentationオブジェクトが作成されたので、クラスターはサービスを自動計装し、エンドポイントにデータを送信することができます。
ただし、OpenTelemetryオペレーターを使用した自動計装は、オプトインモデルに従います。
自動計装を有効にするには、Deploymentにアノテーションを追加する必要があります。

## 既存のDeploymentへのアノテーション追加 #add-annotations-to-existing-deployments

最後のステップは、サービスを自動計装にオプトインすることです。
これは、サービスの `spec.template.metadata.annotations` を更新して、言語固有のアノテーションを含めることで実行されます。

- .NET: `instrumentation.opentelemetry.io/inject-dotnet: "true"`
- Deno: `instrumentation.opentelemetry.io/inject-sdk: "true"`
- Go: `instrumentation.opentelemetry.io/inject-go: "true"`
- Java: `instrumentation.opentelemetry.io/inject-java: "true"`
- Node.js: `instrumentation.opentelemetry.io/inject-nodejs: "true"`
- Python: `instrumentation.opentelemetry.io/inject-python: "true"`

アノテーションに使用できる値は次の通りです。

- `"true"` - 現在の名前空間からデフォルトの名前で `Instrumentation` リソースを注入します。
- `"my-instrumentation"` - 現在の名前空間に `"my-instrumentation"` という名前の `Instrumentation` カスタムリソースインスタンスを注入します。
- `"my-other-namespace/my-instrumentation"` - 別の名前空間 `"my-other-namespace"` から `"my-instrumentation"` という名前の `Instrumentation` カスタムリソースインスタンスを注入します。
- `"false"` - 注入しません。

あるいは、名前空間にアノテーションを追加することで、その名前空間内のすべてのサービスが自動計装をオプトインすることもできます。
より詳細については、[オペレーターの自動計装ドキュメント](https://github.com/open-telemetry/opentelemetry-operator/blob/main/README.md#opentelemetry-auto-instrumentation-injection)を参照してください。

### Goサービスのオプトイン {#opt-in-a-go-service}

他の言語の自動計装とは異なり、Goはサイドカーを介して実行されるeBPFエージェントを使用します。
オプトインすると、オペレーターはこのサイドカーをPodに挿入します。
前述の `instrumentation.opentelemetry.io/inject-go` アノテーションに加えて、[`OTEL_GO_AUTO_TARGET_EXE` 環境変数](https://github.com/open-telemetry/opentelemetry-go-instrumentation/blob/main/docs/how-it-works.md)の値も指定する必要があります。
この環境変数は、`instrumentation.opentelemetry.io/otel-go-auto-target-exe` アノテーションを介して設定できます。

```yaml
instrumentation.opentelemetry.io/inject-go: 'true'
instrumentation.opentelemetry.io/otel-go-auto-target-exe: '/path/to/container/executable'
```

この環境変数は、Instrumentationリソースを介しても設定でき、アノテーションが優先されます。
Goの自動計装では `OTEL_GO_AUTO_TARGET_EXE` を設定する必要があるため、アノテーションまたはInstrumentationリソースを介して有効な実行可能パスを指定する必要があります。
この値の設定に失敗すると、計装の注入が中止され、元のPodは変更されません。

Goの自動計装はeBPFを使用するため、昇格された権限も必要です。
オプトインすると、オペレーターが挿入するサイドカーは次の権限を必要とします。

```yaml
securityContext:
  privileged: true
  runAsUser: 0
```

### Pythonのmuslベースのコンテナ自動計装 {#annotations-python-musl}

Operator v0.113.0以降、Pythonの自動計装は、glibcとは異なるCライブラリを持つイメージで実行可能にするアノテーションを受け入れます。

```sh
# Linux glibcベースのイメージでは、これがデフォルト値であり省略可能です
instrumentation.opentelemetry.io/otel-python-platform: "glibc"
# Linux muslベースのイメージ
instrumentation.opentelemetry.io/otel-python-platform: "musl"
```

## トラブルシューティング　{#troubleshooting}

コードの自動計装を試みて問題が発生した場合は、以下のいくつかの方法を試してください。

### Instrumentationリソースはインストールされましたか？ {#did-the-instrumentation-resource-install}

`Instrumentation` リソースのインストール後、正しくインストールされたことを確認するために、次のコマンドを実行します。
`<namespace>` は `Instrumentation` リソースがデプロイされている名前空間です。

```sh
kubectl describe otelinst -n <namespace>
```

出力例

```yaml
Name:         python-instrumentation
Namespace:    application
Labels:       app.kubernetes.io/managed-by=opentelemetry-operator
Annotations:  instrumentation.opentelemetry.io/default-auto-instrumentation-apache-httpd-image:
               ghcr.io/open-telemetry/opentelemetry-operator/autoinstrumentation-apache-httpd:1.0.3
             instrumentation.opentelemetry.io/default-auto-instrumentation-dotnet-image:
               ghcr.io/open-telemetry/opentelemetry-operator/autoinstrumentation-dotnet:0.7.0
             instrumentation.opentelemetry.io/default-auto-instrumentation-go-image:
               ghcr.io/open-telemetry/opentelemetry-go-instrumentation/autoinstrumentation-go:v0.2.1-alpha
             instrumentation.opentelemetry.io/default-auto-instrumentation-java-image:
               ghcr.io/open-telemetry/opentelemetry-operator/autoinstrumentation-java:1.26.0
             instrumentation.opentelemetry.io/default-auto-instrumentation-nodejs-image:
               ghcr.io/open-telemetry/opentelemetry-operator/autoinstrumentation-nodejs:0.40.0
             instrumentation.opentelemetry.io/default-auto-instrumentation-python-image:
               ghcr.io/open-telemetry/opentelemetry-operator/autoinstrumentation-python:0.39b0
API Version:  opentelemetry.io/v1alpha1
Kind:         Instrumentation
Metadata:
 Creation Timestamp:  2023-07-28T03:42:12Z
 Generation:          1
 Resource Version:    3385
 UID:                 646661d5-a8fc-4b64-80b7-8587c9865f53
Spec:
...
 Exporter:
   Endpoint:  http://demo-collector.opentelemetry.svc.cluster.local:4318
...
 Propagators:
   tracecontext
   baggage
 Python:
   Image:  ghcr.io/open-telemetry/opentelemetry-operator/autoinstrumentation-python:0.39b0
   Resource Requirements:
     Limits:
       Cpu:     500m
       Memory:  32Mi
     Requests:
       Cpu:     50m
       Memory:  32Mi
 Resource:
 Sampler:
Events:  <none>
```

### OTelオペレーターのログに自動計装のエラーは表示されますか？ {#do-the-otel-operator-logs-show-any-auto-instrumentation-errors}

次のコマンドを実行して、OTelオペレーターのログに自動計装に関連するエラーがないか確認します。

```sh
kubectl logs -l app.kubernetes.io/name=opentelemetry-operator --container manager -n opentelemetry-operator-system --follow
```

### リソースは正しい順序でデプロイされましたか？ {#were-the-resources-deployed-in-the-right-order}

順序は重要です！
`Instrumentation` リソースは、アプリケーションをデプロイする前にデプロイする必要があり、さもないと自動計装は機能しません。

自動計装のアノテーションを確認しましょう。

```yaml
annotations:
  instrumentation.opentelemetry.io/inject-python: 'true'
```

上記のアノテーションは、OTelオペレーターにPodの名前空間内で `Instrumentation` オブジェクトを探すように指示します。
また、オペレーターにPythonの自動計装をPodに注入するよう指示します。

Podが起動すると、アノテーションはオペレーターにPodの名前空間内で `Instrumentation` オブジェクトを探し、Podに自動計装を注入するよう指示します。
これは、アプリケーションのPodに `opentelemetry-auto-instrumentation` と呼ばれる [Initコンテナ](https://kubernetes.io/docs/concepts/workloads/pods/init-containers/)を追加し、自動計装をアプリケーションコンテナに注入するために使用されます。

ただし、アプリケーションがデプロイされる時点で `Instrumentation` リソースが存在しない場合はInitコンテナを作成できません。
したがって、`Instrumentation` リソースがデプロイされる _前に_ アプリケーションがデプロイされると、自動計装は失敗します。

`opentelemetry-auto-instrumentation` Initコンテナが正しく起動したか（あるいはそもそも起動していないか）を確認するには、次のコマンドを実行します。

```sh
kubectl get events -n <your_app_namespace>
```

次のような出力が得られるはずです。

```text
53s         Normal   Created             pod/py-otel-server-7f54bf4cbc-p8wmj    Created container opentelemetry-auto-instrumentation
53s         Normal   Started             pod/py-otel-server-7f54bf4cbc-p8wmj    Started container opentelemetry-auto-instrumentation
```

出力に `opentelemetry-auto-instrumentation` の `Created` や `Started` のエントリがない場合は、自動計装に問題があることを意味します。
これは次のいずれかの結果である可能性があります。

- `Instrumentation` リソースがインストールされていません（または正しくインストールされていません）。
- アプリケーションがデプロイされた _後に_ `Instrumentation` リソースがインストールされました。
- 自動計装のアノテーションにエラーがあるか、アノテーションが間違った場所にあります - 以下の#4を参照してください。

`kubectl get events` の出力にエラーがないか確認してください。
これらのエラーは、問題の原因特定役立つかもしれません。

### 自動計装のアノテーションは正しいですか？ {#is-the-auto-instrumentation-annotation-correct}

自動計装のアノテーションのエラーが原因で、自動計装が失敗することがあります。

いくつかの確認事項を挙げます。

- **自動計装は言語向けに適切ですか?**
  - たとえば、Pythonアプリケーションを計装する場合、アノテーションが誤って `instrumentation.opentelemetry.io/inject-java: "true"` と指定されていないことを確認します。
  - **Deno** の場合、`deno` という文字列を含むアノテーションではなく、`instrumentation.opentelemetry.io/inject-sdk: "true"` アノテーションを使用していることを確認します。
- **自動計装のアノテーションは正しい場所にありますか？**
  `Deployment` を定義する際、アノテーションは `spec.metadata.annotations` と `spec.template.metadata.annotations` の2つのいずれかの場所に追加できます。
  自動計装のアノテーションは `spec.template.metadata.annotations` に追加する必要があり、さもないと機能しません。

### 自動計装のエンドポイントは正しく構成されていますか？ {#was-the-auto-instrumentation-endpoint-configured-correctly}

`Instrumentation` リソースの `spec.exporter.endpoint` 属性は、データの送信先を定義します。
これは[OTelコレクター](/docs/collector/)、または任意のOTLPエンドポイントです。
この属性を省略すると、デフォルトで `http://localhost:4317`　に設定され、テレメトリーデータがどこにも送信されない可能性があります。

同じKubernetesクラスター内にあるOTelコレクターにテレメトリーを送信する場合、`spec.exporter.endpoint` はOTelコレクター[`Service`](https://kubernetes.io/docs/concepts/services-networking/service/)の名前を参照する必要があります。

例

```yaml
spec:
  exporter:
    endpoint: http://demo-collector.opentelemetry.svc.cluster.local:4317
```

ここでは、コレクターのエンドポイントは `http://demo-collector.opentelemetry.svc.cluster.local:4317` に設定されており、`demo-collector` はOTelコレクターのKubernetes `Service` の名前です。
上記の例では、コレクターはアプリケーションとは異なる名前空間で実行されているため、コレクターのサービス名に `opentelemetry.svc.cluster.local` を追加する必要があり、`opentelemetry` はコレクターが存在する名前空間です。
