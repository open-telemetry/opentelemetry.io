---
title: Gateway API と mTLS を使用して Kubernetes で OTel Collector を公開する
linkTitle: Collector と Gateway API および mTLS
date: 2025-06-05
author: >
  [Vipin Vijaykumar](https://github.com/vipinvkmenon) (SAP SE)
sig: End-User SIG
default_lang_commit: 331c76c3500213c83ace2e30a407218ddedda628
cSpell:ignore: gateway gatewayclass ingress ingressgateway Vijaykumar Vipin
---

このブログ記事の目的は、Kubernetes 内で動作する OpenTelemetry（OTel）Collector を、[Kubernetes Gateway API](https://gateway-api.sigs.k8s.io/) と [相互 TLS（mTLS）](https://www.buoyant.io/mtls-guide)を使用して、認証と暗号化を伴いつつ安全に外部に公開する方法を紹介することです。

現代の分散システムにおいてオブザーバビリティがますます重要になる中、1つまたは複数の Kubernetes クラスターにデプロイされた OTel Collector を介してテレメトリーデータを集約することは一般的なプラクティスです。
多くの場合、Kubernetes クラスターの _外部_ で実行されているサービスやエージェントが、これらの Collector にデータを送信する必要があります。
内部サービスの公開にはセキュリティと標準化の慎重な検討が必要です。
ここで Kubernetes Gateway API と mTLS が力を発揮します。

通常、このようなセットアップは、クラスター外部にアプリケーションやワークロードがあり、それらのテレメトリーデータを収集する必要がある場合に役立ちます。
以下にいくつかの例を示します。

- **ハイブリッドクラウド/オンプレミス環境:** 従来のデータセンター、別のクラウド、または Kubernetes クラスター外部で実行されているアプリケーションやサーバーが、メトリクス、トレース、またはログを中央のオブザーバビリティソリューションに転送する必要がある場合。
- **マルチクラスターテレメトリー集約:** 複数の Kubernetes クラスターで実行されるセットアップにおいて、1つのクラスターをプライマリの OTel Collector デプロイメントのホストとして指定する場合があります。
  他の「スポーク」クラスター内の Collector はクライアントとして機能し、外部エンドポイントを介して中央の Collector にデータをエクスポートします。
  たとえば、マルチクラスターサービスメッシュ構成では、テイルベースサンプリングを中央で実行する必要がある場合があります。
  この場合、[テイルベースサンプリングプロセッサー](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/v0.127.0/processor/tailsamplingprocessor)が設定され、Gateway 経由で公開されている中央の Collector が、すべてのクラスターからスパンを集約してサンプリングの判断を行います。
- **エッジコンピューティング/IoT:** エッジにデプロイされたデバイスは、運用データを中央プラットフォームに送信する必要があることが多いです。
- **サーバーレス関数/PaaS:** サーバーレスプラットフォーム（AWS Lambda、Google Cloud Functions など）やクラスター外部の Platform-as-a-Service で実行されているアプリケーションが OTLP データをエクスポートする必要がある場合。
- **外部監視エージェント:** クラスター内の共有 Collector に接続する必要があるサードパーティエージェントやローカルで実行されている開発インスタンス。
- **クライアントサイド監視:** ブラウザやモバイルアプリケーションなどの外部クライアントから送られるテレメトリー。
  [ブラウザからのテレメトリーエクスポート](/docs/languages/js/getting-started/browser/)では mTLS が使用されない場合がありますが、Collector は最終的に利用可能にする必要があります。

## 前提条件 {#prerequisites}

始める前に、以下を準備してください。

1.  **Kubernetes クラスター:** Minikube、Kind、Docker Desktop、Gardener、またはクラウドプロバイダーのマネージド Kubernetes サービスが利用できます。
2.  **`kubectl`:** クラスターと対話するように[設定](https://kubernetes.io/docs/reference/kubectl/)されていること。
3.  **`helm`:** Helm チャートをインストールするように[設定](https://helm.sh/)されていること。
4.  **Gateway API 実装:** この例では [Istio](https://istio.io/latest/docs/overview/what-is-istio/) を使用します。
    Contour、NGINX Gateway Fabric などの他の実装でも、わずかな設定変更で動作します。
5.  **`openssl`:** 証明書を生成するための OpenSSL [CLI](https://github.com/openssl/openssl/wiki/Binaries)。

> [!WARNING] API の安定性に関する注意
>
> Gateway API の一部はまだアルファ/ベータフェーズにあるため、特定の機能のサポートは異なる場合や、デフォルトでは有効になっていない場合があります。
> 使用している Gateway 実装のドキュメントを参照してください。
> たとえば、執筆時点で Istio を使用している場合は、インストール時に `PILOT_ENABLE_ALPHA_GATEWAY_API` が有効になっていることを確認してください。

## Kubernetes Gateway API とは {#what-is-the-kubernetes-gateway-api}

[Kubernetes Gateway API](https://gateway-api.sigs.k8s.io/) は、従来の Ingress API の進化形です。
クラスターへの受信トラフィックを管理するための、より表現力豊かで、ロール指向で、柔軟な方法を提供します。
[GAMMA イニシアチブ](https://gateway-api.sigs.k8s.io/concepts/gamma/)が Gateway API の実装を定義しています。
以下の理由で導入されました。

- **Ingress の制限:** Ingress API は有用でしたが、制限がありました。
  実装間での標準化が不足しており、ルーティング機能も実装によって大きく異なっていました。
- **ロールの分離:** Gateway API は関心事を分離します。
  - `GatewayClass`: ロードバランサーの _種類_（例: Istio、GKE LB）を定義します。
    インフラストラクチャ管理者が管理します。
  - `Gateway`: 特定の `GatewayClass` を要求するロードバランサーのインスタンスを表します。
    リスナー（ポート、プロトコル、TLS）を定義します。
    クラスターオペレーターが管理します。
    名前空間をまたいで共有することもできます。
  - `HTTPRoute`、`GRPCRoute`、`TCPRoute`、`TLSRoute` など: アプリケーションレベルのルーティングルールを定義し、`Gateway` にアタッチします。
    アプリケーション開発者/オーナーが管理します。
- **ポータビリティ:** 標準化された API 定義により、異なる基盤となるゲートウェイ/サービスメッシュ実装間でより高い移植性を目指します。
- **表現力:** ヘッダー操作、トラフィック分割、mTLS 設定、gRPC ルーティングなどの高度な機能をネイティブにサポートします。

本質的に、Gateway API は従来の Ingress API と比較して、南北トラフィックを管理するためのより堅牢で標準化されたモデルを提供します。

## mTLS - 簡単な紹介 {#mtls---a-brief-introduction}

相互 TLS（mTLS）は、標準的な TLS を拡張し、クライアントとサーバーの _両方_ が証明書を提示して検証し、相互認証を行うことを要求します。

標準的な TLS（ウェブサイトの HTTPS のような）は、_クライアント_ に対して _サーバー_ のアイデンティティを検証します。
相互 TLS（mTLS）はさらに一歩進みます。

- クライアントがサーバーのアイデンティティを検証します（サーバーの証明書を使用）。
- サーバー _も_ クライアントのアイデンティティを検証します（クライアントの証明書を使用）。

相互 TLS が重要なのは、強力な認証を提供し、エンドツーエンドの暗号化を確保し、ゼロトラストセキュリティの原則に沿っているためです。

- 信頼されたクライアント（信頼された認証局（CA）によって署名された有効な証明書を持つもの） _のみ_ が、公開されたサービスに接続できることを保証します。

- 認証されたクライアントとサーバー（Gateway など）間のすべての通信が暗号化されます。

- 両者からの検証を要求することでゼロトラストモデルをサポートし、デフォルトで信頼することはありません。

## シナリオ {#the-scenario}

以下は、OTel Collector デプロイメントをクラスター外部に公開するための手順です。

- OTLP/gRPC レシーバーを備えたシンプルな構成の OTel Collector を Kubernetes 内にデプロイします。
- 自己署名ルート CA、サーバー証明書（Gateway 用）、クライアント証明書（外部クライアント用）を生成します。
- Kubernetes `Gateway` リソースを設定して、特定のポートでリッスンし、TLS を終端し、クライアント証明書（mTLS）を要求します。
- `GRPCRoute` を設定して、`Gateway` からの受信 gRPC トラフィックを内部の OTel Collector サービスにルーティングします。
- 外部クライアント（別の OTel Collector）を設定して、クライアント証明書を使用しルート CA を信頼しつつ、OTLP/gRPC 経由でデータをエクスポートします。

![シナリオ図](scenario-flow.png)

## セットアップ {#setup}

### ステップ 1: Gateway API CRD のインストール {#step-1-install-gateway-api-crd}

デフォルトでは、Gateway API は Kubernetes クラスターにインストールされていません。
このブログの執筆時点で、最新バージョンは [v1.2](https://gateway-api.sigs.k8s.io/implementations/v1.2/) です。
Gateway API CRD がまだ存在しない場合はインストールしてください。

```bash
kubectl get crd gateways.gateway.networking.k8s.io &> /dev/null || \
kubectl apply -f https://github.com/kubernetes-sigs/gateway-api/releases/download/v1.2.1/standard-install.yaml

# 現時点で GRPCRoute をサポートするために必要。GRPCRoute CRD が GA になれば不要になります。
kubectl kustomize "github.com/kubernetes-sigs/gateway-api/config/crd/experimental?ref=v1.2.0" | kubectl apply -f -
```

### ステップ 2: 自己署名証明書の生成 {#step-2-generate-self-signed-certificates}

クライアントとサーバー間の mTLS をセットアップするために、一連の証明書が必要です。
このデモシナリオでは、自己署名証明書を使用します。
このデモでは、クライアントとサーバーの両方の署名に同じ CA を使用します。
証明書の作成には `openssl` を使用します。
設定の詳細については `openssl` のドキュメントを参照してください。

```bash
# 変数（必要に応じてドメイン/名前を調整してください）
export ROOT_CA_SUBJ="/CN=MyDemoRootCA"
# サーバー/ゲートウェイに関連する CN/SAN を使用してください。クライアントが IP で接続する場合は、それを含めてください。
# DNS の場合は、クライアントが使用するホスト名を使用してください（例: otel.example.com）
export SERVER_HOSTNAME="otel-gateway.example.com"
export SERVER_SUBJ="/CN=${SERVER_HOSTNAME}"
export CLIENT_SUBJ="/CN=external-otel-client"

# 1. ルート CA 証明書とキーを作成
openssl req -x509 -sha256 -nodes -days 365 -newkey rsa:2048 -subj "${ROOT_CA_SUBJ}" -keyout rootCA.key -out rootCA.crt

# 2. サーバー CSR を作成し、ルート CA で署名
openssl req -newkey rsa:4096 -nodes -keyout server.key -out server.csr -subj "${SERVER_SUBJ}" \
  -addext "subjectAltName = DNS:${SERVER_HOSTNAME}" # ホスト名検証のために SAN を追加

openssl x509 -req -in server.csr -CA rootCA.crt -CAkey rootCA.key -CAcreateserial -out server.crt -days 365 -sha256 \
  -extfile <(printf "subjectAltName=DNS:${SERVER_HOSTNAME}") # 最終証明書に SAN が含まれていることを確認

# 3. クライアント CSR を作成し、ルート CA で署名
openssl req -newkey rsa:4096 -nodes -keyout client.key -out client.csr -subj "${CLIENT_SUBJ}"

openssl x509 -req -in client.csr -CA rootCA.crt -CAkey rootCA.key -CAcreateserial -out client.crt -days 365 -sha256
```

> [!WARNING]
>
> 本番環境では、公開インターネットからアクセス可能な外部向けエンドポイントに自己署名証明書を使用しないでください。
> 信頼された公開 CA（例: cert-manager を通じた Let's Encrypt）またはマネージド内部 PKI システムが発行した証明書を使用してください。
> 証明書の取得プロセスは異なりますが、Kubernetes でそれらを使用する概念は同様です。
> サーバー証明書の Common Name（CN）または Subject Alternative Name（SAN）がクライアントが接続に使用するホスト名と一致していることを確認してください。

### ステップ 3: `otel-collector` 名前空間の作成 {#step-3-create-otel-collector-namespace}

OTel Collector のセットアップを指定の名前空間にデプロイします。
さらに、使用する Gateway/サービスメッシュ実装に応じて名前空間を適切に設定できます。
たとえば、Istio を使用する場合は、Istio が名前空間内のデプロイされたワークロードと自動的に連携できるように `istio-injection:enabled` で名前空間を作成できます。

`namespace.yaml`:

```yaml
# OpenTelemetry Collector 名前空間
---
apiVersion: v1
kind: Namespace
metadata:
  name: otel-collector
  labels:
    istio-injection: enabled # Istio を使用している場合にのみ関連
```

この設定を適用します。

```bash
kubectl apply -f namespace.yaml
```

### ステップ 4: OTel Collector（サーバー）のデプロイ {#step-4-deploying-the-otel-collector-server}

シンプルな OTel Collector のデプロイメントとサービスを作成します。
この設定では、OTel Collector は受信したテレメトリーデータを出力します。
この設定はユースケースに応じて変更できます。

`otel-collector-server.yaml`:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: otel-collector-conf
  namespace: otel-collector # otel-collector 名前空間に Collector をデプロイ
data:
  config.yaml: |
    receivers:
      otlp:
        protocols:
          grpc:
            # 注意: ここには TLS 設定はありません。TLS は Gateway で終端されます。
            endpoint: 0.0.0.0:4317

    processors:
      batch:

    exporters:
      # デモ用に stdout に出力
      debug:

    service:
      pipelines:
        traces:
          receivers: [otlp]
          processors: [batch]
          exporters: [debug]
        metrics:
          receivers: [otlp]
          processors: [batch]
          exporters: [debug]
        logs:
          receivers: [otlp]
          processors: [batch]
          exporters: [debug]
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: otel-collector-server
  namespace: otel-collector # otel-collector 名前空間に Collector をデプロイ
spec:
  replicas: 1
  selector:
    matchLabels:
      app: otel-collector-server
  template:
    metadata:
      labels:
        app: otel-collector-server
    spec:
      containers:
        - name: otel-collector
          # 本番環境では、特定の最新バージョンタグを使用してください
          image: otel/opentelemetry-collector:latest
          ports:
            - containerPort: 4317 # OTLP gRPC
              name: otlp-grpc
          volumeMounts:
            - name: otel-collector-config-vol
              mountPath: /etc/otelcol
      volumes:
        - name: otel-collector-config-vol
          configMap:
            name: otel-collector-conf
---
apiVersion: v1
kind: Service
metadata:
  name: otel-collector-server-svc
  namespace: otel-collector
spec:
  selector:
    app: otel-collector-server
  ports:
    - name: grpc
      protocol: TCP
      port: 4317
      targetPort: 4317
```

この設定を適用します。

```bash
kubectl apply -f otel-collector-server.yaml
```

### ステップ 5: 証明書を Kubernetes Secret として保存 {#step-5-storing-certificates-as-kubernetes-secrets}

Gateway はクライアントを検証するために、サーバー証明書/キーと CA 証明書にアクセスする必要があります。

サーバー証明書とキーを含む Secret を作成します。
このデモでは、クライアントの署名に使用した CA 証明書も保存します。
簡便のため、otel-collector 名前空間に配置します。

```bash
kubectl create -n otel-collector secret generic otel-gateway-server-cert --from-file=tls.crt=server.crt --from-file=tls.key=server.key --from-file=ca.crt=rootCA.crt
```

### ステップ 6: Kubernetes Gateway API リソースの設定 {#step-6-configuring-the-kubernetes-gateway-api-resources}

`Gateway` と `GRPCRoute` の2つのリソースが必要です。
このデモでは簡便のため、リソースを同じ `otel-collector` 名前空間に配置します。
これはデプロイメントの構成によって変わります。

`otel-gateway-resources.yaml`:

```yaml
apiVersion: gateway.networking.k8s.io/v1
kind: Gateway
metadata:
  name: otel-gateway
  namespace: otel-collector
spec:
  gatewayClassName: istio
  listeners:
    - name: otlp-grpc-mtls
      port: 4317
      protocol: HTTPS
      hostname: 'otel-gateway.example.com'
      tls:
        mode: Terminate
        certificateRefs:
          - group: '' # Secret の Core API グループ
            kind: Secret
            name: otel-gateway-server-cert # 前のステップで Secret としてアップロードした証明書
        options:
          # この構造は、Gateway/サービスメッシュの実装によって異なる場合があります。
          # インストールした実装のドキュメントを参照してください。
          # Istio の場合、ここで TLS 終端モードを設定します。
          gateway.istio.io/tls-terminate-mode: MUTUAL
---
# OTLP/gRPC には一般的に GRPCRoute が推奨されます。
# GRPCRoute CRD（v1alpha2 または v1）がインストールされていることを確認してください。
apiVersion: gateway.networking.k8s.io/v1
kind: GRPCRoute
metadata:
  name: otel-collector-grpcroute
  # バックエンドサービスが存在する名前空間
  namespace: otel-collector
spec:
  # このルートを istio-system 名前空間の Gateway にリンクします。
  parentRefs:
    - name: otel-gateway
      namespace: otel-collector # Gateway リソースの名前空間
      sectionName: otlp-grpc-mtls # 名前で特定のリスナーにアタッチ
  # gRPC トラフィックのルーティングルールを定義します。
  rules:
    - backendRefs:
        - name: otel-collector-server-svc # 内部 OTel サービスの名前
          namespace: otel-collector # バックエンドサービスの名前空間
          port: 4317 # サービス上のターゲットポート
```

- `Gateway` CRD では、`gatewayclass` と `listeners` を設定します。
  この場合、必要な `port` と `hostname` を持つ1つの `listener` を設定します。
  ここで終端される `tls` も設定します。
  Secret としてアップロードした証明書を使用します。
  `options` ブロックは、`implementation specific` なパラメーターがある場合にそれを設定するために使用します。

- `GRPCRoute` では、Gateway と特定の `listener` を選択します。
  また、ルートがリクエストを転送するバックエンドを設定します。
  この場合は `otel-collector-server-svc` です。

> [!NOTE]
>
> mTLS の実装固有の設定のために、Gateway の `options` を使用しています。
> 現在、Gateway API には明示的な `Mutual TLS` [モード](https://gateway-api.sigs.k8s.io/reference/api-spec/1.5/spec/#tlsmodetype)がありません。
> 最新の Gateway API ドキュメントで更新情報を参照してください。

Gateway の設定を適用します。

```bash
kubectl apply -f otel-gateway.yaml
```

この時点で、Istio（またはその他の）Gateway は、ポート 4317 でリッスンし（通常は LoadBalancer Service 経由で公開）、指定されたサーバー証明書とクライアント CA を使用して mTLS を要求し、有効な gRPC トラフィックを `otel-collector-server-svc` にルーティングするように設定されているはずです。

Gateway の詳細を確認するには、以下を実行します。

```bash
# Gateway のホスト名/IP を取得
kubectl -n otel-collector get gateway otel-gateway -o jsonpath='{.status.addresses[0].value}'

# ポートを取得
kubectl -n otel-collector get gtw otel-gateway -o jsonpath='{.spec.listeners[?(@.name=="otlp-grpc-mtls")].port}'
```

`Gateway` 用に作成された Kubernetes サービスも確認できます。

```bash
kubectl -n otel-collector get svc
```

### ステップ 7: 外部 OTel Collector（クライアント）の設定 {#step-7-configuring-the-external-otel-collector-client}

セットアップをテストするために、クラスター _外部_ の OTel Collector を mTLS を使用して Gateway の外部エンドポイントにデータを送信するように設定します。

このデモでは、クライアント（OTel Collector）を Docker でローカルに実行します。

以下の `otel-client-config.yaml` の例は、CPU とメモリのメトリクスをスクレイプしてサーバーに送信するためのシンプルな設定です。

```yaml
receivers:
  # 例: データを生成するレシーバー（ホストメトリクスなど）
  hostmetrics:
    collection_interval: 10s
    scrapers:
      cpu:
      memory:
      # 必要に応じて他のスクレイパーを追加

processors:
  batch:

exporters:
  otlp/grpc:
    # 重要: Gateway の外部 IP/ホスト名とポートを指定してください。
    # <GATEWAY_EXTERNAL_IP_OR_HOSTNAME> を実際のアドレスに置き換えてください。
    # ホスト名を使用する場合、サーバー証明書のホスト名/SAN と一致する必要があります。
    # DNS が Gateway で設定されている場合、ホスト名 'otel-gateway.example.com' を使用してください。
    endpoint: <GATEWAY_EXTERNAL_IP_OR_HOSTNAME>:4317

    tls:
      # mTLS のためにクライアントの TLS 設定を有効にする必要があります。
      insecure: false # サーバー証明書が CA に対して検証されることを確認
      # サーバーを検証するための CA 証明書ファイルのパス
      ca_file: /etc/cert/rootCA.crt
      # クライアントの証明書ファイルのパス
      cert_file: /etc/cert/client.crt
      # クライアントの秘密キーファイルのパス
      key_file: /etc/cert/client.key
      # オプションですが推奨: 検証用のサーバー名を指定
      # サーバー証明書（server.crt）の CN または SAN と一致する必要があります。
      # DNS が Gateway で設定されておらず、エンドポイントが Gateway のホスト名と一致しない場合に必要です。
      server_name_override: otel-gateway.example.com
service:
  pipelines:
    # ホストメトリクスを送信する例
    metrics:
      receivers: [hostmetrics]
      processors: [batch]
      exporters: [otlp/grpc]
    # クライアントがトレースやログを生成する場合は、追加のパイプラインを追加してください。
```

クライアントを実行するには:

1.  `<GATEWAY_EXTERNAL_IP_OR_HOSTNAME>` を Istio Gateway の LoadBalancer サービスの実際の外部 IP アドレスまたは DNS 名に置き換えてください。
    ホスト名（`otel-gateway.example.com`）を使用する場合は、クライアントマシンがこのホスト名を正しい IP に解決できることを確認してください（テスト用には `/etc/hosts`、または実際の DNS を使用）。

2.  `endpoint` がサーバー証明書の SAN/CN 値と異なる場合は、`server_name_override` を使用してください。

3.  生成した `rootCA.crt`、`client.crt`、`client.key` ファイルをクライアントの Collector からアクセス可能なディレクトリに配置してください。
    このデモでは `certs` フォルダに保存します。

4.  クライアントの Collector を実行します（パスとイメージタグは必要に応じて調整してください）。

    ```bash
    # 証明書と設定が現在のディレクトリにあることを前提としたコマンドの実行

    docker run --rm -v $(pwd)/certs:/etc/cert/ \
               -v $(pwd)/otel-client-config.yaml:/etc/otelcol-contrib/config.yaml \
               otel/opentelemetry-collector-contrib:0.119.0
    ```

`opentelemetry-collector-contrib` のコンテナを、`otel-client-config.yaml` と証明書が含まれる `certs` フォルダをマウントして実行しています。

### ステップ 8: 接続のテスト {#step-8-testing-the-connection}

1.  **サーバーログの確認:** Kubernetes 内の `otel-collector-server` Pod のログを確認します。
    `debug` エクスポーターが設定されている場合、データバッチを受信していることを示すエントリが表示されるはずです。

    ```bash
    kubectl logs -n otel-collector -l app=otel-collector-server -f
    ```

2.  **クライアントログの確認:** 外部クライアントの Collector のログ（Docker コンテナの出力など）を確認します。
    `Everything is ready. Begin running and processing data.` のようなメッセージが表示されるはずです。
    接続エラーメッセージ（例: `"certificate signed by unknown authority"`、`"bad certificate"`）や `connection refused` エラーが表示された場合は、以下を確認してください。
    - Gateway の IP/ホスト名への到達性。
    - ファイアウォールルール。
    - クライアントが使用する正しい証明書（`ca_file`、`cert_file`、`key_file`）。
    - サーバー証明書の SAN/CN に一致する正しい `server_name_override`。
    - Gateway の正しい mTLS 設定（クライアント CA の検証を含む）。
    - TLS エラーの Gateway コントローラーログ（例: `istio-system` の `istio-ingressgateway` Pod ログ）。
3.  **失敗ケースのテスト:**
    - クライアントの `otlp/grpc` エクスポーター設定から `tls:` セクションを _外して_ 実行してみてください。
      Gateway によって接続が拒否されるはずです（TLS ハンドシェイクの失敗またはコネクションリセットの可能性が高い）。
    - クライアント設定の `ca_file`、`cert_file`、または `key_file` をコメントアウトしてみてください。
      接続は失敗するはずです。
    - _別の_ CA が署名した別の証明書がある場合、それをクライアント証明書として使用してみてください。
      信頼された CA によって署名されていないため、mTLS ハンドシェイク中に Gateway によって拒否されるはずです。

## 注意事項 {#caveats}

このウォークスルーでは、設定とシナリオの実行と理解を容易にするために、特定の手順を特定の方法で実行しました。
本番環境でこのセットアップを設定する際には、以下の点に注意する必要があります。

- `Self-signed` 証明書は本番環境で使用すべきでは **ありません**。
  また、クライアントに使用される `CA` 証明書は、一般的にサーバー証明書の署名に使用されるものとは異なります。
- Kubernetes Gateway API はますます多くの機能がスペックに追加され、常に進化しています。
  これらの機能の多くは現在アルファ/ベータ版であり、まもなく一般提供になります（例: `GRPCRoute`）。
  最新の Kubernetes Gateway API ドキュメントを参照してください。
- Kubernetes Gateway API は、可能な限り設定をポータブルかつ実装に依存しないものにすることを目指しています。
  スペックが成熟し進化すれば、理想的にはそうなるでしょう。
  それまでは、設定の特定の側面が実装間でわずかに異なります。
  たとえば、現在の Gateway での mTLS の設定方法です。
- 本番環境で実行する場合、`spec` の `infrastructure` ブロックを使用して、インフラストラクチャプロバイダー固有のパラメーター（たとえば `DNS`）を設定することが推奨されます。
- 本番セットアップでは、エンドツーエンドの暗号化通信が行われます。
  たとえば、Istio を使用する場合、クラスター内の Istio が管理する名前空間で実行されているすべてのコンポーネントは、相互に通信することを強制できます。
  これは [PeerAuthentication](https://istio.io/latest/docs/reference/config/security/peer_authentication/) で実現されます。
  同様の概念は他のサービスメッシュ実装でも利用可能です。
- 複数の名前空間でルートとゲートウェイを扱う場合、他の名前空間からバックエンド `services` やその他の設定などのリソースの参照が必要になることがあります。
  詳細は Gateway の [ReferenceGrant](https://gateway-api.sigs.k8s.io/reference/api-types/referencegrant/) を参照してください。

## 代替の Gateway 実装 {#alternative-gateway-implementations}

Istio（`gatewayClassName: istio`）を使用しましたが、Gateway API の核心的な利点は標準化の可能性にあります。
Contour、NGINX Gateway Fabric、HAPROXY などを使用している場合、`Gateway` と `GRPCRoute` のリソース定義は理想的には非常に似たものになります。
主な違いは以下の点です。

- `gatewayClassName` の具体的な値。
- 実装固有の機能やオプションの設定方法のわずかな違い（例: `options` 構造でのクライアント設定を指定する正確な構文）。
- 基盤となる Gateway コントローラー/プロキシがどのようにデプロイ、管理、公開されるか（例: LoadBalancer サービスの名前と名前空間）。

特に mTLS 設定の詳細については、選択した特定の Gateway API 実装のドキュメントを必ず参照してください。

## まとめ {#conclusion}

Kubernetes Gateway API は、レガシーな Ingress API に対して大幅な改善を提供し、より強力で、ポータブルで、標準化されたアプローチを提供します。
受信トラフィックを管理するための、より柔軟でロール指向な方法です。

Gateway API と相互 TLS（mTLS）を組み合わせることで、OpenTelemetry Collector のような内部サービスを安全に公開し、堅牢なクライアント認証と暗号化通信を確保できます。
