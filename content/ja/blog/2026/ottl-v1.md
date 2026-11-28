---
title: OpenTelemetry Transformation Language が v1 に到達
linkTitle: OTTL v1
date: 2026-10-27
author: '[Tyler Helmuth](https://github.com/TylerHelmuth) (Grafana Labs)'
issue: 12163
sig: Collector SIG
default_lang_commit: afae27e30673d857278fcf0c1285d0ab0c51cd67
cSpell:ignore: Genesys Helmuth ottl SigNoz xottl xprofile
---

[OpenTelemetry Transformation Language（OTTL）](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/b21bf1a21be57988b655aa03ff664dbb250d6a99/pkg/ottl)が v1 になりました。
opentelemetry-collector-contrib v0.164.0 以降、OTTL はトレース、メトリクス、ログに対して安定版となりました。

v1 のリリースは、OTTL がテスト、ベンチマーク、ドキュメント、テレメトリーに関する Collector の[「安定版」安定性基準](https://github.com/open-telemetry/opentelemetry-collector/blob/ebfdf90d82abe991c69554b31f2efc4a96622803/docs/component-stability.md#stable)を満たしていることを意味します。
また、1.x 全体にわたる互換性の約束も伴います。
OTTL ステートメントを書く場合、構文と標準関数は後方互換性を維持します。
OTTL の上に独自のコンポーネントを構築する場合、Go API も互換性を維持します。

## v1 の保証がカバーする範囲 {#what-the-v1-guarantee-covers}

OTTL を昇格させる前に、[文法内のすべてのトークン、型、機能をレビューしました](https://github.com/open-telemetry/opentelemetry-collector-contrib/issues/50217)。
[言語リファレンス](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/b21bf1a21be57988b655aa03ff664dbb250d6a99/pkg/ottl/LANGUAGE.md)に記載されているすべての内容が、1.x の間は凍結されます。
これにはパス、リテラル、演算子、関数呼び出し、`where` 句が含まれます。
マイナーリリースで新しい構文を追加することはできますが、既存の構文を削除したり意味を変更したりすることはありません。

1.x の期間中、[標準関数セット](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/b21bf1a21be57988b655aa03ff664dbb250d6a99/pkg/ottl/ottlfuncs/README.md#function-stability)から関数を削除したり、既存のシグネチャを後方互換性のない方法で変更したりすることはありません。
ある 1.x リリースでパースできるステートメントは、それ以降のすべての 1.x リリースでも同じようにパースされ、同じ動作をします。

この約束にはコストが伴います。
標準セットに追加したすべての関数は永続的なものとなるため、v1 以前のように関数を追加し続けることはできません。
新しい関数は実験的な状態から始まるようになりました。
新しい関数は [`xottl` モジュール](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/b21bf1a21be57988b655aa03ff664dbb250d6a99/pkg/ottl/xottl/ottlfuncs/README.md)に配置され、それらを使用するステートメントは [`pkg.ottl.functions.enableExperimental`](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/b21bf1a21be57988b655aa03ff664dbb250d6a99/pkg/ottl/documentation.md#feature-gates) feature gate を有効にした場合にのみパースされます。
`xottl` は 0.x でバージョン管理されているため、実験的な関数はどのリリースでも変更または削除される可能性があります。

関数が[昇格基準](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/b21bf1a21be57988b655aa03ff664dbb250d6a99/pkg/ottl/ottlfuncs/README.md#promotion-to-standard)を満たすと、標準セットに移行します。
実験的な関数として少なくとも2回のマイナーリリース、完全なテストとドキュメント、変更の未解決の提案がないこと、そしてユーザーからの実際の需要が必要です。
昇格によりシグネチャが凍結されるため、実験的な期間が関数の引数や動作に問題がある場合にフィードバックを送る機会です。

いくつかの項目は意図的に保証の対象外です。

- [ラムダ関数](/blog/2026/lambda-powered-function-land-in-ottl/)（`Filter`、`MapEach`、`MapKeys`、`Any`、`All`、`Find`、`Reduce`、`When`）は実験的であり、引き続き `ottl.functions.enableLambda` feature gate が必要です。
- プロファイルのサポートは開発中であり、[`xprofile` モジュール](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/b21bf1a21be57988b655aa03ff664dbb250d6a99/pkg/ottl/contexts/xprofile/README.md)に移動しました。
  このモジュールは 0.x で個別にバージョン管理されています。
- `SliceGetter` などの実験的な Go API は `xottl` に配置されています。

transform processor、filter processor、および contrib に同梱されるその他のコンポーネントは実験的な関数を登録しますが、デフォルトでは無効です。
試すには、対応する feature gate を有効にしてください。
たとえば `--feature-gates=pkg.ottl.functions.enableExperimental` です。
カスタムビルドは不要です。

## アップグレード時の変更点 {#what-changes-when-you-upgrade}

v1 に至るまでのリリースで、1.x 全体にわたって維持したくないものを整理しました。
`Base64Decode` などの長期間非推奨だった関数や古いプロファイル関数を削除し、`ottl.PanicDuplicateName` や `ottl.contexts.enableOTelColContext` など、すでに安定版に達した feature gate を削除しました。
v0.164.0 では `ottl.set.allowNil` gate を削除しています。
これらの gate をまだ Collector に渡している場合は、アップグレード前に削除してください。

一度に複数のリリースをまたいでアップグレードする場合は、使用しているバージョンから v0.164.0 までの間の [contrib changelog](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/b21bf1a21be57988b655aa03ff664dbb250d6a99/CHANGELOG.md) の `pkg/ottl` エントリを確認してください。

## ここに至るまでの道のり {#how-we-got-here}

OTTL は 2022年に transform processor の設定言語として始まりました。
現在、opentelemetry-collector-contrib の14個のコンポーネントが設定で OTTL を受け付けます。

- プロセッサー: transform、filter、tail sampling、adaptive tail sampling、log deduplication、lookup、partitioning、span pruning
- コネクター: routing、count、sum、signal to metrics
- エクスポーター: Honeycomb marker、NATS

[2026年の Collector 調査](/blog/2026/otel-collector-follow-up-survey-analysis/)では、transform processor と routing コネクターの両方で 2025年と比較して使用率の大幅な増加が見られました。

OTTL の安定化は、Collector SIG の[「デフォルトで安定版」](/blog/2025/stability-proposal-announcement/)の取り組みと、[最も使用されている Collector コンポーネントの安定化](https://github.com/open-telemetry/opentelemetry-collector-contrib/issues/44130)に向けた広範な取り組みの一部です。
2026年4月に [OTTL 安定性追跡イシュー](https://github.com/open-telemetry/opentelemetry-collector-contrib/issues/47305)を作成し、夏の間にテスト、ドキュメント、オブザーバビリティの要件に取り組みました。
より難しい問題は、関数セットにとって「凍結」がどうあるべきかということでした。
[#50927](https://github.com/open-telemetry/opentelemetry-collector-contrib/issues/50927) でその答えを出し、そこから実験的な関数のプロセスが生まれました。

[卒業リクエスト](https://github.com/open-telemetry/opentelemetry-collector-contrib/issues/51068)では、New Relic、Grafana Labs、SigNoz、Genesys から本番環境での推薦を集めました。
New Relic は顧客が使用しないホストメトリクスを削除し、顧客の取り込みコストを削減しています。
Grafana Labs は自社の Grafana Cloud パイプラインですべてのシグナルにクラスターおよび名前空間の属性をコピーしています。
SigNoz は顧客が取り込み量を制御する方法として filter processor の条件をドキュメント化しています。
Genesys は OTTL を使用して Prometheus メトリクスを OpenTelemetry にマッピングし、CloudWatch メトリクスを処理しています。
New Relic と SigNoz はどちらも、自社の Collector ディストリビューションで OTTL ベースのコンポーネントを出荷しています。
これらの推薦を得た上で、[#51236](https://github.com/open-telemetry/opentelemetry-collector-contrib/pull/51236) でトレース、メトリクス、ログを安定版に昇格させました。

## 今後の展望 {#what-comes-next}

OTTL が v1 に到達した今、次は transform processor です。
現在、[安定版への昇格に向けて積極的に取り組んでいます](https://github.com/open-telemetry/opentelemetry-collector-contrib/issues/47306)。
テスト、ドキュメント、設定、可観測性のレビューはすでに完了しています。

また、ラムダ関数とその Go API を v1 保証に組み込む作業も進めています。
ラムダはキャッシュ機能以来 OTTL に追加された最大の機能であり、関数の書き方を根本的に変え、OTTL では以前処理できなかった変換シナリオを可能にします。
ラムダを使用している方は、[Collector Contrib リポジトリ](https://github.com/open-telemetry/opentelemetry-collector-contrib/issues)でイシューとしてフィードバック（気に入った点や気に入らなかった点）をお寄せください。
プロファイルシグナルが安定化したら、`xprofile` を v1 保証の対象に含めることも検討します。

協力していただける場合、実験的な関数が最も始めやすい場所です。
試してみて、ユースケースに合わない場合はイシューを作成してください。
質問に回答したり、プルリクエストをレビューしたり、[`pkg/ottl`](https://github.com/open-telemetry/opentelemetry-collector-contrib/issues?q=is%3Aopen+is%3Aissue+label%3Apkg%2Fottl) ラベルの付いたイシューに取り組むこともできます。
OTTL を初めて使う方は、[テレメトリーの変換](/docs/collector/transforming-telemetry/)から始めて、CNCF Slack の `#otel-collector` チャンネルにお越しください。
