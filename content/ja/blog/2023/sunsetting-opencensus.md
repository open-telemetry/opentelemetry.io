---
title: OpenCensus のサンセット
linkTitle: OpenCensus のサンセット
date: 2023-05-01
author: '[Aaron Abbott](https://github.com/aabmass) (Google)'
default_lang_commit: 01eaafa5610b102e0bd5b73249d8765133ef4219
---

2019年、OpenTracing と OpenCensus が統合され OpenTelemetry プロジェクトが設立されることを発表しました。
当初から、OpenTelemetry は [OpenTracing と OpenCensus 両方の次のメジャーバージョン](https://www.cncf.io/blog/2019/05/21/a-brief-history-of-opentelemetry-so-far/)であると考えていました。

OpenTelemetry が C++、.NET、Go、Java、JavaScript、PHP、Python において OpenCensus との機能パリティに到達したことを発表できることを嬉しく思います。
これらの言語のほとんどでトレーシングとメトリクス SDK の[安定版リリース](/docs/languages/#status-and-releases)が利用可能であり、Go と PHP も間もなく続く予定です。
これにより、OpenTelemetry は OpenCensus と同等レベルの機能でテレメトリーデータを収集・エクスポートできるようになりました。
さらに、OpenTelemetry はより[充実したエコシステム](/ecosystem/)の計装ライブラリとエクスポーターを提供しており、[活発なオープンソースコミュニティ](https://www.cncf.io/blog/2023/01/11/a-look-at-the-2022-velocity-of-cncf-linux-foundation-and-top-30-open-source-projects/)も擁しています。

その結果、2023年7月31日をもって、すべての OpenCensus GitHub リポジトリをアーカイブする予定です（[census-instrumentation/opencensus-python][][^python-timeline] を除く）。
[OpenTelemetry の長期計画](https://medium.com/opentracing/a-roadmap-to-convergence-b074e5815289)が実現に向かっていることを嬉しく思います。
すべての OpenCensus ユーザーに OpenTelemetry への移行をお勧めします。

## OpenTelemetry への移行方法 {#how-to-migrate-to-opentelemetry}

OpenTelemetry プロジェクトの[主要な目標](https://medium.com/opentracing/merging-opentracing-and-opencensus-f0fe9c7ca6f0)の一つは、OpenCensus との後方互換性と既存ユーザー向けの移行手段を提供することです。

移行パスを容易にするために、以下の言語向けに後方互換性ブリッジを提供しています[^shim-next-release]。

- [Go][go shim]
- [Java][java shim]
- [JavaScript][js shim]
- [Python][python shim]

これらのブリッジをインストールすることで、OpenCensus と OpenTelemetry の計装がスムーズに相互運用できるようになり、すべてのテレメトリーが OpenTelemetry のエクスポーターから送信されるようになります。
これにより、OpenCensus ユーザーはすべての計装を OpenCensus から OpenTelemetry へ段階的に移行し、最終的にアプリケーションから OpenCensus ライブラリを削除できます[^shim-support]。

OpenTelemetry は OpenCensus の厳密なスーパーセットとなることを意図して設計されたわけではありませんが、ほとんどの API とデータモデルには互換性があります。
移行は「メジャーバージョンのバンプ」と捉えるべきであり、テレメトリーにいくつかの変更が生じる可能性があります。

移行時に想定される事項といくつかの推奨ワークフローの詳細は、[OpenCensus 互換性仕様](/docs/specs/otel/compatibility/opencensus#migration-path)に記載されています。

## 2023年7月31日以降に想定されること {#what-to-expect-after-july-31-2023}

2023年7月31日以降、OpenCensus プロジェクトはメンテナンスされなくなります。
これにより、プロジェクトに新機能が追加されることはなくなり、発見されたセキュリティ脆弱性にパッチが適用されることもなくなります。

ただし、OpenCensus リポジトリは GitHub 上でアーカイブとして残ります。
ユーザーは引き続き OpenCensus のコードをダウンロードしてプロジェクトで使用できます。
OpenCensus の既存リリースは NPM や PyPI などのパブリックパッケージリポジトリで引き続き利用可能です。
**すべての OpenCensus ユーザーには、今すぐ OpenTelemetry への移行計画を開始することをお勧めします。**

この例外として、[census-instrumentation/opencensus-python][] リポジトリがあります[^python-timeline]。

[go shim]: https://github.com/open-telemetry/opentelemetry-go/tree/dbeb92241acd17d8c2a4a70c9b449407558e83de/bridge/opencensus?from_branch=main
[java shim]: https://github.com/open-telemetry/opentelemetry-java/tree/4c43b37f780372c2f6f5a8489b606f79ebfef854/opencensus-shim?from_branch=main
[python shim]: https://github.com/open-telemetry/opentelemetry-python/tree/89dbe26f93aadcc7f774eb40b0c656b7e0c48f57/shim/opentelemetry-opencensus-shim?from_branch=main
[js shim]: https://github.com/open-telemetry/opentelemetry-js/tree/ad92be4c2c1094745a85b0b7eeff1444a11b1b4a/experimental/packages/shim-opencensus?from_branch=main
[census-instrumentation/opencensus-python]: https://github.com/census-instrumentation/opencensus-python

[^python-timeline]:
    `opencensus-python` リポジトリ内の多くのプロジェクトは、引き続き推奨されるプロダクションソリューションとして使用されています。
    これらのプロジェクトは引き続きメンテナンスされます。
    メンテナンスのタイムラインや移行の次のステップ、一般的なサポートに関する質問については、リポジトリのメンテナーに連絡してください。

[^shim-next-release]: Python と JavaScript のシムパッケージは近日リリース予定です。

[^shim-support]: これらのシムは安定版の [OpenCensus 互換性仕様](/docs/specs/otel/compatibility/opencensus#migration-path)を実装しており、[OpenTelemetry の長期サポート](/docs/specs/otel/versioning-and-stability/#long-term-support)ガイドラインに従い、少なくとも1年間サポートされます。
