---
title: Apache Arrow を用いた OpenTelemetry Protocol - フェーズ 2 の発表
linkTitle: OTel-Arrow フェーズ 2
date: 2025-05-12
author: >-
  [Joshua MacDonald](https://github.com/jmacd) (Microsoft), [Laurent
  Quérel](https://github.com/lquerel) (F5)
issue: 6410
sig: OTel-Arrow
default_lang_commit: ca99c1f23ef7e02acee3389ee766af6dbedb8e64
cSpell:ignore: Greptime OTAP Quérel
---

Apache Arrow を用いた OpenTelemetry Protocol プロジェクト（OTel-Arrow）の次のフェーズを発表できることを嬉しく思います。
このプロジェクトは、OpenTelemetry のデータと Apache Arrow エコシステムの橋渡しを目標に、数年前に開始しました。
Apache Arrow は、カラム指向のデータプロデューサーとコンシューマーの間で構造化データをゼロコピーで交換するために設計されたフレームワークです。

OpenTelemetry のデータが Apache Arrow を通じて外部システムからアクセスできるようになれば、強力なインテグレーションが生まれ、新しいテレメトリーシステムやアプリケーションが登場する可能性があると考えています。
大規模なテレメトリーストリームにおいて、カラム指向のデータ処理はデータ圧縮とパフォーマンスの両面で大幅に効率的であることがわかっています。

このフェーズのプロジェクトでは、Rust を用いて調査を行うことにしました。
OpenTelemetry Governance Committee の協力のもと、コレクターそのものに「なる」ことなく、Rust ベースの OpenTelemetry パイプラインの可能性を研究するプロジェクトスコープを定義しました。
Rust パイプラインのパフォーマンスと、OpenTelemetry コレクターの Golang ベースのエコシステムとの統合を成功させる方法の両方を調査します。

このプロジェクトは、当初の仮説に答えることを目指しています。
SDK から始まりパイプラインを通じて運ばれるゼロコピーのカラム指向パラダイムをエンドツーエンドで使用した場合に、何が起こり何が可能になるかを調査しています。

Apache Arrow を取り巻く Rust のエコシステムが大きく、活気に満ちていることに、私たちは強く惹かれました。この領域を探究しないのは、せっかくの機会を逃すことになると考えています。特に、Apache DataFusion ライブラリと OpenTelemetry パイプラインの連携に関心があります。データレイクとより直接的に連携できるようになれば、OpenTelemetry のユーザーにとって大きな利点があると考えています。

私たちは、テレメトリーデータが生成された時点で Arrow レコードバッチに格納されるエンドツーエンドの OTAP パイプラインを Rust で構築する意欲を持っています。
OTel-Arrow プロジェクトは、この機会を探求するにあたり、OpenTelemetry-Rust SDK と密接に連携していく予定です。
メモリの厳密な制御とスレッドパーコアランタイムのサポートを通じて、OTAP パイプラインを安全に組み込み可能にすることに関心を持っています。

プロジェクトの第 1 フェーズでは、Golang アダプターライブラリと、OpenTelemetry Collector Contrib リポジトリ内の対応するエクスポーターおよびレシーバーコンポーネントのペアを通じてプロトコルを開発しました。
これらのコンポーネントのメンテナンスを継続し、Go パイプラインと Rust パイプラインの間に障壁がないことを保証し、このコミットメントを今後も維持していきます。
OTAP パイプラインが OpenTelemetry コレクターから実行できることを保証します。
Rust で書かれた OTAP パイプラインから Golang のコレクターコンポーネントにもアクセスできるようにしたいと考えています。

フェーズ 2 のキックオフとして、F5 の [Laurent Quérel](https://github.com/lquerel) 氏が、オリジナルの OTel-Arrow プロトタイプの成果である [Rust ベースのパイプラインフレームワーク](https://github.com/open-telemetry/otel-arrow/pull/293)（OpenTelemetry コレクターをモデルとしたもの）をコントリビュートしました。
Greptime の [Lei Huang](https://github.com/v0y4g3r) 氏は、メトリクスシグナルを OTAP から OTLP に変換する [Rust 実装](https://github.com/open-telemetry/otel-arrow/pull/303)をコントリビュートしました。

## さらに詳しく {#learn-more}

新たに結成された OTel-Arrow SIG は、OpenTelemetry カレンダーに[ミーティング枠](https://github.com/open-telemetry/community/?tab=readme-ov-file#implementation-sigs)を持っています。
ぜひご参加ください！
