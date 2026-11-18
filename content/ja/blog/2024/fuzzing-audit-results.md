---
title: OpenTelemetry コレクターがファジング監査を完了
linkTitle: ファジング監査結果
date: 2024-12-20
author: '[Adam Korczynski](https://github.com/AdamKorcz)'
issue: 5798
sig: GC
default_lang_commit: 41477529b5ad5d600c36c57803b3df9cda150941
cSpell:ignore: containerd Korczynski
---

OpenTelemetry は、[CNCF の支援][sponsored by the CNCF]のもと [Ada Logics](https://adalogics.com/) が実施したコレクターのファジング監査の完了を発表できることをうれしく思います。
この監査は OpenTelemetry プロジェクトにおける重要なステップであり、ユーザーに向けたコレクターのセキュリティと信頼性を確保するものです。

[sponsored by the CNCF]: https://contribute.cncf.io/resources/project-services/audits/

## ファジングとは {#what-is-fuzzing}

ファジングとは、大量の擬似ランダム入力で API を実行し、その API の動作を観察するテスト手法です。
この手法は、セキュリティ脆弱性や信頼性の問題を発見する実証的な成果により、人気が高まっています。
ファジングは当初、メモリ安全でない言語で実装されたソフトウェアのテストに焦点を当てて発展し、その分野でもっとも生産的でした。
しかし、近年ではメモリ安全な言語にも拡大しています。

CNCF は数年にわたり、エコシステムのファジングに投資してきました。
このテストにより、Helm（CVE-2022-36055、CVE-2022-23524、CVE-2022-23526、CVE-2022-23525）、Notary プロジェクト（CVE-2023-25656）、containerd（CVE-2023-25153）、Crossplane（CVE-2023-28494、CVE-2023-27483）、Flux（CVE-2022-36049）など、広く使用されているプロジェクトで多数のセキュリティ脆弱性が発見されています。

## OSS-Fuzz {#oss-fuzz}

監査を開始するにあたり、Ada Logics の監査員は OpenTelemetry コレクターを [OSS-Fuzz](https://github.com/google/oss-fuzz) に統合しました。
OSS-Fuzz は、Google が重要なオープンソースプロジェクトに無償で提供するサービスです。
このサービスは、プロジェクトのファザーを豊富なリソースで週に複数回実行します。
OSS-Fuzz がクラッシュを検出すると、プロジェクトに通知します。
その後、プロジェクトがアップストリームでクラッシュを修正したかどうかを確認し、修正されていれば問題を修正済みとしてマークします。
このワークフロー全体は、数千の CPU コアに支えられた Google のファジングインフラストラクチャ上で継続的に実行されます。
これらのテストリソースは、開発者や悪意のある脅威アクターが集められる規模を上回ります。

## テスト {#the-tests}

Ada Logics チームが OpenTelemetry を OSS-Fuzz に統合した後、次のステップは OpenTelemetry コレクター用の一連のファズテストを作成することでした。
監査員は、コレクターのコアコンポーネントに加え、`opentelemetry-collector-contrib` リポジトリ内の複数のレシーバーとプロセッサーに対して49件のファズテストを作成しました。

ファズテストは、監査チームが本番環境での健全性を観察しながら実行し続けました。
ファジング監査の完了時点で、OSS-Fuzz プラットフォーム上の49件のファズテストは健全でした。

継続的な信頼性を確保するため、監査が完了した後もコレクターに対するファズテストは継続されています。

## これまでの結果 {#the-results-so-far}

コレクターに対するファズテストは継続中であり、プロジェクトへの変更もテスト対象となっています。
この投稿の時点では、クラッシュは検出されていません。

しかし、作業はまだ終わっていません！
Ada Logics チームは、コレクターのファジングセットアップをリファレンス実装として作成しました。
他の OpenTelemetry サブプロジェクトはこのリファレンス実装を参考に独自のファズテストを構築でき、プロジェクト全体のさらなる安定性が確保されます。

監査プロセスの詳細については、[公開されたサマリー](https://github.com/open-telemetry/community/blob/7e33a8732fb251462808838108c8779f33930669/reports/ADA_Logics-collector-fuzzing-audit-2024.pdf?from_branch=main)をご覧ください。
