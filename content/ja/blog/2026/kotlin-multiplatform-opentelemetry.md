---
title: '新しい OpenTelemetry Kotlin SDK'
linkTitle: '新しい OpenTelemetry Kotlin SDK'
date: 2026-03-23
author: >-
  [Jamie Lynch](https://github.com/fractalwrench) (Embrace)
sig: Kotlin
default_lang_commit: fe9ed7ba61fa6b54041f5173db20d11ce780a1e2
---

Embrace からの[寄贈](https://github.com/open-telemetry/community/issues/2975)と[コントリビューターの募集](/blog/2025/kotlin-multiplatform-opentelemetry.md)を経て、OpenTelemetry に[Kotlin SDK](https://github.com/open-telemetry/opentelemetry-kotlin) が誕生し、現在活発に開発が進められています。

このプロジェクトでは、コントリビューターと、自身のアプリケーションでこのライブラリを使用することに関心のある方を募集しています。

## なぜ OpenTelemetry for Kotlin を立ち上げるのか？ {#why-launch-opentelemetry-for-kotlin}

[Kotlin Multiplatform](https://www.jetbrains.com/kotlin-multiplatform/)（KMP）は、ブラウザ、サーバー、デスクトップ環境など、さまざまなプラットフォームで Kotlin のコードを実行できます。
従来、Kotlin は Android と JVM で最も人気がありましたが、KMP の登場により、異なるプラットフォーム間でコードを共有するために使用するユーザーが着実に増加しています。

Kotlin Multiplatform の OpenTelemetry 実装により、KMP および Kotlin プロジェクトは、1 つの API で多くの異なるプラットフォーム向けのテレメトリーを取得できるようになります。
この API は、一般的な Android/iOS のユースケースに対応するため、モバイルフレンドリーを維持しつつ、可能な限りプラットフォームに依存しない設計となっています。

## プロジェクトの現状 {#current-state-of-the-project}

Kotlin Special Interest Group（SIG）は、[毎週月曜日の太平洋標準時午前 9 時](https://github.com/open-telemetry/community#calendar)に定例ミーティングを開催しています。
プロジェクトについての議論に興味がある方や、同期的に議論したい質問がある方は、ぜひミーティングにご参加ください。

Kotlin SDK は現在、Android、JVM、iOS、JS のターゲットをサポートしています。
現時点では、Android/JVM が最も広くテストされています。

Logging API と Tracing API の初期実装が利用可能です。
これらの API はまだ安定版とは見なされていません。
これは主に、API のセマンティクスとユーザービリティについて実際のユーザーからさらなるフィードバックを得たいと考えているためです。

## プロジェクトの今後の方向性 {#where-is-the-project-going}

このプロジェクトにはいくつかの長期的な目標があります。
まず、ユーザービリティについて十分なフィードバックを得た後、Logging API と Tracing API の安定化を予定しています。
その一環として、流暢な Kotlin API を提供しつつ、プロジェクトが [OpenTelemetry 仕様に準拠している](https://github.com/open-telemetry/opentelemetry-specification/blob/v1.54.0/spec-compliance-matrix.md)ことの確認を行います。

次に、モバイル開発環境から新たなユーザーを OpenTelemetry エコシステムに引き込むことが重要な目標です。
モバイルフレンドリーな API の提供と、プロセス終了の処理方法など、クライアント/モバイルに影響する現在の荒削りな部分の修正によってこれを実現したいと考えています。

最後に、プロジェクトに積極的にコントリビュートし、フィードバックを提供してくれる Kotlin 開発者の健全なコミュニティを構築したいと考えています。

## コントリビューターの募集 {#call-for-contributors}

Kotlin Multiplatform で OpenTelemetry を使用することに興味がある方、ぜひご協力ください！
コードベースのメンテナンス、定期的な Special Interest Group（SIG）ミーティングへの参加、SDK の発展への貢献に意欲的なコントリビューターを募集しています。

コントリビューターになることに興味がある方は、[リポジトリのガイドライン](https://github.com/open-telemetry/opentelemetry-kotlin?tab=readme-ov-file#contributing)で貢献方法をご確認のうえ、[CNCF Slack](https://slack.cncf.io/) の [#otel-kotlin](https://cloud-native.slack.com/archives/C08NRCD4R4G) チャンネルにご参加ください。

プロジェクトをアプリケーションで使用している方やフィードバックがある方は、ぜひリポジトリに[イシューを作成](https://github.com/open-telemetry/opentelemetry-kotlin/issues)してご意見をお寄せください。
この初期段階では、_あらゆる_ フィードバックが非常に役立ち、メンテナーがユーザーのプロジェクト利用方法を理解するうえで大変貴重です。
