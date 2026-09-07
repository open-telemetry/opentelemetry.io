---
title: 'Collector のハードニング エピソード1: 新しいデフォルトバインドアドレス'
linkTitle: Collector の新しいデフォルトバインドアドレス
date: 2024-07-02
author: '[Pablo Baeyens](https://github.com/mx-psi) (OpenTelemetry, Datadog)'
issue: 4760
sig: Collector SIG
default_lang_commit: b7589cf40b05480bc7a2022cf2dd36cc299904fa
# prettier-ignore
cSpell:ignore: awsfirehose awsproxy awsxray Baeyens jaegerremotesampling loki remotetap sapm signalfx skywalking splunk
---

OpenTelemetry Collector は最近、[CNCF](https://www.cncf.io/) がスポンサーし、[OSTIF](https://ostif.org/) が仲介し、[7ASecurity](https://7asecurity.com/) が実施したセキュリティ監査を受けました。
このプロセスの一環として、[v0.102.1 で完全に修正された](https://github.com/open-telemetry/opentelemetry-collector/releases/tag/v0.102.1) [DoS 脆弱性](/blog/2024/cve-2024-36129/)に関するセキュリティアドバイザリを公開しました。

このセキュリティ監査は、公式の Collector ビルドを強化し、よりセキュアなデフォルト設定を実現する方法を検討するきっかけにもなりました。
監査で推奨された[いくつかの][releases-586][ベスト][core-10469][プラクティス][core-10470]の採用に取り組んでおり、コミュニティに情報を提供するために一連のブログ記事を公開する予定です。
レポートは近日中に公開される見込みですが、Collector が非常にセキュアであることが確認されたことに大変満足しており、すでに実施しているセキュアなコーディングプラクティスとプロセスが評価されたことを報告できます。

取り組んでいる変更の1つは、レシーバーや受信接続をリッスンするエクステンションなどが公開する Collector サーバーのデフォルトバインドアドレスの変更です。
v0.103.0 までは、サーバーアドレスに[未指定アドレス `0.0.0.0`](https://en.wikipedia.org/wiki/0.0.0.0) を使用してすべてのネットワークインターフェイスでリッスンするのがデフォルトの動作でした。
これはテストケースや開発環境では便利なデフォルトですが、Collector サーバーを不要なリスクにさらす可能性があるため、[本番環境での推奨プラクティスではありません](https://cwe.mitre.org/data/definitions/1327.html)。
v0.104.0 以降、すべての Collector サーバーのデフォルトバインドアドレスは `localhost` になります。

ここに至るまでには長い道のりがありました。
[CVE-2022-27664](https://github.com/advisories/GHSA-69cg-p879-7622) に関連して [v0.63.0（2022年9月）][core-6151]でこの議論を開始し、警告の追加とドキュメントの改善を行いました。
[v0.94.0（2023年9月）][core-8510]では、ユーザーが新しい動作にオプトインできるよう、フィーチャーゲート `component.UseLocalHostAsDefaultHost` を追加しました。
最終的に、このフィーチャーゲートはセキュリティ監査と [CVE-2024-36129](/blog/2024/cve-2024-36129/) をきっかけに [v0.104.0（2024年6月）][core-10352]でデフォルトで有効になりました。

## 何が変更されたか {#what-have-we-changed}

v0.104.0 以降、Collector が公開するすべてのサーバーのデフォルトバインドアドレスは `0.0.0.0` ではなく `localhost` になりました。
たとえば、OTLP レシーバーの OTLP/gRPC および OTLP/HTTP のデフォルトエンドポイントは、それぞれ `localhost:4317` と `localhost:4318` になりました。
この変更の影響を受けるコンポーネントの全リストは以下のとおりです。

- [`otlp` レシーバー](https://github.com/open-telemetry/opentelemetry-collector/tree/f306288b57856f7668e541a49d9945c3c707b7a3/receiver/otlpreceiver?from_branch=main#otlp-receiver)
- [`awsfirehose` レシーバー](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/635d4254a3018eb3ca8f1736e71fcb54f8ed6e5a/receiver/awsfirehosereceiver?from_branch=main#aws-kinesis-data-firehose-receiver)
- [`awsxray` レシーバー](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/f8bb0009b577560cf5453f12755fc3ca03bbf0b3/receiver/awsxrayreceiver?from_branch=main#aws-x-ray-receiver)
- [`influxdb` レシーバー](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/635d4254a3018eb3ca8f1736e71fcb54f8ed6e5a/receiver/influxdbreceiver?from_branch=main#influxdb-receiver)
- [`jaeger` レシーバー](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/635d4254a3018eb3ca8f1736e71fcb54f8ed6e5a/receiver/jaegerreceiver?from_branch=main#jaeger-receiver)
- [`loki` レシーバー](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/eecc5bb1d3a518a8b1000a0d43dc72926b1b7179/receiver/lokireceiver?from_branch=main#loki-receiver)
- [`opencensus` レシーバー](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/e228ef6c18aa2f05b2173f20be0578f714d0128b/receiver/opencensusreceiver#opencensus-receiver)
- [`sapm` レシーバー](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/6a2bd15cc941859767c7043a0597b8b0f6dd9f64/receiver/sapmreceiver#sapm-receiver)
- [`signalfx` レシーバー](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/635d4254a3018eb3ca8f1736e71fcb54f8ed6e5a/receiver/signalfxreceiver?from_branch=main#signalfx-receiver)
- [`skywalking` レシーバー](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/635d4254a3018eb3ca8f1736e71fcb54f8ed6e5a/receiver/skywalkingreceiver?from_branch=main#skywalking-receiver)
- [`splunk_hec` レシーバー](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/635d4254a3018eb3ca8f1736e71fcb54f8ed6e5a/receiver/splunkhecreceiver?from_branch=main#splunk-hec-receiver)
- [`zipkin` レシーバー](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/635d4254a3018eb3ca8f1736e71fcb54f8ed6e5a/receiver/zipkinreceiver?from_branch=main#zipkin-receiver)
- [`zookeeper` レシーバー](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/635d4254a3018eb3ca8f1736e71fcb54f8ed6e5a/receiver/zookeeperreceiver?from_branch=main#zookeeper-receiver)
- [`awsproxy` エクステンション](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/635d4254a3018eb3ca8f1736e71fcb54f8ed6e5a/extension/awsproxy?from_branch=main#aws-proxy)
- [`health_check` エクステンション](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/635d4254a3018eb3ca8f1736e71fcb54f8ed6e5a/extension/healthcheckextension?from_branch=main#health-check)
- [`jaegerremotesampling` エクステンション](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/635d4254a3018eb3ca8f1736e71fcb54f8ed6e5a/extension/jaegerremotesampling?from_branch=main#jaegers-remote-sampling-extension)
- [`remotetap` プロセッサー](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/635d4254a3018eb3ca8f1736e71fcb54f8ed6e5a/processor/remotetapprocessor?from_branch=main#remote-tap-processor)

不明な点がある場合は、各コンポーネントのドキュメントで新しいデフォルト値を確認してください。

[OpenTelemetry Collector Helm Chart][helm-chart] v0.47.1 以降、および OpenTelemetry Collector 公式 Docker イメージの v0.87.0 以降では、すべてのコンポーネントのデフォルト設定を更新し、エンドポイントを明示的な値に設定するようにしました。

## 自分にとってどのような影響があるか {#what-does-it-mean-to-me}

デフォルト設定に依存している場合、Collector コンポーネントでエンドポイントを明示的に設定する必要があるかもしれません。
たとえば、OTLP レシーバーで以下の設定を使用している場合を考えます。

```yaml
receivers:
  otlp:
    protocols:
      grpc:
```

`otlp::protocols::grpc::endpoint` の[設定項目](https://github.com/open-telemetry/opentelemetry-collector/blob/v0.103.0/receiver/otlpreceiver/config.md)を明示的に設定する必要があるかもしれません。

```yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: ${env:HOST_IP}:4317
```

ここで `HOST_IP` 環境変数には、使用したいバインドアドレス（たとえば、Kubernetes の `status.podIP`）を設定します。

Collector Helm Chart および Collector Docker イメージの変更により、これらのいずれかでデフォルト設定を使用している場合は影響を受けません。

## この変更にどう備えるか {#how-can-i-prepare-for-this-change}

v0.63.0 以降、Collector はエンドポイントが 0.0.0.0 アドレスを使用している場合に関連する警告をログに記録します。
アップグレード前に、この警告を確認して対処できます。
v0.94.0 から v0.103.0 までは、`component.UseLocalHostAsDefaultHost` フィーチャーゲートを[有効化][feature-gate]することで、この変更の影響を事前に確認することもできます。

この変更への対処は簡単なはずですが、影響を受けるコンポーネントの数が多いため、v0.104.0 以降は `component.UseLocalHostAsDefaultHost` フィーチャーゲートを無効化することで一時的にこの変更をオプトアウトし、自分のペースで対処を進めることができます。
このフィーチャーゲートは将来の Collector リリースで安定版としてマークされる予定のため、できるだけ早く対処することを推奨します。

## 今後の予定 {#whats-next}

セキュリティ監査で推奨されたベストプラクティスの採用に取り組みながら、コミュニティに情報を提供するためにさらにブログ記事を公開していきます。
これには、macOS での Collector バイナリのハードニングや、Collector サーバーのデフォルト動作のさらなる改善が含まれます。
今後の情報にご期待ください。

[helm-chart]: https://github.com/open-telemetry/opentelemetry-helm-charts?tab=readme-ov-file#opentelemetry-collector
[feature-gate]: https://github.com/open-telemetry/opentelemetry-collector/tree/v0.103.0/featuregate#controlling-gates
[releases-586]: https://github.com/open-telemetry/opentelemetry-collector-releases/issues/586
[core-6151]: https://github.com/open-telemetry/opentelemetry-collector/issues/6151
[core-8510]: https://github.com/open-telemetry/opentelemetry-collector/issues/8510
[core-10469]: https://github.com/open-telemetry/opentelemetry-collector/issues/10469
[core-10470]: https://github.com/open-telemetry/opentelemetry-collector/issues/10470
[core-10352]: https://github.com/open-telemetry/opentelemetry-collector/pull/10352
