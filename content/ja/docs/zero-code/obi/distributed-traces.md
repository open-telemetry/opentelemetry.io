---
title: OBI による分散トレース
linkTitle: 分散トレース
description: OBI の分散トレースサポートについて学びます。
weight: 22
default_lang_commit: 813498074d85258c7180d137ace9e272d0149353
cSpell:ignore: asyncio uvloop
---

## はじめに {#introduction}

OBI はアプリケーションの分散トレースをサポートしますが、いくつかの制限とカーネルバージョンの制約があります。

分散トレーシングは [W3C `traceparent`](https://www.w3.org/TR/trace-context/) ヘッダー値の伝搬を通じて実装されています。
`traceparent` のコンテキスト伝搬は自動的に行われ、特に操作や設定は不要です。

OBI は受信したトレースコンテキストヘッダー値を読み取り、プログラムの実行フローを追跡し、送信される HTTP/gRPC リクエストに `traceparent` フィールドを自動的に追加することでトレースコンテキストを伝搬します。
アプリケーションがすでに送信リクエストに `traceparent` フィールドを追加している場合、OBI は自前で生成したトレースコンテキストではなく、その値をトレーシングに使用します。
受信側で `traceparent` コンテキスト値が見つからない場合、OBI は W3C 仕様にしたがって新たに生成します。

## 互換性 {#compatibility}

OBI は以下の構成で分散トレーシングとコンテキスト伝搬をサポートします。

| 分野                                  | サポートされるバージョンや環境                                          | 備考                                                                                                                                                                                                                                                  |
| :------------------------------------ | :---------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ネットワークレベルのコンテキスト伝搬  | [OBI 互換性要件](/docs/zero-code/obi/#compatibility)を満たす Linux 環境 | HTTP トラフィックではプログラミング言語を問わず動作します。HTTPS の場合、伝搬は他の OBI で計装されたサービス間に限定され、プロキシや L7 ロードバランサーによって途切れる可能性があります。gRPC と HTTP/2 はネットワークレベルではサポートされません。 |
| Go ライブラリレベルのコンテキスト伝搬 | Go `1.18+`                                                              | 最大 3 階層のネストされた goroutine までコンテキスト伝搬をサポートします。この分散トレーシング機能は、一般的な Go ライブラリレベル計装よりも最小バージョン要件が高くなっています。                                                                    |
| Node.js の async hooks                | Node.js `8.0+`                                                          | `SIGUSR1` のカスタムハンドリングがコンテキスト伝搬を妨げる可能性があります。                                                                                                                                                                          |
| Ruby Puma                             | Puma `5.0+` で提供される Ruby アプリケーション                          | コンテキスト伝搬サポートには Puma サーバーが必要です。                                                                                                                                                                                                |
| Java スレッドプール                   | JDK `8+`                                                                | 文書化された追加のランタイム制約はありません。                                                                                                                                                                                                        |
| Python asyncio                        | `uvloop` 付きの Python `3.9+`                                           | コンテキスト伝搬サポートには `uvloop` イベントループが必要です。                                                                                                                                                                                      |

ここに記載のバージョンは、OBI が分散トレース機能で明示的にサポートするバージョンです。
これ以外のバージョンでも動作する可能性はありますが、特に明記されない限り、文書化されたサポート範囲には含まれません。
特に、ここでの Go `1.18+` 要件は分散トレーシングとコンテキスト伝搬に適用されるものであり、他の OBI Go ライブラリレベル計装の最小バージョンはこれより低い値です。

## 実装 {#implementation}

トレースコンテキストの伝搬は、2 つの異なる方法で実装されています。

1. 送信ヘッダー情報をネットワークレベルで書き込む
2. Go の場合は、ヘッダー情報をライブラリレベルで書き込む

サービスのプログラミング言語に応じて、OBI はこれらのコンテキスト伝搬アプローチのいずれか、または両方を使用します。
eBPF でメモリに書き込むことはカーネル設定や OBI に付与された Linux システムケーパビリティに依存するため、複数のアプローチを使ってコンテキスト伝搬を実装しています。
このトピックの詳細については、KubeCon NA 2024 のトーク [So You Want to Write Memory with eBPF?](https://www.youtube.com/watch?v=TUiVX-44S9s) を参照してください。

**ネットワークレベル**のコンテキスト伝搬はデフォルトで**無効**になっており、環境変数 `OTEL_EBPF_BPF_CONTEXT_PROPAGATION=all` を設定するか、OBI 設定ファイルを次のように変更することで有効化できます。

```yaml
ebpf:
  context_propagation: 'all'
```

### ネットワークレベルでのコンテキスト伝搬 {#context-propagation-at-network-level}

ネットワークレベルでのコンテキスト伝搬は、送信される HTTP ヘッダーおよび TCP/IP パケットレベルにトレースコンテキスト情報を書き込むことで実装されています。
HTTP のコンテキスト伝搬は、他の OpenTelemetry ベースのトレーシングライブラリと完全に互換性があります。
つまり、OBI で計装されたサービスは、OpenTelemetry SDK で計装されたサービスとの間で送受信されるトレース情報を正しく伝搬できます。
ネットワークパケットの調整には [Linux Traffic Control (TC)](<https://en.wikipedia.org/wiki/Tc_(Linux)>) を使用しているため、Linux Traffic Control を使う他の eBPF プログラムが OBI と適切にチェーンする必要があります。
Cilium CNI に関する特別な考慮事項については、[Cilium 互換性](../cilium-compatibility/)ガイドを参照してください。

TLS で暗号化されたトラフィック (HTTPS) では、OBI は送信される HTTP ヘッダーにトレース情報を注入できないため、かわりに TCP/IP パケットレベルに情報を注入します。
この制限により、OBI は他の OBI で計装されたサービスにのみトレース情報を送信できます。
L7 プロキシやロードバランサーは元のパケットを破棄して下流で再送するため、TCP/IP のコンテキスト伝搬を妨げます。
OpenTelemetry SDK で計装されたサービスからの受信トレースコンテキスト情報の解析は引き続き機能します。

gRPC と HTTP/2 はネットワークレベルではサポートされません。

さらに細かい制御が必要な場合、`context_propagation` には `headers`、`tcp`、`headers,tcp` も指定できます。
`http` は `headers` のエイリアスとして受け付けられます。

この種類のコンテキスト伝搬は任意のプログラミング言語で機能し、OBI を `privileged` モードで実行したり `CAP_SYS_ADMIN` を付与したりする必要はありません。
詳細については、[分散トレースとコンテキスト伝搬](../configure/metrics-traces-attributes/)の設定セクションを参照してください。

#### Kubernetes での設定 {#kubernetes-configuration}

ネットワークレベルの分散トレーシングをサポートする状態で OBI を Kubernetes 上にデプロイする推奨方法は、`DaemonSet` としてデプロイすることです。

次の `Kubernetes` 設定を使用する必要があります。

- OBI はホストネットワークアクセス (`hostNetwork: true`) 付きの `DaemonSet` としてデプロイする必要があります。
- ホストの `/sys/fs/cgroup` パスをローカルの `/sys/fs/cgroup` パスとしてボリュームマウントする必要があります。
- OBI コンテナに `CAP_NET_ADMIN` ケーパビリティを付与する必要があります。

次の YAML スニペットは OBI デプロイ設定の例です。

```yaml
spec:
  serviceAccount: obi
  hostPID: true # <-- 重要。DaemonSet モードでは OBI がすべての監視対象プロセスを検出するために必要
  hostNetwork: true # <-- 重要。DaemonSet モードでは OBI がすべてのネットワークパケットを参照するために必要
  dnsPolicy: ClusterFirstWithHostNet
  containers:
    - name: obi
      resources:
        limits:
          memory: 120Mi
      terminationMessagePolicy: FallbackToLogsOnError
      image: 'docker.io/otel/ebpf-instrument:main'
      imagePullPolicy: 'Always'
      env:
        - name: OTEL_EXPORTER_OTLP_ENDPOINT
          value: 'http://otelcol:4318'
        - name: OTEL_EBPF_KUBE_METADATA_ENABLE
          value: 'autodetect'
        - name: OTEL_EBPF_CONFIG_PATH
          value: '/config/obi-config.yml'
      securityContext:
        runAsUser: 0
        readOnlyRootFilesystem: true
        capabilities:
          add:
            - BPF # <-- 重要。ほとんどの eBPF プローブが正しく動作するために必要。
            - SYS_PTRACE # <-- 重要。OBI がコンテナの名前空間にアクセスし、実行可能ファイルを検査することを許可。
            - NET_RAW # <-- 重要。OBI が HTTP リクエスト用のソケットフィルターを使用することを許可。
            - CHECKPOINT_RESTORE # <-- 重要。OBI が ELF ファイルを開くことを許可。
            - DAC_READ_SEARCH # <-- 重要。OBI が ELF ファイルを開くことを許可。
            - PERFMON # <-- 重要。OBI が BPF プログラムをロードすることを許可。
            - NET_ADMIN # <-- 重要。OBI が HTTP および TCP のコンテキスト伝搬情報を注入することを許可。
      volumeMounts:
        - name: cgroup
          mountPath: /sys/fs/cgroup # <-- 重要。OBI が新規ソケットを監視して送信リクエストを追跡することを許可。
        - mountPath: /config
          name: obi-config
  tolerations:
    - effect: NoSchedule
      operator: Exists
    - effect: NoExecute
      operator: Exists
  volumes:
    - name: obi-config
      configMap:
        name: obi-config
    - name: cgroup
      hostPath:
        path: /sys/fs/cgroup
```

OBI の `DaemonSet` でローカルボリュームパスとして `/sys/fs/cgroup` がマウントされていない場合、一部のリクエストでコンテキスト伝搬が行われないことがあります。
このボリュームパスは、新しく作成されたソケットをリッスンするために使用されます。

#### カーネルバージョンの制限 {#kernel-version-limitations}

ネットワークレベルでのコンテキスト伝搬の受信ヘッダー解析は、BPF ループの追加と利用のため、通常はカーネル 5.17 以降を必要とします。

RHEL 9.2 などの一部のパッチ済みカーネルでは、この機能がバックポートされている場合があります。
`OTEL_EBPF_OVERRIDE_BPF_LOOP_ENABLED` を設定すると、お使いのカーネルがこの機能を含むものの 5.17 より低いバージョンである場合に、カーネルチェックをスキップできます。

### ライブラリレベルで計装する Go のコンテキスト伝搬 {#go-context-propagation-by-instrumenting-at-library-level}

この種類のコンテキスト伝搬は Go アプリケーションでのみサポートされており、eBPF のユーザーメモリ書き込みサポート (`bpf_probe_write_user`) を使用します。
このアプローチの利点は、HTTP/HTTP2/HTTPS および gRPC で(一部の制限はあるものの)動作することですが、`bpf_probe_write_user` の使用には OBI に `CAP_SYS_ADMIN` を付与するか、`privileged` コンテナとして実行するよう設定する必要があります。

#### Go の手動計装との統合 {#integration-with-go-manual-instrumentation}

OBI は [Auto SDK](/docs/zero-code/go/autosdk) を使用した手動スパンと自動的に統合されます。
詳細は Auto SDK のドキュメントを参照してください。

#### カーネル integrity モードの制限 {#kernel-integrity-mode-limitations}

送信される HTTP/gRPC リクエストヘッダーに `traceparent` 値を書き込むため、OBI は [**bpf_probe_write_user**](https://www.man7.org/linux/man-pages/man7/bpf-helpers.7.html) eBPF ヘルパーを使ってプロセスメモリに書き込む必要があります。
カーネル 5.14 以降 (5.10 系にもフィックスがバックポート) では、Linux カーネルが `integrity` **lockdown** モードで動作している場合、このヘルパーは保護され(BPF プログラムから利用不可)になります。
カーネル integrity モードは、カーネルで [**セキュアブート**](https://wiki.debian.org/SecureBoot)が有効になっている場合は通常デフォルトで有効になりますが、手動で有効化することもできます。

OBI は `bpf_probe_write_user` ヘルパーを利用できるかを自動的に確認し、カーネル設定が許可している場合にのみコンテキスト伝搬を有効にします。
Linux カーネルの **lockdown** モードは次のコマンドで確認できます。

```shell
cat /sys/kernel/security/lockdown
```

このファイルが存在し、モードが `[none]` 以外である場合、OBI はコンテキスト伝搬を実行できず、分散トレーシングは無効になります。

#### コンテナ化環境(Kubernetes を含む)における Go の分散トレーシング {#distributed-tracing-for-go-in-containerized-environments-including-kubernetes}

カーネル **lockdown** モードの制限により、**OBI の Docker コンテナ**ではホストシステムから `/sys/kernel/security/` ボリュームを Docker や Kubernetes の設定ファイルでマウントする必要があります。
これにより、OBI は Linux カーネルの **lockdown** モードを正しく判定できます。
以下に、OBI が **lockdown** モードを判定するのに十分な情報を持つようにする Docker Compose 設定の例を示します。

```yaml
services:
  ...
  obi:
    image: 'docker.io/otel/ebpf-instrument:main'
    environment:
      OTEL_EBPF_CONFIG_PATH: "/configs/obi-config.yml"
    volumes:
      - /sys/kernel/security:/sys/kernel/security
      - /sys/fs/cgroup:/sys/fs/cgroup
```

`/sys/kernel/security/` ボリュームがマウントされていない場合、OBI は Linux カーネルが integrity モードで動作していないものとみなします。

### uvloop を使用した Python asyncio {#python-asyncio-with-uvloop}

OBI は v0.7.0 以降、[`uvloop`](https://github.com/MagicStack/uvloop) 上で動作する Python asyncio のワークロードに対するコンテキスト伝搬をサポートしています。
これにより、標準の `asyncio` サポートに加え、`uvloop` イベントループを使用する非同期 Python サービスの分散トレーシングが可能になります。

ネットワークレベルでのコンテキスト伝搬は `uvloop` 上で動作する Python アプリケーションにも適用され、OBI は非同期処理に対してトレースコンテキストを自動的に計装・伝搬できます。
コンテキスト伝搬を有効にすること以外に、追加の設定は不要です(詳細は[はじめに](#introduction)を参照)。

OBI を Python asyncio と `uvloop` で使うには、お使いの Python アプリケーションがイベントループ実装として `uvloop` を使用するように構成されていることを確認してください。
