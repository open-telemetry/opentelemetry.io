---
title: OBIをスタンドアロンプロセスとして実行する
linkTitle: スタンドアロン
description: OBIをLinuxのスタンドアロンプロセスとしてセットアップして実行する方法を学びます。
weight: 5
default_lang_commit: 331c76c3500213c83ace2e30a407218ddedda628
cSpell:ignore: cyclonedx
---

OBIは、他の実行中プロセスを検査できる昇格された権限を持つスタンドアロンのLinux OSプロセスとして実行できます。

## ダウンロードと検証 {#download-and-verify}

OBIは Linux（amd64 および arm64）向けのビルド済みバイナリを提供しています。
最新リリースを[リリースページ](https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation/releases)からダウンロードしてください。
各リリースには以下が含まれます。

- `obi-v<version>-linux-amd64.tar.gz` - Linux AMD64/x86_64 アーカイブ
- `obi-v<version>-linux-arm64.tar.gz` - Linux ARM64 アーカイブ
- `obi-v<version>-linux-amd64.cyclonedx.json` - AMD64 アーカイブの CycloneDX SBOM
- `obi-v<version>-linux-arm64.cyclonedx.json` - ARM64 アーカイブの CycloneDX SBOM
- `obi-v<version>-source-generated.cyclonedx.json` - ソース生成アーカイブの CycloneDX SBOM
- `obi-java-agent-v<version>.cyclonedx.json` - 組み込み Java エージェントとその Java 依存関係の CycloneDX SBOM
- `SHA256SUMS` - リリースアーカイブと SBOM アセットの検証用チェックサム

同じリリースのコンテナイメージも公開されています。
イメージの取得と署名検証の手順については、[OBI を Docker コンテナとして実行する](../docker/)を参照してください。

希望するバージョンとアーキテクチャを設定します。

```sh
# 希望するバージョンを設定（最新版は
# https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation/releases を参照）
VERSION=0.9.0

# アーキテクチャを指定
# Intel/AMD 64ビットの場合: amd64
# ARM 64ビットの場合: arm64
ARCH=amd64

# アーキテクチャに合ったアーカイブをダウンロード
wget https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation/releases/download/v${VERSION}/obi-v${VERSION}-linux-${ARCH}.tar.gz

# チェックサムをダウンロード
wget https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation/releases/download/v${VERSION}/SHA256SUMS

# アーカイブを検証
sha256sum -c SHA256SUMS --ignore-missing

# アーカイブを展開
tar -xzf obi-v${VERSION}-linux-${ARCH}.tar.gz
```

検証に成功すると、ダウンロードした各ファイルに対して `OK` の結果が表示されます。

```text
obi-v${VERSION}-linux-${ARCH}.tar.gz: OK
```

検証に失敗した場合、`sha256sum` は `FAILED` と報告します。
その場合は以下を確認してください。

- `VERSION` がダウンロードしたアーカイブと `SHA256SUMS` に一致していることを確認する
- 部分的にダウンロードされたファイルを削除して再度取得する
- そのリリースから実際にダウンロードしたファイルのみを検証する

アーカイブには以下が含まれます。

- `obi` - メインの OBI バイナリ
- `k8s-cache` - Kubernetes キャッシュバイナリ
- `LICENSE` - プロジェクトライセンス
- `NOTICE` - 法的通知
- `NOTICES/` - サードパーティのライセンスと帰属表示

> [!IMPORTANT]
>
> OBI v0.6.0 以降、Java エージェントは `obi` バイナリに組み込まれています。
> 別途 `obi-java-agent.jar` ファイルは必要ありません。
> 実行時に、OBI は組み込みの Java エージェントを `$XDG_CACHE_HOME/obi/java`（または `~/.cache/obi/java`）の下に展開してキャッシュします。
>
> キャッシュディレクトリは `obi` を実行するユーザーアカウントによって決定されます。
> `sudo` を使用する場合、キャッシュは通常 root ユーザーのキャッシュディレクトリ（たとえば `/root/.cache/obi/java`）の下に作成されますが、オーバーライドすることもできます。
> システムまたはサービスのデプロイメントでは、`XDG_CACHE_HOME` を適切な場所に設定するか（たとえば `XDG_CACHE_HOME=/var/cache/obi sudo -E obi ...`）、環境に合わせて明示的なキャッシュパスを設定してください。

## SBOM {#sboms}

CycloneDX SBOM ファイルは、サプライチェーンレビューと自動化のためのオプションのメタデータです。
OBI のインストールや実行には必要ありません。

公開されている SBOM は、バイナリアーカイブと組み込みコンポーネントの内容を [CycloneDX JSON 形式](https://cyclonedx.org/)で記述しています。
標準的な SBOM ツールを使用して、バイナリを実行せずに依存関係、ライセンス、コンポーネントを検査できます。

検査したい SBOM をダウンロードします。

```sh
# ダウンロードしたバイナリアーカイブの SBOM
wget https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation/releases/download/v${VERSION}/obi-v${VERSION}-linux-${ARCH}.cyclonedx.json

# 組み込み Java エージェントとその Java 依存関係の SBOM
wget https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation/releases/download/v${VERSION}/obi-java-agent-v${VERSION}.cyclonedx.json

# オプション: ダウンロードした SBOM ファイルも SHA256SUMS で検証
sha256sum -c SHA256SUMS --ignore-missing
```

検査コマンドの例を示します。

```sh
# アーカイブ SBOM からコンポーネント名とバージョンを一覧表示
jq '.components[] | {name, version}' obi-v${VERSION}-linux-${ARCH}.cyclonedx.json

# Grype で SBOM をスキャン
grype sbom:obi-v${VERSION}-linux-${ARCH}.cyclonedx.json

# Java エージェントの依存関係グラフを検査
jq '.components[] | {name, version}' obi-java-agent-v${VERSION}.cyclonedx.json
```

## システムへのインストール {#install-to-system}

アーカイブを展開した後、バイナリを PATH 内の場所にインストールすると、どのディレクトリからでも使用できるようになります。

以下の例では、ほとんどの Linux ディストリビューションで標準的な場所である `/usr/local/bin` にインストールします。
PATH 内の他のディレクトリにインストールすることもできます。

```bash
# バイナリを PATH 内のディレクトリに移動
sudo cp obi /usr/local/bin/

# インストールを確認
obi --version
```

## OBIのセットアップ {#set-up-obi}

1. [構成オプション](../../configure/options/)ドキュメントに従って構成ファイルを作成します。
   [OBI 構成 YAML の例](../../configure/example/)から始めることもできます。

2. OBIを特権プロセスとして実行します。

   ```bash
   sudo obi --config=<path to config file>
   ```

   OBI を PATH にインストールしていない場合は、展開したディレクトリから実行できます。

   ```bash
   sudo ./obi --config=<path to config file>
   ```

## 権限 {#permissions}

OBIが適切に機能するには、昇格された権限が必要です。
具体的に必要なケーパビリティの詳細については、[セキュリティドキュメント](../../security/)を参照してください。
