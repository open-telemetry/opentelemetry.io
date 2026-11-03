---
title: 独自の Collector をビルドして必要なリソース検出器だけを含める
linkTitle: 独自の Collector をビルドして必要なリソース検出器だけを含める
date: 2026-10-29
author: >-
  [Alex Boten](https://github.com/codeboten) (Grafana Labs)
issue: 12217
sig: Collector SIG
default_lang_commit: 4b9a057a2bfb37e1ff1aff5b4dd4c7da363d7a86
cSpell:ignore: otelconf trimpath
---

独自の OpenTelemetry Collector ディストリビューションをビルドする理由は数多くあります。
既存のディストリビューションは幅広く役立つように設計されているため、個々のデプロイメントで使用するよりもはるかに多くのコンポーネントが含まれています。
独自にビルドすることで、必要なコンポーネントだけを選択し、独自のカスタムコンポーネントを追加し、本番環境で実行するバイナリに含まれるものを正確にコントロールできます。

私が独自のディストリビューションをビルドすることを好む理由のひとつは、配布するバイナリのサイズを制限し、含まれる依存関係を最小限に抑えるためです。
依存関係が少なければ、バイナリは小さくなり、攻撃対象領域も小さくなり、脆弱性が公開された際に追跡すべきサードパーティモジュールも少なくなります。
[OpenTelemetry Collector Builder（ocb）](/docs/collector/extend/ocb/)がこれを可能にします。YAML でマニフェストファイルを書いて必要なコンポーネントを選択すると、ocb がそれらをコンパイルして最終的なバイナリを生成します。

## リソース検出器 {#resource-detectors}

コンポーネントを制限するのは素晴らしいことですが、あるユーザーが[最近報告した](https://github.com/open-telemetry/opentelemetry-collector/issues/16075)ように、リソース検出器は使わない依存関係でバイナリのサイズを肥大化させる可能性があります。
リソース検出器は、プロセスが生成するテレメトリーに[リソース属性を自動的に注入する](/docs/specs/otel/resource/sdk/#resource-detector)ために使用されます。
クラウド環境では、アプリケーションやサービスのデプロイメントに関するできるだけ多くの情報を取得したい場合に非常に有用です。

問題は、異なる環境（さまざまなクラウドプロバイダー、コンテナランタイムなど）の検出器がそれぞれ独自の依存関係を持ち込むことです。
リソース検出プロセッサーのようなリソース検出をサポートするコンポーネントを選択すると、たとえ1つの環境でしか実行しない場合でも、すべての検出器がコンパイルされます。

さらに、Collector はバージョン v0.128.0 以降、内部テレメトリーに [OpenTelemetry Configuration Schema](https://github.com/open-telemetry/opentelemetry-configuration/) のサポートを含んでいます。
これは [otelconf](https://pkg.go.dev/go.opentelemetry.io/contrib/otelconf/v0.3.0) パッケージを介して行われており、このパッケージもリソース検出器をサポートしています。
このパッケージは、リソース検出プロセッサーが含まれていなくても Collector にコンパイルされます。
これまで、マニフェストには「これらの検出器だけが必要」と指定する方法がありませんでした。

## Go ビルドフラグの使用 {#using-go-build-flags}

ocb は通常の Go プログラムを生成するため、標準的な Go ツールで結果をすでにトリミングできます。
たとえば、`-ldflags="-s -w"` でデバッグ情報とシンボルテーブルを除去し、`-trimpath` でローカルファイルシステムのパスを削除すれば、バイナリのサイズが小さくなります。
これらはすでに ocb のデフォルトであり、必要に応じてコマンドラインフラグで上書きできます。

ただし、これらのフラグはコンパイルされたものを縮小するだけです。
バイナリがまだインポートしているコードを除去することはできないため、リソース検出器の問題は解決しません。
ビルドタグはビルドからコードを除外できますが、依存先のコードがビルドタグを提供している場合に限ります。
幸い、[otelconf](https://github.com/open-telemetry/opentelemetry-go-contrib/pull/9818) と[リソース検出プロセッサー](https://github.com/open-telemetry/opentelemetry-collector-contrib/issues/47218)の両方への更新により、検出器をコンパイル時に除外できるようになりました。
たとえば、以下の設定はシステムリソース検出器を除外します。

```yaml
dist:
  module: github.com/open-telemetry/opentelemetry-collector-releases/core
  name: otelcol
  description: OpenTelemetry Collector
  version: 0.163.1
  output_path: ./_build
  build_tags: 'omit_detector_system'
```

各検出器は `omit_` フラグで無効化できます。これにより、Collector はデフォルトですべての検出器を含み続け、既存の動作との後方互換性を維持できます。
これはエンドユーザーに大きな柔軟性を提供しますが、設定が煩雑になる可能性があります。
以下は、現在利用可能なすべての検出器を無効化する例です。

```yaml
dist:
  name: otelcol-custom
  description: My Custom Collector
  version: 0.199.0
  build_tags: 'omit_detector_akamai,omit_detector_alibaba_ecs,omit_detector_aws_ec2,omit_detector_aws_ecs,omit_detector_aws_eks,omit_detector_aws_elastic_beanstalk,omit_detector_aws_lambda,omit_detector_azure,omit_detector_azure_aks,omit_detector_azure_appservice,omit_detector_azure_containerapps,omit_detector_azure_functions,omit_detector_azure_vm,omit_detector_consul,omit_detector_digitalocean,omit_detector_docker,omit_detector_dynatrace,omit_detector_env,omit_detector_gcp,omit_detector_heroku,omit_detector_hetzner,omit_detector_ibmcloud_classic,omit_detector_ibmcloud_vpc,omit_detector_k8s_api,omit_detector_kubeadm,omit_detector_openshift,omit_detector_openstack_nova,omit_detector_oraclecloud,omit_detector_scaleway,omit_detector_system,omit_detector_tencent_cvm,omit_detector_upcloud,omit_detector_vultr'
...
processors:
  - gomod:
      github.com/open-telemetry/opentelemetry-collector-contrib/processor/resourcedetectionprocessor
      v0.163.0
...
```

## 新しい OCB 設定 {#new-ocb-configuration}

Collector と [ocb](https://github.com/open-telemetry/opentelemetry-collector-releases/releases#release-cmd/builder/v0.163.1) の [v0.163.1 リリース](https://github.com/open-telemetry/opentelemetry-collector-releases/releases#release-v0.163.1)では、より少ない設定でリソース検出器をフィルタリングしたいユーザーもサポートするようになりました。
これは Configuration Schema で定義された設定に従います。以下の例では、`resource` ブロックで設定された検出器以外のすべてを除外します。

```yaml
dist:
  name: otelcol-custom
  description: My Custom Collector
  version: 0.199.0
  resource:
    detection:
      detectors:
        - env:
        - system:
...
processors:
  - gomod:
      github.com/open-telemetry/opentelemetry-collector-contrib/processor/resourcedetectionprocessor
      v0.163.0
...
```

必要な検出器だけをコンパイルに含めることで、実行しない環境の依存関係を取り込むことを回避できます。
どの程度の違いがあるのでしょうか。
以下は、公開されている OpenTelemetry Collector Kubernetes ディストリビューションの[マニフェスト](https://github.com/open-telemetry/opentelemetry-collector-releases/blob/e3bd087aedd311e3b1a5cdbb4c4f82043f02f1f2/distributions/otelcol-k8s/manifest.yaml)を、上記のリソース設定ありとなしで使用した結果です。

```sh
$ ocb --config ./manifest.yaml
$ ls -alh ./_build/otelcol-k8s
-rwxr-xr-x@ 1 alexboten  alexboten   182M Oct 16 14:25 ./_build/otelcol-k8s

$ ocb --config ./manifest-less-detectors.yaml
$ ls -alh ./_build/otelcol-k8s-less-detectors
-rwxr-xr-x@ 1 alexboten  alexboten   147M Oct 16 14:30 ./_build/otelcol-k8s-less-detectors
```

バイナリは約20%小さくなり、両者の依存関係を比較すると、リストは13パッケージ減少しています。

```sh
$ go version -m ./_build/otelcol-k8s | grep -w dep | sort > /tmp/deps-all-detectors.txt
$ go version -m ./_build/otelcol-k8s-less-detectors | grep -w dep | sort > /tmp/deps-less-detectors.txt
$ diff --suppress-common-lines /tmp/deps-all-detectors.txt /tmp/deps-less-detectors.txt
3d2
<       dep     cloud.google.com/go/compute     v1.72.0 h1:cwmwK/ADu7G1DNRN2Dt+qTpdg1hrAqzArBSmgSFumXE=
64d62
<       dep     github.com/digitalocean/go-metadata     v0.0.0-20250129100319-e3650a3df44b      h1:2EkxDInMJ3ii8mk8kZs0Qq75JpsvNOOoa5etBJluzbI=
178d175
<       dep     github.com/linode/go-metadata   v0.3.1  h1:F34TL9aF2qNDEViTOxFf9cXOMrdhckczVg3T80h1XZY=
228d224
<       dep     github.com/open-telemetry/opentelemetry-collector-contrib/internal/aws/ecsutil  v0.163.0        h1:U8O65C/kBbHdsFNfCU3PG8wDn3llm2TXJafCOw9HOA4=
330d325
<       dep     github.com/stretchr/objx        v0.5.3  h1:jmXUvGomnU1o3W/V5h2VEradbpJDwGrzugQQvL0POH4=
429,432d423
<       dep     go.opentelemetry.io/contrib/detectors/aws/elasticbeanstalk      v0.19.0 h1:U5lXYh/n93SXxBOvBp9B1e1AeC+Nc5j/VYna6cBP5qI=
<       dep     go.opentelemetry.io/contrib/detectors/azure/azureappservice     v0.19.0 h1:VKQWNR6IxVq9DyZxsGEciogNo8wQST3IeFw7Dp0jtV0=
<       dep     go.opentelemetry.io/contrib/detectors/azure/azurecontainerapps  v0.19.0 h1:jod9iGbB4p8smBQ0IRILOXq444KGnvBMHDJF6jqVDTo=
<       dep     go.opentelemetry.io/contrib/detectors/azure/azurefunctions      v0.19.0 h1:Dn5+LcOW0qvxP/2eNDZr3HA+RoJe3L/UhjwWAEFzPz0=
435,437d425
<       dep     go.opentelemetry.io/contrib/detectors/hetzner   v0.19.0 h1:bt2D4vPOIxDjgvZiBQ69UhMmWR7+K7TbXwv9c25+lQ4=
<       dep     go.opentelemetry.io/contrib/detectors/ibmcloud/vpc      v0.19.0 h1:jxs+/EjbVFUyPmqWWF/4FZ8mzdKrjcjTE9FLAuK8g/c=
<       dep     go.opentelemetry.io/contrib/detectors/vultr     v0.19.0 h1:xFmRazM+v0Kbk7YbkgeX5JajCL5HC+U6cGN3gbpow6k=
487d474
<       dep     google.golang.org/genproto      v0.0.0-20260715232425-e75dac1f907d      h1:C9v1o0/4quuhOAfmRXA2j+we0PqZIp8traLdeogF3Ms=
```

## 試してみよう {#try-it-out}

ocb の最新リリースにアップデートし、マニフェストに検出器のフィルタリングを追加して、リビルドしてください。
問題が発生した場合や依存関係をさらに削減するアイデアがある場合は、[opentelemetry-collector](https://github.com/open-telemetry/opentelemetry-collector) リポジトリでイシューを作成するか、[CNCF Slack](https://slack.cncf.io) の `#otel-collector-dev` チャンネルで見つけてください。
