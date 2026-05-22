---
title: Kubernetesデプロイ
linkTitle: Kubernetes
aliases: [kubernetes_deployment]
default_lang_commit: c1e141558ab36cc1ab9f864728e4665e272ac131
cSpell:ignore: loadgen otlphttp spanmetrics
---

既存のKubernetesクラスターにデモをデプロイするのに役立つ[OpenTelemetry Demo Helmチャート](/docs/platforms/kubernetes/helm/demo/)を提供しています。

チャートを使用するには[Helm](https://helm.sh)をインストールする必要があります。
利用を開始するには、Helmの[ドキュメント](https://helm.sh/docs/)を参照してください。

## 前提条件 {#prerequisites}

- Kubernetes 1.24以上
- アプリケーション向けに6GBの空きRAM
- Helm 3.14以上（Helmインストール方法のみ）

## Helmを使用してインストール {#install-using-helm-recommended}

OpenTelemetry Helmリポジトリを追加します。

```shell
helm repo add open-telemetry https://open-telemetry.github.io/opentelemetry-helm-charts
```

my-otel-demoというリリース名でチャートをインストールするには、次のコマンドを実行します。

```shell
helm install my-otel-demo open-telemetry/opentelemetry-demo
```

> [!NOTE]
>
> OpenTelemetry Demo Helmチャートは、あるバージョンから別のバージョンにアップグレードすることをサポートしていません。
> チャートをアップグレードする必要がある場合は、最初に既存のリリースを削除してから新しいバージョンをインストールする必要があります。

### Helm を使用して Kubernetes マニフェストを生成する {#use-helm-to-generate-a-kubernetes-manifests}

次のコマンドは、すべての必要なリソースの定義を含む Kubernetes マニフェストファイルを生成します。
生成後に `kubectl apply -f opentelemetry-demo.yaml` を使用して、このマニフェストを適用できます。

```shell
helm template opentelemetry-demo open-telemetry/opentelemetry-demo --namespace otel-demo > opentelemetry-demo.yaml
```

> [!NOTE]
>
> OpenTelemetry Demo Kubernetesマニフェストは、あるバージョンから別のバージョンにアップグレードすることをサポートしていません。
> デモをアップグレードする必要がある場合は、最初に既存のリソースを削除してから新しいバージョンをインストールする必要があります。

## デモの使用 {#use-the-demo}

デモアプリケーションでは、Kubernetesクラスターの外部に公開されているサービスが必要です。
`kubectl port-forward`コマンドを使用するか、任意のデプロイ済みのIngressリソースを使用してサービスタイプ（例: LoadBalancer）を設定することで、サービスをローカルシステムに公開できます。

### kubectl port-forwardを使用してサービスを公開する {#expose-services-using-kubectl-port-forward}

frontend-proxyサービスを公開するには、次のコマンドを使用します（`default`をHelmチャートのリリースnamespaceに置き換えます）。

```shell
kubectl --namespace default port-forward svc/frontend-proxy 8080:8080
```

> [!NOTE]
>
> `kubectl port-forward`は、プロセスが終了するまでポートをプロキシします。
> `kubectl port-forward`を使用するたびに、個別のターミナルセッションを作成し、完了したら<kbd>Ctrl-C</kbd>を使用してプロセスを終了する必要がある場合があります。

frontend-proxyをport-forwardで設定すると、次のURLにアクセスできます。

- Web store: <http://localhost:8080/>
- Grafana: <http://localhost:8080/grafana/>
- Load Generator UI: <http://localhost:8080/loadgen/>
- Jaeger UI: <http://localhost:8080/jaeger/ui/>
- Flagd configurator UI: <http://localhost:8080/feature>

### ServiceまたはIngress構成を使用してデモコンポーネントを公開する {#expose-demo-components-using-service-or-ingress-configurations}

> [!NOTE]
>
> 追加の構成オプションを指定するために、Helmチャートをインストールする際にvaluesファイルを使用することをお勧めします。

#### Ingressリソースの構成 {#configure-ingress-resources}

> [!NOTE]
>
> Kubernetesクラスターには、LoadBalancerのサービスタイプまたはIngressリソースを有効にするための適切なインフラストラクチャのコンポーネントが備わっていない場合があります。
> これらの構成オプションを使用する前に、クラスターが適切にサポートされていることを確認してください。

各デモコンポーネント（例：frontend-proxy）は、Kubernetesのサービスタイプを設定できます。
デフォルトでは作成されませんが、各コンポーネントの`ingress`プロパティを使用して有効化および構成できます。

frontend-proxyコンポーネントをIngressリソースを使用するように構成するには、valuesファイルに次の内容を指定します。

```yaml
components:
  frontend-proxy:
    ingress:
      enabled: true
      annotations: {}
      hosts:
        - host: otel-demo.my-domain.com
          paths:
            - path: /
              pathType: Prefix
              port: 8080
```

一部のIngressコントローラーでは、特別なアノテーションやサービスタイプが必要です。
より詳細な情報については、Ingressコントローラーのドキュメントを参照してください。

#### サービスタイプの構成 {#configure-service-types}

各デモコンポーネント（例：frontend-proxy）は、Kubernetesのサービスタイプを設定する方法を提供します。
デフォルトでは`ClusterIP`ですが、各コンポーネントの`service.type`プロパティを使用して変更できます。

frontend-proxyコンポーネントをLoadBalancerサービスタイプを使用するように構成するには、valuesファイルに次の内容を指定します。

```yaml
components:
  frontend-proxy:
    service:
      type: LoadBalancer
```

#### ブラウザテレメトリーの構成 {#configure-browser-telemetry}

ブラウザからスパンを適切に収集するには、OpenTelemetry Collectorが公開されている場所も指定する必要があります。
frontend-proxyは、コレクターへのルートをパス接頭辞`/otlp-http`で定義します。
次の環境変数をfrontendコンポーネントに設定することで、コレクターのエンドポイントを設定できます。

```yaml
components:
  frontend:
    envOverrides:
      - name: PUBLIC_OTEL_EXPORTER_OTLP_TRACES_ENDPOINT
        value: http://otel-demo.my-domain.com/otlp-http/v1/traces
```

## 独自のバックエンドを使用する {#bring-your-own-backend}

おそらく、すでにお持ちのオブザーバビリティバックエンド（例：既存のJaeger、Zipkin、または[選択したベンダー](/ecosystem/vendors/)のインスタンス）のデモアプリケーションとしてWebストアを使用したい場合があるでしょう。

OpenTelemetry Collectorの設定はHelmチャートで公開されています。
追加した設定はすべてデフォルトの設定にマージされます。

`my-values-file.yaml` のようなカスタムファイルを作成し、それを使用して独自のエクスポーターを必要なパイプラインに追加できます。

```yaml
opentelemetry-collector:
  config:
    exporters:
      otlphttp/example:
        endpoint: <your-endpoint-url>

    service:
      pipelines:
        traces:
          exporters: [spanmetrics, otlphttp/example]
```

> [!NOTE]
>
> Helmを使用してYAML値をマージする場合、オブジェクトはマージされ、配列は置き換えられます。
> `spanmetrics`エクスポーターは、上書きされた場合`traces`パイプラインのエクスポーターの配列に含める必要があります。
> このエクスポーターを含めていない場合、エラーが発生します。

ベンダーのバックエンドによっては、認証のために追加のパラメーターが必要になる場合があるため、ベンダーのドキュメントを確認してください。
一部のバックエンドでは異なるエクスポーターが必要です。
エクスポーターとドキュメントは[opentelemetry-collector-contrib/exporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter)で入手できます。

カスタムvalueファイル`my-values-file.yaml`を使用してHelmチャートをインストールするには、次のコマンドを使用します。

```shell
helm install my-otel-demo open-telemetry/opentelemetry-demo --values my-values-file.yaml
```
