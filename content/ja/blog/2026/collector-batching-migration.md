---
title: 'コレクターのバッチプロセッサーの非推奨化'
linkTitle: 'コレクターのバッチプロセッサーの非推奨化'
date: 2026-11-11
author: >-
  [Bogdan Drutu](https://github.com/bogdandrutu), [Dmitry
  Anoshin](https://github.com/dmitryax), and [Joshua
  MacDonald](https://github.com/jmacd).
issue: 12069
sig: Collector SIG
default_lang_commit: 20f101bc0d46d6572969b539fafc7b67c48fa3cd
# prettier-ignore
cSpell:ignore: Adii Aditya Anitha Anoshin Baeyens Blancas block_on_overflow Chethan Drutu exporterhelper flush_timeout Gergely Gizas Gnanaprakasam Guiton Helmuth Karakaya Kuchekar Madarasz Makwana max_size mdatagen metadata_keys min_size Morel num_consumers queue_batch queue_size Ravishankar Semih Serhat simpleqt Sindy Terhar Toulme Vadla Vengal Vibhanshu Vihas Vinicius Vishal wait_for_result Wilkins Yiquan
---

OpenTelemetry コレクターにおける**バッチ処理**とは、エクスポーターにとって適切なサイズのリクエストを生成するプロセスです。
圧縮の効率を高め、ラウンドトリップのレイテンシを償却するのに十分な大きさでありながら、制限を超えない大きさにします。
バッチ処理は、コレクターの運用におけるパフォーマンス、信頼性、コストに関わる複数の重要な関心事を統合します。

OpenTelemetry が 2019 年に始まって以来、コレクターには `batch` プロセッサーコンポーネントが含まれてきました。
このコンポーネントは、下流のコンシューマーに送信する前にリクエストの結合と分割を行い、インバウンドおよびアウトバウンドのタイムアウトを監視し、パイプラインが満杯のときに新しいリクエストを保留する役割を担っています。

## TL;DR {#tldr}

`batch` プロセッサーを非推奨化します。
バッチ処理はエクスポーターで直接サポートされるようになりました。
これは*エクスポーターレベルバッチ処理*と呼ばれ、新しい `queue_batch` プロセッサーが元のプロセッサーコンポーネントを置き換えます。
キューとバッチの動作を統合することで、以下に説明する多くの改善がもたらされます。

エクスポーターレベルバッチ処理は、リリース `v0.171.0`（2027 年 2 月予定）でほとんどのエクスポーターにおいてデフォルトで有効になります。
ただし、新しいデフォルトを待つだけでは十分ではありません。
設定に `batch` プロセッサーが含まれている場合、プロセッサー自体が削除される前にパイプラインから取り除く必要があります。
以下に示すように設定を変更することで、今すぐエクスポーターレベルバッチ処理をオプトインできます。

**変更前：**

<!-- prettier-ignore -->
```yaml
receivers:
  host_metrics:
    scrapers:
      cpu: {}

processors:
  batch:

exporters:
  otlp:
    ...
    sending_queue:
      enabled: true
      # バッチは有効化されていない

service:
  pipelines:
    metrics:
      receivers: [host_metrics]
      processors: [batch]
      exporters: [otlp]
```

**変更後：**

<!-- prettier-ignore -->
```yaml
receivers:
  host_metrics:
    scrapers:
      cpu: {}

exporters:
  otlp:
    ...
    sending_queue:
      enabled: true
      batch:
        enabled: true

service:
  pipelines:
    metrics:
      receivers: [host_metrics]
      exporters: [otlp]
```

`batch` プロセッサーのコアリポジトリおよびディストリビューションからの削除は、リリース `v0.177.0`（2027 年 5 月）に予定されています。
ほとんどの場合、ユーザーはキューの後にバッチ処理を行うエクスポーターレベルバッチ処理を選択するでしょう。
ご安心ください、プロセッサーでのバッチ処理は、代替となる `queue_batch` プロセッサーを使用すれば引き続き可能です。

## なぜ `batch` プロセッサーを置き換えるのか {#why-replace-the-batch-processor}

コレクターのプロセッサーは、OpenTelemetry データのインメモリ表現を消費し、生成します。
そのため、`batch` プロセッサーは*アイテム数*、つまり個々のログレコード、メトリクスデータポイント、トレーススパンの数で設定されます。
デフォルト設定は以下の通りです。

<!-- prettier-ignore -->
```yaml
processors:
  batch:                     # 非推奨のプロセッサー
    timeout: 200ms           # 最大遅延
    send_batch_size: 8192    # 最小アイテム数
    # send_batch_max_size:   # 最大アイテム数は無制限
```

基本設定では、`batch` プロセッサーは最大アイテム数を制限しません。
両方の制限を設定すると、バッチ処理ロジックはリクエストの分割や結合を行います。
たとえば、以下のようになります。

<!-- prettier-ignore -->
```yaml
processors:
  batch:                       # 非推奨のプロセッサー
    timeout: 200ms             # 最大遅延
    send_batch_size: 1000      # 最小アイテム数
    send_batch_max_size: 5000  # 最大アイテム数
```

2021 年までに、基本的な動作とデフォルト設定は事実上安定していました。
その頃までに、`batch` プロセッサーのユーザーは設計上の 3 つの大きな制限を特定し、以下を求めていました。

1. サイズ制限の制御：*バイト*単位での制限設定
2. 並行性の制御：同時リクエスト数の制限設定
3. バックプレッシャーとエラー伝搬の制御

`batch` プロセッサーには小さなインメモリキューが含まれています。
プロデューサー側は Go のチャネルへブロッキング書き込みを行い、以下のように呼び出し元に成功を返します。

```shell
batch.pending <- request
return nil
```

これは標準的な動作です。
問題は、`batch` プロセッサーの組み込みキューが、並行性、バックプレッシャー、エラー伝搬に対する設定可能なサポートを持たないことであり、キューを永続化するためのストレージエクステンションもサポートしていません。

## エクスポーターレベルのキューとバッチの統合動作 {#integrated-exporter-level-queue-and-batch-behavior}

エクスポーターレベルバッチ処理は、共通の `sending_queue` 動作を使用するエクスポーターで一般提供されています。
キューイングとバッチ処理の動作は統合されています。

- リクエストはまずキューへの入力を試みます。
  キューには容量制限があります。
  キューが満杯の場合、即座に失敗するか、呼び出し元をブロックできます。
  通常、キューは受け入れ時に呼び出し元に成功を返します。
  ただし、レスポンスを待つオプションもあります。
- 複数のコンシューマーがキューからリクエストを同時にプルします。
  バッチ処理が有効な場合、サイズが小さすぎるリクエストや大きすぎるリクエストは結合・分割されてからコンシューマーに渡されますが、適切なサイズのリクエストはバッチャーをそのまま通過します。

結合されたキューとバッチのロジックを通過したリクエストは、エクスポーターに設定されたタイムアウトおよびリトライ設定に渡されます。
デフォルト設定は以下の通りです。

<!-- prettier-ignore -->
```yaml
exporters:
  <exporter>:
    sending_queue:                   # エクスポーターの queue_batch 動作
      queue_size:        1000        # サイズ制限
      sizer:             requests    # サイズはリクエスト数
      block_on_overflow: false       # バックプレッシャーなし
      wait_for_result:   false       # エラー伝搬なし
      num_consumers:     10          # 並行数の制限
      batch:
        enabled:         false       # バッチ処理はデフォルト無効
        sizer:           items       # テレメトリーのアイテム数で計測
        min_size:        8192        # 最小アイテム数
        flush_timeout:   200ms       # 最大遅延
```

詳細は以下の通りです。

- `num_consumers`：同時エクスポート数を決定します
- `queue_size` と `sizer`：保留中のデータの上限を決定します
- `block_on_overflow`：false はフェイルファスト、true はデッドラインまで待機を意味します
- `wait_for_result`：false は確認応答を待たない、true は成功または失敗を待つことを意味します
- `storage`：永続キューのためのオプションのストレージエクステンション

デフォルトでは、キューはブロックせず、結果も待たないため、呼び出し元に即座に成功または失敗を返します。

エクスポーターレベルバッチ処理はキューイング動作が安定した後に導入されたため、バッチ処理はデフォルトで無効のままです。
エクスポーターレベルバッチ処理を有効にすると、`sizer`、`min_size`、`flush_timeout` のデフォルト値は元の `batch` プロセッサーと一致します。

今日のほとんどのエクスポーターでは、デフォルトの `batch` プロセッサー設定からの移行は、パイプラインからプロセッサーを削除してエクスポーターレベルバッチ処理を有効にするだけで行えます。
これにより、上記のデフォルト設定でバッチ処理が有効になります。

<!-- prettier-ignore -->
```yaml
exporters:
  <exporter>:
    sending_queue:
      batch:
        enabled: true
```

詳細は以下の通りです。

- `enabled`：エクスポーターレベルバッチ処理を有効化
- `sizer`：バッチサイズの計測方法：items、bytes
- `min_size`：送信前のバッチの最小サイズ
- `max_size`：バッチの最大サイズ（オプション）
- `flush_timeout`：送信前の最大遅延
- `partition`：以下で詳述

### 移行後のキュー容量 {#queue-capacity-after-migration}

バッチ処理を `sending_queue` に移すことで、キューの反対側に移動することにもなります。
一般的な `batch` プロセッサーのパイプラインでは、エクスポーターの `sending_queue` は `batch` プロセッサーの後に配置されます。
既存の `batch` プロセッサーがパイプラインにある場合、デフォルトサイズのキューはバッチ処理済みのリクエストを最大 1000 個保持するため、既存の設定を変換する際は注意が必要です。

エクスポーターレベルバッチ処理では、バッチ処理はキューの後に行われます。
この場合、キューはパイプラインから到着する個々のリクエスト（通常ははるかに小さいリクエスト）を保持します。
リクエスト数で計測される同じ `queue_size: 1000` では、保持できるデータ量がかなり少なくなる可能性があります。
パイプラインから `batch` を削除すると、キューの保持データ量が減り、オーバーフローにつながる可能性があります。

`sending_queue` のバッチ処理に移行する際は、バッチ処理前のリクエストを適切な数だけ保持できるように `queue_size` の引き上げを検討してください。
インメモリキュー（`storage` エクステンションなし）の場合、理想的には `num_consumers` を忙しく保つのに十分なデータをキューで保持すべきです。
呼び出し元がブロックするかどうかに応じて、断続的なエクスポート失敗に耐えるための追加のキュースペースも確保すべきです。

`queue_size` を `items` または `bytes` で計測する場合、リクエストサイズの影響は小さくなります。
たとえば、以下のキューは最大 100,000 アイテムを格納します。
バッチあたり最小 5,000 アイテムの場合、10 個のコンシューマーが 50,000 以上のアイテムを同時に送信できます。
キューにはさらに 50,000 アイテムが入る余地があり、ブロックまたはリクエスト失敗の前に送信完了を待ちます。

<!-- prettier-ignore -->
```yaml
exporters:
  <exporter>:
    sending_queue:
      sizer:         items    # キューをリクエスト数ではなくアイテム数で計測
      queue_size:    100_000  # SDK サイズのバッチで約 50〜100 個分
      num_consumers: 10       # 10 ワーカーがバッチをエクスポート
      batch:
        enabled:  true
        sizer:    items       # エクスポートサイズをアイテム数で計測
        min_size: 5_000       # 最小エクスポートサイズ
```

アイテム数またはバイト数でサイズ管理されたキューは、`sending_queue` のメモリコストを明示的にします。
一方、リクエスト数でサイズ管理されたキューは、大きいリクエストも小さいリクエストも保持でき、メモリ使用量が変動します。

バイト数を使用すると、バックエンドの制限もバイト単位の場合に有効です。
`max_size` を使用して、すべてのリクエストを制限内に収めます。

<!-- prettier-ignore -->
```yaml
exporters:
  <exporter>:
    sending_queue:
      sizer:      bytes        # キューをバイト数で計測
      queue_size: 100_000_000  # 100 MB のバッファ
      batch:
        enabled:  true
        min_size: 1_000_000    # 1 MB のバッチ
        max_size: 10_000_000   # バックエンドのメッセージ制限を超えないようにする
```

`items` と `bytes` のサイザーはどちらも `requests` より CPU コストが高く、`bytes` はエンコードされたサイズを計算するため最もコストがかかります。
切り替え後は `otelcol_exporter_queue_size` を監視し、`otelcol_exporter_queue_capacity` と比較してください。

### その他の機能 {#more-features}

`batch` プロセッサーと同様に、`sending_queue` メカニズムは[メタデータによるパーティショニング][SENDING_QUEUE]をサポートしており、選択されたヘッダーの異なる組み合わせが独立したバッチを形成します。

<!-- prettier-ignore -->
```yaml
exporters:
  <exporter>:
    sending_queue:
      <...>
      batch:
        enabled: true
        <...>
        partition:
          enabled: true
          metadata_keys:      # リクエストヘッダーのリスト
            - x-auth-token
          cache_size: 100     # 最大 100 の同時バッチ
          idle_timeout: 100s  # 100 秒後にメモリから削除
```

コレクターのストレージエクステンションは、すべての `sending_queue` 設定で利用可能であり、[永続キュー][PERSISTENT]の設定をサポートしています。
たとえば、以下のようになります。

<!-- prettier-ignore -->
```yaml
exporters:
  <exporter>:
    sending_queue:
      <...>
      storage: file_storage/persistent

extensions:
  file_storage/persistent: # ファイルベースのストレージ
    directory: <...>       # ディレクトリパス
    <...>
```

[SENDING_QUEUE]: https://github.com/open-telemetry/opentelemetry-collector/blob/302c933caa8c66f7ebf35ea42238b261bc3e5fc6/exporter/exporterhelper/README.md#sending-queue-batch-settings
[PERSISTENT]: https://github.com/open-telemetry/opentelemetry-collector/blob/302c933caa8c66f7ebf35ea42238b261bc3e5fc6/exporter/exporterhelper/README.md#persistent-queue

## Queue/Batch プロセッサー {#queuebatch-processor}

ほとんどの場合、エクスポーターで `sending_queue` を設定するのがユーザーにとって最良の選択肢ですが、プロセッサーでのバッチ処理が適切なケースもいくつかあります。
たとえば、以下のような場合です。

- 大きなバッチで性能が向上する集約プロセッサーの前段
- メモリを節約できるシナリオで、複数のエクスポーターがプロセッサーを共有する場合

このようなケースに対応するため、`batch` プロセッサーの代替として新しい [`queue_batch` プロセッサー][QUEUEBATCHPROCESSOR]を導入しました。
`sending_queue` と同じ設定構造を使用し、デフォルトのアイテム閾値とフラッシュタイムアウトは元の `batch` プロセッサーと一致します。

<!-- prettier-ignore -->
```yaml
processors:
  queue_batch:                       # プロセッサーのキューとバッチ
    num_consumers:     1             # 単一の同時エクスポート
    sizer:             requests      # リクエスト数で制限
    queue_size:        10            # キュー内の上限は 10
    block_on_overflow: true          # キューが満杯のときブロック
    wait_for_result:   false         # キュー入力時に成功を返す
    batch:
      enabled:         true          # バッチ処理有効
      sizer:           items         # アイテム数で計測
      min_size:        8192
      flush_timeout:   200ms
```

プロセッサーにおけるキューとバッチの統合動作により、ユーザーはバッチ処理、バックプレッシャー、永続ストレージ、エラー伝搬を、プロセッサーでもエクスポーターでも一貫して適用できるようになりました。

[QUEUEBATCHPROCESSOR]: https://github.com/open-telemetry/opentelemetry-collector/blob/302c933caa8c66f7ebf35ea42238b261bc3e5fc6/processor/queuebatchprocessor/README.md

## 2027 年のデフォルトバッチ処理 {#batching-by-default-in-2027}

`sending_queue` の設定は `v0.126.0` 前後から安定しており、代替機能は完全に準備ができています。
残りのタスクの一つは、ほとんどのエクスポーターで**バッチ処理をデフォルトで有効にする**ことです。

[コレクターのバッチ処理移行計画][MIGRATION]のフェーズ 2 に入ります。
`batch` プロセッサーは公式に非推奨となりました。

[MIGRATION]: https://github.com/open-telemetry/opentelemetry-collector/blob/302c933caa8c66f7ebf35ea42238b261bc3e5fc6/docs/rfcs/batching-migration.md

今後のコレクターリリースで、`batch` プロセッサーは非推奨の警告を発し始めます。
何もしないユーザーには、計画されたデフォルトの変更が適用されます。
バッチ処理はリリース `v0.171.0`（2027 年 2 月）でデフォルトで有効になり、`batch` プロセッサーはリリース `v0.177.0`（2027 年 5 月）にコアリポジトリおよびディストリビューションから削除される予定です。

それまでの間、ユーザーにはいくつかの即座に利用可能な手段があります。

- `batch` プロセッサーのかわりにエクスポーターの `sending_queue` を設定する。
  ほとんどのエクスポーターはすでにこの機能をサポートしています。
  自分で設定を行えば、デフォルトの変更の影響を受けません。
- `batch` プロセッサーのかわりに `queue_batch` プロセッサーを使用する。

バッチ処理がデフォルトで有効になるまでに、今日すぐに使えるいくつかの緩和策が用意されています。

- `pkg.exporterhelper.queueBatchEnabled` フィーチャーフラグにより、バッチ処理がデフォルトで有効な状態でテストできます。
- コレクターのパイプラインセットアップは、パイプラインに `batch` プロセッサーとバッチ処理が有効な `sending_queue` の両方がある場合を検出しようとします。
  この場合、警告が発せられ、`batch` プロセッサーを単純に削除できます。

### コンポーネント開発者向け {#for-component-developers}

[コレクターの `mdatagen` コマンド][MDATAGEN]は、コンポーネントの `metadata.yaml` で `sending_queue` の設定を宣言することをサポートしており、`sending_queue` がデフォルトの動作を取るか、特定のオーバーライドを持つか、完全に省略されるかを宣言できます。

[MDATAGEN]: https://github.com/open-telemetry/opentelemetry-collector/blob/302c933caa8c66f7ebf35ea42238b261bc3e5fc6/cmd/mdatagen/README.md#exporter-queuebatch-sender-defaults

## 謝辞 {#thanks}

キューイングとバッチ処理のコードベースには、初期のイシューから仕上げの段階まで、多くのコントリビューターがいました。

`queue_batch` のリード著者は [Bogdan Drutu](https://github.com/bogdandrutu) と [Dmitry Anoshin](https://github.com/dmitryax) であり、パーティショニングサポートは [Sindy Li](https://github.com/sfc-gh-sili) によるものです。

以下をはじめとする多くのコントリビューターに感謝します。
[Adii](https://github.com/Adii-45)、
[Aditya Amol Kuchekar](https://github.com/dev-aditya-hub)、
[Alan Lee](https://github.com/malus2077)、
[Alex Boten](https://github.com/codeboten)、
[Andrew Gizas](https://github.com/gizas)、
[Andrew Wilkins](https://github.com/axw)、
[Andrzej Stencel](https://github.com/andrzej-stencel)、
[Anitha Vadla](https://github.com/avadla)、
[Antoine Toulme](https://github.com/atoulme)、
[Chethan](https://github.com/chethanm99)、
[Damien Mathieu](https://github.com/dmathieu)、
[Evan Bradley](https://github.com/evan-bradley)、
[Gergely Madarasz](https://github.com/madaraszg-tulip)、
[Israel Blancas](https://github.com/iblancasa)、
[Jade Guiton](https://github.com/jade-guiton-dd)、
[Jan Korona](https://github.com/jkoronaAtCisco)、
[Joshua MacDonald](https://github.com/jmacd)、
[Matthieu Morel](https://github.com/mmorel-35)、
[Mike Terhar](https://github.com/mterhar)、
[Pablo Baeyens](https://github.com/mx-psi)、
[Paulo Dias](https://github.com/paulojmdias)、
[Ravishankar Gnanaprakasam](https://github.com/ravishankar-sumo)、
[Roger Coll](https://github.com/rogercoll)、
[Semih Serhat Karakaya](https://github.com/karakayasemi)、
[simpleqt](https://github.com/simpleqt)、
[Tyler Helmuth](https://github.com/TylerHelmuth)、
[Vengal Rao](https://github.com/vengalraoguttha)、
[Vibhanshu Singh](https://github.com/singhvibhanshu)、
[Vihas Makwana](https://github.com/VihasMakwana)、
[Vinicius Azevedo](https://github.com/vynazevedo)、
[Vishal Raj](https://github.com/lahsivjar)、
[Yang Song](https://github.com/songy23)、
[Yiquan Zhou](https://github.com/yiquanzhou)。
