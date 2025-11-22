---
title: OpenTelemetry eBPF計装
linkTitle: OBI
description: 自動計装にOpenTelemetry eBPF計装を使用する方法を学びます。
weight: 3
cascade:
  OTEL_RESOURCE_ATTRIBUTES_APPLICATION: obi
  OTEL_RESOURCE_ATTRIBUTES_NAMESPACE: obi
  OTEL_RESOURCE_ATTRIBUTES_POD: obi
default_lang_commit: c6df1ca98613ce886d3ea5ecb7ea50d02a31f18a
cSpell:ignore: CAP_PERFMON
---

OpenTelemetryライブラリは、一般的なプログラミング言語やフレームワーク向けのテレメトリー収集機能を提供します。
しかし、分散トレーシングの導入は複雑になる場合があります。
GoやRustなどの一部のコンパイル型言語では、コードにトレースポイントを手動で追加する必要があります。

OpenTelemetry eBPF計装(OBI)は、アプリケーションのオブザーバビリティを簡単に開始するための自動計装ツールです。
OBIはeBPFを使用して、アプリケーションの実行可能ファイルとOSネットワーク層を自動的に検査し、WebトランザクションやLinux HTTP/SおよびgRPCサービスのRate Errors Duration (RED)メトリクスに関連するトレーススパンをキャプチャします。
すべてのデータキャプチャは、アプリケーションのコードや構成を変更することなく行われます。

OBIは以下の機能を提供します。

- **幅広い言語サポート**: Java、.NET、Go、Python、Ruby、Node.js、C、C++、およびRust
- **軽量**: コード変更不要、ライブラリインストール不要、再起動不要
- **効率的な計装**: トレースとメトリクスは、最小限のオーバーヘッドでeBPFプローブによってキャプチャ
- **分散トレーシング**: 分散トレーススパンがキャプチャされ、コレクターに報告
- **Kubernetesネイティブ**: Kubernetesアプリケーションに構成不要の自動計装を提供
- **暗号化された通信の可視性**: TLS/SSL経由のトランザクションを復号化せずにキャプチャ
- **コンテキスト伝搬**: サービス間でトレースコンテキストを自動的に伝搬
- **プロトコルサポート**: HTTP/S、gRPC、およびgRPC-Web
- **低カーディナリティメトリクス**: コスト削減のための低カーディナリティのPrometheus互換メトリクス
- **ネットワークのオブザーバビリティ**: サービス間のネットワークフローをキャプチャ
- **データベーストレース**: データベースクエリと接続をキャプチャ

## 要件 {#requirements}

OBIを実行するには、以下が必要です。

- Linuxカーネルバージョン5.8以降(またRedhat Enterprise Linuxの場合は4.18)
- x86_64またはarm64プロセッサー
- eBPFをサポートするランタイム(最新のLinuxディストリビューションのほとんど)
- 管理者権限(rootアクセス)または[構成リファレンス](security/)に記載されている特定のケーパビリティ

![OBI eBPF architecture](./ebpf-arch.svg)

## 互換性 {#compatibility}

OBIは以下のLinuxディストリビューションでテストされています。

- Ubuntu 20.04 LTS, 21.04, 22.04 LTSおよび23.04
- CentOS 7, 8, および9
- AlmaLinux 8, 9
- Rocky Linux 8, 9
- Red Hat Enterprise Linux 8, 9
- Debian 11, 12
- openSUSE Leap 15.3, 15.4
- SUSE Linux Enterprise Server 15 SP4

- OBIは、eBPF関連のパッチをバックポートしたKernel 4.18を搭載したRHEL8、CentOS 8、Rocky8、AlmaLinux8などのRedHatベースのディストリビューションもサポートしています。

- Goプログラムを計装するには、少なくともGo 1.17でコンパイルします。
  OBIは、現在の安定したメジャーリリースから3バージョン前までのGoのメジャーバージョンでビルドされたGoアプリケーションをサポートしています。
- OBIを実行するための管理者権限

## 制限事項 {#limitations}

OBIにも制限事項があります。
提供されるのは一般的なメトリクスとトランザクションレベルのトレーススパン情報のみです。
言語エージェントや手動による計装は依然として推奨されており、キャプチャしたいカスタム属性やイベントを指定できます。

ほとんどのeBPFプログラムは昇格された権限を必要としますが、OBIでは必要最小限の権限で実行するためのよりきめ細かい権限を指定できます。
たとえば、`CAP_DAC_READ_SEARCH`、`CAP_SYS_PTRACE`、`CAP_PERFMON`、`CAP_BPF`、`CAP_CHECKPOINT_RESTORE` などです。

一部のOBIの機能ではさらに権限が必要です。
たとえば、Linux Traffic Controlを使用したネットワークのオブザーバビリティプローブには `CAP_NET_ADMIN` が必要ですが、これはオプションで有効化する必要がある機能です。

OBIに必要なケーパビリティの包括的なリストについては、[セキュリティ、権限、およびケーパビリティ](security/)を参照してください。

## OBIを使い始める {#get-started-with-obi}

- DockerまたはKubernetesでOBIを使い始めるには、[セットアップ](setup/)ドキュメントに従ってください。
