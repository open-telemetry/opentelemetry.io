---
title: 宣言的設定が安定版になりました！
linkTitle: 宣言的設定の安定化
date: 2026-03-05
author: >-
  [Jack Berg](https://github.com/jack-berg)(Grafana Labs)
default_lang_commit: eab64e41b388032bae1475f226e5e9e437ab314d
# prettier-ignore
cSpell:ignore: Agrawal Alff Anuraag anuraaga Ashpole Bachert Baeyens brettmc carlosalberto codeboten Danielson dashpole jaydeluca Kielek Kiełkowicz Liudmila lmolkova Molkova Nevay ocelotl Pellard pellared Shkuro Sloughter Solomchenko trask tsloughter Yahn Yevhenii ysolomchenko yurishkuro zeitlinger
---

## 何が起きたのか {#what-happened}

[宣言的設定仕様](/docs/specs/otel/configuration/#declarative-configuration)の主要な部分が安定版としてマークされました。
以下が含まれます。

- [opentelemetry-configuration](https://github.com/open-telemetry/opentelemetry-configuration) で定義されたデータモデルの JSON スキーマ。
  安定版 `1.0.0` がリリースされました。
- ファイルにおけるデータモデルの YAML 表現
  （[仕様リンク](/docs/specs/otel/configuration/data-model/#yaml-file-format)）
- データモデルのインメモリ表現
  （[仕様リンク](/docs/specs/otel/configuration/sdk/#in-memory-configuration-model)）
- YAML マッピングノードの汎用表現 `ConfigProperties`
  （[仕様リンク](/docs/specs/otel/configuration/api/#configprovider)）
- データモデル内でカスタムプラグインコンポーネントを参照するための仕組み `PluginComponentProvider`
  （[仕様リンク](/docs/specs/otel/configuration/sdk/#plugincomponentprovider)）
- YAML ファイルを解析して SDK コンポーネントをインスタンス化するための SDK 操作 `Parse` と `Create`
  （[仕様リンク](/docs/specs/otel/configuration/sdk/#sdk-operations)）
- 宣言的設定を使用することを指示し、設定ファイルのパスを指定するための標準環境変数 `OTEL_CONFIG_FILE`
  （[仕様リンク](/docs/specs/otel/configuration/sdk-environment-variables/#declarative-configuration)）

## 言語実装の状況は {#whats-the-status-of-language-implementations}

現時点では、以下の5つの言語で実装が利用可能です。

- C++
- Go
- Java
- JS
- PHP

.NET と Python については開発が進行中です。

さらに、Go の実装は Collector の内部テレメトリーの設定にも活用されています。

今後、実装状況は以下のリソースで追跡できます。

- [Specification Compliance Matrix](https://github.com/open-telemetry/opentelemetry-specification/blob/9a946352ecdec2565520e9c65d635f6e68d6cdfb/spec-compliance-matrix.md#declarative-configuration):
  仕様の API および SDK 機能に対する言語ごとの対応状況
- [opentelemetry-configuration Language Support Status](https://github.com/open-telemetry/opentelemetry-configuration/blob/854f201660436d0e66f73785b7b310e4f8d46c6e/language-support-status.md):
  特定の型やプロパティの対応状況に関する詳細情報

## これはあなたにとって何を意味するのか {#what-does-this-mean-for-you}

言語実装が進むにつれて、さまざまな言語で OpenTelemetry を一貫して設定する能力が向上します。
加えて、新しい設定モデルは、現在サポートされている環境変数を超えるオプションを指定するための、はるかに豊かな言語を提供します。
これらは、設定ワーキンググループが当初から掲げていた2つの目標でした。

言語実装は仕様とは異なるタイムラインで安定化しますが、間もなく実現するはずです。
使用している言語にまだ実装がない場合や、実装したい、あるいは実装してほしい機能がある場合は、[opentelemetry-configuration](https://github.com/open-telemetry/opentelemetry-configuration) でイシューを作成してお知らせください！
ぜひご意見をお聞かせください。

使い方の詳細については、該当する言語のドキュメントを参照してください。
ドキュメントがまだ存在しない場合は、[opentelemetry.io](https://github.com/open-telemetry/opentelemetry.io) でイシューを作成してリクエストしてください！

特定の言語実装がまだ安定版と宣言されていなくても、ユーザー向けの部分はより早く安定する可能性があります。
安定したユーザー体験にとって最も重要なのは、スキーマの安定化です。

## 次のステップ {#whats-next}

作業はここで終わりではありませんが、焦点は移ります。

- スキーマで新しい概念のモデル化を続け、対応する仕様の概念が安定するにつれて既存の型を安定化させます。
- 仕様の提案プロセスを「宣言的設定ファースト」に調整します。
  これは、SDK に機能が提案される際に、対応する宣言的設定の型やプロパティも一緒に提案されるべきであることを意味します。
  宣言的設定スキーマは SDK のユーザー体験の重要な部分であり、設計プロセスの早い段階で考慮されるべきです。
- 相互運用性に優れない環境変数を非推奨にします。
  非推奨は削除を意味するものではありませんが、宣言的設定が推奨される方法であり、投資先であることを示したいと考えています。
  （[トラッキングイシュー](https://github.com/open-telemetry/opentelemetry-specification/issues/3967)）
- さらに多くの言語が宣言的設定を実装する必要があります！
  仕様とデータモデルが安定した今、実装しない理由はありません。
- 計装を設定するための宣言的設定の API 部分（すなわち `ConfigProvider`）は、今回の初期安定化のスコープ外です。
  より多くの言語でプロトタイプを構築する必要があります。
- 動的設定のストーリー、すなわち実行時にテレメトリーをどのように変更するかについてです。
  （[テレメトリーポリシー OTEP](https://github.com/open-telemetry/opentelemetry-specification/pull/4738)）

## 感謝 {#thanks}

長年にわたるコラボレーションを通じてこれを実現してくれた、すべての素晴らしいコントリビューターに心から感謝します。
特に最初から関わってくれた方々に感謝を述べたいと思います。
これほど時間と労力がかかることを事前に知っていたら、始めていたかどうかわかりません😅！
以下にリストした方々の他にも、実装、レビュー、その他の方法で貢献してくれた方々がいることを承知しています。

- Alex Boten [codeboten](https://github.com/codeboten)
- Anuraag Agrawal [anuraaga](https://github.com/anuraaga)
- Arthur Silva Sens [ArthurSens](https://github.com/ArthurSens)
- Brett McBride [brettmc](https://github.com/brettmc)
- Carlos Alberto Cortez [carlosalberto](https://github.com/carlosalberto)
- David Ashpole [dashpole](https://github.com/dashpole)
- Diego Hurtado [ocelotl](https://github.com/ocelotl)
- Dominic Lüchinger [dol](https://github.com/dol)
- Gregor Zeitlinger [zeitlinger](https://github.com/zeitlinger)
- Jamie Danielson [JamieDanielson](https://github.com/JamieDanielson)
- Jay DeLuca [jaydeluca](https://github.com/jaydeluca)
- Liudmila Molkova [lmolkova](https://github.com/lmolkova)
- Marc Alff [Marc Alff](https://github.com/marcalff)
- Marylia Gutierrez [maryliag](https://github.com/maryliag)
- Mike Goldsmith [MikeGoldsmith](https://github.com/MikeGoldsmith)
- Pablo Baeyens [mx-psi](https://github.com/mx-psi)
- Piotr Kiełkowicz [Kielek](https://github.com/Kielek)
- Robert Pellard [pellared](https://github.com/pellared)
- Tobias Bachert [Nevay](https://github.com/Nevay)
- Trask Stalnaker [trask](https://github.com/trask)
- Tristan Sloughter [tsloughter](https://github.com/tsloughter)
- Tyler Yahn [MrAlias](https://github.com/MrAlias)
- Yevhenii Solomchenko [ysolomchenko](https://github.com/ysolomchenko)
- Yuri Shkuro [yurishkuro](https://github.com/yurishkuro)
