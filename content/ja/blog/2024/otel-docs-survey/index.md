---
title: OpenTelemetry ドキュメントユーザービリティサーベイからのインサイト
linkTitle: OTel ドキュメントサーベイ
date: 2024-12-18
author: '[Tiffany Hrabusa](https://github.com/tiffany76) (Grafana Labs)'
issue: https://github.com/open-telemetry/opentelemetry.io/issues/5793
sig: Communications, End-User
default_lang_commit: 84d7cf19e9f7f44ea889f8e148b37bc71116ef31
---

[OpenTelemetry エンドユーザー SIG](/community/end-user/) は最近、[OpenTelemetry のドキュメント](/docs/)がどの程度ユーザーフレンドリーであるかを調べるためにコミュニティを対象としたサーベイを実施しました。
以前のサーベイでは、回答者の3分の2が、OpenTelemetry を使い始めたときにあればよかったリソースとして包括的なドキュメントを挙げていました。
そこで、もう少し深く掘り下げることにしました。

ドキュメントユーザービリティサーベイでは、OTel のドキュメントをどこで参照しているか、ドキュメントにどのような内容を追加してほしいか、ドキュメントの現状をどう評価しているかをユーザーに尋ねました。
48件の回答が寄せられ、これらをドキュメント改善の方向性を定め、重要な分野の改善に役立てていきます。

サーベイに参加してくださったすべての方に感謝します。
結果を見ていきましょう。

## 主な要点 {#key-takeaways}

- 回答者は、図やスクリーンショットなどの**視覚的な補助**をもっと増やしてほしいという要望を示しました。
- 質問した3種類のドキュメント（コンポーネントの概念、インストール手順、トラブルシューティング）のうち、**トラブルシューティングのドキュメント**が最も改善が必要だと指摘されました。
- OTel のドキュメントに追加してほしい情報について尋ねたところ、上位の回答は**より多くのサンプル**と、深さ・広さの両面での**カバレッジの拡充**でした。
- [Collector](/docs/collector/) のドキュメントが最も頻繁に参照されるリソースとして浮上しました。
  この結果は SIG Communications の[年末レビュー](../year-in-review/#which-pages-were-the-most-popular)におけるページビュー分析と一致しています。
- 正規化と重み付けを行った結果、[Java](/docs/languages/java/) のドキュメントが**最も高い総合評価**を獲得しました。
  これは最近の[構成の改善](../year-in-review/#ia-improvements)がプラスの影響を与えていることを反映しています。
  一方、[Swift](/docs/languages/swift/) のドキュメントは最も低い総合評価となりました。
- 最も人気のある6つのドキュメントセットのうち、[JavaScript](/docs/languages/js/) のドキュメントが**最も低い評価**を受けました。

## 詳細なインサイト {#detailed-insights}

### 回答者について {#about-the-respondents}

- 79%が本番環境で OTel を使用しています。
- 21%がオブザーバビリティまたは APM ベンダーに勤務しています。
- 98%がオブザーバビリティに関する事前知識を持っています。
  中級者（60%）またはエキスパート（38%）です。

#### Q: OpenTelemetry に関する情報を探すとき、主にどの情報源に頼っていますか？ {#q-what-source-do-you-primarily-rely-on-when-youre-looking-for-information-about-opentelemetry}

- 全体として、回答者の過半数（52%）が [opentelemetry.io][] のドキュメントに頼っています。
- オブザーバビリティの経験が浅い回答者（初級者および中級者）は、[opentelemetry.io][] のドキュメントを使用する傾向が強いです。
- エキスパートレベルのオブザーバビリティ実践者は、コードリポジトリのドキュメントを好みます。

[opentelemetry.io]: /docs/

> **[opentelemetry.io][] を主な情報源として使用している回答者**<br>_オブザーバビリティ知識レベル別_
>
> | 初級者 | 中級者 | エキスパート |
> | :----: | :----: | :----------: |
> |  100%  |  62%   |     44%      |

### ドキュメントへの要望 {#documentation-wish-list}

#### Q: opentelemetry.io に現在ないもので、追加してほしい機能や情報は何ですか？ {#q-what-features-or-information-would-you-like-to-see-added-to-opentelemetryio-that-arent-currently-available}

回答者に、[opentelemetry.io][] のドキュメントに追加してほしいものを自由記述で回答してもらいました。
回答を大まかに6つのカテゴリに分類しました。
複数のカテゴリにまたがる回答もありました。
全回答は [Docs Usability Survey Responses][] を参照してください。

[Docs Usability Survey Responses]: https://docs.google.com/spreadsheets/d/1kpJQYiEGtpZorICbl-QfYL3mKfeoRLiUywvKcV8fcNA

- サンプルの追加: 17（35%）
- より深い、またはより広いカバレッジ: 13（27%）
- 構成の改善: 8（17%）
- コードリポジトリのドキュメントの追加: 5（10%）
- その他: 2（4%）
- 無回答: 7（15%）

![カテゴリ別の機能リクエスト数を示す横棒グラフ](feature-request.png)

#### Q: OpenTelemetry の概念を説明するための視覚的な補助（図やスクリーンショットなど）がもっとあれば役立ちますか？ {#q-would-more-visual-aids-eg-diagrams-and-screenshots-explaining-opentelemetry-concepts-be-helpful}

圧倒的な81%がはいと回答しました。
視覚的な補助をもっと増やしてほしいとのことです。

### ドキュメントの現状 {#current-state-of-the-docs}

#### Q: opentelemetry.io の現在のドキュメントは、OpenTelemetry のさまざまなコンポーネントをどの程度うまく説明していますか？ {#q-how-well-do-the-current-docs-at-opentelemetryio-explain-the-different-components-of-opentelemetry}

ほとんどの回答者は、コンポーネントの概念に関するドキュメントは平均的だと感じており、最頻値は3でした。

![コンポーネントの概念に関するドキュメントを1（低）から5（高）で評価したユーザーの割合を示す積み上げ行グラフ](component-explanations.png)

#### Q: OpenTelemetry のインストール手順はどの程度わかりやすく使いやすいですか？ {#q-how-straightforward-and-user-friendly-are-the-installation-instructions-for-opentelemetry}

ほとんどの回答者は、OTel のインストール手順を平均以上と評価しており、最頻値は4でした。
中級者レベルのオブザーバビリティ知識を持つ回答者は、エキスパートよりも高く評価しました。
中級者の55%がインストール手順を4または5と評価したのに対し、エキスパートではわずか17%でした。

![インストール手順を1（低）から5（高）で評価したユーザーの割合を示す積み上げ行グラフ](installation-instructions.png)

#### Q: トラブルシューティングセクションはどの程度充実していますか？ {#q-how-comprehensive-are-the-troubleshooting-sections}

ほとんどの回答者は、ドキュメントのこのセクションには改善が必要だと考えています。
トラブルシューティングのドキュメントを4または5と評価したのはわずか15%で、全員が中級者レベルの回答者でした。
エキスパートレベルの回答者でトラブルシューティングのドキュメントを3より上に評価した人はいませんでした。

![トラブルシューティングのドキュメントを1（低）から5（高）で評価したユーザーの割合を示す積み上げ行グラフ](troubleshooting.png)

#### Q: 以下の言語やコンポーネントについて、現在の OTel ドキュメントの使用体験をどう評価しますか？ {#q-how-would-you-rate-your-experience-using-the-current-otel-documentation-for-the-following-languages-and-components}

回答者は自分に該当するドキュメントのみを評価するよう求められたため、回答に基づいてどのドキュメントセットが最も使用されているかを推測できます。

- Collector のドキュメントが最も使用されています。
  回答者の77%が評価しました。
- 次の5つのドキュメントセットは人気が近く、回答者の50%から67%が評価しました。

![OTel コンポーネントごとの評価数を示す横棒グラフ](top-six-bar.png)

すべての言語とコンポーネントの評価を表にまとめました。
結果を正規化して重み付けすると、さらなるインサイトが得られます。

- Java のドキュメントが最も高い総合評価を獲得しました。
- Swift のドキュメントが最も低い総合評価となりました。

> **以下の言語やコンポーネントについて、現在の OTel ドキュメントの使用体験をどう評価しますか？**
>
> | 言語またはコンポーネント | Poor | Okay | Great | 回答数合計 | 正規化・重み付け |
> | :----------------------- | :--: | :--: | :---: | :--------: | :--------------: |
> | Java                     |  3   |  16  |   8   |     27     |      7.3333      |
> | PHP                      |  1   |  4   |   2   |     7      |      7.1429      |
> | GO                       |  6   |  12  |   9   |     27     |      7.1111      |
> | Collector                |  9   |  17  |  11   |     37     |      6.8108      |
> | Python                   |  6   |  17  |   8   |     31     |      6.7742      |
> | Kubernetes               |  6   |  20  |   6   |     32     |      6.3750      |
> | C++                      |  0   |  7   |   0   |     7      |      6.0000      |
> | JavaScript               |  3   |  19  |   2   |     24     |      6.0000      |
> | Ruby                     |  1   |  5   |   1   |     7      |      6.2857      |
> | Rust                     |  4   |  4   |   2   |     10     |      5.6000      |
> | .NET                     |  4   |  8   |   2   |     14     |      5.7143      |
> | Erlang                   |  1   |  6   |   0   |     7      |      5.4286      |
> | FaaS                     |  5   |  7   |   0   |     12     |      4.3333      |
> | Swift                    |  3   |  3   |   0   |     6      |      4.0000      |
> | **合計**                 |  52  | 145  |  51   |            |                  |

これらのインサイトを組み合わせると、最も多くの人が使用しているドキュメントで最も改善が必要なのは JavaScript のドキュメントであることがわかります。

> **改善の取り組みをどこに集中すべきか？**<br> _JavaScript は最も使用されている6つのドキュメントセットの1つですが、評価は最も低いです。_
>
> | 言語またはコンポーネント | Poor | Okay | Great | 回答数合計 | 正規化・重み付け |
> | :----------------------- | :--: | :--: | :---: | :--------: | :--------------: |
> | GO                       |  6   |  12  |   9   |     27     |      7.1111      |
> | Java                     |  3   |  16  |   8   |     27     |      7.3333      |
> | JavaScript               |  3   |  19  |   2   |     24     |      6.0000      |
> | Python                   |  6   |  17  |   8   |     31     |      6.7742      |
> | Collector                |  9   |  17  |  11   |     37     |      6.8108      |
> | Kubernetes               |  6   |  20  |   6   |     32     |      6.3750      |

## さらに詳しく {#learn-more}

サーベイ結果の詳細は [Docs Usability Survey Responses][] を参照してください。

## フィードバックは不可欠です {#your-feedback-is-essential}

サーベイに参加してくださったすべての方に改めて感謝します。
皆さんのフィードバックは、OpenTelemetry の今後の開発の方向性を示し、変化するニーズに引き続き応えていくために欠かせないものです。
以下のチャンネルを通じてつながり、今後のサーベイについてもぜひご確認ください。

- [#otel-sig-end-user Slack チャンネル](https://cloud-native.slack.com/archives/C01RT3MSWGZ)
- [#otel-comms Slack チャンネル](https://cloud-native.slack.com/archives/C02UN96HZH6)
- [エンドユーザーリソースページ](/community/end-user/)
