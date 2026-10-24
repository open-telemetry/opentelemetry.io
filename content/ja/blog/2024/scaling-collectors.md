---
title: Ansible で OpenTelemetry Collector を大規模に管理する
linkTitle: Ansible で Collector を大規模に管理
date: 2024-04-15
author: '[Ishan Jain](https://github.com/ishanjainn) (Grafana)'
default_lang_commit: 7f94db6f324d9c0e1828f4800fe6eeb789788afc
cSpell:ignore: ansible Ishan ishanjainn Jain
---

[Ansible](https://www.ansible.com/) を使って、複数の Linux ホストに
[OpenTelemetry Collector](/docs/collector/deploy/) のデプロイをスケールし、オブザーバビリティアーキテクチャ内で[ゲートウェイ](/docs/collector/deploy/gateway/)と[エージェント](/docs/collector/deploy/agent/)の両方として機能させることができます。
OpenTelemetry Collector をこのように二重の役割で使用することで、メトリクス、トレース、ログを分析・可視化プラットフォームへ堅牢に収集・転送できます。

ここでは、Ansible を使ってインフラストラクチャ全体に OpenTelemetry Collector のスケーラブルなインスタンスをデプロイ・管理する戦略を概説します。
以下の例では、メトリクスのターゲットバックエンドとして [Grafana](https://grafana.com/) を使用します。

## 前提条件 {#prerequisites}

始める前に、以下の要件を満たしていることを確認してください。

- ベースシステムに Ansible がインストールされていること
- 2台以上の Linux ホストへの SSH アクセス
- メトリクスを収集するために Prometheus が設定されていること

## Grafana Ansible コレクションのインストール {#install-the-grafana-ansible-collection}

[OpenTelemetry Collector ロール](https://github.com/grafana/grafana-ansible-collection/tree/0e0e9a57a64d4ffce8dfbfd84cf8f5454f9114ba/roles/opentelemetry_collector?from_branch=main)は、リリース 4.0 以降、[Grafana Ansible コレクション](https://docs.ansible.com/ansible/latest/collections/grafana/grafana/)を通じて提供されています。

Grafana Ansible コレクションをインストールするには、以下のコマンドを実行します。

```sh
ansible-galaxy collection install grafana.grafana
```

## Ansible インベントリファイルの作成 {#create-an-ansible-inventory-file}

次に、Linux ホストに関連付けられた IP アドレスと URL を収集し、インベントリファイルを作成します。

1. Ansible インベントリファイルを作成します。

   `inventory` というファイル名の Ansible インベントリには、各ホストの IP が1行ずつ記載されます。
   以下は8台のホストの例です。

   ```properties
   10.0.0.1    # ホスト名 = ubuntu-01
   10.0.0.2    # ホスト名 = ubuntu-02
   10.0.0.3    # ホスト名 = centos-01
   10.0.0.4    # ホスト名 = centos-02
   10.0.0.5    # ホスト名 = debian-01
   10.0.0.6    # ホスト名 = debian-02
   10.0.0.7    # ホスト名 = fedora-01
   10.0.0.8    # ホスト名 = fedora-02
   ```

2. `inventory` と同じディレクトリに、以下の内容で `ansible.cfg` ファイルを作成します。

   ```toml
   [defaults]
   inventory = inventory  # インベントリファイルへのパス
   private_key_file = ~/.ssh/id_rsa   # SSH 秘密鍵へのパス
   remote_user=root
   ```

## OpenTelemetry Collector Ansible ロールの使用 {#use-the-opentelemetry-collector-ansible-role}

次に、選択または作成した OpenTelemetry Collector ロールをホスト全体に適用する Ansible プレイブックを定義します。

`ansible.cfg` および `inventory` ファイルと同じディレクトリに、`deploy-opentelemetry.yml` というファイルを作成します。

```yaml
- name: Install OpenTelemetry Collector
  hosts: all
  become: true

  tasks:
    - name: Install OpenTelemetry Collector
      ansible.builtin.include_role:
        name: grafana.grafana.opentelemetry_collector
      vars:
        otel_collector_receivers:
          hostmetrics:
            collection_interval: 60s
            scrapers:
              cpu: {}
              disk: {}
              load: {}
              filesystem: {}
              memory: {}
              network: {}
              paging: {}
              process:
                mute_process_name_error: true
                mute_process_exe_error: true
                mute_process_io_error: true
              processes: {}

        otel_collector_processors:
          batch:
          resourcedetection:
            detectors: [env, system]
            timeout: 2s
            system:
              hostname_sources: [os]
          transform/add_resource_attributes_as_metric_attributes:
            error_mode: ignore
            metric_statements:
              - context: datapoint
                statements:
                  - set(attributes["deployment.environment"],
                    resource.attributes["deployment.environment"])
                  - set(attributes["service.version"],
                    resource.attributes["service.version"])

        otel_collector_exporters:
          prometheusremotewrite:
            endpoint: https://<prometheus-url>/api/prom/push
            headers:
              Authorization: 'Basic <base64-encoded-username:password>'

        otel_collector_service:
          pipelines:
            metrics:
              receivers: [hostmetrics]
              processors:
                [
                  resourcedetection,
                  transform/add_resource_attributes_as_metric_attributes,
                  batch,
                ]
              exporters: [prometheusremotewrite]
```

> [!NOTE]
>
> 収集するテレメトリーの種類と転送先に合わせて設定を調整してください。
> この設定スニペットは、ホストメトリクスを収集して Prometheus に転送するための基本的な例です。

上記の設定により、OpenTelemetry Collector が Linux ホストからメトリクスを収集するようにプロビジョニングされます。

## Ansible プレイブックの実行 {#running-the-ansible-playbook}

以下のコマンドを実行して、ホスト全体に OpenTelemetry Collector をデプロイします。

```sh
ansible-playbook deploy-opentelemetry.yml
```

## バックエンドでメトリクスを確認する {#check-your-metrics-in-the-backend}

OpenTelemetry Collector が Prometheus にメトリクスを送信し始めたら、以下の手順で Grafana で可視化します。

### Grafana のセットアップ {#set-up-grafana}

1. **Docker のインストール**: システムに Docker がインストールされていることを確認します。

2. **Grafana Docker コンテナの起動**: 以下のコマンドで最新の Grafana イメージを取得し、Grafana サーバーを起動します。

   ```sh
   docker run -d -p 3000:3000 --name=grafana grafana/grafana
   ```

3. **Grafana へのアクセス**: ウェブブラウザで <http://localhost:3000> を開きます。
   デフォルトのログインユーザー名とパスワードはどちらも `admin` です。

4. 初回ログイン時にパスワードの変更を求められたら、**安全なパスワードを設定してください**。

その他のインストール方法や詳しい手順については、[Grafana の公式ドキュメント](https://grafana.com/docs/grafana/latest/#installing-grafana)を参照してください。

### データソースとして Prometheus を追加する {#add-prometheus-as-a-data-source}

1. Grafana で **Connections** > **Data Sources** に移動します。
2. **Add data source** をクリックし、**Prometheus** を選択します。
3. 設定画面で Prometheus の URL（例: `http://<your_prometheus_host>`）と、必要なその他の情報を入力します。
4. **Save & Test** を選択します。

### メトリクスを確認する {#explore-your-metrics}

1. **Explore** ページに移動します。
2. クエリエディターでデータソースを選択し、以下のクエリを入力します。

   ```PromQL
   100 - (avg by (cpu) (irate(system_cpu_time{state="idle"}[5m])) * 100)
   ```

   このクエリは、過去5分間における各 CPU コアの「idle」状態以外で消費された CPU 時間の平均割合を計算します。

3. 他のメトリクスも確認し、ダッシュボードを作成してシステムのパフォーマンスに関する知見を得てください。

このブログ記事では、Ansible を使って複数の Linux ホストに OpenTelemetry Collector を設定・デプロイする方法と、収集したテレメトリーを Grafana で可視化する方法を紹介しました。
参考になった場合は、詳しい設定オプションについて [OpenTelemetry Collector ロール](https://github.com/grafana/grafana-ansible-collection/tree/0e0e9a57a64d4ffce8dfbfd84cf8f5454f9114ba/roles/opentelemetry_collector?from_branch=main)の GitHub リポジトリをご覧ください。
質問がある場合は、GitHub プロフィール [@ishanjainn](https://github.com/ishanjainn) の連絡先情報からご連絡ください。
