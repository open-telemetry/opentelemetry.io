---
title: コレクターの設定のベストプラクティス
linkTitle: コレクターの設定
weight: 112
default_lang_commit: 179f03bf118e1e8a3cc195ab56fc09d85c476394
cSpell:ignore: exporterhelper
---

OpenTelemetry (OTel)コレクターを設定するときは、コレクターインスタンスの安全性を向上させるために、ベストプラクティスの適用を検討してください。

## 安全な設定の作成 {#create-secure-configurations}

以下のガイドラインに沿って安全なコレクターの設定とパイプラインを保護してください。

### 設定を安全に保持する {#store-your-configuration-securely}

コレクターの設定には以下のような機密情報を含む可能性があります。

- APIトークンのような認証情報
- 秘密鍵を含むTLS証明書

暗号化されたファイルシステムやシークレットストアのような機密情報を安全に管理できるものを利用して機密情報を管理すべきです。コレクターは[環境変数の展開](/docs/collector/configuration/#environment-variables)もサポートしています。

### 暗号化と認証の利用 {#use-encryption-and-authentication}

OTelコレクターの設定には暗号化と認証を利用するべきです。

- 通信の暗号化については、[証明書の設定](/docs/collector/configuration/#setting-up-certificates)を参照してください。
- [認証](/docs/collector/configuration/#authentication)の仕組みを利用してください。

### コンポーネント数の最小化 {#minimize-the-number-of-components}

コレクターの設定で、必要なコンポーネントのみに制限することを推奨します。
コンポーネントを最小化することは攻撃対象を最小限に抑えることにもなります。

- 必要最小限のコンポーネントを利用したコレクターの作成には [OpenTelemetry Collector Builder (`ocb`)](/docs/collector/custom-collector)を利用してください
- 使用しないコンポーネントの設定は削除してください。

### 慎重に設定する {#configure-with-care}

いくつかのコンポーネントではあなたのコレクターのパイプラインのセキュリティリスクを増大させる可能性があります。

- レシーバー、エクスポーター、その他のコンポーネントは、ネットワーク接続をセキュアなチャネル経由で確立し、必要に応じて認証も行うべきです。
- レシーバーとエクスポーターは、バッファ、キュー、ペイロード、およびワーカー設定を構成パラメーターを通じて公開する場合があります。
  これらの設定が利用可能な場合、デフォルトの設定値を変更する前に慎重に進めるべきです。
  不適切にこれらの値を設定すると、OpenTelemetryコレクターが追加の攻撃ベクトルにさらされる可能性があります。

## 慎重に権限を与える {#set-permissions-carefully}

rootユーザーでの実行は避けてください。ただし、いくつかのコンポーネントでは特別な権限を必要とする場合があります。その場合は、最小権限の原則に従いその役割に必要なアクセスしかできないように確認してください。

### オブザーバー {#observers}

オブザーバーはエクステンションとして実装されます。エクステンションは、Collector の主要機能の上に機能を追加するコンポーネントの一種です。
エクステンションはテレメトリーに直接アクセスする必要はなく、パイプラインの一部でもありませんが、特別なパーミッションが必要な場合、セキュリティリスクを引き起こす可能性があります。

オブザーバーは、[receiver creator](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/receiver/receivercreator/README.md)にかわって、Kubernetes Pod、Dockerコンテナ、またはローカルのリスニングポートなどのネットワーク接続されたエンドポイントを検出します。
サービスを検出するために、オブザーバーは上位のアクセス権限を要求する場合があります。
たとえば、`k8s_observer`がKubernetes上で要求する権限については [role-based access control (RBAC) permissions](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/extension/observer/k8sobserver#setting-up-rbac-permissions) を参照してください。

## 特定のセキュリティリスクを管理する {#manage-specific-security-risks}

これらのセキュリティ上の脅威をブロックするようにコレクターを設定してください。

### DoS攻撃からの保護　{#protect-against-denial-of-service-attacks}

サーバーのようなレシーバーや拡張機能では、これらのコンポーネントのエンドポイントを、許可されたユーザーへの接続を制限するアドレスにバインドすることで、コレクターがインターネット上に公開されたり、必要以上に広いネットワークに公開されたりするのを防ぐことができます。
PodのIPや、`0.0.0.0`のかわりに`localhost`など、常に特定のインターフェイスを使用するようにしてください。
詳しくは [CWE-1327: Binding to an Unrestricted IP Address](https://cwe.mitre.org/data/definitions/1327.html) を参照してください。

コレクターv0.110.0以降、コレクターコンポーネントのすべてのサーバのデフォルトホストは `localhost` です。
以前のバージョンのコレクターでは、`component.UseLocalHostAsDefaultHost`の[feature gate](https://github.com/open-telemetry/opentelemetry-collector/tree/main/featuregate) を有効にすることで、すべてのコンポーネントでのデフォルトエンドポイントを `0.0.0.0` から `localhost` に変更してください。

DNSの設定によって`localhost`が別のIPに解決される場合は、IPv4の場合は `127.0.0.1`、IPv6の場合は `::1` のように、ループバックIPを明示的に使用してください。

gRPCポートを使用したIPv4の設定例は以下になります。

```yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 127.0.0.1:4317
```

IPv6の設定では、システムがIPv4とIPv6のループバックアドレスの両方をサポートしていることを確認し、デュアルスタック環境や、両方のプロトコルバージョンが使用されるアプリケーションでネットワークが正しく機能するようにしてください。

Docker や Kubernetes のような標準的でないネットワーキング・セットアップを持つ環境で作業している場合、`localhost` は期待通りに動作しないかもしれません。
以下の例は、OTLPレシーバーのgRPCエンドポイントのセットアップを示しています。
他のCollectorコンポーネントも同様の設定が必要な場合があります。

#### Docker {#docker}

正しいアドレスをバインドすることでDocker環境でコレクターを動かすことができます。
以下の例は、DockerでのOTLPエクスポーターの`config.yaml`です。

```yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: my-hostname:4317 # docker runコマンドと同じホスト名を指定
```

`docker run`コマンド上で、コレクターの`my-hostname`アドレスをバインドするために`--hostname`引数を使用してください。
`127.0.0.1:4567`に接続することで、Dockerネットワークの外(たとえば、ホスト上で実行されるプログラム等)からCollectorにアクセスすることができます。

以下は `docker run`コマンドの実行例です。

```shell
docker run --hostname my-hostname --name container-name -p 127.0.0.1:4567:4317 otel/opentelemetry-collector:{{% param collector_vers %}}
```

#### Docker Compose {#docker-compose}

Dockerを利用する時と同様に、正しいアドレスをバインドすることでコレクターを実行することができます。

以下は`compose.yaml`の設定例です。

```yaml
services:
  otel-collector:
    image: otel/opentelemetry-collector-contrib:{{% param collector_vers %}}
    ports:
      - '4567:4317'
```

以下はコレクターの`config.yaml`の設定例です。

```yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: otel-collector:4317 # docker composeのfileに記載のサービス名を使用。
```

同一のネットワーク上に存在する別のDockerコンテナから`otel-collector:4317`でコレクターに接続することができます。
ホスト上で動くプログラムのように、Dockerネットワークの外部からの場合は、`127.0.0.1:4567`でコレクターに接続することができます。

#### Kubernetes {#kubernetes}

もし`DaemonSet`としてコレクターを動作したい場合は、以下のように設定することで可能です。

```yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: collector
spec:
  selector:
    matchLabels:
      name: collector
  template:
    metadata:
      labels:
        name: collector
    spec:
      containers:
        - name: collector
          image: otel/opentelemetry-collector:{{% param collector_vers %}}
          ports:
            - containerPort: 4317
              hostPort: 4317
              protocol: TCP
              name: otlp-grpc
            - containerPort: 4318
              hostPort: 4318
              protocol: TCP
              name: otlp-http
          env:
            - name: MY_POD_IP
              valueFrom:
                fieldRef:
                  fieldPath: status.podIP
```

この例では、Pod自身ののIPアドレスを取得するために[Kubernetes Downward API](https://kubernetes.io/docs/concepts/workloads/pods/downward-api/)を利用し、ネットワークインターフェイスとバインドしています。
さらに、`hostPort`オプションを利用してコレクターがホスト上に公開されるようになります。
コレクターの設定は以下のようになります。

```yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: ${env:MY_POD_IP}:4317
      http:
        endpoint: ${env:MY_POD_IP}:4318
```

ノード上の任意のPodからコレクターに対して、`${MY_HOST_IP}:4317`にアクセスすることで、OTLP over gRPCで、`${MY_HOST_IP}:4318`にアクセスすることで、OTLP over gRPCで、OTLPデータを送信することができます。
`MY_HOST_IP` にはノードのIPアドレスを指定してください。
このIPアドレスは、以下のようにDownward APIから取得可能です。

```yaml
env:
  - name: MY_HOST_IP
    valueFrom:
      fieldRef:
        fieldPath: status.hostIP
```

### 機密データの洗浄 {#scrub-sensitive-data}

[プロセッサー](/docs/collector/configuration/#processors)はレシーバーとエクスポーターの間に位置するコンポーネントです。解析の前にテレメトリーを処理する責務を担っています。
`redaction`プロセッサーはバックエンドへテレメトリーを出力する前に、機密データの難読化や洗浄することができます。

[`redaction`プロセッサー](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/redactionprocessor)はスパンやログ、許可していない属性に一致しないメトリクスデータポイントの属性を削除します。
また、ブロックされた値のリストに一致する属性をマスクします。
許可されたリストにない属性は、値のチェックが行われる前に削除されます。

以下は、クレジットカード番号の値をマスクする設定例です。

```yaml
processors:
  redaction:
    allow_all_keys: false
    allowed_keys:
      - description
      - group
      - id
      - name
    ignored_keys:
      - safe_attribute
    blocked_values: # 許可されたspanの属性値をブロックするための正規表現
      - '4[0-9]{12}(?:[0-9]{3})?' # VISAクレジットカード番号
      - '(5[1-5][0-9]{14})' # MasterCardクレジットカード番号
    summary: debug
```

コレクターの設定に`redaction`プロセッサーをどのように追加するかについては、[ドキュメント](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/redactionprocessor)を参照してください。

### リソース利用の保護 {#safeguard-resource-utilization}

[ホストのベストプラクティス](../hosting-best-practices/)でリソース使用の保護を適用した後、コレクターの設定でもこれらの保護の適用を検討してください。

テレメトリーの集約やコレクターにメモリ使用の制限を設定することで、out-of-memoryエラーやスパイクの発生を防ぐことができます。
キューサイズの最適化やデータ欠損を防ぐためのメモリ使用設定の管理を行うことによってトラフィックのスパイクを防ぐこともできます。
たとえば、[`exporterhelper`](https://github.com/open-telemetry/opentelemetry-collector/blob/main/exporter/exporterhelper/README.md)を使用することで、`otlp`エクスポーターのキューサイズを管理することができます。

```yaml
exporters:
  otlp:
    endpoint: <ENDPOINT>
    sending_queue:
      queue_size: 800
```

不要なテレメトリーを除外することはコレクターリソースを保護するためのもう一つの方法になります。
コレクターインスタンスを保護するだけでなく、バックエンドの負荷を軽減することにもなります。
[`filter`プロセッサー](/docs/collector/transforming-telemetry/#basic-filtering)を使用することで、不必要なログやメトリクス、スパンを削除することができます。
以下はHTTPではなくスパンを削除する設定の例です。

```yaml
processors:
  filter:
    error_mode: ignore
    traces:
      span:
        - attributes["http.request.method"] == nil
```

また、適切なタイムアウト制限と再試行の制限をコンポーネントに設定することもできます。
これらの制限により、Collectorはメモリに過剰なデータを蓄積することなく送信エラーを処理できるようになるでしょう。

詳細は[`exporterhelper`](https://github.com/open-telemetry/opentelemetry-collector/blob/main/exporter/exporterhelper/README.md)を参照してください。

最後に、データの送信サイズを削減し、ネットワークやCPUリソース使用量を節約するためにエクスポーターでの圧縮設定の使用を検討してください。
[`otlp`エクスポーター](https://github.com/open-telemetry/opentelemetry-collector/tree/main/exporter/otlpexporter)はデフォルトで`gzip`圧縮を使用します。
