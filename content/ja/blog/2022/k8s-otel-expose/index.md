---
title: クラスター間通信のための Collector の公開
linkTitle: Collector の公開
date: 2022-09-08
author: '[Benedikt Bongartz](https://github.com/frzifus)'
default_lang_commit: aaa0ec1915b37d50733e4cb25b53fed7e8f6ed58
# prettier-ignore
cSpell:ignore: basicauth Benedikt Bongartz dXNlci0xOjEyMzQK frzifus htpasswd k8sattributes k8sattributesprocessor Keycloak letsencrypt llczt oidc rolebinding
---

[OpenTelemetry Collector](/docs/collector/) を外部に公開するには、現時点ではいくつかの設定手順が必要です。
このブログ記事の目的は、異なる Kubernetes クラスター間にある 2 つの Collector 間で安全な通信を確立する方法を紹介することです。

CRD の詳細や依存関係のインストールについては、この記事では扱いません。

## 概要 {#overview}

Collector を公開するにあたって、まず思い浮かぶのは TLS によるユーザーデータの安全な伝送です。
しかし、認可されていないサービスからのデータ送信を防ぐため、サーバーへの認証も同様に重要です。

OpenTelemetry Collector はさまざまな認証方式をサポートしています。
よく使われるのは以下の方式です。

1. TLS 認証
2. OpenID Connect（OIDC 認証）
3. HTTP Basic 認証

この記事ではシンプルさを重視して **HTTP Basic 認証** に焦点を当てます。
鍵管理や追加のサードパーティサービスなしに、安全なセットアップを運用する方法を示すことを目的としています。

TLS の設定に関する詳細は、記事
[How TLS provides identification, authentication, confidentiality, and integrity](https://www.ibm.com/docs/en/ibm-mq/9.1?topic=tls-how-provides-identification-authentication-confidentiality-integrity)
と、GitHub 上の Collector の
[TLS-Config](https://github.com/open-telemetry/opentelemetry-collector/blob/v0.58.0/config/configtls/README.md)
の説明を参照してください。

外部の認証プロバイダーの利用に興味がある場合は、Juraci Paixão Kröhling による記事
[Securing your OpenTelemetry Collector](https://medium.com/opentelemetry/securing-your-opentelemetry-collector-1a4f9fa5bd6f)
をご覧ください。
この記事では、
[OIDC-Authenticator エクステンション](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/v0.58.0/extension/oidcauthextension)
を使用して OpenTelemetry Collector を保護する方法と、
[Keycloak](https://www.keycloak.org/) を認証プロバイダーとして設定する方法が説明されています。

### Basic 認証 {#basic-authentication}

HTTP Basic 認証のメカニズムは非常にシンプルです。
HTTP ユーザーエージェント（たとえばウェブブラウザ）は、リクエストごとにユーザー名とパスワードの組み合わせを提供します。
送信される認証情報は、接続の確立時に HTTP ヘッダーのキー `Authorization` に含められます。
値としてはまず認証方式 `basic` が記述され、続いてエンコードされた認証情報が続きます。
認証情報の形式は `username:password` である点に注意してください。

以下の例では、`dXNlci0xOjEyMzQK` は `username=user-1` と `password=1234` の組み合わせをエンコードしたものです。
base64 の値をエンコードまたはデコードするには、以下を使用できます。

```YAML
# HTTP ヘッダーの key: value ペア
Authorization: Basic <credentials-base64-encoded>

# 例: user: user-1 password: 1234
Authorization: Basic dXNlci0xOjEyMzQK
```

[base64 CLI ツール](https://linux.die.net/man/1/base64)を使用すれば、独自のユーザーパスワードの組み合わせを簡単に作成できます。

```bash
# エンコード
$ echo "user-1:1234" | base64
dXNlci0xOjEyMzQK

# デコード
$ echo "dXNlci0xOjEyMzQK" | base64 -d
user-1:1234
```

### データフロー {#data-flow}

以下のグラフは、ターゲットとなるトポロジーを示しています。
目的は、
[テストアプリケーション](https://github.com/frzifus/jaeger-otel-test/pkgs/container/jaeger-otel-test)
によって生成されたトレースを、専用の Collector を経由して公開アクセス可能なクラスターに転送することです。
受信側の Collector は、送信された
['Basic' HTTP 認証](https://datatracker.ietf.org/doc/html/rfc7617)
の認証情報を使用して、送信者がデータを保存する権限を持っているかどうかを確認します。
最後に、送信されたトレースは
[Jaeger in-memory](https://www.jaegertracing.io/docs/1.37/deployment/#memory) に保存されます。

![概要図](overview-diagram.png)

## 前提条件 {#prerequisites}

インターフェイスと動作は将来変更される可能性があります。
そのため、このセットアップで使用されるバージョンを括弧内に記載しています。

- パブリックアドレスを持つ Kubernetes `v1.23.3` クラスターに
  [ingress-nginx-controller](https://docs.nginx.com/nginx-ingress-controller/)
  `v1.2.1` がインストールされていること。
- テストクラスターを作成するための Kubernetes `v1.23.3` エッジクラスター。
  [Kind](https://kind.sigs.k8s.io/) の使用を推奨します。
- 両方のクラスターに [OpenTelemetry Operator](/docs/platforms/kubernetes/operator/)
  `v0.58.0` がインストールされていること。
- パブリッククラスターに [Jaeger Operator](https://www.jaegertracing.io/docs/1.37/operator/)
  `v1.37.0` がインストールされていること。
- パブリッククラスターに [cert-manager](https://cert-manager.io/) `v1.9.1` がインストールされていること。

## リモートクラスターの設定 {#remote-cluster-configuration}

Jaeger バックエンド以外のすべてのコンポーネントは後続のコンポーネントに依存しているため、まずバックエンドのデプロイから始めます。

```yaml
apiVersion: jaegertracing.io/v1
kind: Jaeger
metadata:
  name: my-in-memory
```

次のステップでは、`OpenTelemetryCollector` CRD を使用して OpenTelemetry Collector を作成します。
最も重要なエントリは `mode`、`image`、および設定された basicauth エクステンションです。
以下のマニフェストでは、受信情報を処理する Collector Pod が少なくとも 1 つ利用可能であることを保証するため、モード `deployment` が選択されています。
さらに、デフォルトの Collector イメージは
[contrib バージョン](https://github.com/open-telemetry/opentelemetry-collector-contrib#opentelemetry-collector-contrib)で上書きされています。
これは、[core バージョン](https://github.com/open-telemetry/opentelemetry-collector) には
[basicauth](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/v0.58.0/extension/basicauthextension)
エクステンションが含まれていないためです。
このエクステンションは `basicauth/server` という名前で設定され、`otlp/basicauth` に登録されています。
[otlp exporter](https://github.com/open-telemetry/opentelemetry-collector/tree/v0.58.0/exporter/otlpexporter) のエンドポイントとして Jaeger in-memory サービスが設定されています。

```yaml
apiVersion: opentelemetry.io/v1alpha1
kind: OpenTelemetryCollector
metadata:
  name: otel-collector-app
spec:
  mode: deployment
  image: otel/opentelemetry-collector-contrib:0.58.0
  config: |
    extensions:
      basicauth/server:
        htpasswd:
          inline: |
            <REPLACE: your backend credentials, e.g.: "user-1:1234">

    receivers:
      otlp/basicauth:
        protocols:
          grpc:
            auth:
              authenticator: basicauth/server

    exporters:
      otlp/jaeger:
        endpoint: my-in-memory-collector:4317
        tls:
          insecure: true
          insecure_skip_verify: true

    service:
      extensions: [basicauth/server]
      pipelines:
        traces:
          receivers: [otlp/basicauth]
          exporters: [otlp/jaeger]
```

インストールが成功すると、選択した名前空間に Jaeger バックエンド用の Pod と OpenTelemetry Collector 用の Pod が作成されます。

```bash
NAME                                            READY   STATUS    RESTARTS   AGE
my-in-memory-6c5f5f87c5-rnp99                   1/1     Running   0          4m
otel-collector-app-collector-55cccf4b7d-llczt   1/1     Running   0          3m
```

また、以下のサービスが利用可能になります。

```bash
NAME                                      TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)                                                    AGE
my-in-memory-agent                        ClusterIP   None            <none>        5775/UDP,5778/TCP,6831/UDP,6832/UDP                         7m
my-in-memory-collector                    ClusterIP   10.245.43.185   <none>        9411/TCP,14250/TCP,14267/TCP,14268/TCP,4317/TCP,4318/TCP    7m
my-in-memory-collector-headless           ClusterIP   None            <none>        9411/TCP,14250/TCP,14267/TCP,14268/TCP,4317/TCP,4318/TCP    7m
my-in-memory-query                        ClusterIP   10.245.91.239   <none>        16686/TCP,16685/TCP                                         7m
otel-collector-app-collector              ClusterIP   10.245.5.134    <none>        4317/TCP                                                    5m
otel-collector-app-collector-headless     ClusterIP   None            <none>        4317/TCP                                                    5m
otel-collector-app-collector-monitoring   ClusterIP   10.245.116.38   <none>        8888/TCP                                                    5m
```

最後に、cert-manager を設定して [Let's Encrypt](https://letsencrypt.org/) から TLS 証明書を自動的にリクエストし、Ingress の TLS 設定で利用できるようにします。
以下の `ClusterIssuer` と `Ingress` のエントリは `otel-collector-app-collector` サービスを公開します。
`email` と `host` フィールドの値を置き換える必要がある点に注意してください。

```yaml
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt
  namespace: cert-manager
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: your-email-address-here@example.com # REPLACE
    privateKeySecretRef:
      name: letsencrypt
    solvers:
      - http01:
          ingress:
            class: nginx
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ingress-otel
  annotations:
    kubernetes.io/ingress.class: nginx
    nginx.ingress.kubernetes.io/backend-protocol: GRPC
    cert-manager.io/cluster-issuer: letsencrypt
spec:
  tls:
    - hosts:
        - your-host # REPLACE your domain endpoint, e.g., traces@example.com
      secretName: letsencrypt
  rules:
    - host: your-host # REPLACE your domain endpoint, e.g., traces@example.com
      http:
        paths:
          - pathType: Prefix
            path: '/'
            backend:
              service:
                name: otel-collector-app-collector
                port:
                  number: 4317
```

### エッジクラスターの設定 {#edge-cluster-configuration}

送信されたトレースの発信元を特定できるようにするため、
[k8sattributes プロセッサー](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/v0.58.0/processor/k8sattributesprocessor)
を使用して、スパンタグに識別用のメタデータを追加します。
これは OpenTelemetry Collector の contrib バージョンで利用できます。
次のステップでは、必要な権限を持つサービスアカウントを作成します。
K8s メタデータの詳細については、記事
「[Improved troubleshooting using K8s metadata](/blog/2022/k8s-metadata)」を参照してください。

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: attributes-role
rules:
  - apiGroups:
      - ''
    resources:
      - pods
    verbs:
      - get
      - list
      - watch
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: attributes-rolebinding
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: attributes-role
subjects:
  - kind: ServiceAccount
    name: attributes-account
---
apiVersion: v1
kind: ServiceAccount
metadata:
  name: attributes-account
```

エッジ Collector の最も重要な設定を確認しましょう。
デプロイモードとして `daemonset` を使用し、ノードごとに 1 つの Collector インスタンスが存在するようにしています。
`basicauth` エクステンションには、公開されたリモート Collector に対して自身を識別するための `username` と `password` が含まれています。
コンテナやノードに固有の情報は、`k8sattributes` プロセッサーが Kubernetes の
[Kubernetes downward-api](https://kubernetes.io/docs/concepts/workloads/pods/downward-api/)
を介して提供します。
ここでカバーされていないのは、クラスターのアベイラビリティゾーンとクラスター名です。
報告されたスパンを後で識別できるようにするため、`resource` プロセッサーを使用して手動で挿入しています。
最後に、OTLP エクスポーターのエンドポイントにもプレースホルダーの値が設定されており、リモートクラスターのドメインに置き換える必要があります。

```yaml
apiVersion: opentelemetry.io/v1alpha1
kind: OpenTelemetryCollector
metadata:
  name: otel-collector-app
spec:
  mode: daemonset
  image: otel/opentelemetry-collector-contrib:0.58.0
  serviceAccount: attributes-account
  env:
    - name: KUBE_NODE_NAME
      valueFrom:
        fieldRef:
          apiVersion: v1
          fieldPath: spec.nodeName

  config: |
    extensions:
      basicauth/client:
        client_auth: # 認証情報は受信側 Collector のものと一致している必要があります。
          username: <REPLACE: your basicauth username, e.g.: "user-1">
          password: <REPLACE: your basicauth password, e.g.: "1234">

    receivers:
      otlp:
        protocols:
          grpc:

    processors:
      resource:
        attributes:
        - key: cloud.availability_zone
          value: <REPLACE: your availability zone, e.g.: "eu-west-1">
          action: insert
        - key: k8s.cluster.name
          value: <REPLACE: your cluster name, e.g.: "edge-cluster-1">
          action: insert
      k8sattributes:
        filter:
          node_from_env_var: KUBE_NODE_NAME

    exporters:
      otlp:
        endpoint: "<REPLACE: your domain endpoint, e.g.: "traces.example.com:443">"
        auth:
          authenticator: basicauth/client
      logging:

    service:
      extensions: [basicauth/client]
      pipelines:
        traces:
          receivers: [otlp]
          processors: [k8sattributes]
          exporters: [otlp,logging]
```

インストールが成功すると、`otel-collector-app-collector` という名前の `daemonset` が作成されます。
これにより、各クラスターノードにローカルの Collector インスタンスが起動して稼働していることが保証されます。

### テストデータ生成用のトレースジェネレーターのデプロイ {#deploy-trace-generator-to-generate-test-data}

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: trace-gen
spec:
  selector:
    matchLabels:
      app: trace-gen
  template:
    metadata:
      labels:
        app: trace-gen
    spec:
      containers:
        - name: trace-gen
          image: ghcr.io/frzifus/jaeger-otel-test:latest
          args:
            [
              '-otel.agent.host=otel-collector-app-collector',
              '-otel.agent.port=4317',
            ]
          env:
            - name: OTEL_SERVICE_NAME
              value: 'local-test-service'
```

## テスト {#testing}

これで、エッジクラスターで生成されたスパンが発信元のメタデータで拡張されます。
その後、リモートクラスターに転送され、Jaeger バックエンドに保存されます。
Jaeger 自体が、送信されたデータを検査するための UI を提供しています。

UI にアクセスする簡単な方法は、ローカルシステムへのポートフォワーディングです。

```bash
$ kubectl port-forward deployments/my-in-memory 16686
Forwarding from 127.0.0.1:16686 -> 16686
```

![リモートクラスター上の Jaeger UI](jaeger-ui-remote-cluster.png)

## まとめ {#conclusion}

`Ingress`、`ClusterIssuer`、および `OpenTelemetryCollector` のクライアント側とサーバー側の設定は手動で行う必要があります。
インストールされている Kubernetes コンポーネントによって、設定は大きく異なります。
全体として、設定はエラーが起きやすいものです。
将来的には、OpenTelemetry Operator を活用して Collector の公開を簡素化すべきです。
開発状況に興味がある方は、
[GitHub issue #902](https://github.com/open-telemetry/opentelemetry-operator/issues/902)
をフォローして最新情報を確認してください。

## 参考資料 {#references}

- [Securing your OpenTelemetry Collector](https://medium.com/opentelemetry/securing-your-opentelemetry-collector-1a4f9fa5bd6f)
- [Jaeger Tracing](https://www.jaegertracing.io/docs/)
- [OpenTelemetry-Collector](/docs/collector/)
  - ディストリビューション:
    [contrib](https://github.com/open-telemetry/opentelemetry-collector-contrib#opentelemetry-collector-contrib),
    [core](https://github.com/open-telemetry/opentelemetry-collector)
  - エクステンション:
    [basicauth](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/v0.58.0/extension/basicauthextension),
    [oidc](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/v0.58.0/extension/oidcauthextension)
  - プロセッサー:
    [resource](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/v0.58.0/processor/resourceprocessor),
    [k8sattributes](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/v0.58.0/processor/k8sattributesprocessor)
  - エクスポーター:
    [otlp](https://github.com/open-telemetry/opentelemetry-collector/tree/v0.58.0/exporter/otlpexporter),
    [logging](https://github.com/open-telemetry/opentelemetry-collector/tree/v0.58.0/exporter/loggingexporter)
- [Test-Application](https://github.com/frzifus/jaeger-otel-test/pkgs/container/jaeger-otel-test)
- [Basic HTTP Authentication](https://datatracker.ietf.org/doc/html/rfc7617)
- [Kubernetes Downward-API](https://kubernetes.io/docs/concepts/workloads/pods/downward-api/)
- [Let's Encrypt](https://letsencrypt.org/)
- [Ingress NGINX gRPC example](https://kubernetes.github.io/ingress-nginx/examples/grpc/)
- [OpenTelemetry-Collector TLS-Config](https://github.com/open-telemetry/opentelemetry-collector/blob/v0.58.0/config/configtls/README.md)
- [How TLS provides identification, authentication, confidentiality, and integrity](https://www.ibm.com/docs/en/ibm-mq/9.1?topic=tls-how-provides-identification-authentication-confidentiality-integrity)
