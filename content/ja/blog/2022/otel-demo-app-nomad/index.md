---
title: HashiCorp Nomad で OpenTelemetry デモアプリを動かす
linkTitle: Nomad 上の OTel デモアプリ
date: 2022-12-12
author: >-
  [Adriana Villela](https://github.com/avillela) (Lightstep)
default_lang_commit: 9c9f95affc7661d96823ffca6b3fab584f3c7c5c
# prettier-ignore
cSpell:ignore: Aoqui Daniela entrypoints ffspostgres hashi hashiqube jobspec loadgenerator Luiz macbook qube Riaan servian
---

みなさん…ついに技術バケットリストの項目に取り組めたので、とても興奮しています。
先週、[OpenTelemetry デモアプリ](/docs/demo/)の [Helm Charts](https://github.com/open-telemetry/opentelemetry-helm-charts/tree/146b47dd310628c8a8d0b0a19ff1e813560b2599/charts/opentelemetry-demo?from_branch=main) を [HashiCorp](https://hashicorp.com) [Nomad][] のジョブスペックに変換する作業を始めました。
今日は、お気に入りの Hashi オールインワンツールである [HashiQube](https://rubiksqube.com/#/) を使って、OpenTelemetry デモアプリを Nomad で動かす方法についてお話しします。

さあ、始めましょう！

![夜のカナダ・トロントの航空写真](toronto-cityscape.jpg '夜のカナダ・トロントの航空写真')

## デプロイ {#deployment}

### 前提知識 {#assumptions}

先に進む前に、以下の基本的な理解があることを前提としています。

- **[Nomad][]**。
  まだの方は、私の [Nomad 入門記事](https://storiesfromtheherd.com/just-in-time-nomad-80f57cd403ca)をご覧ください。
  [Daniela Baron](https://danielabaron.me) による[こちらのブログ記事](https://danielabaron.me/blog/nomad-tips-and-tricks/)もおすすめです。
- **[オブザーバビリティ](/docs/concepts/observability-primer/#what-is-observability)**（o11y）と **[OpenTelemetry](/docs/what-is-opentelemetry/)**（OTel）。
  まだの方は、[オブザーバビリティ入門](/docs/concepts/observability-primer/)をご覧ください。

### 前提条件 {#pre-requisites}

このチュートリアルの例を実行するには、以下が必要です。

- [Docker](https://www.docker.com)（この記事執筆時点でバージョン 20.10.21）
- [Vagrant](https://vagrantup.com)（この記事執筆時点でバージョン 2.3.1）

### チュートリアル用リポジトリ {#tutorial-repositories}

今日のチュートリアルで使用するリポジトリは以下のとおりです。

- 私が変更を加えた [HashiQube リポジトリ](https://github.com/avillela/hashiqube)（[servian/hashiqube](https://github.com/servian/hashiqube) のフォーク）。
  興味がある方は、[hashiqube に対して行った変更](https://github.com/avillela/hashiqube/commits)をご覧ください。
- 私の [Nomad Conversions](https://github.com/avillela/nomad-conversions) リポジトリ

### HashiQube のセットアップ {#hashiqube-setup}

始める前に、HashiQube はデフォルトで [Nomad][]、[Vault](https://www.vaultproject.io)、[Consul](https://consul.io) を Docker 上で実行することを改めてお伝えします。
さらに、Nomad に 21 個のジョブスペックをデプロイします。
これにはかなりの CPU と RAM が必要になるため、Docker Desktop に十分なリソースが割り当てられていることを確認してください。
参考までに、私は 8 コア、32 GB RAM の M1 MacBook Pro を使っています。
Docker Desktop のリソース設定は以下のとおりです。

- **CPU:** 3
- **メモリ:** 9.5GB
- **スワップ:** 3GB

視覚的に確認したい方のために、Docker Preferences のリソース設定のスクリーンショットを掲載します。

![Docker Desktop のリソース設定のスクリーンキャプチャ](docker-desktop-resources-config.png 'Docker Desktop のリソース設定のスクリーンキャプチャ')

詳しくは、Docker のドキュメントでリソース設定の変更方法を確認してください。
[Mac](https://docs.docker.com/desktop/settings/mac/)、[Windows](https://docs.docker.com/desktop/settings/windows/)、[Linux](https://docs.docker.com/desktop/settings/linux/) の各ドキュメントがあります。

#### 1- /etc/hosts の更新 {#1--update-etchosts}

サービスの公開には [Traefik](https://traefik.io) ロードバランサーを使用しており、localhost のサブドメインとしてアクセスします。
Traefik で公開されたサービス（および Traefik ダッシュボード自体）にアクセスできるようにするために、ホストマシンの `/etc/hosts` に以下のエントリを追加する必要があります。

```properties
127.0.0.1   traefik.localhost
127.0.0.1   otel-demo.localhost
```

#### 2- HashiQube でローカル Hashi 環境をプロビジョニングする {#2--provision-a-local-hashi-environment-with-hashiqube}

詳細な[クイックスタート手順](https://github.com/avillela/hashiqube#quickstart)に従って HashiQube を起動します。

> **NOTE:** 問題が発生した場合は、[Gotchas](https://github.com/avillela/hashiqube#gotchas) セクションを確認してください。

すべてが起動して実行されると（これには数分かかります）、起動シーケンスの最後に以下のような表示が出て、準備完了となります。

![HashiQube 起動シーケンスの末尾のスクリーンキャプチャ。Nomad、Nomad ドキュメント、Traefik、Traefik ドキュメントの URL が表示されている](hashiqube-startup-sequence.png 'HashiQube 起動シーケンスの末尾のスクリーンキャプチャ')

以下の URL を使ってアプリにアクセスできるようになります。

- **Vault:** <http://localhost:8200>
- **Nomad:** <http://localhost:4646>
- **Consul:** <http://localhost:8500>
- **Traefik:** <http://traefik.localhost>

[Nomad CLI](https://developer.hashicorp.com/nomad/downloads) と [Vault CLI](https://developer.hashicorp.com/vault/downloads) もダウンロードしてインストールしてください。

HashiQube に SSH 接続する必要がある場合は、ホストマシンで新しいターミナルウィンドウを開き、以下のコマンドを実行します。

```shell
vagrant ssh
```

#### 3- OTel デモアプリのデプロイ {#3--deploy-the-otel-demo-app}

いよいよ OTel デモアプリをデプロイする準備が整いました！

まず、リポジトリをクローンして作業ディレクトリに移動します。

```shell
git clone https://github.com/avillela/nomad-conversions.git
cd nomad-conversions
```

次に、Nomad で [Memory Oversubscription](https://developer.hashicorp.com/nomad/docs/commands/operator/scheduler/set-config#memory-oversubscription) を有効にします。
これは一度だけ行う設定です。

```shell
nomad operator scheduler set-config -memory-oversubscription true
```

Memory Oversubscription を有効にすると、Nomad はジョブに割り当てられたメモリ以上のメモリを使用できるようになります。
たとえば、`resources` スタンザの以下の設定を考えてみましょう。

```hcl
resources {
   cpu    = 55
   memory = 1024
   memory_max = 2048
}
```

ジョブに 55Mz の処理能力（`cpu` 設定）と 1024MB の RAM（`memory` 設定）を割り当てています。
この場合、Memory Oversubscription が有効で、ジョブが割り当てられた 1024MB 以上のメモリを必要とすると、Nomad はジョブに最大 2048MB の RAM を割り当てます（`memory_max` 設定）。
Memory Oversubscription が有効でない場合、Nomad は `memory_max` 設定を無視します。

次に、サービスをデプロイしましょう。

```shell
nomad job run -detach otel-demo-app/jobspec/traefik.nomad
nomad job run -detach otel-demo-app/jobspec/redis.nomad
nomad job run -detach otel-demo-app/jobspec/ffspostgres.nomad
nomad job run -detach otel-demo-app/jobspec/otel-collector.nomad
nomad job run -detach otel-demo-app/jobspec/adservice.nomad
nomad job run -detach otel-demo-app/jobspec/cartservice.nomad
nomad job run -detach otel-demo-app/jobspec/currencyservice.nomad
nomad job run -detach otel-demo-app/jobspec/emailservice.nomad
nomad job run -detach otel-demo-app/jobspec/featureflagservice.nomad
nomad job run -detach otel-demo-app/jobspec/paymentservice.nomad
nomad job run -detach otel-demo-app/jobspec/productcatalogservice.nomad
nomad job run -detach otel-demo-app/jobspec/quoteservice.nomad
nomad job run -detach otel-demo-app/jobspec/shippingservice.nomad
nomad job run -detach otel-demo-app/jobspec/checkoutservice.nomad
nomad job run -detach otel-demo-app/jobspec/recommendationservice.nomad
nomad job run -detach otel-demo-app/jobspec/frontend.nomad
nomad job run -detach otel-demo-app/jobspec/loadgenerator.nomad
nomad job run -detach otel-demo-app/jobspec/frontendproxy.nomad
nomad job run -detach otel-demo-app/jobspec/grafana.nomad
nomad job run -detach otel-demo-app/jobspec/jaeger.nomad
nomad job run -detach otel-demo-app/jobspec/prometheus.nomad
```

ジョブを[デタッチモード](https://developer.hashicorp.com/nomad/docs/commands/job/run#detach)で実行しているため、Nomad は現在のジョブのデプロイが正常に完了するのを待たずに次のジョブを開始します。
そのため、出力は以下のようになります。

```yaml
Job registration successful
Evaluation ID: d3eaa396-954e-241f-148d-6720c35f34bf
Job registration successful
Evaluation ID: 6bba875d-f415-36b7-bfeb-2ca4b9982acb
Job registration successful
Evaluation ID: 16dc8ef8-5e26-68f4-89b6-3d96b348775b
Job registration successful
Evaluation ID: 34de0532-a3b5-8691-bf18-51c0cc030573
Job registration successful
Evaluation ID: 7310e6a2-9945-710b-1505-c01bd58ccd35
...
```

`Evaluation ID` の値はお使いのマシンでは異なりますのでご注意ください。

#### 4- Nomad で確認する！ {#4--see-it-in-nomad}

デプロイが進行中の間、<http://localhost:4646> の Nomad UI にアクセスして進捗を確認できます。

![Nomad のジョブビューのスクリーンキャプチャ。一部のジョブは開始済みで、他はまだ起動中](nomad-jobs-startup.png 'Nomad のジョブビューのスクリーンキャプチャ。一部のジョブは開始済みで、他はまだ起動中')

すべてのサービスが起動するにはしばらく時間がかかります（最大 10 分程度）。
Nomad がイメージをダウンロードしてサービスを初期化する必要があるため、お待ちください！
一部のサービスは他のサービスに依存しているため、上のスクリーンキャプチャのように、サービスが待機状態になったり、しばらく起動と停止を繰り返したりすることがあります。
慌てないでください！すべてうまくいきます！！

すべてのジョブが起動して実行されると、以下のようにすべてが緑色になります。

![Nomad のジョブビューのスクリーンキャプチャ。すべてのジョブが開始済み](nomad-started.png 'Nomad のジョブビューのスクリーンキャプチャ。すべてのジョブが開始済み')

<http://localhost:8500> の Consul にアクセスして、サービスのヘルスチェック状態も確認できます。

![Consul のサービスヘルスのスクリーンキャプチャ。すべてのサービスが正常](consul-service-health.png 'Consul のサービスヘルスのスクリーンキャプチャ。すべてのサービスが正常')

デフォルトでは、不健全なサービスは赤い「x」マーク付きで上部に表示されます。
上のスクリーンショットにはいやな赤い「x」が見当たらないので、サービスは良好な状態です！

#### 5- OTel デモアプリにアクセスする {#5--access-the-otel-demo-app}

OTel デモアプリは [Envoy](https://www.envoyproxy.io) を使って複数のフロントエンドサービスを公開しています。
ウェブストア、[Jaeger](https://www.jaegertracing.io/)、[Grafana](https://grafana.com/)、Load Generator、Feature Flag です。
これらはすべて [frontendproxy](https://github.com/avillela/nomad-conversions/blob/1d160b0b63ceb5f7cddda795fa54cdcf067c47d5/otel-demo-app/jobspec/frontendproxy.nomad?from_branch=main) サービスによって管理されています。
Traefik は [frontendproxy](https://github.com/avillela/nomad-conversions/blob/1d160b0b63ceb5f7cddda795fa54cdcf067c47d5/otel-demo-app/jobspec/frontendproxy.nomad?from_branch=main) サービスを `otel-demo.localhost` アドレスで公開しています。

これは [frontendproxy.nomad](https://github.com/avillela/nomad-conversions/blob/cefe9b9b12d84fb47be8aa5fc67b1b221b7b599b/otel-demo-app/jobspec/frontendproxy.nomad#L19-L24) の `service` スタンザ内の以下のコードスニペットで設定されています。

```hcl
tags = [        "traefik.http.routers.frontendproxy.rule=Host(`otel-demo.localhost`)",
    "traefik.http.routers.frontendproxy.entrypoints=web",
    "traefik.http.routers.frontendproxy.tls=false",
    "traefik.enable=true",
]
```

`Host` が `otel-demo.localhost` に設定されていることに注目してください。

サービスには以下の URL からアクセスできます。

**ウェブストア:** <http://otel-demo.localhost/>

![デモアプリのウェブストア UI のスクリーンキャプチャ](otel-demo-app-ui.jpg 'デモアプリのウェブストア UI のスクリーンキャプチャ')

望遠鏡やアクセサリの素晴らしいラインナップを探索して、いくつか購入してみてください😉🔭

**Jaeger UI:** <http://otel-demo.localhost/jaeger/ui/>

![Jaeger UI のスクリーンキャプチャ](jaeger.png 'Jaeger UI のスクリーンキャプチャ')

上のスクリーンキャプチャでは、[checkoutservice](https://github.com/avillela/nomad-conversions/blob/f546f9079a97fcbdfc814b82dbe6eec8a5005d7d/otel-demo-app/jobspec/checkoutservice.nomad?from_branch=main) からのサンプルトレースを確認できます。

**Grafana:** <http://otel-demo.localhost/grafana/>

![Grafana 上の OpenTelemetry ダッシュボードの1つのスクリーンキャプチャ](grafana-1.png 'Grafana 上の OpenTelemetry ダッシュボードの1つのスクリーンキャプチャ')

![Grafana 上の recommendationservice メトリクスダッシュボードのスクリーンキャプチャ](grafana-2.png 'Grafana 上の recommendationservice メトリクスダッシュボードのスクリーンキャプチャ')

デモアプリには 2 つの Grafana ダッシュボードが同梱されており、OpenTelemetry で出力されたメトリクスを表示します。

**Feature Flags UI:** <http://otel-demo.localhost/feature/>

![featureflagservice UI のスクリーンキャプチャ](featureflag.png 'featureflagservice UI のスクリーンキャプチャ')

**Load Generator UI:** <http://otel-demo.localhost/loadgen/>

![loadgenerator UI のスクリーンキャプチャ](loadgen.png 'loadgenerator UI のスクリーンキャプチャ')

## 注意点 {#gotchas}

OTel デモアプリを Nomad で動かすにあたって多くの問題を解消してきたと思いますが、サービスのデプロイ時にいくつかの問題に遭遇しました。

### サービスが Collector に接続できないことがある {#services-sometimes-cant-connect-to-the-collector}

すべてのサービスが正常に起動しているように見えても、一部のサービスが OTel Collector に接続できないことがあります。
原因はまだ特定できていないので、現時点では [otel-collector.nomad](https://github.com/avillela/nomad-conversions/blob/ed12ec3d4092a7816aadd2d761a98f9ef51dfb74/otel-demo-app/jobspec/otel-collector.nomad?from_branch=main) を再起動するだけです。
ウェブアプリの UI がおかしい場合（商品や通貨が表示されないなど）は、[frontend.nomad](https://github.com/avillela/nomad-conversions/blob/add469c5ad127cfb0956fd3da49c8a65160e1281/otel-demo-app/jobspec/frontend.nomad?from_branch=main) も再起動します。
サービスがテレメトリーを Collector に送信していないことを示す良い指標は、Jaeger に表示されるサービスの数を確認することです。
`jaeger-query` サービスを含めて 14 個のサービスが表示されるはずです。

![Jaeger のサービスリストドロップダウンのスクリーンキャプチャ](jaeger-service-list.png 'Jaeger のサービスリストドロップダウンのスクリーンキャプチャ')

### ホストマシンのメモリ不足 {#low-memory-on-host-machine}

そう…私のマシンはかなりの性能ですが、ホストマシンのメモリが不足することもあります。
Chrome と Safari で大量のタブを開いていることも一因でしょう。
さらに正直に言うと、HashiQube と Nomad 上の 21 個のジョブはかなりのメモリを消費します。
HashiQube と Docker のメモリ設定にいくつかの調整を加えてメモリの問題を最小限に抑えるようにしていますが、メモリモンスターにやられてしまった場合は、ブラウザや他のアプリを閉じて再度開き、メモリを解放することをおすすめします。
もしこの問題が発生したら、ぜひ教えてください！

## 進行中のプロジェクト {#a-work-in-progress}

このプロジェクトは進行中の作業であることをご了承ください。
改善の提案がある場合や、Nomad ジョブスペックのさらなる共同作業をご希望の場合は、[ご連絡ください](https://www.linkedin.com/in/adrianavillela/)！

## まとめ {#final-thoughts}

以上です！
これで [OpenTelemetry デモアプリ](/docs/demo/kubernetes-deployment/)（OpenTelemetry を実行するマルチマイクロサービスアプリ）を HashiCorp Nomad にデプロイする方法の例がわかりました。
主なポイントは以下のとおりです。

- [HashiQube](https://github.com/avillela/hashiqube) を使って、Docker 上の Nomad を介してローカルの HashiCorp 環境を構築し、[Traefik](https://traefik.io) をロードバランサーとして OTel デモアプリを Nomad で実行しました。
- [frontendproxy](https://github.com/avillela/nomad-conversions/blob/cefe9b9b12d84fb47be8aa5fc67b1b221b7b599b/otel-demo-app/jobspec/frontendproxy.nomad) を通じて公開された以下のサービスにアクセスして、OTel デモアプリの動作を確認しました。
  [ウェブストア](http://otel-demo.localhost/)、[Grafana](http://otel-demo.localhost/grafana/)、[Jaeger](http://otel-demo.localhost/jaeger/ui)、[Feature Flags UI](http://otel-demo.localhost/feature/)、そして [Load Generator UI](http://otel-demo.localhost/loadgen/)。

締めくくる前に、Nomad ジョブスペックの調整を手伝ってくれた HashiCorp の [Luiz Aoqui](https://www.linkedin.com/in/luizaoqui/) と、HashiQube の継続的な開発を行っている [Riaan Nolan](https://www.linkedin.com/in/riaannolan/) に大きな感謝を伝えたいと思います。
（余談ですが、[Luiz][] と [Riaan][] の両名は [On-Call Me Maybe Podcast][] のゲストでした！）

最後に、ピンクのバスケットから顔を出すネズミのフィービーの写真をお届けします。
かわいくないですか？🥰

![ピンクのかごから顔を出す薄茶色と白のネズミ](phoebe-basket.jpg 'ネズミのフィービーがピンクのかごから顔を出している')

Peace, love, and code. 🦄 🌈 💫

---

Nomad 上の OTel デモアプリについて質問がありますか？
[Mastodon](https://hachyderm.io/@adrianamvillela) または [LinkedIn](https://www.linkedin.com/in/adrianavillela) でお気軽にご連絡ください。

---

OpenTelemetry コミュニティは常にコントリビューションを求めています！
[ぜひご参加ください](/community/#special-interest-groups)！
Mastodon をお使いの方は、[Mastodon の OpenTelemetry](https://fosstodon.org/@opentelemetry) をフォローしてください。

[Luiz]: https://open.spotify.com/episode/7ww8y3fy49MgEbcyFGvsNV?si=BMvp8u-dRgyPEkTkYxfDAA
[nomad]: https://www.nomadproject.io
[On-Call Me Maybe Podcast]: https://open.spotify.com/show/4ZI6pQwChwm4sVULdtHFMe
[Riaan]: https://open.spotify.com/episode/5YrBEsXoJV3UjrHRrLRqBP?si=BpWISRD0SLytJF-vJ02sSA
