---
title: OpenTelemetry が Lambda サポートを更新
linkTitle: OTel Lambda アップデート
date: 2023-05-25
author: '[Carter Socha](https://github.com/cartersocha) (Lightstep)'
default_lang_commit: 36998835eb3fb63365f9551b7407409efbbf17d9
cSpell:ignore: adot otel-faas socha
---

[Functions-as-a-Service（FaaS）SIG](https://docs.google.com/document/d/187XYoQcXQ9JxS_5v2wvZ0NEysaJ02xoOYNXj08pT0zc)
は、OpenTelemetry Lambda レイヤーのリリースと、Amazon Web Services（AWS）Lambda を監視するための関連[ドキュメント](/docs/platforms/faas/)を発表できることを非常に嬉しく思います。

## OTel FaaS のリパッケージ {#otel-faas-repackaged}

OTel を使って Lambda を監視してきた方にとっては、このアナウンスに少し戸惑うかもしれません。
「OTel にはすでに [Lambda レイヤーのリポジトリ](https://github.com/open-telemetry/opentelemetry-lambda)があって、AWS で何年も利用できたではないか」と思われるかもしれません。

その通りです。
ご安心ください、私たちは車輪の再発明をしているわけではありません。
しかし、ユーザーに影響を与える可能性のある既存の問題がいくつかあります。

- OTel Lambda レイヤーは [AWS Distribution for OTel（ADOT）](https://aws-otel.github.io/)の一部としてのみリリースされており、コミュニティがリリースを制御できる範囲が限られていたため、新機能や修正の提供が遅れていました。
- AWS で利用可能なレイヤーは、コレクターと自動計装の機能を単一のパッケージに統合しており、パフォーマンスの低下やユーザーの選択肢の制限につながっていました。
- Lambda を監視するための公式の OTel ガイダンスがなく、OTel ユーザーが参照できる唯一の情報源もありませんでした。

FaaS SIG は上記の問題に対処しました。

- Lambda レイヤーを自分たちでリリースするための新しい GitHub Actions を作成し、コミュニティが独自のリリース判断を行えるようにしました。
- コレクターと計装レイヤーを分離し、Lambda を計装する際のオプションをユーザーに提供するようにしました。
  現在、コレクター用のスタンドアロン Lambda レイヤーに加え、JavaScript、Java、Python 用の自動計装レイヤーを提供しています。
- OTel ウェブサイトの新しい [FaaS セクション](/docs/platforms/faas/)に、公式のコミュニティ Lambda ドキュメントを追加しました。

## 今後の予定 {#what-next}

今後、FaaS SIG は以下を計画しています。
ドキュメントの拡充、Azure や GCP などの他のクラウドベンダー向けの自動計装の追加（暫定）、既存の Lambda アセットの強化、そして Function 固有のシナリオにおける OpenTelemetry パフォーマンスの改善です。

## 参加方法 {#get-involved}

詳しく知りたい方、またはご協力いただける方は、[SIG ミーティング](https://github.com/open-telemetry/community#implementation-sigs)（毎週火曜日 午後12時 PST）にご参加いただくか、Slack の [#otel-faas](https://cloud-native.slack.com/archives/C04HVBETC9Z) チャンネルにお越しください。
