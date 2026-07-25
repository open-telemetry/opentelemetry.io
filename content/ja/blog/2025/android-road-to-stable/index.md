---
title: 'OpenTelemetry Android: 安定版へのロードマップ'
author: >-
  [Jason Plumb](https://github.com/breedx-splk) (Splunk)
linkTitle: 'OTel Android: 安定版へのロードマップ'
issue: https://github.com/open-telemetry/opentelemetry.io/issues/7902
sig: Android
date: 2025-10-02
default_lang_commit: ec870712704ae037419e4e420b7fa3be04e10297
cSpell:ignore: httpurlconnection Jetpack
---

**要約 – OpenTelemetry Android エージェント API が安定化される前に、皆さんの[フィードバック](https://github.com/open-telemetry/opentelemetry-android/issues/1257)をお待ちしています。**

素晴らしいニュースです！
OpenTelemetry Android SIG は、1.0.0 安定版リリースに向けて、メインの初期化および設定 API の安定化に積極的に取り組んでいます。
これはモバイル RUM 開発者にとって何を意味するのでしょうか。
協力に興味はありますか。
詳しくは続きをお読みください。

## これまでの道のり {#where-we-came-from}

2年前、OpenTelemetry Android は生まれたばかりのプロジェクトでした。
Splunk からの[寄付](https://github.com/open-telemetry/community/issues/1400)としてコミュニティに温かく迎え入れられました。
当時は、単一のモノリシックなモジュールから単一のモノリシックなアーティファクトを公開する [GitHub リポジトリ](https://github.com/open-telemetry/opentelemetry-android)で構成されていました。
[opentelemetry-java](https://github.com/open-telemetry/opentelemetry-java) の API と SDK の上に構築されており、主に Java で書かれていました。
これはプロジェクトの堅実なスタートとなり、早い段階から急速な関心を集めました。
当時すでに本番環境で使用されていました。

コミュニティが結集し、コードの管理とプロジェクトの継続的な改善を導くために、4つの異なるベンダーにまたがるメンテナーと承認者のチームを編成しました。

## これまでに達成したこと {#what-we-have-accomplished}

いくつかの改善すべき領域を特定するまでに時間はかからず、40人以上のコントリビューターからの1250件以上のプルリクエストを通じて、大きな進歩を遂げました！
もしあなたがその40人のうちの一人であれば、心から感謝いたします。
ありがとうございます。❤️

ここでは、過去2年間の主要な改善点をまとめます。

### モジュール化 {#modularization}

プロジェクトのモノリシックな構造は、当初から扱いにくいことが分かりました。
バイナリサイズが増大し、すべてのユーザーにすべての機能を含めようとしていました。
フラットなパッケージ構造のため、どの部分が API サーフェスでどの部分が内部実装なのか、ユーザーが理解するのが困難でした。
まもなく、プロジェクトを協調して動作する単一目的のモジュールのグラフに分割するモジュール化の取り組みに着手し、各モジュールが独自のアーティファクトを公開するようにしました。
この関心の明確な分離は大きな成果でした！

個別のモジュールの公開に加えて、[bill-of-materials（bom）も公開](https://central.sonatype.com/artifact/io.opentelemetry.android/opentelemetry-android-bom)しており、開発者はこれを使用して多数のモジュールのバージョンを同期できます。

### 新しい計装 {#new-instrumentation}

コミュニティの貢献を通じて、OpenTelemetry Android プロジェクトには多くの有用な新しい計装ライブラリが追加されました。
以下がその一覧です。

- [android-log](https://github.com/open-telemetry/opentelemetry-android/tree/4d3290f84d2612286eabfb1072f1885905c2b756/instrumentation/android-log?from_branch=main) -
  Android の標準的な `Log.x(...)` 呼び出しから OTel ログレコードを生成する機能です。
- [httpurlconnection](https://github.com/open-telemetry/opentelemetry-android/tree/c090b3c2aa34477879e3481a8e1e06b089406c36/instrumentation/httpurlconnection?from_branch=main) -
  長い歴史を持つ、ランタイム提供の HTTP クライアントに対するトレース計装です。
- [view-click](https://github.com/open-telemetry/opentelemetry-android/tree/f0cf647e364e290f03ad7d77252fd7209dd2bf41/instrumentation/view-click?from_branch=main)
  – Android View でのユーザーのタップに対するクリックイベントを生成します。
- [compose-click](https://github.com/open-telemetry/opentelemetry-android/tree/f0cf647e364e290f03ad7d77252fd7209dd2bf41/instrumentation/compose/click?from_branch=main)
  – Jetpack Compose コンポーネント内でのユーザーのタップに対するクリックイベントを生成します。
- [sessions](https://github.com/open-telemetry/opentelemetry-android/tree/f0cf647e364e290f03ad7d77252fd7209dd2bf41/instrumentation/sessions?from_branch=main)
  – セッションのライフサイクルが変化したときにイベントを生成します。

### 自動計装 {#auto-instrumentation}

[OpenTelemetry Java エージェント](https://github.com/open-telemetry/opentelemetry-java-instrumentation)とは異なり、Android エージェントはプラットフォームの制約により、実行時にバイトコードウィービングでクラスを計装できません。
コードが自動的に計装されるのは非常に強力な機能であり、ユーザーはコードを変更せずに計装できることを好みます。

一部の計装は、手動でのコード変更や OpenTelemetry のラッパークラスを明示的に使用する必要なく、ビルド時に Gradle プラグインで適用できるようになりました。
この記事の執筆時点では、Android ログ計装と HTTP クライアント計装がこれに含まれており、今後さらに自動計装が増える予定です。

### ドキュメント {#documentation}

最近、[各計装モジュールのドキュメントを作成する](https://github.com/open-telemetry/opentelemetry-android/issues/742)取り組みを完了しました。
これにより、各計装モジュールがどのようなテレメトリーを生成するかをユーザーが素早く把握できるようになります。
また、エージェントなしで計装を単独で活用したいユーザー向けの手順も含まれています。

### イベント/セマンティック規約 {#eventssemconv}

モバイルの世界では、ユーザーが生成するイベントはあらゆるところにあります。
Real User Monitoring（RUM）は、セッション内の一連のイベントとしてユーザーの行動を示すことがよくあります。
OpenTelemetry Android が始まった当初、[OpenTelemetry のイベントシグナル](/docs/specs/semconv/general/events/)はまだ初期段階にあり、すべてのイベントはゼロ期間のスパンとして不格好にモデル化されていました。
さらに、この領域にはセマンティック規約がほとんどなく、スパン名や属性はドットや名前空間のような一般的な OpenTelemetry の規約に従っていませんでした。

OpenTelemetry のコントリビューターの一部が、Android、モバイル、および一般的なクライアントのユースケースに対するセマンティック規約の定義に関わってきました。
これらは Android プロジェクトに採用され、ゼロ期間のスパンは現在イベントとして正しくモデル化されています。

### Kotlin への移行 {#migration-to-kotlin}

Kotlin は、現代の Android 開発者が使用する主要な言語です。
Kotlin は Java の API/ライブラリとの合理的な相互運用性を備えていますが、ユーザーは Kotlin ファーストを期待しています。
OpenTelemetry Android の開始時点では、コードの大部分は Java で書かれており、Kotlin はごくわずかでした。
たとえば、2024年4月（[Wayback Machine](https://web.archive.org/web/20250000000000*/https://github.com/open-telemetry/opentelemetry-android) による最初のサンプル取得時点）では、以下のとおりでした。

![移行前の Kotlin 使用率](kotlin1.png)

これはまだ進行中の取り組みですが、大きな進歩を遂げました。
現在の2025年9月時点では、以下のようになっています。

![現在の Kotlin 使用率](kotlin2.png)

### デモアプリ {#demo-app}

OpenTelemetry Android をモバイルアプリケーションに統合する方法を示すために、新しいサンプルアプリを作成しました。
このデモアプリは [OpenTelemetry Demo](https://github.com/open-telemetry/opentelemetry-demo) の Astronomy Shop をモデルにしており、[Android GitHub リポジトリに含まれています](https://github.com/open-telemetry/opentelemetry-android/tree/c090b3c2aa34477879e3481a8e1e06b089406c36/demo-app?from_branch=main)。
エージェントのセットアップと計装のインストール方法を示すだけでなく、デモアプリにはすぐに使えるログとトレースのテレメトリーを生成する機能もあります。

![デモアプリ画面1](demo-app1.png) ![デモアプリ画面2](demo-app2.png)
![デモアプリ画面3](demo-app3.png)

より現実的なモバイルの懸念事項を示すために、レンダリングの遅延やアプリのクラッシュなど、意図的に問題を引き起こす機能もあります。

## 今後の展望 {#looking-ahead}

[エージェント API に関するフィードバックをお待ちしています！](https://github.com/open-telemetry/opentelemetry-android/issues/1257)

OpenTelemetry Android の次のフェーズである安定化について考え始める時期に到達しました。
多くの PR、議論、リファクタリング、検討、そして継続的な改善を経て、1.x 系のライフサイクルを通じて「安定」として維持できる初期化 API に近づいていると考えています。

2025年10月のリリースが最初のリリース候補 `1.0.0-rc1` となる予定です。

このバージョンから、android-agent を除くすべてのアーティファクトには `-alpha` 接尾辞が付与されます。
この `-alpha` 接尾辞により、どのモジュールがまだアルファ版でユーザー向け API の変更の可能性があるかを明確に伝えられます。
すべての計装モジュールは「アルファ」のままであり、生成されるテレメトリーは関連するセマンティック規約が安定するまで「開発中」のままとなります。

`android-agent` は、ほとんどの Android 開発者がこの OTel 計装とやり取りする主要な方法であると考えています。
そのため、以下の段階に達したと感じています。

- API が使いやすい
- API が一般的なユースケースの90%をカバーしている
- 非標準のユースケースやエキスパート向けのカスタマイズも可能である

ここで皆さんの出番です！
android-agent を実際に試して、`OpenTelemetryRumInitializer` API に関する[フィードバックを提供](https://github.com/open-telemetry/opentelemetry-android/issues/1257)してください。
すべてのフィードバックに心から感謝いたします。
皆さんのフィードバックを、この API の最終的な仕上げと「安定」の最終判断に活用させていただきます。
お読みいただきありがとうございます。
皆さんからのご意見をお待ちしております。
