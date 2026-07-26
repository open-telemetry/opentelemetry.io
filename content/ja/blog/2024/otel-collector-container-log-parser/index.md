---
title: OpenTelemetry Collector の新しいコンテナログパーサーの紹介
linkTitle: Collector のコンテナログパーサー
date: 2024-05-22
author: '[Christos Markou](https://github.com/ChrsMark) (Elastic)'
default_lang_commit: 4c8d57fea0147ce76633951315c40a27c55fad2e
cSpell:ignore: Christos containerd filelog Jaglowski kube Markou
---

[Filelog レシーバー](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/72087f655403778da46f4168dca2433fa0775098/receiver/filelogreceiver?from_branch=main)は、最新の[調査](/blog/2024/otel-collector-survey/#otel-components-usage)が示すように、[OpenTelemetry Collector](/docs/collector) で最もよく使われるコンポーネントの一つです。
同じ調査によると、[Kubernetes が Collector デプロイの主要なプラットフォームである（80.6%）](/blog/2024/otel-collector-survey/#deployment-scale-and-environment)ことも驚くべきことではありません。
この2つの事実から、Kubernetes 環境でのシームレスなログ収集の重要性がわかります。

現在、[filelog レシーバー](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/v0.100.0/receiver/filelogreceiver/README.md)は Kubernetes Pod からのコンテナログを解析できますが、さまざまなコンテナランタイムのフォーマットに応じてログを適切に解析するには[広範な設定](https://github.com/open-telemetry/opentelemetry-helm-charts/blob/aaa70bde1bf8bf15fc411282468ac6d2d07f772d/charts/opentelemetry-collector/templates/_config.tpl#L206-L282)が必要です。
その理由は、コンテナログはコンテナランタイムに応じてさまざまな既知のフォーマットで出力されるため、適切に解析するには特定の操作セットを実行する必要があるからです。

1. 実行時に受信ログのフォーマットを検出する。
2. フォーマット固有の特性を考慮しながら、各フォーマットに応じて解析する。
   たとえば、JSON かプレーンテキストかを判定し、タイムスタンプのフォーマットを考慮する。
3. 事前定義されたパターンに基づいて既知のメタデータを抽出する。

このような高度な一連の操作は、適切な [stanza](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/635d4254a3018eb3ca8f1736e71fcb54f8ed6e5a/pkg/stanza?from_branch=main) オペレーターを連結することで処理できます。
しかし、その結果はかなり複雑なものになります。
この設定の複雑さは、対応する [Helm チャートのプリセット](https://github.com/open-telemetry/opentelemetry-helm-charts/tree/8ba8e06485a1ce9fb137b8cfd29f2d8093c8f0ea/charts/opentelemetry-collector?from_branch=main#configuration-for-kubernetes-container-logs)を使用することで軽減できます。
しかし、プリセットがあるにもかかわらず、ユーザーにとってこのような高度な設定を維持しトラブルシュートすることは依然として困難です。

コミュニティは過去に [Kubernetes ログ収集体験の改善](https://github.com/open-telemetry/opentelemetry-collector-contrib/issues/25251)に関するイシューを提起しています。
これを実現するための一歩は、実装の詳細を手動で指定したり維持したりする必要なく、コンテナログを解析するためのシンプルかつ堅牢なオプションを提供することです。
新しい[コンテナパーサー](https://github.com/open-telemetry/opentelemetry-collector-contrib/issues/31959)の提案と実装により、これらの実装の詳細はすべてパーサーの実装内にカプセル化され処理されます。
さらにユニットテストやさまざまなフェイルオーバーロジックで実装をカバーできるようになったことは、コンテナログ解析における大きな改善を示しています。

## コンテナログの見た目 {#how-container-logs-look-like}

まず、世の中で見られるさまざまなコンテナログフォーマットを簡単に振り返りましょう。

- Docker コンテナログ：

  `{"log":"INFO: This is a docker log line","stream":"stdout","time":"2024-03-30T08:31:20.545192187Z"}`

- cri-o ログ：

  `2024-04-13T07:59:37.505201169-05:00 stdout F This is a cri-o log line!`

- Containerd ログ：

  `2024-04-22T10:27:25.813799277Z stdout F This is an awesome containerd log line!`

cri-o と containerd のログフォーマットはかなり似ています（どちらも CRI ロギングフォーマットに従っています）が、タイムスタンプのフォーマットに小さな違いがあります。

これら3つの異なるフォーマットを適切に処理するには、[コンテナパーサーオペレーターのイシュー](https://github.com/open-telemetry/opentelemetry-collector-contrib/issues/31959)で確認できるように、3つの異なる [stanza](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/635d4254a3018eb3ca8f1736e71fcb54f8ed6e5a/pkg/stanza?from_branch=main) オペレーターのルートが必要です。

さらに、CRI フォーマットではパーシャルログが出力されることがあり、まずそれらを1つに結合する必要があります。

```text
2024-04-06T00:17:10.113242941Z stdout P This is a very very long line th
2024-04-06T00:17:10.113242941Z stdout P at is really, really, long and spa
2024-04-06T00:17:10.113242941Z stdout F ns across multiple log entries
```

理想的には、パーサーが実行時にフォーマットを自動検出し、ログ行を適切に解析できることが望まれます。
コンテナパーサーがこれを実現してくれることを後ほど確認します。

## 属性の処理 {#attribute-handling}

コンテナログファイルは特定の命名パターンに従っており、解析時に有用なメタデータ情報を抽出できます。
たとえば、`/var/log/pods/kube-system_kube-scheduler-kind-control-plane_49cc7c1fd3702c40b2686ea7486091d3/kube-scheduler/1.log` から、Namespace、Pod の名前と UID、コンテナの名前を抽出できます。

このメタデータを抽出した後、[セマンティック規約](/docs/specs/semconv/resource/k8s/)に従って適切な属性を使用し、正しく格納する必要があります。
この処理もパーサーの実装内にカプセル化でき、ユーザーが手動で定義する必要がなくなります。

## 新しいコンテナパーサーの使い方 {#using-the-new-container-parser}

これらすべてを踏まえて、コンテナパーサーは次のように設定できます。

```yaml
receivers:
  filelog:
    include_file_path: true
    include:
      - /var/log/pods/*/*/*.log
    operators:
      - id: container-parser
        type: container
```

この設定だけでログ行を適切に解析し、すべての有用な Kubernetes メタデータを抽出できます。
必要な設定がどれほど少なくなったかは明らかです。
[元の提案](https://github.com/open-telemetry/opentelemetry-collector-contrib/issues/31959)で指摘されたように、オペレーターの組み合わせを使用すると約69行の設定が必要になっていました。

ログ行 `{"log":"INFO: This is a docker log line","stream":"stdout","time":"2024-03-30T08:31:20.545192187Z"}` が `/var/log/pods/kube-system_kube-controller-kind-control-plane_49cc7c1fd3702c40b2686ea7486091d6/kube-controller/1.log` に書き込まれた場合、次のようなログエントリが生成されます。

```json
{
  "timestamp": "2024-03-30 08:31:20.545192187 +0000 UTC",
  "body": "INFO: This is a docker log line",
  "attributes": {
    "time": "2024-03-30T08:31:20.545192187Z",
    "log.iostream": "stdout",
    "log.file.path": "/var/log/pods/kube-system_kube-controller-kind-control-plane_49cc7c1fd3702c40b2686ea7486091d6/kube-controller/1.log"
  },
  "resource": {
    "attributes": {
      "k8s.pod.name": "kube-controller-kind-control-plane",
      "k8s.pod.uid": "49cc7c1fd3702c40b2686ea7486091d6",
      "k8s.container.name": "kube-controller",
      "k8s.container.restart_count": "1",
      "k8s.namespace.name": "kube-system"
    }
  }
}
```

フォーマットを定義する必要がないことに注目してください。
パーサーがフォーマットを自動検出し、それに応じてログを解析します。
cri-o や containerd ランタイムが生成するパーシャルログも、特別な設定なしに適切に再結合されます。

これは非常に便利です。
ユーザーとしてフォーマットの指定を気にする必要がなく、異なる環境ごとに異なる設定を維持する必要もないからです。

## 実装の詳細 {#implementation-details}

このパーサーオペレーターを実装するにあたり、コードの大部分は新規に書かれましたが、パーシャルログの解析には recombine オペレーターを内部で再利用できました。
これを実現するために小規模なリファクタリングが必要でしたが、既存のテスト済みコンポーネントを再利用する機会が得られました。

この機能の実装に関する議論の中で、ある疑問が浮かびました。
_なぜプロセッサーではなくオペレーターとして実装するのか。_

基本的な理由の一つは、プロセッサーに到着するログレコードの順序が保証されないことです。
しかし、パーシャルログの解析を適切に処理するには、この順序を保証する必要があります。
そのため、現時点ではオペレーターとして実装することが正しい選択でした。
さらに現時点では、収集時にできるだけ多くの処理を行うことが[推奨されており](https://github.com/open-telemetry/opentelemetry-collector-contrib/issues/32080#issuecomment-2035301178)、堅牢な解析機能を持つことでそれが可能になります。

実装に関する議論の詳細は、対応する [GitHub イシュー](https://github.com/open-telemetry/opentelemetry-collector-contrib/issues/31959)とその関連・リンクされた PR で確認できます。

最後に、この具体的なコンテナパーサーの例から、改善の余地があることや、将来的に既知のログフォーマットを持つ一般的な技術に対してさらに最適化できる可能性があることがわかります。

## まとめ：filelog レシーバーでコンテナログ解析がより簡単に {#conclusion-container-logs-parsing-is-now-easier-with-filelog-receiver}

コンテナパーサーについてもっと知りたい方は、公式[ドキュメント](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/ae0d64c4c2131c7a4308417fa9549d984347dadc/pkg/stanza/docs/operators/container.md?from_branch=main)をご覧ください。
試してみたら、ぜひ感想をお聞かせください。
CNCF の公式 [Slack ワークスペース](https://slack.cncf.io/)、特に `#otel-collector` チャンネルからお気軽にご連絡ください。

## 謝辞 {#acknowledgements}

パーサーの実装をレビューし、貴重なフィードバックを提供してくれた [Daniel Jaglowski](https://github.com/djaglowski) に感謝します！
